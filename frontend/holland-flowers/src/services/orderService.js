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
  BY_STATUS: (status) => `/orders/status/${status}`,
  CANCEL: (orderId) => `/orders/${orderId}/cancel`,
};

// Order status constants (matching backend enum)
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
};

// Order status display names
export const ORDER_STATUS_DISPLAY = {
  PENDING: { en: 'Pending', ar: 'قيد الانتظار' },
  CONFIRMED: { en: 'Confirmed', ar: 'مؤكد' },
  PROCESSING: { en: 'Processing', ar: 'قيد المعالجة' },
  OUT_FOR_DELIVERY: { en: 'Out for Delivery', ar: 'قيد التوصيل' },
  DELIVERED: { en: 'Delivered', ar: 'تم التوصيل' },
  CANCELLED: { en: 'Cancelled', ar: 'ملغي' },
  REFUNDED: { en: 'Refunded', ar: 'مسترد' },
};

const orderService = {
  /**
   * Create a new order
   * @param {Object} orderData - Order creation data
   * @returns {Promise} Created order details
   * 
   * orderData structure:
   * {
   *   items: [{ productId, quantity, specialInstructions }],
   *   cardMessage: string,
   *   instructionMessage: string,
   *   recipientName: string (required),
   *   recipientPhone: string (required),
   *   deliveryAddress: string (required),
   *   deliveryArea: string,
   *   deliveryCity: string,
   *   deliveryNotes: string,
   *   preferredDeliveryDate: ISO datetime string,
   *   couponCode: string
   * }
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
   * Get user's orders by status
   * @param {string} status - Order status (from ORDER_STATUS)
   * @param {Object} params - { page, size }
   * @returns {Promise} Paginated order list
   */
  getOrdersByStatus: async (status, params = {}) => {
    try {
      const { page = 0, size = 10 } = params;
      const response = await api.get(ORDER_ENDPOINTS.BY_STATUS(status), {
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
   * Get status display name
   * @param {string} status - Order status
   * @param {string} lang - Language code ('en' or 'ar')
   * @returns {string} Display name
   */
  getStatusDisplayName: (status, lang = 'en') => {
    return ORDER_STATUS_DISPLAY[status]?.[lang] || status;
  },

  /**
   * Check if order can be cancelled
   * @param {string} status - Current order status
   * @returns {boolean}
   */
  canCancelOrder: (status) => {
    return status === ORDER_STATUS.PENDING;
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
      statusDisplay: orderService.getStatusDisplayName(order.orderStatus, lang),
      canCancel: orderService.canCancelOrder(order.orderStatus),
      formattedTotal: `${lang === 'ar' ? 'د.ك' : 'KWD'} ${order.totalAmount?.toFixed(3)}`,
      formattedDate: new Date(order.createdAt).toLocaleDateString(
        lang === 'ar' ? 'ar-KW' : 'en-KW',
        { year: 'numeric', month: 'long', day: 'numeric' }
      ),
    };
  },
};

export default orderService;