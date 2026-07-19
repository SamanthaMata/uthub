/* ============================================
   UTHUB - JAVASCRIPT PRINCIPAL
   Universidad Tecnológica Santa Catarina
   ============================================ */

// ──── VARIABLES GLOBALES ────
const header = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const searchInput = document.getElementById('global-search');

// ──── HEADER SCROLL EFFECT ────
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('header-scrolled');
  } else {
    header.classList.remove('header-scrolled');
  }
});

// Estilos adicionales para header scrolled (agregar al CSS si no existe)
const style = document.createElement('style');
style.textContent = `
  .header-scrolled {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
`;
document.head.appendChild(style);

// ──── MENÚ MÓVIL TOGGLE ────
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('nav-active');
    navToggle.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });
}

// Cerrar menú al hacer click en un enlace
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('nav-active');
    navToggle.classList.remove('active');
    document.body.classList.remove('no-scroll');
  });
});

// ──── BÚSQUEDA GLOBAL ────
let searchTimeout;

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // Debouncing - esperar 300ms antes de buscar
    clearTimeout(searchTimeout);
    
    if (query.length >= 2) {
      searchTimeout = setTimeout(() => {
        realizarBusqueda(query);
      }, 300);
    } else {
      ocultarResultados();
    }
  });
  
  // Cerrar resultados al hacer click fuera
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !e.target.closest('.search-results')) {
      ocultarResultados();
    }
  });
}

function realizarBusqueda(query) {
  console.log('Buscando:', query);
  
  // Aquí irá la llamada al API cuando esté implementado
  // Por ahora, mostramos resultados de ejemplo
  
  const resultadosEjemplo = [
    {
      tipo: 'comida',
      titulo: 'Tacos El Profe',
      descripcion: 'Tacos de asada, pastor y pollo',
      icono: '🍔',
      url: 'pages/comida/menu.html?id=1'
    },
    {
      tipo: 'tutoria',
      titulo: 'Carlos Mendoza - Cálculo',
      descripcion: 'Tutor de matemáticas avanzadas',
      icono: '📚',
      url: 'pages/tutorias/tutor.html?id=5'
    },
    {
      tipo: 'libro',
      titulo: 'Fundamentos de Base de Datos',
      descripcion: 'Ramez Elmasri - 7ª edición',
      icono: '📖',
      url: 'pages/libros/detalle.html?id=12'
    }
  ];
  
  mostrarResultados(resultadosEjemplo);
}

function mostrarResultados(resultados) {
  let searchResults = document.querySelector('.search-results');
  
  // Crear contenedor si no existe
  if (!searchResults) {
    searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    searchInput.parentElement.appendChild(searchResults);
  }
  
  // Generar HTML de resultados
  const html = resultados.map(r => `
    <a href="${r.url}" class="search-result-item">
      <span class="result-icon">${r.icono}</span>
      <div class="result-content">
        <div class="result-title">${r.titulo}</div>
        <div class="result-description">${r.descripcion}</div>
      </div>
      <span class="result-badge">${r.tipo}</span>
    </a>
  `).join('');
  
  searchResults.innerHTML = html;
  searchResults.classList.add('active');
}

function ocultarResultados() {
  const searchResults = document.querySelector('.search-results');
  if (searchResults) {
    searchResults.classList.remove('active');
  }
}

// Estilos para resultados de búsqueda
const searchStyles = document.createElement('style');
searchStyles.textContent = `
  .search-container {
    position: relative;
  }
  
  .search-results {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 100;
  }
  
  .search-results.active {
    max-height: 400px;
    opacity: 1;
  }
  
  .search-result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid #F0EDE8;
    transition: all 0.2s ease;
  }
  
  .search-result-item:last-child {
    border-bottom: none;
  }
  
  .search-result-item:hover {
    background: #FFF0E0;
  }
  
  .result-icon {
    font-size: 24px;
    flex-shrink: 0;
  }
  
  .result-content {
    flex: 1;
  }
  
  .result-title {
    font-weight: 600;
    font-size: 14px;
    color: #1A1A2E;
    margin-bottom: 2px;
  }
  
  .result-description {
    font-size: 12px;
    color: #6B6B80;
  }
  
  .result-badge {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: #F5841F;
    background: #FFF0E0;
    padding: 4px 8px;
    border-radius: 4px;
  }
`;
document.head.appendChild(searchStyles);

// ──── ANIMACIONES DE SCROLL ────
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, observerOptions);

// Observar elementos con animación
const animatedElements = document.querySelectorAll('.modulo-card, .step-card, .testimonio-card');
animatedElements.forEach(el => observer.observe(el));

