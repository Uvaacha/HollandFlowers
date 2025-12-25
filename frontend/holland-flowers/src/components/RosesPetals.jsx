import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import './RosesPetals.css';

const RosesPetals = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);
    const handleLangChange = (e) => setCurrentLang(e.detail);
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

        // Find Roses Petals category - flexible search
        const petalsCategory = categories.find(cat => {
          const name = (cat.categoryName || cat.nameEn || cat.name || '').toLowerCase();
          return name === 'roses petals' || name === 'rose petals' || 
                 name === 'petals' || name.includes('petal');
        });

        if (!petalsCategory) {
          console.warn('Category not found. Available:', categories.map(c => c.categoryName));
          setError('Category not found. Please create "Roses Petals" category in admin.');
          setProducts([]);
          setLoading(false);
          return;
        }

        console.log('Found category:', petalsCategory);

        const productsResponse = await productService.getProductsByCategory(petalsCategory.categoryId, {
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
      pageTitle: "Roses Petals",
      pageSubtitle: "Beautiful rose petals for romantic occasions and decorations",
      breadcrumbHome: "Home",
      breadcrumbFlowers: "Flowers",
      breadcrumbCurrent: "Roses Petals",
      addToCart: "Add to Cart",
      currency: "KD",
      mixBadge: "Mix Colors",
      redBadge: "Red",
      loading: "Loading rose petals...",
      noProducts: "No rose petals available yet.",
      error: "Something went wrong",
    },
    ar: {
      pageTitle: "بتلات الورد",
      pageSubtitle: "بتلات ورد جميلة للمناسبات الرومانسية والديكورات",
      breadcrumbHome: "الرئيسية",
      breadcrumbFlowers: "الزهور",
      breadcrumbCurrent: "بتلات الورد",
      addToCart: "أضف للسلة",
      currency: "د.ك",
      mixBadge: "ألوان مشكلة",
      redBadge: "أحمر",
      loading: "جاري تحميل بتلات الورد...",
      noProducts: "لا توجد بتلات ورد متاحة حالياً.",
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
    const name = getProductName(product).toLowerCase();
    
    if (tags.includes('red') || name.includes('red')) return 'red';
    if (tags.includes('mix') || name.includes('mix')) return 'mix';
    return null;
  };

  const getBadgeText = (badge) => {
    switch(badge) {
      case 'mix': return t.mixBadge;
      case 'red': return t.redBadge;
      default: return '';
    }
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
    <div className={`roses-petals-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      <div className="roses-petals-bg">
        <div className="rp-glow glow-1"></div>
        <div className="rp-glow glow-2"></div>
        <div className="floating-rp frp-1">🌹</div>
        <div className="floating-rp frp-2">🥀</div>
        <div className="floating-rp frp-3">💕</div>
        <div className="floating-rp frp-4">✨</div>
      </div>

      <nav className="breadcrumb-nav">
        <div className="container">
          <ol className="breadcrumb">
            <li><Link to="/">{t.breadcrumbHome}</Link></li>
            <li className="separator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></li>
            <li><Link to="/flowers">{t.breadcrumbFlowers}</Link></li>
            <li className="separator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></li>
            <li className="current">{t.breadcrumbCurrent}</li>
          </ol>
        </div>
      </nav>

      <header className="page-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🌹</span>
              <span>{currentLang === 'ar' ? 'رومانسية' : 'Romantic'}</span>
              <span>🌹</span>
            </div>
            <h1 className="hero-title">{t.pageTitle}</h1>
            <p className="hero-subtitle">{t.pageSubtitle}</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{products.length}</span>
                <span className="stat-label">{currentLang === 'ar' ? 'منتج' : 'Products'}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">💕</span>
                <span className="stat-label">{currentLang === 'ar' ? 'رومانسي' : 'Romance'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="products-section">
        <div className="container">
          {/* Loading State */}
          {loading && (
            <div className="loading-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner" style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #e11d48',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#be123c' }}>{t.loading}</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-state" style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#fff1f2',
              borderRadius: '12px',
              margin: '20px 0'
            }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#e74c3c', margin: '0 0 8px' }}>{t.error}</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#be123c' }}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌹</div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#be123c' }}>{t.noProducts}</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <div className="products-grid">
              {products.map((product, index) => {
                const productName = getProductName(product);
                const productDesc = getProductDescription(product);
                const productImage = getProductImage(product);
                const finalPrice = getFinalPrice(product);
                const badge = getProductBadge(product);
                const productSlug = getProductSlug(product);

                return (
                  <Link 
                    to={`/product/${productSlug}`}
                    key={product.productId || product.id} 
                    className="product-card"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {badge && (
                      <span className={`product-badge badge-${badge}`}>
                        {getBadgeText(badge)}
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
                        {productDesc || (currentLang === 'ar' ? 'بتلات ورد للديكور' : 'Rose petals for decoration')}
                      </p>
                      <div className="product-footer">
                        <span className="price">{parseFloat(finalPrice).toFixed(3)} KWD</span>
                        <span 
                          className="cart-icon-btn" 
                          onClick={(e) => handleAddToCart(e, product)}
                          aria-label={t.addToCart}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
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

      <section className="info-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-icon">💕</div>
            <div className="banner-text">
              <h3>{currentLang === 'ar' ? 'بتلات رومانسية' : 'Romantic Petals'}</h3>
              <p>{currentLang === 'ar' 
                ? 'بتلات ورد مثالية لتزيين حفلات الزفاف والمناسبات الرومانسية والمفاجآت الخاصة' 
                : 'Perfect rose petals for decorating weddings, romantic occasions and special surprises'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RosesPetals;