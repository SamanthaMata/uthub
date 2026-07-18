/* ============================================
   UTHUB - MIS PEDIDOS
   ============================================ */

const PEDIDOS_API_URL = window.UTHUB_CONFIG?.API_BASE_URL
  || (window.location.origin && window.location.origin !== 'null'
    ? `${window.location.origin}/api`
    : 'https://uthub.onrender.com/api');

const STATUS_MAP = {
  nuevo: { label: 'Confirmado', css: 'status-confirmado', step: 1 },
  confirmado: { label: 'Confirmado', css: 'status-confirmado', step: 1 },
  preparando: { label: 'Preparando', css: 'status-preparando', step: 2 },
  listo: { label: 'Listo', css: 'status-en-camino', step: 3 },
  en_camino: { label: 'En camino', css: 'status-en-camino', step: 3 },
  entregado: { label: 'Entregado', css: 'status-entregado', step: 4 },
  cancelado: { label: 'Cancelado', css: 'status-cancelado', step: 0 }
};

function getPedidosToken() {
  return localStorage.getItem('uthub_token');
}

async function pedidosApiJson(url, options = {}) {
  const response = await fetch(url, options);
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Error HTTP ${response.status}`);
  }

  return data;
}

async function fetchPedidos() {
  const token = getPedidosToken();
  if (!token) {
    return JSON.parse(localStorage.getItem('uthub_pedidos')) || [];
  }

  try {
    return await pedidosApiJson(`${PEDIDOS_API_URL}/comida/pedidos/mios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error('No se pudieron cargar los pedidos remotos:', error);
    return JSON.parse(localStorage.getItem('uthub_pedidos')) || [];
  }
}

function formatDate(isoStr) {
  const value = isoStr || new Date().toISOString();
  const d = new Date(value);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    + ' - ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function renderProgressBar(step) {
  const steps = ['1', '2', '3', '4'];
  const labels = ['Confirmado', 'Preparando', 'Listo', 'Entregado'];
  let html = '<div class="pedido-progress"><div class="progress-steps">';

  steps.forEach((label, i) => {
    const pos = i + 1;
    if (i > 0) {
      html += `<div class="progress-line ${pos <= step ? 'done' : ''}"></div>`;
    }
    const cls = pos < step ? 'done' : pos === step ? 'active' : '';
    html += `<div class="progress-step ${cls}">${pos <= step ? label : ''}</div>`;
  });

  html += '</div><div class="progress-labels">';
  labels.forEach((label, i) => {
    const pos = i + 1;
    html += `<div class="progress-label ${pos <= step ? 'done' : ''}">${label}</div>`;
  });
  html += '</div></div>';
  return html;
}

function renderPedido(pedido) {
  const estado = pedido.estado || pedido.estadoVendedor || 'nuevo';
  const status = STATUS_MAP[estado] || STATUS_MAP.nuevo;
  const items = pedido.items || pedido.productos || [];
  const itemsHtml = items.map((item) => `
    <div class="pedido-item-row">
      <span class="pedido-item-name">${escapeHtml(item.nombre || 'Producto')}</span>
      <span class="pedido-item-qty">x${Number(item.cantidad || 1)}</span>
      <span class="pedido-item-price">$${(Number(item.precio || 0) * Number(item.cantidad || 1)).toFixed(2)}</span>
    </div>
  `).join('');

  return `
    <div class="pedido-card">
      <div class="pedido-card-header">
        <div>
          <div class="pedido-id">Pedido #${String(pedido.id || Date.now()).slice(-6)}</div>
          <div class="pedido-fecha">${formatDate(pedido.fecha || pedido.created_at)}</div>
        </div>
        <span class="pedido-status ${status.css}">
          <span class="status-dot"></span>
          ${status.label}
        </span>
      </div>

      <div class="pedido-items">
        ${itemsHtml || '<div class="pedido-item-row"><span class="pedido-item-name">Sin detalle de productos</span></div>'}
      </div>

      ${estado !== 'cancelado' ? renderProgressBar(status.step) : ''}

      <div class="pedido-card-footer">
        <div class="pedido-location">Entrega: ${escapeHtml(pedido.ubicacion || 'Ubicación no especificada')}</div>
        <div>
          <div class="pedido-total-label">Total pagado</div>
          <div class="pedido-total">$${Number(pedido.total || 0).toFixed(2)}</div>
        </div>
      </div>
    </div>
  `;
}

async function loadPedidos() {
  if (typeof protegerRuta === 'function') protegerRuta();
  if (typeof updateCartCount === 'function') updateCartCount();
  bindPedidosActions();

  const params = new URLSearchParams(window.location.search);
  if (params.get('nuevo') === '1') {
    const banner = document.getElementById('success-banner');
    if (banner) banner.style.display = 'block';
    history.replaceState({}, '', window.location.pathname);
  }

  const pedidos = await fetchPedidos();
  const empty = document.getElementById('pedidos-empty');
  const list = document.getElementById('pedidos-list');

  if (!pedidos || pedidos.length === 0) {
    if (empty) empty.style.display = 'block';
    if (list) list.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  const clearBtn = document.getElementById('btn-clear');
  const stats = document.getElementById('pedidos-stats');
  if (clearBtn) clearBtn.style.display = 'inline-block';
  if (stats) stats.style.display = 'flex';

  const totalGastado = pedidos.reduce((sum, pedido) => sum + Number(pedido.total || 0), 0);
  const statTotal = document.getElementById('stat-total');
  const statGastado = document.getElementById('stat-gastado');
  if (statTotal) statTotal.textContent = pedidos.length;
  if (statGastado) statGastado.textContent = `$${totalGastado.toFixed(2)}`;

  const tiendaCount = {};
  pedidos.forEach((pedido) => {
    const tienda = pedido.tienda_nombre || pedido.tienda || 'Sin tienda';
    tiendaCount[tienda] = (tiendaCount[tienda] || 0) + 1;
  });
  const favTienda = Object.entries(tiendaCount).sort((a, b) => b[1] - a[1])[0];
  const favorita = document.getElementById('stat-favorita');
  if (favorita) favorita.textContent = favTienda ? favTienda[0] : '-';

  if (list) {
    list.innerHTML = [...pedidos].reverse().map((pedido) => renderPedido(pedido)).join('');
    list.style.display = 'block';
  }
}

async function clearHistory() {
  if (!confirm('¿Seguro que quieres limpiar el historial de pedidos?')) return;

  const token = getPedidosToken();
  if (token) {
    try {
      await pedidosApiJson(`${PEDIDOS_API_URL}/comida/pedidos/mios`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.warn('No se pudo limpiar el historial remoto:', error);
    }
  }

  localStorage.removeItem('uthub_pedidos');
  await loadPedidos();

  if (typeof showToast === 'function') {
    showToast('Historial limpiado', 'info');
  } else {
    alert('Historial limpiado');
  }
}

function bindPedidosActions() {
  const clearBtn = document.getElementById('btn-clear');
  if (!clearBtn || clearBtn.dataset.bound === 'true') return;

  clearBtn.dataset.bound = 'true';
  clearBtn.addEventListener('click', clearHistory);
}

document.addEventListener('DOMContentLoaded', loadPedidos);
window.clearHistory = clearHistory;