// Estilos de animación
const animationStyles = document.createElement('style');
animationStyles.textContent = `
  .modulo-card,
  .step-card,
  .testimonio-card {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease;
  }
  
  .modulo-card.animate-in,
  .step-card.animate-in,
  .testimonio-card.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(animationStyles);

// ──── SMOOTH SCROLL PARA ENLACES INTERNOS ────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    
    // Ignorar # solo
    if (href === '#') {
      e.preventDefault();
      return;
    }
    
    const target = document.querySelector(href);
    
    if (target) {
      e.preventDefault();
      
      const headerHeight = header.offsetHeight;
      const targetPosition = target.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ──── MÓDULOS HOVER EFFECT ────
const moduloCards = document.querySelectorAll('.modulo-card');

moduloCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    const module = card.getAttribute('data-module');
    card.style.transform = 'translateY(-8px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ──── CONTADOR ANIMADO PARA STATS ────
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = target + '+';
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start) + '+';
    }
  }, 16);
}

// Activar contadores cuando sean visibles
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
      entry.target.classList.add('counted');
      const target = parseInt(entry.target.textContent);
      animateCounter(entry.target, target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(stat => {
  statsObserver.observe(stat);
});

// ──── CARGAR PREFERENCIAS DEL USUARIO ────
function cargarPreferencias() {
  const preferencias = localStorage.getItem('uthub_preferencias');
  
  if (preferencias) {
    const prefs = JSON.parse(preferencias);
    console.log('Preferencias cargadas:', prefs);
    
    // Aplicar preferencias si existen
    if (prefs.modulo_favorito) {
      resaltarModuloFavorito(prefs.modulo_favorito);
    }
  }
}

function resaltarModuloFavorito(modulo) {
  const card = document.querySelector(`[data-module="${modulo}"]`);
  if (card) {
    card.style.border = '2px solid var(--ut-orange)';
  }
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('uthub_user') || '{}');
  } catch {
    return {};
  }
}

function pageHref(pagePath) {
  const path = window.location.pathname.replace(/\\/g, '/');

  if (path.includes('/pages/')) {
    const afterPages = path.split('/pages/')[1] || '';
    const depth = Math.max(0, afterPages.split('/').length - 1);
    return `${'../'.repeat(depth)}${pagePath}`;
  }

  return `pages/${pagePath}`;
}

function initUserUI() {
  const user = getStoredUser();
  if (!user?.nombre) return;

  const fullName = `${user.nombre} ${user.apellido || ""}`.trim();
  const initials = getInitials(fullName);
  const userMenu = document.querySelector('.user-menu');

  const userNameEl = document.getElementById("user-name") || userMenu?.querySelector(".user-name");
  const userInitialsEl = document.getElementById("user-initials") || userMenu?.querySelector(".user-avatar span");
  const welcomeNameEl = document.getElementById("welcome-name");

  if (userNameEl) userNameEl.textContent = fullName;
  if (userInitialsEl) userInitialsEl.textContent = initials;
  if (welcomeNameEl) welcomeNameEl.textContent = user.nombre;
}

function getInitials(nombreCompleto) {
  const partes = String(nombreCompleto || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return 'UT';
  
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  
  return partes[0][0].toUpperCase();
}

function closeUserDropdown(dropdown) {
  if (!dropdown) return;
  dropdown.style.display = 'none';
  dropdown.classList.remove('active', 'is-open');
}

function logoutUthub() {
  localStorage.removeItem('uthub_token');
  localStorage.removeItem('uthub_user');
  window.location.href = pageHref('auth/login.html');
}

function initUserMenu() {
  const userBtn = document.getElementById("user-menu-btn")
    || document.querySelector(".user-menu .user-btn, .user-menu .user-menu-btn");
  if (!userBtn) return;
  if (!userBtn.id) userBtn.id = "user-menu-btn";

  let dropdown = document.getElementById("user-dropdown");
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'user-dropdown';
    dropdown.className = 'user-dropdown dropdown-menu';
    userBtn.insertAdjacentElement('afterend', dropdown);
  }

  dropdown.innerHTML = `
    <a href="${pageHref('usuario/perfil.html')}" class="dropdown-item">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      Mi Perfil
    </a>
    <a href="${pageHref('usuario/perfil.html')}" class="dropdown-item">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1v.2a2 2 0 1 1-4 0V21a1.7 1.7 0 0 0-.4-1 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4h-.2a2 2 0 1 1 0-4H3a1.7 1.7 0 0 0 1-.4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1v-.2a2 2 0 1 1 4 0V3a1.7 1.7 0 0 0 .4 1 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.2.33.41.67.6 1h.2a2 2 0 1 1 0 4H20a1.7 1.7 0 0 0-.6 1z"></path>
      </svg>
      Configuración
    </a>
    <a href="${pageHref('comida/pedidos.html')}" class="dropdown-item">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1"></rect>
        <path d="M8 12h8M8 16h5"></path>
      </svg>
      Mis Pedidos
    </a>
    <a href="${pageHref('comida/mi-tienda.html')}" class="dropdown-item">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7"></path>
        <path d="M5 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10"></path>
        <path d="M9 22V12h6v10"></path>
      </svg>
      Mi Tienda
    </a>
    <div class="dropdown-divider"></div>
    <button type="button" class="dropdown-item logout-btn" id="logout-btn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
      Cerrar Sesión
    </button>
  `;

  if (userBtn && dropdown) {
    userBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = dropdown.style.display === "block" || dropdown.classList.contains('active') || dropdown.classList.contains('is-open');
      dropdown.style.display = isOpen ? "none" : "block";
      dropdown.classList.toggle('active', !isOpen);
      dropdown.classList.toggle('is-open', !isOpen);
    });

    document.addEventListener("click", (e) => {
      if (!userBtn.contains(e.target) && !dropdown.contains(e.target)) {
        closeUserDropdown(dropdown);
      }
    });
  }

  dropdown.querySelector('#logout-btn')?.addEventListener('click', logoutUthub);
}

function redirigirLogin() {
  window.location.href = pageHref('auth/login.html');
}

function protegerRuta() {
  const token = localStorage.getItem('uthub_token');
  const user = localStorage.getItem('uthub_user');
  const path = window.location.pathname;
  

  // Rutas públicas (no requieren login)
  const rutasPublicas = [
    '/index.html',
    '/pages/auth/login.html',
    '/pages/auth/register.html',
    '/pages/auth/reset.html'
  ];

  const esPublica = rutasPublicas.some(ruta => path.includes(ruta));

  // Si NO es pública y NO hay sesión → redirigir
  if (!esPublica && (!token || !user)) {
    redirigirLogin();
  }
}
// ──── INICIALIZACIÓN ────
function cargarUsuarioGlobal() {
  const user = JSON.parse(localStorage.getItem('uthub_user') || '{}');

  if (!user.nombre) return;

  const nombre = user.nombre;
  const apellido = user.apellido || '';

  const iniciales = `${nombre.charAt(0)}${apellido.charAt(0) || ''}`;

  const userNameEl = document.getElementById('user-name');
  const userInitialsEl = document.getElementById('user-initials');

  if (userNameEl) {
    userNameEl.textContent = `${nombre} ${apellido}`;
  }

  if (userInitialsEl) {
    userInitialsEl.textContent = iniciales.toUpperCase();
  }
}


document.addEventListener('DOMContentLoaded', () => {
  
  console.log('🍊 UThub cargado correctamente');

  // 🔥 ESTO ES LO IMPORTANTE
  initUserUI();
  initUserMenu();
  protegerRuta()
  // Cargar preferencias del usuario
  cargarPreferencias();

  console.log('📍 Página actual:', window.location.pathname);

  const token = localStorage.getItem('uthub_token');
  if (token) {
    console.log('✓ Usuario autenticado');
  } else {
    console.log('○ Usuario no autenticado');
  }
});

// ──── MANEJO DE ERRORES GLOBAL ────
window.addEventListener('error', (e) => {
  console.error('Error en UThub:', e.message);
});

// ──── DETECCIÓN DE CONEXIÓN ────
window.addEventListener('online', () => {
  console.log('✓ Conexión restaurada');
  mostrarNotificacion('Conexión restaurada', 'success');
});

window.addEventListener('offline', () => {
  console.log('✗ Sin conexión a internet');
  mostrarNotificacion('Sin conexión a internet', 'error');
});

function mostrarNotificacion(mensaje, tipo = 'info') {
  // Crear notificación toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensaje;
  
  document.body.appendChild(toast);
  
  // Animar entrada
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Estilos para notificaciones toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  .toast.show {
    transform: translateY(0);
    opacity: 1;
  }
  
  .toast-success {
    border-left: 4px solid #22C55E;
  }
  
  .toast-error {
    border-left: 4px solid #FF4F5E;
  }
  
  .toast-info {
    border-left: 4px solid #60A5FA;
  }
`;
document.head.appendChild(toastStyles);

// ──── ANALYTICS (OPCIONAL) ────
function trackEvent(categoria, accion, etiqueta) {
  console.log(' Evento:', categoria, accion, etiqueta);
  
  // Aquí se integraría Google Analytics o similar
  // gtag('event', accion, { event_category: categoria, event_label: etiqueta });
}

// Trackear clicks en módulos
moduloCards.forEach(card => {
  card.addEventListener('click', () => {
    const modulo = card.getAttribute('data-module');
    trackEvent('Módulos', 'Click', modulo);
  });
});

// Trackear búsquedas
if (searchInput) {
  searchInput.addEventListener('search', (e) => {
    trackEvent('Búsqueda', 'Query', e.target.value);
  });
}

// ──── EXPORT FUNCIONES ÚTILES ────
window.UThub = {
  mostrarNotificacion,
  trackEvent,
  cargarPreferencias
};

console.log(' UThub JavaScript inicializado correctamente');




