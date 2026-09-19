#!/usr/bin/env python3
"""Turn a raw museum 3D scan (.stl or .obj) into a small .glb the gallery can load.

Museum scans are often 50-500 MB with millions of triangles. This script
  1. reads a binary/ASCII STL or a Wavefront OBJ,
  2. simplifies it by vertex clustering (snap vertices to a 3D grid, merge, drop collapsed faces),
  3. turns it upright (many scans are Z-up; the gallery is Y-up),
  4. writes a binary glTF (.glb) with smooth normals.

Pure Python, no dependencies.

  python3 tools/convert_scan.py raw/venus.stl assets/sculpture/venus.glb --up z --tris 120000
"""
import argparse, math, struct, sys, json, os


def read_stl(path):
    """Returns (make_iterator, count). Binary STLs are streamed, never held as a list: scans run to millions of triangles."""
    data = open(path, 'rb').read()
    n = struct.unpack_from('<I', data, 80)[0] if len(data) >= 84 else 0
    if len(data) >= 84 + n * 50 and n > 0 and not data[:5].lower() == b'solid' or len(data) == 84 + n * 50 and n > 0:   # binary
        body = memoryview(data)[84:84 + n * 50]
        def make():
            for rec in struct.iter_unpack('<12fH', body):
                yield (rec[3:6], rec[6:9], rec[9:12])
        return make, n
    tris, cur = [], []                                            # ASCII
    for line in data.decode('ascii', 'ignore').splitlines():
        p = line.split()
        if len(p) == 4 and p[0] == 'vertex':
            cur.append((float(p[1]), float(p[2]), float(p[3])))
            if len(cur) == 3:
                tris.append(tuple(cur)); cur = []
    return (lambda: iter(tris)), len(tris)


def read_obj(path):
    vs, tris = [], []
    with open(path, 'r', errors='ignore') as f:
        for line in f:
            if line.startswith('v '):
                p = line.split(); vs.append((float(p[1]), float(p[2]), float(p[3])))
            elif line.startswith('f '):
                idx = [int(tok.split('/')[0]) for tok in line.split()[1:]]
                idx = [i - 1 if i > 0 else len(vs) + i for i in idx]
                for k in range(1, len(idx) - 1):                  # fan-triangulate polygons
                    tris.append((vs[idx[0]], vs[idx[k]], vs[idx[k + 1]]))
    return (lambda: iter(tris)), len(tris)


