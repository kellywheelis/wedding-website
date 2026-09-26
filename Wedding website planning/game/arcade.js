// The arcade: a shared shell for the museum's playable pieces. A game registers itself as
//   Arcade.games[id] = { title, w, h, create(api) -> { update(dt, input), draw(ctx), drawTitle(ctx, t) } }
// and the shell gives it a pixel canvas scaled to the screen, keyboard and touch controls, a fixed-step loop,
// sprite sheets (with a drawn-in-code fallback while the real sprites are still to come), and an "attract"
// canvas: the title screen playing on a loop, for a picture frame in the 3D gallery or a card on the phone.
(function () {
  const Arcade = { games: {}, open: null, onClose: null };
  window.Arcade = Arcade;
  const KEYS = { ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right', ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ' ': 'jump', x: 'jump', Enter: 'start', z: 'start' };

  // ---- input: held keys, and keys pressed since the last frame
  const held = {}, pressed = {};
  const input = { held, pressed, is: (k) => !!held[k], hit: (k) => !!pressed[k] };
  const down = (k) => { if (!held[k]) pressed[k] = true; held[k] = true; };
  const up = (k) => { held[k] = false; };
  window.addEventListener('keydown', (e) => {
    if (!Arcade.open) return;
    if (Arcade.board && Arcade.board.on && Arcade.board.phase === 'enter') {   // typing the initials
      if (/^[a-zA-Z]$/.test(e.key)) { Arcade.board.type(e.key.toUpperCase()); e.preventDefault(); return; }
      if (e.key === 'Backspace') { Arcade.board.back(); e.preventDefault(); return; }
      if (e.key === 'Enter') { Arcade.board.submit(); e.preventDefault(); return; }
    }
    const k = KEYS[e.key]; if (k) { down(k); e.preventDefault(); }
    if (e.key === 'Escape') { if (Arcade.ask && Arcade.ask.on) Arcade.ask.close(); else if (Arcade.board && Arcade.board.on) Arcade.board.close(); else Arcade.close(); }   // Esc answers "no" to a question, then leaves the board (no post), then the arcade
  });
  window.addEventListener('keyup', (e) => { const k = KEYS[e.key]; if (k) up(k); });

  // ---- the overlay
  let root, canvas, ctx, game, raf = 0, last = 0, acc = 0;
  const STEP = 1 / 60;
  function build() {
    root = document.createElement('div'); root.id = 'arcade';
    root.innerHTML = `<div class="ar-frame"><canvas class="ar-screen"></canvas></div>
      <button class="ar-x" aria-label="Close">&times;</button>
      <div class="ar-pad">
        <div class="ar-dpad"><button data-k="left">◀</button><button data-k="up">▲</button><button data-k="down">▼</button><button data-k="right">▶</button></div>
        <div class="ar-btns"><button data-k="jump" class="ar-jump">JUMP</button><button data-k="start" class="ar-start">START</button></div>
      </div>
      <div class="ar-turn"><div><span>&#8635;</span><p>Turn your phone upright to play</p><small>The game waits for you</small></div></div>`;
    const css = document.createElement('style');
    css.textContent = `
      #arcade{position:fixed;inset:0;z-index:90;background:rgba(14,9,5,.94);display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:12px;user-select:none;-webkit-user-select:none}
      #arcade.on{display:flex}
      #arcade .ar-frame{padding:10px;background:linear-gradient(135deg,#8e6e2b,#e6c37a 30%,#9a7020 50%,#f0d693 70%,#8e6e2b);box-shadow:0 20px 60px rgba(0,0,0,.7),inset 0 0 0 1px rgba(70,48,8,.6)}
      #arcade .ar-screen{display:block;background:#000;image-rendering:pixelated;image-rendering:crisp-edges}
      #arcade .ar-turn{display:none;position:absolute;inset:0;z-index:4;align-items:center;justify-content:center;text-align:center;background:rgba(14,9,5,.97);color:#F2E6C9;font-family:Georgia,serif}
      #arcade .ar-turn span{display:block;font-size:44px;line-height:1;color:#E8C07A}
      #arcade .ar-turn p{margin:12px 0 4px;font-size:15px;letter-spacing:.2em;text-transform:uppercase}
      #arcade .ar-turn small{font-style:italic;font-size:14px;color:#a79c85}
      @media (orientation: landscape) and (max-height: 500px){#arcade.touch .ar-turn{display:flex}}
      #arcade .ar-x{z-index:5;position:absolute;right:14px;top:calc(12px + env(safe-area-inset-top));width:40px;height:40px;border-radius:50%;border:1px solid rgba(232,192,122,.7);background:rgba(26,18,8,.7);color:#F2E6C9;font:22px/38px Georgia,serif;cursor:pointer}
      #arcade .ar-pad{display:none;width:100%;max-width:420px;justify-content:space-between;align-items:center;padding:0 6px calc(6px + env(safe-area-inset-bottom))}
      #arcade.touch .ar-pad{display:flex}
      #arcade .ar-dpad{display:grid;grid-template-columns:repeat(3,56px);grid-template-rows:repeat(2,56px);gap:4px}
      #arcade .ar-dpad button:nth-child(1){grid-area:2/1} #arcade .ar-dpad button:nth-child(2){grid-area:1/2} #arcade .ar-dpad button:nth-child(3){grid-area:2/2} #arcade .ar-dpad button:nth-child(4){grid-area:2/3}
      #arcade .ar-pad button{border:1px solid rgba(232,192,122,.6);background:rgba(43,37,32,.9);color:#F2E6C9;font:600 15px Georgia,serif;border-radius:10px;touch-action:none;-webkit-tap-highlight-color:transparent}
      #arcade .ar-pad button:active{background:rgba(201,166,103,.5)}
      #arcade .ar-btns{display:grid;gap:8px}
      #arcade .ar-jump{width:88px;height:88px;border-radius:50%!important;font-size:14px!important;letter-spacing:.1em}
      #arcade .ar-start{width:88px;height:30px;font-size:10px!important;letter-spacing:.2em}`;
    document.head.appendChild(css); document.body.appendChild(root);
    canvas = root.querySelector('.ar-screen'); ctx = canvas.getContext('2d');
    root.querySelector('.ar-x').addEventListener('click', () => { if (Arcade.ask.on) Arcade.ask.close(); else if (Arcade.board && Arcade.board.on) Arcade.board.close(); else Arcade.close(); });
    canvas.addEventListener('click', (e) => {                            // a click or tap on the screen: the x beside a guest's own score, or the question's YES / NO
      const r = canvas.getBoundingClientRect(), x = (e.clientX - r.left) * canvas.width / r.width, y = (e.clientY - r.top) * canvas.height / r.height;
      const h = hits.find((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h); if (h) h.act();
    });
    root.addEventListener('pointerup', () => { if (Arcade.board && Arcade.board.on && Arcade.board.phase === 'enter' && entry) { entry.focus({ preventScroll: true }); } });   // any tap while entering brings the keyboard (a phone only raises it from a real tap)
    root.querySelectorAll('.ar-pad button').forEach((b) => {
      const k = b.dataset.k;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture(e.pointerId); down(k); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => b.addEventListener(ev, () => up(k)));
    });
    if (matchMedia('(pointer: coarse)').matches) root.classList.add('touch');
    window.addEventListener('resize', fit);
  }
  function fit() {
    if (!game) return;
    const pad = root.classList.contains('touch') ? 170 : 40;
    const sw = Math.min(innerWidth - 44, (innerHeight - pad) * game.w / game.h);
    let scale = sw / game.w; if (scale >= 1) scale = Math.floor(scale * 2) / 2;    // half-integer scales keep the pixels even
    canvas.style.width = Math.round(game.w * scale) + 'px'; canvas.style.height = Math.round(game.h * scale) + 'px';
  }
  // opts.onClose runs when the arcade closes altogether; opts.back names the game (the menu) that Esc returns to
  Arcade.launch = function (id, opts = {}) {
    if (!root) build();
    const def = Arcade.games[id]; if (!def) return;
    game = { w: def.w, h: def.h, inst: def.create(Arcade.api(def)), back: opts.back || null };
    canvas.width = def.w; canvas.height = def.h; ctx.imageSmoothingEnabled = false;
    Object.keys(held).forEach((k) => { held[k] = false; }); Object.keys(pressed).forEach((k) => { delete pressed[k]; });
    Arcade.open = id; if (opts.onClose !== undefined) Arcade.onClose = opts.onClose; Arcade.current = game;
    root.classList.add('on'); fit();
    last = performance.now(); acc = 0;
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  };
  Arcade.close = function () {
    if (!Arcade.open) return;
    if (game && game.back) { const b = game.back; cancelAnimationFrame(raf); Arcade.launch(b); return; }   // back to the menu
    cancelAnimationFrame(raf); root.classList.remove('on'); Arcade.open = null; game = null;
    if (Arcade.onClose) { const f = Arcade.onClose; Arcade.onClose = null; f(); }
  };
  // a phone held sideways leaves the game a sliver of screen above its controls: the cover asks for it upright, and the
  // game is paused under it (not a frame of play is lost while the phone is turned)
  const SIDEWAYS = window.matchMedia ? matchMedia('(orientation: landscape) and (max-height: 500px)') : { matches: false };
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (SIDEWAYS.matches && root.classList.contains('touch')) { last = now; return; }
    acc += Math.min(0.1, (now - last) / 1000); last = now;
    while (acc >= STEP) { tick(); Object.keys(pressed).forEach((k) => { delete pressed[k]; }); acc -= STEP; }
    paint();
  }
  const tick = () => { if (Arcade.ask.on) Arcade.ask.update(input); else game.inst.update(STEP, input); };
  const hits = [];                                                           // the spots a click or tap acts on, drawn this frame
  function paint() {
    hits.length = 0; game.inst.draw(ctx);
    if (Arcade.ask.on) { hits.length = 0; Arcade.ask.draw(ctx); }             // under a question only its own YES and NO answer
  }

  // ---- what a game gets to work with
  Arcade.api = (def) => ({
    // a sprite sheet of `frames` cells, `fw` x `fh` each, from `url`; until it loads (or if it never does) `fallback(ctx, frame, x, y, flip)` draws instead
    sheet(url, fw, fh, frames, fallback) {
      const img = new Image(); let ok = false;
      img.onload = () => { ok = img.naturalWidth >= fw * frames; }; img.src = url;
      return { draw(c, frame, x, y, flip) {
        if (!ok) { fallback(c, frame, x, y, flip); return; }
        c.save(); if (flip) { c.translate(x + fw, y); c.scale(-1, 1); c.drawImage(img, frame * fw, 0, fw, fh, 0, 0, fw, fh); } else c.drawImage(img, frame * fw, 0, fw, fh, x, y, fw, fh); c.restore();
      } };
    },
    // a single picture, trimmed of its transparent margins, drawn at any size with hard pixels (nearest-neighbour);
    // `draw(c, x, y, w, h, flip)` puts its bottom-left corner at (x, y + h) so things sit on platforms; until it loads, `fallback(c, x, y, w, h)`
    image(url, fallback) {
      const img = new Image(); let box = null;
      img.onload = () => { const cv = document.createElement('canvas'); cv.width = img.naturalWidth; cv.height = img.naturalHeight; const x = cv.getContext('2d'); x.drawImage(img, 0, 0);
        const d = x.getImageData(0, 0, cv.width, cv.height).data; let x0 = cv.width, y0 = cv.height, x1 = -1, y1 = -1;
        for (let i = 0; i < d.length; i += 4) { if (d[i + 3] > 40) { const px = (i / 4) % cv.width, py = Math.floor(i / 4 / cv.width); if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; } }
        if (x1 >= 0) box = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }; };
      img.src = url;
      return { get ok() { return !!box; }, get box() { return box; }, draw(c, x, y, w, h, flip) {
        if (!box) { if (fallback) fallback(c, x, y, w || 16, h || 16); return; }
        if (w == null) w = Math.round(h * box.w / box.h); if (h == null) h = Math.round(w * box.h / box.w);   // one size given: keep the picture's own proportion
        c.save(); c.imageSmoothingEnabled = false;
        if (flip) { c.translate(x + w, y); c.scale(-1, 1); c.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, w, h); } else c.drawImage(img, box.x, box.y, box.w, box.h, x, y, w, h);
        c.restore();
      } };
    },
    // pixel text: the shell's small font, drawn with rectangles so it stays crisp at any scale
    text(c, s, x, y, col, align) { drawText(c, String(s), x, y, col, align); },
    px(c, map, x, y, pal, flip) { drawMap(c, map, x, y, pal, flip); },
    // a title screen, redrawn a few times a second, for the picture frame in the 3D gallery
    attract(fps = 8) { const cv = document.createElement('canvas'); cv.width = def.w; cv.height = def.h; const cx = cv.getContext('2d'); const inst = def.create(Arcade.api(def)); let t = 0;
      const tick = () => { t += 1 / fps; inst.drawTitle(cx, t); if (cv.onframe) cv.onframe(); }; tick(); cv.timer = setInterval(tick, 1000 / fps); return cv; }
  });
  // for tests: run the open game forward by `steps` frames with these keys held (deterministic, no timers)
  Arcade.step = (steps, keys) => { if (!game) return; Object.keys(held).forEach((k) => { held[k] = false; }); (keys || []).forEach((k) => { held[k] = true; pressed[k] = true; }); for (let i = 0; i < steps; i++) { tick(); Object.keys(pressed).forEach((k) => { delete pressed[k]; }); } (keys || []).forEach((k) => { held[k] = false; }); paint(); };
  // for tests: a click at a point of the game's own screen (its pixels), as a guest's click or tap would land
  Arcade.tap = (x, y) => { const h = hits.find((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h); if (h) h.act(); return !!h; };
  // ---- the scoreboard: shared by every game. A game calls Arcade.board.open(gameId, score, opts) at its end:
  // an ENTER YOUR INITIALS screen (left/right change the letter, up/down move along, start posts; or skip),
  // then the top ten with the new entry lit. The shell draws it over the game and takes the keys meanwhile.
  const API = '/api/scores';
  const cache = {};                                                          // top tens by game, for the menu
  // the scores this device posted, by the id the server gave each (NAME:when:secret): only these get the little x that
  // takes a score off the board (the owner's wish, 26 Sept 2026), and only this device holds the secret that does it
  const MINE = (() => { try { return JSON.parse(localStorage.getItem('ka-scores') || '[]'); } catch (e) { return []; } })();
  const saveMine = () => { try { localStorage.setItem('ka-scores', JSON.stringify(MINE.slice(-100))); } catch (e) { /* this visit only */ } };
  const mineOf = (game, e) => MINE.find((m) => m.g === game && m.id.startsWith(e.name + ':' + e.when + ':'));
  Arcade.board = {
    async fetch(id) { try { const r = await fetch(API + '?game=' + id); const j = await r.json(); cache[id] = j.top || []; return cache[id]; } catch (e) { return cache[id] || []; } },
    top(id) { return cache[id] || []; },
    async post(id, name, score) { try { const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: id, name, score }) }); const j = await r.json(); if (j.top) cache[id] = j.top; if (j.id) { MINE.push({ g: id, id: j.id }); saveMine(); } return j; } catch (e) { return { error: 'offline' }; } },
    async remove(id, m) {
      try { const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ game: id, remove: m.id }) }); const j = await r.json();
        if (j.top) cache[id] = j.top;
        if (r.ok) { MINE.splice(MINE.indexOf(m), 1); saveMine(); }                // gone, or already gone: either way no longer ours to show
        return j; } catch (e) { return { error: 'offline' }; }
    },
    // the x beside one of this device's own scores: asks first, then takes it off; the board's own lit row follows
    askRemove(id, e, m) {
      Arcade.ask.open(['REMOVE ' + e.name + ' ' + e.score, 'FROM THE HIGH SCORES?'], async () => {
        const b = Arcade.board, was = b.top(id).findIndex((x) => x === e) + 1;
        await b.remove(id, m);
        if (b.id !== id || !b.posted || !b.postedId) return;
        if (m.id === b.postedId) { b.posted = false; b.rank = null; return; }  // took off the score just posted
        const now = b.top(id).findIndex((x) => b.postedId.startsWith(x.name + ':' + x.when + ':'));
        b.rank = now >= 0 ? now + 1 : (b.rank > 10 && was && was < b.rank ? b.rank - 1 : b.rank);
      });
    },
    // the overlay state; a game's draw() calls Arcade.board.draw(c) last, and its update() returns early while Arcade.board.on
    on: false, phase: 'enter', id: null, score: 0, letters: [0, 0, 0], at: 0, rank: null, t: 0, posted: false, when: 0,
    open(id, score, opts = {}) { const b = Arcade.board; b.on = true; showEntry(); b.phase = 'enter'; b.id = id; b.score = Math.floor(score); b.letters = b.last ? b.last.slice() : [0, 0, 0]; b.at = 0; b.rank = null; b.t = 0; b.posted = false; b.title = opts.title || 'YOU MADE IT'; b.sub = opts.sub || ''; Arcade.board.fetch(id); },
    type(ch) { const b = Arcade.board; b.letters[b.at] = ch.charCodeAt(0) - 65; if (b.at < 2) b.at++; },
    back() { const b = Arcade.board; if (b.at > 0) b.at--; },
    close() { const b = Arcade.board; b.on = false; hideEntry(); if (b.onClose) { const f = b.onClose; b.onClose = null; f(); } },
    update(dt, input) {
      const b = Arcade.board; b.t += dt; if (!b.on) return;
      if (b.phase === 'enter') {
        if (input.hit('left')) b.letters[b.at] = (b.letters[b.at] + 25) % 26;
        if (input.hit('right')) b.letters[b.at] = (b.letters[b.at] + 1) % 26;
        if (input.hit('up')) b.at = (b.at + 2) % 3;
        if (input.hit('down')) b.at = (b.at + 1) % 3;
        if (input.hit('jump')) { if (b.at < 2) b.at++; else b.submit(); }
        if (input.hit('start')) b.submit();
      } else if (b.phase === 'board') { if (b.t > 0.6 && (input.hit('start') || input.hit('jump'))) b.close(); }
    },
    async submit() { const b = Arcade.board; if (b.phase !== 'enter') return; hideEntry(); const name = b.letters.map((n) => String.fromCharCode(65 + n)).join(''); b.last = b.letters.slice(); b.phase = 'posting'; b.t = 0;
      const j = await b.post(b.id, name, b.score); b.rank = j.rank || null; b.posted = !j.error; b.postedId = j.id || null; b.when = Date.now(); b.phase = 'board'; b.t = 0; },
    draw(c) {
      const b = Arcade.board; if (!b.on) return; const W = c.canvas.width, H = c.canvas.height;
      c.fillStyle = 'rgba(20,12,6,.86)'; c.fillRect(0, 0, W, H); c.fillStyle = '#7a1a3c'; c.fillRect(0, 0, W, 10); c.fillRect(0, H - 10, W, 10);
      const big = (s, y, col, k = 2) => { c.save(); c.translate(W / 2, y); c.scale(k, k); drawText(c, s, 0, 0, col, 'center'); c.restore(); };
      if (b.phase === 'enter' || b.phase === 'posting') {
        big(b.title, 40, '#e8c07a'); if (b.sub) drawText(c, b.sub, W / 2, 62, '#a79c85', 'center');
        drawText(c, 'SCORE ' + b.score, W / 2, 80, '#f4efe1', 'center');
        drawText(c, 'ENTER YOUR INITIALS', W / 2, 108, '#e8c07a', 'center');
        b.letters.forEach((n, i) => { const x = W / 2 - 30 + i * 30, y = 132; if (i === b.at && Math.floor(b.t * 3) % 2 === 0) { c.fillStyle = '#7a1a3c'; c.fillRect(x - 12, y - 6, 24, 30); }
          c.save(); c.translate(x, y); c.scale(3, 3); drawText(c, String.fromCharCode(65 + n), 0, 0, i === b.at ? '#f4efe1' : '#a79c85', 'center'); c.restore(); c.fillStyle = '#e8c07a'; c.fillRect(x - 9, y + 24, 18, 1); });
        drawText(c, b.phase === 'posting' ? 'POSTING...' : (root && root.classList.contains('touch') ? 'TAP THE LETTERS TO TYPE · START POSTS · X SKIPS' : 'TYPE THEM · ENTER POSTS · ESC SKIPS'), W / 2, 176, '#a79c85', 'center');
        const top = b.top(b.id); if (top.length) { drawText(c, 'TO BEAT: ' + top[0].name + ' ' + top[0].score, W / 2, 196, '#a79c85', 'center'); }
      } else {
        big('HIGH SCORES', 30, '#e8c07a');
        const top = b.top(b.id);
        if (!top.length) drawText(c, b.posted ? 'YOU ARE THE FIRST' : 'THE BOARD IS OFFLINE', W / 2, 120, '#f4efe1', 'center');
        top.slice(0, 10).forEach((e, i) => { const y = 56 + i * 16, mine = b.posted && b.rank === i + 1; if (mine) { c.fillStyle = '#7a1a3c'; c.fillRect(30, y - 3, W - 60, 13); }
          drawText(c, String(i + 1).padStart(2, ' '), 44, y, mine ? '#f4efe1' : '#a79c85', 'right'); drawText(c, e.name, 62, y, mine ? '#f4efe1' : '#f4efe1'); drawText(c, String(e.score), W - 44, y, mine ? '#e8c07a' : '#f4efe1', 'right');
          const m = mineOf(b.id, e); if (m) { drawText(c, 'X', W - 37, y, mine ? '#f4efe1' : '#a79c85'); hits.push({ x: W - 42, y: y - 4, w: 14, h: 14, act: () => b.askRemove(b.id, e, m) }); } });
        if (b.posted && b.rank && b.rank > 10) drawText(c, 'YOU CAME ' + b.rank + (b.rank % 10 === 1 && b.rank !== 11 ? 'ST' : b.rank % 10 === 2 && b.rank !== 12 ? 'ND' : b.rank % 10 === 3 && b.rank !== 13 ? 'RD' : 'TH') + ' · SCORE ' + b.score, W / 2, 222, '#e8c07a', 'center');
        if (!b.posted) drawText(c, 'SCORE ' + b.score + ' · NOT POSTED', W / 2, 222, '#a79c85', 'center');
        if (Math.floor(b.t * 2) % 2) drawText(c, 'PRESS START', W / 2, 244, '#e8c07a', 'center');
        drawText(c, root && root.classList.contains('touch') ? 'X LEAVES THE SCOREBOARD' : 'ESC LEAVES THE SCOREBOARD', W / 2, 258, '#a79c85', 'center');
      }
    }
  };
  // a real (invisible) text box, focused while initials are being entered, so a phone shows its keyboard; what is
  // typed into it feeds the board's letters. On a desktop the keys are taken directly.
  let entry = null;
  function showEntry() {
    if (!root) return;
    if (!entry) { entry = document.createElement('input'); entry.type = 'text'; entry.maxLength = 3; entry.autocapitalize = 'characters'; entry.autocomplete = 'off'; entry.setAttribute('aria-label', 'Your initials');
      entry.style.cssText = 'position:absolute;left:50%;top:38%;width:140px;height:60px;margin-left:-70px;opacity:0.01;border:0;padding:0;font-size:16px;background:transparent;color:transparent;caret-color:transparent;z-index:5';
      entry.addEventListener('input', () => { const v = entry.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3); const b = Arcade.board; for (let i = 0; i < 3; i++) if (v[i]) b.letters[i] = v.charCodeAt(i) - 65; b.at = Math.min(2, v.length); if (v.length === 3) { entry.value = v; } });
      entry.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); Arcade.board.submit(); } });
      root.appendChild(entry); }
    entry.value = ''; entry.style.display = 'block'; if (!root.classList.contains('touch')) return; try { entry.focus({ preventScroll: true }); } catch (e) {}
  }
  // and gone the moment the initials are in or the board closes: left in place, the invisible box sat over the middle of
  // the game screen, and a tap there mid-game raised a phone's keyboard
  function hideEntry() { if (entry) { entry.blur(); entry.value = ''; entry.style.display = 'none'; } }
  // ---- a yes-or-no question over whatever is on the screen (so far: taking a score off the board). NO is lit to begin
  // with; left/right (or up/down) change it, start or jump answers, Esc or the close button means no. YES and NO can be
  // clicked or tapped as well. While it is up the game underneath gets no keys.
  Arcade.ask = { on: false, sel: 1, lines: [], then: null,
    open(lines, then) { const a = Arcade.ask; a.on = true; a.sel = 1; a.lines = lines; a.then = then; },
    close() { const a = Arcade.ask; a.on = false; a.then = null; },
    yes() { const a = Arcade.ask, f = a.then; a.close(); if (f) f(); },
    update(input) { const a = Arcade.ask; if (['left', 'right', 'up', 'down'].some((k) => input.hit(k))) a.sel = 1 - a.sel; if (input.hit('start') || input.hit('jump')) { if (a.sel === 0) a.yes(); else a.close(); } },
    draw(c) {
      const a = Arcade.ask, W = c.canvas.width, H = c.canvas.height, x0 = 20, w = W - 40, y0 = Math.round(H / 2 - 40);
      c.fillStyle = 'rgba(10,6,3,.55)'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#e8c07a'; c.fillRect(x0 - 1, y0 - 1, w + 2, 82); c.fillStyle = '#140c06'; c.fillRect(x0, y0, w, 80); c.fillStyle = '#7a1a3c'; c.fillRect(x0, y0, w, 4);
      a.lines.forEach((l, i) => drawText(c, l, W / 2, y0 + 16 + i * 12, i ? '#a79c85' : '#f4efe1', 'center'));
      [['YES', W / 2 - 42, a.yes], ['NO', W / 2 + 6, a.close]].forEach(([t, x, act], i) => {
        const on = a.sel === i, y = y0 + 50;
        c.fillStyle = on ? '#e8c07a' : '#5c534a'; c.fillRect(x, y, 36, 16); c.fillStyle = on ? '#7a1a3c' : '#140c06'; c.fillRect(x + 1, y + 1, 34, 14);
        drawText(c, t, x + 18, y + 5, on ? '#f4efe1' : '#a79c85', 'center');
        hits.push({ x: x - 3, y: y - 4, w: 42, h: 24, act });
      });
    }
  };
  // the menu's line of a game's best three. In the playable menu this device's own scores carry the x too, and the whole
  // entry answers a click or tap (the x alone is too small a mark for a finger); with none of its own the line is drawn
  // exactly as one centred string, as before
  function scoresLine(c, id, top, y, live) {
    const dim = '#8a7a5a', pieces = [];
    top.forEach((e, i) => { if (i) pieces.push(['  \u00b7  ', dim]); const m = live && mineOf(id, e); pieces.push([e.name + ' ' + e.score, dim, m && { e, m }]); if (m) pieces.push([' X', '#c9a667', 'x']); });
    let x = Math.round(c.canvas.width / 2 - (pieces.reduce((n, p) => n + measure(p[0]), 0) + pieces.length - 1) / 2), from = 0, own = null;
    pieces.forEach(([s, col, tag]) => {
      if (tag && tag !== 'x') { from = x; own = tag; }
      x += drawText(c, s, x, y, col) + 1;
      if (tag === 'x') { const o = own; hits.push({ x: from - 2, y: y - 4, w: x - from + 3, h: 14, act: () => Arcade.board.askRemove(id, o.e, o.m) }); }
    });
  }
  // ---- the menu: the cabinet's list of games. Registered games are playable; the planned ones show as coming soon.
  Arcade.menuList = [['italy', 'Getting to Italy'], ['piazza', 'Cross the Piazza'], ['bouquet', 'Catch the Bouquet'], ['flight', 'Flight to Siena'], ['seating', 'The Seating Chart']];
  Arcade.games.menu = { title: 'The Arcade', w: 224, h: 288, create(api) {
    let sel = 0, t = 0; const titles = {};
    const playable = () => Arcade.menuList.filter(([id]) => Arcade.games[id]);
    Arcade.menuList.forEach(([id]) => { if (Arcade.games[id]) Arcade.board.fetch(id); });
    const list = (c, y0, cursor) => Arcade.menuList.forEach(([id, name], i) => {
      const on = !!Arcade.games[id], y = y0 + i * 30;
      if (on) { const t = Arcade.board.top(id).slice(0, 3); if (t.length) scoresLine(c, id, t, y + 13, cursor); }
      if (cursor && on && playable()[sel] && playable()[sel][0] === id) { c.fillStyle = '#7a1a3c'; c.fillRect(28, y - 5, 168, 16); api.text(c, '>', 36, y, '#e8c07a'); }
      api.text(c, name, 112, y, on ? '#f4efe1' : '#5c534a', 'center');
      if (!on) api.text(c, 'COMING SOON', 112, y + 13, '#5c534a', 'center');
    });
    const header = (c) => { c.fillStyle = '#140c06'; c.fillRect(0, 0, 224, 288); c.fillStyle = '#7a1a3c'; c.fillRect(0, 0, 224, 10); c.fillRect(0, 278, 224, 10);
      c.save(); c.translate(112, 40); c.scale(3, 3); api.text(c, 'THE ARCADE', 0, 0, '#e8c07a', 'center'); c.restore();
      api.text(c, "ANTHONY'S COLLECTION · PLAYABLE PIECES", 112, 66, '#a79c85', 'center'); };
    return {
      update(dt, input) { t += dt; const p = playable(); if (!p.length) return;
        if (input.hit('up')) sel = (sel + p.length - 1) % p.length; if (input.hit('down')) sel = (sel + 1) % p.length;
        if (input.hit('start') || input.hit('jump')) Arcade.launch(p[sel][0], { back: 'menu' }); },
      draw(c) { header(c); list(c, 96, true); if (Math.floor(t * 2) % 2) api.text(c, 'UP / DOWN · START TO PLAY', 112, 236, '#e8c07a', 'center'); api.text(c, 'ESC RETURNS HERE', 112, 256, '#a79c85', 'center'); },
      // the frame's loop: the list, then each game's own title in turn, six seconds apiece
      drawTitle(c, tt) { const ids = playable().map(([id]) => id), k = Math.floor(tt / 6) % (ids.length + 1);
        if (k === 0) { header(c); list(c, 96, false); if (Math.floor(tt * 2) % 2) api.text(c, 'PRESS START', 112, 236, '#e8c07a', 'center'); return; }
        const id = ids[k - 1]; if (!titles[id]) titles[id] = Arcade.games[id].create(Arcade.api(Arcade.games[id])); titles[id].drawTitle(c, tt); }
    };
  } };
  Arcade.attract = (id, fps) => { const def = Arcade.games[id]; return def ? Arcade.api(def).attract(fps) : null; };

  // ---- a 4x6 pixel font: capitals, digits and a little punctuation
  const FONT = {
    A: '0110 1001 1001 1111 1001 1001', B: '1110 1001 1110 1001 1001 1110', C: '0111 1000 1000 1000 1000 0111', D: '1110 1001 1001 1001 1001 1110', E: '1111 1000 1110 1000 1000 1111', F: '1111 1000 1110 1000 1000 1000', G: '0111 1000 1011 1001 1001 0111', H: '1001 1001 1111 1001 1001 1001', I: '111 010 010 010 010 111', J: '0011 0001 0001 0001 1001 0110', K: '1001 1010 1100 1010 1001 1001', L: '1000 1000 1000 1000 1000 1111', M: '10001 11011 10101 10001 10001 10001', N: '1001 1101 1011 1001 1001 1001', O: '0110 1001 1001 1001 1001 0110', P: '1110 1001 1110 1000 1000 1000', Q: '0110 1001 1001 1001 1011 0111', R: '1110 1001 1110 1010 1001 1001', S: '0111 1000 0110 0001 0001 1110', T: '11111 00100 00100 00100 00100 00100', U: '1001 1001 1001 1001 1001 0110', V: '1001 1001 1001 1001 0110 0110', W: '10001 10001 10101 10101 11011 10001', X: '1001 1001 0110 0110 1001 1001', Y: '10001 01010 00100 00100 00100 00100', Z: '1111 0001 0010 0100 1000 1111',
    0: '0110 1001 1011 1101 1001 0110', 1: '010 110 010 010 010 111', 2: '0110 1001 0001 0110 1000 1111', 3: '1110 0001 0010 0001 0001 1110', 4: '1001 1001 1111 0001 0001 0001', 5: '1111 1000 1110 0001 0001 1110', 6: '0111 1000 1110 1001 1001 0110', 7: '1111 0001 0010 0100 0100 0100', 8: '0110 1001 0110 1001 1001 0110', 9: '0110 1001 1001 0111 0001 0110',
    ' ': '00 00 00 00 00 00', '.': '0 0 0 0 0 1', ',': '0 0 0 0 1 1', ':': '0 1 0 0 1 0', '!': '1 1 1 1 0 1', '?': '0110 1001 0010 0100 0000 0100', '-': '000 000 111 000 000 000', '+': '000 010 111 010 000 000', "'": '1 1 0 0 0 0', '·': '0 0 1 0 0 0', '&': '0100 1010 0100 1011 1010 0101', '/': '0001 0001 0010 0100 1000 1000', '>': '100 010 001 001 010 100', '<': '001 010 100 100 010 001'
  };
  const measure = (s) => [...String(s).toUpperCase()].reduce((n, ch) => n + (FONT[ch] || FONT['?']).split(' ')[0].length + 1, 0) - 1;   // drawText's width, drawing nothing
  function drawText(c, s, x, y, col, align) {
    const glyphs = [...s.toUpperCase()].map((ch) => (FONT[ch] || FONT['?']).split(' '));
    const w = glyphs.reduce((a, g) => a + g[0].length + 1, 0) - 1;
    let px = align === 'center' ? Math.round(x - w / 2) : align === 'right' ? Math.round(x - w) : x;
    c.fillStyle = col;
    glyphs.forEach((g) => { g.forEach((row, ry) => { [...row].forEach((b, rx) => { if (b === '1') c.fillRect(px + rx, y + ry, 1, 1); }); }); px += g[0].length + 1; });
    return w;
  }
  // a pixel map: rows of characters, each a key into `pal` (a '.' is transparent)
  function drawMap(c, map, x, y, pal, flip) {
    map.forEach((row, ry) => { const n = row.length; for (let rx = 0; rx < n; rx++) { const k = row[rx]; if (k === '.' || !pal[k]) continue; c.fillStyle = pal[k]; c.fillRect(x + (flip ? n - 1 - rx : rx), y + ry, 1, 1); } });
  }
})();
