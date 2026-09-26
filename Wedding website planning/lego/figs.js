// The LEGO shelf's characters: a catalog of parts (hair and hats, faces, skin tones, torsos, legs, and things to hold)
// and buildFigure(), which turns a choice of them into a three.js figure. Shared by the 3D gallery (the shelf on Kelly's
// wall and the build station's preview), the phone guide and the private page (thumbnails). Everything is modeled in
// millimeters at a real minifigure's size, feet on y = 0, facing +z; the caller scales it.
// A figure is { name, p: { hair, hc, face, skin, torso, legs, acc } }: part ids from the lists below (hc = hair color).
// Unknown ids fall back to the first of their list, so a saved figure never breaks if a part is renamed.
import * as THREE from 'three';

// ---- colors, after LEGO's own palette
const C = {
  white: '#F4F4F2', black: '#1B2A34', red: '#C91A09', darkRed: '#720E0F', blue: '#0055BF', darkBlue: '#0A3463', azure: '#36AEBF',
  sky: '#9FC3E9', green: '#237841', darkGreen: '#184632', sand: '#A0BCAC', lime: '#BBE90B', yellow: '#F2CD37', lightYellow: '#FFF03A',
  orange: '#FE8A18', darkOrange: '#A95500', tan: '#E4CD9E', darkTan: '#958A73', brown: '#582A12', darkBrown: '#352100',
  gray: '#A0A5A9', darkGray: '#6C6E68', pink: '#E4ADC8', darkPink: '#C870A0', lavender: '#CDA4DE', coral: '#FF698F',
  nougat: '#D09168', lightNougat: '#F6D7B3', medNougat: '#AA7D55', mint: '#A5CA79', jeans: '#5A7BAE', gold: '#DBAC34', dustyPink: '#D8A8A0',
};
export const SKINS = [
  { id: 'classic', name: 'Classic yellow', col: C.yellow }, { id: 'light', name: 'Light', col: C.lightNougat },
  { id: 'fair', name: 'Fair', col: '#F0C8A0' }, { id: 'medium', name: 'Medium', col: C.nougat },
  { id: 'tan', name: 'Tan', col: C.medNougat }, { id: 'deep', name: 'Deep', col: '#7C5037' }, { id: 'rich', name: 'Rich', col: '#4E3222' },
];
export const HAIR_COLORS = [
  { id: 'black', name: 'Black', col: '#24211F' }, { id: 'darkbrown', name: 'Dark brown', col: C.darkBrown }, { id: 'brown', name: 'Brown', col: C.brown },
  { id: 'chestnut', name: 'Chestnut', col: C.medNougat }, { id: 'blonde', name: 'Blonde', col: C.tan }, { id: 'golden', name: 'Golden', col: '#E6B94F' },
  { id: 'auburn', name: 'Auburn', col: C.darkOrange }, { id: 'red', name: 'Red', col: '#C0471A' }, { id: 'gray', name: 'Gray', col: C.gray },
  { id: 'white', name: 'White', col: C.white }, { id: 'pink', name: 'Pink', col: C.pink }, { id: 'blue', name: 'Blue', col: C.azure }, { id: 'lavender', name: 'Lavender', col: C.lavender },
];

// ---- the figure's proportions (mm): legs to 12, hips to 15.2, torso to 28, neck, head from 28 to 38.2, stud to 40.1
const Y = { hip: 12, torso: 15.2, neck: 28, head: 28, headTop: 38.2 };
const HEAD_R = 4.9;

// ---- materials: glossy moulded plastic, one per color, shared
const mats = new Map();
function plastic(col, extra) {
  const k = col + (extra ? JSON.stringify(extra) : '');
  if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color: col, roughness: 0.32, metalness: 0, ...(extra || {}) }));
  return mats.get(k);
}
const glass = () => plastic('#dfeef2', { transparent: true, opacity: 0.45, roughness: 0.1 });
const mesh = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m; };

// a rounded block: a 2D outline pushed out to a depth, with a small bevel so edges catch the light like moulded plastic
function block(shape, depth, bevel = 0.35) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 10 });
  g.translate(0, 0, -depth / 2);
  return g;
}
const rect = (w, h, x0 = -w / 2, y0 = 0) => { const s = new THREE.Shape(); s.moveTo(x0, y0); s.lineTo(x0 + w, y0); s.lineTo(x0 + w, y0 + h); s.lineTo(x0, y0 + h); s.closePath(); return s; };

// ---- canvas prints (faces and torsos), cached by what they show
const prints = new Map();
function printTex(key, w, h, draw) {
  if (prints.has(key)) return prints.get(key);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const x = cv.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  prints.set(key, t); return t;
}

