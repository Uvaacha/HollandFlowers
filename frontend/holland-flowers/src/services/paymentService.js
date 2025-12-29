/**
 * Payment Service - Holland Flowers
 * Handles Hesabe Payment Gateway integration
 * 
 * FIXED: Removed /api prefix from endpoints since api.js already adds /api/v1
 */

import api from './api';

// FIXED: Endpoints should NOT have /api prefix (api.js adds /api/v1 base URL)
const PAYMENT_ENDPOINTS = {
  METHODS: '/payments/methods',
  INITIATE: '/payments/initiate',
  CALLBACK: '/payments/callback',
  STATUS: (paymentRef) => `/payments/status/${paymentRef}`,
  DETAIL: (paymentRef) => `/payments/${paymentRef}`,
  ORDER_PAYMENTS: (orderId) => `/payments/order/${orderId}`,
  CANCEL: (paymentRef) => `/payments/${paymentRef}/cancel`,
  VERIFY_METHOD: '/payments/methods/verify',
  USER_HISTORY: '/payments/user/history',
};

// Payment methods (matching backend enum)
export const PAYMENT_METHOD = {
  KNET: 'KNET',
  VISA: 'VISA',
  MASTERCARD: 'MASTERCARD',
  AMERICAN_EXPRESS: 'AMERICAN_EXPRESS',
  APPLE_PAY: 'APPLE_PAY',
  GOOGLE_PAY: 'GOOGLE_PAY',
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
};

// Payment status (matching backend enum)
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

// Payment method display info
export const PAYMENT_METHOD_INFO = {
  KNET: { 
    name: 'K-NET', 
    nameAr: 'كي نت',
    icon: 'knet', 
    color: '#003366',
    hesabeCode: '1'
  },
  VISA: { 
    name: 'VISA', 
    nameAr: 'فيزا',
    icon: 'visa', 
    color: '#1a1f71',
    hesabeCode: '2'
  },
  MASTERCARD: { 
    name: 'Mastercard', 
    nameAr: 'ماستركارد',
    icon: 'mastercard', 
    color: '#eb001b',
    hesabeCode: '2'
  },
  AMERICAN_EXPRESS: { 
    name: 'American Express', 
    nameAr: 'أمريكان إكسبريس',
    icon: 'amex', 
    color: '#006fcf',
    hesabeCode: '2'
  },
  APPLE_PAY: { 
    name: 'Apple Pay', 
    nameAr: 'آبل باي',
    icon: 'applepay', 
    color: '#000000',
    hesabeCode: '7'
  },
  GOOGLE_PAY: { 
    name: 'Google Pay', 
    nameAr: 'جوجل باي',
    icon: 'googlepay', 
    color: '#4285f4',
    hesabeCode: '8'
  },
  CASH_ON_DELIVERY: { 
    name: 'Cash on Delivery', 
    nameAr: 'الدفع عند الاستلام',
    icon: 'cod', 
    color: '#28a745',
    hesabeCode: '0'
  },
};

// Payment status display info
export const PAYMENT_STATUS_INFO = {
  PENDING: { name: 'Pending', nameAr: 'قيد الانتظار', color: '#f59e0b' },
  PROCESSING: { name: 'Processing', nameAr: 'جاري المعالجة', color: '#3b82f6' },
  COMPLETED: { name: 'Completed', nameAr: 'مكتمل', color: '#10b981' },
  CAPTURED: { name: 'Captured', nameAr: 'تم الخصم', color: '#10b981' },
  FAILED: { name: 'Failed', nameAr: 'فشل', color: '#ef4444' },
  CANCELLED: { name: 'Cancelled', nameAr: 'ملغي', color: '#6b7280' },
  REFUNDED: { name: 'Refunded', nameAr: 'مسترد', color: '#8b5cf6' },
  PARTIALLY_REFUNDED: { name: 'Partially Refunded', nameAr: 'مسترد جزئياً', color: '#a855f7' },
  EXPIRED: { name: 'Expired', nameAr: 'منتهي', color: '#6b7280' },
  ON_HOLD: { name: 'On Hold', nameAr: 'معلق', color: '#f59e0b' },
};

const paymentService = {
  /**
   * Get available payment methods
   * @returns {Promise} List of available payment methods
   */
  getPaymentMethods: async () => {
    try {
      const response = await api.get(PAYMENT_ENDPOINTS.METHODS);
      return response;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  },

  /**
   * Initiate a payment
   * @param {Object} paymentData - Payment initiation data
   * @returns {Promise} Payment response with redirect URL
   * 
   * paymentData structure:
   * {
   *   orderId: number (required),
   *   paymentMethod: PAYMENT_METHOD (required),
   *   customerEmail: string (optional),
   *   customerPhone: string (optional),
   *   customerName: string (optional),
   *   deviceType: 'MOBILE' | 'WEB' (optional, defaults to WEB)
   * }
   */
  initiatePayment: async (paymentData) => {
    try {
      console.log('Initiating payment with data:', paymentData);
      const response = await api.post(PAYMENT_ENDPOINTS.INITIATE, paymentData);
      console.log('Payment initiation response:', response);
      return response;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  },

  /**
   * Check payment status
   * @param {string} paymentReference - Payment reference ID
   * @returns {Promise} Payment status details
   */
  checkPaymentStatus: async (paymentReference) => {
    try {
      const response = await api.get(PAYMENT_ENDPOINTS.STATUS(paymentReference));
      return response;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  },

  /**
   * Get payment details
   * @param {string} paymentReference - Payment reference ID
   * @returns {Promise} Full payment details
   */
  getPaymentDetails: async (paymentReference) => {
    try {
      const response = await api.get(PAYMENT_ENDPOINTS.DETAIL(paymentReference));
      return response;
    } catch (error) {
      console.error('Error getting payment details:', error);
      throw error;
    }
  },

  /**
   * Get payments for an order
   * @param {number} orderId - Order ID
   * @returns {Promise} List of payments for the order
   */
  getOrderPayments: async (orderId) => {
    try {
      const response = await api.get(PAYMENT_ENDPOINTS.ORDER_PAYMENTS(orderId));
      return response;
    } catch (error) {
      console.error('Error getting order payments:', error);
      throw error;
    }
  },

  /**
   * Get user's payment history
   * @returns {Promise} List of user's payments
   */
  getUserPaymentHistory: async () => {
    try {
      const response = await api.get(PAYMENT_ENDPOINTS.USER_HISTORY);
      return response;
    } catch (error) {
      console.error('Error getting user payment history:', error);
      throw error;
    }
  },

  /**
   * Cancel a pending payment
   * @param {string} paymentReference - Payment reference ID
   * @returns {Promise} Cancellation result
   */
  cancelPayment: async (paymentReference) => {
    try {
      const response = await api.post(PAYMENT_ENDPOINTS.CANCEL(paymentReference));
      return response;
    } catch (error) {
      console.error('Error cancelling payment:', error);
      throw error;
    }
  },

  /**
   * Verify if a payment method is available for the given amount
   * @param {string} method - Payment method
   * @param {number} amount - Payment amount
   * @returns {Promise} Availability status
   */
  verifyPaymentMethod: async (method, amount) => {
    try {
      const response = await api.get(PAYMENT_ENDPOINTS.VERIFY_METHOD, {
        params: { method, amount },
      });
      return response;
    } catch (error) {
      console.error('Error verifying payment method:', error);
      throw error;
    }
  },

  /**
   * Process payment callback (called from return URL)
   * @param {string} encryptedData - Encrypted callback data from Hesabe
   * @returns {Promise} Payment result
   */
  processCallback: async (encryptedData) => {
    try {
      console.log('Processing payment callback with encrypted data');
      const response = await api.get(PAYMENT_ENDPOINTS.CALLBACK, {
        params: { data: encryptedData },
      });
      console.log('Payment callback response:', response);
      return response;
    } catch (error) {
      console.error('Error processing payment callback:', error);
      throw error;
    }
  },

  /**
   * Get payment method display info
   * @param {string} method - Payment method
   * @param {string} lang - Language code ('en' or 'ar')
   * @returns {Object} Display info
   */
  getPaymentMethodInfo: (method, lang = 'en') => {
    const info = PAYMENT_METHOD_INFO[method];
    if (!info) return { name: method, icon: 'default', color: '#666' };
    return {
      ...info,
      displayName: lang === 'ar' ? info.nameAr : info.name,
    };
  },

  /**
   * Get payment status display info
   * @param {string} status - Payment status
   * @param {string} lang - Language code ('en' or 'ar')
   * @returns {Object} Display info
   */
  getPaymentStatusInfo: (status, lang = 'en') => {
    const info = PAYMENT_STATUS_INFO[status];
    if (!info) return { name: status, color: '#666' };
    return {
      ...info,
      displayName: lang === 'ar' ? info.nameAr : info.name,
    };
  },

  /**
   * Check if payment is successful
   * @param {string} status - Payment status
   * @returns {boolean}
   */
  isPaymentSuccessful: (status) => {
    return status === PAYMENT_STATUS.COMPLETED || status === PAYMENT_STATUS.CAPTURED;
  },

  /**
   * Check if payment is pending
   * @param {string} status - Payment status
   * @returns {boolean}
   */
  isPaymentPending: (status) => {
    return status === PAYMENT_STATUS.PENDING || status === PAYMENT_STATUS.PROCESSING;
  },

  /**
   * Check if payment failed
   * @param {string} status - Payment status
   * @returns {boolean}
   */
  isPaymentFailed: (status) => {
    return status === PAYMENT_STATUS.FAILED || 
           status === PAYMENT_STATUS.CANCELLED || 
           status === PAYMENT_STATUS.EXPIRED;
  },

  /**
   * Generate payment return URLs
   * @returns {Object} Success and failure URLs
   */
  getReturnUrls: () => {
    const baseUrl = window.location.origin;
    return {
      successUrl: `${baseUrl}/payment/success`,
      failureUrl: `${baseUrl}/payment/failure`,
    };
  },

  /**
   * Store pending order info before payment redirect
   * @param {Object} orderInfo - Order information
   */
  storePendingOrder: (orderInfo) => {
    localStorage.setItem('pendingOrder', JSON.stringify({
      ...orderInfo,
      timestamp: new Date().toISOString(),
    }));
  },

  /**
   * Get pending order info
   * @returns {Object|null} Pending order info or null
   */
  getPendingOrder: () => {
    const data = localStorage.getItem('pendingOrder');
    return data ? JSON.parse(data) : null;
  },

  /**
   * Clear pending order info
   */
  clearPendingOrder: () => {
    localStorage.removeItem('pendingOrder');
  },
};

export default paymentService;
