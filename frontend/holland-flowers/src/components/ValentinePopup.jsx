import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ValentinePopup.css';

const ValentinePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if popup was already shown today
    const lastShown = localStorage.getItem('valentinePopupShown');
    const today = new Date().toDateString();
    
    if (lastShown !== today) {
      // Show popup after 2 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Calculate days until Valentine's Day
    const calculateDaysLeft = () => {
      const today = new Date();
      const valentinesDay = new Date(today.getFullYear(), 1, 14); // Feb 14
      
      // If Valentine's Day has passed this year, calculate for next year
      if (today > valentinesDay) {
        valentinesDay.setFullYear(today.getFullYear() + 1);
      }
      
      const diff = valentinesDay - today;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysLeft(days);
    };

    calculateDaysLeft();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Mark popup as shown for today
    localStorage.setItem('valentinePopupShown', new Date().toDateString());
  };

  const handleShopNow = () => {
    handleClose();
    navigate('/valentine-special');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="valentine-popup-backdrop" onClick={handleClose}>
        {/* Floating Hearts Animation */}
        {[...Array(15)].map((_, i) => (
          <div key={i} className={`floating-heart heart-${i + 1}`}>
            ❤️
          </div>
        ))}
      </div>

      {/* Popup Container */}
      <div className="valentine-popup-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="valentine-popup-close" onClick={handleClose} aria-label="Close popup">
          ✕
        </button>

        {/* Decorative Hearts */}
        <div className="valentine-popup-hearts">
          <span className="heart-left">💕</span>
          <span className="heart-right">💕</span>
        </div>

        {/* Content */}
        <div className="valentine-popup-content">
          {/* Header */}
          <div className="valentine-popup-header">
            <h2 className="valentine-popup-title">
              <span className="title-heart">💝</span>
              Valentine's Day Special
              <span className="title-heart">💝</span>
            </h2>
            <p className="valentine-popup-subtitle">
              Celebrate Love with Our Exclusive Collection
            </p>
          </div>

          {/* Countdown */}
          {daysLeft > 0 && daysLeft <= 30 && (
            <div className="valentine-countdown">
              <span className="countdown-label">Only</span>
              <span className="countdown-number">{daysLeft}</span>
              <span className="countdown-label">{daysLeft === 1 ? 'Day' : 'Days'} Left!</span>
            </div>
          )}

          {/* Offers */}
          <div className="valentine-offers">
            <div className="valentine-offer-item">
              <span className="offer-icon">🌹</span>
              <span className="offer-text">Premium Rose Bouquets</span>
            </div>
            <div className="valentine-offer-item">
              <span className="offer-icon">🎁</span>
              <span className="offer-text">Special Gift Combos</span>
            </div>
            <div className="valentine-offer-item">
              <span className="offer-icon">💝</span>
              <span className="offer-text">Express Delivery Available</span>
            </div>
            <div className="valentine-offer-item">
              <span className="offer-icon">✨</span>
              <span className="offer-text">Limited Edition Collections</span>
            </div>
          </div>

          {/* Discount Badge */}
          <div className="valentine-discount">
            <span className="discount-text">Up to</span>
            <span className="discount-number">20% OFF</span>
            <span className="discount-subtext">on Valentine's Collection</span>
          </div>

          {/* CTA Buttons */}
          <div className="valentine-popup-actions">
            <button className="btn-shop-now" onClick={handleShopNow}>
              <span className="btn-icon">🛍️</span>
              Shop Valentine's Collection
              <span className="btn-sparkle">✨</span>
            </button>
            <button className="btn-remind-later" onClick={handleClose}>
              Maybe Later
            </button>
          </div>

          {/* Footer Message */}
          <p className="valentine-popup-footer">
            Make this Valentine's Day unforgettable! 💕
          </p>
        </div>

        {/* Decorative Rose Petals */}
        <div className="valentine-petals">
          {[...Array(10)].map((_, i) => (
            <div key={i} className={`petal petal-${i + 1}`}>
              🌸
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ValentinePopup;