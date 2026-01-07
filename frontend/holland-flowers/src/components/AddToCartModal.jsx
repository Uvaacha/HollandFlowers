import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import api from '../services/api';
import './AddToCartModal.css';

const AddToCartModal = ({ isOpen = true, onClose, addedProduct, product, currentLang = 'en' }) => {
  const { cartItems, addToCart } = useCart();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Acrylic Toppers');
  const [categories, setCategories] = useState(['Acrylic Toppers']);
  const [addingToCart, setAddingToCart] = useState({});

  // Support both 'product' and 'addedProduct' prop names
  const productData = addedProduct || product;

  // Calculate cart subtotal
  const cartSubtotal = cartItems.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = item.quantity || 1;
    return total + (price * quantity);
  }, 0);

  // Fetch suggestions when modal opens
  useEffect(() => {
    if (productData) {
      fetchAllSuggestions();
    }
  }, [productData]);

  const fetchAllSuggestions = async () => {
    setLoading(true);
    try {
      // Fetch all categories first
      const catResponse = await api.get('/categories');
      const allCategories = catResponse.data?.data || catResponse.data || [];
      
      // Define tabs with display names and search keywords
      const tabConfig = [
        { displayName: 'Acrylic Toppers', keywords: ['acrylic', 'topper', 'celebration'] },
        { displayName: 'Helium Balloons', keywords: ['helium', 'balloon'] },
        { displayName: 'Crown for Head', keywords: ['crown'] },
      ];
      
      const suggestionsByTab = {};
      
      // Fetch products for each category
      for (const tab of tabConfig) {
        // Find matching category by keywords
        const category = allCategories.find(c => {
          const catName = (c.categoryName || c.name || '').toLowerCase();
          return tab.keywords.some(keyword => catName.includes(keyword.toLowerCase()));
        });
        
        if (category) {
          try {
            const categoryId = category.categoryId || category.id;
            const prodResponse = await api.get(`/products/category/${categoryId}`, {
              params: { page: 0, size: 10 }
            });
            const products = prodResponse.data?.data?.content || prodResponse.data?.content || prodResponse.data?.data || prodResponse.data || [];
            suggestionsByTab[tab.displayName] = Array.isArray(products) ? products : [];
          } catch (e) {
            console.error(`Error fetching ${tab.displayName}:`, e);
            suggestionsByTab[tab.displayName] = [];
          }
        } else {
          suggestionsByTab[tab.displayName] = [];
        }
      }
      
      const tabCategories = tabConfig.map(t => t.displayName);

      // Filter out empty categories and set state
      const activeTabs = tabCategories.filter(tab => suggestionsByTab[tab]?.length > 0);
      setCategories(activeTabs.length > 0 ? activeTabs : tabCategories);
      setSuggestions(suggestionsByTab);
      
      // Set active tab to first available with products, or first tab
      if (activeTabs.length > 0) {
        setActiveTab(activeTabs[0]);
      } else {
        setActiveTab(tabCategories[0]);
      }
      
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (suggestionProduct) => {
    const productId = suggestionProduct.productId || suggestionProduct.id;
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    
    try {
      const imageUrl = getProductImage(suggestionProduct);
      const price = getProductPrice(suggestionProduct);

      const cartItem = {
        ...suggestionProduct,
        image: imageUrl,
        price: price,
        quantity: 1
      };

      addToCart(cartItem, 1, { price: price });
      
      setTimeout(() => {
        setAddingToCart(prev => ({ ...prev, [productId]: false }));
      }, 1500);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  const getProductImage = (prod) => {
    return prod.imageUrl || 
           prod.image || 
           prod.productImage ||
           (prod.images && prod.images.length > 0 ? prod.images[0] : null) ||
           '/placeholder-cake.jpg';
  };

  // Get product price - using YOUR EXACT API field names
  const getProductPrice = (prod) => {
    // Primary: finalPrice (price after discount)
    if (prod.finalPrice !== undefined && prod.finalPrice !== null) {
      const price = parseFloat(prod.finalPrice);
      if (!isNaN(price) && price > 0) return price;
    }
    
    // Fallback: actualPrice (original price)
    if (prod.actualPrice !== undefined && prod.actualPrice !== null) {
      const price = parseFloat(prod.actualPrice);
      if (!isNaN(price) && price > 0) return price;
    }
    
    // Other fallbacks
    if (prod.price) return parseFloat(prod.price);
    if (prod.salePrice) return parseFloat(prod.salePrice);
    if (prod.offerPrice) return parseFloat(prod.offerPrice);
    
    return 0;
  };

  // Get original price for showing crossed-out price
  const getOriginalPrice = (prod) => {
    const currentPrice = getProductPrice(prod);
    
    // Check if there's a discount (offerPercentage > 0)
    if (prod.offerPercentage && parseFloat(prod.offerPercentage) > 0) {
      // If actualPrice is higher than finalPrice, show it crossed out
      if (prod.actualPrice && parseFloat(prod.actualPrice) > currentPrice) {
        return parseFloat(prod.actualPrice);
      }
    }
    
    return null;
  };

  const hasVariants = (prod) => {
    return (prod.sizeOptions && prod.sizeOptions.length > 1) ||
           (prod.variants && prod.variants.length > 0) ||
           (prod.hasVariants === true);
  };

  const currentSuggestions = suggestions[activeTab] || [];

  if (!productData) return null;

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal-container" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button className="cart-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Header */}
        <div className="cart-modal-header">
          <h2>{currentLang === 'ar' ? 'تمت الإضافة إلى سلة التسوق' : "You've added items to your cart"}</h2>
          <p className="cart-subtotal">
            {currentLang === 'ar' ? 'المجموع الفرعي' : 'Cart subtotal'} : <strong>KWD {cartSubtotal.toFixed(3)}</strong>
          </p>
        </div>

        {/* Make it Perfect Section */}
        <div className="make-it-perfect">
          <span className="gift-icon">🎁</span>
          <span>{currentLang === 'ar' ? 'اجعلها مثالية' : 'Make it perfect'}</span>
        </div>

        {/* Category Tabs */}
        <div className="suggestion-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`suggestion-tab ${activeTab === cat ? 'active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {currentLang === 'ar' ? getArabicCategoryName(cat) : cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="suggestion-products-grid">
          {loading ? (
            <div className="suggestions-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : currentSuggestions.length > 0 ? (
            currentSuggestions.map((prod) => {
              const productId = prod.productId || prod.id;
              const isAdding = addingToCart[productId];
              const originalPrice = getOriginalPrice(prod);
              const currentPrice = getProductPrice(prod);
              
              return (
                <div key={productId} className="suggestion-product-card">
                  <div className="suggestion-product-image-wrapper">
                    <Link to={`/product/${productId}`} onClick={onClose}>
                      <div className="suggestion-product-image">
                        <img 
                          src={getProductImage(prod)} 
                          alt={prod.productName || prod.name}
                          onError={(e) => { e.target.src = '/placeholder-cake.jpg'; }}
                        />
                      </div>
                    </Link>
                    
                    {/* Circular Add Button */}
                    {!hasVariants(prod) && (
                      <button
                        className={`suggestion-add-circle-btn ${isAdding ? 'added' : ''}`}
                        onClick={() => handleAddToCart(prod)}
                        disabled={isAdding}
                        aria-label={currentLang === 'ar' ? 'أضف إلى السلة' : 'Add to cart'}
                      >
                        {isAdding ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  
                  <div className="suggestion-product-info">
                    {/* Price Display */}
                    <div className="suggestion-price-wrapper">
                      {originalPrice && originalPrice > currentPrice && (
                        <span className="suggestion-original-price">
                          KD {parseFloat(originalPrice).toFixed(3)}
                        </span>
                      )}
                      <span className={`suggestion-product-price ${originalPrice ? 'has-discount' : ''}`}>
                        KD {parseFloat(currentPrice).toFixed(3)}
                      </span>
                    </div>
                    
                    <h4 className="suggestion-product-name">
                      {currentLang === 'ar' 
                        ? (prod.productNameAr || prod.nameAr || prod.productName || prod.name)
                        : (prod.productName || prod.name)}
                    </h4>
                    
                    {hasVariants(prod) && (
                      <Link 
                        to={`/product/${productId}`} 
                        className="suggestion-select-btn"
                        onClick={onClose}
                      >
                        {currentLang === 'ar' ? 'اختر الخيارات' : 'Select Options'}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-suggestions">
              {currentLang === 'ar' ? 'لا توجد منتجات في هذه الفئة' : 'No products in this category'}
            </p>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="cart-modal-footer">
          <button className="continue-shopping-btn" onClick={onClose}>
            {currentLang === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
          </button>
          <button className="view-cart-btn" onClick={handleViewCart}>
            {currentLang === 'ar' ? 'عرض السلة' : 'View Cart'} ({cartItems.length})
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function for Arabic category names
const getArabicCategoryName = (name) => {
  const translations = {
    'Acrylic Toppers': 'توبرات أكريليك',
    'Helium Balloons': 'بالونات هيليوم',
    'Crown for Head': 'تاج للرأس',
  };
  return translations[name] || name;
};

export default AddToCartModal;