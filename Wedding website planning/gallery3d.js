import * as THREE from 'three';

// ---------------------------------------------------------------- plan
// Blueprint units divided by 200: 1000 blueprint units = 5 m.
const U = 1 / 200;
const H = 3.95;             // wall height = vault springing
const EYE = 1.62;           // standing eye height

const P = {
  corrX: 500 * U,           // corridor half-width, 2.5 m
  backZ: 12,          // atrium back wall
  wingNearZ: -5,      // wing band, near edge
  wingFarZ: -10,      // wing band, far edge
  wingEndX: 2500 * U,       // wing end wall
  detFarZ: -19,       // details room end wall
  detX: 5             // details room half-width
};

const CLOSE_X = 10.0;         // where you stand for a close look at a wing's principal work, 2.4 m from it
const GALLERY_Z = -2.6;      // centre of the two atrium mini galleries, along the hall

const STATIONS = [
  { id: 'atrium', x: 0, z: 0, yaw: 0, room: 'atrium', accent: '#C9A667',
    eyebrow: 'The atrium', title: 'Two collections, one exhibit',
    body: 'Villa Cetinale, in the hills outside Siena. Two wings and five days of open hours. Wing I is through the opening on your left, Wing II on your right; the hall straight ahead holds the exhibit details — travel, lodging, and the program.',
    meta: 'Turn and choose a wing' },

  { id: 'kelly', x: 0, z: GALLERY_Z, yaw: Math.PI / 2, room: 'atrium', accent: '#C9A667',
    eyebrow: 'The atrium · Kelly', title: 'Kelly',
    body: 'Photographs to come.', meta: 'Placeholder' },
  { id: 'kelly1', x: 0, z: GALLERY_Z + 1.3, yaw: Math.PI / 2, room: 'atrium', accent: '#C9A667', tour: false,
    eyebrow: 'The atrium · Kelly', title: 'Kelly',
    body: 'Photographs to come.', meta: 'Placeholder' },
  { id: 'kelly2', x: 0, z: GALLERY_Z - 1.3, yaw: Math.PI / 2, room: 'atrium', accent: '#C9A667', tour: false,
    eyebrow: 'The atrium · Kelly', title: 'Kelly',
    body: 'Photographs to come.', meta: 'Placeholder' },
  { id: 'anthony', x: 0, z: GALLERY_Z, yaw: -Math.PI / 2, room: 'atrium', accent: '#C9A667',
    eyebrow: 'The atrium · Anthony', title: 'Anthony',
    body: 'Photographs to come.', meta: 'Placeholder' },
  { id: 'anthony1', x: 0, z: GALLERY_Z + 1.3, yaw: -Math.PI / 2, room: 'atrium', accent: '#C9A667', tour: false,
    eyebrow: 'The atrium · Anthony', title: 'Anthony',
    body: 'Photographs to come.', meta: 'Placeholder' },
  { id: 'anthony2', x: 0, z: GALLERY_Z - 1.3, yaw: -Math.PI / 2, room: 'atrium', accent: '#C9A667', tour: false,
    eyebrow: 'The atrium · Anthony', title: 'Anthony',
    body: 'Photographs to come.', meta: 'Placeholder' },

  { id: 'w1', x: -1150 * U, z: -7.5, yaw: Math.PI / 2, room: 'w1', accent: '#93AEA2',
    eyebrow: 'Wing I · principal work', title: 'The Birth of Venus',
    body: 'Botticelli gave a woman the entire centre of the canvas, in gold light, with flowers in the air and nobody hurrying her. That is the tone of the ceremony — femininity taken completely seriously.',
    meta: 'Sandro Botticelli, c. 1485 · Uffizi, Florence' },
  { id: 'w1close', x: -CLOSE_X, z: -7.5, yaw: Math.PI / 2, eye: 1.95, room: 'w1', accent: '#93AEA2', tour: false,
    eyebrow: 'Wing I · principal work · up close', title: 'The Birth of Venus',
    body: 'Botticelli gave a woman the entire centre of the canvas, in gold light, with flowers in the air and nobody hurrying her. That is the tone of the ceremony — femininity taken completely seriously.',
    meta: 'Sandro Botticelli, c. 1485 · Uffizi, Florence' },
  { id: 'w1a', x: -1500 * U, z: -7.5, yaw: 0, room: 'w1', accent: '#93AEA2',
    eyebrow: 'Wing I · complementary work', title: 'The Procession',
    body: 'Down the cypress avenue at four o’clock, in the part of the afternoon when the light does the work for you.',
    meta: 'Live performance · approx. 30 minutes' },
  { id: 'w1b', x: -1500 * U, z: -7.5, yaw: Math.PI, room: 'w1', accent: '#93AEA2',
    eyebrow: 'Wing I · complementary work', title: 'The Vows',
    body: 'Written by both of us, read once, never rehearsed. Anthony maintains he will not cry.',
    meta: 'Ink on paper · 2027' },

  { id: 'w2', x: 1150 * U, z: -7.5, yaw: -Math.PI / 2, room: 'w2', accent: '#D19A6E',
    eyebrow: 'Wing II · principal work', title: 'Primavera',
    body: 'A hundred and ninety species of plant in one painting, and a garden that refuses to stop. The reception takes this as instruction rather than inspiration.',
    meta: 'Sandro Botticelli, c. 1480 · Uffizi, Florence' },
  { id: 'w2close', x: CLOSE_X, z: -7.5, yaw: -Math.PI / 2, eye: 1.95, room: 'w2', accent: '#D19A6E', tour: false,
    eyebrow: 'Wing II · principal work · up close', title: 'Primavera',
    body: 'A hundred and ninety species of plant in one painting, and a garden that refuses to stop. The reception takes this as instruction rather than inspiration.',
    meta: 'Sandro Botticelli, c. 1480 · Uffizi, Florence' },
  { id: 'w2a', x: 1500 * U, z: -7.5, yaw: 0, room: 'w2', accent: '#D19A6E',
    eyebrow: 'Wing II · complementary work', title: 'The Banquet',
    body: 'Tables dressed as banquet still life: figs, pomegranates, spilled candle wax, far too many flowers. We are attempting fewer than a hundred and ninety.',
    meta: 'Still life · perishable · hours undecided' },
  { id: 'w2b', x: 1500 * U, z: -7.5, yaw: Math.PI, room: 'w2', accent: '#D19A6E',
    eyebrow: 'Wing II · complementary work', title: 'The Dancing',
    body: 'Three Graces, minimum. Participation is not optional but skill is not required.',
    meta: 'Performance · ongoing' },

  { id: 'det', x: 0, z: -12.5, yaw: 0, room: 'det', accent: '#C9A667',
    eyebrow: 'Exhibit details · visiting', title: 'Getting to Sovicille',
    body: 'Twenty minutes west of Siena, in the hills. Fly into Florence (FLR) or Pisa (PSA) and drive down through the Chianti — about ninety minutes. Rome (FCO) works too, at roughly three hours.',
    meta: 'Lodging, transport and the five-day program are still being arranged' },
  { id: 'detL', x: 0, z: -12.5, yaw: Math.PI / 2, room: 'det', accent: '#A79C85',
    eyebrow: 'Exhibit details · permanent collection', title: 'Everything we love, catalogued',
    body: 'The dogs, the card table, the shared library, the plastic brick. Everything in this exhibit is something one of us loves.',
    meta: 'Mixed media · ongoing' },
  { id: 'detR', x: 0, z: -12.5, yaw: -Math.PI / 2, room: 'det', accent: '#C9A667',
    eyebrow: 'Exhibit details · RSVP', title: 'The exhibit is complete but for one element.',
    body: 'Invitations follow, and with them this frame gets a name in it.',
    meta: 'RSVP opens with the invitation' },
  { id: 'detLclose', x: -2.2, z: -14.5725, yaw: Math.PI / 2, eye: 2.4, room: 'det', accent: '#A79C85', tour: false,
    eyebrow: 'Exhibit details · permanent collection · up close', title: 'Everything we love, catalogued',
    body: 'The dogs, the card table, the shared library, the plastic brick. Everything in this exhibit is something one of us loves.',
    meta: 'Mixed media · ongoing' },
  { id: 'detRclose', x: 2.2, z: -14.5725, yaw: -Math.PI / 2, eye: 2.4, room: 'det', accent: '#C9A667', tour: false,
    eyebrow: 'Exhibit details · RSVP · up close', title: 'The exhibit is complete but for one element.',
    body: 'Invitations follow, and with them this frame gets a name in it.',
    meta: 'RSVP opens with the invitation' },
  // beyond the centre table, close to the end wall, raised to the height of its principal picture (`eye`, in metres)
  { id: 'detClose', x: 0, z: -16.75, yaw: 0, eye: 2.5, room: 'det', accent: '#C9A667', tour: false,
    eyebrow: 'Exhibit details · visiting · up close', title: 'Getting to Sovicille',
    body: 'Twenty minutes west of Siena, in the hills. Fly into Florence (FLR) or Pisa (PSA) and drive down through the Chianti — about ninety minutes. Rome (FCO) works too, at roughly three hours.',
    meta: 'Lodging, transport and the five-day program are still being arranged' },
  // in front of each stack of smaller pictures on the end wall; stood a little to the outside of the
  // stack so the large statue beside it stays out of the view
  { id: 'detStackL', x: -4.05, z: -16.8, yaw: 0, eye: 2.4, room: 'det', accent: '#A79C85', tour: false,
    eyebrow: 'Exhibit details · end wall', title: 'Pictures to come',
    body: 'These frames are waiting for their pictures.', meta: 'Placeholder' },
  { id: 'detStackR', x: 4.05, z: -16.8, yaw: 0, eye: 2.4, room: 'det', accent: '#A79C85', tour: false,
    eyebrow: 'Exhibit details · end wall', title: 'Pictures to come',
    body: 'These frames are waiting for their pictures.', meta: 'Placeholder' },
  // standing at the near edge of the centre table, looking down onto it (pitch is in radians, negative = down)
  { id: 'detTable', x: 0, z: -13.95, yaw: 0, pitch: -0.5, room: 'det', accent: '#C9A667', tour: false,
    eyebrow: 'Exhibit details · the table', title: 'On the table',
    body: 'The save-the-date is here to be handled. Click it to pick it up.', meta: 'Please touch' },
  // the save-the-date, picked up off the table: same standing spot, and Step back puts it down again
  { id: 'detVolvelle', x: 0, z: -13.95, yaw: 0, pitch: -0.5, room: 'det', accent: '#C9A667', tour: false, back: 'detTable',
    eyebrow: 'Exhibit details · on the table', title: 'Save the Date',
    body: 'Kelly Wheelis, 2026. A volvelle: a wheel that turns behind a window. Drag the wheel round, or click the card, to change the picture in the frame.',
    meta: 'Mixed media: paper, ink, gold foil & brass · edition of 100' },
  { id: 'detFrontL', x: -3.4, z: -12.75, yaw: Math.PI, room: 'det', accent: '#A79C85', tour: false,
    eyebrow: 'Exhibit details · entrance wall', title: 'A picture to come',
    body: 'This frame is waiting for its picture.', meta: 'Placeholder' },
  { id: 'detFrontR', x: 3.4, z: -12.75, yaw: Math.PI, room: 'det', accent: '#A79C85', tour: false,
    eyebrow: 'Exhibit details · entrance wall', title: 'A picture to come',
    body: 'This frame is waiting for its picture.', meta: 'Placeholder' }
];
// stops are referred to by id everywhere, never by position in the list
const ST = {};
STATIONS.forEach((st, i) => { ST[st.id] = i; });
const ROOM_ENTRY = { atrium: ST.atrium, w1: ST.w1, w2: ST.w2, det: ST.det };
const JUNCTION_Z = -7.5;

// ---------------------------------------------------------------- scene
const canvas = document.getElementById('view');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#d8cdb2');

const camera = new THREE.PerspectiveCamera(70, 1, 0.08, 120);
camera.position.set(0, EYE, 0);

const loader = new THREE.TextureLoader();
const tex = (src, rx, ry) => {
  const t = loader.load(src);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (rx) t.repeat.set(rx, ry || rx);
  return t;
};

const plaster = new THREE.MeshStandardMaterial({ map: tex('assets/tex-plaster.jpg', 2, 1.4), color: '#efe7d6', roughness: 0.95, metalness: 0 });
const plasterWide = new THREE.MeshStandardMaterial({ map: tex('assets/tex-plaster.jpg', 4, 1.4), color: '#efe7d6', roughness: 0.95, metalness: 0 });
// stone floor drawn to canvas: pale honed slabs, 0.6 x 1.2 m, laid in staggered courses
// running down the hall, each slab with its own tone, soft clouding, a faint vein or two
// and fine cut joints. One tile covers FLOOR_TILE metres and wraps seamlessly.
const FLOOR_TILE = 7.2;
function floorTexture() {
  const S = 2048, c = document.createElement('canvas');
  c.width = c.height = S;
  const x = c.getContext('2d');
  const ppm = S / FLOOR_TILE, sw = 0.6 * ppm, sl = 1.2 * ppm;
  const courses = Math.round(FLOOR_TILE / 0.6), perCourse = Math.round(FLOOR_TILE / 1.2);
  const rng = (seed) => () => {             // small seeded generator, so a slab split by the tile edge matches itself
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const slab = (px, py, seed) => {
    const r = rng(seed);
    x.save();
    x.beginPath(); x.rect(px, py, sw, sl); x.clip();
    const tone = 188 + (r() - 0.5) * 44, warm = 0.2 + r() * 0.6;
    x.fillStyle = 'rgb(' + Math.round(tone + 2 * warm) + ',' + Math.round(tone) + ',' + Math.round(tone - 7 * warm) + ')';
    x.fillRect(px, py, sw, sl);
    for (let i = 0; i < 26; i++) {           // soft clouding
      const bx = px + r() * sw, by = py + r() * sl, br = (0.12 + r() * 0.5) * sw;
      const g = x.createRadialGradient(bx, by, 0, bx, by, br);
      const a = 0.05 + r() * 0.08;
      g.addColorStop(0, (r() < 0.5 ? 'rgba(255,252,244,' : 'rgba(120,112,98,') + a + ')');
      g.addColorStop(1, 'rgba(160,155,145,0)');
      x.fillStyle = g;
      x.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    const veins = Math.floor(r() * 3);       // faint veins
    for (let i = 0; i < veins; i++) {
      x.strokeStyle = 'rgba(' + (r() < 0.5 ? '250,247,238,' : '128,120,106,') + (0.05 + r() * 0.08) + ')';
      x.lineWidth = 0.6 + r() * 1.6;
      x.beginPath();
      x.moveTo(px + r() * sw, py - 4);
      x.bezierCurveTo(px + r() * sw, py + sl * 0.35, px + r() * sw, py + sl * 0.65, px + r() * sw, py + sl + 4);
      x.stroke();
    }
    x.restore();
    x.strokeStyle = 'rgba(92,85,73,.5)';     // cut joint, with a hair of light on one side
    x.lineWidth = 1.6;
    x.strokeRect(px, py, sw, sl);
    x.strokeStyle = 'rgba(255,253,246,.16)';
    x.lineWidth = 1;
    x.strokeRect(px + 1.6, py + 1.6, sw - 3.2, sl - 3.2);
  };
  for (let i = 0; i < courses; i++) {
    const off = (i % 2) * sl / 2;
    for (let j = 0; j <= perCourse; j++) slab(i * sw, j * sl - off, i * 97 + (j % perCourse) * 13 + 5);
  }
  const img = x.getImageData(0, 0, S, S), d = img.data;   // fine grain
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 9;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 16;
  return t;
}
const stoneMap = floorTexture();
stoneMap.repeat.set(40 / FLOOR_TILE, 40 / FLOOR_TILE);
stoneMap.offset.x = 0.1 / FLOOR_TILE;          // centres a course on the hall's axis
const stone = new THREE.MeshStandardMaterial({ map: stoneMap, roughness: 0.5, metalness: 0.02 });
const ceilingMat = new THREE.MeshStandardMaterial({ color: '#e6ddc8', roughness: 1, side: THREE.DoubleSide, emissive: '#6a5f46', emissiveIntensity: 0.5 });
const skirt = new THREE.MeshStandardMaterial({ color: '#8d8578', roughness: 0.8 });
const brass = new THREE.MeshStandardMaterial({ color: '#c9a45c', roughness: 0.32, metalness: 0.85 });
const frameMat = new THREE.MeshStandardMaterial({ color: '#b3893f', roughness: 0.38, metalness: 0.6 });

// ---- ornate gilt frames: a moulded profile swept round the picture and mitred at the corners,
// carved (as a bump map) with a bead row, a plain frieze, a band of leaves and a twisted-ribbon
// edge; carved corner pieces cover the mitres, and the larger frames carry a crest.
function giltCarving() {
  const W = 512, Hh = 256, c = document.createElement('canvas');
  c.width = W; c.height = Hh;
  const x = c.getContext('2d');
  x.fillStyle = '#6e6e6e'; x.fillRect(0, 0, W, Hh);
  const band = (v0, v1) => [Math.round((1 - v1) * Hh), Math.round((v1 - v0) * Hh)];   // v = 0 at the picture, 1 at the outer edge
  let [y, h] = band(0.02, 0.13);                                   // bead row
  for (let i = 0; i < 16; i++) {
    const cx = 16 + i * 32, cy = y + h / 2, g = x.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, h * 0.62);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#8a8a8a'); g.addColorStop(1, '#1e1e1e');
    x.fillStyle = g; x.fillRect(cx - 16, y, 32, h);
  }
  [y, h] = band(0.13, 0.3);                                        // frieze, lightly sanded, with a small flower per repeat
  x.fillStyle = '#7c7c7c'; x.fillRect(0, y, W, h);
  for (let i = 0; i < 900; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.12)'; x.fillRect(Math.random() * W, y + Math.random() * h, 2, 2); }
  for (let i = 0; i < 4; i++) {
    const cx = 64 + i * 128, cy = y + h / 2;
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; x.fillStyle = '#d8d8d8'; x.beginPath(); x.ellipse(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9, 8, 5, a, 0, 6.3); x.fill(); }
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(cx, cy, 5, 0, 6.3); x.fill();
  }
  [y, h] = band(0.3, 0.74);                                        // leaf band: leaves springing outwards, tips curling
  x.fillStyle = '#2a2a2a'; x.fillRect(0, y, W, h);
  for (let i = -1; i < 9; i++) {
    [0, 32].forEach((shift, layer) => {
      const x0 = i * 64 + shift, base = y + h, tip = y + (layer ? h * 0.3 : 0.02 * h);
      const g = x.createLinearGradient(0, base, 0, tip);
      g.addColorStop(0, layer ? '#5a5a5a' : '#777777'); g.addColorStop(1, '#ffffff');
      x.fillStyle = g;
      x.beginPath(); x.moveTo(x0, base); x.bezierCurveTo(x0 - 6, base - h * 0.5, x0 + 14, tip + 6, x0 + 32, tip);
      x.bezierCurveTo(x0 + 50, tip + 6, x0 + 70, base - h * 0.5, x0 + 64, base); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 2; x.stroke();
      x.strokeStyle = 'rgba(0,0,0,.4)'; x.lineWidth = 1.5;
      x.beginPath(); x.moveTo(x0 + 32, base); x.lineTo(x0 + 32, tip + 8); x.stroke();
      for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(x0 + 32, base - k * h * 0.2); x.lineTo(x0 + 32 - 16, base - k * h * 0.2 - 12); x.moveTo(x0 + 32, base - k * h * 0.2); x.lineTo(x0 + 32 + 16, base - k * h * 0.2 - 12); x.stroke(); }
    });
  }
  [y, h] = band(0.76, 0.94);                                       // twisted ribbon round the top moulding
  for (let i = -1; i < 22; i++) {
    const g = x.createLinearGradient(i * 26, 0, i * 26 + 26, 0);
    g.addColorStop(0, '#2c2c2c'); g.addColorStop(0.5, '#f4f4f4'); g.addColorStop(1, '#2c2c2c');
    x.fillStyle = g; x.beginPath(); x.moveTo(i * 26, y + h); x.lineTo(i * 26 + 18, y); x.lineTo(i * 26 + 44, y); x.lineTo(i * 26 + 26, y + h); x.closePath(); x.fill();
  }
  // colour: the same carving, read as old gilding — bright on the high points, bole-dark in the hollows
  const img = x.getImageData(0, 0, W, Hh), c2 = document.createElement('canvas');
  c2.width = W; c2.height = Hh;
  const x2 = c2.getContext('2d'), out = x2.createImageData(W, Hh);
  for (let i = 0; i < img.data.length; i += 4) {
    const t = img.data[i] / 255, k = Math.pow(t, 0.8);
    out.data[i] = 96 + 150 * k; out.data[i + 1] = 62 + 140 * k; out.data[i + 2] = 22 + 84 * k; out.data[i + 3] = 255;
  }
  x2.putImageData(out, 0, 0);
  const mk = (cv, srgb) => { const t = new THREE.CanvasTexture(cv); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
  return { bump: mk(c, false), color: mk(c2, true) };
}
const GILT = giltCarving();
const giltMat = new THREE.MeshStandardMaterial({ map: GILT.color, bumpMap: GILT.bump, bumpScale: 5, color: '#ffe9b0', roughness: 0.4, metalness: 0.35 });
const giltPlain = new THREE.MeshStandardMaterial({ color: '#d9ab4c', roughness: 0.38, metalness: 0.4 });
// across the moulding: [distance out from the picture, height off the wall], both as fractions of the frame's width
const FRAME_PROFILE = [[0, 0.1], [0, 0.22], [0.06, 0.27], [0.13, 0.22], [0.17, 0.18], [0.3, 0.2], [0.42, 0.3], [0.55, 0.46], [0.68, 0.56], [0.76, 0.6], [0.85, 0.62], [0.93, 0.56], [0.98, 0.42], [1, 0.26], [1, 0]];
function ornateFrame(w, h) {
  const fw = THREE.MathUtils.clamp(0.085 + 0.036 * Math.max(w, h), 0.12, 0.25), tile = 0.34;
  const arc = [0];
  for (let k = 1; k < FRAME_PROFILE.length; k++) arc.push(arc[k - 1] + Math.hypot(FRAME_PROFILE[k][0] - FRAME_PROFILE[k - 1][0], FRAME_PROFILE[k][1] - FRAME_PROFILE[k - 1][1]));
  const verts = [], uvs = [], index = [];
  // each side runs between two corners; every profile point pushes both corners outwards by the same amount, which is the mitre
  [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]].forEach(([ax, ay, bx, by]) => {
    const base = verts.length / 3, len = (ax !== bx ? w : h);
    FRAME_PROFILE.forEach(([o, z], k) => {
      const e = o * fw, v = arc[k] / arc[arc.length - 1];
      verts.push(ax * (w / 2 + e), ay * (h / 2 + e), z * fw, bx * (w / 2 + e), by * (h / 2 + e), z * fw);
      uvs.push(-(len / 2 + e) / tile, v, (len / 2 + e) / tile, v);
    });
    for (let k = 0; k < FRAME_PROFILE.length - 1; k++) { const q = base + k * 2; index.push(q, q + 2, q + 1, q + 1, q + 2, q + 3); }   // wound to face the room
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  const g = new THREE.Group(), moulding = new THREE.Mesh(geo, giltMat);
  moulding.name = 'frame'; moulding.castShadow = true;
  g.add(moulding);
  const leaf = (px, py, ang, s) => {                                 // one carved leaf, lying on the frame
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), giltPlain);
    m.scale.set(s * 0.95, s * 0.36, s * 0.26); m.rotation.z = ang; m.position.set(px + Math.cos(ang) * s * 0.7, py + Math.sin(ang) * s * 0.7, fw * 0.6);
    g.add(m);
  };
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {        // corner pieces over the mitres
    const px = sx * (w / 2 + fw * 0.58), py = sy * (h / 2 + fw * 0.58), out = Math.atan2(sy, sx);
    const boss = new THREE.Mesh(new THREE.SphereGeometry(fw * 0.2, 14, 10), giltPlain);
    boss.scale.z = 0.6; boss.position.set(px, py, fw * 0.66);
    g.add(boss);
    [out, out + 2.2, out - 2.2, out + 0.75, out - 0.75].forEach((a, i) => leaf(px, py, a, fw * (i < 3 ? 0.36 : 0.27)));
  });
  if (Math.max(w, h) >= 1.1) {                                        // crest at the top centre, and its echo below
    [1, -1].forEach((sy) => {
      const py = sy * (h / 2 + fw * 0.62), s = fw * (sy > 0 ? 1 : 0.75);
      const shell = new THREE.Mesh(new THREE.SphereGeometry(s * 0.34, 16, 10), giltPlain);
      shell.scale.set(1.25, 0.95, 0.5); shell.position.set(0, py + sy * s * 0.12, fw * 0.66);
      g.add(shell);
      [0.5, 1.0, 2.14, 2.64].forEach((a) => leaf(0, py, sy > 0 ? a : -a, s * 0.4));
      [-1, 1].forEach((sd) => leaf(sd * s * 0.2, py, sd > 0 ? 0.12 * sy : Math.PI - 0.12 * sy, s * 0.5));
    });
  }
  g.userData.pictureZ = fw * 0.1 + 0.003;
  return g;
}


// ---- shell
const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), stone);
floor.name = 'floor';
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const VAULT = { x0: -2.5, x1: 2.5, z0: -10, z1: 12, spring: H, crown: H + 2.45 };
(function ceiling() {
  const plan = new THREE.Shape();
  plan.moveTo(-20, -20); plan.lineTo(20, -20); plan.lineTo(20, 20); plan.lineTo(-20, 20); plan.lineTo(-20, -20);
  [[VAULT.x0, VAULT.x1, VAULT.z0, VAULT.z1], [-12.5, -2.5, -10, -5], [2.5, 12.5, -10, -5], [-P.detX, P.detX, P.detFarZ, P.wingFarZ]].forEach((r) => {
    const h = new THREE.Path();
    h.moveTo(r[0], r[2]); h.lineTo(r[1], r[2]); h.lineTo(r[1], r[3]); h.lineTo(r[0], r[3]); h.lineTo(r[0], r[2]);
    plan.holes.push(h);
  });
  const ceil = new THREE.Mesh(new THREE.ShapeGeometry(plan), ceilingMat);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = VAULT.crown;
  scene.add(ceil);
})();

// ---- groin-vaulted ceiling over the hall
function vaultTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 1024;
  const x = c.getContext('2d');
  x.fillStyle = '#d9cdb1'; x.fillRect(0, 0, 1024, 1024);
  const rows = 30, cols = 30;
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const w = 1024 / cols, h = 1024 / rows;
      const off = (r % 2) * w * 0.5;
      const t = 196 + Math.random() * 40;
      x.fillStyle = 'rgb(' + Math.round(t) + ',' + Math.round(t * 0.93) + ',' + Math.round(t * 0.79) + ')';
      x.fillRect(k * w + off + 1.4, r * h + 1.4, w - 2.8, h - 2.8);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const vaultMap = vaultTexture();
vaultMap.repeat.set(5, 3.4);
vaultMap.anisotropy = 8;
const vaultMat = new THREE.MeshStandardMaterial({ map: vaultMap, color: '#e8d9b4', roughness: 1, side: THREE.DoubleSide, emissive: '#4a3d22', emissiveIntensity: 0.22 });
const ribMat = new THREE.MeshStandardMaterial({ color: '#e9dfc6', roughness: 0.92 });

// walls: which bay edges stand on a wall — xn/xp = the -x/+x edge, zn/zp = the -z/+z edge
function groinBay(cx, cz, W, D, walls) {
  const rise = VAULT.crown - VAULT.spring;
  // four webs of a true groin vault: two crossing barrels, each kept only where it is
  // the higher of the two, so the surface creases exactly along the diagonal ribs
  const M = 48, K = 12;
  const verts = [], uvs = [], index = [];
  [[0, 1], [0, -1], [1, 1], [1, -1]].forEach(([axis, side]) => {
    const base = verts.length / 3;
    for (let i = 0; i <= M; i++) {
      const th = Math.PI * i / M;
      const c = Math.cos(th), s = Math.sin(th);
      for (let j = 0; j <= K; j++) {
        const n = side * (1 - (j / K) * (1 - Math.abs(c)));   // bay edge -> groin line
        const x = axis === 0 ? c * W / 2 : n * W / 2;
        const z = axis === 0 ? n * D / 2 : c * D / 2;
        verts.push(cx + x, VAULT.spring + rise * s, cz + z);
        uvs.push(n * 0.5 + 0.5, i / M);
      }
    }
    for (let i = 0; i < M; i++) {
      for (let j = 0; j < K; j++) {
        const a = base + i * (K + 1) + j, b = a + 1, c2 = a + K + 1, d = c2 + 1;
        index.push(a, c2, b, b, c2, d);
      }
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, vaultMat);
  scene.add(m);

  // ribs are pulled in by their own radius on any side that is a wall, so they sit
  // against the wall instead of poking through into the room behind it
  const IN = 0.058;
  const fx = (lx) => lx * (1 - ((lx < 0 ? walls.xn : walls.xp) ? IN / (W / 2) : 0));
  const fz = (lz) => lz * (1 - ((lz < 0 ? walls.zn : walls.zp) ? IN / (D / 2) : 0));
  const arch = (t) => VAULT.crown - rise * (1 - Math.sqrt(Math.max(0, 1 - Math.pow(2 * t - 1, 2)))) - 0.04;
  const tube = (pts, r) => scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 8, false), ribMat));

  // diagonal groin ribs
  [1, -1].forEach((dir) => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      pts.push(new THREE.Vector3(cx + fx((t - 0.5) * W), arch(t), cz + fz(dir * (t - 0.5) * D)));
    }
    tube(pts, 0.05);
  });

  // carved boss at the crown, where the diagonal ribs cross
  const boss = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 12), ribMat);
  boss.scale.y = 0.55;
  boss.position.set(cx, VAULT.crown - 0.09, cz);
  const bossEye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), frameMat);
  bossEye.position.set(cx, VAULT.crown - 0.18, cz);
  scene.add(boss, bossEye);

  // an arch on every bay edge: a wall rib where the edge is a wall, a transverse arch
  // where it opens onto the next bay (drawn once, by the bay on its positive side)
  [['xn', 1, -1], ['xp', 1, 1], ['zn', 0, -1], ['zp', 0, 1]].forEach(([edge, axis, side]) => {
    if (!walls[edge] && side > 0) return;
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const lx = axis === 0 ? (t - 0.5) * W : side * W / 2;
      const lz = axis === 0 ? side * D / 2 : (t - 0.5) * D;
      pts.push(new THREE.Vector3(cx + fx(lx), arch(t), cz + fz(lz)));
    }
    tube(pts, 0.055);
  });
}

(function endCaps() {
  [VAULT.z1, VAULT.z0].forEach((z) => {
    const cap = new THREE.Mesh(new THREE.PlaneGeometry(VAULT.x1 - VAULT.x0, VAULT.crown - VAULT.spring + 0.1), plaster);
    cap.position.set(0, VAULT.spring + (VAULT.crown - VAULT.spring) / 2, z);
    scene.add(cap);
  });
})();

// wall lunette: carries a wall from the springing up to the crown behind a bay edge;
// the vault hides everything outside the arch
function lunette(x1, z1, x2, z2) {
  const len = Math.hypot(x2 - x1, z2 - z1), h = VAULT.crown - VAULT.spring;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(len, h), plaster);
  m.position.set((x1 + x2) / 2, VAULT.spring + h / 2, (z1 + z2) / 2);
  m.rotation.y = Math.atan2(x2 - x1, z2 - z1) + Math.PI / 2;
  scene.add(m);
}

(function vaultWings() {
  [-10, -5, 5, 10].forEach((cx) => {
    // side walls front and back; the outer bay ends on the wing end wall, the inner on the hall wall
    groinBay(cx, -7.5, 5, 5, { zn: true, zp: true, xn: cx === -10 || cx === 5, xp: cx === -5 || cx === 10 });
    lunette(cx - 2.5, -5, cx + 2.5, -5);
    lunette(cx - 2.5, -10, cx + 2.5, -10);
  });
  [-12.5, 12.5].forEach((x) => lunette(x, -10, x, -5));
})();

(function vaultHall() {
  const W = VAULT.x1 - VAULT.x0;
  // bays follow the plan: the atrium in equal bays, then one square bay over the crossing
  // (centred on the wing arches), ending on the details-arch wall
  const atrium = 3, aD = (P.backZ - P.wingNearZ) / atrium;
  const edges = [];
  for (let i = 0; i <= atrium; i++) edges.push(P.backZ - i * aD);
  edges.push(P.wingFarZ);
  for (let i = 0; i < edges.length - 1; i++) {
    const zp = edges[i], zn = edges[i + 1];
    groinBay(0, (zp + zn) / 2, W, zp - zn, {
      xn: true, xp: true,
      zp: zp === P.backZ || zp === P.wingFarZ,
      zn: zn === P.wingFarZ
    });
    [VAULT.x0, VAULT.x1].forEach((x) => lunette(x, zp, x, zn));
  }
})();


