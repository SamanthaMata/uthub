/* ============================================
   UTHUB - MÓDULO DE TUTORÍAS
   ============================================ */

const TUTORES_DEMO = [
  { id:1, nombre:'Carlos Mendoza', carrera:'Ing. en Sistemas', semestre:'8vo', avatar:'CM', color:'#00C2A8',
    foto:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    precio:80, calificacion:4.9, sesiones:134, disponible:true,
    materias:['Cálculo Diferencial','Álgebra Lineal','Física II','Matemáticas Discretas'],
    descripcion:'Estudiante de 8vo semestre con 2 años dando clases. Me especializo en explicar conceptos difíciles de forma sencilla. He ayudado a más de 100 alumnos a pasar sus materias.',
    horario:{ dias:[true,true,true,true,true,false,false], apertura:'07:00', cierre:'11:00', apertura2:'14:00', cierre2:'17:00' },
    modalidad:'presencial', ubicacion:'Biblioteca / Edificio Docencia 1', idioma:'Español',
    whatsapp:'8112345678' },

  { id:2, nombre:'Ana Martínez', carrera:'Ing. en Sistemas', semestre:'7mo', avatar:'AM', color:'#F5841F',
    foto:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    precio:70, calificacion:4.8, sesiones:89, disponible:true,
    materias:['Física I','Física II','Química','Cálculo Integral'],
    descripcion:'Apasionada de las ciencias. Explico con ejemplos reales. Clases dinámicas con ejercicios prácticos. Primera clase de prueba gratuita.',
    horario:{ dias:[true,false,true,false,true,true,false], apertura:'13:00', cierre:'18:00' },
    modalidad:'presencial', ubicacion:'Edificio Pesado 2 / Mediateca', idioma:'Español',
    whatsapp:'8119876543' },

  { id:3, nombre:'Diego Ramírez', carrera:'Ing. en Mecatrónica', semestre:'9no', avatar:'DR', color:'#6366F1',
    foto:'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face',
    precio:90, calificacion:4.7, sesiones:67, disponible:true,
    materias:['Programación en C++','Estructura de Datos','Sistemas Operativos','Redes de Computadoras'],
    descripcion:'Especialista en programación y sistemas. Tengo proyectos en GitHub y experiencia laboral. Enseño con código real, no solo teoría.',
    horario:{ dias:[false,true,false,true,false,true,false], apertura:'16:00', cierre:'20:00' },
    modalidad:'virtual', ubicacion:'Google Meet / Zoom', idioma:'Español / Inglés',
    whatsapp:'8115551234' },

  { id:4, nombre:'Sofía López', carrera:'Ing. en Gestión Empresarial', semestre:'6to', avatar:'SL', color:'#EC4899',
    foto:'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
    precio:60, calificacion:4.9, sesiones:52, disponible:true,
    materias:['Contabilidad','Administración','Inglés Técnico','Excel Avanzado'],
    descripcion:'Mis clases son muy prácticas y enfocadas en lo que piden los exámenes. Tengo todos los apuntes organizados. Puntualidad garantizada.',
    horario:{ dias:[true,true,true,true,true,false,false], apertura:'08:00', cierre:'14:00' },
    modalidad:'ambas', ubicacion:'Cafetería / Google Meet', idioma:'Español / Inglés',
    whatsapp:'8113334455' },

  { id:5, nombre:'Luis Torres', carrera:'Ing. en Sistemas', semestre:'10mo', avatar:'LT', color:'#10B981',
    foto:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    precio:100, calificacion:5.0, sesiones:203, disponible:false,
    materias:['Base de Datos','Ingeniería de Software','PHP','SQL Avanzado'],
    descripcion:'Egresado reciente. El más experimentado en el campus. Clases orientadas a proyectos reales. Actualmente con cupo lleno.',
    horario:{ dias:[false,false,false,false,true,false,false], apertura:'10:00', cierre:'14:00' },
    modalidad:'presencial', ubicacion:'Biblioteca', idioma:'Español',
    whatsapp:'8117778899' },

  { id:6, nombre:'Valentina Cruz', carrera:'Ing. en Sistemas', semestre:'7mo', avatar:'VC', color:'#F59E0B',
    foto:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face',
    precio:65, calificacion:4.6, sesiones:38, disponible:true,
    materias:['Diseño Web','HTML/CSS','JavaScript','Fundamentos de Programación'],
    descripcion:'Tutora especializada en desarrollo web. Portafolio publicado y experiencia con proyectos reales. Ideal para alumnos que van empezando.',
    horario:{ dias:[true,false,true,false,true,false,false], apertura:'09:00', cierre:'13:00' },
    modalidad:'ambas', ubicacion:'Laboratorio de Cómputo / Discord', idioma:'Español',
    whatsapp:'8116667788' }
];

