/* ============================================
   UTHUB - MI TIENDA
   ============================================ */

const MI_TIENDA_API_URL = window.UTHUB_CONFIG?.API_BASE_URL
  || (window.location.origin && window.location.origin !== 'null'
    ? `${window.location.origin}/api`
    : 'https://uthub.onrender.com/api');

const MI_TIENDA_IMG_DEFAULT = 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=700&h=500&fit=crop';
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const STATUS_LABELS = {
  nuevo: 'Nuevo',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  listo: 'Listo para entregar',
  en_camino: 'Listo para entregar',
  entregado: 'Entregado',
  cancelado: 'Cancelado'
};
const STATUS_CSS = {
  nuevo: 'pill-nuevo',
  confirmado: 'pill-nuevo',
  preparando: 'pill-preparando',
  listo: 'pill-listo',
  en_camino: 'pill-listo',
  entregado: 'pill-entregado',
  cancelado: 'pill-entregado'
};

let currentStore = null;
let productosCache = [];
let pedidosCache = [];
let editingProductId = null;

function tiendaEscapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getMiTiendaToken() {
  return localStorage.getItem('uthub_token');
}

function miTiendaHeaders(extra = {}) {
  const headers = { ...extra };
  const token = getMiTiendaToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function miTiendaApiJson(url, options = {}) {
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

function defaultHorario() {
  return {
    dias: [true, true, true, true, true, false, false],
    apertura: '07:00',
    cierre: '15:00'
  };
}

function normalizeHorario(horario) {
  if (!horario) return defaultHorario();
  if (typeof horario === 'string') {
    try {
      return normalizeHorario(JSON.parse(horario));
    } catch {
      return defaultHorario();
    }
  }

  const defaults = defaultHorario();
  return {
    dias: Array.isArray(horario.dias) ? horario.dias : defaults.dias,
    apertura: horario.apertura || defaults.apertura,
    cierre: horario.cierre || defaults.cierre
  };
}

function extraKey() {
  return `uthub_mi_tienda_extra_${currentStore?.id || 'default'}`;
}

function getStoreExtra() {
  return JSON.parse(localStorage.getItem(extraKey()) || '{}');
}

function saveStoreExtra(extra) {
  localStorage.setItem(extraKey(), JSON.stringify(extra));
}

function getStoreIcon() {
  return getStoreExtra().icono || 'UT';
}

async function findOrCreateStore() {
  const stores = await miTiendaApiJson(`${MI_TIENDA_API_URL}/comida/mis-tiendas`, {
    headers: miTiendaHeaders()
  });

  if (stores.length > 0) {
    return stores[0];
  }

  const created = await miTiendaApiJson(`${MI_TIENDA_API_URL}/comida/tienda`, {
    method: 'POST',
    headers: miTiendaHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      nombre: 'Mi Tienda',
      descripcion: 'Emprendimiento estudiantil UThub',
      categoria: 'mexicana',
      imagen: '',
      horario: defaultHorario(),
      abierta: true
    })
  });

  return created.tienda;
}

async function reloadStoreData() {
  currentStore = await findOrCreateStore();

  const [productos, pedidos] = await Promise.all([
    miTiendaApiJson(`${MI_TIENDA_API_URL}/comida/productos/${currentStore.id}`),
    miTiendaApiJson(`${MI_TIENDA_API_URL}/comida/tienda/${currentStore.id}/pedidos`, {
      headers: miTiendaHeaders()
    })
  ]);

  productosCache = productos || [];
  pedidosCache = pedidos || [];
}

