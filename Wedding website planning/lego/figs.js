// The LEGO shelf's characters: a catalog of parts (hair and hats, faces, skin tones, torsos, legs, and things to hold)
// and buildFigure(), which turns a choice of them into a three.js figure. Shared by the 3D gallery (the shelf on Kelly's
// wall and the build station's preview), the phone guide and the private page (thumbnails). Everything is modeled in
// millimeters at a real minifigure's size, feet on y = 0, facing +z; the caller scales it.
// A figure is { name, p: { hair, hc, face, skin, torso, legs, acc } }: part ids from the lists below (hc = hair color).
// Unknown ids fall back to the first of their list, so a saved figure never breaks if a part is renamed.
import * as THREE from 'three';
import { toCreasedNormals } from '../assets/lib/three/examples/jsm/utils/BufferGeometryUtils.js';

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
  // a print that uses a picture (the monogram) is drawn again once the picture has loaded
  if (x.waiting) x.waiting.forEach((im) => im.addEventListener('load', () => { x.waiting = null; draw(x, w, h); t.needsUpdate = true; }, { once: true }));
  prints.set(key, t); return t;
}
// a picture for a print, loaded once; `picture(x, im)` says whether it is ready, and if not the print is redrawn when it is
const pics = new Map();
function pic(url) { if (!pics.has(url)) { const im = new Image(); im.src = url; pics.set(url, im); } return pics.get(url); }
function ready(x, im) { if (im.complete && im.naturalWidth) return true; (x.waiting = x.waiting || []).push(im); return false; }
function tinted(im, col) {                                                // a picture used as a stencil, in one color
  const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const y = c.getContext('2d');
  y.drawImage(im, 0, 0); y.globalCompositeOperation = 'source-in'; y.fillStyle = col; y.fillRect(0, 0, c.width, c.height); return c;
}
const MONOGRAM = new URL('../assets/lego/monogram-ka-256.png', import.meta.url).href;
// the pictures prints use, started now; a still picture of a figure (snapshot) waits for this, as it is drawn only once
export const picturesReady = new Promise((res) => { const im = pic(MONOGRAM), go = () => setTimeout(res, 0); if (im.complete) go(); else { im.addEventListener('load', go); im.addEventListener('error', go); } });   // a tick later, so prints waiting on it have redrawn first

// ================================================================ faces
// drawn on the head's band: 1024 px round the head (u 0.5 = the front), 224 px from y 2.35 to 9.1 of the head
const FACE = { w: 1024, h: 224, cx: 512, eyeY: 106, browY: 66, mouthY: 160, eyeDX: 60, k: 1.32 };
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
  { id: 'smirk', name: 'Smirk', draw(x) { eyes(x); const { cx, eyeDX, browY, mouthY } = FACE; x.strokeStyle = INK; x.lineWidth = 8; x.lineCap = 'round';
    x.beginPath(); x.moveTo(cx - eyeDX - 18, browY + 4); x.quadraticCurveTo(cx - eyeDX, browY - 4, cx - eyeDX + 18, browY + 2); x.stroke();
    x.beginPath(); x.moveTo(cx + eyeDX - 18, browY - 4); x.quadraticCurveTo(cx + eyeDX, browY - 18, cx + eyeDX + 18, browY - 8); x.stroke();
    x.beginPath(); x.moveTo(cx - 34, mouthY + 2); x.quadraticCurveTo(cx + 10, mouthY + 10, cx + 44, mouthY - 12); x.stroke(); } },
  { id: 'determined', name: 'Determined', draw(x) { eyes(x); const { cx, eyeDX, browY, mouthY } = FACE; x.strokeStyle = INK; x.lineWidth = 9; x.lineCap = 'round';
    [-1, 1].forEach((sd) => { x.beginPath(); x.moveTo(cx + sd * (eyeDX + 20), browY - 2); x.lineTo(cx + sd * (eyeDX - 18), browY + 12); x.stroke(); });
    x.beginPath(); x.moveTo(cx - 30, mouthY + 4); x.lineTo(cx + 30, mouthY + 4); x.stroke(); } },
  { id: 'teeth', name: 'Toothy smile', draw(x) { eyes(x); brows(x, 4); const { cx, mouthY } = FACE;
    x.fillStyle = INK; x.beginPath(); x.moveTo(cx - 54, mouthY - 14); x.quadraticCurveTo(cx, mouthY + 44, cx + 54, mouthY - 14); x.closePath(); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(cx - 46, mouthY - 10); x.lineTo(cx + 46, mouthY - 10); x.quadraticCurveTo(cx, mouthY + 30, cx - 46, mouthY - 10); x.fill();
    x.save(); x.beginPath(); x.moveTo(cx - 46, mouthY - 10); x.lineTo(cx + 46, mouthY - 10); x.quadraticCurveTo(cx, mouthY + 30, cx - 46, mouthY - 10); x.clip();   // the lines between the teeth, on the teeth only
    x.strokeStyle = '#c9c1b0'; x.lineWidth = 2; [-22, 0, 22].forEach((d) => { x.beginPath(); x.moveTo(cx + d, mouthY - 12); x.lineTo(cx + d, mouthY + 24); x.stroke(); }); x.restore(); } },
  { id: 'freckles', name: 'Freckles', draw(x) { eyes(x); brows(x, 2, '#6b3a1c'); smile(x, 40, 18); x.fillStyle = 'rgba(150,80,40,.8)';
    [[-80, 130], [-66, 138], [-92, 142], [-72, 124], [80, 130], [66, 138], [92, 142], [72, 124], [-4, 132], [6, 124]].forEach(([dx, y]) => { x.beginPath(); x.arc(FACE.cx + dx, y, 3.2, 0, 7); x.fill(); }); } },
];

// ---- facial hair: printed over the face in the hair's color, the mouth always left clear (a cut round it), so any beard
// goes with any expression. `geo` adds a moulded piece as well (the wizard's beard). A figure's `fh`.
const MOUTH = { x: 512, y: 166, rx: 50, ry: 19 };
function jawPath(x, outer, inner) {                                  // a band from sideburn to sideburn, round the chin
  const { cx } = FACE; x.beginPath();
  x.moveTo(cx - outer.w, outer.top); x.lineTo(cx - outer.w - 2, 150); x.quadraticCurveTo(cx - outer.w + 18, outer.chin - 6, cx, outer.chin); x.quadraticCurveTo(cx + outer.w - 18, outer.chin - 6, cx + outer.w + 2, 150); x.lineTo(cx + outer.w, outer.top);
  x.lineTo(cx + inner.w, outer.top); x.lineTo(cx + inner.w - 4, inner.cheek); x.quadraticCurveTo(cx + inner.w - 30, inner.low, cx, inner.chin); x.quadraticCurveTo(cx - inner.w + 30, inner.low, cx - inner.w + 4, inner.cheek); x.lineTo(cx - inner.w, outer.top);
  x.closePath(); x.fill();
}
function stache(x, kind) {                                           // mustaches, over the upper lip
  const { cx } = FACE, y = 146; x.beginPath();
  if (kind === 'handlebar') { x.moveTo(cx, y - 8); x.bezierCurveTo(cx - 34, y - 20, cx - 70, y - 4, cx - 84, y - 26); x.bezierCurveTo(cx - 92, y - 40, cx - 70, y - 38, cx - 74, y - 24); x.bezierCurveTo(cx - 60, y + 2, cx - 26, y + 4, cx, y + 2);
    x.bezierCurveTo(cx + 26, y + 4, cx + 60, y + 2, cx + 74, y - 24); x.bezierCurveTo(cx + 70, y - 38, cx + 92, y - 40, cx + 84, y - 26); x.bezierCurveTo(cx + 70, y - 4, cx + 34, y - 20, cx, y - 8); }
  else if (kind === 'chevron') { x.moveTo(cx - 58, y + 4); x.quadraticCurveTo(cx - 50, y - 22, cx, y - 20); x.quadraticCurveTo(cx + 50, y - 22, cx + 58, y + 4); x.quadraticCurveTo(cx, y - 4, cx - 58, y + 4); }
  else if (kind === 'pencil') { x.moveTo(cx - 44, y - 2); x.quadraticCurveTo(cx, y - 14, cx + 44, y - 2); x.quadraticCurveTo(cx, y - 8, cx - 44, y - 2); }
  else { x.moveTo(cx, y - 18); x.bezierCurveTo(cx - 30, y - 30, cx - 70, y - 10, cx - 72, y + 2); x.bezierCurveTo(cx - 50, y - 6, cx - 20, y - 2, cx, y - 6); x.bezierCurveTo(cx + 20, y - 2, cx + 50, y - 6, cx + 72, y + 2); x.bezierCurveTo(cx + 70, y - 10, cx + 30, y - 30, cx, y - 18); }
  x.fill();
}
export const FACIAL_HAIR = [
  { id: 'none', name: 'None', draw() {} },
  { id: 'stubble', name: 'Stubble', draw(x, hc) { let s0 = 7; const r = () => (s0 = (s0 * 16807) % 2147483647) / 2147483647; x.fillStyle = hc; x.globalAlpha = 0.6;
    for (let i = 0; i < 380; i++) { const px = FACE.cx + (r() - 0.5) * 270, py = 118 + r() * 84; if (Math.abs(px - FACE.cx) < 130 - (py - 118) * 0.35 * (py < 150 ? 0 : 1) && (py > 138 || Math.abs(px - FACE.cx) > 96)) x.fillRect(px, py, 3.4, 3.4); } x.globalAlpha = 1; } },
  { id: 'beard', name: 'Full beard', draw(x, hc) { x.fillStyle = hc; jawPath(x, { w: 136, top: 70, chin: 226 }, { w: 112, cheek: 120, low: 142, chin: 140 }); stache(x); } },
  { id: 'shortbeard', name: 'Short beard', draw(x, hc) { x.fillStyle = hc; jawPath(x, { w: 132, top: 92, chin: 218 }, { w: 118, cheek: 150, low: 180, chin: 182 }); stache(x); } },
  { id: 'goatee', name: 'Goatee', draw(x, hc) { x.fillStyle = hc; const { cx } = FACE; stache(x);
    x.beginPath(); x.moveTo(cx - 60, 150); x.quadraticCurveTo(cx - 64, 206, cx, 214); x.quadraticCurveTo(cx + 64, 206, cx + 60, 150); x.quadraticCurveTo(cx + 50, 150, cx + 44, 166); x.quadraticCurveTo(cx, 196, cx - 44, 166); x.quadraticCurveTo(cx - 50, 150, cx - 60, 150); x.fill(); } },
  { id: 'sideburns', name: 'Sideburns', draw(x, hc) { x.fillStyle = hc; [-1, 1].forEach((sd) => { x.beginPath(); x.moveTo(FACE.cx + sd * 136, 70); x.lineTo(FACE.cx + sd * 138, 150); x.lineTo(FACE.cx + sd * 114, 142); x.lineTo(FACE.cx + sd * 116, 70); x.fill(); }); } },
  { id: 'mustache', name: 'Mustache', draw(x, hc) { x.fillStyle = hc; stache(x); } },
  { id: 'handlebar', name: 'Handlebar mustache', draw(x, hc) { x.fillStyle = hc; stache(x, 'handlebar'); } },
  { id: 'chevron', name: 'Chevron mustache', draw(x, hc) { x.fillStyle = hc; stache(x, 'chevron'); } },
  { id: 'pencil', name: 'Pencil mustache', draw(x, hc) { x.fillStyle = hc; stache(x, 'pencil'); } },
  { id: 'soulpatch', name: 'Soul patch', draw(x, hc) { x.fillStyle = hc; x.beginPath(); x.moveTo(FACE.cx - 12, 190); x.lineTo(FACE.cx + 12, 190); x.lineTo(FACE.cx, 212); x.fill(); } },
  { id: 'wizard', name: "Wizard's beard", draw(x, hc) { x.fillStyle = hc; stache(x); jawPath(x, { w: 130, top: 120, chin: 226 }, { w: 116, cheek: 150, low: 170, chin: 176 }); },
    geo(hc) {                                                        // a long moulded beard down over the chest, wavy at the tip
      const sh = new THREE.Shape(); sh.moveTo(-4.0, 0); sh.quadraticCurveTo(-4.4, -3.6, -2.4, -6.6); sh.lineTo(-1.2, -5.9); sh.lineTo(0, -7.6); sh.lineTo(1.2, -5.9); sh.lineTo(2.4, -6.6); sh.quadraticCurveTo(4.4, -3.6, 4.0, 0); sh.quadraticCurveTo(0, 1.0, -4.0, 0);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 1.2, bevelEnabled: true, bevelSize: 0.4, bevelThickness: 0.4, bevelSegments: 3 });
      const m = mesh(g, plastic(hc, { roughness: 0.4 })); m.position.set(0, 31.2, 3.4); m.rotation.x = -0.12; return m; } },
];
// ---- glasses: printed over the eyes, in their own frames. A figure's `gl`.
function lensPair(x, draw) { [-1, 1].forEach((sd) => draw(FACE.cx + sd * FACE.eyeDX, FACE.eyeY, sd)); }
function bridge(x, col, w = 6) { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(FACE.cx - 28, FACE.eyeY - 6); x.quadraticCurveTo(FACE.cx, FACE.eyeY - 16, FACE.cx + 28, FACE.eyeY - 6); x.stroke();
  [-1, 1].forEach((sd) => { x.beginPath(); x.moveTo(FACE.cx + sd * (FACE.eyeDX + 32), FACE.eyeY - 8); x.lineTo(FACE.cx + sd * 170, FACE.eyeY - 14); x.stroke(); }); }
