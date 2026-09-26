// The build station: a pop-up where a signed-in household makes its figures for the LEGO shelf (one per seat) and
// edits them later. A live 3D preview turns slowly (drag to turn it yourself); each part has its own wheel with arrows,
// hair color and skin tone are swatches, "Surprise me" rolls a random figure, and the figure needs a name before it goes
// on the shelf. Shared by the 3D gallery and the phone guide: each passes the household, its saved figures, and a save
// function (the page's own call to api/guest.js). Inputs are never focused on their own: on a phone the keyboard comes
// up only when the name box is tapped (the owner's rule: the keyboard belongs to the RSVP, the initials and this name).
import * as THREE from 'three';
import * as F from './figs.js';

const ROWS = [
  ['hair', 'Hair & hats', F.HAIRS], ['hc', 'Hair color', F.HAIR_COLORS, true], ['face', 'Face', F.FACES], ['skin', 'Skin tone', F.SKINS, true],
  ['torso', 'Torso', F.TORSOS], ['legs', 'Legs', F.LEGS], ['acc', 'In hand', F.ACCS],
];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CSS = `
.lgs{position:fixed;inset:0;z-index:95;display:none;place-items:center;padding:clamp(8px,3vw,40px);background:rgba(20,15,10,.78);font-family:'EB Garamond',Georgia,serif;color:#2B2520}
.lgs.open{display:grid}
.lgs-card{position:relative;width:min(940px,100%);max-height:100%;overflow:auto;background:#F6F1E4 url(/assets/tex-plaster.jpg) center/cover;background-blend-mode:multiply;box-shadow:0 20px 70px rgba(0,0,0,.6);border-top:5px solid #7A1A3C;padding:clamp(14px,2.4vw,26px)}
.lgs-eyebrow{margin:0 0 4px;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#7A1A3C}
.lgs-title{margin:0 0 10px;font:500 clamp(22px,3vw,30px)/1.1 'Cormorant Garamond',Georgia,serif}
.lgs-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}
.lgs-tab{height:32px;padding:0 12px;border:1px solid rgba(122,26,60,.45);background:transparent;color:#7A1A3C;font:13px 'EB Garamond',Georgia,serif;cursor:pointer;max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lgs-tab.on{background:#7A1A3C;color:#F6F1E4}
.lgs-main{display:grid;grid-template-columns:minmax(220px,340px) 1fr;gap:clamp(12px,2vw,24px);align-items:start}
.lgs-stage{position:relative;aspect-ratio:3/4;background:radial-gradient(ellipse at 50% 40%,#fffaf0 0%,#e9dfca 70%,#d9ccb0 100%);box-shadow:inset 0 0 0 1px rgba(122,26,60,.25);touch-action:none;cursor:grab}
.lgs-stage canvas{display:block;width:100%;height:100%}
.lgs-dice{position:absolute;left:50%;top:10px;transform:translateX(-50%);height:32px;padding:0 14px;border:1px solid #7A1A3C;background:rgba(246,241,228,.92);color:#7A1A3C;font:12px 'EB Garamond',Georgia,serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;white-space:nowrap}
.lgs-rows{display:grid;gap:7px}
.lgs-row{display:grid;grid-template-columns:92px 30px 1fr 30px;align-items:center;gap:6px}
.lgs-row .k{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7A1A3C}
.lgs-row button.arr{width:30px;height:30px;border-radius:50%;border:1px solid rgba(122,26,60,.55);background:#fffaf0;color:#7A1A3C;font:15px/1 Georgia,serif;cursor:pointer;padding:0}
.lgs-row .v{height:30px;display:flex;align-items:center;justify-content:center;gap:6px;border-bottom:1px solid rgba(43,37,32,.3);font:17px 'Cormorant Garamond',Georgia,serif;text-align:center;white-space:nowrap;overflow:hidden}
.lgs-row .v small{font:11px 'EB Garamond',Georgia,serif;color:#8a7d6a}
.lgs-sw{grid-column:2 / 5;display:flex;flex-wrap:wrap;gap:6px}
.lgs-sw button{width:24px;height:24px;border-radius:50%;border:2px solid #fffaf0;box-shadow:0 0 0 1px rgba(43,37,32,.35);cursor:pointer;padding:0}
.lgs-sw button.on{box-shadow:0 0 0 2px #7A1A3C}
.lgs-name{display:grid;grid-template-columns:92px 1fr;align-items:center;gap:6px;margin-top:4px}
.lgs-name span{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#7A1A3C}
.lgs-name input{height:32px;border:0;border-bottom:1px solid #7A1A3C;background:transparent;font:18px 'Cormorant Garamond',Georgia,serif;color:#2B2520;padding:0 4px;outline:none}
.lgs-msg{min-height:20px;margin:10px 0 0;font-style:italic;color:#7A1A3C}
.lgs-btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.lgs-btns button{height:38px;padding:0 16px;border:1px solid #7A1A3C;background:transparent;color:#7A1A3C;font:12px 'EB Garamond',Georgia,serif;letter-spacing:.2em;text-transform:uppercase;cursor:pointer}
.lgs-btns button.ok{background:#7A1A3C;color:#F6F1E4}
.lgs-btns button:disabled{opacity:.5;cursor:default}
.lgs-btns .sp{flex:1}
@media (max-width:700px){.lgs{padding:0;place-items:stretch}.lgs-card{max-height:none;height:100%;border-top-width:4px}.lgs-main{grid-template-columns:1fr}.lgs-stage{aspect-ratio:auto;height:34vh}.lgs-row{grid-template-columns:80px 34px 1fr 34px}.lgs-row button.arr{width:34px;height:34px}.lgs-name{grid-template-columns:80px 1fr}}
`;

