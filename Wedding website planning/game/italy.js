// GETTING TO ITALY — a barrel-jumper for the museum's arcade. Choose the bride or the groom, climb the
// terminal from Departures to the villa gate, collect the passport, the ticket and the bouquet (or the ring), and dodge what
// rolls down: suitcases, cancelled flights, rain and a Vespa. Reach the other half of the couple
// with all three and you have made it to the wedding.
// Sprites: assets/game/bride.png and groom.png, 8 frames of 16x24 in a row (stand, walk 1, walk 2, climb 1,
// climb 2, jump, hit, win). Until those exist, the figures are drawn in code.
(function () {
  const W = 224, H = 288;
  const C = { bg: '#140c06', girder: '#c9a667', girderDk: '#8e6e2b', rivet: '#f2e6c9', ladder: '#f4efe1', text: '#f4efe1', gold: '#e8c07a', dim: '#a79c85', burg: '#7a1a3c', red: '#c0392b', white: '#fbf7ee', grey: '#b8b2a6', green: '#8fbf6a', brown: '#6b4423', tan: '#b58a55' };
  // the terminal: platforms from Departures (0) up to the villa gate (5), and the ladders between them
  const PLATS = [{ y: 270, x0: 0, x1: 224 }, { y: 229, x0: 0, x1: 212 }, { y: 188, x0: 12, x1: 224 }, { y: 147, x0: 0, x1: 212 }, { y: 106, x0: 12, x1: 224 }, { y: 65, x0: 72, x1: 152 }];   // 41 apart: room for a 32-px figure and a 27-px jump
  const LADDERS = [{ x: 196, from: 0 }, { x: 36, from: 1 }, { x: 192, from: 2 }, { x: 40, from: 3 }, { x: 100, from: 4 }];
  const ITEMS = [{ id: 'passport', plat: 1, x: 150 }, { id: 'ticket', plat: 3, x: 100 }, { id: 'outfit', plat: 4, x: 50 }];
  const PARTNER_X = 134;

  // ---- placeholder figures, drawn in code: 16 x 24, in a small palette
  const BRIDE = { h: '#e9c56a', s: '#f1c9a5', d: '#fbf5ea', t: '#e8c07a', v: '#ffffff', e: '#2b2520', l: '#e9d9c2' };
  const GROOM = { h: '#2b1a0e', s: '#f1c9a5', d: '#2b2520', t: '#f4efe1', v: '#7a1a3c', e: '#2b2520', l: '#2b2520' };
  const HEAD_B = ['.....vvvvvv.....', '....vhhhhhhv....', '...vhhhhhhhhv...', '...vhsssssshv...', '..vhhsesssehhv..', '..vhhssssssshv..', '..vhhhsssshhhv..', '..vhh.ssss.hhv..'];   // a veil over long blonde hair
  const HEAD_G = ['....hhhhhhhh....', '...hhhhhhhhhh...', '...hhhhhhhhhh...', '...hhssssssh....', '...hhsesssehh...', '....ssssssss....', '....hsssssh.....', '.....ssss.......'];
  const BODY_B = ['..hh.tddddt.hh..', '.hh.sddddddds.hh', '.hhs.dddddd.shh.', '..h..dddddd..h..', '.....dddddd.....', '....dddddddd....', '...dddddddddd...', '..dddddddddddd..', '..dddddddddddd..', '.dddddddddddddd.'];
  const BODY_G = ['.....tvvvvt.....', '....sddttdds....', '...s.ddttdd.s...', '.....ddttdd.....', '.....dddddd.....', '.....dddddd.....', '.....dddddd.....', '.....dddddd.....', '.....dddddd.....', '.....dddddd.....'];
  const LEGS = { stand: ['.....ll..ll.....', '.....ll..ll.....', '.....ll..ll.....', '.....ll..ll.....', '....eee..eee....', '....eee..eee....'],
    walk1: ['....ll....ll....', '....ll....ll....', '...ll......ll...', '...ll......ll...', '..eee......eee..', '..eee......eee..'],
    walk2: ['......llll......', '......llll......', '......llll......', '......llll......', '.....eeeeee.....', '.....eeeeee.....'],
    jump: ['.....ll..ll.....', '....ll....ll....', '....ll....ll....', '.....ll..ll.....', '....eee..eee....', '................'] };
  function figure(c, who, frame, x, y, flip) {
    const pal = who === 'bride' ? BRIDE : GROOM, head = who === 'bride' ? HEAD_B : HEAD_G, body = (who === 'bride' ? BODY_B : BODY_G).slice();
    let legs = LEGS.stand, dy = 0;
    if (frame === 1) legs = LEGS.walk1; if (frame === 2) legs = LEGS.walk2; if (frame === 5) legs = LEGS.jump;
    if (frame === 3 || frame === 4) { body[0] = frame === 3 ? '..s..dddddd..s..' : '.....dddddd.....'; body[1] = frame === 3 ? '..s.dddddddd.s..' : '..s.dddddddd.s..'; body[2] = '....dddddddd....'; legs = frame === 3 ? LEGS.walk1 : LEGS.walk2; }
    if (frame === 7) { body[0] = '..s.dddddddd.s..'; body[1] = '..s..dddddd..s..'; body[2] = '.....dddddd.....'; }
    if (frame === 6) { dy = 6; }
    const map = [...head, ...body, ...legs];
    if (frame === 6) { const c2 = c; c2.save(); c2.translate(x + 8, y + 12 + dy); c2.rotate(flip ? -1.2 : 1.2); c2.translate(-8, -12); drawMap(c2, map, 0, 0, pal, flip); c2.restore(); return; }
    drawMap(c, map, x, y + dy, pal, flip);
  }
  function drawMap(c, map, x, y, pal, flip) {
    map.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) { const k = row[rx]; if (k === '.' || !pal[k]) continue; c.fillStyle = pal[k]; c.fillRect(x + (flip ? row.length - 1 - rx : rx), y + ry, 1, 1); } });
  }
  // the small things
  const SUITCASE = ['.....eeee.....', '.....e..e.....', 'bbbbbbbbbbbbbb', 'bttttttttttttb', 'bbbbbbbbbbbbbb', 'bttttttttttttb', 'bbbbbbbbbbbbbb', 'bttttttttttttb', 'bbbbbbbbbbbbbb', '.ee........ee.'];
  const PLANE = ['.......w........', 'wwwwwwwwwwwww...', 'wrwwrwwwwwwwwwww', 'wwrrwwwwwwwwwww.', 'wrwwrwwwwwww....', '.....ww.........', '......w.........'];
  const CLOUD = ['....gggggg........', '..gggggggggggg....', '.gggggggggggggggg.', 'gggggggggggggggggg', '.ggggggggggggggggg', '..ggggg..gggggg...'];
  const VESPA = ['..........rrrr........', '........rrrrrrr.......', '.......rrr..rrrr......', '..ee..rrr.....rrr.ee..', '.eeee.rrrrrrrrrr.eeee.', '.eeee..rrrrrrrr..eeee.', '..ee..............ee..'];
  const PASSPORT = ['bbbbbbbbbb', 'bbbbbbbbbb', 'bbbggggbbb', 'bbgggggg.b', 'bbgggggg.b', 'bbbggggbbb', 'bbbbbbbbbb', 'bbbggggbbb', 'bbbbbbbbbb', 'bbbbbbbbbb', 'bbbbbbbbbb', 'bbbbbbbbbb'];
  const TICKET = ['wwwwwwwwwwww', 'wggggwwwgggw', 'wwwwwwwwwwww', 'wggwgwwwgggw', 'wggggwwwwwww', 'wwwwwwwwwwww', 'wgggwwwgggww', 'wwwwwwwwwwww'];
  const BOUQUET = ['..p.pp.p..', '.pppwwppp.', 'ppwwppwwpp', 'pppwwppwpp', '.ppppwppp.', '..pppppp..', '...nnnn...', '....nn....', '....nn....', '...gnng...', '....nn....', '....nn....'];
  const RING = ['....gg....', '...gwwg...', '..gwwwwg..', '...gwwg...', '..gg..gg..', '.gg....gg.', '.gg....gg.', '.gg....gg.', '.gg....gg.', '..gg..gg..', '...gggg...', '....gg....'];
  const PAL = { e: C.brown, b: C.burg, t: C.tan, w: C.white, r: C.red, g: C.gold, v: C.white, d: C.text, p: '#eeb0b8', n: '#4a6a34' };

  Arcade.games.italy = { title: 'Getting to Italy', w: W, h: H, create(api) {
    // 32x32 frames: stand, walk 1, walk 2, climb 1, climb 2, jump, hit, win, slip (the code-drawn stand-ins are 16x24, centred in the cell)
    const sheets = { bride: api.sheet('/assets/game/bride.png', 32, 32, 9, (c, f, x, y, fl) => figure(c, 'bride', f === 8 ? 6 : f, x + 8, y + 8, fl)), groom: api.sheet('/assets/game/groom.png', 32, 32, 9, (c, f, x, y, fl) => figure(c, 'groom', f === 8 ? 6 : f, x + 8, y + 8, fl)) };
    const FW = 32, FH = 32;
    const pic = (n, fb) => api.image('/assets/game/' + n + '.png', fb);
    const ART = { suitcases: [1, 2, 3, 4, 5, 6].map((i) => pic('suitcase' + i, (c, x, y) => drawMap(c, SUITCASE, x, y + 2, PAL))),
      plane: pic('plane', (c, x, y) => drawMap(c, PLANE, x, y + 4, PAL)), cloud: pic('cloud', (c, x, y) => drawMap(c, CLOUD, x, y + 2, PAL)), vespa: pic('vespa', (c, x, y) => drawMap(c, VESPA, x, y + 6, PAL)),
      planePlain: pic('plane-plain', (c, x, y) => drawMap(c, PLANE, x, y + 4, PAL)), belt: pic('belt'), passport: pic('passport', (c, x, y) => drawMap(c, PASSPORT, x, y, PAL)), ticket: pic('ticket', (c, x, y) => drawMap(c, TICKET, x, y + 4, PAL)), ring: pic('ring', (c, x, y) => drawMap(c, RING, x, y, PAL)), bouquet: pic('bouquet', (c, x, y) => drawMap(c, BOUQUET, x, y, PAL)) };
    const itemArt = (id) => id === 'passport' ? ART.passport : id === 'ticket' ? ART.ticket : (S.who === 'bride' ? ART.bouquet : ART.ring);
    const ITEM_SIZE = { passport: [14, 19], ticket: [21, 13], outfit: S => S.who === 'bride' ? [21, 24] : [16, 18] };
    const itemWH = (id) => { const v = ITEM_SIZE[id]; return typeof v === 'function' ? v(S) : v; };
    const S = {};
    function reset() {
      Object.assign(S, { mode: 'title', who: 'bride', sel: 0, t: 0, lives: 3, score: 0, bonus: 5000, items: {}, msg: null, msgT: 0,
        p: { x: 20, y: PLATS[0].y, plat: 0, vy: 0, air: false, climb: null, dir: 1, anim: 0, hit: 0, slow: 0, slip: 0, safe: 0, won: false },
        cases: [], planes: [], drips: [], vespa: null, cloud: { x: 60, dir: 1, t: 0 },
        tCase: 1.5, tPlane: 2, tVespa: 3, ready: 0 });
    }
    reset();
    const other = () => (S.who === 'bride' ? 'groom' : 'bride');
    const ladderAt = (from, x) => LADDERS.find((l) => l.from === from && Math.abs(l.x - x) < 7);
    const hitBox = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    const say = (m, t = 1.6) => { S.msg = m; S.msgT = t; };
    const hurt = () => { if (S.p.hit > 0 || S.p.won) return; S.p.hit = 1.3; S.p.climb = null; S.p.air = false; S.lives--; };

    function update(dt, input) {
      S.t += dt;
      if (S.mode === 'title') { if (input.hit('start') || input.hit('jump')) { S.mode = 'select'; } return; }
      if (S.mode === 'select') {
        if (input.hit('left') || input.hit('right')) S.sel = 1 - S.sel;
        if (input.hit('start') || input.hit('jump')) { S.who = S.sel ? 'groom' : 'bride'; S.mode = 'ready'; S.ready = 1.4; }
        return;
      }
      if (S.mode === 'ready') { S.ready -= dt; if (S.ready <= 0) S.mode = 'play'; return; }
      if (S.mode === 'over' || S.mode === 'won') { if (input.hit('start') || input.hit('jump')) { const who = S.who; reset(); S.mode = 'select'; S.sel = who === 'groom' ? 1 : 0; } return; }
      const p = S.p;
      if (S.msgT > 0) S.msgT -= dt;
      if (p.hit > 0) {                                              // knocked down: lie there, then start again from Departures
        p.hit -= dt;
        if (p.hit <= 0) { if (S.lives <= 0) { S.mode = 'over'; return; } Object.assign(p, { x: 20, y: PLATS[0].y, plat: 0, vy: 0, air: false, climb: null, dir: 1, slow: 0, safe: 1 }); }   // a second's grace on respawn
      } else if (p.slip > 0) {                                     // slipped on the rain: a moment on the floor, then up again
        p.slip -= dt;
      } else {
        // ---- the player
        const speed = 62 * (p.slow > 0 ? 0.5 : 1); if (p.slow > 0) p.slow -= dt; if (p.safe > 0) p.safe -= dt;
        if (p.climb) {
          const L = p.climb, top = PLATS[L.from + 1].y, bottom = PLATS[L.from].y;
          if (input.is('up')) { p.y -= 46 * dt; p.anim += dt * 6; } if (input.is('down')) { p.y += 46 * dt; p.anim += dt * 6; }
          if (p.y <= top) { p.y = top; p.plat = L.from + 1; p.climb = null; }
          if (p.y >= bottom) { p.y = bottom; p.plat = L.from; p.climb = null; }
        } else {
          const pl = PLATS[p.plat];
          if (input.is('left')) { p.x -= speed * dt; p.dir = -1; p.anim += dt * 8; }
          if (input.is('right')) { p.x += speed * dt; p.dir = 1; p.anim += dt * 8; }
          p.x = Math.max(pl.x0 + 6, Math.min(pl.x1 - 6, p.x));
          if (p.air) { p.vy += 520 * dt; p.y += p.vy * dt; if (p.y >= pl.y) { p.y = pl.y; p.air = false; p.vy = 0; } }
          else {
            if (input.hit('jump')) { p.air = true; p.vy = -168; }
            else if (input.is('up')) { const L = ladderAt(p.plat, p.x); if (L) { p.climb = L; p.x = L.x; } }
            else if (input.is('down')) { const L = ladderAt(p.plat - 1, p.x); if (L && p.plat > 0) { p.climb = L; p.x = L.x; p.y += 1; } }
          }
        }
        // items
        ITEMS.forEach((it) => { if (!S.items[it.id] && p.plat === it.plat && !p.climb && Math.abs(p.x - it.x - 8) < 12) { S.items[it.id] = true; S.score += 500; say(it.id === 'outfit' ? (S.who === 'bride' ? 'THE BOUQUET!' : 'THE RING!') : it.id.toUpperCase() + '!'); } });
        // the partner at the gate
        if (p.plat === 5 && !p.climb && Math.abs(p.x - PARTNER_X) < 12) {
          const missing = ITEMS.filter((it) => !S.items[it.id]);
          if (!missing.length) { p.won = true; S.score += S.bonus; S.mode = 'won'; }
          else { p.x = PARTNER_X - 13; say((missing[0].id === 'outfit' ? (S.who === 'bride' ? 'THE BOUQUET' : 'THE RING') : missing[0].id.toUpperCase()) + '?', 1.2); }
        }
      }
      if (S.bonus > 0) S.bonus = Math.max(0, S.bonus - 12 * dt);
      // ---- what rolls down
      S.tCase -= dt; if (S.tCase <= 0) { S.tCase = 3.8 + Math.random() * 1.2; S.cases.push({ x: 206, y: PLATS[4].y, plat: 4, vx: -52, vy: 0, fall: false, scored: false, ladder: null, look: Math.floor(Math.random() * 6) }); }
      S.cases.forEach((b) => {
        if (b.fall) { b.vy += 400 * dt; b.y += b.vy * dt; const below = PLATS.slice(0, b.plat).reverse().find((q) => b.x + 7 > q.x0 && b.x + 7 < q.x1 && b.y >= q.y); if (below) { b.y = below.y; b.plat = PLATS.indexOf(below); b.fall = false; b.vy = 0; b.vx = -b.vx * (b.ladder ? 1 : 1); b.ladder = null; } if (b.y > H + 20) b.dead = true; return; }
        b.x += b.vx * dt; const pl = PLATS[b.plat];
        if (b.plat > 0 && !b.ladder) { const L = LADDERS.find((l) => l.from === b.plat - 1 && Math.abs(l.x - (b.x + 7)) < 2); if (L && Math.random() < 0.35) { b.ladder = L; b.fall = true; b.vy = 40; b.x = L.x - 7; } }
        if (b.x + 7 < pl.x0 || b.x + 7 > pl.x1) { if (b.plat === 0) b.dead = true; else { b.fall = true; b.vy = 0; } }
        if (b.plat === 0 && b.x < -16) b.dead = true;
      });
      S.cases = S.cases.filter((b) => !b.dead);
      S.tPlane -= dt; if (S.tPlane <= 0) { S.tPlane = 3.2 + Math.random(); S.planes.push({ x: 232, y: PLATS[3].y - 12, scored: false }); }
      S.planes.forEach((a) => { a.x -= 88 * dt; }); S.planes = S.planes.filter((a) => a.x > -20);
      const cl = S.cloud; cl.x += cl.dir * 26 * dt; if (cl.x < 20 || cl.x > 190) cl.dir *= -1; cl.t -= dt; if (cl.t <= 0) { cl.t = 1.25; S.drips.push({ x: cl.x + 8, y: PLATS[2].y - 22 }); }
      S.drips.forEach((d) => { d.y += 125 * dt; }); S.drips = S.drips.filter((d) => d.y < PLATS[2].y);
      S.tVespa -= dt; if (S.tVespa <= 0 && !S.vespa) { S.tVespa = 4.5 + Math.random() * 2; S.vespa = { x: -26, scored: false }; }
      if (S.vespa) { S.vespa.x += 115 * dt; if (S.vespa.x > 232) S.vespa = null; }
      // ---- collisions and jump scoring
      if (p.hit <= 0 && p.safe <= 0 && S.mode === 'play') {
        const px = p.x - 4, py = p.y - 14, pw = 8, ph = 14;                   // the body, not the head: a jump under a platform must not clip what rolls along it
        const over = (hx, hw, hy) => { if (p.air && hx < p.x && hx + hw > p.x && hy >= p.y) return true; return false; };
        S.cases.forEach((b) => { if (!b.fall && b.plat !== p.plat && !p.climb) return; if (hitBox(px, py, pw, ph, b.x + 1, b.y - 11, 12, 11)) hurt(); else if (!b.scored && over(b.x, 14, b.y - 11)) { b.scored = true; S.score += 100; } });
        S.planes.forEach((a) => { if (hitBox(px, py, pw, ph, a.x + 2, a.y + 1, 20, 10)) hurt(); else if (!a.scored && over(a.x, 24, a.y)) { a.scored = true; S.score += 100; } });
        S.drips.forEach((d) => { if (p.slip <= 0 && !p.climb && hitBox(px, py, pw, ph, d.x, d.y, 2, 5)) { p.slip = 1.3; p.air = false; p.vy = 0; p.y = PLATS[p.plat].y; d.y = 999; say('SLIPPED!', 1.2); } });
        if (S.vespa && p.plat === 0) { const v = S.vespa; if (hitBox(px, py, pw, ph, v.x + 2, PLATS[0].y - 13, 20, 13)) hurt(); else if (!v.scored && over(v.x, 24, PLATS[0].y - 13)) { v.scored = true; S.score += 100; } }
      }
    }

    // ---- drawing
    function girders(c) {
      PLATS.forEach((pl, i) => {
        c.fillStyle = C.girder; c.fillRect(pl.x0, pl.y, pl.x1 - pl.x0, 6);
        c.fillStyle = C.girderDk; c.fillRect(pl.x0, pl.y + 4, pl.x1 - pl.x0, 2);
        c.fillStyle = C.rivet; for (let x = pl.x0 + 4; x < pl.x1 - 2; x += 8) c.fillRect(x, pl.y + 1, 2, 2);
      });
      LADDERS.forEach((L) => { const top = PLATS[L.from + 1].y, bottom = PLATS[L.from].y; c.fillStyle = C.ladder; c.fillRect(L.x - 5, top, 2, bottom - top); c.fillRect(L.x + 3, top, 2, bottom - top); for (let y = top + 4; y < bottom; y += 6) c.fillRect(L.x - 5, y, 10, 1); });
      // the villa gate at the top, and Departures at the bottom
      // the villa gate: two stone piers with ball finials, and a carved lintel with the name across them
      const gy = PLATS[5].y;
      [74, 142].forEach((x) => {
        c.fillStyle = '#e9dfc6'; c.fillRect(x, 36, 8, gy - 36); c.fillStyle = '#a79c85'; c.fillRect(x + 6, 36, 2, gy - 36); c.fillRect(x, gy - 3, 8, 3);
        c.fillStyle = '#efe7d6'; c.fillRect(x - 1, 34, 10, 3);                                              // the capital
      });
      c.fillStyle = C.gold; c.fillRect(74, 24, 76, 11); c.fillStyle = C.girderDk; c.fillRect(74, 24, 76, 1); c.fillRect(74, 34, 76, 1);
      api.text(c, 'VILLA CETINALE', 112, 27, C.burg, 'center');
      ART.belt.draw(c, 190, PLATS[4].y - 25, 32, 25, false);                                                 // the baggage belt
      api.text(c, 'BAGGAGE', 222, PLATS[4].y - 33, C.dim, 'right');
      api.text(c, 'DEPARTURES', 44, PLATS[0].y - 12, C.dim);
    }
    function hud(c) {
      c.fillStyle = C.burg; c.fillRect(0, 0, W, 24);
      api.text(c, 'SCORE ' + Math.floor(S.score), 4, 2, C.text);
      api.text(c, 'BONUS ' + Math.floor(S.bonus), 4, 11, C.gold);
      for (let i = 0; i < 3; i++) { c.fillStyle = i < S.lives ? C.red : '#4a2a2a'; c.fillRect(W - 8 - i * 8, 3, 5, 4); c.fillRect(W - 7 - i * 8, 2, 3, 1); }
      ITEMS.forEach((it, i) => { const on = S.items[it.id]; const [w, h] = itemWH(it.id); c.globalAlpha = on ? 1 : 0.25; itemArt(it.id).draw(c, 104 + i * 26, 22 - h, w, h, false); c.globalAlpha = 1; });
    }
    function scene(c) {
      c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
      girders(c);
      ITEMS.forEach((it) => { if (!S.items[it.id]) { const [w, h] = itemWH(it.id); itemArt(it.id).draw(c, it.x, PLATS[it.plat].y - h, w, h, false); } });
      sheets[other()].draw(c, S.mode === 'won' ? 7 : 0, PARTNER_X - FW / 2, PLATS[5].y - FH, true);
      S.cases.forEach((b) => ART.suitcases[b.look].draw(c, b.x, b.y - 12, 14, 12, b.vx > 0));
      S.planes.forEach((a) => { ART.plane.draw(c, a.x, a.y, 24, 12, true); });       // these fly right to left; the cancelled sprite faces right, so it is mirrored
      ART.cloud.draw(c, S.cloud.x, PLATS[2].y - 36, 20, 14, false); S.drips.forEach((d) => { c.fillStyle = '#9ecbe8'; c.fillRect(d.x, d.y, 2, 5); });
      if (S.vespa) ART.vespa.draw(c, S.vespa.x, PLATS[0].y - 14, 24, 14, false);
      const p = S.p, frame = p.hit > 0 ? 6 : p.slip > 0 ? 8 : S.mode === 'won' ? 7 : p.climb ? 3 + (Math.floor(p.anim) % 2) : p.air ? 5 : (input_moving() ? 1 + (Math.floor(p.anim) % 2) : 0);
      if ((p.slow > 0 || p.safe > 0) && Math.floor(S.t * 8) % 2) c.globalAlpha = 0.6;   // flickers while slowed or invincible
      sheets[S.who].draw(c, frame, Math.round(p.x) - FW / 2, Math.round(p.y) - FH, p.dir < 0);
      c.globalAlpha = 1;
      hud(c);
      if (S.msgT > 0 && S.msg) { const y = Math.max(28, p.y - 40); c.fillStyle = C.white; c.fillRect(p.x - 30, y - 2, 60, 10); api.text(c, S.msg, p.x, y, C.burg, 'center'); }
    }
    let moving = false; const input_moving = () => moving;
    const wrapUpdate = (dt, input) => { moving = input.is('left') || input.is('right'); update(dt, input); };
    function big(c, s, x, y, col, scale = 2) { c.save(); c.translate(x, y); c.scale(scale, scale); api.text(c, s, 0, 0, col, 'center'); c.restore(); }
    function drawTitle(c, t) {
      c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
      c.fillStyle = C.burg; c.fillRect(0, 0, W, 10); c.fillRect(0, H - 10, W, 10);
      big(c, 'GETTING', W / 2, 52, C.gold, 3); big(c, 'TO ITALY', W / 2, 78, C.gold, 3);
      api.text(c, 'AN INTERACTIVE INSTALLATION', W / 2, 106, C.dim, 'center');
      api.text(c, 'ANTHONY ALVAREZ & KELLY WHEELIS', W / 2, 116, C.dim, 'center');
      const wx = 30 + ((t * 40) % 260);
      ART.planePlain.draw(c, ((t * 60) % 300) - 40, 128, 24, 12, true);                  // the title's plane is not cancelled; it crosses left to right, so the left-facing sprite is mirrored
      sheets.bride.draw(c, 1 + (Math.floor(t * 6) % 2), wx - 36, 160, false); sheets.groom.draw(c, 1 + (Math.floor(t * 6) % 2), wx, 160, false);
      c.fillStyle = C.girder; c.fillRect(0, 192, W, 6); c.fillStyle = C.rivet; for (let x = 4; x < W; x += 8) c.fillRect(x, 193, 2, 2);
      api.text(c, 'COLLECT THE PASSPORT, THE TICKET,', W / 2, 212, C.text, 'center'); api.text(c, 'THE BOUQUET OR THE RING. MAKE THE WEDDING.', W / 2, 222, C.text, 'center');
      if (Math.floor(t * 2) % 2) api.text(c, 'PRESS START', W / 2, 250, C.gold, 'center');
      api.text(c, (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) ? 'THE BUTTONS MOVE AND JUMP' : 'ARROWS MOVE · SPACE JUMPS', W / 2, 268, C.dim, 'center');
    }
    function draw(c) {
      if (S.mode === 'title') { drawTitle(c, S.t); return; }
      if (S.mode === 'select') {
        c.fillStyle = C.bg; c.fillRect(0, 0, W, H);
        big(c, 'CHOOSE YOUR', W / 2, 60, C.gold); big(c, 'PLAYER', W / 2, 80, C.gold);
        [['bride', 64, 'THE BRIDE'], ['groom', 160, 'THE GROOM']].forEach(([who, x, label], i) => {
          if (S.sel === i) { c.fillStyle = C.burg; c.fillRect(x - 24, 120, 48, 60); c.strokeStyle = C.gold; c.lineWidth = 1; c.strokeRect(x - 23.5, 120.5, 47, 59); }
          sheets[who].draw(c, S.sel === i ? 1 + (Math.floor(S.t * 6) % 2) : 0, x - FW / 2, 128, false);
          api.text(c, label, x, 166, S.sel === i ? C.text : C.dim, 'center');
        });
        api.text(c, 'LEFT / RIGHT · THEN START', W / 2, 220, C.dim, 'center');
        return;
      }
      scene(c);
      if (S.mode === 'ready') { c.fillStyle = 'rgba(20,12,6,.6)'; c.fillRect(0, 120, W, 40); big(c, 'READY?', W / 2, 132, C.gold); }
      if (S.mode === 'over') { c.fillStyle = 'rgba(20,12,6,.8)'; c.fillRect(0, 100, W, 80); big(c, 'MISSED', W / 2, 112, C.red); big(c, 'THE FLIGHT', W / 2, 132, C.red); api.text(c, 'SCORE ' + Math.floor(S.score) + ' · START TO TRY AGAIN', W / 2, 160, C.text, 'center'); }
      if (S.mode === 'won') { c.fillStyle = 'rgba(20,12,6,.8)'; c.fillRect(0, 96, W, 96); big(c, 'YOU MADE IT!', W / 2, 108, C.gold); api.text(c, 'SEE YOU IN SIENA', W / 2, 134, C.text, 'center'); api.text(c, '24 APRIL 2027', W / 2, 146, C.text, 'center'); api.text(c, 'SCORE ' + Math.floor(S.score), W / 2, 166, C.gold, 'center'); api.text(c, 'START TO PLAY AGAIN', W / 2, 180, C.dim, 'center'); }
    }
    return { update: wrapUpdate, draw, drawTitle, debug: { S, start(who) { reset(); S.who = who || 'bride'; S.mode = 'play'; } } };
  } };
})();
