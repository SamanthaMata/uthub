/* ============================================
   UTHUB - MÓDULO DE COMIDA (FRONTEND)
   ============================================ */

const API_URL = window.UTHUB_CONFIG?.API_BASE_URL || (window.location.origin && window.location.origin !== 'null' ? `${window.location.origin}/api` : 'https://uthub.onrender.com/api');
const IMG_DEFAULT = 'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

let cart = JSON.parse(localStorage.getItem('uthub_cart')) || [];
let tiendaActual = '';
let cartDeliveryPoints = [];
let tiendasCache = [];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getToken() {
  return localStorage.getItem('uthub_token');
}

function authHeaders(extra = {}) {
  const headers = { ...extra };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function persistCart() {
  localStorage.setItem('uthub_cart', JSON.stringify(cart));
}

function getCartTotalItems() {
  return cart.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
}

async function apiJson(url, options = {}) {
  const response = await fetch(url, options);
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error || data?.message || `Error HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

/* ============================================
   TIENDAS
   ============================================ */

async function cargarTiendas() {
  try {
    tiendasCache = await apiJson(`${API_URL}/comida/tiendas`);
    renderTiendas(tiendasCache);
  } catch (error) {
    console.error('Error cargando tiendas:', error);
  }
}

function renderTiendas(tiendas) {
  const contenedor = document.getElementById('tiendas-grid');
  const emptyState = document.getElementById('empty-state');
  if (!contenedor) return;

  const search = document.getElementById('tiendas-search')?.value?.trim().toLowerCase() || '';
  const tipo = document.getElementById('filter-tipo')?.value || '';
  const edificio = document.getElementById('filter-edificio')?.value || '';
  const precio = document.getElementById('filter-precio')?.value || '';
  const calificacion = Number(document.getElementById('filter-calificacion')?.value || 0);

  const filtradas = (tiendas || []).filter((t) => {
    const nombre = String(t.nombre || '').toLowerCase();
    const descripcion = String(t.descripcion || '').toLowerCase();
    const categoria = String(t.categoria || '').toLowerCase();
    const horario = String(t.horario || '').toLowerCase();
    const texto = `${nombre} ${descripcion} ${categoria} ${horario}`;
    const matchesSearch = !search || texto.includes(search);
    const matchesTipo = !tipo || categoria.includes(tipo);
    const matchesEdificio = !edificio || texto.includes(edificio.toLowerCase());
    const matchesPrecio = !precio || true;
    const matchesRating = !calificacion || 5 >= calificacion;
    return matchesSearch && matchesTipo && matchesEdificio && matchesPrecio && matchesRating;
  });

  contenedor.innerHTML = filtradas.map((t) => `
    <div class="tienda-card">
      <img
        src="${escapeHtml(t.imagen || IMG_DEFAULT)}"
        onerror="this.onerror=null;this.src='${IMG_DEFAULT}'"
        alt="${escapeHtml(t.nombre)}"
      >
      <div class="tienda-content">
        <h3 class="tienda-name">${escapeHtml(t.nombre)}</h3>
        <p class="tienda-description">${escapeHtml(t.descripcion || 'Comida preparada por emprendedores UThub')}</p>
        <a href="menu.html?id=${t.id}" class="btn-tienda">Ver menú</a>
      </div>
    </div>
  `).join('');

  if (emptyState) {
    emptyState.style.display = filtradas.length === 0 ? 'block' : 'none';
  }
}

function refreshTiendas() {
  renderTiendas(tiendasCache);
}

function clearFilters() {
  const ids = ['tiendas-search', 'filter-tipo', 'filter-edificio', 'filter-precio', 'filter-calificacion'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'INPUT') el.value = '';
    else el.selectedIndex = 0;
  });
  renderTiendas(tiendasCache);
}

function formatHorario(horario) {
  if (!horario) return 'Horario no configurado';

  let data = horario;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return data;
    }
  }

  if (!data || typeof data !== 'object') return String(horario);

  const dias = Array.isArray(data.dias) ? data.dias : [];
  const nombres = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  let diasTexto = dias
    .map((activo, index) => (activo ? nombres[index] : null))
    .filter(Boolean)
    .join(', ');

  if (dias.length >= 7 && dias.slice(0, 5).every(Boolean) && !dias[5] && !dias[6]) {
    diasTexto = 'Lun a Vie';
  } else if (dias.length >= 7 && dias.every(Boolean)) {
    diasTexto = 'Lun a Dom';
  }

  const apertura = data.apertura || '--:--';
  const cierre = data.cierre || '--:--';
  return `${diasTexto || 'Días no configurados'} de ${apertura} a ${cierre}`;
}

/* ============================================
   PRODUCTOS
   ============================================ */

async function cargarProductos() {
  try {
    const params = new URLSearchParams(window.location.search);
    const tiendaId = params.get('id');
    if (!tiendaId) return;

    const productos = await apiJson(`${API_URL}/comida/productos/${tiendaId}`);
    const contenedor = document.getElementById('productos-container');
    if (!contenedor) return;

    contenedor.innerHTML = productos.map((p) => `
      <div class="producto-card">
        <div class="producto-image">
          <img
            src="${escapeHtml(p.imagen || IMG_DEFAULT)}"
            onerror="this.onerror=null;this.src='${IMG_DEFAULT}'"
            alt="${escapeHtml(p.nombre)}"
          >
          <div class="producto-badge">${escapeHtml(p.badge || 'Popular')}</div>
        </div>
        <div class="producto-content">
          <h3 class="producto-name">${escapeHtml(p.nombre)}</h3>
          <p class="producto-description">${escapeHtml(p.descripcion || 'Delicioso producto disponible')}</p>
          <div class="producto-footer">
            <div class="producto-price">$${Number(p.precio || 0).toFixed(2)}</div>
            <button
              class="btn-add-cart"
              type="button"
              data-cart-action="add"
              data-product-id="${Number(p.id)}"
              data-product-name="${escapeHtml(p.nombre)}"
              data-product-price="${Number(p.precio || 0)}"
            >Agregar</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

async function cargarInfoTienda() {
  try {
    const params = new URLSearchParams(window.location.search);
    const tiendaId = params.get('id');
    if (!tiendaId) return;

    const tienda = await apiJson(`${API_URL}/comida/tienda/${tiendaId}`);
    tiendaActual = tienda?.nombre || '';

    const nameEl = document.querySelector('.tienda-detail-name');
    const descEl = document.querySelector('.tienda-detail-description');
    const breadcrumb = document.querySelector('.breadcrumb-item.active');
    const banner = document.querySelector('.tienda-detail-banner');
    const title = document.querySelector('.tienda-logo');
    const statusBadge = document.querySelector('.status-badge');
    const statusHours = document.querySelector('.status-hours');
    const ratingValue = document.querySelector('.rating-value');
    const ratingCount = document.querySelector('.rating-count');
    const metaTexts = document.querySelectorAll('.tienda-detail-meta .meta-text');

    if (nameEl) nameEl.textContent = tienda.nombre || 'Tienda';
    if (descEl) descEl.textContent = tienda.descripcion || 'Emprendimiento estudiantil';
    if (breadcrumb) breadcrumb.textContent = tienda.nombre || 'Tienda';
    document.title = `Menú - ${tienda.nombre || 'Tienda'} - UThub`;

    if (banner) {
      banner.innerHTML = `
        <img
          src="${escapeHtml(tienda.imagen || IMG_DEFAULT)}"
          onerror="this.onerror=null;this.src='${IMG_DEFAULT}'"
          alt="${escapeHtml(tienda.nombre || 'Tienda')}"
        >
      `;
    }

    if (title) {
      title.textContent = (tienda.nombre || 'T').slice(0, 1).toUpperCase();
    }

    if (statusBadge) {
      const abierta = Number(tienda.abierta ?? 1) === 1;
      statusBadge.className = `status-badge ${abierta ? 'status-open' : 'status-closed'}`;
      statusBadge.innerHTML = `<span class="status-dot"></span>${abierta ? 'Abierta' : 'Cerrada'}`;
    }

    if (statusHours) statusHours.textContent = formatHorario(tienda.horario);

    if (ratingValue) ratingValue.textContent = '5.0';
    if (ratingCount) ratingCount.textContent = '(120)';
    if (metaTexts[0]) metaTexts[0].textContent = tienda.categoria || 'Comida';
    if (metaTexts[1]) metaTexts[1].textContent = tienda.horario ? 'Horario disponible' : 'Sin horario';
  } catch (error) {
    console.error('Error cargando tienda:', error);
  }
}

/* ============================================
   CREAR / ACTUALIZAR TIENDA Y PRODUCTOS
   ============================================ */

async function crearTienda() {
  const payload = {
    nombre: document.getElementById('nombre')?.value || 'Mi Tienda',
    descripcion: document.getElementById('descripcion')?.value || '',
    imagen: document.getElementById('imagen')?.value || '',
    categoria: document.getElementById('categoria')?.value || 'otro'
  };

  try {
    const data = await apiJson(`${API_URL}/comida/tienda`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });

    alert('Tienda creada correctamente');
    return data;
  } catch (error) {
    alert(error.message || 'No se pudo crear la tienda');
    throw error;
  }
}

async function crearProducto() {
  const payload = {
    nombre: document.getElementById('prod-nombre')?.value || '',
    precio: Number(document.getElementById('prod-precio')?.value || 0),
    descripcion: document.getElementById('prod-desc')?.value || '',
    imagen: document.getElementById('prod-img')?.value || '',
    categoria: document.getElementById('prod-categoria')?.value || '',
    badge: document.getElementById('prod-badge')?.value || '',
    tienda_id: Number(document.getElementById('tienda-id')?.value || 0)
  };

  try {
    const data = await apiJson(`${API_URL}/comida/producto`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });

    alert('Producto creado correctamente');
    return data;
  } catch (error) {
    alert(error.message || 'No se pudo crear el producto');
    throw error;
  }
}

