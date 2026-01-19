// src/components/ReviewForm.jsx
import React, { useState } from 'react';
import './ReviewForm.css';
import reviewService from '../services/reviewService';

const ReviewForm = ({ productId, onReviewSubmitted, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    reviewText: '',
    reviewerName: '',
    reviewerEmail: '',
    images: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Please select a rating';
    }

    if (!formData.reviewText || formData.reviewText.trim().length < 10) {
      newErrors.reviewText = 'Review must be at least 10 characters long';
    }

    if (formData.reviewText && formData.reviewText.length > 5000) {
      newErrors.reviewText = 'Review must not exceed 5000 characters';
    }

    if (formData.title && formData.title.length > 200) {
      newErrors.title = 'Title must not exceed 200 characters';
    }

    if (formData.reviewerEmail && !/\S+@\S+\.\S+/.test(formData.reviewerEmail)) {
      newErrors.reviewerEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        productId: productId,
        rating: formData.rating,
        title: formData.title || null,
        reviewText: formData.reviewText,
        reviewerName: formData.reviewerName || null,
        reviewerEmail: formData.reviewerEmail || null,
        images: formData.images.length > 0 ? formData.images : null
      };

      const response = await reviewService.submitReview(reviewData);

      if (response.success) {
        alert('Thank you! Your review has been submitted and is pending approval.');
        
        setFormData({
          rating: 5,
          title: '',
          reviewText: '',
          reviewerName: '',
          reviewerEmail: '',
          images: []
        });

        if (onReviewSubmitted) {
          onReviewSubmitted(response.data);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3 className="review-form-title">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label className="form-label">
            Your Rating <span className="required">*</span>
          </label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`rating-star ${star <= (hoverRating || formData.rating) ? 'filled' : ''}`}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
            <span className="rating-text">
              {formData.rating === 1 && '(Poor)'}
              {formData.rating === 2 && '(Fair)'}
              {formData.rating === 3 && '(Good)'}
              {formData.rating === 4 && '(Very Good)'}
              {formData.rating === 5 && '(Excellent)'}
            </span>
          </div>
          {errors.rating && <span className="error-message">{errors.rating}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Review Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Summarize your experience (optional)"
            className="form-input"
            maxLength={200}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="reviewText" className="form-label">
            Your Review <span className="required">*</span>
          </label>
          <textarea
            id="reviewText"
            name="reviewText"
            value={formData.reviewText}
            onChange={handleChange}
            placeholder="Share your experience with this product (minimum 10 characters)"
            className="form-textarea"
            rows={6}
            maxLength={5000}
            required
          />
          <div className="character-count">
            {formData.reviewText.length} / 5000 characters
          </div>
          {errors.reviewText && <span className="error-message">{errors.reviewText}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="reviewerName" className="form-label">
            Your Name
          </label>
          <input
            type="text"
            id="reviewerName"
            name="reviewerName"
            value={formData.reviewerName}
            onChange={handleChange}
            placeholder="Enter your name (optional, defaults to 'Anonymous')"
            className="form-input"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label htmlFor="reviewerEmail" className="form-label">
            Your Email
          </label>
          <input
            type="email"
            id="reviewerEmail"
            name="reviewerEmail"
            value={formData.reviewerEmail}
            onChange={handleChange}
            placeholder="your.email@example.com (optional)"
            className="form-input"
          />
          <small className="form-help">
            Your email will not be publicly displayed
          </small>
          {errors.reviewerEmail && <span className="error-message">{errors.reviewerEmail}</span>}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          {onCancel && (
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;