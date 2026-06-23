/*
  Festival Kids - Animaciones Fase 1
  JS nativo:
  - Agrega clases de reveal al hacer scroll.
  - Asigna delays escalonados.
  - Agrega microinteracciones touch/click.
  - Respeta prefers-reduced-motion.
*/

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealConfig = [
  { selector: '.hero__logo', type: 'pop', delay: 0 },
  { selector: '.hero__date', type: 'pop', delay: 120 },
  { selector: '.hero__cta', type: 'pop', delay: 220 },

  { selector: '.countdown__face', type: 'pop', delay: 0 },
  { selector: '.countdown__title', type: 'left', delay: 80 },
  { selector: '.countdown__note', type: 'right', delay: 140 },
  { selector: '.countdown__arcade', type: 'pop', delay: 220 },

  { selector: '.stage-shows__title', type: 'pop', delay: 0 },
  { selector: '.stage-shows__frame', type: 'pop', delay: 90 },
  { selector: '.stage-shows__divider', type: 'pop', delay: 160 },
  { selector: '.stage-shows__item', type: 'pop', delay: 230, stagger: 70 },
  { selector: '.stage-shows__label-image', type: 'pop', delay: 300, stagger: 70 },
  { selector: '.stage-shows__logo', type: 'pop', delay: 650 },
  { selector: '.stage-shows__decoration', type: 'pop', delay: 170, stagger: 90 },

  { selector: '.highlights__item', type: 'pop', delay: 0, stagger: 90 },

  { selector: '.talent__image-card', type: 'left', delay: 0 },
  { selector: '.talent-form', type: 'right', delay: 110 },
  { selector: '.talent__pin', type: 'pop', delay: 180 },

  { selector: '.marathon__logo', type: 'pop', delay: 0 },
  { selector: '.marathon__description', type: 'left', delay: 90 },
  { selector: '.marathon-form', type: 'pop', delay: 180 },
  { selector: '.marathon__bee', type: 'pop', delay: 240 },

  { selector: '.hairstyles__title-art', type: 'pop', delay: 0 },
  { selector: '.hairstyles__bubble', type: 'left', delay: 100 },
  { selector: '.hairstyles__girls', type: 'right', delay: 170 },
  { selector: '.hairstyles__butterfly', type: 'pop', delay: 240 },

  { selector: '.ticket-panel__title-art', type: 'left', delay: 0 },
  { selector: '.ticket-panel__ticket', type: 'pop', delay: 120 },
  { selector: '.ticket-panel__pin', type: 'pop', delay: 220 },
  { selector: '.ticket-panel__logo-chucherias', type: 'pop', delay: 290 },
  { selector: '.ticket-panel__label', type: 'pop', delay: 370, stagger: 70 },
  { selector: '.ticket-panel__logo-totto', type: 'pop', delay: 780 },

  { selector: '.sponsors__group', type: 'pop', delay: 0, stagger: 130 },
  { selector: '.sponsors__pill', type: 'pop', delay: 120, stagger: 120 },
  { selector: '.sponsors__logos', type: 'pop', delay: 120, stagger: 120 },
];

const tapSelectors = [
  '.hero__cta',
  '.highlights__item',
  '.talent-form__calendar-button',
  '.talent-form__submit',
  '.marathon-form__submit',
  '.ticket-panel__label',
];

function setupRevealAnimations() {
  const revealElements = [];

  revealConfig.forEach((config) => {
    const elements = document.querySelectorAll(config.selector);

    elements.forEach((element, index) => {
      if (element.classList.contains('fk-reveal')) return;

      element.classList.add('fk-reveal');

      if (config.type) {
        element.classList.add(`fk-reveal--${config.type}`);
      }

      const delay = (config.delay || 0) + ((config.stagger || 0) * index);
      element.style.setProperty('--fk-reveal-delay', `${delay}ms`);

      revealElements.push(element);
    });
  });

  if (prefersReducedMotion) {
    revealElements.forEach((element) => {
      element.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function setupTapFeedback() {
  tapSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
      element.classList.add('fk-tap-bounce');

      element.addEventListener('pointerdown', () => {
        element.classList.add('is-tapping');
      });

      const clearTap = () => {
        element.classList.remove('is-tapping');
      };

      element.addEventListener('pointerup', clearTap);
      element.addEventListener('pointercancel', clearTap);
      element.addEventListener('pointerleave', clearTap);
    });
  });
}


