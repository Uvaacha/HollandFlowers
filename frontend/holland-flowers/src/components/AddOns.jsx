import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AddOns.css';

const AddOns = () => {
  const [currentLang, setCurrentLang] = useState('en');
  const [loadedImages, setLoadedImages] = useState({});

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);

    const handleLangChange = (e) => {
      setCurrentLang(e.detail);
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const handleImageLoad = (id) => {
    setLoadedImages(prev => ({ ...prev, [id]: true }));
  };

  const translations = {
    en: {
      pageTitle: "Add-Ons Collection",
      pageSubtitle: "Enhance your floral gifts with our exquisite add-ons",
      breadcrumbHome: "Home",
      breadcrumbCurrent: "Add-Ons",
      exploreBtn: "Explore Collection",
      itemsAvailable: "items available",
      premiumBadge: "Premium Selection",
      viewAll: "View All",
      categories: [
        {
          id: 'acrylic-toppers',
          title: "Acrylic Celebration Toppers",
          description: "Beautiful acrylic signs for every occasion - birthdays, anniversaries, graduations, and more",
          image: "/images/Add on's/happy New Year.webp",
          link: "/add-ons/acrylic-toppers",
          itemCount: 18,
          accent: "rose"
        },
        {
          id: 'helium-balloons',
          title: "Helium Balloons",
          description: "Colorful helium balloons to add joy and festivity to your celebrations",
          image: "/images/Hellium Ballons/Red Shiny Helium Balloons 03.webp",
          link: "/add-ons/helium-balloons",
          itemCount: 106,
          accent: "sky"
        },
        {
          id: 'crown-for-head',
          title: "Crown for Head",
          description: "Elegant floral crowns and wreaths perfect for special moments",
          image: "/images/Crown for head/Blue Crown For Head.webp",
          link: "/add-ons/crown-for-head",
          itemCount: 13,
          accent: "lavender"
        }
      ],
      features: [
        {
          icon: "heart",
          title: "Made with Love",
          desc: "Each piece carefully curated"
        },
        {
          icon: "delivery",
          title: "Fast Delivery",
          desc: "Same day delivery available"
        },
        {
          icon: "star",
          title: "Premium Quality",
          desc: "Only the finest materials"
        }
      ]
    },
    ar: {
      pageTitle: "مجموعة الإضافات",
      pageSubtitle: "عزز هدايا الزهور الخاصة بك مع إضافاتنا الرائعة",
      breadcrumbHome: "الرئيسية",
      breadcrumbCurrent: "الإضافات",
      exploreBtn: "استكشف المجموعة",
      itemsAvailable: "منتج متوفر",
      premiumBadge: "تشكيلة فاخرة",
      viewAll: "عرض الكل",
      categories: [
        {
          id: 'acrylic-toppers',
          title: "توبر احتفالات أكريليك",
          description: "لافتات أكريليك جميلة لكل مناسبة - أعياد الميلاد، الذكرى السنوية، التخرج، والمزيد",
          image: "/images/Add on's/happy New Year.webp",
          link: "/add-ons/acrylic-toppers",
          itemCount: 18,
          accent: "rose"
        },
        {
          id: 'helium-balloons',
          title: "بالونات الهيليوم",
          description: "بالونات هيليوم ملونة لإضافة البهجة والاحتفال إلى مناسباتك",
          image: "/images/Hellium Ballons/Red Shiny Helium Balloons 03.webp",
          link: "/add-ons/helium-balloons",
          itemCount: 106,
          accent: "sky"
        },
        {
          id: 'crown-for-head',
          title: "تاج للرأس",
          description: "تيجان وأكاليل زهور أنيقة مثالية للحظات الخاصة",
          image: "/images/Crown for head/Blue Crown For Head.webp",
          link: "/add-ons/crown-for-head",
          itemCount: 13,
          accent: "lavender"
        }
      ],
      features: [
        {
          icon: "heart",
          title: "مصنوعة بحب",
          desc: "كل قطعة مختارة بعناية"
        },
        {
          icon: "delivery",
          title: "توصيل سريع",
          desc: "توصيل في نفس اليوم متاح"
        },
        {
          icon: "star",
          title: "جودة ممتازة",
          desc: "أفضل المواد فقط"
        }
      ]
    }
  };

  const t = translations[currentLang];

  const renderIcon = (type) => {
    switch(type) {
      case 'heart':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        );
      case 'delivery':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="15" height="13"/>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        );
      case 'star':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`addons-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Elegant Background Pattern */}
      <div className="addons-bg-pattern">
        <div className="pattern-overlay"></div>
      </div>

      {/* Breadcrumb */}
      <nav className="addons-breadcrumb">
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
      <header className="addons-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-ornament top">
              <span className="ornament-line"></span>
              <span className="ornament-diamond">◆</span>
              <span className="ornament-line"></span>
            </div>
            
            <span className="hero-badge">{t.premiumBadge}</span>
            
            <h1 className="hero-title">{t.pageTitle}</h1>
            
            <p className="hero-subtitle">{t.pageSubtitle}</p>
            
            <div className="hero-ornament bottom">
              <span className="ornament-dot"></span>
              <span className="ornament-dot"></span>
              <span className="ornament-dot"></span>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Section */}
      <section className="addons-categories">
        <div className="container">
          <div className="categories-wrapper">
            {t.categories.map((category, index) => (
              <Link 
                to={category.link} 
                key={category.id} 
                className={`category-card accent-${category.accent}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Card Frame */}
                <div className="card-frame">
                  <span className="frame-corner tl"></span>
                  <span className="frame-corner tr"></span>
                  <span className="frame-corner bl"></span>
                  <span className="frame-corner br"></span>
                </div>

                {/* Image Container */}
                <div className="card-image-container">
                  <div className={`image-wrapper ${loadedImages[category.id] ? 'loaded' : ''}`}>
                    <img 
                      src={category.image} 
                      alt={category.title}
                      onLoad={() => handleImageLoad(category.id)}
                      loading="lazy"
                    />
                    <div className="image-overlay"></div>
                  </div>
                  
                  {/* Item Count Badge */}
                  <div className="count-badge">
                    <span className="count-number">{category.itemCount}</span>
                    <span className="count-label">{t.itemsAvailable}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="card-body">
                  <div className="card-divider">
                    <span></span>
                  </div>
                  
                  <h2 className="card-title">{category.title}</h2>
                  
                  <div className="card-action">
                    <span className="action-text">{t.exploreBtn}</span>
                    <span className="action-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="addons-features">
        <div className="container">
          <div className="features-wrapper">
            {t.features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon-wrapper">
                  {renderIcon(feature.icon)}
                </div>
                <div className="feature-text">
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Decoration */}
      <div className="addons-footer-deco">
        <div className="deco-line"></div>
        <span className="deco-symbol">❋</span>
        <div className="deco-line"></div>
      </div>
    </div>
  );
};

export default AddOns;