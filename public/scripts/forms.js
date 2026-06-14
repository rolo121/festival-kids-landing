/*
  Festival Kids - Formularios a Google Sheets vía Apps Script

  Mejoras incluidas:
  - Inputs numéricos solo aceptan números.
  - Loader visual al enviar.
  - Redirección a página de gracias según formulario.
  - Envío no-cors compatible con Google Apps Script.
*/

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzy4FcNaqRklXwdtxQRPzBjGsuA8f9C812VX5a8IrJI-NvPLbklIqcty3BYuukJdwdK/exec';

const FORM_RULES = {
  'talent-show': {
    label: 'Talent Show',
    thanksTitle: '¡Gracias por participar en Talent Show!',
    thanksMessage: 'Te esperamos para que demostrés todo tu talento en Festival Kids.',
    required: [
      'nombre_participante',
      'talento',
      'nombre_tutor',
      'telefono_tutor',
      'dia_participacion',
    ],
    phoneField: 'telefono_tutor',
  },
  'mini-marathon': {
    label: 'Mini Maratón',
    thanksTitle: '¡Gracias por inscribirte en Mini Maratón!',
    thanksMessage: 'Te esperamos para correr, divertirte y vivir una aventura increíble.',
    required: [
      'nombre_participante',
      'edad',
    ],
    ageField: 'edad',
  },
};

const MINIMUM_FILL_TIME_MS = 2500;
const LOCAL_SUBMIT_COOLDOWN_MS = 12000;
const REDIRECT_DELAY_MS = 650;

const forms = document.querySelectorAll('[data-form]');

function getBaseUrl() {
  const baseTag = document.querySelector('base[href]');
  const baseFromTag = baseTag?.getAttribute('href');

  if (baseFromTag) {
    return baseFromTag;
  }

  const path = window.location.pathname;
  const festivalIndex = path.indexOf('/festival-kids/');

  if (festivalIndex >= 0) {
    return path.slice(0, festivalIndex + '/festival-kids/'.length);
  }

  return '/';
}

function getThanksUrl(formName) {
  const baseUrl = getBaseUrl();
  return `${baseUrl}gracias/?form=${encodeURIComponent(formName)}`;
}

function setMessage(form, text, status = '') {
  const message = form.querySelector('[data-form-message]');
  if (!message) return;

  message.textContent = text;
  if (status) {
    message.dataset.status = status;
  } else {
    delete message.dataset.status;
  }
}

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function getFieldValue(formData, key) {
  return String(formData.get(key) || '').trim();
}

function ensureMetadata(form) {
  const sourceUrl = form.querySelector('[data-source-url]');
  const startedAt = form.querySelector('[data-started-at]');

  if (sourceUrl) {
    sourceUrl.value = window.location.href;
  }

  if (startedAt && !startedAt.value) {
    startedAt.value = String(Date.now());
  }
}

function setupNumericInputs() {
  const numericInputs = document.querySelectorAll('[data-numeric]');

  numericInputs.forEach((input) => {
    const sanitize = () => {
      const maxLength = Number(input.dataset.maxlength || input.getAttribute('maxlength') || 0);
      let value = input.value.replace(/\D/g, '');

      if (maxLength > 0) {
        value = value.slice(0, maxLength);
      }

      if (input.value !== value) {
        input.value = value;
      }
    };

    input.addEventListener('input', sanitize);
    input.addEventListener('paste', () => {
      window.setTimeout(sanitize, 0);
    });
  });
}

