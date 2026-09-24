// CATCH THE BOUQUET — a catching game for the museum's arcade. Night on the terrace above the Campo: bouquets
// come down out of the sky, and the odd ring, a glass of champagne, a slice of cake and a pigeon. Run left and
// right and catch the good things; don't be under the bad ones. Forty-five seconds, quickening; three lives.
// Sprites: the side-view sheets from Getting to Italy (bride.png / groom.png), and the bouquet and ring files.
(function () {
  const W = 224, H = 288, FLOOR = 262, TOP = 24, LEN = 45;
  const C = { text: '#f4efe1', gold: '#e8c07a', dim: '#a79c85', burg: '#7a1a3c', red: '#c0392b', white: '#fbf7ee', sky: '#140c06', sky2: '#2a1a2e', brick: '#a8503a', brick3: '#8f4130', stone: '#e9dfc6', dark: '#2b2520' };
  const GLASS = ['.wwwwww.', '.wyyyyw.', '.wyyyyw.', '..wyyw..', '...ww...', '...ww...', '...ww...', '..wwww..'];
  const CAKE = ['....pp....', '...pppp...', '..cccccc..', '..cppppc..', '.cccccccc.', '.cppppppc.', 'cccccccccc', 'cppppppppc', 'cccccccccc'];
  const PIGEON = ['....ggg.....', '...ggggg....', '..gggggggg..', '.gggggggggg.', '..ggggggg...', '....oo......'];
  const PAL = { w: '#d9e8ef', y: '#f3dc9a', c: '#f3ecdc', p: '#eeb0b8', g: '#8a8a94', o: '#d9a93f' };
  const drawMap = (c, map, x, y, pal) => map.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) { const k = row[rx]; if (k === '.' || !pal[k]) continue; c.fillStyle = pal[k]; c.fillRect(x + rx, y + ry, 1, 1); } });
  // what falls: kind, how often, how big, what it is worth (or costs)
  const KINDS = [['bouquet', 42, 16, 18, 100], ['ring', 8, 14, 16, 300], ['glass', 20, 7, 20, 50], ['cake', 18, 16, 16, -1], ['pigeon', 12, 18, 14, -1]];

  Arcade.games.bouquet = { title: 'Catch the Bouquet', w: W, h: H, create(api) {
    const pic = (n, fb) => api.image('/assets/game/' + n + '.png', fb);
    const ART = { bouquet: pic('bouquet', (c, x, y) => { c.fillStyle = '#eeb0b8'; c.fillRect(x + 3, y, 10, 8); c.fillStyle = '#4a6a34'; c.fillRect(x + 7, y + 8, 2, 10); }), ring: pic('ring', (c, x, y) => { c.fillStyle = C.gold; c.fillRect(x + 2, y + 4, 10, 10); c.fillStyle = C.sky; c.fillRect(x + 5, y + 7, 4, 4); }),
      glass: pic('champagne', (c, x, y) => drawMap(c, GLASS, x, y, PAL)), cake: pic('cake', (c, x, y) => drawMap(c, CAKE, x, y, PAL)), pigeon: pic('pigeon-flying', (c, x, y) => drawMap(c, PIGEON, x, y, PAL)) };
    const stand = (col) => (c, f, x, y) => { c.fillStyle = col; c.fillRect(x + 11, y + 8, 10, 20); c.fillStyle = '#f1c9a5'; c.fillRect(x + 12, y + 4, 8, 7); };
    const sheets = { bride: api.sheet('/assets/game/bride.png', 32, 32, 9, stand('#fbf5ea')), groom: api.sheet('/assets/game/groom.png', 32, 32, 9, stand('#2b2520')) };
    const S = {};
    function reset() { Object.assign(S, { mode: 'title', who: 'bride', sel: 0, t: 0, lives: 3, score: 0, caught: 0, left: LEN, ready: 0, msg: null, msgT: 0, items: [], spawn: 1, p: { x: 112, dir: 1, anim: 0, hit: 0, moving: false } }); }
    reset();
    const other = () => (S.who === 'bride' ? 'groom' : 'bride');
    const say = (m, t = 1) => { S.msg = m; S.msgT = t; };
    const pickKind = () => { const total = KINDS.reduce((a, k) => a + k[1], 0); let r = Math.random() * total; return KINDS.find((k) => (r -= k[1]) < 0) || KINDS[0]; };

    function update(dt, input) {
      S.t += dt; const p = S.p;
      if (S.mode === 'title') { if (input.hit('start') || input.hit('jump')) S.mode = 'select'; return; }
      if (S.mode === 'select') { if (input.hit('left') || input.hit('right')) S.sel = 1 - S.sel; if (input.hit('start') || input.hit('jump')) { S.who = S.sel ? 'groom' : 'bride'; S.mode = 'ready'; S.ready = 3.2; } return; }
      if (S.mode === 'ready') { S.ready -= dt; if (S.ready <= 0 || input.hit('start') || input.hit('jump')) S.mode = 'play'; return; }
      if (S.mode === 'over' || S.mode === 'won') { if (input.hit('start') || input.hit('jump')) { const who = S.who; reset(); S.mode = 'select'; S.sel = who === 'groom' ? 1 : 0; } return; }
      if (S.msgT > 0) S.msgT -= dt;
      S.left -= dt; if (S.left <= 0) { S.left = 0; S.mode = 'won'; return; }
      const pace = 1 + (LEN - S.left) / LEN;                            // everything quickens over the round
      // the player
      if (p.hit > 0) p.hit -= dt;
      else { p.moving = false; if (input.is('left')) { p.x -= 110 * dt; p.dir = -1; p.moving = true; } if (input.is('right')) { p.x += 110 * dt; p.dir = 1; p.moving = true; } p.x = Math.max(12, Math.min(W - 12, p.x)); if (p.moving) p.anim += dt * 8; }
      // what falls
      S.spawn -= dt; if (S.spawn <= 0) { S.spawn = (0.95 - 0.45 * (pace - 1)) + Math.random() * 0.3; const k = pickKind(); S.items.push({ kind: k[0], x: 10 + Math.random() * (W - 20 - k[2]), y: TOP - 10, w: k[2], h: k[3], v: (55 + Math.random() * 35) * pace, worth: k[4], drift: (Math.random() - 0.5) * 20 }); }
      S.items.forEach((it) => { it.y += it.v * dt; it.x += it.drift * dt; });
      // catches and misses
      const px = p.x - 11, py = FLOOR - 30, pw = 22, ph = 30;
      S.items.forEach((it) => {
        if (it.done) return;
        if (it.x < px + pw && it.x + it.w > px && it.y < py + ph && it.y + it.h > py && p.hit <= 0) {
          it.done = true;
          if (it.worth > 0) { S.score += it.worth; if (it.kind === 'bouquet') S.caught++; say(it.kind === 'ring' ? 'A RING!' : it.kind === 'glass' ? 'CIN CIN' : 'CAUGHT!', 0.8); }
          else { S.lives--; p.hit = 1; say(it.kind === 'pigeon' ? 'PIGEON!' : 'CAKE!', 1); if (S.lives <= 0) S.mode = 'over'; }
        } else if (it.y > FLOOR) { it.done = true; if (it.kind === 'bouquet') say('MISSED', 0.5); }
      });
      S.items = S.items.filter((it) => !it.done);
    }

    function backdrop(c) {
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C.sky); g.addColorStop(1, C.sky2); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = C.white; [[20, 40], [60, 70], [120, 36], [170, 58], [200, 90], [40, 110], [150, 120], [90, 150], [210, 140], [30, 170]].forEach(([x, y]) => c.fillRect(x, y, 1, 1));
      c.fillStyle = '#f3dc9a'; c.beginPath(); c.arc(196, 132, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = C.sky; c.beginPath(); c.arc(199, 130, 6, 0, Math.PI * 2); c.fill();   // a crescent moon
      // the terrace: a stone balustrade and the Campo's brick below
      c.fillStyle = C.stone; c.fillRect(0, FLOOR - 4, W, 4); for (let x = 4; x < W; x += 12) { c.fillRect(x, FLOOR - 16, 4, 12); } c.fillRect(0, FLOOR - 18, W, 3);
      c.fillStyle = C.brick; c.fillRect(0, FLOOR, W, H - FLOOR); c.fillStyle = C.brick3; for (let x = 0; x < W; x += 16) c.fillRect(x, FLOOR + 12, 8, 1);
    }
    function hud(c) {
      c.fillStyle = C.burg; c.fillRect(0, 0, W, TOP);
      api.text(c, 'SCORE ' + Math.floor(S.score), 4, 3, C.text); api.text(c, 'BOUQUETS ' + S.caught, 4, 13, C.gold);
      api.text(c, Math.ceil(S.left) + 'S', 112, 8, C.text, 'center');
      for (let i = 0; i < 3; i++) { c.fillStyle = i < S.lives ? C.red : '#4a2a2a'; c.fillRect(W - 8 - i * 8, 5, 5, 4); c.fillRect(W - 7 - i * 8, 4, 3, 1); }
    }
    function scene(c) {
      backdrop(c);
      S.items.forEach((it) => ART[it.kind].draw(c, Math.round(it.x), Math.round(it.y), it.w, it.h, false));
      const p = S.p, frame = p.hit > 0 ? 6 : p.moving ? 1 + (Math.floor(p.anim) % 2) : 0;
      sheets[S.who].draw(c, frame, Math.round(p.x) - 16, FLOOR - 32, p.dir < 0);
      hud(c);
      if (S.msgT > 0 && S.msg) { const y = FLOOR - 46; c.fillStyle = C.white; c.fillRect(p.x - 26, y - 2, 52, 10); api.text(c, S.msg, p.x, y, C.burg, 'center'); }
    }
    function big(c, s, x, y, col, scale = 2) { c.save(); c.translate(x, y); c.scale(scale, scale); api.text(c, s, 0, 0, col, 'center'); c.restore(); }
    function drawTitle(c, t) {
      backdrop(c); c.fillStyle = C.burg; c.fillRect(0, 0, W, 10);
      big(c, 'CATCH THE', W / 2, 46, C.gold, 3); big(c, 'BOUQUET', W / 2, 72, C.gold, 3);
      api.text(c, 'ANTHONY ALVAREZ & KELLY WHEELIS', W / 2, 104, C.dim, 'center');
      const by = 130 + Math.abs(Math.sin(t * 2)) * -30; ART.bouquet.draw(c, 104, by, 16, 18, false);
      sheets.bride.draw(c, 7, 60, FLOOR - 32, false); sheets.groom.draw(c, 1 + (Math.floor(t * 6) % 2), 130 + Math.sin(t * 2) * 20, FLOOR - 32, Math.cos(t * 2) < 0);
      api.text(c, 'RUN LEFT AND RIGHT. CATCH THE FLOWERS.', W / 2, 200, C.text, 'center'); api.text(c, 'NOT THE CAKE. NOT THE PIGEON.', W / 2, 210, C.text, 'center');
      if (Math.floor(t * 2) % 2) api.text(c, 'PRESS START', W / 2, 232, C.gold, 'center');
    }
    function draw(c) {
      if (S.mode === 'title') { drawTitle(c, S.t); return; }
      if (S.mode === 'select') {
        c.fillStyle = C.sky; c.fillRect(0, 0, W, H); big(c, 'CHOOSE YOUR', W / 2, 60, C.gold); big(c, 'PLAYER', W / 2, 80, C.gold);
        [['bride', 64, 'THE BRIDE'], ['groom', 160, 'THE GROOM']].forEach(([who, x, label], i) => {
          if (S.sel === i) { c.fillStyle = C.burg; c.fillRect(x - 24, 120, 48, 60); c.strokeStyle = C.gold; c.lineWidth = 1; c.strokeRect(x - 23.5, 120.5, 47, 59); }
          sheets[who].draw(c, S.sel === i ? 1 + (Math.floor(S.t * 6) % 2) : 0, x - 16, 128, false);
          api.text(c, label, x, 166, S.sel === i ? C.text : C.dim, 'center');
        });
        api.text(c, 'LEFT / RIGHT · THEN START', W / 2, 220, C.dim, 'center'); return;
      }
      scene(c);
      if (S.mode === 'ready') {
        c.fillStyle = 'rgba(20,12,6,.88)'; c.fillRect(16, 78, W - 32, 132); c.strokeStyle = C.gold; c.lineWidth = 1; c.strokeRect(16.5, 78.5, W - 33, 131);
        api.text(c, 'CATCH', 112, 88, C.gold, 'center');
        ART.bouquet.draw(c, 56, 100, 16, 18, false); ART.ring.draw(c, 104, 101, 14, 16, false); ART.glass.draw(c, 156, 99, 7, 20, false);
        api.text(c, 'BOUQUET', 64, 122, C.text, 'center'); api.text(c, 'RING', 111, 122, C.text, 'center'); api.text(c, 'CHAMPAGNE', 160, 122, C.text, 'center');
        api.text(c, 'DODGE', 112, 140, C.red, 'center');
        ART.cake.draw(c, 77, 149, 16, 16, false); ART.pigeon.draw(c, 127, 150, 18, 14, false);
        api.text(c, 'CAKE', 85, 168, C.text, 'center'); api.text(c, 'PIGEON', 136, 168, C.text, 'center');
        api.text(c, 'THEY COST A LIFE', 112, 180, C.dim, 'center');
        big(c, 'READY?', W / 2, 194, C.gold);
      }
      if (S.mode === 'over') { c.fillStyle = 'rgba(20,12,6,.8)'; c.fillRect(0, 100, W, 80); big(c, 'CAKED', W / 2, 112, C.red); api.text(c, 'SCORE ' + Math.floor(S.score) + ' · ' + S.caught + ' BOUQUETS', W / 2, 140, C.text, 'center'); api.text(c, 'START TO TRY AGAIN', W / 2, 160, C.dim, 'center'); }
      if (S.mode === 'won') { c.fillStyle = 'rgba(20,12,6,.8)'; c.fillRect(0, 96, W, 96); big(c, 'TIME!', W / 2, 108, C.gold); api.text(c, S.caught + ' BOUQUETS · SCORE ' + Math.floor(S.score), W / 2, 134, C.text, 'center'); api.text(c, S.caught >= 12 ? "YOU'RE NEXT." : S.caught >= 6 ? 'A GOOD OMEN.' : 'THE PIGEONS WON.', W / 2, 150, C.gold, 'center'); api.text(c, 'START TO PLAY AGAIN', W / 2, 176, C.dim, 'center'); }
    }
    return { update, draw, drawTitle, debug: { S, start(who) { reset(); S.who = who || 'bride'; S.mode = 'play'; } } };
  } };
})();
