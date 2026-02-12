// ============================================
// API SERVICE - Holland Flowers Admin Portal
// Connected to Spring Boot Backend
// PRODUCTION READY VERSION
// ============================================

// ============================================
// API BASE URL CONFIGURATION
// ============================================
// Production URL as default - change localhost for local development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://www.flowerskw.com/api/v1';

// Log the API URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Admin API Base URL:', API_BASE_URL);
}

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
};

// ============================================
// AUTHENTICATION
// ============================================
export const authAPI = {
  login: async (email, password) => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.data) {
      localStorage.setItem('adminToken', response.data.accessToken);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
    }
    
    return response;
  },
  
  logout: async () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('adminUser');
    return { success: true };
  },
  
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return apiCall('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },
  
  isAdmin: () => {
    const user = authAPI.getCurrentUser();
    return user && (user.roleName === 'ADMIN' || user.roleName === 'SUPER_ADMIN');
  },

  isSuperAdmin: () => {
    const user = authAPI.getCurrentUser();
    return user && user.roleName === 'SUPER_ADMIN';
  },

  getUserRole: () => {
    const user = authAPI.getCurrentUser();
    return user ? user.roleName : null;
  },

  hasPermission: (permission) => {
    const user = authAPI.getCurrentUser();
    if (!user) return false;
    
    if (user.roleName === 'SUPER_ADMIN') return true;
    
    const adminViewPermissions = [
      'view_products',
      'view_categories',
      'view_orders',
      'view_customers',
      'view_dashboard',
      'update_delivery_status'  // Admin can now update delivery status
    ];
    
    return user.roleName === 'ADMIN' && adminViewPermissions.includes(permission);
  },

  canWrite: () => {
    return authAPI.isSuperAdmin();
  },

  // New: Both Admin and Super Admin can update delivery status
  canUpdateDeliveryStatus: () => {
    return authAPI.isAdmin(); // Returns true for both ADMIN and SUPER_ADMIN
  },

  canManageAdmins: () => {
    return authAPI.isSuperAdmin();
  },
};

