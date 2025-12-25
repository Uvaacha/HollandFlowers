import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AddOns.css';

const AddOns = () => {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);

    const handleLangChange = (e) => {
      setCurrentLang(e.detail);
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const translations = {
    en: {
      pageTitle: "Add-Ons Collection",
      pageSubtitle: "Enhance your floral gifts with our exquisite add-ons",
      breadcrumbHome: "Home",
      breadcrumbCurrent: "Add-Ons",
      exploreBtn: "Explore Collection",
      itemsAvailable: "items available",
      categories: [
        {
          id: 'acrylic-toppers',
          title: "Acrylic Celebration Toppers",
          description: "Beautiful acrylic signs for every occasion - birthdays, anniversaries, graduations, and more",
          image: "/images/add-ons/acrylic-toppers/Happy Birthday.webp",
          link: "/add-ons/acrylic-toppers",
          itemCount: 18,
          color: "#e8b4b8"
        },
        {
          id: 'helium-balloons',
          title: "Helium Balloons",
          description: "Colorful helium balloons to add joy and festivity to your celebrations",
          image: "/images/add-ons/helium-balloons/Happy Birthday Pink Balloon 4.webp",
          link: "/add-ons/helium-balloons",
          itemCount: 106,
          color: "#87ceeb"
        },
        {
          id: 'crown-for-head',
          title: "Crown for Head",
          description: "Elegant floral crowns and wreaths perfect for special moments",
          image: "/images/add-ons/crown-for-head/Crown Pink For Head -1.webp",
          link: "/add-ons/crown-for-head",
          itemCount: 13,
          color: "#dda0dd"
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
      categories: [
        {
          id: 'acrylic-toppers',
          title: "توبر احتفالات أكريليك",
          description: "لافتات أكريليك جميلة لكل مناسبة - أعياد الميلاد، الذكرى السنوية، التخرج، والمزيد",
          image: "/images/add-ons/acrylic-toppers/Happy Birthday.webp",
          link: "/add-ons/acrylic-toppers",
          itemCount: 18,
          color: "#e8b4b8"
        },
        {
          id: 'helium-balloons',
          title: "بالونات الهيليوم",
          description: "بالونات هيليوم ملونة لإضافة البهجة والاحتفال إلى مناسباتك",
          image: "/images/add-ons/helium-balloons/Happy Birthday Pink Balloon 4.webp",
          link: "/add-ons/helium-balloons",
          itemCount: 106,
          color: "#87ceeb"
        },
        {
          id: 'crown-for-head',
          title: "تاج للرأس",
          description: "تيجان وأكاليل زهور أنيقة مثالية للحظات الخاصة",
          image: "/images/add-ons/crown-for-head/Crown Pink For Head -1.webp",
          link: "/add-ons/crown-for-head",
          itemCount: 13,
          color: "#dda0dd"
        }
      ]
    }
  };

  const t = translations[currentLang];

  return (
    <div className={`addons-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Decorative Elements */}
      <div className="addons-bg-decoration">
        <div className="deco-blob deco-blob-1"></div>
        <div className="deco-blob deco-blob-2"></div>
        <div className="deco-blob deco-blob-3"></div>
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
          <div className="hero-inner">
            <div className="hero-badge">
              <span className="badge-icon">✦</span>
              <span>Premium Collection</span>
              <span className="badge-icon">✦</span>
            </div>
            <h1 className="hero-title">{t.pageTitle}</h1>
            <p className="hero-subtitle">{t.pageSubtitle}</p>
            <div className="hero-divider">
              <span className="divider-line"></span>
              <svg className="divider-icon" width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
              </svg>
              <span className="divider-line"></span>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Grid */}
      <section className="addons-categories">
        <div className="container">
          <div className="categories-grid">
            {t.categories.map((category, index) => (
              <Link 
                to={category.link} 
                key={category.id} 
                className="category-card"
                style={{ 
                  '--accent-color': category.color,
                  animationDelay: `${index * 0.15}s`
                }}
              >
                <div className="card-glow"></div>
                
                <div className="card-image-section">
                  <div className="image-frame">
                    <img 
                      src={category.image} 
                      alt={category.title}
                      className="category-image"
                      loading="lazy"
                    />
                  </div>
                  <div className="item-count-badge">
                    <span className="count">{category.itemCount}</span>
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
      <section className="addons-features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h3>{currentLang === 'ar' ? 'مصنوعة بحب' : 'Made with Love'}</h3>
              <p>{currentLang === 'ar' ? 'كل قطعة مختارة بعناية' : 'Each piece carefully curated'}</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <h3>{currentLang === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}</h3>
              <p>{currentLang === 'ar' ? 'توصيل في نفس اليوم متاح' : 'Same day delivery available'}</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <h3>{currentLang === 'ar' ? 'جودة ممتازة' : 'Premium Quality'}</h3>
              <p>{currentLang === 'ar' ? 'أفضل المواد فقط' : 'Only the finest materials'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AddOns;