import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import MobileFilterBar from './MobileFilterBar';
import MobileFilterDrawer, { FilterSection, PriceRangeFilter, CheckboxFilter } from './MobileFilterDrawer';
import './Bouquets.css';

const Bouquets = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const { addToCart } = useCart();

  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedArrangements, setSelectedArrangements] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState({ price: true, arrangement: true });

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);
    const handleLangChange = (e) => setCurrentLang(e.detail);
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const translations = {
    en: {
      title: "Flower Bouquets",
      subtitle: "Beautiful hand-arranged flower bouquets for every occasion",
      badge: "BOUQUETS",
      filters: "Filters",
      clearAll: "Clear All",
      priceRange: "Price Range",
      arrangement: "Arrangement",
      minPrice: "Min",
      maxPrice: "Max",
      sortBy: "Sort by:",
      default: "Default",
      priceLow: "Price: Low to High",
      priceHigh: "Price: High to Low",
      newest: "Newest First",
      nameAZ: "Name: A-Z",
      items: "items",
      bouquet: "Bouquet",
      box: "Box",
      basket: "Basket",
      vase: "Vase",
      tray: "Tray",
      stand: "Stand",
      kd: "KD",
      addToCart: "Add to Cart",
      loading: "Loading products...",
      error: "Failed to load products",
      noProducts: "No products found",
      highestPrice: "Highest price"
    },
    ar: {
      title: "باقات الزهور",
      subtitle: "باقات زهور جميلة مرتبة يدوياً لكل مناسبة",
      badge: "باقات",
      filters: "التصفية",
      clearAll: "مسح الكل",
      priceRange: "نطاق السعر",
      arrangement: "التنسيق",
      minPrice: "الحد الأدنى",
      maxPrice: "الحد الأقصى",
      sortBy: "ترتيب حسب:",
      default: "افتراضي",
      priceLow: "السعر: من الأقل للأعلى",
      priceHigh: "السعر: من الأعلى للأقل",
      newest: "الأحدث أولاً",
      nameAZ: "الاسم: أ-ي",
      items: "منتج",
      bouquet: "باقة",
      box: "صندوق",
      basket: "سلة",
      vase: "مزهرية",
      tray: "صينية",
      stand: "حامل",
      kd: "د.ك",
      addToCart: "أضف للسلة",
      loading: "جاري تحميل المنتجات...",
      error: "فشل في تحميل المنتجات",
      noProducts: "لا توجد منتجات",
      highestPrice: "أعلى سعر"
    }
  };
  const t = translations[currentLang] || translations.en;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all categories
        const categoriesResponse = await categoryService.getAllCategories();
        let categories = [];
        
        if (categoriesResponse.success && categoriesResponse.data) {
          categories = categoriesResponse.data.content || categoriesResponse.data || [];
        }
        
        console.log('All categories:', categories); // Debug log
        
        // Find the exact category - FLOWER BOUQUETS
        const targetCategory = categories.find(cat => {
          const name = (cat.categoryName || cat.nameEn || cat.name || '').toLowerCase().trim();
          // Match exactly "flower bouquets"
          return name === 'flower bouquets';
        });
        
        console.log('Target category found:', targetCategory); // Debug log
        
        if (!targetCategory) {
          console.log('Category not found. Available categories:', categories.map(c => c.categoryName || c.name));
          setError('Category not found.');
          setProducts([]);
          setLoading(false);
          return;
        }
        
        // Fetch products by category ID
        const productsResponse = await productService.getProductsByCategory(
          targetCategory.categoryId,
          { page: 0, size: 100, sort: 'createdAt,desc' }
        );
        
        console.log('Products response:', productsResponse); // Debug log
        
        let productsList = [];
        if (productsResponse.success && productsResponse.data) {
          productsList = productsResponse.data.content || productsResponse.data || [];
        }
        
        console.log('Products list:', productsList); // Debug log
        console.log('Total products found:', productsList.length); // Debug log
        
        // Filter only active products
        const activeProducts = productsList.filter(p => p.isActive !== false);
        console.log('Active products:', activeProducts.length); // Debug log
        
        setProducts(activeProducts);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

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
    const dbDesc = product.shortDescriptionEn || product.shortDescription || product.descriptionEn || product.description;
    const dbDescAr = product.shortDescriptionAr || product.descriptionAr;
    
    if (currentLang === 'ar' && dbDescAr) return String(dbDescAr);
    if (dbDesc) return String(dbDesc);
    
    const name = (product.productName || product.name || '').toLowerCase();
    if (name.includes('rose')) return currentLang === 'ar' ? 'ورود طازجة وجميلة' : 'Fresh beautiful roses';
    if (name.includes('orchid')) return currentLang === 'ar' ? 'أوركيد أنيق وفاخر' : 'Elegant premium orchids';
    if (name.includes('tulip')) return currentLang === 'ar' ? 'توليب طازج وملون' : 'Fresh colorful tulips';
    if (name.includes('lily') || name.includes('lilium')) return currentLang === 'ar' ? 'ليليوم عطري وجميل' : 'Fragrant beautiful lilium';
    if (name.includes('bouquet')) return currentLang === 'ar' ? 'باقة زهور مرتبة بعناية' : 'Carefully arranged flower bouquet';
    if (name.includes('vase')) return currentLang === 'ar' ? 'تنسيق زهور في مزهرية أنيقة' : 'Flower arrangement in elegant vase';
    if (name.includes('box')) return currentLang === 'ar' ? 'زهور في صندوق فاخر' : 'Flowers in luxury box';
    if (name.includes('basket')) return currentLang === 'ar' ? 'سلة زهور طازجة' : 'Fresh flower basket';
    
    return currentLang === 'ar' ? 'تنسيق زهور طازجة وأنيقة' : 'Fresh elegant flower arrangement';
  };

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 100;
    return Math.ceil(Math.max(...products.map(p => getFinalPrice(p))));
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    
    if (priceRange.min !== '') {
      result = result.filter(p => getFinalPrice(p) >= Number(priceRange.min));
    }
    if (priceRange.max !== '') {
      result = result.filter(p => getFinalPrice(p) <= Number(priceRange.max));
    }
    if (selectedArrangements.length > 0) {
      result = result.filter(p =>
        selectedArrangements.some(arr =>
          getProductName(p).toLowerCase().includes(arr.toLowerCase())
        )
      );
    }
    
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
      case 'nameAZ':
        result.sort((a, b) => getProductName(a).localeCompare(getProductName(b)));
        break;
      default:
        break;
    }
    
    return result;
  }, [products, priceRange, selectedArrangements, sortBy, currentLang]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const pid = getProductSlug(product);
    setAddingToCart(prev => ({ ...prev, [pid]: true }));
    
    addToCart({
      id: product.productId || product.id,
      name: getProductName(product),
      nameEn: product.productName || product.nameEn || product.name,
      nameAr: product.productNameAr || product.nameAr || product.productName,
      price: getFinalPrice(product),
      salePrice: getFinalPrice(product),
      finalPrice: getFinalPrice(product),
      originalPrice: getOriginalPrice(product),
      actualPrice: getOriginalPrice(product),
      image: getProductImage(product),
      quantity: 1,
    });
    
    setTimeout(() => setAddingToCart(prev => ({ ...prev, [pid]: false })), 800);
  };

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSelectedArrangements([]);
    setSortBy('default');
  };

  const toggleArrangement = (arr) => {
    setSelectedArrangements(prev =>
      prev.includes(arr) ? prev.filter(a => a !== arr) : [...prev, arr]
    );
  };

  const hasActiveFilters = priceRange.min !== '' || priceRange.max !== '' || selectedArrangements.length > 0;

  const arrangementTypes = [
    { key: 'bouquet', label: t.bouquet },
    { key: 'box', label: t.box },
    { key: 'basket', label: t.basket },
    { key: 'vase', label: t.vase },
    { key: 'tray', label: t.tray },
    { key: 'stand', label: t.stand }
  ];

  return (
    <div className={`bouquets-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      <section className="hero-banner">
        <div className="hero-bg-decoration">
          <span className="floating-icon float-1">💐</span>
          <span className="floating-icon float-2">✨</span>
          <span className="floating-icon float-3">🌸</span>
        </div>
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge"><span>💐</span>{t.badge}</span>
            <h1 className="hero-title">{t.title}</h1>
            <p className="hero-subtitle">{t.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Mobile Filter/Sort Toolbar */}
      <MobileFilterBar
        currentLang={currentLang}
        onFilterClick={() => setMobileFilterOpen(true)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterCount={(selectedArrangements.length > 0 ? 1 : 0) + (priceRange.min !== '' || priceRange.max !== '' ? 1 : 0)}
        sortOptions={[
          { value: 'default', labelEn: t.default, labelAr: 'افتراضي' },
          { value: 'priceLow', labelEn: t.priceLow, labelAr: 'السعر: من الأقل للأعلى' },
          { value: 'priceHigh', labelEn: t.priceHigh, labelAr: 'السعر: من الأعلى للأقل' },
          { value: 'newest', labelEn: t.newest, labelAr: 'الأحدث أولاً' },
          { value: 'nameAZ', labelEn: t.nameAZ, labelAr: 'الاسم: أ-ي' },
        ]}
      />

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        currentLang={currentLang}
        onClearAll={clearFilters}
        itemCount={filteredAndSortedProducts.length}
      >
        <FilterSection
          title={t.priceRange}
          isOpen={filtersOpen.price}
          onToggle={() => setFiltersOpen(prev => ({ ...prev, price: !prev.price }))}
        >
          <PriceRangeFilter
            minValue={priceRange.min}
            maxValue={priceRange.max}
            onMinChange={(val) => setPriceRange(prev => ({ ...prev, min: val }))}
            onMaxChange={(val) => setPriceRange(prev => ({ ...prev, max: val }))}
            currency={t.kd}
            highestPriceLabel={t.highestPrice}
            highestPrice={maxPrice}
          />
        </FilterSection>

        <FilterSection
          title={t.arrangement}
          isOpen={filtersOpen.arrangement}
          onToggle={() => setFiltersOpen(prev => ({ ...prev, arrangement: !prev.arrangement }))}
        >
          <CheckboxFilter
            options={arrangementTypes.map(arr => ({ value: arr.key, label: arr.label }))}
            selectedValues={selectedArrangements}
            onChange={setSelectedArrangements}
            currentLang={currentLang}
          />
        </FilterSection>
      </MobileFilterDrawer>

      <section className="main-content">
        <div className="container">
          <div className="content-layout">
            <aside className={`filters-sidebar ${mobileFilterOpen ? "open" : ""}`}>
              <div className="filters-header">
                <h3 className="filters-title">{t.filters}</h3>
                <button className="mobile-filter-close" onClick={() => setMobileFilterOpen(false)} aria-label="Close filters">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                {hasActiveFilters && (
                  <button className="clear-filters" onClick={clearFilters}>
                    {t.clearAll}
                  </button>
                )}
              </div>

              <div className="filter-section">
                <button
                  className={`filter-header ${filtersOpen.price ? 'open' : ''}`}
                  onClick={() => setFiltersOpen(prev => ({ ...prev, price: !prev.price }))}
                >
                  <span>{t.priceRange}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {filtersOpen.price && (
                  <div className="filter-content">
                    <div className="price-inputs">
                      <div className="price-input-group">
                        <span className="currency-label">{t.kd}</span>
                        <input
                          type="number"
                          placeholder={t.minPrice}
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          min="0"
                        />
                      </div>
                      <span className="price-separator">-</span>
                      <div className="price-input-group">
                        <span className="currency-label">{t.kd}</span>
                        <input
                          type="number"
                          placeholder={t.maxPrice}
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          min="0"
                        />
                      </div>
                    </div>
                    <p className="price-hint">{t.highestPrice}: {maxPrice} {t.kd}</p>
                  </div>
                )}
              </div>

              <div className="filter-section">
                <button
                  className={`filter-header ${filtersOpen.arrangement ? 'open' : ''}`}
                  onClick={() => setFiltersOpen(prev => ({ ...prev, arrangement: !prev.arrangement }))}
                >
                  <span>{t.arrangement}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {filtersOpen.arrangement && (
                  <div className="filter-content">
                    {arrangementTypes.map(({ key, label }) => (
                      <label key={key} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedArrangements.includes(key)}
                          onChange={() => toggleArrangement(key)}
                        />
                        <span className="checkmark"></span>
                        <span className="label-text">{label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            <div className="products-main">
              <div className="products-toolbar">
                <span className="items-count">{filteredAndSortedProducts.length} {t.items}</span>
                <div className="toolbar-right">
                  <div className="sort-dropdown">
                    <label>{t.sortBy}</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="default">{t.default}</option>
                      <option value="priceLow">{t.priceLow}</option>
                      <option value="priceHigh">{t.priceHigh}</option>
                      <option value="newest">{t.newest}</option>
                      <option value="nameAZ">{t.nameAZ}</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>{t.loading}</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{t.error}</p>
                </div>
              ) : filteredAndSortedProducts.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">💐</span>
                  <p>{t.noProducts}</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredAndSortedProducts.map((product, index) => {
                    const productName = getProductName(product);
                    const productImage = getProductImage(product);
                    const originalPrice = getOriginalPrice(product);
                    const finalPrice = getFinalPrice(product);
                    const showDiscount = hasDiscount(product);
                    const productSlug = getProductSlug(product);

                    return (
                      <Link
                        to={`/product/${productSlug}`}
                        className="product-card"
                        key={productSlug}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {showDiscount && (
                          <span className="discount-badge">
                            -{Math.round((1 - finalPrice / originalPrice) * 100)}%
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
                        <div className="product-info">
                          <h3 className="product-name">{productName}</h3>
                          <div className="product-footer">
                            <div className="price-wrapper">
                              {showDiscount && (
                                <span className="original-price">
                                  {parseFloat(originalPrice).toFixed(3)} KWD
                                </span>
                              )}
                              <span className="sale-price">
                                {parseFloat(finalPrice).toFixed(3)} KWD
                              </span>
                            </div>

                            <button
                              className={`add-btn ${addingToCart[productSlug] ? 'adding' : ''}`}
                              onClick={(e) => handleAddToCart(e, product)}
                            >
                              {addingToCart[productSlug] ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="12" y1="5" x2="12" y2="19" />
                                  <line x1="5" y1="12" x2="19" y2="12" />
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Bouquets;