/**
 * Payment Failure Component - Holland Flowers
 * Displayed after failed payment from Hesabe gateway
 * 
 * UPDATED: Reads payment info from URL params (set by backend redirect)
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import './PaymentResult.css';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentLang = localStorage.getItem('preferredLanguage') || 'en';

  useEffect(() => {
    processPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processPayment = async () => {
    try {
      // Get payment info from URL params (set by backend redirect)
      const orderId = searchParams.get('orderId');
      const ref = searchParams.get('ref');
      const status = searchParams.get('status');
      const message = searchParams.get('message');
      
      console.log('Payment failure page loaded:', { orderId, ref, status, message });
      
      setPaymentData({
        success: false,
        orderId: orderId,
        paymentReference: ref,
        status: status || 'FAILED',
        message: message ? decodeURIComponent(message) : 'Payment was not completed'
      });
      
    } catch (err) {
      console.error('Payment failure processing error:', err);
      setPaymentData({ 
        success: false, 
        message: 'Payment processing failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = () => {
    // Navigate back to checkout to retry payment
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="payment-result-page">
        <div className="payment-result-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>{currentLang === 'ar' ? 'جاري التحقق من الدفع...' : 'Verifying payment...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page failure">
      <div className="payment-result-container">
        {/* Logo */}
        <Link to="/" className="result-logo">
          <img src="/Holland Logo.jpg" alt="Holland Flowers" />
        </Link>

        {/* Failure Icon */}
        <div className="result-icon failure">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>

        {/* Failure Message */}
        <h1 className="result-title">
          {currentLang === 'ar' ? 'فشلت عملية الدفع' : 'Payment Failed'}
        </h1>
        
        <p className="result-message">
          {currentLang === 'ar' 
            ? 'عذراً، لم نتمكن من إتمام عملية الدفع. يرجى المحاولة مرة أخرى.'
            : "We're sorry, we couldn't complete your payment. Please try again."}
        </p>

        {/* Error Details */}
        {paymentData?.message && (
          <div className="error-details">
            <p>
              <strong>{currentLang === 'ar' ? 'السبب:' : 'Reason:'}</strong>{' '}
              {paymentData.message}
            </p>
          </div>
        )}

        {/* Common Reasons */}
        <div className="common-reasons">
          <h3>{currentLang === 'ar' ? 'أسباب شائعة لفشل الدفع:' : 'Common reasons for payment failure:'}</h3>
          <ul>
            <li>
              <span className="reason-icon">💳</span>
              <span>
                {currentLang === 'ar' 
                  ? 'رصيد غير كافٍ في البطاقة'
                  : 'Insufficient card balance'}
              </span>
            </li>
            <li>
              <span className="reason-icon">🔒</span>
              <span>
                {currentLang === 'ar' 
                  ? 'معلومات البطاقة غير صحيحة'
                  : 'Incorrect card information'}
              </span>
            </li>
            <li>
              <span className="reason-icon">⏰</span>
              <span>
                {currentLang === 'ar' 
                  ? 'انتهت صلاحية الجلسة'
                  : 'Session timeout'}
              </span>
            </li>
            <li>
              <span className="reason-icon">🌐</span>
              <span>
                {currentLang === 'ar' 
                  ? 'مشكلة في الاتصال بالإنترنت'
                  : 'Network connection issue'}
              </span>
            </li>
            <li>
              <span className="reason-icon">❌</span>
              <span>
                {currentLang === 'ar' 
                  ? 'تم إلغاء العملية من قبل المستخدم'
                  : 'Transaction cancelled by user'}
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="result-actions">
          <button onClick={handleRetryPayment} className="btn-primary">
            {currentLang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
          </button>
          <Link to="/cart" className="btn-secondary">
            {currentLang === 'ar' ? 'العودة للسلة' : 'Back to Cart'}
          </Link>
        </div>

        {/* Alternative Payment Methods */}
        <div className="alternative-payment">
          <p>
            {currentLang === 'ar' 
              ? 'يمكنك أيضاً الدفع عند الاستلام أو التواصل معنا:'
              : 'You can also contact us:'}
          </p>
          <a href="https://wa.me/96560038844" className="whatsapp-link" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {currentLang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
          </a>
        </div>

        {/* Back to Home */}
        <Link to="/" className="back-home-link">
          {currentLang === 'ar' ? '← العودة للرئيسية' : '← Back to Home'}
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailure;