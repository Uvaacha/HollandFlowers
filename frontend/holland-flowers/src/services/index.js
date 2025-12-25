/**
 * Services Index - Holland Flowers
 * Export all API services for easy importing
 */

// Core API configuration
export { default as api, TokenManager, API_BASE_URL } from './api';

// Authentication
export { default as authService } from './authService';

// Public APIs
export { default as productService } from './productService';
export { default as categoryService } from './categoryService';

// User APIs (requires authentication)
export { default as orderService, ORDER_STATUS, ORDER_STATUS_DISPLAY } from './orderService';
export { default as userService } from './userService';

// Payment APIs
export { 
  default as paymentService, 
  PAYMENT_METHOD, 
  PAYMENT_STATUS, 
  PAYMENT_METHOD_INFO 
} from './paymentService';

// Admin APIs (requires admin role)
export { default as adminService } from './adminService';

// File Upload
export { 
  default as uploadService, 
  ALLOWED_IMAGE_TYPES, 
  MAX_FILE_SIZE 
} from './uploadService';

// Re-export common utilities
export const isAuthenticated = () => !!localStorage.getItem('accessToken');
export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.roleName === 'ADMIN' || user.roleName === 'SUPER_ADMIN';
};