const MATERIAS_TODAS = [...new Set(TUTORES_DEMO.flatMap(t => t.materias))].sort();
const DIAS_SHORT = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

/* STORAGE */
function getTutores() {
  const custom = JSON.parse(localStorage.getItem('uthub_tutores_custom') || '[]');
  return [...TUTORES_DEMO, ...custom];
}
function getSesiones() { return JSON.parse(localStorage.getItem('uthub_sesiones') || '[]'); }
function saveSesiones(s) { localStorage.setItem('uthub_sesiones', JSON.stringify(s)); }
function getMiPerfil() { return JSON.parse(localStorage.getItem('uthub_mi_tutor') || 'null'); }
function saveMiPerfil(p) { localStorage.setItem('uthub_mi_tutor', JSON.stringify(p)); }

/* RESERVAR */
function crearReserva(tutorId, fecha, hora, materia, notas) {
  const tutor = getTutores().find(t => t.id === tutorId);
  if (!tutor) return null;
  const sesiones = getSesiones();
  const nueva = {
    id: Date.now(), tutorId,
    tutorNombre: tutor.nombre, tutorAvatar: tutor.avatar, tutorColor: tutor.color,
    materia, fecha, hora, notas: notas || '',
    precio: tutor.precio, modalidad: tutor.modalidad,
    estado: 'pendiente',
    fechaCreacion: new Date().toISOString()
    // whatsapp se adjunta SOLO cuando estado cambia a 'aceptada'
  };
  sesiones.push(nueva);
  saveSesiones(sesiones);
  return nueva;
}

/* CAMBIAR ESTADO — whatsapp se revela aqui */
function cambiarEstadoSesion(sesionId, nuevoEstado) {
  const sesiones = getSesiones();
  const s = sesiones.find(s => s.id == sesionId);
  if (!s) return;
  s.estado = nuevoEstado;
  if (nuevoEstado === 'aceptada') {
    const tutor = getTutores().find(t => t.id === s.tutorId);
    if (tutor) s.whatsapp = tutor.whatsapp;
  }
  saveSesiones(sesiones);
}

/* HELPERS */
function renderStars(r) { return '★'.repeat(Math.floor(r)) + ((r%1)>=0.5?'½':''); }
function modalidadLabel(m) { return {presencial:'📍 Presencial',virtual:'💻 Virtual',ambas:'📍💻 Ambas'}[m]||m; }
function horarioTexto(h) {
  if (!h) return '';
  const dias = DIAS_SHORT.filter((_,i) => h.dias?.[i]).join(', ');
  let horas = h.apertura+'–'+h.cierre;
  if (h.apertura2) horas += ' y '+h.apertura2+'–'+h.cierre2;
  return dias+' · '+horas;
}
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff/60000), h = Math.floor(diff/3600000), d = Math.floor(diff/86400000);
  if (m<1) return 'Ahora'; if (m<60) return 'Hace '+m+' min';
  if (h<24) return 'Hace '+h+'h'; return 'Hace '+d+'d';
}
function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

function tutoriasToast(msg, tipo='info') {
  const colors = {success:'#22C55E',error:'#FF4F5E',info:'#60A5FA',warn:'#FBBF24'};
  const t = document.createElement('div');
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);background:'+
    (colors[tipo]||colors.info)+';color:white;padding:12px 24px;border-radius:10px;'+
    'font-size:13px;font-weight:600;z-index:9999;opacity:0;transition:all .3s ease;'+
    'font-family:DM Sans,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,.2);white-space:nowrap;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>{t.style.transform='translateX(-50%) translateY(0)';t.style.opacity='1';},50);
  setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),300);},2800);
}

function estadoBadge(estado) {
  const map = {
    pendiente: {label:'⏳ Pendiente de confirmación', css:'background:#FFF0E0;color:#D96A08;'},
    aceptada:  {label:'✅ Confirmada',                css:'background:#DCFCE7;color:#16A34A;'},
    rechazada: {label:'❌ No disponible',              css:'background:#FFE8EA;color:#FF4F5E;'},
    cancelada: {label:'🚫 Cancelada',                  css:'background:#F3F4F6;color:#6B7280;'},
    completada:{label:'⭐ Completada',                 css:'background:#E0F2FE;color:#0369A1;'}
  };
  const s = map[estado]||map.pendiente;
  return '<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:100px;font-size:12px;font-weight:600;'+s.css+'">'+s.label+'</span>';
}

/* EXPORTS */
window.TutoriasDB = { getTutores, getSesiones, saveSesiones, getMiPerfil, saveMiPerfil, crearReserva, cambiarEstadoSesion };
window.TutoriasUI = { renderStars, modalidadLabel, horarioTexto, timeAgo, formatFecha, tutoriasToast, estadoBadge, MATERIAS_TODAS };
window.TUTORES_DEMO = TUTORES_DEMO;
console.log('📚 Módulo Tutorías inicializado');