function setupBeeWander() {
  if (prefersReducedMotion) return;

  const zone = document.querySelector('[data-bee-zone]');
  const bee = zone?.querySelector('[data-bee-wander]');

  if (!zone || !bee) return;

  document.documentElement.classList.add('fk-bee-wander-ready');

  const state = {
    rafId: 0,
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    baseCenterX: 0,
    baseCenterY: 0,
    zoneWidth: 0,
    zoneHeight: 0,
    beeWidth: 0,
    beeHeight: 0,
    movingRight: false,
    nextTargetAt: 0,
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const random = (min, max) => Math.random() * (max - min) + min;

  const getFormSafeArea = () => {
    const form = zone.querySelector('.marathon-form');
    if (!form) return null;

    const zoneRect = zone.getBoundingClientRect();
    const formRect = form.getBoundingClientRect();
    const padding = window.innerWidth <= 767 ? 26 : 46;

    return {
      left: formRect.left - zoneRect.left - padding,
      right: formRect.right - zoneRect.left + padding,
      top: formRect.top - zoneRect.top - padding,
      bottom: formRect.bottom - zoneRect.top + padding,
    };
  };

  const intersectsForm = (centerX, centerY, safeArea) => {
    if (!safeArea) return false;

    const halfWidth = state.beeWidth * 0.45;
    const halfHeight = state.beeHeight * 0.42;

    return !(
      centerX + halfWidth < safeArea.left ||
      centerX - halfWidth > safeArea.right ||
      centerY + halfHeight < safeArea.top ||
      centerY - halfHeight > safeArea.bottom
    );
  };

  const measure = () => {
    const zoneRect = zone.getBoundingClientRect();
    const beeRect = bee.getBoundingClientRect();

    state.zoneWidth = zoneRect.width;
    state.zoneHeight = zoneRect.height;
    state.beeWidth = beeRect.width;
    state.beeHeight = beeRect.height;

    state.baseCenterX = beeRect.left - zoneRect.left + beeRect.width / 2 - state.currentX;
    state.baseCenterY = beeRect.top - zoneRect.top + beeRect.height / 2 - state.currentY;
  };

  const chooseTarget = () => {
    measure();

    const isMobile = window.innerWidth <= 767;
    const safeArea = getFormSafeArea();

    const ranges = isMobile
      ? {
          xMin: state.zoneWidth * 0.46,
          xMax: state.zoneWidth * 0.86,
          yMin: state.zoneHeight * 0.22,
          yMax: state.zoneHeight * 0.52,
        }
      : {
          xMin: state.zoneWidth * 0.34,
          xMax: state.zoneWidth * 0.78,
          yMin: state.zoneHeight * 0.28,
          yMax: state.zoneHeight * 0.66,
        };

    let nextCenterX = state.baseCenterX;
    let nextCenterY = state.baseCenterY;

    for (let attempt = 0; attempt < 18; attempt += 1) {
      const candidateX = random(ranges.xMin, ranges.xMax);
      const candidateY = random(ranges.yMin, ranges.yMax);

      if (!intersectsForm(candidateX, candidateY, safeArea)) {
        nextCenterX = candidateX;
        nextCenterY = candidateY;
        break;
      }
    }

    state.targetX = clamp(
      nextCenterX - state.baseCenterX,
      -state.zoneWidth * 0.34,
      state.zoneWidth * 0.34
    );

    state.targetY = clamp(
      nextCenterY - state.baseCenterY,
      -state.zoneHeight * 0.24,
      state.zoneHeight * 0.24
    );

    state.movingRight = state.targetX > state.currentX;
    state.nextTargetAt = performance.now() + random(2600, 4400);
  };

  const updateBeePosition = (now) => {
    const easing = window.innerWidth <= 767 ? 0.015 : 0.012;

    state.currentX += (state.targetX - state.currentX) * easing;
    state.currentY += (state.targetY - state.currentY) * easing;

    const distanceX = state.targetX - state.currentX;
    const distanceY = state.targetY - state.currentY;
    const bob = Math.sin(now / 360) * (window.innerWidth <= 767 ? 5 : 9);
    const drift = Math.sin(now / 620) * (window.innerWidth <= 767 ? 2 : 4);
    const direction = state.movingRight ? -1 : 1;
    const rotate = -8 + clamp(distanceY * 0.05, -8, 8) + (state.movingRight ? 4 : -2);

    bee.style.setProperty('--fk-bee-x', `${(state.currentX + drift).toFixed(2)}px`);
    bee.style.setProperty('--fk-bee-y', `${(state.currentY + bob).toFixed(2)}px`);
    bee.style.setProperty('--fk-bee-rotate', `${rotate.toFixed(2)}deg`);
    bee.style.setProperty('--fk-bee-scale-x', `${direction}`);

    const reachedTarget = Math.abs(distanceX) < 8 && Math.abs(distanceY) < 8;

    if (reachedTarget || now > state.nextTargetAt) {
      chooseTarget();
    }

    state.rafId = window.requestAnimationFrame(updateBeePosition);
  };

  const start = () => {
    if (state.rafId) return;

    measure();
    chooseTarget();
    state.rafId = window.requestAnimationFrame(updateBeePosition);
  };

  const stop = () => {
    if (!state.rafId) return;

    window.cancelAnimationFrame(state.rafId);
    state.rafId = 0;
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        start();
      } else {
        stop();
      }
    },
    {
      threshold: 0.18,
    }
  );

  observer.observe(zone);

  window.addEventListener('resize', () => {
    measure();
    chooseTarget();
  });
}

function initFestivalKidsAnimations() {
  document.documentElement.classList.add('fk-motion-ready');

  setupRevealAnimations();
  setupTapFeedback();
  setupBeeWander();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFestivalKidsAnimations);
} else {
  initFestivalKidsAnimations();
}