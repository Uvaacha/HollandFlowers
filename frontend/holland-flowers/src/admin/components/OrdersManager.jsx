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

  // Check if user is Super Admin (can write)
  const isSuperAdmin = authAPI.isSuperAdmin();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      let response;
      
      if (statusFilter !== 'all') {
        response = await ordersAPI.getByStatus(statusFilter.toUpperCase(), { page: currentPage, size: 10 });
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

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!isSuperAdmin) {
      alert('You do not have permission to update order status.');
      return;
    }
    try {
      const response = await ordersAPI.updateStatus(orderId, newStatus);
      if (response.success) {
        setOrders(orders.map(order => 
          order.orderId === orderId ? { ...order, orderStatus: newStatus } : order
        ));
        if (selectedOrder?.orderId === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. You may not have permission.');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.recipientPhone?.includes(searchTerm);
    return matchesSearch;
  });

  const getStatusClass = (status) => {
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

  const formatStatus = (status) => {
    return status?.replace(/_/g, ' ') || 'Pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
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
          <p className="page-subtitle">
            {isSuperAdmin ? 'View and manage customer orders' : 'View customer orders (Read-only access)'}
          </p>
        </div>
      </div>

      {/* Read-only notice for Admin */}
      {!isSuperAdmin && (
        <div className="read-only-notice">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>You have view-only access. Contact a Super Admin to update order status.</span>
        </div>
      )}

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
          <option value="all">All Status</option>
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
              <th>Status</th>
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
                    <span className={`status-badge ${getStatusClass(order.orderStatus)}`}>
                      {formatStatus(order.orderStatus)}
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
                <td colSpan="8" className="empty-message">No orders found</td>
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
              <div className="detail-section">
                <h3>📦 Order Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Order Number</label>
                    <span>{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <span className={`status-badge ${getStatusClass(selectedOrder.orderStatus)}`}>
                      {formatStatus(selectedOrder.orderStatus)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Payment Status</label>
                    <span className={`payment-status ${selectedOrder.paymentStatus?.toLowerCase()}`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Order Date</label>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>👤 Recipient Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name</label>
                    <span>{selectedOrder.recipientName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
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
                </div>
              </div>

              {selectedOrder.cardMessage && (
                <div className="detail-section">
                  <h3>💌 Card Message</h3>
                  <div className="message-box">
                    "{selectedOrder.cardMessage}"
                  </div>
                </div>
              )}

              {selectedOrder.deliveryNotes && (
                <div className="detail-section">
                  <h3>📝 Delivery Notes</h3>
                  <div className="message-box">
                    {selectedOrder.deliveryNotes}
                  </div>
                </div>
              )}

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
                      <span>Discount</span>
                      <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Only show Update Status section for Super Admin */}
              {isSuperAdmin && (
                <div className="detail-section">
                  <h3>🔄 Update Status</h3>
                  <div className="status-buttons">
                    {['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((status) => (
                      <button
                        key={status}
                        className={`status-btn ${selectedOrder.orderStatus === status ? 'active' : ''} ${getStatusClass(status)}`}
                        onClick={() => handleStatusUpdate(selectedOrder.orderId, status)}
                        disabled={selectedOrder.orderStatus === status}
                      >
                        {formatStatus(status)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Show read-only message for Admin */}
              {!isSuperAdmin && (
                <div className="detail-section">
                  <div className="read-only-modal-notice">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>Contact a Super Admin to update order status.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;