let root = null, S = null;
function build() {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  root = document.createElement('div'); root.className = 'lgs'; root.id = 'lgs'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'The build station');
  root.innerHTML = `<div class="lgs-card"><p class="lgs-eyebrow">The LEGO shelf &middot; build station</p><h3 class="lgs-title" id="lgsTitle"></h3>
    <div class="lgs-tabs" id="lgsTabs"></div>
    <div class="lgs-main"><div class="lgs-stage" id="lgsStage"><button type="button" class="lgs-dice" id="lgsDice">Surprise me</button></div>
      <div><div class="lgs-rows" id="lgsRows"></div>
        <label class="lgs-name"><span>Name</span><input id="lgsName" type="text" maxlength="20" autocomplete="off" placeholder="Name your figure"></label></div></div>
    <p class="lgs-msg" id="lgsMsg"></p>
    <div class="lgs-btns"><button type="button" class="ok" id="lgsSave">Put it on the shelf</button><button type="button" id="lgsRemove">Take it off the shelf</button><span class="sp"></span><button type="button" id="lgsClose">Close</button></div></div>`;
  document.body.appendChild(root);
  const $ = (id) => root.querySelector('#' + id);
  root.addEventListener('click', (e) => { if (e.target === root) close(); });
  $('lgsClose').addEventListener('click', close);
  $('lgsDice').addEventListener('click', () => { const r = F.randomFig(); cur().p = r.p; paint(); });
  $('lgsName').addEventListener('input', () => { cur().name = $('lgsName').value; paintTabs(); });
  $('lgsSave').addEventListener('click', save);
  $('lgsRemove').addEventListener('click', remove);
  $('lgsRows').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const [key, list] = ROWS.find((r) => r[0] === b.dataset.k).slice(0, 3).filter((_, i) => i !== 1);
    const p = cur().p, i = Math.max(0, list.findIndex((x) => x.id === p[key]));
    if (b.dataset.d) p[key] = list[(i + +b.dataset.d + list.length) % list.length].id; else p[key] = b.dataset.id;
    paint();
  });
  $('lgsTabs').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.add) { const f = F.randomFig(); S.work.push(f); S.at = S.work.length - 1; } else S.at = +b.dataset.i;
    paint();
  });
  document.addEventListener('keydown', (e) => { if (S && S.open && e.key === 'Escape') { e.stopPropagation(); close(); } }, true);
  // the preview: its own small renderer, lit like a studio, the figure turning slowly; drag to turn it
  const stage = $('lgsStage');
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace; r.shadowMap.enabled = true;
  stage.insertBefore(r.domElement, stage.firstChild);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight('#fff8ec', '#8a7a66', 1.35));
  const key = new THREE.DirectionalLight('#fff4e0', 2.1); key.position.set(40, 90, 120); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -30, right: 30, top: 60, bottom: -10, near: 1, far: 300 }); scene.add(key);
  const rim = new THREE.DirectionalLight('#dfe8ff', 0.7); rim.position.set(-80, 60, -70); scene.add(rim);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(22, 48), new THREE.ShadowMaterial({ opacity: 0.18 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const cam = new THREE.PerspectiveCamera(26, 3 / 4, 1, 1000);
  const turn = { a: 0.35, drag: null };
  stage.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; turn.drag = { x: e.clientX, a: turn.a }; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', (e) => { if (turn.drag) turn.a = turn.drag.a + (e.clientX - turn.drag.x) * 0.012; });
  ['pointerup', 'pointercancel'].forEach((ev) => stage.addEventListener(ev, () => { turn.drag = null; }));
  root.three = { r, scene, cam, turn, stage };
}
const cur = () => S.work[S.at];
function paintTabs() {
  const tabs = root.querySelector('#lgsTabs');
  tabs.innerHTML = S.work.map((f, i) => `<button type="button" class="lgs-tab${i === S.at ? ' on' : ''}" data-i="${i}">${esc(f.name || 'Figure ' + (i + 1))}</button>`).join('') +
    (S.work.length < S.seats ? `<button type="button" class="lgs-tab" data-add="1">+ Add a figure</button>` : '');
}
function paint() {
  const f = cur(), rows = root.querySelector('#lgsRows');
  rows.innerHTML = ROWS.map(([k, label, list, sw]) => {
    const i = Math.max(0, list.findIndex((x) => x.id === f.p[k])), it = list[i];
    if (sw) return `<div class="lgs-row"><span class="k">${label}</span><div class="lgs-sw">${list.map((x) => `<button type="button" data-k="${k}" data-id="${x.id}" class="${x.id === it.id ? 'on' : ''}" style="background:${x.col}" title="${esc(x.name)}" aria-label="${esc(x.name)}"></button>`).join('')}</div></div>`;
    return `<div class="lgs-row"><span class="k">${label}</span><button type="button" class="arr" data-k="${k}" data-d="-1" aria-label="Previous ${label}">&#9664;</button><span class="v">${esc(it.name)} <small>${i + 1} of ${list.length}</small></span><button type="button" class="arr" data-k="${k}" data-d="1" aria-label="Next ${label}">&#9654;</button></div>`;
  }).join('');
  root.querySelector('#lgsName').value = f.name || '';
  root.querySelector('#lgsRemove').style.display = S.saved.some((s) => s === S.origin[S.at]) && S.origin[S.at] ? '' : 'none';
  paintTabs(); showFigure();
}
function showFigure() {
  const t = root.three;
  if (t.fig) { t.scene.remove(t.fig); F.disposeFigure(t.fig); }
  t.fig = F.buildFigure(cur()); t.scene.add(t.fig);
}
function frame() {
  if (!S || !S.open) return;
  const t = root.three, w = t.stage.clientWidth, h = t.stage.clientHeight;
  if (w && h && (t.w !== w || t.h !== h)) { t.w = w; t.h = h; t.r.setSize(w, h, false); t.cam.aspect = w / h; t.cam.updateProjectionMatrix();
    const dist = Math.max(118, 118 * (0.75 / (w / h))); t.cam.position.set(0, 30, dist); t.cam.lookAt(0, 23, 0); }
  if (!t.turn.drag && !S.still) t.turn.a += 0.006;
  if (t.fig) t.fig.rotation.y = t.turn.a;
  t.r.render(t.scene, t.cam);
  S.raf = requestAnimationFrame(frame);
}
function msg(s) { root.querySelector('#lgsMsg').textContent = s || ''; }
async function commit(list, done) {
  const b = root.querySelector('#lgsSave'), rm = root.querySelector('#lgsRemove'); b.disabled = rm.disabled = true; msg('');
  let res; try { res = await S.save(list.map((f) => ({ name: f.name.trim(), p: f.p, when: f.when }))); } catch (e) { res = { ok: false, error: 'We could not reach the gallery. Please try again.' }; }
  b.disabled = rm.disabled = false;
  if (!res || !res.ok) { msg((res && res.error) || 'That did not save. Please try again.'); return; }
  S.saved = res.figs.map((f) => ({ ...f })); if (S.onSaved) S.onSaved(res.figs);
  done();
}
function save() {
  const f = cur(); f.name = (f.name || '').trim();
  if (!f.name) { msg('Give your figure a name first.'); return; }
  // the shelf keeps the saved figures plus this one; other unsaved tabs stay drafts until they are put up themselves
  const list = [], origin = [];
  S.work.forEach((w, i) => { if (i === S.at) { list.push(w); origin.push(i); } else if (S.origin[i]) { list.push(S.origin[i]); origin.push(i); } });
  commit(list, () => { S.work.forEach((w, i) => { const k = origin.indexOf(i); if (k >= 0) S.origin[i] = S.saved[k]; }); msg(f.name + ' is on the shelf.'); paint(); });
}
function remove() {
  const gone = S.origin[S.at]; if (!gone) return;
  if (!confirm('Take ' + (gone.name || 'this figure') + ' off the shelf?')) return;
  const keep = S.work.map((w, i) => (i !== S.at ? S.origin[i] : null)).filter(Boolean);
  commit(keep, () => {
    S.work.splice(S.at, 1); S.origin.splice(S.at, 1);
    if (!S.work.length) { S.work.push(F.randomFig()); S.origin.push(null); }
    S.at = Math.min(S.at, S.work.length - 1); msg('Taken off the shelf.'); paint();
  });
}
function close() {
  if (!S || !S.open) return;
  S.open = false; cancelAnimationFrame(S.raf); root.classList.remove('open');
  if (document.activeElement && root.contains(document.activeElement)) document.activeElement.blur();
  if (S.onClose) S.onClose();
}
// opts: { household: { names, seats }, figs: [saved figures], save: async (figs) => ({ ok, figs } | { ok: false, error }),
//         onSaved(figs), onClose(), at: index to open on, still: true to hold the preview still (reduced motion) }
export function openStation(opts) {
  if (!root) build();
  const saved = (opts.figs || []).map((f) => ({ name: f.name || '', p: { ...F.defaultFig().p, ...(f.p || {}) } }));
  S = { open: true, seats: Math.max(1, opts.household.seats || 1), save: opts.save, onSaved: opts.onSaved, onClose: opts.onClose, still: !!opts.still, saved,
    origin: saved.slice(), work: saved.map((f) => ({ name: f.name, p: { ...f.p } })), at: 0 };
  if (!S.work.length) { S.work.push(F.randomFig()); S.origin.push(null); }
  S.at = Math.min(opts.at || 0, S.work.length - 1);
  root.querySelector('#lgsTitle').textContent = opts.household.names;
  msg(saved.length ? '' : 'Build a figure for each of you, then put it on the shelf.');
  root.classList.add('open'); paint();
  root.three.w = 0; frame();
}
export const stationOpen = () => !!(S && S.open);
export const closeStation = close;
// a still picture of a figure (a data: URL), for the phone guide's shelf and the private page: one small offscreen
// renderer, lit as the station's preview, the figure turned a touch to show its depth
let snapper = null;
export function snapshot(fig, w = 180, h = 240) {
  if (!snapper) {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(); scene.add(new THREE.HemisphereLight('#fff8ec', '#8a7a66', 1.35));
    const key = new THREE.DirectionalLight('#fff4e0', 2.1); key.position.set(40, 90, 120); scene.add(key);
    const rim = new THREE.DirectionalLight('#dfe8ff', 0.7); rim.position.set(-80, 60, -70); scene.add(rim);
    snapper = { r, scene, cam: new THREE.PerspectiveCamera(26, 3 / 4, 1, 1000) };
  }
  const { r, scene, cam } = snapper;
  r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); cam.position.set(0, 30, 118 * Math.max(1, 0.75 / (w / h))); cam.lookAt(0, 23, 0);
  const g = F.buildFigure(fig); g.rotation.y = 0.3; scene.add(g);
  r.render(scene, cam); const url = r.domElement.toDataURL('image/png');
  scene.remove(g); F.disposeFigure(g);
  return url;
}
