import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import './AcrylicToppers.css';

const AcrylicToppers = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const { addToCart } = useCart();

  // Category name to search for (must match exactly what you created in admin)
  const CATEGORY_NAME = 'Acrylic Toppers';

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

        // Step 2: Find "Acrylic Toppers" category - flexible search
        const toppersCategory = categories.find(cat => {
          const name = (cat.categoryName || cat.nameEn || cat.name || '').toLowerCase();
          return name.includes('acrylic') || 
                 name.includes('topper') || 
                 name.includes('toppers');
        });

        if (!toppersCategory) {
          console.warn('Category "Acrylic Toppers" not found. Available categories:', categories.map(c => c.categoryName || c.nameEn || c.name));
          setError('Category not found. Please create an "Acrylic Toppers" category in admin.');
          setProducts([]);
          setLoading(false);
          return;
        }

        console.log('Found category:', toppersCategory);

        // Step 3: Fetch products from this category
        const productsResponse = await productService.getProductsByCategory(toppersCategory.categoryId, {
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
      pageTitle: "Acrylic Celebration Toppers",
      pageSubtitle: "Add a touch of elegance to your floral arrangements",
      breadcrumbHome: "Home",
      breadcrumbAddOns: "Add-Ons",
      breadcrumbCurrent: "Acrylic Toppers",
      filterAll: "All",
      filterCelebrations: "Celebrations",
      filterBaby: "Baby",
      filterLove: "Love & Romance",
      filterOccasions: "Special Occasions",
      filterExtras: "Extras",
      addToCart: "Add to Cart",
      viewDetails: "View Details",
      currency: "KD",
      featuredBadge: "Popular",
      newBadge: "New",
      loading: "Loading products...",
      noProducts: "No products available yet. Check back soon!",
      error: "Something went wrong",
    },
    ar: {
      pageTitle: "توبر احتفالات أكريليك",
      pageSubtitle: "أضف لمسة من الأناقة إلى تنسيقات الزهور الخاصة بك",
      breadcrumbHome: "الرئيسية",
      breadcrumbAddOns: "الإضافات",
      breadcrumbCurrent: "توبر أكريليك",
      filterAll: "الكل",
      filterCelebrations: "الاحتفالات",
      filterBaby: "المواليد",
      filterLove: "الحب والرومانسية",
      filterOccasions: "المناسبات الخاصة",
      filterExtras: "إضافات",
      addToCart: "أضف للسلة",
      viewDetails: "عرض التفاصيل",
      currency: "د.ك",
      featuredBadge: "مميز",
      newBadge: "جديد",
      loading: "جاري تحميل المنتجات...",
      noProducts: "لا توجد منتجات متاحة حالياً. تحقق مرة أخرى قريباً!",
      error: "حدث خطأ ما",
    }
  };

  const t = translations[currentLang];

  // Filter categories with keywords for tag-based filtering
  // In admin, add these tags to products: celebrations, baby, love, occasions, extras
  const filterCategories = [
    { id: 'all', labelEn: t.filterAll, keywords: [] },
    { id: 'celebrations', labelEn: t.filterCelebrations, keywords: ['celebration', 'celebrations', 'birthday', 'graduation', 'new year', 'newyear', 'mabrook', 'congrats'] },
    { id: 'baby', labelEn: t.filterBaby, keywords: ['baby', 'boy', 'girl', 'newborn'] },
    { id: 'love', labelEn: t.filterLove, keywords: ['love', 'anniversary', 'romantic', 'romance', 'mom', 'mother', 'heart'] },
    { id: 'occasions', labelEn: t.filterOccasions, keywords: ['occasion', 'occasions', 'eid', 'welcome', 'get well', 'thank you', 'thanks', 'mubarak'] },
    { id: 'extras', labelEn: t.filterExtras, keywords: ['extra', 'extras', 'perfume', 'chocolate', 'chocolates', 'gift'] },
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
      return selectedFilter.keywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        return productTags.includes(keywordLower) || productName.includes(keywordLower);
      });
    });
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
    <div className={`acrylic-toppers-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Decorative Background */}
      <div className="page-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
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
            <span className="hero-accent">✦ Add-Ons Collection ✦</span>
            <h1 className="hero-title">{t.pageTitle}</h1>
            <p className="hero-subtitle">{t.pageSubtitle}</p>
            <div className="hero-decoration">
              <span className="deco-line"></span>
              <svg className="deco-flower" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9C21 10.1 20.1 11 19 11C17.9 11 17 10.1 17 9C17 7.9 17.9 7 19 7C20.1 7 21 7.9 21 9ZM7 9C7 10.1 6.1 11 5 11C3.9 11 3 10.1 3 9C3 7.9 3.9 7 5 7C6.1 7 7 7.9 7 9ZM19 19C19 20.1 18.1 21 17 21C15.9 21 15 20.1 15 19C15 17.9 15.9 17 17 17C18.1 17 19 17.9 19 19ZM9 19C9 20.1 8.1 21 7 21C5.9 21 5 20.1 5 19C5 17.9 5.9 17 7 17C8.1 17 9 17.9 9 19ZM12 12C14.2 12 16 13.8 16 16C16 18.2 14.2 20 12 20C9.8 20 8 18.2 8 16C8 13.8 9.8 12 12 12Z"/>
              </svg>
              <span className="deco-line"></span>
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
                onClick={() => setSelectedCategory(cat.id)}
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
                borderTop: '3px solid #c9a86c',
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
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✦</div>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '16px', color: '#7a6a60' }}>{t.noProducts}</p>
            </div>
          )}

          {/* Products */}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="products-grid">
                {filteredProducts.map((product, index) => {
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
                      style={{ animationDelay: `${index * 0.1}s`, textDecoration: 'none' }}
                    >
                      {badge && (
                        <span className={`product-badge badge-${badge}`}>
                          {badge === 'popular' ? t.featuredBadge : t.newBadge}
                        </span>
                      )}
                      
                      <div className="product-image-wrapper">
                        <div className="image-glow"></div>
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
                          {productDesc || (currentLang === 'ar' ? 'توبر أكريليك' : 'Acrylic topper')}
                        </p>
                        <div className="product-footer">
                          <span className="product-price">
                            {t.currency} {parseFloat(finalPrice).toFixed(3)}
                          </span>
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

              {/* No filtered results */}
              {filteredProducts.length === 0 && (
                <div className="empty-filter-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                  <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', color: '#7a6a60' }}>
                    {currentLang === 'ar' 
                      ? 'لا توجد منتجات في هذه الفئة. جرب فئة أخرى أو أضف منتجات بهذا التاج في لوحة التحكم.' 
                      : 'No products in this category. Try another filter or add products with matching tags in admin.'}
                  </p>
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    style={{
                      marginTop: '16px',
                      padding: '10px 24px',
                      background: 'linear-gradient(135deg, #c9a86c 0%, #b8956a 100%)',
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
            </>
          )}
        </div>
      </section>

      {/* Info Banner */}
      <section className="info-banner">
        <div className="container">
          <div className="banner-content">
            <div className="banner-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <div className="banner-text">
              <h3>{currentLang === 'ar' ? 'أضف لمسة خاصة' : 'Add a Special Touch'}</h3>
              <p>{currentLang === 'ar' 
                ? 'يمكن إضافة جميع التوبرز الأكريليك إلى أي باقة زهور أو ترتيب' 
                : 'All acrylic toppers can be added to any flower bouquet or arrangement'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AcrylicToppers;