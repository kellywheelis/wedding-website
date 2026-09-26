{ if (typeof showNav === 'function') showNav();   // the harness skips the doors and the motto: show the compass and Turn around straight away
  const q = new URLSearchParams(location.search);
  if (q.has('x')) cam.x = +q.get('x');
  if (q.has('z')) cam.z = +q.get('z');
  if (q.has('yaw')) cam.yaw = +q.get('yaw');
  if (q.has('eye')) { cam.eye = wantEye = +q.get('eye'); }   // eye=1.0 : the camera's height off the floor (a crouch, for looking at small things closely)
  if (q.has('pitch')) { cam.pitch = wantPitch = +q.get('pitch'); }
  // headless virtual time never ticks the animation, so step it by hand after an action
  const settle = () => {
    const raf = window.requestAnimationFrame, now = performance.now, draw = renderer.render;
    let fake = now.call(performance);
    window.requestAnimationFrame = () => 0; performance.now = () => fake; renderer.render = () => {};
    for (let i = 0; i < 600 && (i < 2 || leg || queue.length || !settled()); i++) { fake += 40; frame(fake); }
    window.requestAnimationFrame = raf; performance.now = now; renderer.render = draw;
  };
  const tag = document.createElement('div');
  tag.style.cssText = 'position:fixed;left:8px;top:8px;z-index:99;background:#000;color:#0f0;font:16px monospace;padding:4px 8px';
  const report = (what) => { settle(); tag.textContent = what + ' -> station ' + idx + ' (' + STATIONS[idx].room + ') cam ' + cam.x.toFixed(2) + ',' + cam.z.toFixed(2) + ' yaw ' + cam.yaw.toFixed(2); document.body.appendChild(tag); };
  if (q.has('click')) {
    const [fx, fy] = q.get('click').split(',').map(Number);
    setTimeout(() => {
      const r = canvas.getBoundingClientRect();
      const cx = r.left + fx * r.width, cy = r.top + fy * r.height;
      camera.position.set(cam.x, cam.eye, cam.z); camera.rotation.set(cam.pitch, cam.yaw, 0, 'YXZ'); camera.updateMatrixWorld();
      const what = 'from ' + roomAt() + ' doorAt=' + doorAt(cx, cy);
      canvas.dispatchEvent(new MouseEvent('click', { clientX: cx, clientY: cy, bubbles: true }));
      report(what);
    }, 1200);
  }
  if (q.has('btn')) setTimeout(() => { document.querySelector('[data-room="' + q.get('btn') + '"]').click(); report('button ' + q.get('btn')); }, 1200);
}
{ const q = new URLSearchParams(location.search);
  if (q.has('motto')) { const m = document.getElementById('motto'); m.style.setProperty('display', 'grid', 'important'); m.style.transition = 'none'; m.style.opacity = '1'; } }
{ const q = new URLSearchParams(location.search);
  if (q.has('hover')) {
    const [fx, fy] = q.get('hover').split(',').map(Number);
    setTimeout(() => {
      const r = canvas.getBoundingClientRect();
      canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + fx * r.width, clientY: r.top + fy * r.height, bubbles: true }));
      const raf = window.requestAnimationFrame, draw = renderer.render;
      window.requestAnimationFrame = () => 0; renderer.render = () => {};
      for (let i = 0; i < 90; i++) frame(performance.now());
      window.requestAnimationFrame = raf; renderer.render = draw;
      const tag = document.createElement('div');
      tag.style.cssText = 'position:fixed;left:8px;top:8px;z-index:99;background:#000;color:#0f0;font:16px monospace;padding:4px 8px';
      tag.textContent = 'glow ' + glow.intensity.toFixed(2) + ' at ' + glow.position.toArray().map((v) => v.toFixed(2)).join(',') + ' cursor=' + (canvas.style.cursor || 'default');
      document.body.appendChild(tag);
    }, 1200);
  } }
{ const q = new URLSearchParams(location.search);
  if (q.has('gate')) document.getElementById('gate').style.setProperty('display', 'block', 'important'); }
{ const g = document.getElementById('gateGlow'); if (g) g.style.transition = 'none'; }
{ const q = new URLSearchParams(location.search);
  if (q.has('gate')) { const st = document.createElement('style'); st.textContent = '*{animation-duration:.001s !important;animation-delay:0s !important}'; document.head.appendChild(st); } }
{ const q = new URLSearchParams(location.search);
  if (q.has('ajar')) { // doors part-way open, to check the monogram splits cleanly with the leaves
    ['doorL', 'doorR'].forEach((id, i) => { const d = document.getElementById(id); d.style.transition = 'none'; d.style.transform = 'translateX(' + (i ? 18 : -18) + '%)'; });
    document.getElementById('gateCopy').style.opacity = '0'; } }
{ const q = new URLSearchParams(location.search);
  if (q.has('open')) setTimeout(() => {
    const a = document.getElementById('enter').parentElement, b = document.getElementById('skip').parentElement.parentElement;
    // freeze the state 300 ms after the click: no transitions, doors part-open, gate kept on screen
    [a, b, document.getElementById('gateCopy')].forEach((n) => { n.style.transition = 'none'; });
    document.getElementById('enter').click();
    [a, b, document.getElementById('gateCopy')].forEach((n) => { n.style.transition = 'none'; });   // jump fades to their end state
    ['doorL', 'doorR'].forEach((id, i) => { const d = document.getElementById(id); d.style.transition = 'none'; d.style.transform = 'translateX(' + (i ? 18 : -18) + '%)'; });
    const keep = setInterval(() => document.getElementById('gate').style.setProperty('display', 'block', 'important'), 50);
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;top:8px;z-index:99;background:#000;color:#0f0;font:16px monospace;padding:4px 8px';
    tag.textContent = 'enter wrap opacity=' + a.style.opacity + ' (children ' + a.children.length + ') skip wrap opacity=' + b.style.opacity + ' (children ' + b.children.length + ') gate children ' + document.getElementById('gate').children.length;
    document.body.appendChild(tag);
  }, 1200); }
{ const q = new URLSearchParams(location.search);
  document.getElementById('back').style.transition = 'none';
  if (q.has('back')) setTimeout(() => {
    const b = document.getElementById('back');
    const before = 'back button before click: opacity=' + b.style.opacity + ' pointer=' + b.style.pointerEvents + ' in ' + STATIONS[idx].room;
    b.click();
    const raf = window.requestAnimationFrame, now = performance.now, draw = renderer.render;
    let fake = now.call(performance);
    window.requestAnimationFrame = () => 0; performance.now = () => fake; renderer.render = () => {};
    for (let i = 0; i < 600 && (i < 2 || leg || queue.length || !settled()); i++) { fake += 40; frame(fake); }
    window.requestAnimationFrame = raf; performance.now = now; renderer.render = draw;
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99;background:#000;color:#ff0;font:16px monospace;padding:4px 8px';
    tag.textContent = before + ' | after: ' + STATIONS[idx].room + ' cam ' + cam.x.toFixed(2) + ',' + cam.z.toFixed(2) + ' yaw ' + cam.yaw.toFixed(2) + ' back opacity=' + b.style.opacity;
    document.body.appendChild(tag);
  }, 2500); }
{ const q = new URLSearchParams(location.search);
  // click2=fx,fy[;fx,fy...] : clicks made one after another once an earlier action has settled
  if (q.has('click2')) setTimeout(() => {
    const out = [];
    q.get('click2').split(';').forEach((pair) => {
      const [fx, fy] = pair.split(',').map(Number);
      const r = canvas.getBoundingClientRect(), cx = r.left + fx * r.width, cy = r.top + fy * r.height;
      camera.position.set(cam.x, cam.eye, cam.z); camera.rotation.set(cam.pitch, cam.yaw, 0, 'YXZ'); camera.updateMatrixWorld();
      const pr = probe(cx, cy);
      canvas.dispatchEvent(new MouseEvent('click', { clientX: cx, clientY: cy, bubbles: true }));
      const steps = lastSteps.map((s) => s.kind === 'turn' ? 'turn' : 'move(' + s.x.toFixed(2) + ',' + s.z.toFixed(2) + ')').join(' > ');
      const raf = window.requestAnimationFrame, now = performance.now, draw = renderer.render;
      let fake = now.call(performance);
      window.requestAnimationFrame = () => 0; performance.now = () => fake; renderer.render = () => {};
      for (let i = 0; i < 600 && (i < 2 || leg || queue.length || !settled()); i++) { fake += 40; frame(fake); }
      window.requestAnimationFrame = raf; performance.now = now; renderer.render = draw;
      out.push('click ' + pair + ': station=' + pr.station + ' room=' + pr.room + ' [' + steps + '] -> stop ' + idx + ' "' + STATIONS[idx].title + '" cam ' + cam.x.toFixed(2) + ',' + cam.z.toFixed(2) + ' yaw ' + cam.yaw.toFixed(2));
    });
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99;background:#000;color:#ff0;font:14px monospace;padding:4px 8px;white-space:pre';
    tag.textContent = out.join('\n');
    document.body.appendChild(tag);
  }, 2500); }
{ const q = new URLSearchParams(location.search);
  // back2=n : press the step-back button n times, after earlier actions have settled
  if (q.has('back2')) setTimeout(() => {
    const out = [];
    for (let k = 0; k < +q.get('back2'); k++) {
      const from = idx;
      document.getElementById('back').click();
      const steps = lastSteps.map((s) => s.kind === 'turn' ? 'turn' : 'move(' + s.x.toFixed(2) + ',' + s.z.toFixed(2) + ')').join(' > ');
      const raf = window.requestAnimationFrame, now = performance.now, draw = renderer.render;
      let fake = now.call(performance);
      window.requestAnimationFrame = () => 0; performance.now = () => fake; renderer.render = () => {};
      for (let i = 0; i < 600 && (i < 2 || leg || queue.length || !settled()); i++) { fake += 40; frame(fake); }
      window.requestAnimationFrame = raf; performance.now = now; renderer.render = draw;
      out.push('step back from stop ' + from + ' [' + steps + '] -> stop ' + idx + ' "' + STATIONS[idx].title + '" cam ' + cam.x.toFixed(2) + ',' + cam.z.toFixed(2) + ' yaw ' + cam.yaw.toFixed(2) + ' button opacity=' + document.getElementById('back').style.opacity);
    }
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;right:8px;top:8px;z-index:99;background:#000;color:#0ff;font:14px monospace;padding:4px 8px;white-space:pre';
    tag.textContent = out.join('\n');
    document.body.appendChild(tag);
  }, 3500); }
{ const q = new URLSearchParams(location.search);
  if (q.has('fwd')) setTimeout(() => {
    const out = [];
    for (let k = 0; k < +q.get('fwd'); k++) {
      document.querySelector('[data-fwd]').click();
      const raf = window.requestAnimationFrame, now = performance.now, draw = renderer.render;
      let fake = now.call(performance);
      window.requestAnimationFrame = () => 0; performance.now = () => fake; renderer.render = () => {};
      for (let i = 0; i < 900 && (i < 2 || leg || queue.length || !settled()); i++) { fake += 40; frame(fake); }
      window.requestAnimationFrame = raf; performance.now = now; renderer.render = draw;
      out.push('walk on -> ' + STATIONS[idx].id);
    }
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99;background:#000;color:#ff0;font:15px monospace;padding:4px 8px';
    tag.textContent = out.join('   ');
    document.body.appendChild(tag);
  }, 1500); }
{ const q = new URLSearchParams(location.search);
  if (q.has('credits')) setTimeout(() => { document.getElementById('nav').style.setProperty('display', 'block', 'important'); document.getElementById('nav').style.opacity = '1'; document.getElementById('creditsBtn').click(); }, 1500); }

