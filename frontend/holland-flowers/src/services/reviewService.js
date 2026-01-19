// src/services/reviewService.js
import api from './api';

const API_BASE_URL = '/api/reviews';

/**
 * Review Service
 * Handles all review-related API calls
 */
const reviewService = {
  /**
   * Submit a new review
   */
  submitReview: async (reviewData) => {
    try {
      const response = await api.post(`${API_BASE_URL}`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },

  /**
   * Get reviews for a specific product
   */
  getProductReviews: async (productId, params = {}) => {
    try {
      const { page = 0, size = 10, sort = 'createdAt,desc' } = params;
      const response = await api.get(`${API_BASE_URL}/product/${productId}`, {
        params: { page, size, sort }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },

  /**
   * Get rating summary for a product
   */
  getProductRatingSummary: async (productId) => {
    try {
      const response = await api.get(`${API_BASE_URL}/product/${productId}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rating summary:', error);
      throw error;
    }
  },

  /**
   * Mark a review as helpful or not helpful
   */
  markReviewHelpful: async (reviewId, isHelpful) => {
    try {
      const response = await api.post(`${API_BASE_URL}/helpful`, {
        reviewId,
        isHelpful
      });
      return response.data;
    } catch (error) {
      console.error('Error marking review helpful:', error);
      throw error;
    }
  },

  /**
   * Check if user can review a product
   */
  canReviewProduct: async (productId) => {
    try {
      const response = await api.get(`${API_BASE_URL}/can-review/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking review permission:', error);
      throw error;
    }
  },

  /**
   * Get current user's reviews
   */
  getUserReviews: async (params = {}) => {
    try {
      const { page = 0, size = 10 } = params;
      const response = await api.get(`${API_BASE_URL}/user/my-reviews`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }
};

export default reviewService;