// wall builder: from (x1,z1) to (x2,z2), facing chosen by normal sign
function wall(x1, z1, x2, z2, mat) {
  const len = Math.hypot(x2 - x1, z2 - z1);
  const g = new THREE.PlaneGeometry(len, H);
  const m = new THREE.Mesh(g, mat || plaster);
  m.position.set((x1 + x2) / 2, H / 2, (z1 + z2) / 2);
  m.rotation.y = Math.atan2(x2 - x1, z2 - z1) + Math.PI / 2;
  m.receiveShadow = true;
  m.material.side = THREE.DoubleSide;
  scene.add(m);

  const base = new THREE.Mesh(new THREE.BoxGeometry(len, 0.16, 0.05), skirt);
  base.position.set(m.position.x, 0.08, m.position.z);
  base.rotation.y = m.rotation.y;
  scene.add(base);
  return m;
}

// corridor runs unbroken from the entrance to the details hall, with a doorway per wing
const DOOR_A = -6.2, DOOR_B = -8.8;   // wing doorway, 2.6 m
[-P.corrX, P.corrX].forEach((sx) => {
  wall(sx, P.backZ, sx, DOOR_A, plasterWide);
  wall(sx, DOOR_B, sx, P.wingFarZ, plasterWide);
});
wall(-P.corrX, P.backZ, P.corrX, P.backZ);

// wings
wall(-P.wingEndX, P.wingNearZ, -P.corrX, P.wingNearZ, plasterWide);
wall(-P.wingEndX, P.wingFarZ, -P.corrX, P.wingFarZ, plasterWide);
wall(-P.wingEndX, P.wingFarZ, -P.wingEndX, P.wingNearZ);
wall(P.corrX, P.wingNearZ, P.wingEndX, P.wingNearZ, plasterWide);
wall(P.corrX, P.wingFarZ, P.wingEndX, P.wingFarZ, plasterWide);
wall(P.wingEndX, P.wingFarZ, P.wingEndX, P.wingNearZ);


// a wall face with an arched opening cut up from the floor, traced as one outline so the
// opening leaves no face lying on the floor
function archedWallShape(half, top, r, springs) {
  const s = new THREE.Shape();
  s.moveTo(-half, 0); s.lineTo(-half, top); s.lineTo(half, top); s.lineTo(half, 0);
  s.lineTo(r, 0); s.lineTo(r, springs);
  s.absarc(0, springs, r, 0, Math.PI, false);
  s.lineTo(-r, 0); s.lineTo(-half, 0);
  return s;
}

// arched doorway into a wing (sx = -1 left, 1 right): the hall wall is given real thickness
// across the wing's end, set back into the wing, so the hall face stays flush and the
// depth of the wall shows only inside the opening
function wingPortal(sx, z, openW, springs) {
  const r = openW / 2, T = 0.26;
  const half = (P.wingNearZ - P.wingFarZ) / 2 - 0.005;
  // a touch taller than the wall so its top tucks in behind the lunette with no slit between
  const outer = archedWallShape(half, H + 0.02, r, springs);
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(outer, { depth: T, bevelEnabled: false }), plaster);
  m.position.set(sx * (P.corrX + 0.004), 0, z);
  m.rotation.y = Math.PI / 2;
  if (sx < 0) m.translateZ(-T);
  m.receiveShadow = true;
  scene.add(m);

  // skirting on the wing face, either side of the opening
  [-1, 1].forEach((sz) => {
    const len = half - r;
    const base = new THREE.Mesh(new THREE.BoxGeometry(len, 0.16, 0.05), skirt);
    base.position.set(sx * (P.corrX + 0.004 + T), 0.08, z + sz * (r + len / 2));
    base.rotation.y = Math.PI / 2;
    scene.add(base);
  });
}

// arched openings into both wings
wingPortal(-1, -7.5, 2.6, 2.3);
wingPortal(1, -7.5, 2.6, 2.3);

// arched doorway into the details hall
(function detailsArch() {
  const z = P.wingFarZ, openW = 2.7, springs = 2.3, r = openW / 2;
  // one solid wall with the arch cut out of it, so nothing is left open above the curve
  const face = archedWallShape(P.corrX, H, r, springs);
  const wallMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(face, { depth: 0.28, bevelEnabled: false }), plaster);
  wallMesh.position.set(0, 0, z - 0.14);
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);
  const shape = new THREE.Shape();
  shape.moveTo(-r, 0); shape.lineTo(-r, springs);
  shape.absarc(0, springs, r, Math.PI, 0, true);
  shape.lineTo(r, 0); shape.lineTo(-r, 0);
  const cut = new THREE.Shape();
  cut.moveTo(-r - 0.16, -0.02); cut.lineTo(-r - 0.16, springs);
  cut.absarc(0, springs, r + 0.16, Math.PI, 0, true);
  cut.lineTo(r + 0.16, -0.02); cut.lineTo(-r - 0.16, -0.02);
  cut.holes.push(new THREE.Path(shape.getPoints(48)));
  const band = new THREE.Mesh(new THREE.ExtrudeGeometry(cut, { depth: 0.3, bevelEnabled: false }), plaster);
  band.position.set(0, 0, z - 0.15);
  scene.add(band);
})();

// ---- columns and dome
const stoneMat = new THREE.MeshStandardMaterial({ map: tex('assets/tex-plaster.jpg', 1, 2), color: '#ded2b6', roughness: 0.92 });

function column(x, z) {
  const g = new THREE.Group();
  const shaftH = H - 0.72;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 0.22, 24), stoneMat);
  base.position.y = 0.11;
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.11, 0.58), stoneMat);
  plinth.position.y = 0.055;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.2, shaftH, 28), stoneMat);
  shaft.position.y = 0.22 + shaftH / 2;
  shaft.castShadow = true;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.175, 0.13, 24), stoneMat);
  neck.position.y = 0.22 + shaftH + 0.065;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.17, 0.54), stoneMat);
  cap.position.y = 0.22 + shaftH + 0.21;
  [plinth, base, shaft, neck, cap].forEach((m) => { m.name = 'column'; g.add(m); });
  g.position.set(x, 0, z);
  scene.add(g);
}

// flanking each wing arch, and the arch into the details hall
[-1, 1].forEach((sx) => { column(sx * (P.corrX - 0.32), P.wingFarZ + 0.55); });

// ---- artwork
function painting(src, aspect, w, x, z, rotY, station, closer) {
  const h = w / aspect;
  const grp = new THREE.Group();
  const frame = ornateFrame(w, h);
  frame.position.z = -0.045;
  grp.add(frame);
  const canvasMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: tex(src), roughness: 0.62 })
  );
  canvasMesh.name = 'canvas';
  canvasMesh.position.z = -0.045 + frame.userData.pictureZ;
  grp.add(canvasMesh);
  grp.position.set(x, 1.95, z);
  grp.rotation.y = rotY;
  grp.userData.station = station;   // the stop that faces this picture; clicking it takes you there
  grp.userData.closer = closer;     // clicking again from that stop steps you up close
  scene.add(grp);
  return grp;
}

painting('assets/birth-of-venus.jpg', 278 / 172, 3.6, -P.wingEndX + 0.07, -7.5, Math.PI / 2, ST.w1, ST.w1close);
painting('assets/primavera.jpg', 314 / 203, 3.6, P.wingEndX - 0.07, -7.5, -Math.PI / 2, ST.w2, ST.w2close);

function plate(colorA, colorB, x, z, rotY, station) {
  const g = new THREE.Group();
  const f = ornateFrame(0.94, 1.3);
  f.position.z = -0.04;
  g.add(f);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 340;
  const cx = c.getContext('2d');
  const grad = cx.createLinearGradient(0, 0, 256, 340);
  grad.addColorStop(0, colorA); grad.addColorStop(1, colorB);
  cx.fillStyle = grad; cx.fillRect(0, 0, 256, 340);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 1.3), new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 }));
  p.position.z = -0.04 + f.userData.pictureZ;
  g.add(p);
  g.position.set(x, 1.95, z);
  g.rotation.y = rotY;
  g.userData.station = station;
  scene.add(g);
}
plate('#f3e4ce', '#3b4a45', -1500 * U, P.wingFarZ + 0.07, 0, ST.w1a);
plate('#fbeedc', '#5a3a30', -1500 * U, P.wingNearZ - 0.07, Math.PI, ST.w1b);
plate('#f0a86c', '#241612', 1500 * U, P.wingFarZ + 0.07, 0, ST.w2a);
plate('#f7de9b', '#2e230c', 1500 * U, P.wingNearZ - 0.07, Math.PI, ST.w2b);

// ---------------------------------------------------------------- details room
// a salon-hung gallery room after the reference (assets/ref-terracotta.jpg): burgundy walls
// over a pale dado, a coved ceiling, one large picture per wall with smaller ones stacked
// around it, busts on pedestals, console tables along the walls and a table in the centre
const DET = { x: P.detX, zF: P.wingFarZ - 0.145, zB: P.detFarZ, cove: 2.1, rise: 2.0 };
DET.zMid = (DET.zF + DET.zB) / 2;
const BURGUNDY = '#7A1A3C';                       // the invitation burgundy, sampled from the KA monogram
const BURGUNDY_PAINT = '#6c1637';                 // mixed darker and cooler: under the warm lamps it renders close to BURGUNDY
const burgundy = new THREE.MeshStandardMaterial({ map: tex('assets/tex-plaster.jpg', 3, 1.4), color: BURGUNDY_PAINT, roughness: 0.9 });
const burgundyFront = new THREE.MeshStandardMaterial({ map: tex('assets/tex-plaster.jpg', 0.3, 0.36), color: BURGUNDY_PAINT, roughness: 0.9, side: THREE.DoubleSide });
const marbleWhite = new THREE.MeshStandardMaterial({ color: '#efebe2', roughness: 0.5 });
const marbleBlue = new THREE.MeshStandardMaterial({ color: '#b3bec4', roughness: 0.3, metalness: 0.02 });
const marbleRed = new THREE.MeshStandardMaterial({ color: '#6d3b35', roughness: 0.3, metalness: 0.02 });
const paintedWood = new THREE.MeshStandardMaterial({ color: '#e7e1d2', roughness: 0.7 });

(function detailsShell() {
  wall(-DET.x, DET.zF, -DET.x, DET.zB, burgundy);
  wall(DET.x, DET.zB, DET.x, DET.zF, burgundy);
  wall(-DET.x, DET.zB, DET.x, DET.zB, burgundy);
  // entrance wall, room side: one face with the details arch cut through it
  const front = new THREE.Mesh(new THREE.ShapeGeometry(archedWallShape(DET.x, H, 1.35, 2.3), 32), burgundyFront);
  front.position.set(0, 0, DET.zF);
  front.rotation.y = Math.PI;
  scene.add(front);

  // pale dado with a cap rail, and a gilt cornice where the cove springs
  const run = (x1, z1, x2, z2) => {
    const len = Math.hypot(x2 - x1, z2 - z1), rotY = Math.atan2(x2 - x1, z2 - z1) + Math.PI / 2;
    [[0.9, 0.06, 0.45, stoneMat], [0.07, 0.11, 0.935, stoneMat], [0.16, 0.24, H - 0.03, frameMat]].forEach(([h, d, y, mat]) => {
      if (mat === frameMat && Math.abs(len - (DET.x - 1.55)) < 0.01) return;   // cornice is laid in full runs below
      const m = new THREE.Mesh(new THREE.BoxGeometry(len, h, d), mat);
      m.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
      m.rotation.y = rotY;
      scene.add(m);
    });
  };
  run(-DET.x, DET.zF, -DET.x, DET.zB);
  run(DET.x, DET.zB, DET.x, DET.zF);
  run(-DET.x, DET.zB, DET.x, DET.zB);
  run(-DET.x, DET.zF, -1.55, DET.zF);             // either side of the arch
  run(1.55, DET.zF, DET.x, DET.zF);
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(DET.x * 2, 0.16, 0.24), frameMat);
  cornice.position.set(0, H - 0.03, DET.zF);
  scene.add(cornice);
})();

(function detailsCeiling() {
  // four coves, mitred at the corners: a quarter-ellipse swept along each wall, rising to a flat centre
  const x0 = -DET.x, x1 = DET.x, z0 = DET.zB, z1 = DET.zF, c = DET.cove, top = H + DET.rise, N = 20;
  const verts = [], uvs = [], index = [];
  [[[x0, z0], [x1, z0], [0, 1]], [[x1, z1], [x0, z1], [0, -1]], [[x0, z1], [x0, z0], [1, 0]], [[x1, z0], [x1, z1], [-1, 0]]].forEach(([a, b, n]) => {
    const base = verts.length / 3, len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len;
    for (let i = 0; i <= N; i++) {
      const th = (Math.PI / 2) * i / N, d = c * (1 - Math.cos(th)), y = H + DET.rise * Math.sin(th);
      [d, len - d].forEach((t) => {               // the strip shortens as it rises, meeting its neighbours on the mitre
        verts.push(a[0] + ux * t + n[0] * d, y, a[1] + uz * t + n[1] * d);
        uvs.push(t / len, i / N);
      });
    }
    for (let i = 0; i < N; i++) { const k = base + i * 2; index.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  const coveMat = new THREE.MeshStandardMaterial({ color: '#eadfc6', roughness: 1, side: THREE.DoubleSide, emissive: '#5a4f3a', emissiveIntensity: 0.3 });
  scene.add(new THREE.Mesh(g, coveMat));

  // flat centre: a placeholder ceiling painting (soft sky) in a gilt frame
  const pw = x1 - x0 - 2 * c, pd = z1 - z0 - 2 * c;
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = Math.round(512 * pd / pw);
  const x = cv.getContext('2d');
  const sky = x.createLinearGradient(0, 0, 0, cv.height);
  sky.addColorStop(0, '#7f9db8'); sky.addColorStop(0.55, '#b9c6c8'); sky.addColorStop(1, '#e3c398');
  x.fillStyle = sky; x.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < 40; i++) {
    const bx = Math.random() * cv.width, by = Math.random() * cv.height, br = 30 + Math.random() * 90;
    const cl = x.createRadialGradient(bx, by, 0, bx, by, br);
    cl.addColorStop(0, 'rgba(255,246,228,' + (0.10 + Math.random() * 0.16) + ')'); cl.addColorStop(1, 'rgba(255,246,228,0)');
    x.fillStyle = cl; x.fillRect(bx - br, by - br, br * 2, br * 2);
  }
  const skyTex = new THREE.CanvasTexture(cv);
  skyTex.colorSpace = THREE.SRGBColorSpace;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(pw, pd), new THREE.MeshBasicMaterial({ map: skyTex }));
  panel.rotation.x = Math.PI / 2;
  panel.position.set(0, top, (z0 + z1) / 2);
  scene.add(panel);
  [[pw + 0.3, 0.15, 0, -pd / 2], [pw + 0.3, 0.15, 0, pd / 2], [0.15, pd + 0.3, -pw / 2, 0], [0.15, pd + 0.3, pw / 2, 0]].forEach(([w, d, ox, oz]) => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), frameMat);
    f.position.set(ox, top - 0.04, (z0 + z1) / 2 + oz);
    scene.add(f);
  });
})();

