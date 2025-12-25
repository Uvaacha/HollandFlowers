import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import './HeliumBalloons.css';

const HeliumBalloons = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState(24);
  const { addToCart } = useCart();

  // Category name to search for (must match exactly what you created in admin)
  const CATEGORY_NAME = 'Helium Balloons';

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

        // Step 1: Get all categories
        const categoriesResponse = await categoryService.getAllCategories();
        console.log('Categories response:', categoriesResponse);

        let categories = [];
        if (categoriesResponse.success && categoriesResponse.data) {
          categories = categoriesResponse.data.content || categoriesResponse.data || [];
        }

        // Step 2: Find "Helium Balloons" category
        const balloonsCategory = categories.find(cat => 
          cat.categoryName?.toLowerCase() === CATEGORY_NAME.toLowerCase() ||
          cat.nameEn?.toLowerCase() === CATEGORY_NAME.toLowerCase() ||
          cat.name?.toLowerCase() === CATEGORY_NAME.toLowerCase() ||
          cat.categoryName?.toLowerCase().includes('helium') ||
          cat.categoryName?.toLowerCase().includes('balloon') ||
          cat.nameEn?.toLowerCase().includes('helium') ||
          cat.nameEn?.toLowerCase().includes('balloon')
        );

        if (!balloonsCategory) {
          console.warn('Category "Helium Balloons" not found. Available categories:', categories.map(c => c.categoryName || c.nameEn || c.name));
          setError('Category not found. Please create a "Helium Balloons" category in admin.');
          setProducts([]);
          setLoading(false);
          return;
        }

        console.log('Found category:', balloonsCategory);

        // Step 3: Fetch products from this category
        const productsResponse = await productService.getProductsByCategory(balloonsCategory.categoryId, {
          page: 0,
          size: 200, // Get more products for balloons page
          sort: 'createdAt,desc'
        });

        console.log('Products response:', productsResponse);

        let productsList = [];
        if (productsResponse.success && productsResponse.data) {
          productsList = productsResponse.data.content || productsResponse.data || [];
        }

        // Filter only active products
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
      pageTitle: "Helium Balloons",
      pageSubtitle: "Add joy and color to your celebrations with our premium balloon collection",
      breadcrumbHome: "Home",
      breadcrumbAddOns: "Add-Ons",
      breadcrumbCurrent: "Helium Balloons",
      filterAll: "All",
      filterBirthday: "Birthday",
      filterNewYear: "New Year",
      filterLove: "Love",
      filterBaby: "Baby",
      filterGraduation: "Graduation",
      filterShiny: "Shiny Balloons",
      filterLettersGold: "Gold Letters",
      filterLettersSilver: "Silver Letters",
      filterBanners: "Banners",
      filterCandles: "Candles",
      addToCart: "Add to Cart",
      currency: "KD",
      priceOnSelection: "Price on Selection",
      featuredBadge: "Popular",
      newBadge: "New",
      loadMore: "Load More",
      showingOf: "Showing {visible} of {total} products",
      loading: "Loading products...",
      noProducts: "No products available yet. Check back soon!",
      error: "Something went wrong",
    },
    ar: {
      pageTitle: "بالونات الهيليوم",
      pageSubtitle: "أضف البهجة والألوان إلى احتفالاتك مع مجموعة البالونات المميزة",
      breadcrumbHome: "الرئيسية",
      breadcrumbAddOns: "الإضافات",
      breadcrumbCurrent: "بالونات الهيليوم",
      filterAll: "الكل",
      filterBirthday: "عيد الميلاد",
      filterNewYear: "السنة الجديدة",
      filterLove: "الحب",
      filterBaby: "المواليد",
      filterGraduation: "التخرج",
      filterShiny: "بالونات لامعة",
      filterLettersGold: "حروف ذهبية",
      filterLettersSilver: "حروف فضية",
      filterBanners: "لافتات",
      filterCandles: "شموع",
      addToCart: "أضف للسلة",
      currency: "د.ك",
      priceOnSelection: "السعر حسب الاختيار",
      featuredBadge: "مميز",
      newBadge: "جديد",
      loadMore: "عرض المزيد",
      showingOf: "عرض {visible} من {total} منتج",
      loading: "جاري تحميل المنتجات...",
      noProducts: "لا توجد منتجات متاحة حالياً. تحقق مرة أخرى قريباً!",
      error: "حدث خطأ ما",
    }
  };

  const t = translations[currentLang];

  // Subcategories for filtering (based on product tags field)
  // Tags in admin should match these keywords: birthday, new year, love, baby, graduation, shiny, gold, silver, banner, candle
  const filterCategories = [
    { id: 'all', labelEn: t.filterAll, keywords: [] },
    { id: 'birthday', labelEn: t.filterBirthday, keywords: ['birthday', 'hbd', 'bday'] },
    { id: 'newyear', labelEn: t.filterNewYear, keywords: ['new year', 'newyear', 'new-year', 'year'] },
    { id: 'love', labelEn: t.filterLove, keywords: ['love', 'heart', 'valentine', 'romantic'] },
    { id: 'baby', labelEn: t.filterBaby, keywords: ['baby', 'boy', 'girl', 'newborn', 'shower'] },
    { id: 'graduation', labelEn: t.filterGraduation, keywords: ['graduation', 'grad', 'congrats', 'graduate'] },
    { id: 'shiny', labelEn: t.filterShiny, keywords: ['shiny', 'metallic', 'chrome', 'foil'] },
    { id: 'letters-gold', labelEn: t.filterLettersGold, keywords: ['gold letter', 'gold alphabet', 'letter gold'] },
    { id: 'letters-silver', labelEn: t.filterLettersSilver, keywords: ['silver letter', 'silver alphabet', 'letter silver'] },
    { id: 'banners', labelEn: t.filterBanners, keywords: ['banner', 'banners'] },
    { id: 'candles', labelEn: t.filterCandles, keywords: ['candle', 'candles'] },
  ];

  // Helper functions to get product data
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

  // Get product tags as lowercase string for filtering
  const getProductTags = (product) => {
    const tags = product.tags || product.tag || '';
    return tags.toLowerCase();
  };

  // Check if product has a badge (featured/new)
  const getProductBadge = (product) => {
    if (product.isFeatured || product.featured) return 'popular';
    if (product.isNew || product.newArrival) return 'new';
    return null;
  };

  // Filter products based on selected category using tags field
  const filteredProducts = (() => {
    if (selectedCategory === 'all') {
      return products;
    }
    
    // Find the selected filter category
    const selectedFilter = filterCategories.find(f => f.id === selectedCategory);
    if (!selectedFilter || !selectedFilter.keywords.length) {
      return products;
    }

    // Filter products that have matching tags
    return products.filter(product => {
      const productTags = getProductTags(product);
      const productName = getProductName(product).toLowerCase();
      
      // Check if any keyword matches the tags or product name
      return selectedFilter.keywords.some(keyword => 
        productTags.includes(keyword) || productName.includes(keyword)
      );
    });
  })();

  const displayedProducts = filteredProducts.slice(0, visibleProducts);

  const handleLoadMore = () => {
    setVisibleProducts(prev => Math.min(prev + 24, filteredProducts.length));
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setVisibleProducts(24);
  };

  // Handle add to cart with proper price fields
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
      // All price fields for Cart to work correctly
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
    <div className={`helium-balloons-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Decorative Background */}
      <div className="balloons-bg">
        <div className="floating-balloon balloon-1">🎈</div>
        <div className="floating-balloon balloon-2">🎈</div>
        <div className="floating-balloon balloon-3">🎈</div>
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
            <li><Link to="/add-ons">{t.breadcrumbAddOns}</Link></li>
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
            <span className="hero-accent">🎈 Celebration Collection 🎈</span>
            <h1 className="hero-title">{t.pageTitle}</h1>
            <p className="hero-subtitle">{t.pageSubtitle}</p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{products.length}</span>
                <span className="stat-label">{currentLang === 'ar' ? 'منتج' : 'Products'}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">8+</span>
                <span className="stat-label">{currentLang === 'ar' ? 'ساعات' : 'Hours Float'}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">11</span>
                <span className="stat-label">{currentLang === 'ar' ? 'فئة' : 'Categories'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Section */}
      <section className="filter-section">
        <div className="container">
          <div className="filter-wrapper">
            {filterCategories.map(cat => (
              <button
                key={cat.id}
                className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                {cat.labelEn}
              </button>
            ))}
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
                borderTop: '3px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#7f8c9a' }}>{t.loading}</p>
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
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#7f8c9a' }}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎈</div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#7f8c9a' }}>{t.noProducts}</p>
            </div>
          )}

          {/* Products */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="products-header">
                <p className="showing-text">
                  {t.showingOf
                    .replace('{visible}', displayedProducts.length)
                    .replace('{total}', filteredProducts.length)}
                </p>
              </div>
              
              <div className="products-grid">
                {displayedProducts.map((product, index) => {
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
                      className={`product-card ${hoveredProduct === (product.productId || product.id) ? 'hovered' : ''}`}
                      onMouseEnter={() => setHoveredProduct(product.productId || product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                      style={{ animationDelay: `${(index % 24) * 0.05}s`, textDecoration: 'none' }}
                    >
                      {badge && (
                        <span className={`product-badge badge-${badge}`}>
                          {badge === 'popular' ? t.featuredBadge : t.newBadge}
                        </span>
                      )}
                      
                      <div className="product-image-wrapper">
                        <img 
                          src={productImage} 
                          alt={productName}
                          className="product-image"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/images/placeholder.webp';
                          }}
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
                          {productDesc || (currentLang === 'ar' ? 'بالون هيليوم يدوم حتى 8 ساعات' : 'Helium balloon lasts up to 8 hours')}
                        </p>
                        <div className="product-footer">
                          <span className={`product-price ${!finalPrice || finalPrice === 0 ? 'on-selection' : ''}`}>
                            {finalPrice && finalPrice > 0
                              ? `${t.currency} ${parseFloat(finalPrice).toFixed(3)}`
                              : t.priceOnSelection}
                          </span>
                          <button 
                            className="cart-icon-btn"
                            onClick={(e) => handleAddToCart(e, product)}
                            aria-label={t.addToCart}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Load More Button */}
              {visibleProducts < filteredProducts.length && (
                <div className="load-more-wrapper">
                  <button className="load-more-btn" onClick={handleLoadMore}>
                    <span>{t.loadMore}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Info Banner */}
      <section className="info-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-icon">
              <span>🎈</span>
            </div>
            <div className="banner-text">
              <h3>{currentLang === 'ar' ? 'بالونات هيليوم عالية الجودة' : 'Premium Helium Balloons'}</h3>
              <p>{currentLang === 'ar' 
                ? 'جميع بالوناتنا مملوءة بالهيليوم وتدوم حتى 8 ساعات للاحتفال المثالي' 
                : 'All our balloons are helium-filled and last up to 8 hours for the perfect celebration'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeliumBalloons;