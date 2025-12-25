/**
 * API Configuration - Holland Flowers
 * Axios instance with interceptors for authentication and error handling
 * 
 * PRODUCTION READY VERSION
 */

import axios from 'axios';

// ============================================
// API BASE URL CONFIGURATION
// ============================================
// In production, this will use the REACT_APP_API_URL from .env.production
// In development, it falls back to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// Log the API URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_BASE_URL);
}

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token management utilities
const TokenManager = {
  // Get access token - check both 'accessToken' and 'adminToken' for compatibility
  getAccessToken: () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('adminToken');
  },
  
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    // Also set adminToken for admin panel compatibility
    localStorage.setItem('adminToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
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
    // Also set adminUser for admin panel compatibility
    if (user.roleName === 'ADMIN' || user.roleName === 'SUPER_ADMIN') {
      localStorage.setItem('adminUser', JSON.stringify(user));
    }
  },
};

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add language header
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    config.headers['Accept-Language'] = lang;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Return the data directly if it's wrapped in ApiResponse
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          TokenManager.setTokens(accessToken, newRefreshToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        TokenManager.clearTokens();
        window.dispatchEvent(new CustomEvent('authError', { detail: 'Session expired' }));
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const errorResponse = {
      success: false,
      message: errorMessage,
      status: error.response?.status,
      errors: error.response?.data?.errors || [],
    };

    return Promise.reject(errorResponse);
  }
);

// ==================== API Services ====================

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  requestOtp: (emailOrPhone) => api.post('/auth/otp/request', { emailOrPhone }),
  verifyOtp: (emailOrPhone, otp) => api.post('/auth/otp/verify', { emailOrPhone, otp }),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
  toggleStatus: (id) => api.put(`/admin/categories/${id}/toggle-status`),
};

// Products API
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
  // Public endpoints
  getActive: (params) => api.get('/products', { params }),
  getFeatured: (limit = 8) => api.get(`/products/featured`, { params: { limit } }),
  getLatest: (limit = 8) => api.get(`/products/latest`, { params: { limit } }),
  getOnSale: (limit = 8) => api.get(`/products/on-sale`, { params: { limit } }),
  search: (keyword, params) => api.get('/products/search', { params: { keyword, ...params } }),
};

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/admin/orders', { params }),
  getById: (id) => api.get(`/admin/orders/${id}`),
  updateStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
  search: (keyword, params) => api.get('/admin/orders/search', { params: { keyword, ...params } }),
  // User orders
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getMyOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
};

// Customers API (Admin)
export const customersAPI = {
  // Get all customers with pagination
  getAll: (params = {}) => api.get('/admin/customers', { 
    params: {
      page: params.page || 0,
      size: params.size || 10,
      sort: params.sort || 'createdAt,desc'
    }
  }),
  
  // Get customer by ID with details
  getById: (customerId) => api.get(`/admin/customers/${customerId}`),
  
  // Search customers by name, email, or phone
  search: (keyword, params = {}) => api.get('/admin/customers/search', {
    params: {
      keyword,
      page: params.page || 0,
      size: params.size || 10
    }
  }),
  
  // Update customer status (activate/deactivate)
  updateStatus: (customerId, isActive) => api.put(`/admin/customers/${customerId}/status`, { isActive }),
  
  // Get customer statistics
  getStats: () => api.get('/admin/customers/stats'),
};

// Users API (Admin)
export const usersAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  updateStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  updateRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
  search: (keyword, params) => api.get('/admin/users/search', { params: { keyword, ...params } }),
};

// Admin Management API
export const adminAPI = {
  getAll: (params) => api.get('/admin/admins', { params }),
  getById: (id) => api.get(`/admin/admins/${id}`),
  create: (data) => api.post('/admin/admins', data),
  update: (id, data) => api.put(`/admin/admins/${id}`, data),
  delete: (id) => api.delete(`/admin/admins/${id}`),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
};

// User Profile API
export const profileAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/change-password', data),
  uploadProfileImage: (formData) => api.post('/user/profile/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// File Upload API
export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadMultiple: (formData) => api.post('/upload/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (url) => api.delete('/upload/image', { params: { url } }),
};

// Export utilities
export { api, TokenManager, API_BASE_URL };
export default api;