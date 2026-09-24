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
  window.addEventListener('keydown', (e) => { if (!Arcade.open) return; const k = KEYS[e.key]; if (k) { down(k); e.preventDefault(); } if (e.key === 'Escape') Arcade.close(); });
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
      </div>`;
    const css = document.createElement('style');
    css.textContent = `
      #arcade{position:fixed;inset:0;z-index:90;background:rgba(14,9,5,.94);display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:12px;user-select:none;-webkit-user-select:none}
      #arcade.on{display:flex}
      #arcade .ar-frame{padding:10px;background:linear-gradient(135deg,#8e6e2b,#e6c37a 30%,#9a7020 50%,#f0d693 70%,#8e6e2b);box-shadow:0 20px 60px rgba(0,0,0,.7),inset 0 0 0 1px rgba(70,48,8,.6)}
      #arcade .ar-screen{display:block;background:#000;image-rendering:pixelated;image-rendering:crisp-edges}
      #arcade .ar-x{position:absolute;right:14px;top:calc(12px + env(safe-area-inset-top));width:40px;height:40px;border-radius:50%;border:1px solid rgba(232,192,122,.7);background:rgba(26,18,8,.7);color:#F2E6C9;font:22px/38px Georgia,serif;cursor:pointer}
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
    root.querySelector('.ar-x').addEventListener('click', Arcade.close);
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
  function loop(now) {
    raf = requestAnimationFrame(loop);
    acc += Math.min(0.1, (now - last) / 1000); last = now;
    while (acc >= STEP) { game.inst.update(STEP, input); Object.keys(pressed).forEach((k) => { delete pressed[k]; }); acc -= STEP; }
    game.inst.draw(ctx);
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
      return { get ok() { return !!box; }, draw(c, x, y, w, h, flip) {
        if (!box) { if (fallback) fallback(c, x, y, w, h); return; }
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
  Arcade.step = (steps, keys) => { if (!game) return; Object.keys(held).forEach((k) => { held[k] = false; }); (keys || []).forEach((k) => { held[k] = true; pressed[k] = true; }); for (let i = 0; i < steps; i++) { game.inst.update(STEP, input); Object.keys(pressed).forEach((k) => { delete pressed[k]; }); } (keys || []).forEach((k) => { held[k] = false; }); };
  // ---- the menu: the cabinet's list of games. Registered games are playable; the planned ones show as coming soon.
  Arcade.menuList = [['italy', 'Getting to Italy'], ['piazza', 'Cross the Piazza'], ['bouquet', 'Catch the Bouquet'], ['seating', 'The Seating Chart']];
  Arcade.games.menu = { title: 'The Arcade', w: 224, h: 288, create(api) {
    let sel = 0, t = 0; const titles = {};
    const playable = () => Arcade.menuList.filter(([id]) => Arcade.games[id]);
    const list = (c, y0, cursor) => Arcade.menuList.forEach(([id, name], i) => {
      const on = !!Arcade.games[id], y = y0 + i * 26;
      if (cursor && on && playable()[sel] && playable()[sel][0] === id) { c.fillStyle = '#7a1a3c'; c.fillRect(28, y - 5, 168, 16); api.text(c, '>', 36, y, '#e8c07a'); }
      api.text(c, name, 112, y, on ? '#f4efe1' : '#5c534a', 'center');
      if (!on) api.text(c, 'COMING SOON', 112, y + 8, '#5c534a', 'center');
    });
    const header = (c) => { c.fillStyle = '#140c06'; c.fillRect(0, 0, 224, 288); c.fillStyle = '#7a1a3c'; c.fillRect(0, 0, 224, 10); c.fillRect(0, 278, 224, 10);
      c.save(); c.translate(112, 40); c.scale(3, 3); api.text(c, 'THE ARCADE', 0, 0, '#e8c07a', 'center'); c.restore();
      api.text(c, "ANTHONY'S COLLECTION · PLAYABLE PIECES", 112, 66, '#a79c85', 'center'); };
    return {
      update(dt, input) { t += dt; const p = playable(); if (!p.length) return;
        if (input.hit('up')) sel = (sel + p.length - 1) % p.length; if (input.hit('down')) sel = (sel + 1) % p.length;
        if (input.hit('start') || input.hit('jump')) Arcade.launch(p[sel][0], { back: 'menu' }); },
      draw(c) { header(c); list(c, 104, true); if (Math.floor(t * 2) % 2) api.text(c, 'UP / DOWN · START TO PLAY', 112, 236, '#e8c07a', 'center'); api.text(c, 'ESC RETURNS HERE', 112, 256, '#a79c85', 'center'); },
      // the frame's loop: the list, then each game's own title in turn, six seconds apiece
      drawTitle(c, tt) { const ids = playable().map(([id]) => id), k = Math.floor(tt / 6) % (ids.length + 1);
        if (k === 0) { header(c); list(c, 104, false); if (Math.floor(tt * 2) % 2) api.text(c, 'PRESS START', 112, 236, '#e8c07a', 'center'); return; }
        const id = ids[k - 1]; if (!titles[id]) titles[id] = Arcade.games[id].create(Arcade.api(Arcade.games[id])); titles[id].drawTitle(c, tt); }
    };
  } };
  Arcade.attract = (id, fps) => { const def = Arcade.games[id]; return def ? Arcade.api(def).attract(fps) : null; };

  // ---- a 4x6 pixel font: capitals, digits and a little punctuation
  const FONT = {
    A: '0110 1001 1001 1111 1001 1001', B: '1110 1001 1110 1001 1001 1110', C: '0111 1000 1000 1000 1000 0111', D: '1110 1001 1001 1001 1001 1110', E: '1111 1000 1110 1000 1000 1111', F: '1111 1000 1110 1000 1000 1000', G: '0111 1000 1011 1001 1001 0111', H: '1001 1001 1111 1001 1001 1001', I: '111 010 010 010 010 111', J: '0011 0001 0001 0001 1001 0110', K: '1001 1010 1100 1010 1001 1001', L: '1000 1000 1000 1000 1000 1111', M: '10001 11011 10101 10001 10001 10001', N: '1001 1101 1011 1001 1001 1001', O: '0110 1001 1001 1001 1001 0110', P: '1110 1001 1110 1000 1000 1000', Q: '0110 1001 1001 1001 1011 0111', R: '1110 1001 1110 1010 1001 1001', S: '0111 1000 0110 0001 0001 1110', T: '11111 00100 00100 00100 00100 00100', U: '1001 1001 1001 1001 1001 0110', V: '1001 1001 1001 1001 0110 0110', W: '10001 10001 10101 10101 11011 10001', X: '1001 1001 0110 0110 1001 1001', Y: '10001 01010 00100 00100 00100 00100', Z: '1111 0001 0010 0100 1000 1111',
    0: '0110 1001 1011 1101 1001 0110', 1: '010 110 010 010 010 111', 2: '0110 1001 0001 0110 1000 1111', 3: '1110 0001 0110 0001 0001 1110', 4: '1001 1001 1111 0001 0001 0001', 5: '1111 1000 1110 0001 0001 1110', 6: '0111 1000 1110 1001 1001 0110', 7: '1111 0001 0010 0100 0100 0100', 8: '0110 1001 0110 1001 1001 0110', 9: '0110 1001 0111 0001 0001 1110',
    ' ': '00 00 00 00 00 00', '.': '0 0 0 0 0 1', ',': '0 0 0 0 1 1', ':': '0 1 0 0 1 0', '!': '1 1 1 1 0 1', '?': '0110 1001 0010 0100 0000 0100', '-': '000 000 111 000 000 000', "'": '1 1 0 0 0 0', '·': '0 0 1 0 0 0', '&': '0100 1010 0100 1011 1010 0101', '/': '0001 0001 0010 0100 1000 1000', '>': '100 010 001 001 010 100', '<': '001 010 100 100 010 001'
  };
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
