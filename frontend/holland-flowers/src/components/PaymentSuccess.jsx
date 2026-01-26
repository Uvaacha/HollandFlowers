/**
 * Payment Success Component - Holland Flowers
 * Displayed after successful payment from Hesabe gateway
 * 
 * UPDATED: Reads payment info from URL params (set by backend redirect)
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

  const processPayment = async () => {
    try {
      // Get payment info from URL params (set by backend redirect)
      const orderId = searchParams.get('orderId');
      const ref = searchParams.get('ref');
      const status = searchParams.get('status');
      
      console.log('Payment success page loaded:', { orderId, ref, status });
      
      if (orderId || ref) {
        // Try to get more details from the verify endpoint
        try {
          const response = await api.get('/payments/verify', {
            params: { orderId, ref }
          });
          console.log('Payment verification response:', response);
          setPaymentData(response.data || response);
        } catch (verifyError) {
          console.log('Verification API not available, using URL params');
          // Fallback to URL params
          setPaymentData({
            success: true,
            orderId: orderId,
            paymentReference: ref,
            status: 'COMPLETED'
          });
        }
        
        // Clear cart after successful payment
        clearCart();
        localStorage.removeItem('pendingOrder');
        localStorage.removeItem('deliveryInstructions');
        console.log('Cart cleared after successful payment');
      } else {
        // Check pending order from localStorage as fallback
        const pendingOrderStr = localStorage.getItem('pendingOrder');
        if (pendingOrderStr) {
          const pendingOrder = JSON.parse(pendingOrderStr);
          setPaymentData({ 
            success: true, 
            orderId: pendingOrder.orderId,
            paymentReference: pendingOrder.paymentReference
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
      // Still show success since we're on the success page
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
        {/* Logo */}
        <Link to="/" className="result-logo">
          <img src="/Holland Logo.jpg" alt="Holland Flowers" />
        </Link>

        {/* Success Icon */}
        <div className="result-icon success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="result-title">
          {currentLang === 'ar' ? 'تمت عملية الدفع بنجاح!' : 'Payment Successful!'}
        </h1>
        
        <p className="result-message">
          {currentLang === 'ar' 
            ? 'شكراً لك! تم استلام طلبك وسيتم معالجته قريباً.'
            : 'Thank you! Your order has been received and will be processed shortly.'}
        </p>

        {/* Order Details */}
        {paymentData && (paymentData.orderId || paymentData.orderNumber || paymentData.paymentReference) && (
          <div className="order-confirmation">
            {(paymentData.orderId || paymentData.orderNumber) && (
              <div className="confirmation-item">
                <span className="label">
                  {currentLang === 'ar' ? 'رقم الطلب:' : 'Order Number:'}
                </span>
                <span className="value">{paymentData.orderNumber || paymentData.orderId}</span>
              </div>
            )}
            {paymentData.transactionId && (
              <div className="confirmation-item">
                <span className="label">
                  {currentLang === 'ar' ? 'رقم المعاملة:' : 'Transaction ID:'}
                </span>
                <span className="value">{paymentData.transactionId}</span>
              </div>
            )}
            {paymentData.paymentReference && (
              <div className="confirmation-item">
                <span className="label">
                  {currentLang === 'ar' ? 'مرجع الدفع:' : 'Payment Reference:'}
                </span>
                <span className="value">{paymentData.paymentReference}</span>
              </div>
            )}
            {paymentData.amount && (
              <div className="confirmation-item">
                <span className="label">
                  {currentLang === 'ar' ? 'المبلغ:' : 'Amount:'}
                </span>
                <span className="value">KWD {Number(paymentData.amount).toFixed(3)}</span>
              </div>
            )}
          </div>
        )}

        {/* What's Next */}
        <div className="whats-next">
          <h3>{currentLang === 'ar' ? 'ماذا بعد؟' : "What's Next?"}</h3>
          <ul>
            <li>
              <span className="step-number">1</span>
              <span>
                {currentLang === 'ar' 
                  ? 'ستصلك رسالة تأكيد عبر البريد الإلكتروني'
                  : 'You will receive a confirmation email'}
              </span>
            </li>
            <li>
              <span className="step-number">2</span>
              <span>
                {currentLang === 'ar' 
                  ? 'سنبدأ بتحضير طلبك'
                  : 'We will start preparing your order'}
              </span>
            </li>
            <li>
              <span className="step-number">3</span>
              <span>
                {currentLang === 'ar' 
                  ? 'سيتم التوصيل في الموعد المحدد'
                  : 'Delivery will be made at the scheduled time'}
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="result-actions">
          <Link to="/orders" className="btn-primary">
            {currentLang === 'ar' ? 'عرض الطلبات' : 'View Orders'}
          </Link>
          <Link to="/" className="btn-secondary">
            {currentLang === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
          </Link>
        </div>

        {/* Support Info */}
        <div className="support-info">
          <p>
            {currentLang === 'ar' 
              ? 'هل لديك أي استفسار؟ تواصل معنا عبر واتساب'
              : 'Have any questions? Contact us via WhatsApp'}
          </p>
          <a href="https://wa.me/96560038844" className="whatsapp-link" target="_blank" rel="noopener noreferrer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            +965 6003 8844
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;