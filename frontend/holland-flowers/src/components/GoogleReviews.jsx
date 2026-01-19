import React, { useEffect } from 'react';
import './GoogleReviews.css';

const GoogleReviews = () => {
  useEffect(() => {
    // Load Google Places API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Your Google Business Place ID (you'll need to get this from Google My Business)
  const placeId = 'YOUR_PLACE_ID';
  
  const googleReviewLink = `https://search.google.com/local/writereview?placeid=${placeId}`;

  return (
    <div className="google-reviews-section">
      <div className="container">
        <div className="reviews-header">
          <h2>Customer Reviews</h2>
          <p>See what our customers are saying about us</p>
        </div>

        {/* Google Reviews Widget */}
        <div className="google-reviews-widget">
          <div 
            className="elfsight-app-google-reviews" 
            data-place-id={placeId}
          ></div>
        </div>

        {/* Leave a Review Button */}
        <div className="review-cta">
          <a 
            href={googleReviewLink}
            target="_blank" 
            rel="noopener noreferrer"
            className="leave-review-btn"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            Leave a Google Review
          </a>
        </div>

        {/* Google Badge */}
        <div className="google-badge">
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${placeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="google-badge-link"
          >
            <img 
              src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg" 
              alt="Google"
            />
            <div className="badge-stars">
              <span className="stars">★★★★★</span>
              <span className="rating-text">Rated on Google</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleReviews;
