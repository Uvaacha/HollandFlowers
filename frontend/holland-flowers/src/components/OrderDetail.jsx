/**
 * Order Detail Component - Holland Flowers
 * Displays detailed information about a specific order with delivery and payment status
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderService';
import './OrderDetail.css';

const OrderDetail = () => {
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentLang = localStorage.getItem('preferredLanguage') || 'en';

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/account', { state: { returnUrl: `/orders/${orderId}` } });
    }
  }, [isAuthenticated, navigate, orderId]);

  // Fetch order details
  useEffect(() => {
    if (isAuthenticated && orderId) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.getOrderById(orderId);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      CONFIRMED: '#3b82f6',
      PROCESSING: '#8b5cf6',
      OUT_FOR_DELIVERY: '#ec4899',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444',
      REFUNDED: '#6b7280',
    };
    return colors[status] || '#666';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      PROCESSING: '#3b82f6',
      COMPLETED: '#10b981',
      CAPTURED: '#10b981',
      FAILED: '#ef4444',
      CANCELLED: '#6b7280',
      REFUNDED: '#8b5cf6',
    };
    return colors[status] || '#666';
  };

  const getDeliveryStatusLabel = (status) => {
    const labels = {
      PENDING: { en: 'Pending', ar: 'قيد الانتظار' },
      CONFIRMED: { en: 'Confirmed', ar: 'مؤكد' },
      PROCESSING: { en: 'Processing', ar: 'قيد التحضير' },
      OUT_FOR_DELIVERY: { en: 'Out for Delivery', ar: 'قيد التوصيل' },
      DELIVERED: { en: 'Delivered', ar: 'تم التوصيل' },
      CANCELLED: { en: 'Cancelled', ar: 'ملغي' },
      REFUNDED: { en: 'Refunded', ar: 'مسترد' },
    };
    return labels[status]?.[currentLang] || status;
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      PENDING: { en: 'Payment Pending', ar: 'في انتظار الدفع' },
      PROCESSING: { en: 'Processing', ar: 'قيد المعالجة' },
      COMPLETED: { en: 'Paid', ar: 'مدفوع' },
      CAPTURED: { en: 'Paid', ar: 'مدفوع' },
      FAILED: { en: 'Payment Failed', ar: 'فشل الدفع' },
      CANCELLED: { en: 'Cancelled', ar: 'ملغي' },
      REFUNDED: { en: 'Refunded', ar: 'مسترد' },
    };
    return labels[status]?.[currentLang] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLang === 'ar' ? 'ar-KW' : 'en-KW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderProgress = (status) => {
    const steps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = steps.indexOf(status);
    if (status === 'CANCELLED' || status === 'REFUNDED') {
      return -1;
    }
    return currentIndex;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="order-loading">
            <div className="spinner"></div>
            <p>{currentLang === 'ar' ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="order-error">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <Link to="/orders" className="back-btn">
              {currentLang === 'ar' ? 'العودة للطلبات' : 'Back to Orders'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const progress = getOrderProgress(order.deliveryStatus);
  const progressSteps = [
    { key: 'PENDING', en: 'Placed', ar: 'تم الطلب' },
    { key: 'CONFIRMED', en: 'Confirmed', ar: 'مؤكد' },
    { key: 'PROCESSING', en: 'Preparing', ar: 'قيد التحضير' },
    { key: 'OUT_FOR_DELIVERY', en: 'On the Way', ar: 'في الطريق' },
    { key: 'DELIVERED', en: 'Delivered', ar: 'تم التوصيل' },
  ];

  return (
    <div className="order-detail-page">
      <div className="container">
        {/* Back Link */}
        <Link to="/orders" className="back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {currentLang === 'ar' ? 'العودة للطلبات' : 'Back to Orders'}
        </Link>

        {/* Order Header */}
        <div className="order-detail-header">
          <div className="order-header-info">
            <h1>
              {currentLang === 'ar' ? 'طلب رقم' : 'Order'} #{order.orderNumber}
            </h1>
            <p className="order-placed-date">
              {currentLang === 'ar' ? 'تم الطلب في' : 'Placed on'} {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="order-header-statuses">
            {/* Delivery Status */}
            <span 
              className="order-status-badge delivery"
              style={{ 
                backgroundColor: `${getDeliveryStatusColor(order.deliveryStatus)}20`,
                color: getDeliveryStatusColor(order.deliveryStatus),
                borderColor: getDeliveryStatusColor(order.deliveryStatus)
              }}
            >
              🚚 {getDeliveryStatusLabel(order.deliveryStatus)}
            </span>
            {/* Payment Status */}
            <span 
              className="order-status-badge payment"
              style={{ 
                backgroundColor: `${getPaymentStatusColor(order.paymentStatus)}20`,
                color: getPaymentStatusColor(order.paymentStatus),
                borderColor: getPaymentStatusColor(order.paymentStatus)
              }}
            >
              💳 {getPaymentStatusLabel(order.paymentStatus)}
            </span>
          </div>
        </div>

        {/* Order Progress */}
        {progress >= 0 && (
          <div className="order-progress-section">
            <h2>{currentLang === 'ar' ? 'حالة التوصيل' : 'Delivery Status'}</h2>
            <div className="progress-track">
              {progressSteps.map((step, index) => (
                <div 
                  key={step.key} 
                  className={`progress-step ${index <= progress ? 'completed' : ''} ${index === progress ? 'current' : ''}`}
                >
                  <div className="step-indicator">
                    {index < progress ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="step-label">{step[currentLang]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancelled/Refunded Notice */}
        {(order.deliveryStatus === 'CANCELLED' || order.deliveryStatus === 'REFUNDED') && (
          <div className={`order-notice ${order.deliveryStatus.toLowerCase()}`}>
            <span className="notice-icon">
              {order.deliveryStatus === 'CANCELLED' ? '❌' : '💰'}
            </span>
            <div className="notice-content">
              <strong>
                {order.deliveryStatus === 'CANCELLED' 
                  ? (currentLang === 'ar' ? 'تم إلغاء الطلب' : 'Order Cancelled')
                  : (currentLang === 'ar' ? 'تم استرداد المبلغ' : 'Order Refunded')}
              </strong>
              {order.cancellationReason && (
                <p>{currentLang === 'ar' ? 'السبب:' : 'Reason:'} {order.cancellationReason}</p>
              )}
              {order.cancelledAt && (
                <p className="notice-date">{formatDate(order.cancelledAt)}</p>
              )}
            </div>
          </div>
        )}

        <div className="order-detail-content">
          {/* Order Items */}
          <div className="order-section order-items-section">
            <h2>{currentLang === 'ar' ? 'منتجات الطلب' : 'Order Items'}</h2>
            <div className="order-items-list">
              {order.items?.map((item) => (
                <div key={item.orderItemId} className="order-item">
                  <div className="item-image">
                    <img src={item.productImageUrl || '/images/placeholder.jpg'} alt={item.productName} />
                  </div>
                  <div className="item-details">
                    <h4 className="item-name">{item.productName}</h4>
                    {item.specialInstructions && (
                      <p className="item-instructions">{item.specialInstructions}</p>
                    )}
                    <div className="item-meta">
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">
                        {currentLang === 'ar' ? 'د.ك' : 'KWD'} {item.unitPrice?.toFixed(3)}
                      </span>
                    </div>
                  </div>
                  <div className="item-total">
                    {currentLang === 'ar' ? 'د.ك' : 'KWD'} {item.totalPrice?.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-section order-summary-section">
            <h2>{currentLang === 'ar' ? 'ملخص الطلب' : 'Order Summary'}</h2>
            <div className="summary-rows">
              <div className="summary-row">
                <span>{currentLang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span>{currentLang === 'ar' ? 'د.ك' : 'KWD'} {order.subtotal?.toFixed(3)}</span>
              </div>
              <div className="summary-row">
                <span>{currentLang === 'ar' ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                <span>{currentLang === 'ar' ? 'د.ك' : 'KWD'} {order.deliveryFee?.toFixed(3)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="summary-row discount">
                  <span>{currentLang === 'ar' ? 'الخصم' : 'Discount'} {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-{currentLang === 'ar' ? 'د.ك' : 'KWD'} {order.discountAmount?.toFixed(3)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>{currentLang === 'ar' ? 'المجموع الكلي' : 'Total'}</span>
                <span>{currentLang === 'ar' ? 'د.ك' : 'KWD'} {order.totalAmount?.toFixed(3)}</span>
              </div>
            </div>
            {/* Payment Status in Summary */}
            <div className="payment-status-summary">
              <span className="label">{currentLang === 'ar' ? 'حالة الدفع:' : 'Payment Status:'}</span>
              <span 
                className="payment-badge"
                style={{ 
                  backgroundColor: `${getPaymentStatusColor(order.paymentStatus)}20`,
                  color: getPaymentStatusColor(order.paymentStatus)
                }}
              >
                {getPaymentStatusLabel(order.paymentStatus)}
              </span>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="order-section delivery-section">
            <h2>{currentLang === 'ar' ? 'معلومات التوصيل' : 'Delivery Information'}</h2>
            <div className="delivery-info-grid">
              <div className="info-item">
                <span className="info-label">{currentLang === 'ar' ? 'اسم المستلم' : 'Recipient Name'}</span>
                <span className="info-value">{order.recipientName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{currentLang === 'ar' ? 'رقم الهاتف' : 'Phone'}</span>
                <span className="info-value">{order.recipientPhone}</span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">{currentLang === 'ar' ? 'العنوان' : 'Address'}</span>
                <span className="info-value">{order.deliveryAddress}</span>
              </div>
              {order.deliveryArea && (
                <div className="info-item">
                  <span className="info-label">{currentLang === 'ar' ? 'المنطقة' : 'Area'}</span>
                  <span className="info-value">{order.deliveryArea}</span>
                </div>
              )}
              {order.deliveryCity && (
                <div className="info-item">
                  <span className="info-label">{currentLang === 'ar' ? 'المحافظة' : 'City'}</span>
                  <span className="info-value">{order.deliveryCity}</span>
                </div>
              )}
              {order.preferredDeliveryDate && (
                <div className="info-item">
                  <span className="info-label">{currentLang === 'ar' ? 'تاريخ التوصيل المفضل' : 'Preferred Delivery'}</span>
                  <span className="info-value">{formatDate(order.preferredDeliveryDate)}</span>
                </div>
              )}
              {order.deliveryNotes && (
                <div className="info-item full-width">
                  <span className="info-label">{currentLang === 'ar' ? 'ملاحظات التوصيل' : 'Delivery Notes'}</span>
                  <span className="info-value">{order.deliveryNotes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Message */}
          {order.cardMessage && (
            <div className="order-section card-message-section">
              <h2>{currentLang === 'ar' ? 'رسالة البطاقة' : 'Card Message'}</h2>
              <div className="card-message-content">
                <span className="message-icon">💌</span>
                <p>{order.cardMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="order-actions">
          {order.deliveryStatus === 'PENDING' && (
            <button 
              className="cancel-order-btn"
              onClick={async () => {
                if (window.confirm(currentLang === 'ar' ? 'هل أنت متأكد من إلغاء الطلب؟' : 'Are you sure you want to cancel this order?')) {
                  try {
                    await orderService.cancelOrder(order.orderId);
                    fetchOrderDetails();
                  } catch (err) {
                    alert(err.message);
                  }
                }
              }}
            >
              {currentLang === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
            </button>
          )}
          <Link to="/" className="continue-shopping-btn">
            {currentLang === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
