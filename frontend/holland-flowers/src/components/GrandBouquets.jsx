import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import './GrandBouquets.css';

const GrandBouquets = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);

    const handleLangChange = (e) => {
      setCurrentLang(e.detail);
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoriesResponse = await categoryService.getAllCategories();
        let categories = [];
        if (categoriesResponse.success && categoriesResponse.data) {
          categories = categoriesResponse.data.content || categoriesResponse.data || [];
        }

        // Find Grand Bouquets category - flexible search
        const grandCategory = categories.find(cat => {
          const name = (cat.categoryName || cat.nameEn || cat.name || '').toLowerCase();
          return name === 'grand bouquets' || name === 'grand' || 
                 name.includes('grand') || name.includes('luxury bouquets');
        });

        if (!grandCategory) {
          console.warn('Category not found. Available:', categories.map(c => c.categoryName));
          setError('Category not found. Please create "Grand Bouquets" category in admin.');
          setProducts([]);
          setLoading(false);
          return;
        }

        console.log('Found category:', grandCategory);

        const productsResponse = await productService.getProductsByCategory(grandCategory.categoryId, {
          page: 0,
          size: 100,
          sort: 'createdAt,desc'
        });

        let productsList = [];
        if (productsResponse.success && productsResponse.data) {
          productsList = productsResponse.data.content || productsResponse.data || [];
        }

        const activeProducts = productsList.filter(p => p.isActive !== false);
        setProducts(activeProducts);
        console.log('Loaded products:', activeProducts.length);

      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const translations = {
    en: {
      pageTitle: "Grand Bouquets",
      pageSubtitle: "Luxurious large-scale bouquets featuring 50-100 premium roses for unforgettable moments",
      breadcrumbHome: "Home",
      breadcrumbBouquets: "Bouquets",
      breadcrumbCurrent: "Grand Bouquets",
      addToCart: "Add to Cart",
      premiumBadge: "100 Roses",
      luxuryBadge: "Luxury",
      specialBadge: "Special",
      loading: "Loading grand bouquets...",
      noProducts: "No grand bouquets available yet.",
      error: "Something went wrong",
    },
    ar: {
      pageTitle: "الباقات الفاخرة",
      pageSubtitle: "باقات فاخرة كبيرة تضم 50-100 وردة فاخرة للحظات لا تُنسى",
      breadcrumbHome: "الرئيسية",
      breadcrumbBouquets: "الباقات",
      breadcrumbCurrent: "الباقات الفاخرة",
      addToCart: "أضف للسلة",
      premiumBadge: "100 وردة",
      luxuryBadge: "فاخر",
      specialBadge: "مميز",
      loading: "جاري تحميل الباقات الفاخرة...",
      noProducts: "لا توجد باقات فاخرة متاحة حالياً.",
      error: "حدث خطأ ما",
    }
  };

  const t = translations[currentLang];

  // Helper functions
  const getProductName = (product) => {
    if (currentLang === 'ar') {
      return product.productNameAr || product.nameAr || product.productName || product.name || 'Unknown';
    }
    return product.productName || product.nameEn || product.name || 'Unknown';
  };

  const getProductDescription = (product) => {
    if (currentLang === 'ar') {
      return product.shortDescriptionAr || product.descriptionAr || product.description || '';
    }
    return product.shortDescriptionEn || product.descriptionEn || product.shortDescription || product.description || '';
  };

  const getProductImage = (product) => {
    return product.imageUrl || product.primaryImageUrl || product.image || '/images/placeholder.webp';
  };

  const getOriginalPrice = (product) => {
    return product.actualPrice || product.originalPrice || product.price || 0;
  };

  const getFinalPrice = (product) => {
    return product.finalPrice || product.salePrice || product.price || product.actualPrice || 0;
  };

  const getProductSlug = (product) => {
    return product.productId || product.sku || product.slug || product.id;
  };

  const getProductBadge = (product) => {
    const tags = (product.tags || '').toLowerCase();
    const desc = getProductDescription(product).toLowerCase();
    
    if (tags.includes('100') || desc.includes('100 ')) return 'premium';
    if (tags.includes('luxury') || product.isLuxury || product.isPremium) return 'luxury';
    if (tags.includes('special') || product.isFeatured) return 'special';
    return null;
  };

  const hasDiscount = (product) => {
    const original = getOriginalPrice(product);
    const final = getFinalPrice(product);
    return original > 0 && final > 0 && original > final;
  };

  // Handle add to cart
  const handleAddToCart = (e, product) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const finalPrice = getFinalPrice(product);
    const originalPrice = getOriginalPrice(product);
    
    const cartItem = {
      id: product.productId || product.id,
      name: getProductName(product),
      nameEn: product.productName || product.nameEn || product.name,
      nameAr: product.productNameAr || product.nameAr || product.productName,
      price: finalPrice,
      salePrice: finalPrice,
      finalPrice: finalPrice,
      originalPrice: originalPrice,
      actualPrice: originalPrice,
      image: getProductImage(product),
      quantity: 1,
    };
    
    addToCart(cartItem);
    console.log('Added to cart:', cartItem);
  };

  return (
    <div className={`grand-bouquets-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Decorative Background */}
      <div className="grand-bg">
        <div className="luxury-glow glow-1"></div>
        <div className="luxury-glow glow-2"></div>
        <div className="floating-rose fr-1">🌹</div>
        <div className="floating-rose fr-2">💎</div>
        <div className="floating-rose fr-3">✨</div>
      </div>

      {/* Breadcrumb */}
      <nav className="breadcrumb-nav">
        <div className="container">
          <ol className="breadcrumb">
            <li><Link to="/">{t.breadcrumbHome}</Link></li>
            <li className="separator">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </li>
            <li><Link to="/bouquets">{t.breadcrumbBouquets}</Link></li>
            <li className="separator">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </li>
            <li className="current">{t.breadcrumbCurrent}</li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="page-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>👑</span>
              <span>{currentLang === 'ar' ? 'مجموعة فاخرة' : 'Luxury Collection'}</span>
              <span>👑</span>
            </div>
            <h1 className="hero-title">{t.pageTitle}</h1>
            <p className="hero-subtitle">{t.pageSubtitle}</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{products.length}</span>
                <span className="stat-label">{currentLang === 'ar' ? 'باقة' : 'Bouquets'}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">50-100</span>
                <span className="stat-label">{currentLang === 'ar' ? 'وردة' : 'Roses'}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">15%</span>
                <span className="stat-label">{currentLang === 'ar' ? 'خصم' : 'Off'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Products Grid */}
      <section className="products-section">
        <div className="container">
          {/* Loading State */}
          {loading && (
            <div className="loading-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner" style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #c48bc4',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#a07da0' }}>{t.loading}</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-state" style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#fdf6f8',
              borderRadius: '12px',
              margin: '20px 0'
            }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#e74c3c', margin: '0 0 8px' }}>{t.error}</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#a07da0' }}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👑</div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#a07da0' }}>{t.noProducts}</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <div className="products-grid">
              {products.map((product, index) => {
                const productName = getProductName(product);
                const productDesc = getProductDescription(product);
                const productImage = getProductImage(product);
                const originalPrice = getOriginalPrice(product);
                const finalPrice = getFinalPrice(product);
                const badge = getProductBadge(product);
                const productSlug = getProductSlug(product);
                const showDiscount = hasDiscount(product);

                return (
                  <Link 
                    to={`/product/${productSlug}`}
                    key={product.productId || product.id} 
                    className="product-card"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    {badge && (
                      <span className={`product-badge badge-${badge}`}>
                        {badge === 'premium' ? t.premiumBadge : badge === 'luxury' ? t.luxuryBadge : t.specialBadge}
                      </span>
                    )}
                    
                    <div className="product-image-wrapper">
                      <img 
                        src={productImage} 
                        alt={productName}
                        className="product-image"
                        loading="lazy"
                        onError={(e) => { e.target.src = '/images/placeholder.webp'; }}
                      />
                    </div>
                    
                    <div className="product-details">
                      <h3 className="product-name">{productName}</h3>
                      <p className="product-desc">
                        {productDesc || (currentLang === 'ar' ? 'باقة فاخرة كبيرة' : 'Luxurious grand bouquet')}
                      </p>
                      <div className="product-footer">
                        <div className="price-wrapper">
                          {showDiscount && (
                            <span className="original-price">
                              {parseFloat(originalPrice).toFixed(3)} KWD
                            </span>
                          )}
                          <span className="sale-price">
                            {parseFloat(finalPrice).toFixed(3)} KWD
                          </span>
                        </div>
                        <span 
                          className="cart-icon-btn" 
                          onClick={(e) => handleAddToCart(e, product)}
                          aria-label={t.addToCart}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Info Banner */}
      <section className="info-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-icon">💐</div>
            <div className="banner-text">
              <h3>{currentLang === 'ar' ? 'باقات فاخرة لمناسباتك المميزة' : 'Luxurious Bouquets for Your Special Occasions'}</h3>
              <p>{currentLang === 'ar' 
                ? 'باقاتنا الفاخرة تضم من 50 إلى 100 وردة هولندية فاخرة، مثالية للاحتفالات الكبرى والمناسبات التي لا تُنسى' 
                : 'Our grand bouquets feature 50 to 100 premium Holland roses, perfect for grand celebrations and unforgettable occasions'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GrandBouquets;