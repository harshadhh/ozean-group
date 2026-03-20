/* ═══════════════════════════════════════════════════════════
   OZEAN GROUPS v2 — script.js
   WebGL Hero · Custom Cursor · X-Ray Slider · Wireframe
   Orbit Nodes · Reviews Slider · Form · Scroll Reveal
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ═════════════════════════════════════════════
   1. CUSTOM CURSOR
═════════════════════════════════════════════ */
const cursorDot   = document.getElementById('cursor-dot');
const cursorRing  = document.getElementById('cursor-ring');
const cursorLabel = document.getElementById('cursor-label');

let mouseX = -200, mouseY = -200;
let ringX  = -200, ringY  = -200;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  if (cursorDot) {
    cursorDot.style.left  = mouseX + 'px';
    cursorDot.style.top   = mouseY + 'px';
  }
  if (cursorRing) {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    cursorRing.style.left  = ringX + 'px';
    cursorRing.style.top   = ringY + 'px';
  }
  if (cursorLabel) {
    cursorLabel.style.left = mouseX + 'px';
    cursorLabel.style.top  = mouseY + 'px';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Update cursor label on hover
document.querySelectorAll('[data-cursor]').forEach(el => {
  const label = el.getAttribute('data-cursor');
  el.addEventListener('mouseenter', () => {
    if (!label) return;
    document.body.classList.add('cursor-active');
    if (cursorLabel) cursorLabel.textContent = label;
  });
  el.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-active');
    if (cursorLabel) cursorLabel.textContent = '';
  });
});

/* ═════════════════════════════════════════════
   2. NAV SCROLL + HAMBURGER
═════════════════════════════════════════════ */
const nav       = document.getElementById('nav');
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navMenu.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});
navMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ═════════════════════════════════════════════
   3. SMOOTH SCROLL (offset for fixed nav)
═════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 16;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});

