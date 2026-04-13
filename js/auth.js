/* ============================================
   UTHUB - AUTENTICACIÓN
   ============================================ */

const API_URL = 'http://localhost:3000/api';

function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('login-btn');

  UThubValidation.enableLiveValidation(emailInput, ['required', 'emailUTSC']);
  UThubValidation.enableLiveValidation(passwordInput, ['required']);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailValid = UThubValidation.validateField(emailInput, ['required', 'emailUTSC']);
    const passwordValid = UThubValidation.validateField(passwordInput, ['required']);
    if (!emailValid || !passwordValid) {
      showMessage('Por favor corrige los errores', 'error');
      return;
    }

    setLoading(submitBtn, true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('uthub_token', data.token);
        localStorage.setItem('uthub_user', JSON.stringify(data.usuario));
        showMessage('¡Bienvenido de nuevo!', 'success');
        setTimeout(() => {
          window.location.href = '../dashboard.html';
        }, 1000);
      } else {
        showMessage(data.error || 'Error al iniciar sesión', 'error');
        setLoading(submitBtn, false);
      }
    } catch (error) {
      showMessage('No se pudo conectar con el servidor', 'error');
      setLoading(submitBtn, false);
    }
  });
}

function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  const nombreInput = document.getElementById('nombre');
  const apellidoInput = document.getElementById('apellido');
  const emailInput = document.getElementById('email');
  const matriculaInput = document.getElementById('matricula');
  const carreraInput = document.getElementById('carrera');
  const passwordInput = document.getElementById('password');
  const passwordConfirmInput = document.getElementById('password-confirm');
  const termsCheckbox = document.getElementById('terms');
  const submitBtn = document.getElementById('register-btn');

  UThubValidation.enableLiveValidation(nombreInput, ['required', 'onlyLetters']);
  UThubValidation.enableLiveValidation(apellidoInput, ['required', 'onlyLetters']);
  UThubValidation.enableLiveValidation(emailInput, ['required', 'emailUTSC']);
  UThubValidation.enableLiveValidation(matriculaInput, ['required', 'matricula']);
  UThubValidation.enableLiveValidation(passwordInput, ['required', 'password']);

  matriculaInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    if (e.target.value.length === 5) {
      UThubValidation.autoGenerateEmail(matriculaInput, emailInput);
    }
  });

  passwordConfirmInput.addEventListener('blur', () => {
    UThubValidation.validatePasswordMatch(passwordInput, passwordConfirmInput);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreValid = UThubValidation.validateField(nombreInput, ['required', 'onlyLetters']);
    const apellidoValid = UThubValidation.validateField(apellidoInput, ['required', 'onlyLetters']);
    const emailValid = UThubValidation.validateField(emailInput, ['required', 'emailUTSC']);
    const matriculaValid = UThubValidation.validateField(matriculaInput, ['required', 'matricula']);
    const carreraValid = carreraInput.value !== '';
    const passwordValid = UThubValidation.validateField(passwordInput, ['required', 'password']);
    const passwordMatchValid = UThubValidation.validatePasswordMatch(passwordInput, passwordConfirmInput);
    const termsValid = UThubValidation.validateTerms(termsCheckbox);

    if (!nombreValid || !apellidoValid || !emailValid || !matriculaValid || !carreraValid || !passwordValid || !passwordMatchValid || !termsValid) {
      showMessage('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    setLoading(submitBtn, true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreInput.value.trim(),
          apellido: apellidoInput.value.trim(),
          email: emailInput.value.trim(),
          matricula: matriculaInput.value.trim(),
          carrera: carreraInput.value,
          password: passwordInput.value
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('uthub_token', data.token);
        localStorage.setItem('uthub_user', JSON.stringify(data.usuario));
        showMessage('¡Cuenta creada exitosamente!', 'success');
        setTimeout(() => {
          window.location.href = '../dashboard.html';
        }, 1500);
      } else {
        showMessage(data.error || 'Error al crear la cuenta', 'error');
        setLoading(submitBtn, false);
      }
    } catch (error) {
      showMessage('No se pudo conectar con el servidor', 'error');
      setLoading(submitBtn, false);
    }
  });
}

function initResetForm() {
  const form = document.getElementById('reset-form');
  const successMessage = document.getElementById('success-message');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const submitBtn = document.getElementById('reset-btn');

  UThubValidation.enableLiveValidation(emailInput, ['required', 'emailUTSC']);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailValid = UThubValidation.validateField(emailInput, ['required', 'emailUTSC']);
    if (!emailValid) {
      showMessage('Por favor ingresa un correo válido', 'error');
      return;
    }

    setLoading(submitBtn, true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.value.trim() })
      });

      if (response.ok) {
        form.style.display = 'none';
        successMessage.style.display = 'block';
      } else {
        const data = await response.json();
        showMessage(data.error || 'Error al enviar el correo', 'error');
        setLoading(submitBtn, false);
      }
    } catch (error) {
      showMessage('No se pudo conectar con el servidor', 'error');
      setLoading(submitBtn, false);
    }
  });
}

function initDashboard() {
  const token = localStorage.getItem('uthub_token');
  if (!token) {
    window.location.href = 'pages/auth/login.html';
    return;
  }

  const user = JSON.parse(localStorage.getItem('uthub_user') || '{}');

  document.getElementById('user-name').textContent = `${user.nombre} ${user.apellido || ''}`;
  document.getElementById('welcome-name').textContent = user.nombre;
  document.getElementById('user-initials').textContent = `${user.nombre?.charAt(0)}${user.apellido?.charAt(0) || ''}`;

  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');

  userMenuBtn?.addEventListener('click', () => {
    const isVisible = userDropdown.style.display === 'block';
    userDropdown.style.display = isVisible ? 'none' : 'block';
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
      userDropdown.style.display = 'none';
    }
  });

  document.getElementById('logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}

function logout() {
  if (confirm('¿Estás seguro de cerrar sesión?')) {
    localStorage.removeItem('uthub_token');
    localStorage.removeItem('uthub_user');

   window.location.href = `${window.location.origin}/UThub/pages/auth/login.html`;
  }
}

function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('auth-message');
  if (!messageDiv) return;
  messageDiv.className = `auth-message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.display = 'flex';
  setTimeout(() => { messageDiv.style.display = 'none'; }, 5000);
}

function setLoading(button, isLoading) {
  if (!button) return;
  const btnText = button.querySelector('.btn-text');
  const btnLoader = button.querySelector('.btn-loader');
  if (isLoading) {
    button.classList.add('loading');
    button.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-block';
  } else {
    button.classList.remove('loading');
    button.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

function isAuthenticated() {
  return localStorage.getItem('uthub_token') !== null;
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('uthub_user') || '{}');
}

window.initLoginForm = initLoginForm;
window.initRegisterForm = initRegisterForm;
window.initResetForm = initResetForm;
window.initDashboard = initDashboard;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;