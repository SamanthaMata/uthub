/* ============================================
   UTHUB - MÓDULO DE COMIDA
   ============================================ */

// Carrito (guardar en localStorage)
let cart = JSON.parse(localStorage.getItem('uthub_cart')) || [];
let tiendaActual = '';

/**
 * INICIALIZAR PÁGINA DE TIENDAS
 */
function initTiendasPage() {
  const searchInput = document.getElementById('tiendas-search');
  const filterTipo = document.getElementById('filter-tipo');
  const filterEdificio = document.getElementById('filter-edificio');
  const filterPrecio = document.getElementById('filter-precio');
  const filterCalificacion = document.getElementById('filter-calificacion');
  
  // Búsqueda
  if (searchInput) {
    searchInput.addEventListener('input', filterTiendas);
  }
  
  // Filtros
  [filterTipo, filterEdificio, filterPrecio, filterCalificacion].forEach(filter => {
    if (filter) {
      filter.addEventListener('change', filterTiendas);
    }
  });
  
  // Actualizar contador del carrito
  updateCartCount();
}

/**
 * FILTRAR TIENDAS
 */
function filterTiendas() {
  const searchValue = document.getElementById('tiendas-search')?.value.toLowerCase() || '';
  const tipoValue = document.getElementById('filter-tipo')?.value || '';
  const edificioValue = document.getElementById('filter-edificio')?.value || '';
  const calificacionValue = parseFloat(document.getElementById('filter-calificacion')?.value) || 0;
  
  const tiendas = document.querySelectorAll('.tienda-card');
  let visibleCount = 0;
  
  tiendas.forEach(tienda => {
    const tipo = tienda.getAttribute('data-tipo');
    const edificio = tienda.getAttribute('data-edificio');
    const calificacion = parseFloat(tienda.getAttribute('data-calificacion'));
    const nombre = tienda.querySelector('.tienda-name')?.textContent.toLowerCase() || '';
    const descripcion = tienda.querySelector('.tienda-description')?.textContent.toLowerCase() || '';
    
    // Aplicar filtros
    const matchesSearch = nombre.includes(searchValue) || descripcion.includes(searchValue);
    const matchesTipo = !tipoValue || tipo === tipoValue;
    const matchesEdificio = !edificioValue || edificio === edificioValue;
    const matchesCalificacion = !calificacionValue || calificacion >= calificacionValue;
    
    if (matchesSearch && matchesTipo && matchesEdificio && matchesCalificacion) {
      tienda.style.display = 'block';
      visibleCount++;
    } else {
      tienda.style.display = 'none';
    }
  });
  
  // Mostrar empty state si no hay resultados
  const emptyState = document.getElementById('empty-state');
  const tiendasGrid = document.getElementById('tiendas-grid');
  
  if (visibleCount === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (tiendasGrid) tiendasGrid.style.display = 'none';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    if (tiendasGrid) tiendasGrid.style.display = 'grid';
  }
}

/**
 * LIMPIAR FILTROS
 */
function clearFilters() {
  document.getElementById('tiendas-search').value = '';
  document.getElementById('filter-tipo').value = '';
  document.getElementById('filter-edificio').value = '';
  document.getElementById('filter-precio').value = '';
  document.getElementById('filter-calificacion').value = '';
  filterTiendas();
}

/**
 * INICIALIZAR PÁGINA DE MENÚ
 */
function initMenuPage() {
  // Scroll smooth a categorías
  const categoryLinks = document.querySelectorAll('.category-link');
  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Actualizar active
        categoryLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  });
  
  // Actualizar contador del carrito
  updateCartCount();
}

/**
 * AGREGAR AL CARRITO
 */
function addToCart(nombre, precio, id) {
  // Verificar si ya existe en el carrito
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.cantidad++;
  } else {
    cart.push({
      id: id,
      nombre: nombre,
      precio: precio,
      cantidad: 1,
      tienda: tiendaActual
    });
  }
  
  // Guardar en localStorage
  localStorage.setItem('uthub_cart', JSON.stringify(cart));
  
  // Actualizar UI
  updateCartCount();
  updateCartDisplay();
  showCartFloat();
  
  // Mostrar feedback
  showToast(`${nombre} agregado al carrito`, 'success');
}

/**
 * ACTUALIZAR CONTADOR DEL CARRITO
 */
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

/**
 * ACTUALIZAR DISPLAY DEL CARRITO
 */
function updateCartDisplay() {
  const cartFloat = document.getElementById('cart-float');
  const cartFloatCount = document.getElementById('cart-float-count');
  const cartFloatTotal = document.getElementById('cart-float-total');
  
  if (cart.length > 0) {
    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    if (cartFloatCount) cartFloatCount.textContent = `${totalItems} producto${totalItems > 1 ? 's' : ''}`;
    if (cartFloatTotal) cartFloatTotal.textContent = `$${totalPrice}`;
  }
}

