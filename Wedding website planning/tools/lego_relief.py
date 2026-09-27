# The LEGO Sunflowers on Kelly's wall (gallery3d.js, "Kelly's LEGO Art Sunflowers"): from a photo of her build, make
# the relief the gallery shows. It straightens the photo to the set's true 41 x 54 cm (the white frame's four outer
# corners, found by hand, map to a rectangle 8 mm in from the edge: the tan rim is outside them), then writes to
# assets/lego/: the color map (sunflowers.webp, 2050 x 2700, 1/5 mm a pixel), a height map (sunflowers-height.png,
# 1230 x 1620, 0..25 mm), a normal map from those heights with the photo's fine detail (sunflowers-normal.webp, 2050 x
# 2700), and the loose leaf that falls in the joke (its
# picture, heights and normals, and, in the color map, the wall of tiles borrowed from a bare patch to show beneath it);
# and the phone guide's picture of it, whole (mobile/img/sunflowers.jpg and -s.jpg).
#   python3 tools/lego_relief.py PHOTO [x0,y0 x1,y1 x2,y2 x3,y3]    corners TL TR BR BL in the photo's pixels
#   python3 tools/lego_relief.py uploads/lego-sunflowers/PXL_20260926_203331025.jpg      (her phone's original, hung on a wall)
# It also recolors the stems to the leaves' green, tones down the photo's glare, and cuts out the petal that falls in the
# joke (PIECE); see HANDOFF §4.
# The defaults are for that photo (3072 x 4080, 26 Sept 2026). The regions below (HEADS, CENTERS, the vase, the leaf
# box L) are in the straightened 1230 x 1620 picture, so any photo mapped by its corners lines up with them; check them
# and the wall color thresholds (pale, table) against the previews it writes to /tmp. The shapes are worked out at that
# size; the color map and the normals' fine detail are made at 2050 x 2700 from the same photo.
# If the leaf box changes, set the same numbers in SUN.leafBox in gallery3d.js.
from PIL import Image, ImageFilter, ImageOps
import numpy as np, json, sys, os
photo = ImageOps.exif_transpose(Image.open(sys.argv[1])).convert('RGB')
corners = [tuple(map(float, c.split(','))) for c in sys.argv[2:6]] if len(sys.argv) >= 6 else [(394, 555), (2628, 556), (2660, 3490), (415, 3492)]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'lego'); os.makedirs(out, exist_ok=True)
def straighten(W, H):                                              # the photo mapped onto the set's rectangle, W x H px
    I = 24 * W / 1230; A, B = [], []
    for (x, y), (u, v) in zip([(I, I), (W - I, I), (W - I, H - I), (I, H - I)], corners):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]; B += [u, v]
    return photo.transform((W, H), Image.PERSPECTIVE, tuple(np.linalg.solve(np.array(A, float), np.array(B, float))), Image.BICUBIC, fillcolor=(168, 156, 130))
src = straighten(1230, 1620)
HI = (2050, 2700); hi = straighten(*HI); him = np.asarray(hi).astype(float)
toHI = lambda a, mode=Image.BICUBIC: np.asarray(Image.fromarray(a).resize(HI, mode))   # a 1230 x 1620 array, at HI
mob = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'mobile', 'img')
W, H = src.size; MMPX = 410 / W
im = np.asarray(src).astype(float); R, G, B = im[..., 0], im[..., 1], im[..., 2]
lum = 0.299 * R + 0.587 * G + 0.114 * B
blur = lambda a, r: np.asarray(Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(float) / 255
yy, xx = np.mgrid[0:H, 0:W]
OPEN = (100, 94, W - 80, H - 84)                                   # the picture inside LEGO's frame
inside = (xx >= OPEN[0]) & (xx < OPEN[2]) & (yy >= OPEN[1]) & (yy < OPEN[3])
mx = im.max(2); mn = im.min(2); V = mx / 255; S = (mx - mn) / (mx + 1e-6)
Hh = np.where(mx == R, 60 * ((G - B) / (mx - mn + 1e-6)), np.where(mx == G, 60 * (2 + (B - R) / (mx - mn + 1e-6)), 60 * (4 + (R - G) / (mx - mn + 1e-6)))) % 360
pale = (Hh > 45) & (Hh < 70) & (S > 0.08) & (S < 0.56) & (V > 0.42)   # the wall of pale yellow tiles, lit, shaded, or with a sheen
# and the glare on the wall: whitish, bright, and in the upper part (daylight on the shiny top rows), away from the heads
_heads = np.zeros((H, W), bool)
for _cx, _cy, _r in [(710, 250, 130), (450, 356, 124), (510, 524, 110), (1054, 536, 100)]: _heads |= np.hypot(xx - _cx, yy - _cy) < _r
pale |= (S < 0.2) & (V > 0.66) & (yy < 520) & ~_heads
table = (Hh > 38) & (Hh < 56) & (S > 0.56) & (V > 0.55) & (yy > 1235)   # the golden table top
fg = inside & ~pale & ~table
# drop thin lines (the grout between tiles reads as not-wall): an opening, shrink then grow, 7 px
def morph(mask, f):
    return np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(f)).astype(float) > 127
