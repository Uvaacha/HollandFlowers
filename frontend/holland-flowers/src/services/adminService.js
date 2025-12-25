/**
 * Admin Service - Holland Flowers
 * Handles all admin portal APIs for orders, products, categories, and customers
 */

import api from './api';

// Admin API Endpoints
const ADMIN_ENDPOINTS = {
  // Orders
  ORDERS: {
    LIST: '/admin/orders',
    DETAIL: (orderId) => `/admin/orders/${orderId}`,
    BY_STATUS: (status) => `/admin/orders/status/${status}`,
    BY_DATE_RANGE: '/admin/orders/date-range',
    UPDATE_STATUS: (orderId) => `/admin/orders/${orderId}/status`,
    STATISTICS: '/admin/orders/statistics',
  },
  // Products
  PRODUCTS: {
    LIST: '/admin/products',
    DETAIL: (productId) => `/admin/products/${productId}`,
    BY_SKU: (sku) => `/admin/products/sku/${sku}`,
    BY_CATEGORY: (categoryId) => `/admin/products/category/${categoryId}`,
    LOW_STOCK: '/admin/products/low-stock',
    CREATE: '/admin/products',
    UPDATE: (productId) => `/admin/products/${productId}`,
    DELETE: (productId) => `/admin/products/${productId}`,
    TOGGLE_STATUS: (productId) => `/admin/products/${productId}/toggle-status`,
    UPDATE_STOCK: (productId) => `/admin/products/${productId}/stock`,
  },
  // Categories
  CATEGORIES: {
    LIST: '/admin/categories',
    SEARCH: '/admin/categories/search',
    CREATE: '/admin/categories',
    UPDATE: (categoryId) => `/admin/categories/${categoryId}`,
    DELETE: (categoryId) => `/admin/categories/${categoryId}`,
    TOGGLE_STATUS: (categoryId) => `/admin/categories/${categoryId}/toggle-status`,
  },
  // Payments (Admin)
  PAYMENTS: {
    REFUND: (paymentRef) => `/api/payments/admin/${paymentRef}/refund`,
  },
};

