/* ============================================
   UTHUB - VALIDACIÓN DE FORMULARIOS
   ============================================ */

// Expresiones regulares
const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  emailUTSC: /^[0-9]{5}@virtual\.utsc\.edu\.mx$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  matricula: /^[0-9]{5}$/,
  phone: /^[0-9]{10}$/,
  onlyLetters: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  onlyNumbers: /^[0-9]+$/,
};

// Mensajes de error
const ERROR_MESSAGES = {
  required: 'Este campo es obligatorio',
  email: 'Ingresa un correo electrónico válido',
  emailUTSC: 'Debes usar tu correo institucional (matrícula@virtual.utsc.edu.mx)',
  password: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  passwordMatch: 'Las contraseñas no coinciden',
  matricula: 'La matrícula debe tener 5 dígitos',
  phone: 'El teléfono debe tener 10 dígitos',
  terms: 'Debes aceptar los términos y condiciones',
  onlyLetters: 'Solo se permiten letras',
  onlyNumbers: 'Solo se permiten números',
};

/**
 * Validar que el correo coincida con la matrícula
 */
function validateEmailMatchesMatricula(emailInput, matriculaInput) {
  const email = emailInput.value.trim();
  const matricula = matriculaInput.value.trim();
  const errorElement = document.getElementById(`${emailInput.id}-error`);
  
  emailInput.classList.remove('error', 'success');
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('active');
  }
  
  // Si la matrícula está completa, verificar que el correo coincida
  if (matricula.length === 5 && REGEX.onlyNumbers.test(matricula)) {
    const expectedEmail = `${matricula}@virtual.utsc.edu.mx`;
    
    if (email !== expectedEmail) {
      showError(emailInput, `Tu correo debe ser: ${expectedEmail}`);
      return false;
    }
  }
  
  emailInput.classList.add('success');
  return true;
}

/**
 * Auto-generar correo desde matrícula
 */
function autoGenerateEmail(matriculaInput, emailInput) {
  const matricula = matriculaInput.value.trim();
  
  if (matricula.length === 5 && REGEX.onlyNumbers.test(matricula)) {
    emailInput.value = `${matricula}@virtual.utsc.edu.mx`;
    emailInput.classList.add('success');
  }
}

/**
 * Validar campo individual
 */
function validateField(input, rules = []) {
  const value = input.value.trim();
  const errorElement = document.getElementById(`${input.id}-error`);
  
  // Limpiar error previo
  input.classList.remove('error', 'success');
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('active');
  }
  
  // Validar cada regla
  for (let rule of rules) {
    let isValid = true;
    let errorMessage = '';
    
    switch (rule) {
      case 'required':
        isValid = value.length > 0;
        errorMessage = ERROR_MESSAGES.required;
        break;
        
      case 'email':
        isValid = REGEX.email.test(value);
        errorMessage = ERROR_MESSAGES.email;
        break;
        
      case 'emailUTSC':
        isValid = REGEX.emailUTSC.test(value);
        errorMessage = ERROR_MESSAGES.emailUTSC;
        break;
        
      case 'password':
        isValid = REGEX.password.test(value);
        errorMessage = ERROR_MESSAGES.password;
        break;
        
      case 'matricula':
        isValid = REGEX.matricula.test(value);
        errorMessage = ERROR_MESSAGES.matricula;
        break;
        
      case 'phone':
        isValid = REGEX.phone.test(value);
        errorMessage = ERROR_MESSAGES.phone;
        break;
        
      case 'onlyLetters':
        isValid = REGEX.onlyLetters.test(value);
        errorMessage = ERROR_MESSAGES.onlyLetters;
        break;
    }
    
    if (!isValid) {
      showError(input, errorMessage);
      return false;
    }
  }
  
  // Si pasó todas las validaciones
  input.classList.add('success');
  return true;
}

/**
 * Validar contraseñas coincidentes
 */
function validatePasswordMatch(password, passwordConfirm) {
  const errorElement = document.getElementById('password-confirm-error');
  
  passwordConfirm.classList.remove('error', 'success');
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('active');
  }
  
  if (password.value !== passwordConfirm.value) {
    showError(passwordConfirm, ERROR_MESSAGES.passwordMatch);
    return false;
  }
  
  passwordConfirm.classList.add('success');
  return true;
}

/**
 * Validar checkbox de términos
 */
function validateTerms(checkbox) {
  const errorElement = document.getElementById('terms-error');
  
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('active');
  }
  
  if (!checkbox.checked) {
    showError(checkbox, ERROR_MESSAGES.terms);
    return false;
  }
  
  return true;
}

/**
 * Mostrar error en campo
 */
function showError(input, message) {
  input.classList.add('error');
  input.classList.remove('success');
  
  const errorElement = document.getElementById(`${input.id}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('active');
  }
}

/**
 * Validar formulario completo
 */
function validateForm(formId, validations) {
  const form = document.getElementById(formId);
  if (!form) return false;
  
  let isValid = true;
  
  for (let fieldId in validations) {
    const input = document.getElementById(fieldId);
    if (!input) continue;
    
    const rules = validations[fieldId];
    
    if (!validateField(input, rules)) {
      isValid = false;
    }
  }
  
  return isValid;
}

/**
 * Toggle mostrar/ocultar contraseña
 */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.password-toggle');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling;
      
      if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        `;
      } else {
        input.type = 'password';
        button.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `;
      }
    });
  });
}

/**
 * Sanitizar input (prevenir XSS)
 */
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validación en tiempo real
 */
function enableLiveValidation(input, rules) {
  input.addEventListener('blur', () => {
    validateField(input, rules);
  });
  
  input.addEventListener('input', () => {
    // Limpiar error mientras escribe
    if (input.classList.contains('error')) {
      input.classList.remove('error');
      const errorElement = document.getElementById(`${input.id}-error`);
      if (errorElement) {
        errorElement.classList.remove('active');
      }
    }
  });
}

// Inicializar toggles de contraseña al cargar
document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
});

// Exportar funciones
window.UThubValidation = {
  validateField,
  validatePasswordMatch,
  validateTerms,
  validateForm,
  validateEmailMatchesMatricula,
  autoGenerateEmail,
  showError,
  sanitizeInput,
  enableLiveValidation,
  REGEX,
  ERROR_MESSAGES
};
