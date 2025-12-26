import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import './CategoryPageLayout.css';

const CategoryPageLayout = ({
  categoryName,
  pageTitle,
  pageTitleAr,
  pageSubtitle,
  pageSubtitleAr,
  badgeText,
  badgeTextAr,
  badgeEmoji = '✨',
  themeColor = 'pink', // pink, purple, green, gold, red
  decorations = [] // Array of emoji decorations
}) => {
  const [currentLang, setCurrentLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const { addToCart } = useCart();

  // Filter states
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [maxPrice, setMaxPrice] = useState(100);
  const [selectedArrangements, setSelectedArrangements] = useState([]);
  const [expandedFilters, setExpandedFilters] = useState({
    price: true,
    arrangement: true
  });
  
  // Mobile filter drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);

  const arrangementTypes = ['Bouquet', 'Box', 'Basket', 'Vase', 'Tray', 'Stand'];

  // Theme colors
  const themes = {
    pink: {
      primary: '#ec4899',
      secondary: '#f9a8d4',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      bg: 'linear-gradient(180deg, #fdf2f8 0%, #ffffff 100%)',
      light: '#fdf2f8',
      shadow: 'rgba(236, 72, 153, 0.3)'
    },
    purple: {
      primary: '#9333ea',
      secondary: '#c084fc',
      gradient: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
      bg: 'linear-gradient(180deg, #faf5ff 0%, #ffffff 100%)',
      light: '#faf5ff',
      shadow: 'rgba(147, 51, 234, 0.3)'
    },
    green: {
      primary: '#059669',
      secondary: '#6ee7b7',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      bg: 'linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)',
      light: '#ecfdf5',
      shadow: 'rgba(5, 150, 105, 0.3)'
    },
    gold: {
      primary: '#d97706',
      secondary: '#fcd34d',
      gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      bg: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)',
      light: '#fffbeb',
      shadow: 'rgba(217, 119, 6, 0.3)'
    },
    red: {
      primary: '#dc2626',
      secondary: '#fca5a5',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      bg: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)',
      light: '#fef2f2',
      shadow: 'rgba(220, 38, 38, 0.3)'
    }
  };

  const theme = themes[themeColor] || themes.pink;

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

        const categoryResponse = await categoryService.getCategoryByName(categoryName);
        console.log('Category response:', categoryResponse);
        
        let categoryId = null;
        if (categoryResponse && categoryResponse.data) {
          categoryId = categoryResponse.data.categoryId || categoryResponse.data.id;
        } else if (categoryResponse && categoryResponse.categoryId) {
          categoryId = categoryResponse.categoryId;
        }

        if (!categoryId) {
          console.warn(`Category "${categoryName}" not found`);
          setError('Category not found');
          setProducts([]);
          setFilteredProducts([]);
          setLoading(false);
          return;
        }

        console.log('Found categoryId:', categoryId);

        const productsResponse = await productService.getProductsByCategory(categoryId, {
          page: 0,
          size: 100,
          sort: 'createdAt,desc'
        });

        console.log('Products response:', productsResponse);

        let productsList = [];
        if (productsResponse.success && productsResponse.data) {
          productsList = productsResponse.data.content || productsResponse.data || [];
        }

        const activeProducts = productsList.filter(p => p.isActive !== false);
        setProducts(activeProducts);
        setFilteredProducts(activeProducts);

        // Calculate max price
        if (activeProducts.length > 0) {
          const highest = Math.max(...activeProducts.map(p => 
            p.finalPrice || p.salePrice || p.price || p.actualPrice || 0
          ));
          setMaxPrice(Math.ceil(highest));
        }

        console.log('Loaded products:', activeProducts.length);

      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    // Price filter
    if (priceRange.min !== '' || priceRange.max !== '') {
      result = result.filter(product => {
        const price = product.finalPrice || product.salePrice || product.price || product.actualPrice || 0;
        const min = priceRange.min !== '' ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max !== '' ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Arrangement filter
    if (selectedArrangements.length > 0) {
      result = result.filter(product => {
        const name = (product.productName || product.name || '').toLowerCase();
        const tags = (product.tags || '').toLowerCase();
        return selectedArrangements.some(arr => 
          name.includes(arr.toLowerCase()) || tags.includes(arr.toLowerCase())
        );
      });
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.finalPrice || a.price || 0) - (b.finalPrice || b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.finalPrice || b.price || 0) - (a.finalPrice || a.price || 0));
        break;
      case 'name-az':
        result.sort((a, b) => (a.productName || a.name || '').localeCompare(b.productName || b.name || ''));
        break;
      case 'name-za':
        result.sort((a, b) => (b.productName || b.name || '').localeCompare(a.productName || a.name || ''));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [products, priceRange, selectedArrangements, sortBy]);

  const translations = {
    en: {
      filters: "Filters",
      filter: "Filter",
      priceRange: "PRICE RANGE",
      highestPrice: "Highest price:",
      arrangement: "ARRANGEMENT",
      items: "items",
      sortBy: "Sort by:",
      sort: "Sort",
      sortDefault: "Default",
      sortPriceLow: "Price: Low to High",
      sortPriceHigh: "Price: High to Low",
      sortNameAZ: "Name: A to Z",
      sortNameZA: "Name: Z to A",
      sortNewest: "Newest First",
      addToCart: "Add to Cart",
      loading: "Loading collection...",
      noProducts: "No products found",
      error: "Failed to load products",
      currency: "KD",
      clearAll: "Clear All",
      apply: "Apply Filters",
      close: "Close"
    },
    ar: {
      filters: "تصفية",
      filter: "تصفية",
      priceRange: "نطاق السعر",
      highestPrice: "أعلى سعر:",
      arrangement: "نوع الترتيب",
      items: "منتج",
      sortBy: "ترتيب حسب:",
      sort: "ترتيب",
      sortDefault: "افتراضي",
      sortPriceLow: "السعر: من الأقل للأعلى",
      sortPriceHigh: "السعر: من الأعلى للأقل",
      sortNameAZ: "الاسم: أ - ي",
      sortNameZA: "الاسم: ي - أ",
      sortNewest: "الأحدث أولاً",
      addToCart: "أضف للسلة",
      loading: "جاري تحميل المجموعة...",
      noProducts: "لا توجد منتجات",
      error: "فشل في تحميل المنتجات",
      currency: "د.ك",
      clearAll: "مسح الكل",
      apply: "تطبيق",
      close: "إغلاق"
    }
  };

  const t = translations[currentLang];

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

  const getProductSlug = (product) => {
    return product.productId || product.sku || product.slug || product.id;
  };

  const getProductDescription = (product) => {
    if (currentLang === 'ar') {
      return product.shortDescriptionAr || product.descriptionAr || product.shortDescription || product.description || '';
    }
    return product.shortDescriptionEn || product.shortDescription || product.descriptionEn || product.description || '';
  };

  const getDiscountPercent = (product) => {
    const original = getOriginalPrice(product);
    const final = getFinalPrice(product);
    if (original > 0 && final > 0 && original > final) {
      return Math.round(((original - final) / original) * 100);
    }
    return 0;
  };

  const getProductCategory = (product) => {
    return product.categoryName || product.category?.categoryName || product.category?.name || '';
  };

  const handleAddToCart = (e, product) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    const cartItem = {
      id: product.productId || product.id,
      name: getProductName(product),
      price: getFinalPrice(product),
      image: getProductImage(product),
      quantity: 1,
    };
    
    addToCart(cartItem);
  };

  const toggleArrangement = (arrangement) => {
    setSelectedArrangements(prev => 
      prev.includes(arrangement)
        ? prev.filter(a => a !== arrangement)
        : [...prev, arrangement]
    );
  };

  const toggleFilter = (filter) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const clearAllFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSelectedArrangements([]);
    setSortBy('default');
  };

  const closeMobileFilters = () => {
    setMobileFiltersOpen(false);
  };

  const closeMobileSort = () => {
    setMobileSortOpen(false);
  };

  // Count active filters
  const activeFilterCount = (priceRange.min !== '' || priceRange.max !== '' ? 1 : 0) + (selectedArrangements.length > 0 ? 1 : 0);

  const displayTitle = currentLang === 'ar' ? pageTitleAr : pageTitle;
  const displaySubtitle = currentLang === 'ar' ? pageSubtitleAr : pageSubtitle;
  const displayBadge = currentLang === 'ar' ? badgeTextAr : badgeText;

  return (
    <div 
      className={`category-page-layout ${currentLang === 'ar' ? 'rtl' : ''}`}
      style={{ '--theme-primary': theme.primary, '--theme-secondary': theme.secondary, '--theme-gradient': theme.gradient, '--theme-bg': theme.bg, '--theme-light': theme.light, '--theme-shadow': theme.shadow }}
    >
      {/* Decorative Background */}
      <div className="category-bg-decoration">
        {decorations.map((emoji, index) => (
          <span 
            key={index} 
            className={`floating-deco deco-${index + 1}`}
            style={{ animationDelay: `${index * 0.5}s` }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Hero Section */}
      <header className="category-hero">
        <div className="container">
          <div className="hero-content">
            <div className="category-badge">
              <span className="badge-emoji">{badgeEmoji}</span>
              <span>{displayBadge}</span>
            </div>
            <h1 className="hero-title">{displayTitle}</h1>
            <p className="hero-subtitle">{displaySubtitle}</p>
          </div>
        </div>
      </header>

      {/* Mobile Filter/Sort Toolbar */}
      <div className="mobile-filter-toolbar">
        <button 
          className="mobile-filter-btn"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
            <circle cx="8" cy="6" r="2" fill="currentColor"/>
            <circle cx="16" cy="12" r="2" fill="currentColor"/>
            <circle cx="10" cy="18" r="2" fill="currentColor"/>
          </svg>
          <span>{t.filter}</span>
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
        </button>
        
        <button 
          className="mobile-sort-btn"
          onClick={() => setMobileSortOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M6 12h12M9 18h6"/>
          </svg>
          <span>{t.sort}</span>
        </button>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {mobileFiltersOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMobileFilters}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <h3>{t.filters}</h3>
              <button className="drawer-close-btn" onClick={closeMobileFilters}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="mobile-drawer-content">
              {/* Price Range Filter */}
              <div className="mobile-filter-section">
                <button 
                  className="mobile-filter-header"
                  onClick={() => toggleFilter('price')}
                >
                  <span>{t.priceRange}</span>
                  <svg 
                    className={`chevron ${expandedFilters.price ? 'expanded' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {expandedFilters.price && (
                  <div className="mobile-filter-content">
                    <div className="price-inputs">
                      <div className="price-input-group">
                        <span className="currency-label">KD</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          min="0"
                        />
                      </div>
                      <span className="price-separator">-</span>
                      <div className="price-input-group">
                        <span className="currency-label">KD</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          min="0"
                        />
                      </div>
                    </div>
                    <p className="highest-price">{t.highestPrice} {maxPrice} KD</p>
                  </div>
                )}
              </div>

              {/* Arrangement Filter */}
              <div className="mobile-filter-section">
                <button 
                  className="mobile-filter-header"
                  onClick={() => toggleFilter('arrangement')}
                >
                  <span>{t.arrangement}</span>
                  <svg 
                    className={`chevron ${expandedFilters.arrangement ? 'expanded' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {expandedFilters.arrangement && (
                  <div className="mobile-filter-content">
                    <div className="checkbox-list">
                      {arrangementTypes.map(type => (
                        <label key={type} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={selectedArrangements.includes(type)}
                            onChange={() => toggleArrangement(type)}
                          />
                          <span className="checkmark"></span>
                          <span className="checkbox-label">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mobile-drawer-footer">
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                {t.clearAll}
              </button>
              <button className="apply-filters-btn" onClick={closeMobileFilters}>
                {t.apply} {filteredProducts.length > 0 && `(${filteredProducts.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sort Drawer Overlay */}
      {mobileSortOpen && (
        <div className="mobile-drawer-overlay" onClick={closeMobileSort}>
          <div className="mobile-drawer mobile-sort-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <h3>{t.sortBy}</h3>
              <button className="drawer-close-btn" onClick={closeMobileSort}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="mobile-drawer-content">
              <div className="sort-options">
                {[
                  { value: 'default', label: t.sortDefault },
                  { value: 'price-low', label: t.sortPriceLow },
                  { value: 'price-high', label: t.sortPriceHigh },
                  { value: 'name-az', label: t.sortNameAZ },
                  { value: 'name-za', label: t.sortNameZA },
                  { value: 'newest', label: t.sortNewest },
                ].map(option => (
                  <button
                    key={option.value}
                    className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy(option.value);
                      closeMobileSort();
                    }}
                  >
                    <span>{option.label}</span>
                    {sortBy === option.value && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="category-main-content">
        <div className="container">
          <div className="content-wrapper">
            
            {/* Filters Sidebar */}
            <aside className="filters-sidebar">
              <h2 className="filters-title">{t.filters}</h2>

              {/* Price Range Filter */}
              <div className="filter-section">
                <button 
                  className="filter-header"
                  onClick={() => toggleFilter('price')}
                >
                  <span>{t.priceRange}</span>
                  <svg 
                    className={`chevron ${expandedFilters.price ? 'expanded' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {expandedFilters.price && (
                  <div className="filter-content">
                    <div className="price-inputs">
                      <div className="price-input-group">
                        <span className="currency-label">KD</span>
                        <input
                          type="number"
                          placeholder="M"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          min="0"
                        />
                      </div>
                      <span className="price-separator">-</span>
                      <div className="price-input-group">
                        <span className="currency-label">KD</span>
                        <input
                          type="number"
                          placeholder="M"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          min="0"
                        />
                      </div>
                    </div>
                    <p className="highest-price">{t.highestPrice} {maxPrice} KD</p>
                  </div>
                )}
              </div>

              {/* Arrangement Filter */}
              <div className="filter-section">
                <button 
                  className="filter-header"
                  onClick={() => toggleFilter('arrangement')}
                >
                  <span>{t.arrangement}</span>
                  <svg 
                    className={`chevron ${expandedFilters.arrangement ? 'expanded' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {expandedFilters.arrangement && (
                  <div className="filter-content">
                    <div className="checkbox-list">
                      {arrangementTypes.map(type => (
                        <label key={type} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={selectedArrangements.includes(type)}
                            onChange={() => toggleArrangement(type)}
                          />
                          <span className="checkmark"></span>
                          <span className="checkbox-label">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Products Area */}
            <main className="products-area">
              {/* Toolbar */}
              <div className="products-toolbar">
                <div className="items-count">
                  <span className="count-number">{filteredProducts.length}</span>
                  <span className="count-label">{t.items}</span>
                </div>
                
                <div className="toolbar-right">
                  <div className="sort-dropdown">
                    <label>{t.sortBy}</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="default">{t.sortDefault}</option>
                      <option value="price-low">{t.sortPriceLow}</option>
                      <option value="price-high">{t.sortPriceHigh}</option>
                      <option value="name-az">{t.sortNameAZ}</option>
                      <option value="name-za">{t.sortNameZA}</option>
                      <option value="newest">{t.sortNewest}</option>
                    </select>
                  </div>
                  
                  <div className="view-toggle">
                    <button 
                      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
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
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
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
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredProducts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">{badgeEmoji}</div>
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
                    const productSlug = getProductSlug(product);

                    return (
                      <Link 
                        to={`/product/${productSlug}`}
                        key={product.productId || product.id} 
                        className="product-card"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="product-image-wrapper">
                          {/* Category Badge */}
                          {getProductCategory(product) && (
                            <div className="category-tag">
                              <span className="tag-star">★</span>
                              <span>{getProductCategory(product)}</span>
                            </div>
                          )}
                          
                          {/* Discount Badge */}
                          {getDiscountPercent(product) > 0 && (
                            <div className="discount-tag">
                              {getDiscountPercent(product)}% OFF
                            </div>
                          )}
                          
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
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14"/>
                            </svg>
                          </button>
                        </div>
                        
                        <div className="product-details">
                          <h3 className="product-name">{productName}</h3>
                          {getProductDescription(product) && (
                            <p className="product-description">{getProductDescription(product)}</p>
                          )}
                          <div className="price-wrapper">
                            {showDiscount && (
                              <span className="original-price">
                                {t.currency} {parseFloat(originalPrice).toFixed(3)}
                              </span>
                            )}
                            <span className="sale-price">
                              {t.currency} {parseFloat(finalPrice).toFixed(3)}
                            </span>
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

export default CategoryPageLayout;