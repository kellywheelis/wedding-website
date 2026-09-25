// THE SEATING CHART — the ushers' game, for the museum's arcade. The chapel at the villa, seen from the door:
// the altar at the top with the bride and the groom waiting, rows of pews running down the nave. The guests
// arrive in groups (a couple, a family, four friends, the wedding party...) and come down the aisle; turn them,
// slide them, seat them. Fill a pew and the congregation settles: the full row sits, everyone shuffles one pew
// toward the altar, and the seated fill the church from the front. Seat every guest on the list before the
// ceremony and the vows begin. Jam the pews up to the altar and the ushers have lost control.
// A couple seated together earns a heart; the hearts count at the vows.
(function () {
  const W = 224, H = 288, COLS = 8, ROWS = 14, CELL = 12, OX = 57, OY = 74, AISLE = 14, GUESTS = 96;   // the nave: 8 seats a pew (four either side of the aisle), 14 pews on screen
  const sx = (gx) => OX + gx * CELL + (gx >= 4 ? AISLE : 0);                    // a seat's x on screen: the aisle lies between seats 3 and 4
  const C = { text: '#f4efe1', gold: '#e8c07a', dim: '#a79c85', burg: '#7a1a3c', red: '#c0392b', white: '#fbf7ee', dark: '#140c06', wall: '#e9dfc6', wall2: '#d8ccb0', floor: '#c9b28a', aisle: '#8f2a4a', pew: '#5a3a24', pew2: '#3e2718', seated: '#4a2c17' };
  // the guest groups: cells and a colour (the group's outfits), named by kind; special ones flagged
  const KINDS = [
    { name: 'A COUPLE', cells: [[0, 0], [1, 0]], col: '#eeb0b8', couple: true },
    { name: 'THE FAMILY', cells: [[0, 0], [0, 1], [1, 1]], col: '#93aea2' },
    { name: 'FOUR FRIENDS', cells: [[0, 0], [1, 0], [2, 0], [3, 0]], col: '#d19a6e' },
    { name: 'THE WEDDING PARTY', cells: [[0, 0], [1, 0], [0, 1], [1, 1]], col: '#e8c07a' },
    { name: 'COLLEAGUES', cells: [[0, 0], [1, 0], [2, 0], [2, 1]], col: '#8fa8d9' },
    { name: 'THE COUSINS', cells: [[1, 0], [2, 0], [0, 1], [1, 1]], col: '#c9a667' },
    { name: 'THE IN-LAWS', cells: [[0, 0], [1, 0], [2, 0], [1, 1]], col: '#b9a7e0' },
    { name: 'A PLUS-ONE', cells: [[0, 0]], col: '#f4efe1', rare: true }
  ];
  const rot = (cells) => { const r = cells.map(([x, y]) => [-y, x]); const mx = Math.min(...r.map((p) => p[0])), my = Math.min(...r.map((p) => p[1])); return r.map(([x, y]) => [x - mx, y - my]); };

  Arcade.games.seating = { title: 'The Seating Chart', w: W, h: H, create(api) {
    const S = {}, WON_TITLE = 'THEY DO', OVER_TITLE = 'THE USHERS LOST CONTROL';
    function reset() { Object.assign(S, { boarded: false, mode: 'title', t: 0, score: 0, seated: 0, pews: 0, hearts: 0, level: 1, grid: Array.from({ length: ROWS }, () => Array(COLS).fill(null)), congregation: [], piece: null, next: null, fall: 0, msg: null, msgT: 0, settling: [], settleT: 0, ready: 0, bag: [], wander: 0, vows: 0 });
      S.next = pick(); spawn(); }
    function pick() {
      const r = Math.random();
      const mk = (k) => ({ ...k, cells: k.cells.map((p) => p.slice()) });
      if (r < 0.1) return mk(KINDS[7]);
      if (!S.bag.length) S.bag = [0, 1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
      return mk(KINDS[S.bag.pop()]);
    }
    function spawn() { S.piece = S.next; S.next = pick(); const p = S.piece; p.x = Math.floor((COLS - (Math.max(...p.cells.map((q) => q[0])) + 1)) / 2); p.y = 0; if (!fits(p, p.x, p.y, p.cells)) { S.mode = 'over'; } say(p.name + (p.cells.length === 1 ? ' HAS ARRIVED' : ' HAVE ARRIVED'), 1.6); }
    const say = (m, t = 1.4) => { S.msg = m; S.msgT = t; };
    const fits = (p, x, y, cells) => cells.every(([cx, cy]) => { const gx = x + cx, gy = y + cy; return gx >= 0 && gx < COLS && gy < ROWS && (gy < 0 || !S.grid[gy][gx]); });
    const at = (x, y) => (y >= 0 && y < ROWS && x >= 0 && x < COLS) ? S.grid[y][x] : null;
    function lockPiece() {
      const p = S.piece, placed = [];
      p.cells.forEach(([cx, cy]) => { if (p.y + cy >= 0) { S.grid[p.y + cy][p.x + cx] = { col: p.col, kind: p }; placed.push([p.x + cx, p.y + cy]); } });
      S.seated += placed.length; S.score += placed.length * 10;
      // the wedding rules, on where they landed
      if (p.couple) { S.hearts++; S.score += 50; say('A COUPLE, TOGETHER · +50', 1.2); }
      const full = []; for (let y = 0; y < ROWS; y++) if (S.grid[y].every(Boolean)) full.push(y);
      if (full.length) { S.settling = full; S.settleT = 0.7; const pts = [0, 100, 300, 500, 800][full.length] * S.level; S.score += pts; S.pews += full.length; say((full.length > 1 ? full.length + ' PEWS FULL · ' : 'A FULL PEW · ') + 'SIT, PLEASE · +' + pts, 1.6); if (S.pews >= S.level * 6) { S.level++; } }
      else if (S.seated >= GUESTS) { S.mode = 'won'; S.vows = 0; }
      else spawn();
    }
    const stepTime = () => Math.max(0.14, 0.85 - (S.level - 1) * 0.09);
    function update(dt, input) {
      S.t += dt;
      if (Arcade.board.on) { Arcade.board.update(dt, input); return; }
      if (S.mode === 'won') { S.vows += dt; if (S.vows > 3 && !S.boarded) { S.boarded = true; S.score += 1000 + S.hearts * 100; Arcade.board.open('seating', S.score, { title: WON_TITLE, sub: S.seated + ' GUESTS · ' + S.hearts + ' HEARTS' }); } if (input.hit('start') && S.boarded) reset(); return; }
      if (S.mode === 'over' && !S.boarded) { S.boarded = true; Arcade.board.open('seating', S.score, { title: OVER_TITLE, sub: S.seated + ' OF ' + GUESTS + ' SEATED' }); return; }
      if (S.mode === 'title') { if (input.hit('start') || input.hit('jump')) { S.mode = 'ready'; S.ready = 2.6; } return; }
      if (S.mode === 'ready') { S.ready -= dt; if (S.ready <= 0 || input.hit('start') || input.hit('jump')) S.mode = 'play'; return; }
      if (S.mode === 'over') { if (input.hit('start') || input.hit('jump')) reset(); return; }
      if (S.msgT > 0) S.msgT -= dt;
      if (S.settling.length) {                                          // the full pews sit; then everyone shuffles a pew forward
        S.settleT -= dt;
        if (S.settleT <= 0) { S.settling.sort((a, b) => a - b).forEach((y) => { S.congregation.push(S.grid[y].map((g) => g.col)); S.grid.splice(y, 1); S.grid.unshift(Array(COLS).fill(null)); }); S.settling = []; if (S.seated >= GUESTS) { S.mode = 'won'; S.vows = 0; } else spawn(); }
        return;
      }
      const p = S.piece;
      if (input.hit('left') && fits(p, p.x - 1, p.y, p.cells)) p.x--;
      if (input.hit('right') && fits(p, p.x + 1, p.y, p.cells)) p.x++;
      if (input.hit('up')) { const r = rot(p.cells); if (fits(p, p.x, p.y, r)) p.cells = r; else if (fits(p, p.x - 1, p.y, r)) { p.x--; p.cells = r; } else if (fits(p, p.x + 1, p.y, r)) { p.x++; p.cells = r; } }
      if (input.hit('jump')) { while (fits(p, p.x, p.y + 1, p.cells)) { p.y++; S.score += 2; } lockPiece(); return; }
      S.fall += dt * (input.is('down') ? 8 : 1);
      if (S.fall >= stepTime()) { S.fall = 0; if (fits(p, p.x, p.y + 1, p.cells)) { p.y++; if (input.is('down')) S.score += 1; } else lockPiece(); }
    }

    // ---- drawing
    const HAIR = ['#2b1a0e', '#4a2c17', '#e9c56a', '#8a4a2a', '#5a4a3a', '#1a1a1a'], SKIN = ['#f1c9a5', '#e0b088', '#c98f66', '#f5d5b8'];
    // a guest at (x, y) on screen: hair, face, shoulders in the group's colour; special guests have their own look
    const figure = (c, x, y, col, kind, seed, ghost) => {
      if (ghost) { c.strokeStyle = 'rgba(122,26,60,.45)'; c.strokeRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3); return; }
      const hair = HAIR[seed % HAIR.length], skin = SKIN[(seed >> 2) % SKIN.length], body = col, woman = seed % 2 === 1, style = (seed >> 1) % 4;
      c.fillStyle = hair;
      if (woman) {
        if (style === 0) { c.fillRect(x + 3, y + 2, 6, 2); c.fillRect(x + 2, y + 4, 2, 5); c.fillRect(x + 8, y + 4, 2, 5); }        // long hair to the shoulders
        else if (style === 1) { c.fillRect(x + 4, y + 1, 4, 1); c.fillRect(x + 3, y + 2, 6, 2); c.fillRect(x + 3, y + 4, 1, 2); c.fillRect(x + 8, y + 4, 1, 2); }   // an updo
        else if (style === 2) { c.fillRect(x + 3, y + 2, 6, 2); c.fillRect(x + 2, y + 4, 2, 3); c.fillRect(x + 8, y + 4, 2, 3); c.fillStyle = col; c.fillRect(x + 2, y + 1, 8, 2); c.fillRect(x + 4, y, 4, 1); c.fillStyle = hair; }   // a hat in the group's colour
        else { c.fillRect(x + 3, y + 2, 6, 2); c.fillRect(x + 2, y + 4, 2, 4); c.fillRect(x + 8, y + 4, 2, 4); c.fillStyle = '#e8c07a'; c.fillRect(x + 3, y + 2, 1, 1); c.fillStyle = hair; }   // long hair with a gold clip
      } else { c.fillRect(x + 4, y + 2, 4, 2); c.fillRect(x + 3, y + 3, 1, 2); c.fillRect(x + 8, y + 3, 1, 2); }                     // short hair
      c.fillStyle = skin; c.fillRect(x + 4, y + 4, 4, 3);
      c.fillStyle = '#2b2520'; c.fillRect(x + 5, y + 5, 1, 1); c.fillRect(x + 7, y + 5, 1, 1);
      if (woman) { c.fillStyle = '#c0392b'; c.fillRect(x + 5, y + 6, 2, 1); }                                                       // lipstick
      c.fillStyle = body; c.fillRect(x + 3, y + 7, 6, 4);
      if (woman) { c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x + 4, y + 7, 4, 1); c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x + 3, y + 10, 6, 1); }   // a neckline and the hem of a dress
      else { c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x + 5, y + 7, 2, 2); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + 5, y + 8, 2, 1); }   // a shirt front and a tie
    };
    function chapel(c) {
      // the walls and the floor, the aisle carpet, the altar at the top
      c.fillStyle = C.wall; c.fillRect(0, 0, W, H);
      c.fillStyle = C.wall2; for (let y = 0; y < H; y += 8) c.fillRect(0, y, W, 1);
      c.fillStyle = C.floor; c.fillRect(OX - 6, OY - 4, COLS * CELL + AISLE + 12, ROWS * CELL + 8);
      c.fillStyle = C.aisle; c.fillRect(OX + CELL * 4, OY - 4, AISLE, ROWS * CELL + 8);            // the aisle runs down the middle...
      // the altar: a step, the table with candles, the rose window, the couple either side of the officiant
      c.fillStyle = '#d8ccb0'; c.fillRect(OX - 6, OY - 20, COLS * CELL + AISLE + 12, 16); c.fillStyle = '#c9b28a'; c.fillRect(OX - 6, OY - 5, COLS * CELL + AISLE + 12, 2);
      c.fillStyle = C.burg; c.beginPath(); c.arc(W / 2 - 40, 38, 10, 0, Math.PI * 2); c.fill(); c.fillStyle = C.gold; c.beginPath(); c.arc(W / 2 - 40, 38, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = C.burg; for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; c.fillRect(W / 2 - 40 + Math.cos(a) * 4.5 - 1, 38 + Math.sin(a) * 4.5 - 1, 2, 2); }   // the rose window
      c.fillStyle = C.white; c.fillRect(W / 2 - 14, OY - 34, 28, 14); c.fillStyle = C.gold; c.fillRect(W / 2 - 14, OY - 21, 28, 2);   // the altar table
      [-9, 9].forEach((dx) => { c.fillStyle = '#f4efe1'; c.fillRect(W / 2 + dx - 1, OY - 46, 2, 12); c.fillStyle = '#f3dc9a'; c.fillRect(W / 2 + dx - 1, OY - 49, 2, 3); });   // candles
      c.fillStyle = '#2b2520'; c.fillRect(W / 2 - 3, OY - 52, 6, 14); c.fillStyle = '#f4efe1'; c.fillRect(W / 2 - 1, OY - 50, 2, 3);   // the officiant
      if (S.mode === 'won') { const k = Math.min(1, S.vows / 2); c.fillStyle = C.red; [[W / 2 - 6, OY - 66], [W / 2 + 2, OY - 62]].forEach(([hx, hy]) => { c.globalAlpha = k; c.fillRect(hx, hy - k * 6, 2, 2); c.fillRect(hx + 3, hy - k * 6, 2, 2); c.fillRect(hx + 1, hy - k * 6 + 2, 3, 2); c.globalAlpha = 1; }); }
      // the pews: a bench line under each row of seats; the seated congregation shown in the nearest pews to the altar
      for (let y = 0; y < ROWS; y++) { const py = OY + y * CELL; [OX, OX + CELL * 4 + AISLE].forEach((bx) => { c.fillStyle = C.pew; c.fillRect(bx, py + CELL - 2, CELL * 4, 2); c.fillStyle = C.pew2; c.fillRect(bx, py + CELL - 1, CELL * 4, 1); }); }
      S.congregation.slice(-3).forEach((row, i) => { const y = OY - 4 - (S.congregation.slice(-3).length - i) * 5; row.forEach((col, x) => { c.fillStyle = col; c.fillRect(sx(x) + 4, y, 4, 2); c.fillStyle = '#2b2520'; c.fillRect(sx(x) + 5, y - 2, 2, 2); }); });   // the backs of the heads of those already seated, tucked under the altar step
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const g = S.grid[y][x]; if (g) figure(c, sx(x), OY + y * CELL, g.col, g.kind, (x * 7 + y * 13) % 24, false); }
      S.settling.forEach((y) => { if (Math.floor(S.t * 10) % 2) { c.fillStyle = 'rgba(232,192,122,.55)'; c.fillRect(OX, OY + y * CELL, COLS * CELL + AISLE, CELL); } });
      const p = S.piece; if (p && !S.settling.length && S.mode === 'play') {
        let gy = p.y; while (fits(p, p.x, gy + 1, p.cells)) gy++;
        p.cells.forEach(([cx, cy]) => { if (gy + cy >= 0) figure(c, sx(p.x + cx), OY + (gy + cy) * CELL, p.col, p, 0, true); });
        p.cells.forEach(([cx, cy]) => { if (p.y + cy >= 0) figure(c, sx(p.x + cx), OY + (p.y + cy) * CELL, p.col, p, (cx * 7 + cy * 13 + p.x) % 24, false); });
      }
    }
    function side(c) {
      // one line across the top: seated, pews, hearts, score; NEXT small beside the altar; a caption strip under the pews
      c.fillStyle = C.burg; c.fillRect(0, 0, W, 22);
      api.text(c, 'SEATED ' + S.seated + '/' + GUESTS, 4, 3, C.text); api.text(c, 'PEWS ' + S.pews, 4, 12, C.gold);
      api.text(c, 'SCORE ' + S.score, W - 4, 3, C.text, 'right');
      for (let i = 0; i < Math.min(8, S.hearts); i++) { c.fillStyle = C.red; const hx = W - 4 - (i + 1) * 7, hy = 13; c.fillRect(hx, hy, 2, 2); c.fillRect(hx + 3, hy, 2, 2); c.fillRect(hx + 1, hy + 2, 3, 2); }
      const n = S.next; if (n) { api.text(c, 'NEXT', 8, OY - 16, C.burg); n.cells.forEach(([cx, cy]) => figure(c, 6 + cx * CELL, OY - 6 + cy * CELL, n.col, n, (cx * 5 + cy * 3) % 24, false)); }
      if (S.msgT > 0 && S.msg) { c.fillStyle = 'rgba(20,12,6,.08)'; c.fillRect(0, OY + ROWS * CELL + 8, W, 14); api.text(c, S.msg, W / 2, OY + ROWS * CELL + 11, C.burg, 'center'); }
    }
    function big(c, s, x, y, col, scale = 2) { c.save(); c.translate(x, y); c.scale(scale, scale); api.text(c, s, 0, 0, col, 'center'); c.restore(); }
    function drawTitle(c, t) {
      c.fillStyle = C.dark; c.fillRect(0, 0, W, H); c.fillStyle = C.burg; c.fillRect(0, 0, W, 10); c.fillRect(0, H - 10, W, 10);
      big(c, 'THE SEATING', W / 2, 40, C.gold, 3); big(c, 'CHART', W / 2, 66, C.gold, 3);
      api.text(c, 'ANTHONY & KELLY PRESENT', W / 2, 98, C.dim, 'center');
      // pews filling with guests, on the title
      for (let y = 0; y < 4; y++) for (let x = 0; x < 8; x++) { if (x === 4 || (x + y * 3 + Math.floor(t)) % 5 === 0) continue; figure(c, 60 + x * 13, 118 + y * 14, ['#eeb0b8', '#93aea2', '#d19a6e', '#e8c07a', '#8fa8d9'][(x + y) % 5], null, (x * 7 + y * 13) % 24, false); }
      api.text(c, 'THE GUESTS ARE ARRIVING.', W / 2, 190, C.text, 'center'); api.text(c, 'SEAT THEM BEFORE THE VOWS.', W / 2, 200, C.text, 'center');
      api.text(c, 'A FULL PEW SITS AND SHUFFLES FORWARD.', W / 2, 214, C.dim, 'center');
      if (Math.floor(t * 2) % 2) api.text(c, 'PRESS START', W / 2, 246, C.gold, 'center');
      api.text(c, (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) ? 'ARROWS MOVE · UP TURNS · JUMP SEATS' : 'ARROWS MOVE · UP TURNS · SPACE SEATS', W / 2, 266, C.dim, 'center');
    }
    function draw(c) { drawGame(c); Arcade.board.draw(c); }
    function drawGame(c) {
      if (S.mode === 'title') { drawTitle(c, S.t); return; }
      chapel(c); side(c);
      if (S.mode === 'ready') { c.fillStyle = 'rgba(20,12,6,.85)'; c.fillRect(12, 90, W - 24, 104); c.strokeStyle = C.gold; c.strokeRect(12.5, 90.5, W - 25, 103); api.text(c, 'SEAT ' + GUESTS + ' GUESTS BEFORE THE VOWS', W / 2, 100, C.gold, 'center'); api.text(c, 'ARROWS MOVE · UP TURNS', W / 2, 114, C.text, 'center'); api.text(c, 'DOWN HURRIES · SPACE SEATS THEM', W / 2, 124, C.text, 'center'); api.text(c, 'A FULL PEW SITS AND SHUFFLES FORWARD', W / 2, 138, C.dim, 'center'); api.text(c, 'A COUPLE SEATED TOGETHER +50', W / 2, 148, C.dim, 'center'); big(c, 'READY?', W / 2, 166, C.gold); }
      if (S.mode === 'won') { c.fillStyle = 'rgba(20,12,6,.55)'; c.fillRect(0, 100, W, 50); big(c, 'THEY DO', W / 2, 112, C.gold); api.text(c, 'EVERYONE SEATED · THE VOWS BEGIN', W / 2, 136, C.text, 'center'); }
      if (S.mode === 'over' && !Arcade.board.on) { c.fillStyle = 'rgba(20,12,6,.8)'; c.fillRect(0, 100, W, 80); big(c, 'THE USHERS', W / 2, 112, C.red); big(c, 'LOST CONTROL', W / 2, 132, C.red); api.text(c, S.seated + ' OF ' + GUESTS + ' SEATED · SCORE ' + S.score, W / 2, 158, C.text, 'center'); api.text(c, 'START TO TRY AGAIN', W / 2, 170, C.dim, 'center'); }
    }
    reset();
    return { update, draw, drawTitle, debug: { S, start() { reset(); S.mode = 'play'; } } };
  } };
})();
