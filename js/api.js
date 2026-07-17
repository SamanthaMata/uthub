/* ============================================
   UTHUB - API CLIENT
   Backend actual: Render + Alwaysdata
   ============================================ */

const API_BASE_URL = window.UTHUB_CONFIG?.API_BASE_URL || 'https://uthub.onrender.com/api';

function unsupportedFeature(name) {
  throw new Error(`${name} aun no esta conectado al backend.`);
}

/**
 * Cliente HTTP para llamadas al API
 */
class UThubAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

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

  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);

    for (const key in additionalData) {
      formData.append(key, additionalData[key]);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getToken()}`
        },
        body: formData
      });

      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  getToken() {
    return localStorage.getItem('uthub_token');
  }

  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        this.handleUnauthorized();
      }

      throw new Error(data.message || data.error || 'Error en la peticion');
    }

    return data;
  }

  handleError(error) {
    console.error('API Error:', error);
    throw error;
  }

  handleUnauthorized() {
    localStorage.removeItem('uthub_token');
    localStorage.removeItem('uthub_user');
    window.location.href = '/pages/auth/login.html';
  }
}

const api = new UThubAPI();

const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  resetPassword: (email) => api.post('/auth/forgot-password', { email }),
  logout: () => {
    localStorage.removeItem('uthub_token');
    localStorage.removeItem('uthub_user');
    window.location.href = '/pages/auth/login.html';
  }
};

const comidaAPI = {
  getTiendas: (filtros = {}) => api.get('/comida/tiendas', filtros),
  getTienda: (id) => api.get(`/comida/tienda/${id}`),
  getProductos: (tiendaId) => api.get(`/comida/productos/${tiendaId}`),
  getProducto: () => unsupportedFeature('Producto individual'),
  crearPedido: (pedidoData) => api.post('/comida/pedido', pedidoData),
  getMisPedidos: () => unsupportedFeature('Mis pedidos'),
  actualizarEstadoPedido: () => unsupportedFeature('Actualizar estado de pedido')
};

const tutoriasAPI = {
  getTutores: () => unsupportedFeature('Tutorias'),
  getTutor: () => unsupportedFeature('Tutorias'),
  crearReserva: () => unsupportedFeature('Tutorias'),
  getMisReservas: () => unsupportedFeature('Tutorias'),
  cancelarReserva: () => unsupportedFeature('Tutorias')
};

const librosAPI = {
  getLibros: () => unsupportedFeature('Libros'),
  getLibro: () => unsupportedFeature('Libros'),
  publicarLibro: () => unsupportedFeature('Libros'),
  actualizarLibro: () => unsupportedFeature('Libros'),
  eliminarLibro: () => unsupportedFeature('Libros')
};

const serviciosAPI = {
  getServicios: () => unsupportedFeature('Servicios'),
  getServicio: () => unsupportedFeature('Servicios'),
  publicarServicio: () => unsupportedFeature('Servicios'),
  actualizarServicio: () => unsupportedFeature('Servicios')
};

const searchAPI = {
  buscarGlobal: () => unsupportedFeature('Busqueda global'),
  buscarComida: () => unsupportedFeature('Busqueda de comida'),
  buscarTutorias: () => unsupportedFeature('Busqueda de tutorias'),
  buscarLibros: () => unsupportedFeature('Busqueda de libros')
};

const userAPI = {
  getPerfil: () => api.get('/user/profile'),
  actualizarPerfil: () => unsupportedFeature('Actualizar perfil')
};

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

console.log('UThub API Client inicializado');

