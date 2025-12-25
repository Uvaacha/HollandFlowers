/**
 * Category Service - Holland Flowers
 * Handles public category browsing APIs
 */

import api from './api';

const CATEGORY_ENDPOINTS = {
  LIST: '/categories',
  DETAIL: (categoryId) => `/categories/${categoryId}`,
  BY_NAME: (categoryName) => `/categories/name/${categoryName}`,
};

const categoryService = {
  /**
   * Get all active categories
   * @returns {Promise} List of active categories
   */
  getAllCategories: async () => {
    try {
      const response = await api.get(CATEGORY_ENDPOINTS.LIST);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get category by ID
   * @param {string} categoryId - UUID of the category
   * @returns {Promise} Category details
   */
  getCategoryById: async (categoryId) => {
    try {
      const response = await api.get(CATEGORY_ENDPOINTS.DETAIL(categoryId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get category by name
   * @param {string} categoryName - Name of the category
   * @returns {Promise} Category details
   */
  getCategoryByName: async (categoryName) => {
    try {
      const response = await api.get(CATEGORY_ENDPOINTS.BY_NAME(categoryName));
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default categoryService;