const adminService = {
  // ==================== ORDER MANAGEMENT ====================
  
  orders: {
    /**
     * Get all orders with pagination
     * @param {Object} params - { page, size }
     * @returns {Promise} Paginated order list
     */
    getAll: async (params = {}) => {
      try {
        const { page = 0, size = 10 } = params;
        const response = await api.get(ADMIN_ENDPOINTS.ORDERS.LIST, {
          params: { page, size },
        });
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Get order by ID
     * @param {number} orderId - Order ID
     * @returns {Promise} Order details
     */
    getById: async (orderId) => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.ORDERS.DETAIL(orderId));
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Get orders by status
     * @param {string} status - Order status
     * @param {Object} params - { page, size }
     * @returns {Promise} Paginated order list
     */
    getByStatus: async (status, params = {}) => {
      try {
        const { page = 0, size = 10 } = params;
        const response = await api.get(ADMIN_ENDPOINTS.ORDERS.BY_STATUS(status), {
          params: { page, size },
        });
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Get orders by date range
     * @param {string} startDate - Start date (ISO format)
     * @param {string} endDate - End date (ISO format)
     * @param {Object} params - { page, size }
     * @returns {Promise} Paginated order list
     */
    getByDateRange: async (startDate, endDate, params = {}) => {
      try {
        const { page = 0, size = 10 } = params;
        const response = await api.get(ADMIN_ENDPOINTS.ORDERS.BY_DATE_RANGE, {
          params: { startDate, endDate, page, size },
        });
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Update order status
     * @param {number} orderId - Order ID
     * @param {string} orderStatus - New status
     * @param {string} note - Optional note
     * @returns {Promise} Updated order
     */
    updateStatus: async (orderId, orderStatus, note = '') => {
      try {
        const response = await api.put(ADMIN_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), {
          orderStatus,
          note,
        });
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Get order statistics
     * @returns {Promise} Order statistics
     */
    getStatistics: async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.ORDERS.STATISTICS);
        return response;
      } catch (error) {
        throw error;
      }
    },
  },

  // ==================== PRODUCT MANAGEMENT ====================
  
  products: {
    /**
     * Get all products (including inactive)
     * @param {Object} params - { page, size }
     * @returns {Promise} Paginated product list
     */
    getAll: async (params = {}) => {
      try {
        const { page = 0, size = 10 } = params;
        const response = await api.get(ADMIN_ENDPOINTS.PRODUCTS.LIST, {
          params: { page, size },
        });
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Get product by ID
     * @param {string} productId - Product UUID
     * @returns {Promise} Product details
     */
    getById: async (productId) => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.PRODUCTS.DETAIL(productId));
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Get product by SKU
     * @param {string} sku - Product SKU
     * @returns {Promise} Product details
     */
    getBySku: async (sku) => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.PRODUCTS.BY_SKU(sku));
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Get products by category
     * @param {string} categoryId - Category UUID
     * @param {Object} params - { page, size }
     * @returns {Promise} Paginated product list
     */
    getByCategory: async (categoryId, params = {}) => {
      try {
        const { page = 0, size = 10 } = params;
        const response = await api.get(ADMIN_ENDPOINTS.PRODUCTS.BY_CATEGORY(categoryId), {
          params: { page, size },
        });
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Get low stock products
     * @param {number} threshold - Stock threshold (default: 10)
     * @returns {Promise} List of low stock products
     */
    getLowStock: async (threshold = 10) => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.PRODUCTS.LOW_STOCK, {
          params: { threshold },
        });
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Create a new product
     * @param {Object} productData - Product creation data
     * @returns {Promise} Created product
     */
    create: async (productData) => {
      try {
        const response = await api.post(ADMIN_ENDPOINTS.PRODUCTS.CREATE, productData);
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Update a product
     * @param {string} productId - Product UUID
     * @param {Object} productData - Product update data
     * @returns {Promise} Updated product
     */
    update: async (productId, productData) => {
      try {
        const response = await api.put(ADMIN_ENDPOINTS.PRODUCTS.UPDATE(productId), productData);
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Delete a product
     * @param {string} productId - Product UUID
     * @returns {Promise} Deletion result
     */
    delete: async (productId) => {
      try {
        const response = await api.delete(ADMIN_ENDPOINTS.PRODUCTS.DELETE(productId));
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Toggle product active status
     * @param {string} productId - Product UUID
     * @returns {Promise} Updated product
     */
    toggleStatus: async (productId) => {
      try {
        const response = await api.put(ADMIN_ENDPOINTS.PRODUCTS.TOGGLE_STATUS(productId));
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Update product stock
     * @param {string} productId - Product UUID
     * @param {number} quantity - Quantity to adjust
     * @param {string} operation - 'ADD', 'SUBTRACT', or 'SET'
     * @returns {Promise} Updated product
     */
    updateStock: async (productId, quantity, operation = 'SET') => {
      try {
        const response = await api.put(ADMIN_ENDPOINTS.PRODUCTS.UPDATE_STOCK(productId), {
          quantity,
          operation,
        });
        return response;
      } catch (error) {
        throw error;
      }
    },
  },

  // ==================== CATEGORY MANAGEMENT ====================
  
  categories: {
    /**
     * Get all categories (including inactive)
     * @returns {Promise} List of all categories
     */
    getAll: async () => {
      try {
        const response = await api.get(ADMIN_ENDPOINTS.CATEGORIES.LIST);
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Search categories
     * @param {string} keyword - Search keyword
     * @param {Object} params - { page, size }
     * @returns {Promise} Paginated category list
     */
    search: async (keyword, params = {}) => {
      try {
        const { page = 0, size = 10 } = params;
        const response = await api.get(ADMIN_ENDPOINTS.CATEGORIES.SEARCH, {
          params: { keyword, page, size },
        });
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Create a new category
     * @param {Object} categoryData - { categoryName, description, imageUrl, displayOrder }
     * @returns {Promise} Created category
     */
    create: async (categoryData) => {
      try {
        const response = await api.post(ADMIN_ENDPOINTS.CATEGORIES.CREATE, categoryData);
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Update a category
     * @param {string} categoryId - Category UUID
     * @param {Object} categoryData - Category update data
     * @returns {Promise} Updated category
     */
    update: async (categoryId, categoryData) => {
      try {
        const response = await api.put(ADMIN_ENDPOINTS.CATEGORIES.UPDATE(categoryId), categoryData);
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Delete a category
     * @param {string} categoryId - Category UUID
     * @returns {Promise} Deletion result
     */
    delete: async (categoryId) => {
      try {
        const response = await api.delete(ADMIN_ENDPOINTS.CATEGORIES.DELETE(categoryId));
        return response;
      } catch (error) {
        throw error;
      }
    },

    /**
     * Toggle category active status
     * @param {string} categoryId - Category UUID
     * @returns {Promise} Updated category
     */
    toggleStatus: async (categoryId) => {
      try {
        const response = await api.put(ADMIN_ENDPOINTS.CATEGORIES.TOGGLE_STATUS(categoryId));
        return response;
      } catch (error) {
        throw error;
      }
    },
  },

  // ==================== PAYMENT MANAGEMENT ====================
  
  payments: {
    /**
     * Initiate a refund (Admin only)
     * @param {string} paymentReference - Payment reference ID
     * @param {number} amount - Refund amount (optional for full refund)
     * @param {string} reason - Refund reason
     * @returns {Promise} Refund result
     */
    initiateRefund: async (paymentReference, amount = null, reason = '') => {
      try {
        const params = { reason };
        if (amount !== null) {
          params.amount = amount;
        }
        const response = await api.post(ADMIN_ENDPOINTS.PAYMENTS.REFUND(paymentReference), null, {
          params,
        });
        return response;
      } catch (error) {
        throw error;
      }
    },
  },
};

export default adminService;