function rrect(x, cx2, cy, w, h, r) { x.beginPath(); x.moveTo(cx2 - w / 2 + r, cy - h / 2); x.arcTo(cx2 + w / 2, cy - h / 2, cx2 + w / 2, cy + h / 2, r); x.arcTo(cx2 + w / 2, cy + h / 2, cx2 - w / 2, cy + h / 2, r); x.arcTo(cx2 - w / 2, cy + h / 2, cx2 - w / 2, cy - h / 2, r); x.arcTo(cx2 - w / 2, cy - h / 2, cx2 + w / 2, cy - h / 2, r); x.closePath(); }
export const GLASSES = [
  { id: 'none', name: 'None', draw() {} },
  { id: 'round', name: 'Round glasses', draw(x) { x.strokeStyle = '#3b2a1e'; x.lineWidth = 7; lensPair(x, (ex, ey) => { x.beginPath(); x.arc(ex, ey, 30, 0, 7); x.stroke(); }); bridge(x, '#3b2a1e'); } },
  { id: 'square', name: 'Square glasses', draw(x) { x.strokeStyle = '#1b1b1b'; x.lineWidth = 8; lensPair(x, (ex, ey) => { rrect(x, ex, ey, 66, 48, 8); x.stroke(); }); bridge(x, '#1b1b1b', 7); } },
  { id: 'tortoise', name: 'Tortoiseshell', draw(x) { x.strokeStyle = '#7a4a24'; x.lineWidth = 10; lensPair(x, (ex, ey) => { rrect(x, ex, ey, 64, 50, 18); x.stroke(); }); x.strokeStyle = 'rgba(40,20,8,.5)'; x.lineWidth = 3; lensPair(x, (ex, ey) => { rrect(x, ex, ey, 64, 50, 18); x.stroke(); }); bridge(x, '#7a4a24', 7); } },
  { id: 'cateye', name: 'Cat-eye glasses', draw(x) { x.fillStyle = '#7A1A3C'; lensPair(x, (ex, ey, sd) => { x.beginPath(); x.moveTo(ex - sd * 34, ey + 4); x.quadraticCurveTo(ex - sd * 30, ey + 30, ex, ey + 26); x.quadraticCurveTo(ex + sd * 32, ey + 24, ex + sd * 40, ey - 26); x.quadraticCurveTo(ex, ey - 28, ex - sd * 34, ey + 4); x.fill(); });
    x.fillStyle = '#000'; x.globalCompositeOperation = 'destination-out'; lensPair(x, (ex, ey) => { x.beginPath(); x.ellipse(ex, ey + 2, 24, 18, 0, 0, 7); x.fill(); }); x.globalCompositeOperation = 'source-over'; bridge(x, '#7A1A3C', 6); } },
  { id: 'sun', name: 'Sunglasses', draw(x) { x.fillStyle = '#111'; lensPair(x, (ex, ey, sd) => { x.beginPath(); x.moveTo(ex - sd * 46, ey - 22); x.lineTo(ex + sd * 36, ey - 24); x.quadraticCurveTo(ex + sd * 34, ey + 26, ex - sd * 6, ey + 22); x.quadraticCurveTo(ex - sd * 44, ey + 16, ex - sd * 46, ey - 22); x.fill(); });
    x.fillRect(FACE.cx - 16, FACE.eyeY - 24, 32, 7); bridge(x, '#111', 7); x.fillStyle = 'rgba(255,255,255,.55)'; lensPair(x, (ex, ey) => x.fillRect(ex - 14, ey - 14, 10, 5)); } },
  { id: 'aviator', name: 'Aviators', draw(x) { lensPair(x, (ex, ey, sd) => { x.beginPath(); x.moveTo(ex - sd * 30, ey - 20); x.lineTo(ex + sd * 32, ey - 20); x.quadraticCurveTo(ex + sd * 36, ey + 30, ex - sd * 2, ey + 28); x.quadraticCurveTo(ex - sd * 34, ey + 20, ex - sd * 30, ey - 20);
    const gr = x.createLinearGradient(ex, ey - 20, ex, ey + 28); gr.addColorStop(0, '#3a2a16'); gr.addColorStop(1, '#8a6a36'); x.fillStyle = gr; x.fill(); x.strokeStyle = '#C9A04A'; x.lineWidth = 4; x.stroke(); });
    x.strokeStyle = '#C9A04A'; x.lineWidth = 4; x.beginPath(); x.moveTo(FACE.cx - 30, FACE.eyeY - 18); x.lineTo(FACE.cx + 30, FACE.eyeY - 18); x.stroke(); bridge(x, '#C9A04A', 4); } },
  { id: 'reading', name: 'Reading glasses', draw(x) { x.strokeStyle = '#8a6a3a'; x.lineWidth = 6; lensPair(x, (ex, ey) => { x.beginPath(); x.moveTo(ex - 30, ey + 8); x.quadraticCurveTo(ex, ey + 40, ex + 30, ey + 8); x.lineTo(ex - 30, ey + 8); x.stroke(); });
    x.beginPath(); x.moveTo(FACE.cx - 30, FACE.eyeY + 8); x.quadraticCurveTo(FACE.cx, FACE.eyeY, FACE.cx + 30, FACE.eyeY + 8); x.stroke(); } },
  { id: 'monocle', name: 'Monocle', draw(x) { const ex = FACE.cx + FACE.eyeDX, ey = FACE.eyeY; x.strokeStyle = '#C9A04A'; x.lineWidth = 7; x.beginPath(); x.arc(ex, ey, 30, 0, 7); x.stroke();
    x.lineWidth = 3; x.beginPath(); x.moveTo(ex + 20, ey + 22); x.quadraticCurveTo(ex + 50, ey + 80, ex + 90, ey + 110); x.stroke(); } },
  { id: 'heart', name: 'Heart sunglasses', draw(x) { x.fillStyle = '#E0316A'; lensPair(x, (hx, hy) => { x.beginPath(); x.moveTo(hx, hy + 28); x.bezierCurveTo(hx - 50, hy + 2, hx - 26, hy - 36, hx, hy - 12); x.bezierCurveTo(hx + 26, hy - 36, hx + 50, hy + 2, hx, hy + 28); x.fill(); });
    bridge(x, '#E0316A', 6); x.fillStyle = 'rgba(255,255,255,.55)'; lensPair(x, (hx, hy) => x.fillRect(hx - 18, hy - 12, 8, 5)); } },
  { id: '3d', name: '3D glasses', draw(x) { x.fillStyle = '#f4f4f2'; x.fillRect(FACE.cx - 110, FACE.eyeY - 30, 220, 58); x.fillStyle = '#d6263b'; rrect(x, FACE.cx - FACE.eyeDX, FACE.eyeY, 70, 40, 6); x.fill(); x.fillStyle = '#2fb4d6'; rrect(x, FACE.cx + FACE.eyeDX, FACE.eyeY, 70, 40, 6); x.fill();
    x.strokeStyle = '#f4f4f2'; x.lineWidth = 8; [-1, 1].forEach((sd) => { x.beginPath(); x.moveTo(FACE.cx + sd * 110, FACE.eyeY - 20); x.lineTo(FACE.cx + sd * 172, FACE.eyeY - 24); x.stroke(); }); } },
  { id: 'star', name: 'Star party glasses', draw(x) { lensPair(x, (ex, ey) => { x.beginPath(); for (let k = 0; k < 10; k++) { const a = -PI / 2 + k * PI / 5, r = k % 2 ? 18 : 42; x.lineTo(ex + Math.cos(a) * r, ey + Math.sin(a) * r); } x.closePath(); x.fillStyle = '#E0316A'; x.fill(); x.strokeStyle = '#8a1440'; x.lineWidth = 4; x.stroke(); });
    x.fillStyle = 'rgba(40,10,30,.85)'; lensPair(x, (ex, ey) => { x.beginPath(); x.arc(ex, ey + 2, 13, 0, 7); x.fill(); }); bridge(x, '#E0316A', 6); } },
];
// a face saved before facial hair and glasses had wheels of their own names one of these; it is read as face + layer
const OLD_FACES = { glasses: { face: 'smile', gl: 'round' }, shades: { face: 'grin', gl: 'sun' }, beard: { face: 'smile', fh: 'beard' }, mustache: { face: 'smile', fh: 'mustache' }, stubble: { face: 'smile', fh: 'stubble' } };

// ================================================================ hair and hats
// A hair piece is a moulded cap, taller than the head as LEGO hair is: for each direction round the head (a = 0 at the
// face, a > 0 toward the viewer's right) it runs from the crown (or `start(a)`, for hair that leaves the crown bare) down to
// a hairline `line(a)`. Its outer surface is an ellipsoid of radius R, crowned at `top`; below the head it can spread
// (`flare`, long hair over the shoulders) and fall back (`lean`); `vol(a, y)` adds moulded volume (curls, a quiff, locks),
// never takes any away. The inside hugs the head just clear of it everywhere (hr), so no skin can show through the hair.
const smooth = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
const PI = Math.PI;
const wrap = (a) => ((a + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI;   // to -pi .. pi
function lineFn(pts) {                                   // pts: [[a, y], ...] with a from 0 (front) to pi (back); mirrored left/right
  return (a) => { a = Math.abs(wrap(a));
    for (let i = 1; i < pts.length; i++) if (a <= pts[i][0]) { const [a0, y0] = pts[i - 1], [a1, y1] = pts[i]; return y0 + (y1 - y0) * smooth((a - a0) / (a1 - a0)); }
    return pts[pts.length - 1][1]; };
}
function lineAsym(left, right) { const L = lineFn(left), R = lineFn(right); return (a) => (wrap(a) < 0 ? L(a) : R(a)); }   // the viewer's left, right
// the head's own radius at a height (world mm): the hair's inside stays just outside it
const HEADR = [[28.0, 1.6], [29.4, 1.6], [29.4, 3.9], [29.75, 4.55], [30.35, 4.85], [31.4, 4.9], [36.1, 4.9], [37.1, 4.85], [37.85, 4.5], [38.2, 3.8], [38.2, 2.45], [39.9, 2.45], [39.95, 0]];
function hr(y) { if (y <= HEADR[0][0]) return 1.6; for (let i = 1; i < HEADR.length; i++) if (y <= HEADR[i][0]) { const [y0, r0] = HEADR[i - 1], [y1, r1] = HEADR[i]; return y1 === y0 ? Math.max(r0, r1) : r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 0; }
function cap({ line, start = null, R = 5.9, top = 41.3, yc = 36.4, thick = 0.9, flare = 0, lean = 0, vol = null, segA = 80, segV = 34 }) {
  const pos = [], idx = [], rows = segV + 1, cols = segA + 1;
  const outerR = (a, y) => {
    let r = y > yc ? R * Math.sqrt(Math.max(0, 1 - ((y - yc) / (top - yc)) ** 2)) : R;
    if (y < 31) r += (31 - y) * flare;
    if (vol) r = Math.max(r - 0.45, r + vol(a, y) * Math.min(1, r / 2));   // moulded volume (or a shallow groove); none on the very crown, where the cap closes
    return r;
  };
  const point = (a, v, inner) => {
    const bottom = line(a), s0 = start ? Math.min(start(a), top) : top, y = s0 - v * (s0 - bottom);
    const ro = outerR(a, y);
    let r = ro;
    if (inner) r = Math.min(ro - 0.25, Math.max(ro - thick, hr(y) + 0.1));
    const z = Math.cos(a) * r - Math.max(0, 31 - y) * lean;
    return [Math.sin(a) * r, y, z];
  };
  for (let side = 0; side < 2; side++) for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) pos.push(...point(-PI + (i / segA) * 2 * PI, j / segV, side === 1));
  const at = (side, i, j) => side * rows * cols + j * cols + i;
  for (let j = 0; j < segV; j++) for (let i = 0; i < segA; i++) {
    const a = at(0, i, j), b = at(0, i + 1, j), c = at(0, i + 1, j + 1), d = at(0, i, j + 1);
    idx.push(a, d, b, b, d, c);                                                        // outside, facing out
    const a2 = at(1, i, j), b2 = at(1, i + 1, j), c2 = at(1, i + 1, j + 1), d2 = at(1, i, j + 1);
    idx.push(a2, b2, d2, b2, c2, d2);                                                  // inside, facing in
  }
  for (let i = 0; i < segA; i++) { const a = at(0, i, segV), b = at(0, i + 1, segV), c = at(1, i + 1, segV), d = at(1, i, segV); idx.push(a, b, d, b, c, d); }   // the rim
  if (start) for (let i = 0; i < segA; i++) { const a = at(0, i, 0), b = at(0, i + 1, 0), c = at(1, i + 1, 0), d = at(1, i, 0); idx.push(a, d, b, b, d, c); }   // the upper rim, for hair that leaves the crown bare
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
// moulded volume
const locks = (n, d) => (a, y) => d * Math.max(0, Math.sin(a * n + y * 0.5)) ** 2;                              // gentle combed locks
const curls = (d) => (a, y) => d * (0.55 + 0.45 * Math.sin(a * 12) * Math.sin(y * 2.7));                        // tight curls
const messy = (a, y) => 0.45 * Math.max(0, Math.sin(a * 7 + 1.3) * Math.sin(y * 1.9)) + 0.3 * Math.max(0, Math.sin(a * 13 - y * 1.2 + 0.7));
const waves = (a, y) => (y < 34 ? 0.5 * (0.5 + 0.5 * Math.sin(y * 1.8 + Math.abs(a) * 2.5)) * smooth((34 - y) / 3) : 0);
const plus = (...fs) => (a, y) => fs.reduce((t, f) => t + f(a, y), 0);
// hairlines, [a, y]: the front (a = 0), the temples, the sides, the back (a = pi)
const HL = {
  short: [[0, 36.35], [0.7, 36.05], [1.15, 34.6], [1.55, 31.7], [2.3, 30.4], [PI, 30.0]],
  high: [[0, 37.0], [0.7, 36.6], [1.15, 35.0], [1.55, 32.0], [2.3, 30.6], [PI, 30.2]],
  bob: [[0, 36.05], [0.78, 35.9], [1.2, 30.2], [1.7, 29.8], [PI, 29.5]],
  shoulder: [[0, 36.5], [0.5, 36.0], [0.95, 33.2], [1.3, 27.4], [PI, 27.0]],
  long: [[0, 37.0], [0.35, 36.3], [0.85, 35.1], [1.2, 23.8], [1.6, 23.0], [PI, 22.4]],
  bangs: [[0, 36.0], [0.75, 35.85], [1.1, 31.5], [1.35, 23.8], [PI, 22.4]],
};
const jag = (base, n, d) => (a) => base(a) - (Math.abs(wrap(a)) < 1.1 ? d * Math.max(0, Math.sin(a * n)) : 0);   // a ragged fringe
function hairMesh(geo, col) { return mesh(geo, plastic(col, { roughness: 0.4 })); }
let CUT = null;                                                           // under a hat: the height its rim sits at, where the hair begins
const capMesh = (opts, col) => { if (CUT != null) { const top = opts.top || 41.3; opts = { ...opts, start: (a) => Math.max(opts.line(a) + 0.02, Math.min(CUT, top)) }; } const m = hairMesh(cap(opts), col); m.userData.cap = true; return m; };
const sphereAt = (r, x, y, z, col, sy = 1) => { const m = mesh(new THREE.SphereGeometry(r, 24, 16), plastic(col, { roughness: 0.4 })); m.position.set(x, y, z); m.scale.y = sy; return m; };
function lathe(pts, col, extra, seg = 40) { return mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), plastic(col, extra)); }
const brim = (rIn, rOut, y, col, t = 0.6) => { const m = lathe([[rIn, y], [rOut, y], [rOut, y + t], [rIn, y + t]], col); return m; };
// a tapered lock of hair (a ponytail, a pigtail), hanging from `from` along `dir`, `len` long
function tail(col, from, dir, len, r0, r1) {
  const g = new THREE.LatheGeometry([[0, 0], [r0 * 0.8, 0.2], [r0, len * 0.18], [(r0 + r1) / 2 * 1.08, len * 0.6], [r1, len * 0.92], [0, len]].map(([r, y]) => new THREE.Vector2(r, y)), 24);
  const m = hairMesh(g, col); m.position.copy(from);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize()); return m;
}
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
// a lock of hair along a path (over the shoulder), tapering from r0 to r1 and rounded at its tip, flattened front to back
function strand(col, pts, r0, r1, flat = 0.5) {
  const c = new THREE.CatmullRomCurve3(pts), n = 32, geo = new THREE.TubeGeometry(c, n, 1, 16, false), pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const k = Math.floor(i / 17), t = k / n, cp = c.getPointAt(t), r = (r0 + (r1 - r0) * t) * (t > 0.9 ? Math.sqrt(Math.max(0.02, (1 - t) / 0.1)) : 1);
    pos.setXYZ(i, cp.x + (pos.getX(i) - cp.x) * r, cp.y + (pos.getY(i) - cp.y) * r, cp.z + (pos.getZ(i) - cp.z) * r * flat); }
  geo.computeVertexNormals(); return hairMesh(geo, col);
}
const centerPart = (y0) => (a, y) => -0.4 * Math.exp(-(wrap(a) ** 2) / 0.004) * smooth((y - y0) / 2);   // a parting down the middle
const hatHair = (hc) => capMesh({ line: lineFn(HL.short), R: 5.6, top: 40.6, thick: 0.65 }, hc);   // what shows under a hat
const longUnder = (hc) => capMesh({ line: lineFn(HL.long), R: 5.7, top: 40.9, flare: 0.42, lean: 0.3, vol: locks(10, 0.12) }, hc);