// ================================================================ faces
// drawn on the head's band: 1024 px round the head (u 0.5 = the front), 224 px from y 2.35 to 9.1 of the head
const FACE = { w: 1024, h: 224, cx: 512, eyeY: 106, browY: 66, mouthY: 160, eyeDX: 60 };
const INK = '#1a1410';
function eyes(x, kind = 'dot') {
  const { cx, eyeY, eyeDX } = FACE;
  [-1, 1].forEach((s) => {
    const ex = cx + s * eyeDX;
    x.fillStyle = INK;
    if (kind === 'closed') { x.lineWidth = 7; x.strokeStyle = INK; x.beginPath(); x.arc(ex, eyeY - 6, 17, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); return; }
    x.beginPath(); x.ellipse(ex, eyeY, 12, 17, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(ex + 4, eyeY - 7, 4.5, 0, Math.PI * 2); x.fill();
    if (kind === 'lashes') { x.strokeStyle = INK; x.lineWidth = 5; x.beginPath(); x.moveTo(ex + s * 9, eyeY - 12); x.lineTo(ex + s * 20, eyeY - 22); x.stroke(); }
  });
}
function brows(x, lift = 0, col = INK) {
  x.strokeStyle = col; x.lineWidth = 8; x.lineCap = 'round';
  [-1, 1].forEach((s) => { const bx = FACE.cx + s * FACE.eyeDX; x.beginPath(); x.moveTo(bx - 18, FACE.browY + 4 - lift); x.quadraticCurveTo(bx, FACE.browY - 6 - lift, bx + 18, FACE.browY + 2 - lift); x.stroke(); });
}
function smile(x, w = 46, depth = 22) { x.strokeStyle = INK; x.lineWidth = 8; x.lineCap = 'round'; x.beginPath(); x.moveTo(FACE.cx - w, FACE.mouthY - 8); x.quadraticCurveTo(FACE.cx, FACE.mouthY + depth, FACE.cx + w, FACE.mouthY - 8); x.stroke(); }
function grin(x, tongue) {
  const { cx, mouthY } = FACE;
  x.fillStyle = INK; x.beginPath(); x.moveTo(cx - 50, mouthY - 12); x.quadraticCurveTo(cx, mouthY + 42, cx + 50, mouthY - 12); x.closePath(); x.fill();
  x.fillStyle = '#fff'; x.beginPath(); x.moveTo(cx - 42, mouthY - 8); x.quadraticCurveTo(cx, mouthY + 2, cx + 42, mouthY - 8); x.lineTo(cx + 36, mouthY - 1); x.quadraticCurveTo(cx, mouthY + 8, cx - 36, mouthY - 1); x.closePath(); x.fill();
  if (tongue) { x.fillStyle = '#d9534f'; x.beginPath(); x.ellipse(cx + 8, mouthY + 20, 16, 12, 0, 0, Math.PI * 2); x.fill(); }
}
function cheeks(x, col = 'rgba(230,110,110,.35)') { x.fillStyle = col; [-1, 1].forEach((s) => { x.beginPath(); x.ellipse(FACE.cx + s * 92, FACE.mouthY - 22, 20, 11, 0, 0, Math.PI * 2); x.fill(); }); }
export const FACES = [
  { id: 'smile', name: 'Classic smile', draw(x) { eyes(x); smile(x); } },
  { id: 'grin', name: 'Big grin', draw(x) { eyes(x); brows(x, 2); grin(x); } },
  { id: 'wink', name: 'Wink', draw(x) {
    const { cx, eyeY, eyeDX } = FACE; x.fillStyle = INK; x.beginPath(); x.ellipse(cx - eyeDX, eyeY, 12, 17, 0, 0, Math.PI * 2); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(cx - eyeDX + 4, eyeY - 7, 4.5, 0, 7); x.fill();
    x.strokeStyle = INK; x.lineWidth = 8; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx + eyeDX - 18, eyeY + 2); x.quadraticCurveTo(cx + eyeDX, eyeY - 12, cx + eyeDX + 18, eyeY + 2); x.stroke();
    brows(x, 4); x.beginPath(); x.moveTo(cx - 40, FACE.mouthY - 2); x.quadraticCurveTo(cx + 5, FACE.mouthY + 20, cx + 46, FACE.mouthY - 14); x.stroke(); } },
  { id: 'laugh', name: 'Laughing', draw(x) { eyes(x, 'closed'); brows(x, 6); grin(x, true); cheeks(x); } },
  { id: 'lashes', name: 'Soft smile', draw(x) { eyes(x, 'lashes'); brows(x, 2, '#3a2a1c'); smile(x, 38, 16); cheeks(x, 'rgba(230,120,130,.3)'); } },
  { id: 'lipstick', name: 'Red lips', draw(x) { eyes(x, 'lashes'); brows(x, 2, '#3a2a1c');
    const { cx, mouthY } = FACE; x.fillStyle = '#b3232f'; x.beginPath(); x.moveTo(cx - 34, mouthY - 6); x.quadraticCurveTo(cx - 14, mouthY - 20, cx, mouthY - 10); x.quadraticCurveTo(cx + 14, mouthY - 20, cx + 34, mouthY - 6); x.quadraticCurveTo(cx, mouthY + 20, cx - 34, mouthY - 6); x.fill(); } },
  { id: 'surprised', name: 'Surprised', draw(x) { eyes(x); brows(x, 12); x.fillStyle = INK; x.beginPath(); x.ellipse(FACE.cx, FACE.mouthY + 4, 16, 20, 0, 0, Math.PI * 2); x.fill(); } },
  { id: 'heart', name: 'Heart eyes', draw(x) {
    [-1, 1].forEach((s) => { const hx = FACE.cx + s * FACE.eyeDX, hy = FACE.eyeY; x.fillStyle = '#d6263b'; x.beginPath(); x.moveTo(hx, hy + 16); x.bezierCurveTo(hx - 30, hy - 4, hx - 14, hy - 26, hx, hy - 10); x.bezierCurveTo(hx + 14, hy - 26, hx + 30, hy - 4, hx, hy + 16); x.fill(); });
    grin(x); cheeks(x); } },
  { id: 'sleepy', name: 'Sleepy', draw(x) { eyes(x, 'closed'); smile(x, 28, 10); x.fillStyle = INK; x.font = '700 30px Georgia'; x.fillText('z', FACE.cx + 110, FACE.eyeY - 30); x.font = '700 22px Georgia'; x.fillText('z', FACE.cx + 132, FACE.eyeY - 52); } },
  { id: 'cheeky', name: 'Cheeky', draw(x) { eyes(x); brows(x, 8); smile(x, 40, 18); x.fillStyle = '#d9534f'; x.beginPath(); x.ellipse(FACE.cx + 12, FACE.mouthY + 12, 13, 12, 0, 0, Math.PI * 2); x.fill(); } },
  { id: 'glasses', name: 'Glasses', draw(x) { eyes(x); smile(x);
    x.strokeStyle = '#3b2a1e'; x.lineWidth = 7; [-1, 1].forEach((s) => { x.beginPath(); x.arc(FACE.cx + s * FACE.eyeDX, FACE.eyeY, 30, 0, Math.PI * 2); x.stroke(); });
    x.beginPath(); x.moveTo(FACE.cx - 30, FACE.eyeY - 4); x.quadraticCurveTo(FACE.cx, FACE.eyeY - 16, FACE.cx + 30, FACE.eyeY - 4); x.stroke();
    [-1, 1].forEach((s) => { x.beginPath(); x.moveTo(FACE.cx + s * (FACE.eyeDX + 30), FACE.eyeY - 6); x.lineTo(FACE.cx + s * 170, FACE.eyeY - 12); x.stroke(); }); } },
  { id: 'shades', name: 'Sunglasses', draw(x) { grin(x);
    x.fillStyle = '#111'; [-1, 1].forEach((s) => { x.beginPath(); x.moveTo(FACE.cx + s * 14, FACE.eyeY - 22); x.lineTo(FACE.cx + s * 96, FACE.eyeY - 24); x.quadraticCurveTo(FACE.cx + s * 94, FACE.eyeY + 26, FACE.cx + s * 54, FACE.eyeY + 22); x.quadraticCurveTo(FACE.cx + s * 16, FACE.eyeY + 16, FACE.cx + s * 14, FACE.eyeY - 22); x.fill(); });
    x.fillRect(FACE.cx - 16, FACE.eyeY - 24, 32, 7); x.fillStyle = 'rgba(255,255,255,.5)'; [-1, 1].forEach((s) => x.fillRect(FACE.cx + s * 60 - 14, FACE.eyeY - 14, 10, 5)); } },
  { id: 'beard', name: 'Full beard', hair: true, draw(x, hc) { eyes(x); brows(x, 2, hc);
    const { cx, mouthY } = FACE; x.fillStyle = hc; x.beginPath(); x.moveTo(cx - 120, 80); x.quadraticCurveTo(cx - 118, 230, cx, 236); x.quadraticCurveTo(cx + 118, 230, cx + 120, 80); x.lineTo(cx + 100, 104); x.quadraticCurveTo(cx + 70, mouthY - 30, cx, mouthY - 30); x.quadraticCurveTo(cx - 70, mouthY - 30, cx - 100, 104); x.closePath(); x.fill();
    x.strokeStyle = INK; x.lineWidth = 7; x.beginPath(); x.moveTo(cx - 28, mouthY + 6); x.quadraticCurveTo(cx, mouthY + 18, cx + 28, mouthY + 6); x.stroke(); } },
  { id: 'mustache', name: 'Mustache', hair: true, draw(x, hc) { eyes(x); brows(x, 3, hc);
    const { cx, mouthY } = FACE; x.fillStyle = hc; x.beginPath(); x.moveTo(cx, mouthY - 22); x.bezierCurveTo(cx - 30, mouthY - 34, cx - 70, mouthY - 14, cx - 72, mouthY - 2); x.bezierCurveTo(cx - 50, mouthY - 10, cx - 20, mouthY - 6, cx, mouthY - 10);
    x.bezierCurveTo(cx + 20, mouthY - 6, cx + 50, mouthY - 10, cx + 72, mouthY - 2); x.bezierCurveTo(cx + 70, mouthY - 14, cx + 30, mouthY - 34, cx, mouthY - 22); x.fill(); smile(x, 26, 14); } },
  { id: 'stubble', name: 'Stubble', hair: true, draw(x, hc) { eyes(x); brows(x, 2, hc); smile(x, 36, 14);
    x.fillStyle = hc; x.globalAlpha = 0.55; for (let i = 0; i < 260; i++) { const a = Math.random() * Math.PI, r = 70 + Math.random() * 48; const px = FACE.cx + Math.cos(a) * r * 1.25, py = 120 + Math.sin(a) * r * 0.9; if (py > 128) x.fillRect(px, py, 3, 3); } x.globalAlpha = 1; } },
  { id: 'freckles', name: 'Freckles', draw(x) { eyes(x); brows(x, 2, '#6b3a1c'); smile(x, 40, 18); x.fillStyle = 'rgba(150,80,40,.8)';
    [[-80, 130], [-66, 138], [-92, 142], [-72, 124], [80, 130], [66, 138], [92, 142], [72, 124], [-4, 132], [6, 124]].forEach(([dx, y]) => { x.beginPath(); x.arc(FACE.cx + dx, y, 3.2, 0, 7); x.fill(); }); } },
];

// ================================================================ hair and hats
// A hair piece is a shell over the head: for each direction round it (a = 0 at the face, pi at the back) it runs from the
// crown down to a hairline `line(a)`; `flare` widens it below the head (long hair sits out over the shoulders);
// `bump` roughens it (curls). Shells have a thickness, so their edges read as moulded plastic, not paper.
const smooth = (t) => t * t * (3 - 2 * t);
function lineFn(pts) {                                   // pts: [[a, y], ...] with a from 0 (front) to pi (back); mirrored left/right
  return (a) => { a = Math.abs(((a + Math.PI) % (2 * Math.PI)) - Math.PI);
    for (let i = 1; i < pts.length; i++) if (a <= pts[i][0]) { const [a0, y0] = pts[i - 1], [a1, y1] = pts[i]; return y0 + (y1 - y0) * smooth((a - a0) / (a1 - a0)); }
    return pts[pts.length - 1][1]; };
}
function shell({ R = 5.5, yc = 34.9, line, flare = 0, lean = 0, bump = null, thick = 0.6, segA = 64, segV = 22, sx = 1, sz = 1 }) {
  const pos = [], idx = [], rows = segV + 1, cols = segA + 1;
  const point = (a, v, inner) => {
    const bottom = line(a), top = yc + R, y = top - v * (top - bottom);
    let r = y >= yc ? Math.sqrt(Math.max(0, R * R - (y - yc) * (y - yc))) : R;
    if (y < Y.headTop - 9.2) r += (Y.headTop - 9.2 - y) * flare;                       // below the head, the hair spreads
    if (bump) r += bump(a, y);
    if (inner) r = Math.max(0, r - thick);
    const yy = inner && v === 0 ? y - thick : y;
    let z = Math.cos(a) * r * sz; if (y < 30) z -= (30 - y) * lean;                    // long hair falls behind the shoulders
    return [Math.sin(a) * r * sx, yy, z];
  };
  for (let side = 0; side < 2; side++) for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) pos.push(...point((i / segA) * Math.PI * 2, j / segV, side === 1));
  const at = (side, i, j) => side * rows * cols + j * cols + i;
  for (let j = 0; j < segV; j++) for (let i = 0; i < segA; i++) {
    const a = at(0, i, j), b = at(0, i + 1, j), c = at(0, i + 1, j + 1), d = at(0, i, j + 1);
    idx.push(a, d, b, b, d, c);                                                        // outside, facing out
    const a2 = at(1, i, j), b2 = at(1, i + 1, j), c2 = at(1, i + 1, j + 1), d2 = at(1, i, j + 1);
    idx.push(a2, b2, d2, b2, c2, d2);                                                  // inside, facing in
  }
  for (let i = 0; i < segA; i++) { const a = at(0, i, segV), b = at(0, i + 1, segV), c = at(1, i + 1, segV), d = at(1, i, segV); idx.push(a, b, d, b, c, d); }   // the rim
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
const strands = (n, depth) => (a, y) => depth * Math.max(0, Math.sin(a * n)) * 0.6 + depth * 0.4 * Math.sin(y * 2.2 + a * 3);
const curls = (depth) => (a, y) => depth * (0.5 + 0.5 * Math.sin(a * 11) * Math.sin(y * 2.6));
const SHORT = [[0, 36.4], [1.2, 34.6], [1.7, 31.8], [Math.PI, 30.2]];
const LONG = [[0, 36.4], [0.95, 36.0], [1.35, 27.0], [1.8, 23.0], [Math.PI, 22.0]];
function hairMesh(geo, col) { return mesh(geo, plastic(col, { roughness: 0.42 })); }
const sphereAt = (r, x, y, z, col, sy = 1) => { const m = mesh(new THREE.SphereGeometry(r, 24, 16), plastic(col, { roughness: 0.42 })); m.position.set(x, y, z); m.scale.y = sy; return m; };
function lathe(pts, col, extra, seg = 40) { return mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), plastic(col, extra)); }
const brim = (rIn, rOut, y, col, t = 0.6) => { const m = lathe([[rIn, y], [rOut, y], [rOut, y + t], [rIn, y + t]], col); return m; };