{ const q = new URLSearchParams(location.search);
  // goto=id[,id...] : walk to stops by id, one after another, and report where each ends
  if (q.has('goto')) setTimeout(() => {
    // (sculpture stops exist only once their scans have loaded: pass slow=1 to wait for them)
    const out = [];
    q.get('goto').split(',').forEach((id) => {
      goTo(ST[id]);
      const steps = lastSteps.map((s) => s.kind === 'turn' ? 'turn' : 'move(' + s.x.toFixed(2) + ',' + s.z.toFixed(2) + ')').join(' > ');
      const raf = window.requestAnimationFrame, now = performance.now, draw = renderer.render;
      let fake = now.call(performance);
      window.requestAnimationFrame = () => 0; performance.now = () => fake; renderer.render = () => {};
      for (let i = 0; i < 900 && (i < 2 || leg || queue.length || !settled()); i++) { fake += 40; frame(fake); }
      window.requestAnimationFrame = raf; performance.now = now; renderer.render = draw;
      out.push('goto ' + id + ' [' + steps + '] -> cam ' + cam.x.toFixed(2) + ',' + cam.z.toFixed(2) + ' yaw ' + cam.yaw.toFixed(2) + ' pitch ' + cam.pitch.toFixed(2));
    });
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99;background:#000;color:#ff0;font:14px monospace;padding:4px 8px;white-space:pre';
    tag.textContent = out.join('\n');
    document.body.appendChild(tag);
  }, q.has('slow') ? 15000 : 2000); }