export const HAIRS = [
  { id: 'short', name: 'Classic short', build: (hc) => [capMesh({ line: lineFn(HL.short), vol: locks(9, 0.16) }, hc)] },
  { id: 'sidepart', name: 'Side part', build: (hc) => [capMesh({ line: lineAsym([[0, 36.7], [0.6, 36.4], [1.15, 34.8], [1.55, 31.7], [2.3, 30.4], [PI, 30.0]], [[0, 36.2], [0.45, 35.7], [0.85, 35.5], [1.2, 34.3], [1.55, 31.7], [2.3, 30.4], [PI, 30.0]]),
    vol: (a, y) => { const w = wrap(a), part = 0.42, top = smooth((y - 36.2) / 2.5);   // a combed part left of the crown's middle: a groove, the hair swept up and over from it
      return 0.12 * Math.max(0, Math.sin(a * 9 + y * 0.5)) ** 2 - 0.6 * Math.exp(-((w - part) ** 2) / 0.012) * top + 1.1 * Math.exp(-((w - part + 0.42) ** 2) / 0.1) * top; } }, hc)] },
  { id: 'slick', name: 'Slicked back', build: (hc) => [capMesh({ line: lineFn(HL.high), top: 40.9, vol: locks(14, 0.1) }, hc)] },
  { id: 'messy', name: 'Tousled', build: (hc) => [capMesh({ line: jag(lineFn(HL.short), 9, 0.45), vol: messy }, hc)] },
  { id: 'buzz', name: 'Buzz cut', build: (hc) => [capMesh({ line: lineFn(HL.high), R: 5.3, top: 40.4, thick: 0.35 }, hc)] },
  { id: 'pixie', name: 'Pixie', build: (hc) => [capMesh({ line: jag(lineAsym([[0, 36.4], [0.6, 36.2], [1.15, 34.4], [1.5, 32.0], [PI, 30.6]], [[0, 35.9], [0.5, 35.6], [0.9, 35.4], [1.2, 34.0], [1.5, 32.0], [PI, 30.6]]), 11, 0.3),
    vol: plus(locks(11, 0.16), (a, y) => (wrap(a) > 0 ? 0.45 * smooth((y - 35) / 3) * Math.exp(-((wrap(a) - 0.6) ** 2) / 0.3) : 0)) }, hc)] },
  { id: 'bob', name: 'Bob', build: (hc) => [capMesh({ line: lineFn(HL.bob), flare: 0.3, vol: locks(12, 0.12) }, hc)] },
  { id: 'long', name: 'Long straight', build: (hc) => [capMesh({ line: lineFn(HL.long), flare: 0.42, lean: 0.3, vol: locks(12, 0.12) }, hc)] },
  { id: 'bangs', name: 'Long with bangs', build: (hc) => [capMesh({ line: lineFn(HL.bangs), flare: 0.42, lean: 0.3, vol: locks(12, 0.12) }, hc)] },
  { id: 'wavy', name: 'Long waves', build: (hc) => [capMesh({ line: lineFn(HL.long), flare: 0.45, lean: 0.3, vol: plus(locks(10, 0.1), waves) }, hc)] },
  { id: 'curlylong', name: 'Long curls', build: (hc) => [capMesh({ line: lineFn([[0, 37.0], [0.35, 36.4], [0.85, 35.2], [1.2, 25.0], [PI, 24.0]]), R: 6.1, top: 41.9, flare: 0.5, lean: 0.3, vol: curls(0.65) }, hc)] },
  // ---- more long styles (the owner asked for more)
  { id: 'centerpart', name: 'Long, center part', build: (hc) => [capMesh({ line: lineFn([[0, 37.2], [0.3, 36.7], [0.85, 35.2], [1.2, 23.8], [1.6, 23.0], [PI, 22.4]]), flare: 0.42, lean: 0.3, vol: plus(locks(12, 0.1), centerPart(36.6)) }, hc)] },
  { id: 'sideswept', name: 'Long, side-swept', build: (hc) => [capMesh({   // a deep part on the viewer's right, a sweep of fringe across the brow to the left
    line: lineAsym([[0, 35.7], [0.35, 35.1], [0.7, 34.7], [1.0, 33.6], [1.25, 24.2], [PI, 22.4]], [[0, 36.3], [0.5, 37.0], [0.75, 36.7], [1.05, 35.0], [1.25, 24.2], [PI, 22.4]]),
    flare: 0.42, lean: 0.3, vol: (a, y) => { const w = wrap(a), top = smooth((y - 35.8) / 2.4);
      return 0.1 * Math.max(0, Math.sin(a * 11 - y * 0.6)) ** 2 - 0.5 * Math.exp(-((w - 0.52) ** 2) / 0.01) * top + 0.9 * Math.exp(-((w - 0.1) ** 2) / 0.12) * top; } }, hc)] },
  { id: 'overshoulder', name: 'Long over one shoulder', build: (hc) => [capMesh({   // parted on the left, the hair swept right and brought forward over that shoulder
    line: lineAsym([[0, 36.6], [0.5, 37.1], [0.85, 35.4], [1.2, 23.8], [PI, 22.4]], [[0, 36.0], [0.4, 35.6], [0.8, 34.9], [1.1, 30.0], [1.3, 23.8], [PI, 22.4]]),
    flare: 0.42, lean: 0.3, vol: plus(locks(12, 0.1), (a, y) => -0.45 * Math.exp(-((wrap(a) + 0.5) ** 2) / 0.008) * smooth((y - 36.4) / 2)) }, hc),
    strand(hc, [V3(4.4, 33.8, 1.2), V3(5.2, 31.0, 2.6), V3(5.6, 28.6, 4.2), V3(5.4, 25.8, 4.95), V3(5.0, 23.0, 5.0), V3(4.6, 20.6, 4.9), V3(4.5, 19.4, 4.7)], 2.4, 1.2, 0.42)] },
  { id: 'sidebraid', name: 'Side braid', build: (hc) => {             // the hair drawn back from a side part into one braid, brought forward over the shoulder
    const out = [capMesh({ line: lineFn([[0, 36.3], [0.7, 35.9], [1.15, 34.0], [1.55, 31.4], [PI, 30.2]]),
      vol: (a, y) => -0.4 * Math.exp(-((wrap(a) + 0.45) ** 2) / 0.006) * smooth((y - 36.4) / 2) + 0.1 * Math.max(0, Math.sin(a * 12 + y * 0.4)) }, hc)];
    const c = new THREE.CatmullRomCurve3([V3(4.4, 32.0, -1.8), V3(5.5, 29.6, 1.0), V3(5.6, 27.8, 3.9), V3(5.3, 25.0, 4.9), V3(5.05, 19.6, 4.9)]), n = 11;
    for (let k = 0; k <= n; k++) { const t = k / n, p = c.getPointAt(t), s = sphereAt(1.35 - 0.45 * t, p.x + (k % 2 ? 0.32 : -0.32), p.y, p.z, hc); s.scale.set(1, 1.3, 0.72); out.push(s); }
    const end = c.getPointAt(1); out.push(sphereAt(0.62, end.x, end.y - 1.0, end.z, '#C91A09'), at(mesh(new THREE.ConeGeometry(0.75, 1.9, 16), plastic(hc, { roughness: 0.4 })), end.x, end.y - 2.4, end.z, PI));   // a tie and a tuft
    return out; } },
  { id: 'halfup', name: 'Half up, half down', build: (hc) => [capMesh({ line: lineFn([[0, 37.1], [0.5, 36.8], [0.95, 35.3], [1.25, 24.0], [1.6, 23.2], [PI, 22.4]]), flare: 0.42, lean: 0.3, vol: locks(14, 0.1) }, hc),
    sphereAt(1.95, 0, 40.0, -3.9, hc, 0.85), mesh(new THREE.TorusGeometry(1.5, 0.45, 10, 24), plastic(hc, { roughness: 0.4 })).translateY(39.2).translateZ(-3.6).rotateX(-0.9)] },   // the top drawn back into a small knot
  { id: 'curlsbangs', name: 'Long curls with bangs', build: (hc) => [capMesh({ line: lineFn([[0, 36.1], [0.75, 35.9], [1.1, 31.5], [1.35, 25.0], [PI, 24.0]]), R: 6.1, top: 41.9, flare: 0.5, lean: 0.3, vol: curls(0.65) }, hc)] },
  { id: 'ponytail', name: 'Ponytail', build: (hc) => [capMesh({ line: lineFn(HL.high), vol: locks(12, 0.1) }, hc), sphereAt(1.5, 0, 38.4, -5.2, hc), tail(hc, V3(0, 38.2, -5.6), V3(0, -1, -0.3), 11, 1.8, 1.1)] },
  { id: 'bun', name: 'Top bun', build: (hc) => [capMesh({ line: lineFn(HL.short), vol: locks(12, 0.1) }, hc), sphereAt(2.7, 0, 41.2, -2.6, hc, 0.9)] },
  { id: 'braid', name: 'Long braid', build: (hc) => { const out = [capMesh({ line: lineFn(HL.short), vol: locks(12, 0.1) }, hc)];
    for (let k = 0; k < 7; k++) out.push(sphereAt(1.75 - k * 0.1, (k % 2 ? 0.45 : -0.45), 31.2 - k * 2.2, -6.2 - k * 0.3, hc, 1.25)); return out; } },
  { id: 'pigtails', name: 'Pigtails', build: (hc) => {                // a center part, the hair drawn back, two tails tied behind the ears
    const out = [capMesh({ line: lineFn([[0, 36.3], [0.7, 35.9], [1.15, 34.0], [1.55, 31.4], [PI, 30.2]]), vol: (a, y) => -0.35 * Math.exp(-(wrap(a) ** 2) / 0.003) * smooth((y - 36.5) / 2) + 0.1 * Math.max(0, Math.sin(a * 12 + y * 0.4)) }, hc)];
    [-1, 1].forEach((sd) => { out.push(sphereAt(0.95, sd * 5.75, 34.0, -2.2, '#C91A09'));     // the ties
      out.push(tail(hc, V3(sd * 5.9, 33.6, -2.4), V3(sd * 0.32, -1, -0.08), 8.2, 1.55, 0.85)); }); return out; } },   // hanging down, not out
  { id: 'mohawk', name: 'Mohawk', build: (hc) => {                   // a crest from brow to nape, spiked along its top
    const sh = new THREE.Shape(), n = 9, a0 = 0.55, a1 = PI + 0.45;
    for (let i = 0; i <= n * 2; i++) { const t = a0 + (a1 - a0) * i / (n * 2), r = i % 2 ? 8.4 : 7.2; sh[i ? 'lineTo' : 'moveTo'](Math.cos(t) * r, Math.sin(t) * r); }
    for (let i = 24; i >= 0; i--) { const t = a0 + (a1 - a0) * i / 24; sh.lineTo(Math.cos(t) * 4.95, Math.sin(t) * 4.95); }
    const g = new THREE.ExtrudeGeometry(sh, { depth: 2.2, bevelEnabled: true, bevelSize: 0.35, bevelThickness: 0.35, bevelSegments: 2 });
    g.translate(0, 0, -1.1); g.rotateY(-PI / 2);                    // the crest's plane: y up, z along the head
    const m = hairMesh(g, hc); m.position.set(0, 34.4, 0); return [m]; } },
  { id: 'bald', name: 'No hair', build: () => [] },
  // ---- for fun (the owner's list)
];

