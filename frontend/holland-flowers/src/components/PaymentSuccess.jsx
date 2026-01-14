/**
 * Payment Success Component - Holland Flowers
 * Displayed after successful payment from Hesabe gateway
 * 
 * UPDATED: Google Ads Purchase Conversion with transaction_id
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from './CartContext';
import api from '../services/api';
import './PaymentResult.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentLang = localStorage.getItem('preferredLanguage') || 'en';

  useEffect(() => {
    processPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 🔔 GOOGLE ADS PURCHASE CONVERSION
   * Fires ONCE after paymentData is available
   * Enhanced with transaction_id for deduplication
   */
  useEffect(() => {
    if (paymentData && window.gtag) {
      const conversionData = {
        currency: 'KWD',
        value: paymentData.amount ? Number(paymentData.amount) : 0,
        transaction_id: paymentData.orderId || paymentData.paymentReference || '',
      };

      // Fire the Google Ads conversion event
      window.gtag('event', 'ads_conversion_Purchase_1', conversionData);
      
      console.log('Google Ads purchase conversion fired:', conversionData);
    }
  }, [paymentData]);

  const processPayment = async () => {
    try {
      const orderId = searchParams.get('orderId');
      const ref = searchParams.get('ref');
      const status = searchParams.get('status');

      console.log('Payment success page loaded:', { orderId, ref, status });

      if (orderId || ref) {
        try {
          const response = await api.get('/payments/verify', {
            params: { orderId, ref }
          });
          console.log('Payment verification response:', response);
          setPaymentData(response.data || response);
        } catch (verifyError) {
          console.log('Verification API not available, using URL params');
          setPaymentData({
            success: true,
            orderId: orderId,
            paymentReference: ref,
            status: 'COMPLETED'
          });
        }

        clearCart();
        localStorage.removeItem('pendingOrder');
        localStorage.removeItem('deliveryInstructions');
      } else {
        const pendingOrderStr = localStorage.getItem('pendingOrder');
        if (pendingOrderStr) {
          const pendingOrder = JSON.parse(pendingOrderStr);
          setPaymentData({ 
            success: true, 
            orderId: pendingOrder.orderId,
            paymentReference: pendingOrder.paymentReference,
            amount: pendingOrder.amount
          });
          clearCart();
          localStorage.removeItem('pendingOrder');
          localStorage.removeItem('deliveryInstructions');
        } else {
          setPaymentData({ success: true });
          clearCart();
        }
      }
    } catch (err) {
      console.error('Payment success processing error:', err);
      setPaymentData({ success: true });
      clearCart();
    } finally {
      setLoading(false);
    }
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
    <div className="payment-result-page success">
      <div className="payment-result-container">
        <Link to="/" className="result-logo">
          <img src="/Holland-Logo.png" alt="Holland Flowers" />
        </Link>

        <div className="result-icon success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <h1 className="result-title">
          {currentLang === 'ar' ? 'تمت عملية الدفع بنجاح!' : 'Payment Successful!'}
        </h1>

        <p className="result-message">
          {currentLang === 'ar'
            ? 'شكراً لك! تم استلام طلبك وسيتم معالجته قريباً.'
            : 'Thank you! Your order has been received and will be processed shortly.'}
        </p>

        {paymentData && (
          <div className="order-confirmation">
            {paymentData.orderId && (
              <div className="confirmation-item">
                <span className="label">Order Number:</span>
                <span className="value">{paymentData.orderId}</span>
              </div>
            )}
            {paymentData.paymentReference && (
              <div className="confirmation-item">
                <span className="label">Payment Reference:</span>
                <span className="value">{paymentData.paymentReference}</span>
              </div>
            )}
            {paymentData.amount && (
              <div className="confirmation-item">
                <span className="label">Amount:</span>
                <span className="value">KWD {Number(paymentData.amount).toFixed(3)}</span>
              </div>
            )}
          </div>
        )}

        <div className="result-actions">
          <Link to="/orders" className="btn-primary">View Orders</Link>
          <Link to="/" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;