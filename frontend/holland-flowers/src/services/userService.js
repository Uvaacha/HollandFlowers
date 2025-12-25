/**
 * User Profile Service - Holland Flowers
 * Handles user profile management APIs
 */

import api, { TokenManager } from './api';

const USER_ENDPOINTS = {
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/change-password',
  UPLOAD_AVATAR: '/users/avatar',
  DELETE_ACCOUNT: '/users/account',
};

const userService = {
  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get(USER_ENDPOINTS.PROFILE);
      
      // Update cached user data
      if (response.success && response.data) {
        TokenManager.setUser(response.data);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - { name, phoneNumber }
   * @returns {Promise} Updated user profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put(USER_ENDPOINTS.UPDATE_PROFILE, profileData);
      
      // Update cached user data
      if (response.success && response.data) {
        TokenManager.setUser(response.data);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Change password
   * @param {Object} passwordData - { currentPassword, newPassword, confirmPassword }
   * @returns {Promise} Success message
   */
  changePassword: async (passwordData) => {
    try {
      const response = await api.put(USER_ENDPOINTS.CHANGE_PASSWORD, passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload avatar image
   * @param {File} file - Image file
   * @returns {Promise} Updated user profile with new avatar URL
   */
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(USER_ENDPOINTS.UPLOAD_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update cached user data
      if (response.success && response.data) {
        TokenManager.setUser(response.data);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete user account
   * @param {string} password - Current password for verification
   * @returns {Promise} Deletion result
   */
  deleteAccount: async (password) => {
    try {
      const response = await api.delete(USER_ENDPOINTS.DELETE_ACCOUNT, {
        data: { password },
      });
      
      // Clear tokens on successful deletion
      if (response.success) {
        TokenManager.clearTokens();
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get cached user data
   * @returns {Object|null} Cached user data
   */
  getCachedUser: () => {
    return TokenManager.getUser();
  },

  /**
   * Update cached user data
   * @param {Object} userData - User data to cache
   */
  setCachedUser: (userData) => {
    TokenManager.setUser(userData);
  },

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isLoggedIn: () => {
    return !!TokenManager.getAccessToken();
  },

  /**
   * Format user display name
   * @param {Object} user - User object
   * @returns {string} Formatted display name
   */
  getDisplayName: (user) => {
    if (!user) return 'Guest';
    return user.name || user.email?.split('@')[0] || 'User';
  },

  /**
   * Get user initials for avatar placeholder
   * @param {Object} user - User object
   * @returns {string} User initials (max 2 characters)
   */
  getInitials: (user) => {
    if (!user?.name) return 'U';
    
    const names = user.name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  },
};

export default userService;