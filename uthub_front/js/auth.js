/* ============================================
   UTHUB - AUTENTICACIÓN
   ============================================ */

const API_URL = '/backend/api'; // Ajustar según tu configuración

/**
 * INICIALIZAR FORMULARIO DE LOGIN
 */
function initLoginForm() {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('login-btn');
  const messageDiv = document.getElementById('auth-message');
  
  if (!form) return;
  
  // Validación en tiempo real
  UThubValidation.enableLiveValidation(emailInput, ['required', 'emailUTSC']);
  UThubValidation.enableLiveValidation(passwordInput, ['required']);
  
  // Submit del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validar campos
    const emailValid = UThubValidation.validateField(emailInput, ['required', 'emailUTSC']);
    const passwordValid = UThubValidation.validateField(passwordInput, ['required']);
    
    if (!emailValid || !passwordValid) {
      showMessage('Por favor corrige los errores', 'error');
      return;
    }
    
    // Mostrar loading
    setLoading(submitBtn, true);
    
    // Datos del formulario
    const formData = {
      email: emailInput.value.trim(),
      password: passwordInput.value,
      remember: document.getElementById('remember')?.checked || false
    };
    
    try {
      // Llamar al API de login
      const response = await fetch(`${API_URL}/auth/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Guardar token
        localStorage.setItem('uthub_token', data.token);
        localStorage.setItem('uthub_user', JSON.stringify(data.user));
        
        // Mostrar éxito
        showMessage('¡Bienvenido de nuevo!', 'success');
        
        // Redirigir al dashboard
        setTimeout(() => {
          window.location.href = '../dashboard.html';
        }, 1000);
        
      } else {
        // Mostrar error del servidor
        showMessage(data.message || 'Error al iniciar sesión', 'error');
        setLoading(submitBtn, false);
      }
      
    } catch (error) {
      console.error('Error de login:', error);
      
      // MODO DEMO - Comentar en producción
      console.warn('⚠️ Modo DEMO: Simulando login exitoso');
      
      // Simular login exitoso para desarrollo
      const demoUser = {
        id: 1,
        nombre: 'Samantha',
        apellido: 'Mata',
        email: formData.email,
        carrera: 'Gestión y Desarrollo de Software'
      };
      
      localStorage.setItem('uthub_token', 'demo-token-12345');
      localStorage.setItem('uthub_user', JSON.stringify(demoUser));
      
      showMessage('¡Bienvenido de nuevo! (Modo demo)', 'success');
      
      setTimeout(() => {
        window.location.href = '../dashboard.html';
      }, 1000);
    }
  });
  
  // Social login (Google, Microsoft)
  document.getElementById('google-login')?.addEventListener('click', () => {
    alert('Login con Google - Implementar OAuth2');
  });
  
  document.getElementById('microsoft-login')?.addEventListener('click', () => {
    alert('Login con Microsoft - Implementar OAuth2');
  });
}

/**
 * INICIALIZAR FORMULARIO DE REGISTRO
 */
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
  
  // Validación en tiempo real
  UThubValidation.enableLiveValidation(nombreInput, ['required', 'onlyLetters']);
  UThubValidation.enableLiveValidation(apellidoInput, ['required', 'onlyLetters']);
  UThubValidation.enableLiveValidation(emailInput, ['required', 'emailUTSC']);
  UThubValidation.enableLiveValidation(matriculaInput, ['required', 'matricula']);
  UThubValidation.enableLiveValidation(passwordInput, ['required', 'password']);
  
  // Validar solo números en matrícula
  matriculaInput.addEventListener('input', (e) => {
    // Permitir solo números
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    
    // Auto-generar correo
    if (e.target.value.length === 5) {
      UThubValidation.autoGenerateEmail(matriculaInput, emailInput);
    }
  });
  
  // Validar confirmación de contraseña
  passwordConfirmInput.addEventListener('blur', () => {
    UThubValidation.validatePasswordMatch(passwordInput, passwordConfirmInput);
  });
  
  // Submit del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validar todos los campos
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
    
    // Mostrar loading
    setLoading(submitBtn, true);
    
    // Datos del formulario
    const formData = {
      nombre: nombreInput.value.trim(),
      apellido: apellidoInput.value.trim(),
      email: emailInput.value.trim(),
      matricula: matriculaInput.value.trim(),
      carrera: carreraInput.value,
      password: passwordInput.value
    };
    
    try {
      // Llamar al API de registro
      const response = await fetch(`${API_URL}/auth/register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Mostrar éxito
        showMessage('¡Cuenta creada exitosamente! Redirigiendo...', 'success');
        
        // Guardar token
        localStorage.setItem('uthub_token', data.token);
        localStorage.setItem('uthub_user', JSON.stringify(data.user));
        
        // Redirigir al dashboard
        setTimeout(() => {
          window.location.href = '../dashboard.html';
        }, 1500);
        
      } else {
        showMessage(data.message || 'Error al crear la cuenta', 'error');
        setLoading(submitBtn, false);
      }
      
    } catch (error) {
      console.error('Error de registro:', error);
      
      // MODO DEMO
      console.warn('⚠️ Modo DEMO: Simulando registro exitoso');
      
      const demoUser = {
        id: 1,
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        carrera: formData.carrera
      };
      
      localStorage.setItem('uthub_token', 'demo-token-12345');
      localStorage.setItem('uthub_user', JSON.stringify(demoUser));
      
      showMessage('¡Cuenta creada exitosamente! (Modo demo)', 'success');
      
      setTimeout(() => {
        window.location.href = '../dashboard.html';
      }, 1500);
    }
  });
}

