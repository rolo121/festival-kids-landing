/*
  Festival Kids - Loading Screen
  Se muestra una sola vez por sesión y se oculta cuando la página carga.
*/

const FK_LOADER_SESSION_KEY = 'festival-kids-loader-seen';

function initFestivalKidsLoader() {
  const loader = document.querySelector('[data-loader]');
  if (!loader) return;

  let alreadySeen = false;

  try {
    alreadySeen = sessionStorage.getItem(FK_LOADER_SESSION_KEY) === '1';
  } catch {
    alreadySeen = false;
  }

  if (alreadySeen) {
    loader.remove();
    document.documentElement.classList.add('fk-loader-done');
    document.documentElement.classList.remove('fk-loader-active');
    document.body.classList.remove('fk-loading-lock');
    return;
  }

  const startedAt = performance.now();
  const minDuration = 950;
  const maxDuration = 3500;

  document.documentElement.classList.add('fk-loader-active');
  document.body.classList.add('fk-loading-lock');

  const hideLoader = () => {
    if (loader.classList.contains('is-hidden')) return;

    loader.classList.add('is-hidden');
    document.documentElement.classList.add('fk-loader-done');
    document.documentElement.classList.remove('fk-loader-active');
    document.body.classList.remove('fk-loading-lock');

    try {
      sessionStorage.setItem(FK_LOADER_SESSION_KEY, '1');
    } catch {
      // Si sessionStorage no está disponible, simplemente no persistimos.
    }

    window.setTimeout(() => {
      loader.remove();
    }, 650);
  };

  const scheduleHide = () => {
    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, minDuration - elapsed);
    window.setTimeout(hideLoader, remaining);
  };

  if (document.readyState === 'complete') {
    scheduleHide();
  } else {
    window.addEventListener('load', scheduleHide, { once: true });
    window.setTimeout(hideLoader, maxDuration);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFestivalKidsLoader);
} else {
  initFestivalKidsLoader();
}