// The mobile edition: builds the guide from CONTENT (content.js), then wires the doors, the lightbox,
// the save-the-date wheel and the pop-up invitation. No libraries; nothing runs until it is on screen.
(function () {
  const C = window.CONTENT, el = (id) => document.getElementById(id);
  // the text comes from the 3D gallery, written for a mouse; on a phone you tap (the owner asked, 26 Sept 2026)
  const phone = (s) => String(s || '').replace(/\b([Cc])lick(ing|ed|s)?\b/g, (m, c, suf) => (c === 'C' ? 'T' : 't') + 'ap' + (suf === 'ing' ? 'ping' : suf === 'ed' ? 'ped' : suf || ''))
    .replace('move the mouse to look inside', 'tilt the phone to look inside').replace('to pick it up and turn the wheel', 'to turn its wheel');
  const esc = (s) => phone(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const small = (src) => src.replace(/\.jpg$/, '-s.jpg');
  const picture = (src, alt, ar) => {                              // a lazy picture: the small file on narrow screens, the large on wide ones
    const s = /\.jpg$/.test(src) ? `srcset="${small(src)} 700w, ${src} 1400w" sizes="(min-width: 700px) 700px, 100vw"` : '';
    return `<img src="${src}" ${s} alt="${esc(alt)}" loading="lazy" decoding="async" style="--ar:${ar || 1.33}">`;
  };
  let lbIndex = 0; const lbItems = [];
  const artHtml = (it, opts = {}) => {                              // a framed picture with its label; tapping opens the lightbox
    lbItems.push(it); const i = lbItems.length - 1;
    return `<figure class="art"><button class="pic" data-lb="${i}" aria-label="${esc(it.title)}">
      <div class="frame${opts.oval ? ' oval' : ''}">${picture(it.img, it.title, it.aspect)}</div></button><p class="tap under">Tap to look closer</p>
      <figcaption class="label"><h3>${esc(it.title)}</h3><p class="meta">${esc(it.meta)}</p>${opts.noBody ? '' : `<p class="body">${esc(it.body)}</p>`}</figcaption></figure>`;
  };
  const statueHtml = (it) => { lbItems.push(it); const i = lbItems.length - 1;
    return `<button class="statue" data-lb="${i}"><div class="plinth"><img src="${it.img}" alt="${esc(it.title)}" loading="lazy" decoding="async"></div><h3>${esc(it.title)}</h3><p class="meta">${esc(it.meta)}</p></button>`; };
  // the wall texts are private: the card is filled from GUEST.cards once a guest has signed in (see "guests", below)
  const cardBody = (c) => `<h4>${esc(c.title)}</h4>${(c.sections || []).map((s) => `<h5>${esc(s.h)}</h5>${s.p.map((p) => `<p>${esc(p)}</p>`).join('')}`).join('')}`;
  const cardHtml = (card, key) => `<button class="detbtn" data-card="${key}">Tap here for details</button><div class="card" id="card-${key}"></div>`;

  // ---- the rooms
  const rooms = C.rooms, [atrium, w1, w2, det] = rooms;
  let html = '';
  html += `<section class="chapter" id="atrium"><div class="hero"><img src="${atrium.hero}" alt="The atrium" fetchpriority="high" decoding="async"><div class="cap"><h2>${esc(atrium.title)}</h2><p class="sub">${esc(atrium.intro.title)}</p></div></div>
    <div class="text"><p class="body">${esc(atrium.intro.body)}</p><p class="bonus" id="bonus"></p><p class="turn-hint">Turn your phone sideways for the gallery view</p><p class="guest-line" id="guestLine"></p></div>`;
  const pair = atrium.items[0]; lbItems.push(pair);
  html += `<div class="statues"><button class="statue" data-lb="${lbItems.length - 1}"><div class="plinth"><img src="${pair.img}" alt="Venus" loading="lazy" decoding="async"></div><h3>Venus</h3></button>
    <button class="statue" data-lb="${lbItems.length - 1}"><div class="plinth"><img src="${pair.img2}" alt="Mars" loading="lazy" decoding="async"></div><h3>Mars</h3></button></div>
    <div class="text"><p class="eyebrow">The atrium · a pair</p><h3>${esc(pair.title)}</h3><p class="body">${esc(pair.body)}</p><p class="meta">${esc(pair.meta)}</p></div>`;
  html += artHtml(atrium.items[1]) + artHtml(atrium.items[2]);
  html += `<div class="text"><p class="eyebrow">The atrium · Anthony · interactive installation</p><h3>The Arcade</h3></div>
    <figure class="art"><button class="pic" id="playItaly" aria-label="Open the arcade"><div class="frame" id="italyFrame"></div></button>
      <figcaption class="label"><p class="meta">Anthony Alvarez &amp; Kelly Wheelis, 2026 · playable pieces</p><p class="body">Five playable pieces: Getting to Italy, Cross the Piazza, Catch the Bouquet, Flight to Siena, and The Seating Chart.</p><p class="tap">Tap to play</p></figcaption></figure>`;
  // Anthony's wall: the three pieces from his collection hung beside the arcade (tap one for its write-up)
  if (atrium.artifacts) html += `<div class="text"><p class="eyebrow">The atrium · Anthony · from the collection</p></div><div class="statues">${atrium.artifacts.map(statueHtml).join('')}</div>`;
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
    <div class="text center"><p class="eyebrow">The centerpiece</p><h3>${esc(det.centre.title)}</h3><p class="body">${esc(det.centre.body)}</p><p class="meta">${esc(det.centre.meta)}</p></div>`;
  // the hourglass: the countdown to the wedding, kept to the day as the 3D gallery's plaque is
  if (det.hourglass) {
    const hg = det.hourglass, days = Math.max(0, Math.ceil((hg.wedding - Date.now()) / 86400000));
    lbItems.push(hg);
    html += `<div class="countdown"><button class="statue" data-lb="${lbItems.length - 1}" aria-label="${esc(hg.title)}"><div class="plinth"><img src="${hg.img}" alt="${esc(hg.title)}" loading="lazy" decoding="async"></div></button>
      <div class="count"><p class="eyebrow">Exhibit details · the countdown</p><div class="brass"><small>${days === 1 ? 'Day' : 'Days'}</small><b>${days}</b><small>until Siena</small></div>
      <h3>${esc(hg.title)}</h3><p class="body">${esc(hg.body)}</p></div></div>`;
  }
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
    if (s.key === 'registry') html += `<figure class="art postcard"><img src="${det.shop}" alt="The gift shop: postcards, the RSVP box and the registry note" loading="lazy" decoding="async"></figure><button class="detbtn" data-rsvp>Write your postcard</button>`;
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
    const c = e.target.closest('[data-card]'); if (c) {              // a details card: for signed-in guests; filled from the server's texts
      const k = c.dataset.card, box = el('card-' + k);
      if (box.classList.contains('open')) { box.classList.remove('open'); return; }
      needGuest(() => { box.innerHTML = cardBody(GUEST.cards[k]) + `<button class="close" data-close="${k}">Close</button>`; box.classList.add('open'); },
        C.rooms[3].sections.find((x) => x.key === k).card.title + ' are for our guests. Sign in with your phone number and the code from your invitation.');
      return;
    }
    if (e.target.closest('[data-rsvp]')) { needGuest(openRsvp, 'The RSVP is for our guests. Sign in with your phone number and the code from your invitation, and your card will be waiting.'); return; }
    const x = e.target.closest('[data-close]'); if (x) { el('card-' + x.dataset.close).classList.remove('open'); return; }
  });
  el('lbX').addEventListener('click', closeLb);
  // ---- the three who hid: a family pet painted into three of the pictures, unmarked. In the lightbox a tap on the
  // animal names it and fills a gold star; anywhere else on the picture closes it as before. The finds are kept where
  // the 3D gallery keeps them (localStorage ka-found, by picture), so a find on the phone counts there too
  const FOUND = new Set((() => { try { return JSON.parse(localStorage.getItem('ka-found') || '[]'); } catch (e) { return []; } })());
  const HIDDEN_KEYS = [...new Set(lbItems.filter((it) => it.hidden).map((it) => it.hidden.key))];
  const paintBonus = () => {
    const got = HIDDEN_KEYS.filter((k) => FOUND.has(k)).length;
    el('bonus').innerHTML = 'Hidden bonuses ' + HIDDEN_KEYS.map((k, i) => `<span class="${i < got ? 'on' : ''}">${i < got ? '★' : '☆'}</span>`).join('');
  };
  paintBonus();
  const petNote = (h) => {                                          // record a find; the pet's write-up, for whichever panel shows it
    if (!FOUND.has(h.key)) { FOUND.add(h.key); try { localStorage.setItem('ka-found', JSON.stringify([...FOUND])); } catch (e) { /* the find lasts the visit */ } }
    paintBonus();
    const got = HIDDEN_KEYS.filter((k) => FOUND.has(k)).length;
    const meta = got >= HIDDEN_KEYS.length ? 'All three found.' : got === HIDDEN_KEYS.length - 1 ? 'Two of three found. One more is hiding.' : h.meta;
    return `<p class="eyebrow">${esc(h.eyebrow)}</p><h3>${esc(h.title)}</h3><p class="body">${esc(h.body)}</p><p class="meta">${esc(meta)}</p>`;
  };
  const petHit = (it, e, img) => {                                  // did a tap land on this picture's pet? (measured inside its gilt border)
    if (!it || !it.hidden || !img || e.target !== img) return false;
    const r = img.getBoundingClientRect(), bw = parseFloat(getComputedStyle(img).borderLeftWidth) || 0;
    const u = (e.clientX - r.left - bw) / (r.width - 2 * bw), v = (e.clientY - r.top - bw) / (r.height - 2 * bw), a = it.hidden.at, pad = 0.05;
    return u >= a[0] - pad && u <= a[2] + pad && v >= a[1] - pad && v <= a[3] + pad;
  };
  el('lbImg').addEventListener('click', (e) => {
    const it = lbItems[lbIndex];
    if (petHit(it, e, el('lbImg').querySelector('img'))) { el('lbTxt').innerHTML = petNote(it.hidden); return; }
    closeLb();
  });
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
    setTimeout(() => applyMode(), 0);                                // held sideways, the doors open onto the gallery view
  };
  el('enter').addEventListener('click', () => open(false));
  el('skip').addEventListener('click', () => { open(true); el('det').scrollIntoView({ behavior: 'auto' }); });
  if (location.hash === '#det' || /[?&]open/.test(location.search)) {          // straight in: a link to the details, or the test harness
    open(true);
    if (location.hash) [60, 700].forEach((ms) => setTimeout(() => { const t = document.querySelector(location.hash); if (t) t.scrollIntoView({ behavior: 'instant' }); }, ms));   // again once the pictures have their sizes
  }
  const links = nav.querySelectorAll('a');
  let curRoom = 'atrium';                                            // the room you are reading, kept as you scroll (the gallery view opens there)
  const io = new IntersectionObserver((es) => { es.forEach((en) => { if (en.isIntersecting) { curRoom = en.target.id; links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id)); } }); }, { rootMargin: '-40% 0px -55% 0px' });
  rooms.forEach((r) => io.observe(el(r.id)));
  window.addEventListener('scroll', () => {                          // the same, from plain scroll events (four positions read: cheap), so the room is known however the browser reports
    if (document.body.classList.contains('gv-on')) return;
    rooms.forEach((x) => { if (el(x.id).getBoundingClientRect().top < innerHeight * 0.45) curRoom = x.id; });
  }, { passive: true });
  el('creditsList').innerHTML = C.credits.map(([what, who]) => `<li>${esc(what)}<br>${esc(who)}</li>`).join('');   // the work, then its credit beneath

  // ---- guests (26 Sept 2026): the details and the RSVP are for guests, as in the 3D gallery (api/guest.js). They sign in
  // with a phone number and their household's code from the invitation, or arrive by its QR code (?k=...), which signs
  // them in. The session (localStorage ka-guest) is shared with the 3D gallery. Inputs are never focused on their own, so
  // the keyboard comes up only when a guest taps into a field (the owner's rule: the RSVP and the initials, nowhere else).
  const GUEST = { token: (() => { try { return localStorage.getItem('ka-guest') || ''; } catch (e) { return ''; } })(), household: null, reply: null, cards: null };
  let afterSignIn = null;
  const guestApi = async (method, body) => {
    const r = await fetch('/api/guest', { method, headers: { 'content-type': 'application/json', ...(GUEST.token ? { authorization: 'Bearer ' + GUEST.token } : {}) }, body: body ? JSON.stringify(body) : undefined });
    return { ok: r.ok, status: r.status, d: await r.json().catch(() => ({})) };
  };
  const sheets = document.createElement('div');
  sheets.innerHTML = `<div class="sheet" id="si"><form class="sheetin" id="siForm" autocomplete="on"><p class="eyebrow">Guest sign-in</p><h3 id="siTitle">For our guests</h3><p class="body" id="siWhy"></p>
      <div id="siFields"><label class="fld">Your phone number<input id="siPhone" type="tel" inputmode="tel" autocomplete="tel"></label>
        <label class="fld">Your code, from your invitation<input id="siCode" type="text" placeholder="VENUS-4827" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="24"></label></div>
      <p class="msg" id="siMsg"></p>
      <div class="btns"><button type="submit" class="pbtn ok" id="siGo">Sign in</button><button type="button" class="pbtn" id="siOut">Sign out</button><button type="button" class="pbtn" id="siClose">Not now</button></div></form></div>
    <div class="sheet" id="rs"><div class="sheetin"><p class="eyebrow">Cartolina postale</p>
      <div id="rsForm"><h3>Will you be there?</h3>
        <div class="pills"><label class="pill"><input type="radio" name="rsYes" value="yes"> Yes, with joy</label><label class="pill"><input type="radio" name="rsYes" value="no"> No, with regret</label></div>
        <div class="rsrow" id="rsGuest"><label class="fld seats">Seats<span><select id="rsSeats"></select> of <b id="rsOf"></b></span></label>
          <label class="pill ev"><input type="checkbox" id="rsEvents"> Events<span id="rsEvSum"></span></label></div>
        <label class="fld">Plus-one&rsquo;s name, if you were given one<input id="rsPlus" type="text" autocomplete="off"></label>
        <label class="fld">Allergies or dietary needs<input id="rsDiet" type="text" autocomplete="off"></label>
        <label class="fld">A note for us<input id="rsNote" type="text" autocomplete="off"></label>
        <label class="fld">To<input id="rsName" type="text" placeholder="Your name(s)" autocomplete="off"></label>
        <p class="msg" id="rsMsg"></p>
        <div class="btns"><button type="button" class="pbtn ok" id="rsPost">Post it</button><button type="button" class="pbtn" id="rsClose">Close</button></div></div>
      <div id="rsPosted" hidden><h3 id="rsPostedTxt"></h3><div class="btns"><button type="button" class="pbtn" id="rsEdit">Change my reply</button><button type="button" class="pbtn ok" id="rsDone">Close</button></div></div>
    </div>
    <div class="evwin" id="rsEv"><div class="evbox"><p class="eyebrow">Cartolina postale &middot; the events</p><h4>Which will you join?</h4><p class="sub">You are invited to these. Tick the ones you will come to.</p>
      <div id="rsEvList"></div><div class="btns"><button type="button" class="pbtn" id="rsEvCancel">Cancel</button><button type="button" class="pbtn ok" id="rsEvOk">Confirm</button></div></div></div></div>`;
  document.body.appendChild(sheets);
  const paintGuest = () => {
    el('guestLine').innerHTML = GUEST.household ? `Signed in &middot; ${esc(GUEST.household.names)} &middot; <button type="button" data-signin>Sign out</button>` : `<button type="button" data-signin>Guests: sign in for the details and the RSVP</button>`;
  };
  const signedIn = (d) => { GUEST.household = d.household; GUEST.reply = d.reply || null; GUEST.cards = d.cards || null; paintGuest(); };
  const signedOut = () => { GUEST.token = ''; GUEST.household = GUEST.reply = GUEST.cards = null; try { localStorage.removeItem('ka-guest'); } catch (e) { /* nothing kept */ } paintGuest(); };
  function openSignIn(why) {
    const inn = !!GUEST.household;
    el('siTitle').textContent = inn ? 'Signed in' : 'For our guests';
    el('siWhy').textContent = inn ? 'You are signed in as ' + GUEST.household.names + '.' : why || 'The details and the RSVP are for our guests. Sign in with your phone number and the code from your invitation.';
    el('siFields').hidden = inn; el('siGo').hidden = inn; el('siOut').hidden = !inn; el('siClose').textContent = inn ? 'Close' : 'Not now'; el('siMsg').textContent = '';
    el('si').classList.add('open');
  }
  const closeSignIn = () => { el('si').classList.remove('open'); afterSignIn = null; };
  function needGuest(then, why) { if (GUEST.household) { then(); return; } afterSignIn = then; openSignIn(why); }
  el('siForm').addEventListener('submit', async (e) => {
    e.preventDefault(); el('siGo').disabled = true; el('siMsg').textContent = '';
    try {
      const { ok, d } = await guestApi('POST', { action: 'login', phone: el('siPhone').value, code: el('siCode').value });
      if (!ok) { el('siMsg').textContent = d.error || 'That did not work. Please try again.'; return; }
      GUEST.token = d.token; try { localStorage.setItem('ka-guest', d.token); } catch (err) { /* this visit only */ }
      signedIn(d); el('siCode').value = ''; document.activeElement && document.activeElement.blur();
      const then = afterSignIn; closeSignIn(); if (then) then();
    } catch (err) { el('siMsg').textContent = 'We could not reach the gallery. Please check your connection and try again.'; }
    finally { el('siGo').disabled = false; }
  });
  el('siOut').addEventListener('click', async () => { try { await guestApi('POST', { action: 'logout' }); } catch (e) { /* signed out here either way */ } signedOut(); closeSignIn(); });
  el('siClose').addEventListener('click', closeSignIn);
  el('si').addEventListener('click', (e) => { if (e.target === el('si')) closeSignIn(); });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-signin]')) openSignIn(); });
  paintGuest();
  (async () => {
    const qr = (location.search.match(/[?&]k=([A-Za-z0-9_-]{22})/) || [])[1];
    if (qr) {                                                        // arrived by the invitation's QR code: sign in, and take the key out of the address
      history.replaceState(null, '', location.pathname + location.search.replace(/[?&]k=[A-Za-z0-9_-]{22}/, '').replace(/^&/, '?') + location.hash);
      try { const { ok, d } = await guestApi('POST', { action: 'login', key: qr }); if (ok) { GUEST.token = d.token; try { localStorage.setItem('ka-guest', d.token); } catch (e) { /* this visit */ } signedIn(d); return; } } catch (e) { /* the saved session */ }
    }
    if (!GUEST.token) return;
    try { const { ok, status, d } = await guestApi('GET'); if (ok) signedIn(d); else if (status === 401) signedOut(); } catch (e) { /* offline */ }
  })();

  // ---- the RSVP on the phone: the postcard's written side as a sheet; the Events box opens the window of this household's
  // events (tick, Confirm, back to the card), as on the 3D gallery's card
  let rsChosen = [];
  const rsYes = () => (document.querySelector('input[name=rsYes]:checked') || {}).value;
  const paintEv = () => { el('rsEvents').checked = rsChosen.length > 0; el('rsEvSum').textContent = rsChosen.length ? ' · ' + rsChosen.length + ' of ' + GUEST.household.events.length : ''; };
  const yesNo = () => { el('rsGuest').classList.toggle('off', rsYes() === 'no'); };
  function openRsvp() {
    const g = GUEST.household, r = GUEST.reply;
    el('rsSeats').innerHTML = Array.from({ length: g.seats + 1 }, (_, n) => `<option value="${n}"${n === g.seats ? ' selected' : ''}>${n}</option>`).join('');
    el('rsOf').textContent = g.seats === 1 ? '1 seat' : g.seats + ' seats';
    el('rsName').value = r ? r.name : g.names; el('rsPlus').value = r ? r.plus : ''; el('rsDiet').value = r ? r.diet : ''; el('rsNote').value = r ? r.note : '';
    document.querySelectorAll('input[name=rsYes]').forEach((x) => { x.checked = !!r && x.value === r.yes; });
    if (r && r.yes === 'yes') el('rsSeats').value = String(r.seats);
    rsChosen = r ? (r.events || []).slice() : []; paintEv(); yesNo(); el('rsMsg').textContent = '';
    showPosted(!!r);
    el('rs').classList.add('open'); el('rs').scrollTop = 0; document.body.style.overflow = 'hidden';
  }
  function showPosted(on) {
    const r = GUEST.reply;
    el('rsForm').hidden = on; el('rsPosted').hidden = !on;
    if (on) el('rsPostedTxt').textContent = 'Posted ' + new Date(r.when).toLocaleDateString(undefined, { day: 'numeric', month: 'long' }) + '. ' + (r.yes === 'yes' ? 'Thank you — see you in Siena.' : 'We’re sorry to miss you.');
  }
  const closeRsvp = () => { el('rs').classList.remove('open'); el('rsEv').classList.remove('open'); document.body.style.overflow = ''; };
  document.querySelectorAll('input[name=rsYes]').forEach((x) => x.addEventListener('change', yesNo));
  el('rsEvents').addEventListener('click', (e) => {                 // the box is ticked by confirming the window, not by the tap
    e.preventDefault();
    el('rsEvList').innerHTML = GUEST.household.events.map((ev) => `<label><input type="checkbox" value="${ev.id}"${rsChosen.includes(ev.id) ? ' checked' : ''}><span>${esc(ev.name)}<small>${esc(ev.day)}</small></span></label>`).join('');
    el('rsEv').classList.add('open');
  });
  el('rsEvOk').addEventListener('click', () => { rsChosen = [...el('rsEvList').querySelectorAll('input:checked')].map((i) => i.value); el('rsEv').classList.remove('open'); paintEv(); });
  el('rsEvCancel').addEventListener('click', () => el('rsEv').classList.remove('open'));
  el('rsEv').addEventListener('click', (e) => { if (e.target === el('rsEv')) el('rsEv').classList.remove('open'); });
  el('rsClose').addEventListener('click', closeRsvp); el('rsDone').addEventListener('click', closeRsvp);
  el('rsEdit').addEventListener('click', () => showPosted(false));
  el('rsPost').addEventListener('click', async () => {
    const yes = rsYes(), name = el('rsName').value.trim();
    if (!yes || !name) { el('rsMsg').textContent = !yes ? 'Yes or no, first.' : 'Your name, first.'; return; }
    el('rsPost').disabled = true; el('rsPost').textContent = 'Posting…'; el('rsMsg').textContent = '';
    const reply = { yes, name, card: 0, plus: el('rsPlus').value.trim(), diet: el('rsDiet').value.trim(), note: el('rsNote').value.trim(),
      seats: yes === 'yes' ? +el('rsSeats').value : 0, events: yes === 'yes' ? rsChosen.slice() : [] };
    try {
      const { ok, status, d } = await guestApi('POST', { action: 'rsvp', reply });
      if (ok) { GUEST.reply = d.reply; document.activeElement && document.activeElement.blur(); showPosted(true); el('rs').scrollTop = 0; }
      else if (status === 401) { signedOut(); closeRsvp(); needGuest(openRsvp); }
      else el('rsMsg').textContent = d.error || 'Could not post. Try again.';
    } catch (e) { el('rsMsg').textContent = 'We could not reach the gallery. Please check your connection and try again.'; }
    el('rsPost').disabled = false; el('rsPost').textContent = 'Post it';
  });

  // ---- the gallery view: the phone held sideways (26 Sept 2026). The guide becomes a walk through the museum, one
  // work to a screen: swipe along (the strip snaps to each), tap a work for its write-up (or on a hidden pet to find it),
  // jump between rooms at the top. Turned upright again, the guide comes back at the room you were in.
  const GQ = window.matchMedia ? matchMedia('(orientation: landscape) and (max-height: 500px)') : { matches: false, addEventListener() {} };
  const slides = [], add = (room, s) => slides.push({ room, ...s }), wideOf = (src) => src.replace(/\.jpg$/, '-wide.jpg');
  add('atrium', { kind: 'room', img: wideOf(atrium.hero), title: atrium.title, sub: atrium.intro.title, it: { title: atrium.intro.title, body: atrium.intro.body, meta: atrium.intro.meta } });
  add('atrium', { kind: 'pair', it: pair });
  atrium.items.slice(1).forEach((it) => add('atrium', { kind: 'art', it }));
  add('atrium', { kind: 'arcade' });
  (atrium.artifacts || []).forEach((it) => add('atrium', { kind: 'statue', it }));
  [[w1, 'The ceremony'], [w2, 'The reception']].forEach(([w, sub]) => {
    add(w.id, { kind: 'room', img: wideOf(w.hero), numeral: w.numeral, title: w.title, sub });
    add(w.id, { kind: 'art', it: { ...w.principal, body: w.closeup.body || w.principal.body } });
    w.walls.forEach((wall) => { add(w.id, { kind: 'text', eyebrow: `Wing ${w.numeral} · complementary work`, title: wall.title, body: wall.body, meta: wall.meta }); wall.pictures.forEach((it) => add(w.id, { kind: 'art', it })); });
    w.sculptures.forEach((it) => add(w.id, { kind: 'statue', it }));
  });
  add('det', { kind: 'room', img: wideOf(det.hero), title: det.title, sub: 'Everything you need to know' });
  add('det', { kind: 'text', eyebrow: 'The centerpiece', title: det.centre.title, body: det.centre.body, meta: det.centre.meta });
  if (det.hourglass) add('det', { kind: 'countdown', it: det.hourglass });
  add('det', { kind: 'text', eyebrow: 'Exhibit details · the table', title: det.table.title, body: det.table.body, note: 'Turn your phone upright to handle the save-the-date and the invitation.' });
  const shopSec = det.sections.find((s) => s.key === 'registry');
  det.sections.filter((s) => s !== shopSec).forEach((s) => {
    add('det', { kind: 'text', eyebrow: 'Exhibit details · ' + s.n, title: s.title, body: s.body, meta: s.meta, card: s.key });
    s.pictures.forEach((it) => add('det', { kind: 'art', it }));
  });
  det.sculptures.forEach((it) => add('det', { kind: 'statue', it }));
  if (shopSec) add('det', { kind: 'shop', img: det.shop, title: shopSec.title, body: shopSec.body, meta: shopSec.meta, card: shopSec.key });   // the gift shop, last

  const cardOf = Object.fromEntries(det.sections.map((s) => [s.key, s.card]));
  const cap = (it) => `<figcaption><h3>${esc(it.title)}</h3>${it.meta ? `<p class="meta">${esc(it.meta)}</p>` : ''}</figcaption>`;
  const img = (src, alt) => `<img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async" draggable="false">`;
  const cardBtn = (k) => k ? `<button class="detbtn" data-gvcard="${k}">Tap here for details</button>` : '';
  const slideHtml = (s) => {
    switch (s.kind) {
      case 'room': return `<div class="gv-room">${img(s.img, s.title)}<div class="cap">${s.numeral ? `<div class="numeral">${s.numeral}</div>` : ''}<h2>${esc(s.title)}</h2><p class="sub">${esc(s.sub)}</p>${s.it ? '<p class="tap">Tap for the introduction</p>' : ''}</div></div>`;
      case 'art': return `<figure class="gv-art" data-work>${img(s.it.img, s.it.title)}${cap(s.it)}</figure>`;
      case 'statue': return `<figure class="gv-statue" data-work>${img(s.it.img, s.it.title)}${cap(s.it)}</figure>`;
      case 'pair': return `<figure class="gv-statue gv-pair" data-work><div>${img(s.it.img, 'Venus')}${img(s.it.img2, 'Mars')}</div>${cap(s.it)}</figure>`;
      case 'countdown': { const days = Math.max(0, Math.ceil((s.it.wedding - Date.now()) / 86400000));
        return `<div class="gv-two">${img(s.it.img, s.it.title)}<div class="gv-words"><p class="eyebrow">Exhibit details · the countdown</p><div class="brass"><small>${days === 1 ? 'Day' : 'Days'}</small><b>${days}</b><small>until Siena</small></div><h3>${esc(s.it.title)}</h3><p class="body">${esc(s.it.body)}</p></div></div>`; }
      case 'text': return `<div class="gv-text"><p class="eyebrow">${esc(s.eyebrow)}</p><h3>${esc(s.title)}</h3><p class="body">${esc(s.body)}</p>${s.meta ? `<p class="meta">${esc(s.meta)}</p>` : ''}${s.note ? `<p class="note">${esc(s.note)}</p>` : ''}${cardBtn(s.card)}</div>`;
      case 'shop': return `<div class="gv-two">${img(s.img, s.title)}<div class="gv-words"><p class="eyebrow">Exhibit details · the gift shop</p><h3>${esc(s.title)}</h3><p class="body">${esc(s.body)}</p><p class="meta">${esc(s.meta)}</p>${cardBtn(s.card)}<button class="detbtn" data-rsvp>Write your postcard</button></div></div>`;
      case 'arcade': return `<div class="gv-two"><div class="gv-arcade" id="gvArcade" role="img" aria-label="The arcade's screen: turn your phone upright to play"></div><div class="gv-words"><p class="eyebrow">The atrium · Anthony · interactive installation</p><h3>The Arcade</h3><p class="body">Five playable pieces: Getting to Italy, Cross the Piazza, Catch the Bouquet, Flight to Siena, and The Seating Chart.</p><p class="tap">Turn your phone upright to play</p></div></div>`;
    }
    return '';
  };
  const firstOf = (room) => slides.findIndex((s) => s.room === room);
  const gv = document.createElement('div'); gv.id = 'gv'; document.body.appendChild(gv);
  let built = false, gvIndex = 0, strip = null, panel = null;
  function buildGallery() {
    built = true;
    gv.innerHTML = `<div class="gv-strip" id="gvStrip">${slides.map((s, i) => `<section class="gv-slide is-${s.kind}" data-i="${i}">${slideHtml(s)}</section>`).join('')}</div>
      <div class="gv-top"><nav>${rooms.map((r) => `<button data-gvroom="${r.id}">${r.numeral || (r.id === 'det' ? 'Details' : 'Atrium')}</button>`).join('')}</nav><span id="gvN"></span></div>
      <button class="gv-arrow prev" data-gvstep="-1" aria-label="Back">&lsaquo;</button><button class="gv-arrow next" data-gvstep="1" aria-label="On">&rsaquo;</button>
      <aside class="gv-panel" id="gvPanel"><button class="x" data-gvclose aria-label="Close">&times;</button><div id="gvPanelIn"></div></aside>
      <div class="gv-card" id="gvCard"></div>`;
    strip = el('gvStrip'); panel = el('gvPanel');
    let ticking = false;
    strip.addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; setIndex(Math.round(strip.scrollLeft / Math.max(1, strip.clientWidth))); }); }, { passive: true });
    gv.addEventListener('click', (e) => {
      const room = e.target.closest('[data-gvroom]'); if (room) { goSlide(firstOf(room.dataset.gvroom)); return; }
      const step = e.target.closest('[data-gvstep]'); if (step) { goSlide(gvIndex + +step.dataset.gvstep); return; }
      if (e.target.closest('[data-gvclose]')) { panel.classList.remove('open'); return; }
      const cb = e.target.closest('[data-gvcard]'); if (cb) { const k = cb.dataset.gvcard;
        needGuest(() => { el('gvCard').innerHTML = `<div class="in">${cardBody(GUEST.cards[k])}<button class="close" data-gvcardclose>Close</button></div>`;
          el('gvCard').classList.add('open'); el('gvCard').scrollTop = 0; }, cardOf[k].title + ' are for our guests. Sign in with your phone number and the code from your invitation.');
        return; }
      if (e.target.closest('[data-gvcardclose]') || e.target.id === 'gvCard') { el('gvCard').classList.remove('open'); return; }
      if (e.target.closest('#gvArcade')) return;                     // the games are played upright (the arcade's screen is taller than wide)
      const sl = e.target.closest('.gv-slide'); if (!sl) return;
      const s = slides[+sl.dataset.i];
      if (!s.it || s.kind === 'countdown' || !e.target.closest('img, .cap, figcaption')) return;   // a tap on the work itself, not the empty wall round it
      if (petHit(s.it, e, e.target.tagName === 'IMG' ? e.target : null)) { el('gvPanelIn').innerHTML = petNote(s.it.hidden); panel.classList.add('open'); return; }
      if (panel.classList.contains('open')) { panel.classList.remove('open'); return; }
      el('gvPanelIn').innerHTML = `<h3>${esc(s.it.title)}</h3><p class="body">${esc(s.it.body)}</p>${s.it.meta ? `<p class="meta">${esc(s.it.meta)}</p>` : ''}`;
      panel.classList.add('open'); panel.scrollTop = 0;
    });
    window.addEventListener('keydown', (e) => { if (!document.body.classList.contains('gv-on')) return; if (e.key === 'ArrowRight') goSlide(gvIndex + 1); if (e.key === 'ArrowLeft') goSlide(gvIndex - 1); });
    if (window.Arcade && Arcade.games.menu) { const cv = Arcade.attract('menu', 6); cv.style.cssText = 'width:100%;height:100%;display:block;image-rendering:pixelated;background:#140c06'; el('gvArcade').appendChild(cv); }
  }
  function setIndex(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i !== gvIndex && panel) panel.classList.remove('open');
    gvIndex = i;
    el('gvN').textContent = (i + 1) + ' / ' + slides.length;
    gv.querySelectorAll('[data-gvroom]').forEach((b) => b.classList.toggle('on', b.dataset.gvroom === slides[i].room));
  }
  function goSlide(i, smooth = true) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;   // "Reduce motion": the arrows jump rather than glide (the CSS covers everything else)
    strip.scrollTo({ left: i * strip.clientWidth, behavior: smooth && !calm ? 'smooth' : 'instant' });
    setIndex(i);
  }
  function applyMode() {                                             // sideways and past the doors: the gallery; upright: the guide
    const on = GQ.matches && !document.body.classList.contains('gated'), was = document.body.classList.contains('gv-on');
    if (on === was) return;
    if (on) {
      let r = curRoom;                                               // read before the turn: the wider layout moves everything
      if (location.hash && firstOf(location.hash.slice(1)) >= 0 && window.scrollY < 50) r = location.hash.slice(1);   // a link straight to a room, before any scrolling
      if (!built) buildGallery();
      closeLb(); document.body.classList.add('gv-on');
      requestAnimationFrame(() => goSlide(firstOf(r), false));
    } else {
      const r = slides[gvIndex] ? slides[gvIndex].room : 'atrium';
      curRoom = r;
      document.body.classList.remove('gv-on');
      [0, 120, 600].forEach((ms) => setTimeout(() => el(r).scrollIntoView({ behavior: 'instant' }), ms));   // a jump, not the page's smooth scroll; again as the upright layout settles
    }
  }
  if (GQ.addEventListener) GQ.addEventListener('change', applyMode); else if (GQ.addListener) GQ.addListener(applyMode);   // older iPhones know only addListener
  window.addEventListener('resize', applyMode);                      // and a turn is a resize too, for any browser that sends no change
  applyMode();
  // ?dbg : list anything wider than the screen (a check for the phone layout, used by the screenshot harness)
  if (/[?&]dbg/.test(location.search)) setTimeout(() => {
    const wide = [...document.querySelectorAll('body *')].filter((n) => { const r = n.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(n).position !== 'fixed'; })
      .slice(0, 12).map((n) => n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + (n.className && typeof n.className === 'string' ? '.' + n.className.split(' ').join('.') : '') + ' ' + Math.round(n.getBoundingClientRect().left) + '..' + Math.round(n.getBoundingClientRect().right));
    const d = document.createElement('pre'); d.style.cssText = 'position:fixed;left:0;top:0;z-index:99;background:#000;color:#0f0;font:11px monospace;white-space:pre-wrap;margin:0;padding:4px';
    d.textContent = 'innerWidth ' + innerWidth + ' docWidth ' + document.documentElement.scrollWidth + '\n' + (wide.join('\n') || 'nothing overflows'); document.body.appendChild(d);
  }, 1200);
})();
