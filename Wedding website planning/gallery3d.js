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
  detFarZ: -15        // details hall end wall
};

const STATIONS = [
  { x: 0, z: 4.6, yaw: 0, room: 'atrium', accent: '#C9A667',
    eyebrow: 'The atrium', title: 'Two collections, one exhibit',
    body: 'Villa Cetinale, in the hills outside Siena. Two wings and five days of open hours. Wing I is through the opening on your left, Wing II on your right; the hall straight ahead holds the exhibit details — travel, lodging, and the program.',
    meta: 'Turn and choose a wing' },

  { x: -1150 * U, z: -7.5, yaw: Math.PI / 2, room: 'w1', accent: '#93AEA2',
    eyebrow: 'Wing I · principal work', title: 'The Birth of Venus',
    body: 'Botticelli gave a woman the entire centre of the canvas, in gold light, with flowers in the air and nobody hurrying her. That is the tone of the ceremony — femininity taken completely seriously.',
    meta: 'Sandro Botticelli, c. 1485 · Uffizi, Florence' },
  { x: -1500 * U, z: -7.5, yaw: 0, room: 'w1', accent: '#93AEA2',
    eyebrow: 'Wing I · complementary work', title: 'The Procession',
    body: 'Down the cypress avenue at four o’clock, in the part of the afternoon when the light does the work for you.',
    meta: 'Live performance · approx. 30 minutes' },
  { x: -1500 * U, z: -7.5, yaw: Math.PI, room: 'w1', accent: '#93AEA2',
    eyebrow: 'Wing I · complementary work', title: 'The Vows',
    body: 'Written by both of us, read once, never rehearsed. Anthony maintains he will not cry.',
    meta: 'Ink on paper · 2027' },

  { x: 1150 * U, z: -7.5, yaw: -Math.PI / 2, room: 'w2', accent: '#D19A6E',
    eyebrow: 'Wing II · principal work', title: 'Primavera',
    body: 'A hundred and ninety species of plant in one painting, and a garden that refuses to stop. The reception takes this as instruction rather than inspiration.',
    meta: 'Sandro Botticelli, c. 1480 · Uffizi, Florence' },
  { x: 1500 * U, z: -7.5, yaw: 0, room: 'w2', accent: '#D19A6E',
    eyebrow: 'Wing II · complementary work', title: 'The Banquet',
    body: 'Tables dressed as banquet still life: figs, pomegranates, spilled candle wax, far too many flowers. We are attempting fewer than a hundred and ninety.',
    meta: 'Still life · perishable · hours undecided' },
  { x: 1500 * U, z: -7.5, yaw: Math.PI, room: 'w2', accent: '#D19A6E',
    eyebrow: 'Wing II · complementary work', title: 'The Dancing',
    body: 'Three Graces, minimum. Participation is not optional but skill is not required.',
    meta: 'Performance · ongoing' },

  { x: 0, z: -12.5, yaw: 0, room: 'det', accent: '#C9A667',
    eyebrow: 'Exhibit details · visiting', title: 'Getting to Sovicille',
    body: 'Twenty minutes west of Siena, in the hills. Fly into Florence (FLR) or Pisa (PSA) and drive down through the Chianti — about ninety minutes. Rome (FCO) works too, at roughly three hours.',
    meta: 'Lodging, transport and the five-day program are still being arranged' },
  { x: 0, z: -12.5, yaw: Math.PI / 2, room: 'det', accent: '#A79C85',
    eyebrow: 'Exhibit details · permanent collection', title: 'Everything we love, catalogued',
    body: 'The dogs, the card table, the shared library, the plastic brick. Everything in this exhibit is something one of us loves.',
    meta: 'Mixed media · ongoing' },
  { x: 0, z: -12.5, yaw: -Math.PI / 2, room: 'det', accent: '#C9A667',
    eyebrow: 'Exhibit details · RSVP', title: 'The exhibit is complete but for one element.',
    body: 'Invitations follow, and with them this frame gets a name in it.',
    meta: 'RSVP opens with the invitation' }
];
const ROOM_ENTRY = { atrium: 0, w1: 1, w2: 4, det: 7 };
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
const stone = new THREE.MeshStandardMaterial({ map: tex('assets/tex-stone.jpg', 10, 14), color: '#cfcabf', roughness: 0.42, metalness: 0.02 });
const ceilingMat = new THREE.MeshStandardMaterial({ color: '#e6ddc8', roughness: 1, side: THREE.DoubleSide, emissive: '#6a5f46', emissiveIntensity: 0.5 });
const skirt = new THREE.MeshStandardMaterial({ color: '#8d8578', roughness: 0.8 });
const brass = new THREE.MeshStandardMaterial({ color: '#c9a45c', roughness: 0.32, metalness: 0.85 });
const frameMat = new THREE.MeshStandardMaterial({ color: '#b3893f', roughness: 0.38, metalness: 0.6 });

