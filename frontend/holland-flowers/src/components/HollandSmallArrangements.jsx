import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import './HollandSmallArrangements.css';

const HollandSmallArrangements = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  // Filter states
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedArrangements, setSelectedArrangements] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');

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

        const hollandSmallCategory = categories.find(cat => {
          const name = (cat.categoryName || cat.nameEn || cat.name || '').toLowerCase();
          return name === 'holland small' || name === 'holland small arrangements' || name.includes('holland small') || 
                 name === 'holland' || name.includes('holland') && name.includes('small');
        });

        if (!hollandSmallCategory) {
          console.warn('Category not found. Available:', categories.map(c => c.categoryName));
          setError('Category not found. Please create "Holland Small" category in admin.');
          setProducts([]);
          setLoading(false);
          return;
        }

        const productsResponse = await productService.getProductsByCategory(hollandSmallCategory.categoryId, {
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
      pageTitle: "Holland Small Arrangements",
      pageSubtitle: "Elegant holland small in stunning colors and arrangements",
      filters: "Filters",
      priceRange: "PRICE RANGE",
      highestPrice: "Highest price:",
      arrangement: "ARRANGEMENT",
      bouquet: "Bouquet",
      box: "Box",
      vase: "Vase",
      sortBy: "Sort by:",
      sortDefault: "Default",
      sortPriceLow: "Price: Low to High",
      sortPriceHigh: "Price: High to Low",
      sortNewest: "Newest",
      items: "items",
      min: "Min",
      max: "Max",
      addToCart: "Add to Cart",
      loading: "Loading holland small collection...",
      noProducts: "No holland small products available yet.",
      error: "Something went wrong",
      freshBanner: "Fresh Holland Small from Holland",
      freshBannerDesc: "Premium imported holland small in vibrant colors. Perfect for any occasion with same-day delivery available."
    },
    ar: {
      pageTitle: "مجموعة التوليب",
      pageSubtitle: "زهور توليب أنيقة بألوان وترتيبات مذهلة",
      filters: "التصفية",
      priceRange: "نطاق السعر",
      highestPrice: "أعلى سعر:",
      arrangement: "نوع الترتيب",
      bouquet: "باقة",
      box: "صندوق",
      vase: "مزهرية",
      sortBy: "ترتيب حسب:",
      sortDefault: "الافتراضي",
      sortPriceLow: "السعر: من الأقل للأعلى",
      sortPriceHigh: "السعر: من الأعلى للأقل",
      sortNewest: "الأحدث",
      items: "منتج",
      min: "الحد الأدنى",
      max: "الحد الأقصى",
      addToCart: "أضف للسلة",
      loading: "جاري تحميل مجموعة التوليب...",
      noProducts: "لا توجد منتجات توليب متاحة حالياً.",
      error: "حدث خطأ ما",
      freshBanner: "توليب طازج من هولندا",
      freshBannerDesc: "توليب مستورد فاخر بألوان نابضة بالحياة. مثالي لجميع المناسبات مع توصيل في نفس اليوم."
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

  const getDiscountPercent = (product) => {
    const original = getOriginalPrice(product);
    const final = getFinalPrice(product);
    if (original > 0 && final > 0 && original > final) {
      return Math.round(((original - final) / original) * 100);
    }
    return 0;
  };

  const getProductSlug = (product) => {
    return product.productId || product.sku || product.slug || product.id;
  };

  const getArrangementType = (product) => {
    const name = getProductName(product).toLowerCase();
    const tags = (product.tags || '').toLowerCase();
    
    if (tags.includes('bouquet') || name.includes('bouquet')) return 'bouquet';
    if (tags.includes('box') || name.includes('box')) return 'box';
    if (tags.includes('vase') || name.includes('vase')) return 'vase';
    return 'bouquet';
  };

  const getProductBadge = (product) => {
    const tags = (product.tags || '').toLowerCase();
    const name = getProductName(product).toLowerCase();
    
    if (tags.includes('premium') || product.isPremium) return 'premium';
    if (tags.includes('mix') || name.includes('mix') || name.includes('hydrangea')) return 'mix';
    if (tags.includes('pink') || name.includes('pink')) return 'pink';
    if (tags.includes('purple') || name.includes('purple')) return 'purple';
    if (tags.includes('white') || name.includes('white')) return 'white';
    if (tags.includes('yellow') || name.includes('yellow')) return 'yellow';
    return null;
  };

  // Calculate highest price
  const highestPrice = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.max(...products.map(p => getFinalPrice(p)));
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Price filter
    if (minPrice !== '') {
      result = result.filter(p => getFinalPrice(p) >= parseFloat(minPrice));
    }
    if (maxPrice !== '') {
      result = result.filter(p => getFinalPrice(p) <= parseFloat(maxPrice));
    }

    // Arrangement filter
    if (selectedArrangements.length > 0) {
      result = result.filter(p => selectedArrangements.includes(getArrangementType(p)));
    }

    // Sort
    switch (sortBy) {
      case 'priceLow':
        result.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
        break;
      case 'priceHigh':
        result.sort((a, b) => getFinalPrice(b) - getFinalPrice(a));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    return result;
  }, [products, minPrice, maxPrice, selectedArrangements, sortBy]);

  // Handle arrangement checkbox
  const handleArrangementChange = (type) => {
    setSelectedArrangements(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
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
      quantity: 1
    };
    
    addToCart(cartItem);
  };

  return (
    <div className={`holland-small-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Decorative Background */}
      <div className="holland-small-bg">
        <div className="holland-glow glow-1"></div>
        <div className="holland-glow glow-2"></div>
        <div className="floating-holland fh-1">🎁</div>
        <div className="floating-holland fh-2">🌸</div>
        <div className="floating-holland fh-3">🎁</div>
        <div className="floating-holland fh-4">✨</div>
      </div>

      {/* Hero Section */}
      <section className="holland-small-hero">
        <div className="container">
          <div className="hero-badge">
            <span>🎁</span>
            <span>{currentLang === 'ar' ? 'توليب طازج' : 'FRESH TULIPS'}</span>
          </div>
          <h1 className="hero-title">{t.pageTitle}</h1>
          <p className="hero-subtitle">{t.pageSubtitle}</p>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="holland-small-content">
        <div className="container">
          <div className="content-wrapper">
            {/* Left Sidebar - Filters */}
            <aside className="filters-sidebar">
              <h2 className="filters-title">{t.filters}</h2>

              {/* Price Range Filter */}
              <div className="filter-section">
                <h3 className="filter-heading">{t.priceRange}</h3>
                <div className="price-inputs">
                  <div className="price-input-group">
                    <span className="currency-label">KD</span>
                    <input
                      type="number"
                      placeholder={t.min}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="price-input"
                    />
                  </div>
                  <span className="price-separator">-</span>
                  <div className="price-input-group">
                    <span className="currency-label">KD</span>
                    <input
                      type="number"
                      placeholder={t.max}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="price-input"
                    />
                  </div>
                </div>
                <p className="highest-price">{t.highestPrice} {highestPrice.toFixed(0)} KD</p>
              </div>

              {/* Arrangement Filter */}
              <div className="filter-section">
                <h3 className="filter-heading">{t.arrangement}</h3>
                <div className="checkbox-group">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedArrangements.includes('bouquet')}
                      onChange={() => handleArrangementChange('bouquet')}
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-label">{t.bouquet}</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedArrangements.includes('box')}
                      onChange={() => handleArrangementChange('box')}
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-label">{t.box}</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedArrangements.includes('vase')}
                      onChange={() => handleArrangementChange('vase')}
                    />
                    <span className="checkmark"></span>
                    <span className="checkbox-label">{t.vase}</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Right Content - Products */}
            <div className="products-area">
              {/* Toolbar */}
              <div className="products-toolbar">
                <span className="items-count">{filteredProducts.length} {t.items}</span>
                
                <div className="toolbar-right">
                  <div className="sort-wrapper">
                    <label>{t.sortBy}</label>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="sort-select"
                    >
                      <option value="default">{t.sortDefault}</option>
                      <option value="priceLow">{t.sortPriceLow}</option>
                      <option value="priceHigh">{t.sortPriceHigh}</option>
                      <option value="newest">{t.sortNewest}</option>
                    </select>
                  </div>

                  <div className="view-toggle">
                    <button 
                      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      aria-label="Grid view"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                        <rect x="14" y="14" width="7" height="7" rx="1"/>
                      </svg>
                    </button>
                    <button 
                      className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      aria-label="List view"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="3" y="4" width="18" height="4" rx="1"/>
                        <rect x="3" y="10" width="18" height="4" rx="1"/>
                        <rect x="3" y="16" width="18" height="4" rx="1"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>{t.loading}</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="error-state">
                  <p className="error-title">{t.error}</p>
                  <p className="error-message">{error}</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredProducts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🎁</div>
                  <p>{t.noProducts}</p>
                </div>
              )}

              {/* Products Grid */}
              {!loading && !error && filteredProducts.length > 0 && (
                <div className={`products-grid ${viewMode}`}>
                  {filteredProducts.map((product, index) => {
                    const productName = getProductName(product);
                    const productImage = getProductImage(product);
                    const originalPrice = getOriginalPrice(product);
                    const finalPrice = getFinalPrice(product);
                    const showDiscount = hasDiscount(product);
                    const discountPercent = getDiscountPercent(product);
                    const badge = getProductBadge(product);
                    const productSlug = getProductSlug(product);

                    return (
                      <Link 
                        to={`/product/${productSlug}`}
                        key={product.productId || product.id} 
                        className="product-card"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {showDiscount && (
                          <span className="discount-badge">-{discountPercent}%</span>
                        )}

                        {badge && (
                          <span className={`product-badge badge-${badge}`}>
                            {badge.charAt(0).toUpperCase() + badge.slice(1)}
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
                          <button 
                            className="quick-add-btn"
                            onClick={(e) => handleAddToCart(e, product)}
                            aria-label={t.addToCart}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14"/>
                            </svg>
                          </button>
                        </div>
                        
                        <div className="product-details">
                          <h3 className="product-name">{productName}</h3>
                          <div className="price-wrapper">
                            {showDiscount && (
                              <span className="original-price">
                                {originalPrice.toFixed(3)} KD
                              </span>
                            )}
                            <span className="final-price">
                              {finalPrice.toFixed(3)} KD
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="info-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-icon">🎁</div>
            <div className="banner-text">
              <h3>{t.freshBanner}</h3>
              <p>{t.freshBannerDesc}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HollandSmallArrangements;