import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import OrdersManager from './components/OrdersManager';
import ProductsManager from './components/ProductsManager';
import CustomersManager from './components/CustomersManager';
import CategoriesManager from './components/CategoriesManager';
import Settings from './components/Settings';
import './AdminApp.css';

const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (token && user) {
      setIsAuthenticated(true);
      setAdminUser(JSON.parse(user));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setAdminUser(user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  if (isLoading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <AdminLayout onLogout={handleLogout} adminUser={adminUser}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<OrdersManager />} />
        <Route path="/products" element={<ProductsManager />} />
        <Route path="/customers" element={<CustomersManager />} />
        <Route path="/categories" element={<CategoriesManager />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminApp;