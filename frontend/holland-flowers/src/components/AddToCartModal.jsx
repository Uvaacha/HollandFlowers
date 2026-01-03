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
  const [activeTab, setActiveTab] = useState('Recommended');
  const [categories, setCategories] = useState(['Recommended']);
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
        { displayName: 'Recommended', keywords: [] },
        { displayName: 'Acrylic Toppers', keywords: ['acrylic', 'topper'] },
        { displayName: 'Helium Balloons', keywords: ['helium', 'balloon'] },
        { displayName: 'Crown for Head', keywords: ['crown'] },
      ];
      
      const suggestionsByTab = {};
      
      // Fetch products for each category
      for (const tab of tabConfig) {
        if (tab.displayName === 'Recommended') {
          // For recommended, get a mix of products
          try {
            const response = await api.get('/products', {
              params: { page: 0, size: 10, active: true }
            });
            const products = response.data?.content || response.data?.data?.content || response.data || [];
            suggestionsByTab['Recommended'] = Array.isArray(products) ? products.slice(0, 6) : [];
          } catch (e) {
            suggestionsByTab['Recommended'] = [];
          }
        } else {
          // Find matching category by keywords
          const category = allCategories.find(c => {
            const catName = (c.categoryName || '').toLowerCase();
            return tab.keywords.some(keyword => catName.includes(keyword.toLowerCase()));
          });
          
          if (category) {
            try {
              const prodResponse = await api.get(`/products/category/${category.categoryId}`, {
                params: { page: 0, size: 10 }
              });
              const products = prodResponse.data?.content || prodResponse.data?.data?.content || prodResponse.data || [];
              suggestionsByTab[tab.displayName] = Array.isArray(products) ? products : [];
            } catch (e) {
              suggestionsByTab[tab.displayName] = [];
            }
          } else {
            suggestionsByTab[tab.displayName] = [];
          }
        }
      }
      
      const tabCategories = tabConfig.map(t => t.displayName);

      // Filter out empty categories and set state
      const activeTabs = tabCategories.filter(tab => suggestionsByTab[tab]?.length > 0);
      setCategories(activeTabs.length > 0 ? activeTabs : ['Recommended']);
      setSuggestions(suggestionsByTab);
      
      // Set active tab to first available
      if (activeTabs.length > 0 && !activeTabs.includes(activeTab)) {
        setActiveTab(activeTabs[0]);
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
      // Get product image
      const imageUrl = suggestionProduct.imageUrl || 
                       suggestionProduct.image ||
                       (suggestionProduct.images && suggestionProduct.images[0]) ||
                       '/placeholder-cake.jpg';
      
      // Get price
      const price = suggestionProduct.offerPrice || 
                    suggestionProduct.price || 
                    suggestionProduct.basePrice ||
                    (suggestionProduct.sizeOptions?.[0]?.price) || 0;

      const cartItem = {
        ...suggestionProduct,
        image: imageUrl,
        price: price,
        quantity: 1
      };

      addToCart(cartItem, 1, { price: price });
      
      // Brief success state
      setTimeout(() => {
        setAddingToCart(prev => ({ ...prev, [productId]: false }));
      }, 1000);
      
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
           (prod.images && prod.images[0]) ||
           '/placeholder-cake.jpg';
  };

  const getProductPrice = (prod) => {
    return prod.offerPrice || 
           prod.price || 
           prod.basePrice ||
           (prod.sizeOptions?.[0]?.price) || 0;
  };

  const hasVariants = (prod) => {
    return (prod.sizeOptions && prod.sizeOptions.length > 1) ||
           (prod.variants && prod.variants.length > 0);
  };

  const currentSuggestions = suggestions[activeTab] || [];

  // Don't render if no product data
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
              
              return (
                <div key={productId} className="suggestion-product-card">
                  <Link to={`/product/${productId}`} onClick={onClose}>
                    <div className="suggestion-product-image">
                      <img 
                        src={getProductImage(prod)} 
                        alt={prod.productName || prod.name}
                        onError={(e) => { e.target.src = '/placeholder-cake.jpg'; }}
                      />
                    </div>
                  </Link>
                  
                  <div className="suggestion-product-info">
                    <p className="suggestion-product-price">
                      KWD {parseFloat(getProductPrice(prod)).toFixed(3)}
                    </p>
                    <h4 className="suggestion-product-name">
                      {currentLang === 'ar' 
                        ? (prod.productNameAr || prod.productName || prod.name)
                        : (prod.productName || prod.name)}
                    </h4>
                    
                    {hasVariants(prod) ? (
                      <Link 
                        to={`/product/${productId}`} 
                        className="suggestion-select-btn"
                        onClick={onClose}
                      >
                        {currentLang === 'ar' ? 'اختر الخيارات' : 'Select Options'}
                      </Link>
                    ) : (
                      <button
                        className={`suggestion-add-btn ${isAdding ? 'added' : ''}`}
                        onClick={() => handleAddToCart(prod)}
                        disabled={isAdding}
                      >
                        {isAdding 
                          ? (currentLang === 'ar' ? 'تمت الإضافة ✓' : 'Added ✓')
                          : (currentLang === 'ar' ? 'أضف' : 'Add')}
                      </button>
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
    'Recommended': 'موصى به',
    'Acrylic Toppers': 'توبرات أكريليك',
    'Helium Balloons': 'بالونات هيليوم',
    'Crown for Head': 'تاج للرأس',
    'ADD ON\'S': 'إضافات',
  };
  return translations[name] || name;
};

export default AddToCartModal;