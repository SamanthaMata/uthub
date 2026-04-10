/* ============================================
   UTHUB - MÓDULO DE COMIDA
   ============================================ */

// Carrito (guardar en localStorage)
let cart = JSON.parse(localStorage.getItem('uthub_cart')) || [];

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
      tienda: 'Tacos El Profe' // En producción, esto vendría dinámicamente
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

// Estilos para toast
const toastStyles = document.createElement('style');
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
window.initMenuPage = initMenuPage;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.loadCartItems = loadCartItems;
window.procesarPedido = procesarPedido;
window.clearFilters = clearFilters;
window.updateCartDisplay = updateCartDisplay;

console.log('✅ Módulo de Comida inicializado');