{ const q = new URLSearchParams(location.search);
  // hold=1 : jump the save-the-date straight to its lifted pose (go to detVolvelle first); turn=n : n plates on
  if (q.has('hold') || q.has('turn')) setTimeout(() => {
    VOL.lift = q.has('hold') ? 1 : VOL.lift;
    if (q.has('turn')) VOL.angle = VOL.target = -(+q.get('turn')) * VOL.STEP;
  }, 3200); }

{ const q = new URLSearchParams(location.search);
  // press=fx,fy[;...] : pointer down+up (a plain click) on the held save-the-date; drag=fx,fy>fx,fy : a drag
  const at = (pair) => { const [fx, fy] = pair.split(',').map(Number), r = canvas.getBoundingClientRect(); return { clientX: r.left + fx * r.width, clientY: r.top + fy * r.height, bubbles: true, pointerId: 1 }; };
  if (q.has('press') || q.has('drag')) setTimeout(() => {
    // headless Chrome does not tick the render loop on its own: run one frame so the lifted pose is applied
    { const raf = window.requestAnimationFrame; window.requestAnimationFrame = () => 0; frame(performance.now()); window.requestAnimationFrame = raf; }
    camera.updateMatrixWorld(); volvelle.updateMatrixWorld(true);
    const out = [];
    if (q.has('press')) q.get('press').split(';').forEach((pair) => {
      canvas.dispatchEvent(new PointerEvent('pointerdown', at(pair))); canvas.dispatchEvent(new PointerEvent('pointerup', at(pair)));
      out.push('press ' + pair + ' -> target ' + (VOL.target / VOL.STEP).toFixed(2) + ' plates');
    });
    if (q.has('drag')) { const [a, b] = q.get('drag').split('>');
      canvas.dispatchEvent(new PointerEvent('pointerdown', at(a)));
      for (let i = 1; i <= 10; i++) { const A = at(a), B = at(b); canvas.dispatchEvent(new PointerEvent('pointermove', { ...A, clientX: A.clientX + (B.clientX - A.clientX) * i / 10, clientY: A.clientY + (B.clientY - A.clientY) * i / 10 })); }
      const mid = VOL.angle; canvas.dispatchEvent(new PointerEvent('pointerup', at(b)));
      out.push('drag ' + q.get('drag') + ' -> turned ' + (mid / VOL.STEP).toFixed(2) + ' plates, settles on ' + (VOL.target / VOL.STEP).toFixed(2));
    }
    VOL.angle = VOL.target; volWheel.rotation.z = VOL.angle;
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;right:8px;top:8px;z-index:99;background:#000;color:#0ff;font:14px monospace;padding:4px 8px;white-space:pre';
    tag.textContent = out.join('\n'); document.body.appendChild(tag);
  }, 4200); }

