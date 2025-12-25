import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import './BirthdayBouquets.css';

const BirthdayBouquets = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [activeFilter, setActiveFilter] = useState('all');
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

        // Find Birthday Bouquets category - flexible search
        const birthdayCategory = categories.find(cat => {
          const name = (cat.categoryName || cat.nameEn || cat.name || '').toLowerCase();
          return name === 'birthday bouquets' || name === 'birthday' || 
                 name === 'birthday & get well' || name.includes('birthday') ||
                 name.includes('get well');
        });

        if (!birthdayCategory) {
          console.warn('Category not found. Available:', categories.map(c => c.categoryName));
          setError('Category not found. Please create "Birthday Bouquets" category in admin.');
          setProducts([]);
          setLoading(false);
          return;
        }

        console.log('Found category:', birthdayCategory);

        const productsResponse = await productService.getProductsByCategory(birthdayCategory.categoryId, {
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
      pageTitle: "Birthday & Get Well Soon",
      pageSubtitle: "Celebrate special moments with our thoughtful bouquets and arrangements",
      breadcrumbHome: "Home",
      breadcrumbBouquets: "Bouquets",
      breadcrumbCurrent: "Birthday Bouquets",
      addToCart: "Add to Cart",
      birthdayBadge: "Birthday",
      getWellBadge: "Get Well",
      giftBadge: "Gift Set",
      filterAll: "All",
      filterBirthday: "Birthday",
      filterGetWell: "Get Well Soon",
      loading: "Loading birthday bouquets...",
      noProducts: "No birthday bouquets available yet.",
      error: "Something went wrong",
    },
    ar: {
      pageTitle: "عيد ميلاد وشفاء عاجل",
      pageSubtitle: "احتفل بالمناسبات الخاصة مع باقاتنا وترتيباتنا المميزة",
      breadcrumbHome: "الرئيسية",
      breadcrumbBouquets: "الباقات",
      breadcrumbCurrent: "باقات عيد الميلاد",
      addToCart: "أضف للسلة",
      birthdayBadge: "عيد ميلاد",
      getWellBadge: "شفاء عاجل",
      giftBadge: "طقم هدية",
      filterAll: "الكل",
      filterBirthday: "عيد ميلاد",
      filterGetWell: "شفاء عاجل",
      loading: "جاري تحميل باقات عيد الميلاد...",
      noProducts: "لا توجد باقات عيد ميلاد متاحة حالياً.",
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

  const hasDiscount = (product) => {
    const original = getOriginalPrice(product);
    const final = getFinalPrice(product);
    return original > 0 && final > 0 && original > final;
  };

  const getProductSlug = (product) => {
    return product.productId || product.sku || product.slug || product.id;
  };

  const getProductBadge = (product) => {
    const tags = (product.tags || '').toLowerCase();
    const name = getProductName(product).toLowerCase();
    
    if (tags.includes('getwell') || tags.includes('get well') || name.includes('get well')) return 'getwell';
    if (tags.includes('gift') || name.includes('gift') || name.includes('tray')) return 'gift';
    if (tags.includes('birthday') || name.includes('birthday') || name.includes('happy')) return 'birthday';
    if (product.isFeatured || product.featured) return 'birthday';
    return null;
  };

  const getProductCategory = (product) => {
    const tags = (product.tags || '').toLowerCase();
    const name = getProductName(product).toLowerCase();
    
    if (tags.includes('getwell') || tags.includes('get well') || name.includes('get well')) return 'getwell';
    return 'birthday';
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

  // Filter products
  const filteredProducts = activeFilter === 'all' 
    ? products 
    : products.filter(p => getProductCategory(p) === activeFilter);

  return (
    <div className={`birthday-bouquets-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Decorative Background */}
      <div className="birthday-bg">
        <div className="confetti confetti-1"></div>
        <div className="confetti confetti-2"></div>
        <div className="floating-balloon fb-1">🎈</div>
        <div className="floating-balloon fb-2">🎂</div>
        <div className="floating-balloon fb-3">🎁</div>
        <div className="floating-balloon fb-4">💐</div>
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
              <span>🎂</span>
              <span>{currentLang === 'ar' ? 'مناسبات سعيدة' : 'Happy Occasions'}</span>
              <span>🎁</span>
            </div>
            <h1 className="hero-title">{t.pageTitle}</h1>
            <p className="hero-subtitle">{t.pageSubtitle}</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{products.length}</span>
                <span className="stat-label">{currentLang === 'ar' ? 'منتج' : 'Items'}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">15%</span>
                <span className="stat-label">{currentLang === 'ar' ? 'خصم' : 'Off'}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">🎉</span>
                <span className="stat-label">{currentLang === 'ar' ? 'هدايا' : 'Gifts'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Section */}
      <section className="filter-section">
        <div className="container">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              {t.filterAll}
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'birthday' ? 'active' : ''}`}
              onClick={() => setActiveFilter('birthday')}
            >
              🎂 {t.filterBirthday}
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'getwell' ? 'active' : ''}`}
              onClick={() => setActiveFilter('getwell')}
            >
              💐 {t.filterGetWell}
            </button>
          </div>
        </div>
      </section>

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
                borderTop: '3px solid #ff9800',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#a05000' }}>{t.loading}</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-state" style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#fff5f0',
              borderRadius: '12px',
              margin: '20px 0'
            }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#e74c3c', margin: '0 0 8px' }}>{t.error}</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#a05000' }}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎂</div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#a05000' }}>{t.noProducts}</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="products-grid">
              {filteredProducts.map((product, index) => {
                const productName = getProductName(product);
                const productDesc = getProductDescription(product);
                const productImage = getProductImage(product);
                const originalPrice = getOriginalPrice(product);
                const finalPrice = getFinalPrice(product);
                const showDiscount = hasDiscount(product);
                const badge = getProductBadge(product);
                const productSlug = getProductSlug(product);

                return (
                  <Link 
                    to={`/product/${productSlug}`}
                    key={product.productId || product.id} 
                    className="product-card"
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    {badge && (
                      <span className={`product-badge badge-${badge}`}>
                        {badge === 'birthday' ? t.birthdayBadge : badge === 'getwell' ? t.getWellBadge : t.giftBadge}
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
                        {productDesc || (currentLang === 'ar' ? 'باقة مناسبات جميلة' : 'Beautiful occasion bouquet')}
                      </p>
                      <div className="product-footer">
                        <div className="price-wrapper">
                          {showDiscount && (
                            <span className="original-price">
                              KD {parseFloat(originalPrice).toFixed(3)}
                            </span>
                          )}
                          <span className="sale-price">
                            KD {parseFloat(finalPrice).toFixed(3)}
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
            <div className="banner-icon">🎉</div>
            <div className="banner-text">
              <h3>{currentLang === 'ar' ? 'اجعل كل مناسبة مميزة' : 'Make Every Occasion Special'}</h3>
              <p>{currentLang === 'ar' 
                ? 'من أعياد الميلاد إلى تمنيات الشفاء العاجل، باقاتنا المصممة بعناية تنقل مشاعرك بأجمل طريقة' 
                : 'From birthdays to get well wishes, our thoughtfully designed bouquets convey your feelings in the most beautiful way'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BirthdayBouquets;