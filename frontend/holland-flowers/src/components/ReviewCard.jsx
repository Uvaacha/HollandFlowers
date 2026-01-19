// src/components/ReviewCard.jsx
import React, { useState } from 'react';
import './ReviewCard.css';
import reviewService from '../services/reviewService';

const ReviewCard = ({ review, onHelpfulClick }) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
  const [notHelpfulCount, setNotHelpfulCount] = useState(review.notHelpfulCount || 0);
  const [userVote, setUserVote] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'star filled' : 'star'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleHelpfulClick = async (isHelpful) => {
    if (userVote !== null) {
      alert('You have already voted on this review');
      return;
    }

    try {
      await reviewService.markReviewHelpful(review.reviewId, isHelpful);
      
      if (isHelpful) {
        setHelpfulCount(helpfulCount + 1);
        setUserVote('helpful');
      } else {
        setNotHelpfulCount(notHelpfulCount + 1);
        setUserVote('not-helpful');
      }

      if (onHelpfulClick) {
        onHelpfulClick(review.reviewId, isHelpful);
      }
    } catch (error) {
      console.error('Error voting on review:', error);
      alert('Failed to submit vote. Please try again.');
    }
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-author-info">
          <div className="review-author-avatar">
            {review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="review-author-details">
            <h4 className="review-author-name">{review.reviewerName || 'Anonymous'}</h4>
            <div className="review-meta">
              <span className="review-date">{formatDate(review.createdAt)}</span>
              {review.isVerifiedPurchase && (
                <span className="verified-badge">✓ Verified Purchase</span>
              )}
            </div>
          </div>
        </div>
        {renderStars(review.rating)}
      </div>

      {review.title && (
        <h3 className="review-title">{review.title}</h3>
      )}

      <p className="review-text">{review.reviewText}</p>

      {review.images && review.images.length > 0 && (
        <div className="review-images">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review ${index + 1}`}
              className="review-image"
              onClick={() => window.open(image, '_blank')}
            />
          ))}
        </div>
      )}

      {review.adminResponse && (
        <div className="admin-response">
          <div className="admin-response-header">
            <strong>Response from Holland Flowers:</strong>
            <span className="admin-response-date">
              {formatDate(review.adminResponseAt)}
            </span>
          </div>
          <p className="admin-response-text">{review.adminResponse}</p>
        </div>
      )}

      <div className="review-helpful">
        <span className="helpful-label">Was this review helpful?</span>
        <div className="helpful-buttons">
          <button
            className={`helpful-btn ${userVote === 'helpful' ? 'voted' : ''}`}
            onClick={() => handleHelpfulClick(true)}
            disabled={userVote !== null}
          >
            👍 Helpful ({helpfulCount})
          </button>
          <button
            className={`helpful-btn ${userVote === 'not-helpful' ? 'voted' : ''}`}
            onClick={() => handleHelpfulClick(false)}
            disabled={userVote !== null}
          >
            👎 Not Helpful ({notHelpfulCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;