/* ============================================
   UTHUB - MÓDULO DE COMIDA (FRONTEND)
   ============================================ */

const API_URL = window.UTHUB_CONFIG?.API_BASE_URL || 'https://uthub.onrender.com/api';

// 🛒 carrito
let cart = JSON.parse(localStorage.getItem('uthub_cart')) || [];
let tiendaActual = '';
const IMG_DEFAULT = 'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

/* ============================================
   🏪 TIENDAS
   ============================================ */

async function cargarTiendas() {
  try {
    const res = await fetch(`${API_URL}/comida/tiendas`);
    const tiendas = await res.json();

    const contenedor = document.getElementById('tiendas-grid');
    if (!contenedor) return;

    contenedor.innerHTML = tiendas.map(t => `
      <div class="tienda-card">
        <img 
          src="${t.imagen || IMG_DEFAULT}"
          onerror="this.onerror=null;this.src='${IMG_DEFAULT}'"
        >

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

/* ============================================
   🍔 PRODUCTOS
   ============================================ */

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
          <img 
            src="${p.imagen || IMG_DEFAULT}"
            onerror="this.onerror=null;this.src='${IMG_DEFAULT}'"
          >
          <div class="producto-badge">Popular</div>
        </div>

        <div class="producto-content">
          <h3 class="producto-name">${p.nombre}</h3>
          <p class="producto-description">
            ${p.descripcion || 'Delicioso producto disponible'}
          </p>

          <div class="producto-footer">
            <div class="producto-price">$${p.precio}</div>

            <button class="btn-add-cart"
              onclick="addToCart('${p.nombre}', ${p.precio}, ${p.id})">
              Agregar
            </button>
          </div>
        </div>

      </div>
    `).join('');

  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

/* ============================================
   🏪 INFO DE TIENDA
   ============================================ */

async function cargarInfoTienda() {
  try {
    const params = new URLSearchParams(window.location.search);
    const tiendaId = params.get('id');

    if (!tiendaId) return;

    const res = await fetch(`${API_URL}/comida/tienda/${tiendaId}`);
    const tienda = await res.json();

    tiendaActual = tienda.nombre;

    // nombre
    document.querySelector('.tienda-detail-name').textContent = tienda.nombre;

    // descripcion
    document.querySelector('.tienda-detail-description').textContent = tienda.descripcion;

    // breadcrumb
    document.querySelector('.breadcrumb-item.active').textContent = tienda.nombre;

    // titulo pestaña
    document.title = `Menú - ${tienda.nombre} - UThub`;

    // imagen
    document.querySelector('.tienda-detail-banner').innerHTML = `
    <img 
      src="${tienda.imagen || IMG_DEFAULT}"
      onerror="this.onerror=null;this.src='${IMG_DEFAULT}'"
    >
    `;

  } catch (error) {
    console.error('Error cargando tienda:', error);
  }
}

/* ============================================
   ➕ CREAR TIENDA
   ============================================ */

async function crearTienda() {
  const nombre = document.getElementById('nombre').value;
  const descripcion = document.getElementById('descripcion').value;
  const imagen = document.getElementById('imagen').value;

  const res = await fetch(`${API_URL}/comida/tienda`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nombre, descripcion, imagen })
  });

  const data = await res.json();
  console.log(data);

  alert('Tienda creada');
}

async function hacerPedido() {
  try {
    if (cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    const ubicacion = prompt('¿Dónde quieres recibir tu pedido? (ej: Salón B-201)');
    if (!ubicacion) return;

    const token = localStorage.getItem('uthub_token');

    const res = await fetch(`${API_URL}/comida/pedido`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart,
        ubicacion
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Error al hacer pedido');
      return;
    }

    // 🔥 limpiar carrito
    cart = [];
    localStorage.removeItem('uthub_cart');
    updateCartCount();
    updateCartDisplay();

    alert('✅ Pedido realizado con éxito');

  } catch (error) {
    console.error('Error:', error);
    alert('Error al enviar pedido');
  }
}

/* ============================================
   ➕ CREAR PRODUCTO
   ============================================ */

async function crearProducto() {
  const nombre = document.getElementById('prod-nombre').value;
  const precio = document.getElementById('prod-precio').value;
  const descripcion = document.getElementById('prod-desc').value;
  const imagen = document.getElementById('prod-img').value;
  const tienda_id = document.getElementById('tienda-id').value;

  const res = await fetch(`${API_URL}/comida/producto`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nombre,
      precio,
      descripcion,
      imagen,
      tienda_id
    })
  });

  const data = await res.json();
  console.log(data);

  alert('Producto creado');
}

/* ============================================
   🛒 CARRITO
   ============================================ */

function addToCart(nombre, precio, id) {
  const item = cart.find(i => i.id === id);

  if (item) {
    item.cantidad++;
  } else {
    cart.push({
      id,
      nombre,
      precio,
      cantidad: 1,
      tienda: tiendaActual
    });
  }

  localStorage.setItem('uthub_cart', JSON.stringify(cart));
  updateCartCount();
  updateCartDisplay();
}

function updateCartCount() {
  const el = document.getElementById('cart-count');
  if (!el) return;

  const total = cart.reduce((sum, i) => sum + i.cantidad, 0);
  el.textContent = total;
}

function updateCartDisplay() {
  const total = cart.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);

  const totalEl = document.getElementById('cart-float-total');
  const countEl = document.getElementById('cart-float-count');

  if (totalEl) totalEl.textContent = `$${total}`;
  if (countEl) countEl.textContent = `${cart.length} productos`;
}

/* ============================================
   🚀 INIT
   ============================================ */

window.cargarTiendas = cargarTiendas;
window.cargarProductos = cargarProductos;
window.cargarInfoTienda = cargarInfoTienda;
window.crearTienda = crearTienda;
window.crearProducto = crearProducto;
window.addToCart = addToCart;
window.updateCartDisplay = updateCartDisplay;

console.log('✅ comida.js listo');

