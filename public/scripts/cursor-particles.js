/*
  Festival Kids - Cursor flor azul + partículas
  Canvas 2D, sin librerías externas.

  Reglas:
  - Desktop: cursor flor + partículas al click + estela sutil al mover.
  - Mobile: partículas al tap y rastro corto en gesto.
  - No genera partículas sobre campos de formulario.
  - Respeta prefers-reduced-motion.
*/

const FK_PARTICLE_SETTINGS = {
  desktopClickCount: 30,
  mobileTapCount: 22,
  dragParticleCount: 4,
  desktopTrailEnabled: true,
  desktopTrailCount: 1,
  desktopTrailCooldown: 52,
  desktopTrailMinDistance: 24,
  maxParticles: 260,
  gravity: 0.045,
  friction: 0.982,
  colors: [
    '#00A9E8', // azul festival
    '#0076DE', // azul profundo
    '#FFE600', // amarillo
    '#EF4618', // naranja
    '#FF6FB1', // rosa acento
    '#FFFFFF', // brillo
  ],
  trailColors: [
    '#FFFFFF',
    '#DDF8FF',
    '#8EEBFF',
    '#FFE600',
    '#00A9E8',
  ],
};

const particleReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class FestivalParticle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;

    const isBurst = Boolean(options.isBurst);
    const isDrag = Boolean(options.isDrag);
    const isTrail = Boolean(options.isTrail);

    this.type = isTrail
      ? (Math.random() > 0.84 ? 'flower' : 'sparkle')
      : (Math.random() > 0.42 ? 'flower' : 'sparkle');

    const palette = isTrail
      ? FK_PARTICLE_SETTINGS.trailColors
      : FK_PARTICLE_SETTINGS.colors;

    this.color = palette[Math.floor(Math.random() * palette.length)];

    if (isTrail) {
      this.size = this.type === 'flower'
        ? Math.random() * 2.2 + 2.2
        : Math.random() * 2.4 + 1.8;
    } else {
      this.size = this.type === 'flower'
        ? Math.random() * 5.5 + (isDrag ? 2.6 : 4.2)
        : Math.random() * 3.5 + (isDrag ? 2.2 : 3.2);
    }

    const angle = Math.random() * Math.PI * 2;
    const force = isTrail
      ? Math.random() * 1.35 + 0.35
      : Math.random() * (isBurst ? 7.2 : 4.8) + (isDrag ? 0.8 : 1.4);

    this.vx = Math.cos(angle) * force;
    this.vy = Math.sin(angle) * force - (isTrail ? 0.15 : (isBurst ? 1.8 : 0.8));

    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * (isTrail ? 0.08 : (this.type === 'flower' ? 0.12 : 0.18));
    this.opacity = isTrail ? 0.72 : 1;
    this.fadeSpeed = isTrail
      ? Math.random() * 0.018 + 0.028
      : Math.random() * 0.012 + (isDrag ? 0.018 : 0.012);

    this.friction = isTrail ? 0.94 : FK_PARTICLE_SETTINGS.friction;
    this.gravity = isTrail ? 0.012 : FK_PARTICLE_SETTINGS.gravity;
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;

    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.spin;
    this.opacity -= this.fadeSpeed;
  }

  drawFlower(ctx) {
    ctx.beginPath();

    for (let i = 0; i < 5; i += 1) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.ellipse(
        0,
        -this.size * 0.55,
        this.size * 0.34,
        this.size * 0.64,
        0,
        0,
        Math.PI * 2
      );
    }

    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#FFE600';
    ctx.arc(0, 0, this.size * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSparkle(ctx) {
    ctx.beginPath();

    for (let i = 0; i < 4; i += 1) {
      ctx.rotate(Math.PI / 2);
      ctx.lineTo(0, -this.size * 1.7);
      ctx.lineTo(this.size * 0.34, -this.size * 0.34);
    }

    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#FFFFFF';
    ctx.arc(0, 0, this.size * 0.26, 0, Math.PI * 2);
    ctx.fill();
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.fillStyle = this.color;

    if (this.type === 'flower') {
      this.drawFlower(ctx);
    } else {
      this.drawSparkle(ctx);
    }

    ctx.restore();
  }
}

