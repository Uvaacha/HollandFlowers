/**
 * Authentication Service - Holland Flowers
 * Handles user registration, login, OTP, and password management
 */

import api, { TokenManager } from './api';

const AUTH_ENDPOINTS = {
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  GOOGLE_AUTH: '/auth/google',
  OTP_REQUEST: '/auth/otp/request',
  OTP_VERIFY: '/auth/otp/verify',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
};

const authService = {
  /**
   * Register a new user
   * @param {Object} signupData - { name, email, phoneNumber, password }
   * @returns {Promise} AuthResponse with tokens and user data
   */
  signup: async (signupData) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.SIGNUP, signupData);
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        TokenManager.setTokens(accessToken, refreshToken);
        TokenManager.setUser(user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login with email and password
   * @param {Object} loginData - { email, password }
   * @returns {Promise} AuthResponse with tokens and user data
   */
  login: async (loginData) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, loginData);
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        TokenManager.setTokens(accessToken, refreshToken);
        TokenManager.setUser(user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login with Google OAuth token
   * @param {Object} googleData - { idToken } or { code } from Google
   * @returns {Promise} AuthResponse with tokens and user data
   */
  googleLogin: async (googleData) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.GOOGLE_AUTH, googleData);
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        TokenManager.setTokens(accessToken, refreshToken);
        TokenManager.setUser(user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request OTP for passwordless login
   * @param {string} emailOrPhone - Email address or phone number
   * @returns {Promise} Success message
   */
  requestOtp: async (emailOrPhone) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.OTP_REQUEST, { emailOrPhone });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify OTP and login
   * @param {Object} otpData - { emailOrPhone, otp }
   * @returns {Promise} AuthResponse with tokens and user data
   */
  verifyOtp: async (otpData) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.OTP_VERIFY, otpData);
      
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        TokenManager.setTokens(accessToken, refreshToken);
        TokenManager.setUser(user);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Current refresh token
   * @returns {Promise} New tokens
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
      
      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        TokenManager.setTokens(accessToken, newRefreshToken);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request password reset OTP
   * @param {string} email - User's email address
   * @returns {Promise} Success message
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password with OTP
   * @param {Object} resetData - { email, otp, newPassword }
   * @returns {Promise} Success message
   */
  resetPassword: async (resetData) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, resetData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user - Clear tokens and user data
   */
  logout: () => {
    TokenManager.clearTokens();
    window.dispatchEvent(new CustomEvent('logout'));
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!TokenManager.getAccessToken();
  },

  /**
   * Get current user from storage
   * @returns {Object|null} User data or null
   */
  getCurrentUser: () => {
    return TokenManager.getUser();
  },

  /**
   * Check if current user is admin
   * @returns {boolean}
   */
  isAdmin: () => {
    const user = TokenManager.getUser();
    return user && (user.roleName === 'ADMIN' || user.roleName === 'SUPER_ADMIN');
  },
};

export default authService;