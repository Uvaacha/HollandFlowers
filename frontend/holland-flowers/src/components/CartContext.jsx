import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import cartService from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Initialize cart directly from localStorage (lazy initialization)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('hollandFlowersCart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        console.log('Cart loaded from localStorage:', parsed.length, 'items');
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncInProgress = useRef(false);
  const lastSyncedUserId = useRef(null);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
  }, []);

  // Get current user ID from token
  const getCurrentUserId = useCallback(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      // Decode JWT to get user ID (basic decode, not verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      return null;
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('hollandFlowersCart', JSON.stringify(cartItems));
      console.log('Cart saved to localStorage:', cartItems.length, 'items');
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  // Sync cart with backend when user logs in
  const syncWithBackend = useCallback(async (forceSync = false) => {
    if (syncInProgress.current) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    if (!isAuthenticated()) {
      console.log('User not authenticated, skipping sync');
      return;
    }

    const currentUserId = getCurrentUserId();
    
    // Skip if already synced for this user (unless forced)
    if (!forceSync && lastSyncedUserId.current === currentUserId) {
      console.log('Already synced for this user');
      return;
    }

    syncInProgress.current = true;
    setIsSyncing(true);

    try {
      console.log('Syncing cart with backend...');
      
      // Get local cart items
      const localItems = cartItems;
      
      // If there are local items, sync them to backend first
      if (localItems.length > 0) {
        console.log('Syncing', localItems.length, 'local items to backend');
        await cartService.syncCart(localItems);
      }

      // Get the merged cart from backend
      const backendCart = await cartService.getCart();
      
      if (backendCart) {
        // Transform backend cart to local format
        const transformedCart = cartService.transformBackendCart(backendCart);
        console.log('Loaded', transformedCart.length, 'items from backend');
        
        setCartItems(transformedCart);
        lastSyncedUserId.current = currentUserId;
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      syncInProgress.current = false;
      setIsSyncing(false);
    }
  }, [cartItems, isAuthenticated, getCurrentUserId]);

  // Listen for auth changes (login/logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authToken') {
        if (e.newValue) {
          // User logged in - sync cart
          console.log('Auth token added, syncing cart...');
          setTimeout(() => syncWithBackend(true), 500);
        } else {
          // User logged out - clear synced user ID
          console.log('Auth token removed, clearing sync status');
          lastSyncedUserId.current = null;
        }
      }
    };

    // Listen for custom auth events
    const handleAuthChange = (e) => {
      if (e.detail?.type === 'login') {
        console.log('Login event received, syncing cart...');
        setTimeout(() => syncWithBackend(true), 500);
      } else if (e.detail?.type === 'logout') {
        console.log('Logout event received');
        lastSyncedUserId.current = null;
        // Optionally clear cart on logout
        // setCartItems([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    // Initial sync if already authenticated
    if (isAuthenticated() && !lastSyncedUserId.current) {
      syncWithBackend(true);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [isAuthenticated, syncWithBackend]);

  // Add item to cart
  const addToCart = useCallback(async (product, quantity = 1, options = {}) => {
    const newItem = {
      id: product.id || product.productId,
      nameEn: product.nameEn || product.productName || product.name,
      nameAr: product.nameAr || product.productNameAr || product.name,
      price: options.price || product.finalPrice || product.salePrice || product.price || product.originalPrice,
      originalPrice: product.originalPrice || product.actualPrice || product.price,
      salePrice: product.salePrice || product.finalPrice,
      finalPrice: product.finalPrice || product.salePrice,
      actualPrice: product.actualPrice || product.originalPrice,
      image: product.images ? product.images[0] : (product.image || product.imageUrl || product.primaryImageUrl),
      quantity: quantity,
      selectedVariant: options.selectedVariant || null,
      deliveryDate: options.deliveryDate || '',
      deliveryTime: options.deliveryTime || '',
      cardMessage: options.cardMessage || '',
      senderInfo: options.senderInfo || '',
      // Number Balloon Customization
      customizationText: options.customizationText || '',
      balloonColor: options.balloonColor || '',
      selectedNumbers: options.selectedNumbers || [],
    };

    // Update local state first (optimistic update)
    setCartItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        item => item.id === newItem.id && 
        item.selectedVariant === newItem.selectedVariant &&
        item.customizationText === newItem.customizationText
      );

      if (existingIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingIndex].quantity += quantity;
        return updatedItems;
      }

      return [...prevItems, newItem];
    });

    // Sync with backend if authenticated
    if (isAuthenticated()) {
      try {
        const backendCart = await cartService.addToCart(
          newItem.id,
          quantity,
          options
        );
        
        if (backendCart) {
          const transformedCart = cartService.transformBackendCart(backendCart);
          setCartItems(transformedCart);
        }
      } catch (error) {
        console.error('Error adding to cart on backend:', error);
        // Keep local state as fallback
      }
    }

    // Show cart notification
    setIsCartOpen(true);
    setTimeout(() => setIsCartOpen(false), 3000);
  }, [isAuthenticated]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId, selectedVariant = null, customizationText = '') => {
    // Find the item to get its cartItemId if available
    const itemToRemove = cartItems.find(
      item => item.id === itemId && item.selectedVariant === selectedVariant && item.customizationText === customizationText
    );

    // Update local state first
    setCartItems(prevItems => 
      prevItems.filter(item => 
        !(item.id === itemId && item.selectedVariant === selectedVariant && item.customizationText === customizationText)
      )
    );

    // Sync with backend if authenticated
    if (isAuthenticated() && itemToRemove) {
      try {
        if (itemToRemove.cartItemId) {
          await cartService.removeFromCart(itemToRemove.cartItemId);
        } else {
          await cartService.removeByProduct(itemId, selectedVariant);
        }
      } catch (error) {
        console.error('Error removing from cart on backend:', error);
      }
    }
  }, [cartItems, isAuthenticated]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId, selectedVariant, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId, selectedVariant);
      return;
    }

    // Find the item to get its cartItemId
    const itemToUpdate = cartItems.find(
      // eslint-disable-next-line no-undef
      item => item.id === itemId && item.selectedVariant === selectedVariant && item.customizationText === customizationText
    );

    // Update local state first
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId && item.selectedVariant === selectedVariant
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    // Sync with backend if authenticated
    if (isAuthenticated() && itemToUpdate?.cartItemId) {
      try {
        await cartService.updateCartItem(itemToUpdate.cartItemId, newQuantity);
      } catch (error) {
        console.error('Error updating cart on backend:', error);
      }
    }
  }, [cartItems, isAuthenticated, removeFromCart]);

  // Increase quantity by 1
  const increaseQuantity = useCallback((itemId, selectedVariant = null) => {
    const item = cartItems.find(
      i => i.id === itemId && i.selectedVariant === selectedVariant
    );
    if (item) {
      updateQuantity(itemId, selectedVariant, item.quantity + 1);
    }
  }, [cartItems, updateQuantity]);

  // Decrease quantity by 1
  const decreaseQuantity = useCallback((itemId, selectedVariant = null) => {
    const item = cartItems.find(
      i => i.id === itemId && i.selectedVariant === selectedVariant
    );
    if (item) {
      updateQuantity(itemId, selectedVariant, item.quantity - 1);
    }
  }, [cartItems, updateQuantity]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    setCartItems([]);
    localStorage.removeItem('hollandFlowersCart');

    // Sync with backend if authenticated
    if (isAuthenticated()) {
      try {
        await cartService.clearCart();
      } catch (error) {
        console.error('Error clearing cart on backend:', error);
      }
    }
  }, [isAuthenticated]);

  // Get cart total (sale price)
  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || parseFloat(item.finalPrice) || parseFloat(item.salePrice) || 0;
      return total + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  // Get original total (before discounts)
  const getOriginalTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.originalPrice) || parseFloat(item.actualPrice) || parseFloat(item.price) || 0;
      return total + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  // Get total savings
  const getTotalSavings = useCallback(() => {
    const original = getOriginalTotal();
    const current = getCartTotal();
    return Math.max(0, original - current);
  }, [getOriginalTotal, getCartTotal]);

  // Get cart count
  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Check if item is in cart
  const isInCart = useCallback((itemId) => {
    return cartItems.some(item => item.id === itemId);
  }, [cartItems]);

  // Get item quantity
  const getItemQuantity = useCallback((itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    return item ? item.quantity : 0;
  }, [cartItems]);

  // Toggle cart sidebar
  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  // Force sync (can be called manually)
  const forceSync = useCallback(() => {
    return syncWithBackend(true);
  }, [syncWithBackend]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    getCartTotal,
    getOriginalTotal,
    getTotalSavings,
    getCartCount,
    isInCart,
    getItemQuantity,
    isCartOpen,
    setIsCartOpen,
    toggleCart,
    openCart,
    closeCart,
    // New sync-related exports
    isSyncing,
    syncWithBackend: forceSync,
    isAuthenticated,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;