export const HAIRS = [
  { id: 'short', name: 'Short', build: (hc) => [hairMesh(shell({ line: lineFn(SHORT), bump: strands(18, 0.25) }), hc)] },
  { id: 'sidepart', name: 'Side part', build: (hc) => { const g = hairMesh(shell({ line: lineFn([[0, 36.0], [0.5, 36.6], [1.2, 34.4], [1.7, 31.8], [Math.PI, 30.2]]), bump: (a, y) => (a > 0.1 && a < 1.2 ? 0.35 : 0) + 0.15 * Math.sin(a * 16) }), hc); return [g]; } },
  { id: 'spiky', name: 'Spiky', build: (hc) => [hairMesh(shell({ line: lineFn(SHORT), bump: (a, y) => (y > 37 ? 1.4 * Math.max(0, Math.sin(a * 9) * Math.sin(y * 3)) : 0.2) }), hc)] },
  { id: 'curly', name: 'Curly', build: (hc) => [hairMesh(shell({ R: 5.9, yc: 34.7, line: lineFn([[0, 36.0], [1.2, 34.0], [1.7, 31.0], [Math.PI, 29.6]]), bump: curls(0.7) }), hc)] },
  { id: 'afro', name: 'Big curls', build: (hc) => [hairMesh(shell({ R: 7.6, yc: 35.0, sx: 1.05, line: lineFn([[0, 37.4], [0.9, 36.4], [1.5, 31.0], [Math.PI, 29.4]]), bump: curls(0.9), thick: 2.4 }), hc)] },
  { id: 'buzz', name: 'Buzz cut', build: (hc) => [hairMesh(shell({ R: 5.15, yc: 34.9, thick: 0.25, line: lineFn([[0, 36.8], [1.2, 35.2], [1.7, 32.6], [Math.PI, 30.8]]) }), hc)] },
  { id: 'bob', name: 'Bob', build: (hc) => [hairMesh(shell({ line: lineFn([[0, 36.2], [0.9, 35.6], [1.25, 30.6], [Math.PI, 29.4]]), flare: 0.3, bump: strands(22, 0.2) }), hc)] },
  { id: 'pixie', name: 'Pixie', build: (hc) => [hairMesh(shell({ line: lineFn([[0, 35.4], [0.4, 36.4], [1.2, 34.0], [1.7, 31.6], [Math.PI, 30.4]]), bump: strands(24, 0.3) }), hc)] },
  { id: 'long', name: 'Long straight', build: (hc) => [hairMesh(shell({ line: lineFn(LONG), flare: 0.55, lean: 0.35, bump: strands(26, 0.18) }), hc)] },
  { id: 'wavy', name: 'Long waves', build: (hc) => [hairMesh(shell({ line: lineFn(LONG), flare: 0.65, lean: 0.35, bump: (a, y) => 0.45 * Math.sin(y * 1.6 + a * 2) + 0.2 }), hc)] },
  { id: 'ponytail', name: 'Ponytail', build: (hc) => { const g = hairMesh(shell({ line: lineFn(SHORT), bump: strands(20, 0.2) }), hc);
    const tail = mesh(new THREE.CapsuleGeometry(1.9, 8, 6, 14), plastic(hc, { roughness: 0.42 })); tail.position.set(0, 31.2, -6.6); tail.rotation.x = 0.35; return [g, tail, sphereAt(1.6, 0, 36.0, -5.6, hc)]; } },
  { id: 'bun', name: 'Bun', build: (hc) => [hairMesh(shell({ line: lineFn(SHORT), bump: strands(22, 0.18) }), hc), sphereAt(3.0, 0, 38.6, -3.8, hc, 0.9)] },
  { id: 'topknot', name: 'Top knot', build: (hc) => [hairMesh(shell({ line: lineFn(SHORT), bump: strands(22, 0.2) }), hc), sphereAt(2.6, 0, 41.2, -1.0, hc)] },
  { id: 'braid', name: 'Long braid', build: (hc) => { const out = [hairMesh(shell({ line: lineFn(SHORT), bump: strands(20, 0.2) }), hc)];
    for (let k = 0; k < 6; k++) out.push(sphereAt(1.8 - k * 0.12, (k % 2 ? 0.5 : -0.5), 31.8 - k * 2.3, -6.0 - k * 0.25, hc, 1.2)); return out; } },
  { id: 'pigtails', name: 'Pigtails', build: (hc) => { const out = [hairMesh(shell({ line: lineFn(SHORT), bump: strands(20, 0.2) }), hc)];
    [-1, 1].forEach((s) => { const t = mesh(new THREE.CapsuleGeometry(1.7, 5, 6, 12), plastic(hc, { roughness: 0.42 })); t.position.set(s * 6.9, 32.4, -1.2); t.rotation.z = s * 0.5; out.push(t); }); return out; } },
  { id: 'mohawk', name: 'Mohawk', build: (hc, skin) => { const ridge = mesh(block(rect(1.8, 1, -0.9, 0), 10.5, 0.5), plastic(hc, { roughness: 0.42 }));
    ridge.geometry = new THREE.ExtrudeGeometry((() => { const s = new THREE.Shape(); s.moveTo(-5, 0); s.quadraticCurveTo(-5, 4.5, 0, 5.2); s.quadraticCurveTo(5, 4.5, 5.6, -0.5); s.lineTo(-5, 0); return s; })(), { depth: 1.8, bevelEnabled: true, bevelSize: 0.4, bevelThickness: 0.4, bevelSegments: 2 });
    ridge.geometry.rotateY(Math.PI / 2); ridge.position.set(-0.9, 36.4, 0.6); return [hairMesh(shell({ R: 5.1, yc: 34.9, thick: 0.2, line: lineFn([[0, 37.2], [1.2, 35.6], [Math.PI, 31.0]]) }), skin), ridge]; } },
  { id: 'bald', name: 'Bald', build: () => [] },
  // hats (their own colors; some keep a little hair showing beneath)
  { id: 'fedora', name: 'Fedora', hat: true, build: (hc) => [hairMesh(shell({ line: lineFn(SHORT) }), hc),
    lathe([[5.9, 37.2], [6.0, 40.4], [5.2, 42.0], [2.4, 42.6], [0, 42.2]], C.darkGray), brim(5.8, 9.4, 37.0, C.darkGray, 0.55), lathe([[6.05, 37.5], [6.1, 38.6]], C.black)] },
  { id: 'coppola', name: 'Flat cap', hat: true, build: (hc) => { const cap = mesh(new THREE.SphereGeometry(6.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), plastic(C.darkTan)); cap.scale.set(1.05, 0.55, 1.12); cap.position.set(0, 37.4, 0.4);
    const peak = mesh(block(rect(10, 0.7, -5, 0), 3.4, 0.3), plastic(C.darkTan)); peak.position.set(0, 37.1, 6.6); peak.rotation.x = 0.2; return [hairMesh(shell({ line: lineFn(SHORT) }), hc), cap, peak]; } },
  { id: 'cap', name: 'Baseball cap', hat: true, build: (hc) => { const dome = mesh(new THREE.SphereGeometry(5.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), plastic(C.red)); dome.scale.y = 0.85; dome.position.y = 37.0;
    const visor = mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.6, 24, 1, false, -Math.PI / 2, Math.PI), plastic(C.red)); visor.scale.set(1, 1, 1.3); visor.position.set(0, 37.1, 4.6); visor.rotation.x = 0.08;
    return [hairMesh(shell({ line: lineFn(SHORT) }), hc), dome, visor, sphereAt(0.8, 0, 42.0, 0, C.red)]; } },
  { id: 'beanie', name: 'Beanie', hat: true, build: (hc) => { const dome = mesh(new THREE.SphereGeometry(5.95, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), plastic(C.orange, { roughness: 0.6 })); dome.scale.y = 1.15; dome.position.y = 37.2;
    return [hairMesh(shell({ line: lineFn(SHORT) }), hc), dome, lathe([[6.15, 36.4], [6.35, 36.9], [6.35, 38.6], [6.05, 38.9]], C.orange, { roughness: 0.6 }), sphereAt(1.7, 0, 44.4, 0, C.orange)]; } },
  { id: 'boater', name: 'Gondolier hat', hat: true, build: (hc) => [hairMesh(shell({ line: lineFn(SHORT) }), hc),
    lathe([[5.9, 37.3], [5.9, 41.2], [0, 41.2]], C.tan, { roughness: 0.55 }), brim(5.8, 9.8, 37.2, C.tan, 0.5), lathe([[6.0, 37.8], [6.0, 39.2]], C.red)] },
  { id: 'chef', name: "Chef's hat", hat: true, build: () => [lathe([[5.6, 36.0], [5.7, 39.4], [6.9, 40.4], [7.6, 42.6], [7.1, 44.6], [4.8, 45.8], [0, 46.0]], C.white, { roughness: 0.5 })] },
  { id: 'veil', name: 'Bridal veil', hat: true, build: (hc) => { const v = mesh(shell({ R: 6.1, yc: 34.6, line: lineFn([[0, 38.6], [1.0, 36.6], [1.5, 22.0], [Math.PI, 16.0]]), flare: 0.45, lean: 0.4, thick: 0.25 }), plastic('#ffffff', { transparent: true, opacity: 0.55, roughness: 0.3, side: THREE.DoubleSide }));
    return [hairMesh(shell({ line: lineFn(SHORT), bump: strands(22, 0.18) }), hc), sphereAt(2.8, 0, 38.4, -3.9, hc, 0.9), lathe([[5.75, 38.2], [5.85, 38.9]], C.gold, { metalness: 0.5, roughness: 0.3 }), v]; } },
  { id: 'crown', name: 'Flower crown', hat: true, build: (hc) => { const out = [hairMesh(shell({ line: lineFn(LONG), flare: 0.6, lean: 0.35, bump: (a, y) => 0.4 * Math.sin(y * 1.6 + a * 2) + 0.2 }), hc)];
    for (let k = 0; k < 11; k++) { const a = (k / 11) * Math.PI * 2; out.push(sphereAt(1.15, Math.sin(a) * 5.9, 38.0 + 0.3 * Math.sin(a * 3), Math.cos(a) * 5.9, [C.pink, C.white, C.yellow, C.lavender][k % 4])); } return out; } },
  { id: 'helmet', name: 'Vespa helmet', hat: true, build: () => { const d = mesh(new THREE.SphereGeometry(6.6, 32, 18, 0, Math.PI * 2, 0, Math.PI * 0.56), plastic('#9ED3C6')); d.position.y = 36.4;   // its rim above the brows
    return [d, lathe([[6.3, 35.6], [6.75, 35.6], [6.75, 36.3], [6.3, 36.3]], C.white), sphereAt(0.9, 0, 42.6, 0.6, C.white)]; } },
  { id: 'tophat', name: 'Top hat', hat: true, build: (hc) => [hairMesh(shell({ line: lineFn(SHORT) }), hc), lathe([[5.7, 37.2], [5.9, 45.2], [0, 45.2]], C.black), brim(5.6, 8.6, 37.0, C.black, 0.6), lathe([[5.8, 37.7], [5.85, 39.0]], C.darkRed)] },
  { id: 'beret', name: 'Beret', hat: true, build: (hc) => { const b = mesh(new THREE.SphereGeometry(7.0, 32, 12), plastic(C.darkRed, { roughness: 0.6 })); b.scale.set(1, 0.3, 1); b.position.set(-0.8, 39.2, 0); b.rotation.z = 0.18;
    return [hairMesh(shell({ line: lineFn(SHORT) }), hc), b, sphereAt(0.7, -1.2, 41.4, 0, C.darkRed)]; } },
  { id: 'sunhat', name: 'Sun hat', hat: true, build: (hc) => [hairMesh(shell({ line: lineFn(LONG), flare: 0.55, lean: 0.35 }), hc),
    lathe([[5.9, 37.4], [5.9, 40.4], [4.6, 41.8], [0, 42.0]], C.lightNougat, { roughness: 0.6 }), lathe([[5.8, 37.2], [11.8, 36.0], [11.8, 36.5], [5.8, 37.8]], C.lightNougat, { roughness: 0.6 }), lathe([[6.0, 37.7], [6.0, 39.0]], C.darkPink)] },
  { id: 'party', name: 'Party hat', hat: true, build: (hc) => { const cone = mesh(new THREE.ConeGeometry(4.2, 9, 24), plastic(C.darkPink)); cone.position.set(0.6, 42.2, 0); cone.rotation.z = -0.12;
    return [hairMesh(shell({ line: lineFn(SHORT) }), hc), cone, sphereAt(1.1, 1.2, 46.8, 0, C.yellow)]; } },
];

