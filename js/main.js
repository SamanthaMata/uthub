/* ============================================
   UTHUB - JAVASCRIPT PRINCIPAL
   Universidad TecnolÃ³gica Santa Catarina
   ============================================ */

// â”€â”€â”€â”€ VARIABLES GLOBALES â”€â”€â”€â”€
const header = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const searchInput = document.getElementById('global-search');

// â”€â”€â”€â”€ HEADER SCROLL EFFECT â”€â”€â”€â”€
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

// â”€â”€â”€â”€ MENÃš MÃ“VIL TOGGLE â”€â”€â”€â”€
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('nav-active');
    navToggle.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });
}

// Cerrar menÃº al hacer click en un enlace
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('nav-active');
    navToggle.classList.remove('active');
    document.body.classList.remove('no-scroll');
  });
});

// â”€â”€â”€â”€ BÃšSQUEDA GLOBAL â”€â”€â”€â”€
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
  
  // AquÃ­ irÃ¡ la llamada al API cuando estÃ© implementado
  // Por ahora, mostramos resultados de ejemplo
  
  const resultadosEjemplo = [
    {
      tipo: 'comida',
      titulo: 'Tacos El Profe',
      descripcion: 'Tacos de asada, pastor y pollo',
      icono: 'ðŸ”',
      url: 'pages/comida/menu.html?id=1'
    },
    {
      tipo: 'tutoria',
      titulo: 'Carlos Mendoza - CÃ¡lculo',
      descripcion: 'Tutor de matemÃ¡ticas avanzadas',
      icono: 'ðŸ“š',
      url: 'pages/tutorias/tutor.html?id=5'
    },
    {
      tipo: 'libro',
      titulo: 'Fundamentos de Base de Datos',
      descripcion: 'Ramez Elmasri - 7Âª ediciÃ³n',
      icono: 'ðŸ“–',
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

// Estilos para resultados de bÃºsqueda
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

// â”€â”€â”€â”€ ANIMACIONES DE SCROLL â”€â”€â”€â”€
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

// Observar elementos con animaciÃ³n
const animatedElements = document.querySelectorAll('.modulo-card, .step-card, .testimonio-card');
animatedElements.forEach(el => observer.observe(el));

// Estilos de animaciÃ³n
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

// â”€â”€â”€â”€ SMOOTH SCROLL PARA ENLACES INTERNOS â”€â”€â”€â”€
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

// â”€â”€â”€â”€ MÃ“DULOS HOVER EFFECT â”€â”€â”€â”€
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

// â”€â”€â”€â”€ CONTADOR ANIMADO PARA STATS â”€â”€â”€â”€
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

// â”€â”€â”€â”€ CARGAR PREFERENCIAS DEL USUARIO â”€â”€â”€â”€
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
function initUserUI() {
  const user = JSON.parse(localStorage.getItem("uthub_user"));
  if (!user) return;

  const fullName = `${user.nombre} ${user.apellido || ""}`.trim();

  const initials = getInitials(fullName);

  const userNameEl = document.getElementById("user-name");
  const userInitialsEl = document.getElementById("user-initials");
  const welcomeNameEl = document.getElementById("welcome-name");

  if (userNameEl) userNameEl.textContent = fullName;
  if (userInitialsEl) userInitialsEl.textContent = initials;
  if (welcomeNameEl) userNombreEl.textContent = user.nombre; // solo nombre en welcome
}

function getInitials(nombreCompleto) {
  const partes = nombreCompleto.split(" ");
  
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  
  return partes[0][0].toUpperCase();
}
function initUserMenu() {
  const userBtn = document.getElementById("user-menu-btn");
  const dropdown = document.getElementById("user-dropdown");
  const logoutBtn = document.getElementById("logout-btn");

  if (userBtn && dropdown) {
    userBtn.addEventListener("click", () => {
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!userBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("uthub_user");
      window.location.href = window.location.origin + '/pages/auth/login.html';
    });
  }
}

function redirigirLogin() {
  window.location.href = `${window.location.origin}/pages/auth/login.html`;
}

function protegerRuta() {
  const token = localStorage.getItem('uthub_token');
  const user = localStorage.getItem('uthub_user');
  const path = window.location.pathname;
  

  // Rutas pÃºblicas (no requieren login)
  const rutasPublicas = [
    '/index.html',
    '/pages/auth/login.html',
    '/pages/auth/register.html',
    '/pages/auth/reset.html'
  ];

  const esPublica = rutasPublicas.some(ruta => path.includes(ruta));

  // Si NO es pÃºblica y NO hay sesiÃ³n â†’ redirigir
  if (!esPublica && (!token || !user)) {
    window.location.href = `${window.location.origin}/pages/auth/login.html`;
  }
}
// â”€â”€â”€â”€ INICIALIZACIÃ“N â”€â”€â”€â”€
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
  
  console.log('ðŸŠ UThub cargado correctamente');

  // ðŸ”¥ ESTO ES LO IMPORTANTE
  initUserUI();
  initUserMenu();
  protegerRuta()
  // Cargar preferencias del usuario
  cargarPreferencias();

  console.log('ðŸ“ PÃ¡gina actual:', window.location.pathname);

  const token = localStorage.getItem('uthub_token');
  if (token) {
    console.log('âœ“ Usuario autenticado');
  } else {
    console.log('â—‹ Usuario no autenticado');
  }
});

// â”€â”€â”€â”€ MANEJO DE ERRORES GLOBAL â”€â”€â”€â”€
window.addEventListener('error', (e) => {
  console.error('Error en UThub:', e.message);
});

// â”€â”€â”€â”€ DETECCIÃ“N DE CONEXIÃ“N â”€â”€â”€â”€
window.addEventListener('online', () => {
  console.log('âœ“ ConexiÃ³n restaurada');
  mostrarNotificacion('ConexiÃ³n restaurada', 'success');
});

window.addEventListener('offline', () => {
  console.log('âœ— Sin conexiÃ³n a internet');
  mostrarNotificacion('Sin conexiÃ³n a internet', 'error');
});

function mostrarNotificacion(mensaje, tipo = 'info') {
  // Crear notificaciÃ³n toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensaje;
  
  document.body.appendChild(toast);
  
  // Animar entrada
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Remover despuÃ©s de 3 segundos
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

// â”€â”€â”€â”€ ANALYTICS (OPCIONAL) â”€â”€â”€â”€
function trackEvent(categoria, accion, etiqueta) {
  console.log(' Evento:', categoria, accion, etiqueta);
  
  // AquÃ­ se integrarÃ­a Google Analytics o similar
  // gtag('event', accion, { event_category: categoria, event_label: etiqueta });
}

// Trackear clicks en mÃ³dulos
moduloCards.forEach(card => {
  card.addEventListener('click', () => {
    const modulo = card.getAttribute('data-module');
    trackEvent('MÃ³dulos', 'Click', modulo);
  });
});

// Trackear bÃºsquedas
if (searchInput) {
  searchInput.addEventListener('search', (e) => {
    trackEvent('BÃºsqueda', 'Query', e.target.value);
  });
}

// â”€â”€â”€â”€ EXPORT FUNCIONES ÃšTILES â”€â”€â”€â”€
window.UThub = {
  mostrarNotificacion,
  trackEvent,
  cargarPreferencias
};

console.log(' UThub JavaScript inicializado correctamente');