// ---- the hang. Each entry is one picture: which wall, where along it, centre height, size.
// Give an entry a `src` (an image in assets/) to hang a real picture; without one it shows a
// placeholder study. `blank: true` is the empty frame waiting for a name (the RSVP station).
const DETAIL_PICTURES = [
  { wall: 'back', at: 0, y: 2.55, w: 3.4, h: 2.3, close: true },                 // principal work, end wall
  { wall: 'back', at: -3.62, y: 3.0, w: 1.1, h: 0.9 },              // stacks stand clear of the statues
  { wall: 'back', at: -3.62, y: 1.85, w: 1.0, h: 0.8 },
  { wall: 'back', at: 3.62, y: 2.95, w: 1.3, h: 1.0 },
  { wall: 'back', at: 3.27, y: 1.8, w: 0.55, h: 0.7 },
  { wall: 'back', at: 3.97, y: 1.8, w: 0.55, h: 0.7 },
  { wall: 'left', at: DET.zMid, y: 2.5, w: 3.0, h: 2.0, close: true },           // "Everything we love, catalogued"
  { wall: 'left', at: DET.zMid + 2.75, y: 2.5, w: 1.2, h: 1.5 },
  { wall: 'left', at: DET.zMid - 2.75, y: 2.5, w: 1.2, h: 1.5 },
  { wall: 'right', at: DET.zMid, y: 2.5, w: 3.0, h: 2.0, blank: true, close: true },   // RSVP: the frame that gets a name in it
  { wall: 'right', at: DET.zMid + 2.75, y: 2.5, w: 1.2, h: 1.5 },
  { wall: 'right', at: DET.zMid - 2.75, y: 2.5, w: 1.2, h: 1.5 },
  { wall: 'front', at: -3.4, y: 2.45, w: 1.3, h: 1.7 },
  { wall: 'front', at: 3.4, y: 2.45, w: 1.3, h: 1.7 }
];
const STUDY_TONES = [['#c9b28a', '#3a2a1a'], ['#9fb0a6', '#1f2a2a'], ['#d6a77a', '#3b1e14'], ['#b9c0cf', '#252a3a'], ['#c8c08a', '#2e2c12'], ['#c7a0a0', '#351a1e']];
function studyTexture(i, aspect, blank) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = Math.round(256 / aspect);
  const x = c.getContext('2d');
  if (blank) {
    x.fillStyle = '#efe6d2'; x.fillRect(0, 0, c.width, c.height);
  } else {
    const [lt, dk] = STUDY_TONES[i % STUDY_TONES.length];
    const g = x.createRadialGradient(c.width * (0.35 + 0.3 * ((i * 37) % 10) / 10), c.height * 0.42, 4, c.width / 2, c.height / 2, c.width * 0.75);
    g.addColorStop(0, lt); g.addColorStop(1, dk);
    x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
// an ornate gilt frame round a picture; `src` hangs an image, otherwise a placeholder
function framedPicture(p, i) {
  const grp = new THREE.Group();
  const frame = ornateFrame(p.w, p.h);
  frame.position.z = -0.07;
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), new THREE.MeshStandardMaterial({ map: p.src ? tex(p.src) : studyTexture(i, p.w / p.h, p.blank), roughness: 0.62 }));
  pic.position.z = -0.07 + frame.userData.pictureZ;
  if (p.src) { pic.material.map.wrapS = pic.material.map.wrapT = THREE.ClampToEdgeWrapping; }
  [frame, pic].forEach((m) => grp.add(m));
  scene.add(grp);
  return grp;
}
DETAIL_PICTURES.forEach((p, i) => {
  const grp = framedPicture(p, i);
  const off = 0.075;                               // stand the frame just off the wall (and the dado line)
  if (p.wall === 'back') { grp.position.set(p.at, p.y, DET.zB + off); }
  if (p.wall === 'front') { grp.position.set(p.at, p.y, DET.zF - off); grp.rotation.y = Math.PI; }
  if (p.wall === 'left') { grp.position.set(-DET.x + off, p.y, p.at); grp.rotation.y = Math.PI / 2; }
  if (p.wall === 'right') { grp.position.set(DET.x - off, p.y, p.at); grp.rotation.y = -Math.PI / 2; }
  grp.userData.station = p.wall === 'front' ? (p.at < 0 ? ST.detFrontL : ST.detFrontR)
    : p.close ? { back: ST.detClose, left: ST.detLclose, right: ST.detRclose }[p.wall]
    : p.wall === 'back' ? (p.at < 0 ? ST.detStackL : ST.detStackR)      // the stacks either side of the principal picture
    : { left: ST.detL, right: ST.detR }[p.wall];
});

// ---- atrium mini galleries: three frames a side, Kelly on the left wall, Anthony on the right.
// Each frame has its own stop directly in front of it. Give a frame a `src` (an image in
// assets/) to hang a photograph; until then it shows an empty mount.
const ATRIUM_PICTURES = [
  { who: 'kelly', stop: 'kelly', dz: 0, y: 2.0, w: 1.15, h: 1.5, blank: true },
  { who: 'kelly', stop: 'kelly1', dz: 1.3, y: 2.12, w: 0.8, h: 1.05, blank: true },
  { who: 'kelly', stop: 'kelly2', dz: -1.3, y: 1.88, w: 0.8, h: 1.05, blank: true },
  { who: 'anthony', stop: 'anthony', dz: 0, y: 2.0, w: 1.15, h: 1.5, blank: true },
  { who: 'anthony', stop: 'anthony1', dz: 1.3, y: 1.88, w: 0.8, h: 1.05, blank: true },
  { who: 'anthony', stop: 'anthony2', dz: -1.3, y: 2.12, w: 0.8, h: 1.05, blank: true }
];
ATRIUM_PICTURES.forEach((p, i) => {
  const grp = framedPicture(p, i);
  const sx = p.who === 'kelly' ? -1 : 1;
  grp.position.set(sx * (P.corrX - 0.075), p.y, GALLERY_Z + p.dz);
  grp.rotation.y = sx < 0 ? Math.PI / 2 : -Math.PI / 2;
  grp.userData.station = ST[p.stop];
});

// ---- an engraved brass name plaque under each gallery's large frame
const GALLERY_NAMES = { kelly: 'KELLY', anthony: 'ANTHONY' };
function plaqueTexture(text, px) {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 205;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, c.height);           // brushed brass
  g.addColorStop(0, '#d9bb74'); g.addColorStop(0.45, '#b8934a'); g.addColorStop(1, '#8f6f33');
  x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 260; i++) {
    x.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '255,244,210,' : '60,40,10,') + (0.03 + Math.random() * 0.05) + ')';
    x.fillRect(0, Math.random() * c.height, c.width, 1);
  }
  x.strokeStyle = 'rgba(58,40,10,.7)'; x.lineWidth = 3; x.strokeRect(14, 14, c.width - 28, c.height - 28);
  [[36, 36], [c.width - 36, 36], [36, c.height - 36], [c.width - 36, c.height - 36]].forEach(([sx, sy]) => {   // screws
    x.fillStyle = '#7a5d28'; x.beginPath(); x.arc(sx, sy, 7, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(40,26,6,.8)'; x.lineWidth = 2; x.beginPath(); x.moveTo(sx - 5, sy); x.lineTo(sx + 5, sy); x.stroke();
  });
  x.font = '600 ' + px + 'px Georgia';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  if ('letterSpacing' in x) x.letterSpacing = Math.round(px * 0.18) + 'px';
  x.fillStyle = 'rgba(255,242,205,.55)'; x.fillText(text, c.width / 2, c.height / 2 + 5);   // lower lip of the engraving catches light
  x.fillStyle = '#34240a'; x.fillText(text, c.width / 2, c.height / 2 + 3);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
Object.keys(GALLERY_NAMES).forEach((who) => {
  const sx = who === 'kelly' ? -1 : 1;
  const plate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.24, 0.025), brass);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.24), new THREE.MeshStandardMaterial({ map: plaqueTexture(GALLERY_NAMES[who], 84), roughness: 0.45, metalness: 0.15 }));
  face.position.z = 0.0135;
  const g = new THREE.Group();
  g.add(plate, face);
  g.position.set(sx * (P.corrX - 0.02), 0.86, GALLERY_Z);        // just under the large frame
  g.rotation.y = sx < 0 ? Math.PI / 2 : -Math.PI / 2;
  g.userData.station = ST[who];
  scene.add(g);
});

// ---- raised gilt numerals above the wing arches, built from bars and serifs
function numeral(count, sx) {
  const g = new THREE.Group();
  const barW = 0.18, barH = 0.9, gap = 0.42, serifH = 0.1, depth = 0.1;
  const span = (count - 1) * gap;
  for (let k = 0; k < count; k++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(barW, barH, depth), frameMat);
    bar.position.x = -span / 2 + k * gap;
    g.add(bar);
  }
  [1, -1].forEach((sy) => {
    const serif = new THREE.Mesh(new THREE.BoxGeometry(span + barW + 0.28, serifH, depth), frameMat);
    serif.position.y = sy * (barH / 2 + serifH / 2);
    g.add(serif);
  });
  g.position.set(sx * (P.corrX - depth / 2 - 0.005), H + 0.8, -7.5);
  g.rotation.y = sx < 0 ? Math.PI / 2 : -Math.PI / 2;
  scene.add(g);
}
numeral(1, -1);      // I, over the Wing I arch
numeral(2, 1);       // II, over the Wing II arch

// ---- sculpture spots. Every pedestal or plinth that can carry a real sculpture registers itself
// here under an id, along with the placeholder it shows until a 3D scan is assigned to it
// (see SCULPTURES, further down).
const SCULPTURE_SPOTS = {};    // id -> { group, top: height of the surface it stands on, placeholder: [meshes] }

// ---- furniture and sculpture, built from simple solids
function bust(x, z, rotY, id) {
  const g = new THREE.Group();
  [[0.52, 0.12, 0.52, 0.06], [0.4, 1.0, 0.4, 0.62], [0.5, 0.1, 0.5, 1.17]].forEach(([w, h, d, y]) => {   // pedestal
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stoneMat);
    m.position.y = y; g.add(m);
  });
  // socle, chest and shoulders turned as one profile, then flattened front to back like a carved bust
  const profile = [[0.0, 0], [0.12, 0], [0.085, 0.09], [0.09, 0.13], [0.17, 0.17], [0.25, 0.27], [0.27, 0.36], [0.22, 0.43], [0.12, 0.47], [0.072, 0.5], [0.065, 0.6], [0, 0.6]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const torso = new THREE.Mesh(new THREE.LatheGeometry(profile, 32), marbleWhite);
  torso.scale.set(1, 1, 0.62); torso.position.y = 1.22;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 24, 18), marbleWhite);
  head.scale.set(0.88, 1.18, 1.0); head.position.set(0, 1.9, 0.01);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.06, 10), marbleWhite);
  nose.rotation.x = Math.PI / 2 - 0.5; nose.position.set(0, 1.885, 0.118);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.122, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), marbleWhite);
  hair.scale.set(0.92, 1.12, 1.05); hair.position.set(0, 1.91, -0.012); hair.rotation.x = -0.35;
  [torso, head, nose, hair].forEach((m) => g.add(m));
  if (id) SCULPTURE_SPOTS[id] = { group: g, top: 1.22, placeholder: [torso, head, nose, hair] };
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);
}
function table(x, z, rotY, w, d, topMat, bodyMat, legs) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.07, d), topMat);
  top.position.y = 0.865;
  const apron = new THREE.Mesh(new THREE.BoxGeometry(w - 0.16, 0.13, d - 0.14), bodyMat);
  apron.position.y = 0.765;
  g.add(top, apron);
  const lx = w / 2 - 0.14, lz = d / 2 - 0.12;
  const spots = legs === 6 ? [[-lx, -lz], [0, -lz], [lx, -lz], [-lx, lz], [0, lz], [lx, lz]] : [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]];
  spots.forEach(([px, pz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.7, 14), bodyMat);
    leg.position.set(px, 0.35, pz);
    g.add(leg);
  });
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);
  return g;
}
bust(-4.62, DET.zB + 0.5, 0, 'detEndL');                       // flanking the end-wall hang
bust(4.62, DET.zB + 0.5, 0, 'detEndR');
place(reservedPlinth('STATUE', 'detStatueL'), -2.5, DET.zB + 0.62, 0);   // large figures flanking the principal picture
place(reservedPlinth('STATUE', 'detStatueR'), 2.5, DET.zB + 0.62, 0);
bust(-2.15, DET.zF - 0.5, Math.PI, 'detEntryL');                 // flanking the entrance arch, facing into the room
bust(2.15, DET.zF - 0.5, Math.PI, 'detEntryR');
table(0, DET.zMid - 0.9, 0, 2.4, 1.2, marbleBlue, paintedWood, 6).userData.station = ST.detTable;           // centre table
table(0, DET.zB + 0.36, 0, 2.6, 0.5, marbleRed, frameMat, 4);                // gilt consoles under the principal pictures
table(-DET.x + 0.36, DET.zMid, Math.PI / 2, 2.0, 0.5, marbleRed, frameMat, 4);
table(DET.x - 0.36, DET.zMid, Math.PI / 2, 2.0, 0.5, marbleRed, frameMat, 4);

// ---- room lighting: four warm pools, and an unshadowed picture light on each principal work
[[-2.4, DET.zF - 2.2], [2.4, DET.zF - 2.2], [-2.4, DET.zB + 2.2], [2.4, DET.zB + 2.2]].forEach(([x, z]) => {
  const pl = new THREE.PointLight('#ffeccb', 9, 11, 2);
  pl.position.set(x, H + 0.9, z);
  scene.add(pl);
});

// ---------------------------------------------------------------- architectural detail
// the stone dressing of an Italian gallery: a cornice where the vaults spring, pilasters marking
// the atrium's bays, moulded surrounds and keystones on the arches, and the entrance doors
const trimMat = new THREE.MeshStandardMaterial({ color: '#d8ccb0', roughness: 0.9 });
const walnutDoor = new THREE.MeshStandardMaterial({ map: tex('assets/door-walnut-panel.jpg'), roughness: 0.6 });
function boxRun(x1, z1, x2, z2, y, h, d, mat) {       // a moulding laid along a wall line, centred on it
  const len = Math.hypot(x2 - x1, z2 - z1);
  const m = new THREE.Mesh(new THREE.BoxGeometry(len, h, d), mat || trimMat);
  m.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
  m.rotation.y = Math.atan2(x2 - x1, z2 - z1) + Math.PI / 2;
  scene.add(m);
}
function cornice(x1, z1, x2, z2) {
  boxRun(x1, z1, x2, z2, H - 0.05, 0.1, 0.17);
  boxRun(x1, z1, x2, z2, H - 0.135, 0.07, 0.09);
}
(function cornices() {
  const c = P.corrX, e = P.wingEndX, face = P.wingFarZ + 0.14;
  [-c, c].forEach((x) => cornice(x, P.backZ, x, P.wingFarZ));          // hall sides (shared with the wings' inner ends)
  cornice(-c, P.backZ, c, P.backZ);
  cornice(-c, face, -1.5, face); cornice(1.5, face, c, face);           // details-arch wall, either side of the plaque
  [-1, 1].forEach((sx) => {
    cornice(sx * c, P.wingNearZ, sx * e, P.wingNearZ);
    cornice(sx * c, P.wingFarZ, sx * e, P.wingFarZ);
    cornice(sx * e, P.wingFarZ, sx * e, P.wingNearZ);
    cornice(sx * (c + 0.264), P.wingFarZ, sx * (c + 0.264), P.wingNearZ);   // wing face of the doorway wall
  });
})();
(function pilasters() {
  // one under each rib springer along the atrium, on both walls
  const bay = (P.backZ - P.wingNearZ) / 3;
  [P.backZ - bay, P.backZ - 2 * bay, P.wingNearZ].forEach((z) => {
    [-P.corrX, P.corrX].forEach((x) => {
      [[0.44, H - 0.17, 0.14, (H - 0.17) / 2], [0.54, 0.22, 0.2, 0.11], [0.5, 0.06, 0.17, 0.25], [0.54, 0.15, 0.2, H - 0.245], [0.5, 0.05, 0.17, H - 0.345]].forEach(([w, h, d, y]) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(d, h, w), trimMat);
        m.position.set(x, y, z);
        scene.add(m);
      });
    });
  });
})();
// a moulded band following an arch and running down its jambs, with a keystone at the crown
function archSurround(x, z, rotY, openW, springs, legs) {
  const r = openW / 2, bw = 0.17, depth = 0.05;
  const s = new THREE.Shape();
  const foot = legs ? 0 : springs;
  s.moveTo(-r - bw, foot); s.lineTo(-r - bw, springs);
  s.absarc(0, springs, r + bw, Math.PI, 0, true);
  s.lineTo(r + bw, foot); s.lineTo(r, foot); s.lineTo(r, springs);
  s.absarc(0, springs, r, 0, Math.PI, false);
  s.lineTo(-r, foot); s.lineTo(-r - bw, foot);
  const band = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 32 }), trimMat);
  const key = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.36, depth + 0.05), trimMat);
  key.position.set(0, springs + r + 0.1, (depth + 0.05) / 2);
  const g = new THREE.Group();
  g.add(band, key);
  [-1, 1].forEach((sd) => {                                            // impost blocks at the springing
    const imp = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.08, 0.1, depth + 0.03), trimMat);
    imp.position.set(sd * (r + bw / 2), springs, (depth + 0.03) / 2);
    g.add(imp);
  });
  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  scene.add(g);
}
[-1, 1].forEach((sx) => {
  archSurround(sx * P.corrX, -7.5, sx < 0 ? Math.PI / 2 : -Math.PI / 2, 2.6, 2.3, true);             // hall face of each wing arch
  archSurround(sx * (P.corrX + 0.264), -7.5, sx < 0 ? -Math.PI / 2 : Math.PI / 2, 2.6, 2.3, true);   // and the face inside the wing
});
(function keystones() {                                                // the details arch already has its band
  [[P.wingFarZ + 0.15, 1], [P.wingFarZ - 0.15, -1]].forEach(([z, dir]) => {
    const key = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.4, 0.09), trimMat);
    key.position.set(0, 2.3 + 1.35 + 0.1, z + dir * 0.03);
    scene.add(key);
  });
})();
(function entranceDoors() {
  // the inside face of the walnut entrance doors, in a stone architrave, on the atrium's back wall
  const z = P.backZ - 0.03, w = 2.9, h = 3.25;
  [-1, 1].forEach((sd) => {
    const leaf = new THREE.Mesh(new THREE.PlaneGeometry(w / 2 - 0.01, h), walnutDoor);
    leaf.position.set(sd * w / 4, h / 2, z);
    leaf.rotation.y = Math.PI;
    const pull = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.62, 12), frameMat);
    pull.position.set(sd * 0.09, 1.2, z - 0.06);
    scene.add(leaf, pull);
  });
  [[-1, 0.26, h + 0.26], [1, 0.26, h + 0.26]].forEach(([sd, bw, bh]) => {
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.12), trimMat);
    jamb.position.set(sd * (w / 2 + bw / 2), bh / 2, P.backZ - 0.06);
    scene.add(jamb);
  });
  const head = new THREE.Mesh(new THREE.BoxGeometry(w + 0.52, 0.26, 0.12), trimMat);
  head.position.set(0, h + 0.13, P.backZ - 0.06);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(w + 0.8, 0.1, 0.26), trimMat);
  hood.position.set(0, h + 0.31, P.backZ - 0.13);
  scene.add(head, hood);
})();

// ---------------------------------------------------------------- objects in the wings
// Wing I answers The Birth of Venus: marble urns, the scallop shell, roses.
// Wing II answers Primavera: flowers without end, and the orange grove in terracotta pots.
const terracotta = new THREE.MeshStandardMaterial({ color: '#b5643c', roughness: 0.85 });
const leafMat = new THREE.MeshStandardMaterial({ color: '#3f5a33', roughness: 0.9 });
const pearl = new THREE.MeshStandardMaterial({ color: '#f4eadb', roughness: 0.32, side: THREE.DoubleSide });
const tint = (hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.75 });
const lathe = (pts, mat, seg = 36) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), mat);
const seeded = (seed) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
function pedestal(h) {
  const g = new THREE.Group();
  [[0.5, 0.1, 0.05], [0.38, h - 0.2, h / 2], [0.48, 0.1, h - 0.05]].forEach(([w, bh, y]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, bh, w), stoneMat);
    m.position.y = y; g.add(m);
  });
  return g;
}
function place(g, x, z, rotY) { g.position.set(x, 0, z); g.rotation.y = rotY || 0; scene.add(g); return g; }
function urn(top) {                                   // a tall marble urn on its pedestal
  const g = pedestal(0.95);
  const body = lathe([[0, 0], [0.11, 0], [0.12, 0.04], [0.07, 0.08], [0.06, 0.14], [0.15, 0.24], [0.21, 0.4], [0.2, 0.55], [0.12, 0.68], [0.085, 0.76], [0.1, 0.84], [0.15, 0.88], [0.13, 0.9], [0, 0.9]], marbleWhite);
  body.position.y = 0.95;
  g.add(body);
  if (top) { top.position.y = 0.95 + 0.86; g.add(top); }
  return g;
}
// ---- botanical pieces are built leaf by leaf and petal by petal, as instanced meshes
function leafGeometry() {                             // one leaf: pointed, folded along the midrib, drooping at the tip
  const rows = 6, verts = [], index = [];
  for (let i = 0; i <= rows; i++) {
    const v = i / rows, w = 0.21 * Math.pow(Math.sin(Math.PI * (0.06 + 0.94 * v)), 0.85) * (1 - 0.35 * v);
    const droop = -0.16 * v * v;
    verts.push(-w, v, 0.3 * w + droop, 0, v, droop, w, v, 0.3 * w + droop);
  }
  for (let i = 0; i < rows; i++) {
    const k = i * 3;
    index.push(k, k + 1, k + 3, k + 1, k + 4, k + 3, k + 1, k + 2, k + 4, k + 2, k + 5, k + 4);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}
function petalGeometry() {                            // one rose petal: cupped across, rolling back at the lip
  const nu = 4, nv = 4, verts = [], index = [];
  for (let j = 0; j <= nv; j++) {
    const v = j / nv, w = 0.7 * Math.pow(Math.sin(Math.PI * (0.12 + 0.8 * v)), 0.7);
    for (let i = 0; i <= nu; i++) {
      const u = -1 + 2 * i / nu, x = u * w;
      verts.push(x, v, -0.75 * x * x + 0.3 * v * v * v);
    }
  }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const k = j * (nu + 1) + i;
    index.push(k, k + 1, k + nu + 1, k + 1, k + nu + 2, k + nu + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}
const LEAF_GEO = leafGeometry(), PETAL_GEO = petalGeometry();
const Y_AXIS = new THREE.Vector3(0, 1, 0);
// collects instances (matrix + colour) and turns them into one InstancedMesh
function instancer(geo, mat) {
  const mats = [], cols = [];
  return {
    add(m, c) { mats.push(m.clone()); cols.push(c.clone()); },
    build() {
      const mesh = new THREE.InstancedMesh(geo, mat, mats.length);
      mats.forEach((m, i) => { mesh.setMatrixAt(i, m); mesh.setColorAt(i, cols[i]); });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      return mesh;
    }
  };
}
// a leaf at `pos`, its length pointing along `dir`, rolled at random about that direction
function addLeaf(inst, pos, dir, size, color, rnd) {
  const q = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir.clone().normalize());
  q.multiply(new THREE.Quaternion().setFromAxisAngle(Y_AXIS, rnd() * Math.PI * 2));
  inst.add(new THREE.Matrix4().compose(pos, q, new THREE.Vector3(size, size, size)), color);
}
// a rose at `c` opening along `n`: a tight heart, then three rings of overlapping petals,
// each ring wider, larger and more open than the last. `s` is roughly a third of the bloom's width.
function addRose(inst, c, n, s, base, rnd, rings = 3) {
  const frame = new THREE.Matrix4().compose(c, new THREE.Quaternion().setFromUnitVectors(Y_AXIS, n.clone().normalize()), new THREE.Vector3(1, 1, 1));
  const heart = base.clone().multiplyScalar(0.68);
  //            petals  radius  opening  size   lift
  const RINGS = [[3, 0.03, 0.05, 0.5, 0.2], [5, 0.12, 0.22, 0.72, 0.14], [7, 0.3, 0.55, 0.95, 0.07], [9, 0.5, 0.95, 1.12, 0]];
  RINGS.slice(0, rings + 1).forEach(([count, rad, open, size, lift], ri) => {
    const spin = rnd() * 6.283;
    for (let k = 0; k < count; k++) {
      const phi = spin + k * 6.283 / count, tilt = open + (rnd() - 0.5) * 0.14, sz = s * size * (0.93 + rnd() * 0.14);
      const d = new THREE.Vector3(Math.cos(phi), 0, Math.sin(phi));
      const X = new THREE.Vector3(Math.sin(phi), 0, -Math.cos(phi));
      const Y = new THREE.Vector3(0, Math.cos(tilt), 0).addScaledVector(d, Math.sin(tilt));
      const Z = new THREE.Vector3().crossVectors(X, Y);
      const m = new THREE.Matrix4().makeBasis(X.multiplyScalar(sz), Y.clone().multiplyScalar(sz), Z.multiplyScalar(sz));
      m.setPosition(d.clone().multiplyScalar(s * rad).setY(s * lift));
      inst.add(m.premultiply(frame), heart.clone().lerp(base, Math.min(1, 0.2 + ri * 0.3 + rnd() * 0.1)));
    }
  });
}

// roses massed on an urn and trailing down its pedestal on vines, for the urns beside The Birth of Venus
function roseCascade(seed) {
  const g = new THREE.Group(), rnd = seeded(seed);
  const petals = instancer(PETAL_GEO, new THREE.MeshStandardMaterial({ roughness: 0.62, side: THREE.DoubleSide }));
  const leaves = instancer(LEAF_GEO, new THREE.MeshStandardMaterial({ roughness: 0.5, side: THREE.DoubleSide }));
  const ROSES = ['#e9a3ac', '#f2c6c8', '#d97f8e', '#f6e2dc', '#e58f9d', '#c9607a'].map((h) => new THREE.Color(h));
  const GREENS = ['#2f4a26', '#3d5a2e', '#4d6b35'].map((h) => new THREE.Color(h));
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  // the mass on top: a full dome of open roses, leaves tucked underneath and between
  for (let i = 0; i < 46; i++) {
    const a = rnd() * 6.283, e = Math.acos(1 - rnd() * 1.05), R = 0.29 + rnd() * 0.06;
    const n = new THREE.Vector3(Math.sin(e) * Math.cos(a), Math.cos(e), Math.sin(e) * Math.sin(a));
    addRose(petals, n.clone().multiplyScalar(R).setY(n.y * R * 0.95 + 0.07), n, 0.048 + rnd() * 0.016, pick(ROSES), rnd);
  }
  for (let i = 0; i < 44; i++) {
    const a = rnd() * 6.283, e = 0.9 + rnd() * 0.9, R = 0.3 + rnd() * 0.1;
    const n = new THREE.Vector3(Math.sin(e) * Math.cos(a), Math.cos(e) * 0.6, Math.sin(e) * Math.sin(a));
    addLeaf(leaves, n.clone().multiplyScalar(R * 0.8), n, 0.1 + rnd() * 0.06, pick(GREENS), rnd);
  }
  // the cascades: vines leaving the rim, arcing out and falling, roses thinning to buds at the tips
  const vineMat = tint('#3b4a26');
  // every vine leaves towards the room (local +z), never back into the wall behind the urn
  [[1.57, 1.6], [1.0, 1.2], [2.15, 1.3], [0.45, 0.85], [2.7, 0.9], [1.3, 0.7], [1.85, 0.6]].forEach(([ang, drop], vi) => {
    const out = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)), reach = 0.3 + rnd() * 0.12;
    const side = new THREE.Vector3(-out.z, 0, out.x).multiplyScalar((rnd() - 0.5) * 0.35);
    const pts = [0, 0.18, 0.4, 0.7, 1].map((t) => out.clone().multiplyScalar(0.2 + reach * Math.sin(Math.min(1, t * 1.6) * Math.PI / 2))
      .addScaledVector(side, t * t).setY(0.1 + 0.16 * Math.sin(t * 2.4) - drop * t * t));
    const curve = new THREE.CatmullRomCurve3(pts);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.006, 5, false), vineMat));
    const count = Math.round(12 + drop * 13);
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5 + (rnd() - 0.5) * 0.6) / count, pt = curve.getPoint(t), tan = curve.getTangent(t);
      const outward = pt.clone().setY(0).normalize().multiplyScalar(0.8).add(new THREE.Vector3(0, 0.55 - t * 0.5, 0)).addScaledVector(tan, -0.2);
      const size = (0.052 - 0.026 * t) * (0.85 + rnd() * 0.3);
      const across = new THREE.Vector3(-tan.z, 0, tan.x).multiplyScalar((rnd() - 0.5) * 0.3 * (1 - 0.8 * t));
      addRose(petals, pt.clone().add(across).addScaledVector(outward.clone().normalize(), size * 1.2), outward, size, pick(ROSES), rnd, t > 0.85 ? 1 : t > 0.6 ? 2 : 3);
      for (let l = 0; l < (rnd() < 0.6 ? 1 : 2); l++) {
        const ld = new THREE.Vector3(rnd() - 0.5, -0.2 - rnd() * 0.6, rnd() - 0.5).addScaledVector(outward, 0.5);
        addLeaf(leaves, pt, ld, 0.055 + rnd() * 0.035, pick(GREENS), rnd);
      }
    }
  });
  g.add(petals.build(), leaves.build());
  return g;
}

// an orange tree standard in a banded terracotta pot, as in the Primavera grove
function citrusTree(seed) {
  const g = new THREE.Group(), rnd = seeded(seed);
  g.add(lathe([[0, 0], [0.2, 0], [0.225, 0.03], [0.235, 0.07], [0.29, 0.42], [0.31, 0.45], [0.345, 0.47], [0.35, 0.51], [0.335, 0.545], [0.295, 0.545], [0.28, 0.5], [0, 0.5]], terracotta, 48));
  [[0.262, 0.2], [0.283, 0.36]].forEach(([r, y]) => {                 // raised bands, as on Impruneta pots
    const band = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 48), terracotta);
    band.rotation.x = Math.PI / 2; band.position.y = y; g.add(band);
  });
  const soil = new THREE.Mesh(new THREE.CircleGeometry(0.285, 32), tint('#3a2a1c'));
  soil.rotation.x = -Math.PI / 2; soil.position.y = 0.505; g.add(soil);
  const bark = tint('#5a4a38');
  const top = new THREE.Vector3(0.015, 1.62, 0.0), centre = new THREE.Vector3(0, 2.0, 0);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.5, 0), new THREE.Vector3(0.025, 0.9, 0.012), new THREE.Vector3(-0.018, 1.3, -0.01), top]), 20, 0.028, 8, false), bark));
  // the crown: leaves gathered in clumps around an ellipsoid, over a dark core so it never reads as hollow
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.29, 18, 14), tint('#2a4020'));
  core.scale.set(1, 1.08, 1); core.position.copy(centre); g.add(core);
  const leaves = instancer(LEAF_GEO, new THREE.MeshStandardMaterial({ roughness: 0.42, side: THREE.DoubleSide }));
  const deep = new THREE.Color('#2c4722'), sunlit = new THREE.Color('#5d7f3c'), rad = new THREE.Vector3(0.47, 0.52, 0.47);
  const clumps = [];
  for (let i = 0; i < 24; i++) {
    const a = rnd() * 6.283, e = Math.acos(1 - rnd() * 1.85), R = 0.72 + rnd() * 0.3;
    const dir = new THREE.Vector3(Math.sin(e) * Math.cos(a), Math.cos(e), Math.sin(e) * Math.sin(a));
    clumps.push(dir.clone().multiply(rad).multiplyScalar(R));
    if (i < 5) g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([top.clone().setY(1.5 + rnd() * 0.1), top.clone().lerp(centre.clone().add(clumps[i]), 0.5).add(new THREE.Vector3(0, -0.06, 0)), centre.clone().add(clumps[i])]), 8, 0.011, 5, false), bark));
  }
  for (let i = 0; i < 2100; i++) {
    const c = clumps[Math.floor(rnd() * clumps.length)];
    const p = c.clone().add(new THREE.Vector3(rnd() + rnd() + rnd() - 1.5, rnd() + rnd() + rnd() - 1.5, rnd() + rnd() + rnd() - 1.5).multiplyScalar(0.2));
    const dir = p.clone().normalize().add(new THREE.Vector3(rnd() - 0.5, -0.35 + rnd() * 0.5, rnd() - 0.5).multiplyScalar(0.9));
    const lit = THREE.MathUtils.clamp(0.5 + p.y / 1.0 + (rnd() - 0.5) * 0.5, 0, 1);
    addLeaf(leaves, p.add(centre), dir, 0.085 + rnd() * 0.045, deep.clone().lerp(sunlit, lit), rnd);
  }
  g.add(leaves.build());
  // fruit hangs mostly from the lower, outer crown; blossom is scattered over it
  const rind = [tint('#e8902a'), tint('#de7f1f'), tint('#efa03a')], calyx = tint('#2d4220');
  for (let i = 0; i < 18; i++) {
    const a = rnd() * 6.283, e = 0.9 + rnd() * 1.5, r = 0.041 + rnd() * 0.011;
    const p = new THREE.Vector3(Math.sin(e) * Math.cos(a), Math.cos(e), Math.sin(e) * Math.sin(a)).multiply(rad).multiplyScalar(0.98).add(centre);
    const o = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), rind[i % 3]);
    o.scale.y = 0.94; o.position.copy(p);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.006, 0.008, 6), calyx);
    cap.position.copy(p).y += r * 0.93;
    g.add(o, cap);
  }
  const bloom = tint('#f7f3e8');
  for (let i = 0; i < 34; i++) {
    const a = rnd() * 6.283, e = Math.acos(1 - rnd() * 1.6);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 5), bloom);
    b.position.set(Math.sin(e) * Math.cos(a), Math.cos(e), Math.sin(e) * Math.sin(a)).multiply(rad).multiplyScalar(1.02).add(centre);
    g.add(b);
  }
  return g;
}
// a low plinth kept free for a statue that is still to come, marked with a small brass label
// a plain pedestal that carries a sculpture scan
function sculpturePedestal(id, h) {
  const g = pedestal(h);
  SCULPTURE_SPOTS[id] = { group: g, top: h, placeholder: [] };
  return g;
}
function reservedPlinth(label, id) {
  const g = new THREE.Group();
  [[0.78, 0.1, 0.05], [0.66, 0.4, 0.3], [0.76, 0.1, 0.55]].forEach(([w, h, y]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), stoneMat);
    m.position.y = y; g.add(m);
  });
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const x = c.getContext('2d');
  x.fillStyle = '#b8934a'; x.fillRect(0, 0, 512, 128);
  x.strokeStyle = 'rgba(58,40,10,.7)'; x.lineWidth = 4; x.strokeRect(8, 8, 496, 112);
  x.fillStyle = '#34240a'; x.font = '600 50px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(label, 256, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.09), new THREE.MeshStandardMaterial({ map: t, roughness: 0.45, metalness: 0.15 }));
  plate.position.set(0, 0.3, 0.332);
  g.add(plate);
  if (id) SCULPTURE_SPOTS[id] = { group: g, top: 0.6, placeholder: [plate] };
  return g;
}
(function furnishWings() {
  const endX = P.wingEndX - 0.45, sideX = 1830 * U, zFar = P.wingFarZ + 0.38, zNear = P.wingNearZ - 0.38;
  // Wing I: rose cascades flank the Venus; Venus and her son Cupid stand on the side walls
  place(urn(roseCascade(3)), -(P.wingEndX - 0.4), -7.5 - 2.18, Math.PI / 2);
  place(urn(roseCascade(8)), -(P.wingEndX - 0.4), -7.5 + 2.18, Math.PI / 2);
  place(reservedPlinth('STATUE', 'w1statue'), -sideX, zFar + 0.05, 0);
  place(sculpturePedestal('w1small', 0.95), -sideX, zNear, Math.PI);
  // Wing II: the orange grove flanks Primavera; the side walls are kept for a statue and a bust
  place(citrusTree(5), endX, -7.5 - 2.12, 0);
  place(citrusTree(9), endX, -7.5 + 2.12, 0);
  place(reservedPlinth('STATUE', 'w2statue'), sideX, zFar + 0.05, 0);
  bust(sideX, zNear, Math.PI, 'w2bust');
})();