// ---- hats: their own wheel, worn over any hair (the owner's wish). `cut` is where the hat meets the head: under it the
// hair starts there, and anything of the hair's that would sit above it (a bun) is left off.
export const HATS = [
  { id: 'none', name: 'No hat', build: () => [] },
  { id: 'fedora', name: 'Fedora', cut: 37.9, build: (hc) => {          // a pinched crown with a dent along the top, a ribbon, a snap brim down at the front
    const felt = { roughness: 0.55 }, crownG = new THREE.LatheGeometry([[5.95, 0], [6.15, 1.2], [6.0, 3.0], [5.3, 4.4], [3.6, 5.1], [1.6, 4.5], [0, 4.1]].map(([r, y]) => new THREE.Vector2(r, y)), 48);
    const cp = crownG.attributes.position; for (let i = 0; i < cp.count; i++) { const y = cp.getY(i), z = cp.getZ(i); if (z > 0) cp.setX(i, cp.getX(i) * (1 - 0.14 * Math.min(1, y / 4.4) * (z / 6.2))); }   // pinched at the front
    crownG.computeVertexNormals(); const crownM = mesh(crownG, plastic('#5b5d58', felt)); crownM.position.y = 37.3;
    const brimG = new THREE.LatheGeometry([[5.9, 0], [9.2, -0.1], [9.7, 0.25], [9.3, 0.45], [5.9, 0.5]].map(([r, y]) => new THREE.Vector2(r, y)), 48), bp = brimG.attributes.position;
    for (let i = 0; i < bp.count; i++) { const z = bp.getZ(i), x0 = bp.getX(i), r = Math.hypot(x0, z), f = Math.max(0, r - 6) / 3.7; bp.setY(i, bp.getY(i) + f * (z < 0 ? 1.0 * (-z / r) : -0.7 * (z / r))); }   // up behind, down in front
    brimG.computeVertexNormals(); const brimM = mesh(brimG, plastic('#5b5d58', felt)); brimM.position.y = 37.2;
    return [crownM, brimM, lathe([[6.05, 37.5], [6.2, 37.5], [6.3, 38.8], [6.12, 38.8]], '#1b1b1b')]; } },
  { id: 'coppola', name: 'Flat cap', cut: 37.9, build: (hc) => { const capm = mesh(new THREE.SphereGeometry(6.0, 32, 16, 0, PI * 2, 0, PI / 2), plastic(C.darkTan)); capm.scale.set(1.05, 0.58, 1.12); capm.position.set(0, 37.4, 0.4);
    const peak = mesh(block(rect(10, 0.7, -5, 0), 3.4, 0.3), plastic(C.darkTan)); peak.position.set(0, 37.1, 6.6); peak.rotation.x = 0.2; return [capm, peak]; } },
  { id: 'cap', name: 'Baseball cap', cut: 37.6, build: (hc) => { const dome = mesh(new THREE.SphereGeometry(5.9, 32, 16, 0, PI * 2, 0, PI / 2), plastic(C.red)); dome.scale.y = 0.85; dome.position.y = 37.0;
    const visor = mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.6, 24, 1, false, -PI / 2, PI), plastic(C.red)); visor.scale.set(1, 1, 1.3); visor.position.set(0, 37.1, 4.6); visor.rotation.x = 0.08;
    return [dome, visor, sphereAt(0.8, 0, 42.0, 0, C.red)]; } },
  { id: 'beanie', name: 'Beanie', cut: 37.4, build: (hc) => { const dome = mesh(new THREE.SphereGeometry(5.95, 32, 16, 0, PI * 2, 0, PI / 2), plastic(C.orange, { roughness: 0.6 })); dome.scale.y = 1.15; dome.position.y = 37.2;
    return [dome, lathe([[6.15, 36.4], [6.35, 36.9], [6.35, 38.6], [6.05, 38.9]], C.orange, { roughness: 0.6 }), sphereAt(1.7, 0, 44.4, 0, C.orange)]; } },
  { id: 'boater', name: 'Gondolier hat', cut: 38.0, build: (hc) => [lathe([[5.9, 37.3], [5.9, 41.2], [0, 41.2]], C.tan, { roughness: 0.55 }), brim(5.8, 9.8, 37.2, C.tan, 0.5), lathe([[6.0, 37.8], [6.0, 39.2]], C.red)] },
  { id: 'veil', name: 'Bridal veil', build: () => {                    // a pearl tiara and a white veil falling behind to the shoulders
    const veil = mesh(cap({ line: lineFn([[0, 39.4], [0.95, 38.2], [1.35, 24.0], [PI, 19.5]]), start: (a) => (Math.abs(wrap(a)) < 0.9 ? 39.6 : 42.6), R: 6.55, top: 42.8, thick: 0.4, flare: 0.44, lean: 0.3 }), plastic('#FBF8F1', { roughness: 0.4 }));
    const tiara = lathe([[6.2, 38.9], [6.32, 38.9], [6.32, 39.7], [6.2, 39.7]], '#E8C07A', { metalness: 0.55, roughness: 0.3 });
    const pearls = [-2, -1, 0, 1, 2].map((k) => { const a = k * 0.26; return sphereAt(k ? 0.34 : 0.5, Math.sin(a) * 6.4, 40.0 + (k ? 0 : 0.4), Math.cos(a) * 6.4, '#FBF8F1'); });
    return [veil, tiara, ...pearls]; } },
  { id: 'crown', name: 'Flower crown', build: (hc) => {      // a green band round the head, set with small five-petal flowers
    const out = [];
    const band = mesh(new THREE.TorusGeometry(6.15, 0.42, 8, 48), plastic('#5f8f3a', { roughness: 0.5 })); band.rotation.x = PI / 2; band.position.y = 38.2; band.scale.set(1.04, 1.04, 1); out.push(band);
    const petal = new THREE.Shape(); for (let k = 0; k < 5; k++) { const a = k * 2 * PI / 5; petal.absarc(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0.55, 0, 2 * PI, false); }
    const cols = [C.pink, C.white, '#F2CD37', C.lavender, '#E0316A'];
    for (let k = 0; k < 11; k++) { const a = -PI * 0.78 + k * (PI * 1.56 / 10), r = 6.45;   // across the front and sides
      const fl = new THREE.Group(), pg = new THREE.ExtrudeGeometry(petal, { depth: 0.35, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1, bevelSegments: 1 });
      fl.add(mesh(pg, plastic(cols[k % 5], { roughness: 0.45 })), sphereAt(0.38, 0, 0, 0.45, '#F2CD37'));
      fl.position.set(Math.sin(a) * r, 38.1 + 0.25 * Math.sin(k * 1.7), Math.cos(a) * r); fl.lookAt(Math.sin(a) * 20, 38.1, Math.cos(a) * 20); out.push(fl); }
    return out; } },
  { id: 'chef', name: "Chef's hat", cut: 37.0, build: () => [lathe([[5.6, 36.0], [5.7, 39.4], [6.9, 40.4], [7.6, 42.6], [7.1, 44.6], [4.8, 45.8], [0, 46.0]], C.white, { roughness: 0.5 })] },
  { id: 'helmet', name: 'Vespa helmet', cut: 37.0, build: () => { const d = mesh(new THREE.SphereGeometry(6.6, 32, 18, 0, PI * 2, 0, PI * 0.56), plastic('#9ED3C6')); d.position.y = 36.4;   // its rim above the brows
    return [d, lathe([[6.3, 35.6], [6.75, 35.6], [6.75, 36.3], [6.3, 36.3]], C.white), sphereAt(0.9, 0, 42.6, 0.6, C.white)]; } },
  { id: 'tophat', name: 'Top hat', cut: 38.0, build: (hc) => [lathe([[5.7, 37.2], [5.9, 45.2], [0, 45.2]], C.black), brim(5.6, 8.6, 37.0, C.black, 0.6), lathe([[5.8, 37.7], [5.85, 39.0]], C.darkRed)] },
  { id: 'beret', name: 'Beret', cut: 39.6, build: (hc) => { const b = mesh(new THREE.SphereGeometry(7.0, 32, 12), plastic(C.darkRed, { roughness: 0.6 })); b.scale.set(1, 0.3, 1); b.position.set(-0.8, 39.4, 0); b.rotation.z = 0.18;
    return [b, sphereAt(0.7, -1.2, 41.6, 0, C.darkRed)]; } },
  { id: 'sunhat', name: 'Sun hat', cut: 37.8, build: (hc) => [lathe([[5.9, 37.4], [5.9, 40.4], [4.6, 41.8], [0, 42.0]], C.lightNougat, { roughness: 0.6 }), lathe([[5.8, 37.2], [11.8, 36.0], [11.8, 36.5], [5.8, 37.8]], C.lightNougat, { roughness: 0.6 }), lathe([[6.0, 37.7], [6.0, 39.0]], C.darkPink)] },
  { id: 'party', name: 'Party hat', build: (hc) => {         // sitting on top of the hair, a little tipped, with stripes and a pompom
    const tex = printTex('partyhat', 128, 128, (x) => { x.fillStyle = '#E0316A'; x.fillRect(0, 0, 128, 128); x.fillStyle = '#F2CD37'; for (let k = -128; k < 256; k += 32) { x.beginPath(); x.moveTo(k, 128); x.lineTo(k + 16, 128); x.lineTo(k + 144, 0); x.lineTo(k + 128, 0); x.fill(); } });
    const cone = mesh(new THREE.ConeGeometry(3.6, 8.2, 32), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 })); const g = new THREE.Group(); cone.position.y = 4.1; g.add(cone, sphereAt(1.1, 0, 8.4, 0, '#F2CD37'));
    g.position.set(0.5, 40.3, 0); g.rotation.z = -0.14; return [g]; } },
  { id: 'pirate', name: 'Pirate hat', cut: 38.4, build: (hc) => {        // the captain's bicorne: a tall front and back half-moon, points out to the sides, skull on the front
    const half = () => { const sh = new THREE.Shape(); sh.moveTo(-10.8, 0.9); sh.quadraticCurveTo(-7.6, 1.6, -5.4, 4.2); sh.quadraticCurveTo(0, 8.8, 5.4, 4.2); sh.quadraticCurveTo(7.6, 1.6, 10.8, 0.9);
      sh.quadraticCurveTo(6, -0.4, 0, -0.4); sh.quadraticCurveTo(-6, -0.4, -10.8, 0.9);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 1.2, bevelEnabled: true, bevelSize: 0.3, bevelThickness: 0.3, bevelSegments: 2, curveSegments: 24 }), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) - 0.045 * p.getX(i) ** 2);   // curved round the head
      g.computeVertexNormals(); return g; };
    const bl = plastic('#1b1b1b', { roughness: 0.45 }), front = mesh(half(), bl), back = mesh(half(), bl);
    front.position.set(0, 37.9, 4.6); back.position.set(0, 37.9, -4.6); back.rotation.y = PI;
    const trim = new THREE.CatmullRomCurve3([[-10.6, 1.3], [-7.4, 2.1], [-5.3, 4.5], [0, 8.9], [5.3, 4.5], [7.4, 2.1], [10.6, 1.3]].map(([x, y]) => V3(x, y + 37.9, 6.2 - 0.045 * x * x)));
    const gold = mesh(new THREE.TubeGeometry(trim, 48, 0.28, 6, false), plastic('#E8C07A', { metalness: 0.5, roughness: 0.3 }));
    const skull = mesh(new THREE.PlaneGeometry(4.2, 4.2), new THREE.MeshStandardMaterial({ map: printTex('skull', 64, 64, (x) => { x.fillStyle = '#f4f4f2'; x.beginPath(); x.arc(32, 24, 14, 0, 7); x.fill(); x.fillRect(23, 32, 18, 10);
      x.strokeStyle = '#f4f4f2'; x.lineWidth = 6; x.beginPath(); x.moveTo(8, 44); x.lineTo(56, 60); x.moveTo(56, 44); x.lineTo(8, 60); x.stroke(); x.fillStyle = '#1b1b1b'; x.beginPath(); x.arc(26, 24, 4.5, 0, 7); x.arc(38, 24, 4.5, 0, 7); x.fill(); }), transparent: true, roughness: 0.5 }));
    skull.position.set(0, 41.9, 6.25);
    return [lathe([[5.95, 37.9], [6.0, 40.6], [4.6, 42.4], [0, 42.8]], '#1b1b1b'), front, back, gold, skull]; } },
  { id: 'viking', name: 'Viking helmet', cut: 37.4, build: (hc) => {
    const steel = { metalness: 0.6, roughness: 0.35 }, dome = mesh(new THREE.SphereGeometry(6.2, 32, 16, 0, PI * 2, 0, PI / 2), plastic('#8f969b', steel)); dome.scale.y = 1.05; dome.position.y = 36.6;
    const band = lathe([[6.25, 36.0], [6.45, 36.3], [6.45, 37.4], [6.25, 37.6]], '#6b5130', { metalness: 0.4, roughness: 0.4 });
    const nose = mesh(block(rect(1.2, 4.2, -0.6, -4.2), 0.8, 0.2), plastic('#8f969b', steel)); nose.position.set(0, 37.4, 6.2);
    const horns = [-1, 1].map((sd) => { const c = new THREE.CatmullRomCurve3([V3(sd * 5.2, 39.2, 0), V3(sd * 8.2, 40.4, 0.3), V3(sd * 9.8, 43.4, 0.4), V3(sd * 9.6, 46.6, 0.2)]);
      const pts = c.getPoints(24), geo = new THREE.TubeGeometry(c, 24, 1, 12, false), pos = geo.attributes.position;   // tapering to a point
      for (let i = 0; i < pos.count; i++) { const t = Math.floor(i / 13) / 24, cp = pts[Math.min(24, Math.floor(i / 13))], k = 1.6 * (1 - t) + 0.15; pos.setXYZ(i, cp.x + (pos.getX(i) - cp.x) * k, cp.y + (pos.getY(i) - cp.y) * k, cp.z + (pos.getZ(i) - cp.z) * k); }
      geo.computeVertexNormals(); return mesh(geo, plastic('#EFE6CF', { roughness: 0.5 })); });
    return [dome, band, nose, ...horns]; } },
  { id: 'aviator', name: 'Aviator helmet', cut: 37.0, build: () => {   // a leather flying helmet with ear flaps, goggles pushed up on the front
    const leather = plastic('#6b3f1f', { roughness: 0.55 }), capm = mesh(cap({ line: lineFn([[0, 36.8], [0.9, 36.0], [1.25, 30.0], [1.7, 30.0], [PI, 30.6]]), R: 6.35, top: 41.9, thick: 0.6 }), leather);
    const strap = lathe([[6.3, 38.0], [6.42, 38.0], [6.42, 38.9], [6.3, 38.9]], '#3b2412');
    const goggles = [-1, 1].map((sd) => { const g2 = mesh(new THREE.TorusGeometry(1.55, 0.5, 10, 24), plastic('#B8862B', { metalness: 0.6, roughness: 0.3 })); g2.position.set(sd * 2.05, 38.5, 6.75); g2.rotation.x = -0.3; return g2; });
    const lens = [-1, 1].map((sd) => { const l = mesh(new THREE.CircleGeometry(1.25, 20), plastic('#9fd0e6', { roughness: 0.1, metalness: 0.2 })); l.position.set(sd * 2.05, 38.5, 6.8); l.rotation.x = -0.3; return l; });
    return [capm, strap, ...goggles, ...lens]; } },
  { id: 'fire', name: 'Firefighter helmet', cut: 37.6, build: (hc) => {
    const red = plastic('#C91A09', { roughness: 0.3 }), dome = mesh(new THREE.SphereGeometry(6.2, 32, 16, 0, PI * 2, 0, PI / 2), red); dome.scale.set(1, 1.1, 1.05); dome.position.y = 37.0;
    const crest = mesh(new THREE.TorusGeometry(6.3, 0.75, 10, 32, PI), red); crest.rotation.y = PI / 2; crest.scale.set(1, 1.1, 1.05); crest.position.y = 37.0;   // a ridge from brow to nape
    const brimG = new THREE.LatheGeometry([[5.9, 0], [8.2, -0.2], [8.4, 0.4], [5.9, 0.6]].map(([r, y]) => new THREE.Vector2(r, y)), 40); brimG.scale(1, 1, 1.35); brimG.translate(0, 0, -2.0);
    const brimM = mesh(brimG, red); brimM.position.y = 36.6; brimM.rotation.x = 0.12;          // longer at the back, as a fire helmet's is
    const badge = mesh(new THREE.PlaneGeometry(3.2, 3.6), new THREE.MeshStandardMaterial({ map: printTex('firebadge', 64, 72, (x) => { x.fillStyle = '#E8C07A'; x.beginPath(); x.moveTo(32, 2); x.lineTo(62, 18); x.lineTo(54, 58); x.lineTo(32, 70); x.lineTo(10, 58); x.lineTo(2, 18); x.closePath(); x.fill();
      x.fillStyle = '#C91A09'; x.font = '700 30px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('24', 32, 38); }), transparent: true, metalness: 0.4, roughness: 0.35 }));
    badge.position.set(0, 40.0, 6.3); badge.rotation.x = -0.25;
    return [dome, crest, brimM, badge]; } },
  { id: 'cowboy', name: 'Cowboy hat', cut: 38.0, build: (hc) => {
    const felt = { roughness: 0.6 }, crown = lathe([[5.7, 37.2], [5.9, 40.4], [5.2, 42.4], [3.2, 42.2], [1.2, 41.2], [0, 41.4]], '#8a5a2b', felt);
    const brimG = new THREE.LatheGeometry([[5.6, 0], [9.6, 0.1], [10.6, 1.0], [10.4, 1.5], [9.4, 0.7], [5.6, 0.6]].map(([r, y]) => new THREE.Vector2(r, y)), 48);
    const pos = brimG.attributes.position; for (let i = 0; i < pos.count; i++) { const x0 = pos.getX(i), z0 = pos.getZ(i), r = Math.hypot(x0, z0), side = Math.abs(x0) / Math.max(r, 1e-6); pos.setY(i, pos.getY(i) + side * side * Math.max(0, r - 7) * 0.55); }   // curled up at the sides
    brimG.computeVertexNormals(); const brimM = mesh(brimG, plastic('#8a5a2b', felt)); brimM.position.y = 36.8;
    return [crown, brimM, lathe([[5.8, 37.4], [5.95, 38.6]], '#3b2412')]; } },
  // ---- the owner's second list: a mask over the whole head hides the hair (`hidesHair`)
  { id: 'batman', name: 'Batman cowl', hidesHair: true, build: () => {  // over the head down to the jaw, the mouth and chin bare, white eyes, pointed ears
    const blk = { roughness: 0.35 }, cowl = mesh(cap({ line: lineFn([[0, 33.1], [0.35, 32.8], [0.8, 31.0], [1.1, 29.6], [1.5, 29.0], [PI, 28.6]]), R: 5.4, top: 40.7, thick: 0.5 }), plastic('#1b1b1b', blk));
    const eyes = [-1, 1].map((sd) => { const e = mesh(new THREE.CircleGeometry(0.7, 24), plastic(C.white, { roughness: 0.3 })), a = sd * 0.45;
      e.scale.set(1.35, 0.62, 1); e.position.set(Math.sin(a) * 5.42, 34.1, Math.cos(a) * 5.42); e.rotation.set(0, a, sd * 0.28, 'YXZ'); return e; });   // slanted in, as the cowl's are
    const ears = [-1, 1].map((sd) => { const e = mesh(new THREE.ConeGeometry(0.95, 3.6, 16), plastic('#1b1b1b', blk)); e.scale.z = 0.5; e.position.set(sd * 2.9, 41.1, 0.3); e.rotation.z = -sd * 0.12; return e; });
    return [cowl, ...eyes, ...ears]; } },
  { id: 'mouseears', name: 'Disney ears', cut: 37.2, build: () => {    // the Mickey Mouse ear hat: a black cap and two big round ears
    const blk = plastic('#1b1b1b', { roughness: 0.5 }), dome = mesh(new THREE.SphereGeometry(5.95, 32, 16, 0, PI * 2, 0, PI / 2), blk); dome.scale.y = 0.95; dome.position.y = 36.9;
    const ears = [-1, 1].map((sd) => at(mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.75, 40), blk), sd * 4.5, 42.0, -0.6, PI / 2));
    return [dome, lathe([[6.0, 36.5], [6.12, 36.7], [6.12, 37.5], [5.98, 37.7]], '#1b1b1b', { roughness: 0.5 }), ...ears]; } },
  { id: 'facehugger', name: 'Facehugger', build: (p = {}) => {          // clamped over the face: a pale body with two air sacs, eight long knuckled fingers
    const skin = '#D6C49C', out = [], hair = p.hair || '';               // gripping round the head (outside whatever hair is under them), its tail round the neck
    const [R, Rh, Th] = hair === 'bald' ? [5.25] : hair === 'buzz' ? [5.6, 5.3, 40.4] : /curl/.test(hair) ? [6.7, 6.6, 42.0] : [6.1, 5.95, 41.4];   // the fingers' reach, and
    const reach = (y) => (Rh && y > 36.4 ? R - Rh + Rh * Math.sqrt(Math.max(0.2, 1 - ((y - 36.4) / (Th - 36.4)) ** 2)) + 0.3 * smooth((y - 36.4) / 1.5) : R);   // over the
    // crown the hair's own curve followed, clear of it (under a steady reach the top pair sank into the hair)
    const body = sphereAt(3.1, 0, 33.4, 4.3, skin); body.scale.set(1, 1.08, 0.72); out.push(body);
    [-1, 1].forEach((sd) => { const sac = sphereAt(1.0, sd * 0.85, 35.2, 5.5, skin); sac.scale.set(0.8, 1.75, 0.45); out.push(sac); });
    [-1, 1].forEach((sd) => [[36.3, 2.4], [35.0, 0.9], [33.4, -0.8], [31.8, -2.0]].forEach(([y0, rise]) => {   // fanned: the top pair up over the crown, the lowest down
      const wy = 3.1 * Math.sqrt(Math.max(0, 1 - ((y0 - 33.4) / 3.35) ** 2)), a0 = Math.asin(Math.min(0.95, wy * 0.9 / 5.3));   // toward the jaw; bent at two knuckles
      const pts = [[a0, 5.3, 0], [0.95, R + 0.2, 0.35], [1.35, R, 0.6], [1.75, R + 0.2, 0.8], [2.2, R - 0.15, 0.95], [2.5, R - 1.1, 1.0]].map(([a, r, t], i) => { a = Math.max(a, a0);
        const y = y0 + rise * t, rr = Rh ? (i ? reach(y) + r - R : r) : Math.min(r, y > 36 ? r * Math.sqrt(Math.max(0.35, 1 - ((y - 36) / 6) ** 2)) : r); return V3(sd * Math.sin(a) * rr, y, Math.cos(a) * rr); });
      out.push(strand(skin, pts, 0.38, 0.2, 1)); [1, 3].forEach((i) => out.push(sphereAt(0.46, pts[i].x, pts[i].y, pts[i].z, skin))); }));
    out.push(strand(skin, [V3(0, 30.4, 4.6), V3(1.0, 29.3, 4.5), V3(2.7, 28.75, 3.2), V3(3.6, 28.7, 0.8), V3(3.3, 28.7, -1.8), V3(1.4, 28.7, -3.4), V3(-1.2, 28.75, -3.4), V3(-3.0, 28.8, -2.0), V3(-3.6, 28.9, 0.5)], 0.62, 0.3, 1));
    return out; } },
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
function leaf(x, cx, cy, len, w, rot, col, rib) {                       // a pointed leaf with a paler midrib
  x.save(); x.translate(cx, cy); x.rotate(rot); x.fillStyle = col; x.beginPath(); x.moveTo(-len / 2, 0); x.quadraticCurveTo(0, -w, len / 2, 0); x.quadraticCurveTo(0, w, -len / 2, 0); x.fill();
  x.strokeStyle = rib; x.lineWidth = 1.5; x.beginPath(); x.moveTo(-len / 2 + 2, 0); x.lineTo(len / 2 - 3, 0); x.stroke(); x.restore(); }
function hibiscus(x, cx, cy, r, col, rot) {                               // five broad petals, a dark heart, a stamen
  x.save(); x.translate(cx, cy); x.rotate(rot); x.fillStyle = col;
  for (let k = 0; k < 5; k++) { const a = k * 2 * PI / 5; x.beginPath(); x.ellipse(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.55, r * 0.42, a, 0, 7); x.fill(); }
  x.fillStyle = '#8B1A1A'; x.beginPath(); x.arc(0, 0, r * 0.26, 0, 7); x.fill();
  x.strokeStyle = '#F2CD37'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 0); x.lineTo(r * 0.55, -r * 0.35); x.stroke(); x.fillStyle = '#F2CD37'; x.beginPath(); x.arc(r * 0.6, -r * 0.38, 2.2, 0, 7); x.fill(); x.restore(); }
function lemon(x, cx, cy, rot) {                                           // a lemon, pointed at both ends, with a glint
  x.save(); x.translate(cx, cy); x.rotate(rot); x.fillStyle = '#F5D02A'; x.strokeStyle = '#D9A90F'; x.lineWidth = 1.5;
  x.beginPath(); x.moveTo(-15, 0); x.quadraticCurveTo(-13, -10, 0, -10); x.quadraticCurveTo(13, -10, 15, 0); x.quadraticCurveTo(13, 10, 0, 10); x.quadraticCurveTo(-13, 10, -15, 0); x.fill(); x.stroke();
  x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(-3, -4.5, 5, 2, -0.2, 0, 7); x.fill(); x.restore(); }
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
  { id: 'hawaiian', name: 'Hawaiian shirt', col: '#35A0B8', arms: '#35A0B8', draw(x, skin) {   // big hibiscus and leaves all over, an open camp collar, buttons
    [[40, 70, 0.3], [150, 40, 1.2], [215, 95, 2.0], [95, 120, 0.8], [30, 170, 1.9], [175, 165, 0.5], [120, 200, 2.6], [235, 190, 1.4], [70, 25, 2.2], [200, 20, 0.1]].forEach(([lx, ly, a]) => {
      leaf(x, lx, ly, 42, 14, a, '#1F6B4A', '#4E9E6E'); leaf(x, lx + 12, ly + 8, 32, 11, a + 1.1, '#2C8A5A', '#6DB88A'); });
    [[62, 92, 22, '#D8342E'], [170, 70, 19, C.white], [116, 160, 23, '#F58E8E'], [220, 140, 19, '#D8342E'], [40, 188, 18, '#F2CD37'], [192, 198, 18, C.white], [96, 44, 15, '#F2CD37']]
      .forEach(([fx, fy, r, c], i) => hibiscus(x, fx, fy, r, c, i * 0.9));
    vneck(x, skin, 50, 26);
    x.fillStyle = '#2E8FA6'; x.strokeStyle = '#1e6d80'; x.lineWidth = 2.5; [-1, 1].forEach((s) => { x.beginPath(); x.moveTo(128 + s * 26, 0); x.lineTo(128 + s * 50, 0);   // the lapels
      x.lineTo(128 + s * 30, 44); x.lineTo(128 + s * 6, 60); x.lineTo(128, 50); x.closePath(); x.fill(); x.stroke(); });
    lines(x, '#1e6d80', 2.5, [[128, 56], [128, 205]]); x.fillStyle = '#F4F4F2'; [96, 138, 180].forEach((by) => { x.beginPath(); x.arc(134, by, 4, 0, 7); x.fill(); }); } },
  { id: 'lemons', name: 'Lemon shirt', col: C.white, arms: C.white, draw(x, skin) {   // an Amalfi lemon print: lemons among leaves, in even staggered rows
    [58, 104, 150, 196].forEach((ly, row) => [0, 1, 2, 3, 4].forEach((k) => { const lx = 4 + k * 62 + (row % 2) * 31, a = (row * 5 + k * 3) % 7 * 0.35 - 1.0;
      leaf(x, lx - 12, ly - 9, 20, 7, a - 0.9, '#2E7D32', '#6DAA5E'); leaf(x, lx + 12, ly - 8, 18, 6, a + 0.7, '#3B8F3E', '#7DBB6C'); lemon(x, lx, ly, a); }));
    vneck(x, skin, 44, 26); } },
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
  // ---- ours: the monogram
  { id: 'monogram', name: 'KA monogram tee', col: '#7A1A3C', arms: '#7A1A3C', draw(x, skin) { neck(x, skin, 22, 30);
    const im = pic(MONOGRAM); if (!ready(x, im)) return; const k = 118 / Math.max(im.naturalWidth, im.naturalHeight);
    x.drawImage(tinted(im, '#E8C07A'), 128 - im.naturalWidth * k / 2, 104 - im.naturalHeight * k / 2, im.naturalWidth * k, im.naturalHeight * k); } },
  // ---- tourists
  { id: 'touristcam', name: 'Tourist with camera', col: '#E0533D', arms: '#E0533D', draw(x, skin) { vneck(x, skin, 46, 28);
    [[50, 70], [110, 150], [196, 96], [70, 176], [178, 170], [30, 118], [150, 60], [214, 150]].forEach(([fx, fy], i) => flower(x, fx, fy, 9, i % 2 ? '#FFD84A' : C.white, '#2E7D9A'));
    lines(x, '#2a2320', 7, [[92, 0], [128, 92], [164, 0]]);           // the strap
    x.fillStyle = '#2a2320'; x.fillRect(92, 88, 72, 44); x.fillStyle = '#9aa3a8'; x.fillRect(100, 82, 20, 8);
    x.fillStyle = '#555'; x.beginPath(); x.arc(136, 110, 17, 0, 7); x.fill(); x.fillStyle = '#6fa3c7'; x.beginPath(); x.arc(136, 110, 10, 0, 7); x.fill();
    x.fillStyle = 'rgba(255,255,255,.6)'; x.beginPath(); x.arc(132, 106, 3.5, 0, 7); x.fill(); } },
  { id: 'italia', name: 'I \u2665 Italia tee', col: C.white, arms: C.white, draw(x, skin) { neck(x, skin, 22, 30);
    word(x, 'I', '#1f8a4c', 40, 66); word(x, '\u2665', '#cd212a', 46, 102); word(x, 'ITALIA', '#1f8a4c', 34, 146);
    [['#1f8a4c', 86], ['#f4f4f2', 118], ['#cd212a', 150]].forEach(([c, xx]) => { x.fillStyle = c; x.fillRect(xx, 170, 22, 10); }); x.strokeStyle = '#ccc'; x.lineWidth = 1; x.strokeRect(86, 170, 86, 10); } },
  { id: 'pisa', name: 'Leaning Tower tee', col: '#8FC1E3', arms: '#8FC1E3', draw(x, skin) { neck(x, skin, 22, 30);
    x.save(); x.translate(128, 170); x.rotate(0.14);                  // the tower, leaning
    x.strokeStyle = '#3d6f96'; x.lineWidth = 3;
    for (let k = 0; k < 7; k++) { x.fillStyle = '#fbf8ef'; x.fillRect(-22, -18 - k * 17, 44, 15); x.strokeRect(-22, -18 - k * 17, 44, 15); x.fillStyle = '#8a8270'; for (let c = -16; c <= 16; c += 8) x.fillRect(c - 1.5, -15 - k * 17, 3, 9); }
    x.fillStyle = '#fbf8ef'; x.fillRect(-14, -142, 28, 16); x.strokeRect(-14, -142, 28, 16); x.restore(); word(x, 'PISA', '#1d4e7a', 26, 190); } },
  { id: 'colosseum', name: 'Colosseum tee', col: '#E8D9B0', arms: '#E8D9B0', draw(x, skin) { neck(x, skin, 22, 30);
    x.fillStyle = '#b9895a'; x.beginPath(); x.moveTo(40, 150); x.lineTo(40, 76); x.quadraticCurveTo(128, 56, 216, 76); x.lineTo(216, 150); x.closePath(); x.fill();
    x.fillStyle = '#6b4a2e'; for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) { const ax = 50 + c * 21, ay = 90 + r * 22; x.beginPath(); x.moveTo(ax, ay + 16); x.lineTo(ax, ay + 6); x.arc(ax + 6, ay + 6, 6, PI, 0); x.lineTo(ax + 12, ay + 16); x.closePath(); x.fill(); }
    word(x, 'ROMA', '#7A1A3C', 30, 176); } },
  { id: 'fannypack', name: 'Polo & fanny pack', col: '#2E7D9A', arms: '#2E7D9A', draw(x, skin) {
    x.fillStyle = C.white; x.beginPath(); x.moveTo(96, 0); x.lineTo(118, 30); x.lineTo(128, 12); x.lineTo(138, 30); x.lineTo(160, 0); x.closePath(); x.fill();   // the collar
    lines(x, '#1f5f76', 3, [[128, 14], [128, 70]]); [34, 52].forEach((yy) => { x.fillStyle = C.white; x.beginPath(); x.arc(128, yy, 3.5, 0, 7); x.fill(); });
    lines(x, '#222', 6, [[20, 168], [236, 168]]); x.fillStyle = '#E0533D'; x.beginPath(); x.moveTo(84, 158); x.lineTo(172, 158); x.quadraticCurveTo(176, 196, 128, 198); x.quadraticCurveTo(80, 196, 84, 158); x.fill();
    lines(x, '#9a3a2c', 3, [[90, 172], [166, 172]]); x.fillStyle = '#ccc'; x.fillRect(122, 164, 12, 5); } },
  { id: 'travelvest', name: 'Travel vest & passport', col: '#F4F4F2', arms: '#F4F4F2', draw(x, skin) { vneck(x, skin, 40, 22);
    x.fillStyle = '#B7A57A'; x.beginPath(); x.moveTo(tx(-6.2), 0); x.lineTo(98, 0); x.lineTo(122, 90); x.lineTo(122, 205); x.lineTo(tx(-7.8), 205); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(tx(6.2), 0); x.lineTo(158, 0); x.lineTo(134, 90); x.lineTo(134, 205); x.lineTo(tx(7.8), 205); x.closePath(); x.fill();
    x.strokeStyle = '#8f7f55'; x.lineWidth = 3; [[40, 110], [160, 110], [40, 158], [160, 158]].forEach(([px, py]) => x.strokeRect(px, py, 50, 36));
    lines(x, '#cd212a', 4, [[104, 10], [128, 70], [152, 10]]); x.fillStyle = '#7A1A3C'; x.fillRect(114, 66, 28, 36); x.fillStyle = '#E8C07A'; x.fillRect(120, 76, 16, 3); x.fillRect(120, 84, 16, 2); } },
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
  { id: 'gownskirt', name: 'Wedding gown skirt', col: C.white, skirt: 'gown' }, { id: 'pinkskirt', name: 'Dusty pink skirt', col: C.dustyPink, skirt: 'long' },
  { id: 'blackskirt', name: 'Black gown skirt', col: C.black, skirt: 'gown' }, { id: 'sunskirt', name: 'Yellow skirt', col: '#F7D55E', skirt: 'short' },
  { id: 'navyskirt', name: 'Navy skirt', col: C.darkBlue, skirt: 'short' },
];