/* ============================================
   CARRITO
   ============================================ */

function addToCart(nombre, precio, id) {
  const item = cart.find((i) => Number(i.id) === Number(id));
  if (item) {
    item.cantidad += 1;
  } else {
    cart.push({
      id,
      nombre,
      precio: Number(precio),
      cantidad: 1,
      tienda: tiendaActual
    });
  }

  persistCart();
  updateCartCount();
  updateCartDisplay();
}

function increaseCartItem(id) {
  const item = cart.find((i) => Number(i.id) === Number(id));
  if (!item) return;
  item.cantidad += 1;
  persistCart();
  loadCartItems();
  updateCartCount();
  updateCartDisplay();
}

function decreaseCartItem(id) {
  const item = cart.find((i) => Number(i.id) === Number(id));
  if (!item) return;
  item.cantidad -= 1;
  if (item.cantidad <= 0) {
    cart = cart.filter((i) => Number(i.id) !== Number(id));
  }
  persistCart();
  loadCartItems();
  updateCartCount();
  updateCartDisplay();
}

function removeCartItem(id) {
  cart = cart.filter((i) => Number(i.id) !== Number(id));
  persistCart();
  loadCartItems();
  updateCartCount();
  updateCartDisplay();
}

function updateCartCount() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  const total = getCartTotalItems();
  el.textContent = total;
}

