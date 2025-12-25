import React, { useState, useEffect } from 'react';
import './WhatsAppButton.css';

const WhatsAppButton = () => {
  const [isVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  // WhatsApp phone number (replace with your actual number)
  const whatsappNumber = '96560038844'; // Kuwait country code + number
  const defaultMessage = currentLang === 'ar' 
    ? 'مرحباً! أرغب في الاستفسار عن الزهور والتوصيل.' 
    : 'Hello! I would like to inquire about flowers and delivery.';

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);

    const handleLangChange = (e) => {
      setCurrentLang(e.detail);
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  // Show tooltip after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Hide tooltip after showing for 5 seconds
  useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  const handleClick = () => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const tooltipText = currentLang === 'ar' ? 'تواصل معنا' : 'Chat with us';

  if (!isVisible) return null;

  return (
    <div className={`whatsapp-float-container ${currentLang === 'ar' ? 'rtl' : ''}`}>
      {/* Tooltip */}
      <div className={`whatsapp-tooltip ${showTooltip ? 'show' : ''}`}>
        <span>{tooltipText}</span>
        <button 
          className="tooltip-close" 
          onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
          aria-label="Close tooltip"
        >
          ×
        </button>
      </div>

      {/* WhatsApp Button */}
      <button 
        className="whatsapp-float-btn"
        onClick={handleClick}
        aria-label={currentLang === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="whatsapp-icon-wrapper">
          <svg 
            viewBox="0 0 32 32" 
            className="whatsapp-icon"
            fill="currentColor"
          >
            <path d="M16.002 0C7.165 0 0 7.163 0 16c0 2.822.736 5.564 2.137 7.986L.073 31.99l8.241-2.033A15.924 15.924 0 0 0 16.002 32c8.837 0 16-7.163 16-16S24.84 0 16.002 0zm0 29.333a13.283 13.283 0 0 1-6.756-1.85l-.484-.288-5.022 1.237 1.266-4.87-.316-.5A13.27 13.27 0 0 1 2.667 16c0-7.364 5.97-13.333 13.335-13.333 7.365 0 13.335 5.97 13.335 13.333 0 7.365-5.97 13.333-13.335 13.333zm7.314-9.983c-.4-.2-2.367-1.167-2.733-1.3-.367-.133-.633-.2-.9.2-.267.4-1.033 1.3-1.267 1.567-.233.267-.467.3-.867.1-.4-.2-1.69-.623-3.22-1.987-1.19-1.06-1.993-2.37-2.227-2.77-.233-.4-.025-.617.175-.817.18-.18.4-.467.6-.7.2-.233.267-.4.4-.667.133-.267.067-.5-.033-.7-.1-.2-.9-2.167-1.233-2.967-.325-.78-.656-.674-.9-.686-.233-.012-.5-.015-.767-.015s-.7.1-1.067.5c-.367.4-1.4 1.367-1.4 3.333 0 1.967 1.433 3.867 1.633 4.133.2.267 2.823 4.307 6.84 6.04.955.412 1.7.658 2.28.843.958.304 1.83.261 2.52.158.77-.115 2.367-.967 2.7-1.9.333-.933.333-1.733.233-1.9-.1-.167-.367-.267-.767-.467z"/>
          </svg>
          <div className="whatsapp-pulse"></div>
        </div>
      </button>
    </div>
  );
};

export default WhatsAppButton;