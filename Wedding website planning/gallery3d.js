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

const GALLERY_Z = -2.6;      // centre of the two atrium mini galleries, along the hall

const STATIONS = [
  { id: 'atrium', x: 0, z: 4.6, yaw: 0, room: 'atrium', accent: '#C9A667',
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
    meta: 'RSVP opens with the invitation' }
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
function painting(src, aspect, w, x, z, rotY, station) {
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
  grp.userData.station = station;   // the stop that faces this picture; clicking it takes you there
  scene.add(grp);
  return grp;
}

painting('assets/birth-of-venus.jpg', 278 / 172, 3.6, -P.wingEndX + 0.07, -7.5, Math.PI / 2, ST.w1);
painting('assets/primavera.jpg', 314 / 203, 3.6, P.wingEndX - 0.07, -7.5, -Math.PI / 2, ST.w2);

function plate(colorA, colorB, x, z, rotY, station) {
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
  { wall: 'back', at: 0, y: 2.55, w: 3.4, h: 2.3 },                 // principal work, end wall
  { wall: 'back', at: -2.85, y: 3.0, w: 1.1, h: 0.9 },
  { wall: 'back', at: -2.85, y: 1.85, w: 1.0, h: 0.8 },
  { wall: 'back', at: 2.85, y: 2.95, w: 1.3, h: 1.0 },
  { wall: 'back', at: 2.52, y: 1.8, w: 0.55, h: 0.7 },
  { wall: 'back', at: 3.2, y: 1.8, w: 0.55, h: 0.7 },
  { wall: 'back', at: -4.2, y: 2.6, w: 0.9, h: 1.2 },
  { wall: 'back', at: 4.2, y: 2.6, w: 0.9, h: 1.2 },
  { wall: 'left', at: DET.zMid, y: 2.5, w: 3.0, h: 2.0 },           // "Everything we love, catalogued"
  { wall: 'left', at: DET.zMid + 2.75, y: 2.5, w: 1.2, h: 1.5 },
  { wall: 'left', at: DET.zMid - 2.75, y: 2.5, w: 1.2, h: 1.5 },
  { wall: 'right', at: DET.zMid, y: 2.5, w: 3.0, h: 2.0, blank: true },   // RSVP: the frame that gets a name in it
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
// a gilt frame, stepped in towards the picture; `src` hangs an image, otherwise a placeholder
function framedPicture(p, i) {
  const grp = new THREE.Group();
  const outer = new THREE.Mesh(new THREE.BoxGeometry(p.w + 0.28, p.h + 0.28, 0.08), frameMat);
  const lip = new THREE.Mesh(new THREE.BoxGeometry(p.w + 0.12, p.h + 0.12, 0.13), frameMat);
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(p.w, p.h), new THREE.MeshStandardMaterial({ map: p.src ? tex(p.src) : studyTexture(i, p.w / p.h, p.blank), roughness: 0.62 }));
  pic.position.z = 0.07;
  if (p.src) { pic.material.map.wrapS = pic.material.map.wrapT = THREE.ClampToEdgeWrapping; }
  [outer, lip, pic].forEach((m) => grp.add(m));
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
  grp.userData.station = { back: ST.det, left: ST.detL, right: ST.detR }[p.wall];
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

// ---- furniture and sculpture, built from simple solids
function bust(x, z, rotY) {
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
}
bust(-3.6, DET.zB + 0.55, 0);                       // flanking the end-wall hang
bust(3.6, DET.zB + 0.55, 0);
bust(-2.15, DET.zF - 0.5, Math.PI);                 // flanking the entrance arch, facing into the room
bust(2.15, DET.zF - 0.5, Math.PI);
table(0, DET.zMid - 0.9, 0, 2.4, 1.2, marbleBlue, paintedWood, 6);           // centre table
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
function tazza(fill) {                                // a shallow marble bowl on a stem, on its pedestal
  const g = pedestal(1.0);
  const bowl = lathe([[0, 0], [0.13, 0], [0.13, 0.03], [0.05, 0.07], [0.045, 0.2], [0.1, 0.25], [0.3, 0.33], [0.36, 0.4], [0.34, 0.41], [0.28, 0.35], [0, 0.31]], marbleWhite);
  bowl.position.y = 1.0;
  g.add(bowl);
  fill.position.y = 1.0 + 0.34; g.add(fill);
  return g;
}
function heap(colors, n, spread, rise, size, seed) {  // a mound of small round things: roses, fruit, blooms
  const g = new THREE.Group(), rnd = seeded(seed), mats = colors.map(tint);
  for (let i = 0; i < n; i++) {
    const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * spread, r = size * (0.8 + rnd() * 0.45);
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mats[Math.floor(rnd() * mats.length)]);
    m.position.set(Math.cos(a) * rr, rise * (1 - Math.pow(rr / spread, 2)) + r * 0.4, Math.sin(a) * rr);
    g.add(m);
  }
  for (let i = 0; i < Math.round(n / 4); i++) {       // a few leaves tucked between
    const a = rnd() * Math.PI * 2, rr = spread * (0.6 + rnd() * 0.45);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(size * 1.1, 8, 6), leafMat);
    leaf.scale.set(1.5, 0.35, 0.8); leaf.rotation.y = a;
    leaf.position.set(Math.cos(a) * rr, rise * 0.25, Math.sin(a) * rr);
    g.add(leaf);
  }
  return g;
}
function scallop() {                                  // Venus's shell, stood upright on a pedestal
  const g = pedestal(1.0), R = 0.42, A = 1.32, NA = 56, NR = 14, verts = [], index = [];
  for (let i = 0; i <= NA; i++) {
    const th = -A + 2 * A * i / NA, flute = Math.cos(th * 15);
    for (let j = 0; j <= NR; j++) {
      const t = j / NR, rr = R * t * (1 + 0.035 * flute * t);
      verts.push(rr * Math.sin(th), rr * Math.cos(th), 0.2 * R * Math.sin(Math.PI * Math.pow(t, 0.8)) * Math.cos(th * 0.85) + 0.016 * flute * t);
    }
  }
  for (let i = 0; i < NA; i++) for (let j = 0; j < NR; j++) {
    const a = i * (NR + 1) + j, b = a + 1, c = a + NR + 1, d = c + 1;
    index.push(a, c, b, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  const shell = new THREE.Mesh(geo, pearl);
  shell.position.set(0, 1.08, -0.04); shell.rotation.x = -0.28;
  const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.09, 0.08), pearl);
  hinge.position.set(0, 1.05, -0.02);
  g.add(shell, hinge);
  return g;
}
function citrusTree(seed) {                           // an orange tree in a terracotta pot, as in the Primavera grove
  const g = new THREE.Group(), rnd = seeded(seed);
  g.add(lathe([[0, 0], [0.2, 0], [0.23, 0.05], [0.29, 0.42], [0.335, 0.46], [0.335, 0.53], [0.285, 0.53], [0.27, 0.5], [0, 0.5]], terracotta));
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.05, 10), tint('#5b4632'));
  trunk.position.y = 1.0; g.add(trunk);
  [[0, 1.8, 0, 0.4], [0.2, 1.68, 0.1, 0.3], [-0.2, 1.72, -0.08, 0.31], [0.04, 2.02, -0.1, 0.3], [-0.06, 1.66, 0.2, 0.28]].forEach(([x, y, z, r]) => {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 2), leafMat);
    f.position.set(x, y, z); g.add(f);
  });
  const orange = tint('#e08a2c');
  for (let i = 0; i < 14; i++) {
    const a = rnd() * Math.PI * 2, e = (rnd() - 0.35) * 1.6, R = 0.43;
    const o = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), orange);
    o.position.set(Math.cos(a) * Math.cos(e) * R, 1.8 + Math.sin(e) * R * 0.85, Math.sin(a) * Math.cos(e) * R);
    g.add(o);
  }
  return g;
}
(function furnishWings() {
  const endX = P.wingEndX - 0.4, sideX = 1830 * U, zFar = P.wingFarZ + 0.38, zNear = P.wingNearZ - 0.38, flank = 2.18;
  // Wing I
  place(urn(), -endX, -7.5 - flank, Math.PI / 2);
  place(urn(), -endX, -7.5 + flank, Math.PI / 2);
  place(scallop(), -sideX, zFar, 0);
  place(tazza(heap(['#e7a9ad', '#f3d3d0', '#d98a93', '#f6e6df'], 30, 0.27, 0.12, 0.05, 7)), -sideX, zNear, Math.PI);
  // Wing II
  const blooms = ['#e9a0a8', '#f4efe4', '#e2725b', '#e8c45a', '#b9a3d0', '#d95f76'];
  place(urn(heap(blooms, 46, 0.3, 0.3, 0.05, 11)), endX, -7.5 - flank, -Math.PI / 2);
  place(urn(heap(blooms, 46, 0.3, 0.3, 0.05, 23)), endX, -7.5 + flank, -Math.PI / 2);
  place(citrusTree(5), sideX, zFar + 0.05, 0);
  place(citrusTree(9), sideX, zNear - 0.05, 0);
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
sign([{ t: '←', font: '600 74px Georgia' }, { t: 'WING I', font: '600 62px Georgia' }],
  1.9, 0.95, -P.wingEndX + 0.06, 2.0, P.wingFarZ + 1.6, Math.PI / 2);
sign([{ t: '→', font: '600 74px Georgia' }, { t: 'WING II', font: '600 62px Georgia' }],
  1.9, 0.95, P.wingEndX - 0.06, 2.0, P.wingFarZ + 1.6, -Math.PI / 2);

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

function pictureLight(x, y, z, tx, ty, tz, shadow = true, power = 26) {
  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.12), brass);
  housing.position.set(x, y, z);
  scene.add(housing);
  const sp = new THREE.SpotLight('#ffe7ba', power, 9, 0.62, 0.55, 1.6);
  sp.position.set(x, y, z);
  sp.target.position.set(tx, ty, tz);
  if (shadow) {
    sp.castShadow = true;
    sp.shadow.mapSize.set(1024, 1024);
  }
  scene.add(sp);
  scene.add(sp.target);
}
pictureLight(-P.wingEndX + 0.6, H - 0.5, -7.5, -P.wingEndX, 1.95, -7.5);
pictureLight(P.wingEndX - 0.6, H - 0.5, -7.5, P.wingEndX, 1.95, -7.5);
pictureLight(-1500 * U, H - 0.5, P.wingFarZ + 0.6, -1500 * U, 1.95, P.wingFarZ);
pictureLight(-1500 * U, H - 0.5, P.wingNearZ - 0.6, -1500 * U, 1.95, P.wingNearZ);
pictureLight(1500 * U, H - 0.5, P.wingFarZ + 0.6, 1500 * U, 1.95, P.wingFarZ);
pictureLight(1500 * U, H - 0.5, P.wingNearZ - 0.6, 1500 * U, 1.95, P.wingNearZ);

