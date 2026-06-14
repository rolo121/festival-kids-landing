const countdownBlocks = document.querySelectorAll('[data-countdown]');

countdownBlocks.forEach((block) => {
  const targetDateValue = block.getAttribute('data-target-date');
  const valueElement = block.querySelector('[data-countdown-value]');

  if (!targetDateValue || !valueElement) return;

  const targetDate = new Date(targetDateValue);
  const today = new Date();
  const diffMs = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (Number.isNaN(diffDays)) return;

  if (diffDays <= 0) {
    valueElement.textContent = '¡HOY!';
    return;
  }

  if (diffDays >= 28 && diffDays <= 45) {
    valueElement.textContent = '1 MES';
    return;
  }

  if (diffDays > 45) {
    const months = Math.round(diffDays / 30);
    valueElement.textContent = `${months} MESES`;
    return;
  }

  valueElement.textContent = `${diffDays} DÍAS`;
});