function validatePayload(formName, formData) {
  const rules = FORM_RULES[formName];

  if (!rules) {
    return 'Formulario no reconocido.';
  }

  const honeypot = getFieldValue(formData, 'website');
  if (honeypot) {
    return 'No se pudo validar el registro.';
  }

  const startedAt = Number(getFieldValue(formData, 'started_at'));
  if (!startedAt || Date.now() - startedAt < MINIMUM_FILL_TIME_MS) {
    return 'Esperá unos segundos antes de enviar el registro.';
  }

  for (const field of rules.required) {
    if (!getFieldValue(formData, field)) {
      return 'Completá todos los campos obligatorios.';
    }
  }

  if (rules.phoneField) {
    const phone = normalizePhone(getFieldValue(formData, rules.phoneField));

    if (!/^\d{8}$/.test(phone)) {
      return 'Ingresá un teléfono válido de 8 dígitos.';
    }

    formData.set(rules.phoneField, phone);
  }

  if (rules.ageField) {
    const ageRaw = getFieldValue(formData, rules.ageField).replace(/\D/g, '');
    const age = Number(ageRaw);

    formData.set(rules.ageField, ageRaw);

    if (!/^\d{1,2}$/.test(ageRaw) || !Number.isInteger(age) || age < 1 || age > 17) {
      return 'Ingresá una edad válida.';
    }
  }

  return '';
}

function hasLocalCooldown(formName) {
  const key = `festival-kids-last-submit-${formName}`;

  try {
    const lastSubmit = Number(localStorage.getItem(key) || '0');
    return Date.now() - lastSubmit < LOCAL_SUBMIT_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function setLocalCooldown(formName) {
  const key = `festival-kids-last-submit-${formName}`;

  try {
    localStorage.setItem(key, String(Date.now()));
  } catch {
    // localStorage puede no estar disponible en algunos navegadores.
  }
}

function buildPayload(formName, formData) {
  const payload = Object.fromEntries(formData.entries());

  return {
    ...payload,
    form_type: payload.form_type || formName,
    form_name: FORM_RULES[formName]?.label || formName,
    source_url: payload.source_url || window.location.href,
    submitted_at: new Date().toISOString(),
    user_agent: navigator.userAgent,
    page_title: document.title,
  };
}

async function submitToGoogleSheets(payload) {
  if (!GOOGLE_APPS_SCRIPT_URL) {
    throw new Error('Falta configurar GOOGLE_APPS_SCRIPT_URL en public/scripts/forms.js.');
  }

  await fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });

  return {
    ok: true,
    message: 'Inscripción enviada correctamente.',
  };
}