/**
 * INICIALIZAR FORMULARIO DE RESET
 */
function initResetForm() {
  const form = document.getElementById('reset-form');
  const successMessage = document.getElementById('success-message');
  if (!form) return;
  
  const emailInput = document.getElementById('email');
  const submitBtn = document.getElementById('reset-btn');
  const resendBtn = document.getElementById('resend-btn');
  
  // Validación en tiempo real
  UThubValidation.enableLiveValidation(emailInput, ['required', 'emailUTSC']);
  
  // Submit del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validar email
    const emailValid = UThubValidation.validateField(emailInput, ['required', 'emailUTSC']);
    
    if (!emailValid) {
      showMessage('Por favor ingresa un correo válido', 'error');
      return;
    }
    
    // Mostrar loading
    setLoading(submitBtn, true);
    
    const formData = {
      email: emailInput.value.trim()
    };
    
    try {
      // Llamar al API de reset
      const response = await fetch(`${API_URL}/auth/reset.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Ocultar formulario y mostrar mensaje de éxito
        form.style.display = 'none';
        successMessage.style.display = 'block';
      } else {
        showMessage(data.message || 'Error al enviar el correo', 'error');
        setLoading(submitBtn, false);
      }
      
    } catch (error) {
      console.error('Error de reset:', error);
      
      // MODO DEMO
      console.warn('⚠️ Modo DEMO: Simulando envío de correo');
      form.style.display = 'none';
      successMessage.style.display = 'block';
    }
  });
  
  // Botón de reenviar
  resendBtn?.addEventListener('click', async () => {
    setLoading(resendBtn, true);
    
    setTimeout(() => {
      setLoading(resendBtn, false);
      alert('Correo reenviado exitosamente');
    }, 2000);
  });
}

/**
 * INICIALIZAR DASHBOARD
 */
function initDashboard() {
  // Verificar autenticación
  const token = localStorage.getItem('uthub_token');
  
  if (!token) {
    // Redirigir a login si no está autenticado
    window.location.href = 'pages/auth/login.html';
    return;
  }
  
  // Cargar datos del usuario
  const user = JSON.parse(localStorage.getItem('uthub_user') || '{}');
  
  // Actualizar UI con datos del usuario
  document.getElementById('user-name').textContent = `${user.nombre} ${user.apellido}`;
  document.getElementById('welcome-name').textContent = user.nombre;
  document.getElementById('user-initials').textContent = `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`;
  
  // Toggle del menú de usuario
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');
  
  userMenuBtn?.addEventListener('click', () => {
    const isVisible = userDropdown.style.display === 'block';
    userDropdown.style.display = isVisible ? 'none' : 'block';
  });
  
  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
      userDropdown.style.display = 'none';
    }
  });
  
  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}

/**
 * CERRAR SESIÓN
 */
function logout() {
  if (confirm('¿Estás seguro de cerrar sesión?')) {
    localStorage.removeItem('uthub_token');
    localStorage.removeItem('uthub_user');
    window.location.href = 'pages/auth/login.html';
  }
}

/**
 * MOSTRAR MENSAJE DE ESTADO
 */
function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('auth-message');
  if (!messageDiv) return;
  
  messageDiv.className = `auth-message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.display = 'flex';
  
  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

/**
 * TOGGLE LOADING STATE
 */
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

/**
 * VERIFICAR SI ESTÁ AUTENTICADO
 */
function isAuthenticated() {
  return localStorage.getItem('uthub_token') !== null;
}

/**
 * OBTENER DATOS DEL USUARIO
 */
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('uthub_user') || '{}');
}

// Exportar funciones
window.initLoginForm = initLoginForm;
window.initRegisterForm = initRegisterForm;
window.initResetForm = initResetForm;
window.initDashboard = initDashboard;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
