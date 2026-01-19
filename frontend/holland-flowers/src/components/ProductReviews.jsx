// src/components/ProductReviews.jsx
import React, { useState, useEffect } from 'react';
import './ProductReviews.css';
import reviewService from '../services/reviewService';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt,desc');

  useEffect(() => {
    fetchRatingSummary();
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [productId, currentPage, sortBy]);

  const fetchRatingSummary = async () => {
    try {
      const response = await reviewService.getProductRatingSummary(productId);
      if (response.success) {
        setRatingSummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching rating summary:', error);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewService.getProductReviews(productId, {
        page: currentPage,
        size: 10,
        sort: sortBy
      });

      if (response.success && response.data) {
        setReviews(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = (newReview) => {
    setShowReviewForm(false);
    fetchRatingSummary();
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderStars = (rating) => {
    return (
      <div className="summary-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= Math.round(rating) ? 'star filled' : 'star'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const renderDistributionBar = (count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="distribution-bar">
        <div
          className="distribution-fill"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="product-reviews-section">
      <h2 className="section-title">Customer Reviews</h2>

      {ratingSummary && (
        <div className="rating-summary">
          <div className="summary-left">
            <div className="average-rating">{ratingSummary.averageRating.toFixed(1)}</div>
            {renderStars(ratingSummary.averageRating)}
            <div className="total-reviews">
              Based on {ratingSummary.totalReviews} review{ratingSummary.totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="summary-right">
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="distribution-row">
                  <span className="distribution-label">{rating} ★</span>
                  {renderDistributionBar(
                    ratingSummary.distribution[
                      rating === 5 ? 'fiveStars' :
                      rating === 4 ? 'fourStars' :
                      rating === 3 ? 'threeStars' :
                      rating === 2 ? 'twoStars' : 'oneStar'
                    ] || 0,
                    ratingSummary.totalReviews
                  )}
                  <span className="distribution-count">
                    {ratingSummary.distribution[
                      rating === 5 ? 'fiveStars' :
                      rating === 4 ? 'fourStars' :
                      rating === 3 ? 'threeStars' :
                      rating === 2 ? 'twoStars' : 'oneStar'
                    ] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="write-review-section">
        {!showReviewForm && (
          <button
            className="btn-write-review"
            onClick={() => setShowReviewForm(true)}
          >
            Write a Review
          </button>
        )}
      </div>

      {showReviewForm && (
        <ReviewForm
          productId={productId}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      <div className="reviews-list-container">
        {reviews.length > 0 && (
          <div className="reviews-header">
            <h3 className="reviews-count">
              {ratingSummary?.totalReviews || 0} Review{ratingSummary?.totalReviews !== 1 ? 's' : ''}
            </h3>
            <div className="sort-container">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={handleSortChange}
                className="sort-select"
              >
                <option value="createdAt,desc">Most Recent</option>
                <option value="createdAt,asc">Oldest First</option>
                <option value="rating,desc">Highest Rating</option>
                <option value="rating,asc">Lowest Rating</option>
                <option value="helpfulCount,desc">Most Helpful</option>
              </select>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading reviews...</p>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <>
            <div className="reviews-list">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.reviewId}
                  review={review}
                  onHelpfulClick={() => {}}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {!loading && reviews.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <h3>No reviews yet</h3>
            <p>Be the first to share your experience with this product!</p>
            {!showReviewForm && (
              <button
                className="btn-write-first-review"
                onClick={() => setShowReviewForm(true)}
              >
                Write the First Review
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;