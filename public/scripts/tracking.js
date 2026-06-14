document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href');

  if (href?.startsWith('#')) {
    console.log('[Festival Kids] Click ancla:', href);
  }
});