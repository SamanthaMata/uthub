/* ============================================
   UTHUB - API CLIENT
   ============================================ */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Cliente HTTP para llamadas al API
 */
class UThubAPI {
  
  constructor() {
    this.baseURL = API_BASE_URL;
  }
  
  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${this.baseURL}${endpoint}?${queryString}` : `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });
      
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
      
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * DELETE request
   */
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Upload de archivos
   */
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Agregar datos adicionales
    for (let key in additionalData) {
      formData.append(key, additionalData[key]);
    }
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
          // No incluir Content-Type para FormData
        },
        body: formData
      });
      
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Obtener headers
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }
  
  /**
   * Obtener token de autenticación
   */
  getToken() {
    return localStorage.getItem('uthub_token');
  }
  
  /**
   * Manejar respuesta
   */
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      // Manejar errores específicos
      if (response.status === 401) {
        // Token expirado o inválido
        this.handleUnauthorized();
      }
      
      throw new Error(data.message || 'Error en la petición');
    }
    
    return data;
  }
  
  /**
   * Manejar errores
   */
  handleError(error) {
    console.error('API Error:', error);
    throw error;
  }
  
  /**
   * Manejar no autorizado
   */
  handleUnauthorized() {
    console.warn('Token expirado. Redirigiendo a login...');
    localStorage.removeItem('uthub_token');
    localStorage.removeItem('uthub_user');
    window.location.href = '/pages/auth/login.html';
  }
}

// Instancia global del API
const api = new UThubAPI();

/**
 * ENDPOINTS ESPECÍFICOS
 */

// ── AUTH ──
const authAPI = {
  login: (email, password, remember = false) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  resetPassword: (email) => 
    api.post('/auth/forgot-password', { email }),
  
  logout: () => {
    localStorage.removeItem('uthub_token');
    localStorage.removeItem('uthub_user');
    window.location.href = '/pages/auth/login.html';
  }
};

// ── COMIDA ──
const comidaAPI = {
  getTiendas: (filtros = {}) => 
    api.get('/comida/tiendas.php', filtros),
  
  getTienda: (id) => 
    api.get(`/comida/tiendas.php?id=${id}`),
  
  getProductos: (tiendaId) => 
    api.get(`/comida/productos.php?tienda_id=${tiendaId}`),
  
  getProducto: (id) => 
    api.get(`/comida/productos.php?id=${id}`),
  
  crearPedido: (pedidoData) => 
    api.post('/comida/pedidos.php', pedidoData),
  
  getMisPedidos: () => 
    api.get('/comida/pedidos.php?mis_pedidos=true'),
  
  actualizarEstadoPedido: (pedidoId, estado) => 
    api.put(`/comida/pedidos.php?id=${pedidoId}`, { estado })
};

// ── TUTORÍAS ──
const tutoriasAPI = {
  getTutores: (filtros = {}) => 
    api.get('/tutorias/tutores.php', filtros),
  
  getTutor: (id) => 
    api.get(`/tutorias/tutores.php?id=${id}`),
  
  crearReserva: (reservaData) => 
    api.post('/tutorias/reservas.php', reservaData),
  
  getMisReservas: () => 
    api.get('/tutorias/reservas.php?mis_reservas=true'),
  
  cancelarReserva: (reservaId) => 
    api.delete(`/tutorias/reservas.php?id=${reservaId}`)
};

// ── LIBROS ──
const librosAPI = {
  getLibros: (filtros = {}) => 
    api.get('/libros/libros.php', filtros),
  
  getLibro: (id) => 
    api.get(`/libros/libros.php?id=${id}`),
  
  publicarLibro: (libroData) => 
    api.post('/libros/libros.php', libroData),
  
  actualizarLibro: (libroId, libroData) => 
    api.put(`/libros/libros.php?id=${libroId}`, libroData),
  
  eliminarLibro: (libroId) => 
    api.delete(`/libros/libros.php?id=${libroId}`)
};

// ── SERVICIOS ──
const serviciosAPI = {
  getServicios: (filtros = {}) => 
    api.get('/servicios/servicios.php', filtros),
  
  getServicio: (id) => 
    api.get(`/servicios/servicios.php?id=${id}`),
  
  publicarServicio: (servicioData) => 
    api.post('/servicios/servicios.php', servicioData),
  
  actualizarServicio: (servicioId, servicioData) => 
    api.put(`/servicios/servicios.php?id=${servicioId}`, servicioData)
};

// ── BÚSQUEDA ──
const searchAPI = {
  buscarGlobal: (query) => 
    api.get('/search.php', { q: query }),
  
  buscarComida: (query, filtros = {}) => 
    api.get('/comida/search.php', { q: query, ...filtros }),
  
  buscarTutorias: (query, filtros = {}) => 
    api.get('/tutorias/search.php', { q: query, ...filtros }),
  
  buscarLibros: (query, filtros = {}) => 
    api.get('/libros/search.php', { q: query, ...filtros })
};

// ── USUARIO ──
const userAPI = {
  getPerfil: () => 
    api.get('/user/profile'),
  
  actualizarPerfil: (userData) => 
    api.put('/user/profile', userData),
};

// Exportar
window.UThubAPI = {
  api,
  auth: authAPI,
  comida: comidaAPI,
  tutorias: tutoriasAPI,
  libros: librosAPI,
  servicios: serviciosAPI,
  search: searchAPI,
  user: userAPI
};

console.log('✅ UThub API Client inicializado');
