import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import './FlowersWithPerfume.css';

const FlowersWithPerfume = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
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

        // Find category - flexible search
        const perfumeCategory = categories.find(cat => {
          const name = (cat.categoryName || cat.nameEn || cat.name || '').toLowerCase();
          return name.includes('perfume') || 
                 (name.includes('flower') && name.includes('perfume'));
        });

        if (!perfumeCategory) {
          console.warn('Category not found. Available:', categories.map(c => c.categoryName));
          setError('Category not found. Please create "Flowers With Perfume" category in admin.');
          setProducts([]);
          setLoading(false);
          return;
        }

        console.log('Found category:', perfumeCategory);

        const productsResponse = await productService.getProductsByCategory(perfumeCategory.categoryId, {
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
      pageTitle: "Flowers With Perfume",
      pageSubtitle: "Exquisite flower arrangements paired with luxury Supreme Bouquet perfumes",
      breadcrumbHome: "Home",
      breadcrumbCombos: "Combos",
      breadcrumbCurrent: "Flowers With Perfume",
      filterAll: "All",
      filterRoses: "Roses",
      filterMixed: "Mixed Flowers",
      filterLuxury: "Luxury",
      filterClassic: "Classic",
      addToCart: "Add to Cart",
      currency: "KD",
      featuredBadge: "Bestseller",
      newBadge: "New",
      perfumeBadge: "With Perfume",
      loading: "Loading products...",
      noProducts: "No products available yet.",
      error: "Something went wrong",
      statProducts: "Products",
      statPerfume: "50ml Perfume",
      statGift: "Gift Ready",
    },
    ar: {
      pageTitle: "زهور مع عطر",
      pageSubtitle: "تنسيقات زهور رائعة مع عطور سوبريم بوكيه الفاخرة",
      breadcrumbHome: "الرئيسية",
      breadcrumbCombos: "الكومبو",
      breadcrumbCurrent: "زهور مع عطر",
      filterAll: "الكل",
      filterRoses: "ورود",
      filterMixed: "زهور مشكلة",
      filterLuxury: "فاخر",
      filterClassic: "كلاسيك",
      addToCart: "أضف للسلة",
      currency: "د.ك",
      featuredBadge: "الأكثر مبيعاً",
      newBadge: "جديد",
      perfumeBadge: "مع عطر",
      loading: "جاري تحميل المنتجات...",
      noProducts: "لا توجد منتجات متاحة حالياً.",
      error: "حدث خطأ ما",
      statProducts: "منتج",
      statPerfume: "عطر 50 مل",
      statGift: "جاهز للإهداء",
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

  const getProductTags = (product) => {
    const tags = product.tags || product.tag || '';
    if (Array.isArray(tags)) {
      return tags.join(',').toLowerCase();
    }
    return String(tags || '').toLowerCase().trim();
  };

  const getProductBadge = (product) => {
    if (product.isFeatured || product.featured) return 'bestseller';
    if (product.isNew || product.newArrival) return 'new';
    return null;
  };

  const hasDiscount = (product) => {
    const original = getOriginalPrice(product);
    const final = getFinalPrice(product);
    return original > 0 && final > 0 && original > final;
  };

  // Show all products (no filtering)
  const filteredProducts = products;

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
    <div className={`flowers-perfume-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Decorative Background */}
      <div className="perfume-bg">
        <div className="sparkle sparkle-1">✨</div>
        <div className="sparkle sparkle-2">✨</div>
        <div className="sparkle sparkle-3">✨</div>
        <div className="bg-gradient-orb orb-1"></div>
        <div className="bg-gradient-orb orb-2"></div>
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
            <li><Link to="/combos">{t.breadcrumbCombos}</Link></li>
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
            <div className="hero-icon">✨</div>
            <h1 className="hero-title">{t.pageTitle}</h1>
            <p className="hero-subtitle">{t.pageSubtitle}</p>
            
            {/* Hero Stats */}
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{products.length}</span>
                <span className="stat-label">{t.statProducts}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">50ml</span>
                <span className="stat-label">{t.statPerfume}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">🎁</span>
                <span className="stat-label">{t.statGift}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Products Section */}
      <section className="products-section">
        <div className="container">
          {/* Loading State */}
          {loading && (
            <div className="loading-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner" style={{
                width: '40px',
                height: '40px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #9b59b6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#8d7d9d' }}>{t.loading}</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="error-state" style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#fff5f5',
              borderRadius: '12px',
              margin: '20px 0'
            }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#e74c3c', margin: '0 0 8px' }}>{t.error}</p>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#8d7d9d' }}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#8d7d9d' }}>{t.noProducts}</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="products-grid">
                {filteredProducts.map((product, index) => {
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
                      className={`product-card ${hoveredProduct === (product.productId || product.id) ? 'hovered' : ''}`}
                      onMouseEnter={() => setHoveredProduct(product.productId || product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                      style={{ animationDelay: `${index * 0.1}s`, textDecoration: 'none' }}
                    >
                      {/* Perfume Badge */}
                      <div className="perfume-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 2v2H5v2h1l1 7.268V14a2 2 0 002 2h6a2 2 0 002-2v-.732L18 6h1V4h-4V2H9zm1 4h4l-.934 6.532A1 1 0 0112 13.5a1 1 0 01-1.066-.968L10 6z"/>
                        </svg>
                        <span>{t.perfumeBadge}</span>
                      </div>
                      
                      {badge && (
                        <span className={`product-badge badge-${badge}`}>
                          {badge === 'bestseller' ? t.featuredBadge : t.newBadge}
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
                        <div className="product-overlay">
                          <button 
                            className="quick-add-btn"
                            onClick={(e) => handleAddToCart(e, product)}
                            aria-label={t.addToCart}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="9" cy="21" r="1"></circle>
                              <circle cx="20" cy="21" r="1"></circle>
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            <span>{t.addToCart}</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="product-details">
                        <h3 className="product-name">{productName}</h3>
                        <p className="product-desc">
                          {productDesc || (currentLang === 'ar' ? 'باقة زهور مع عطر سوبريم بوكيه 50 مل' : 'Flower bouquet with Supreme Bouquet 50ml perfume')}
                        </p>
                        <div className="product-footer">
                          <div className="price-wrapper">
                            {showDiscount ? (
                              <>
                                <span className="original-price">{t.currency} {parseFloat(originalPrice).toFixed(3)}</span>
                                <span className="sale-price">{t.currency} {parseFloat(finalPrice).toFixed(3)}</span>
                              </>
                            ) : (
                              <span className="sale-price">{t.currency} {parseFloat(finalPrice).toFixed(3)}</span>
                            )}
                          </div>
                          <button 
                            className="cart-icon-btn"
                            onClick={(e) => handleAddToCart(e, product)}
                            aria-label={t.addToCart}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Info Banner */}
      <section className="info-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 2v2H5v2h1l1 7.268V14a2 2 0 002 2h6a2 2 0 002-2v-.732L18 6h1V4h-4V2H9zm1 4h4l-.934 6.532A1 1 0 0112 13.5a1 1 0 01-1.066-.968L10 6z"/>
              </svg>
            </div>
            <div className="banner-text">
              <h3>{currentLang === 'ar' ? 'عطور سوبريم بوكيه الفاخرة' : 'Supreme Bouquet Luxury Perfumes'}</h3>
              <p>{currentLang === 'ar' 
                ? 'جميع باقاتنا تأتي مع عطر سوبريم بوكيه 50 مل - الهدية المثالية' 
                : 'All our bouquets come with Supreme Bouquet 50ml perfume - the perfect gift'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FlowersWithPerfume;