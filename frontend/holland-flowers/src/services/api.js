import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://www.flowerskw.com/api/v1';

if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const TokenManager = {
  getAccessToken: () => localStorage.getItem('accessToken') || localStorage.getItem('adminToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('adminToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('adminUser');
  },
  getUser: () => {
    const user = localStorage.getItem('user') || localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    if (user.roleName === 'ADMIN' || user.roleName === 'SUPER_ADMIN') {
      localStorage.setItem('adminUser', JSON.stringify(user));
    }
  },
};

api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers['Accept-Language'] = localStorage.getItem('preferredLanguage') || 'en';
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          TokenManager.setTokens(accessToken, newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        TokenManager.clearTokens();
        window.dispatchEvent(new CustomEvent('authError', { detail: 'Session expired' }));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject({
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      errors: error.response?.data?.errors || [],
    });
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  requestOtp: (emailOrPhone) => api.post('/auth/otp/request', { emailOrPhone }),
  verifyOtp: (emailOrPhone, otp) => api.post('/auth/otp/verify', { emailOrPhone, otp }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
  toggleStatus: (id) => api.put(`/admin/categories/${id}/toggle-status`),
};

export const productsAPI = {
  getAll: (params) => api.get('/admin/products', { params }),
  getById: (id) => api.get(`/admin/products/${id}`),
  getBySku: (sku) => api.get(`/admin/products/sku/${sku}`),
  getByCategory: (categoryId, params) => api.get(`/admin/products/category/${categoryId}`, { params }),
  getLowStock: (threshold = 10) => api.get(`/admin/products/low-stock`, { params: { threshold } }),
  create: (data) => api.post('/admin/products', data),
  update: (id, data) => api.put(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),
  toggleStatus: (id) => api.put(`/admin/products/${id}/toggle-status`),
  updateStock: (id, data) => api.put(`/admin/products/${id}/stock`, data),
  getActive: (params) => api.get('/products', { params }),
  getFeatured: (limit = 8) => api.get(`/products/featured`, { params: { limit } }),
  getLatest: (limit = 8) => api.get(`/products/latest`, { params: { limit } }),
  getOnSale: (limit = 8) => api.get(`/products/on-sale`, { params: { limit } }),
  search: (keyword, params) => api.get('/products/search', { params: { keyword, ...params } }),
};

export const ordersAPI = {
  getAll: (params) => api.get('/admin/orders', { params }),
  getById: (id) => api.get(`/admin/orders/${id}`),
  updateStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  search: (keyword, params) => api.get('/admin/orders/search', { params: { keyword, ...params } }),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getMyOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
};

export const customersAPI = {
  getAll: (params = {}) => api.get('/admin/customers', { 
    params: { page: params.page || 0, size: params.size || 10, sort: params.sort || 'createdAt,desc' }
  }),
  getById: (customerId) => api.get(`/admin/customers/${customerId}`),
  search: (keyword, params = {}) => api.get('/admin/customers/search', {
    params: { keyword, page: params.page || 0, size: params.size || 10 }
  }),
  updateStatus: (customerId, isActive) => api.put(`/admin/customers/${customerId}/status`, { isActive }),
  getStats: () => api.get('/admin/customers/stats'),
};

export const usersAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  updateStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  updateRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
  search: (keyword, params) => api.get('/admin/users/search', { params: { keyword, ...params } }),
};

export const adminAPI = {
  getAll: (params) => api.get('/admin/admins', { params }),
  getById: (id) => api.get(`/admin/admins/${id}`),
  create: (data) => api.post('/admin/admins', data),
  update: (id, data) => api.put(`/admin/admins/${id}`, data),
  delete: (id) => api.delete(`/admin/admins/${id}`),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
};

export const profileAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/change-password', data),
  uploadProfileImage: (formData) => api.post('/user/profile/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadMultiple: (formData) => api.post('/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (url) => api.delete('/upload/image', { params: { url } }),
};

export default api;