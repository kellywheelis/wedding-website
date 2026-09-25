// THE SEATING CHART — a falling-blocks puzzle for the museum's arcade. Guests arrive in groups shaped like
// tetrominoes (a couple, a family in an L, four friends in a line, the wedding party in a square...), each
// group a colour by kind. Turn them, slide them, seat them. Fill a row and that is a full table: it clears,
// "Tavolo pieno!", and the guests are seated. Let the hall fill to the top and the venue is full. Now and then a
// plus-one arrives (a single seat, the easy one), and Nonna (slow, worth double). Every ten tables the band gets
// going and the pace rises.
(function () {
  const W = 224, H = 288, COLS = 10, ROWS = 20, CELL = 12, OX = 20, OY = 32;   // the hall: 10 seats wide, 20 deep
  const C = { text: '#f4efe1', gold: '#e8c07a', dim: '#a79c85', burg: '#7a1a3c', red: '#c0392b', white: '#fbf7ee', dark: '#140c06', floor: '#2b2520', line: '#3a3129' };
  // the guest groups: cells and a colour, named by kind
  const KINDS = [
    { name: 'A COUPLE', cells: [[0, 0], [1, 0]], col: '#eeb0b8' },
    { name: 'THE FAMILY', cells: [[0, 0], [0, 1], [1, 1]], col: '#93aea2' },
    { name: 'FOUR FRIENDS', cells: [[0, 0], [1, 0], [2, 0], [3, 0]], col: '#d19a6e' },
    { name: 'THE WEDDING PARTY', cells: [[0, 0], [1, 0], [0, 1], [1, 1]], col: '#e8c07a' },
    { name: 'COLLEAGUES', cells: [[0, 0], [1, 0], [2, 0], [2, 1]], col: '#8fa8d9' },
    { name: 'THE COUSINS', cells: [[1, 0], [2, 0], [0, 1], [1, 1]], col: '#c9a667' },
    { name: 'THE IN-LAWS', cells: [[0, 0], [1, 0], [2, 0], [1, 1]], col: '#b9a7e0' },
    { name: 'A PLUS-ONE', cells: [[0, 0]], col: '#f4efe1', rare: true },
    { name: 'NONNA', cells: [[0, 0], [0, 1]], col: '#2b2520', outline: '#f4efe1', nonna: true, rare: true }
  ];
  const drawMap = (c, map, x, y, pal) => map.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) { const k = row[rx]; if (k === '.' || !pal[k]) continue; c.fillStyle = pal[k]; c.fillRect(x + rx, y + ry, 1, 1); } });
  const rot = (cells) => { const r = cells.map(([x, y]) => [-y, x]); const mx = Math.min(...r.map((p) => p[0])), my = Math.min(...r.map((p) => p[1])); return r.map(([x, y]) => [x - mx, y - my]); };

  Arcade.games.seating = { title: 'The Seating Chart', w: W, h: H, create(api) {
    const S = {}, WON_TITLE = 'EVERYONE SEATED', OVER_TITLE = 'THE VENUE IS FULL';
    function reset() { Object.assign(S, { boarded: false, mode: 'title', t: 0, score: 0, tables: 0, level: 1, grid: Array.from({ length: ROWS }, () => Array(COLS).fill(null)), piece: null, next: null, fall: 0, msg: null, msgT: 0, clearing: [], clearT: 0, lock: 0, ready: 0, over: false, bag: [] });
      S.next = pick(); spawn(); }
    function pick() {
      if (Math.random() < 0.09) return { ...KINDS[7], cells: KINDS[7].cells.map((p) => p.slice()) };
      if (Math.random() < 0.05) return { ...KINDS[8], cells: KINDS[8].cells.map((p) => p.slice()) };
      if (!S.bag.length) S.bag = [0, 1, 2, 3, 4, 5, 6].sort(() => Math.random() - 0.5);
      const k = KINDS[S.bag.pop()]; return { ...k, cells: k.cells.map((p) => p.slice()) };
    }
    function spawn() { S.piece = S.next; S.next = pick(); const p = S.piece; p.x = Math.floor((COLS - (Math.max(...p.cells.map((q) => q[0])) + 1)) / 2); p.y = 0; if (!fits(p, p.x, p.y, p.cells)) { S.over = true; S.mode = 'over'; } S.msg = p.name + (p.nonna ? ' · SEAT HER GENTLY' : ''); S.msgT = 1.4; }
    const fits = (p, x, y, cells) => cells.every(([cx, cy]) => { const gx = x + cx, gy = y + cy; return gx >= 0 && gx < COLS && gy < ROWS && (gy < 0 || !S.grid[gy][gx]); });
    function lockPiece() {
      const p = S.piece; p.cells.forEach(([cx, cy]) => { if (p.y + cy >= 0) S.grid[p.y + cy][p.x + cx] = { col: p.col, outline: p.outline }; });
      const full = []; for (let y = 0; y < ROWS; y++) if (S.grid[y].every(Boolean)) full.push(y);
      if (full.length) { S.clearing = full; S.clearT = 0.45; const pts = [0, 100, 300, 500, 800][full.length] * S.level * (p.nonna ? 2 : 1); S.score += pts; S.tables += full.length; S.msg = (full.length > 1 ? full.length + ' TABLES! ' : 'TAVOLO PIENO! ') + '+' + pts; S.msgT = 1.6;
        if (S.tables >= S.level * 10) { S.level++; S.msg = 'THE BAND STRIKES UP · LEVEL ' + S.level; S.msgT = 2; } }
      else spawn();
    }
    const stepTime = () => Math.max(0.12, 0.8 - (S.level - 1) * 0.08) * (S.piece && S.piece.nonna ? 1.6 : 1);
    function update(dt, input) {
      S.t += dt;
      if (Arcade.board.on) { Arcade.board.update(dt, input); return; }
      if ((S.mode === 'over' || S.mode === 'won') && !S.boarded) { S.boarded = true; Arcade.board.open('seating', S.score, { title: S.mode === 'won' ? WON_TITLE : OVER_TITLE, sub: S.tables + ' TABLES SEATED' }); return; }
      if (S.mode === 'title') { if (input.hit('start') || input.hit('jump')) { S.mode = 'ready'; S.ready = 2.2; } return; }
      if (S.mode === 'ready') { S.ready -= dt; if (S.ready <= 0 || input.hit('start') || input.hit('jump')) S.mode = 'play'; return; }
      if (S.mode === 'over' || S.mode === 'won') { if (input.hit('start') || input.hit('jump')) reset(); return; }
      if (S.msgT > 0) S.msgT -= dt;
      if (S.clearing.length) { S.clearT -= dt; if (S.clearT <= 0) { S.clearing.sort((a, b) => a - b).forEach((y) => { S.grid.splice(y, 1); S.grid.unshift(Array(COLS).fill(null)); }); S.clearing = []; spawn(); } return; }
      const p = S.piece;
      if (input.hit('left') && fits(p, p.x - 1, p.y, p.cells)) p.x--;
      if (input.hit('right') && fits(p, p.x + 1, p.y, p.cells)) p.x++;
      if (input.hit('up')) { const r = rot(p.cells); if (fits(p, p.x, p.y, r)) p.cells = r; else if (fits(p, p.x - 1, p.y, r)) { p.x--; p.cells = r; } else if (fits(p, p.x + 1, p.y, r)) { p.x++; p.cells = r; } }
      if (input.hit('jump')) { while (fits(p, p.x, p.y + 1, p.cells)) { p.y++; S.score += 2; } lockPiece(); return; }
      S.fall += dt * (input.is('down') ? 8 : 1);
      if (S.fall >= stepTime()) { S.fall = 0; if (fits(p, p.x, p.y + 1, p.cells)) { p.y++; if (input.is('down')) S.score += 1; } else lockPiece(); }
    }

    // ---- drawing
    const cell = (c, gx, gy, col, outline, dim) => { const x = OX + gx * CELL, y = OY + gy * CELL; c.fillStyle = col; c.fillRect(x + 1, y + 1, CELL - 2, CELL - 2); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(x + 1, y + 1, CELL - 2, 2); c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x + 1, y + CELL - 3, CELL - 2, 2); if (outline) { c.strokeStyle = outline; c.lineWidth = 1; c.strokeRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3); } if (dim) { c.fillStyle = 'rgba(20,12,6,.5)'; c.fillRect(x + 1, y + 1, CELL - 2, CELL - 2); } };
    function hall(c) {
      c.fillStyle = C.dark; c.fillRect(0, 0, W, H);
      c.fillStyle = C.floor; c.fillRect(OX, OY, COLS * CELL, ROWS * CELL);
      c.fillStyle = C.line; for (let x = 0; x <= COLS; x++) c.fillRect(OX + x * CELL, OY, 1, ROWS * CELL); for (let y = 0; y <= ROWS; y++) c.fillRect(OX, OY + y * CELL, COLS * CELL, 1);
      c.fillStyle = C.gold; c.fillRect(OX - 3, OY - 3, COLS * CELL + 6, 3); c.fillRect(OX - 3, OY + ROWS * CELL, COLS * CELL + 6, 3); c.fillRect(OX - 3, OY - 3, 3, ROWS * CELL + 6); c.fillRect(OX + COLS * CELL, OY - 3, 3, ROWS * CELL + 6);
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const g = S.grid[y][x]; if (g) cell(c, x, y, g.col, g.outline, false); }
      S.clearing.forEach((y) => { if (Math.floor(S.t * 12) % 2) { c.fillStyle = C.white; c.fillRect(OX, OY + y * CELL, COLS * CELL, CELL); } });
      const p = S.piece; if (p && !S.clearing.length && S.mode === 'play') {
        let gy = p.y; while (fits(p, p.x, gy + 1, p.cells)) gy++;                                      // the ghost: where it will land
        p.cells.forEach(([cx, cy]) => { if (gy + cy >= 0) { c.strokeStyle = 'rgba(244,239,225,.35)'; c.strokeRect(OX + (p.x + cx) * CELL + 1.5, OY + (gy + cy) * CELL + 1.5, CELL - 3, CELL - 3); } });
        p.cells.forEach(([cx, cy]) => { if (p.y + cy >= 0) cell(c, p.x + cx, p.y + cy, p.col, p.outline, false); });
      }
    }
    function side(c) {
      const x0 = OX + COLS * CELL + 12;
      api.text(c, 'NEXT', x0, OY, C.gold);
      const n = S.next; if (n) n.cells.forEach(([cx, cy]) => { const x = x0 + cx * 10, y = OY + 12 + cy * 10; c.fillStyle = n.col; c.fillRect(x, y, 9, 9); if (n.outline) { c.strokeStyle = n.outline; c.strokeRect(x + 0.5, y + 0.5, 8, 8); } });
      api.text(c, 'TABLES', x0, OY + 66, C.gold); api.text(c, String(S.tables), x0, OY + 76, C.text);
      api.text(c, 'LEVEL', x0, OY + 96, C.gold); api.text(c, String(S.level), x0, OY + 106, C.text);
      api.text(c, 'SCORE', x0, OY + 126, C.gold); api.text(c, String(S.score), x0, OY + 136, C.text);
      if (S.level > 1) { api.text(c, 'THE BAND', x0, OY + 166, C.dim); api.text(c, 'IS ON', x0, OY + 176, C.dim); }
    }
    function big(c, s, x, y, col, scale = 2) { c.save(); c.translate(x, y); c.scale(scale, scale); api.text(c, s, 0, 0, col, 'center'); c.restore(); }
    function drawTitle(c, t) {
      c.fillStyle = C.dark; c.fillRect(0, 0, W, H); c.fillStyle = C.burg; c.fillRect(0, 0, W, 10); c.fillRect(0, H - 10, W, 10);
      big(c, 'THE SEATING', W / 2, 40, C.gold, 3); big(c, 'CHART', W / 2, 66, C.gold, 3);
      api.text(c, 'ANTHONY & KELLY PRESENT', W / 2, 98, C.dim, 'center');
      // a few groups drifting down, as on the table plan
      [[KINDS[0], 40, 120], [KINDS[1], 90, 128], [KINDS[2], 130, 118], [KINDS[3], 176, 126]].forEach(([k, x, y], i) => { const dy = ((t * 18 + i * 20) % 60); k.cells.forEach(([cx, cy]) => { c.fillStyle = k.col; c.fillRect(x + cx * 10, y + dy + cy * 10, 9, 9); }); });
      api.text(c, 'THE GUESTS ARRIVE IN GROUPS.', W / 2, 200, C.text, 'center'); api.text(c, 'SEAT THEM. FILL A TABLE TO CLEAR IT.', W / 2, 210, C.text, 'center');
      if (Math.floor(t * 2) % 2) api.text(c, 'PRESS START', W / 2, 236, C.gold, 'center');
      api.text(c, (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) ? 'ARROWS MOVE · UP TURNS · JUMP DROPS' : 'ARROWS MOVE · UP TURNS · SPACE DROPS', W / 2, 262, C.dim, 'center');
    }
    function draw(c) { drawGame(c); Arcade.board.draw(c); }
    function drawGame(c) {
      if (S.mode === 'title') { drawTitle(c, S.t); return; }
      hall(c); side(c);
      c.fillStyle = C.burg; c.fillRect(0, 0, W, 22); api.text(c, 'THE SEATING CHART', W / 2, 4, C.text, 'center'); api.text(c, 'VILLA CETINALE · 24 APRIL 2027', W / 2, 13, C.gold, 'center');
      if (S.msgT > 0 && S.msg) {                                        // the caption in the side panel, wrapped by word, off the hall
        const x0 = OX + COLS * CELL + 12, lines = []; let line = '';
        S.msg.split(' ').forEach((w) => { if ((line + ' ' + w).trim().length > 14 && line) { lines.push(line); line = w; } else line = (line + ' ' + w).trim(); }); lines.push(line);
        lines.slice(0, 4).forEach((l, i) => api.text(c, l, x0, OY + 196 + i * 10, C.gold));
      }
      if (S.mode === 'ready') { c.fillStyle = 'rgba(20,12,6,.85)'; c.fillRect(16, 90, W - 32, 90); c.strokeStyle = C.gold; c.strokeRect(16.5, 90.5, W - 33, 89); api.text(c, 'ARROWS MOVE · UP TURNS', W / 2, 100, C.text, 'center'); api.text(c, 'DOWN HURRIES · SPACE SEATS THEM', W / 2, 110, C.text, 'center'); api.text(c, 'A FULL ROW IS A FULL TABLE', W / 2, 124, C.gold, 'center'); api.text(c, 'PLUS-ONES ARE EASY. NONNA IS SLOW', W / 2, 134, C.dim, 'center'); api.text(c, 'AND WORTH DOUBLE.', W / 2, 144, C.dim, 'center'); big(c, 'READY?', W / 2, 158, C.gold); }
      if (S.mode === 'over' && !Arcade.board.on) { c.fillStyle = 'rgba(20,12,6,.8)'; c.fillRect(0, 100, W, 80); big(c, 'THE VENUE', W / 2, 112, C.red); big(c, 'IS FULL', W / 2, 132, C.red); api.text(c, S.tables + ' TABLES · SCORE ' + S.score, W / 2, 158, C.text, 'center'); api.text(c, 'START TO TRY AGAIN', W / 2, 170, C.dim, 'center'); }
    }
    reset();
    return { update, draw, drawTitle, debug: { S, start() { reset(); S.mode = 'play'; } } };
  } };
})();