// ================================================================ things to hold
// each is built with its grip at the origin, standing upright (the hand's hole is vertical), the front toward +z
function cyl(rt, rb, h, col, extra, seg = 20) { return mesh(new THREE.CylinderGeometry(rt, rb, h, seg), plastic(col, extra)); }
function at(m, x, y, z, rx = 0, ry = 0, rz = 0) { m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; }
const grip = (h, col) => at(cyl(0.85, 0.85, h, col), 0, 0, 0);
export const ACCS = [
  { id: 'none', name: 'Empty hands', build: () => [] },
  { id: 'bouquet', name: 'Bouquet', build: () => {                       // a cream paper cone tied with a ribbon, a dome of roses and leaves
    const out = [lathe([[0, -2.6], [0.95, -2.6], [1.0, -0.4], [3.1, 5.0], [3.3, 5.3], [0, 5.3]], '#F3ECDD', { roughness: 0.55 }), lathe([[1.28, 0.2], [1.5, 0.2], [1.62, 1.0], [1.4, 1.0]], '#7A1A3C', { roughness: 0.4 })];
    const cols = ['#F6F1E4', '#E9A6B6', '#F6F1E4', '#D9788F', '#F6F1E4', '#E9A6B6', '#F2D7DC'];
    [[0, 0], [1.9, 0], [-1.9, 0], [0.95, 1.65], [-0.95, 1.65], [0.95, -1.65], [-0.95, -1.65], [2.5, 1.6], [-2.5, 1.6], [2.5, -1.6], [-2.5, -1.6], [0, 3.0], [0, -3.0]].forEach(([x, z], k) => {
      const r = Math.hypot(x, z), y = 6.9 - r * r * 0.13, rose = new THREE.Group();
      rose.add(lathe([[0, -0.6], [1.05, -0.3], [1.15, 0.3], [0.8, 0.75], [0.35, 0.9], [0, 0.7]], cols[k % cols.length], { roughness: 0.5 }), mesh(new THREE.TorusGeometry(0.55, 0.14, 6, 18), plastic(cols[k % cols.length], { roughness: 0.5 })));
      rose.children[1].rotation.x = PI / 2; rose.children[1].position.y = 0.7; rose.position.set(x, y, z); rose.rotation.set(z * 0.12, 0, -x * 0.12); out.push(rose); });
    [[3.2, 5.2, 0.6, 0.5], [-3.2, 5.2, 0.4, -0.5], [0.4, 5.1, 3.2, 0.2], [-0.5, 5.3, -3.1, -0.2]].forEach(([x, y, z, t]) => { const l = sphereAt(0.9, x, y, z, '#3f7a3a'); l.scale.set(1.9, 0.35, 0.9); l.rotation.set(0, Math.atan2(x, z) + PI / 2, t); out.push(l); });
    return out; } },
  { id: 'gelato', name: 'Gelato', build: () => {                         // a waffle cone and two scoops, each with a soft lip where it sits
    const waffle = printTex('waffle', 64, 64, (x) => { x.fillStyle = '#D9A05A'; x.fillRect(0, 0, 64, 64); x.strokeStyle = '#b07a3c'; x.lineWidth = 3; for (let k = -64; k < 128; k += 12) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 64, 64); x.stroke(); x.beginPath(); x.moveTo(k + 64, 0); x.lineTo(k, 64); x.stroke(); } });
    waffle.wrapS = waffle.wrapT = THREE.RepeatWrapping; waffle.repeat.set(3, 2);
    const cone = mesh(new THREE.LatheGeometry([[0, -3.6], [2.25, 3.1], [2.5, 3.4], [2.1, 3.5], [0, 3.5]].map(([r, y]) => new THREE.Vector2(r, y)), 32), new THREE.MeshStandardMaterial({ map: waffle, roughness: 0.7 }));
    const scoop = (col, y, k) => { const m = lathe([[0, 0], [2.35 * k, 0.05], [2.6 * k, 0.4], [2.35 * k, 0.9], [2.2 * k, 1.6], [1.7 * k, 2.35], [0.9 * k, 2.8], [0, 2.95]], col, { roughness: 0.55 }, 36); m.position.y = y; return m; };
    return [cone, scoop('#A8D5A2', 3.3, 1), scoop('#F2B8C6', 5.8, 0.85), sphereAt(0.55, 0.3, 8.6, 0.3, '#C91A09')]; } },
  { id: 'pizza', name: 'Pizza slice', across: true, build: () => {       // a minifigure-sized slice, held up by its crust: the hand turned so the crust lies
    const sl = new THREE.Shape(); sl.moveTo(-2.3, 0); sl.lineTo(2.3, 0); sl.quadraticCurveTo(0.4, 3.6, 0, 7.0); sl.quadraticCurveTo(-0.4, 3.6, -2.3, 0);   // in its grip and
    const cheese = mesh(new THREE.ExtrudeGeometry(sl, { depth: 0.4, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2 }), plastic('#F4C24A', { roughness: 0.45 })); cheese.position.set(0, 0.2, -0.2);   // the slice rises
    const crust = mesh(new THREE.CapsuleGeometry(0.72, 4.0, 6, 16), plastic('#C98A45', { roughness: 0.6 })); crust.rotation.z = PI / 2;          // out of its opening
    const pep = [[-0.9, 1.9], [0.9, 2.3], [0, 4.2], [0.05, 5.8]].map(([x, y]) => { const c = mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.16, 20), plastic('#B83A2C', { roughness: 0.5 })); c.rotation.x = PI / 2; c.position.set(x, y, 0.36); if (y > 5) c.scale.set(0.7, 1, 0.7); return c; });
    const s = new THREE.Group(); s.add(cheese, crust, ...pep); s.rotation.z = 0.15; return [s]; } },   // leaning a little out
  { id: 'wine', name: 'Glass of red', build: () => [lathe([[0, -1.6], [2.0, -1.6], [2.0, -1.3], [0.3, -1.1], [0.3, 2.2], [1.6, 3.2], [2.2, 5.4], [2.1, 7.2]], '#e8f1f3', { transparent: true, opacity: 0.45, roughness: 0.08 }), lathe([[0, 3.0], [1.4, 3.4], [2.0, 5.2], [0, 5.2]], '#7a0f1f', { roughness: 0.15 })] },
  { id: 'prosecco', name: 'Prosecco', build: () => [lathe([[0, -1.6], [1.8, -1.6], [1.8, -1.3], [0.3, -1.1], [0.3, 2.4], [1.0, 3.2], [1.3, 8.6]], '#e8f1f3', { transparent: true, opacity: 0.45, roughness: 0.08 }), lathe([[0, 3.2], [0.9, 3.4], [1.15, 7.4], [0, 7.4]], '#F2D06B', { roughness: 0.15 })] },
  { id: 'camera', name: 'Camera', build: () => {                         // held up by the grip on its underside, the lens to the front
    const body = mesh(block(rect(6.0, 3.9, -3.0, 0), 2.6, 0.45), plastic('#1f1f1f')); body.position.y = 1.9;
    const top = mesh(block(rect(2.2, 1.0, -1.9, 0), 2.0, 0.2), plastic('#1f1f1f')); top.position.y = 5.9;
    const lens = at(cyl(1.35, 1.5, 1.8, '#2b2b2b'), 0.6, 3.8, 2.0, PI / 2), glass = at(mesh(new THREE.CircleGeometry(1.05, 24), plastic('#5c8fb5', { roughness: 0.08, metalness: 0.3 })), 0.6, 3.8, 2.92);
    const flash = at(mesh(new THREE.BoxGeometry(1.1, 0.7, 0.2), plastic('#e8eef2', { roughness: 0.2 })), -2.0, 5.2, 1.35), knob = at(cyl(0.45, 0.45, 0.5, '#8f969b'), 2.2, 6.15, 0);
    return [grip(3.4, '#2b2b2b'), body, top, lens, glass, flash, knob]; } },
  { id: 'brush', name: 'Paintbrush', build: () => [grip(9, C.brown), at(cyl(0.55, 0.85, 1.8, C.gray, { metalness: 0.6, roughness: 0.3 }), 0, 5.4, 0), at(mesh(new THREE.ConeGeometry(0.65, 2.2, 12), plastic(C.blue)), 0, 7.4, 0)] },
  { id: 'sunflower', name: 'Sunflower', build: () => { const out = [at(cyl(0.45, 0.45, 13, C.green), 0, 3.5, 0), at(cyl(1.7, 1.7, 0.8, '#5a3310', { roughness: 0.8 }), 0, 10.5, 0.4, Math.PI / 2)];
    for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2, p = sphereAt(0.95, Math.cos(a) * 2.7, 10.5 + Math.sin(a) * 2.7, 0.2, C.yellow); p.scale.set(1.5, 0.6, 0.35); p.rotation.z = a; out.push(p); }
    const leaf = sphereAt(1.2, 1.3, 5.0, 0, C.green); leaf.scale.set(1.8, 0.6, 0.3); out.push(leaf); return out; } },
  { id: 'baguette', name: 'Baguette', build: () => {                     // a long loaf held at its lower third, scored along the top
    const loaf = new THREE.Group(), L = 16;
    const prof = []; for (let k = 0; k <= 16; k++) { const t = k / 16, y = -L / 2 + t * L, r = 1.25 * Math.sqrt(Math.max(0, 1 - Math.pow(2 * t - 1, 6))) + 0.02; prof.push([r, y]); }
    loaf.add(lathe(prof, '#D29A55', { roughness: 0.65 }, 24));
    for (let k = -2; k <= 2; k++) { const cut = sphereAt(0.9, 0, k * 2.9, 1.0, '#EFD3A0'); cut.scale.set(0.38, 1.35, 0.32); cut.rotation.z = 0.55; loaf.add(cut); }
    loaf.position.set(0, 4.2, 0); loaf.rotation.z = -0.22; return [loaf]; } },
  { id: 'suitcase', name: 'Suitcase', floor: true, build: () => {       // LEGO's own suitcase (part 4449, measured from its LDraw model: 16 x 9.6 x 6.4 mm, a
    const S = 0.85, W = 16 * S, H = 9.6 * S, T = 6.4 * S, f = 0.34, u = 0.4 * S, brown = C.brown, out = [];   // 3.2 mm handle), a little under its true size,
    [1, -1].forEach((sd) => out.push(rbox(W, H, T / 2 - 0.05, 0.45, brown, 0, f + H / 2, sd * T / 4)));   // set down on its two small feet: two halves meeting at a seam,
    [-1, 1].forEach((sd) => { const post = rbox(4 * u, 4 * u + 0.3, 4 * u, 0.25, brown, sd * 8 * u, f + H + 2 * u - 0.15, 0); out.push(post);   // posts and a round bar on top
      const foot = at(cyl(0.34, 0.34, T * 0.62, brown), sd * 17 * u, f, 0, PI / 2); out.push(foot); });
    const bar = mesh(new THREE.CylinderGeometry(4 * u, 4 * u, 18 * u, 24, 1, false, 0, PI), gloss(brown)); bar.rotation.z = PI / 2; bar.position.set(0, f + H + 4 * u, 0);
    out.push(bar, rbox(18 * u, 0.5, 8 * u, 0.2, brown, 0, f + H + 4 * u - 0.2, 0));
    return out; } },
  { id: 'mandolin', name: 'Mandolin', build: () => {       // carried by the neck
    const body = lathe([[0, -4.6], [2.8, -4.0], [3.9, -1.8], [3.6, 0.8], [2.2, 3.0], [0.9, 4.0], [0, 4.2]], '#9a5424', { roughness: 0.28 }, 32); body.scale.z = 0.42;
    const top = at(mesh(new THREE.CircleGeometry(1, 32), plastic('#E2B878', { roughness: 0.4 })), 0, -0.4, 1.66); top.scale.set(3.5, 3.9, 1);
    const inst = new THREE.Group().add(body, top, at(cyl(0.95, 0.95, 0.1, '#1a1410'), 0, 0.2, 1.72, PI / 2), at(mesh(new THREE.BoxGeometry(1.2, 9, 0.7), plastic('#3a2412')), 0, 8.2, 0.9), at(mesh(new THREE.BoxGeometry(1.8, 2.2, 0.7), plastic('#3a2412')), 0, 13.6, 0.8), at(mesh(new THREE.BoxGeometry(0.9, 2.6, 0.25), plastic('#caa46a')), 0, -3.2, 1.7));
    inst.position.set(0, -8.6, 1.2);                                   // carried by the neck, the body hanging below the hand, in front of the leg
    return [inst]; } },
  { id: 'balloon', name: 'Heart balloon', build: () => { const s = new THREE.Shape(); s.moveTo(0, -3.4); s.bezierCurveTo(-6, 0.6, -3.2, 4.8, 0, 2.2); s.bezierCurveTo(3.2, 4.8, 6, 0.6, 0, -3.4);
    return [grip(2, C.white), at(cyl(0.12, 0.12, 20, '#ddd'), 0, 10, 0), at(mesh(block(s, 2.4, 0.9), plastic('#D6263B', { roughness: 0.2 })), 0, 23.4, 0)]; } },
  { id: 'lemon', name: 'Amalfi lemon', build: () => { const l = sphereAt(2.4, 0, 2.4, 0.6, C.yellow); l.scale.set(1, 1.35, 1); const leaf = sphereAt(1.1, 1.4, 5.4, 0.6, C.green); leaf.scale.set(1.8, 0.5, 0.8); return [l, leaf, sphereAt(0.5, 0, 5.6, 0.6, C.yellow)]; } },
  { id: 'cake', name: 'Wedding cake slice', build: () => {  // on a plate balanced on the hand: sponge, cream, pink icing, a strawberry
    const wedge = (y0, h, col) => { const sh = new THREE.Shape(); sh.moveTo(-2.1, -1.4); sh.lineTo(2.1, -1.4); sh.lineTo(0, 3.1); sh.closePath();
      const g2 = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }); g2.rotateX(-PI / 2); const m = mesh(g2, plastic(col, { roughness: 0.6 })); m.position.y = y0; return m; };
    const plate = lathe([[0, 1.3], [3.6, 1.3], [3.9, 1.75], [3.5, 1.75], [3.1, 1.55], [0, 1.55]], '#F6F4EF', { roughness: 0.25 });
    return [plate, wedge(1.55, 1.1, '#F1DDB0'), wedge(2.65, 0.35, '#FFF8EC'), wedge(3.0, 1.0, '#F1DDB0'), wedge(4.0, 0.45, '#F4B8C8'), sphereAt(0.6, 0, 4.9, -0.2, '#D8231F'), sphereAt(0.35, 0.9, 4.65, 0.9, '#FFF8EC'), sphereAt(0.35, -0.9, 4.65, 0.9, '#FFF8EC')]; } },
  { id: 'rings', name: 'Ring box', build: () => {           // sitting open on the hand: burgundy velvet, a gold ring with a diamond
    const velvet = { roughness: 0.75 }, base = mesh(block(rect(4.2, 2.0, -2.1, 0), 3.4, 0.35), plastic('#7A1A3C', velvet)); base.position.y = 1.4;
    const cushion = mesh(new THREE.BoxGeometry(3.5, 0.5, 2.7), plastic('#F3ECDD', velvet)); cushion.position.y = 3.3;
    const lid = mesh(block(rect(4.2, 1.6, -2.1, 0), 3.4, 0.35), plastic('#7A1A3C', velvet)); lid.position.set(0, 3.5, -1.7); lid.rotation.x = -1.95; lid.geometry.translate(0, 0, 1.7);
    const ring = mesh(new THREE.TorusGeometry(0.85, 0.24, 10, 28), plastic('#E8C07A', { metalness: 0.75, roughness: 0.2 })); ring.position.set(0, 4.3, 0.2);
    const gem = mesh(new THREE.OctahedronGeometry(0.5), plastic('#EAF6FF', { roughness: 0.02, metalness: 0.1 })); gem.position.set(0, 5.3, 0.2);
    return [base, cushion, lid, ring, gem]; } },
  { id: 'flag', name: 'Italian flag', build: () => { const tex = printTex('flag', 90, 60, (x) => { ['#1f8a4c', '#f4f4f2', '#cd212a'].forEach((c, i) => { x.fillStyle = c; x.fillRect(i * 30, 0, 30, 60); }); });
    const f = mesh(new THREE.PlaneGeometry(7.2, 4.8), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.6 })); return [at(cyl(0.6, 0.6, 22, C.brown), 0, 8, 0), sphereAt(0.9, 0, 19.2, 0, C.gold), at(f, -3.7, 16.4, 0, 0, -0.2)]; } },
  { id: 'sign', name: 'Ciao! sign', build: () => { const tex = printTex('sign', 128, 80, (x) => { x.fillStyle = '#f7efd9'; x.fillRect(0, 0, 128, 80); x.strokeStyle = C.darkRed; x.lineWidth = 6; x.strokeRect(3, 3, 122, 74); x.fillStyle = C.darkRed; x.font = '700 38px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Ciao!', 64, 42); });
    const board = mesh(new THREE.BoxGeometry(9, 5.6, 0.5), [plastic('#f7efd9'), plastic('#f7efd9'), plastic('#f7efd9'), plastic('#f7efd9'), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), plastic('#f7efd9')]); return [at(cyl(0.7, 0.7, 18, C.tan), 0, 6, 0), at(board, -2.2, 16.6, 0.4)]; } },
  // ---- for fun (the owner's list)
  { id: 'cutlass', name: 'Pirate cutlass', build: () => { const bl = new THREE.Shape(); bl.moveTo(-0.55, 0); bl.lineTo(0.55, 0); bl.quadraticCurveTo(1.6, 8, 0.2, 15.5); bl.quadraticCurveTo(-0.5, 9, -0.55, 0);
    const blade = mesh(new THREE.ExtrudeGeometry(bl, { depth: 0.3, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1, bevelSegments: 1 }), plastic('#c9ced2', { metalness: 0.7, roughness: 0.25 })); blade.position.set(0, 3.2, -0.15);
    const guard = mesh(new THREE.TorusGeometry(1.5, 0.3, 8, 20, PI), plastic('#B8862B', { metalness: 0.6, roughness: 0.3 })); guard.position.set(0, 2.4, 0); guard.rotation.set(0, PI / 2, PI);
    return [grip(4.4, '#3b2412'), mesh(new THREE.BoxGeometry(3.8, 0.6, 1.0), plastic('#B8862B', { metalness: 0.6, roughness: 0.3 })), blade, guard].map((m, k) => { if (k === 1) m.position.set(0, 2.6, 0); return m; }); } },
  { id: 'parrot', name: 'Parrot on the shoulder', shoulder: true, build: () => {
    const red = '#D8231F', body = sphereAt(1.9, 0, 2.2, 0, red); body.scale.set(0.9, 1.35, 0.95);
    const head = sphereAt(1.35, 0, 5.0, 0.5, red), beak = mesh(new THREE.ConeGeometry(0.55, 1.4, 12), plastic('#F2CD37')); beak.position.set(0, 4.7, 2.0); beak.rotation.x = PI / 2 + 0.5;
    const wings = [-1, 1].map((sd) => { const w = sphereAt(1.2, sd * 1.45, 2.1, -0.2, '#1f6fd6'); w.scale.set(0.35, 1.25, 0.9); return w; });
    const tail = mesh(new THREE.ConeGeometry(0.7, 4.6, 10), plastic('#1f9a4c')); tail.position.set(0, -0.6, -1.6); tail.rotation.x = -2.6;
    const eyes2 = [-1, 1].map((sd) => sphereAt(0.28, sd * 0.95, 5.3, 1.3, '#111'));
    return [body, head, beak, tail, ...wings, ...eyes2]; } },
  ...[['blue', '#48A6FF'], ['red', '#FF3B3B'], ['green', '#4CFF6A']].map(([n, c]) => ({ id: 'saber' + n, name: 'Lightsaber (' + n + ')', build: () => {
    const hilt = mesh(new THREE.CylinderGeometry(0.95, 0.95, 5.6, 16), plastic('#b9bfc4', { metalness: 0.7, roughness: 0.3 })); hilt.position.y = 1.0;
    const grips = [0, 1, 2].map((k) => at(cyl(1.05, 1.05, 0.5, '#222'), 0, -0.6 + k * 1.0, 0)), emitter = at(cyl(1.15, 0.95, 0.9, '#6b7075', { metalness: 0.6, roughness: 0.3 }), 0, 4.2, 0);
    const lite = new THREE.Color(c).lerp(new THREE.Color('#ffffff'), 0.45);
    const core = at(mesh(new THREE.CapsuleGeometry(0.55, 17, 6, 16), new THREE.MeshBasicMaterial({ color: lite })), 0, 13.6, 0);
    const glow = at(mesh(new THREE.CapsuleGeometry(1.15, 17.4, 6, 16), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55, depthWrite: false })), 0, 13.6, 0);
    return [hilt, ...grips, emitter, core, glow]; } })),
  { id: 'raygun', name: 'Ray gun', build: () => { const chrome = { metalness: 0.7, roughness: 0.25 };
    const handle = at(mesh(block(rect(1.8, 4.6, -0.9, -3.0), 1.6, 0.3), plastic('#C91A09')), 0, 0, -0.8, 0.25, 0, 0);
    const bodyG = new THREE.LatheGeometry([[0, 0], [1.7, 0.4], [2.2, 2.0], [2.0, 3.6], [1.1, 5.0], [0.6, 6.8], [0.9, 7.6], [0, 7.8]].map(([r, y]) => new THREE.Vector2(r, y)), 24); bodyG.rotateX(PI / 2);
    const bodyM = mesh(bodyG, plastic('#c9ced2', chrome)); bodyM.position.set(0, 2.4, -2.2);
    const rings = [2.2, 3.4].map((zz) => { const r2 = mesh(new THREE.TorusGeometry(2.1, 0.35, 8, 24), plastic('#C91A09')); r2.position.set(0, 2.4, zz - 2.2 + 1.8); return r2; });
    const fin = at(mesh(block(rect(0.4, 2.2, -0.2, 0), 3.2, 0.1), plastic('#C91A09')), 0, 4.2, -0.6);
    const tip = at(mesh(new THREE.SphereGeometry(0.8, 16, 12), new THREE.MeshStandardMaterial({ color: '#b6ff7a', emissive: '#6dff3a', emissiveIntensity: 1.6 })), 0, 2.4, 5.8);
    const gun = new THREE.Group(); [handle, bodyM, ...rings, fin, tip].forEach((m) => gun.add(m)); gun.rotation.y = -PI / 2; return [gun]; } },   // pointing out to the side
  { id: 'wand', name: 'Wizard wand', build: () => { const g2 = new THREE.CylinderGeometry(0.28, 0.55, 12, 12); const w = mesh(g2, plastic('#5a3a1e', { roughness: 0.55 })); w.position.set(0, 5.2, 0);
    return [w, at(cyl(0.72, 0.72, 2.4, '#3b2412'), 0, 0, 0), sphereAt(0.75, 0, -1.3, 0, '#3b2412')]; } },
  { id: 'starwand', name: 'Star wand', build: () => { const st = new THREE.Shape(); for (let k = 0; k < 10; k++) { const a = PI / 2 + k * PI / 5, r = k % 2 ? 1.3 : 3.0; st[k ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } st.closePath();
    const star = mesh(new THREE.ExtrudeGeometry(st, { depth: 0.6, bevelEnabled: true, bevelSize: 0.2, bevelThickness: 0.2, bevelSegments: 2 }), plastic('#F2CD37', { emissive: '#8a6a00', emissiveIntensity: 0.4 })); star.position.set(0, 12.6, -0.3);
    return [grip(12, '#F4F4F2'), at(cyl(0.55, 0.55, 12, '#F4F4F2'), 0, 5.6, 0), star, sphereAt(0.5, 2.6, 15.0, 0.3, '#E0316A'), sphereAt(0.4, -2.4, 14.0, 0.3, '#48A6FF')]; } },
  { id: 'rollingpin', name: 'Rolling pin', build: () => [at(cyl(0.7, 0.7, 3.2, '#b98a55'), 0, 0, 0), at(cyl(1.9, 1.9, 9.5, '#d9b27e', { roughness: 0.6 }), 0, 6.4, 0), at(cyl(0.7, 0.7, 3.0, '#b98a55'), 0, 12.6, 0), sphereAt(0.9, 0, 14.1, 0, '#b98a55')] },
  { id: 'whisk', name: 'Whisk', build: () => {                           // a balloon whisk: wire loops crossing at the tip, a red handle
    const steel = { metalness: 0.75, roughness: 0.22 }, out = [grip(5.0, '#C91A09'), sphereAt(0.9, 0, -2.6, 0, '#C91A09'), at(cyl(0.55, 0.62, 1.2, '#c9ced2', steel), 0, 3.0, 0)];
    for (let k = 0; k < 4; k++) { const loop = mesh(new THREE.TorusGeometry(1.7, 0.11, 6, 40), plastic('#d8dcdf', steel)); loop.scale.set(1, 2.3, 1); loop.position.y = 7.3; loop.rotation.y = (k / 4) * PI; out.push(loop); }
    return out; } },
  { id: 'pan', name: 'Frying pan', build: () => { const pan = lathe([[0, 0], [3.8, 0], [4.4, 1.2], [4.0, 1.2], [3.5, 0.5], [0, 0.5]], '#2b2b2b', { metalness: 0.5, roughness: 0.4 }); pan.rotation.x = PI / 2; pan.position.set(0, 8.0, 0.6);
    return [grip(7.0, '#1b1b1b'), at(cyl(0.5, 0.5, 2.4, '#8f969b', { metalness: 0.6, roughness: 0.3 }), 0, 4.0, 0), pan, sphereAt(1.5, 0.6, 8.8, 1.1, '#F2CD37', 0.5)]; } }
];