// ================================================================ torsos
// printed on the front of a tapered block: 256 x 205 px for x -8..8 and y 0..12.8 of the torso (16 px to the mm).
// The top-left corner (outside the taper) is the base color, and is what the back and the sides show.
const T = { w: 256, h: 205, top: 6.2, bottom: 7.8 };
const tx = (mmx) => (mmx + 8) * 16, ty = (mmy) => (12.8 - mmy) * 16;
function trap(x, col) { x.fillStyle = col; x.beginPath(); x.moveTo(tx(-T.top), 0); x.lineTo(tx(T.top), 0); x.lineTo(tx(T.bottom), T.h); x.lineTo(tx(-T.bottom), T.h); x.closePath(); x.fill(); }
function neck(x, col, depth = 34, w = 40) { x.fillStyle = col; x.beginPath(); x.moveTo(128 - w, 0); x.quadraticCurveTo(128, depth * 2, 128 + w, 0); x.fill(); }
function vneck(x, col, depth = 70, w = 34) { x.fillStyle = col; x.beginPath(); x.moveTo(128 - w, 0); x.lineTo(128, depth); x.lineTo(128 + w, 0); x.fill(); }
function lines(x, col, w, pts) { x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.stroke(); }
function dots(x, col, n, r, seed = 3) { let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; x.fillStyle = col; for (let i = 0; i < n; i++) { x.beginPath(); x.arc(20 + rnd() * 216, 8 + rnd() * 190, r * (0.7 + 0.6 * rnd()), 0, 7); x.fill(); } }
function flower(x, cx, cy, r, petal, mid) { x.fillStyle = petal; for (let k = 0; k < 5; k++) { const a = k * 1.2566; x.beginPath(); x.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.8, 0, 7); x.fill(); } x.fillStyle = mid; x.beginPath(); x.arc(cx, cy, r * 0.6, 0, 7); x.fill(); }
function word(x, s, col, px, y = 110) { x.fillStyle = col; x.font = `700 ${px}px Georgia`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(s, 128, y); }
const tee = (col, extra) => ({ col, arms: col, hands: null, draw(x, skin) { neck(x, skin, 22, 30); if (extra) extra(x, skin); } });
export const TORSOS = [
  { id: 'teewhite', name: 'White tee', ...tee(C.white) },
  { id: 'teered', name: 'Red tee', ...tee(C.red) },
  { id: 'teeblue', name: 'Blue tee', ...tee(C.blue) },
  { id: 'teegreen', name: 'Green tee', ...tee(C.green) },
  { id: 'teeblack', name: 'Black tee', ...tee(C.black) },
  { id: 'teepink', name: 'Pink tee', ...tee(C.pink) },
  { id: 'ciao', name: 'Ciao! tee', ...tee(C.white, (x) => { word(x, 'CIAO!', C.red, 44, 106); lines(x, C.green, 5, [[70, 136], [186, 136]]); }) },
  { id: 'siena', name: 'I ♥ Siena tee', ...tee('#F4E3C1', (x) => { word(x, 'I', C.darkRed, 34, 80); word(x, '♥', '#d6263b', 40, 116); word(x, 'SIENA', C.darkRed, 30, 152); }) },
  { id: 'suit', name: 'Navy suit & tie', col: C.darkBlue, arms: C.darkBlue, draw(x) { vneck(x, C.white, 110, 40); x.fillStyle = C.darkRed; x.beginPath(); x.moveTo(122, 14); x.lineTo(134, 14); x.lineTo(138, 96); x.lineTo(128, 108); x.lineTo(118, 96); x.closePath(); x.fill();
    lines(x, '#061d3a', 5, [[88, 0], [120, 104]]); lines(x, '#061d3a', 5, [[168, 0], [136, 104]]); x.fillStyle = C.white; x.fillRect(176, 60, 22, 6); [140, 176].forEach((yy) => { x.fillStyle = '#222'; x.beginPath(); x.arc(128, yy, 4, 0, 7); x.fill(); }); } },
  { id: 'graysuit', name: 'Gray suit', col: C.darkGray, arms: C.darkGray, draw(x) { vneck(x, C.sky, 110, 40); x.fillStyle = C.darkBlue; x.fillRect(122, 14, 12, 84);
    lines(x, '#4a4c47', 5, [[88, 0], [120, 104]]); lines(x, '#4a4c47', 5, [[168, 0], [136, 104]]); } },
  { id: 'tux', name: 'Tuxedo', col: C.black, arms: C.black, draw(x) { vneck(x, C.white, 124, 44); x.fillStyle = '#111'; x.beginPath(); x.moveTo(106, 16); x.lineTo(128, 26); x.lineTo(150, 16); x.lineTo(150, 36); x.lineTo(128, 26); x.lineTo(106, 36); x.closePath(); x.fill();
    [60, 84, 108].forEach((yy) => { x.fillStyle = '#222'; x.beginPath(); x.arc(128, yy, 3.5, 0, 7); x.fill(); }); lines(x, '#333', 6, [[84, 0], [122, 120]]); lines(x, '#333', 6, [[172, 0], [134, 120]]);
    x.fillStyle = C.white; x.beginPath(); x.moveTo(176, 58); x.lineTo(198, 54); x.lineTo(194, 66); x.closePath(); x.fill(); } },
  { id: 'gown', name: 'Wedding gown', col: C.white, arms: null, draw(x, skin) { trap(x, skin); x.fillStyle = C.white; x.beginPath(); x.moveTo(tx(-5.6), 30); x.quadraticCurveTo(64, 44, 128, 40); x.quadraticCurveTo(192, 44, tx(5.6), 30); x.lineTo(tx(7.8), T.h); x.lineTo(tx(-7.8), T.h); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(200,190,170,.8)'; x.lineWidth = 2; for (let k = 0; k < 7; k++) { x.beginPath(); x.arc(40 + k * 30, 60, 10, 0, Math.PI); x.stroke(); } dots(x, 'rgba(210,200,180,.9)', 40, 2.2, 5); x.fillStyle = '#e8dfc8'; x.fillRect(tx(-7), 150, tx(7) - tx(-7), 8); } },
  { id: 'bridesmaid', name: 'Dusty pink dress', col: C.dustyPink, arms: null, draw(x, skin) { trap(x, skin); x.fillStyle = C.dustyPink; x.beginPath(); x.moveTo(tx(-6.0), 34); x.lineTo(128, 70); x.lineTo(tx(6.0), 34); x.lineTo(tx(7.8), T.h); x.lineTo(tx(-7.8), T.h); x.closePath(); x.fill();
    x.fillStyle = C.dustyPink; x.fillRect(tx(-6.1), 0, 18, 40); x.fillRect(tx(6.1) - 18, 0, 18, 40); lines(x, '#b98b84', 4, [[60, 156], [196, 156]]); } },
  { id: 'sequins', name: 'Black evening top', col: C.black, arms: null, draw(x, skin) { trap(x, skin); x.fillStyle = C.black; x.beginPath(); x.moveTo(tx(-6.4), 40); x.quadraticCurveTo(128, 70, tx(6.4), 40); x.lineTo(tx(7.8), T.h); x.lineTo(tx(-7.8), T.h); x.closePath(); x.fill(); dots(x, 'rgba(230,220,200,.7)', 70, 1.6, 9);
    x.fillStyle = C.black; [-1, 1].forEach((s) => x.fillRect(128 + s * 60 - 5, 0, 10, 44)); } },
  { id: 'sundress', name: 'Floral sundress', col: '#F7D55E', arms: null, draw(x, skin) { trap(x, skin); x.fillStyle = '#F7D55E'; x.beginPath(); x.moveTo(tx(-6.4), 36); x.quadraticCurveTo(128, 56, tx(6.4), 36); x.lineTo(tx(7.8), T.h); x.lineTo(tx(-7.8), T.h); x.closePath(); x.fill();
    [[60, 90], [120, 130], [180, 86], [90, 170], [170, 168], [140, 70]].forEach(([fx, fy]) => flower(x, fx, fy, 7, C.white, C.orange)); x.fillStyle = '#F7D55E'; [-1, 1].forEach((s) => x.fillRect(128 + s * 64 - 4, 0, 8, 40)); } },
  { id: 'breton', name: 'Striped Breton', col: C.white, arms: C.white, draw(x, skin) { neck(x, skin, 20, 34); x.fillStyle = C.darkBlue; for (let yy = 36; yy < T.h; yy += 26) x.fillRect(0, yy, 256, 11); } },
  { id: 'gondolier', name: 'Gondolier stripes', col: C.white, arms: C.white, draw(x, skin) { neck(x, skin, 20, 34); x.fillStyle = C.red; for (let yy = 40; yy < T.h; yy += 28) x.fillRect(0, yy, 256, 12);
    x.fillStyle = '#b3131f'; x.beginPath(); x.moveTo(96, 8); x.lineTo(160, 8); x.lineTo(128, 42); x.closePath(); x.fill(); x.beginPath(); x.moveTo(128, 34); x.lineTo(114, 72); x.lineTo(126, 70); x.closePath(); x.fill(); } },
  { id: 'azzurri', name: 'Italy football jersey', col: '#1F5FB8', arms: '#1F5FB8', draw(x) { vneck(x, C.white, 40, 30); vneck(x, '#1F5FB8', 32, 24);
    [[C.green, 150], [C.white, 162], [C.red, 174]].forEach(([c, xx]) => { x.fillStyle = c; x.fillRect(xx, 54, 12, 26); }); word(x, '10', C.white, 44, 130); } },
  { id: 'hawaiian', name: 'Hawaiian shirt', col: '#35A0B8', arms: '#35A0B8', draw(x, skin) { vneck(x, skin, 48, 28); [[50, 70], [110, 110], [190, 80], [70, 160], [170, 150], [210, 180], [30, 120]].forEach(([fx, fy], i) => flower(x, fx, fy, 9, i % 2 ? C.white : '#F58E8E', C.yellow));
    lines(x, '#1e7489', 3, [[128, 48], [128, 205]]); } },
  { id: 'lemons', name: 'Lemon shirt', col: C.white, arms: C.white, draw(x, skin) { vneck(x, skin, 44, 26); let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 16; i++) { const lx = 20 + r() * 216, ly = 50 + r() * 150; x.fillStyle = C.yellow; x.beginPath(); x.ellipse(lx, ly, 10, 7, r(), 0, 7); x.fill(); x.fillStyle = C.green; x.beginPath(); x.ellipse(lx + 8, ly - 7, 5, 2.5, 0.6, 0, 7); x.fill(); } } },
  { id: 'chef', name: 'Chef jacket', col: C.white, arms: C.white, draw(x) { lines(x, '#d8d4c8', 3, [[150, 0], [150, 205]]); [[110, 60], [110, 110], [110, 160], [190, 60], [190, 110], [190, 160]].forEach(([bx, by]) => { x.fillStyle = '#555'; x.beginPath(); x.arc(bx, by, 5, 0, 7); x.fill(); });
    x.fillStyle = C.red; x.fillRect(96, 0, 64, 16); } },
  { id: 'smock', name: "Painter's smock", col: '#E9E1CF', arms: '#E9E1CF', draw(x, skin) { neck(x, skin, 22, 32); [[C.red, 60, 90], [C.blue, 180, 70], [C.yellow, 140, 140], [C.green, 80, 170], [C.orange, 200, 160], [C.darkPink, 110, 60]].forEach(([c, px, py]) => { x.fillStyle = c; x.beginPath(); x.arc(px, py, 9, 0, 7); x.fill(); x.beginPath(); x.arc(px + 9, py + 7, 4, 0, 7); x.fill(); });
    x.fillStyle = C.darkRed; x.beginPath(); x.moveTo(104, 20); x.lineTo(152, 20); x.lineTo(128, 44); x.closePath(); x.fill(); } },
  { id: 'hoodie', name: 'Hoodie', col: C.gray, arms: C.gray, draw(x, skin) { neck(x, skin, 26, 36); lines(x, C.white, 4, [[112, 40], [110, 90]]); lines(x, C.white, 4, [[144, 40], [146, 90]]); x.strokeStyle = '#7f8487'; x.lineWidth = 4; x.strokeRect(70, 130, 116, 50); } },
  { id: 'denim', name: 'Denim jacket', col: C.jeans, arms: C.jeans, draw(x) { vneck(x, C.white, 90, 36); lines(x, '#3f5b86', 4, [[128, 90], [128, 205]]); [[60, 70], [196, 70]].forEach(([px, py]) => { x.strokeStyle = '#3f5b86'; x.lineWidth = 4; x.strokeRect(px - 26, py - 16, 52, 30); }); [110, 150, 190].forEach((yy) => { x.fillStyle = '#c9a667'; x.beginPath(); x.arc(118, yy, 4, 0, 7); x.fill(); }); } },
  { id: 'sweater', name: 'Heart sweater', col: '#C95D6E', arms: '#C95D6E', draw(x, skin) { neck(x, skin, 20, 30); const hx = 128, hy = 110; x.fillStyle = C.white; x.beginPath(); x.moveTo(hx, hy + 36); x.bezierCurveTo(hx - 60, hy - 4, hx - 30, hy - 50, hx, hy - 18); x.bezierCurveTo(hx + 30, hy - 50, hx + 60, hy - 4, hx, hy + 36); x.fill();
    x.fillStyle = '#b44b5c'; for (let yy = 190; yy < 205; yy += 5) x.fillRect(0, yy, 256, 2); } },
  { id: 'overalls', name: 'Overalls', col: C.jeans, arms: C.red, draw(x, skin) { x.fillStyle = C.red; x.fillRect(0, 0, 256, 205); neck(x, skin, 20, 30); x.fillStyle = C.jeans; x.fillRect(70, 96, 116, 110); x.fillRect(tx(-7.8), 150, tx(7.8) - tx(-7.8), 60);
    lines(x, C.jeans, 16, [[70, 100], [74, 0]]); lines(x, C.jeans, 16, [[186, 100], [182, 0]]); [[74, 100], [182, 100]].forEach(([bx, by]) => { x.fillStyle = C.gold; x.beginPath(); x.arc(bx, by, 6, 0, 7); x.fill(); }); x.strokeStyle = '#3f5b86'; x.lineWidth = 3; x.strokeRect(100, 120, 56, 34); } },
  { id: 'leather', name: 'Leather jacket', col: '#2a2320', arms: '#2a2320', draw(x) { vneck(x, C.white, 70, 30); lines(x, '#9a9a9a', 3, [[146, 60], [140, 205]]); lines(x, '#15110f', 6, [[86, 0], [120, 76]]); lines(x, '#15110f', 6, [[170, 0], [136, 76]]); x.fillStyle = '#9a9a9a'; x.fillRect(172, 120, 30, 4); } },
  { id: 'vest', name: 'Vest & rolled sleeves', col: C.white, arms: C.white, draw(x) { x.fillStyle = C.darkTan; x.beginPath(); x.moveTo(tx(-6.2), 0); x.lineTo(96, 0); x.lineTo(124, 120); x.lineTo(124, 205); x.lineTo(tx(-7.8), 205); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(tx(6.2), 0); x.lineTo(160, 0); x.lineTo(132, 120); x.lineTo(132, 205); x.lineTo(tx(7.8), 205); x.closePath(); x.fill(); [130, 160, 190].forEach((yy) => { x.fillStyle = '#4a3a22'; x.beginPath(); x.arc(118, yy, 3.5, 0, 7); x.fill(); }); x.fillStyle = C.darkBlue; x.fillRect(120, 6, 16, 16); } },
  { id: 'guard', name: 'Museum guard', col: '#1d2b4a', arms: '#1d2b4a', draw(x) { vneck(x, C.sky, 60, 26); x.fillStyle = C.darkBlue; x.fillRect(124, 16, 8, 44); x.fillStyle = C.gold; x.beginPath(); x.moveTo(186, 60); x.lineTo(198, 66); x.lineTo(198, 84); x.lineTo(186, 92); x.lineTo(174, 84); x.lineTo(174, 66); x.closePath(); x.fill();
    [80, 120, 160].forEach((yy) => { x.fillStyle = C.gold; x.beginPath(); x.arc(128, yy + 10, 3.5, 0, 7); x.fill(); }); } },
];

// ================================================================ legs
export const LEGS = [
  { id: 'black', name: 'Black trousers', col: C.black }, { id: 'navy', name: 'Navy trousers', col: C.darkBlue }, { id: 'gray', name: 'Gray trousers', col: C.darkGray },
  { id: 'jeans', name: 'Jeans', col: C.jeans }, { id: 'khaki', name: 'Khakis', col: C.tan }, { id: 'white', name: 'White trousers', col: C.white },
  { id: 'red', name: 'Red trousers', col: C.red }, { id: 'green', name: 'Green trousers', col: C.green }, { id: 'pink', name: 'Pink trousers', col: C.pink },
  { id: 'brown', name: 'Brown trousers', col: C.brown },
  { id: 'shorts', name: 'Denim shorts', col: C.jeans, shorts: true }, { id: 'khakishorts', name: 'Khaki shorts', col: C.tan, shorts: true },
  { id: 'gownskirt', name: 'Wedding gown skirt', col: C.white, skirt: 'long' }, { id: 'pinkskirt', name: 'Dusty pink skirt', col: C.dustyPink, skirt: 'long' },
  { id: 'blackskirt', name: 'Black gown skirt', col: C.black, skirt: 'long' }, { id: 'sunskirt', name: 'Yellow skirt', col: '#F7D55E', skirt: 'short' },
  { id: 'navyskirt', name: 'Navy skirt', col: C.darkBlue, skirt: 'short' },
];

// ================================================================ things to hold
// each is built with its grip at the origin, standing upright (the hand's hole is vertical), the front toward +z
function cyl(rt, rb, h, col, extra, seg = 20) { return mesh(new THREE.CylinderGeometry(rt, rb, h, seg), plastic(col, extra)); }
function at(m, x, y, z, rx = 0, ry = 0, rz = 0) { m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; }
const grip = (h, col) => at(cyl(0.85, 0.85, h, col), 0, 0, 0);
export const ACCS = [
  { id: 'none', name: 'Empty hands', build: () => [] },
  { id: 'bouquet', name: 'Bouquet', build: () => { const out = [at(mesh(new THREE.ConeGeometry(2.8, 7.5, 18, 1, true), plastic('#f3ecdd', { side: THREE.DoubleSide })), 0, 1.0, 0, Math.PI)];
    [[0, 5.6, 0, C.white], [1.8, 5.0, 0.8, C.pink], [-1.8, 5.1, 0.6, C.pink], [0.8, 5.2, -1.6, C.white], [-0.9, 5.0, -1.4, '#f2b8c6'], [0.2, 6.6, 0.4, '#f2b8c6'], [2.2, 4.4, -0.8, C.white], [-2.2, 4.4, -0.6, C.white]].forEach(([fx, fy, fz, c]) => out.push(sphereAt(1.35, fx, fy, fz, c)));
    [[2.8, 4.0, 1.2], [-2.8, 4.2, 1.0], [0, 4.2, 2.6]].forEach(([lx, ly, lz]) => { const l = sphereAt(0.9, lx, ly, lz, C.green); l.scale.set(1, 0.5, 1.8); out.push(l); }); return out; } },
  { id: 'gelato', name: 'Gelato', build: () => [at(mesh(new THREE.ConeGeometry(2.1, 6.4, 16), plastic('#D6A060', { roughness: 0.6 })), 0, 0.4, 0, Math.PI), sphereAt(2.2, 0, 4.2, 0, C.mint), sphereAt(2.0, 0, 6.8, 0, C.pink), sphereAt(0.45, 0.3, 8.8, 0.4, C.red)] },
  { id: 'pizza', name: 'Pizza slice', build: () => { const s = new THREE.Shape(); s.moveTo(-3.4, 0); s.lineTo(3.4, 0); s.lineTo(0, 11); s.closePath();
    const out = [at(mesh(block(s, 0.6, 0.2), plastic('#F4C04A')), 0, -1.2, 0.4), at(mesh(block(rect(7.4, 1.2, -3.7, -1.8), 1.1, 0.35), plastic('#C98A45', { roughness: 0.6 })), 0, 0, 0.4)];
    [[-1.2, 2.8], [1.2, 3.4], [0, 6.4], [-0.6, 4.8]].forEach(([px, py]) => out.push(at(cyl(0.9, 0.9, 0.35, '#B83A2C'), px, py, 0.9, Math.PI / 2))); return out; } },
  { id: 'espresso', name: 'Espresso', build: () => [lathe([[0, 0.2], [3.0, 0.2], [3.0, 0.6], [0, 0.6]], C.white), lathe([[0, 0.6], [1.6, 0.6], [1.9, 3.2], [1.7, 3.2], [1.45, 0.9], [0, 0.9]], C.white), at(lathe([[0, 0], [1.6, 0]], '#3b2416'), 0, 2.9, 0),
    at(mesh(new THREE.TorusGeometry(0.8, 0.25, 8, 16, Math.PI * 1.3), plastic(C.white)), 2.1, 1.9, 0, 0, 0, -Math.PI * 0.65)] },
  { id: 'wine', name: 'Glass of red', build: () => [lathe([[0, -1.6], [2.0, -1.6], [2.0, -1.3], [0.3, -1.1], [0.3, 2.2], [1.6, 3.2], [2.2, 5.4], [2.1, 7.2]], '#e8f1f3', { transparent: true, opacity: 0.45, roughness: 0.08 }), lathe([[0, 3.0], [1.4, 3.4], [2.0, 5.2], [0, 5.2]], '#7a0f1f', { roughness: 0.15 })] },
  { id: 'prosecco', name: 'Prosecco', build: () => [lathe([[0, -1.6], [1.8, -1.6], [1.8, -1.3], [0.3, -1.1], [0.3, 2.4], [1.0, 3.2], [1.3, 8.6]], '#e8f1f3', { transparent: true, opacity: 0.45, roughness: 0.08 }), lathe([[0, 3.2], [0.9, 3.4], [1.15, 7.4], [0, 7.4]], '#F2D06B', { roughness: 0.15 })] },
  { id: 'camera', name: 'Camera', build: () => [at(mesh(block(rect(6.6, 4.2, -3.3, -1.6), 3.0, 0.4), plastic(C.black)), 0, 0, 0.4), at(cyl(1.5, 1.5, 1.8, '#333'), 1.0, 0.5, 2.6, Math.PI / 2), at(cyl(1.1, 1.1, 0.3, '#6fa3c7', { roughness: 0.1 }), 1.0, 0.5, 3.6, Math.PI / 2), at(mesh(block(rect(1.6, 0.8, -0.8, 0), 1.2, 0.2), plastic(C.gray)), -2.0, 2.7, 0.4)] },
  { id: 'brush', name: 'Paintbrush', build: () => [grip(9, C.brown), at(cyl(0.55, 0.85, 1.8, C.gray, { metalness: 0.6, roughness: 0.3 }), 0, 5.4, 0), at(mesh(new THREE.ConeGeometry(0.65, 2.2, 12), plastic(C.blue)), 0, 7.4, 0)] },
  { id: 'sunflower', name: 'Sunflower', build: () => { const out = [at(cyl(0.45, 0.45, 13, C.green), 0, 3.5, 0), at(cyl(1.7, 1.7, 0.8, '#5a3310', { roughness: 0.8 }), 0, 10.5, 0.4, Math.PI / 2)];
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2, p = sphereAt(0.95, Math.cos(a) * 2.7, 10.5 + Math.sin(a) * 2.7, 0.2, C.yellow); p.scale.set(1.5, 0.6, 0.35); p.rotation.z = a; out.push(p); }
    const leaf = sphereAt(1.2, 1.3, 5.0, 0, C.green); leaf.scale.set(1.8, 0.6, 0.3); out.push(leaf); return out; } },
  { id: 'baguette', name: 'Baguette', build: () => { const b = at(mesh(new THREE.CapsuleGeometry(1.35, 13, 8, 14), plastic('#D9A55B', { roughness: 0.65 })), 0, 3.6, 0, 0, 0, 0.35);
    return [b, ...[-1, 0, 1].map((k) => at(mesh(block(rect(1.8, 0.3, -0.9, 0), 0.8, 0.1), plastic('#F0D9A6')), -Math.sin(0.35) * k * 4, 3.6 + Math.cos(0.35) * k * 4, 1.3, 0, 0, 0.35 + 0.7))]; } },
  { id: 'map', name: 'Map of Italy', build: () => { const m = mesh(new THREE.BoxGeometry(9, 6.4, 0.3), [plastic('#efe6cf'), plastic('#efe6cf'), plastic('#efe6cf'), plastic('#efe6cf'), new THREE.MeshStandardMaterial({ map: mapTex(), roughness: 0.6 }), plastic('#efe6cf')]);
    return [at(m, 0, 3.4, 0.6)]; } },
  { id: 'suitcase', name: 'Suitcase', build: () => [at(mesh(block(rect(8, 6.6, -4, -7.4), 2.8, 0.5), plastic('#2E7D9A')), 0, 0, 0), at(mesh(new THREE.TorusGeometry(1.3, 0.35, 8, 16, Math.PI), plastic(C.black)), 0, -0.6, 0), at(mesh(block(rect(8.2, 0.6, -4.1, -4.4), 3.0, 0.1), plastic('#E8C07A')), 0, 0, 0)] },
  { id: 'mandolin', name: 'Mandolin', build: () => { const body = lathe([[0, -4.6], [2.8, -4.0], [3.9, -1.8], [3.6, 0.8], [2.2, 3.0], [0.9, 4.0], [0, 4.2]], '#9a5424', { roughness: 0.28 }, 32); body.scale.z = 0.42;
    const top = at(mesh(new THREE.CircleGeometry(1, 32), plastic('#E2B878', { roughness: 0.4 })), 0, -0.4, 1.66); top.scale.set(3.5, 3.9, 1);
    const inst = new THREE.Group().add(body, top, at(cyl(0.95, 0.95, 0.1, '#1a1410'), 0, 0.2, 1.72, Math.PI / 2), at(mesh(new THREE.BoxGeometry(1.3, 9, 0.7), plastic('#3a2412')), 0, 8.2, 0.9), at(mesh(new THREE.BoxGeometry(1.8, 2.2, 0.7), plastic('#3a2412')), 0, 13.6, 0.8), at(mesh(new THREE.BoxGeometry(0.9, 2.6, 0.25), plastic('#caa46a')), 0, -3.2, 1.7));
    return [at(inst, 2.6, 2.2, 2.4, 0, 0, -0.95)]; } },
  { id: 'balloon', name: 'Heart balloon', build: () => { const s = new THREE.Shape(); s.moveTo(0, -3.4); s.bezierCurveTo(-6, 0.6, -3.2, 4.8, 0, 2.2); s.bezierCurveTo(3.2, 4.8, 6, 0.6, 0, -3.4);
    return [grip(2, C.white), at(cyl(0.12, 0.12, 20, '#ddd'), 0, 10, 0), at(mesh(block(s, 2.4, 0.9), plastic('#D6263B', { roughness: 0.2 })), 0, 23.4, 0)]; } },
  { id: 'lemon', name: 'Amalfi lemon', build: () => { const l = sphereAt(2.4, 0, 2.4, 0.6, C.yellow); l.scale.set(1, 1.35, 1); const leaf = sphereAt(1.1, 1.4, 5.4, 0.6, C.green); leaf.scale.set(1.8, 0.5, 0.8); return [l, leaf, sphereAt(0.5, 0, 5.6, 0.6, C.yellow)]; } },
  { id: 'cake', name: 'Wedding cake slice', build: () => { const s = new THREE.Shape(); s.moveTo(-3.4, 0); s.lineTo(3.4, 0); s.lineTo(0, 7); s.closePath();
    const plate = lathe([[0, -0.4], [4.6, -0.4], [4.6, 0], [0, 0]], C.white); const cake = at(mesh(block(s, 4.4, 0.3), plastic('#FBF3E4')), 0, 0, 0.4, -Math.PI / 2);
    return [plate, cake, at(mesh(block(s, 4.5, 0.1), plastic(C.pink)), 0, 2.0, 0.4, -Math.PI / 2), sphereAt(0.9, 0, 4.9, 1.6, C.red)]; } },
  { id: 'rings', name: 'Ring box', build: () => [at(mesh(block(rect(5, 2.4, -2.5, 0), 4.2, 0.5), plastic('#7A1A3C', { roughness: 0.6 })), 0, 0, 0), at(mesh(block(rect(5, 2.0, -2.5, 0), 4.2, 0.5), plastic('#7A1A3C', { roughness: 0.6 })), 0, 2.6, -2.2, -1.1),
    at(mesh(new THREE.TorusGeometry(1.0, 0.28, 10, 24), plastic(C.gold, { metalness: 0.7, roughness: 0.25 })), 0, 3.4, 0.2), at(mesh(new THREE.OctahedronGeometry(0.6), plastic('#e8f6ff', { roughness: 0.05 })), 0, 4.6, 0.2)] },
  { id: 'book', name: 'Guidebook', build: () => [at(mesh(block(rect(5.4, 7.4, -2.7, -3.2), 1.8, 0.3), plastic(C.darkGreen)), 0, 0, 0.4), at(mesh(new THREE.BoxGeometry(4.8, 7.0, 1.7), plastic('#f4ecd6')), 0.5, 0.5, 0.4)] },
  { id: 'phone', name: 'Selfie phone', build: () => [at(mesh(block(rect(3.4, 6.6, -1.7, -2.6), 0.6, 0.3), plastic(C.black)), 0, 0, 0.8, -0.3), at(mesh(new THREE.PlaneGeometry(2.8, 5.6), plastic('#9ec9e8', { roughness: 0.1, emissive: '#1c3a55' })), 0, 0.9, 1.35, -0.3)] },
  { id: 'flag', name: 'Italian flag', build: () => { const tex = printTex('flag', 90, 60, (x) => { ['#1f8a4c', '#f4f4f2', '#cd212a'].forEach((c, i) => { x.fillStyle = c; x.fillRect(i * 30, 0, 30, 60); }); });
    const f = mesh(new THREE.PlaneGeometry(7.2, 4.8), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.6 })); return [at(cyl(0.6, 0.6, 22, C.brown), 0, 8, 0), sphereAt(0.9, 0, 19.2, 0, C.gold), at(f, -3.7, 16.4, 0, 0, -0.2)]; } },
  { id: 'sign', name: 'Ciao! sign', build: () => { const tex = printTex('sign', 128, 80, (x) => { x.fillStyle = '#f7efd9'; x.fillRect(0, 0, 128, 80); x.strokeStyle = C.darkRed; x.lineWidth = 6; x.strokeRect(3, 3, 122, 74); x.fillStyle = C.darkRed; x.font = '700 38px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Ciao!', 64, 42); });
    const board = mesh(new THREE.BoxGeometry(9, 5.6, 0.5), [plastic('#f7efd9'), plastic('#f7efd9'), plastic('#f7efd9'), plastic('#f7efd9'), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), plastic('#f7efd9')]); return [at(cyl(0.7, 0.7, 18, C.tan), 0, 6, 0), at(board, -2.2, 16.6, 0.4)]; } },
];
function mapTex() { return printTex('italy', 180, 128, (x) => { x.fillStyle = '#efe6cf'; x.fillRect(0, 0, 180, 128); x.fillStyle = '#9cc3d9'; x.fillRect(0, 0, 180, 128);
  x.fillStyle = '#e9dcb4'; x.beginPath(); [[62, 8], [100, 6], [118, 20], [100, 34], [104, 52], [124, 74], [140, 92], [150, 104], [140, 108], [126, 96], [120, 112], [110, 104], [104, 86], [84, 64], [70, 40], [58, 24]].forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.closePath(); x.fill();
  x.beginPath(); x.ellipse(118, 116, 12, 6, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(58, 88, 6, 12, 0, 0, 7); x.fill();
  x.fillStyle = '#7A1A3C'; x.beginPath(); x.arc(84, 52, 4, 0, 7); x.fill(); x.strokeStyle = 'rgba(80,60,30,.25)'; x.lineWidth = 1; [60, 120].forEach((xx) => { x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx, 128); x.stroke(); }); }); }

// ================================================================ the figure
const byId = (list, id) => list.find((p) => p.id === id) || list[0];
export const PARTS = { hair: HAIRS, hc: HAIR_COLORS, face: FACES, skin: SKINS, torso: TORSOS, legs: LEGS, acc: ACCS };
export function defaultFig() { return { name: '', p: { hair: 'short', hc: 'brown', face: 'smile', skin: 'classic', torso: 'suit', legs: 'navy', acc: 'none' } }; }
export function randomFig(rnd = Math.random) { const pick = (l) => l[Math.floor(rnd() * l.length)].id; return { name: '', p: { hair: pick(HAIRS), hc: pick(HAIR_COLORS), face: pick(FACES), skin: pick(SKINS), torso: pick(TORSOS), legs: pick(LEGS), acc: pick(ACCS) } }; }

function headMesh(face, skinCol, hairCol) {
  const pts = [[0, 0], [1.6, 0], [1.6, 1.4], [3.9, 1.4], [4.55, 1.75], [4.85, 2.35], [HEAD_R, 3.4], [HEAD_R, 5.8], [HEAD_R, 8.1], [4.85, 9.1], [4.5, 9.85], [3.8, 10.2], [2.45, 10.2], [2.45, 11.7], [2.25, 11.9], [0, 11.9]];
  const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 64, -Math.PI, Math.PI * 2);
  const uv = g.attributes.uv, p = g.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setY(i, Math.min(0.998, Math.max(0.002, (p.getY(i) - 2.35) / (9.1 - 2.35))));   // the print band
  const tex = printTex('face:' + face.id + skinCol + (face.hair ? hairCol : ''), FACE.w, FACE.h, (x) => { x.fillStyle = skinCol; x.fillRect(0, 0, FACE.w, FACE.h); face.draw(x, hairCol); });
  const m = mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 })); m.position.y = Y.head; return m;
}
function torsoMesh(torso, skinCol) {
  const s = new THREE.Shape(); s.moveTo(-T.bottom, 0); s.lineTo(T.bottom, 0); s.lineTo(T.top, 12.8); s.lineTo(-T.top, 12.8); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 7.0, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 2 });
  g.translate(0, 0, -3.5);
  const uv = g.attributes.uv, p = g.attributes.position, caps = g.groups[0];
  for (let i = caps.start; i < caps.start + caps.count; i++) { if (p.getZ(i) > 0) uv.setXY(i, (p.getX(i) + 8) / 16, p.getY(i) / 12.8); else uv.setXY(i, 0.03, 0.97); }
  const tex = printTex('torso:' + torso.id + skinCol, T.w, T.h, (x) => { x.fillStyle = torso.col; x.fillRect(0, 0, T.w, T.h); torso.draw(x, skinCol); x.fillStyle = torso.col; x.fillRect(0, 0, 12, 12); });
  const m = mesh(g, [new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 }), plastic(torso.col)]); m.position.y = Y.torso; return m;
}
function armMesh(side, col, skinCol) {                                  // side -1 = the figure's right (the viewer's left)
  const g = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(side * 6.0, 26.6, 0), new THREE.Vector3(side * 7.7, 24.0, 0.2), new THREE.Vector3(side * 8.3, 20.6, 1.2), new THREE.Vector3(side * 8.1, 18.8, 3.6)]);
  g.add(mesh(new THREE.TubeGeometry(curve, 20, 1.95, 14, false), plastic(col)));
  g.add(sphereAt(1.95, side * 6.0, 26.6, 0, col));
  const wrist = at(cyl(1.15, 1.15, 1.6, skinCol), side * 8.0, 18.2, 4.6, 1.2);
  const hg = new THREE.TorusGeometry(1.55, 0.95, 10, 18, Math.PI * 1.6); hg.rotateX(Math.PI / 2); hg.rotateY(-2.2);   // a C clip lying level, open to the front
  const hand = at(mesh(hg, plastic(skinCol)), side * 7.9, 17.2, 5.9, 0.25 * 0);
  g.add(wrist, hand);
  g.userData.grip = new THREE.Vector3(side * 7.9, 17.2, 5.9);
  return g;
}
function legsMesh(legs, skinCol) {
  const g = new THREE.Group(), col = legs.col;
  if (legs.skirt) {                                                      // a skirt piece in place of hips and legs
    const long = legs.skirt === 'long', h = Y.torso, geo = new THREE.CylinderGeometry(1, 1, h, 40, 8, false);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i) + h / 2, t = 1 - y / h, w = 7.8 + t * t * (long ? 3.4 : 1.4), d = 3.9 + t * t * (long ? 3.2 : 1.2); p.setXYZ(i, p.getX(i) * w, y, p.getZ(i) * d); }
    geo.computeVertexNormals(); g.add(mesh(geo, plastic(col)));
    if (!long) [-1, 1].forEach((s) => g.add(at(mesh(block(rect(6.6, 3.2, -3.3, 0), 6.4, 0.3), plastic(skinCol)), s * 3.9, 0, 0.8)));
    return g;
  }
  g.add(at(mesh(block(rect(15.6, 3.2, -7.8, 0), 7.2, 0.35), plastic(col)), 0, Y.hip, 0));
  [-1, 1].forEach((s) => {
    const prof = new THREE.Shape(); prof.moveTo(-3.4, 0); prof.lineTo(4.4, 0); prof.lineTo(4.4, 2.8); prof.lineTo(3.2, 3.6); prof.lineTo(3.2, 11.8); prof.lineTo(-3.4, 11.8); prof.closePath();
    const geo = new THREE.ExtrudeGeometry(prof, { depth: 7.0, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.35, bevelSegments: 2 }); geo.rotateY(-Math.PI / 2); geo.translate(s * 3.9 + 3.5, 0, 0);
    if (legs.shorts) {                                                    // shorts: the lower leg in skin, the upper in the fabric
      const up = geo.clone(), lo = geo; const clip = (gg, keepAbove) => { const pp = gg.attributes.position; for (let i = 0; i < pp.count; i++) { const y = pp.getY(i); pp.setY(i, keepAbove ? Math.max(y, 6.4) : Math.min(y, 6.4)); } gg.computeVertexNormals(); };
      clip(up, true); clip(lo, false); g.add(mesh(up, plastic(col)), mesh(lo, plastic(skinCol)));
    } else g.add(mesh(geo, plastic(col)));
  });
  return g;
}
// the whole figure, in millimeters (about 40 tall), feet on the ground at y 0, facing +z
export function buildFigure(fig) {
  const p = { ...defaultFig().p, ...((fig && fig.p) || {}) };
  const skin = byId(SKINS, p.skin).col, hc = byId(HAIR_COLORS, p.hc).col, torso = byId(TORSOS, p.torso), legs = byId(LEGS, p.legs), hair = byId(HAIRS, p.hair), face = byId(FACES, p.face), acc = byId(ACCS, p.acc);
  const g = new THREE.Group();
  g.add(legsMesh(legs, skin), torsoMesh(torso, skin), headMesh(face, skin, hc));
  const armCol = torso.arms || skin;
  const right = armMesh(-1, armCol, skin), left = armMesh(1, armCol, skin);
  g.add(right, left);
  hair.build(hc, skin).forEach((m) => g.add(m));
  const held = acc.build();
  if (held.length) { const a = new THREE.Group(); held.forEach((m) => a.add(m)); a.position.copy(right.userData.grip); g.add(a); }
  g.userData.fig = fig;
  return g;
}
// one loose part, for the parts bins beside the shelf: kind 'head' | 'torso' | 'legs' | 'hair' | 'acc', from a partial
// figure spec (missing choices take the defaults). Millimeters, resting on y = 0, centred on x and z.
export function loosePart(kind, p = {}) {
  p = { ...defaultFig().p, ...p };
  const skin = byId(SKINS, p.skin).col, hc = byId(HAIR_COLORS, p.hc).col, g = new THREE.Group();
  if (kind === 'head') { const h = headMesh(byId(FACES, p.face), skin, hc); h.position.y = 0; g.add(h); }
  else if (kind === 'torso') { const t = byId(TORSOS, p.torso), arms = t.arms || skin; const inner = new THREE.Group(); inner.add(torsoMesh(t, skin), armMesh(-1, arms, skin), armMesh(1, arms, skin)); inner.position.y = -Y.torso + 2.4; g.add(inner); }
  else if (kind === 'legs') g.add(legsMesh(byId(LEGS, p.legs), skin));
  else if (kind === 'hair') { const inner = new THREE.Group(); byId(HAIRS, p.hair).build(hc, skin).forEach((m) => inner.add(m)); inner.position.y = -30; g.add(inner); }
  else if (kind === 'acc') byId(ACCS, p.acc).build().forEach((m) => g.add(m));
  return g;
}
// frees what a figure alone holds (its geometries); materials and prints are shared and kept
export function disposeFigure(g) { g.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
