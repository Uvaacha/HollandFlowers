/**
 * Payment Service - Holland Flowers
 * Handles Hesabe Payment Gateway integration
 */

import api from './api';

const PAYMENT_ENDPOINTS = {
  METHODS: '/api/payments/methods',
  INITIATE: '/api/payments/initiate',
  CALLBACK: '/api/payments/callback',
  STATUS: (paymentRef) => `/api/payments/status/${paymentRef}`,
  DETAIL: (paymentRef) => `/api/payments/${paymentRef}`,
  ORDER_PAYMENTS: (orderId) => `/api/payments/order/${orderId}`,
  CANCEL: (paymentRef) => `/api/payments/${paymentRef}/cancel`,
  VERIFY_METHOD: '/api/payments/methods/verify',
};

// Payment methods (matching backend enum)
export const PAYMENT_METHOD = {
  KNET: 'KNET',
  KFAST: 'KFAST',
  VISA: 'VISA',
  MASTERCARD: 'MASTERCARD',
  AMEX: 'AMEX',
  APPLE_PAY: 'APPLE_PAY',
  GOOGLE_PAY: 'GOOGLE_PAY',
  SAMSUNG_PAY: 'SAMSUNG_PAY',
};

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
};

// Payment method display info
export const PAYMENT_METHOD_INFO = {
  KNET: { name: 'K-NET', icon: 'knet', color: '#003366' },
  KFAST: { name: 'K-FAST', icon: 'kfast', color: '#ea580c' },
  VISA: { name: 'VISA', icon: 'visa', color: '#1a1f71' },
  MASTERCARD: { name: 'Mastercard', icon: 'mastercard', color: '#eb001b' },
  AMEX: { name: 'American Express', icon: 'amex', color: '#006fcf' },
  APPLE_PAY: { name: 'Apple Pay', icon: 'applepay', color: '#000000' },
  GOOGLE_PAY: { name: 'Google Pay', icon: 'googlepay', color: '#4285f4' },
  SAMSUNG_PAY: { name: 'Samsung Pay', icon: 'samsungpay', color: '#1428a0' },
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
   *   orderId: number,
   *   paymentOrderId: number (optional),
   *   paymentMethod: PAYMENT_METHOD,
   *   customerEmail: string (optional),
   *   customerPhone: string (optional),
   *   customerName: string (optional),
   *   returnUrl: string (optional),
   *   deviceType: 'MOBILE' | 'WEB',
   *   saveCard: boolean,
   *   savedCardToken: string (optional)
   * }
   */
  initiatePayment: async (paymentData) => {
    try {
      const response = await api.post(PAYMENT_ENDPOINTS.INITIATE, paymentData);
      return response;
    } catch (error) {
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
      throw error;
    }
  },

  /**
   * Process payment callback (called from return URL)
   * @param {string} encryptedData - Encrypted callback data
   * @returns {Promise} Payment result
   */
  processCallback: async (encryptedData) => {
    try {
      const response = await api.get(PAYMENT_ENDPOINTS.CALLBACK, {
        params: { data: encryptedData },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get payment method display info
   * @param {string} method - Payment method
   * @returns {Object} Display info
   */
  getPaymentMethodInfo: (method) => {
    return PAYMENT_METHOD_INFO[method] || { name: method, icon: 'default', color: '#666' };
  },

  /**
   * Check if payment is successful
   * @param {string} status - Payment status
   * @returns {boolean}
   */
  isPaymentSuccessful: (status) => {
    return status === PAYMENT_STATUS.COMPLETED;
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
};

export default paymentService;