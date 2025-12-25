import React, { useState, useEffect, useCallback } from 'react';
import { customersAPI, authAPI } from '../services/api';
import './CustomersManager.css';

const CustomersManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState(null);

  // Check if user is Super Admin (can write)
  const isSuperAdmin = authAPI.isSuperAdmin();

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getAll({ page: currentPage, size: 10 });
      
      console.log('Customers response:', response);
      
      if (response.success && response.data) {
        const customersData = response.data.content || response.data || [];
        setCustomers(Array.isArray(customersData) ? customersData : []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      alert('Failed to load customers: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const fetchStats = async () => {
    try {
      const response = await customersAPI.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [fetchCustomers]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCustomers();
      return;
    }

    try {
      setLoading(true);
      const response = await customersAPI.search(searchTerm);
      
      if (response.success && response.data) {
        const customersData = response.data.content || response.data || [];
        setCustomers(Array.isArray(customersData) ? customersData : []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetails = async (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
    setLoadingDetails(true);

    try {
      const response = await customersAPI.getById(customer.userId);
      if (response.success && response.data) {
        setCustomerDetails(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch customer details:', error);
      setCustomerDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleCustomerStatus = async (customerId, currentStatus) => {
    if (!isSuperAdmin) {
      alert('You do not have permission to change customer status.');
      return;
    }
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this customer?`)) {
      return;
    }

    try {
      const response = await customersAPI.updateStatus(customerId, !currentStatus);
      if (response.success) {
        setCustomers(customers.map(c => 
          c.userId === customerId ? { ...c, isActive: !currentStatus } : c
        ));
        alert(`Customer ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update customer status. You may not have permission.');
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'PENDING': 'status-pending',
      'CONFIRMED': 'status-processing',
      'PROCESSING': 'status-processing',
      'SHIPPED': 'status-shipped',
      'OUT_FOR_DELIVERY': 'status-shipped',
      'DELIVERED': 'status-delivered',
      'CANCELLED': 'status-cancelled'
    };
    return statusMap[status] || 'status-pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `KD ${parseFloat(amount || 0).toFixed(3)}`;
  };

  if (loading && customers.length === 0) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="customers-manager">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers Management</h1>
          <p className="page-subtitle">
            {isSuperAdmin ? 'View and manage customer information' : 'View customer information (Read-only access)'}
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
          <span>You have view-only access. Contact a Super Admin to change customer status.</span>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon customers-icon">👥</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalCustomers}</span>
              <span className="stat-label">Total Customers</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active-icon">✅</div>
            <div className="stat-info">
              <span className="stat-value">{stats.activeCustomers}</span>
              <span className="stat-label">Active Customers</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon new-icon">🆕</div>
            <div className="stat-info">
              <span className="stat-value">{stats.newCustomersThisWeek}</span>
              <span className="stat-label">New This Week</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orders-icon">🛒</div>
            <div className="stat-info">
              <span className="stat-value">{stats.customersWithOrders}</span>
              <span className="stat-label">With Orders</span>
            </div>
          </div>
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
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button className="btn btn-outline" onClick={handleSearch}>
          Search
        </button>
        {searchTerm && (
          <button 
            className="btn btn-text" 
            onClick={() => { setSearchTerm(''); fetchCustomers(); }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer, index) => (
                <tr key={customer.userId} className={!customer.isActive ? 'inactive-row' : ''}>
                  <td>{currentPage * 10 + index + 1}</td>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar">
                        {customer.profileImageUrl ? (
                          <img src={customer.profileImageUrl} alt={customer.name} />
                        ) : (
                          <span>{customer.name?.charAt(0)?.toUpperCase()}</span>
                        )}
                      </div>
                      <div className="customer-info">
                        <span className="customer-name">{customer.name}</span>
                        {customer.isEmailVerified && <span className="verified-badge">✓ Verified</span>}
                      </div>
                    </div>
                  </td>
                  <td>{customer.phoneNumber || '-'}</td>
                  <td className="email-cell">{customer.email}</td>
                  <td className="center-cell">{customer.totalOrders || 0}</td>
                  <td className="amount-cell">{formatCurrency(customer.totalSpent)}</td>
                  <td>
                    {isSuperAdmin ? (
                      <button
                        className={`status-toggle ${customer.isActive ? 'active' : 'inactive'}`}
                        onClick={() => toggleCustomerStatus(customer.userId, customer.isActive)}
                      >
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </button>
                    ) : (
                      <span className={`status-badge-readonly ${customer.isActive ? 'active' : 'inactive'}`}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td className="date-cell">{formatDate(customer.createdAt)}</td>
                  <td>
                    <button 
                      className="action-btn view-btn"
                      onClick={() => viewCustomerDetails(customer)}
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
                <td colSpan="9" className="empty-message">
                  <div className="empty-state-table">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <p>No customers found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p>Showing {customers.length} customers</p>
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="pagination-btn"
            >
              ← Previous
            </button>
            <span className="page-info">Page {currentPage + 1} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showModal && selectedCustomer && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal customer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              {loadingDetails ? (
                <div className="loading-details">
                  <div className="spinner"></div>
                  <p>Loading customer details...</p>
                </div>
              ) : (
                <>
                  <div className="customer-profile">
                    <div className="customer-avatar large">
                      {(customerDetails || selectedCustomer).profileImageUrl ? (
                        <img src={(customerDetails || selectedCustomer).profileImageUrl} alt="Profile" />
                      ) : (
                        <span>{(customerDetails || selectedCustomer).name?.charAt(0)?.toUpperCase()}</span>
                      )}
                    </div>
                    <h3 className="customer-name">{(customerDetails || selectedCustomer).name}</h3>
                    <div className="customer-badges">
                      {(customerDetails || selectedCustomer).isEmailVerified && (
                        <span className="badge badge-success">✓ Email Verified</span>
                      )}
                      {(customerDetails || selectedCustomer).isPhoneVerified && (
                        <span className="badge badge-success">✓ Phone Verified</span>
                      )}
                      <span className={`badge ${(customerDetails || selectedCustomer).isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {(customerDetails || selectedCustomer).isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Customer ID</label>
                      <span className="detail-value">{(customerDetails || selectedCustomer).userId}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone Number</label>
                      <span className="detail-value">{(customerDetails || selectedCustomer).phoneNumber || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email</label>
                      <span className="detail-value">{(customerDetails || selectedCustomer).email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Total Orders</label>
                      <span className="detail-value highlight">{customerDetails?.totalOrders || 0}</span>
                    </div>
                    <div className="detail-item">
                      <label>Total Spent</label>
                      <span className="detail-value highlight">{formatCurrency(customerDetails?.totalSpent)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Last Order</label>
                      <span className="detail-value">{formatDate(customerDetails?.lastOrderAt)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Last Login</label>
                      <span className="detail-value">{formatDate((customerDetails || selectedCustomer).lastLoginAt)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Joined</label>
                      <span className="detail-value">{formatDate((customerDetails || selectedCustomer).createdAt)}</span>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  {customerDetails?.recentOrders && customerDetails.recentOrders.length > 0 && (
                    <div className="recent-orders-section">
                      <h4>Recent Orders</h4>
                      <div className="orders-list">
                        {customerDetails.recentOrders.map((order) => (
                          <div key={order.orderId} className="order-item">
                            <div className="order-info">
                              <span className="order-number">{order.orderNumber}</span>
                              <span className="order-date">{formatDate(order.orderDate)}</span>
                            </div>
                            <div className="order-meta">
                              <span className={`status-badge ${getStatusClass(order.orderStatus)}`}>
                                {order.orderStatus}
                              </span>
                              <span className="order-amount">{formatCurrency(order.totalAmount)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersManager;