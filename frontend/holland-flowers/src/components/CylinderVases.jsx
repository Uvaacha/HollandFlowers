import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import './CylinderVases.css';

const CylinderVases = () => {
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

        // Find Cylinder Vases category - flexible search
        const cylinderCategory = categories.find(cat => {
          const name = (cat.categoryName || cat.nameEn || cat.name || '').toLowerCase();
          return name === 'cylinder vases' || name === 'cylinder vase' || 
                 name.includes('cylinder');
        });

        if (!cylinderCategory) {
          console.warn('Category not found. Available:', categories.map(c => c.categoryName));
          setError('Category not found. Please create "Cylinder Vases" category in admin.');
          setProducts([]);
          setLoading(false);
          return;
        }

        console.log('Found category:', cylinderCategory);

        const productsResponse = await productService.getProductsByCategory(cylinderCategory.categoryId, {
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
      pageTitle: "Cylinder Vases",
      pageSubtitle: "Modern cylinder vase arrangements with lilium and roses",
      breadcrumbHome: "Home",
      breadcrumbFlowers: "Flowers",
      breadcrumbCurrent: "Cylinder Vases",
      addToCart: "Add to Cart",
      currency: "KD",
      liliumBadge: "Lilium",
      roseBadge: "Rose",
      mixBadge: "Mix",
      loading: "Loading cylinder vases...",
      noProducts: "No cylinder vases available yet.",
      error: "Something went wrong",
    },
    ar: {
      pageTitle: "مزهريات اسطوانية",
      pageSubtitle: "ترتيبات مزهريات اسطوانية عصرية مع الليليوم والورود",
      breadcrumbHome: "الرئيسية",
      breadcrumbFlowers: "الزهور",
      breadcrumbCurrent: "مزهريات اسطوانية",
      addToCart: "أضف للسلة",
      currency: "د.ك",
      liliumBadge: "ليليوم",
      roseBadge: "ورد",
      mixBadge: "مشكل",
      loading: "جاري تحميل المزهريات الاسطوانية...",
      noProducts: "لا توجد مزهريات اسطوانية متاحة حالياً.",
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
    
    if (tags.includes('mix') || (name.includes('lilium') && name.includes('rose')) || name.includes('mixed')) return 'mix';
    if (tags.includes('lilium') || name.includes('lilium')) return 'lilium';
    if (tags.includes('rose') || name.includes('rose')) return 'rose';
    return null;
  };

  const getBadgeText = (badge) => {
    switch(badge) {
      case 'lilium': return t.liliumBadge;
      case 'rose': return t.roseBadge;
      case 'mix': return t.mixBadge;
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
    <div className={`cylinder-vases-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      <div className="cylinder-vases-bg">
        <div className="cv-glow glow-1"></div>
        <div className="cv-glow glow-2"></div>
        <div className="floating-cv fcv-1">🏺</div>
        <div className="floating-cv fcv-2">🌸</div>
        <div className="floating-cv fcv-3">💜</div>
        <div className="floating-cv fcv-4">✨</div>
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
              <span>🏺</span>
              <span>{currentLang === 'ar' ? 'تصميم عصري' : 'Modern Design'}</span>
              <span>🏺</span>
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
                <span className="stat-number">🌸</span>
                <span className="stat-label">{currentLang === 'ar' ? 'ليليوم' : 'Lilium'}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">🌹</span>
                <span className="stat-label">{currentLang === 'ar' ? 'ورود' : 'Roses'}</span>
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
                borderTop: '3px solid #8b5cf6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#7c3aed' }}>{t.loading}</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-state" style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#f5f3ff',
              borderRadius: '12px',
              margin: '20px 0'
            }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#e74c3c', margin: '0 0 8px' }}>{t.error}</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#7c3aed' }}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏺</div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#7c3aed' }}>{t.noProducts}</p>
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
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    {badge && <span className={`product-badge badge-${badge}`}>{getBadgeText(badge)}</span>}
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
                        {productDesc || (currentLang === 'ar' ? 'ترتيب مزهرية اسطوانية' : 'Cylinder vase arrangement')}
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
            <div className="banner-icon">🏺</div>
            <div className="banner-text">
              <h3>{currentLang === 'ar' ? 'تصميمات اسطوانية عصرية' : 'Modern Cylinder Designs'}</h3>
              <p>{currentLang === 'ar' ? 'مزهريات اسطوانية أنيقة مع ليليوم وورود. مثالية للديكور العصري والهدايا' : 'Elegant cylinder vases with lilium and roses. Perfect for modern décor and gifts'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CylinderVases;