function showPanel(id, target) {
  document.querySelectorAll('.panel').forEach((panel) => panel.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach((link) => link.classList.remove('active'));

  const panel = document.getElementById('panel-' + id);
  if (panel) panel.classList.add('active');

  const clickedLink = target || window.event?.currentTarget;
  const activeLink = clickedLink?.classList?.contains('sidebar-link')
    ? clickedLink
    : document.querySelector(`.sidebar-link[data-panel="${id}"]`);
  if (activeLink) activeLink.classList.add('active');

  if (id === 'pedidos') renderPedidosTable();
  if (id === 'productos') renderProductos();
  if (id === 'config') loadConfig();
  if (id === 'horario') renderHorario();
  if (id === 'resumen') renderResumen();
}

function getPedidosPendientes() {
  return pedidosCache.filter((pedido) => {
    const estado = pedido.estado || 'nuevo';
    return estado === 'nuevo' || estado === 'confirmado' || estado === 'preparando';
  });
}

function renderResumen() {
  if (!currentStore) return;

  const extra = getStoreExtra();
  const pedidos = pedidosCache;
  const today = new Date().toDateString();
  const pedidosHoy = pedidos.filter((pedido) => new Date(pedido.fecha || pedido.created_at).toDateString() === today);
  const ingresos = pedidos.reduce((sum, pedido) => sum + Number(pedido.total || 0), 0);
  const ticketProm = pedidos.length ? Math.round(ingresos / pedidos.length) : 0;
  const pendientes = getPedidosPendientes();
  const icon = extra.icono || 'UT';

  document.getElementById('stat-pedidos-hoy').textContent = pedidosHoy.length;
  document.getElementById('stat-pedidos-total').textContent = pedidos.length;
  document.getElementById('stat-ingresos').textContent = '$' + ingresos.toFixed(2);
  document.getElementById('stat-ticket').textContent = 'Ticket prom. $' + ticketProm;
  document.getElementById('stat-productos').textContent = productosCache.length;
  const ratingEl = document.getElementById('stat-rating');
  if (ratingEl) ratingEl.textContent = '-';

  document.getElementById('sb-tienda-nombre').textContent = `${icon} ${currentStore.nombre || 'Mi Tienda'}`;
  document.getElementById('sb-status').textContent = currentStore.abierta ? 'Abierta ahora' : 'Cerrada';
  document.getElementById('btn-toggle-status').textContent = currentStore.abierta ? 'Cerrar Tienda' : 'Abrir Tienda';

  const badge = document.getElementById('sb-pedidos-count');
  if (pendientes.length > 0) {
    badge.textContent = pendientes.length;
    badge.style.display = 'inline';
  } else {
    badge.style.display = 'none';
  }

  const cont = document.getElementById('resumen-pedidos-pendientes');
  if (pendientes.length === 0) {
    cont.innerHTML = '<div class="empty-state"><div class="empty-state-icon">OK</div><div class="empty-state-title">Todo al día</div><div class="empty-state-desc">No hay pedidos pendientes</div></div>';
  } else {
    cont.innerHTML = `<table class="orders-table">
      <thead><tr><th>Pedido</th><th>Productos</th><th>Total</th><th>Estado</th></tr></thead>
      <tbody>${pendientes.slice(0, 5).map((pedido) => `
        <tr>
          <td class="order-id">#${String(pedido.id).slice(-5)}</td>
          <td class="order-items-preview">${(pedido.items || []).map((item) => tiendaEscapeHtml(item.nombre)).join(', ')}</td>
          <td><strong>$${Number(pedido.total || 0).toFixed(2)}</strong></td>
          <td><span class="status-pill ${STATUS_CSS[pedido.estado] || 'pill-nuevo'}">${STATUS_LABELS[pedido.estado] || 'Nuevo'}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  }

  renderMasVendidos();
}

function renderMasVendidos() {
  const cont = document.getElementById('mas-vendidos');
  const productCount = {};

  pedidosCache.forEach((pedido) => {
    (pedido.items || []).forEach((item) => {
      productCount[item.nombre] = (productCount[item.nombre] || 0) + Number(item.cantidad || 0);
    });
  });

  const top = Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
  if (top.length === 0) {
    cont.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-s);font-size:13px;">Los productos más pedidos aparecerán aquí.</div>';
    return;
  }

  cont.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px;">${top.map(([nombre, qty], index) => `
    <div style="display:flex;align-items:center;gap:12px;padding:10px;background:#FAFAF8;border-radius:10px;">
      <span style="font-family:Syne,sans-serif;font-size:18px;font-weight:800;color:var(--orange);width:24px;">${index + 1}</span>
      <span style="flex:1;font-size:13px;font-weight:600;color:var(--dark);">${tiendaEscapeHtml(nombre)}</span>
      <span style="font-size:12px;color:var(--text-s);">${qty} vendidos</span>
    </div>`).join('')}</div>`;
}

