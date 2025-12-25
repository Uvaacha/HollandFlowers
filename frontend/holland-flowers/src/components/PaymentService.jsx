// PaymentService.js - API service for Hesabe Payment Integration
// PRODUCTION READY VERSION

// ============================================
// API BASE URL CONFIGURATION
// ============================================
// In production, this will use the REACT_APP_API_URL from .env.production
// In development, it falls back to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// Log the API URL in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('💳 Payment Service API URL:', API_BASE_URL);
}

// Helper function to get auth token - Use 'accessToken' to match auth system
const getAuthToken = () => {
  return localStorage.getItem('accessToken') || localStorage.getItem('adminToken');
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API call failed: ${response.status}`);
  }
  
  return response.json();
};

// ============ Order API ============

/**
 * Create a new order
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} - Created order response
 */
export const createOrder = async (orderData) => {
  const payload = {
    items: orderData.items.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions || ''
    })),
    cardMessage: orderData.cardMessage || '',
    instructionMessage: orderData.deliveryInstructions || '',
    recipientName: `${orderData.firstName || ''} ${orderData.lastName}`.trim(),
    recipientPhone: orderData.phone,
    deliveryAddress: orderData.address,
    deliveryArea: orderData.governorate,
    deliveryCity: orderData.city || '',
    deliveryNotes: orderData.apartment || '',
    preferredDeliveryDate: orderData.preferredDeliveryDate || null,
    couponCode: orderData.couponCode || ''
  };

  return apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} - Order details
 */
export const getOrder = async (orderId) => {
  return apiCall(`/orders/${orderId}`);
};

/**
 * Get user's orders
 * @param {number} page - Page number
 * @param {number} size - Page size
 * @returns {Promise<Object>} - Paginated orders
 */
export const getUserOrders = async (page = 0, size = 10) => {
  return apiCall(`/orders?page=${page}&size=${size}`);
};

// ============ Payment API ============
// Note: Controller is at /api/payments, so full path is /api/v1/api/payments/*

/**
 * Get available payment methods
 * @returns {Promise<Array>} - List of payment methods
 */
export const getPaymentMethods = async () => {
  return apiCall('/api/payments/methods');
};

/**
 * Initiate a payment for an order
 * @param {Object} paymentData - Payment initiation data
 * @returns {Promise<Object>} - Payment response with checkout URL
 */
export const initiatePayment = async (paymentData) => {
  const payload = {
    orderId: paymentData.orderId,
    paymentMethod: paymentData.paymentMethod, // KNET, VISA, MASTERCARD, APPLE_PAY, etc.
    customerEmail: paymentData.email,
    customerPhone: paymentData.phone,
    customerName: paymentData.customerName,
    deviceType: paymentData.deviceType || 'WEB',
    saveCard: paymentData.saveCard || false,
    savedCardToken: paymentData.savedCardToken || null
  };

  return apiCall('/api/payments/initiate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Check payment status
 * @param {string} paymentReference - Payment reference ID
 * @returns {Promise<Object>} - Payment status
 */
export const checkPaymentStatus = async (paymentReference) => {
  return apiCall(`/api/payments/status/${paymentReference}`);
};

/**
 * Get payment details
 * @param {string} paymentReference - Payment reference ID
 * @returns {Promise<Object>} - Payment details
 */
export const getPaymentDetails = async (paymentReference) => {
  return apiCall(`/api/payments/${paymentReference}`);
};

/**
 * Verify payment method availability
 * @param {string} method - Payment method
 * @param {number} amount - Amount in KWD
 * @returns {Promise<Object>} - Verification result
 */
export const verifyPaymentMethod = async (method, amount) => {
  return apiCall(`/api/payments/methods/verify?method=${method}&amount=${amount}`);
};

/**
 * Cancel a pending payment
 * @param {string} paymentReference - Payment reference ID
 * @returns {Promise<Object>} - Cancellation result
 */
export const cancelPayment = async (paymentReference) => {
  return apiCall(`/api/payments/${paymentReference}/cancel`, {
    method: 'POST',
  });
};

// ============ Guest Checkout API (No Auth Required) ============

/**
 * Create guest order and initiate payment in one call
 * This is for users who haven't logged in
 * @param {Object} checkoutData - Complete checkout data
 * @returns {Promise<Object>} - Order and payment response
 */
export const guestCheckout = async (checkoutData) => {
  const payload = {
    // Contact info
    email: checkoutData.contact.emailOrPhone,
    phone: checkoutData.delivery.phone,
    
    // Delivery info
    recipientName: `${checkoutData.delivery.firstName || ''} ${checkoutData.delivery.lastName}`.trim(),
    recipientPhone: checkoutData.delivery.phone,
    deliveryAddress: checkoutData.delivery.address,
    deliveryArea: checkoutData.delivery.governorate,
    deliveryCity: checkoutData.delivery.city,
    deliveryNotes: checkoutData.delivery.apartment,
    
    // Billing info (if different)
    billingAddress: checkoutData.billingAddress === 'same' 
      ? null 
      : {
          firstName: checkoutData.billingDetails.firstName,
          lastName: checkoutData.billingDetails.lastName,
          address: checkoutData.billingDetails.address,
          city: checkoutData.billingDetails.city,
          state: checkoutData.billingDetails.state,
          postalCode: checkoutData.billingDetails.postalCode,
          country: checkoutData.billingDetails.country,
          phone: checkoutData.billingDetails.phone
        },
    
    // Cart items
    items: checkoutData.cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity,
      specialInstructions: item.giftMessage || ''
    })),
    
    // Delivery instructions
    deliveryInstructions: checkoutData.deliveryInstructions,
    
    // Shipping
    shippingMethod: checkoutData.selectedShipping,
    shippingCost: checkoutData.shippingCost,
    
    // Totals
    subtotal: checkoutData.subtotal,
    total: checkoutData.total,
    
    // Payment method (will redirect to Hesabe)
    paymentMethod: 'KNET' // Default, user selects on Hesabe page
  };

  // For guest checkout, you might have a different endpoint
  // that doesn't require authentication
  const response = await fetch(`${API_BASE_URL}/orders/guest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Checkout failed');
  }

  return response.json();
};