function initFestivalKidsCursorParticles() {
  if (particleReducedMotion) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });

  if (!ctx) return;

  canvas.className = 'fk-particle-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  const canUseCustomCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canUseCustomCursor) {
    document.documentElement.classList.add('fk-custom-cursor');
  }

  let particles = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  let isPointerDown = false;
  let lastDragX = 0;
  let lastDragY = 0;
  let lastDragTime = 0;
  let lastTrailX = 0;
  let lastTrailY = 0;
  let lastTrailTime = 0;
  let hasTrailOrigin = false;

  const ignoredSelector = [
    'input',
    'textarea',
    'select',
    'option',
    '[contenteditable="true"]',
    '.talent-form__date-modal',
    '.fk-loader',
  ].join(',');

  function resizeCanvas() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = Math.floor(canvasWidth * pixelRatio);
    canvas.height = Math.floor(canvasHeight * pixelRatio);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function shouldIgnoreEventTarget(target) {
    return target instanceof Element && Boolean(target.closest(ignoredSelector));
  }

  function spawnParticles(x, y, count, options = {}) {
    for (let i = 0; i < count; i += 1) {
      particles.push(new FestivalParticle(x, y, options));
    }

    if (particles.length > FK_PARTICLE_SETTINGS.maxParticles) {
      particles = particles.slice(-FK_PARTICLE_SETTINGS.maxParticles);
    }
  }

  function spawnDesktopTrail(event) {
    if (!FK_PARTICLE_SETTINGS.desktopTrailEnabled) return;
    if (!canUseCustomCursor) return;
    if (event.pointerType !== 'mouse') return;
    if (isPointerDown) return;
    if (shouldIgnoreEventTarget(event.target)) return;

    const now = performance.now();

    if (!hasTrailOrigin) {
      hasTrailOrigin = true;
      lastTrailX = event.clientX;
      lastTrailY = event.clientY;
      lastTrailTime = now;
      return;
    }

    const dx = event.clientX - lastTrailX;
    const dy = event.clientY - lastTrailY;
    const distance = Math.hypot(dx, dy);

    if (distance < FK_PARTICLE_SETTINGS.desktopTrailMinDistance) return;
    if (now - lastTrailTime < FK_PARTICLE_SETTINGS.desktopTrailCooldown) return;

    lastTrailX = event.clientX;
    lastTrailY = event.clientY;
    lastTrailTime = now;

    spawnParticles(
      event.clientX + (Math.random() - 0.5) * 8,
      event.clientY + (Math.random() - 0.5) * 8,
      FK_PARTICLE_SETTINGS.desktopTrailCount,
      { isTrail: true }
    );
  }

  function handlePointerDown(event) {
    if (!event.isPrimary || shouldIgnoreEventTarget(event.target)) return;

    isPointerDown = true;
    lastDragX = event.clientX;
    lastDragY = event.clientY;
    lastDragTime = performance.now();

    const isTouchLike = event.pointerType === 'touch' || event.pointerType === 'pen';
    const count = isTouchLike
      ? FK_PARTICLE_SETTINGS.mobileTapCount
      : FK_PARTICLE_SETTINGS.desktopClickCount;

    spawnParticles(event.clientX, event.clientY, count, { isBurst: true });
  }

  function handlePointerMove(event) {
    if (!event.isPrimary) return;

    spawnDesktopTrail(event);

    if (!isPointerDown) return;
    if (shouldIgnoreEventTarget(event.target)) return;

    const isTouchLike = event.pointerType === 'touch' || event.pointerType === 'pen';
    if (!isTouchLike) return;

    const now = performance.now();
    const dx = event.clientX - lastDragX;
    const dy = event.clientY - lastDragY;
    const distance = Math.hypot(dx, dy);

    if (distance < 24 || now - lastDragTime < 75) return;

    lastDragX = event.clientX;
    lastDragY = event.clientY;
    lastDragTime = now;

    spawnParticles(
      event.clientX,
      event.clientY,
      FK_PARTICLE_SETTINGS.dragParticleCount,
      { isDrag: true, isTrail: true }
    );
  }

  function handlePointerUp() {
    isPointerDown = false;
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    particles = particles.filter((particle) => particle.opacity > 0);

    particles.forEach((particle) => {
      particle.update();
      particle.draw(ctx);
    });

    window.requestAnimationFrame(animateParticles);
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('pointerdown', handlePointerDown, { passive: true });
  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  window.addEventListener('pointerup', handlePointerUp, { passive: true });
  window.addEventListener('pointercancel', handlePointerUp, { passive: true });
  window.addEventListener('blur', handlePointerUp);

  resizeCanvas();
  animateParticles();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFestivalKidsCursorParticles);
} else {
  initFestivalKidsCursorParticles();
}