// ---------------------------------------------------------------- real sculpture (3D scans)
// Assign a scan to a spot and it replaces that spot's placeholder. Spots:
//   w1statue / w1small      Wing I, the low plinth (far side wall) and the pedestal (near side wall)
//   w2statue   Wing II, the low plinth on the far side wall (a medium full figure)
//   detStatueL / detStatueR   details room, the two plinths flanking the principal picture
//   w2bust     Wing II, the pedestal on the near side wall
//   detEndL / detEndR       details room, flanking the end-wall hang
//   detEntryL / detEntryR   details room, flanking the entrance arch
// Models are .glb files in assets/sculpture/, made from raw museum scans with tools/convert_scan.py.
//   src     the .glb
//   height  how tall it should stand, in metres (a bust is about 0.7, a medium statue about 1.5)
//   turn    optional, radians, to face it the right way on its spot
//   keep    optional, true to keep the scan's own colour instead of the gallery's marble
//   title / credit   what it is and who to thank; credits are listed in the page's Credits panel
const SCULPTURES = {
  w1statue: { src: 'assets/sculpture/venus-apple.glb', height: 1.5, title: 'Venus with the Apple, Bertel Thorvaldsen, 1809',
    credit: '3D scan by Statens Museum for Kunst, Copenhagen · public domain · via Wikimedia Commons' },
  w1small: { src: 'assets/sculpture/amor-lyre.glb', height: 0.95, title: 'Cupid Playing the Lyre, Bertel Thorvaldsen',
    credit: '3D scan by Statens Museum for Kunst, Copenhagen · public domain · via Wikimedia Commons' },
  detStatueL: { src: 'assets/sculpture/apollo-belvedere.glb', height: 2.0, title: 'Apollo Belvedere, after Leochares (cast of the Vatican marble)',
    credit: '3D scan by Statens Museum for Kunst, Copenhagen · public domain · via Wikimedia Commons' },
  detStatueR: { src: 'assets/sculpture/diana.glb', height: 1.9, title: 'Diana of Villa Bartholoni',
    credit: '3D scan by Rama, Musées d’art et d’histoire de Genève · public domain · via Wikimedia Commons' },
  w2statue: { src: 'assets/sculpture/venus-italica.glb', height: 1.55, title: 'Venus Italica, Antonio Canova',
    credit: '3D scan by Rama, Musées d’art et d’histoire de Genève · CC BY-SA 3.0 FR · via Wikimedia Commons' },
  w2bust: { src: 'assets/sculpture/laurana.glb', height: 0.62, title: 'Bust of a woman, Francesco Laurana, c. 1472',
    credit: '3D scan by ALoopingIcon, after a cast of the original in Berlin · CC BY-SA 4.0 · via Wikimedia Commons' },
  detEndL: { src: 'assets/sculpture/woman-1.glb', height: 0.68, title: 'Roman portrait bust of a woman',
    credit: '3D scan by Scan the World, Musée Saint-Raymond, Toulouse · free use with attribution · via Wikimedia Commons' },
  detEndR: { src: 'assets/sculpture/young-man.glb', height: 0.68, title: 'Roman portrait bust of a young man',
    credit: '3D scan by Scan the World, Musée Saint-Raymond, Toulouse · free use with attribution · via Wikimedia Commons' },
  detEntryL: { src: 'assets/sculpture/augustus.glb', height: 0.72, title: 'Bust of Augustus',
    credit: '3D scan by Rama, Musées d’art et d’histoire de Genève · CC BY-SA 3.0 FR · via Wikimedia Commons' },
  detEntryR: { src: 'assets/sculpture/woman-2.glb', height: 0.68, title: 'Roman portrait bust of a woman',
    credit: '3D scan by Scan the World, Musée Saint-Raymond, Toulouse · free use with attribution · via Wikimedia Commons' }
};
// the Credits panel: the paintings, then every sculpture scan with the attribution its licence asks for
(function credits() {
  const list = document.getElementById('creditsList');
  if (!list) return;
  const rows = [
    ['The Birth of Venus and Primavera, Sandro Botticelli', 'Gallerie degli Uffizi, Florence · public domain'],
    ...Object.values(SCULPTURES).map((c) => [c.title, c.credit + ' · simplified for the web, shared under the same licence'])
  ];
  rows.forEach(([what, who]) => {
    const p = document.createElement('p');
    p.style.cssText = 'margin:0 0 12px;font-size:14px;line-height:1.5;color:#BCB29B';
    const b = document.createElement('span');
    b.style.cssText = 'display:block;color:#F6F1E4;font-family:\'Cormorant Garamond\',Georgia,serif;font-size:17px';
    b.textContent = what;
    p.append(b, who);
    list.appendChild(p);
  });
  const panel = document.getElementById('credits');
  document.getElementById('creditsBtn').addEventListener('click', () => { panel.style.display = 'grid'; });
  panel.addEventListener('click', (e) => { if (e.target === panel || e.target.id === 'creditsClose') panel.style.display = 'none'; });
})();

const marbleScan = new THREE.MeshStandardMaterial({ color: '#ece6d9', roughness: 0.55 });
(function loadSculptures() {
  const ids = Object.keys(SCULPTURES).filter((id) => SCULPTURE_SPOTS[id]);
  if (!ids.length) return;
  import('three/addons/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
    const gltfLoader = new GLTFLoader();
    ids.forEach((id) => {
      const cfg = SCULPTURES[id], spot = SCULPTURE_SPOTS[id];
      gltfLoader.load(cfg.src, (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
        const k = cfg.height / size.y;
        model.scale.setScalar(k);
        model.position.set(-c.x * k, spot.top - box.min.y * k, -c.z * k);     // stood on the spot, centred
        if (!cfg.keep) model.traverse((o) => { if (o.isMesh) o.material = marbleScan; });
        const holder = new THREE.Group();
        holder.rotation.y = cfg.turn || 0;
        holder.add(model);
        spot.placeholder.forEach((m) => m.removeFromParent());
        spot.group.add(holder);
      }, undefined, () => console.warn('sculpture did not load, keeping the placeholder:', cfg.src));
    });
  }).catch(() => console.warn('sculpture loader unavailable, keeping the placeholders'));
})();

// ---- signage drawn to canvas, hung as brass lettering
function signTexture(lines, w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.clearRect(0, 0, w, h);
  let y = h / 2 - (lines.length - 1) * 34;
  lines.forEach((ln) => {
    x.font = ln.font;
    x.fillStyle = ln.color || '#5a3f0c';
    x.textAlign = 'center';
    x.shadowColor = 'rgba(255,252,238,.9)';
    x.shadowOffsetY = 1.5;
    x.fillText(ln.t, w / 2, y);
    y += ln.gap || 72;
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function sign(lines, w, h, x, y, z, rotY) {
  const t = signTexture(lines, 512, 256);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.4, metalness: 0.3 }));
  m.position.set(x, y, z);
  m.rotation.y = rotY;
  scene.add(m);
  return m;
}

// directory plaque, mounted flat on the wall above the details arch;
// lettering is sized to fill the plaque so it reads from the atrium
function directoryTexture(lines, aspect) {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = Math.round(2048 / aspect);
  const x = c.getContext('2d');
  let px = 180;
  const widest = () => { x.font = '500 ' + px + 'px Georgia'; return Math.max(...lines.map((t) => x.measureText(t).width)); };
  while (px > 40 && widest() > c.width * 0.94) px -= 2;
  x.fillStyle = '#f2dfae';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  lines.forEach((t, i) => x.fillText(t, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * px * 1.22));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const PLAQUE_W = 2.9, PLAQUE_H = 1.15;              // overhangs the 2.7 m arch opening by 10 cm a side
const PLAQUE_Y = 2.3 + 1.35 + 0.2 + PLAQUE_H / 2;   // bottom edge just clear of the arch band
const PLAQUE_Z = P.wingFarZ + 0.14 + 0.035;         // back of the plaque on the wall face
const plaque = new THREE.Mesh(
  new THREE.BoxGeometry(PLAQUE_W, PLAQUE_H, 0.07),
  new THREE.MeshStandardMaterial({ color: '#5b4a25', roughness: 0.5, metalness: 0.35 })
);
plaque.position.set(0, PLAQUE_Y, PLAQUE_Z);
plaque.castShadow = true;
scene.add(plaque);
const plaqueFace = new THREE.Mesh(
  new THREE.PlaneGeometry(PLAQUE_W - 0.2, PLAQUE_H - 0.2),
  new THREE.MeshStandardMaterial({
    map: directoryTexture(['←  WING I  ·  WING II  →', 'EXHIBIT DETAILS  ↑'], (PLAQUE_W - 0.2) / (PLAQUE_H - 0.2)),
    transparent: true, roughness: 0.5
  })
);
plaqueFace.position.set(0, PLAQUE_Y, PLAQUE_Z + 0.05);
scene.add(plaqueFace);

// ---- lighting
scene.add(new THREE.HemisphereLight('#fff4e0', '#8a8070', 1.25));
const ambient = new THREE.AmbientLight('#fff1d8', 0.5);
scene.add(ambient);

// a brass picture light: a slim bar held off the wall on two arms just above the frame, glowing
// underneath, with a wide soft-edged wash of light on the picture (the light itself hangs further
// out than the fixture, so the wash falls evenly instead of burning the top of the canvas).
//   (x, y, z)     where the light shines from        (tx, ty, tz)  the centre of the picture, on the wall
//   topY, barW    top edge of the frame, and how long the bar should be
//   lamps         how many lamps sit along the bar. A wide picture needs several, or the wash reads as
//                 one round spotlight pool instead of light falling from the whole length of the bar
const brassLit = new THREE.MeshStandardMaterial({ color: '#c9a45c', roughness: 0.34, metalness: 0.55 });
const lampGlow = new THREE.MeshBasicMaterial({ color: '#ffe6b8' });
function pictureLight(x, y, z, tx, ty, tz, shadow, power, topY, barW, lamps = 1) {
  const n = new THREE.Vector3(x - tx, 0, z - tz).normalize();          // out from the wall
  const along = new THREE.Vector3(-n.z, 0, n.x);
  const barY = Math.min(topY + 0.12, H - 0.32), reach = 0.24;
  const fixture = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, barW, 16), brassLit);
  bar.quaternion.setFromUnitVectors(Y_AXIS, along);
  bar.position.copy(n).multiplyScalar(reach).setY(barY);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(barW * 0.94, 0.006, 0.026), lampGlow);   // the lit underside
  strip.rotation.y = Math.atan2(along.x, along.z) + Math.PI / 2;
  strip.position.copy(bar.position).y -= 0.024;
  fixture.add(bar, strip);
  [-1, 1].forEach((sd) => {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.027, 12, 10), brassLit);
    cap.position.copy(bar.position).addScaledVector(along, sd * barW / 2);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, reach, 8), brassLit);
    arm.quaternion.setFromUnitVectors(Y_AXIS, n);
    arm.position.copy(n).multiplyScalar(reach / 2).addScaledVector(along, sd * barW * 0.3).setY(barY);
    const rose = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 14), brassLit);  // where the arm meets the wall
    rose.quaternion.setFromUnitVectors(Y_AXIS, n);
    rose.position.copy(n).multiplyScalar(0.006).addScaledVector(along, sd * barW * 0.3).setY(barY);
    fixture.add(cap, arm, rose);
  });
  fixture.position.set(tx, 0, tz);
  scene.add(fixture);

  for (let k = 0; k < lamps; k++) {
    const off = lamps === 1 ? 0 : (k / (lamps - 1) - 0.5) * barW * 0.8;  // spaced along the bar, each aimed straight down its own strip
    const sp = new THREE.SpotLight('#ffe3b3', power / lamps * (lamps > 1 ? 1.25 : 1), 9, 0.88, 1.0, 1.5);
    sp.position.set(x + along.x * off, y, z + along.z * off);
    sp.target.position.set(tx + along.x * off, ty, tz + along.z * off);
    if (shadow && k === Math.floor(lamps / 2)) {                        // one shadow-caster is enough
      sp.castShadow = true;
      sp.shadow.mapSize.set(1024, 1024);
      sp.shadow.radius = 6;                                             // soft-edged shadows under the frames
      sp.shadow.blurSamples = 16;
    }
    scene.add(sp);
    scene.add(sp.target);
  }
}
pictureLight(-P.wingEndX + 0.6, H - 0.5, -7.5, -P.wingEndX, 1.95, -7.5, true, 15, 3.17, 3.0, 3);
pictureLight(P.wingEndX - 0.6, H - 0.5, -7.5, P.wingEndX, 1.95, -7.5, true, 15, 3.22, 3.0, 3);
pictureLight(-1500 * U, H - 0.5, P.wingFarZ + 0.6, -1500 * U, 1.95, P.wingFarZ, true, 13, 2.66, 0.62);
pictureLight(-1500 * U, H - 0.5, P.wingNearZ - 0.6, -1500 * U, 1.95, P.wingNearZ, true, 13, 2.66, 0.62);
pictureLight(1500 * U, H - 0.5, P.wingFarZ + 0.6, 1500 * U, 1.95, P.wingFarZ, true, 13, 2.66, 0.62);
pictureLight(1500 * U, H - 0.5, P.wingNearZ - 0.6, 1500 * U, 1.95, P.wingNearZ, true, 13, 2.66, 0.62);

pictureLight(0, H - 0.14, DET.zB + 1.0, 0, 2.55, DET.zB, false, 7, 3.84, 1.9);
pictureLight(-DET.x + 1.0, H - 0.14, DET.zMid, -DET.x, 2.5, DET.zMid, false, 7, 3.64, 1.7);
pictureLight(DET.x - 1.0, H - 0.14, DET.zMid, DET.x, 2.5, DET.zMid, false, 7, 3.64, 1.7);

// warm pools down the corridor so the space reads as lit
[[0, 10], [0, 6.5], [0, 3], [0, -0.5], [0, -4], [0, -7.5]].forEach(([x, z]) => {
  const pl = new THREE.PointLight('#ffeccb', 7, 9, 2);
  pl.position.set(x, H - 0.6, z);
  scene.add(pl);
});

[10, 5, 0, -5].forEach((z) => {
  const up = new THREE.PointLight('#ffeccb', 5, 7, 2);
  up.position.set(0, VAULT.spring + 0.5, z);
  scene.add(up);
});

// ---------------------------------------------------------------- camera moves
let idx = 0;
const cam = { x: STATIONS[0].x, z: STATIONS[0].z, yaw: STATIONS[0].yaw, pitch: 0, eye: EYE };   // the doors open onto the atrium stop itself
let wantPitch = 0, wantEye = EYE;   // the tilt and viewing height of the stop you are heading for; applied once you have arrived
const settled = () => Math.abs(cam.pitch - wantPitch) < 0.001 && Math.abs(cam.eye - wantEye) < 0.001;
let queue = [];
let leg = null;

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const shortAngle = (from, to) => {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return from + d;
};

