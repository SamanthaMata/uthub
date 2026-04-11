/* ============================================
   UTHUB - SISTEMA DE NOTIFICACIONES
   Módulo reutilizable para todas las páginas
   ============================================ */

const UThubNotifications = (() => {

  /* ── DATOS DE EJEMPLO (demo sin backend) ── */
  const NOTIFICACIONES_DEMO = [
    {
      id: 1,
      tipo: 'pedido_nuevo',
      icono: '📦',
      titulo: 'Pedido recibido',
      mensaje: 'Alguien pidió Orden de Tacos x3 en tu tienda',
      tiempo: Date.now() - 1000 * 60 * 3,  // 3 min ago
      leida: false,
      url: 'pages/comida/mi-tienda.html'
    },
    {
      id: 2,
      tipo: 'tutoria',
      icono: '📚',
      titulo: 'Sesión confirmada',
      mensaje: 'Carlos M. confirmó tu tutoría de Álgebra para mañana 9am',
      tiempo: Date.now() - 1000 * 60 * 18, // 18 min ago
      leida: false,
      url: 'pages/tutorias/mis-sesiones.html'
    },
    {
      id: 3,
      tipo: 'libro',
      icono: '📖',
      titulo: 'Interés en tu libro',
      mensaje: 'Un estudiante quiere comprar tu Fundamentos de BD',
      tiempo: Date.now() - 1000 * 60 * 45, // 45 min ago
      leida: false,
      url: 'pages/libros/mis-libros.html'
    },
    {
      id: 4,
      tipo: 'sistema',
      icono: '⭐',
      titulo: 'Nueva reseña',
      mensaje: 'Recibiste una calificación de 5 estrellas en tu tienda',
      tiempo: Date.now() - 1000 * 60 * 60 * 2, // 2h ago
      leida: true,
      url: 'pages/comida/mi-tienda.html'
    },
    {
      id: 5,
      tipo: 'pedido_estado',
      icono: '🛵',
      titulo: 'Tu pedido está en camino',
      mensaje: 'Tu pedido #83921 de Café Express está siendo entregado',
      tiempo: Date.now() - 1000 * 60 * 60 * 3, // 3h ago
      leida: true,
      url: 'pages/comida/pedidos.html'
    }
  ];

  /* ── STORAGE ── */
  function getAll() {
    const saved = localStorage.getItem('uthub_notificaciones');
    if (!saved) {
      // First time: seed with demo notifications
      localStorage.setItem('uthub_notificaciones', JSON.stringify(NOTIFICACIONES_DEMO));
      return NOTIFICACIONES_DEMO;
    }
    return JSON.parse(saved);
  }

  function saveAll(notifs) {
    localStorage.setItem('uthub_notificaciones', JSON.stringify(notifs));
  }

  function getUnreadCount() {
    return getAll().filter(n => !n.leida).length;
  }

  function markAsRead(id) {
    const notifs = getAll();
    const n = notifs.find(n => n.id === id);
    if (n) { n.leida = true; saveAll(notifs); }
    updateBadge();
    renderPanel();
  }

  function markAllAsRead() {
    const notifs = getAll().map(n => ({ ...n, leida: true }));
    saveAll(notifs);
    updateBadge();
    renderPanel();
  }

  function addNotification(notif) {
    const notifs = getAll();
    notifs.unshift({
      id: Date.now(),
      leida: false,
      tiempo: Date.now(),
      ...notif
    });
    saveAll(notifs);
    updateBadge();
    if (panel && panel.classList.contains('open')) renderPanel();
    // Also show a toast
    showToastNotif(notif.titulo, notif.mensaje, notif.icono);
  }

  /* ── RELATIVE TIME ── */
  function timeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins} min`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  }

  /* ── TYPE COLOR ── */
  function typeColor(tipo) {
    const map = {
      pedido_nuevo: '#F5841F',
      pedido_estado: '#60A5FA',
      tutoria: '#00C2A8',
      libro: '#22C55E',
      sistema: '#FBBF24'
    };
    return map[tipo] || '#6B6B80';
  }

  /* ── PANEL HTML ── */
  let panel = null;
  let btn   = null;

  function createPanel() {
    panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      width: 360px;
      max-height: calc(100vh - 90px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,.18);
      z-index: 9000;
      display: none;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,.06);
      font-family: 'DM Sans', sans-serif;
    `;
    document.body.appendChild(panel);

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (panel.classList.contains('open') &&
          !panel.contains(e.target) &&
          e.target !== btn &&
          !btn?.contains(e.target)) {
        close();
      }
    });
  }

  function renderPanel() {
    if (!panel) return;
    const notifs = getAll();
    const unread = notifs.filter(n => !n.leida).length;

    panel.innerHTML = `
      <div style="padding:18px 20px 14px;border-bottom:1px solid #F0EDE8;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#1A1A2E;">Notificaciones</div>
          ${unread > 0 ? `<div style="font-size:11px;color:#F5841F;font-weight:600;margin-top:1px;">${unread} sin leer</div>` : `<div style="font-size:11px;color:#6B6B80;margin-top:1px;">Todo leído</div>`}
        </div>
        ${unread > 0 ? `<button onclick="UThubNotifications.markAllAsRead()" style="font-size:11px;font-weight:600;color:#F5841F;background:none;border:none;cursor:pointer;padding:4px 8px;border-radius:6px;" onmouseover="this.style.background='#FFF0E0'" onmouseout="this.style.background='none'">Marcar todo leído</button>` : ''}
      </div>

      <div style="overflow-y:auto;flex:1;max-height:420px;">
        ${notifs.length === 0 ? `
          <div style="text-align:center;padding:48px 24px;">
            <div style="font-size:40px;margin-bottom:10px;">🔔</div>
            <div style="font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:#1A1A2E;margin-bottom:4px;">Sin notificaciones</div>
            <div style="font-size:12px;color:#6B6B80;">Las actividades de UThub aparecerán aquí</div>
          </div>` : notifs.map(n => `
          <div onclick="UThubNotifications.markAsRead(${n.id})" style="
            display:flex;align-items:flex-start;gap:12px;
            padding:14px 20px;
            border-bottom:1px solid #F7F4F0;
            cursor:pointer;
            background:${n.leida ? 'white' : '#FFFBF7'};
            transition:background .15s;
            position:relative;
          " onmouseover="this.style.background='#FFF7F0'" onmouseout="this.style.background='${n.leida ? 'white' : '#FFFBF7'}'">
            <div style="width:38px;height:38px;border-radius:10px;background:${typeColor(n.tipo)}15;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">
              ${n.icono}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:${n.leida ? '500' : '700'};color:#1A1A2E;margin-bottom:2px;">${n.titulo}</div>
              <div style="font-size:12px;color:#6B6B80;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n.mensaje}</div>
              <div style="font-size:10px;color:#B0ACAC;margin-top:4px;font-weight:500;">${timeAgo(n.tiempo)}</div>
            </div>
            ${!n.leida ? `<div style="width:8px;height:8px;border-radius:50%;background:#F5841F;flex-shrink:0;margin-top:4px;"></div>` : ''}
          </div>`).join('')}
      </div>

      <div style="padding:12px 20px;border-top:1px solid #F0EDE8;text-align:center;">
        <a href="#" style="font-size:12px;color:#6B6B80;text-decoration:none;font-weight:500;">Ver todo el historial</a>
      </div>
    `;
  }

  /* ── BADGE ── */
  function updateBadge() {
    const count = getUnreadCount();
    const badges = document.querySelectorAll('#notif-badge');
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  /* ── OPEN / CLOSE ── */
  function open() {
    if (!panel) { createPanel(); }
    renderPanel();
    panel.style.display = 'flex';
    requestAnimationFrame(() => panel.classList.add('open'));
  }

  function close() {
    if (panel) {
      panel.classList.remove('open');
      panel.style.display = 'none';
    }
  }

  function toggle() {
    if (panel && panel.classList.contains('open')) {
      close();
    } else {
      open();
    }
  }

  /* ── TOAST NOTIFICATION (push style) ── */
  function showToastNotif(titulo, mensaje, icono = '🔔') {
    const t = document.createElement('div');
    t.style.cssText = `
      position:fixed;top:80px;right:20px;
      width:300px;
      background:white;
      border-radius:14px;
      box-shadow:0 12px 40px rgba(0,0,0,.15);
      padding:14px 16px;
      display:flex;align-items:flex-start;gap:12px;
      z-index:9999;
      transform:translateX(120%);
      transition:transform .35s cubic-bezier(.34,1.56,.64,1);
      border-left:3px solid #F5841F;
      font-family:'DM Sans',sans-serif;
    `;
    t.innerHTML = `
      <div style="font-size:22px;flex-shrink:0;">${icono}</div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:700;color:#1A1A2E;margin-bottom:2px;">${titulo}</div>
        <div style="font-size:11px;color:#6B6B80;line-height:1.4;">${mensaje}</div>
      </div>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:#B0ACAC;font-size:16px;padding:0;line-height:1;">×</button>
    `;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.transform = 'translateX(0)'; });
    setTimeout(() => {
      t.style.transform = 'translateX(120%)';
      setTimeout(() => t.remove(), 350);
    }, 4000);
  }

  /* ── INIT: inject button wiring ── */
  function init() {
    // Wire up any existing notifications button
    const notifBtn = document.getElementById('notifications-btn');
    if (notifBtn) {
      btn = notifBtn;

      // Replace the hardcoded badge with a dynamic one
      const existingBadge = notifBtn.querySelector('.badge-notif');
      if (existingBadge) {
        existingBadge.id = 'notif-badge';
        existingBadge.style.display = 'none';
        existingBadge.style.cssText += 'display:none;align-items:center;justify-content:center;';
      }

      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle();
      });
    }
    updateBadge();
    createPanel();
  }

  document.addEventListener('DOMContentLoaded', init);

  /* ── PUBLIC API ── */
  return { toggle, open, close, markAsRead, markAllAsRead, addNotification, updateBadge, getUnreadCount };
})();

window.UThubNotifications = UThubNotifications;
console.log('🔔 Sistema de notificaciones inicializado');
