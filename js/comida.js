/* ============================================
   UTHUB - M?DULO DE COMIDA (FRONTEND)
   ============================================ */

const API_URL = window.UTHUB_CONFIG?.API_BASE_URL || 'https://uthub.onrender.com/api';
const IMG_DEFAULT = 'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

let cart = JSON.parse(localStorage.getItem('uthub_cart')) || [];
let tiendaActual = '';
let cartDeliveryMap = null;
let cartDeliveryMarker = null;
let cartDeliveryPoints = [];

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
    const tiendas = await apiJson(`${API_URL}/comida/tiendas`);
    const contenedor = document.getElementById('tiendas-grid');
    if (!contenedor) return;

    contenedor.innerHTML = tiendas.map((t) => `
      <div class="tienda-card">
        <img
          src="${escapeHtml(t.imagen || IMG_DEFAULT)}"
          onerror="this.onerror=null;this.src='${IMG_DEFAULT}'"
          alt="${escapeHtml(t.nombre)}"
        >
        <div class="tienda-content">
          <h3 class="tienda-name">${escapeHtml(t.nombre)}</h3>
          <p class="tienda-description">${escapeHtml(t.descripcion || 'Comida preparada por emprendedores UThub')}</p>
          <a href="menu.html?id=${t.id}" class="btn-tienda">Ver Men?</a>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error cargando tiendas:', error);
  }
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
            <button class="btn-add-cart" onclick='addToCart(${JSON.stringify(p.nombre)}, ${Number(p.precio || 0)}, ${p.id})'>Agregar</button>
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
    document.title = `Men? - ${tienda.nombre || 'Tienda'} - UThub`;

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

    if (statusHours) {
      const horario = tienda.horario ? (typeof tienda.horario === 'string' ? tienda.horario : JSON.stringify(tienda.horario)) : 'Horario no configurado';
      statusHours.textContent = horario;
    }

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
  const total = cart.reduce((sum, i) => sum + Number(i.cantidad || 0), 0);
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
  if (countEl) countEl.textContent = `${cart.length} productos`;
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (deliveryEl) deliveryEl.textContent = `$${delivery.toFixed(2)}`;
  if (totalCheckoutEl) totalCheckoutEl.textContent = `$${total.toFixed(2)}`;
}

function loadCartItems() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    updateCartDisplay();
    return;
  }

  container.innerHTML = cart.map((item) => `
    <article class="cart-item">
      <div class="cart-item-emoji">???</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${escapeHtml(item.nombre)}</div>
        <div class="cart-item-tienda">${escapeHtml(item.tienda || tiendaActual || 'Tienda')}</div>
      </div>
      <div class="cart-item-quantity">
        <button class="qty-btn" type="button" onclick="decreaseCartItem(${item.id})">?</button>
        <div class="qty-value">${Number(item.cantidad || 0)}</div>
        <button class="qty-btn" type="button" onclick="increaseCartItem(${item.id})">+</button>
      </div>
      <div class="cart-item-price">$${(Number(item.precio || 0) * Number(item.cantidad || 0)).toFixed(2)}</div>
      <button class="cart-item-remove" type="button" title="Eliminar" onclick="removeCartItem(${item.id})">?</button>
    </article>
  `).join('');

  const totalItems = cart.reduce((sum, item) => sum + Number(item.cantidad || 0), 0);
  const label = document.getElementById('items-count-label');
  if (label) label.textContent = `${totalItems} producto${totalItems !== 1 ? 's' : ''}`;
  updateCartDisplay();
}

async function hacerPedido() {
  if (cart.length === 0) {
    alert('Tu carrito est? vac?o');
    return null;
  }

  const ubicacionSelect = document.getElementById('ubicacion-entrega');
  const ubicacionPrompt = ubicacionSelect ? ubicacionSelect.value : '';
  const ubicacion = ubicacionPrompt || prompt('?D?nde quieres recibir tu pedido? (ej: Sal?n B-201)');
  if (!ubicacion) return null;

  const instrucciones = document.getElementById('instrucciones')?.value || '';
  const token = getToken();

  if (!token) {
    alert('Necesitas iniciar sesi?n para hacer el pedido');
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
    alert('? Pedido realizado con ?xito');
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
    select.innerHTML = '<option value="">Selecciona una ubicaci?n</option>' + cartDeliveryPoints.map((point) => `
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
  status.textContent = `${point.nombre} ? ${point.detalle}`;
}

function updateDeliveryMap(point) {
  const container = document.getElementById('delivery-location-map');
  if (!container || !window.L) return;
  if (!point) {
    container.innerHTML = '';
    return;
  }

  const mapCenter = [point.lat, point.lng];
  if (!cartDeliveryMap) {
    cartDeliveryMap = L.map('delivery-location-map', { scrollWheelZoom: false }).setView(mapCenter, 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(cartDeliveryMap);
    cartDeliveryMarker = L.marker(mapCenter).addTo(cartDeliveryMap);
  } else {
    cartDeliveryMap.setView(mapCenter, 17);
    cartDeliveryMarker?.setLatLng(mapCenter);
  }

  cartDeliveryMarker?.bindPopup(`<strong>${escapeHtml(point.nombre)}</strong><br>${escapeHtml(point.detalle)}`).openPopup();
}

/* ============================================
   INIT HELPERS
   ============================================ */

function initMenuPage() {
  updateCartCount();
  updateCartDisplay();
}

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
window.procesarPedido = procesarPedido;
window.hacerPedido = hacerPedido;
window.initMenuPage = initMenuPage;
window.initCartDeliveryMap = initCartDeliveryMap;
window.updateDeliveryMapStatus = updateDeliveryMapStatus;
window.updateDeliveryMap = updateDeliveryMap;

console.log('? comida.js listo');

