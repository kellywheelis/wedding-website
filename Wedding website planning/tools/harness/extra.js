{ const q = new URLSearchParams(location.search);
  if (q.has('x')) cam.x = +q.get('x');
  if (q.has('z')) cam.z = +q.get('z');
  if (q.has('yaw')) cam.yaw = +q.get('yaw');
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
      camera.position.set(cam.x, cam.eye, cam.z); camera.rotation.set(0, cam.yaw, 0, 'YXZ'); camera.updateMatrixWorld();
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
      camera.position.set(cam.x, cam.eye, cam.z); camera.rotation.set(0, cam.yaw, 0, 'YXZ'); camera.updateMatrixWorld();
      const pr = probe(cx, cy);
      canvas.dispatchEvent(new MouseEvent('click', { clientX: cx, clientY: cy, bubbles: true }));
      const steps = queue.map((s) => s.kind === 'turn' ? 'turn' : 'move(' + s.x.toFixed(2) + ',' + s.z.toFixed(2) + ')').join(' > ');
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
      const steps = queue.map((s) => s.kind === 'turn' ? 'turn' : 'move(' + s.x.toFixed(2) + ',' + s.z.toFixed(2) + ')').join(' > ');
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
    const out = [];
    q.get('goto').split(',').forEach((id) => {
      goTo(ST[id]);
      const steps = queue.map((s) => s.kind === 'turn' ? 'turn' : 'move(' + s.x.toFixed(2) + ',' + s.z.toFixed(2) + ')').join(' > ');
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
  }, 2000); }