// ================================================================ pets
// LEGO's animals are single moulded pieces: smooth rounded forms in glossy plastic, their eyes and noses printed on, not
// modelled (the owner: the first ones did not look like LEGO pets). These are built the same way, from rounded blocks
// (`rbox`) with printed discs. Millimeters, standing on y = 0, the nose toward +z. A dog, cat or turtle stands at the
// figure's feet; a butterfly (`hand: true`) perches on its free hand. A figure's `pet`.
const gloss = (col) => plastic(col, { roughness: 0.3 });
function rbox(w, h, d, b, col, x = 0, y = 0, z = 0) {                 // a rounded block, w x h x d overall, its edges rounded by b
  const iw = Math.max(0.02, w - 2 * b), ih = Math.max(0.02, h - 2 * b), idp = Math.max(0.02, d - 2 * b), rr = Math.min(b, iw / 2, ih / 2) * 0.9;
  const sh = new THREE.Shape(), x0 = -iw / 2, y0 = -ih / 2;                // its outline rounded too, so no corner comes to a point
  sh.moveTo(x0 + rr, y0); sh.lineTo(x0 + iw - rr, y0); sh.quadraticCurveTo(x0 + iw, y0, x0 + iw, y0 + rr); sh.lineTo(x0 + iw, y0 + ih - rr); sh.quadraticCurveTo(x0 + iw, y0 + ih, x0 + iw - rr, y0 + ih);
  sh.lineTo(x0 + rr, y0 + ih); sh.quadraticCurveTo(x0, y0 + ih, x0, y0 + ih - rr); sh.lineTo(x0, y0 + rr); sh.quadraticCurveTo(x0, y0, x0 + rr, y0);
  let g = new THREE.ExtrudeGeometry(sh, { depth: idp, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 5, curveSegments: 6 });
  g.translate(0, 0, -idp / 2); g = toCreasedNormals(g, PI / 3);          // smooth shading over the rounded edges, as moulded plastic
  const m = mesh(g, gloss(col)); m.position.set(x, y, z); return m;
}
function dot(r, x, y, z, col, ry = 0) { const m = mesh(new THREE.CircleGeometry(r, 24), plastic(col, { roughness: 0.25 })); m.position.set(x, y, z); m.rotation.y = ry; return m; }   // printed, facing +z (or turned)
function printedEyes(dx, y, z, r, iris) {                             // a dark eye (an iris and a slit for a cat), and a white glint
  const out = [];
  [-1, 1].forEach((sd) => { const x = sd * dx;
    if (iris) { const e = dot(r, x, y, z, iris); e.scale.y = 1.15; const slit = dot(r * 0.42, x, y, z + 0.01, '#1b1b1b'); slit.scale.set(0.42, 1.9, 1); out.push(dot(r * 1.12, x, y, z - 0.005, '#1b1b1b'), e, slit); }
    else out.push(dot(r, x, y, z, '#1b1b1b'));
    out.push(dot(r * 0.3, x + r * 0.32, y + r * 0.38, z + 0.02, '#ffffff')); });
  return out;
}
// a dog, sitting, as LEGO's terrier and puppy do: haunches, an upright chest, front legs, a big head with a muzzle and ears
function dog(body, ears, muzzle = body, spots = []) {
  const out = [rbox(5.4, 4.4, 5.8, 1.9, body, 0, 2.2, -1.1), rbox(4.4, 5.8, 3.6, 1.5, body, 0, 5.0, 1.0),
    ...[-1, 1].flatMap((sd) => [rbox(1.5, 4.0, 1.7, 0.6, body, sd * 1.15, 2.1, 2.55), rbox(1.8, 1.0, 2.4, 0.45, body, sd * 1.15, 0.5, 2.95)]),
    rbox(5.6, 5.0, 4.6, 1.8, body, 0, 9.4, 1.3), rbox(3.3, 2.4, 2.5, 0.95, muzzle, 0, 8.2, 4.1), rbox(1.5, 0.95, 0.9, 0.42, '#1b1b1b', 0, 9.0, 5.35),
    ...printedEyes(1.3, 10.1, 3.62, 0.62), dot(0.12, 0, 7.5, 5.37, '#1b1b1b')];
  [-1, 1].forEach((sd) => { const e = rbox(1.3, 3.8, 2.6, 0.55, ears, sd * 3.05, 9.0, 1.1); e.rotation.z = sd * 0.16; out.push(e); });
  const tail = rbox(1.0, 3.0, 1.0, 0.45, body, 0, 3.4, -4.3); tail.rotation.x = -0.75; out.push(tail);
  const collar = mesh(new THREE.TorusGeometry(2.25, 0.34, 8, 32), gloss('#C91A09')); collar.rotation.x = PI / 2; collar.scale.set(1, 0.82, 1); collar.position.set(0, 7.3, 1.0); out.push(collar);
  out.push(rbox(0.9, 0.9, 0.4, 0.2, '#E8C07A', 0, 6.6, 2.75));        // the tag
  spots.forEach(([sd, y, z, r]) => out.push(dot(r, sd * 2.72, y, z, '#1b1b1b', sd * PI / 2)));
  return out;
}
// a cat, standing, as LEGO's: a long body on two moulded leg panels, a broad head with pointed ears, its tail up
function cat(body, muzzle, stripes = null) {
  const out = [rbox(3.4, 3.2, 7.2, 1.45, body, 0, 4.3, -0.3), rbox(3.0, 3.4, 1.5, 0.55, body, 0, 1.7, 2.3), rbox(3.0, 3.4, 1.5, 0.55, body, 0, 1.7, -2.8),
    rbox(4.8, 4.0, 3.6, 1.45, body, 0, 7.4, 3.2)];
  const m = dot(1.15, 0, 6.55, 5.01, muzzle); m.scale.set(1.35, 0.8, 1); out.push(m, ...printedEyes(1.12, 7.85, 5.02, 0.6, '#9BC53D'), dot(0.3, 0, 7.0, 5.04, '#E58FA0'));
  const ear = new THREE.Shape(); ear.moveTo(-0.95, 0); ear.lineTo(0.95, 0); ear.lineTo(0.1, 1.9); ear.closePath();
  [-1, 1].forEach((sd) => { const e = mesh(new THREE.ExtrudeGeometry(ear, { depth: 0.8, bevelEnabled: true, bevelSize: 0.2, bevelThickness: 0.2, bevelSegments: 2 }), gloss(body)); e.position.set(sd * 1.45, 9.0, 2.8); e.rotation.z = -sd * 0.18; out.push(e); });
  const tl = new THREE.CatmullRomCurve3([V3(0, 5.0, -3.8), V3(0, 7.2, -4.7), V3(0, 9.4, -4.3), V3(0.4, 10.4, -3.3)]);
  out.push(mesh(new THREE.TubeGeometry(tl, 24, 0.55, 10, false), gloss(body)), (() => { const tip = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8), gloss(body)); tip.position.set(0.4, 10.4, -3.3); return tip; })());
  if (stripes) [-2.4, -0.8, 0.8].forEach((z) => out.push(rbox(3.5, 0.35, 0.8, 0.14, stripes, 0, 5.85, z)));
  return out;
}
function turtle() {
  const shellTex = printTex('turtleshell', 128, 128, (x) => { x.fillStyle = '#3f7a3a'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#2a5527'; x.lineWidth = 4;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { const cx = c * 24 + (r % 2) * 12, cy = r * 28 + 8; x.beginPath(); for (let k = 0; k < 6; k++) { const a = PI / 6 + k * PI / 3; x.lineTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13); } x.closePath(); x.fillStyle = '#5f9a44'; x.fill(); x.stroke(); } });
  const shell = mesh(new THREE.SphereGeometry(3.4, 36, 16, 0, PI * 2, 0, PI / 2), new THREE.MeshStandardMaterial({ map: shellTex, roughness: 0.3 })); shell.scale.set(1, 0.66, 1.22); shell.position.y = 1.0;
  const rim = mesh(new THREE.TorusGeometry(3.4, 0.4, 10, 40), gloss('#6b9b3a')); rim.rotation.x = PI / 2; rim.scale.set(1, 1.22, 1); rim.position.y = 1.0;
  const skin = '#8fbf5a', head = rbox(2.5, 2.3, 2.8, 1.0, skin, 0, 1.6, 4.7);
  const legs = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const l = rbox(2.2, 0.9, 1.5, 0.4, skin, sx * 3.3, 0.45, sz * 2.3); l.rotation.y = sx * sz * 0.5; return l; });
  return [shell, rim, head, ...printedEyes(0.62, 2.05, 6.12, 0.36), dot(0.08, 0, 1.3, 6.13, '#1b1b1b'), ...legs, rbox(0.9, 0.6, 1.4, 0.25, skin, 0, 0.6, -4.3)];
}
// a butterfly, as LEGO's: its wings one flat piece with the pattern printed on, here raised a little in a V
function butterfly(kind) {
  const wingShape = () => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(0.8, 2.6, 3.8, 3.4, 3.9, 1.3); sh.bezierCurveTo(3.95, 0.3, 2.2, -0.1, 1.6, -0.2);
    sh.bezierCurveTo(3.2, -0.9, 3.0, -2.9, 1.6, -2.9); sh.bezierCurveTo(0.8, -2.9, 0.2, -1.4, 0, 0); return sh; };
  const W = 4.2, H = 6.6, Y0 = -3.1;                                  // the shape's box, for mapping the print onto it
  const tex = printTex('wing:' + kind, 256, 256, (x) => {
    const X = (u) => u / W * 256, Yc = (v) => 256 - (v - Y0) / H * 256, sh = wingShape(), path = new Path2D();
    sh.getPoints(40).forEach((pt, k) => (k ? path.lineTo(X(pt.x), Yc(pt.y)) : path.moveTo(X(pt.x), Yc(pt.y)))); path.closePath();
    x.save(); x.clip(path);
    if (kind === 'monarch') { x.fillStyle = '#E8741C'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#1b1b1b'; x.lineWidth = 6; [[0.2, 0.2, 3.4, 2.6], [0.2, 0.2, 3.6, 1.0], [0.4, 0, 2.6, -2.4], [0.4, 0, 1.4, -2.6]].forEach(([a0, b0, a1, b1]) => { x.beginPath(); x.moveTo(X(a0), Yc(b0)); x.lineTo(X(a1), Yc(b1)); x.stroke(); }); }
    else { const gr = x.createRadialGradient(X(0.6), Yc(0.2), 4, X(0.6), Yc(0.2), 200); gr.addColorStop(0, '#6fc3ff'); gr.addColorStop(1, '#1d5fc0'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256); }
    x.lineWidth = 26; x.strokeStyle = '#141414'; x.stroke(path);       // the dark edge
    if (kind === 'monarch') { x.fillStyle = '#ffffff'; sh.getPoints(24).forEach((pt, k) => { if (k % 2 && pt.x > 0.6) { x.beginPath(); x.arc(X(pt.x) * 0.96 + 4, Yc(pt.y), 3.5, 0, 7); x.fill(); } }); }
    x.restore(); });
  tex.repeat.set(1 / W, 1 / H); tex.offset.set(0, -Y0 / H);
  const g = new THREE.Group();
  [-1, 1].forEach((sd) => { const wg = new THREE.ExtrudeGeometry(wingShape(), { depth: 0.18, bevelEnabled: false, curveSegments: 20 });
    const w = mesh(wg, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 })); w.rotation.x = -PI / 2; w.scale.x = sd;
    const hinge = new THREE.Group(); hinge.add(w); hinge.rotation.z = sd * 0.95; g.add(hinge); });
  const body = mesh(new THREE.CapsuleGeometry(0.28, 2.6, 4, 10), gloss('#1b1b1b')); body.rotation.x = PI / 2; body.position.z = -0.4; g.add(body);
  [-1, 1].forEach((sd) => { const a = mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 5), gloss('#1b1b1b')); a.position.set(sd * 0.35, 0.5, 1.2); a.rotation.set(0.9, 0, -sd * 0.4); g.add(a); });
  g.position.y = 0.4; g.rotation.y = PI / 2 - 0.35; g.scale.setScalar(1.25); return [g];   // sideways on, so its wings face the viewer
}
export const PETS = [
  { id: 'none', name: 'None', build: () => [] },
  { id: 'dogbrown', name: 'Dog, brown', build: () => dog('#8a5a2b', '#5a3417', '#C9A27A') },
  { id: 'doggold', name: 'Dog, golden', build: () => dog('#D9A55B', '#B98236', '#F0D3A0') },
  { id: 'dogblack', name: 'Dog, black', build: () => dog('#2e2a27', '#1b1b1b', '#5a524c') },
  { id: 'dogspots', name: 'Dog, spotted', build: () => dog('#F4F4F2', '#1b1b1b', '#F4F4F2', [[-1, 2.6, -1.4, 0.9], [1, 2.0, -0.2, 0.7], [-1, 1.4, -2.6, 0.55], [1, 3.2, -2.4, 0.6]]) },
  { id: 'catorange', name: 'Cat, orange tabby', build: () => cat('#E08A3C', '#F6E3C8', '#B85E1E') },
  { id: 'catblack', name: 'Cat, black', build: () => cat('#2e2a27', '#4a4440') },
  { id: 'catgray', name: 'Cat, gray', build: () => cat('#8f969b', '#E6E6E3', '#6c7277') },
  { id: 'catwhite', name: 'Cat, white', build: () => cat('#F4F4F2', '#FFFFFF') },
  { id: 'turtle', name: 'Turtle', build: () => turtle() },
  { id: 'butterflyblue', name: 'Butterfly, blue', hand: true, build: () => butterfly('blue') },
  { id: 'butterflyorange', name: 'Butterfly, monarch', hand: true, build: () => butterfly('monarch') },
];

// ================================================================ the figure
const byId = (list, id) => list.find((p) => p.id === id) || list[0];
export const PARTS = { hair: HAIRS, hat: HATS, hc: HAIR_COLORS, face: FACES, fh: FACIAL_HAIR, gl: GLASSES, skin: SKINS, torso: TORSOS, legs: LEGS, acc: ACCS, pet: PETS };
export function defaultFig() { return { name: '', p: { hair: 'short', hat: 'none', hc: 'brown', face: 'smile', fh: 'none', gl: 'none', skin: 'classic', torso: 'suit', legs: 'navy', acc: 'none', pet: 'none' } }; }
// a figure's parts with the defaults filled in, and an old face (glasses, a beard) read as a face and its layer
export function normal(p0) { const p = { ...defaultFig().p, ...(p0 || {}) }, old = OLD_FACES[p.face]; if (old && !(p0 && (p0.fh || p0.gl))) Object.assign(p, old);
  if (HATS.some((h) => h.id === p.hair) && !(p0 && p0.hat)) { p.hat = p.hair; p.hair = 'short'; }   // a figure saved when hats were among the hair
  return p; }
export function randomFig(rnd = Math.random) { const pick = (l) => l[Math.floor(rnd() * l.length)].id, some = (l, k) => (rnd() < k ? pick(l.slice(1)) : 'none');
  return { name: '', p: { hair: pick(HAIRS), hat: some(HATS, 0.3), hc: pick(HAIR_COLORS), face: pick(FACES), fh: some(FACIAL_HAIR, 0.3), gl: some(GLASSES, 0.3), skin: pick(SKINS), torso: pick(TORSOS), legs: pick(LEGS), acc: pick(ACCS), pet: some(PETS, 0.3) } }; }

