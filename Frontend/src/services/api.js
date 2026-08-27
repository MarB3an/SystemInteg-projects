import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to every outgoing request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('app_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials and notify application
      localStorage.removeItem('app_token');
      localStorage.removeItem('app_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Authentication Service
export const authService = {
  // POST /api/auth/register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // POST /api/auth/login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // GET /api/users
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // GET /api/home
  getHome: async () => {
    const response = await api.get('/home');
    return response.data;
  },
};

// Service Request Module API
export const requestService = {
  // GET /api/requests - Get all requests for authenticated user
  getAll: async () => {
    const response = await api.get('/requests');
    return response.data;
  },

  // GET /api/requests/:id - Get specific request by ID
  getById: async (id) => {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  // POST /api/requests - Create new request
  create: async (requestData) => {
    const response = await api.post('/requests', requestData);
    return response.data;
  },

  // PUT /api/requests/:id - Update existing request
  update: async (id, requestData) => {
    const response = await api.put(`/requests/${id}`, requestData);
    return response.data;
  },

  // DELETE /api/requests/:id - Delete request
  delete: async (id) => {
    const response = await api.delete(`/requests/${id}`);
    return response.data;
  },
};

export default api;
