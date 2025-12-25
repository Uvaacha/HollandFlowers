// Cart API Service - Handles cart synchronization with backend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  return !!getAuthToken();
};

// Helper function for API calls with auth
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

const cartService = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated,

  /**
   * Get user's cart from backend
   */
  getCart: async () => {
    if (!isAuthenticated()) {
      return null;
    }
    try {
      const response = await apiCall('/cart');
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  /**
   * Add item to cart
   */
  addToCart: async (productId, quantity = 1, options = {}) => {
    if (!isAuthenticated()) {
      return null;
    }
    try {
      const response = await apiCall('/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          quantity,
          selectedVariant: options.selectedVariant || null,
          deliveryDate: options.deliveryDate || null,
          deliveryTime: options.deliveryTime || null,
          cardMessage: options.cardMessage || null,
          senderInfo: options.senderInfo || null,
        }),
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (cartItemId, quantity) => {
    if (!isAuthenticated()) {
      return null;
    }
    try {
      const response = await apiCall('/cart/update', {
        method: 'PUT',
        body: JSON.stringify({
          cartItemId,
          quantity,
        }),
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  /**
   * Remove item from cart by cart item ID
   */
  removeFromCart: async (cartItemId) => {
    if (!isAuthenticated()) {
      return null;
    }
    try {
      const response = await apiCall(`/cart/remove/${cartItemId}`, {
        method: 'DELETE',
      });
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  /**
   * Remove item by product ID and variant
   */
  removeByProduct: async (productId, selectedVariant = null) => {
    if (!isAuthenticated()) {
      return null;
    }
    try {
      let url = `/cart/remove-product/${productId}`;
      if (selectedVariant) {
        url += `?variant=${encodeURIComponent(selectedVariant)}`;
      }
      const response = await apiCall(url, {
        method: 'DELETE',
      });
      return response.data;
    } catch (error) {
      console.error('Error removing product from cart:', error);
      throw error;
    }
  },

  /**
   * Clear entire cart
   */
  clearCart: async () => {
    if (!isAuthenticated()) {
      return null;
    }
    try {
      const response = await apiCall('/cart/clear', {
        method: 'DELETE',
      });
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  /**
   * Sync local cart with backend (called on login)
   */
  syncCart: async (localCartItems) => {
    if (!isAuthenticated()) {
      return null;
    }
    try {
      // Transform local cart items to sync format
      const items = localCartItems.map(item => ({
        productId: item.id,
        id: item.id, // Fallback for string IDs
        quantity: item.quantity,
        selectedVariant: item.selectedVariant || null,
        price: item.price,
        deliveryDate: item.deliveryDate || null,
        deliveryTime: item.deliveryTime || null,
        cardMessage: item.cardMessage || null,
        senderInfo: item.senderInfo || null,
      }));

      const response = await apiCall('/cart/sync', {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing cart:', error);
      throw error;
    }
  },

  /**
   * Get cart item count
   */
  getCartCount: async () => {
    if (!isAuthenticated()) {
      return 0;
    }
    try {
      const response = await apiCall('/cart/count');
      return response.data || 0;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  },

  /**
   * Transform backend cart response to local cart format
   */
  transformBackendCart: (backendCart) => {
    if (!backendCart || !backendCart.items) {
      return [];
    }

    return backendCart.items.map(item => ({
      id: item.productId,
      cartItemId: item.cartItemId, // Keep backend ID for updates
      nameEn: item.productName,
      nameAr: item.productNameAr || item.productName,
      price: parseFloat(item.price) || 0,
      originalPrice: parseFloat(item.originalPrice) || 0,
      salePrice: parseFloat(item.finalPrice) || parseFloat(item.price) || 0,
      finalPrice: parseFloat(item.finalPrice) || parseFloat(item.price) || 0,
      actualPrice: parseFloat(item.originalPrice) || 0,
      image: item.imageUrl,
      quantity: item.quantity,
      selectedVariant: item.selectedVariant,
      deliveryDate: item.deliveryDate || '',
      deliveryTime: item.deliveryTime || '',
      cardMessage: item.cardMessage || '',
      senderInfo: item.senderInfo || '',
    }));
  },
};

export default cartService;