function headMesh(face, skinCol, hairCol, fh = FACIAL_HAIR[0], gl = GLASSES[0]) {
  const pts = [[0, 0], [1.6, 0], [1.6, 1.4], [3.9, 1.4], [4.55, 1.75], [4.85, 2.35], [HEAD_R, 3.4], [HEAD_R, 5.8], [HEAD_R, 8.1], [4.85, 9.1], [4.5, 9.85], [3.8, 10.2], [2.45, 10.2], [2.45, 11.7], [2.25, 11.9], [0, 11.9]];
  const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 64, -Math.PI, Math.PI * 2);
  const uv = g.attributes.uv, p = g.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setY(i, Math.min(0.998, Math.max(0.002, (p.getY(i) - 2.35) / (9.1 - 2.35))));   // the print band
  const big = (x) => { x.translate(FACE.cx, 118); x.scale(FACE.k, FACE.k); x.translate(-FACE.cx, -118); };   // the features a third larger than drawn (the owner: they looked small on the head)
  const tex = printTex(['face', face.id, fh.id, gl.id, skinCol, hairCol].join(':'), FACE.w, FACE.h, (x) => { x.fillStyle = skinCol; x.fillRect(0, 0, FACE.w, FACE.h);
    x.save(); big(x); face.draw(x, hairCol); x.restore();
    if (fh.id !== 'none') {                                            // the facial hair on its own sheet, the mouth cut clear, then laid on
      const c = document.createElement('canvas'); c.width = FACE.w; c.height = FACE.h; const y = c.getContext('2d'); big(y); fh.draw(y, hairCol);
      y.globalCompositeOperation = 'destination-out'; y.beginPath(); y.ellipse(MOUTH.x, MOUTH.y, MOUTH.rx, MOUTH.ry, 0, 0, 7); y.fill(); x.drawImage(c, 0, 0);
    }
    if (gl.id !== 'none') { const c = document.createElement('canvas'); c.width = FACE.w; c.height = FACE.h; const y = c.getContext('2d'); big(y); gl.draw(y); x.drawImage(c, 0, 0); } });   // their own sheet: a cut-out lens never erases the face
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
// an arm: from a shoulder just outside the torso's top corner, down past the elbow and bent forward, ending in a wrist peg
// and the C-shaped hand, its grip upright and open to the front (LEGO's own: it holds a 3.2 mm bar)
function handGeo() {
  const sh = new THREE.Shape(), gap = 0.66, a0 = -PI / 2 + gap, a1 = 3 * PI / 2 - gap;    // the opening toward -y, which becomes the front
  sh.absarc(0, 0, 2.2, a0, a1, false); sh.absarc(0, 0, 1.4, a1, a0, true);
  const g = new THREE.ExtrudeGeometry(sh, { depth: 2.2, bevelEnabled: true, bevelSize: 0.25, bevelThickness: 0.25, bevelSegments: 2, curveSegments: 24 });
  g.translate(0, 0, -1.1); g.rotateX(-PI / 2);                     // the grip's axis upright
  return g;
}
function armMesh(side, col, skinCol) {                                  // side -1 = the figure's right (the viewer's left)
  const g = new THREE.Group(), S = V3(side * 7.0, 26.0, 0), W = V3(side * 8.55, 19.1, 2.0), Hc = V3(side * 8.55, 18.1, 4.95);
  const curve = new THREE.CatmullRomCurve3([S, V3(side * 7.9, 23.8, 0.05), V3(side * 8.5, 21.3, 0.35), W]);
  g.add(mesh(new THREE.TubeGeometry(curve, 24, 1.95, 16, false), plastic(col)), sphereAt(2.0, S.x, S.y, S.z, col), sphereAt(1.95, W.x, W.y, W.z, col));
  g.children[1].material = g.children[2].material = plastic(col);
  const peg = mesh(new THREE.CylinderGeometry(1.05, 1.05, 1.9, 16), plastic(skinCol)); peg.position.set(side * 8.55, 18.5, 2.35); peg.rotation.x = PI / 2 - 0.25; g.add(peg);
  const hand = mesh(handGeo(), plastic(skinCol)); hand.position.copy(Hc); hand.rotation.set(0.55, -side * 0.3, 0, 'YXZ'); g.add(hand);   // tipped forward and a little in, as a minifig's are, so the C shows
  g.userData.grip = Hc.clone(); g.userData.hand = hand;
  return g;
}
// a skirt: a solid whose cross-section is a rounded rectangle (a superellipse, power n) from `top` [half-width, half-depth]
// at y1 to `bot` at y0, flaring along `ease`, its bottom brought forward by `fwd`
function skirtGeo({ y0, y1, top, bot, n0 = 8, n1 = 8, ease = (t) => t, fwd = 0, seg = 72, rows = 14 }) {
  const pos = [], idx = [], ring = (j) => j * (seg + 1);
  for (let j = 0; j <= rows; j++) {
    const t = j / rows, e = ease(t), y = y1 - t * (y1 - y0), a = top[0] + (bot[0] - top[0]) * e, b = top[1] + (bot[1] - top[1]) * e, n = n0 + (n1 - n0) * t;
    for (let i = 0; i <= seg; i++) { const th = (i / seg) * 2 * PI, c = Math.cos(th), s2 = Math.sin(th);
      pos.push(a * Math.sign(c) * Math.abs(c) ** (2 / n), y, b * Math.sign(s2) * Math.abs(s2) ** (2 / n) + fwd * e); }
  }
  for (let j = 0; j < rows; j++) for (let i = 0; i < seg; i++) { const a = ring(j) + i, b = a + 1, c = ring(j + 1) + i + 1, d = ring(j + 1) + i; idx.push(a, b, d, b, c, d); }   // facing out
  const bc = pos.length / 3; pos.push(0, y0, fwd * ease(1)); for (let i = 0; i < seg; i++) idx.push(bc, ring(rows) + i, ring(rows) + i + 1);   // the hem, closed underneath
  const tc = pos.length / 3; pos.push(0, y1, 0); for (let i = 0; i < seg; i++) idx.push(tc, ring(0) + i + 1, ring(0) + i);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function legShape(pts) { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; }
function legGeo(s, pts) {                                                 // one leg, from a side profile (z forward, y up)
  const geo = new THREE.ExtrudeGeometry(legShape(pts), { depth: 7.0, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.35, bevelSegments: 2 });
  geo.rotateY(-PI / 2); geo.translate(s * 3.9 + 3.5, 0, 0); return geo;
}
const LEG = [[-3.4, 0], [4.4, 0], [4.4, 2.8], [3.2, 3.6], [3.2, 11.8], [-3.4, 11.8]];
function legsMesh(legs, skinCol) {
  const g = new THREE.Group(), col = legs.col;
  const pair = (c) => [-1, 1].forEach((s) => g.add(mesh(legGeo(s, LEG), plastic(c))));
  if (legs.skirt === 'long') {                                           // a long A-line skirt, soft at the corners, a little forward at the hem
    g.add(mesh(skirtGeo({ y0: 0, y1: 15.2, top: [8.0, 4.3], bot: [10.0, 7.0], n0: 6, n1: 3.4, ease: (t) => t ** 1.25, fwd: 1.0 }), plastic(col, { roughness: 0.4 }))); return g;
  }
  if (legs.skirt === 'gown') {                                           // a gown: a bell, fitted at the waist and full at the hem, a sash at the top
    g.add(mesh(skirtGeo({ y0: 0, y1: 14.4, top: [8.0, 4.3], bot: [11.6, 9.4], n0: 6, n1: 2.4, ease: (t) => t ** 1.9, fwd: 1.9, rows: 20 }), plastic(col, { roughness: 0.42 })),
      mesh(skirtGeo({ y0: 14.2, y1: 15.2, top: [8.05, 4.35], bot: [8.2, 4.5], n0: 6, n1: 6 }), plastic(col, { roughness: 0.3 }))); return g;
  }
  if (legs.skirt === 'short') {                                          // bare legs under a short flared skirt, to mid-thigh
    pair(skinCol);
    g.add(mesh(skirtGeo({ y0: 7.2, y1: 15.2, top: [8.2, 4.3], bot: [9.9, 6.1], n0: 6, n1: 4, ease: (t) => t ** 1.3 }), plastic(col, { roughness: 0.4 }))); return g;
  }
  g.add(at(mesh(block(rect(15.6, 3.2, -7.8, 0), 7.2, 0.35), plastic(col)), 0, Y.hip, 0));
  if (legs.shorts) {                                                      // shorts: the lower leg bare, the upper in the fabric, each its own piece
    [-1, 1].forEach((s) => { g.add(mesh(legGeo(s, [[-3.4, 0], [4.4, 0], [4.4, 2.8], [3.2, 3.6], [3.2, 6.4], [-3.4, 6.4]]), plastic(skinCol)));
      g.add(mesh(legGeo(s, [[-3.5, 6.4], [3.3, 6.4], [3.3, 11.8], [-3.5, 11.8]]), plastic(col))); });
  } else pair(col);
  return g;
}
// the whole figure, in millimeters (about 40 tall), feet on the ground at y 0, facing +z
export function buildFigure(fig) {
  const p = normal(fig && fig.p);
  const skin = byId(SKINS, p.skin).col, hc = byId(HAIR_COLORS, p.hc).col, torso = byId(TORSOS, p.torso), legs = byId(LEGS, p.legs), hair = byId(HAIRS, p.hair), face = byId(FACES, p.face), acc = byId(ACCS, p.acc);
  const fh = byId(FACIAL_HAIR, p.fh), gl = byId(GLASSES, p.gl);
  const g = new THREE.Group();
  const hat = byId(HATS, p.hat);
  g.add(legsMesh(legs, skin), torsoMesh(torso, skin), headMesh(face, skin, hc, fh, gl));
  if (fh.geo) g.add(fh.geo(hc));
  const armCol = torso.arms || skin;
  const right = armMesh(-1, armCol, skin), left = armMesh(1, armCol, skin);
  g.add(right, left);
  CUT = hat.cut ?? null;                                             // under a hat, the hair starts at its rim (capMesh)
  if (!hat.hidesHair) hair.build(hc, skin).forEach((m) => { if (CUT == null || m.userData.cap || m.position.y < CUT - 0.8) g.add(m); });   // a bun above the rim is left off
  CUT = null;
  hat.build(p).forEach((m) => g.add(m));
  const pet = byId(PETS, p.pet), pm = pet.build(), held = acc.build();
  if (held.length) { const a = new THREE.Group(); held.forEach((m) => a.add(m));
    if (acc.shoulder) { a.position.set(-7.4, 27.6, 0.4); a.scale.setScalar(1.35); a.rotation.y = 0.35; }   // a parrot sits on the shoulder
    else if (acc.floor) {                                              // the suitcase stands on the floor just behind the figure's right leg, most of it
      a.position.set(pm.length && !pet.hand ? -8.4 : -10.7, 0, -6.5);   // showing beside it (with a pet at the other side, a little more behind it, so
      a.rotation.y = 0.15; a.userData.floor = true;                   // the three fit one plinth), turned a little in
    }
    else a.position.copy(right.userData.grip);                        // held things stand upright in the hand (tipped with it, they leaned toward the viewer)
    if (acc.across) right.userData.hand.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V3(0, 0, 1), V3(1, 0, 0), V3(0, 1, 0)));   // the hand turned on its
    g.add(a); }                                                        // wrist, as a minifigure's turns: its grip across, its opening up (a pizza's crust)
  if (pm.length) { const a = new THREE.Group(); pm.forEach((m) => a.add(m));
    if (pet.hand) a.position.copy(left.userData.grip).add(V3(0, 1.5, 0.3));      // a butterfly on the other hand
    else { a.position.set(10.8, 0, 6.4); a.rotation.y = -0.35; a.userData.floor = true; }   // at the feet, in front and to the side, looking in
    g.add(a); }
  g.userData.fig = fig;
  return g;
}
// ---- a figure on its own small museum plinth (the owner's wish), for the LEGO shelf: white marble with a gray base and
// cap, and a brass plate on the front with the figure's name. Millimeters, the plinth's foot on y = 0, 27 wide and 22 deep.
export const PLINTH = { w: 27, d: 22, h: 7.2 };
const marble = () => printTex('marble', 128, 128, (x) => { x.fillStyle = '#F2EFE8'; x.fillRect(0, 0, 128, 128); let s0 = 5; const r = () => (s0 = (s0 * 16807) % 2147483647) / 2147483647;
  x.strokeStyle = 'rgba(150,145,138,.35)'; for (let k = 0; k < 7; k++) { x.lineWidth = 0.6 + r() * 1.4; x.beginPath(); let px = r() * 128, py = 0; x.moveTo(px, py); while (py < 128) { px += (r() - 0.5) * 18; py += 8 + r() * 10; x.lineTo(px, py); } x.stroke(); } });
export function onPlinth(fig) {
  const g = new THREE.Group(), { h } = PLINTH, gray = plastic('#8f8a80', { roughness: 0.5 }), white = new THREE.MeshStandardMaterial({ map: marble(), roughness: 0.35 });
  let { w, d } = PLINTH;
  const f = buildFigure(fig), hasPet = (fig && fig.p && fig.p.pet && fig.p.pet !== 'none' && !byId(PETS, fig.p.pet).hand);
  f.position.set(hasPet ? -4.0 : 0, h, hasPet ? -4.5 : -1.5);
  if (byId(ACCS, normal(fig && fig.p).acc).floor) {                  // a suitcase on the floor: the figure and its things centered across the plinth, but
    const z0 = f.position.z; f.position.set(0, h, 0); f.updateMatrixWorld(true);   // what stands on it (feet, suitcase, pet) kept on it (the hands may reach
    const all = new THREE.Box3().setFromObject(f), foot = new THREE.Box3(V3(-7.8, 0, -4), V3(7.8, 1, 5)).applyMatrix4(f.matrixWorld);   // past its edge, as
    f.children.forEach((c) => { if (c.userData.floor) foot.expandByObject(c, true); });   // with a pet); with a pet as well, the plinth is made a little
    w = Math.max(w, foot.max.x - foot.min.x + 0.4); d = Math.max(d, foot.max.z - foot.min.z + 0.4);   // larger, never the figure smaller
    const lx = w / 2 - 0.2, lz = d / 2 - 0.2, clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    f.position.x = clamp(-(all.min.x + all.max.x) / 2, -lx - foot.min.x, lx - foot.max.x);
    f.position.z = clamp(z0, -lz - foot.min.z, lz - foot.max.z);
  }
  const slab = (sw, sh, sd, y, m) => { const b = mesh(new THREE.BoxGeometry(sw, sh, sd), m); b.position.y = y + sh / 2; g.add(b); };
  slab(w + 0.8, 1.1, d + 0.8, 0, gray); slab(w - 1.2, h - 2.1, d - 1.2, 1.1, white); slab(w, 1.0, d, h - 1.0, white);
  const name = (fig && fig.name) || '';
  const plate = mesh(new THREE.PlaneGeometry(15, 2.9), new THREE.MeshStandardMaterial({ map: printTex('plate:' + name, 300, 58, (x) => {
    const gr = x.createLinearGradient(0, 0, 0, 58); gr.addColorStop(0, '#E2C27A'); gr.addColorStop(1, '#A8843F'); x.fillStyle = gr; x.fillRect(0, 0, 300, 58);
    x.strokeStyle = 'rgba(70,48,12,.7)'; x.lineWidth = 3; x.strokeRect(4, 4, 292, 50);
    x.fillStyle = '#3a280c'; x.textAlign = 'center'; x.textBaseline = 'middle'; let px = 34; x.font = '600 ' + px + 'px Georgia';
    while (x.measureText(name.toUpperCase()).width > 260 && px > 14) x.font = '600 ' + --px + 'px Georgia';
    x.fillText(name.toUpperCase(), 150, 31); }), metalness: 0.35, roughness: 0.35 }));
  plate.position.set(0, 1.1 + (h - 2.1) / 2, (d - 1.2) / 2 + 0.05); g.add(plate);
  g.add(f);
  return g;
}
// one loose part, for the parts bins beside the shelf: kind 'head' | 'torso' | 'legs' | 'hair' | 'acc', from a partial
// figure spec (missing choices take the defaults). Millimeters, resting on y = 0, centred on x and z.
export function loosePart(kind, p = {}) {
  p = normal(p);
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