function updateCartDisplay() {
  const subtotal = cart.reduce((sum, i) => sum + (Number(i.precio || 0) * Number(i.cantidad || 0)), 0);
  const delivery = subtotal > 0 ? 10 : 0;
  const total = subtotal + delivery;

  const totalEl = document.getElementById('cart-float-total');
  const countEl = document.getElementById('cart-float-count');
  const subtotalEl = document.getElementById('cart-subtotal');
  const deliveryEl = document.getElementById('cart-delivery');
  const totalCheckoutEl = document.getElementById('cart-total');

  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  if (countEl) countEl.textContent = `${getCartTotalItems()} productos`;
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (deliveryEl) deliveryEl.textContent = `$${delivery.toFixed(2)}`;
  if (totalCheckoutEl) totalCheckoutEl.textContent = `$${total.toFixed(2)}`;
}

function syncCartPageState() {
  const emptyEl = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('cart-summary');
  const label = document.getElementById('items-count-label');
  const totalItems = getCartTotalItems();

  if (label) {
    label.textContent = `${totalItems} producto${totalItems !== 1 ? 's' : ''}`;
  }

  if (!emptyEl || !summaryEl) return;

  if (cart.length === 0) {
    emptyEl.style.display = 'block';
    summaryEl.style.display = 'none';
  } else {
    emptyEl.style.display = 'none';
    summaryEl.style.display = 'block';
  }
}

