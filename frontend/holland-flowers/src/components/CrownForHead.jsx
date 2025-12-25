import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import './CrownForHead.css';

const CrownForHead = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const { addToCart } = useCart();

  // Category name to search for (must match exactly what you created in admin)
  const CATEGORY_NAME = 'Crown for Head';

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

        // Step 2: Find "Crown for Head" category - flexible search
        const crownCategory = categories.find(cat => {
          const name = (cat.categoryName || cat.nameEn || cat.name || '').toLowerCase();
          return name.includes('crown') || 
                 name.includes('head') || 
                 name.includes('tiara') ||
                 name.includes('تاج');
        });

        if (!crownCategory) {
          console.warn('Category "Crown for Head" not found. Available categories:', categories.map(c => c.categoryName || c.nameEn || c.name));
          setError('Category not found. Please create a "Crown for Head" category in admin.');
          setProducts([]);
          setLoading(false);
          return;
        }

        console.log('Found category:', crownCategory);

        // Step 3: Fetch products from this category
        const productsResponse = await productService.getProductsByCategory(crownCategory.categoryId, {
          page: 0,
          size: 100,
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
      pageTitle: "Crown for Head",
      pageSubtitle: "Elegant floral crowns and wreaths for your special moments",
      breadcrumbHome: "Home",
      breadcrumbAddOns: "Add-Ons",
      breadcrumbCurrent: "Crown for Head",
      filterAll: "All",
      filterCrowns: "Crowns",
      filterWreaths: "Wreaths",
      filterGarlands: "Garlands",
      addToCart: "Add to Cart",
      currency: "KD",
      originalPrice: "Original",
      salePrice: "Sale",
      featuredBadge: "Popular",
      saleBadge: "10% OFF",
      loading: "Loading products...",
      noProducts: "No products available yet. Check back soon!",
      error: "Something went wrong",
    },
    ar: {
      pageTitle: "تاج للرأس",
      pageSubtitle: "تيجان وأكاليل زهور أنيقة للحظاتك الخاصة",
      breadcrumbHome: "الرئيسية",
      breadcrumbAddOns: "الإضافات",
      breadcrumbCurrent: "تاج للرأس",
      filterAll: "الكل",
      filterCrowns: "التيجان",
      filterWreaths: "الأكاليل",
      filterGarlands: "الجارلاند",
      addToCart: "أضف للسلة",
      currency: "د.ك",
      originalPrice: "السعر الأصلي",
      salePrice: "سعر البيع",
      featuredBadge: "مميز",
      saleBadge: "خصم 10%",
      loading: "جاري تحميل المنتجات...",
      noProducts: "لا توجد منتجات متاحة حالياً. تحقق مرة أخرى قريباً!",
      error: "حدث خطأ ما",
    }
  };

  const t = translations[currentLang];

  // Filter categories with keywords for tag-based filtering
  // Tags in admin should match these keywords
  const filterCategories = [
    { id: 'all', labelEn: t.filterAll, keywords: [] },
    { id: 'crowns', labelEn: t.filterCrowns, keywords: ['crown', 'crowns', 'tiara', 'head crown', 'strap'] },
    { id: 'wreaths', labelEn: t.filterWreaths, keywords: ['wreath', 'wreaths', 'neck', 'necklace'] },
    { id: 'garlands', labelEn: t.filterGarlands, keywords: ['garland', 'garlands', 'tog'] },
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
    // Debug: Log entire product to see all fields
    console.log('Product object keys:', Object.keys(product));
    console.log('Full product:', JSON.stringify(product, null, 2));
    
    // Try all possible tag field names
    const possibleTagFields = [
      product.tags,
      product.tag,
      product.productTags,
      product.productTag,
      product.tagList,
      product.tagNames,
      product.keywords
    ];
    
    console.log('Possible tag values:', possibleTagFields);
    
    // Find the first non-empty value
    let tags = '';
    for (const field of possibleTagFields) {
      if (field) {
        tags = field;
        break;
      }
    }
    
    // Handle both string and array formats
    if (Array.isArray(tags)) {
      return tags.join(',').toLowerCase();
    }
    return String(tags || '').toLowerCase().trim();
  };

  // Check if product has a badge (featured/new)
  const getProductBadge = (product) => {
    if (product.isFeatured || product.featured) return 'popular';
    if (product.isNew || product.newArrival) return 'new';
    return null;
  };

  // Check if product has discount
  const hasDiscount = (product) => {
    const original = getOriginalPrice(product);
    const final = getFinalPrice(product);
    return original > 0 && final > 0 && original > final;
  };

  // Calculate discount percentage
  const getDiscountPercentage = (product) => {
    if (product.offerPercentage) return product.offerPercentage;
    const original = getOriginalPrice(product);
    const final = getFinalPrice(product);
    if (original > 0 && final > 0 && original > final) {
      return Math.round(((original - final) / original) * 100);
    }
    return 0;
  };

  // Filter products based on selected category using tags field
  const filteredProducts = (() => {
    console.log('=== FILTERING ===');
    console.log('Selected category:', selectedCategory);
    console.log('Total products:', products.length);
    
    if (selectedCategory === 'all') {
      console.log('Showing all products');
      return products;
    }
    
    // Find the selected filter category
    const selectedFilter = filterCategories.find(f => f.id === selectedCategory);
    console.log('Selected filter:', selectedFilter);
    
    if (!selectedFilter || !selectedFilter.keywords.length) {
      console.log('No filter found, showing all');
      return products;
    }

    console.log('Filtering by keywords:', selectedFilter.keywords);

    // Filter products that have matching tags
    const filtered = products.filter(product => {
      const productTags = getProductTags(product);
      const productName = getProductName(product).toLowerCase();
      
      console.log('Checking product:', productName);
      console.log('  - Tags:', productTags || '(empty)');
      
      // Check if any keyword matches the tags or product name
      const matches = selectedFilter.keywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        const tagMatch = productTags.includes(keywordLower);
        const nameMatch = productName.includes(keywordLower);
        if (tagMatch || nameMatch) {
          console.log('  - MATCH! keyword:', keyword, 'tagMatch:', tagMatch, 'nameMatch:', nameMatch);
        }
        return tagMatch || nameMatch;
      });
      
      return matches;
    });
    
    console.log('Filtered results:', filtered.length);
    return filtered;
  })();

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
    <div className={`crown-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Decorative Background */}
      <div className="crown-bg">
        <div className="bg-flower flower-1">✿</div>
        <div className="bg-flower flower-2">❀</div>
        <div className="bg-flower flower-3">✿</div>
        <div className="bg-gradient-circle circle-1"></div>
        <div className="bg-gradient-circle circle-2"></div>
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
            <div className="hero-crown-icon">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
              </svg>
            </div>
            <h1 className="hero-title">{t.pageTitle}</h1>
            <p className="hero-subtitle">{t.pageSubtitle}</p>
            <div className="hero-features">
              <div className="feature">
                <span className="feature-icon">🌸</span>
                <span className="feature-text">{currentLang === 'ar' ? 'زهور طازجة' : 'Fresh Flowers'}</span>
              </div>
              <div className="feature">
                <span className="feature-icon">👑</span>
                <span className="feature-text">{currentLang === 'ar' ? 'تصميم يدوي' : 'Handcrafted'}</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💝</span>
                <span className="feature-text">{currentLang === 'ar' ? 'مثالي للمناسبات' : 'Perfect for Events'}</span>
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
                onClick={() => {
                  console.log('Filter clicked:', cat.id);
                  setSelectedCategory(cat.id);
                }}
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
                borderTop: '3px solid #d4a0a4',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px', color: '#7a6a60' }}>{t.loading}</p>
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
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px', color: '#7a6a60' }}>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👑</div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#7a6a60' }}>{t.noProducts}</p>
            </div>
          )}

          {/* Products */}
          {!loading && !error && products.length > 0 && (
            <div className="products-grid">
              {filteredProducts.map((product, index) => {
                const productName = getProductName(product);
                const productDesc = getProductDescription(product);
                const productImage = getProductImage(product);
                const originalPrice = getOriginalPrice(product);
                const finalPrice = getFinalPrice(product);
                const badge = getProductBadge(product);
                const productSlug = getProductSlug(product);
                const discount = getDiscountPercentage(product);
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
                    {/* Sale Badge */}
                    {showDiscount && discount > 0 && (
                      <span className="sale-badge">{discount}% OFF</span>
                    )}
                    
                    {badge && (
                      <span className="product-badge">{t.featuredBadge}</span>
                    )}
                    
                    <div className="product-image-wrapper">
                      <div className="image-decoration"></div>
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
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                        {productDesc || (currentLang === 'ar' ? 'تاج زهور طبيعية' : 'Natural flower crown')}
                      </p>
                      <div className="product-footer">
                        <div className="price-wrapper">
                          {showDiscount ? (
                            <>
                              <span className="original-price">
                                {t.currency} {parseFloat(originalPrice).toFixed(3)}
                              </span>
                              <span className="sale-price">
                                {t.currency} {parseFloat(finalPrice).toFixed(3)}
                              </span>
                            </>
                          ) : (
                            <span className="sale-price">
                              {t.currency} {parseFloat(finalPrice).toFixed(3)}
                            </span>
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
          )}

          {/* No filtered results */}
          {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
            <div className="empty-filter-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#7a6a60' }}>
                {currentLang === 'ar' 
                  ? 'لا توجد منتجات في هذه الفئة. جرب فئة أخرى أو أضف منتجات بهذا التاج في لوحة التحكم.' 
                  : 'No products in this category. Try another category or add products with this tag in admin.'}
              </p>
              <button 
                onClick={() => setSelectedCategory('all')}
                style={{
                  marginTop: '16px',
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #d4a0a4 0%, #c08e92 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {currentLang === 'ar' ? 'عرض الكل' : 'Show All'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Info Banner */}
      <section className="info-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
              </svg>
            </div>
            <div className="banner-text">
              <h3>{currentLang === 'ar' ? 'مصنوعة بحب وعناية' : 'Crafted with Love & Care'}</h3>
              <p>{currentLang === 'ar' 
                ? 'جميع التيجان والأكاليل مصنوعة يدوياً من أجود الزهور الطازجة لتتألقي في مناسباتك الخاصة' 
                : 'All crowns and wreaths are handmade from the finest fresh flowers to make you shine at your special occasions'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CrownForHead;