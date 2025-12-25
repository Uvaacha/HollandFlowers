import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import './Combos.css';

const Combos = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [categoryCounts, setCategoryCounts] = useState({
    'flowers-perfume': 0,
    'flowers-chocolates': 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);

    const handleLangChange = (e) => {
      setCurrentLang(e.detail);
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  // Fetch product counts for each category
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        setLoading(true);
        
        const categoriesResponse = await categoryService.getAllCategories();
        let categories = [];
        if (categoriesResponse.success && categoriesResponse.data) {
          categories = categoriesResponse.data.content || categoriesResponse.data || [];
        }

        // Find Flowers With Perfume category
        const perfumeCategory = categories.find(cat => {
          const name = (cat.categoryName || cat.nameEn || cat.name || '').toLowerCase();
          return name.includes('perfume') || (name.includes('flower') && name.includes('perfume'));
        });

        // Find Flowers & Chocolates category
        const chocolateCategory = categories.find(cat => {
          const name = (cat.categoryName || cat.nameEn || cat.name || '').toLowerCase();
          return name.includes('chocolate') || (name.includes('flower') && name.includes('chocolate'));
        });

        const counts = {
          'flowers-perfume': 0,
          'flowers-chocolates': 0
        };

        // Get perfume products count
        if (perfumeCategory) {
          try {
            const perfumeProducts = await productService.getProductsByCategory(perfumeCategory.categoryId, {
              page: 0,
              size: 1
            });
            if (perfumeProducts.success && perfumeProducts.data) {
              counts['flowers-perfume'] = perfumeProducts.data.totalElements || 
                                          (perfumeProducts.data.content ? perfumeProducts.data.content.length : 0);
            }
          } catch (err) {
            console.log('Could not fetch perfume products count');
          }
        }

        // Get chocolate products count
        if (chocolateCategory) {
          try {
            const chocolateProducts = await productService.getProductsByCategory(chocolateCategory.categoryId, {
              page: 0,
              size: 1
            });
            if (chocolateProducts.success && chocolateProducts.data) {
              counts['flowers-chocolates'] = chocolateProducts.data.totalElements || 
                                             (chocolateProducts.data.content ? chocolateProducts.data.content.length : 0);
            }
          } catch (err) {
            console.log('Could not fetch chocolate products count');
          }
        }

        setCategoryCounts(counts);
        console.log('Category counts:', counts);

      } catch (err) {
        console.error('Error fetching category counts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryCounts();
  }, []);

  const translations = {
    en: {
      pageTitle: "Combo Collections",
      pageSubtitle: "Perfect pairings of flowers with premium gifts - chocolates, perfumes and more",
      breadcrumbHome: "Home",
      breadcrumbCurrent: "Combos",
      exploreBtn: "Explore Collection",
      itemsAvailable: "items available",
      categories: [
        {
          id: 'flowers-perfume',
          title: "Flowers With Perfume",
          description: "Exquisite flower arrangements paired with luxury Supreme Bouquet perfumes - the perfect gift combination",
          image: "/images/combos/flowers-perfume/Holland Style 28.PNG",
          link: "/combos/flowers-perfume",
          color: "#9b59b6",
          icon: "✨"
        },
        {
          id: 'flowers-chocolates',
          title: "Flowers & Chocolates",
          description: "Beautiful flowers combined with premium Ferrero chocolates - sweetness meets elegance",
          image: "/images/combos/flowers-chocolates/Love 1.webp",
          link: "/combos/flowers-chocolates",
          color: "#8b4513",
          icon: "🍫"
        }
      ],
      features: [
        {
          icon: "gift",
          title: "Perfect Gift Sets",
          desc: "Ready-made combos for every occasion"
        },
        {
          icon: "savings",
          title: "Better Value",
          desc: "Save more with our combo offers"
        },
        {
          icon: "delivery",
          title: "Elegant Packaging",
          desc: "Beautifully presented and gift-ready"
        }
      ]
    },
    ar: {
      pageTitle: "مجموعات الكومبو",
      pageSubtitle: "تنسيقات مثالية من الزهور مع الهدايا الفاخرة - شوكولاتة، عطور والمزيد",
      breadcrumbHome: "الرئيسية",
      breadcrumbCurrent: "الكومبو",
      exploreBtn: "استكشف المجموعة",
      itemsAvailable: "منتج متوفر",
      categories: [
        {
          id: 'flowers-perfume',
          title: "زهور مع عطر",
          description: "تنسيقات زهور رائعة مع عطور سوبريم بوكيه الفاخرة - مزيج الهدية المثالي",
          image: "/images/combos/flowers-perfume/Holland Style 28.PNG",
          link: "/combos/flowers-perfume",
          color: "#9b59b6",
          icon: "✨"
        },
        {
          id: 'flowers-chocolates',
          title: "زهور وشوكولاتة",
          description: "زهور جميلة مع شوكولاتة فيريرو الفاخرة - الحلاوة تلتقي بالأناقة",
          image: "/images/combos/flowers-chocolates/Love 1.webp",
          link: "/combos/flowers-chocolates",
          color: "#8b4513",
          icon: "🍫"
        }
      ],
      features: [
        {
          icon: "gift",
          title: "أطقم هدايا مثالية",
          desc: "كومبوهات جاهزة لكل مناسبة"
        },
        {
          icon: "savings",
          title: "قيمة أفضل",
          desc: "وفر أكثر مع عروض الكومبو"
        },
        {
          icon: "delivery",
          title: "تغليف أنيق",
          desc: "معروضة بشكل جميل وجاهزة للإهداء"
        }
      ]
    }
  };

  const t = translations[currentLang];

  const renderFeatureIcon = (iconName) => {
    switch(iconName) {
      case 'gift':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="20 12 20 22 4 22 4 12"></polyline>
            <rect x="2" y="7" width="20" height="5"></rect>
            <line x1="12" y1="22" x2="12" y2="7"></line>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
          </svg>
        );
      case 'savings':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        );
      case 'delivery':
        return (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`combos-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Decorative Elements */}
      <div className="combos-bg-decoration">
        <div className="deco-shape shape-1"></div>
        <div className="deco-shape shape-2"></div>
        <div className="floating-icon icon-1">🎁</div>
        <div className="floating-icon icon-2">💐</div>
        <div className="floating-icon icon-3">✨</div>
      </div>

      {/* Breadcrumb */}
      <nav className="combos-breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li><Link to="/">{t.breadcrumbHome}</Link></li>
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
      <header className="combos-hero">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-badge">
              <span className="badge-icon">🎁</span>
              <span>{currentLang === 'ar' ? 'مجموعات خاصة' : 'Special Bundles'}</span>
              <span className="badge-icon">🎁</span>
            </div>
            <h1 className="hero-title">{t.pageTitle}</h1>
            <p className="hero-subtitle">{t.pageSubtitle}</p>
            <div className="hero-divider">
              <span className="divider-line"></span>
              <span className="divider-icon">💝</span>
              <span className="divider-line"></span>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Grid */}
      <section className="combos-categories">
        <div className="container">
          <div className="categories-grid">
            {t.categories.map((category, index) => (
              <Link 
                to={category.link} 
                key={category.id} 
                className="category-card"
                style={{ 
                  '--accent-color': category.color,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div className="card-shine"></div>
                
                <div className="card-image-section">
                  <div className="image-frame">
                    <img 
                      src={category.image} 
                      alt={category.title}
                      className="category-image"
                      loading="lazy"
                    />
                    <div className="image-overlay"></div>
                  </div>
                  <div className="category-icon">{category.icon}</div>
                  <div className="item-count-badge">
                    <span className="count">
                      {loading ? '...' : categoryCounts[category.id] || 0}
                    </span>
                    <span className="label">{t.itemsAvailable}</span>
                  </div>
                </div>

                <div className="card-content">
                  <h2 className="category-title">{category.title}</h2>
                  <p className="category-desc">{category.description}</p>
                  
                  <div className="explore-link">
                    <span>{t.exploreBtn}</span>
                    <svg className="arrow-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>

                <div className="card-border"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="combos-features">
        <div className="container">
          <div className="features-grid">
            {t.features.map((feature, index) => (
              <div className="feature-item" key={index}>
                <div className="feature-icon">
                  {renderFeatureIcon(feature.icon)}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="container">
          <div className="promo-content">
            <div className="promo-text">
              <span className="promo-badge">{currentLang === 'ar' ? 'عرض خاص' : 'Special Offer'}</span>
              <h3>{currentLang === 'ar' ? 'احصل على خصم يصل إلى 15% على جميع الكومبوهات' : 'Get up to 15% off on all Combos'}</h3>
              <p>{currentLang === 'ar' 
                ? 'اجعل هديتك لا تُنسى مع مجموعاتنا المنتقاة بعناية' 
                : 'Make your gift unforgettable with our carefully curated collections'}</p>
            </div>
            <Link to="/combos/flowers-chocolates" className="promo-btn">
              {currentLang === 'ar' ? 'تسوق الآن' : 'Shop Now'}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Combos;