/**
 * MOSTRAR CARRITO FLOTANTE
 */
function showCartFloat() {
  const cartFloat = document.getElementById('cart-float');
  if (cartFloat && cart.length > 0) {
    cartFloat.style.display = 'block';
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      // cartFloat.style.display = 'none';
    }, 5000);
  }
}

/**
 * REMOVER DEL CARRITO
 */
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('uthub_cart', JSON.stringify(cart));
  
  // Recargar página de carrito
  if (window.location.pathname.includes('carrito.html')) {
    loadCartItems();
  }
  
  updateCartCount();
  showToast('Producto eliminado del carrito', 'info');
}

/**
 * ACTUALIZAR CANTIDAD
 */
function updateQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  
  if (item) {
    item.cantidad += change;
    
    if (item.cantidad <= 0) {
      removeFromCart(id);
      return;
    }
    
    localStorage.setItem('uthub_cart', JSON.stringify(cart));
    
    // Recargar página de carrito
    if (window.location.pathname.includes('carrito.html')) {
      loadCartItems();
    }
    
    updateCartCount();
  }
}

/**
 * CARGAR ITEMS DEL CARRITO (para página carrito.html)
 */
function loadCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartEmpty = document.getElementById('cart-empty');
  const cartSummary = document.getElementById('cart-summary');
  
  if (cart.length === 0) {
    if (cartEmpty) cartEmpty.style.display = 'block';
    if (cartItemsContainer) cartItemsContainer.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'none';
    return;
  }
  
  if (cartEmpty) cartEmpty.style.display = 'none';
  if (cartItemsContainer) cartItemsContainer.style.display = 'block';
  if (cartSummary) cartSummary.style.display = 'block';
  
  // Generar HTML de items
  if (cartItemsContainer) {
    const html = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h3 class="cart-item-name">${item.nombre}</h3>
          <p class="cart-item-tienda">${item.tienda}</p>
        </div>
        <div class="cart-item-quantity">
          <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
          <span class="qty-value">${item.cantidad}</span>
          <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
        </div>
        <div class="cart-item-price">$${item.precio * item.cantidad}</div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `).join('');
    
    cartItemsContainer.innerHTML = html;
  }
  
  // Actualizar resumen
  updateCartSummary();
}

/**
 * ACTUALIZAR RESUMEN DEL CARRITO
 */
function updateCartSummary() {
  const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const delivery = 10; // Cargo fijo de delivery
  const total = subtotal + delivery;
  
  const subtotalEl = document.getElementById('cart-subtotal');
  const deliveryEl = document.getElementById('cart-delivery');
  const totalEl = document.getElementById('cart-total');
  
  if (subtotalEl) subtotalEl.textContent = `$${subtotal}`;
  if (deliveryEl) deliveryEl.textContent = `$${delivery}`;
  if (totalEl) totalEl.textContent = `$${total}`;
}

/**
 * PROCESAR PEDIDO
 */
function procesarPedido() {
  if (cart.length === 0) {
    showToast('Tu carrito está vacío', 'error');
    return;
  }
  
  const ubicacion = document.getElementById('ubicacion-entrega')?.value;
  const instrucciones = document.getElementById('instrucciones')?.value;
  
  if (!ubicacion) {
    showToast('Selecciona un punto de entrega', 'error');
    return;
  }
  
  // Simular procesamiento
  showToast('Procesando pedido...', 'info');
  
  setTimeout(() => {
    // Guardar pedido en localStorage
    const pedidos = JSON.parse(localStorage.getItem('uthub_pedidos')) || [];
    
    const nuevoPedido = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      items: cart,
      ubicacion: ubicacion,
      instrucciones: instrucciones,
      total: cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) + 10,
      estado: 'confirmado'
    };
    
    pedidos.push(nuevoPedido);
    localStorage.setItem('uthub_pedidos', JSON.stringify(pedidos));
    
    // Limpiar carrito
    cart = [];
    localStorage.setItem('uthub_cart', JSON.stringify(cart));
    
    // Redirigir a pedidos
    showToast('¡Pedido realizado con éxito!', 'success');
    
    setTimeout(() => {
      window.location.href = 'pedidos.html';
    }, 1500);
  }, 1000);
}

/**
 * MOSTRAR TOAST NOTIFICATION
 */
function showToast(message, type = 'info') {
  // Remover toast anterior si existe
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Crear toast
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Animar entrada
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
const API_URL = 'http://localhost:3000/api';
// 🏪 Obtener una tienda por ID
router.get('/tienda/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM tiendas WHERE id = ?',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tienda' });
  }
});

async function cargarTiendas() {
  try {
    const res = await fetch(`${API_URL}/comida/tiendas`);
    const tiendas = await res.json();

    const contenedor = document.getElementById('tiendas-grid');

    if (!contenedor) return;

    contenedor.innerHTML = tiendas.map(t => `
  <div class="tienda-card">

    <div class="tienda-image">
      <img src="${t.imagen || 'https://via.placeholder.com/400'}">
    </div>

    <div class="tienda-content">
      <h3 class="tienda-name">${t.nombre}</h3>
      <p class="tienda-description">${t.descripcion}</p>

      <a href="menu.html?id=${t.id}" class="btn-tienda">
        Ver Menú
      </a>
    </div>

  </div>
`).join('');

  } catch (error) {
    console.error('Error cargando tiendas:', error);
  }
}
async function cargarProductos() {
  try {
    const params = new URLSearchParams(window.location.search);
    const tiendaId = params.get('id');

    if (!tiendaId) return;

    const res = await fetch(`${API_URL}/comida/productos/${tiendaId}`);
    const productos = await res.json();

    const contenedor = document.getElementById('productos-container');

    if (!contenedor) return;

    contenedor.innerHTML = productos.map(p => `
  <div class="producto-card">
    
    <div class="producto-image">
      <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop" alt="${p.nombre}">
      <div class="producto-badge">Popular</div>
    </div>

    <div class="producto-content">
      <h3 class="producto-name">${p.nombre}</h3>
      <p class="producto-description">${p.descripcion || 'Delicioso producto disponible'}</p>

      <div class="producto-footer">
        <div class="producto-price">$${p.precio}</div>

        <button class="btn-add-cart" onclick="addToCart('${p.nombre}', ${p.precio}, ${p.id})">
          Agregar
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

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

    const res = await fetch(`${API_URL}/comida/tienda/${tiendaId}`);
    const tienda = await res.json();

    // 👉 guardar nombre para carrito
    tiendaActual = tienda.nombre;

    // 🧠 NOMBRE
    const nombreEl = document.querySelector('.tienda-detail-name');
    if (nombreEl) nombreEl.textContent = tienda.nombre;

    // 🧠 DESCRIPCIÓN
    const descEl = document.querySelector('.tienda-detail-description');
    if (descEl) descEl.textContent = tienda.descripcion;

    // 🧠 BREADCRUMB
    const breadcrumb = document.querySelector('.breadcrumb-item.active');
    if (breadcrumb) breadcrumb.textContent = tienda.nombre;

    // 🧠 IMAGEN (usa una default si no tienes en BD)
    const banner = document.querySelector('.tienda-detail-banner');
    if (banner) {
      banner.innerHTML = `
        <img src="${tienda.imagen || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200'}" alt="${tienda.nombre}">
      `;
    }

    // 🧠 LOGO (emoji simple)
    const logo = document.querySelector('.tienda-logo');
    if (logo) {
      logo.textContent = tienda.logo || '🍔';
    }

    // 🧠 RATING (fake por ahora si no tienes en BD)
    const rating = document.querySelector('.rating-value');
    if (rating) rating.textContent = tienda.rating || '4.5';

    const stars = document.querySelector('.stars');
    if (stars) stars.textContent = '★★★★★';

    const reviews = document.querySelector('.rating-count');
    if (reviews) reviews.textContent = '(50 reseñas)';

    // 🧠 META
    const metas = document.querySelectorAll('.meta-text');
    if (metas[0]) metas[0].textContent = tienda.tipo || 'Comida';
    if (metas[1]) metas[1].textContent = tienda.ubicacion || 'UT';

    // 🧠 STATUS
    const status = document.querySelector('.status-dot');
    if (status) status.style.background = 'green';

    const hours = document.querySelector('.status-hours');
    if (hours) hours.textContent = tienda.horario || '9:00 AM - 6:00 PM';

  } catch (error) {
    console.error('Error cargando tienda:', error);
  }
}

// Estilos para toast
if (!document.getElementById('toast-styles')) {
  const toastStyles = document.createElement('style');
  toastStyles.id = 'toast-styles';
  toastStyles.textContent = `...`;
  document.head.appendChild(toastStyles);
}

toastStyles.textContent = `
  .toast-notification {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--ut-dark);
    color: white;
    padding: 14px 24px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
  
  .toast-notification.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  
  .toast-success {
    background: #22C55E;
  }
  
  .toast-error {
    background: #FF4F5E;
  }
  
  .toast-info {
    background: #60A5FA;
  }
`;
document.head.appendChild(toastStyles);

// Exportar funciones
window.initTiendasPage = initTiendasPage;
window.cargarProductos = cargarProductos;
window.cargarTiendas = cargarTiendas;
window.initMenuPage = initMenuPage;
window.cargarInfoTienda = cargarInfoTienda;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.loadCartItems = loadCartItems;
window.procesarPedido = procesarPedido;
window.clearFilters = clearFilters;
window.updateCartDisplay = updateCartDisplay;

console.log('✅ Módulo de Comida inicializado');