function loadCartItems() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    updateCartDisplay();
    syncCartPageState();
    return;
  }

  container.innerHTML = cart.map((item) => `
    <article class="cart-item">
      <div class="cart-item-emoji">🍽️</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${escapeHtml(item.nombre)}</div>
        <div class="cart-item-tienda">${escapeHtml(item.tienda || tiendaActual || 'Tienda')}</div>
      </div>
      <div class="cart-item-quantity">
        <button class="qty-btn" type="button" data-cart-action="decrease" data-product-id="${Number(item.id)}">-</button>
        <div class="qty-value">${Number(item.cantidad || 0)}</div>
        <button class="qty-btn" type="button" data-cart-action="increase" data-product-id="${Number(item.id)}">+</button>
      </div>
      <div class="cart-item-price">$${(Number(item.precio || 0) * Number(item.cantidad || 0)).toFixed(2)}</div>
      <button class="cart-item-remove" type="button" title="Eliminar" data-cart-action="remove" data-product-id="${Number(item.id)}">Eliminar</button>
    </article>
  `).join('');

  updateCartDisplay();
  syncCartPageState();
}

async function hacerPedido() {
  if (cart.length === 0) {
    alert('Tu carrito está vacío');
    return null;
  }

  const ubicacionSelect = document.getElementById('ubicacion-entrega');
  const ubicacionPrompt = ubicacionSelect ? ubicacionSelect.value : '';
  const ubicacion = ubicacionPrompt || prompt('¿Dónde quieres recibir tu pedido? (ej: Salón B-201)');
  if (!ubicacion) return null;

  const instrucciones = document.getElementById('instrucciones')?.value || '';
  const token = getToken();

  if (!token) {
    alert('Necesitas iniciar sesión para hacer el pedido');
    return null;
  }

  const pedido = await apiJson(`${API_URL}/comida/pedido`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      items: cart,
      ubicacion,
      instrucciones
    })
  });

  const prevPedidos = JSON.parse(localStorage.getItem('uthub_pedidos')) || [];
  prevPedidos.push(pedido.pedido);
  localStorage.setItem('uthub_pedidos', JSON.stringify(prevPedidos));

  cart = [];
  persistCart();
  updateCartCount();
  updateCartDisplay();
  loadCartItems();

  return pedido.pedido;
}

async function procesarPedido() {
  try {
    const pedido = await hacerPedido();
    if (!pedido) return;
    alert('Pedido realizado con éxito');
    window.location.href = 'pedidos.html?nuevo=1';
  } catch (error) {
    console.error('Error:', error);
    alert(error.message || 'Error al enviar pedido');
  }
}

/* ============================================
   CART MAP
   ============================================ */

async function initCartDeliveryMap() {
  const select = document.getElementById('ubicacion-entrega');
  if (!select) return;

  try {
    cartDeliveryPoints = await apiJson(`${API_URL}/comida/ubicaciones`);
    select.innerHTML = '<option value="">Selecciona una ubicación</option>' + cartDeliveryPoints.map((point) => `
      <option value="${escapeHtml(point.nombre)}">${escapeHtml(point.nombre)} - ${escapeHtml(point.tipo)}</option>
    `).join('');
    select.disabled = false;

    select.addEventListener('change', () => {
      const match = cartDeliveryPoints.find((point) => point.nombre === select.value);
      updateDeliveryMapStatus(match);
      updateDeliveryMap(match);
    });

    const defaultPoint = cartDeliveryPoints[0];
    if (defaultPoint) {
      select.value = defaultPoint.nombre;
      updateDeliveryMapStatus(defaultPoint);
      updateDeliveryMap(defaultPoint);
    }
  } catch (error) {
    console.error('No se pudieron cargar las ubicaciones:', error);
    select.innerHTML = '<option value="">No se pudieron cargar las ubicaciones</option>';
  }
}

function updateDeliveryMapStatus(point) {
  const status = document.getElementById('delivery-map-status');
  if (!status) return;
  if (!point) {
    status.textContent = 'Selecciona un punto para mostrar la entrega en el mapa.';
    return;
  }
  status.textContent = `${point.nombre} - ${point.detalle}`;
}

