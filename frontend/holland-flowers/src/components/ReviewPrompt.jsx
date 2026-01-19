import React, { useState, useEffect } from 'react';
import './ReviewPrompt.css';

const ReviewPrompt = ({ orderId, showDelay = 2000 }) => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLang(savedLang);
    
    const handleLangChange = (e) => setCurrentLang(e.detail);
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  useEffect(() => {
    // Check if user has already reviewed or dismissed this prompt
    const hasReviewed = localStorage.getItem('hasReviewedGoogle');
    const dismissedPrompts = JSON.parse(localStorage.getItem('dismissedReviewPrompts') || '[]');
    
    if (!hasReviewed && !dismissedPrompts.includes(orderId)) {
      const timer = setTimeout(() => setShow(true), showDelay);
      return () => clearTimeout(timer);
    }
  }, [orderId, showDelay]);

  const handleDismiss = () => {
    setDismissed(true);
    const dismissedPrompts = JSON.parse(localStorage.getItem('dismissedReviewPrompts') || '[]');
    dismissedPrompts.push(orderId);
    localStorage.setItem('dismissedReviewPrompts', JSON.stringify(dismissedPrompts));
  };

  const handleReview = () => {
    localStorage.setItem('hasReviewedGoogle', 'true');
    // Replace with your actual Google Place ID
    const placeId = 'YOUR_PLACE_ID';
    window.open(`https://search.google.com/local/writereview?placeid=${placeId}`, '_blank');
  };

  const translations = {
    en: {
      title: 'Enjoyed your flowers?',
      message: 'We\'d love to hear about your experience! Your review helps us grow and serve you better.',
      reviewButton: 'Leave a Google Review',
      laterButton: 'Maybe Later',
      benefits: [
        '⭐ Takes less than 2 minutes',
        '🌸 Helps other flower lovers',
        '💝 Support local business'
      ]
    },
    ar: {
      title: 'هل استمتعت بالزهور؟',
      message: 'نود أن نسمع عن تجربتك! مراجعتك تساعدنا على النمو وخدمتك بشكل أفضل.',
      reviewButton: 'اترك تقييمًا على جوجل',
      laterButton: 'ربما لاحقًا',
      benefits: [
        '⭐ يستغرق أقل من دقيقتين',
        '🌸 يساعد محبي الزهور الآخرين',
        '💝 دعم الأعمال المحلية'
      ]
    }
  };

  const t = translations[currentLang];

  if (!show || dismissed) return null;

  return (
    <div className={`review-prompt-overlay ${currentLang === 'ar' ? 'rtl' : ''}`}>
      <div className="review-prompt-modal">
        <button className="close-button" onClick={handleDismiss}>×</button>
        
        <div className="prompt-icon">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>

        <h2>{t.title}</h2>
        <p className="prompt-message">{t.message}</p>

        <div className="benefits-list">
          {t.benefits.map((benefit, index) => (
            <div key={index} className="benefit-item">{benefit}</div>
          ))}
        </div>

        <div className="prompt-actions">
          <button className="review-button" onClick={handleReview}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t.reviewButton}
          </button>
          <button className="later-button" onClick={handleDismiss}>
            {t.laterButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPrompt;
