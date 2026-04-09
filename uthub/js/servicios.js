/* ============================================
   UTHUB - MÓDULO DE SERVICIOS FREELANCE
   Lógica frontend con localStorage
   ============================================ */

const ServiciosDB = (() => {

  const SERVICIOS_DEMO = [
    {
      id: 1, titulo: 'Diseño de logotipos profesionales',
      categoria: 'Diseño', emoji: '🎨',
      color: '#FFF0E0', colorDark: '#F5841F',
      descripcion: 'Diseño de identidad visual completa: logotipo, colores y tipografía. Entrego en AI, PDF y PNG. 2 revisiones incluidas. Ideal para emprendedores y proyectos universitarios.',
      precio: 250, precioBasico: 150, precioPremium: 450,
      entrega: '3 días', entregaBasico: '5 días', entregaPremium: '2 días',
      calificacion: 4.9, reseñas: 24, trabajos: 31,
      freelancer: { id: 1, nombre: 'Valentina Cruz', iniciales: 'VC', color: '#F59E0B', carrera: 'Ing. en Sistemas', semestre: '7mo' },
      habilidades: ['Illustrator', 'Figma', 'Branding', 'Identidad Visual'],
      whatsapp: '8116667788'
    },
    {
      id: 2, titulo: 'Desarrollo de sitios web en HTML/CSS/JS',
      categoria: 'Desarrollo', emoji: '💻',
      color: '#E0FAF6', colorDark: '#009985',
      descripcion: 'Creo tu sitio web desde cero: landing page, portafolio, blog. Responsive, rápido y bien codificado. Incluyo formulario de contacto y hosting básico gratis por 6 meses.',
      precio: 500, precioBasico: 300, precioPremium: 900,
      entrega: '7 días', entregaBasico: '10 días', entregaPremium: '5 días',
      calificacion: 4.8, reseñas: 18, trabajos: 22,
      freelancer: { id: 2, nombre: 'Diego Ramírez', iniciales: 'DR', color: '#6366F1', carrera: 'Ing. en Mecatrónica', semestre: '9no' },
      habilidades: ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
      whatsapp: '8115551234'
    },
    {
      id: 3, titulo: 'Fotografía para eventos y retratos',
      categoria: 'Fotografía', emoji: '📸',
      color: '#EDE9FE', colorDark: '#7C3AED',
      descripcion: 'Fotografía profesional para eventos universitarios, retratos para redes sociales, graduaciones y proyectos. Edición incluida con entrega en 24 horas.',
      precio: 400, precioBasico: 200, precioPremium: 700,
      entrega: '1 día', entregaBasico: '2 días', entregaPremium: '24 hrs',
      calificacion: 4.7, reseñas: 15, trabajos: 28,
      freelancer: { id: 3, nombre: 'Ana Martínez', iniciales: 'AM', color: '#F5841F', carrera: 'Ing. en Sistemas', semestre: '7mo' },
      habilidades: ['Lightroom', 'Photoshop', 'Mirrorless', 'Retrato'],
      whatsapp: '8119876543'
    },
    {
      id: 4, titulo: 'Redacción y corrección de documentos',
      categoria: 'Redacción', emoji: '✍️',
      color: '#DCFCE7', colorDark: '#16A34A',
      descripcion: 'Redacto reportes, tesinas, ensayos y documentos académicos. Corrección ortográfica y de estilo. Normas APA 7. Entrega en Word o PDF. Total confidencialidad.',
      precio: 150, precioBasico: 80, precioPremium: 300,
      entrega: '2 días', entregaBasico: '4 días', entregaPremium: '1 día',
      calificacion: 5.0, reseñas: 32, trabajos: 40,
      freelancer: { id: 4, nombre: 'Sofía López', iniciales: 'SL', color: '#EC4899', carrera: 'Ing. en Gestión Empresarial', semestre: '6to' },
      habilidades: ['APA 7', 'Word', 'Redacción Académica', 'Ortografía'],
      whatsapp: '8113334455'
    },
    {
      id: 5, titulo: 'Edición de video para YouTube y Reels',
      categoria: 'Video', emoji: '🎬',
      color: '#FEF9C3', colorDark: '#92400E',
      descripcion: 'Edito tus videos con transiciones, música, subtítulos y efectos. Formatos para YouTube, TikTok, Instagram Reels y Shorts. 1 ronda de revisión incluida.',
      precio: 350, precioBasico: 200, precioPremium: 600,
      entrega: '3 días', entregaBasico: '5 días', entregaPremium: '2 días',
      calificacion: 4.6, reseñas: 11, trabajos: 16,
      freelancer: { id: 5, nombre: 'Carlos Mendoza', iniciales: 'CM', color: '#00C2A8', carrera: 'Ing. en Sistemas', semestre: '8vo' },
      habilidades: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Subtítulos'],
      whatsapp: '8112345678'
    },
    {
      id: 6, titulo: 'Tutorías de Excel y análisis de datos',
      categoria: 'Educación', emoji: '📊',
      color: '#FFF0E0', colorDark: '#D96A08',
      descripcion: 'Te enseño Excel desde cero o nivel avanzado: tablas dinámicas, fórmulas, macros básicas y dashboards. También Power BI para visualización de datos.',
      precio: 120, precioBasico: 80, precioPremium: 200,
      entrega: '1 sesión', entregaBasico: '2 sesiones', entregaPremium: '5 sesiones',
      calificacion: 4.9, reseñas: 20, trabajos: 25,
      freelancer: { id: 4, nombre: 'Sofía López', iniciales: 'SL', color: '#EC4899', carrera: 'Ing. en Gestión Empresarial', semestre: '6to' },
      habilidades: ['Excel', 'Power BI', 'Tablas Dinámicas', 'Dashboards'],
      whatsapp: '8113334455'
    },
    {
      id: 7, titulo: 'Producción musical y beats',
      categoria: 'Música', emoji: '🎵',
      color: '#EDE9FE', colorDark: '#7C3AED',
      descripcion: 'Produzco beats y música para tus proyectos: videos, podcasts, eventos. Géneros: trap, lo-fi, pop. Entrega en WAV y MP3. Derechos de uso incluidos.',
      precio: 280, precioBasico: 150, precioPremium: 500,
      entrega: '4 días', entregaBasico: '7 días', entregaPremium: '3 días',
      calificacion: 4.5, reseñas: 8, trabajos: 12,
      freelancer: { id: 6, nombre: 'Luis Torres', iniciales: 'LT', color: '#10B981', carrera: 'Ing. en Sistemas', semestre: '10mo' },
      habilidades: ['FL Studio', 'Ableton', 'Mezcla', 'Mastering'],
      whatsapp: '8117778899'
    },
    {
      id: 8, titulo: 'Instalación y soporte de computadoras',
      categoria: 'Tecnología', emoji: '🔧',
      color: '#E0FAF6', colorDark: '#009985',
      descripcion: 'Formateo, instalación de Windows/Linux, configuración de red, eliminación de virus y mantenimiento. A domicilio en el campus. Diagnóstico gratuito.',
      precio: 150, precioBasico: 100, precioPremium: 250,
      entrega: 'Mismo día', entregaBasico: '1 día', entregaPremium: '2 hrs',
      calificacion: 4.8, reseñas: 27, trabajos: 35,
      freelancer: { id: 2, nombre: 'Diego Ramírez', iniciales: 'DR', color: '#6366F1', carrera: 'Ing. en Mecatrónica', semestre: '9no' },
      habilidades: ['Windows', 'Linux', 'Redes', 'Hardware'],
      whatsapp: '8115551234'
    }
  ];

  const STORAGE_KEY = 'uthub_servicios';

  function getServicios() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return [...SERVICIOS_DEMO, ...data.filter(s => s.id >= 1000)];
      }
    } catch (e) {}
    return [...SERVICIOS_DEMO];
  }

  function getMisServicios() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
  }

  function agregarServicio(servicio) {
    const mis = getMisServicios();
    servicio.id = Date.now();
    servicio.calificacion = 0;
    servicio.reseñas = 0;
    servicio.trabajos = 0;
    servicio.freelancer = { id: 0, nombre: 'Samantha Mata', iniciales: 'SM', color: '#F5841F', carrera: 'Ing. en Sistemas', semestre: '8vo' };
    mis.push(servicio);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mis));
    return servicio;
  }

  function eliminarServicio(id) {
    const mis = getMisServicios().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mis));
  }

  function getServicioById(id) {
    return getServicios().find(s => s.id === id) || null;
  }

  function filtrarServicios({ categoria = '', busqueda = '', precioMax = '' } = {}) {
    return getServicios().filter(s => {
      if (categoria && s.categoria !== categoria) return false;
      if (busqueda) {
        const q = busqueda.toLowerCase();
        if (!s.titulo.toLowerCase().includes(q) && !s.descripcion.toLowerCase().includes(q)) return false;
      }
      if (precioMax && s.precio > parseInt(precioMax)) return false;
      return true;
    });
  }

  return { getServicios, getMisServicios, agregarServicio, eliminarServicio, getServicioById, filtrarServicios };
})();

