import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Cakes.css';

const Cakes = () => {
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);
    const handleLangChange = (e) => setCurrentLang(e.detail);
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const translations = {
    en: {
      comingSoon: "Coming Soon",
      title: "Delicious Cakes",
      subtitle: "For every milestone, big or small, a slice of joy awaits",
      description: "We're baking something special! Our premium cake collection will be available soon. Stay tuned for designer cakes, birthday cakes, and celebration cakes made with love.",
      notifyMe: "Notify Me",
      backToHome: "Back to Home",
      features: [
        { icon: "🎂", title: "Designer Cakes", desc: "Custom designs for every occasion" },
        { icon: "🍰", title: "Premium Quality", desc: "Made with finest ingredients" },
        { icon: "🚚", title: "Same Day Delivery", desc: "Fresh cakes delivered to your door" }
      ]
    },
    ar: {
      comingSoon: "قريباً",
      title: "كيك لذيذ",
      subtitle: "لكل إنجاز، كبير أو صغير، قطعة من الفرح في انتظارك",
      description: "نحن نحضر شيئاً مميزاً! ستتوفر مجموعتنا المميزة من الكيك قريباً. ترقبوا الكيك المصمم وكيك أعياد الميلاد وكيك الاحتفالات المصنوعة بحب.",
      notifyMe: "أعلمني",
      backToHome: "العودة للرئيسية",
      features: [
        { icon: "🎂", title: "كيك مصمم", desc: "تصاميم مخصصة لكل مناسبة" },
        { icon: "🍰", title: "جودة ممتازة", desc: "مصنوع من أجود المكونات" },
        { icon: "🚚", title: "توصيل في نفس اليوم", desc: "كيك طازج يصل لباب منزلك" }
      ]
    }
  };

  const t = translations[currentLang];

  return (
    <div className={`cakes-coming-soon-page ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Hero Section with Background Image */}
      <div className="cakes-hero">
        <div className="cakes-hero-bg" style={{ backgroundImage: `url('/images/cakes-coming-soon.png')` }}></div>
        <div className="cakes-hero-overlay"></div>
        
        <div className="cakes-hero-content">
          <span className="coming-soon-badge">
            <span className="badge-icon">🎂</span>
            {t.comingSoon}
          </span>
          
          <h1 className="cakes-title">{t.title}</h1>
          <p className="cakes-subtitle">{t.subtitle}</p>
          <p className="cakes-description">{t.description}</p>
          
          <div className="cakes-cta-buttons">
            <Link to="/" className="back-home-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>{t.backToHome}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="cakes-features-section">
        <div className="container">
          <div className="features-grid">
            {t.features.map((feature, index) => (
              <div className="feature-card" key={index}>
                <span className="feature-icon">{feature.icon}</span>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cakes;