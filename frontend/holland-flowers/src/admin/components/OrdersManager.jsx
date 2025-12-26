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

  // Both Admin and Super Admin can update delivery status
  const canUpdateDeliveryStatus = authAPI.isAdmin(); // Returns true for both ADMIN and SUPER_ADMIN

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

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - {selectedOrder.orderNumber}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {/* Order Information */}
              <div className="detail-section">
                <h3>📦 Order Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Order Number</label>
                    <span>{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="detail-item">
                    <label>Delivery Status</label>
                    <span className={`status-badge ${getDeliveryStatusClass(selectedOrder.deliveryStatus)}`}>
                      {formatStatus(selectedOrder.deliveryStatus)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Payment Status</label>
                    <span className={`status-badge ${getPaymentStatusClass(selectedOrder.paymentStatus)}`}>
                      {formatStatus(selectedOrder.paymentStatus)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Order Date</label>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              {selectedOrder.user && (
                <div className="detail-section">
                  <h3>👤 Customer Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name</label>
                      <span>{selectedOrder.user.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email</label>
                      <span>{selectedOrder.user.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone</label>
                      <span>{selectedOrder.user.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipient/Delivery Information */}
              <div className="detail-section">
                <h3>🚚 Delivery Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Recipient Name</label>
                    <span>{selectedOrder.recipientName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Recipient Phone</label>
                    <span>{selectedOrder.recipientPhone}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Delivery Address</label>
                    <span>{selectedOrder.deliveryAddress}</span>
                  </div>
                  <div className="detail-item">
                    <label>Area</label>
                    <span>{selectedOrder.deliveryArea}</span>
                  </div>
                  <div className="detail-item">
                    <label>Governorate</label>
                    <span>{selectedOrder.deliveryCity}</span>
                  </div>
                  {selectedOrder.preferredDeliveryDate && (
                    <div className="detail-item">
                      <label>Preferred Delivery Date</label>
                      <span>{formatDate(selectedOrder.preferredDeliveryDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ========== ORDER ITEMS / PRODUCTS SECTION ========== */}
              <div className="detail-section">
                <h3>🛒 Order Items ({selectedOrder.items?.length || 0} products)</h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="order-items-list">
                    {selectedOrder.items.map((item, index) => (
                      <div key={item.orderItemId || index} className="order-item-card">
                        <div className="item-image">
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
                            <div className="no-image">
                              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="item-details">
                          <h4 className="item-name">{item.productName}</h4>
                          {item.specialInstructions && (
                            <p className="item-instructions">
                              <strong>Note:</strong> {item.specialInstructions}
                            </p>
                          )}
                          <div className="item-pricing">
                            <span className="item-quantity">Qty: {item.quantity}</span>
                            <span className="item-unit-price">{formatCurrency(item.unitPrice)} each</span>
                          </div>
                        </div>
                        <div className="item-total">
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-items-message">No items found for this order.</p>
                )}
              </div>

              {/* Card Message */}
              {selectedOrder.cardMessage && (
                <div className="detail-section">
                  <h3>💌 Card Message</h3>
                  <div className="message-box">
                    "{selectedOrder.cardMessage}"
                  </div>
                </div>
              )}

              {/* Delivery Notes */}
              {selectedOrder.deliveryNotes && (
                <div className="detail-section">
                  <h3>📝 Delivery Notes</h3>
                  <div className="message-box">
                    {selectedOrder.deliveryNotes}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="detail-section">
                <h3>💰 Order Summary</h3>
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="summary-row discount">
                      <span>Discount {selectedOrder.couponCode && `(${selectedOrder.couponCode})`}</span>
                      <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Update Delivery Status - Both Admin and Super Admin can update */}
              {canUpdateDeliveryStatus && (
                <div className="detail-section">
                  <h3>🚚 Update Delivery Status</h3>
                  <div className="status-buttons">
                    {['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((status) => (
                      <button
                        key={status}
                        className={`status-btn ${selectedOrder.deliveryStatus === status ? 'active' : ''} ${getDeliveryStatusClass(status)}`}
                        onClick={() => handleDeliveryStatusUpdate(selectedOrder.orderId, status)}
                        disabled={selectedOrder.deliveryStatus === status}
                      >
                        {formatStatus(status)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Status Info (Read-only) */}
              <div className="detail-section">
                <h3>💳 Payment Information</h3>
                <div className="payment-info-box">
                  <div className="payment-info-item">
                    <label>Payment Status</label>
                    <span className={`status-badge ${getPaymentStatusClass(selectedOrder.paymentStatus)}`}>
                      {formatStatus(selectedOrder.paymentStatus)}
                    </span>
                  </div>
                  <p className="payment-note">
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
      )}
    </div>
  );
};

export default OrdersManager;