/* ── UI helpers ── */
const ServiciosUI = {

  renderCard(s) {
    return `
      <div class="servicio-card" onclick="window.location.href='servicio.html?id=${s.id}'">
        <div class="servicio-cover" style="background:linear-gradient(135deg,${s.color},${s.color}CC);">
          <span>${s.emoji}</span>
          <span class="servicio-cat-badge">${s.categoria}</span>
        </div>
        <div class="servicio-body">
          <div class="servicio-freelancer">
            <div class="free-avatar" style="background:${s.freelancer.color}">${s.freelancer.iniciales}</div>
            <div>
              <div class="free-name">${s.freelancer.nombre}</div>
              <div class="free-carrera">${s.freelancer.carrera}</div>
            </div>
          </div>
          <div class="servicio-titulo">${s.titulo}</div>
          <div class="servicio-desc-short">${s.descripcion}</div>
          <div class="servicio-footer">
            <div class="servicio-rating">
              <span class="stars-s">${ServiciosUI.renderStars(s.calificacion)}</span>
              <span>${s.calificacion > 0 ? s.calificacion.toFixed(1) : 'Nuevo'} (${s.reseñas})</span>
            </div>
            <div class="servicio-precio">$${s.precio}<span>/base</span></div>
          </div>
        </div>
      </div>`;
  },

  renderStars(rating) {
    if (rating === 0) return '☆☆☆☆☆';
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  },

  serviciosToast(msg, tipo = 'success') {
    const t = document.createElement('div');
    const bg = tipo === 'success' ? '#22C55E' : tipo === 'error' ? '#FF4F5E' : '#F5841F';
    t.style.cssText = `position:fixed;bottom:24px;right:24px;background:${bg};color:white;padding:14px 20px;border-radius:12px;font-weight:600;font-size:14px;z-index:9999;box-shadow:0 8px 20px rgba(0,0,0,.2);animation:slideUp .3s ease;`;
    t.textContent = msg;
    const style = document.createElement('style');
    style.textContent = '@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(style);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  },

  CATEGORIAS: [
    { nombre: 'Diseño', emoji: '🎨' },
    { nombre: 'Desarrollo', emoji: '💻' },
    { nombre: 'Fotografía', emoji: '📸' },
    { nombre: 'Redacción', emoji: '✍️' },
    { nombre: 'Video', emoji: '🎬' },
    { nombre: 'Música', emoji: '🎵' },
    { nombre: 'Educación', emoji: '📊' },
    { nombre: 'Tecnología', emoji: '🔧' }
  ]
};
