/* ============================================
   UTHUB - MÓDULO DE LIBROS
   Lógica frontend con localStorage
   ============================================ */

const LibrosDB = (() => {

  /* ── Catálogo de libros demo ── */
  const LIBROS_DEMO = [
    {
      id: 1, titulo: 'Fundamentos de Bases de Datos', autor: 'Ramez Elmasri & Navathe',
      edicion: '7ª edición', isbn: '9780133970777',
      carrera: 'Ing. en Sistemas', semestre: '5to-6to',
      estado: 'muy-bueno', precio: 150, precioNuevo: 380,
      emoji: '🗄️', color: '#FFF0E0',
      descripcion: 'Libro en excelente estado. Sin rayones relevantes en páginas principales. Incluye acceso digital original no usado. Perfecto para la materia de Base de Datos.',
      vendedor: { id: 1, nombre: 'Carlos Mendoza', iniciales: 'CM', color: '#00C2A8' },
      fecha: '2026-03-10', vistas: 34, activo: true
    },
    {
      id: 2, titulo: 'Introducción a los Algoritmos', autor: 'Cormen, Leiserson, Rivest',
      edicion: '3ª edición', isbn: '9780262033848',
      carrera: 'Ing. en Sistemas', semestre: '3er-4to',
      estado: 'bueno', precio: 200, precioNuevo: 550,
      emoji: '🧮', color: '#EDE9FE',
      descripcion: 'Buen estado general. Algunas marcas de resaltador en los primeros 3 capítulos. El resto impecable. El libro de algoritmos más completo.',
      vendedor: { id: 2, nombre: 'Ana Martínez', iniciales: 'AM', color: '#F5841F' },
      fecha: '2026-03-15', vistas: 28, activo: true
    },
    {
      id: 3, titulo: 'Cálculo: Trascendentes Tempranas', autor: 'James Stewart',
      edicion: '8ª edición', isbn: '9781285741550',
      carrera: 'Todas las carreras', semestre: '1er-2do',
      estado: 'nuevo', precio: 300, precioNuevo: 680,
      emoji: '📐', color: '#DCFCE7',
      descripcion: 'Prácticamente nuevo. Solo abierto un par de veces. Lo compré pero cambié de carrera. Viene con el cuaderno de práctica incluido.',
      vendedor: { id: 3, nombre: 'Diego Ramírez', iniciales: 'DR', color: '#6366F1' },
      fecha: '2026-03-20', vistas: 52, activo: true
    },
    {
      id: 4, titulo: 'Ingeniería de Software', autor: 'Ian Sommerville',
      edicion: '10ª edición', isbn: '9780133943030',
      carrera: 'Ing. en Sistemas', semestre: '7mo-8vo',
      estado: 'muy-bueno', precio: 180, precioNuevo: 460,
      emoji: '💻', color: '#E0FAF6',
      descripcion: 'Estado muy bueno. Usado en dos cuatrimestres. Algunas notas en lápiz borrables. Cubre scrum, ágil y metodologías modernas.',
      vendedor: { id: 4, nombre: 'Sofía López', iniciales: 'SL', color: '#EC4899' },
      fecha: '2026-03-22', vistas: 19, activo: true
    },
    {
      id: 5, titulo: 'Física Universitaria Vol. 1', autor: 'Sears & Zemansky',
      edicion: '14ª edición', isbn: '9780133969290',
      carrera: 'Ing. en Mecatrónica', semestre: '1er-2do',
      estado: 'bueno', precio: 120, precioNuevo: 320,
      emoji: '⚡', color: '#FEF9C3',
      descripcion: 'Bien conservado. Algunas páginas con marcas de lápiz. Incluye acceso al Mastering Physics con código sin usar.',
      vendedor: { id: 5, nombre: 'Luis Torres', iniciales: 'LT', color: '#10B981' },
      fecha: '2026-03-25', vistas: 41, activo: true
    },
    {
      id: 6, titulo: 'Contabilidad Financiera', autor: 'Gerardo Guajardo Cantú',
      edicion: '6ª edición', isbn: '9786071507044',
      carrera: 'Ing. en Gestión Empresarial', semestre: '3er-4to',
      estado: 'muy-bueno', precio: 130, precioNuevo: 350,
      emoji: '💰', color: '#FFF0E0',
      descripcion: 'Muy buen estado. Solo los primeros capítulos tienen subrayado con marcatextos amarillo. Ideal para las materias de Contabilidad I y II.',
      vendedor: { id: 6, nombre: 'Valentina Cruz', iniciales: 'VC', color: '#F59E0B' },
      fecha: '2026-03-28', vistas: 22, activo: true
    },
    {
      id: 7, titulo: 'Redes de Computadoras', autor: 'Andrew S. Tanenbaum',
      edicion: '5ª edición', isbn: '9780132126953',
      carrera: 'Ing. en Sistemas', semestre: '5to-6to',
      estado: 'regular', precio: 80, precioNuevo: 390,
      emoji: '🌐', color: '#EDE9FE',
      descripcion: 'Estado regular. Portada con desgaste, interiores bien. Precio refleja el estado. Contenido completo, excelente para aprender redes.',
      vendedor: { id: 1, nombre: 'Carlos Mendoza', iniciales: 'CM', color: '#00C2A8' },
      fecha: '2026-04-01', vistas: 13, activo: true
    },
    {
      id: 8, titulo: 'Probabilidad y Estadística para Ing.', autor: 'Jay L. Devore',
      edicion: '8ª edición', isbn: '9780538733526',
      carrera: 'Todas las carreras', semestre: '3er-4to',
      estado: 'nuevo', precio: 250, precioNuevo: 520,
      emoji: '📊', color: '#DCFCE7',
      descripcion: 'Nuevo, sin usar. Lo adquirí por error (tenía otro libro de Estadística). Sellado de fábrica hasta la semana pasada.',
      vendedor: { id: 2, nombre: 'Ana Martínez', iniciales: 'AM', color: '#F5841F' },
      fecha: '2026-04-02', vistas: 38, activo: true
    },
    {
      id: 9, titulo: 'Diseño de Sistemas Digitales', autor: 'M. Morris Mano',
      edicion: '5ª edición', isbn: '9780132774208',
      carrera: 'Ing. en Mecatrónica', semestre: '5to-6to',
      estado: 'muy-bueno', precio: 160, precioNuevo: 410,
      emoji: '🔌', color: '#E0FAF6',
      descripcion: 'Muy buen estado. Algunos ejercicios resueltos a lápiz al final. Libro esencial para la materia de Electrónica Digital.',
      vendedor: { id: 3, nombre: 'Diego Ramírez', iniciales: 'DR', color: '#6366F1' },
      fecha: '2026-04-03', vistas: 17, activo: true
    },
    {
      id: 10, titulo: 'Administración de Empresas', autor: 'Stephen P. Robbins',
      edicion: '14ª edición', isbn: '9786073227964',
      carrera: 'Ing. en Gestión Empresarial', semestre: '1er-2do',
      estado: 'bueno', precio: 100, precioNuevo: 280,
      emoji: '🏢', color: '#FFF0E0',
      descripcion: 'Buen estado. Algunas páginas dobladas como marcadores. Sin escritura. Muy completo para las bases de Administración.',
      vendedor: { id: 4, nombre: 'Sofía López', iniciales: 'SL', color: '#EC4899' },
      fecha: '2026-04-04', vistas: 25, activo: true
    },
    {
      id: 11, titulo: 'Matemáticas Discretas', autor: 'Kenneth H. Rosen',
      edicion: '7ª edición', isbn: '9780073383095',
      carrera: 'Ing. en Sistemas', semestre: '3er-4to',
      estado: 'muy-bueno', precio: 140, precioNuevo: 360,
      emoji: '🔢', color: '#EDE9FE',
      descripcion: 'Buen estado. Resolví varios ejercicios pero con lápiz, todo borrable. Gran libro para Matemáticas Discretas y Lógica.',
      vendedor: { id: 5, nombre: 'Luis Torres', iniciales: 'LT', color: '#10B981' },
      fecha: '2026-04-05', vistas: 30, activo: true
    },
    {
      id: 12, titulo: 'Química General', autor: 'Petrucci, Herring, Madura',
      edicion: '11ª edición', isbn: '9780132931281',
      carrera: 'Ing. en Mecatrónica', semestre: '1er-2do',
      estado: 'bueno', precio: 110, precioNuevo: 300,
      emoji: '⚗️', color: '#FEF9C3',
      descripcion: 'Buen estado. Guardado cuidadosamente. Algunas páginas con marcas leves de uso. Completo y bien organizado.',
      vendedor: { id: 6, nombre: 'Valentina Cruz', iniciales: 'VC', color: '#F59E0B' },
      fecha: '2026-04-06', vistas: 14, activo: true
    }
  ];

  const STORAGE_KEY = 'uthub_libros';

  function getLibros() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return [...LIBROS_DEMO, ...data.filter(l => l.id >= 1000)];
      }
    } catch (e) {}
    return [...LIBROS_DEMO];
  }

  function getMisLibros() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
  }

  function agregarLibro(libro) {
    const mis = getMisLibros();
    libro.id = Date.now();
    libro.fecha = new Date().toISOString().split('T')[0];
    libro.vistas = 0;
    libro.activo = true;
    const user = JSON.parse(localStorage.getItem('uthub_user'));
    libro.vendedor = { 
      id: user?.id || 0,
      nombre: user?.nombre || 'Usuario',
      iniciales: user?.nombre?.slice(0,2).toUpperCase() || 'US',
      color: '#F5841F'
    };
    mis.push(libro);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mis));
    return libro;
  }

  function eliminarLibro(id) {
    const mis = getMisLibros().filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mis));
  }

  function getLibroById(id) {
    return getLibros().find(l => l.id === id) || null;
  }

  function filtrarLibros({ busqueda = '', carrera = '', estado = '', precioMax = '' } = {}) {
    return getLibros().filter(l => {
      if (!l.activo) return false;
      if (busqueda) {
        const q = busqueda.toLowerCase();
        if (!l.titulo.toLowerCase().includes(q) &&
            !l.autor.toLowerCase().includes(q) &&
            !l.carrera.toLowerCase().includes(q)) return false;
      }
      if (carrera && l.carrera !== carrera && l.carrera !== 'Todas las carreras') {
        if (carrera !== 'Todas las carreras') return false;
      }
      if (estado && l.estado !== estado) return false;
      if (precioMax && l.precio > parseInt(precioMax)) return false;
      return true;
    });
  }

  return { getLibros, getMisLibros, agregarLibro, eliminarLibro, getLibroById, filtrarLibros };
})();