// ============ Utility Functions ============

/**
 * Format price in KWD
 * @param {number} amount - Amount
 * @returns {string} - Formatted price
 */
export const formatPrice = (amount) => {
  return `KWD ${amount.toFixed(3)}`;
};

/**
 * Payment method mapping for UI
 */
export const PAYMENT_METHODS = {
  KNET: {
    code: 'KNET',
    name: 'K-NET',
    nameAr: 'كي نت',
    icon: 'knet',
    hesabeCode: '1'
  },
  VISA: {
    code: 'VISA',
    name: 'Visa',
    nameAr: 'فيزا',
    icon: 'visa',
    hesabeCode: '2'
  },
  MASTERCARD: {
    code: 'MASTERCARD',
    name: 'Mastercard',
    nameAr: 'ماستركارد',
    icon: 'mastercard',
    hesabeCode: '2'
  },
  AMERICAN_EXPRESS: {
    code: 'AMERICAN_EXPRESS',
    name: 'American Express',
    nameAr: 'أمريكان إكسبريس',
    icon: 'amex',
    hesabeCode: '2'
  },
  APPLE_PAY: {
    code: 'APPLE_PAY',
    name: 'Apple Pay',
    nameAr: 'أبل باي',
    icon: 'apple-pay',
    hesabeCode: '7'
  },
  GOOGLE_PAY: {
    code: 'GOOGLE_PAY',
    name: 'Google Pay',
    nameAr: 'جوجل باي',
    icon: 'google-pay',
    hesabeCode: '8'
  },
  CASH_ON_DELIVERY: {
    code: 'CASH_ON_DELIVERY',
    name: 'Cash on Delivery',
    nameAr: 'الدفع عند الاستلام',
    icon: 'cod',
    hesabeCode: '0'
  }
};

const PaymentService = {
  createOrder,
  getOrder,
  getUserOrders,
  getPaymentMethods,
  initiatePayment,
  checkPaymentStatus,
  getPaymentDetails,
  verifyPaymentMethod,
  cancelPayment,
  guestCheckout,
  formatPrice,
  PAYMENT_METHODS
};

export default PaymentService;