// ---- shell
const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), stone);
floor.name = 'floor';
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const VAULT = { x0: -2.5, x1: 2.5, z0: -15, z1: 12, spring: H, crown: H + 2.45 };
(function ceiling() {
  const plan = new THREE.Shape();
  plan.moveTo(-20, -20); plan.lineTo(20, -20); plan.lineTo(20, 20); plan.lineTo(-20, 20); plan.lineTo(-20, -20);
  [[VAULT.x0, VAULT.x1, VAULT.z0, VAULT.z1], [-12.5, -2.5, -10, -5], [2.5, 12.5, -10, -5]].forEach((r) => {
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

function groinBay(cx, cz, W, D) {
  const rise = VAULT.crown - VAULT.spring;
  const N = 26;
  const g = new THREE.PlaneGeometry(W, D, N, N);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const u = (pos.getX(i) / W) + 0.5;
    const v = (pos.getY(i) / D) + 0.5;
    const a = Math.sqrt(Math.max(0, 1 - Math.pow(2 * u - 1, 2)));
    const b = Math.sqrt(Math.max(0, 1 - Math.pow(2 * v - 1, 2)));
    pos.setZ(i, -rise * (1 - Math.min(a, b)));
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, vaultMat);
  m.rotation.x = Math.PI / 2;
  m.position.set(cx, VAULT.crown, cz);
  scene.add(m);

  // diagonal groin ribs
  [[-1, -1, 1, 1], [-1, 1, 1, -1]].forEach((d) => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const u = 0.5 + (d[0] + (d[2] - d[0]) * t) * 0.5;
      const v = 0.5 + (d[1] + (d[3] - d[1]) * t) * 0.5;
      const a = Math.sqrt(Math.max(0, 1 - Math.pow(2 * u - 1, 2)));
      const b = Math.sqrt(Math.max(0, 1 - Math.pow(2 * v - 1, 2)));
      pts.push(new THREE.Vector3(cx + (u - 0.5) * W, VAULT.crown - rise * (1 - Math.min(a, b)) - 0.04, cz + (v - 0.5) * D));
    }
    const rib = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.05, 8, false), ribMat);
    scene.add(rib);
  });

  // transverse arch at the bay's leading edge
  const arc = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const a = Math.sqrt(Math.max(0, 1 - Math.pow(2 * t - 1, 2)));
    arc.push(new THREE.Vector3(cx + (t - 0.5) * W, VAULT.crown - rise * (1 - a) - 0.04, cz - D / 2));
  }
  const band = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc), 40, 0.055, 8, false), ribMat);
  scene.add(band);
}

(function endCaps() {
  [VAULT.z1, VAULT.z0].forEach((z) => {
    const cap = new THREE.Mesh(new THREE.PlaneGeometry(VAULT.x1 - VAULT.x0, VAULT.crown - VAULT.spring + 0.1), vaultMat);
    cap.position.set(0, VAULT.spring + (VAULT.crown - VAULT.spring) / 2, z);
    scene.add(cap);
  });
})();

