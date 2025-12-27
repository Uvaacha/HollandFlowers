import React, { useState, useEffect, useCallback } from 'react';
import { ordersAPI, authAPI } from '../services/api';
import './OrdersManager.css';

const OrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const canUpdateDeliveryStatus = authAPI.isAdmin();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      
      if (statusFilter !== 'all') {
        response = await ordersAPI.getByDeliveryStatus(statusFilter.toUpperCase(), { page: currentPage, size: 10 });
      } else {
        response = await ordersAPI.getAll({ page: currentPage, size: 10 });
      }
      
      if (response.success && response.data) {
        setOrders(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDeliveryStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await ordersAPI.updateDeliveryStatus(orderId, newStatus);
      if (response.success) {
        setOrders(orders.map(order => 
          order.orderId === orderId ? { ...order, deliveryStatus: newStatus } : order
        ));
        if (selectedOrder?.orderId === orderId) {
          setSelectedOrder({ ...selectedOrder, deliveryStatus: newStatus });
        }
      }
    } catch (error) {
      console.error('Failed to update delivery status:', error);
      alert('Failed to update delivery status: ' + (error.message || 'Unknown error'));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.recipientPhone?.includes(searchTerm);
    return matchesSearch;
  });

  const getDeliveryStatusClass = (status) => {
    const statusMap = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-confirmed',
      'PROCESSING': 'status-processing',
      'OUT_FOR_DELIVERY': 'status-shipped',
      'DELIVERED': 'status-delivered',
      'CANCELLED': 'status-cancelled',
      'REFUNDED': 'status-refunded'
    };
    return statusMap[status?.toUpperCase()] || 'status-pending';
  };

  const getPaymentStatusClass = (status) => {
    const statusMap = {
      'PENDING': 'payment-pending',
      'PROCESSING': 'payment-processing',
      'COMPLETED': 'payment-completed',
      'CAPTURED': 'payment-completed',
      'FAILED': 'payment-failed',
      'CANCELLED': 'payment-cancelled',
      'REFUNDED': 'payment-refunded',
    };
    return statusMap[status?.toUpperCase()] || 'payment-pending';
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ') || 'Pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `KD ${parseFloat(amount || 0).toFixed(3)}`;
  };

  const viewOrderDetails = async (order) => {
    try {
      const response = await ordersAPI.getById(order.orderId);
      if (response.success && response.data) {
        setSelectedOrder(response.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      setSelectedOrder(order);
      setShowModal(true);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-manager">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders Management</h1>
          <p className="page-subtitle">View and manage customer orders</p>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by Order #, Name or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0); }}
          className="filter-select"
        >
          <option value="all">All Delivery Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Area</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Delivery Status</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.orderId}>
                  <td className="order-id">{order.orderNumber}</td>
                  <td>{order.recipientName}</td>
                  <td>{order.recipientPhone}</td>
                  <td>{order.deliveryArea}</td>
                  <td className="amount">{formatCurrency(order.totalAmount)}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <span className={`status-badge ${getDeliveryStatusClass(order.deliveryStatus)}`}>
                      {formatStatus(order.deliveryStatus)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getPaymentStatusClass(order.paymentStatus)}`}>
                      {formatStatus(order.paymentStatus)}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-btn view-btn"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="empty-message">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p>Showing {filteredOrders.length} of {orders.length} orders</p>
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </button>
            <span>Page {currentPage + 1} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* FULL PAGE ORDER DETAILS MODAL */}
      {showModal && selectedOrder && (
        <div className="fullpage-modal-overlay">
          <div className="fullpage-modal">
            {/* Modal Header */}
            <div className="fullpage-modal-header">
              <div className="header-left">
                <h1>Order Details</h1>
                <span className="order-number-badge">{selectedOrder.orderNumber}</span>
              </div>
              <button className="close-btn-large" onClick={() => setShowModal(false)}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Modal Body - Two Column Layout */}
            <div className="fullpage-modal-body">
              {/* Left Column */}
              <div className="modal-column left-column">
                
                {/* Order Status Cards */}
                <div className="status-cards-row">
                  <div className="status-card">
                    <span className="status-card-label">Delivery Status</span>
                    <span className={`status-badge large ${getDeliveryStatusClass(selectedOrder.deliveryStatus)}`}>
                      {formatStatus(selectedOrder.deliveryStatus)}
                    </span>
                  </div>
                  <div className="status-card">
                    <span className="status-card-label">Payment Status</span>
                    <span className={`status-badge large ${getPaymentStatusClass(selectedOrder.paymentStatus)}`}>
                      {formatStatus(selectedOrder.paymentStatus)}
                    </span>
                  </div>
                  <div className="status-card">
                    <span className="status-card-label">Order Date</span>
                    <span className="status-card-value">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                </div>

                {/* Sender Information - NEW */}
                <div className="info-section">
                  <h2 className="section-title">
                    <span className="section-icon">🙋</span>
                    Sender Information
                  </h2>
                  <div className="info-grid two-col">
                    <div className="info-item">
                      <label>Sender Name</label>
                      <span className="highlight">{selectedOrder.senderName || '-'}</span>
                    </div>
                    <div className="info-item">
                      <label>Sender Phone</label>
                      <span className="highlight">{selectedOrder.senderPhone || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information (Account Holder) */}
                <div className="info-section">
                  <h2 className="section-title">
                    <span className="section-icon">👤</span>
                    Customer Account
                  </h2>
                  <div className="info-grid three-col">
                    <div className="info-item">
                      <label>Name</label>
                      <span>{selectedOrder.user?.name || '-'}</span>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <span>{selectedOrder.user?.email || '-'}</span>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <span>{selectedOrder.user?.phone || selectedOrder.user?.phoneNumber || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="info-section">
                  <h2 className="section-title">
                    <span className="section-icon">🚚</span>
                    Delivery Information (Recipient)
                  </h2>
                  <div className="info-grid two-col">
                    <div className="info-item">
                      <label>Recipient Name</label>
                      <span className="highlight">{selectedOrder.recipientName}</span>
                    </div>
                    <div className="info-item">
                      <label>Recipient Phone</label>
                      <span className="highlight">{selectedOrder.recipientPhone}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Delivery Address</label>
                      <span>{selectedOrder.deliveryAddress || '-'}</span>
                    </div>
                    <div className="info-item">
                      <label>Area</label>
                      <span>{selectedOrder.deliveryArea || '-'}</span>
                    </div>
                    <div className="info-item">
                      <label>Governorate</label>
                      <span>{selectedOrder.deliveryCity || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Message - Highlighted Box */}
                <div className="info-section">
                  <h2 className="section-title">
                    <span className="section-icon">💌</span>
                    Card Message
                  </h2>
                  {selectedOrder.cardMessage ? (
                    <div className="card-message-box">
                      <div className="quote-mark">"</div>
                      <p className="card-message-text">{selectedOrder.cardMessage}</p>
                      <div className="quote-mark end">"</div>
                    </div>
                  ) : (
                    <div className="no-message-box">No card message provided</div>
                  )}
                </div>

                {/* Delivery Instructions */}
                <div className="info-section">
                  <h2 className="section-title">
                    <span className="section-icon">📋</span>
                    Delivery Instructions
                  </h2>
                  {selectedOrder.instructionMessage ? (
                    <div className="instruction-box">
                      <p>{selectedOrder.instructionMessage}</p>
                    </div>
                  ) : (
                    <div className="no-message-box">No delivery instructions</div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="modal-column right-column">
                
                {/* Order Items */}
                <div className="info-section">
                  <h2 className="section-title">
                    <span className="section-icon">🛒</span>
                    Order Items ({selectedOrder.items?.length || 0} products)
                  </h2>
                  <div className="order-items-container">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <div key={item.orderItemId || index} className="order-item-card-full">
                          {/* Item Header with Image and Basic Info */}
                          <div className="item-header-row">
                            <div className="item-image-container">
                              {item.productImageUrl ? (
                                <img 
                                  src={item.productImageUrl} 
                                  alt={item.productName}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/placeholder.jpg';
                                  }}
                                />
                              ) : (
                                <div className="no-image-placeholder">
                                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="item-info">
                              <h4 className="item-name">{item.productName}</h4>
                              <div className="item-meta">
                                <span className="qty">Qty: {item.quantity}</span>
                                <span className="unit-price">{formatCurrency(item.unitPrice)} each</span>
                              </div>
                            </div>
                            <div className="item-price">
                              {formatCurrency(item.totalPrice || (item.quantity * item.unitPrice))}
                            </div>
                          </div>

                          {/* Item Delivery Date & Time */}
                          {(item.deliveryDate || item.deliveryTimeSlot) && (
                            <div className="item-delivery-info">
                              <div className="item-delivery-icon">📅</div>
                              <div className="item-delivery-details">
                                {item.deliveryDate && (
                                  <span className="delivery-date">
                                    <strong>Delivery Date:</strong> {formatDateOnly(item.deliveryDate)}
                                  </span>
                                )}
                                {item.deliveryTimeSlot && (
                                  <span className="delivery-time">
                                    <strong>Time Slot:</strong> {item.deliveryTimeSlot}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Item Card Message */}
                          {item.cardMessage && (
                            <div className="item-card-message">
                              <div className="card-icon">💌</div>
                              <div className="card-content">
                                <span className="card-label">Card Message:</span>
                                <p className="card-text">"{item.cardMessage}"</p>
                              </div>
                            </div>
                          )}

                          {/* Item Special Instructions */}
                          {item.specialInstructions && (
                            <div className="item-special-instructions">
                              <strong>Note:</strong> {item.specialInstructions}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="no-items">No items found</p>
                    )}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="info-section">
                  <h2 className="section-title">
                    <span className="section-icon">💰</span>
                    Order Summary
                  </h2>
                  <div className="order-summary-box">
                    <div className="summary-line">
                      <span>Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="summary-line">
                      <span>Delivery Fee</span>
                      <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="summary-line discount">
                        <span>Discount {selectedOrder.couponCode && `(${selectedOrder.couponCode})`}</span>
                        <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                      </div>
                    )}
                    <div className="summary-line total">
                      <span>Total Amount</span>
                      <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Update Delivery Status */}
                {canUpdateDeliveryStatus && (
                  <div className="info-section">
                    <h2 className="section-title">
                      <span className="section-icon">🚚</span>
                      Update Delivery Status
                    </h2>
                    <div className="status-buttons-grid">
                      {['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((status) => (
                        <button
                          key={status}
                          className={`status-update-btn ${selectedOrder.deliveryStatus === status ? 'active' : ''} ${getDeliveryStatusClass(status)}`}
                          onClick={() => handleDeliveryStatusUpdate(selectedOrder.orderId, status)}
                          disabled={selectedOrder.deliveryStatus === status}
                        >
                          {formatStatus(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                <div className="info-section">
                  <h2 className="section-title">
                    <span className="section-icon">💳</span>
                    Payment Information
                  </h2>
                  <div className="payment-info-card">
                    <div className="payment-status-row">
                      <span>Payment Status</span>
                      <span className={`status-badge ${getPaymentStatusClass(selectedOrder.paymentStatus)}`}>
                        {formatStatus(selectedOrder.paymentStatus)}
                      </span>
                    </div>
                    <p className="payment-note-text">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      Payment status is automatically updated by the payment gateway.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;