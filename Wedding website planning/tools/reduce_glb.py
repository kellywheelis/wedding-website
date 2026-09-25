#!/usr/bin/env python3
"""Shrink a generated, textured .glb (as the image-to-3D services produce: a million vertices and a JPEG texture) into a
small .glb the gallery can load: the mesh is simplified by vertex clustering (as tools/convert_scan.py does for museum
scans) and the texture is baked into vertex colours, so the file needs no image. Pure Python apart from macOS `sips`,
which turns the JPEG into a PNG this script can read.
  python3 tools/reduce_glb.py in.glb out.glb --cells 160     (cells: how many clustering cells across the model's longest side)
"""
import argparse, json, os, struct, subprocess, sys, tempfile, zlib


def read_glb(path):
    d = open(path, 'rb').read()
    jl = struct.unpack_from('<I', d, 12)[0]
    j = json.loads(d[20:20 + jl])
    bl = struct.unpack_from('<I', d, 20 + jl)[0]
    bin_ = d[28 + jl:28 + jl + bl]
    def acc(i):
        a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]
        off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        n = {5126: ('f', 4), 5125: ('I', 4), 5123: ('H', 2)}[a['componentType']]
        k = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3}[a['type']]
        return struct.unpack_from('<' + n[0] * (k * a['count']), bin_, off), k
    p = j['meshes'][0]['primitives'][0]
    pos, _ = acc(p['attributes']['POSITION']); uv, _ = acc(p['attributes']['TEXCOORD_0']); idx, _ = acc(p['indices'])
    img = None
    if j.get('images'):
        bv = j['bufferViews'][j['images'][0]['bufferView']]
        img = bin_[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']]
    return pos, uv, idx, img


def read_png(data):
    """A minimal PNG reader: 8-bit RGB/RGBA, non-interlaced. Returns (w, h, get(x, y) -> (r, g, b))."""
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    i, chunks, w = 8, [], 0
    while i < len(data):
        ln = struct.unpack_from('>I', data, i)[0]; t = data[i + 4:i + 8]; body = data[i + 8:i + 8 + ln]; i += 12 + ln
        if t == b'IHDR':
            w, h, depth, ctype = struct.unpack_from('>IIBB', body, 0)
            assert depth == 8 and ctype in (2, 6), 'expected 8-bit RGB or RGBA'
            bpp = 3 if ctype == 2 else 4
        elif t == b'IDAT': chunks.append(body)
    raw = zlib.decompress(b''.join(chunks))
    stride = w * bpp; rows = []; prev = bytearray(stride)
    for y in range(h):
        f = raw[y * (stride + 1)]; line = bytearray(raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
        for x in range(stride):
            a = line[x - bpp] if x >= bpp else 0; b = prev[x]; c = prev[x - bpp] if x >= bpp else 0
            if f == 1: line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + b) & 255
            elif f == 3: line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c; pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[x] = (line[x] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(bytes(line)); prev = line
    return w, h, lambda x, y: rows[y][x * bpp:x * bpp + 3]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('src'); ap.add_argument('dst'); ap.add_argument('--cells', type=int, default=160)
    a = ap.parse_args()
    pos, uv, idx, img = read_glb(a.src)
    nv = len(pos) // 3
    print('vertices', nv, 'triangles', len(idx) // 3, file=sys.stderr)
    # the texture, via sips, into something readable
    sample = None
    if img:
        with tempfile.TemporaryDirectory() as td:
            jp = os.path.join(td, 't.jpg'); pn = os.path.join(td, 't.png')
            open(jp, 'wb').write(img)
            subprocess.run(['sips', '-s', 'format', 'png', jp, '--out', pn], check=True, capture_output=True)
            tw, th, get = read_png(open(pn, 'rb').read())
        def sample(u, v):
            x = min(tw - 1, max(0, int(u * tw))); y = min(th - 1, max(0, int(v * th)))   # glTF's v runs down the image
            return get(x, y)
    lo = [min(pos[k::3]) for k in range(3)]; hi = [max(pos[k::3]) for k in range(3)]
    cell = max(h - l for h, l in zip(hi, lo)) / a.cells
    cells, sums, faces, out = {}, [], set(), []
    def vid(i):
        x, y, z = pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]
        key = (int((x - lo[0]) / cell), int((y - lo[1]) / cell), int((z - lo[2]) / cell))
        c = cells.get(key)
        if c is None:
            c = cells[key] = len(sums); sums.append([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0])
        s = sums[c]; s[0] += x; s[1] += y; s[2] += z
        if sample:
            r, g, b = sample(uv[2 * i], uv[2 * i + 1]); s[3] += r; s[4] += g; s[5] += b
        s[6] += 1
        return c
    for t in range(0, len(idx), 3):
        ia, ib, ic = vid(idx[t]), vid(idx[t + 1]), vid(idx[t + 2])
        if ia == ib or ib == ic or ia == ic: continue
        key = tuple(sorted((ia, ib, ic)))
        if key in faces: continue
        faces.add(key); out.append((ia, ib, ic))
    verts = [(s[0] / s[6], s[1] / s[6], s[2] / s[6]) for s in sums]
    cols = [(s[3] / s[6] / 255, s[4] / s[6] / 255, s[5] / s[6] / 255) if sample else (1, 1, 1) for s in sums]
    print('->', len(verts), 'vertices', len(out), 'triangles', file=sys.stderr)
    normals = [[0.0, 0.0, 0.0] for _ in verts]
    for ia, ib, ic in out:
        A, B, C = verts[ia], verts[ib], verts[ic]
        u = (B[0] - A[0], B[1] - A[1], B[2] - A[2]); v = (C[0] - A[0], C[1] - A[1], C[2] - A[2])
        n = (u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0])
        for i in (ia, ib, ic): normals[i][0] += n[0]; normals[i][1] += n[1]; normals[i][2] += n[2]
    for n in normals:
        l = (n[0] ** 2 + n[1] ** 2 + n[2] ** 2) ** 0.5 or 1; n[0] /= l; n[1] /= l; n[2] /= l
    P = b''.join(struct.pack('<3f', *v) for v in verts); N = b''.join(struct.pack('<3f', *n) for n in normals)
    C = b''.join(struct.pack('<3f', *c) for c in cols); I = b''.join(struct.pack('<3I', *f) for f in out)
    def pad(b): return b + b'\0' * (-len(b) % 4)
    P, N, C, I = pad(P), pad(N), pad(C), pad(I)
    bufs = [P, N, C, I]; offs = [sum(len(x) for x in bufs[:k]) for k in range(4)]
    j = {'asset': {'version': '2.0', 'generator': 'reduce_glb.py'}, 'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0}],
         'meshes': [{'primitives': [{'attributes': {'POSITION': 0, 'NORMAL': 1, 'COLOR_0': 2}, 'indices': 3, 'material': 0}]}],
         'materials': [{'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': 0, 'roughnessFactor': 0.6}}],
         'buffers': [{'byteLength': sum(len(x) for x in bufs)}],
         'bufferViews': [{'buffer': 0, 'byteOffset': offs[k], 'byteLength': len(bufs[k])} for k in range(4)],
         'accessors': [{'bufferView': 0, 'componentType': 5126, 'count': len(verts), 'type': 'VEC3', 'min': [min(v[k] for v in verts) for k in range(3)], 'max': [max(v[k] for v in verts) for k in range(3)]},
                       {'bufferView': 1, 'componentType': 5126, 'count': len(verts), 'type': 'VEC3'},
                       {'bufferView': 2, 'componentType': 5126, 'count': len(verts), 'type': 'VEC3'},
                       {'bufferView': 3, 'componentType': 5125, 'count': len(out) * 3, 'type': 'SCALAR'}]}
    js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4); bb = b''.join(bufs)   # the JSON chunk pads with spaces
    with open(a.dst, 'wb') as f:
        f.write(struct.pack('<4sII', b'glTF', 2, 28 + len(js) + len(bb)))
        f.write(struct.pack('<I4s', len(js), b'JSON')); f.write(js)
        f.write(struct.pack('<I4s', len(bb), b'BIN\0')); f.write(bb)
    print('wrote', a.dst, os.path.getsize(a.dst) // 1024, 'KB', file=sys.stderr)


if __name__ == '__main__':
    main()