{ const q = new URLSearchParams(location.search);
  // the invitation: ihold=1 lifted pose (go to detInvite first); idoors=1 doors open; icard=1 card drawn; itilt=x,y look-in tilt
  if (q.has('ihold') || q.has('idoors') || q.has('icard')) setTimeout(() => {
    if (q.has('ihold')) INV.lift = 1;
    if (q.has('idoors')) INV.doors = INV.doorsTarget = 1;
    if (q.has('icard')) INV.card = INV.cardTarget = 1;
    if (q.has('itilt')) { const [tx, ty] = q.get('itilt').split(',').map(Number); const r = canvas.getBoundingClientRect(); pointer.inside = true; pointer.x = r.left + (tx + 1) / 2 * r.width; pointer.y = r.top + (ty + 1) / 2 * r.height; INV.tiltY = tx * 0.14; INV.tiltX = ty * 0.09; }
  }, 3200); }
{ const q = new URLSearchParams(location.search);
  // iclick=fx,fy;fx,fy : real click events on the held invitation (use with ihold=1); reports what each did
  if (q.has('iclick')) setTimeout(() => {
    const step = () => { const raf = window.requestAnimationFrame; window.requestAnimationFrame = () => 0; frame(performance.now()); window.requestAnimationFrame = raf; camera.updateMatrixWorld(); invite.updateMatrixWorld(true); };
    const out = [];
    q.get('iclick').split(';').forEach((pair) => {
      step();
      const [fx, fy] = pair.split(',').map(Number), r = canvas.getBoundingClientRect();
      canvas.dispatchEvent(new MouseEvent('click', { clientX: r.left + fx * r.width, clientY: r.top + fy * r.height, bubbles: true }));
      out.push('click ' + pair + ' -> doors ' + INV.doorsTarget + ', card ' + INV.cardTarget + ', stop ' + STATIONS[idx].id);
      INV.doors = INV.doorsTarget; INV.card = INV.cardTarget;
    });
    step();
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;right:8px;top:8px;z-index:99;background:#000;color:#0ff;font:14px monospace;padding:4px 8px;white-space:pre';
    tag.textContent = out.join('\n'); document.body.appendChild(tag);
  }, 4200); }
{ const q = new URLSearchParams(location.search);
  // trace=id,id,... : walk to each stop frame by frame (40 ms) and report how smooth the walk was: its length in
  // seconds, the biggest jump in position and heading between frames, whether the table keep-out was crossed,
  // and where it ended relative to the stop
  if (q.has('trace')) setTimeout(() => {
    const out = [];
    q.get('trace').split(',').forEach((id) => { try {
      goTo(ST[id]);
      const steps = lastSteps.map((s) => s.kind === 'turn' ? 'turn' : 'move').join('>') || '(none)';
      const raf = window.requestAnimationFrame, now = performance.now, draw = renderer.render;
      let fake = now.call(performance), n = 0, jump = 0, spin = 0, tbl = 0, px = cam.x, pz = cam.z, py = cam.yaw;
      window.requestAnimationFrame = () => 0; performance.now = () => fake; renderer.render = () => {};
      for (let i = 0; i < 900 && (i < 2 || leg || queue.length || !settled()); i++) {
        fake += 40; frame(fake); n++;
        jump = Math.max(jump, Math.hypot(cam.x - px, cam.z - pz)); spin = Math.max(spin, Math.abs(shortAngle(py, cam.yaw) - py));
        if (cam.x > TABLE_KEEPOUT.x0 && cam.x < TABLE_KEEPOUT.x1 && cam.z > TABLE_KEEPOUT.z0 && cam.z < TABLE_KEEPOUT.z1) tbl++;
        px = cam.x; pz = cam.z; py = cam.yaw;
      }
      window.requestAnimationFrame = raf; performance.now = now; renderer.render = draw;
      const t = STATIONS[ST[id]];
      out.push(id.padEnd(12) + steps.padEnd(28) + (n * 0.04).toFixed(1) + 's  max step ' + (jump * 100).toFixed(1) + 'cm  max turn ' + (spin * 180 / Math.PI).toFixed(1) + 'deg/frame  table ' + tbl + '  off by ' + Math.hypot(cam.x - t.x, cam.z - t.z).toFixed(3) + 'm ' + (Math.abs(shortAngle(cam.yaw, t.yaw) - cam.yaw) * 180 / Math.PI).toFixed(1) + 'deg');
    } catch (e) { out.push(id + ' ERROR ' + e.message + ' @ ' + (e.stack || '').split('\n')[1]); } });
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;top:60px;z-index:99;background:#000;color:#0f0;font:13px monospace;padding:6px 10px;white-space:pre';
    tag.textContent = out.join('\n'); document.body.appendChild(tag);
  }, q.has('slow') ? 16000 : 1500); }
{ const q = new URLSearchParams(location.search);
  // plan=id,id,... : go to each stop in turn and report the steps queued for it and how far the view tilted on the way
  if (q.has('plan')) setTimeout(() => {
    const out = [];
    q.get('plan').split(',').forEach((id) => {
      goTo(ST[id]);
      const steps = lastSteps.map((s) => s.kind === 'turn' ? 'turn' + (s.pitch === 0 ? '(level)' : '') : 'move').join(' > ') || '(none)';
      let lo = cam.pitch, hi = cam.pitch;
      const raf = window.requestAnimationFrame, now = performance.now, draw = renderer.render;
      let fake = now.call(performance);
      window.requestAnimationFrame = () => 0; performance.now = () => fake; renderer.render = () => {};
      for (let i = 0; i < 900 && (i < 2 || leg || queue.length || !settled()); i++) { fake += 40; frame(fake); lo = Math.min(lo, cam.pitch); hi = Math.max(hi, cam.pitch); }
      window.requestAnimationFrame = raf; performance.now = now; renderer.render = draw;
      out.push(id.padEnd(12) + ' steps: ' + steps.padEnd(40) + ' tilt ranged ' + lo.toFixed(2) + ' to ' + hi.toFixed(2) + ', ends ' + cam.pitch.toFixed(2));
    });
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;top:60px;z-index:99;background:#000;color:#0f0;font:14px monospace;padding:6px 10px;white-space:pre';
    tag.textContent = out.join('\n'); document.body.appendChild(tag);
  }, 1500); }
{ const q = new URLSearchParams(location.search);
  // panel=1 : show the info panel and bottom bar as the visitor sees them (the harness hides them by default)
  if (q.has('panel')) setTimeout(() => { ['label', 'nav'].forEach((id) => { const n = document.getElementById(id); n.style.setProperty('display', 'block', 'important'); n.style.opacity = '1'; });
    const st = document.createElement('style'); st.textContent = '#label .fresh{animation:none !important}'; document.head.appendChild(st); window.dispatchEvent(new Event('resize')); }, 300); }
{ const q = new URLSearchParams(location.search);
  // curs=fx,fy;fx,fy : move the mouse to each point and report the cursor the canvas resolves to there
  if (q.has('curs')) setTimeout(() => {
    const out = ['page default: ' + getComputedStyle(document.body).cursor.slice(0, 34) + '...'];
    q.get('curs').split(';').forEach((pair) => {
      const [fx, fy] = pair.split(',').map(Number), r = canvas.getBoundingClientRect();
      window.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + fx * r.width, clientY: r.top + fy * r.height, bubbles: true }));
      const raf = window.requestAnimationFrame; window.requestAnimationFrame = () => 0; frame(performance.now()); window.requestAnimationFrame = raf;
      const c = getComputedStyle(canvas).cursor;
      out.push(pair + ' -> ' + (canvas.style.cursor || '(default arrow)') + '  | lit=' + (c.includes('E0486E') ? 'yes' : 'no') + ' themed=' + (c.startsWith('url(') ? 'yes' : 'NO'));
    });
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;top:60px;z-index:99;background:#000;color:#0f0;font:14px monospace;padding:6px 10px;white-space:pre';
    tag.textContent = out.join('\n'); document.body.appendChild(tag);
  }, 2600); }
{ const q = new URLSearchParams(location.search);
  // turn=n : press Turn around n times after earlier actions settle, reporting the view each time
  if (q.has('turns')) setTimeout(() => {
    const out = [];
    for (let k = 0; k < +q.get('turns'); k++) {
      document.getElementById('turn').click();
      const raf = window.requestAnimationFrame, now = performance.now, draw = renderer.render;
      let fake = now.call(performance);
      window.requestAnimationFrame = () => 0; performance.now = () => fake; renderer.render = () => {};
      for (let i = 0; i < 900 && (i < 2 || leg || queue.length || !settled()); i++) { fake += 40; frame(fake); }
      window.requestAnimationFrame = raf; performance.now = now; renderer.render = draw;
      out.push('turn ' + (k + 1) + ' at ' + STATIONS[idx].id + ' -> cam ' + cam.x.toFixed(2) + ',' + cam.z.toFixed(2) + ' yaw ' + (cam.yaw / Math.PI).toFixed(2) + 'pi pitch ' + cam.pitch.toFixed(2) + ' eye ' + cam.eye.toFixed(2));
    }
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;right:8px;top:70px;z-index:99;background:#000;color:#0ff;font:14px monospace;padding:4px 8px;white-space:pre';
    tag.textContent = out.join('\n'); document.body.appendChild(tag);
  }, 4600); }
{ const q = new URLSearchParams(location.search);
  // noteclick=fx,fy;... : after earlier actions, click each point and report what the panel shows and whether you moved
  if (q.has('noteclick')) setTimeout(() => {
    // wait for the sculpture scans, which load in the background
    const out = [];
    q.get('noteclick').split(';').forEach((pair) => {
      const [fx, fy] = pair.split(',').map(Number), r = canvas.getBoundingClientRect();
      camera.position.set(cam.x, cam.eye, cam.z); camera.rotation.set(cam.pitch, cam.yaw, 0, 'YXZ'); camera.updateMatrixWorld();
      canvas.dispatchEvent(new MouseEvent('click', { clientX: r.left + fx * r.width, clientY: r.top + fy * r.height, bubbles: true }));
      out.push('click ' + pair + ' -> panel "' + document.getElementById('title').textContent.slice(0, 46) + '"  moved=' + (queue.length > 0) + ' cam ' + cam.x.toFixed(1) + ',' + cam.z.toFixed(1));
    });
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;right:8px;top:110px;z-index:99;background:#000;color:#0f0;font:14px monospace;padding:4px 8px;white-space:pre';
    tag.textContent = out.join('\n'); document.body.appendChild(tag);
  }, q.has('slow') ? 14000 : 6500); }
{ const q = new URLSearchParams(location.search);
  if (q.has('probeat')) setTimeout(() => {
    const out = [];
    q.get('probeat').split(';').forEach((pair) => {
      const [fx, fy] = pair.split(',').map(Number), r = canvas.getBoundingClientRect();
      camera.position.set(cam.x, cam.eye, cam.z); camera.rotation.set(cam.pitch, cam.yaw, 0, 'YXZ'); camera.updateMatrixWorld();
      const p = probe(r.left + fx * r.width, r.top + fy * r.height);
      const chain = []; for (let o = p.surface && p.surface.object; o; o = o.parent) chain.push((o.type || '?') + (o.userData.note ? '[NOTE]' : '') + (o.userData.station !== undefined ? '[st]' : ''));
      out.push(pair + ' note=' + (p.note ? p.note.title : p.note) + ' dist=' + (p.surface ? p.surface.distance.toFixed(2) : '-') + ' chain=' + chain.join('<'));
    });
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;top:150px;z-index:99;background:#000;color:#ff0;font:13px monospace;padding:4px 8px;white-space:pre';
    tag.textContent = out.join('\n'); document.body.appendChild(tag);
  }, 6500); }
{ const q = new URLSearchParams(location.search);
  if (q.has('card')) setTimeout(() => document.getElementById('more').click(), 6000); }
{ const q = new URLSearchParams(location.search);
  if (q.has('sprobe')) setTimeout(() => {
    const out = ['spots loaded: ' + Object.keys(SCULPTURE_SPOTS).map((k) => k + '=' + (SCULPTURE_SPOTS[k].group.userData.note ? 'note' : (SCULPTURE_SPOTS[k].placeholder.length && SCULPTURE_SPOTS[k].placeholder[0].parent ? 'placeholder' : 'loaded-no-note'))).join(' ')];
    q.get('sprobe').split(';').forEach((pair) => {
      const [fx, fy] = pair.split(',').map(Number), r = canvas.getBoundingClientRect();
      camera.position.set(cam.x, cam.eye, cam.z); camera.rotation.set(cam.pitch, cam.yaw, 0, 'YXZ'); camera.updateMatrixWorld();
      const p = probe(r.left + fx * r.width, r.top + fy * r.height);
      const chain = []; for (let o = p.surface && p.surface.object; o; o = o.parent) chain.push((o.type || '?') + (o.userData.note ? '[NOTE]' : '') + (o.userData.station !== undefined ? '[st' + o.userData.station + ']' : ''));
      out.push(pair + ' -> note=' + (p.note ? p.note.title : p.note) + ' station=' + p.station + ' chain=' + chain.join('<'));
    });
    Object.keys(SCULPTURE_SPOTS).forEach((k) => { SCULPTURE_SPOTS[k].group.traverse((o) => { if (o.isMesh && o.material && o.material.colorWrite === false) { const b = new THREE.Box3().setFromObject(o); out.push(k + ' proxy x ' + b.min.x.toFixed(2) + '..' + b.max.x.toFixed(2) + ' y ' + b.min.y.toFixed(2) + '..' + b.max.y.toFixed(2) + ' z ' + b.min.z.toFixed(2) + '..' + b.max.z.toFixed(2)); } }); });
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;top:150px;z-index:99;background:#000;color:#ff0;font:13px monospace;padding:4px 8px;white-space:pre';
    tag.textContent = out.join('\n'); document.body.appendChild(tag);
  }, 14000); }
{ const q = new URLSearchParams(location.search);
  // probecost=1 : with x,z,yaw set, how long one pointer probe (the per-frame raycast) takes at this pose,
  // with the cursor at the centre and at a few other points on screen; and which object it lands on
  if (q.has('probecost')) setTimeout(() => {
    const out = [], r = canvas.getBoundingClientRect();
    [[0.5, 0.5], [0.5, 0.35], [0.3, 0.5], [0.7, 0.5], [0.5, 0.75]].forEach(([fx, fy]) => {
      const cx = r.left + r.width * fx, cy = r.top + r.height * fy;
      probe(cx, cy);
      const t0 = performance.now(); let p; for (let i = 0; i < 20; i++) p = probe(cx, cy); const ms = (performance.now() - t0) / 20;
      const o = p.surface && p.surface.object, tris = o && o.geometry && o.geometry.index ? o.geometry.index.count / 3 : (o && o.geometry ? o.geometry.attributes.position.count / 3 : 0);
      out.push('cursor ' + fx + ',' + fy + ': ' + ms.toFixed(2) + ' ms/probe  hits ' + (o ? (o.name || o.type) + ' (' + Math.round(tris) + ' tris)' : 'nothing'));
    });
    let heavy = 0, list = []; scene.traverse((o) => { if (o.isMesh && o.geometry) { const n = o.geometry.index ? o.geometry.index.count / 3 : o.geometry.attributes.position.count / 3; if (n > 20000) { heavy++; list.push(Math.round(n / 1000) + 'k'); } } });
    out.push('meshes over 20k tris: ' + heavy + ' (' + list.join(', ') + ')');
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;top:60px;z-index:99;background:#000;color:#0f0;font:13px monospace;padding:6px 10px;white-space:pre';
    tag.textContent = out.join('\n'); document.body.appendChild(tag);
  }, 16000); }
{ const q = new URLSearchParams(location.search);
  // dump=1 : every text and picture table, as JSON in a <pre>, for the mobile edition to be built from
  if (q.has('dump')) setTimeout(() => {
    const strip = (o) => JSON.parse(JSON.stringify(o, (k, v) => (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean' || v === null || Array.isArray(v) || (v && v.constructor === Object)) ? v : undefined));
    const out = { STATIONS: strip(STATIONS), DETAIL_PICTURES: strip(DETAIL_PICTURES), ATRIUM_PICTURES: strip(ATRIUM_PICTURES), W1_PICTURES: strip(W1_PICTURES), W2_PICTURES: strip(W2_PICTURES),
      SCULPTURE_NOTES: strip(SCULPTURE_NOTES), SCULPTURES: strip(SCULPTURES), CARDS: strip(CARDS), SECTION_LABEL: strip(SECTION_LABEL), SECTION_STOP: strip(SECTION_STOP),
      credits: [...document.querySelectorAll('#creditsList p')].map((n) => [n.firstChild.textContent.trim(), n.lastChild.textContent.trim()]) };   // [the work, its credit]
    const pre = document.createElement('pre'); pre.id = 'dump'; pre.textContent = JSON.stringify(out); document.body.appendChild(pre);
  }, 800); }
{ const q = new URLSearchParams(location.search);
  // clean=1 : no interface at all, for postcards of the rooms
  if (q.has('clean')) { const s = document.createElement('style'); s.textContent = '#topLeft,#turn,#hint,#compass,#sections,#back,[data-fwd],[data-back],#nav,#label,#motto{display:none!important}'; document.head.appendChild(s); } }
{ const q = new URLSearchParams(location.search);
  if (q.has('arcadecheck')) { const p = ATRIUM_PICTURES[4]; const st = STATIONS[ST[p.stop]]; document.title = 'arcade:' + !!window.Arcade + ' games:' + (window.Arcade ? Object.keys(Arcade.games).join(',') : '-') + ' stop:' + st.id + ' game:' + st.game + ' mat:' + (scene.children.find((o) => o.userData.station === ST[p.stop]) ? scene.children.find((o) => o.userData.station === ST[p.stop]).children[1].material.map.constructor.name : '?'); } }
{ const q = new URLSearchParams(location.search);
  if (q.has('framepos')) { const out = ATRIUM_PICTURES.map((p) => { const g = scene.children.find((o) => o.userData.station === ST[p.stop]); return p.stop + ' frame z=' + (g ? g.position.z.toFixed(2) : '?') + ' stop z=' + STATIONS[ST[p.stop]].z.toFixed(2) + ' cam-at-stop=' + (cam.z).toFixed(2); }); document.title = out.join(' | '); } }
{ const q = new URLSearchParams(location.search);
  // project=stopId : after placing the camera at that stop (x,z,yaw from the stop itself), where does its frame's centre land on screen?
  if (q.has('project')) setTimeout(() => {
    const id = q.get('project'), st = STATIONS[ST[id]]; cam.x = st.x; cam.z = st.z; cam.yaw = st.yaw; cam.pitch = 0; LOOK.x = LOOK.y = 0;
    camera.position.set(cam.x, cam.eye, cam.z); camera.rotation.set(0, cam.yaw, 0, 'YXZ'); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
    const g = scene.children.find((o) => o.userData.station === ST[id]); const v = g.position.clone().project(camera);
    document.title = id + ' cam(' + cam.x + ',' + cam.z + ') yaw ' + cam.yaw.toFixed(3) + ' frame(' + g.position.x.toFixed(2) + ',' + g.position.z.toFixed(2) + ') on screen x=' + ((v.x + 1) / 2 * innerWidth).toFixed(0) + ' of ' + innerWidth + ' (centre ' + (innerWidth / 2) + ') aspect ' + camera.aspect.toFixed(2) + ' fov ' + camera.fov;
  }, 1200); }
{ const q = new URLSearchParams(location.search);
  // arcadeclick=fx,fy : after goto has settled, a real click at that screen point, then: did the arcade open?
  if (q.has('arcadeclick')) setTimeout(() => {
    const [fx, fy] = q.get('arcadeclick').split(',').map(Number), r = canvas.getBoundingClientRect();
    const x = r.left + fx * r.width, y = r.top + fy * r.height;
    const p = probe(x, y);
    canvas.dispatchEvent(new MouseEvent('click', { clientX: x, clientY: y, bubbles: true }));
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;top:200px;z-index:999;background:#000;color:#0ff;font:14px monospace;padding:4px 8px';
    tag.textContent = 'idx=' + idx + ' (' + STATIONS[idx].id + ') probe.station=' + p.station + ' game=' + (p.station !== undefined ? STATIONS[p.station].game : '-') + ' leg=' + (leg ? leg.kind : null) + ' queue=' + queue.length + ' -> Arcade.open=' + (window.Arcade ? Arcade.open : 'no arcade');
    document.body.appendChild(tag);
  }, 6000); }
{ const q = new URLSearchParams(location.search);
  // steps=goto:id,left,right,fwd,back,... : play a sequence of compass presses, settling after each, and report where each lands
  if (q.has('steps')) setTimeout(() => {
    const out = [], raf = window.requestAnimationFrame, now = performance.now, draw = renderer.render;
    let fake = now.call(performance); window.requestAnimationFrame = () => 0; performance.now = () => fake; renderer.render = () => {};
    const settle = () => { for (let i = 0; i < 900 && (i < 2 || leg || queue.length || !settled()); i++) { fake += 40; frame(fake); } };
    q.get('steps').split(',').forEach((st) => {
      if (st.startsWith('goto:')) goTo(ST[st.slice(5)]); else if (st === 'left') sideStep(1); else if (st === 'right') sideStep(-1); else if (st === 'fwd') tourStep(1); else if (st === 'back') el('back').click();
      settle(); out.push(st.padEnd(14) + '-> ' + STATIONS[idx].id.padEnd(12) + ' cam ' + cam.x.toFixed(1) + ',' + cam.z.toFixed(1) + ' yaw ' + (cam.yaw * 180 / Math.PI).toFixed(0) + 'deg');
    });
    window.requestAnimationFrame = raf; performance.now = now; renderer.render = draw;
    const tag = document.createElement('div'); tag.style.cssText = 'position:fixed;left:8px;top:60px;z-index:99;background:#000;color:#0f0;font:13px monospace;padding:6px 10px;white-space:pre'; tag.textContent = out.join('\n'); document.body.appendChild(tag);
  }, 1500); }
{ const q = new URLSearchParams(location.search);
  // hits=fx,fy : list the first eight things the click ray meets at that point of the frame, nearest first
  if (q.has('hits')) setTimeout(() => {
    const [fx, fy] = q.get('hits').split(',').map(Number), r = canvas.getBoundingClientRect();
    camera.position.set(cam.x, cam.eye, cam.z); camera.rotation.set(cam.pitch, cam.yaw, 0, 'YXZ'); camera.updateMatrixWorld();
    raycaster.setFromCamera(new THREE.Vector2(fx * 2 - 1, -(fy * 2 - 1)), camera);
    const out = raycaster.intersectObjects(scene.children, true).slice(0, 8).map((h) => {
      const chain = []; for (let o = h.object; o; o = o.parent) chain.push((o.type || '?') + (o.geometry ? ':' + o.geometry.type.replace('Geometry', '') : '') + (Object.keys(o.userData).length ? '{' + Object.keys(o.userData).join(',') + '}' : ''));
      return h.distance.toFixed(3) + ' at ' + h.point.x.toFixed(2) + ',' + h.point.y.toFixed(2) + ',' + h.point.z.toFixed(2) + '  ' + chain.join(' < ');
    });
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;top:150px;z-index:99;background:#000;color:#ff0;font:13px monospace;padding:4px 8px;white-space:pre';
    tag.textContent = out.join('\n') || 'no hits'; document.body.appendChild(tag);
  }, 6500); }
{ const q = new URLSearchParams(location.search);
  // postcard=front|back|posted : open the gift shop's postcard (card n via pc=n); reveal=1 : the curtain drawn back, at once
  if (q.has('postcard')) setTimeout(() => {
    localStorage.removeItem('ka-rsvp'); openPostcards(); if (q.has('pc')) showPostcard(+q.get('pc'));
    if (q.get('postcard') !== 'front') { pcTurn('back'); el('pcName').value = 'Kelly & Anthony'; document.querySelector('input[name=pcYes][value=yes]').checked = true; }
    if (q.get('postcard') === 'posted') postCard();
  }, 1500);
  if (q.has('reveal')) setTimeout(() => { localStorage.removeItem('ka-posted'); if (q.get('reveal') === 'no') { CURTAIN.sorry = true; if (CURTAIN.redraw) CURTAIN.redraw(); } revealCurtain(true); }, 1500);
  if (q.has('noreveal')) setTimeout(() => { localStorage.removeItem('ka-posted'); }, 100);
  if (q.has('half')) setTimeout(() => { localStorage.removeItem('ka-posted'); setCurtain(+q.get('half')); }, 1500);   // half=0.5 : the curtain part-drawn
}
{ const q = new URLSearchParams(location.search);
  // dumpreveal=1 : save the SEE YOU IN SIENA panel texture itself as a PNG data URL in a pre, to judge the lettering
  if (q.has('dumpreveal')) setTimeout(() => {
    const pic = mainFrame && mainFrame.children[1]; if (!pic || !pic.material.map || !pic.material.map.image || !pic.material.map.image.getContext) return;
    const c = pic.material.map.image, out = document.createElement('canvas'); out.width = 1400; out.height = Math.round(1400 * c.height / c.width);
    out.getContext('2d').drawImage(c, 0, 0, out.width, out.height);
    document.body.innerHTML = ''; document.body.style.background = '#000'; out.style.cssText = 'position:fixed;left:0;top:0'; document.body.appendChild(out);
  }, 6000); }
{ const q = new URLSearchParams(location.search);
  // hg=1 : report the hourglass stop's index and the station tags on its pedestal
  if (q.has('hg')) setTimeout(() => {
    const spot = SCULPTURE_SPOTS.detEndR, tags = new Set(); spot.group.traverse((o) => tags.add(o.userData.station));
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;top:150px;z-index:99;background:#000;color:#ff0;font:14px monospace;padding:4px 8px;white-space:pre';
    tag.textContent = 'ST.sc_hourglass=' + ST.sc_hourglass + ' STATIONS[' + ST.sc_hourglass + '].id=' + (STATIONS[ST.sc_hourglass] || {}).id + ' ST.detStay=' + ST.detStay + '\npedestal tags: ' + [...tags].join(',') + ' group.pos=' + spot.group.position.toArray().map((v) => v.toFixed(2));
    document.body.appendChild(tag);
  }, 3000); }
{ const q = new URLSearchParams(location.search);
  // texneed=H : for every picture loaded from a file, the most texels it can use: stand at every stop, and for each
  // textured mesh in view work out how many screen pixels a metre of it covers on a view H device pixels tall (default
  // 1800, a large monitor at the page's 1.5 pixel-ratio cap). Flat pictures only: each edge is cut into 24 pieces and
  // only pieces wholly on screen count, so a picture seen edge-on from close by is not over-counted. r is the most
  // screen pixels one texel covers (above 1: the picture is shown bigger than its file). Reported as JSON in <pre id="texneed">
  if (q.has('texneed')) setTimeout(() => {
    const H = +q.get('texneed') || 1800, A = 2.2, W = H * A, N = 24;
    const need = {}, a = new THREE.Vector3(), b = new THREE.Vector3(), ca = new THREE.Vector3(), cb = new THREE.Vector3();
    camera.aspect = A; camera.updateProjectionMatrix();
    const onScreen = (p, c) => { c.copy(p).applyMatrix4(camera.matrixWorldInverse); if (c.z >= -camera.near) return false; p.project(camera); return Math.abs(p.x) <= 1 && Math.abs(p.y) <= 1; };
    STATIONS.forEach((s) => {
      camera.position.set(s.x, s.eye || EYE, s.z); camera.rotation.set(s.pitch || 0, s.yaw, 0, 'YXZ'); camera.updateMatrixWorld(true);
      scene.traverse((o) => {
        const map = o.isMesh && o.material && o.material.map, img = map && map.image;
        if (!img || !img.src || !o.visible) return;
        const g = o.geometry; if (!g.boundingBox) g.computeBoundingBox();
        const bb = g.boundingBox, sx = bb.max.x - bb.min.x, sy = bb.max.y - bb.min.y;
        if (bb.max.z - bb.min.z > 0.02 * Math.max(sx, sy)) return;               // not a flat picture
        const uv = g.attributes.uv; let u0 = 1, u1 = 0, v0 = 1, v1 = 0;
        if (uv) for (let i = 0; i < uv.count; i++) { u0 = Math.min(u0, uv.getX(i)); u1 = Math.max(u1, uv.getX(i)); v0 = Math.min(v0, uv.getY(i)); v1 = Math.max(v1, uv.getY(i)); }
        const tu = img.width * (u1 - u0) * map.repeat.x / N, tv = img.height * (v1 - v0) * map.repeat.y / N;   // texels in one piece of an edge
        const P = (u, v, out) => out.set(bb.min.x + u * sx, bb.min.y + v * sy, (bb.min.z + bb.max.z) / 2).applyMatrix4(o.matrixWorld);
        let r = 0;
        for (let k = 0; k < N; k++) for (const e of [0, 0.5, 1]) {
          [[k / N, e, (k + 1) / N, e, tu], [e, k / N, e, (k + 1) / N, tv]].forEach(([ua, va, ub, vb, t]) => {
            if (!onScreen(P(ua, va, a), ca) || !onScreen(P(ub, vb, b), cb)) return;
            r = Math.max(r, Math.hypot((a.x - b.x) * W / 2, (a.y - b.y) * H / 2) / Math.max(t, 1e-6));
          });
        }
        if (!r) return;
        const src = decodeURIComponent(img.src.replace(/^.*?\/assets\//, 'assets/'));
        if (!need[src] || r > need[src].r) need[src] = { r: +r.toFixed(3), w: img.width, h: img.height, at: s.id };
      });
    });
    const pre = document.createElement('pre'); pre.id = 'texneed'; pre.textContent = JSON.stringify(need); document.body.appendChild(pre);
  }, 7000); }
{ const q = new URLSearchParams(location.search);
  // tdrag=dx : after any goto has settled, drag a (simulated) finger dx pixels across the middle of the view and let
  // go, then tap where it stopped; reports the view's turn and lean, and whether the tap after the drag was ignored
  if (q.has('tdrag')) setTimeout(() => {
    const dx = +q.get('tdrag'), r = canvas.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const ev = (type, x) => canvas.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'touch', clientX: x, clientY: cy, bubbles: true }));
    const yaw0 = cam.yaw, idx0 = idx; let lean = null;
    ev('pointerdown', cx);
    for (let i = 1; i <= 10; i++) { ev('pointermove', cx + dx * i / 10); window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 7, pointerType: 'touch', clientX: cx + dx * i / 10, clientY: cy, bubbles: true })); }
    lean = touchLook.lean;
    const raf = window.requestAnimationFrame; window.requestAnimationFrame = () => 0;
    for (let i = 0; i < 40; i++) frame(performance.now() + i * 16);
    const leanShown = LOOK.x;
    ev('pointerup', cx + dx);
    canvas.dispatchEvent(new MouseEvent('click', { clientX: cx + dx, clientY: cy, bubbles: true }));
    const tapIgnored = idx === idx0 && !queue.length && !leg;
    frame(performance.now()); window.requestAnimationFrame = raf;
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;top:100px;z-index:99;background:#000;color:#0f0;font:14px monospace;padding:6px 10px;white-space:pre';
    tag.textContent = `stop ${STATIONS[idx].id} (look: ${STATIONS[idx].look || 'lean'})  drag ${dx}px\nturned ${(THREE.MathUtils.radToDeg(cam.yaw - yaw0)).toFixed(1)} deg  lean while dragging ${lean === null ? 'none' : THREE.MathUtils.radToDeg(lean).toFixed(1) + ' deg'} (shown ${THREE.MathUtils.radToDeg(leanShown).toFixed(1)})  lean after release ${touchLook.lean === null ? 'none' : touchLook.lean}\ntap right after the drag ignored: ${tapIgnored}`;
    document.body.appendChild(tag);
  }, 4000); }
{ const q = new URLSearchParams(location.search);
  // midwalk=id&frames=n : start walking to a stop and stop n frames (40 ms each) into the walk, drawing each frame, so
  // the screenshot shows the view part-way (with calm: what "Reduce motion" puts on screen mid-move)
  if (q.has('midwalk')) setTimeout(() => {
    const raf = window.requestAnimationFrame, now = performance.now; let fake = now.call(performance);
    window.requestAnimationFrame = () => 0; performance.now = () => fake;
    goTo(ST[q.get('midwalk')]);
    for (let i = 0; i < (+q.get('frames') || 6); i++) { fake += 40; frame(fake); }
    window.requestAnimationFrame = raf; performance.now = now;
    const tag = document.createElement('div');
    tag.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99;background:#000;color:#0f0;font:13px monospace;padding:4px 8px';
    tag.textContent = 'mid-walk to ' + q.get('midwalk') + ': cam ' + cam.x.toFixed(2) + ',' + cam.z.toFixed(2) + '  calm state ' + CALM.state;
    document.body.appendChild(tag);
  }, 3000); }
