#!/usr/bin/env python3
"""Make a sculpture .glb smaller to download, without changing its shape.

The scans made by convert_scan.py (and Amelia, made by reduce_glb.py) store, per vertex, a position, a normal
and sometimes a color, all as 32-bit floats, and their triangles as 32-bit indices. This rewrites a single-mesh
.glb so that:
  - the normals are left out: the gallery computes them as it loads (computeVertexNormals, the same smooth,
    area-weighted normals the converters wrote);
  - the triangle indices are 16-bit when there are fewer than 65,536 vertices;
  - a color, if there is one, is stored as three bytes (0-255) instead of three floats.
Positions are copied exactly. The result is checked against the original before it is written.

  python3 tools/compact_glb.py assets/sculpture/apollo-belvedere.glb OUT.glb
"""
import json, struct, sys
import numpy as np

CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def read(path):
    b = open(path, 'rb').read()
    jl = struct.unpack('<I', b[12:16])[0]
    j = json.loads(b[20:20 + jl])
    bl = struct.unpack('<I', b[20 + jl:24 + jl])[0]
    return j, b[28 + jl:28 + jl + bl]


def accessor(j, blob, i):
    a = j['accessors'][i]; v = j['bufferViews'][a['bufferView']]
    n, dt = NC[a['type']], CT[a['componentType']]
    stride = v.get('byteStride', 0) or n * np.dtype(dt).itemsize
    start = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    raw = np.frombuffer(blob, np.uint8, count=stride * (a['count'] - 1) + n * np.dtype(dt).itemsize, offset=start)
    rows = np.lib.stride_tricks.as_strided(raw, (a['count'], n * np.dtype(dt).itemsize), (stride, 1))
    return np.ascontiguousarray(rows).view(dt).reshape(a['count'], n)


def main(src, dst):
    j, blob = read(src)
    assert len(j['meshes']) == 1 and len(j['meshes'][0]['primitives']) == 1, 'single-mesh files only'
    prim = j['meshes'][0]['primitives'][0]
    pos = accessor(j, blob, prim['attributes']['POSITION']).astype(np.float32)
    idx = accessor(j, blob, prim['indices']).reshape(-1)
    col = accessor(j, blob, prim['attributes']['COLOR_0']) if 'COLOR_0' in prim['attributes'] else None
    nv = len(pos)

    body, views, accs = bytearray(), [], []
    def add(data, target, acc, stride=None):
        while len(body) % 4: body.append(0)
        view = {'buffer': 0, 'byteOffset': len(body), 'byteLength': len(data), 'target': target}
        if stride: view['byteStride'] = stride
        body.extend(data); views.append(view)
        accs.append(dict(acc, bufferView=len(views) - 1)); return len(accs) - 1

    attrs = {'POSITION': add(pos.tobytes(), 34962, {'componentType': 5126, 'count': nv, 'type': 'VEC3',
                                                     'min': pos.min(0).tolist(), 'max': pos.max(0).tolist()})}
    if col is not None:
        c = col[:, :3]
        if c.dtype == np.float32: c = np.clip(np.round(c * 255), 0, 255)
        c4 = np.zeros((nv, 4), np.uint8); c4[:, :3] = c.astype(np.uint8)          # padded to 4 bytes a vertex, as glTF asks
        attrs['COLOR_0'] = add(c4.tobytes(), 34962, {'componentType': 5121, 'normalized': True, 'count': nv, 'type': 'VEC3'}, stride=4)
    small = nv < 65536
    ind = idx.astype(np.uint16 if small else np.uint32)
    ix = add(ind.tobytes(), 34963, {'componentType': 5123 if small else 5125, 'count': len(ind), 'type': 'SCALAR'})

    j['bufferViews'], j['accessors'] = views, accs
    prim['attributes'], prim['indices'] = attrs, ix
    j['buffers'] = [{'byteLength': len(body)}]
    js = json.dumps(j, separators=(',', ':')).encode()
    js += b' ' * (-len(js) % 4)
    while len(body) % 4: body.append(0)
    out = b'glTF' + struct.pack('<II', 2, 12 + 8 + len(js) + 8 + len(body))
    out += struct.pack('<I', len(js)) + b'JSON' + js + struct.pack('<I', len(body)) + b'BIN\x00' + bytes(body)

    # check: the same positions, the same triangles, the colors within half a step
    open(dst, 'wb').write(out)
    j2, b2 = read(dst); p2 = j2['meshes'][0]['primitives'][0]
    assert np.array_equal(accessor(j2, b2, p2['attributes']['POSITION']), pos)
    assert np.array_equal(accessor(j2, b2, p2['indices']).reshape(-1).astype(np.int64), idx.astype(np.int64))
    if col is not None:
        c2 = accessor(j2, b2, p2['attributes']['COLOR_0']).astype(np.float32) / 255
        assert np.abs(c2 - col[:, :3].astype(np.float32)).max() <= 0.5 / 255 + 1e-6
    print(f'{src}: {len(open(src, "rb").read()) / 1e6:.2f} MB -> {len(out) / 1e6:.2f} MB '
          f'({nv:,} vertices, {len(ind) // 3:,} triangles, {"16" if small else "32"}-bit indices{", colors as bytes" if col is not None else ""})')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
