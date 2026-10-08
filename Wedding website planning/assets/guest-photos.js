// The guests' photographs, to look through (the owner's wish, 7 Oct 2026): every one in a grid, newest first, and one at
// a time, large, with arrows, the arrow keys, or a swipe. Shared by the 3D gallery (from the centrepiece's close-up) and
// the phone guide (the centrepiece section); both load it only once the gallery is live (api/gallery.js). The files come
// from /api/photo: s=t, a 640 px copy, for the grid; s=f, the photograph (2048 px at most), for the large view.
//   GuestPhotos.open(photos, i)   photos: [{ id, w, h }]; i: open straight at that photograph (else the grid)
//   GuestPhotos.isOpen()
(function () {
  if (window.GuestPhotos) return;
  const src = (p, s) => '/api/photo?id=' + encodeURIComponent(p.id) + '&s=' + s;
  const css = `
  #gp { position: fixed; inset: 0; z-index: 90; display: none; background: #16110c; color: #EDE7D7; font: 17px/1.5 'EB Garamond', Georgia, serif; }
  #gp.open { display: block; }
  #gp .gp-head { position: absolute; left: 0; right: 0; top: 0; z-index: 2; display: flex; align-items: flex-end; justify-content: space-between; gap: 12px;
    padding: max(16px, env(safe-area-inset-top)) clamp(16px, 3vw, 36px) 12px; background: linear-gradient(rgba(20,15,10,.98) 70%, rgba(20,15,10,0)); }
  #gp .gp-k { margin: 0 0 4px; font-size: 10.5px; letter-spacing: .32em; text-transform: uppercase; color: #C9A667; }
  #gp h2 { margin: 0; font: 400 clamp(24px, 3.2vw, 34px)/1.1 'Cormorant Garamond', Georgia, serif; color: #F4EFE1; }
  #gp .gp-n { margin: 4px 0 0; font-size: 13px; letter-spacing: .12em; color: #A79C85; }
  #gp button { font: inherit; cursor: pointer; }
  #gp .gp-x { flex: none; height: 36px; padding: 0 16px; background: transparent; border: 1px solid rgba(201,166,103,.6); color: #F2E6C9; font-size: 10.5px; letter-spacing: .24em; text-transform: uppercase; }
  #gp .gp-grid { position: absolute; inset: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 118px clamp(16px, 3vw, 36px) max(28px, env(safe-area-inset-bottom));
    display: grid; grid-template-columns: repeat(auto-fill, minmax(min(150px, 28vw), 1fr)); gap: 6px; align-content: start; }
  #gp .gp-grid button { position: relative; aspect-ratio: 1; padding: 0; border: 0; background: #2B2520; overflow: hidden; }
  #gp .gp-grid img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s, opacity .4s; opacity: 0; }
  #gp .gp-grid img.in { opacity: 1; }
  @media (hover: hover) { #gp .gp-grid button:hover img { transform: scale(1.04); } }
  #gp .gp-empty { grid-column: 1 / -1; margin: 40px auto; max-width: 420px; text-align: center; color: #CBC1A8; }
  #gp .gp-one { position: absolute; inset: 0; z-index: 3; display: none; background: #120d09; touch-action: pan-y pinch-zoom; }
  #gp .gp-one.open { display: block; }
  #gp .gp-one img { position: absolute; inset: 56px clamp(8px, 6vw, 84px) 56px; width: calc(100% - 2 * clamp(8px, 6vw, 84px)); height: calc(100% - 112px); object-fit: contain; transition: opacity .25s; }
  #gp .gp-one .gp-bar { position: absolute; left: 0; right: 0; top: 0; display: flex; justify-content: space-between; align-items: center; padding: max(10px, env(safe-area-inset-top)) clamp(12px, 3vw, 30px) 8px; }
  #gp .gp-one .gp-c { font-size: 13px; letter-spacing: .16em; color: #A79C85; }
  #gp .gp-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 46px; height: 64px; background: rgba(20,15,10,.45); border: 1px solid rgba(201,166,103,.4); color: #E8C07A; font-size: 30px; line-height: 1; }
  #gp .gp-arrow.prev { left: clamp(4px, 1.4vw, 20px); } #gp .gp-arrow.next { right: clamp(4px, 1.4vw, 20px); }
  #gp .gp-arrow[disabled] { opacity: .2; cursor: default; }
  @media (hover: none) { #gp .gp-arrow { display: none; } }
  `;
  let root, grid, one, big, list = [], at = -1, scrollWas = '';
  function build() {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    root = document.createElement('div'); root.id = 'gp'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'The guests’ photographs');
    root.innerHTML = `<div class="gp-head"><div><p class="gp-k">The centerpiece · by our guests</p><h2>The wedding, as you saw it</h2><p class="gp-n"></p></div><button class="gp-x" data-gpclose>Close</button></div>
      <div class="gp-grid"></div>
      <div class="gp-one"><div class="gp-bar"><span class="gp-c"></span><button class="gp-x" data-gpback>All photographs</button></div><img alt="A guest’s photograph" decoding="async">
        <button class="gp-arrow prev" data-gpstep="-1" aria-label="The one before">&lsaquo;</button><button class="gp-arrow next" data-gpstep="1" aria-label="The next one">&rsaquo;</button></div>`;
    document.body.appendChild(root);
    grid = root.querySelector('.gp-grid'); one = root.querySelector('.gp-one'); big = one.querySelector('img');
    root.addEventListener('click', (e) => {
      if (e.target.closest('[data-gpclose]')) { close(); return; }
      if (e.target.closest('[data-gpback]')) { one.classList.remove('open'); at = -1; return; }
      const s = e.target.closest('[data-gpstep]'); if (s) { show(at + +s.dataset.gpstep); return; }
      const t = e.target.closest('[data-gpi]'); if (t) show(+t.dataset.gpi);
    });
    window.addEventListener('keydown', (e) => {
      if (!root.classList.contains('open')) return;
      e.stopImmediatePropagation();                                  // the gallery behind does not walk while this is open
      if (e.key === 'Escape') { if (one.classList.contains('open')) { one.classList.remove('open'); at = -1; } else close(); }
      if (one.classList.contains('open') && e.key === 'ArrowRight') show(at + 1);
      if (one.classList.contains('open') && e.key === 'ArrowLeft') show(at - 1);
    }, true);
    let sx = null, sy = 0;                                            // a swipe along: the next or the one before
    one.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { sx = e.clientX; sy = e.clientY; } });
    one.addEventListener('pointerup', (e) => {
      if (sx === null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(at + (dx < 0 ? 1 : -1));
    });
    one.addEventListener('pointercancel', () => { sx = null; });
  }
  function show(i) {
    if (i < 0 || i >= list.length) return;
    at = i;
    big.style.opacity = '0.25'; big.onload = () => { big.style.opacity = '1'; };
    big.src = src(list[i], 'f');
    one.querySelector('.gp-c').textContent = (i + 1) + ' of ' + list.length;
    one.querySelector('.prev').disabled = i === 0; one.querySelector('.next').disabled = i === list.length - 1;
    one.classList.add('open');
    [i + 1, i - 1].forEach((j) => { if (list[j]) new Image().src = src(list[j], 'f'); });   // the neighbours, ready for the next step
  }
  function open(photos, i) {
    if (!root) build();
    list = photos.slice();
    root.querySelector('.gp-n').textContent = list.length === 1 ? 'One photograph' : list.length + ' photographs';
    grid.innerHTML = list.length ? list.map((p, k) => `<button data-gpi="${k}" aria-label="Photograph ${k + 1}"><img src="${src(p, 't')}" alt="" loading="lazy" decoding="async" onload="this.classList.add('in')"></button>`).join('')
      : '<p class="gp-empty">No photographs yet. Our guests add them with the QR code on the sign at the villa, and they appear here as they arrive.</p>';
    grid.scrollTop = 0; one.classList.remove('open'); at = -1;
    root.classList.add('open');
    scrollWas = document.body.style.overflow; document.body.style.overflow = 'hidden';
    if (typeof i === 'number' && list[i]) show(i);
  }
  function close() { root.classList.remove('open'); one.classList.remove('open'); big.removeAttribute('src'); document.body.style.overflow = scrollWas; }
  window.GuestPhotos = { open, isOpen: () => !!root && root.classList.contains('open') };
})();