function renderPedidosTable() {
  const filtro = document.getElementById('filtro-estado-pedidos')?.value || '';
  let pedidos = [...pedidosCache];
  if (filtro) pedidos = pedidos.filter((pedido) => (pedido.estado || 'nuevo') === filtro);

  const cont = document.getElementById('pedidos-table-container');
  if (pedidos.length === 0) {
    cont.innerHTML = '<div class="empty-state"><div class="empty-state-icon">Pedidos</div><div class="empty-state-title">Sin pedidos</div><div class="empty-state-desc">Cuando los estudiantes hagan pedidos aparecerán aquí</div></div>';
    return;
  }

  cont.innerHTML = `<div style="overflow-x:auto;">
    <table class="orders-table">
      <thead>
        <tr>
          <th>Pedido</th>
          <th>Fecha</th>
          <th>Productos</th>
          <th>Entrega</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
        ${pedidos.map((pedido) => {
          const estadoActual = pedido.estado || 'nuevo';
          const fecha = new Date(pedido.fecha || pedido.created_at || Date.now());
          const fechaStr = fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + ' ' + fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
          return `<tr>
            <td class="order-id">#${String(pedido.id).slice(-5)}</td>
            <td style="font-size:12px;color:var(--text-s);">${fechaStr}</td>
            <td class="order-items-preview">${(pedido.items || []).map((item) => `${tiendaEscapeHtml(item.nombre)} x${Number(item.cantidad || 1)}`).join(', ')}</td>
            <td style="font-size:12px;">${tiendaEscapeHtml(pedido.ubicacion || '-')}</td>
            <td><strong style="color:var(--orange);">$${Number(pedido.total || 0).toFixed(2)}</strong></td>
            <td><span class="status-pill ${STATUS_CSS[estadoActual] || 'pill-nuevo'}">${STATUS_LABELS[estadoActual] || estadoActual}</span></td>
            <td>
              <select class="status-select" data-pedido-id="${Number(pedido.id)}">
                <option value="nuevo" ${estadoActual === 'nuevo' || estadoActual === 'confirmado' ? 'selected' : ''}>Nuevo</option>
                <option value="preparando" ${estadoActual === 'preparando' ? 'selected' : ''}>Preparando</option>
                <option value="listo" ${estadoActual === 'listo' || estadoActual === 'en_camino' ? 'selected' : ''}>Listo</option>
                <option value="entregado" ${estadoActual === 'entregado' ? 'selected' : ''}>Entregado</option>
              </select>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>`;
}

async function changePedidoStatus(id, estado) {
  try {
    await miTiendaApiJson(`${MI_TIENDA_API_URL}/comida/pedido/${id}/estado`, {
      method: 'PUT',
      headers: miTiendaHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ estado })
    });

    await reloadStoreData();
    renderPedidosTable();
    renderResumen();
    mostrarToast('Estado actualizado: ' + (STATUS_LABELS[estado] || estado), 'success');
  } catch (error) {
    mostrarToast(error.message || 'No se pudo actualizar el pedido', 'error');
  }
}

function renderProductos() {
  const cont = document.getElementById('products-grid-container');
  if (productosCache.length === 0) {
    cont.innerHTML = '<div class="card"><div class="empty-state"><div class="empty-state-icon">Productos</div><div class="empty-state-title">Sin productos</div><div class="empty-state-desc">Agrega los productos que vendes en tu tienda</div><button class="btn btn-primary" type="button" style="margin-top:16px" data-store-action="open-product-modal">+ Agregar Producto</button></div></div>';
    return;
  }

  cont.innerHTML = `<div class="products-grid">
    ${productosCache.map((producto) => `
      <div class="product-item-card">
        <div class="product-item-img">
          <img src="${tiendaEscapeHtml(producto.imagen || MI_TIENDA_IMG_DEFAULT)}" alt="${tiendaEscapeHtml(producto.nombre)}" onerror="this.onerror=null;this.src='${MI_TIENDA_IMG_DEFAULT}'">
        </div>
        <div class="product-item-body">
          <div class="product-item-name">${tiendaEscapeHtml(producto.nombre)}</div>
          <div style="font-size:11px;color:var(--text-s);margin:2px 0 6px;">${tiendaEscapeHtml(producto.categoria || '')} ${producto.badge ? '- ' + tiendaEscapeHtml(producto.badge) : ''}</div>
          <div class="product-item-price">$${Number(producto.precio || 0).toFixed(2)}</div>
          <div class="product-item-actions">
            <button class="btn btn-ghost btn-sm" type="button" data-product-action="edit" data-product-id="${Number(producto.id)}">Editar</button>
            <button class="btn btn-danger btn-sm" type="button" data-product-action="delete" data-product-id="${Number(producto.id)}">Eliminar</button>
          </div>
        </div>
      </div>`).join('')}
  </div>`;
}

function clearProductModal() {
  ['prod-nombre', 'prod-precio', 'prod-categoria', 'prod-badge', 'prod-desc', 'prod-img'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

function setProductModalTitle(text) {
  const title = document.querySelector('#modal-add-product .modal-title');
  if (title) title.textContent = text;
}

function openAddProductModal() {
  editingProductId = null;
  clearProductModal();
  setProductModalTitle('Agregar Producto');
  document.getElementById('modal-add-product').classList.add('open');
}

function openEditProductModal(id) {
  const producto = productosCache.find((item) => Number(item.id) === Number(id));
  if (!producto) return;

  editingProductId = producto.id;
  setProductModalTitle('Editar Producto');
  document.getElementById('prod-nombre').value = producto.nombre || '';
  document.getElementById('prod-precio').value = producto.precio || '';
  document.getElementById('prod-categoria').value = producto.categoria || '';
  document.getElementById('prod-badge').value = producto.badge || '';
  document.getElementById('prod-desc').value = producto.descripcion || '';
  document.getElementById('prod-img').value = producto.imagen || '';
  document.getElementById('modal-add-product').classList.add('open');
}

function closeAddProductModal() {
  document.getElementById('modal-add-product').classList.remove('open');
}

async function saveProduct() {
  if (!currentStore) return;

  const nombre = document.getElementById('prod-nombre').value.trim();
  const precio = Number(document.getElementById('prod-precio').value);
  if (!nombre || !Number.isFinite(precio) || precio <= 0) {
    mostrarToast('Nombre y precio son obligatorios', 'error');
    return;
  }

  const payload = {
    tienda_id: currentStore.id,
    nombre,
    precio,
    categoria: document.getElementById('prod-categoria').value.trim(),
    badge: document.getElementById('prod-badge').value.trim(),
    descripcion: document.getElementById('prod-desc').value.trim(),
    imagen: document.getElementById('prod-img').value.trim()
  };

  try {
    const url = editingProductId
      ? `${MI_TIENDA_API_URL}/comida/producto/${editingProductId}`
      : `${MI_TIENDA_API_URL}/comida/producto`;
    const method = editingProductId ? 'PUT' : 'POST';

    await miTiendaApiJson(url, {
      method,
      headers: miTiendaHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });

    await reloadStoreData();
    closeAddProductModal();
    renderProductos();
    renderResumen();
    mostrarToast(editingProductId ? 'Producto actualizado correctamente' : 'Producto agregado correctamente', 'success');
    editingProductId = null;
  } catch (error) {
    mostrarToast(error.message || 'No se pudo guardar el producto', 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('¿Eliminar este producto?')) return;

  try {
    await miTiendaApiJson(`${MI_TIENDA_API_URL}/comida/producto/${id}`, {
      method: 'DELETE',
      headers: miTiendaHeaders()
    });
    await reloadStoreData();
    renderProductos();
    renderResumen();
    mostrarToast('Producto eliminado', 'info');
  } catch (error) {
    mostrarToast(error.message || 'No se pudo eliminar el producto', 'error');
  }
}

function loadConfig() {
  if (!currentStore) return;
  const extra = getStoreExtra();
  document.getElementById('cfg-nombre').value = currentStore.nombre || '';
  document.getElementById('cfg-tipo').value = currentStore.categoria || 'mexicana';
  document.getElementById('cfg-edificio').value = extra.edificio || '';
  document.getElementById('cfg-emoji').value = extra.icono || 'UT';
  document.getElementById('cfg-img').value = currentStore.imagen || '';
  document.getElementById('cfg-desc').value = currentStore.descripcion || '';
}

async function saveConfig() {
  if (!currentStore) return;

  const extra = getStoreExtra();
  extra.edificio = document.getElementById('cfg-edificio').value.trim();
  extra.icono = document.getElementById('cfg-emoji').value.trim() || 'UT';
  saveStoreExtra(extra);

  try {
    const updated = await miTiendaApiJson(`${MI_TIENDA_API_URL}/comida/tienda/${currentStore.id}`, {
      method: 'PUT',
      headers: miTiendaHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        nombre: document.getElementById('cfg-nombre').value.trim() || currentStore.nombre,
        categoria: document.getElementById('cfg-tipo').value,
        descripcion: document.getElementById('cfg-desc').value.trim(),
        imagen: document.getElementById('cfg-img').value.trim(),
        horario: normalizeHorario(currentStore.horario),
        abierta: Boolean(currentStore.abierta)
      })
    });

    currentStore = updated.tienda;
    renderResumen();
    mostrarToast('Tienda actualizada correctamente', 'success');
  } catch (error) {
    mostrarToast(error.message || 'No se pudo actualizar la tienda', 'error');
  }
}

function renderHorario() {
  if (!currentStore) return;
  const horario = normalizeHorario(currentStore.horario);
  const cont = document.getElementById('horario-dias');
  cont.innerHTML = DIAS.map((dia, index) => `
    <div class="horario-day">
      <label>
        <span class="day-name">${dia}</span>
        <input type="checkbox" id="dia-${index}" ${horario.dias[index] ? 'checked' : ''} data-day-index="${index}">
        <div class="day-toggle">${dia.slice(0, 1)}</div>
      </label>
    </div>`).join('');
  document.getElementById('hora-apertura').value = horario.apertura;
  document.getElementById('hora-cierre').value = horario.cierre;
}

function updateDiaHorario(index, checked) {
  const horario = normalizeHorario(currentStore.horario);
  horario.dias[index] = checked;
  currentStore.horario = horario;
}

async function saveHorario() {
  if (!currentStore) return;
  const horario = normalizeHorario(currentStore.horario);
  horario.apertura = document.getElementById('hora-apertura').value;
  horario.cierre = document.getElementById('hora-cierre').value;
  currentStore.horario = horario;

  try {
    const updated = await miTiendaApiJson(`${MI_TIENDA_API_URL}/comida/tienda/${currentStore.id}`, {
      method: 'PUT',
      headers: miTiendaHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...currentStore, horario })
    });
    currentStore = updated.tienda;
    mostrarToast('Horario guardado', 'success');
  } catch (error) {
    mostrarToast(error.message || 'No se pudo guardar el horario', 'error');
  }
}

async function toggleTiendaStatus() {
  if (!currentStore) return;
  const abierta = !currentStore.abierta;

  try {
    const updated = await miTiendaApiJson(`${MI_TIENDA_API_URL}/comida/tienda/${currentStore.id}`, {
      method: 'PUT',
      headers: miTiendaHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...currentStore, abierta })
    });
    currentStore = updated.tienda;
    renderResumen();
    mostrarToast(currentStore.abierta ? 'Tienda abierta' : 'Tienda cerrada', currentStore.abierta ? 'success' : 'info');
  } catch (error) {
    mostrarToast(error.message || 'No se pudo cambiar el estado', 'error');
  }
}

function mostrarToast(msg, tipo = 'info') {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);background:${tipo === 'success' ? '#22C55E' : tipo === 'error' ? '#FF4F5E' : '#60A5FA'};color:white;padding:12px 24px;border-radius:10px;font-size:13px;font-weight:600;z-index:9999;opacity:0;transition:all .3s ease;font-family:DM Sans,sans-serif;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.transform = 'translateX(-50%) translateY(0)';
    t.style.opacity = '1';
  }, 50);
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

function bindMiTiendaActions() {
  document.querySelectorAll('[data-panel]').forEach((link) => {
    if (link.dataset.bound === 'true') return;
    link.dataset.bound = 'true';
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showPanel(link.dataset.panel, link);
    });
  });

  const bindings = [
    ['btn-toggle-status', toggleTiendaStatus],
    ['btn-open-add-product', openAddProductModal],
    ['btn-save-config', saveConfig],
    ['btn-save-horario', saveHorario],
    ['btn-close-product-modal', closeAddProductModal],
    ['btn-save-product', saveProduct]
  ];

  bindings.forEach(([id, handler]) => {
    const el = document.getElementById(id);
    if (!el || el.dataset.bound === 'true') return;
    el.dataset.bound = 'true';
    el.addEventListener('click', handler);
  });

  const filtroPedidos = document.getElementById('filtro-estado-pedidos');
  if (filtroPedidos && filtroPedidos.dataset.bound !== 'true') {
    filtroPedidos.dataset.bound = 'true';
    filtroPedidos.addEventListener('change', renderPedidosTable);
  }

  const productsContainer = document.getElementById('products-grid-container');
  if (productsContainer && productsContainer.dataset.bound !== 'true') {
    productsContainer.dataset.bound = 'true';
    productsContainer.addEventListener('click', (event) => {
      const actionButton = event.target.closest('[data-product-action], [data-store-action]');
      if (!actionButton) return;

      if (actionButton.dataset.storeAction === 'open-product-modal') {
        openAddProductModal();
        return;
      }

      const id = Number(actionButton.dataset.productId);
      if (actionButton.dataset.productAction === 'edit') openEditProductModal(id);
      if (actionButton.dataset.productAction === 'delete') deleteProduct(id);
    });
  }

  const pedidosContainer = document.getElementById('pedidos-table-container');
  if (pedidosContainer && pedidosContainer.dataset.bound !== 'true') {
    pedidosContainer.dataset.bound = 'true';
    pedidosContainer.addEventListener('change', (event) => {
      const select = event.target.closest('[data-pedido-id]');
      if (!select) return;
      changePedidoStatus(Number(select.dataset.pedidoId), select.value);
    });
  }

  const horarioContainer = document.getElementById('horario-dias');
  if (horarioContainer && horarioContainer.dataset.bound !== 'true') {
    horarioContainer.dataset.bound = 'true';
    horarioContainer.addEventListener('change', (event) => {
      const checkbox = event.target.closest('[data-day-index]');
      if (!checkbox) return;
      updateDiaHorario(Number(checkbox.dataset.dayIndex), checkbox.checked);
    });
  }
}

async function initMiTienda() {
  try {
    if (typeof protegerRuta === 'function') protegerRuta();
    bindMiTiendaActions();
    await reloadStoreData();
    renderResumen();
    renderHorario();
  } catch (error) {
    console.error(error);
    const main = document.querySelector('.vendor-main');
    if (main) {
      main.innerHTML = `<div class="card"><div class="empty-state"><div class="empty-state-title">No se pudo cargar Mi Tienda</div><div class="empty-state-desc">${tiendaEscapeHtml(error.message || 'Revisa tu sesión y la conexión del servidor.')}</div></div></div>`;
    }
  }

  const modal = document.getElementById('modal-add-product');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === event.currentTarget) closeAddProductModal();
    });
  }
}

document.addEventListener('DOMContentLoaded', initMiTienda);

window.showPanel = showPanel;
window.renderPedidosTable = renderPedidosTable;
window.changePedidoStatus = changePedidoStatus;
window.renderProductos = renderProductos;
window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.closeAddProductModal = closeAddProductModal;
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;
window.loadConfig = loadConfig;
window.saveConfig = saveConfig;
window.renderHorario = renderHorario;
window.updateDiaHorario = updateDiaHorario;
window.saveHorario = saveHorario;
window.toggleTiendaStatus = toggleTiendaStatus;