(function vaultWings() {
  [-10, -5, 5, 10].forEach((cx) => groinBay(cx, -7.5, 5, 5));
})();

(function vaultHall() {
  const W = VAULT.x1 - VAULT.x0;
  const span = VAULT.z1 - VAULT.z0;
  const bays = Math.round(span / 5.4);
  const D = span / bays;
  for (let i = 0; i < bays; i++) {
    groinBay(0, VAULT.z1 - D / 2 - i * D, W, D);
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
  wall(sx, DOOR_B, sx, P.detFarZ, plasterWide);
});
wall(-P.corrX, P.backZ, P.corrX, P.backZ);

// wings
wall(-P.wingEndX, P.wingNearZ, -P.corrX, P.wingNearZ, plasterWide);
wall(-P.wingEndX, P.wingFarZ, -P.corrX, P.wingFarZ, plasterWide);
wall(-P.wingEndX, P.wingFarZ, -P.wingEndX, P.wingNearZ);
wall(P.corrX, P.wingNearZ, P.wingEndX, P.wingNearZ, plasterWide);
wall(P.corrX, P.wingFarZ, P.wingEndX, P.wingFarZ, plasterWide);
wall(P.wingEndX, P.wingFarZ, P.wingEndX, P.wingNearZ);

// details hall end wall
wall(-P.corrX, P.detFarZ, P.corrX, P.detFarZ);

// an arched head over any opening: fills the wall above a semicircular arch
function archHead(x, z, rotY, openW, springs) {
  const r = openW / 2;
  const outer = new THREE.Shape();
  outer.moveTo(-r, 0); outer.lineTo(-r, H); outer.lineTo(r, H); outer.lineTo(r, 0); outer.lineTo(-r, 0);
  const hole = new THREE.Path();
  hole.moveTo(-r, 0); hole.lineTo(-r, springs);
  hole.absarc(0, springs, r, Math.PI, 0, true);
  hole.lineTo(r, 0); hole.lineTo(-r, 0);
  outer.holes.push(hole);
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(outer, { depth: 0.26, bevelEnabled: false }), plaster);
  m.position.set(x, 0, z);
  m.rotation.y = rotY;
  m.translateZ(-0.13);
  m.receiveShadow = true;
  scene.add(m);

}

// arched openings into both wings
archHead(-P.corrX, -7.5, Math.PI / 2, 2.6, 2.3);
archHead(P.corrX, -7.5, Math.PI / 2, 2.6, 2.3);

// arched doorway into the details hall
(function detailsArch() {
  const z = P.wingFarZ, openW = 2.7, springs = 2.3, r = openW / 2;
  const pierW = (P.corrX * 2 - openW) / 2;
  [-1, 1].forEach((sgn) => {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(pierW, H, 0.28), plaster);
    pier.position.set(sgn * (openW / 2 + pierW / 2), H / 2, z);
    pier.receiveShadow = true;
    scene.add(pier);
  });
  const head = new THREE.Mesh(new THREE.BoxGeometry(P.corrX * 2, H - (springs + r), 0.28), plaster);
  head.position.set(0, springs + r + (H - springs - r) / 2, z);
  scene.add(head);
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
function painting(src, aspect, w, x, z, rotY) {
  const h = w / aspect;
  const grp = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.BoxGeometry(w + 0.22, h + 0.22, 0.09), frameMat);
  outer.name = 'frame';
  outer.castShadow = true;
  grp.add(outer);
  const canvasMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: tex(src), roughness: 0.62 })
  );
  canvasMesh.name = 'canvas';
  canvasMesh.position.z = 0.05;
  grp.add(canvasMesh);
  grp.position.set(x, 1.95, z);
  grp.rotation.y = rotY;
  scene.add(grp);
  return grp;
}