fg = morph(morph(fg, ImageFilter.MinFilter(7)), ImageFilter.MaxFilter(7)) & inside
# ---- what each part is, and how far it stands out. Measured from Kelly's photos taken low along the side (26 Sept
# 2026, uploads/lego-sunflowers/): the frame's top stands 34 mm off the wall and the picture's plate 28 mm, so the
# picture sits 6 mm below the frame; the big tan heads are stacked high, their center discs about 21 mm above the
# picture and their petals sloping down to about 9 mm at the tips; the yellow flowers are lower, 6 to 12 mm; leaves
# and tendrils curl up about as far; the stems, the vase and the table's edge are plates only a few mm proud. Heights
# here are above the picture's plate (gallery3d.js adds the plate's 28 mm from the wall).
yy2 = yy.astype(float)
def poly(pts):                                                    # a hand-drawn region, in this picture's pixels
    m = Image.new('L', (W, H), 0); from PIL import ImageDraw; ImageDraw.Draw(m).polygon(pts, fill=255); return np.asarray(m) > 127
vase = inside & poly([(430, 1190), (830, 1190), (830, 1290), (770, 1500), (520, 1510), (430, 1290)])   # its yellow shoulder and tan body
# the seven big round tan heads, found by eye on this photo (center x, y and radius, px; and how much higher it sits,
# mm, where it overlaps a neighbor and is built in front of it): each is a stacked cone, its disc flat at the top
HEADS = [(710, 250, 130, 0), (450, 356, 124, 0), (510, 524, 110, 2), (1054, 536, 100, 0), (572, 912, 140, 2), (760, 880, 120, 0), (580, 1076, 110, 3.5)]
# the three yellow flowers' raised centers (x, y, radius px)
CENTERS = [(704, 620, 48), (228, 570, 44), (958, 800, 40)]
green = (Hh > 110) & (Hh < 200) & (S > 0.35)
stem = (S < 0.5) & (S > 0.12) & (V < 0.62) & (Hh > 40) & (Hh < 110)
def dist(mask, n):                                                 # how far in from the region's edge, in px (up to n)
    d = np.zeros(mask.shape); cur = Image.fromarray((mask * 255).astype(np.uint8))
    for _ in range(n):
        a = np.asarray(cur) > 127
        if not a.any(): break
        d += a; cur = cur.filter(ImageFilter.MinFilter(3))
    return d
