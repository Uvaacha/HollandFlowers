/**
 * Product Service - Holland Flowers
 * Handles public product browsing APIs
 */

import api from './api';

const PRODUCT_ENDPOINTS = {
  LIST: '/products',
  DETAIL: (productId) => `/products/${productId}`,
  BY_SKU: (sku) => `/products/sku/${sku}`,
  BY_CATEGORY: (categoryId) => `/products/category/${categoryId}`,
  SEARCH: '/products/search',
  FEATURED: '/products/featured',
  NEW_ARRIVALS: '/products/new-arrivals',
  BEST_SELLERS: '/products/best-sellers',
  LATEST: '/products/latest',
  ON_SALE: '/products/on-sale',
};

const productService = {
  /**
   * Get all active products with pagination
   * @param {Object} params - { page, size, sort }
   * @returns {Promise} Paginated product list
   */
  getAllProducts: async (params = {}) => {
    try {
      const { page = 0, size = 12, sort = 'createdAt,desc' } = params;
      const response = await api.get(PRODUCT_ENDPOINTS.LIST, {
        params: { page, size, sort },
      });
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error('Error fetching products:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get product by ID
   * @param {string} productId - UUID of the product
   * @returns {Promise} Product details
   */
  getProductById: async (productId) => {
    try {
      const response = await api.get(PRODUCT_ENDPOINTS.DETAIL(productId));
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error('Error fetching product:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get product by SKU
   * @param {string} sku - Product SKU
   * @returns {Promise} Product details
   */
  getProductBySku: async (sku) => {
    try {
      const response = await api.get(PRODUCT_ENDPOINTS.BY_SKU(sku));
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error('Error fetching product by SKU:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get products by category
   * @param {string} categoryId - UUID of the category
   * @param {Object} params - { page, size, sort }
   * @returns {Promise} Paginated product list
   */
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      const { page = 0, size = 12, sort = 'createdAt,desc' } = params;
      const response = await api.get(PRODUCT_ENDPOINTS.BY_CATEGORY(categoryId), {
        params: { page, size, sort },
      });
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Search products with filters
   * @param {Object} searchParams - Search filters
   * @returns {Promise} Paginated search results
   */
  searchProducts: async (searchParams = {}) => {
    try {
      const {
        keyword,
        categoryId,
        minPrice,
        maxPrice,
        inStock,
        featured,
        sortBy = 'createdAt',
        sortDirection = 'desc',
        page = 0,
        size = 12,
      } = searchParams;

      const response = await api.get(PRODUCT_ENDPOINTS.SEARCH, {
        params: {
          keyword,
          categoryId,
          minPrice,
          maxPrice,
          inStock,
          featured,
          sortBy,
          sortDirection,
          page,
          size,
        },
      });
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error('Error searching products:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get featured products for homepage carousel
   * @param {Object|number} params - { size, limit } or just limit number
   * @returns {Promise} List of featured products
   */
  getFeaturedProducts: async (params = {}) => {
    try {
      let limit = 20;
      if (typeof params === 'number') {
        limit = params;
      } else if (typeof params === 'object') {
        limit = params.size || params.limit || 20;
      }

      const response = await api.get(PRODUCT_ENDPOINTS.FEATURED, {
        params: { limit },
      });
      
      const data = response.data || response;
      
      if (Array.isArray(data)) {
        return { success: true, data: { content: data, totalElements: data.length } };
      }
      
      return { success: true, data: data };
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return { success: false, error: error.message, data: { content: [] } };
    }
  },

  /**
   * Get new arrival products (admin-selected isNewArrival = true)
   * @param {Object|number} params - { size, limit } or just limit number
   * @returns {Promise} List of new arrival products
   */
  getNewArrivals: async (params = {}) => {
    try {
      let limit = 20;
      if (typeof params === 'number') {
        limit = params;
      } else if (typeof params === 'object') {
        limit = params.size || params.limit || 20;
      }

      const response = await api.get(PRODUCT_ENDPOINTS.NEW_ARRIVALS, {
        params: { limit },
      });
      
      const data = response.data || response;
      
      if (Array.isArray(data)) {
        return { success: true, data: { content: data, totalElements: data.length } };
      }
      
      return { success: true, data: data };
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      return { success: false, error: error.message, data: { content: [] } };
    }
  },

  /**
   * Get best seller products (admin-selected isBestSeller = true)
   * @param {Object|number} params - { size, limit } or just limit number
   * @returns {Promise} List of best seller products
   */
  getBestSellers: async (params = {}) => {
    try {
      let limit = 20;
      if (typeof params === 'number') {
        limit = params;
      } else if (typeof params === 'object') {
        limit = params.size || params.limit || 20;
      }

      const response = await api.get(PRODUCT_ENDPOINTS.BEST_SELLERS, {
        params: { limit },
      });
      
      const data = response.data || response;
      
      if (Array.isArray(data)) {
        return { success: true, data: { content: data, totalElements: data.length } };
      }
      
      return { success: true, data: data };
    } catch (error) {
      console.error('Error fetching best sellers:', error);
      return { success: false, error: error.message, data: { content: [] } };
    }
  },

  /**
   * Get latest products (sorted by createdAt)
   * @param {Object|number} params - { size, limit } or just limit number
   * @returns {Promise} List of latest products
   */
  getLatestProducts: async (params = {}) => {
    try {
      let limit = 8;
      if (typeof params === 'number') {
        limit = params;
      } else if (typeof params === 'object') {
        limit = params.size || params.limit || 8;
      }

      const response = await api.get(PRODUCT_ENDPOINTS.LATEST, {
        params: { limit },
      });
      
      const data = response.data || response;
      
      if (Array.isArray(data)) {
        return { success: true, data: { content: data, totalElements: data.length } };
      }
      
      return { success: true, data: data };
    } catch (error) {
      console.error('Error fetching latest products:', error);
      return { success: false, error: error.message, data: { content: [] } };
    }
  },

  /**
   * Get products on sale
   * @param {Object|number} params - { size, limit } or just limit number
   * @returns {Promise} List of products on sale
   */
  getProductsOnSale: async (params = {}) => {
    try {
      let limit = 8;
      if (typeof params === 'number') {
        limit = params;
      } else if (typeof params === 'object') {
        limit = params.size || params.limit || 8;
      }

      const response = await api.get(PRODUCT_ENDPOINTS.ON_SALE, {
        params: { limit },
      });
      
      const data = response.data || response;
      
      if (Array.isArray(data)) {
        return { success: true, data: { content: data, totalElements: data.length } };
      }
      
      return { success: true, data: data };
    } catch (error) {
      console.error('Error fetching sale products:', error);
      return { success: false, error: error.message, data: { content: [] } };
    }
  },

  /**
   * Get related products
   * @param {string} productId - UUID of the product
   * @param {number} limit - Number of related products
   * @returns {Promise} List of related products
   */
  getRelatedProducts: async (productId, limit = 8) => {
    try {
      const response = await api.get(`/products/${productId}/related`, {
        params: { limit },
      });
      const data = response.data || response;
      if (Array.isArray(data)) {
        return { success: true, data: { content: data, totalElements: data.length } };
      }
      return { success: true, data: data };
    } catch (error) {
      console.error('Error fetching related products:', error);
      return { success: false, error: error.message, data: { content: [] } };
    }
  },
};

export default productService;