function updateDeliveryMap(point) {
  const container = document.getElementById('delivery-location-map');
  if (!container) return;
  if (!point) {
    container.innerHTML = '<div class="campus-static-empty">Selecciona una ubicación para ver el punto de entrega.</div>';
    return;
  }

  const points = cartDeliveryPoints.length ? cartDeliveryPoints : [point];
  const position = projectCampusPoint(point, points);

  container.innerHTML = `
    <div class="campus-static-map delivery-static-map">
      <div class="campus-static-label">Campus UTSC</div>
      <div class="campus-static-road road-main"></div>
      <div class="campus-static-road road-cross"></div>
      <button
        class="campus-static-pin active"
        type="button"
        style="left:${position.x}%;top:${position.y}%;"
        aria-label="${escapeHtml(point.nombre)}"
      >
        <span class="campus-static-pin-dot"></span>
        <span class="campus-static-pin-label">${escapeHtml(point.nombre)}</span>
      </button>
    </div>
  `;
}

function projectCampusPoint(point, allPoints) {
  const usable = (allPoints || []).filter((item) => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng)));
  if (usable.length === 0) return { x: 50, y: 50 };

  const lats = usable.map((item) => Number(item.lat));
  const lngs = usable.map((item) => Number(item.lng));
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  return {
    x: Math.min(88, Math.max(12, 12 + ((Number(point.lng) - minLng) / lngRange) * 76)),
    y: Math.min(84, Math.max(16, 16 + (1 - ((Number(point.lat) - minLat) / latRange)) * 68))
  };
}

function renderCampusFoodMap(points = []) {
  const map = document.getElementById('campus-food-map');
  const list = document.getElementById('campus-map-points');
  if (!map) return;

  const campusPoints = points.length ? points : [
    { id: 'docencia', nombre: 'Docencia', tipo: 'Punto académico', detalle: 'Edificio de docencia de la UTSC.', lat: 25.68957, lng: -100.51236 },
    { id: 'cafeteria', nombre: 'Cafetería UTSC', tipo: 'Comida y entregas', detalle: 'Punto principal para comprar comida o recoger pedidos.', lat: 25.68908, lng: -100.51192 },
    { id: 'cajas', nombre: 'Cajas de pago', tipo: 'Trámites y pagos', detalle: 'Área de cajas de pago dentro del plantel.', lat: 25.69076, lng: -100.51131 },
    { id: 'vinculacion', nombre: 'Edificio de Vinculación', tipo: 'Servicios universitarios', detalle: 'Edificio de Vinculación de la UTSC.', lat: 25.69115, lng: -100.51215 }
  ];

  map.innerHTML = `
    <div class="campus-static-map">
      <div class="campus-static-label">Campus UTSC</div>
      <div class="campus-static-road road-main"></div>
      <div class="campus-static-road road-cross"></div>
      ${campusPoints.map((point, index) => {
        const position = projectCampusPoint(point, campusPoints);
        return `
          <button
            class="campus-static-pin ${index === 0 ? 'active' : ''}"
            type="button"
            style="left:${position.x}%;top:${position.y}%;"
            data-campus-point="${escapeHtml(point.id || point.nombre)}"
            aria-label="${escapeHtml(point.nombre)}"
          >
            <span class="campus-static-pin-dot"></span>
            <span class="campus-static-pin-label">${escapeHtml(point.nombre)}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;

  if (list) {
    list.innerHTML = campusPoints.map((point, index) => `
      <button
        class="campus-point-btn ${index === 0 ? 'active' : ''}"
        type="button"
        data-campus-point="${escapeHtml(point.id || point.nombre)}"
      >
        <span class="campus-point-name">${escapeHtml(point.nombre)}</span>
        <span class="campus-point-meta">${escapeHtml(point.tipo)} - ${escapeHtml(point.detalle)}</span>
      </button>
    `).join('');
  }
}

function selectCampusPoint(pointId) {
  document.querySelectorAll('[data-campus-point]').forEach((item) => {
    item.classList.toggle('active', item.dataset.campusPoint === pointId);
  });
}

async function initCampusFoodMap() {
  if (!document.getElementById('campus-food-map')) return;

  try {
    const points = await apiJson(`${API_URL}/comida/ubicaciones`);
    renderCampusFoodMap(points);
  } catch (error) {
    console.error('No se pudo cargar el mapa del campus:', error);
    renderCampusFoodMap();
  }

  const pointsContainer = document.getElementById('campus-map-points');
  const mapContainer = document.getElementById('campus-food-map');

  pointsContainer?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-campus-point]');
    if (!button) return;
    selectCampusPoint(button.dataset.campusPoint);
  });

  mapContainer?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-campus-point]');
    if (!button) return;
    selectCampusPoint(button.dataset.campusPoint);
  });
}