painting('assets/birth-of-venus.jpg', 278 / 172, 3.6, -P.wingEndX + 0.07, -7.5, Math.PI / 2);
painting('assets/primavera.jpg', 314 / 203, 3.6, P.wingEndX - 0.07, -7.5, -Math.PI / 2);

function plate(colorA, colorB, x, z, rotY) {
  const g = new THREE.Group();
  const f = new THREE.Mesh(new THREE.BoxGeometry(1.06, 1.42, 0.08), frameMat);
  f.castShadow = true;
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
  p.position.z = 0.045;
  g.add(p);
  g.position.set(x, 1.95, z);
  g.rotation.y = rotY;
  scene.add(g);
}
plate('#f3e4ce', '#3b4a45', -1500 * U, P.wingFarZ + 0.07, 0);
plate('#fbeedc', '#5a3a30', -1500 * U, P.wingNearZ - 0.07, Math.PI);
plate('#f0a86c', '#241612', 1500 * U, P.wingFarZ + 0.07, 0);
plate('#f7de9b', '#2e230c', 1500 * U, P.wingNearZ - 0.07, Math.PI);

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
sign([{ t: '←', font: '600 74px Georgia' }, { t: 'WING I', font: '600 62px Georgia' }],
  1.9, 0.95, -P.wingEndX + 0.06, 2.0, P.wingFarZ + 1.6, Math.PI / 2);
sign([{ t: '→', font: '600 74px Georgia' }, { t: 'WING II', font: '600 62px Georgia' }],
  1.9, 0.95, P.wingEndX - 0.06, 2.0, P.wingFarZ + 1.6, -Math.PI / 2);

// suspended directory over the corridor
const plaque = new THREE.Mesh(
  new THREE.BoxGeometry(3.3, 0.95, 0.07),
  new THREE.MeshStandardMaterial({ color: '#5b4a25', roughness: 0.5, metalness: 0.35 })
);
plaque.position.set(0, H - 1.0, -10.6);
plaque.castShadow = true;
scene.add(plaque);
const plaqueFace = new THREE.Mesh(
  new THREE.PlaneGeometry(3.1, 0.8),
  new THREE.MeshStandardMaterial({
    map: signTexture([
      { t: '←  WING I  ·  WING II  →', font: '500 40px Georgia', color: '#f2dfae', gap: 62 },
      { t: 'EXHIBIT DETAILS  ↑', font: '500 40px Georgia', color: '#f2dfae' }
    ], 1024, 256), transparent: true, roughness: 0.5
  })
);
plaqueFace.position.set(0, H - 1.0, -10.55);
scene.add(plaqueFace);
[-0.8, 0.8].forEach((dx) => {
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 8), brass);
  rod.position.set(dx, H - 0.3, -10.6);
  scene.add(rod);
});

// ---- lighting
scene.add(new THREE.HemisphereLight('#fff4e0', '#8a8070', 1.25));
const ambient = new THREE.AmbientLight('#fff1d8', 0.5);
scene.add(ambient);

function pictureLight(x, y, z, tx, ty, tz) {
  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.12), brass);
  housing.position.set(x, y, z);
  scene.add(housing);
  const sp = new THREE.SpotLight('#ffe7ba', 26, 9, 0.62, 0.55, 1.6);
  sp.position.set(x, y, z);
  sp.target.position.set(tx, ty, tz);
  sp.castShadow = true;
  sp.shadow.mapSize.set(1024, 1024);
  scene.add(sp);
  scene.add(sp.target);
}
pictureLight(-P.wingEndX + 0.6, H - 0.5, -7.5, -P.wingEndX, 1.95, -7.5);
pictureLight(P.wingEndX - 0.6, H - 0.5, -7.5, P.wingEndX, 1.95, -7.5);
pictureLight(-1500 * U, H - 0.5, P.wingFarZ + 0.6, -1500 * U, 1.95, P.wingFarZ);
pictureLight(-1500 * U, H - 0.5, P.wingNearZ - 0.6, -1500 * U, 1.95, P.wingNearZ);
pictureLight(1500 * U, H - 0.5, P.wingFarZ + 0.6, 1500 * U, 1.95, P.wingFarZ);
pictureLight(1500 * U, H - 0.5, P.wingNearZ - 0.6, 1500 * U, 1.95, P.wingNearZ);