function ensureSubmitOverlay() {
  let overlay = document.querySelector('[data-submit-loader]');

  if (overlay) {
    return overlay;
  }

  overlay = document.createElement('div');
  overlay.className = 'fk-submit-loader';
  overlay.setAttribute('data-submit-loader', '');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="fk-submit-loader__card" role="status" aria-live="polite">
      <div class="fk-submit-loader__flower" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <i></i>
      </div>
      <p data-submit-loader-title>Enviando inscripción...</p>
      <small>Guardando tu participación</small>
      <div class="fk-submit-loader__dots" aria-hidden="true">
        <b></b>
        <b></b>
        <b></b>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.setAttribute('data-submit-loader-style', '');
  style.textContent = `
    .fk-submit-loader {
      position: fixed;
      inset: 0;
      z-index: 10001;
      display: grid;
      place-items: center;
      padding: 22px;
      background: rgba(0, 111, 227, 0.76);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 240ms ease, visibility 240ms ease;
      backdrop-filter: blur(7px);
    }

    .fk-submit-loader.is-active {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    .fk-submit-loader__card {
      display: grid;
      justify-items: center;
      gap: 14px;
      width: min(100%, 360px);
      padding: 30px 26px;
      border-radius: 34px;
      background: #ffffff;
      color: #006fe3;
      text-align: center;
      box-shadow: 0 24px 60px rgba(0, 43, 110, 0.25);
    }

    .fk-submit-loader__card p {
      margin: 0;
      color: #006fe3;
      font-family: var(--font-ui);
      font-size: clamp(1.3rem, 5vw, 2rem);
      font-weight: 700;
      line-height: 1;
    }

    .fk-submit-loader__card small {
      color: #ef4618;
      font-family: var(--font-ui);
      font-size: 0.95rem;
      font-weight: 700;
    }

    .fk-submit-loader__flower {
      position: relative;
      width: 56px;
      height: 56px;
      animation: fk-submit-flower-spin 1.2s linear infinite;
    }

    .fk-submit-loader__flower::before,
    .fk-submit-loader__flower::after,
    .fk-submit-loader__flower span {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: 22px;
      height: 32px;
      border-radius: 999px 999px 65% 65%;
      background: #00a9e8;
      box-shadow: inset 0 0 0 2px #ffffff, 0 0 0 2px #006fe3;
      transform-origin: 50% 100%;
    }

    .fk-submit-loader__flower::before {
      transform: translate(-50%, -100%) rotate(0deg);
    }

    .fk-submit-loader__flower::after {
      transform: translate(-50%, -100%) rotate(72deg);
    }

    .fk-submit-loader__flower span:nth-child(1) {
      transform: translate(-50%, -100%) rotate(144deg);
    }

    .fk-submit-loader__flower span:nth-child(2) {
      transform: translate(-50%, -100%) rotate(216deg);
    }

    .fk-submit-loader__flower span:nth-child(3) {
      transform: translate(-50%, -100%) rotate(288deg);
    }

    .fk-submit-loader__flower i {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 2;
      width: 16px;
      height: 16px;
      border-radius: 999px;
      background: #ffe600;
      box-shadow: inset 0 0 0 2px #ffffff;
      transform: translate(-50%, -50%);
    }

    .fk-submit-loader__dots {
      display: inline-flex;
      gap: 8px;
    }

    .fk-submit-loader__dots b {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: #ffe600;
      animation: fk-submit-dot 850ms ease-in-out infinite;
    }

    .fk-submit-loader__dots b:nth-child(2) {
      animation-delay: 120ms;
    }

    .fk-submit-loader__dots b:nth-child(3) {
      animation-delay: 240ms;
    }

    @keyframes fk-submit-flower-spin {
      to { rotate: 1turn; }
    }

    @keyframes fk-submit-dot {
      0%, 100% { translate: 0 0; opacity: 0.5; }
      50% { translate: 0 -6px; opacity: 1; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);
  return overlay;
}

function showSubmitOverlay(formName) {
  const overlay = ensureSubmitOverlay();
  const title = overlay.querySelector('[data-submit-loader-title]');
  const label = FORM_RULES[formName]?.label || 'inscripción';

  if (title) {
    title.textContent = `Enviando ${label}...`;
  }

  overlay.classList.add('is-active');
  overlay.setAttribute('aria-hidden', 'false');
}

function hideSubmitOverlay() {
  const overlay = document.querySelector('[data-submit-loader]');
  if (!overlay) return;

  overlay.classList.remove('is-active');
  overlay.setAttribute('aria-hidden', 'true');
}

setupNumericInputs();

forms.forEach((form) => {
  ensureMetadata(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formName = form.getAttribute('data-form') || 'formulario';
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');

    ensureMetadata(form);

    const validationMessage = validatePayload(formName, formData);
    if (validationMessage) {
      setMessage(form, validationMessage, 'error');
      return;
    }

    if (hasLocalCooldown(formName)) {
      setMessage(form, 'Ya recibimos un registro hace unos segundos. Intentá nuevamente en un momento.', 'error');
      return;
    }

    const payload = buildPayload(formName, formData);

    setMessage(form, 'Enviando inscripción...', '');
    showSubmitOverlay(formName);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.dataset.originalLabel = submitButton.textContent || '';
      submitButton.textContent = 'Enviando...';
    }

    try {
      await submitToGoogleSheets(payload);

      setLocalCooldown(formName);
      setMessage(form, 'Inscripción enviada correctamente.', 'success');

      window.setTimeout(() => {
        window.location.href = getThanksUrl(formName);
      }, REDIRECT_DELAY_MS);
    } catch (error) {
      console.error('[Festival Kids] Error enviando formulario:', error);
      hideSubmitOverlay();
      setMessage(form, error.message || 'No se pudo enviar. Revisá tu conexión e intentá de nuevo.', 'error');

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitButton.dataset.originalLabel || 'Enviar inscripción';
      }
    }
  });
});