pictureLight(0, H - 0.14, DET.zB + 1.0, 0, 2.55, DET.zB, false, 9);
pictureLight(-DET.x + 1.0, H - 0.14, DET.zMid, -DET.x, 2.5, DET.zMid, false, 9);
pictureLight(DET.x - 1.0, H - 0.14, DET.zMid, DET.x, 2.5, DET.zMid, false, 9);

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

  if (t.x !== 0 && roomAt() === t.room) {
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
    paintLabel(t);
    markRoom(t.room);
    return;
  }

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
    const dz = Math.abs(cam.z - t.z);
    const facing = cam.x === 0 && Math.abs(shortAngle(cam.yaw, t.yaw) - cam.yaw) < 0.01;
    if (dz > 0.01 && facing && dz < 3) {
      pushMove(t.x, t.z);                  // a neighbouring frame on the wall you already face: sidestep along it
    } else if (dz > 0.01) {
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
  // the step-back button shows everywhere except the atrium's own stop
  const home = idx === ROOM_ENTRY.atrium;
  el('back').style.opacity = home ? '0' : '1';
  el('back').style.pointerEvents = home ? 'none' : 'auto';
}
// step back one level: from a side picture to the room's entry stop (where the other pictures
// are in view to click), and from the entry stop out to the atrium
el('back').addEventListener('click', () => {
  const entry = ROOM_ENTRY[STATIONS[idx].room];
  goTo(idx === entry ? ROOM_ENTRY.atrium : entry);
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

const roomAt = () => (cam.x < -P.corrX ? 'w1' : cam.x > P.corrX ? 'w2' : cam.z < P.wingFarZ ? 'det' : 'atrium');
const raycaster = new THREE.Raycaster();
// what lies under a screen point: the room a click there leads to (null if it isn't on a
// doorway) and the first solid surface along the line of sight
function probe(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  raycaster.setFromCamera(new THREE.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1), camera);
  const here = roomAt();
  let own = false, target = null, surface = null, station;
  for (const hit of raycaster.intersectObjects(scene.children, true)) {
    const room = hit.object.userData.room;
    if (!room) {                            // anything solid ends the line of sight
      surface = hit;
      for (let o = hit.object; o && station === undefined; o = o.parent) station = o.userData.station;
      break;
    }
    if (room === here) own = true; else target = room;
  }
  // the doorway of the room you are standing in leads back out to the atrium
  // a picture only counts from inside its own room, and not through a doorway
  if (station !== undefined && (own || target || STATIONS[station].room !== here)) station = undefined;
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
    canvas.style.cursor = p.room || p.station !== undefined ? 'pointer' : '';
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
  camera.updateMatrixWorld();
  updatePointer();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
paintLabel(STATIONS[0]);
markRoom('atrium');
requestAnimationFrame(frame);
