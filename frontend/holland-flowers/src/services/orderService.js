/**
 * Order Service - Holland Flowers
 * Handles customer order management APIs
 */

import api from './api';

const ORDER_ENDPOINTS = {
  CREATE: '/orders',
  LIST: '/orders',
  DETAIL: (orderId) => `/orders/${orderId}`,
  BY_NUMBER: (orderNumber) => `/orders/number/${orderNumber}`,
  BY_DELIVERY_STATUS: (status) => `/orders/delivery-status/${status}`,
  CANCEL: (orderId) => `/orders/${orderId}/cancel`,
};

// Delivery status constants (matching backend enum)
export const DELIVERY_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
};

// Delivery status display names
export const DELIVERY_STATUS_DISPLAY = {
  PENDING: { en: 'Pending', ar: 'قيد الانتظار' },
  CONFIRMED: { en: 'Confirmed', ar: 'مؤكد' },
  PROCESSING: { en: 'Processing', ar: 'قيد المعالجة' },
  OUT_FOR_DELIVERY: { en: 'Out for Delivery', ar: 'قيد التوصيل' },
  DELIVERED: { en: 'Delivered', ar: 'تم التوصيل' },
  CANCELLED: { en: 'Cancelled', ar: 'ملغي' },
  REFUNDED: { en: 'Refunded', ar: 'مسترد' },
};

// Payment status constants
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

// Payment status display names
export const PAYMENT_STATUS_DISPLAY = {
  PENDING: { en: 'Pending', ar: 'قيد الانتظار' },
  PROCESSING: { en: 'Processing', ar: 'قيد المعالجة' },
  COMPLETED: { en: 'Completed', ar: 'مكتمل' },
  CAPTURED: { en: 'Captured', ar: 'تم الخصم' },
  FAILED: { en: 'Failed', ar: 'فشل' },
  CANCELLED: { en: 'Cancelled', ar: 'ملغي' },
  REFUNDED: { en: 'Refunded', ar: 'مسترد' },
  PARTIALLY_REFUNDED: { en: 'Partially Refunded', ar: 'مسترد جزئياً' },
  EXPIRED: { en: 'Expired', ar: 'منتهي' },
  ON_HOLD: { en: 'On Hold', ar: 'معلق' },
};

const orderService = {
  /**
   * Create a new order
   * @param {Object} orderData - Order creation data
   * @returns {Promise} Created order details
   */
  createOrder: async (orderData) => {
    try {
      const response = await api.post(ORDER_ENDPOINTS.CREATE, orderData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's orders with pagination
   * @param {Object} params - { page, size }
   * @returns {Promise} Paginated order list
   */
  getUserOrders: async (params = {}) => {
    try {
      const { page = 0, size = 10 } = params;
      const response = await api.get(ORDER_ENDPOINTS.LIST, {
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
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(ORDER_ENDPOINTS.DETAIL(orderId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get order by order number
   * @param {string} orderNumber - Order number (e.g., "ORD-20241220-XXXX")
   * @returns {Promise} Order details
   */
  getOrderByNumber: async (orderNumber) => {
    try {
      const response = await api.get(ORDER_ENDPOINTS.BY_NUMBER(orderNumber));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user's orders by delivery status
   * @param {string} status - Delivery status (from DELIVERY_STATUS)
   * @param {Object} params - { page, size }
   * @returns {Promise} Paginated order list
   */
  getOrdersByDeliveryStatus: async (status, params = {}) => {
    try {
      const { page = 0, size = 10 } = params;
      const response = await api.get(ORDER_ENDPOINTS.BY_DELIVERY_STATUS(status), {
        params: { page, size },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancel an order (only pending orders can be cancelled)
   * @param {number} orderId - Order ID
   * @returns {Promise} Updated order details
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await api.put(ORDER_ENDPOINTS.CANCEL(orderId));
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get delivery status display name
   * @param {string} status - Delivery status
   * @param {string} lang - Language code ('en' or 'ar')
   * @returns {string} Display name
   */
  getDeliveryStatusDisplayName: (status, lang = 'en') => {
    return DELIVERY_STATUS_DISPLAY[status]?.[lang] || status;
  },

  /**
   * Get payment status display name
   * @param {string} status - Payment status
   * @param {string} lang - Language code ('en' or 'ar')
   * @returns {string} Display name
   */
  getPaymentStatusDisplayName: (status, lang = 'en') => {
    return PAYMENT_STATUS_DISPLAY[status]?.[lang] || status;
  },

  /**
   * Check if order can be cancelled
   * @param {string} status - Current delivery status
   * @returns {boolean}
   */
  canCancelOrder: (status) => {
    return status === DELIVERY_STATUS.PENDING;
  },

  /**
   * Format order for display
   * @param {Object} order - Order data from API
   * @param {string} lang - Language code
   * @returns {Object} Formatted order
   */
  formatOrderForDisplay: (order, lang = 'en') => {
    return {
      ...order,
      deliveryStatusDisplay: orderService.getDeliveryStatusDisplayName(order.deliveryStatus, lang),
      paymentStatusDisplay: orderService.getPaymentStatusDisplayName(order.paymentStatus, lang),
      canCancel: orderService.canCancelOrder(order.deliveryStatus),
      formattedTotal: `${lang === 'ar' ? 'د.ك' : 'KWD'} ${order.totalAmount?.toFixed(3)}`,
      formattedDate: new Date(order.createdAt).toLocaleDateString(
        lang === 'ar' ? 'ar-KW' : 'en-KW',
        { year: 'numeric', month: 'long', day: 'numeric' }
      ),
    };
  },
};

export default orderService;
