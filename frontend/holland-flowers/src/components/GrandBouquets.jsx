import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import MobileFilterBar from './MobileFilterBar';
import MobileFilterDrawer, { FilterSection, PriceRangeFilter, CheckboxFilter, ColorFilter } from './MobileFilterDrawer';
import './GrandBouquets.css';
import AddToCartModal from './AddToCartModal';

const GrandBouquets = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const { addToCart } = useCart();

  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedArrangements, setSelectedArrangements] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState({ price: true, arrangement: true, color: true });

  // AddToCart Modal state
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
      title: "Grand Bouquets", subtitle: "Luxurious grand bouquets for special moments", badge: "GRAND BOUQUETS",
      filters: "Filters", clearAll: "Clear All", priceRange: "Price Range", arrangement: "Arrangement",
      minPrice: "Min", maxPrice: "Max", sortBy: "Sort by:", default: "Default",
      priceLow: "Price: Low to High", priceHigh: "Price: High to Low", newest: "Newest First", nameAZ: "Name: A-Z",
      items: "items", bouquet: "Bouquet", box: "Box", basket: "Basket", vase: "Vase", tray: "Tray", stand: "Stand",
      kd: "KD", addToCart: "Add to Cart",
      loading: "Loading products...", error: "Failed to load products", noProducts: "No products found", highestPrice: "Highest price",
      color: 'COLOR'
    },
    ar: {
      title: "الباقات الفاخرة", subtitle: "باقات فاخرة للحظات المميزة", badge: "باقات فاخرة",
      filters: "التصفية", clearAll: "مسح الكل", priceRange: "نطاق السعر", arrangement: "التنسيق",
      minPrice: "الحد الأدنى", maxPrice: "الحد الأقصى", sortBy: "ترتيب حسب:", default: "افتراضي",
      priceLow: "السعر: من الأقل للأعلى", priceHigh: "السعر: من الأعلى للأقل", newest: "الأحدث أولاً", nameAZ: "الاسم: أ-ي",
      items: "منتج", bouquet: "باقة", box: "صندوق", basket: "سلة", vase: "مزهرية", tray: "صينية", stand: "حامل",
      kd: "د.ك", addToCart: "أضف للسلة",
      loading: "جاري تحميل المنتجات...", error: "فشل في تحميل المنتجات", noProducts: "لا توجد منتجات", highestPrice: "أعلى سعر",
      color: 'اللون'
    }
  };
  const t = translations[currentLang] || translations.en;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true); setError(null);
        const categoriesResponse = await categoryService.getAllCategories();
        let categories = [];
        if (categoriesResponse.success && categoriesResponse.data) categories = categoriesResponse.data.content || categoriesResponse.data || [];
        const targetCategory = categories.find(cat => {
          const name = (cat.categoryName || cat.nameEn || cat.name || '').toLowerCase();
          return name === 'grand bouquet' || name.includes('grand');
        });
        if (!targetCategory) { setError('Category not found.'); setProducts([]); setLoading(false); return; }
        const productsResponse = await productService.getProductsByCategory(targetCategory.categoryId, { page: 0, size: 100, sort: 'createdAt,desc' });
        let productsList = [];
        if (productsResponse.success && productsResponse.data) productsList = productsResponse.data.content || productsResponse.data || [];
        setProducts(productsList.filter(p => p.isActive !== false));
      } catch (err) { setError('Failed to load products.'); } finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const getProductName = (product) => {
    if (currentLang === 'ar') return product.productNameAr || product.nameAr || product.productName || product.name || 'Unknown';
    return product.productName || product.nameEn || product.name || 'Unknown';
  };

  const getProductImage = (product) => product.imageUrl || product.primaryImageUrl || product.image || '/images/placeholder.webp';
  const getOriginalPrice = (product) => product.actualPrice || product.originalPrice || product.price || 0;
  const getFinalPrice = (product) => product.finalPrice || product.salePrice || product.price || product.actualPrice || 0;
  const hasDiscount = (product) => { const o = getOriginalPrice(product); const f = getFinalPrice(product); return o > 0 && f > 0 && o > f; };
  const getProductSlug = (product) => product.productId || product.sku || product.slug || product.id;

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

  const maxPrice = useMemo(() => products.length === 0 ? 100 : Math.ceil(Math.max(...products.map(p => getFinalPrice(p)))), [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    if (priceRange.min !== '') result = result.filter(p => getFinalPrice(p) >= Number(priceRange.min));
    if (priceRange.max !== '') result = result.filter(p => getFinalPrice(p) <= Number(priceRange.max));
    if (selectedArrangements.length > 0) result = result.filter(p => selectedArrangements.some(arr => getProductName(p).toLowerCase().includes(arr.toLowerCase())));
    if (selectedColors.length > 0) result = result.filter(p => selectedColors.some(color => getProductName(p).toLowerCase().includes(color.toLowerCase()) || (p.tags || '').toLowerCase().includes(color.toLowerCase()) || (p.color || '').toLowerCase().includes(color.toLowerCase())));
    switch (sortBy) {
      case 'priceLow': result.sort((a, b) => getFinalPrice(a) - getFinalPrice(b)); break;
      case 'priceHigh': result.sort((a, b) => getFinalPrice(b) - getFinalPrice(a)); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'nameAZ': result.sort((a, b) => getProductName(a).localeCompare(getProductName(b))); break;
      default: break;
    }
    return result;
  }, [products, priceRange, selectedArrangements, selectedColors, sortBy, currentLang]);

  const handleAddToCart = (e, product) => {
    e.preventDefault(); e.stopPropagation();
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
    
    // Show the AddToCart modal with suggestions
    setSelectedProduct({
      ...product,
      productId: product.productId || product.id,
      productName: product.productName || product.name,
      imageUrl: product.imageUrl || product.primaryImageUrl || product.image,
    });
    setShowCartModal(true);
  };

  const clearFilters = () => { setPriceRange({ min: '', max: '' }); setSelectedArrangements([]);
    setSelectedColors([]); setSortBy('default'); };

  const handleCloseModal = () => {
    setShowCartModal(false);
    setSelectedProduct(null);
  };
  const toggleArrangement = (arr) => setSelectedArrangements(prev => prev.includes(arr) ? prev.filter(a => a !== arr) : [...prev, arr]);
  const toggleColor = (color) => setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  const hasActiveFilters = priceRange.min !== '' || priceRange.max !== '' || selectedArrangements.length > 0 || selectedColors.length > 0;
  const arrangementTypes = [{ key: 'bouquet', label: t.bouquet }, { key: 'box', label: t.box }, { key: 'basket', label: t.basket }, { key: 'vase', label: t.vase }, { key: 'tray', label: t.tray }, { key: 'stand', label: t.stand }];
  const colorOptions = [
    { key: 'beige', label: 'Beige', color: '#F5DEB3' },
    { key: 'black', label: 'Black', color: '#000000' },
    { key: 'blue', label: 'Blue', color: '#0066FF' },
    { key: 'brown', label: 'Brown', color: '#8B4513' },
    { key: 'clear', label: 'Clear', color: '#FFFFFF', border: true },
    { key: 'gold', label: 'Gold', color: '#FFD700' },
    { key: 'green', label: 'Green', color: '#00AA00' },
    { key: 'multicolor', label: 'Multicolor', color: 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff)', gradient: true },
    { key: 'orange', label: 'Orange', color: '#FF8C00' },
    { key: 'pink', label: 'Pink', color: '#FFB6C1' },
    { key: 'purple', label: 'Purple', color: '#9932CC' },
    { key: 'red', label: 'Red', color: '#FF0000' },
    { key: 'white', label: 'White', color: '#FFFFFF', border: true },
    { key: 'yellow', label: 'Yellow', color: '#FFFF00' }
  ];


  return (
    <div className={`grandbouquets-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      <section className="hero-banner">
        <div className="hero-bg-decoration">
          <span className="floating-icon float-1">👑</span>
          <span className="floating-icon float-2">✨</span>
          <span className="floating-icon float-3">🌸</span>
        </div>
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge"><span>👑</span>{t.badge}</span>
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
          { value: 'default', labelEn: t.default || 'Default', labelAr: 'افتراضي' },
          { value: 'priceLow', labelEn: t.priceLow || 'Price: Low to High', labelAr: 'السعر: من الأقل للأعلى' },
          { value: 'priceHigh', labelEn: t.priceHigh || 'Price: High to Low', labelAr: 'السعر: من الأعلى للأقل' },
          { value: 'newest', labelEn: t.newest || 'Newest First', labelAr: 'الأحدث أولاً' },
          { value: 'nameAZ', labelEn: t.nameAZ || 'Name: A-Z', labelAr: 'الاسم: أ-ي' },
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
          title={t.priceRange || t.price || 'Price Range'} 
          isOpen={filtersOpen.price} 
          onToggle={() => setFiltersOpen(prev => ({ ...prev, price: !prev.price }))}
        >
          <PriceRangeFilter
            minValue={priceRange.min}
            maxValue={priceRange.max}
            onMinChange={(val) => setPriceRange(prev => ({ ...prev, min: val }))}
            onMaxChange={(val) => setPriceRange(prev => ({ ...prev, max: val }))}
            currency={t.kd || t.currency || 'KD'}
            highestPriceLabel={t.highestPrice || 'Highest price'}
            highestPrice={maxPrice}
          />
        </FilterSection>
        
        <FilterSection 
          title={t.arrangement || 'Arrangement'} 
          isOpen={filtersOpen.arrangement} 
          onToggle={() => setFiltersOpen(prev => ({ ...prev, arrangement: !prev.arrangement }))}
        >
          <CheckboxFilter
            options={arrangementTypes.map ? arrangementTypes.map(arr => ({ value: arr.key || arr.value, label: arr.label })) : arrangementTypes}
            selectedValues={selectedArrangements}
            onChange={setSelectedArrangements}
            currentLang={currentLang}
          />
        </FilterSection>
        
        <FilterSection 
          title={t.color || 'Color'} 
          isOpen={filtersOpen.color} 
          onToggle={() => setFiltersOpen(prev => ({ ...prev, color: !prev.color }))}
        >
          <ColorFilter
            options={colorOptions}
            selectedValues={selectedColors}
            onChange={setSelectedColors}
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
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
                {hasActiveFilters && <button className="clear-filters" onClick={clearFilters}>{t.clearAll}</button>}
              </div>
              <div className="filter-section">
                <button className={`filter-header ${filtersOpen.price ? 'open' : ''}`} onClick={() => setFiltersOpen(prev => ({ ...prev, price: !prev.price }))}>
                  <span>{t.priceRange}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                {filtersOpen.price && (
                  <div className="filter-content">
                    <div className="price-inputs">
                      <div className="price-input-group"><span className="currency-label">{t.kd}</span><input type="number" placeholder={t.minPrice} value={priceRange.min} onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))} min="0"/></div>
                      <span className="price-separator">-</span>
                      <div className="price-input-group"><span className="currency-label">{t.kd}</span><input type="number" placeholder={t.maxPrice} value={priceRange.max} onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))} min="0"/></div>
                    </div>
                    <p className="price-hint">{t.highestPrice}: {maxPrice} {t.kd}</p>
                  </div>
                )}
              </div>
              <div className="filter-section">
                <button className={`filter-header ${filtersOpen.arrangement ? 'open' : ''}`} onClick={() => setFiltersOpen(prev => ({ ...prev, arrangement: !prev.arrangement }))}>
                  <span>{t.arrangement}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                {filtersOpen.arrangement && (
                  <div className="filter-content">
                    {arrangementTypes.map(({ key, label }) => (
                      <label key={key} className="checkbox-label">
                        <input type="checkbox" checked={selectedArrangements.includes(key)} onChange={() => toggleArrangement(key)}/>
                        <span className="checkmark"></span>
                        <span className="label-text">{label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="filter-section">
                <button className={`filter-header ${filtersOpen.color ? 'open' : ''}`} onClick={() => setFiltersOpen(prev => ({ ...prev, color: !prev.color }))}>
                  <span>{t.color}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                {filtersOpen.color && (
                  <div className="filter-content">
                    <div className="color-grid">
                      {colorOptions.map(({ key, label, color, border }) => (
                        <label key={key} className={`color-option ${selectedColors.includes(key) ? 'selected' : ''}`}>
                          <input type="checkbox" checked={selectedColors.includes(key)} onChange={() => toggleColor(key)}/>
                          <span className={`color-circle ${border ? 'with-border' : ''}`} style={{ background: color }}></span>
                          <span className="color-name">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
            <div className="products-main">
              <div className="products-toolbar">
                <span className="items-count">{filteredAndSortedProducts.length} {t.items}</span>
                <div className="toolbar-right">
                  <div className="sort-dropdown"><label>{t.sortBy}</label><select value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="default">{t.default}</option><option value="priceLow">{t.priceLow}</option><option value="priceHigh">{t.priceHigh}</option><option value="newest">{t.newest}</option><option value="nameAZ">{t.nameAZ}</option></select></div>
                  </div>
              </div>

              {loading ? (
                <div className="loading-state"><div className="spinner"></div><p>{t.loading}</p></div>
              ) : error ? (
                <div className="error-state"><p>{t.error}</p></div>
              ) : filteredAndSortedProducts.length === 0 ? (
                <div className="empty-state"><span className="empty-icon">👑</span><p>{t.noProducts}</p></div>
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
                      <Link to={`/product/${productSlug}`} className="product-card" key={productSlug} style={{ animationDelay: `${index * 0.05}s` }}>
                        {showDiscount && <span className="discount-badge">-{Math.round((1 - finalPrice / originalPrice) * 100)}%</span>}
                        <div className="product-image-wrapper"><img src={productImage} alt={productName} className="product-image" loading="lazy" onError={(e) => { e.target.src = '/images/placeholder.webp'; }}/></div>
                        <div className="product-info">
                          <h3 className="product-name">{productName}</h3>
                          <p className="product-description">{getProductDescription(product)}</p>
                          <div className="product-footer">
                            <div className="price-wrapper">
                              {showDiscount && <span className="original-price">{parseFloat(originalPrice).toFixed(3)} KWD</span>}
                              <span className="sale-price">{parseFloat(finalPrice).toFixed(3)} KWD</span>
                            </div>
                            
                            {/* Plus button removed - click card to view details */}
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
      {/* AddToCart Modal with Suggestions */}
      {showCartModal && selectedProduct && (
        <AddToCartModal
          isOpen={showCartModal}
          onClose={handleCloseModal}
          product={selectedProduct}
          currentLang={currentLang}
        />
      )}
    </div>
  );
};

export default GrandBouquets;
