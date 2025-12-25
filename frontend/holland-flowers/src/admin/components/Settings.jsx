import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import './Settings.css';

const Settings = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleId: 2  // Default to ADMIN role (2=ADMIN, 3=SUPER_ADMIN)
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAdmins();
      // API returns { success: true, data: { content: [...] } } for paginated results
      const adminsList = response?.data?.content || response?.content || response?.data || [];
      setAdmins(Array.isArray(adminsList) ? adminsList : []);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      alert('Failed to load admins: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'roleId' ? parseInt(value, 10) : value 
    }));
  };

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    setFormData({ name: '', email: '', phone: '', password: '', roleId: 2 });
    setShowModal(true);
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone || admin.phoneNumber || '',
      password: '',
      roleId: admin.roleId || 2
    });
    setShowModal(true);
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await settingsAPI.deleteAdmin(adminId);
        setAdmins(admins.filter(a => (a.userId || a.id) !== adminId));
        alert('Admin deleted successfully!');
      } catch (error) {
        console.error('Failed to delete admin:', error);
        alert('Failed to delete admin: ' + error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        const response = await settingsAPI.updateAdmin(editingAdmin.userId || editingAdmin.id, formData);
        const updatedAdmin = response?.data || response;
        setAdmins(admins.map(a => 
          (a.userId || a.id) === (editingAdmin.userId || editingAdmin.id) ? { ...a, ...updatedAdmin } : a
        ));
        alert('Admin updated successfully!');
      } else {
        const response = await settingsAPI.createAdmin(formData);
        const newAdmin = response?.data || response;
        setAdmins([...admins, newAdmin]);
        alert('Admin created successfully!');
      }
      setShowModal(false);
      fetchAdmins(); // Refresh the list
    } catch (error) {
      console.error('Failed to save admin:', error);
      alert('Failed to save admin: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage admin users and settings</p>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Admin Users</h2>
            <p className="section-subtitle">Manage who has access to the admin panel</p>
          </div>
          <button className="btn btn-primary" onClick={handleAddAdmin}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Admin
          </button>
        </div>

        <div className="admins-grid">
          {admins.length > 0 ? (
            admins.map((admin) => (
              <div key={admin.userId || admin.id} className="admin-card">
                <div className="admin-avatar">
                  <span>{admin.name?.charAt(0)}</span>
                </div>
                <div className="admin-info">
                  <h3 className="admin-name">{admin.name}</h3>
                  <span className={`role-badge ${admin.roleName === 'SUPER_ADMIN' ? 'super-admin' : 'admin'}`}>
                    {admin.roleName === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                  </span>
                  <div className="admin-details">
                    <div className="detail-row">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <span>{admin.email}</span>
                    </div>
                    <div className="detail-row">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      <span>{admin.phone || admin.phoneNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="admin-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEditAdmin(admin)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteAdmin(admin.userId || admin.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              <p>No admin users found</p>
              <button className="btn btn-primary" onClick={handleAddAdmin}>
                Add First Admin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAdmin ? 'Edit Admin' : 'Add New Admin'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter admin name"
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number (e.g., +96512345678)"
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  required
                >
                  <option value={2}>Admin (View Only)</option>
                  <option value={3}>Super Admin (Full Access)</option>
                </select>
              </div>

              <div className="form-group">
                <label>{editingAdmin ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingAdmin}
                  placeholder={editingAdmin ? 'Enter new password' : 'Enter password'}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAdmin ? 'Update Admin' : 'Add Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;