#!/usr/bin/env python3
"""Prepare the pop-up invitation's images for the gallery (assets/invitation/).

Source: the artist's files plus one straight-on screenshot of the closed card, kept OUTSIDE the
project (they are his artwork, used with his permission and credited on the piece's plaque).

  python3 tools/make_invitation_assets.py "/Users/kellywheelis/Desktop/POPUP-INVITATION/invite"

What it makes
  frame.png   the cream front frame, straightened from the screenshot: ink re-drawn in burgundy on clean
              cream, its missing left edge and the parts under the fingers mirrored from the other side, the
              window (with the ribbon's overhanging tails) and both thumb notches cut out, cut edges shaded
  foil.png    the "VILLA CETINALE" lettering on its own, so the gallery can render it as gold foil
  doors.jpg   the door scene                       card.jpg   the pull-out card's illustrated side
  layer1.png  front layer (busts, couple) cut to a paper silhouette with a white margin, like the real one
  layer2.png  cypresses and guests, same           layer3.png the villa, same
  back.jpg    the clouds and birds from the layer-1 file, which on the real card are printed on the back wall

Needs only Python 3 and ffmpeg (pip install --user imageio-ffmpeg). No other libraries.
"""
import os, subprocess, sys
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'invitation')
os.makedirs(OUT, exist_ok=True)


def load(path, width, pre='', height=-2):
    vf = (pre + ',' if pre else '') + f'scale={width}:{height}:flags=lanczos'
    raw = subprocess.run([FF, '-loglevel', 'error', '-i', path, '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'],
                         capture_output=True, check=True).stdout
    return width, len(raw) // (4 * width), bytearray(raw)


def save(name, W, H, rgba):
    args = [FF, '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-i', '-', '-frames:v', '1']
    if name.endswith('.jpg'): args += ['-q:v', '3']
    subprocess.run(args + [os.path.join(OUT, name)], input=bytes(rgba), check=True)
    print(f'  {name}  {W}x{H}  {os.path.getsize(os.path.join(OUT, name)) / 1e3:.0f} KB')


# ---- binary masks held as one big integer per row (leftmost pixel = highest bit): fast to dilate
def rows_from(values, W, H, table):
    return [int(bytes(values[y * W:(y + 1) * W]).translate(table), 2) for y in range(H)]

def dilate(rows, W, R):
    full = (1 << W) - 1
    for k in range(R):
        h = [(m | (m << 1) | (m >> 1)) & full for m in rows]
        src = h if k % 2 else rows                               # alternate square and diamond steps: an octagon
        rows = [h[y] | (src[y - 1] if y else 0) | (src[y + 1] if y + 1 < len(rows) else 0) for y in range(len(rows))]
    return rows

TO01 = bytes.maketrans(b'01', b'\x00\x01')
def grid_from(rows, W):
    return bytearray(b''.join(format(m, f'0{W}b').encode().translate(TO01) for m in rows))

def outside(grid, W, H):
    """Flood the free cells (0) from the image border; returns a padded grid where 2 = outside."""
    P = W + 2
    g = bytearray(P * (H + 2))
    for y in range(H): g[(y + 1) * P + 1:(y + 1) * P + 1 + W] = grid[y * W:(y + 1) * W]
    N, stack = len(g), [0]
    g[0] = 2
    while stack:
        i = stack.pop()
        for j in (i - 1, i + 1, i - P, i + P):
            if 0 <= j < N and g[j] == 0:
                g[j] = 2; stack.append(j)
    return g, P

def components(grid, W, H):
    """Label the paper cells (1). Returns (labels, [(size, top, bottom)])."""
    lab, info = [0] * (W * H), [None]
    for s in range(W * H):
        if grid[s] != 1 or lab[s]: continue
        n, stack, size, top, bot = len(info), [s], 0, H, 0
        lab[s] = n
        while stack:
            i = stack.pop(); size += 1
            y, x = divmod(i, W)
            if y < top: top = y
            if y > bot: bot = y
            for j, ok in ((i - 1, x > 0), (i + 1, x < W - 1), (i - W, y > 0), (i + W, y < H - 1)):
                if ok and grid[j] == 1 and not lab[j]:
                    lab[j] = n; stack.append(j)
        info.append((size, top, bot))
    return lab, info


def card_corners_in_photo(pairs):
    """pairs: four ((u, v) on the flat card, (x, y) in a photograph). Returns where the card's four corners fall in the photo."""
    A, rhs = [], []
    for (u, v), (x, y) in pairs:
        A.append([u, v, 1, 0, 0, 0, -u * x, -v * x]); rhs.append(x)
        A.append([0, 0, 0, u, v, 1, -u * y, -v * y]); rhs.append(y)
    n = 8
    for c in range(n):                                             # Gaussian elimination
        piv = max(range(c, n), key=lambda r: abs(A[r][c]))
        A[c], A[piv] = A[piv], A[c]; rhs[c], rhs[piv] = rhs[piv], rhs[c]
        for r in range(n):
            if r != c:
                f = A[r][c] / A[c][c]
                A[r] = [a - f * b for a, b in zip(A[r], A[c])]; rhs[r] -= f * rhs[c]
    h = [rhs[i] / A[i][i] for i in range(n)]
    def at(u, v):
        w = h[6] * u + h[7] * v + 1
        return (h[0] * u + h[1] * v + h[2]) / w, (h[3] * u + h[4] * v + h[5]) / w
    return [at(0, 0), at(1, 0), at(0, 1), at(1, 1)]


INK_TABLE = bytes(49 if v < 170 else 48 for v in range(256))     # '1' where the green channel is dark: ink

def cut_layer(src, name, band_top=None, split_sky=False):
    """White-background line art -> a paper silhouette: the ink grown by a margin, holes filled, plus a ground strip."""
    W, H, d = load(os.path.join(SRC, src), 1280)
    R = round(W * 0.009)
    ink = rows_from(d[1::4], W, H, INK_TABLE)
    grid = grid_from(dilate(ink, W, R), W)
    sky = None
    if split_sky:                                                  # small islands high in the picture are sky, not paper
        lab, info = components(grid, W, H)
        band_y = int(band_top * H)
        is_sky = [False] + [(bot < band_y) and (size < 0.03 * W * H or bot < 0.6 * H) for size, top, bot in info[1:]]
        sky = bytearray(W * H)
        for i, n in enumerate(lab):
            if n and is_sky[n]: sky[i] = 1; grid[i] = 0
    if band_top is not None:
        y0 = int(band_top * H)
        grid[y0 * W:] = b'\x01' * (W * (H - y0))
    g, P = outside(grid, W, H)
    for y in range(H):
        row = g[(y + 1) * P + 1:(y + 1) * P + 1 + W]
        d[y * W * 4 + 3:(y + 1) * W * 4:4] = bytes(0 if v == 2 else 255 for v in row)
    if sky is not None:
        back = bytearray(b'\xff' * (W * H * 4))
        for i in range(W * H):
            if sky[i]: back[i * 4:i * 4 + 3] = d[i * 4:i * 4 + 3]
        save('back.jpg', W, H, back)
    save(name, W, H, d)