detail = (lum - np.asarray(Image.fromarray(lum.astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(float)) / 255
# softened a little: at a low angle, pixel-sharp ridges on the petals read as fur, not plastic
detail = np.asarray(Image.fromarray(np.clip(detail * 127 + 128, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))).astype(float) / 127 - 128 / 127
body = fg & ~vase
hd = np.zeros((H, W)); inhead = np.zeros((H, W), bool)
for cx, cy, R, up in HEADS:
    r = np.hypot(xx - cx, yy - cy) / R
    prof = np.where(r < 0.42, 21.0, 21.0 - 12.0 * np.power(np.clip((r - 0.42) / 0.58, 0, 1), 1.1)) + up
    prof = np.where(r < 0.2, prof + 1.5, prof)                     # the green center plates on the disc
    hd = np.where(r <= 1.0, np.maximum(hd, prof), hd); inhead |= r <= 1.0
heads = morph(morph(body, ImageFilter.MaxFilter(13)), ImageFilter.MinFilter(13)) & inhead & inside & ~vase   # solid: a shiny gray petal inside a head is head, not wall
leaves = body & ~heads & green
stems = body & ~heads & ~leaves & stem
petals = body & ~heads & ~leaves & ~stems                          # the yellow and the wilting tan flowers, and the rest
h = np.zeros((H, W))
h += heads * (hd + detail * 2)                                     # petals catch the light, the gaps between them sink
dp = dist(petals | heads, 30)
hp = 6 + 6 * np.clip(dp / 24, 0, 1)
for cx, cy, R in CENTERS: hp = hp + 4 * np.clip(1 - np.hypot(xx - cx, yy - cy) / R, 0, 1) ** 0.6
h += petals * (hp + detail * 1.5)
dl = dist(leaves, 15)
h += leaves * (5 + 7 * np.clip(dl / 9, 0, 1) + detail * 1.5)
h += stems * (4 + detail * 1.5)
h += vase * (3 + detail * 1.5)
h += (inside & ~fg) * (detail * 1.4)                               # tile seams and the loose studs
# raised parts rise a few px inside their colored edge: the steep side between two vertices then takes the part's own
# color (as a real petal's side is tan) instead of the wall's, which read as a pale halo round every flower
h8 = Image.fromarray(np.clip(h * 10, 0, 255).astype(np.uint8)).filter(ImageFilter.MinFilter(9)).filter(ImageFilter.GaussianBlur(0.8))
h = np.where(inside, np.asarray(h8).astype(float) / 10, h)
# the frame: a flat top 6 mm above the picture (white band and tan rim), a hair of step between them
edge = np.minimum.reduce([xx, yy, W - 1 - xx, H - 1 - yy])
frame = ~inside
h = np.where(frame, np.where(edge < 24, 5.6, 6.0) + detail * 0.6, h)   # the tan rim just under the frame box's own top (gallery3d.js), so the two never fight
h = np.clip(h, 0, 25)
cls = np.zeros((H, W, 3)); cls[heads] = (200, 120, 40); cls[petals] = (250, 220, 0); cls[leaves] = (0, 160, 90); cls[stems] = (120, 130, 110); cls[vase] = (230, 210, 170)
Image.fromarray(cls.astype(np.uint8)).resize((W // 2, H // 2)).save('/tmp/lego-relief-classes.png')
# ---- the stems: sand green in her build, which the photo's warm light turns olive; the owner wanted them the bright
# green of the leaves (26 Sept 2026). Their pixels (the curved and upright stems, and the sand green wedges under the
# central flower) are recolored to the leaves' green, keeping each pixel's light and shade. Not the dark green tendrils.
sandg = (Hh > 56) & (Hh < 120) & (S > 0.1) & (S < 0.45) & (V > 0.3) & (V < 0.75)
sandg = morph(morph(sandg, ImageFilter.MinFilter(5)), ImageFilter.MaxFilter(5)) & inside & ~vase
# where a stem runs into the shadow of the pieces over it, it darkens and warms: those pixels count only where they join
# a stem already found (grown out from it a pixel at a time, through shadowed stem-like pixels only)
shadowed = (Hh > 48) & (Hh < 120) & (S > 0.12) & (S < 0.55) & (V > 0.16) & (V <= 0.34) & inside & ~vase
grow = sandg.copy()
for _ in range(40):
    grow = (morph(grow, ImageFilter.MaxFilter(3)) & (shadowed | sandg)) | grow
sandg = grow
# keep only real stems: patches grouped with anything within a few px, each group at least 400 px (drops a shaded spot on
# the wall and the tips of the curled tendrils on the top heads, which are not stems); never the heads' lime centers
def label(mask):                                                     # connected groups (4-neighbour), numbered from 1
    lab = np.zeros(mask.shape, np.int32); n = 0; Hm, Wm = mask.shape
    for y0, x0 in zip(*np.nonzero(mask)):
        if lab[y0, x0]: continue
        n += 1; st = [(y0, x0)]; lab[y0, x0] = n
        while st:
            y, x = st.pop()
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                v, u = y + dy, x + dx
                if 0 <= v < Hm and 0 <= u < Wm and mask[v, u] and not lab[v, u]: lab[v, u] = n; st.append((v, u))
    return lab, n
lab, n = label(morph(sandg, ImageFilter.MaxFilter(9)))
area = np.bincount(lab[sandg], minlength=n + 1)
sandg &= area[lab] >= 400
for cx, cy, R, _ in HEADS: sandg &= np.hypot(xx - cx, yy - cy) > 0.38 * R
GREEN = np.array([6., 140., 102.])                                   # the leaves' green, in this photo
sm = np.asarray(Image.fromarray((sandg * 255).astype(np.uint8)).resize(HI, Image.BILINEAR).filter(ImageFilter.GaussianBlur(1.2))).astype(float) / 255
hl = 0.299 * him[..., 0] + 0.587 * him[..., 1] + 0.114 * him[..., 2]
shade = np.clip(hl / np.median(hl[sm > 0.5]), 0.35, 1.6)[..., None]
him = him * (1 - sm[..., None]) + np.clip(GREEN * shade, 0, 255) * sm[..., None]
# ---- the glare: daylight on the shiny plastic left whitish patches in the photo, worst along the top rows of tiles and the
# top flower's slats (the owner asked for it toned down, 26 Sept 2026). For the wall, the heads and the petals, a pixel
# much paler (less saturated) than its material's usual color, and at least as bright, is moved back toward that color:
# the usual hue and saturation, its brightness capped a little above the usual, in proportion to how washed out it is.
def to_hsv(a):
    mx = a.max(2); mn = a.min(2); d = mx - mn + 1e-6; r, g, b = a[..., 0], a[..., 1], a[..., 2]
    hh = np.where(mx == r, (g - b) / d, np.where(mx == g, 2 + (b - r) / d, 4 + (r - g) / d)) / 6 % 1
    return hh, (mx - mn) / (mx + 1e-6), mx / 255
def to_rgb(hh, ss, vv):
    i = np.floor(hh * 6).astype(int) % 6; f = hh * 6 - np.floor(hh * 6)
    p, q, t = vv * (1 - ss), vv * (1 - ss * f), vv * (1 - ss * (1 - f))
    c = [np.choose(i, x) for x in ((vv, q, p, p, t, vv), (t, vv, vv, q, p, p), (p, p, t, vv, vv, q))]
    return np.dstack(c) * 255
gh, gs, gv = to_hsv(him)
low = toHI(((yy > 300) * 255).astype(np.uint8), Image.NEAREST) > 127      # where the photo is free of the glare, for reference
_rim = np.zeros((H, W), bool)                                       # a head's outer edge, where its circle takes in a little wall
for _cx, _cy, _r, _ in HEADS: _d = np.hypot(xx - _cx, yy - _cy) / _r; _rim |= (_d > 0.85) & (_d <= 1.0)
_out = pale & ~inhead                                                # wall seen at a head's edge: pale, and joined to the wall outside it
for _ in range(24): _out |= morph(_out, ImageFilter.MaxFilter(3)) & pale & _rim
for name, m in (('wall', inside & ~fg & ~table), ('heads', heads & ~_out), ('petals', petals)):   # a pale speck on a slat is glare
    mh = toHI((m * 255).astype(np.uint8), Image.NEAREST) > 127
    ref = mh & low
    if ref.sum() < 500: continue
    ang = 2 * np.pi * gh[ref]; rh = (np.arctan2(np.sin(ang).mean(), np.cos(ang).mean()) / (2 * np.pi)) % 1
    rs, rv = np.median(gs[ref]), np.median(gv[ref])
    dh = ((rh - gh + 0.5) % 1) - 0.5
    other = (np.abs(dh) > 0.09) & (gs > 0.2)                       # a piece of another color (a green tip on the wall): not glare
    k0, k1 = (0.97, 0.3) if name == 'wall' else (0.92, 0.45)          # the wall's sheen streaks are fainter: caught sooner
    a = np.clip((rs * k0 - gs) / (rs * k1), 0, 1) * (gv > rv * 0.9) * mh * ~other   # 0: its own color, 1: fully washed out
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))).astype(float) / 255 * mh
    gh = (gh + dh * a) % 1; gs = gs + (rs - gs) * a; gv = np.minimum(gv, gv + (rv * 1.08 - gv) * a)
    print('glare toned down on the %s: %d px' % (name, int((a > 0.2).sum())))
him = to_rgb(gh, gs, gv)
# the phone guide's picture: the whole build, the piece in place (the 3D color map below has it cut out, for the joke)
whole = Image.fromarray(np.clip(him, 0, 255).astype(np.uint8))
whole.resize((1063, 1400), Image.LANCZOS).save(os.path.join(mob, 'sunflowers.jpg'), quality=88)
whole.resize((532, 700), Image.LANCZOS).save(os.path.join(mob, 'sunflowers-s.jpg'), quality=88)
# ---- the piece that falls in the joke: the yellow petal just left of the central flower's orange center (the owner's
# choice, 26 Sept 2026), traced by hand: a wedge pointing left with a rounded end
import math
PIECE = [(573.8, 618.0), (618.8, 618.0)] + [(618.8 + 23.3 * math.cos(math.radians(t)), 641.3 + 23.3 * math.sin(math.radians(t))) for t in range(-80, 91, 10)] + [(616.3, 664.3)]
def polymask(pts, size, k=1.0):
    from PIL import ImageDraw
    m = Image.new('L', size, 0); ImageDraw.Draw(m).polygon([(x * k, y * k) for x, y in pts], fill=255); return np.asarray(m) > 127
leafm = polymask(PIECE, (W, H))
ys, xs = np.nonzero(leafm); lb = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
lh = np.where(leafm, h, 0)[lb[1]:lb[3], lb[0]:lb[2]]
# under it: the yellow plate it was pressed onto, a step lower and in its shade, with its studs
k = HI[0] / W
lmh = polymask(PIECE, HI, k)
hb = [int(round(v * k)) for v in lb]
hh = h.copy()
under = max(1.0, h[leafm].min() - 4.0)                              # well below the petal everywhere: nearer, it showed through it
pitch, sr = 8 / MMPX, 2.4 / MMPX                                   # studs every 8 mm, 4.8 mm across (in 1230 px)
ox, oy = lb[0] + 4, lb[1] + 6
studs = (np.hypot((xx - ox) % pitch - pitch / 2, (yy - oy) % pitch - pitch / 2) < sr)
hh[leafm] = under + studs[leafm] * 1.7
Image.fromarray((np.clip(hh, 0, 25) / 25 * 255).astype(np.uint8)).save(out + '/sunflowers-height.png')
col = him.copy()
base = np.median(him[lmh], axis=0) * 0.64                           # the same yellow in shade, dark enough to show the petal has gone
yyH, xxH = np.mgrid[0:HI[1], 0:HI[0]]
d = np.hypot((xxH - ox * k) % (pitch * k) - pitch * k / 2, (yyH - oy * k) % (pitch * k) - pitch * k / 2)
stud_col = np.where((d < sr * k)[..., None], base * np.where((d < sr * k * 0.55)[..., None], 1.3, 1.15), base)
col[lmh] = stud_col[lmh]
Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).save(out + '/sunflowers.webp', quality=90, method=6)   # WebP: 45% lighter than JPEG (27 Sept 2026)
rgba = np.dstack([np.clip(him, 0, 255), lmh * 255]).astype(np.uint8)[hb[1]:hb[3], hb[0]:hb[2]]
Image.fromarray(rgba).save(out + '/sunflowers-leaf.png')
hlum = 0.299 * him[..., 0] + 0.587 * him[..., 1] + 0.114 * him[..., 2]
hdet = (hlum - np.asarray(Image.fromarray(np.clip(hlum, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4))).astype(float)) / 255
hdet = np.asarray(Image.fromarray(np.clip(hdet * 127 + 128, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(float) / 127 - 128 / 127
hhh = np.asarray(Image.fromarray(hh.astype(np.float32)).resize(HI, Image.BICUBIC)).astype(float)
insideH = toHI((inside * 255).astype(np.uint8), Image.NEAREST) > 127
hhh = hhh + np.where(insideH, hdet * 0.9, hdet * 0.3)                # studs, seams and petal edges, sharp
def normals(hmm, path, mmpx, q=None):
    gy, gx = np.gradient(hmm, mmpx)
    n = np.dstack([-gx, gy, np.ones_like(hmm)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    img = Image.fromarray(((n * 0.5 + 0.5) * 255).astype(np.uint8))
    img.save(path, quality=q) if q else img.save(path)
normals(hhh, out + '/sunflowers-normal.webp', 410 / HI[0], 90)
hpc = np.asarray(Image.fromarray(np.where(leafm, h, 0).astype(np.float32)).resize(HI, Image.BICUBIC)).astype(float) + hdet * 0.9
lhh = np.where(lmh, hpc, 0)[hb[1]:hb[3], hb[0]:hb[2]]
normals(lhh, out + '/sunflowers-leaf-normal.png', 410 / HI[0])
Image.fromarray((lh / 25 * 255).astype(np.uint8)).save(out + '/sunflowers-leaf-height.png')
print('piece box (set SUN.leafBox in gallery3d.js to this)', [int(v) for v in lb], 'its top %.1f mm' % lh.max(), 'stems recolored: %d px' % sandg.sum())
# previews
prev = np.zeros((H, W, 3)); prev[..., 0] = pale * 255; prev[..., 1] = table * 255; prev[..., 2] = fg * 255
Image.fromarray(prev.astype(np.uint8)).resize((W // 2, H // 2)).save('/tmp/lego-relief-masks.png')   # red wall, green table, blue raised
