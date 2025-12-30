import React, { useState, useEffect } from 'react';
import './ImageSlideshow.css';

const ImageSlideshow = ({ currentLang: propLang }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lang, setLang] = useState(propLang || 'en');
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Listen for language changes
  useEffect(() => {
    if (propLang) {
      setLang(propLang);
    } else {
      const savedLang = localStorage.getItem('preferredLanguage') || 'en';
      setLang(savedLang);

      const handleLangChange = (e) => {
        setLang(e.detail);
      };

      window.addEventListener('languageChange', handleLangChange);
      return () => window.removeEventListener('languageChange', handleLangChange);
    }
  }, [propLang]);

  const translations = {
    en: {
      slide1Text: "For every love story, there's a timeless anniversary gift waiting. Explore our collection",
      slide1Button: "Explore",
      slide2Text: "Shop all the must-have Birthday Party Essentials, including Balloon Decor, Designer Cakes, and Flowers.",
      slide2Button: "Shop Now",
      slide3Text: "For every milestone, big or small, a slice of joy awaits; place your order today!",
      slide3Button: "Order Now",
      slide4Text: "A colorful bouquet is a swift and beautiful way to show you care.",
      slide4Button: "Shop Flowers",
      prevAriaLabel: "Previous Slide",
      nextAriaLabel: "Next Slide",
      goToSlide: "Go to slide",
      comingSoon: "Coming Soon",
      comingSoonDesc: "We're baking something special! Our premium cake collection will be available soon.",
      stayTuned: "Stay Tuned"
    },
    ar: {
      slide1Text: "لكل قصة حب، هناك هدية ذكرى سنوية خالدة في انتظارك. استكشف مجموعتنا",
      slide1Button: "استكشف",
      slide2Text: "تسوق جميع أساسيات حفلة عيد الميلاد الضرورية، بما في ذلك ديكور البالونات والكيك المصمم والزهور",
      slide2Button: "تسوق الآن",
      slide3Text: "لكل إنجاز، كبير أو صغير، قطعة من الفرح في انتظارك؛ اطلب اليوم",
      slide3Button: "اطلب الآن",
      slide4Text: "الباقة الملونة هي طريقة سريعة وجميلة لإظهار اهتمامك",
      slide4Button: "تسوق الزهور",
      prevAriaLabel: "الشريحة السابقة",
      nextAriaLabel: "الشريحة التالية",
      goToSlide: "انتقل إلى الشريحة",
      comingSoon: "قريباً",
      comingSoonDesc: "نحن نحضر شيئاً مميزاً! ستتوفر مجموعتنا المميزة من الكيك قريباً.",
      stayTuned: "ترقبوا"
    }
  };

  const t = translations[lang];

  const slides = [
    {
      id: 1,
      image: `${process.env.PUBLIC_URL}/Flowers-1.webp`,
      text: t.slide1Text,
      buttonText: t.slide1Button,
      buttonLink: "/valentine-special",
      isComingSoon: false
    },
    {
      id: 2,
      image: `${process.env.PUBLIC_URL}/Flowers-2.webp`,
      text: t.slide2Text,
      buttonText: t.slide2Button,
      buttonLink: "/birthday",
      isComingSoon: false
    },
    {
      id: 3,
      image: `${process.env.PUBLIC_URL}/Flowers-3.webp`,
      text: t.slide3Text,
      buttonText: t.slide3Button,
      buttonLink: "/cakes",
      isComingSoon: true  // This slide shows Coming Soon popup
    },
    {
      id: 4,
      image: `${process.env.PUBLIC_URL}/Flowers-4.webp`,
      text: t.slide4Text,
      buttonText: t.slide4Button,
      buttonLink: "/bouquets",
      isComingSoon: false
    }
  ];

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  // Close Coming Soon popup when slide changes
  useEffect(() => {
    setShowComingSoon(false);
  }, [currentSlide]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleButtonClick = (e, slide) => {
    if (slide.isComingSoon) {
      e.preventDefault();
      setShowComingSoon(true);
    }
  };

  const closeComingSoon = () => {
    setShowComingSoon(false);
  };

  return (
    <div className="slideshow-container" data-lang={lang}>
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`slide ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="slide-overlay">
            <div className="slide-content">
              <div className="slide-text-wrapper">
                <p className="slide-text">{slide.text}</p>
                <a 
                  href={slide.buttonLink} 
                  className="slide-button"
                  onClick={(e) => handleButtonClick(e, slide)}
                >
                  <span>{slide.buttonText}</span>
                  <svg 
                    className="button-arrow" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Coming Soon Popup */}
      {showComingSoon && (
        <div className="coming-soon-overlay" onClick={closeComingSoon}>
          <div className="coming-soon-popup" onClick={(e) => e.stopPropagation()}>
            <button className="coming-soon-close" onClick={closeComingSoon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="coming-soon-content">
              <span className="coming-soon-icon">🎂</span>
              <h2 className="coming-soon-title">{t.comingSoon}</h2>
              <p className="coming-soon-desc">{t.comingSoonDesc}</p>
              <button className="coming-soon-btn" onClick={closeComingSoon}>
                {t.stayTuned}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      <button 
        className="slide-arrow prev" 
        onClick={prevSlide} 
        aria-label={t.prevAriaLabel}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button 
        className="slide-arrow next" 
        onClick={nextSlide} 
        aria-label={t.nextAriaLabel}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      {/* Dots Navigation */}
      <div className="slide-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`${t.goToSlide} ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlideshow;