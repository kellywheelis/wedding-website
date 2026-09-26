// CROSS THE PIAZZA — a Frogger for the museum's arcade. From the bottom of the Campo to the Duomo's door at
// the top, one hop at a time: four lanes of Vespas and Fiat 500s, a strip of pavement with a gelato cart, four
// lanes of piazza with tour groups, pigeons and a nonna, then the cathedral steps. The other half of the
// couple waits in the doorway. Three lives, a bonus that ticks down, points for every row gained.
// Sprites: assets/game/bride-topdown.png and groom-topdown.png, 9 frames of 32x32: idle/walk facing north,
// south, east, west, then knocked down. The hazards are the owner's sprites (vespa, fiat1-4, tourist1-2, nonna,
// pigeon, gelato, duomo); each has a drawn stand-in below that shows until its file loads, or if it is missing.
(function () {
  const W = 224, H = 288, ROW = 22, TOP = 24, ROWS = 12, COL = 16;
  const rowY = (r) => H - (Number(r) + 1) * ROW;                    // top of row r (0 = the start pavement, 11 = the Duomo); lane keys arrive as strings
  const C = { text: '#f4efe1', gold: '#e8c07a', dim: '#a79c85', burg: '#7a1a3c', red: '#c0392b', white: '#fbf7ee', street: '#4a4137', kerb: '#8a8378', line: '#d8ccb0', brick: '#a8503a', brick2: '#b8604a', brick3: '#8f4130', stone: '#e9dfc6', marble: '#f4efe1', dark: '#2b2520', cream: '#f3ecdc' };
  // rows: what runs along them, which way, how fast, and how far apart
  const LANES = {
    1: { kind: 'vespa', dir: -1, speed: 70, gap: 90, w: 24, h: 16 }, 2: { kind: 'fiat', dir: 1, speed: 46, gap: 100, w: 27, h: 18 }, 3: { kind: 'vespa', dir: 1, speed: 88, gap: 120, w: 24, h: 16 }, 4: { kind: 'fiat', dir: -1, speed: 52, gap: 84, w: 27, h: 18 },
    6: { kind: 'tour', dir: 1, speed: 24, gap: 140, w: 46, h: 20 }, 7: { kind: 'pigeon', dir: -1, speed: 40, gap: 70, w: 14, h: 10 }, 8: { kind: 'nonna', dir: 1, speed: 20, gap: 110, w: 14, h: 22 }, 9: { kind: 'tour', dir: -1, speed: 30, gap: 120, w: 46, h: 20 }
  };
  // ---- drawn stand-ins, shown until a sprite loads or if its file is missing
  const FIAT = ['......ccccccccc.......', '....ccwwwwwwwwwcc.....', '...ccwwccccccwwwcc....', '..cccccccccccccccccc..', '.cccccccccccccccccccc.', '.ccccccccccccccccccccc', '..eee.cccccccccc.eee..', '..eee............eee..'];
  const PIGEON = ['....ggg.....', '...ggggg....', '..gggggggg..', '.gggggggggg.', '..ggggggg...', '....oo......'];
  const TOURIST = ['..hhhh..', '.hhhhhh.', '..ssss..', '..ssss..', '.rrrrrr.', '.rrrrrr.', '.rrrrrr.', '..b..b..', '..b..b..', '..e..e..'];
  const NONNA = ['..kkkk..', '.kkkkkk.', '..ssss..', '..ssss..', 'wkkkkkkw', '.kkkkkk.', '.kkkkkk.', '.kkkkkk.', '.kkkkkk.', '..e..e..'];
  const CART = ['..rrwwrrwwrrww..', '.rrwwrrwwrrwwrr.', '.......e........', '.......e........', '..cccccccccccc..', '..cppppppppppc..', '..cccccccccccc..', '..cccccccccccc..', '...oo......oo...'];
  const PAL = { c: '#f3ecdc', w: '#d9e8ef', e: '#2b2520', g: '#8a8a94', o: '#d9a93f', h: '#c9b28a', s: '#f1c9a5', r: '#c0392b', b: '#3a5a8a', k: '#2b2520', p: '#eeb0b8' };
  const drawMap = (c, map, x, y, pal, flip) => map.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) { const k = row[rx]; if (k === '.' || !pal[k]) continue; c.fillStyle = pal[k]; c.fillRect(x + (flip ? row.length - 1 - rx : rx), y + ry, 1, 1); } });

  Arcade.games.piazza = { title: 'Cross the Piazza', w: W, h: H, create(api) {
    const pic = (n, fb) => api.image('/assets/game/' + n + '.png', fb);
    // the owner's sprites: four Fiats and two tourists for variety (each object picks one), the standing pigeon, the nonna, the cart, the Duomo door
    const ART = { vespa: pic('vespa', (c, x, y, w, h) => { c.fillStyle = C.red; c.fillRect(x + 2, y + 4, w - 4, h - 6); }), fiats: [1, 2, 3, 4].map((i) => pic('fiat' + i, (c, x, y, w, h, fl) => drawMap(c, FIAT, x + 1, y + 3, PAL, fl))),
      tourists: [1, 2].map((i) => pic('tourist' + i, (c, x, y, w, h, fl) => drawMap(c, TOURIST, x, y + 6, PAL, fl))), nonna: pic('nonna', (c, x, y, w, h, fl) => drawMap(c, NONNA, x + 4, y + 4, PAL, fl)),
      pigeon: pic('pigeon', (c, x, y, w, h, fl) => drawMap(c, PIGEON, x, y + 2, PAL, fl)), cart: pic('gelato', (c, x, y, w, h) => drawMap(c, CART, x, y, PAL)), duomo: pic('duomo') };
    // the top-down figures: 9 frames of 32x32 (idle/walk for north, south, east, west, then knocked down); code-drawn stand-ins until the sheets load
    const stand = (col) => (c, f, x, y) => { c.fillStyle = col; c.fillRect(x + 11, y + 8, 10, 20); c.fillStyle = '#f1c9a5'; c.fillRect(x + 12, y + 4, 8, 7); };
    const sheets = { bride: api.sheet('/assets/game/bride-topdown.png', 32, 32, 9, stand('#fbf5ea')), groom: api.sheet('/assets/game/groom-topdown.png', 32, 32, 9, stand('#2b2520')) };
    const S = {}, WON_TITLE = 'YOU MADE IT', OVER_TITLE = 'RUN OVER BY SIENA';
    function reset() {
      Object.assign(S, { boarded: false, mode: 'title', who: 'bride', sel: 0, t: 0, lives: 3, score: 0, bonus: 3000, best: 0, ready: 0, msg: null, msgT: 0,
        p: { col: 6, row: 0, x: 0, y: 0, fx: 0, fy: 0, hop: 0, dir: 'n', hit: 0, safe: 0, won: false }, lanes: {} });
      S.p.x = S.p.fx = colX(S.p.col); S.p.y = S.p.fy = rowY(0);
      Object.keys(LANES).forEach((r) => { const L = LANES[r]; S.lanes[r] = []; for (let x = -40; x < W + 40; x += L.gap) S.lanes[r].push({ x: x + Math.random() * 20, look: Math.floor(Math.random() * 4) }); });
    }
    const colX = (col) => col * COL;                                  // 14 columns of 16 px
    reset();
    const other = () => (S.who === 'bride' ? 'groom' : 'bride');
    const say = (m, t = 1.4) => { S.msg = m; S.msgT = t; };
    const hitBox = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    const hurt = () => { if (S.p.hit > 0) return; S.p.hit = 1.3; S.lives--; };

    function update(dt, input) {
      S.t += dt;
      if (Arcade.board.on) { Arcade.board.update(dt, input); return; }
      if ((S.mode === 'over' || S.mode === 'won') && !S.boarded) { S.boarded = true; Arcade.board.open('piazza', S.score, { title: S.mode === 'won' ? WON_TITLE : OVER_TITLE, sub: '' }); return; } const p = S.p;
      if (S.mode === 'title') { if (input.hit('start') || input.hit('jump')) S.mode = 'select'; return; }
      if (S.mode === 'select') {
        if (input.hit('left') || input.hit('right')) S.sel = 1 - S.sel;
        if (input.hit('start') || input.hit('jump')) { S.who = S.sel ? 'groom' : 'bride'; S.mode = 'ready'; S.ready = 1.4; }
        return;
      }
      if (S.mode === 'ready') { S.ready -= dt; if (S.ready <= 0) S.mode = 'play'; return; }
      if (S.mode === 'over' || S.mode === 'won') { if (input.hit('start') || input.hit('jump')) { const who = S.who; reset(); S.mode = 'select'; S.sel = who === 'groom' ? 1 : 0; } return; }
      if (S.msgT > 0) S.msgT -= dt; if (p.safe > 0) p.safe -= dt;
      if (S.bonus > 0) S.bonus = Math.max(0, S.bonus - 10 * dt);
      // ---- the hop
      if (p.hit > 0) { p.hit -= dt; if (p.hit <= 0) { if (S.lives <= 0) { S.mode = 'over'; return; } p.col = 6; p.row = 0; p.x = p.fx = colX(6); p.y = p.fy = rowY(0); p.hop = 0; p.dir = 'n'; p.safe = 1; } }   // a second's grace on respawn
      else if (p.hop > 0) { p.hop = Math.max(0, p.hop - dt / 0.12); const k = 1 - p.hop; p.x = p.fx + (colX(p.col) - p.fx) * k; p.y = p.fy + (rowY(p.row) - p.fy) * k; if (p.hop === 0) { p.x = colX(p.col); p.y = rowY(p.row); } }
      else {
        let dc = 0, dr = 0;
        if (input.hit('up')) { dr = 1; p.dir = 'n'; } else if (input.hit('down')) { dr = -1; p.dir = 's'; } else if (input.hit('left')) { dc = -1; p.dir = 'w'; } else if (input.hit('right')) { dc = 1; p.dir = 'e'; }
        if ((dc || dr) && p.col + dc >= 0 && p.col + dc <= 13 && p.row + dr >= 0 && p.row + dr <= 11) {
          p.fx = p.x; p.fy = p.y; p.col += dc; p.row += dr; p.hop = 1;
          if (p.row > S.best) { S.best = p.row; S.score += 10; }
        }
        if (p.row === 11 && p.hop === 0) { S.score += 1000 + Math.floor(S.bonus); p.won = true; S.mode = 'won'; }
      }
      // ---- the lanes
      Object.keys(LANES).forEach((r) => { const L = LANES[r]; let lane = S.lanes[r]; lane.forEach((o) => { o.x += L.dir * L.speed * dt; });
        // whatever has left the far side goes; a new one joins at the near side once there is a gap for it
        lane = S.lanes[r] = lane.filter((o) => o.x > -60 && o.x < W + 60);
        if (L.dir > 0) { const lo = Math.min(...lane.map((o) => o.x), Infinity); if (lo > -50 + L.gap) lane.push({ x: -50 - Math.random() * 30, look: Math.floor(Math.random() * 4) }); }
        else { const hi = Math.max(...lane.map((o) => o.x), -Infinity); if (hi < W + 50 - L.gap) lane.push({ x: W + 50 + Math.random() * 30, look: Math.floor(Math.random() * 4) }); } });
      // ---- collisions
      if (p.hit <= 0 && p.safe <= 0 && S.mode === 'play' && LANES[p.row]) {
        const L = LANES[p.row], px = p.x + 10, py = p.y + 6, pw = 12, ph = 12;
        S.lanes[p.row].forEach((o) => { if (hitBox(px, py, pw, ph, o.x + 2, rowY(p.row) + (ROW - L.h) / 2, L.w - 4, L.h)) { hurt(); say(L.kind === 'pigeon' ? 'PIGEONS!' : L.kind === 'nonna' ? 'MANGIA!' : L.kind === 'tour' ? 'SCUSI, SCUSI' : 'ATTENZIONE!', 1.3); } });
      }
    }

    // ---- drawing
    function ground(c) {
      c.fillStyle = C.dark; c.fillRect(0, 0, W, H);
      // the Duomo across the top two rows: striped marble, a doorway in the middle
      c.fillStyle = C.marble; c.fillRect(0, rowY(11), W, ROW); for (let y = rowY(11) + 3; y < rowY(11) + ROW; y += 6) { c.fillStyle = C.dark; c.fillRect(0, y, W, 2); }
      if (ART.duomo.ok) ART.duomo.draw(c, 112 - 19, TOP, 38, ROW * 2 + 2, false); else { c.fillStyle = C.burg; c.fillRect(100, rowY(11) - 2, 24, ROW + 2); c.fillStyle = C.dark; c.fillRect(102, rowY(11), 20, ROW); }
      c.fillStyle = C.stone; c.fillRect(0, rowY(10), W, ROW); c.fillStyle = '#cfc4a8'; for (let x = 0; x < W; x += 16) c.fillRect(x, rowY(10) + 10, 8, 1);   // the steps
      api.text(c, 'IL DUOMO', 8, rowY(10) + 3, '#8a7a4a');
      // the Campo: brick, in soft fans
      for (let r = 6; r <= 9; r++) { c.fillStyle = r % 2 ? C.brick : C.brick2; c.fillRect(0, rowY(r), W, ROW); c.fillStyle = C.brick3; for (let x = (r % 2) * 8; x < W; x += 16) c.fillRect(x, rowY(r) + 11, 8, 1); }
      // the pavement between, with the gelato cart
      c.fillStyle = C.stone; c.fillRect(0, rowY(5), W, ROW); c.fillStyle = C.kerb; c.fillRect(0, rowY(5) + ROW - 2, W, 2); c.fillRect(0, rowY(5), W, 1);
      ART.cart.draw(c, 192, rowY(5) - 6, null, 28, false);                                   // the cart, at its own proportion, its canopy just above the pavement
      api.text(c, 'PIAZZA DEL CAMPO', 8, rowY(5) + 8, C.dim);
      // the streets
      c.fillStyle = C.street; c.fillRect(0, rowY(4), W, ROW * 4);
      for (let r = 1; r < 4; r++) { c.fillStyle = C.line; for (let x = 0; x < W; x += 14) c.fillRect(x, rowY(r) - 1, 7, 1); }
      c.fillStyle = C.kerb; c.fillRect(0, rowY(4), W, 2); c.fillRect(0, rowY(1) + ROW - 2, W, 2);
      c.fillStyle = C.stone; c.fillRect(0, rowY(0), W, ROW);
      api.text(c, 'VIA DI CITTA', 8, rowY(0) + 8, C.dim);
    }
    function lanes(c) {
      Object.keys(LANES).forEach((r) => { const L = LANES[r], y = rowY(r) + (ROW - L.h) / 2, flip = L.dir > 0;
        S.lanes[r].forEach((o) => {
          if (L.kind === 'vespa') ART.vespa.draw(c, o.x, y, L.w, L.h, !flip);
          else if (L.kind === 'fiat') ART.fiats[o.look].draw(c, o.x, y, L.w, L.h, !flip);      // the Fiats face right as drawn
          else if (L.kind === 'tour') [0, 12, 24, 36].forEach((dx, i) => ART.tourists[(o.look + i) % 2].draw(c, o.x + dx, y - 1 + (Math.floor(S.t * 4 + i) % 2), 10, 20, !flip));
          else if (L.kind === 'nonna') ART.nonna.draw(c, o.x, y, null, 22, !flip);          // so does the nonna
          else if (L.kind === 'pigeon') ART.pigeon.draw(c, o.x, y + (Math.floor(S.t * 6) % 2), 14, 10, !flip);
        }); });
    }
    function hud(c) {
      c.fillStyle = C.burg; c.fillRect(0, 0, W, TOP);
      api.text(c, 'SCORE ' + Math.floor(S.score), 4, 3, C.text); api.text(c, 'BONUS ' + Math.floor(S.bonus), 4, 13, C.gold);
      for (let i = 0; i < 3; i++) { c.fillStyle = i < S.lives ? C.red : '#4a2a2a'; c.fillRect(W - 8 - i * 8, 5, 5, 4); c.fillRect(W - 7 - i * 8, 4, 3, 1); }
      api.text(c, 'CROSS THE PIAZZA', 112, 8, C.text, 'center');
    }
    const frameFor = (p) => p.hit > 0 ? 8 : { n: 0, s: 2, e: 4, w: 6 }[p.dir] + (p.hop > 0 ? 1 : 0);
    function scene(c) {
      ground(c); lanes(c);
      sheets[other()].draw(c, 2, 96, rowY(11) - 6, false);
      const p = S.p; if (!(p.safe > 0 && Math.floor(S.t * 8) % 2)) sheets[S.who].draw(c, frameFor(p), Math.round(p.x) - 8, Math.round(p.y) - 8, false);   // flickers while invincible
      hud(c);
      if (S.msgT > 0 && S.msg) { const y = Math.max(TOP + 4, p.y - 14); c.fillStyle = C.white; c.fillRect(p.x - 22, y - 2, 60, 10); api.text(c, S.msg, p.x + 8, y, C.burg, 'center'); }
    }
    function big(c, s, x, y, col, scale = 2) { c.save(); c.translate(x, y); c.scale(scale, scale); api.text(c, s, 0, 0, col, 'center'); c.restore(); }
    function drawTitle(c, t) {
      c.fillStyle = C.dark; c.fillRect(0, 0, W, H); c.fillStyle = C.burg; c.fillRect(0, 0, W, 10); c.fillRect(0, H - 10, W, 10);
      big(c, 'CROSS THE', W / 2, 46, C.gold, 3); big(c, 'PIAZZA', W / 2, 72, C.gold, 3);
      api.text(c, 'ANTHONY ALVAREZ & KELLY WHEELIS', W / 2, 104, C.dim, 'center');
      c.fillStyle = C.brick; c.fillRect(0, 124, W, 60); c.fillStyle = C.brick3; for (let x = 0; x < W; x += 16) { c.fillRect(x, 140, 8, 1); c.fillRect(x + 8, 160, 8, 1); }
      const vx = ((t * 70) % 300) - 40; ART.vespa.draw(c, vx, 150, 24, 16, false);
      const fx = W - ((t * 50) % 300); ART.fiats[2].draw(c, fx, 126, 27, 18, true);
      sheets.bride.draw(c, 2 + (Math.floor(t * 5) % 2), 84, 188, false); sheets.groom.draw(c, 2 + (Math.floor(t * 5) % 2), 116, 188, false);   // facing out
      api.text(c, 'FROM THE CAMPO TO THE DUOMO,', W / 2, 228, C.text, 'center'); api.text(c, 'ONE HOP AT A TIME.', W / 2, 238, C.text, 'center');
      if (Math.floor(t * 2) % 2) api.text(c, 'PRESS START', W / 2, 256, C.gold, 'center');
      api.text(c, (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) ? 'THE BUTTONS HOP' : 'ARROWS HOP', W / 2, 270, C.dim, 'center');
    }
    function draw(c) {
      drawGame(c); Arcade.board.draw(c);
    }
    function drawGame(c) {
      if (S.mode === 'title') { drawTitle(c, S.t); return; }
      if (S.mode === 'select') {
        c.fillStyle = C.dark; c.fillRect(0, 0, W, H); big(c, 'CHOOSE YOUR', W / 2, 60, C.gold); big(c, 'PLAYER', W / 2, 80, C.gold);
        [['bride', 64, 'THE BRIDE'], ['groom', 160, 'THE GROOM']].forEach(([who, x, label], i) => {
          if (S.sel === i) { c.fillStyle = C.burg; c.fillRect(x - 24, 120, 48, 60); c.strokeStyle = C.gold; c.lineWidth = 1; c.strokeRect(x - 23.5, 120.5, 47, 59); }
          sheets[who].draw(c, S.sel === i ? 2 + (Math.floor(S.t * 5) % 2) : 2, x - 16, 128, false);
          api.text(c, label, x, 166, S.sel === i ? C.text : C.dim, 'center');
        });
        api.text(c, 'LEFT / RIGHT · THEN START', W / 2, 220, C.dim, 'center'); return;
      }
      scene(c);
      if (S.mode === 'ready') { c.fillStyle = 'rgba(20,12,6,.6)'; c.fillRect(0, 120, W, 40); big(c, 'READY?', W / 2, 132, C.gold); }
      if (S.mode === 'over' && !Arcade.board.on) { c.fillStyle = 'rgba(20,12,6,.8)'; c.fillRect(0, 100, W, 80); big(c, 'RUN OVER', W / 2, 112, C.red); big(c, 'BY SIENA', W / 2, 132, C.red); api.text(c, 'SCORE ' + Math.floor(S.score) + ' · START TO TRY AGAIN', W / 2, 160, C.text, 'center'); }
      if (S.mode === 'won' && !Arcade.board.on) { c.fillStyle = 'rgba(20,12,6,.8)'; c.fillRect(0, 96, W, 96); big(c, 'YOU MADE IT!', W / 2, 108, C.gold); api.text(c, 'THE DUOMO, AND THE BEST', W / 2, 134, C.text, 'center'); api.text(c, 'GELATO IN SIENA IS NEXT DOOR', W / 2, 146, C.text, 'center'); api.text(c, 'SCORE ' + Math.floor(S.score), W / 2, 166, C.gold, 'center'); api.text(c, 'START TO CROSS AGAIN', W / 2, 180, C.dim, 'center'); }
    }
    return { update, draw, drawTitle, debug: { S, start(who) { reset(); S.who = who || 'bride'; S.mode = 'play'; } } };
  } };
})();