/* ═════════════════════════════════════════════
   4. HERO CANVAS — Animated Room Lighting
   A dark architectural room silhouette with
   dynamic warm light that follows the cursor.
═════════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, mx = 0.5, my = 0.4;
  let targetMx = 0.5, targetMy = 0.4;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  document.addEventListener('mousemove', e => {
    targetMx = e.clientX / window.innerWidth;
    targetMy = e.clientY / window.innerHeight;
  });

  // Gyroscope support (mobile)
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', e => {
      if (e.gamma !== null) targetMx = Math.min(1, Math.max(0, (e.gamma + 45) / 90));
      if (e.beta  !== null) targetMy = Math.min(1, Math.max(0, (e.beta  + 30) / 90));
    }, { passive: true });
  }

  let t = 0;

  function drawRoom() {
    // Smooth mouse follow
    mx += (targetMx - mx) * 0.06;
    my += (targetMy - my) * 0.06;
    t += 0.006;

    ctx.clearRect(0, 0, W, H);

    // Deep dark background
    ctx.fillStyle = '#0C0A08';
    ctx.fillRect(0, 0, W, H);

    // Far wall — subtle warm tint based on light position
    const wallGrad = ctx.createLinearGradient(0, 0, W, H);
    wallGrad.addColorStop(0,   '#100D0A');
    wallGrad.addColorStop(0.5, '#161210');
    wallGrad.addColorStop(1,   '#0C0A08');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, W, H);

    // Ambient glow following cursor
    const lx = mx * W;
    const ly = my * H * 0.7;
    const glowR = Math.max(W, H) * 0.7;
    const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, glowR);
    glow.addColorStop(0,   `rgba(230,190,120,${0.08 + Math.sin(t) * 0.01})`);
    glow.addColorStop(0.4, `rgba(200,160,90,0.03)`);
    glow.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Secondary ambient bounce (ceiling)
    const bounceGrad = ctx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, H * 0.8);
    bounceGrad.addColorStop(0,   `rgba(230,200,150,${0.04 + mx * 0.02})`);
    bounceGrad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = bounceGrad;
    ctx.fillRect(0, 0, W, H);

    // Room geometry — perspective lines
    const cx = W * 0.5, cy = H * 0.42;
    const fl = H * 0.72; // floor line

    ctx.strokeStyle = `rgba(230,194,138,${0.04 + mx * 0.02})`;
    ctx.lineWidth = 0.8;

    // Floor perspective grid
    for (let i = 0; i <= 8; i++) {
      const x = (i / 8) * W;
      ctx.beginPath();
      ctx.moveTo(x, fl);
      ctx.lineTo(cx + (x - cx) * 0.3, cy);
      ctx.stroke();
    }
    for (let i = 0; i <= 5; i++) {
      const alpha = i / 5;
      const y = fl + (cy - fl) * (1 - alpha);
      const xLeft  = cx + (0 - cx) * (1 - (1 - alpha) * 0.7);
      const xRight = cx + (W - cx) * (1 - (1 - alpha) * 0.7);
      ctx.beginPath();
      ctx.moveTo(xLeft, y);
      ctx.lineTo(xRight, y);
      ctx.stroke();
    }

    // Wall lines (vertical)
    ctx.strokeStyle = `rgba(230,194,138,${0.035})`;
    for (let i = 1; i <= 4; i++) {
      const x = (i / 5) * W;
      ctx.beginPath();
      ctx.moveTo(cx + (x - cx) * 0.3, cy);
      ctx.lineTo(x, fl);
      ctx.stroke();
    }

    // Ceiling beams
    ctx.strokeStyle = `rgba(230,194,138,${0.025})`;
    for (let i = 0; i <= 4; i++) {
      const x = (i / 4) * W;
      ctx.beginPath();
      ctx.moveTo(cx + (x - cx) * 0.3, cy);
      ctx.lineTo(x, 0);
      ctx.stroke();
    }

    // Architectural element: large window suggestion
    const wx = W * 0.6, wy = H * 0.12, ww = W * 0.22, wh = H * 0.35;
    const windowGlow = ctx.createRadialGradient(wx + ww / 2, wy + wh / 2, 0, wx + ww / 2, wy + wh / 2, wh);
    windowGlow.addColorStop(0, `rgba(200,180,120,${0.06 + Math.sin(t * 0.7) * 0.015})`);
    windowGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = windowGlow;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = `rgba(230,194,138,0.08)`;
    ctx.lineWidth = 1;
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath();
    ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2);
    ctx.stroke();

    // Subtle furniture silhouettes
    // Sofa
    ctx.fillStyle = `rgba(40,32,22,${0.6 + my * 0.1})`;
    const sfx = W * 0.08, sfy = fl - H * 0.1, sfw = W * 0.28, sfh = H * 0.1;
    ctx.fillRect(sfx, sfy, sfw, sfh);
    ctx.fillRect(sfx, sfy - H * 0.07, sfw * 0.1, H * 0.07);
    ctx.fillRect(sfx + sfw - sfw * 0.1, sfy - H * 0.07, sfw * 0.1, H * 0.07);
    // Back cushion
    ctx.fillStyle = `rgba(50,40,28,${0.7})`;
    ctx.fillRect(sfx, sfy - H * 0.06, sfw, H * 0.06);

    // Floor lamp
    const flx = W * 0.42, fly = fl - H * 0.25;
    ctx.strokeStyle = `rgba(180,150,100,0.15)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(flx, fl);
    ctx.lineTo(flx, fly);
    ctx.stroke();
    // Lamp shade glow
    const lampGlow = ctx.createRadialGradient(flx, fly, 0, flx, fly, H * 0.18);
    lampGlow.addColorStop(0, `rgba(255,210,140,${0.09 + Math.sin(t * 1.3) * 0.01})`);
    lampGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lampGlow;
    ctx.fillRect(0, 0, W, H);

    // Subtle floor reflection
    const reflGrad = ctx.createLinearGradient(0, fl, 0, H);
    reflGrad.addColorStop(0, 'rgba(230,194,138,0.03)');
    reflGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = reflGrad;
    ctx.fillRect(0, fl, W, H - fl);

    requestAnimationFrame(drawRoom);
  }
  drawRoom();
})();

/* ═════════════════════════════════════════════
   5. ORBIT NODES — Review avatars orbiting
═════════════════════════════════════════════ */
(function initOrbit() {
  const wrap = document.getElementById('orbit-wrap');
  if (!wrap) return;

  const initials = ['AK','SD','AU','RK','PP','MS','VB','NJ'];
  const radii    = [100, 165];

  initials.forEach((init, i) => {
    const node = document.createElement('div');
    node.classList.add('orbit-node');
    node.textContent = init;
    const r     = radii[i % 2];
    const angle = (i / initials.length) * Math.PI * 2;
    node.style.width  = '44px';
    node.style.height = '44px';
    node.style.marginLeft = '-22px';
    node.style.marginTop  = '-22px';
    const offsetX = 180, offsetY = 180;
    node.style.left = (offsetX + r * Math.cos(angle)) + 'px';
    node.style.top  = (offsetY + r * Math.sin(angle)) + 'px';
    wrap.appendChild(node);
  });

  // Animate nodes in a continuous orbit
  let startTime = null;
  function animateNodes(ts) {
    if (!startTime) startTime = ts;
    const elapsed = (ts - startTime) / 1000;
    const nodes = wrap.querySelectorAll('.orbit-node');
    nodes.forEach((node, i) => {
      const r     = radii[i % 2];
      const speed = i % 2 === 0 ? 0.35 : -0.22;
      const baseAngle = (i / nodes.length) * Math.PI * 2;
      const angle = baseAngle + elapsed * speed;
      const offsetX = 180, offsetY = 180;
      node.style.left = (offsetX + r * Math.cos(angle)) + 'px';
      node.style.top  = (offsetY + r * Math.sin(angle)) + 'px';
    });
    requestAnimationFrame(animateNodes);
  }
  requestAnimationFrame(animateNodes);
})();

