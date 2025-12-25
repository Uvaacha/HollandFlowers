import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import './RamadanSpecial.css';

const RamadanSpecial = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const { addToCart } = useCart();

  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedArrangements, setSelectedArrangements] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
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
      title: "Ramadan Special Collection", subtitle: "Celebrate the holy month with our blessed flower arrangements", badge: "Ramadan Kareem",
      filters: "Filters", clearAll: "Clear All", priceRange: "Price Range", arrangement: "Arrangement",
      minPrice: "Min", maxPrice: "Max", sortBy: "Sort by:", default: "Default",
      priceLow: "Price: Low to High", priceHigh: "Price: High to Low", newest: "Newest First", nameAZ: "Name: A-Z",
      items: "items", bouquet: "Bouquet", box: "Box", basket: "Basket", vase: "Vase", kd: "KD", addToCart: "Add to Cart",
      loading: "Loading Ramadan collection...", error: "Failed to load products", noProducts: "No products found", highestPrice: "Highest price"
    },
    ar: {
      title: "مجموعة رمضان الخاصة", subtitle: "احتفل بالشهر الكريم مع تنسيقات الزهور المباركة", badge: "رمضان كريم",
      filters: "التصفية", clearAll: "مسح الكل", priceRange: "نطاق السعر", arrangement: "التنسيق",
      minPrice: "الحد الأدنى", maxPrice: "الحد الأقصى", sortBy: "ترتيب حسب:", default: "افتراضي",
      priceLow: "السعر: من الأقل للأعلى", priceHigh: "السعر: من الأعلى للأقل", newest: "الأحدث أولاً", nameAZ: "الاسم: أ-ي",
      items: "منتج", bouquet: "باقة", box: "صندوق", basket: "سلة", vase: "مزهرية", kd: "د.ك", addToCart: "أضف للسلة",
      loading: "جاري تحميل مجموعة رمضان...", error: "فشل في تحميل المنتجات", noProducts: "لا توجد منتجات", highestPrice: "أعلى سعر"
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
        const ramadanCategory = categories.find(cat => {
          const name = (cat.categoryName || cat.nameEn || cat.name || '').toLowerCase();
          return name === 'ramadan' || name === 'ramadan special' || name.includes('ramadan');
        });
        if (!ramadanCategory) { setError('Category not found.'); setProducts([]); setLoading(false); return; }
        const productsResponse = await productService.getProductsByCategory(ramadanCategory.categoryId, { page: 0, size: 100, sort: 'createdAt,desc' });
        let productsList = [];
        if (productsResponse.success && productsResponse.data) productsList = productsResponse.data.content || productsResponse.data || [];
        setProducts(productsList.filter(p => p.isActive !== false));
      } catch (err) { setError('Failed to load products.'); } finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  // Helper functions matching your original code
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

  const maxPrice = useMemo(() => products.length === 0 ? 100 : Math.ceil(Math.max(...products.map(p => getFinalPrice(p)))), [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    if (priceRange.min !== '') result = result.filter(p => getFinalPrice(p) >= Number(priceRange.min));
    if (priceRange.max !== '') result = result.filter(p => getFinalPrice(p) <= Number(priceRange.max));
    if (selectedArrangements.length > 0) result = result.filter(p => selectedArrangements.some(arr => getProductName(p).toLowerCase().includes(arr.toLowerCase())));
    switch (sortBy) {
      case 'priceLow': result.sort((a, b) => getFinalPrice(a) - getFinalPrice(b)); break;
      case 'priceHigh': result.sort((a, b) => getFinalPrice(b) - getFinalPrice(a)); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'nameAZ': result.sort((a, b) => getProductName(a).localeCompare(getProductName(b))); break;
      default: break;
    }
    return result;
  }, [products, priceRange, selectedArrangements, sortBy, currentLang]);

  const handleAddToCart = (e, product) => {
    e.preventDefault(); e.stopPropagation();
    const pid = getProductSlug(product);
    setAddingToCart(prev => ({ ...prev, [pid]: true }));
    
    const cartItem = {
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
    };
    
    addToCart(cartItem);
    setTimeout(() => setAddingToCart(prev => ({ ...prev, [pid]: false })), 800);
  };

  const clearFilters = () => { setPriceRange({ min: '', max: '' }); setSelectedArrangements([]); setSortBy('default'); };
  const toggleArrangement = (arr) => setSelectedArrangements(prev => prev.includes(arr) ? prev.filter(a => a !== arr) : [...prev, arr]);
  const hasActiveFilters = priceRange.min !== '' || priceRange.max !== '' || selectedArrangements.length > 0;
  const arrangementTypes = [{ key: 'bouquet', label: t.bouquet }, { key: 'box', label: t.box }, { key: 'basket', label: t.basket }, { key: 'vase', label: t.vase }];

  return (
    <div className={`ramadan-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      <section className="hero-banner">
        <div className="hero-bg-decoration"><span className="floating-icon float-1">🌙</span><span className="floating-icon float-2">✨</span><span className="floating-icon float-3">🕌</span></div>
        <div className="container"><div className="hero-content"><span className="hero-badge"><span>🌙</span>{t.badge}</span><h1 className="hero-title">{t.title}</h1><p className="hero-subtitle">{t.subtitle}</p></div></div>
      </section>
      <section className="main-content">
        <div className="container">
          <div className="content-layout">
            <aside className="filters-sidebar">
              <div className="filters-header"><h3 className="filters-title">{t.filters}</h3>{hasActiveFilters && <button className="clear-filters" onClick={clearFilters}>{t.clearAll}</button>}</div>
              <div className="filter-section">
                <button className={`filter-header ${filtersOpen.price ? 'open' : ''}`} onClick={() => setFiltersOpen(prev => ({ ...prev, price: !prev.price }))}><span>{t.priceRange}</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg></button>
                {filtersOpen.price && <div className="filter-content"><div className="price-inputs"><div className="price-input-group"><span className="currency-label">{t.kd}</span><input type="number" placeholder={t.minPrice} value={priceRange.min} onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))} min="0"/></div><span className="price-separator">-</span><div className="price-input-group"><span className="currency-label">{t.kd}</span><input type="number" placeholder={t.maxPrice} value={priceRange.max} onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))} min="0"/></div></div><p className="price-hint">{t.highestPrice}: {maxPrice} {t.kd}</p></div>}
              </div>
              <div className="filter-section">
                <button className={`filter-header ${filtersOpen.arrangement ? 'open' : ''}`} onClick={() => setFiltersOpen(prev => ({ ...prev, arrangement: !prev.arrangement }))}><span>{t.arrangement}</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg></button>
                {filtersOpen.arrangement && <div className="filter-content">{arrangementTypes.map(({ key, label }) => <label key={key} className="checkbox-label"><input type="checkbox" checked={selectedArrangements.includes(key)} onChange={() => toggleArrangement(key)}/><span className="checkmark"></span><span className="label-text">{label}</span></label>)}</div>}
              </div>
            </aside>
            <div className="products-main">
              <div className="products-toolbar">
                <span className="items-count">{filteredAndSortedProducts.length} {t.items}</span>
                <div className="toolbar-right">
                  <div className="sort-dropdown"><label>{t.sortBy}</label><select value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="default">{t.default}</option><option value="priceLow">{t.priceLow}</option><option value="priceHigh">{t.priceHigh}</option><option value="newest">{t.newest}</option><option value="nameAZ">{t.nameAZ}</option></select></div>
                  <div className="view-toggle"><button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></button><button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/></svg></button></div>
                </div>
              </div>
              {loading ? <div className="loading-state"><div className="spinner"></div><p>{t.loading}</p></div> : error ? <div className="error-state"><p>{t.error}</p></div> : filteredAndSortedProducts.length === 0 ? <div className="empty-state"><span className="empty-icon">🌙</span><p>{t.noProducts}</p></div> : (
                <div className={`products-grid ${viewMode}`}>
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
                          <p className="product-desc">{currentLang === 'ar' ? 'هدية رمضانية جميلة' : 'Beautiful Ramadan gift'}</p>
                          <div className="product-footer">
                            <div className="price-wrapper">
                              {showDiscount && <span className="original-price">KD {parseFloat(originalPrice).toFixed(3)}</span>}
                              <span className="sale-price">KD {parseFloat(finalPrice).toFixed(3)}</span>
                            </div>
                            <button className={`add-btn ${addingToCart[productSlug] ? 'adding' : ''}`} onClick={(e) => handleAddToCart(e, product)}>
                              {addingToCart[productSlug] ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
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

export default RamadanSpecial;