function pushMove(x, z) { queue.push({ kind: 'move', x, z, ms: 1250 }); }
function pushTurn(yaw) { queue.push({ kind: 'turn', yaw, ms: 1100 }); }

// the centre table is the one thing standing in the open floor of the details room: walks go round it
const TABLE_KEEPOUT = { x0: -1.5, x1: 1.5, z0: DET.zMid - 0.9 - 0.9, z1: DET.zMid - 0.9 + 0.9 };
const DET_ENTRY = { x: 0, z: -12.5 };      // where the hall's centre line arrives in the details room
function clearOfTable(ax, az, bx, bz) {
  for (let i = 1; i < 24; i++) {
    const k = i / 24, x = ax + (bx - ax) * k, z = az + (bz - az) * k;
    if (x > TABLE_KEEPOUT.x0 && x < TABLE_KEEPOUT.x1 && z > TABLE_KEEPOUT.z0 && z < TABLE_KEEPOUT.z1) return false;
  }
  return true;
}
// plan a walk across the details room from `at` to (tx, tz): straight if the table is not in the way,
// otherwise round one of its ends. Each leg: turn the way you are going, then walk. Updates `at`.
function detWalk(at, tx, tz) {
  let pts = [[tx, tz]];
  if (!clearOfTable(at.x, at.z, tx, tz)) {
    const X = ((at.x + tx) >= 0 ? 1 : -1) * (TABLE_KEEPOUT.x1 + 0.3);
    const near = [X, TABLE_KEEPOUT.z1 + 0.05], far = [X, TABLE_KEEPOUT.z0 - 0.05];
    const one = [near, far].find((w) => clearOfTable(at.x, at.z, w[0], w[1]) && clearOfTable(w[0], w[1], tx, tz));
    pts = one ? [one, [tx, tz]] : (at.z > tz ? [near, far, [tx, tz]] : [far, near, [tx, tz]]);
  }
  pts.forEach(([x, z]) => {
    if (Math.abs(x - at.x) < 0.01 && Math.abs(z - at.z) < 0.01) return;
    pushTurn(Math.atan2(at.x - x, at.z - z));
    pushMove(x, z);
    at.x = x; at.z = z;
  });
}

function goTo(n) {
  const i = Math.max(0, Math.min(STATIONS.length - 1, n));
  if (i === idx && queue.length === 0 && !leg) return;
  const t = STATIONS[i];
  idx = i;
  queue = []; leg = null;
  hideMotto();
  paintLabel(t);
  markRoom(t.room);
  wantPitch = t.pitch || 0;
  wantEye = t.eye || EYE;
  // level out and come back down to standing height before moving off
  if (Math.abs(cam.pitch) > 0.001 || Math.abs(cam.eye - EYE) > 0.001) queue.push({ kind: 'turn', yaw: cam.yaw, pitch: 0, eye: EYE, ms: 800 });

  const at = { x: cam.x, z: cam.z };       // where the plan has got to so far
  const here = roomAt();
  const facing = (yaw) => Math.abs(shortAngle(cam.yaw, yaw) - cam.yaw) < 0.01;

  if (here === 'det' && t.room === 'det') {
    // inside the details room you cross the floor freely. A short move to a stop that faces the way
    // you already face is a plain step (forwards, backwards or sideways); anything else is walked.
    const d = Math.hypot(t.x - at.x, t.z - at.z);
    if (d > 0.01 && d < 3 && facing(t.yaw) && clearOfTable(at.x, at.z, t.x, t.z)) pushMove(t.x, t.z);
    else detWalk(at, t.x, t.z);
    pushTurn(t.yaw);
    return;
  }

  if (t.x !== 0 && t.room !== 'det' && here === t.room) {
    // already inside this wing: stay in it. Going deeper, walk facing the end wall and then
    // turn to the picture; coming back, turn to the picture first and step back from it.
    const moves = Math.abs(cam.x - t.x) > 0.01 || Math.abs(cam.z - t.z) > 0.01;
    if (moves && Math.abs(t.x) > Math.abs(cam.x)) {
      pushTurn(t.x < 0 ? Math.PI / 2 : -Math.PI / 2);
      pushMove(t.x, t.z);
      pushTurn(t.yaw);
    } else {
      pushTurn(t.yaw);
      if (moves) pushMove(t.x, t.z);
    }
    return;
  }

  // every other journey runs along the hall's centre line
  if (here === 'det') detWalk(at, DET_ENTRY.x, DET_ENTRY.z);              // leaving the details room: back to its entry first
  else if (at.x !== 0) {                                                   // leaving a wing: out onto the centre line
    pushTurn(at.x < 0 ? -Math.PI / 2 : Math.PI / 2);
    pushMove(0, at.z);
    at.x = 0;
  }
  const g = t.room === 'det' ? DET_ENTRY : t;                              // a details-room stop is reached through its entry
  if (g.x !== 0) {                                                         // into a wing, through the crossing
    if (Math.abs(at.z - JUNCTION_Z) > 0.01) {
      pushTurn(at.z > JUNCTION_Z ? 0 : Math.PI);
      pushMove(0, JUNCTION_Z);
    }
    pushTurn(t.yaw);
    pushMove(g.x, g.z);
  } else {
    const dz = Math.abs(at.z - g.z), fresh = !queue.some((q) => q.kind === 'move');
    if (dz > 0.01 && dz < 3 && fresh && cam.x === 0 && facing(t.yaw)) {
      pushMove(g.x, g.z);                  // a neighbouring frame on the wall you already face: sidestep along it
    } else if (dz > 0.01) {
      pushTurn(at.z > g.z ? 0 : Math.PI);
      pushMove(g.x, g.z);
    }
    at.x = g.x; at.z = g.z;
    if (t.room === 'det') detWalk(at, t.x, t.z);
  }
  pushTurn(t.yaw);
}

function startLeg() {
  const step = queue.shift();
  if (!step) {
    // arrived: take up the stop's own tilt and viewing height, if it has them
    leg = settled() ? null : { kind: 'turn', from: cam.yaw, to: cam.yaw, pf: cam.pitch, pt: wantPitch, ef: cam.eye, et: wantEye, t0: performance.now(), ms: 1000 };
    return;
  }
  if (step.kind === 'turn') {
    const to = shortAngle(cam.yaw, step.yaw), pt = step.pitch === undefined ? cam.pitch : step.pitch, et = step.eye === undefined ? cam.eye : step.eye;
    if (Math.abs(to - cam.yaw) < 0.001 && Math.abs(pt - cam.pitch) < 0.001 && Math.abs(et - cam.eye) < 0.001) return startLeg();
    leg = { kind: 'turn', from: cam.yaw, to, pf: cam.pitch, pt, ef: cam.eye, et, t0: performance.now(), ms: step.ms };
  } else {
    if (Math.abs(step.x - cam.x) < 0.001 && Math.abs(step.z - cam.z) < 0.001) return startLeg();
    leg = { kind: 'move', fx: cam.x, fz: cam.z, tx: step.x, tz: step.z, t0: performance.now(), ms: step.ms };
  }
}

// ---------------------------------------------------------------- ui
const el = (id) => document.getElementById(id);
function paintLabel(st) {
  el('eyebrow').textContent = st.eyebrow;
  el('eyebrow').style.color = st.accent;
  el('title').textContent = st.title;
  el('body').textContent = st.body;
  el('meta').textContent = st.meta;
}
function markRoom(room) {
  document.querySelectorAll('[data-room]').forEach((b) => {
    const on = b.getAttribute('data-room') === room;
    b.style.background = on ? 'rgba(232,192,122,.16)' : 'transparent';
    b.style.borderColor = on ? 'rgba(232,192,122,.75)' : 'rgba(201,166,103,.3)';
    b.style.color = on ? '#F2E6C9' : '#A79C85';
  });
  // the step-back button shows everywhere except the atrium's own stop
  const home = idx === ROOM_ENTRY.atrium;
  el('back').style.opacity = home ? '0' : '1';
  el('back').style.pointerEvents = home ? 'none' : 'auto';
}
// step back one level: from a side picture to the room's entry stop (where the other pictures
// are in view to click), and from the entry stop out to the atrium
el('back').addEventListener('click', () => {
  const entry = ROOM_ENTRY[STATIONS[idx].room];
  if (STATIONS[idx].back) goTo(ST[STATIONS[idx].back]);           // a stop can name where Step back leads
  else goTo(idx === entry ? ROOM_ENTRY.atrium : entry);
});
document.querySelectorAll('[data-room]').forEach((b) => {
  b.addEventListener('click', () => goTo(ROOM_ENTRY[b.getAttribute('data-room')]));
});
// walking the tour skips stops that are only reached by clicking their picture
function tourStep(dir) {
  let n = idx + dir;
  while (STATIONS[n] && STATIONS[n].tour === false) n += dir;
  if (STATIONS[n]) goTo(n);
}
el('nav').querySelector('[data-back]').addEventListener('click', () => tourStep(-1));
document.querySelector('[data-fwd]').addEventListener('click', () => tourStep(1));
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') tourStep(1);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') tourStep(-1);
});

let mottoTimer = null;
function hideMotto() {
  clearTimeout(mottoTimer);
  el('motto').style.opacity = '0';
}
function openDoors(instant) {
  el('gateCopy').style.opacity = '0';
  // the two buttons sit outside gateCopy, so fade their wrappers out with it
  [el('enter').parentElement, el('skip').parentElement.parentElement].forEach((n) => {
    n.style.transition = 'opacity 450ms ease';
    n.style.opacity = '0';
  });
  el('enter').style.pointerEvents = el('skip').style.pointerEvents = 'none';
  if (el('gateGlow')) { el('gateGlow').dataset.off = '1'; el('gateGlow').style.opacity = '0'; }
  setTimeout(() => {
    el('doorL').style.transform = 'translateX(-101%)';
    el('doorR').style.transform = 'translateX(101%)';
    el('label').style.opacity = '1';
    el('nav').style.opacity = '1';
    el('motto').style.opacity = '1';
    mottoTimer = setTimeout(() => { el('motto').style.opacity = '0'; }, 5200);
  }, instant ? 0 : 480);
  setTimeout(() => { el('gate').style.display = 'none'; }, instant ? 100 : 2800);
}
el('enter').addEventListener('click', () => openDoors(false));
el('skip').addEventListener('click', () => { openDoors(true); goTo(ROOM_ENTRY.det); });

// ---------------------------------------------------------------- clickable doorways
// an invisible pane fills each opening; clicking it walks you through, same as the room buttons
const doorMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, side: THREE.DoubleSide });
function doorPane(room, openW, springs, x, z, rotY) {
  const r = openW / 2;
  const s = new THREE.Shape();
  s.moveTo(-r, 0); s.lineTo(-r, springs);
  s.absarc(0, springs, r, Math.PI, 0, true);
  s.lineTo(r, 0); s.lineTo(-r, 0);
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s, 24), doorMat);
  m.position.set(x, 0, z);
  m.rotation.y = rotY;
  m.userData.room = room;
  scene.add(m);
}
doorPane('w1', 2.6, 2.3, -P.corrX, -7.5, Math.PI / 2);
doorPane('w2', 2.6, 2.3, P.corrX, -7.5, Math.PI / 2);
doorPane('det', 2.7, 2.3, 0, P.wingFarZ, 0);

const roomAt = () => (cam.z < P.wingFarZ ? 'det' : cam.x < -P.corrX ? 'w1' : cam.x > P.corrX ? 'w2' : 'atrium');
const raycaster = new THREE.Raycaster();
// what lies under a screen point: the room a click there leads to (null if it isn't on a
// doorway) and the first solid surface along the line of sight
function probe(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
  const here = roomAt();
  let own = false, target = null, surface = null, station, closer;
  for (const hit of raycaster.intersectObjects(scene.children, true)) {
    const room = hit.object.userData.room;
    if (!room) {                            // anything solid ends the line of sight
      surface = hit;
      for (let o = hit.object; o && station === undefined; o = o.parent) { station = o.userData.station; closer = o.userData.closer; }
      break;
    }
    if (room === here) own = true; else target = room;
  }
  // the doorway of the room you are standing in leads back out to the atrium
  // a picture only counts from inside its own room, and not through a doorway
  if (station !== undefined && (own || target || STATIONS[station].room !== here)) station = undefined;
  // already facing it: the next click is the step closer (and nothing once you are there)
  if (station !== undefined && closer !== undefined && (idx === station || idx === closer)) station = closer;
  if (station === idx) station = undefined;
  return { room: target || (own ? 'atrium' : null), surface, station };
}
const doorAt = (clientX, clientY) => probe(clientX, clientY).room;
canvas.addEventListener('click', (e) => {
  const p = probe(e.clientX, e.clientY);
  if (p.room) goTo(ROOM_ENTRY[p.room]);
  else if (p.station !== undefined) goTo(p.station);    // a picture in this room: go and face it
});

// pointer glow: a soft pool of warm light on whatever the mouse points at
const GLOW = 0.7;
const glow = new THREE.PointLight('#ffd9a0', 0, 3.2, 2);
scene.add(glow);
const glowAim = new THREE.Vector3();
const pointer = { x: 0, y: 0, inside: false, moved: false };
// the mouse is tracked across the whole page, entry doors included, so the glow is already
// under it when the doors part; on the doors themselves a matching glow is drawn in CSS
const gateGlow = document.getElementById('gateGlow');
window.addEventListener('pointermove', (e) => {
  const r = canvas.getBoundingClientRect();
  pointer.x = e.clientX; pointer.y = e.clientY; pointer.moved = true;
  pointer.inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  if (!pointer.inside) canvas.style.cursor = '';
  if (gateGlow && !gateGlow.dataset.off) {
    gateGlow.style.setProperty('--gx', e.clientX + 'px');
    gateGlow.style.setProperty('--gy', e.clientY + 'px');
    gateGlow.style.opacity = '1';
  }
});
document.documentElement.addEventListener('pointerleave', () => {
  pointer.inside = false;
  canvas.style.cursor = '';
  if (gateGlow) gateGlow.style.opacity = '0';
});
function updatePointer() {
  // re-read what is under the mouse when it moves, and while the camera is moving under it
  if (pointer.inside && (pointer.moved || leg)) {
    pointer.moved = false;
    const p = probe(pointer.x, pointer.y);
    canvas.style.cursor = volHeld() && p.surface && isVolvelle(p.surface.object) ? (volDrag ? 'grabbing' : 'grab')
      : p.room || p.station !== undefined ? 'pointer' : '';
    if (p.surface) {
      // hold the light a little off the surface, on the side facing the viewer
      const n = p.surface.face.normal.clone().transformDirection(p.surface.object.matrixWorld);
      if (n.dot(raycaster.ray.direction) > 0) n.negate();
      glowAim.copy(p.surface.point).addScaledVector(n, 0.7);
      if (glow.intensity < 0.02) glow.position.copy(glowAim);
    }
  }
  glow.position.lerp(glowAim, 0.22);
  glow.intensity += ((pointer.inside ? GLOW : 0) - glow.intensity) * 0.1;
}

