import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import './PickForYou.css';

const PickForYou = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const { addToCart } = useCart();

  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500 });
  const [selectedArrangement, setSelectedArrangement] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filtersOpen, setFiltersOpen] = useState({
    price: true,
    arrangement: true
  });

  const CATEGORY_NAME = 'Picks for You';

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
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoriesResponse = await categoryService.getAllCategories();
        let categories = [];
        if (categoriesResponse.success && categoriesResponse.data) {
          categories = categoriesResponse.data.content || categoriesResponse.data || [];
        }

        const picksCategory = categories.find(cat => 
          cat.categoryName?.toLowerCase() === CATEGORY_NAME.toLowerCase() ||
          cat.nameEn?.toLowerCase() === CATEGORY_NAME.toLowerCase() ||
          cat.name?.toLowerCase() === CATEGORY_NAME.toLowerCase() ||
          cat.categoryName?.toLowerCase().includes('picks') ||
          cat.nameEn?.toLowerCase().includes('picks') ||
          cat.name?.toLowerCase().includes('picks')
        );

        if (!picksCategory) {
          setError('Category not found. Please create a "Picks for You" category in admin.');
          setProducts([]);
          setLoading(false);
          return;
        }

        const productsResponse = await productService.getProductsByCategory(picksCategory.categoryId, {
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

        // Set max price based on products
        if (activeProducts.length > 0) {
          const maxPrice = Math.max(...activeProducts.map(p => p.finalPrice || p.actualPrice || 0));
          setPriceRange(prev => ({ ...prev, max: Math.ceil(maxPrice) }));
        }

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
      pageTitle: "Picks for You",
      pageSubtitle: "Browse our handpicked selection of best-selling flowers and gifts, perfect for every occasion. Find the perfect bloom at Holland Flowers.",
      breadcrumbHome: "Home",
      breadcrumbCurrent: "Picks for You",
      addToCart: "Add to Cart",
      currency: "KD",
      filters: "Filters",
      price: "PRICE",
      to: "to",
      highestPrice: "The highest price is",
      arrangement: "ARRANGEMENT",
      items: "ITEMS",
      sort: "SORT",
      sortDefault: "Default",
      sortPriceLow: "Price: Low to High",
      sortPriceHigh: "Price: High to Low",
      sortNewest: "Newest First",
      sortName: "Name A-Z",
      loading: "Loading products...",
      noProducts: "No products available yet.",
      error: "Something went wrong",
      bouquet: "Bouquet",
      box: "Box",
      basket: "Basket",
      vase: "Vase",
      clearAll: "Clear All",
    },
    ar: {
      pageTitle: "اختياراتنا لك",
      pageSubtitle: "تصفح مجموعتنا المختارة بعناية من أفضل الزهور والهدايا المبيعة، المثالية لكل مناسبة. اعثر على الزهرة المثالية في هولند فلاورز.",
      breadcrumbHome: "الرئيسية",
      breadcrumbCurrent: "اختياراتنا لك",
      addToCart: "أضف للسلة",
      currency: "د.ك",
      filters: "التصفية",
      price: "السعر",
      to: "إلى",
      highestPrice: "أعلى سعر هو",
      arrangement: "التنسيق",
      items: "منتج",
      sort: "ترتيب",
      sortDefault: "افتراضي",
      sortPriceLow: "السعر: من الأقل للأعلى",
      sortPriceHigh: "السعر: من الأعلى للأقل",
      sortNewest: "الأحدث أولاً",
      sortName: "الاسم أ-ي",
      loading: "جاري تحميل المنتجات...",
      noProducts: "لا توجد منتجات متاحة حالياً.",
      error: "حدث خطأ ما",
      bouquet: "باقة",
      box: "صندوق",
      basket: "سلة",
      vase: "مزهرية",
      clearAll: "مسح الكل",
    }
  };

  const t = translations[currentLang];

  const arrangements = [
    { id: 'bouquet', label: t.bouquet },
    { id: 'box', label: t.box },
    { id: 'basket', label: t.basket },
    { id: 'vase', label: t.vase },
  ];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Price filter
    result = result.filter(p => {
      const price = p.finalPrice || p.actualPrice || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Arrangement filter (if any selected)
    if (selectedArrangement.length > 0) {
      result = result.filter(p => {
        const name = (p.productName || p.name || '').toLowerCase();
        return selectedArrangement.some(arr => name.includes(arr));
      });
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.finalPrice || a.actualPrice || 0) - (b.finalPrice || b.actualPrice || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.finalPrice || b.actualPrice || 0) - (a.finalPrice || a.actualPrice || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'name':
        result.sort((a, b) => (a.productName || a.name || '').localeCompare(b.productName || b.name || ''));
        break;
      default:
        break;
    }

    return result;
  }, [products, priceRange, selectedArrangement, sortBy]);

  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 500;
    return Math.ceil(Math.max(...products.map(p => p.finalPrice || p.actualPrice || 0)));
  }, [products]);

  const toggleFilter = (filterName) => {
    setFiltersOpen(prev => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const handleArrangementChange = (arrangementId) => {
    setSelectedArrangement(prev => 
      prev.includes(arrangementId) 
        ? prev.filter(a => a !== arrangementId)
        : [...prev, arrangementId]
    );
  };

  const clearAllFilters = () => {
    setPriceRange({ min: 0, max: maxProductPrice });
    setSelectedArrangement([]);
    setSortBy('default');
  };

  const getDiscountPercent = (product) => {
    if (product.offerPercentage && product.offerPercentage > 0) {
      return product.offerPercentage;
    }
    if (product.actualPrice && product.finalPrice && product.actualPrice > product.finalPrice) {
      return Math.round(((product.actualPrice - product.finalPrice) / product.actualPrice) * 100);
    }
    return null;
  };

  const getProductSlug = (product) => {
    return product.productId || product.sku || product.slug || product.id;
  };

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

  const getDefaultDescription = (product) => {
    const existingDesc = getProductDescription(product);
    if (existingDesc && existingDesc.length > 10) return existingDesc;
    
    const categoryName = product.categoryName || product.category?.name || '';
    const categoryLower = categoryName.toLowerCase();
    
    if (currentLang === 'ar') {
      if (categoryLower.includes('chocolate')) return 'شوكولاتة فاخرة مع زهور طازجة';
      if (categoryLower.includes('cake')) return 'كيك طازج مع باقة زهور جميلة';
      if (categoryLower.includes('perfume')) return 'عطر فاخر مع باقة زهور أنيقة';
      if (categoryLower.includes('gift')) return 'هدية مميزة مع لمسة من الزهور';
      return 'باقة زهور طازجة ومميزة';
    }
    
    if (categoryLower.includes('chocolate')) return 'Premium chocolates with fresh flowers';
    if (categoryLower.includes('cake')) return 'Fresh cake with beautiful flower bouquet';
    if (categoryLower.includes('perfume')) return 'Luxury perfume with elegant flowers';
    if (categoryLower.includes('gift')) return 'Special gift with a touch of flowers';
    return 'Fresh and beautiful flower arrangement';
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

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const productId = product.productId || product.id;
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    
    const finalPrice = getFinalPrice(product);
    const originalPrice = getOriginalPrice(product);
    
    const cartItem = {
      id: productId,
      name: product.productName || product.nameEn || product.name,
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

    setTimeout(() => {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }, 800);
  };

  return (
    <div className={`pick-for-you-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="container">
          <h1 className="hero-title">{t.pageTitle}</h1>
          <p className="hero-subtitle">{t.pageSubtitle}</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          <div className="content-layout">
            {/* Left Sidebar - Filters */}
            <aside className="filters-sidebar">
              <div className="filters-header">
                <h2 className="filters-title">{t.filters}</h2>
                {(selectedArrangement.length > 0 || priceRange.min > 0 || priceRange.max < maxProductPrice) && (
                  <button className="clear-filters" onClick={clearAllFilters}>
                    {t.clearAll}
                  </button>
                )}
              </div>

              {/* Price Filter */}
              <div className="filter-section">
                <button 
                  className={`filter-header ${filtersOpen.price ? 'open' : ''}`}
                  onClick={() => toggleFilter('price')}
                >
                  <span>{t.price}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {filtersOpen.price && (
                  <div className="filter-content">
                    <div className="price-inputs">
                      <div className="price-input-group">
                        <span className="currency-label">{t.currency}</span>
                        <input 
                          type="number" 
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                          min="0"
                          max={priceRange.max}
                        />
                      </div>
                      <span className="price-separator">{t.to}</span>
                      <div className="price-input-group">
                        <span className="currency-label">{t.currency}</span>
                        <input 
                          type="number" 
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                          min={priceRange.min}
                        />
                      </div>
                    </div>
                    <p className="price-hint">{t.highestPrice} {maxProductPrice.toFixed(3)} {t.currency}</p>
                  </div>
                )}
              </div>

              {/* Arrangement Filter */}
              <div className="filter-section">
                <button 
                  className={`filter-header ${filtersOpen.arrangement ? 'open' : ''}`}
                  onClick={() => toggleFilter('arrangement')}
                >
                  <span>{t.arrangement}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {filtersOpen.arrangement && (
                  <div className="filter-content">
                    {arrangements.map(arr => (
                      <label key={arr.id} className="checkbox-label">
                        <input 
                          type="checkbox"
                          checked={selectedArrangement.includes(arr.id)}
                          onChange={() => handleArrangementChange(arr.id)}
                        />
                        <span className="checkmark"></span>
                        <span className="label-text">{arr.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* Right Content - Products */}
            <main className="products-main">
              {/* Toolbar */}
              <div className="products-toolbar">
                <span className="items-count">{filteredProducts.length} {t.items}</span>
                
                <div className="toolbar-right">
                  <div className="sort-dropdown">
                    <label>{t.sort}</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="default">{t.sortDefault}</option>
                      <option value="price-low">{t.sortPriceLow}</option>
                      <option value="price-high">{t.sortPriceHigh}</option>
                      <option value="newest">{t.sortNewest}</option>
                      <option value="name">{t.sortName}</option>
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
                  <p>{t.error}</p>
                  <p className="error-details">{error}</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredProducts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🌸</div>
                  <p>{t.noProducts}</p>
                </div>
              )}

              {/* Products Grid */}
              {!loading && !error && filteredProducts.length > 0 && (
                <div className={`products-grid ${viewMode}`}>
                  {filteredProducts.map((product, index) => {
                    const discount = getDiscountPercent(product);
                    const originalPrice = getOriginalPrice(product);
                    const finalPrice = getFinalPrice(product);
                    const productSlug = getProductSlug(product);
                    const productName = getProductName(product);
                    const productDesc = getDefaultDescription(product);
                    const productImage = getProductImage(product);
                    const productId = product.productId || product.id;
                    const isAdding = addingToCart[productId];
                    
                    return (
                      <Link 
                        to={`/product/${productSlug}`}
                        key={productId} 
                        className="product-card"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {/* Discount Badge */}
                        {discount && (
                          <span className="discount-badge">-{discount}%</span>
                        )}
                        
                        {/* Product Image */}
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
                        </div>
                        
                        {/* Product Info */}
                        <div className="product-info">
                          <h3 className="product-name">{productName}</h3>
                          <p className="product-desc">{productDesc}</p>
                          
                          {/* Price Row */}
                          <div className="product-footer">
                            <div className="price-wrapper">
                              {discount && discount > 0 && originalPrice > finalPrice && (
                                <span className="original-price">
                                  {t.currency} {parseFloat(originalPrice).toFixed(3)}
                                </span>
                              )}
                              <span className="sale-price">
                                {t.currency} {parseFloat(finalPrice).toFixed(3)}
                              </span>
                            </div>
                            
                            {/* Add Button */}
                            <button 
                              className={`add-btn ${isAdding ? 'adding' : ''}`}
                              onClick={(e) => handleAddToCart(e, product)}
                              aria-label={t.addToCart}
                            >
                              {isAdding ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="12" y1="5" x2="12" y2="19"></line>
                                  <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickForYou;