/**
 * Order History Component - Holland Flowers
 * Displays user's order history with delivery and payment status
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import orderService, { DELIVERY_STATUS } from '../services/orderService';
import './OrderHistory.css';

const OrderHistory = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState('ALL');

  const currentLang = localStorage.getItem('preferredLanguage') || 'en';

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/account', { state: { returnUrl: '/orders' } });
    }
  }, [isAuthenticated, navigate]);

  // Fetch orders
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, currentPage, filter]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (filter === 'ALL') {
        response = await orderService.getUserOrders({ page: currentPage, size: 10 });
      } else {
        response = await orderService.getOrdersByDeliveryStatus(filter, { page: currentPage, size: 10 });
      }
      
      if (response.success) {
        setOrders(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load orders');
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
      PENDING: { en: 'Pending', ar: 'قيد الانتظار' },
      PROCESSING: { en: 'Processing', ar: 'قيد المعالجة' },
      COMPLETED: { en: 'Paid', ar: 'مدفوع' },
      CAPTURED: { en: 'Paid', ar: 'مدفوع' },
      FAILED: { en: 'Failed', ar: 'فشل' },
      CANCELLED: { en: 'Cancelled', ar: 'ملغي' },
      REFUNDED: { en: 'Refunded', ar: 'مسترد' },
    };
    return labels[status]?.[currentLang] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLang === 'ar' ? 'ar-KW' : 'en-KW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="order-history-page">
      <div className="container">
        <div className="order-history-header">
          <h1>{currentLang === 'ar' ? 'طلباتي' : 'My Orders'}</h1>
          <p className="order-history-subtitle">
            {currentLang === 'ar' 
              ? 'تتبع حالة طلباتك واستعرض سجل مشترياتك'
              : 'Track your orders and view purchase history'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="order-filters">
          <button 
            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => { setFilter('ALL'); setCurrentPage(0); }}
          >
            {currentLang === 'ar' ? 'الكل' : 'All'}
          </button>
          <button 
            className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`}
            onClick={() => { setFilter('PENDING'); setCurrentPage(0); }}
          >
            {currentLang === 'ar' ? 'قيد الانتظار' : 'Pending'}
          </button>
          <button 
            className={`filter-btn ${filter === 'PROCESSING' ? 'active' : ''}`}
            onClick={() => { setFilter('PROCESSING'); setCurrentPage(0); }}
          >
            {currentLang === 'ar' ? 'قيد التحضير' : 'Processing'}
          </button>
          <button 
            className={`filter-btn ${filter === 'OUT_FOR_DELIVERY' ? 'active' : ''}`}
            onClick={() => { setFilter('OUT_FOR_DELIVERY'); setCurrentPage(0); }}
          >
            {currentLang === 'ar' ? 'قيد التوصيل' : 'Out for Delivery'}
          </button>
          <button 
            className={`filter-btn ${filter === 'DELIVERED' ? 'active' : ''}`}
            onClick={() => { setFilter('DELIVERED'); setCurrentPage(0); }}
          >
            {currentLang === 'ar' ? 'تم التوصيل' : 'Delivered'}
          </button>
          <button 
            className={`filter-btn ${filter === 'CANCELLED' ? 'active' : ''}`}
            onClick={() => { setFilter('CANCELLED'); setCurrentPage(0); }}
          >
            {currentLang === 'ar' ? 'ملغي' : 'Cancelled'}
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="orders-loading">
            <div className="spinner"></div>
            <p>{currentLang === 'ar' ? 'جاري تحميل الطلبات...' : 'Loading orders...'}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="orders-error">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={fetchOrders} className="retry-btn">
              {currentLang === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <div className="empty-icon">📦</div>
            <h3>{currentLang === 'ar' ? 'لا توجد طلبات' : 'No orders yet'}</h3>
            <p>
              {currentLang === 'ar' 
                ? 'لم تقم بأي طلبات حتى الآن. تصفح منتجاتنا وابدأ التسوق!'
                : "You haven't placed any orders yet. Browse our products and start shopping!"}
            </p>
            <Link to="/" className="shop-now-btn">
              {currentLang === 'ar' ? 'تسوق الآن' : 'Shop Now'}
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.orderId} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <span className="order-number">
                      {currentLang === 'ar' ? 'رقم الطلب:' : 'Order #'} {order.orderNumber}
                    </span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="order-statuses">
                    {/* Delivery Status */}
                    <span 
                      className="order-status delivery-status"
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
                      className="order-status payment-status"
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

                <div className="order-card-body">
                  <div className="order-summary">
                    <div className="order-items-count">
                      <span className="label">
                        {currentLang === 'ar' ? 'عدد المنتجات:' : 'Items:'}
                      </span>
                      <span className="value">{order.itemCount}</span>
                    </div>
                    <div className="order-recipient">
                      <span className="label">
                        {currentLang === 'ar' ? 'المستلم:' : 'Recipient:'}
                      </span>
                      <span className="value">{order.recipientName}</span>
                    </div>
                    <div className="order-total">
                      <span className="label">
                        {currentLang === 'ar' ? 'المجموع:' : 'Total:'}
                      </span>
                      <span className="value">
                        {currentLang === 'ar' ? 'د.ك' : 'KWD'} {order.totalAmount?.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-card-footer">
                  <Link to={`/orders/${order.orderId}`} className="view-details-btn">
                    {currentLang === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                  
                  {order.deliveryStatus === 'PENDING' && (
                    <button 
                      className="cancel-order-btn"
                      onClick={async () => {
                        if (window.confirm(currentLang === 'ar' ? 'هل أنت متأكد من إلغاء الطلب؟' : 'Are you sure you want to cancel this order?')) {
                          try {
                            await orderService.cancelOrder(order.orderId);
                            fetchOrders();
                          } catch (err) {
                            alert(err.message);
                          }
                        }
                      }}
                    >
                      {currentLang === 'ar' ? 'إلغاء الطلب' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="orders-pagination">
            <button 
              className="pagination-btn"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              {currentLang === 'ar' ? 'السابق' : 'Previous'}
            </button>
            <span className="pagination-info">
              {currentLang === 'ar' 
                ? `صفحة ${currentPage + 1} من ${totalPages}`
                : `Page ${currentPage + 1} of ${totalPages}`}
            </span>
            <button 
              className="pagination-btn"
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              {currentLang === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
