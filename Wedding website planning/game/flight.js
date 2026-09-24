// FLIGHT TO SIENA — a one-button flier for the museum's arcade. Tap to lift the plane; gravity does the rest.
// Fly through the wedding rings drifting toward you (+10 each; clip a ring and it costs a life), past the storm
// clouds and the birds, over the Tuscan hills as the day goes from dawn to dusk. Thirty rings and the villa
// comes into view: land, and you have arrived.
// Sprites: plane-plain.png (the plane), ring.png, cloud.png (the rain cloud, until a storm cloud arrives),
// pigeon-flying.png (the bird, until a swallow arrives). The pilot is the bride or the groom.
(function () {
  const W = 224, H = 288, TOP = 24, GROUND = 250, GOAL = 30;
  const C = { text: '#f4efe1', gold: '#e8c07a', dim: '#a79c85', burg: '#7a1a3c', red: '#c0392b', white: '#fbf7ee', dark: '#2b2520', hill1: '#6b8a3a', hill2: '#4f6d2c', hill3: '#3a5424', cypress: '#22381f' };
  const SKIES = [['#8fb3d9', '#f3d9b0'], ['#7fb0e8', '#dfeefc'], ['#f0a46a', '#f7d7a0'], ['#4a3a6b', '#c96a6a']];   // dawn, day, evening, dusk: [top, horizon]
  const lerpHex = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return 'rgb(' + x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',') + ')'; };
  const BOLT = ['....yy..', '...yy...', '..yyyy..', '...yy...', '..yy....', '.yy.....'];
  const PAL = { y: '#f3dc9a' };
  const drawMap = (c, map, x, y, pal) => map.forEach((row, ry) => { for (let rx = 0; rx < row.length; rx++) { const k = row[rx]; if (k === '.' || !pal[k]) continue; c.fillStyle = pal[k]; c.fillRect(x + rx, y + ry, 1, 1); } });

  // the journey: where each stage begins (in rings), what its ground looks like, and the landmarks that pass
  // beneath (a landmark spawns when the ring count reaches `at`)
  const STAGES = [
    { name: 'NEW YORK', from: 0, ground: 'city', marks: [{ at: 1, kind: 'liberty' }, { at: 3, kind: 'skyline' }] },
    { name: 'THE ATLANTIC', from: 6, ground: 'sea', marks: [{ at: 8, kind: 'ship' }, { at: 12, kind: 'whale' }] },
    { name: 'THE ALPS', from: 15, ground: 'alps', marks: [{ at: 16, kind: 'eiffel' }] },
    { name: 'ITALIA', from: 21, ground: 'italy', marks: [{ at: 22, kind: 'colosseum' }, { at: 25, kind: 'pisa' }] },
    { name: 'TOSCANA', from: 27, ground: 'tuscany', marks: [] }
  ];
  const GROUND_COL = { city: '#3a3d4a', sea: '#2d6a9e', alps: '#7d8a96', italy: '#5f8a3a', tuscany: '#a8503a' };
  Arcade.games.flight = { title: 'Flight to Siena', w: W, h: H, create(api) {
    const pic = (n, fb) => api.image('/assets/game/' + n + '.png', fb);
    const ART = { plane: pic('plane-plain', (c, x, y, w, h) => { c.fillStyle = C.white; c.fillRect(x, y + h / 2 - 2, w, 4); c.fillRect(x + w - 8, y, 4, h / 2); }),
      ring: pic('ring', (c, x, y, w, h) => { c.strokeStyle = C.gold; c.lineWidth = 3; c.beginPath(); c.ellipse(x + w / 2, y + h / 2, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2); c.stroke(); }),
      storm: pic('storm', (c, x, y, w, h) => { c.fillStyle = '#5a5a6a'; c.beginPath(); c.ellipse(x + w / 2, y + h * 0.45, w / 2, h * 0.4, 0, 0, Math.PI * 2); c.fill(); drawMap(c, BOLT, x + w / 2 - 4, y + h * 0.7, PAL); }),
      cloud: pic('cloud'), bird: pic('swallow', null), pigeon: pic('pigeon-flying', (c, x, y, w, h) => { c.fillStyle = '#8a8a94'; c.fillRect(x, y + h / 2, w, 2); c.fillRect(x + w / 2 - 2, y, 4, h); }),
      liberty: pic('liberty', (c, x, y, w, h) => { c.fillStyle = '#6f8f7a'; c.fillRect(x + w * 0.3, y + h * 0.7, w * 0.4, h * 0.3); c.fillStyle = '#8fbf9f'; c.fillRect(x + w * 0.36, y + h * 0.3, w * 0.28, h * 0.42); c.fillRect(x + w * 0.42, y + h * 0.2, w * 0.16, h * 0.12); for (let i = 0; i < 5; i++) c.fillRect(x + w * 0.4 + i * w * 0.05, y + h * 0.12, 1, h * 0.09); c.fillRect(x + w * 0.62, y + h * 0.08, w * 0.08, h * 0.3); c.fillStyle = '#f3dc9a'; c.fillRect(x + w * 0.6, y + h * 0.02, w * 0.12, h * 0.07); }),
      skyline: pic('skyline', (c, x, y, w, h) => { c.fillStyle = '#2b2f3c'; [[0, 0.5], [0.14, 0.2], [0.3, 0.65], [0.42, 0.1], [0.56, 0.45], [0.7, 0.3], [0.86, 0.55]].forEach(([fx, top]) => { c.fillRect(x + w * fx, y + h * top, w * 0.12, h * (1 - top)); }); c.fillStyle = '#f3dc9a'; for (let i = 0; i < 26; i++) c.fillRect(x + 2 + (i * 7) % (w - 4), y + h * 0.25 + (i * 11) % (h * 0.7), 1, 1); }),
      ship: pic('ship', (c, x, y, w, h) => { c.fillStyle = '#2b2520'; c.beginPath(); c.moveTo(x, y + h * 0.6); c.lineTo(x + w, y + h * 0.6); c.lineTo(x + w * 0.92, y + h); c.lineTo(x + w * 0.08, y + h); c.closePath(); c.fill(); c.fillStyle = C.white; c.fillRect(x + w * 0.2, y + h * 0.35, w * 0.6, h * 0.25); c.fillStyle = C.red; [0.35, 0.55].forEach((fx) => c.fillRect(x + w * fx, y + h * 0.1, w * 0.08, h * 0.25)); c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(x + w * 0.3, y, 6, 3); c.fillRect(x + w * 0.5, y - 2, 5, 3); }),
      whale: pic('whale', (c, x, y, w, h) => { c.fillStyle = '#3b4f66'; c.beginPath(); c.ellipse(x + w * 0.45, y + h * 0.6, w * 0.4, h * 0.35, 0, 0, Math.PI * 2); c.fill(); c.fillRect(x + w * 0.8, y + h * 0.3, w * 0.12, h * 0.15); c.fillRect(x + w * 0.85, y + h * 0.15, w * 0.15, h * 0.12); c.fillStyle = '#cfe6f5'; c.fillRect(x + w * 0.3, y, 2, h * 0.3); c.fillRect(x + w * 0.24, y - 3, 2, h * 0.2); c.fillRect(x + w * 0.36, y - 3, 2, h * 0.2); }),
      eiffel: pic('eiffel', (c, x, y, w, h) => { c.fillStyle = '#6b5a4a'; for (let i = 0; i < 8; i++) { const t = i / 8, ww = w * (0.12 + 0.88 * t * t); c.fillRect(x + (w - ww) / 2, y + h * t, ww, h / 8 + 1); } c.fillStyle = '#8a7a6a'; [0.35, 0.62].forEach((t) => { const ww = w * (0.12 + 0.88 * t * t); c.fillRect(x + (w - ww) / 2 - 2, y + h * t, ww + 4, 2); }); c.fillStyle = '#e9dfc6'; for (let i = 1; i < 7; i++) { const t = i / 8, ww = w * (0.12 + 0.88 * t * t); c.fillRect(x + (w - ww) / 2 + ww * 0.5 - 1, y + h * t + 2, 2, 2); } }),
      colosseum: pic('colosseum', (c, x, y, w, h) => { c.fillStyle = '#c9b28a'; c.beginPath(); c.ellipse(x + w / 2, y + h * 0.4, w / 2, h * 0.4, 0, Math.PI, 0); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath(); c.fill(); c.fillStyle = '#7a6a4a'; [0.42, 0.65, 0.86].forEach((row) => { for (let i = 0; i < 8; i++) c.fillRect(x + 3 + i * (w - 6) / 8, y + h * row, 3, h * 0.12); }); c.fillStyle = '#a89470'; c.fillRect(x, y + h * 0.2, w * 0.35, h * 0.12); }),
      pisa: pic('pisa', (c, x, y, w, h) => { const lean = w * 0.3; for (let i = 0; i < 7; i++) { const t = i / 7; c.fillStyle = i % 2 ? '#f4efe1' : '#d8ccb0'; c.fillRect(x + lean * (1 - t) + w * 0.1, y + h * t, w * 0.5, h / 7 + 1); } c.fillStyle = '#8f7a4a'; for (let i = 1; i < 7; i++) { const t = i / 7; c.fillRect(x + lean * (1 - t) + w * 0.1, y + h * t, w * 0.5, 1); } }),
      villa: pic('villa', (c, x, y, w, h) => { c.fillStyle = '#e9dfc6'; c.fillRect(x, y + h * 0.4, w, h * 0.6); c.fillStyle = '#b3513a'; c.fillRect(x - 2, y + h * 0.3, w + 4, h * 0.12); c.fillStyle = C.cypress; [-8, w + 4].forEach((dx) => { c.fillRect(x + dx, y + h * 0.15, 4, h * 0.85); }); }) };
    const stand = (col) => (c, f, x, y) => { c.fillStyle = col; c.fillRect(x + 11, y + 8, 10, 20); c.fillStyle = '#f1c9a5'; c.fillRect(x + 12, y + 4, 8, 7); };
    const sheets = { bride: api.sheet('/assets/game/bride.png', 32, 32, 9, stand('#fbf5ea')), groom: api.sheet('/assets/game/groom.png', 32, 32, 9, stand('#2b2520')) };
    const S = {};
    function reset() { Object.assign(S, { mode: 'title', who: 'bride', sel: 0, t: 0, lives: 3, score: 0, rings: 0, best: 0, ready: 0, msg: null, msgT: 0, p: { y: 120, vy: 0, hit: 0, tilt: 0 }, things: [], spawn: 1.2, dist: 0, landed: 0, hills: [], stage: 0, seam: -100, caption: STAGES[0].name, captionT: 3, marks: [] });
      for (let i = 0; i < 3; i++) S.hills.push({ off: 0, speed: 8 + i * 8, amp: 10 + i * 6, phase: i * 1.7, base: GROUND - 10 - i * 14 }); }
    reset();
    STAGES.forEach((st) => st.marks.forEach((m) => { m.done = false; }));
    const other = () => (S.who === 'bride' ? 'groom' : 'bride');
    const say = (m, t = 0.9) => { S.msg = m; S.msgT = t; };
    const hurt = (m) => { if (S.p.hit > 0) return; S.p.hit = 1.1; S.lives--; say(m, 1.1); if (S.lives <= 0) S.mode = 'over'; };
    const PX = 44, PW = 28, PH = 14;                                   // the plane's place on screen and its body
    const hitBox = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

    function update(dt, input) {
      S.t += dt; const p = S.p;
      if (S.mode === 'title') { if (input.hit('start') || input.hit('jump')) S.mode = 'select'; return; }
      if (S.mode === 'select') { if (input.hit('left') || input.hit('right')) S.sel = 1 - S.sel; if (input.hit('start') || input.hit('jump')) { S.who = S.sel ? 'groom' : 'bride'; S.mode = 'ready'; S.ready = 2.4; } return; }
      if (S.mode === 'ready') { S.ready -= dt; if (S.ready <= 0 || input.hit('jump')) { S.mode = 'play'; p.vy = -70; } return; }
      if (S.mode === 'over' || S.mode === 'won') { if (input.hit('start') || input.hit('jump')) { const who = S.who; reset(); S.mode = 'select'; S.sel = who === 'groom' ? 1 : 0; } return; }
      if (S.msgT > 0) S.msgT -= dt;
      const speed = 70 + Math.min(40, S.rings * 1.5);
      S.dist += speed * dt; S.hills.forEach((h) => { h.off += h.speed * dt; });
      // ---- the plane
      if (S.mode === 'landing') {                                        // the villa is here: glide down to the strip
        p.vy += (60 - p.vy) * 0.05; p.y += p.vy * dt; p.tilt = 0.25;
        S.landed += dt; if (p.y >= GROUND - 30) { p.y = GROUND - 30; if (S.landed > 1.2) { S.score += S.lives * 200; S.mode = 'won'; } }
        S.things.forEach((o) => { o.x -= speed * 0.6 * dt; }); return;
      }
      if (p.hit > 0) p.hit -= dt;
      if (input.hit('jump') || input.hit('up')) p.vy = -150;
      p.vy += 420 * dt; p.y += p.vy * dt; p.tilt = Math.max(-0.5, Math.min(0.6, p.vy / 250));
      if (p.y < TOP + 4) { p.y = TOP + 4; p.vy = 0; }
      if (p.y > GROUND - PH - 6) { p.y = GROUND - PH - 6; p.vy = -120; hurt('TOO LOW!'); }
      // ---- what comes at you
      S.spawn -= dt;
      if (S.spawn <= 0) {
        S.spawn = 1.35 + Math.random() * 0.6 - Math.min(0.5, S.rings * 0.015);
        const r = Math.random(), y = TOP + 20 + Math.random() * (GROUND - TOP - 80);
        if (r < 0.55) S.things.push({ kind: 'ring', x: W + 20, y, w: 26, h: 30, passed: false, bob: Math.random() * 6.28 });
        else if (r < 0.8) S.things.push({ kind: 'storm', x: W + 20, y: TOP + 10 + Math.random() * 90, w: 34, h: 24, vx: -10 });
        else S.things.push({ kind: 'bird', x: W + 20, y: TOP + 30 + Math.random() * (GROUND - TOP - 90), w: 16, h: 12, vx: -40, flap: 0 });
      }
      S.things.forEach((o) => { o.x -= (speed + (o.vx || 0)) * dt; if (o.kind === 'ring') o.y += Math.sin(S.t * 2 + o.bob) * 8 * dt; if (o.kind === 'bird') o.flap += dt; });
      // ---- the journey below
      const next = STAGES[S.stage + 1];
      if (next && S.rings >= next.from) { S.stage++; S.seam = W + 10; S.caption = next.name; S.captionT = 3; }
      if (S.seam > -120) S.seam -= speed * 0.6 * dt;
      if (S.captionT > 0) S.captionT -= dt;
      STAGES[S.stage].marks.forEach((m) => { if (!m.done && S.rings >= m.at) { m.done = true; S.marks.push({ kind: m.kind, x: W + 30, w: m.kind === 'skyline' ? 90 : m.kind === 'ship' ? 60 : m.kind === 'whale' ? 40 : m.kind === 'colosseum' ? 64 : 34, h: m.kind === 'skyline' ? 60 : m.kind === 'ship' ? 26 : m.kind === 'whale' ? 16 : m.kind === 'eiffel' ? 70 : m.kind === 'pisa' ? 48 : m.kind === 'colosseum' ? 34 : 54 }); } });
      S.marks.forEach((m) => { m.x -= speed * 0.6 * dt; }); S.marks = S.marks.filter((m) => m.x > -120);
      // ---- collisions: through the ring is a score, its edge is a hit; clouds and birds are hits
      const px = PX + 4, py = p.y + 3, pw = PW - 8, ph = PH - 4;
      S.things.forEach((o) => {
        if (o.dead) return;
        if (o.kind === 'ring') {
          if (!o.passed && o.x + o.w / 2 < PX + PW / 2) {                 // the plane's centre has crossed the ring's centre
            o.passed = true;
            const inside = p.y + PH / 2 > o.y + 6 && p.y + PH / 2 < o.y + o.h - 6 && p.hit <= 0;
            if (inside) { S.rings++; S.score += 10; say(S.rings % 10 === 0 ? S.rings + ' RINGS!' : 'RING!', 0.6); if (S.rings >= GOAL) { S.mode = 'landing'; S.things.push({ kind: 'villa', x: W + 40, y: GROUND - 62, w: 56, h: 60 }); } }
            else if (p.hit <= 0 && hitBox(px, py, pw, ph, o.x, o.y, o.w, o.h)) hurt('CLIPPED IT!');
          }
        } else if (o.kind !== 'villa' && p.hit <= 0 && hitBox(px, py, pw, ph, o.x + 3, o.y + 3, o.w - 6, o.h - 6)) { hurt(o.kind === 'storm' ? 'TURBULENCE!' : 'BIRD STRIKE!'); o.dead = true; }
      });
      S.things = S.things.filter((o) => !o.dead && o.x > -80);
    }

    // ---- drawing
    function sky(c) {
      const k = Math.min(1, S.rings / GOAL) * 3, i = Math.min(2, Math.floor(k)), f = k - i;
      const g = c.createLinearGradient(0, TOP, 0, GROUND); g.addColorStop(0, lerpHex(SKIES[i][0], SKIES[i + 1][0], f)); g.addColorStop(1, lerpHex(SKIES[i][1], SKIES[i + 1][1], f));
      c.fillStyle = g; c.fillRect(0, 0, W, GROUND);
      if (k > 2.2) { c.fillStyle = C.white; [[30, 40], [90, 60], [150, 35], [200, 70], [60, 90]].forEach(([x, y]) => c.fillRect(x, y, 1, 1)); }
      c.fillStyle = k < 1.5 ? '#fff3c4' : '#f3dc9a'; c.beginPath(); c.arc(190 - k * 20, 70 - Math.sin(k / 3 * Math.PI) * 30, 9, 0, Math.PI * 2); c.fill();
      // the ground of this stage, and of the last one still sliding out to the left of the seam
      const drawGround = (kind, x0, x1) => { c.save(); c.beginPath(); c.rect(x0, TOP, x1 - x0, H - TOP); c.clip(); terrain(c, kind); c.restore(); };
      if (S.seam > -120 && S.stage > 0) { drawGround(STAGES[S.stage - 1].ground, 0, Math.max(0, S.seam)); drawGround(STAGES[S.stage].ground, Math.max(0, S.seam), W); }
      else drawGround(STAGES[S.stage].ground, 0, W);
      S.marks.forEach((m) => ART[m.kind].draw(c, Math.round(m.x), GROUND - m.h - (m.kind === 'ship' || m.kind === 'whale' ? -6 : 2), m.w, m.h, false));
    }
    function terrain(c, kind) {
      const d = S.dist;
      if (kind === 'city') {                                             // a skyline of towers, lit windows, a dark street
        for (let i = -1; i < 12; i++) { const wx = i * 22 - ((d * 0.6) % 22), hh = 20 + ((i * 7919) % 5) * 9; c.fillStyle = i % 2 ? '#2b2f3c' : '#363b4a'; c.fillRect(wx, GROUND - hh, 18, hh); c.fillStyle = '#f3dc9a'; for (let k = 0; k < hh / 6; k++) if ((i * 31 + k * 17) % 3 === 0) c.fillRect(wx + 3 + (k % 3) * 5, GROUND - hh + 3 + k * 6, 2, 2); }
      } else if (kind === 'sea') {                                       // open water: bands of blue and running wave-lines
        c.fillStyle = '#4a8fc4'; c.fillRect(0, GROUND - 26, W, 26); c.fillStyle = '#3b7bb0'; c.fillRect(0, GROUND - 14, W, 14);
        c.fillStyle = '#cfe6f5'; for (let i = -1; i < 16; i++) { const wx = i * 16 - ((d * 0.9) % 16); c.fillRect(wx, GROUND - 22 + Math.sin(i + S.t * 2) * 1.5, 7, 1); c.fillRect(wx + 8 - ((d * 0.5) % 16), GROUND - 9, 5, 1); }
      } else if (kind === 'alps') {                                      // grey peaks with snow on top
        for (let i = -1; i < 7; i++) { const wx = i * 40 - ((d * 0.5) % 40), hh = 34 + ((i * 104729) % 4) * 8; c.fillStyle = i % 2 ? '#7d8a96' : '#6a7683'; c.beginPath(); c.moveTo(wx, GROUND); c.lineTo(wx + 20, GROUND - hh); c.lineTo(wx + 40, GROUND); c.closePath(); c.fill(); c.fillStyle = C.white; c.beginPath(); c.moveTo(wx + 12, GROUND - hh * 0.6); c.lineTo(wx + 20, GROUND - hh); c.lineTo(wx + 28, GROUND - hh * 0.6); c.closePath(); c.fill(); }
        c.fillStyle = '#5b8a3a'; c.fillRect(0, GROUND - 8, W, 8);
      } else if (kind === 'italy') {                                     // greener hills and umbrella pines
        S.hills.forEach((h, i) => { c.fillStyle = ['#7fa04a', '#5f8a3a', '#46702a'][i]; c.beginPath(); c.moveTo(0, GROUND); for (let x = 0; x <= W; x += 4) c.lineTo(x, h.base - Math.sin((x + h.off) / 30 + h.phase) * h.amp * 0.6); c.lineTo(W, GROUND); c.closePath(); c.fill(); });
        for (let x = ((-d * 0.6) % 70 + 70) % 70; x < W; x += 70) { c.fillStyle = '#5a4a38'; c.fillRect(x + 4, GROUND - 22, 2, 14); c.fillStyle = '#2f5a2a'; c.beginPath(); c.ellipse(x + 5, GROUND - 24, 9, 5, 0, 0, Math.PI * 2); c.fill(); }
      } else {                                                           // Tuscany: hills, three layers, rolling by at different speeds, with cypresses on the nearest
        S.hills.forEach((h, i) => {
        c.fillStyle = [C.hill1, C.hill2, C.hill3][i];
        c.beginPath(); c.moveTo(0, GROUND);
        for (let x = 0; x <= W; x += 4) c.lineTo(x, h.base - Math.sin((x + h.off) / 38 + h.phase) * h.amp - Math.sin((x + h.off) / 13) * 3);
        c.lineTo(W, GROUND); c.closePath(); c.fill();
        if (i === 2) for (let x = ((-h.off * 1.4) % 48 + 48) % 48; x < W; x += 48) { const y = h.base - Math.sin((x + h.off) / 38 + h.phase) * h.amp - Math.sin((x + h.off) / 13) * 3; c.fillStyle = C.cypress; c.fillRect(x, y - 12, 3, 12); c.fillRect(x - 1, y - 9, 5, 6); }
      });
      }
      c.fillStyle = GROUND_COL[kind]; c.fillRect(0, GROUND, W, H - GROUND);
      if (kind !== 'sea') { c.fillStyle = 'rgba(0,0,0,.18)'; for (let x = ((-S.dist) % 16 + 16) % 16; x < W; x += 16) c.fillRect(x, GROUND + 6, 8, 1); }
    }
    function plane(c, x, y, tilt, who) {
      c.save(); c.translate(x + PW / 2, y + PH / 2); c.rotate(tilt); ART.plane.draw(c, -PW / 2, -PH / 2, PW, PH, true); c.restore();
      // the pilot's face in the cockpit window: the head of the chosen sprite, cropped
      c.save(); c.beginPath(); c.arc(x + PW - 7, y + 5, 3.5, 0, Math.PI * 2); c.clip(); sheets[who].draw(c, 0, x + PW - 7 - 16, y + 5 - 8, false); c.restore();
    }
    function hud(c) {
      c.fillStyle = C.burg; c.fillRect(0, 0, W, TOP);
      api.text(c, 'SCORE ' + Math.floor(S.score), 4, 3, C.text); api.text(c, 'RINGS ' + S.rings + ' / ' + GOAL, 4, 13, C.gold);
      api.text(c, 'FLIGHT TO SIENA', 112, 8, C.text, 'center');
      for (let i = 0; i < 3; i++) { c.fillStyle = i < S.lives ? C.red : '#4a2a2a'; c.fillRect(W - 8 - i * 8, 5, 5, 4); c.fillRect(W - 7 - i * 8, 4, 3, 1); }
    }
    function scene(c) {
      sky(c);
      S.things.forEach((o) => {
        if (o.kind === 'ring') ART.ring.draw(c, Math.round(o.x), Math.round(o.y), o.w, o.h, false);
        else if (o.kind === 'storm') { if (ART.storm.ok) ART.storm.draw(c, Math.round(o.x), Math.round(o.y), o.w, o.h, false); else { ART.cloud.draw(c, Math.round(o.x), Math.round(o.y), o.w, o.h, false); if (Math.floor(S.t * 5) % 3 === 0) drawMap(c, BOLT, Math.round(o.x) + o.w / 2 - 4, Math.round(o.y) + o.h - 4, PAL); } }
        else if (o.kind === 'bird') (ART.bird.ok ? ART.bird : ART.pigeon).draw(c, Math.round(o.x), Math.round(o.y) + Math.sin(o.flap * 12) * 2, o.w, o.h, false);
        else if (o.kind === 'villa') ART.villa.draw(c, Math.round(o.x), o.y, o.w, o.h, false);
      });
      if (S.captionT > 0) { const a = Math.min(1, S.captionT); c.globalAlpha = a; c.fillStyle = 'rgba(20,12,6,.55)'; const tw = S.caption.length * 5 + 16; c.fillRect(W - tw - 6, GROUND - 40, tw, 14); api.text(c, S.caption, W - 6 - tw / 2, GROUND - 36, C.gold, 'center'); c.globalAlpha = 1; }
      const p = S.p; if (!(p.hit > 0 && Math.floor(S.t * 12) % 2)) plane(c, PX, Math.round(p.y), p.tilt, S.who);
      hud(c);
      if (S.msgT > 0 && S.msg) { const y = Math.max(TOP + 6, p.y - 16); c.fillStyle = C.white; c.fillRect(PX - 10, y - 2, 64, 10); api.text(c, S.msg, PX + 22, y, C.burg, 'center'); }
    }
    function big(c, s, x, y, col, scale = 2) { c.save(); c.translate(x, y); c.scale(scale, scale); api.text(c, s, 0, 0, col, 'center'); c.restore(); }
    function drawTitle(c, t) {
      const saveR = S.rings; S.rings = 8; sky(c); S.rings = saveR; c.fillStyle = C.burg; c.fillRect(0, 0, W, 10);
      big(c, 'FLIGHT', W / 2, 40, C.gold, 3); big(c, 'TO SIENA', W / 2, 66, C.gold, 3);
      api.text(c, 'ANTHONY ALVAREZ & KELLY WHEELIS', W / 2, 98, C.dim, 'center');
      const ry = 150 + Math.sin(t * 1.3) * 10; ART.ring.draw(c, 150, ry, 26, 30, false); ART.ring.draw(c, 200, ry + 20, 26, 30, false);
      plane(c, 60, 150 + Math.sin(t * 2) * 8, Math.sin(t * 2) * 0.2, 'bride');
      api.text(c, 'TAP TO LIFT. FLY THROUGH THE RINGS,', W / 2, 200, C.dark, 'center'); api.text(c, 'PAST THE STORMS AND THE BIRDS.', W / 2, 210, C.dark, 'center');
      if (Math.floor(t * 2) % 2) api.text(c, 'PRESS START', W / 2, 232, C.burg, 'center');
      api.text(c, (typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches) ? 'JUMP LIFTS' : 'SPACE LIFTS', W / 2, 268, C.text, 'center');
    }
    function draw(c) {
      if (S.mode === 'title') { drawTitle(c, S.t); return; }
      if (S.mode === 'select') {
        c.fillStyle = C.dark; c.fillRect(0, 0, W, H); big(c, 'CHOOSE YOUR', W / 2, 60, C.gold); big(c, 'PILOT', W / 2, 80, C.gold);
        [['bride', 64, 'THE BRIDE'], ['groom', 160, 'THE GROOM']].forEach(([who, x, label], i) => {
          if (S.sel === i) { c.fillStyle = C.burg; c.fillRect(x - 24, 120, 48, 60); c.strokeStyle = C.gold; c.lineWidth = 1; c.strokeRect(x - 23.5, 120.5, 47, 59); }
          sheets[who].draw(c, S.sel === i ? 1 + (Math.floor(S.t * 6) % 2) : 0, x - 16, 128, false);
          api.text(c, label, x, 166, S.sel === i ? C.text : C.dim, 'center');
        });
        api.text(c, 'LEFT / RIGHT · THEN START', W / 2, 220, C.dim, 'center'); return;
      }
      scene(c);
      if (S.mode === 'ready') { c.fillStyle = 'rgba(20,12,6,.75)'; c.fillRect(16, 100, W - 32, 80); c.strokeStyle = C.gold; c.strokeRect(16.5, 100.5, W - 33, 79); api.text(c, 'TAP OR SPACE TO LIFT', W / 2, 112, C.text, 'center'); api.text(c, 'NEW YORK TO SIENA · ' + GOAL + ' RINGS', W / 2, 124, C.gold, 'center'); api.text(c, 'STORMS AND BIRDS COST A LIFE', W / 2, 136, C.dim, 'center'); big(c, 'READY?', W / 2, 152, C.gold); }
      if (S.mode === 'over') { c.fillStyle = 'rgba(20,12,6,.8)'; c.fillRect(0, 100, W, 80); big(c, 'DIVERTED', W / 2, 112, C.red); api.text(c, S.rings + ' RINGS · SCORE ' + Math.floor(S.score), W / 2, 140, C.text, 'center'); api.text(c, 'START TO FLY AGAIN', W / 2, 160, C.dim, 'center'); }
      if (S.mode === 'won') { c.fillStyle = 'rgba(20,12,6,.8)'; c.fillRect(0, 96, W, 96); big(c, 'ARRIVED', W / 2, 108, C.gold); api.text(c, 'SIENA · WELCOME TO THE WEDDING', W / 2, 134, C.text, 'center'); api.text(c, 'SCORE ' + Math.floor(S.score), W / 2, 150, C.gold, 'center'); api.text(c, 'START TO FLY AGAIN', W / 2, 176, C.dim, 'center'); }
    }
    return { update, draw, drawTitle, debug: { S, start(who) { reset(); STAGES.forEach((st) => st.marks.forEach((m) => { m.done = false; })); S.who = who || 'bride'; S.mode = 'play'; } } };
  } };
})();