// ---------------------------------------------------------------- on the table: the save-the-date volvelle
// A digital build of the paper save-the-date (assets/SAVE-THE-DATE-PACK): a square card with an oval
// window, a wheel of five plates turning on a brass eyelet behind it, and a thumb notch in the edge.
// Built to the pack's measurements, in units of one card width (4.521 in), then scaled up for the table.
// It stands propped on the centre table; clicking it takes you to the `detVolvelle` stop, where it lifts
// off its stand to face you and the wheel can be dragged round or clicked on to the next plate.
const VOL = { lift: 0, angle: 0, target: 0, STEP: Math.PI * 2 / 5, SIZE: 0.34, HOLD: 0.39 };
const volvelle = new THREE.Group();
const volWheel = new THREE.Group();
let volFront = null, volShadow = null;
(function buildVolvelle() {
  const IN = 1 / 4.521;                                           // one inch, in card widths
  const clampTex = (src) => { const t = tex(src); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 8; return t; };
  // printed paper carries a little of its own light, so it stays readable in the hand whatever the room is doing
  const printed = (src, extra) => { const t = clampTex(src); return new THREE.MeshStandardMaterial({ map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.2, ...extra }); };
  const outline = () => {                                         // the square, with the thumb notch in its right edge
    const chord = 1.580 * IN / 2, depth = 0.564 * IN, R = (chord * chord + depth * depth) / (2 * depth), cx = 0.5 + R - depth;
    const a = Math.atan2(chord, 0.5 - cx);
    const sh = new THREE.Shape();
    sh.moveTo(-0.5, -0.5); sh.lineTo(0.5, -0.5); sh.lineTo(0.5, -chord);
    sh.absarc(cx, 0, R, -a, a, true);
    sh.lineTo(0.5, 0.5); sh.lineTo(-0.5, 0.5); sh.lineTo(-0.5, -0.5);
    return sh;
  };
  const WINDOW_X = -1.266 * IN;                                   // window centre, left of the pivot
  const ellipse = (x, rx, ry) => new THREE.Path().absellipse(x, 0, rx, ry, 0, Math.PI * 2, false, 0);
  const planeUV = (geo) => {                                      // lay the printed artwork over a cut shape
    const pos = geo.attributes.position, uv = [];
    for (let i = 0; i < pos.count; i++) uv.push(pos.getX(i) + 0.5, pos.getY(i) + 0.5);
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    return geo;
  };
  const PAPER = '#f3ecdf';                                        // the beige cotton rag the card is printed on

  const back = new THREE.Mesh(new THREE.ShapeGeometry(outline(), 24), new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.9 }));
  const wheelArt = new THREE.Mesh(new THREE.PlaneGeometry(4.354 * IN, 4.354 * IN),
    printed('assets/volvelle/wheel.png', { alphaTest: 0.5, roughness: 0.5 }));
  volWheel.add(wheelArt);
  volWheel.position.z = 0.003;

  const face = outline();
  face.holes.push(ellipse(WINDOW_X, 0.995 * IN / 2, 1.266 * IN / 2), ellipse(0, 0.0625 * IN, 0.0625 * IN));
  volFront = new THREE.Mesh(planeUV(new THREE.ShapeGeometry(face, 48)),
    printed('assets/volvelle/front.png', { color: PAPER, roughness: 0.9 }));
  volFront.position.z = 0.006;

  // the pieces laid on by hand: two gold rails, the white panelled wainscot, the two stacked gilt rings
  const relief = new THREE.Group();
  relief.position.z = 0.0062;
  const edge = 0.900 * IN, railH = 0.077 * IN;
  [0.5 - edge - railH / 2, -0.5 + edge + railH / 2].forEach((y) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1, railH, 0.004), giltPlain);
    rail.position.set(0, y, 0.002);
    relief.add(rail);
  });
  const wc = document.createElement('canvas');
  wc.width = 1024; wc.height = Math.round(1024 * 0.900 / 4.521);
  const wx = wc.getContext('2d'), ppi = 1024 / 4.521;
  wx.fillStyle = '#fbfaf5'; wx.fillRect(0, 0, wc.width, wc.height);
  for (let i = 0; i < 5; i++) {                                   // five panels, three debossed outlines each
    const cx = (i + 0.5) * 1024 / 5, cy = wc.height / 2;
    [[0.804, 0.760], [0.724, 0.680], [0.644, 0.600]].forEach(([w, h]) => {
      wx.lineWidth = 1.4;
      wx.strokeStyle = 'rgba(255,255,255,.95)'; wx.strokeRect(cx - w * ppi / 2 + 1, cy - h * ppi / 2 + 1.2, w * ppi, h * ppi);
      wx.strokeStyle = 'rgba(118,110,98,.62)'; wx.strokeRect(cx - w * ppi / 2, cy - h * ppi / 2, w * ppi, h * ppi);
    });
  }
  const wainTex = new THREE.CanvasTexture(wc);
  wainTex.colorSpace = THREE.SRGBColorSpace; wainTex.anisotropy = 8;
  const wainscot = new THREE.Mesh(new THREE.BoxGeometry(1, edge, 0.003), [0, 1, 2, 3, 4, 5].map((k) =>
    new THREE.MeshStandardMaterial(k === 4 ? { map: wainTex, roughness: 0.85 } : { color: '#fbfaf5', roughness: 0.85 })));
  wainscot.position.set(0, -0.5 + edge / 2, 0.0015);
  relief.add(wainscot);
  const ring = (ow, oh, iw, ih, z) => {
    const sh = new THREE.Shape().absellipse(0, 0, ow * IN / 2, oh * IN / 2, 0, Math.PI * 2, false, 0);
    sh.holes.push(new THREE.Path().absellipse(0, 0, iw * IN / 2, ih * IN / 2, 0, Math.PI * 2, true, 0));
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.004, bevelEnabled: false, curveSegments: 64 }), giltPlain);
    m.position.set(WINDOW_X, 0, z);
    relief.add(m);
  };
  ring(1.411, 1.691, 1.030, 1.301, 0);                            // ring A, the larger, underneath
  ring(1.245, 1.525, 0.916, 1.187, 0.004);                        // ring B on top, lapping the window's cut edge
  const pearls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.6 / 25.4 * IN, 8, 6), giltPlain, 59);   // ring A's pearl course
  for (let i = 0; i < 59; i++) {
    const t = i / 59 * Math.PI * 2;
    pearls.setMatrixAt(i, new THREE.Matrix4().makeTranslation(WINDOW_X + Math.cos(t) * 1.328 * IN / 2, Math.sin(t) * 1.608 * IN / 2, 0.0042));
  }
  relief.add(pearls);
  const eyelet = new THREE.Mesh(new THREE.TorusGeometry(0.085 * IN, 0.03 * IN, 10, 28), brass);
  eyelet.position.z = 0.0085;

  volvelle.add(back, volWheel, volFront, relief, eyelet);
  volvelle.traverse((o) => { o.userData.volvelle = true; });
  volvelle.userData.station = ST.detVolvelle;
  scene.add(volvelle);

  // a soft contact shadow on the table, under the stand
  const sc = document.createElement('canvas');
  sc.width = sc.height = 128;
  const sx = sc.getContext('2d'), sg = sx.createRadialGradient(64, 64, 30, 64, 64, 64);
  sg.addColorStop(0, 'rgba(40,30,15,.5)'); sg.addColorStop(1, 'rgba(40,30,15,0)');
  sx.fillStyle = sg; sx.fillRect(0, 0, 128, 128);
  volShadow = new THREE.Mesh(new THREE.PlaneGeometry(VOL.SIZE * 1.35, VOL.SIZE * 1.35),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  scene.add(volShadow);
})();

// ---- its stand: a walnut base that props the card up, with an engraved brass plaque on the base's
// sloped front. It stands on the table's left half (the right is kept for the invitation), turned a
// little towards the middle of the room.
const TABLE_TOP = 0.9;
const volStand = new THREE.Group();
volStand.position.set(-0.47, TABLE_TOP, DET.zMid - 0.9 + 0.26);
volStand.rotation.y = 0.2;
scene.add(volStand);
const VOL_REST = { pos: new THREE.Vector3(), quat: new THREE.Quaternion() };
(function volvelleStand() {
  const W = 0.5, LEAN = 0.21;                                     // base width; how far the card leans back, radians
  // side profile of the base, front towards +x here: a low block whose front slopes back at 45 degrees
  const prof = [[-0.09, 0], [0.11, 0], [0.11, 0.015], [0.02, 0.105], [-0.09, 0.105]].map(([x, y]) => new THREE.Vector2(x, y));
  const base = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(prof), { depth: W, bevelEnabled: false }),
    new THREE.MeshStandardMaterial({ map: tex('assets/door-walnut-rail.jpg'), color: '#d9b48c', roughness: 0.5 }));
  base.rotation.y = -Math.PI / 2;                                 // profile's front now faces the viewer, width along x
  base.position.x = W / 2;
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(VOL.SIZE + 0.03, 0.012, 0.008), brass);   // the lip the card's foot sits behind
  ledge.position.set(0, 0.111, 0.006);
  volStand.add(base, ledge);
  [-0.1, 0.1].forEach((x) => {                                    // two brass struts behind, holding the card's back
    const foot = new THREE.Vector3(x, 0.105, -0.08), head = new THREE.Vector3(x, 0.105 + 0.22 * Math.cos(LEAN), -0.004 - 0.22 * Math.sin(LEAN) - 0.004);
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, foot.distanceTo(head), 8), brass);
    strut.position.copy(foot).add(head).multiplyScalar(0.5);
    strut.quaternion.setFromUnitVectors(Y_AXIS, head.clone().sub(foot).normalize());
    volStand.add(strut);
  });

  // the plaque: brushed brass, a fine engraved border, four screws, engraved lettering
  const PW = 0.46, PH = 0.112, c = document.createElement('canvas');
  c.width = 2048; c.height = Math.round(2048 * PH / PW);
  const plaqueTex = new THREE.CanvasTexture(c);
  plaqueTex.colorSpace = THREE.SRGBColorSpace; plaqueTex.anisotropy = 8;
  const draw = (serif) => {
    const x = c.getContext('2d'), w = c.width, h = c.height;
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#dcc07a'); g.addColorStop(0.45, '#bd984e'); g.addColorStop(1, '#93733a');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const rnd = seeded(41);
    for (let i = 0; i < 420; i++) {                               // brushing
      x.fillStyle = 'rgba(' + (rnd() < 0.5 ? '255,244,210,' : '60,40,10,') + (0.03 + rnd() * 0.05) + ')';
      x.fillRect(0, rnd() * h, w, 1 + rnd());
    }
    x.strokeStyle = 'rgba(58,40,10,.75)'; x.lineWidth = 4; x.strokeRect(24, 24, w - 48, h - 48);
    x.strokeStyle = 'rgba(255,240,200,.35)'; x.lineWidth = 2; x.strokeRect(27, 28, w - 54, h - 54);
    [[62, 62], [w - 62, 62], [62, h - 62], [w - 62, h - 62]].forEach(([sx, sy]) => {
      x.fillStyle = '#7a5d28'; x.beginPath(); x.arc(sx, sy, 13, 0, Math.PI * 2); x.fill();
      x.strokeStyle = 'rgba(40,26,6,.85)'; x.lineWidth = 3; x.beginPath(); x.moveTo(sx - 9, sy - 4); x.lineTo(sx + 9, sy + 4); x.stroke();
    });
    // engraved text: a light lower lip under dark lettering. Each row is a list of [text, font, letter-spacing] runs, centred.
    const row = (y, runs) => {
      const widths = runs.map(([t, f, ls]) => { x.font = f; if ('letterSpacing' in x) x.letterSpacing = ls + 'px'; return x.measureText(t).width; });
      let px = (w - widths.reduce((a, b) => a + b, 0)) / 2;
      x.textAlign = 'left'; x.textBaseline = 'alphabetic';
      runs.forEach(([t, f, ls], i) => {
        x.font = f; if ('letterSpacing' in x) x.letterSpacing = ls + 'px';
        x.fillStyle = 'rgba(255,243,208,.6)'; x.fillText(t, px, y + 3);
        x.fillStyle = '#33230a'; x.fillText(t, px, y);
        px += widths[i];
      });
    };
    row(h * 0.36, [['KELLY WHEELIS', '600 92px ' + serif, 14], ['   ·   ', '400 92px ' + serif, 0], ['Save the Date', 'italic 500 100px ' + serif, 2], [', 2026', '500 96px ' + serif, 2]]);
    row(h * 0.62, [['MIXED MEDIA: PAPER, INK, GOLD FOIL & BRASS', '500 58px ' + serif, 9]]);
    row(h * 0.83, [['Please touch — turn the wheel', 'italic 500 62px ' + serif, 3]]);
    plaqueTex.needsUpdate = true;
  };
  draw('Georgia, serif');
  if (document.fonts && document.fonts.load) {                    // redraw in the site's own face once it has loaded
    Promise.all([document.fonts.load("italic 500 40px 'EB Garamond'"), document.fonts.load("500 40px 'EB Garamond'")])
      .then(() => draw("'EB Garamond', Georgia, serif")).catch(() => {});
  }
  const plate = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.012, PH + 0.012, 0.004), brass);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.42, metalness: 0.25 }));
  face.position.z = 0.0022;
  const plaque = new THREE.Group();
  plaque.add(plate, face);
  plaque.position.set(0, 0.06 + 0.0025, 0.065 + 0.0025);          // centred on the base's sloped front
  plaque.rotation.x = -Math.PI / 4;
  volStand.add(plaque);
  volStand.traverse((o) => { o.userData.station = ST.detVolvelle; });

  // where the card rests: foot behind the ledge, leaning back against the struts
  volStand.updateMatrixWorld(true);
  VOL_REST.pos.set(0, 0.109 + VOL.SIZE / 2 * Math.cos(LEAN), -0.004 - VOL.SIZE / 2 * Math.sin(LEAN)).applyMatrix4(volStand.matrixWorld);
  VOL_REST.quat.copy(volStand.quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-LEAN, 0, 0)));
  volShadow.geometry = new THREE.PlaneGeometry(W * 1.35, 0.2 * 2.1);
  volShadow.rotation.set(-Math.PI / 2, 0, volStand.rotation.y);
  volShadow.position.set(volStand.position.x, TABLE_TOP + 0.002, volStand.position.z + 0.01);
})();

// ---- handling it: lift to the viewer at its stop, drag the wheel round, click to advance one plate
const volHeld = () => VOL.lift > 0.97;
const isVolvelle = (o) => !!(o && o.userData.volvelle);
function volAngleAt(clientX, clientY) {                           // the pointer's angle about the pivot, in the card's own plane
  const r = canvas.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
  const hit = raycaster.intersectObject(volFront, false)[0] || raycaster.intersectObject(volWheel, true)[0];
  if (!hit) return null;
  const p = volvelle.worldToLocal(hit.point.clone());
  return Math.atan2(p.y, p.x);
}
let volDrag = null;
canvas.style.touchAction = 'none';
canvas.addEventListener('pointerdown', (e) => {
  if (!volHeld()) return;
  const a = volAngleAt(e.clientX, e.clientY);
  if (a === null) return;
  volDrag = { a, moved: 0 };
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* not a live pointer */ }
});
canvas.addEventListener('pointermove', (e) => {
  if (!volDrag) return;
  const a = volAngleAt(e.clientX, e.clientY);
  if (a === null) return;
  let d = a - volDrag.a;
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  VOL.angle += d; VOL.target = VOL.angle;
  volDrag.a = a; volDrag.moved += Math.abs(d);
});
const volRelease = () => {
  if (!volDrag) return;
  // a plain click turns on to the next plate (counted from where the wheel is heading, so quick clicks
  // each count); a drag settles on whichever plate is nearest
  VOL.target = volDrag.moved < 0.04 ? Math.round(VOL.target / VOL.STEP) * VOL.STEP - VOL.STEP : Math.round(VOL.angle / VOL.STEP) * VOL.STEP;
  volDrag = null;
};
canvas.addEventListener('pointerup', volRelease);
canvas.addEventListener('pointercancel', volRelease);
function updateVolvelle() {
  const want = idx === ST.detVolvelle && !leg && !queue.length && settled() ? 1 : 0;
  VOL.lift += (want - VOL.lift) * 0.09;
  if (Math.abs(want - VOL.lift) < 0.002) VOL.lift = want;
  const k = easeInOut(VOL.lift);
  const held = camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(VOL.HOLD).add(camera.position);
  volvelle.position.lerpVectors(VOL_REST.pos, held, k);
  volvelle.position.y += Math.sin(k * Math.PI) * 0.06;            // a little arc on the way up
  volvelle.quaternion.slerpQuaternions(VOL_REST.quat, camera.quaternion, k);
  volvelle.scale.setScalar(VOL.SIZE);
  if (!volDrag) VOL.angle += (VOL.target - VOL.angle) * 0.16;
  volWheel.rotation.z = VOL.angle;
}

// ---------------------------------------------------------------- loop
function resize() {
  const stage = el('stage');
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(1, h);
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

function frame(now) {
  if (!leg && (queue.length || !settled())) startLeg();
  if (leg) {
    const k = Math.min(1, (now - leg.t0) / leg.ms);
    const e = easeInOut(k);
    if (leg.kind === 'turn') {
      cam.yaw = leg.from + (leg.to - leg.from) * e;
      cam.pitch = leg.pf + (leg.pt - leg.pf) * e;
      cam.eye = leg.ef + (leg.et - leg.ef) * e;
    } else {
      cam.x = leg.fx + (leg.tx - leg.fx) * e;
      cam.z = leg.fz + (leg.tz - leg.fz) * e;
    }
    if (k >= 1) { leg = null; }
  }
  camera.position.set(cam.x, cam.eye, cam.z);
  camera.rotation.set(cam.pitch, cam.yaw, 0, 'YXZ');
  camera.updateMatrixWorld();
  updateVolvelle();
  updatePointer();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
paintLabel(STATIONS[0]);
markRoom('atrium');
requestAnimationFrame(frame);