// ============================================
// PRODUCTS
// ============================================
export const productsAPI = {
  getAll: async (params = {}) => {
    const { page = 0, size = 10, sort = 'createdAt,desc' } = params;
    return apiCall(`/admin/products?page=${page}&size=${size}&sort=${sort}`);
  },
  
  search: async (params = {}) => {
    const { 
      keyword, 
      categoryId, 
      minPrice, 
      maxPrice, 
      inStock, 
      isFeatured, 
      isNewArrival, 
      isBestSeller,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 0, 
      size = 10 
    } = params;
    
    const queryParams = new URLSearchParams();
    if (keyword) queryParams.append('keyword', keyword);
    if (categoryId) queryParams.append('categoryId', categoryId);
    if (minPrice !== undefined) queryParams.append('minPrice', minPrice);
    if (maxPrice !== undefined) queryParams.append('maxPrice', maxPrice);
    if (inStock !== undefined) queryParams.append('inStock', inStock);
    if (isFeatured !== undefined) queryParams.append('isFeatured', isFeatured);
    if (isNewArrival !== undefined) queryParams.append('isNewArrival', isNewArrival);
    if (isBestSeller !== undefined) queryParams.append('isBestSeller', isBestSeller);
    if (isActive !== undefined) queryParams.append('isActive', isActive);
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);
    queryParams.append('page', page);
    queryParams.append('size', size);
    
    return apiCall(`/admin/products/search?${queryParams.toString()}`);
  },
  
  getById: async (id) => {
    return apiCall(`/admin/products/${id}`);
  },
  
  getBySku: async (sku) => {
    return apiCall(`/admin/products/sku/${sku}`);
  },
  
  getByCategory: async (categoryId, params = {}) => {
    const { page = 0, size = 10, sort = 'createdAt,desc' } = params;
    return apiCall(`/admin/products/category/${categoryId}?page=${page}&size=${size}&sort=${sort}`);
  },
  
  getLowStock: async (threshold = 10) => {
    return apiCall(`/admin/products/low-stock?threshold=${threshold}`);
  },
  
  create: async (productData) => {
    return apiCall('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },
  
  update: async (id, productData) => {
    return apiCall(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },
  
  delete: async (id) => {
    return apiCall(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },
  
  toggleStatus: async (id) => {
    return apiCall(`/admin/products/${id}/toggle-status`, {
      method: 'PUT',
    });
  },
  
  toggleFeatured: async (id) => {
    return apiCall(`/admin/products/${id}/toggle-featured`, {
      method: 'PUT',
    });
  },
  
  toggleNewArrival: async (id) => {
    return apiCall(`/admin/products/${id}/toggle-new-arrival`, {
      method: 'PUT',
    });
  },
  
  toggleBestSeller: async (id) => {
    return apiCall(`/admin/products/${id}/toggle-best-seller`, {
      method: 'PUT',
    });
  },
  
  updateStock: async (id, quantity, operation = 'SET') => {
    return apiCall(`/admin/products/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, operation }),
    });
  },
};

// ============================================
// ORDERS
// ============================================
export const ordersAPI = {
  getAll: async (params = {}) => {
    const { page = 0, size = 10, sort = 'createdAt,desc' } = params;
    return apiCall(`/admin/orders?page=${page}&size=${size}&sort=${sort}`);
  },
  
  getById: async (id) => {
    return apiCall(`/admin/orders/${id}`);
  },
  
  getByDeliveryStatus: async (status, params = {}) => {
    const { page = 0, size = 10 } = params;
    return apiCall(`/admin/orders/delivery-status/${status}?page=${page}&size=${size}`);
  },
  
  getByDateRange: async (startDate, endDate, params = {}) => {
    const { page = 0, size = 10 } = params;
    return apiCall(`/admin/orders/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`);
  },
  
  updateDeliveryStatus: async (id, deliveryStatus) => {
    return apiCall(`/admin/orders/${id}/delivery-status`, {
      method: 'PUT',
      body: JSON.stringify({ deliveryStatus }),
    });
  },
  
  getStatistics: async () => {
    return apiCall('/admin/orders/statistics');
  },
};

// ============================================
// CUSTOMERS
// ============================================
export const customersAPI = {
  getAll: async (params = {}) => {
    const { page = 0, size = 10, sort = 'createdAt,desc' } = params;
    return apiCall(`/admin/customers?page=${page}&size=${size}&sort=${sort}`);
  },
  
  getById: async (id) => {
    return apiCall(`/admin/customers/${id}`);
  },
  
  search: async (keyword, params = {}) => {
    const { page = 0, size = 10 } = params;
    return apiCall(`/admin/customers/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
  },
  
  updateStatus: async (id, isActive) => {
    return apiCall(`/admin/customers/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },
  
  getStats: async () => {
    return apiCall('/admin/customers/stats');
  },
};

// ============================================
// USERS (Admin management of all users)
// ============================================
export const usersAPI = {
  getAll: async (params = {}) => {
    const { page = 0, size = 10 } = params;
    return apiCall(`/admin/users?page=${page}&size=${size}`);
  },
  
  getById: async (id) => {
    return apiCall(`/admin/users/${id}`);
  },
  
  getByRole: async (roleId, params = {}) => {
    const { page = 0, size = 10 } = params;
    return apiCall(`/admin/users/role/${roleId}?page=${page}&size=${size}`);
  },
  
  search: async (keyword, params = {}) => {
    const { page = 0, size = 10 } = params;
    return apiCall(`/admin/users/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
  },
  
  updateStatus: async (id, isActive) => {
    return apiCall(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
  },
  
  updateRole: async (id, roleName) => {
    return apiCall(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ roleName }),
    });
  },
};

// ============================================
// CATEGORIES
// ============================================
export const categoriesAPI = {
  getAll: async () => {
    return apiCall('/admin/categories');
  },
  
  getById: async (id) => {
    return apiCall(`/categories/${id}`);
  },
  
  search: async (keyword, params = {}) => {
    const { page = 0, size = 10 } = params;
    return apiCall(`/admin/categories/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
  },
  
  create: async (categoryData) => {
    return apiCall('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },
  
  update: async (id, categoryData) => {
    return apiCall(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },
  
  delete: async (id) => {
    return apiCall(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  },
  
  toggleStatus: async (id) => {
    return apiCall(`/admin/categories/${id}/toggle-status`, {
      method: 'PUT',
    });
  },
};

// ============================================
// SETTINGS / ADMIN USERS
// ============================================
export const settingsAPI = {
  getAdmins: async (params = {}) => {
    const { page = 0, size = 10 } = params;
    return apiCall(`/admin/admins?page=${page}&size=${size}`);
  },
  
  getAdminById: async (id) => {
    return apiCall(`/admin/admins/${id}`);
  },
  
  createAdmin: async (adminData) => {
    return apiCall('/admin/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  },
  
  updateAdmin: async (id, adminData) => {
    return apiCall(`/admin/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(adminData),
    });
  },
  
  deleteAdmin: async (id) => {
    return apiCall(`/admin/admins/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// DASHBOARD
// ============================================
export const dashboardAPI = {
  getStats: async () => {
    return apiCall('/admin/dashboard/statistics');
  },
  
  getOrderStats: async () => {
    return apiCall('/admin/orders/statistics');
  },
  
  getRecentOrders: async (limit = 5) => {
    return apiCall(`/admin/orders?page=0&size=${limit}&sort=createdAt,desc`);
  },
  
  getLowStockProducts: async (threshold = 10) => {
    return apiCall(`/admin/products/low-stock?threshold=${threshold}`);
  },
};

// ============================================
// FILE UPLOAD
// ============================================
export const uploadAPI = {
  uploadProductImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('adminToken');
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://www.flowerskw.com/api/v1';
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/upload/product-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      return data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  },
  
  uploadCategoryImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('adminToken');
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://www.flowerskw.com/api/v1';
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/upload/category-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      return data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  },
};

// ============================================
// CONSTANTS
// ============================================
export const DELIVERY_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  EXPIRED: 'EXPIRED',
  ON_HOLD: 'ON_HOLD',
};

export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

// ============================================
// DEFAULT EXPORT
// ============================================
const api = {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  customers: customersAPI,
  users: usersAPI,
  categories: categoriesAPI,
  settings: settingsAPI,
  dashboard: dashboardAPI,
  upload: uploadAPI,
  DELIVERY_STATUS,
  PAYMENT_STATUS,
  USER_ROLES,
};

export default api;