def cluster(tris, cell, lo):
    """Vertex clustering: every vertex snaps to its grid cell; each cell becomes one vertex at the mean."""
    cells, sums, faces = {}, [], set()
    def vid(v):
        key = (int((v[0] - lo[0]) / cell), int((v[1] - lo[1]) / cell), int((v[2] - lo[2]) / cell))
        i = cells.get(key)
        if i is None:
            i = cells[key] = len(sums); sums.append([0.0, 0.0, 0.0, 0])
        s = sums[i]; s[0] += v[0]; s[1] += v[1]; s[2] += v[2]; s[3] += 1
        return i
    out = []
    for a, b, c in tris:
        ia, ib, ic = vid(a), vid(b), vid(c)
        if ia == ib or ib == ic or ia == ic:
            continue
        key = tuple(sorted((ia, ib, ic)))
        if key in faces:
            continue
        faces.add(key); out.append((ia, ib, ic))
    verts = [(s[0] / s[3], s[1] / s[3], s[2] / s[3]) for s in sums]
    return verts, out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src'); ap.add_argument('dst')
    ap.add_argument('--tris', type=int, default=120000, help='target triangle count (default 120000)')
    ap.add_argument('--up', choices=['y', 'z', '-z', 'x'], default='z', help="which axis is 'up' in the scan (default z)")
    a = ap.parse_args()

    ext = os.path.splitext(a.src)[1].lower()
    make, count = read_stl(a.src) if ext == '.stl' else read_obj(a.src)
    if not count:
        sys.exit('no triangles read from ' + a.src)
    print(f'read {count:,} triangles')

    lo, hi = [1e30] * 3, [-1e30] * 3
    for t in make():
        for v in t:
            for i in range(3):
                if v[i] < lo[i]: lo[i] = v[i]
                if v[i] > hi[i]: hi[i] = v[i]
    size = max(hi[i] - lo[i] for i in range(3))

    if count <= a.tris:
        verts, faces = cluster(make(), size / 4096, lo)           # just weld
    else:
        # the face count grows roughly with the square of the grid resolution: guess, measure, correct
        res, verts, faces = 256, None, None
        for attempt in range(4):
            v, f = cluster(make(), size / res, lo)
            print(f'  grid {res}: {len(f):,} triangles')
            if len(f) <= a.tris: verts, faces = v, f
            if 0.8 * a.tris <= len(f) <= a.tris: break
            res = max(8, int(res * math.sqrt(a.tris * 0.92 / max(1, len(f)))))
        if verts is None:
            verts, faces = v, f
    print(f'simplified to {len(faces):,} triangles, {len(verts):,} vertices')

    turn = {'y': lambda x, y, z: (x, y, z), 'z': lambda x, y, z: (x, z, -y), '-z': lambda x, y, z: (x, -z, y), 'x': lambda x, y, z: (-y, x, z)}[a.up]
    verts = [turn(*v) for v in verts]
    lo = [min(v[i] for v in verts) for i in range(3)]; hi = [max(v[i] for v in verts) for i in range(3)]
    cx, cz, h = (lo[0] + hi[0]) / 2, (lo[2] + hi[2]) / 2, (hi[1] - lo[1]) or 1.0
    verts = [((v[0] - cx) / h, (v[1] - lo[1]) / h, (v[2] - cz) / h) for v in verts]   # 1 unit tall, standing on y=0, centred

    normals = [[0.0, 0.0, 0.0] for _ in verts]                   # smooth, area-weighted
    for ia, ib, ic in faces:
        A, B, C = verts[ia], verts[ib], verts[ic]
        ux, uy, uz = B[0] - A[0], B[1] - A[1], B[2] - A[2]
        vx, vy, vz = C[0] - A[0], C[1] - A[1], C[2] - A[2]
        n = (uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx)
        for i in (ia, ib, ic):
            normals[i][0] += n[0]; normals[i][1] += n[1]; normals[i][2] += n[2]
    for n in normals:
        l = math.sqrt(n[0] ** 2 + n[1] ** 2 + n[2] ** 2) or 1.0
        n[0] /= l; n[1] /= l; n[2] /= l

    pos = b''.join(struct.pack('<3f', *v) for v in verts)
    nor = b''.join(struct.pack('<3f', *n) for n in normals)
    idx = b''.join(struct.pack('<3I', *f) for f in faces)
    pad = lambda b: b + b'\0' * (-len(b) % 4)
    pos, nor, idx = pad(pos), pad(nor), pad(idx)
    blo = [min(v[i] for v in verts) for i in range(3)]; bhi = [max(v[i] for v in verts) for i in range(3)]
    gltf = {
        'asset': {'version': '2.0', 'generator': 'convert_scan.py'},
        'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0}],
        'meshes': [{'primitives': [{'attributes': {'POSITION': 0, 'NORMAL': 1}, 'indices': 2}]}],
        'buffers': [{'byteLength': len(pos) + len(nor) + len(idx)}],
        'bufferViews': [
            {'buffer': 0, 'byteOffset': 0, 'byteLength': len(pos), 'target': 34962},
            {'buffer': 0, 'byteOffset': len(pos), 'byteLength': len(nor), 'target': 34962},
            {'buffer': 0, 'byteOffset': len(pos) + len(nor), 'byteLength': len(idx), 'target': 34963}],
        'accessors': [
            {'bufferView': 0, 'componentType': 5126, 'count': len(verts), 'type': 'VEC3', 'min': blo, 'max': bhi},
            {'bufferView': 1, 'componentType': 5126, 'count': len(verts), 'type': 'VEC3'},
            {'bufferView': 2, 'componentType': 5125, 'count': len(faces) * 3, 'type': 'SCALAR'}],
    }
    js = json.dumps(gltf, separators=(',', ':')).encode()
    js += b' ' * (-len(js) % 4)
    body = pos + nor + idx
    total = 12 + 8 + len(js) + 8 + len(body)
    with open(a.dst, 'wb') as f:
        f.write(struct.pack('<4sII', b'glTF', 2, total))
        f.write(struct.pack('<I4s', len(js), b'JSON')); f.write(js)
        f.write(struct.pack('<I4s', len(body), b'BIN\0')); f.write(body)
    print(f'wrote {a.dst} ({total / 1e6:.1f} MB)')


if __name__ == '__main__':
    main()