/* ═════════════════════════════════════════════
   6. PROCESS WIREFRAME CANVAS
   Draws a room wireframe that builds itself
   as the user scrolls through the process section.
═════════════════════════════════════════════ */
(function initWireframe() {
  const canvas = document.getElementById('wire-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const stageLabels = ['Consultation', '3D Visualization', 'Execution', 'Handover'];
  let progress = 0; // 0 to 1

  // Define room wireframe points (normalized 0-1)
  const lines = [
    // Floor
    [[0.1,0.8],[0.9,0.8]],
    [[0.1,0.8],[0.35,0.55]],
    [[0.9,0.8],[0.65,0.55]],
    [[0.35,0.55],[0.65,0.55]],
    // Walls back
    [[0.35,0.55],[0.35,0.15]],
    [[0.65,0.55],[0.65,0.15]],
    [[0.35,0.15],[0.65,0.15]],
    // Ceiling lines
    [[0.1,0.8],[0.1,0.3]],
    [[0.9,0.8],[0.9,0.3]],
    [[0.1,0.3],[0.35,0.15]],
    [[0.9,0.3],[0.65,0.15]],
    [[0.1,0.3],[0.9,0.3]],
    // Window
    [[0.45,0.2],[0.55,0.2]],
    [[0.45,0.45],[0.55,0.45]],
    [[0.45,0.2],[0.45,0.45]],
    [[0.55,0.2],[0.55,0.45]],
    [[0.5,0.2],[0.5,0.45]],
    // Sofa suggestion
    [[0.15,0.72],[0.45,0.72]],
    [[0.15,0.72],[0.15,0.62]],
    [[0.45,0.72],[0.45,0.62]],
    [[0.15,0.62],[0.45,0.62]],
    // Floor lamp
    [[0.55,0.78],[0.55,0.55]],
    [[0.52,0.55],[0.58,0.55]],
    [[0.52,0.55],[0.55,0.52]],
    [[0.58,0.55],[0.55,0.52]],
  ];

  function drawWireframe(prog) {
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = 'rgba(230,194,138,0.03)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    const totalLines  = lines.length;
    const linesDrawn  = prog * totalLines;
    const fillOpacity = Math.max(0, (prog - 0.6) / 0.4);

    // Fill hinted shapes as we progress
    if (fillOpacity > 0) {
      // Floor fill
      ctx.fillStyle = `rgba(100,80,50,${fillOpacity * 0.12})`;
      ctx.beginPath();
      ctx.moveTo(0.1*W, 0.8*H);
      ctx.lineTo(0.9*W, 0.8*H);
      ctx.lineTo(0.65*W, 0.55*H);
      ctx.lineTo(0.35*W, 0.55*H);
      ctx.closePath();
      ctx.fill();
      // Wall fill
      ctx.fillStyle = `rgba(80,70,55,${fillOpacity * 0.1})`;
      ctx.beginPath();
      ctx.moveTo(0.35*W, 0.55*H);
      ctx.lineTo(0.65*W, 0.55*H);
      ctx.lineTo(0.65*W, 0.15*H);
      ctx.lineTo(0.35*W, 0.15*H);
      ctx.closePath();
      ctx.fill();
      // Ambient warm glow center
      const radGlow = ctx.createRadialGradient(0.5*W, 0.3*H, 0, 0.5*W, 0.3*H, 0.4*W);
      radGlow.addColorStop(0, `rgba(230,194,138,${fillOpacity * 0.06})`);
      radGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radGlow;
      ctx.fillRect(0, 0, W, H);
    }

    // Draw lines progressively
    lines.forEach((line, i) => {
      const drawRatio = Math.min(1, Math.max(0, linesDrawn - i));
      if (drawRatio <= 0) return;
      const [[x1, y1], [x2, y2]] = line;
      const ex = x1 + (x2 - x1) * drawRatio;
      const ey = y1 + (y2 - y1) * drawRatio;

      // Glow effect on freshly drawn lines
      const isNew = drawRatio < 1;
      if (isNew) {
        ctx.strokeStyle = `rgba(230,194,138,0.9)`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(230,194,138,0.8)';
        ctx.shadowBlur  = 8;
      } else {
        ctx.strokeStyle = `rgba(230,194,138,${0.35 + fillOpacity * 0.1})`;
        ctx.lineWidth = 0.8;
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.moveTo(x1 * W, y1 * H);
      ctx.lineTo(ex * W, ey * H);
      ctx.stroke();
    });
    ctx.shadowBlur = 0;

    // Corner dots at vertices
    const vertices = new Set();
    lines.forEach(([[x1,y1],[x2,y2]]) => {
      vertices.add(`${x1},${y1}`);
      vertices.add(`${x2},${y2}`);
    });
    vertices.forEach(v => {
      const [vx, vy] = v.split(',').map(Number);
      const lineIdx = lines.findIndex(([[x1,y1]])=> Math.abs(x1-vx)<0.001 && Math.abs(y1-vy)<0.001);
      if (lineIdx / totalLines > prog) return;
      ctx.fillStyle = 'rgba(230,194,138,0.5)';
      ctx.beginPath();
      ctx.arc(vx * W, vy * H, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Scroll-driven wireframe progress
  const processSection = document.getElementById('process');
  const wireLabel = document.getElementById('wire-label');

  function updateWireframe() {
    if (!processSection) return;
    const rect = processSection.getBoundingClientRect();
    const winH = window.innerHeight;
    // 0 when section enters, 1 when section leaves
    const raw = 1 - ((rect.top + rect.height * 0.3) / (winH + rect.height * 0.3));
    progress = Math.min(1, Math.max(0, raw));
    drawWireframe(progress);

    // Update label based on progress
    const stageIdx = Math.min(3, Math.floor(progress * 4));
    if (wireLabel) wireLabel.textContent = stageLabels[stageIdx];

    // Highlight active step
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, i) => {
      step.classList.toggle('active', i === stageIdx);
    });
  }

  window.addEventListener('scroll', updateWireframe, { passive: true });
  updateWireframe();

  // Step click interaction
  document.querySelectorAll('.step').forEach((step, i) => {
    step.addEventListener('click', () => {
      progress = (i + 0.5) / 4;
      drawWireframe(progress);
      if (wireLabel) wireLabel.textContent = stageLabels[i];
      document.querySelectorAll('.step').forEach((s, j) => s.classList.toggle('active', j === i));
    });
  });
})();

/* ═════════════════════════════════════════════
   7. X-RAY BEFORE/AFTER SLIDER
═════════════════════════════════════════════ */
(function initXray() {
  const xray    = document.getElementById('xray');
  const bar     = document.getElementById('xray-bar');
  const right   = document.getElementById('xray-right');
  if (!xray || !bar || !right) return;

  let isDragging = false;
  let pos = 50; // percent

  function setPos(p) {
    pos = Math.min(96, Math.max(4, p));
    const pPx = pos + '%';
    bar.style.left  = pPx;
    right.style.clipPath = `inset(0 0 0 ${pPx})`;
  }
  setPos(50);

  function getPercent(e) {
    const rect = xray.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return ((clientX - rect.left) / rect.width) * 100;
  }

  bar.addEventListener('mousedown',  () => { isDragging = true; });
  xray.addEventListener('mousedown', (e) => { isDragging = true; setPos(getPercent(e)); });
  window.addEventListener('mousemove', e => { if (isDragging) setPos(getPercent(e)); });
  window.addEventListener('mouseup',   () => { isDragging = false; });

  bar.addEventListener('touchstart',  () => { isDragging = true; }, { passive: true });
  xray.addEventListener('touchstart', e  => { isDragging = true; setPos(getPercent(e)); }, { passive: true });
  window.addEventListener('touchmove',  e => { if (isDragging) setPos(getPercent(e)); }, { passive: true });
  window.addEventListener('touchend',   () => { isDragging = false; });
})();

/* ═════════════════════════════════════════════
   8. REVIEWS SLIDER
═════════════════════════════════════════════ */
(function initReviews() {
  const track   = document.getElementById('rev-track');
  const dotsWrap= document.getElementById('rev-dots');
  const prevBtn = document.getElementById('rev-prev');
  const nextBtn = document.getElementById('rev-next');
  if (!track) return;

  const cards = track.querySelectorAll('.rev-card');
  const total = cards.length;
  let cur = 0, timer;

  cards.forEach((_, i) => {
    const d = document.createElement('button');
    d.classList.add('rev-dot');
    if (i === 0) d.classList.add('active');
    d.addEventListener('click', () => go(i));
    dotsWrap.appendChild(d);
  });
  const dots = dotsWrap.querySelectorAll('.rev-dot');

  function go(idx) {
    cur = (idx + total) % total;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dots.forEach((d,i) => d.classList.toggle('active', i === cur));
  }

  function startAuto() { timer = setInterval(() => go(cur + 1), 5500); }
  function resetAuto()  { clearInterval(timer); startAuto(); }

  prevBtn.addEventListener('click', () => { go(cur - 1); resetAuto(); });
  nextBtn.addEventListener('click', () => { go(cur + 1); resetAuto(); });
  startAuto();

  // Touch swipe
  let sx = 0;
  track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = sx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { go(diff > 0 ? cur + 1 : cur - 1); resetAuto(); }
  }, { passive: true });
})();

/* ═════════════════════════════════════════════
   9. SCROLL REVEAL
═════════════════════════════════════════════ */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-up').forEach(el => revealObs.observe(el));

/* ═════════════════════════════════════════════
   10. FLOATING BUTTONS VISIBILITY
═════════════════════════════════════════════ */
const floatWa   = document.getElementById('float-wa');
const floatCall = document.getElementById('float-call');

const heroSection = document.querySelector('.hero');
const heroObs = new IntersectionObserver((entries) => {
  const hidden = !entries[0].isIntersecting;
  if (floatWa)   floatWa.classList.toggle('visible', hidden);
  if (floatCall) floatCall.classList.toggle('visible', hidden);
}, { threshold: 0.2 });
if (heroSection) heroObs.observe(heroSection);

/* ═════════════════════════════════════════════
   11. BLUEPRINT FORM
═════════════════════════════════════════════ */
const form     = document.getElementById('bp-form');
const btnTxt   = document.getElementById('bp-btn-txt');
const success  = document.getElementById('bp-success');
const submitBt = document.getElementById('bp-submit');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    submitBt.disabled = true;
    btnTxt.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        form.reset();
        success.style.display = 'block';
        btnTxt.textContent = '✓ Sent!';
        setTimeout(() => {
          success.style.display = 'none';
          btnTxt.textContent = 'Request Free 3D Consultation';
          submitBt.disabled = false;
        }, 5000);
      } else { throw new Error(); }
    } catch {
      const name = document.getElementById('f-name').value || 'Visitor';
      const proj = document.getElementById('f-project').value || 'interior design';
      btnTxt.textContent = 'Request Free 3D Consultation';
      submitBt.disabled = false;
      if (confirm('Could not send form. Open WhatsApp instead?')) {
        window.open(`https://wa.me/919356818880?text=Hi%2C+I%27m+${encodeURIComponent(name)}+and+I%27m+interested+in+${encodeURIComponent(proj)}.+Please+contact+me.`, '_blank');
      }
    }
  });
}

/* ═════════════════════════════════════════════
   12. SERVICE CARD MOUSE GLOW
═════════════════════════════════════════════ */
document.querySelectorAll('.svc-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const glow = card.querySelector('.svc-glow');
    if (!glow) return;
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
    glow.style.setProperty('--gx', x + '%');
    glow.style.setProperty('--gy', y + '%');
  });
});
