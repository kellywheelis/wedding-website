// The mobile edition: builds the guide from CONTENT (content.js), then wires the doors, the lightbox,
// the save-the-date wheel and the pop-up invitation. No libraries; nothing runs until it is on screen.
(function () {
  const C = window.CONTENT, el = (id) => document.getElementById(id);
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const small = (src) => src.replace(/\.jpg$/, '-s.jpg');
  const picture = (src, alt, ar) => {                              // a lazy picture: the small file on narrow screens, the large on wide ones
    const s = /\.jpg$/.test(src) ? `srcset="${small(src)} 700w, ${src} 1400w" sizes="(min-width: 700px) 700px, 100vw"` : '';
    return `<img src="${src}" ${s} alt="${esc(alt)}" loading="lazy" decoding="async" style="--ar:${ar || 1.33}">`;
  };
  let lbIndex = 0; const lbItems = [];
  const artHtml = (it, opts = {}) => {                              // a framed picture with its label; tapping opens the lightbox
    lbItems.push(it); const i = lbItems.length - 1;
    return `<figure class="art"><button class="pic" data-lb="${i}" aria-label="${esc(it.title)}">
      <div class="frame${opts.oval ? ' oval' : ''}">${picture(it.img, it.title, it.aspect)}</div></button>
      <figcaption class="label"><h3>${esc(it.title)}</h3><p class="meta">${esc(it.meta)}</p>${opts.noBody ? '' : `<p class="body">${esc(it.body)}</p>`}<p class="tap">Tap to look closer</p></figcaption></figure>`;
  };
  const statueHtml = (it) => { lbItems.push(it); const i = lbItems.length - 1;
    return `<button class="statue" data-lb="${i}"><div class="plinth"><img src="${it.img}" alt="${esc(it.title)}" loading="lazy" decoding="async"></div><h3>${esc(it.title)}</h3><p class="meta">${esc(it.meta)}</p></button>`; };
  const cardHtml = (card, key) => `<button class="detbtn" data-card="${key}">Click here for details</button>
    <div class="card" id="card-${key}"><h4>${esc(card.title)}</h4>${card.sections.map((s) => `<h5>${esc(s.h)}</h5>${s.p.map((p) => `<p>${esc(p)}</p>`).join('')}`).join('')}<button class="close" data-close="${key}">Close</button></div>`;

  // ---- the rooms
  const rooms = C.rooms, [atrium, w1, w2, det] = rooms;
  let html = '';
  html += `<section class="chapter" id="atrium"><div class="hero"><img src="${atrium.hero}" alt="The atrium" fetchpriority="high" decoding="async"><div class="cap"><h2>${esc(atrium.title)}</h2><p class="sub">${esc(atrium.intro.title)}</p></div></div>
    <div class="text"><p class="body">${esc(atrium.intro.body)}</p></div>`;
  const pair = atrium.items[0]; lbItems.push(pair);
  html += `<div class="statues"><button class="statue" data-lb="${lbItems.length - 1}"><div class="plinth"><img src="${pair.img}" alt="Venus" loading="lazy" decoding="async"></div><h3>Venus</h3></button>
    <button class="statue" data-lb="${lbItems.length - 1}"><div class="plinth"><img src="${pair.img2}" alt="Mars" loading="lazy" decoding="async"></div><h3>Mars</h3></button></div>
    <div class="text"><p class="eyebrow">The atrium · a pair</p><h3>${esc(pair.title)}</h3><p class="body">${esc(pair.body)}</p><p class="meta">${esc(pair.meta)}</p></div>`;
  html += artHtml(atrium.items[1]) + artHtml(atrium.items[2]);
  html += `<div class="text"><p class="eyebrow">The atrium · Anthony · interactive installation</p><h3>The Arcade</h3></div>
    <figure class="art"><button class="pic" id="playItaly" aria-label="Open the arcade"><div class="frame" id="italyFrame"></div></button>
      <figcaption class="label"><p class="meta">Anthony Alvarez &amp; Kelly Wheelis, 2026 · playable pieces</p><p class="body">Five playable pieces: Getting to Italy, Cross the Piazza, Catch the Bouquet, Flight to Siena, and The Seating Chart.</p><p class="tap">Tap to play</p></figcaption></figure>`;
  html += `<div class="text center"><p class="eyebrow">The two galleries</p><p class="body">Two collections, one exhibit: on the left, Kelly's; on the right, Anthony's. The frames are waiting for photographs.</p><div><span class="plaque">Kelly</span> &nbsp; <span class="plaque">Anthony</span></div></div><div class="rule"></div></section>`;

  const wingHtml = (w, sub) => {
    let h = `<section class="chapter" id="${w.id}"><div class="hero"><img src="${w.hero}" alt="${esc(w.title)}" loading="lazy" decoding="async"><div class="cap"><div class="numeral">${w.numeral}</div><h2>${esc(w.title)}</h2><p class="sub">${esc(sub)}</p></div></div>`;
    h += `<div class="text"><p class="eyebrow">Wing ${w.numeral} · principal work</p></div>` + artHtml({ ...w.principal, body: w.closeup.body || w.principal.body });
    w.walls.forEach((wall) => {
      h += `<div class="text"><p class="eyebrow">Wing ${w.numeral} · complementary work</p><h3>${esc(wall.title)}</h3><p class="body">${esc(wall.body)}</p><p class="meta">${esc(wall.meta)}</p></div>`;
      wall.pictures.forEach((p) => { h += artHtml(p); });
    });
    h += `<div class="text"><p class="eyebrow">Wing ${w.numeral} · sculpture</p></div><div class="statues">${w.sculptures.map(statueHtml).join('')}</div><div class="rule"></div></section>`;
    return h;
  };
  html += wingHtml(w1, 'The ceremony') + wingHtml(w2, 'The reception');

  // the details room
  html += `<section class="chapter det" id="det"><div class="hero"><img src="${det.hero}" alt="The details room" loading="lazy" decoding="async"><div class="cap"><h2>${esc(det.title)}</h2><p class="sub">Everything you need to know</p></div></div>
    <div class="text center"><p class="eyebrow">The centrepiece</p><h3>${esc(det.centre.title)}</h3><p class="body">${esc(det.centre.body)}</p><p class="meta">${esc(det.centre.meta)}</p></div>`;
  // the table: save-the-date and invitation
  html += `<div class="table"><p class="eyebrow">On the table</p><h3>${esc(det.table.title)}</h3><p class="body">${esc(det.table.body)}</p>
    <div class="piece" id="volPiece"><div class="vol" id="vol"><img class="wheel" src="img/vol-wheel.png" alt="" decoding="async" draggable="false"><canvas id="volFront" width="1000" height="1000"></canvas><div class="eyelet"></div><img class="backface" src="img/vol-back.png" alt="" loading="lazy" decoding="async" draggable="false"></div>
      <p class="hint">Tap the card to turn the wheel · drag to spin</p><button class="flip" id="volFlip">Turn it over</button>
      <div class="stand">Kelly Wheelis<small>${esc(det.volvelle.title)}, 2026 · ${esc(det.volvelle.meta)}</small></div><p class="body">${esc(det.volvelle.body.replace('or click the card', 'or tap the card'))}</p></div>
    <div class="piece inv-wrap" id="invPiece"><div class="inv" id="inv"><div class="pull" id="invPull"><img src="img/inv-card.jpg" alt="The invitation card" loading="lazy" decoding="async" draggable="false"></div><div class="tab" id="invTab"></div>
      <div class="face"></div><div class="win"><div class="sky"></div><img class="layer l3" src="img/inv-layer3.png" alt="" loading="lazy" decoding="async"><img class="layer l2" src="img/inv-layer2.png" alt="" loading="lazy" decoding="async"><img class="layer l1" src="img/inv-layer1.png" alt="" loading="lazy" decoding="async"><div class="doors" id="invDoors"><div class="dr l"></div><div class="dr r"></div></div></div>
      <img class="frame-img" src="img/inv-frame.png" alt="" loading="lazy" decoding="async"><div class="foil"></div></div>
      <p class="hint" id="invHint">Tap the doors to open them · then pull the tab</p>
      <div class="stand">Truong Hoai Vu<small>${esc(det.invite.title)}, 2026 · Paper and ink · vuth.art</small></div><p class="body">${esc(det.invite.body.replace('move the mouse to look inside', 'tilt the phone to look inside').replace('click', 'tap').replace('click', 'tap'))}</p></div></div>`;
  html += `<div class="det-wrap">`;
  det.sections.forEach((s) => {
    html += `<div class="section" id="sec-${s.key}"><div class="title"><div class="n">${s.n}</div><h3>${esc(s.title)}</h3></div>
      <div class="story"><p class="body">${esc(s.body)}</p>${s.meta ? `<p class="meta">${esc(s.meta)}</p>` : ''}</div>`;
    s.pictures.forEach((p) => { html += artHtml(p); });
    if (s.key === 'registry') html += `<figure class="art postcard"><img src="${det.shop}" alt="The gift shop: postcards, the RSVP box and the registry note" loading="lazy" decoding="async"></figure>`;
    html += cardHtml(s.card, s.key) + `<div class="rule"></div></div>`;
  });
  html += `<div class="text"><p class="eyebrow" style="text-align:center">The sculpture</p></div><div class="statues">${det.sculptures.map(statueHtml).join('')}</div></div></section>`;
  el('guide').innerHTML = html;
  // the game's title plays in its frame; tapping it opens the arcade
  if (window.Arcade && Arcade.games.italy) {
    const cv = Arcade.attract('menu', 6); cv.style.cssText = 'width:100%;aspect-ratio:224/288;display:block;image-rendering:pixelated;background:#140c06';
    el('italyFrame').appendChild(cv);
    el('playItaly').addEventListener('click', () => Arcade.launch('menu'));
  }

  // ---- lightbox
  const lb = el('lb');
  const openLb = (i) => { const it = lbItems[i]; lbIndex = i;
    el('lbImg').innerHTML = `<img src="${it.img}" alt="${esc(it.title)}" decoding="async">`;
    el('lbTxt').innerHTML = `<h3>${esc(it.title)}</h3><p class="body">${esc(it.body)}</p><p class="meta">${esc(it.meta)}</p>`;
    lb.classList.add('open'); lb.scrollTop = 0; document.body.style.overflow = 'hidden'; };
  const closeLb = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lb]'); if (b) { openLb(+b.dataset.lb); return; }
    const c = e.target.closest('[data-card]'); if (c) { const k = c.dataset.card; el('card-' + k).classList.toggle('open'); return; }
    const x = e.target.closest('[data-close]'); if (x) { el('card-' + x.dataset.close).classList.remove('open'); return; }
  });
  el('lbX').addEventListener('click', closeLb);
  el('lbImg').addEventListener('click', closeLb);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });

  // ---- the save-the-date: the front panel drawn with its window cut out, the wheel turning behind it
  const vol = el('vol'), cv = el('volFront'), wheel = vol.querySelector('.wheel');
  const STEP = 72; let angle = 0, drag = null;                       // degrees; plate I in the window at 0
  const front = new Image(); front.decoding = 'async'; front.src = 'img/vol-front.png';
  front.onload = () => { const x = cv.getContext('2d'); x.drawImage(front, 0, 0, 1000, 1000);
    x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.ellipse(220, 500, 110, 140, 0, 0, Math.PI * 2); x.fill(); };
  const setAngle = (a) => { angle = a; wheel.style.setProperty('--a', (-a) + 'deg'); };
  const angleAt = (e) => { const r = vol.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
  vol.addEventListener('pointerdown', (e) => { if (vol.classList.contains('back')) return; drag = { a: angleAt(e), moved: 0, start: angle }; vol.classList.add('dragging'); vol.setPointerCapture(e.pointerId); });
  vol.addEventListener('pointermove', (e) => { if (!drag) return; const a = angleAt(e); let d = a - drag.a; if (d > 180) d -= 360; if (d < -180) d += 360; setAngle(angle - d); drag.a = a; drag.moved += Math.abs(d); });
  const release = () => { if (!drag) return; vol.classList.remove('dragging');
    setAngle(drag.moved < 6 ? Math.round(drag.start / STEP) * STEP + STEP : Math.round(angle / STEP) * STEP); drag = null; };
  vol.addEventListener('pointerup', release); vol.addEventListener('pointercancel', release);
  el('volFlip').addEventListener('click', () => { const back = vol.classList.toggle('back'); el('volFlip').textContent = back ? 'Turn it back' : 'Turn it over'; });

  // ---- the invitation: doors open on a tap; the tab draws the card out; the villa's layers shift with the phone's tilt
  const inv = el('inv');
  el('invDoors').addEventListener('click', () => { inv.classList.toggle('open'); askTilt(); el('invHint').textContent = inv.classList.contains('open') ? 'Tilt the phone to look inside · pull the tab' : 'Tap the doors to open them · then pull the tab'; });
  const pullToggle = () => inv.classList.toggle('pulled');
  el('invTab').addEventListener('click', pullToggle); el('invPull').addEventListener('click', pullToggle);
  let tiltOn = false;
  const layers = inv.querySelectorAll('.layer');
  const applyTilt = (g) => { const k = Math.max(-1, Math.min(1, g / 25)); layers.forEach((l, i) => l.style.setProperty('--px', (k * (i === 0 ? 4 : i === 1 ? 9 : 14)) + 'px')); };
  const askTilt = () => {
    if (tiltOn) return;
    const go = () => { tiltOn = true; window.addEventListener('deviceorientation', (e) => { if (e.gamma !== null) applyTilt(e.gamma); }, { passive: true }); };
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') DeviceOrientationEvent.requestPermission().then((r) => { if (r === 'granted') go(); }).catch(() => {});
    else go();
  };
  window.addEventListener('pointermove', (e) => { if (tiltOn || !inv.classList.contains('open')) return; const r = inv.getBoundingClientRect(); applyTilt(((e.clientX - r.left) / r.width - 0.5) * 50); }, { passive: true });

  // ---- the doors, and the room nav that follows the scroll
  const gate = el('gate'), nav = el('rooms');
  const open = (skip) => {
    if (gate.classList.contains('open')) return;
    gate.classList.add('open'); document.body.classList.remove('gated'); nav.classList.add('on');
    setTimeout(() => { gate.style.display = 'none'; }, skip ? 100 : 2400);
  };
  el('enter').addEventListener('click', () => open(false));
  el('skip').addEventListener('click', () => { open(true); el('det').scrollIntoView({ behavior: 'auto' }); });
  if (location.hash === '#det' || /[?&]open/.test(location.search)) {          // straight in: a link to the details, or the test harness
    open(true);
    if (location.hash) [60, 700].forEach((ms) => setTimeout(() => { const t = document.querySelector(location.hash); if (t) t.scrollIntoView({ behavior: 'instant' }); }, ms));   // again once the pictures have their sizes
  }
  const links = nav.querySelectorAll('a');
  const io = new IntersectionObserver((es) => { es.forEach((en) => { if (en.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id)); }); }, { rootMargin: '-40% 0px -55% 0px' });
  rooms.forEach((r) => io.observe(el(r.id)));
  el('creditsList').innerHTML = C.credits.map((c) => `<li>${esc(c)}</li>`).join('');
  // ?dbg : list anything wider than the screen (a check for the phone layout, used by the screenshot harness)
  if (/[?&]dbg/.test(location.search)) setTimeout(() => {
    const wide = [...document.querySelectorAll('body *')].filter((n) => { const r = n.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(n).position !== 'fixed'; })
      .slice(0, 12).map((n) => n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + (n.className && typeof n.className === 'string' ? '.' + n.className.split(' ').join('.') : '') + ' ' + Math.round(n.getBoundingClientRect().left) + '..' + Math.round(n.getBoundingClientRect().right));
    const d = document.createElement('pre'); d.style.cssText = 'position:fixed;left:0;top:0;z-index:99;background:#000;color:#0f0;font:11px monospace;white-space:pre-wrap;margin:0;padding:4px';
    d.textContent = 'innerWidth ' + innerWidth + ' docWidth ' + document.documentElement.scrollWidth + '\n' + (wide.join('\n') || 'nothing overflows'); document.body.appendChild(d);
  }, 1200);
})();