// warm pools down the corridor so the space reads as lit
[[0, 10], [0, 6.5], [0, 3], [0, -0.5], [0, -4], [0, -7.5], [0, -11], [0, -14]].forEach(([x, z]) => {
  const pl = new THREE.PointLight('#ffeccb', 7, 9, 2);
  pl.position.set(x, H - 0.6, z);
  scene.add(pl);
});

[10, 5, 0, -5, -10, -14].forEach((z) => {
  const up = new THREE.PointLight('#ffeccb', 5, 7, 2);
  up.position.set(0, VAULT.spring + 0.5, z);
  scene.add(up);
});

// ---------------------------------------------------------------- camera moves
let idx = 0;
const cam = { x: 0, z: 0, yaw: 0 };
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

function goTo(n) {
  const i = Math.max(0, Math.min(STATIONS.length - 1, n));
  if (i === idx && queue.length === 0 && !leg) return;
  const t = STATIONS[i];
  idx = i;
  queue = []; leg = null;
  hideMotto();

  if (cam.x !== 0) {                       // step out of a wing onto the corridor line
    pushTurn(cam.x < 0 ? -Math.PI / 2 : Math.PI / 2);
    pushMove(0, cam.z);
  }
  if (t.x !== 0) {
    if (Math.abs(cam.z - JUNCTION_Z) > 0.01) {
      pushTurn(cam.z > JUNCTION_Z ? 0 : Math.PI);
      pushMove(0, JUNCTION_Z);
    }
    pushTurn(t.yaw);
    pushMove(t.x, t.z);
  } else {
    if (Math.abs(cam.z - t.z) > 0.01) {
      pushTurn(cam.z > t.z ? 0 : Math.PI);
      pushMove(t.x, t.z);
    }
    pushTurn(t.yaw);
  }
  paintLabel(t);
  markRoom(t.room);
}

function startLeg() {
  const step = queue.shift();
  if (!step) { leg = null; return; }
  if (step.kind === 'turn') {
    const to = shortAngle(cam.yaw, step.yaw);
    if (Math.abs(to - cam.yaw) < 0.001) return startLeg();
    leg = { kind: 'turn', from: cam.yaw, to, t0: performance.now(), ms: step.ms };
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
}
document.querySelectorAll('[data-room]').forEach((b) => {
  b.addEventListener('click', () => goTo(ROOM_ENTRY[b.getAttribute('data-room')]));
});
el('nav').querySelector('[data-back]').addEventListener('click', () => goTo(idx - 1));
el('nav').querySelector('[data-fwd]').addEventListener('click', () => goTo(idx + 1));
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') goTo(idx + 1);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') goTo(idx - 1);
});

let mottoTimer = null;
function hideMotto() {
  clearTimeout(mottoTimer);
  el('motto').style.opacity = '0';
}
function openDoors(instant) {
  el('gateCopy').style.opacity = '0';
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
  if (!leg && queue.length) startLeg();
  if (leg) {
    const k = Math.min(1, (now - leg.t0) / leg.ms);
    const e = easeInOut(k);
    if (leg.kind === 'turn') {
      cam.yaw = leg.from + (leg.to - leg.from) * e;
    } else {
      cam.x = leg.fx + (leg.tx - leg.fx) * e;
      cam.z = leg.fz + (leg.tz - leg.fz) * e;
    }
    if (k >= 1) { leg = null; }
  }
  camera.position.set(cam.x, EYE, cam.z);
  camera.rotation.set(0, cam.yaw, 0, 'YXZ');
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
paintLabel(STATIONS[0]);
markRoom('atrium');
requestAnimationFrame(frame);