/* ============================================
   INIT HELPERS
   ============================================ */

function initMenuPage() {
  bindMenuCartActions();
  updateCartCount();
  updateCartDisplay();
}

function bindMenuCartActions() {
  const contenedor = document.getElementById('productos-container');
  if (!contenedor || contenedor.dataset.cartActionsBound === 'true') return;

  contenedor.dataset.cartActionsBound = 'true';
  contenedor.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cart-action="add"]');
    if (!button) return;

    addToCart(
      button.dataset.productName || 'Producto',
      Number(button.dataset.productPrice || 0),
      Number(button.dataset.productId || 0)
    );

    const originalText = button.textContent;
    button.textContent = 'Agregado';
    button.disabled = true;
    setTimeout(() => {
      button.textContent = originalText || 'Agregar';
      button.disabled = false;
    }, 700);
  });
}

function initTiendasPage() {
  const searchInput = document.getElementById('tiendas-search');
  const selects = [
    document.getElementById('filter-tipo'),
    document.getElementById('filter-edificio'),
    document.getElementById('filter-precio'),
    document.getElementById('filter-calificacion')
  ].filter(Boolean);

  searchInput?.addEventListener('input', refreshTiendas);
  selects.forEach((select) => select.addEventListener('change', refreshTiendas));
  document.getElementById('btn-clear-filters')?.addEventListener('click', clearFilters);

  updateCartCount();
  initCampusFoodMap();
}

function initPedidosPage() {
  // La pantalla de pedidos maneja su propia lógica en el HTML,
  // pero dejamos este gancho por consistencia.
  updateCartCount();
}

function initCarritoPage() {
  bindCartPageActions();
  loadCartItems();
  updateCartCount();
  updateCartDisplay();
  initCartDeliveryMap();
}

function bindCartPageActions() {
  const container = document.getElementById('cart-items');
  if (container && container.dataset.cartActionsBound !== 'true') {
    container.dataset.cartActionsBound = 'true';
    container.addEventListener('click', (event) => {
      const button = event.target.closest('[data-cart-action]');
      if (!button) return;

      const id = Number(button.dataset.productId);
      const action = button.dataset.cartAction;

      if (action === 'increase') increaseCartItem(id);
      if (action === 'decrease') decreaseCartItem(id);
      if (action === 'remove') removeCartItem(id);
    });
  }

  const checkout = document.querySelector('.btn-checkout');
  if (checkout && checkout.dataset.checkoutBound !== 'true') {
    checkout.dataset.checkoutBound = 'true';
    checkout.addEventListener('click', procesarPedido);
  }
}

function bootComidaPages() {
  const hasTiendas = document.getElementById('tiendas-grid');
  const hasMenu = document.getElementById('productos-container');
  const hasCart = document.getElementById('delivery-location-map') || document.getElementById('cart-float');

  if (hasTiendas) {
    initTiendasPage();
    cargarTiendas();
  }

  if (hasMenu) {
    initMenuPage();
    cargarProductos();
    cargarInfoTienda();
  }

  if (hasCart) {
    initCarritoPage();
  }
}

document.addEventListener('DOMContentLoaded', bootComidaPages);

window.cargarTiendas = cargarTiendas;
window.cargarProductos = cargarProductos;
window.cargarInfoTienda = cargarInfoTienda;
window.crearTienda = crearTienda;
window.crearProducto = crearProducto;
window.addToCart = addToCart;
window.increaseCartItem = increaseCartItem;
window.decreaseCartItem = decreaseCartItem;
window.removeCartItem = removeCartItem;
window.updateCartDisplay = updateCartDisplay;
window.updateCartCount = updateCartCount;
window.loadCartItems = loadCartItems;
window.syncCartPageState = syncCartPageState;
window.procesarPedido = procesarPedido;
window.hacerPedido = hacerPedido;
window.initMenuPage = initMenuPage;
window.initTiendasPage = initTiendasPage;
window.initPedidosPage = initPedidosPage;
window.initCarritoPage = initCarritoPage;
window.clearFilters = clearFilters;
window.initCartDeliveryMap = initCartDeliveryMap;
window.updateDeliveryMapStatus = updateDeliveryMapStatus;
window.updateDeliveryMap = updateDeliveryMap;

console.log('? comida.js listo');