def make_frame():
    """The front frame, rebuilt from one video screenshot of the closed card held in two hands."""
    W, H = 1600, 1254                                              # the card is 0.784 as tall as it is wide
    # The card's corners in frame-front.png (1080 x 1025), from its cream edges. The video crops off the card's
    # left 2-4%; its left corners were placed so that the scrollwork, which is a mirror image left to right, comes out
    # symmetrical about the middle (the mirror fit below then reports about 0). That strip is rebuilt by mirroring.
    quad = 'x0=3.5:y0=148:x1=1038:y1=137:x2=22.6:y2=938:x3=1019:y3=943'
    straight = f'perspective={quad}:sense=source:interpolation=cubic,scale={W}:{H}:flags=lanczos'
    # divide the picture by an estimate of the bare paper (its lines dilated away, then blurred): uneven light,
    # shadows and most of the fingers come out white, leaving only ink
    flat = 'split[a][b];[b]' + ','.join(['dilation'] * 16) + ',gblur=sigma=14[bg];[a][bg]blend=all_mode=divide'
    src = os.path.join(SRC, 'frame-front.png')
    _, _, raw = load(src, W, straight, height=H)
    _, _, d = load(src, W, straight + ',' + flat, height=H)
    Rc, Gc = d[0::4], d[1::4]
    red = lambda i: Gc[i] < 0.78 * Rc[i]                           # burgundy ink, as against grey shadow
    ink = bytearray(W * H)                                         # 0..255: how much burgundy ink is here
    for i in range(W * H):
        t = (204 - Gc[i]) / 80                                     # green is where burgundy is darkest; bare paper sits above 204
        ink[i] = 0 if t <= 0 else 255 if t >= 1 else int(t ** 0.7 * 255)

    foil = bytearray(W * H)                                        # the gold lettering photographs as dark olive
    for y in range(int(0.875 * H), int(0.96 * H)):
        for x in range(int(0.19 * W), int(0.81 * W)):
            i = y * W + x
            t = (150 - (Rc[i] * 3 + Gc[i] * 6 + d[i * 4 + 2]) / 10) / 70
            foil[i] = 0 if t <= 0 else 255 if t >= 1 else int(t * 255)
            ink[i] = 0

    # The scrollwork is a mirror image left to right. Where one side cannot be seen (the strip the video cropped
    # off, and what the two hands covered) it is taken from the other side.
    def unseen(u, v):
        return u < 0.041 - 0.013 * v or (u < 0.115 and 0.452 < v < 0.62) or (u > 0.90 and 0.452 < v < 0.82)
    # the photograph is not perfectly square-on, so first find how the two sides line up: slide the mirrored right
    # band over the left band, separately for the top and the bottom of the card, and keep the best fit
    def best_shift(v0, v1):
        ys, xs = range(int(v0 * H), int(v1 * H), 3), range(int(0.06 * W), int(0.14 * W), 2)
        best = (-1, 0, 0)
        for dy in range(-20, 21, 2):
            for dx in range(-6, 61, 2):
                score = sum(min(ink[y * W + x], ink[(y + dy) * W + W - 1 - x + dx]) for y in ys for x in xs)
                if score > best[0]: best = (score, dx, dy)
        return best[1], best[2]
    (dxt, dyt), (dxb, dyb) = best_shift(0.04, 0.40), best_shift(0.68, 0.96)
    print(f'  mirror alignment: top {dxt},{dyt} px, bottom {dxb},{dyb} px')
    # A second photograph, of the open card, shows the whole left border with no hand on it. It is straightened by
    # the four corners of its window, slid into register with the first, and used only for the little that neither
    # side of the first photograph shows: the outer edge of the lower scrolls, with their leaf tips.
    win = [((0.132, 0.174), (247.7, 138.5)), ((0.862, 0.174), (978.5, 125.4)), ((0.132, 0.833), (209.2, 663.1)), ((0.862, 0.833), (973.0, 673.0))]
    c = card_corners_in_photo(win)
    quad2 = ':'.join(f'x{k}={c[k][0]:.1f}:y{k}={c[k][1]:.1f}' for k in range(4))
    _, _, d2 = load(os.path.join(SRC, 'opendoors.png'), W, f'perspective={quad2}:sense=source:interpolation=cubic,scale={W}:{H}:flags=lanczos,{flat}', height=H)
    G2 = d2[1::4]
    ink2 = bytearray(W * H)
    for i in range(W * H):
        t = (204 - G2[i]) / 80
        ink2[i] = 0 if t <= 0 else 255 if t >= 1 else int(t ** 0.7 * 255)
    ys, xs, best2 = range(int(0.64 * H), int(0.95 * H), 3), range(int(0.06 * W), int(0.13 * W), 2), (-1, 0, 0)
    for dy in range(-40, 41, 2):
        for dx in range(-90, 41, 2):
            score = sum(min(ink[y * W + x], ink2[(y + dy) * W + x + dx]) for y in ys for x in xs)
            if score > best2[0]: best2 = (score, dx, dy)
    print(f'  open-card photograph registers at {best2[1]},{best2[2]} px')
    for y in range(int(0.605 * H), int(0.97 * H)):                 # the lower-left scroll: whatever the first photograph lacks
        for x in range(int(0.008 * W), int(0.125 * W)):
            if unseen(x / W, y / H):
                sx, sy = x + best2[1], y + best2[2]
                if 0 <= sx < W and 0 <= sy < H: ink[y * W + x] = ink2[sy * W + sx] if ink2[sy * W + sx] > 80 else 0   # lines only, no haze
    fixed = bytearray(ink)
    for y in range(H):
        v = y / H
        k = min(1, max(0, (v - 0.22) / 0.60))                      # blend from the top fit to the bottom fit
        dx, dy = round(dxt + (dxb - dxt) * k), round(dyt + (dyb - dyt) * k)
        for x in list(range(0, int(0.14 * W))) + list(range(int(0.86 * W), W)):
            if unseen(x / W, v):
                left = x < W / 2                                   # the shift was measured from left to right; reverse it going the other way
                mx, my = (W - 1 - x + dx, y + dy) if left else (W - 1 - x + dx, y - dy)
                edge = int(0.012 * W)                              # never copy the card's own dark edge
                filled = mx < 0.125 * W and 0.605 < my / H < 0.97          # taken from the open-card photograph above
                ok = edge <= mx < W - edge and edge <= my < H - edge and (filled or not unseen(mx / W, my / H))
                fixed[y * W + x] = ink[my * W + mx] if ok else 0
    ink = fixed
    for y in range(int(0.40 * H), int(0.72 * H)):                  # beside the hands, faint marks are the shadow of a finger, not line work
        for x in list(range(0, int(0.14 * W))) + list(range(int(0.86 * W), W)):
            if ink[y * W + x] < 110: ink[y * W + x] = 0
    e = int(0.017 * W)                                             # the card's own edge, and its shadow, photograph dark: not ink
    for y in range(H):
        if y < e or y >= H - e: ink[y * W:(y + 1) * W] = bytes(W)
        else: ink[y * W:y * W + e] = bytes(e); ink[(y + 1) * W - e:(y + 1) * W] = bytes(e)

    TAILS = (0.2815, 0.7125)                                       # where the ribbon's two tails hang, across the card
    # paper: the whole card, minus the window and the two thumb notches
    wx0, wx1, wy0, wy1 = int(0.132 * W), int(0.862 * W), int(0.174 * H), int(0.833 * H)
    m = int(0.016 * W)                                             # the window's cut edge and its shadow photograph grey: not ink
    for y in range(wy0 - int(0.005 * W), wy1 + m):                 # a thin band along the top, where the ribbon's long curves pass close above the window
        for x in range(wx0 - m, wx1 + m):
            if wx0 <= x < wx1 and wy0 <= y < wy1: continue          # only the band just outside the window
            if y < wy0 and any(abs(x - int(c * W)) < 0.040 * W for c in TAILS): continue   # ...but not where the ribbon runs on down into its tails (exactly the tail's own width, or the window's edge shows as a dash either side)
            i = y * W + x
            if ink[i] and not red(i): ink[i] = 0
    paper = bytearray(b'\x01' * (W * H))
    for y in range(wy0, wy1): paper[y * W + wx0:y * W + wx1] = bytes(wx1 - wx0)
    # ...plus the ribbon's two tails, which hang down over the top of the window.
    # Each is a rounded lobe about 0.08 of the card wide and 0.03 deep; their places were read off the photograph.
    for cx in (int(c * W) for c in TAILS):
        ax, by = int(0.040 * W), int(0.029 * H)
        for y in range(wy0, wy0 + by):
            half = int(ax * (1 - ((y - wy0) / by) ** 2) ** 0.5)
            paper[y * W + cx - half:y * W + cx + half] = b'\x01' * (2 * half)
    # the thumb notches: a semicircle bitten out of each side edge, level with each other
    ncy, nr = int(0.50 * H), int(0.060 * W)
    for y in range(ncy - nr, ncy + nr):
        reach = int((nr * nr - (y - ncy) ** 2) ** 0.5)
        paper[y * W:y * W + reach] = bytes(reach)
        paper[(y + 1) * W - reach:(y + 1) * W] = bytes(reach)
    clear = nr + int(0.02 * W)                                     # the photographed notch's own shadowed rim is not ink
    for y in range(ncy - clear, ncy + clear):
        reach = int((clear * clear - (y - ncy) ** 2) ** 0.5)
        ink[y * W:y * W + reach] = bytes(reach)
        ink[(y + 1) * W - reach:(y + 1) * W] = bytes(reach)
    # a fine shadow line along every cut edge (window, ribbon tails, notches), which is what shows the layer beneath
    hole = [int(bytes(paper[y * W:(y + 1) * W]).translate(bytes.maketrans(b'\x00\x01', b'10')), 2) for y in range(H)]
    near = grid_from(dilate(hole, W, 3), W)

    cream, burgundy, shade = (243, 236, 220), (118, 28, 62), (70, 52, 46)
    out, fo = bytearray(W * H * 4), bytearray(W * H * 4)
    for i in range(W * H):
        k = i * 4
        if paper[i]:
            a = ink[i]
            c = [cream[j] + (burgundy[j] - cream[j]) * a // 255 for j in range(3)]
            if near[i]: c = [(c[j] * 35 + shade[j] * 65) // 100 for j in range(3)]
            out[k], out[k + 1], out[k + 2], out[k + 3] = c[0], c[1], c[2], 255
        fo[k] = fo[k + 1] = fo[k + 2] = 255
        fo[k + 3] = foil[i]
    save('frame.png', W, H, out)
    save('foil.png', W, H, fo)
    print(f'  window (fractions of the card): x {wx0 / W:.3f}-{wx1 / W:.3f}, y {wy0 / H:.3f}-{wy1 / H:.3f}; card height/width {H / W:.3f}')


if __name__ == '__main__':
    print('writing to', os.path.normpath(OUT))
    make_frame()
    for src, name in (('doorlayer.jpg', 'doors.jpg'), ('pullout card.jpg', 'card.jpg')):
        W, H, d = load(os.path.join(SRC, src), 1280)
        save(name, W, H, d)
    cut_layer('layer1.jpg', 'layer1.png', band_top=0.80, split_sky=True)
    cut_layer('layer2.jpg', 'layer2.png', band_top=0.78)
    cut_layer('layer3.jpg', 'layer3.png')