/* ── UI helpers ── */
const LibrosUI = {

  estadoLabel(estado) {
    const map = {
      'nuevo': 'Nuevo',
      'muy-bueno': 'Muy bueno',
      'bueno': 'Buen estado',
      'regular': 'Regular'
    };
    return map[estado] || estado;
  },

  descuento(precio, precioNuevo) {
    return Math.round((1 - precio / precioNuevo) * 100);
  },

  renderCard(libro) {
    const desc = LibrosUI.descuento(libro.precio, libro.precioNuevo);
    return `
      <div class="libro-card" onclick="window.location.href='libro.html?id=${libro.id}'">
        <div class="libro-cover" style="background:linear-gradient(135deg,${libro.color},${libro.color}CC);">
          <span>${libro.emoji}</span>
          <span class="libro-estado-badge estado-${libro.estado}">${LibrosUI.estadoLabel(libro.estado)}</span>
        </div>
        <div class="libro-body">
          <div class="libro-titulo">${libro.titulo}</div>
          <div class="libro-autor">${libro.autor} · ${libro.edicion}</div>
          <span class="libro-carrera-tag">${libro.carrera}</span>
          <div class="libro-precios">
            <span class="precio-actual">$${libro.precio}</span>
            <span class="precio-original">$${libro.precioNuevo}</span>
            <span class="precio-descuento">-${desc}%</span>
          </div>
          <div class="libro-footer">
            <div class="libro-vendedor">
              <div class="vendedor-avatar-mini" style="background:${libro.vendedor.color}">${libro.vendedor.iniciales}</div>
              ${libro.vendedor.nombre.split(' ')[0]}
            </div>
            <button class="btn-ver-libro">Ver →</button>
          </div>
        </div>
      </div>`;
  },

  librosToast(msg, tipo = 'success') {
    const t = document.createElement('div');
    const bg = tipo === 'success' ? '#22C55E' : tipo === 'error' ? '#FF4F5E' : '#F5841F';
    t.style.cssText = `position:fixed;bottom:24px;right:24px;background:${bg};color:white;padding:14px 20px;border-radius:12px;font-weight:600;font-size:14px;z-index:9999;box-shadow:0 8px 20px rgba(0,0,0,.2);animation:slideUp .3s ease;`;
    t.textContent = msg;
    const style = document.createElement('style');
    style.textContent = '@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(style);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }
};
