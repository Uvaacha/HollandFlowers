import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewYearPopup.css';

const NewYearPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if popup was already shown in this session
    const popupShown = sessionStorage.getItem('newYearPopupShown');
    
    if (!popupShown) {
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        document.body.style.overflow = 'hidden';
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      document.body.style.overflow = '';
      sessionStorage.setItem('newYearPopupShown', 'true');
    }, 300);
  };

  const handleViewCollection = () => {
    sessionStorage.setItem('newYearPopupShown', 'true');
    document.body.style.overflow = '';
    setIsVisible(false);
    navigate('/bouquets');
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('newyear-popup-overlay')) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`newyear-popup-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className={`newyear-popup-container ${isClosing ? 'closing' : ''}`}>
        {/* Close Button */}
        <button className="newyear-popup-close" onClick={handleClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Hero Image */}
        <div className="newyear-popup-hero">
          <img 
            src="/new year logo.png" 
            alt="Happy New Year 2026" 
            className="newyear-hero-image"
          />
          <div className="newyear-hero-overlay"></div>
        </div>

        {/* Content */}
        <div className="newyear-popup-content">
          <span className="newyear-popup-badge">✦ New Year Special ✦</span>
          
          <h2 className="newyear-popup-title">Welcome 2026</h2>
          
          <p className="newyear-popup-subtitle">
            Start the year with beautiful blooms. Explore our exclusive New Year flower collection.
          </p>

          {/* Features */}
          <div className="newyear-popup-features">
            <div className="newyear-feature">
              <span className="newyear-feature-icon">🌸</span>
              <span className="newyear-feature-text">Flowers</span>
            </div>
            <div className="newyear-feature">
              <span className="newyear-feature-icon">💐</span>
              <span className="newyear-feature-text">Bouquets</span>
            </div>
            <div className="newyear-feature">
              <span className="newyear-feature-icon">🌺</span>
              <span className="newyear-feature-text">Arrangements</span>
            </div>
          </div>

          <div className="newyear-popup-buttons">
            <button className="newyear-btn-primary" onClick={handleViewCollection}>
              View Collection
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            
            <button className="newyear-btn-secondary" onClick={handleClose}>
              Continue Shopping
            </button>
          </div>

          {/* Footer */}
          <div className="newyear-popup-footer">
            <span>✨ Happy New Year from Holland Flowers. ✨</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewYearPopup;