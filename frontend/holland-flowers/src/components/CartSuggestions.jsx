import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import api from '../services/api';
import './CartSuggestions.css';

const CartSuggestions = ({ currentLang = 'en' }) => {
  const { cartItems, addToCart } = useCart();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});

  // Fetch suggestions when cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [cartItems]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      let suggestedProducts = [];

      // Get all product IDs in cart
      const cartProductIds = cartItems.map(item => item.productId || item.id);

      // Strategy 1: Try to get products from ADD ON'S category
      try {
        const catResponse = await api.get('/categories');
        if (catResponse.data) {
          const categories = catResponse.data.data || catResponse.data || [];
          const addOnsCategory = categories.find(c => 
            c.categoryName?.toUpperCase().includes('ADD ON') ||
            c.categoryName?.toUpperCase().includes('ADDON') ||
            c.categoryName?.toUpperCase() === 'ADD ON\'S'
          );

          if (addOnsCategory) {
            const prodResponse = await api.get(`/products/category/${addOnsCategory.categoryId}`, {
              params: { page: 0, size: 8 }
            });
            if (prodResponse.data) {
              const products = prodResponse.data.content || prodResponse.data.data?.content || prodResponse.data || [];
              suggestedProducts = Array.isArray(products) ? products : [];
            }
          }
        }
      } catch (error) {
        console.log('Failed to fetch by category ID, trying alternative method');
      }

      // Strategy 2: If no products found, try direct API call
      if (suggestedProducts.length === 0) {
        try {
          const response = await api.get('/products', {
            params: {
              page: 0,
              size: 8,
              active: true
            }
          });

          if (response.data) {
            const products = response.data.content || response.data.data?.content || response.data || [];
            // Filter to only include add-on type products (balloons, toppers, etc.)
            suggestedProducts = (Array.isArray(products) ? products : []).filter(p => {
              const name = (p.productName || '').toUpperCase();
              const category = (p.categoryName || '').toUpperCase();
              return category.includes('ADD ON') ||
                     name.includes('BALLOON') ||
                     name.includes('TOPPER') ||
                     name.includes('CROWN') ||
                     name.includes('CHOCOLATE') ||
                     name.includes('PERFUME');
            });
          }
        } catch (error) {
          console.log('Failed to fetch products');
        }
      }

      // Filter out products already in cart
      suggestedProducts = suggestedProducts.filter(p => {
        const productId = p.productId || p.id;
        return !cartProductIds.includes(productId);
      });

      // Limit to 4-6 suggestions
      setSuggestions(suggestedProducts.slice(0, 6));
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    const productId = product.productId || product.id;
    setAddingToCart(prev => ({ ...prev, [productId]: true }));

    try {
      const cartItem = {
        productId: productId,
        id: productId,
        nameEn: product.productName || product.nameEn,
        nameAr: product.productNameAr || product.nameAr || product.productName,
        price: product.discountedPrice || product.price,
        originalPrice: product.price,
        image: product.imageUrl || product.image,
        quantity: 1
      };

      addToCart(cartItem);

      // Show success feedback
      setTimeout(() => {
        setAddingToCart(prev => ({ ...prev, [productId]: 'added' }));
        // Remove from suggestions after adding
        setTimeout(() => {
          setSuggestions(prev => prev.filter(p => (p.productId || p.id) !== productId));
          setAddingToCart(prev => ({ ...prev, [productId]: false }));
        }, 1000);
      }, 300);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  const formatPrice = (price) => {
    return parseFloat(price || 0).toFixed(3);
  };

  const t = {
    en: {
      title: 'Complete Your Gift',
      subtitle: 'Add these items to make your gift extra special',
      add: 'Add',
      added: 'Added ✓',
      adding: '...',
      kwd: 'KWD',
      viewAll: 'View All Add-ons'
    },
    ar: {
      title: 'أكمل هديتك',
      subtitle: 'أضف هذه العناصر لجعل هديتك مميزة',
      add: 'أضف',
      added: 'تمت ✓',
      adding: '...',
      kwd: 'د.ك',
      viewAll: 'عرض جميع الإضافات'
    }
  };

  const text = t[currentLang] || t.en;

  // Don't render if no suggestions or cart is empty
  if (loading) {
    return (
      <div className="cart-suggestions-loading">
        <div className="cs-spinner"></div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`cart-suggestions ${currentLang === 'ar' ? 'rtl' : ''}`}>
      <div className="cs-header">
        <div className="cs-title-wrap">
          <span className="cs-icon">🎁</span>
          <div>
            <h3 className="cs-title">{text.title}</h3>
            <p className="cs-subtitle">{text.subtitle}</p>
          </div>
        </div>
        <Link to="/category/add-ons" className="cs-view-all">
          {text.viewAll} →
        </Link>
      </div>

      <div className="cs-products-scroll">
        <div className="cs-products">
          {suggestions.map((product) => {
            const productId = product.productId || product.id;
            const isAdding = addingToCart[productId];

            return (
              <div key={productId} className="cs-product-card">
                <Link to={`/product/${productId}`} className="cs-product-image-link">
                  <img 
                    src={product.imageUrl || product.image} 
                    alt={currentLang === 'ar' ? product.productNameAr : product.productName}
                    className="cs-product-image"
                  />
                </Link>
                <div className="cs-product-info">
                  <Link to={`/product/${productId}`} className="cs-product-name">
                    {currentLang === 'ar' 
                      ? (product.productNameAr || product.productName)
                      : product.productName
                    }
                  </Link>
                  <div className="cs-product-bottom">
                    <span className="cs-product-price">
                      {text.kwd} {formatPrice(product.discountedPrice || product.price)}
                    </span>
                    <button 
                      className={`cs-add-btn ${isAdding === 'added' ? 'added' : ''}`}
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdding}
                    >
                      {isAdding === 'added' 
                        ? text.added 
                        : isAdding 
                          ? text.adding 
                          : `+ ${text.add}`
                      }
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CartSuggestions;