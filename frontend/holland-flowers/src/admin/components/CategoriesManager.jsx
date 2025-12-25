import React, { useState, useEffect, useCallback } from 'react';
import { categoriesAPI, authAPI } from '../services/api';
import './CategoriesManager.css';

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    imageUrl: '',
    displayOrder: ''
  });

  // Check if user is Super Admin (can write)
  const isSuperAdmin = authAPI.isSuperAdmin();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll();
      console.log('Categories response:', response);
      
      if (response.success && response.data) {
        // Handle both array and paginated responses
        const categoriesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.content || []);
        setCategories(categoriesData);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('Failed to load categories: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCategory = () => {
    if (!isSuperAdmin) return; // Extra safety check
    setEditingCategory(null);
    setFormData({
      categoryName: '',
      description: '',
      imageUrl: '',
      displayOrder: ''
    });
    setShowModal(true);
  };

  const handleEditCategory = (e, category) => {
    if (!isSuperAdmin) return; // Extra safety check
    e.stopPropagation();
    e.preventDefault();
    setEditingCategory(category);
    setFormData({
      categoryName: category.categoryName || '',
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      displayOrder: category.displayOrder?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDeleteCategory = async (e, categoryId) => {
    if (!isSuperAdmin) return; // Extra safety check
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await categoriesAPI.delete(categoryId);
        if (response.success) {
          setCategories(categories.filter(c => c.categoryId !== categoryId));
          alert('Category deleted successfully!');
        }
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category. You may not have permission.');
      }
    }
  };

  const handleToggleStatus = async (e, categoryId) => {
    if (!isSuperAdmin) {
      alert('You do not have permission to change category status.');
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    try {
      const response = await categoriesAPI.toggleStatus(categoryId);
      if (response.success && response.data) {
        setCategories(categories.map(c => 
          c.categoryId === categoryId ? response.data : c
        ));
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Failed to toggle status. You may not have permission.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return; // Extra safety check
    setSaving(true);

    try {
      // Prepare data matching backend DTO
      const categoryData = {
        categoryName: formData.categoryName.trim(),
        description: formData.description?.trim() || null,
        imageUrl: formData.imageUrl?.trim() || null,
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder, 10) : null
      };

      console.log('Sending category data:', categoryData);

      let response;
      if (editingCategory) {
        // Update existing category
        response = await categoriesAPI.update(editingCategory.categoryId, categoryData);
        console.log('Update response:', response);
        
        if (response.success && response.data) {
          setCategories(categories.map(c => 
            c.categoryId === editingCategory.categoryId ? response.data : c
          ));
          alert('Category updated successfully!');
        }
      } else {
        // Create new category
        response = await categoriesAPI.create(categoryData);
        console.log('Create response:', response);
        
        if (response.success && response.data) {
          setCategories([...categories, response.data]);
          alert('Category created successfully!');
        }
      }
      
      setShowModal(false);
      setFormData({
        categoryName: '',
        description: '',
        imageUrl: '',
        displayOrder: ''
      });
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter(category => {
    const searchLower = searchTerm.toLowerCase();
    return (
      category.categoryName?.toLowerCase().includes(searchLower) ||
      category.description?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="categories-manager">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories Management</h1>
          <p className="page-subtitle">
            {isSuperAdmin ? 'Add, edit, and manage product categories' : 'View product categories (Read-only access)'}
          </p>
        </div>
        {isSuperAdmin && (
          <button className="btn btn-primary" onClick={handleAddCategory}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Category
          </button>
        )}
      </div>

      {/* Read-only notice for Admin */}
      {!isSuperAdmin && (
        <div className="read-only-notice">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>You have view-only access. Contact a Super Admin to make changes.</span>
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
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="categories-grid">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div key={category.categoryId} className={`category-card ${!category.isActive ? 'inactive' : ''}`}>
              <div className="category-image">
                {category.imageUrl ? (
                  <img src={category.imageUrl} alt={category.categoryName} />
                ) : (
                  <div className="category-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="category-info">
                <h3 className="category-name">{category.categoryName}</h3>
                <p className="category-description">{category.description || 'No description'}</p>
                <div className="category-meta">
                  <span className="product-count">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                    {category.productCount || 0} products
                  </span>
                  <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              {/* Only show action buttons for Super Admin */}
              {isSuperAdmin && (
                <div className="category-actions">
                  <button 
                    type="button"
                    className={`action-btn status-btn ${category.isActive ? 'active' : ''}`}
                    onClick={(e) => handleToggleStatus(e, category.categoryId)}
                    title={category.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      {category.isActive && <path d="M9 12l2 2 4-4"/>}
                    </svg>
                  </button>
                  <button 
                    type="button"
                    className="action-btn edit-btn"
                    onClick={(e) => handleEditCategory(e, category)}
                    title="Edit"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button 
                    type="button"
                    className="action-btn delete-btn"
                    onClick={(e) => handleDeleteCategory(e, category.categoryId)}
                    title="Delete"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <h3>No Categories Yet</h3>
            <p>{isSuperAdmin ? 'Create your first category to get started' : 'No categories available'}</p>
            {isSuperAdmin && (
              <button className="btn btn-primary" onClick={handleAddCategory}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add First Category
              </button>
            )}
          </div>
        )}
      </div>

      {filteredCategories.length > 0 && (
        <div className="table-footer">
          <p>Showing {filteredCategories.length} of {categories.length} categories</p>
        </div>
      )}

      {/* Add/Edit Modal - Only shown for Super Admin */}
      {showModal && isSuperAdmin && (
        <div className="modal-overlay" onClick={() => !saving && setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="close-btn" onClick={() => !saving && setShowModal(false)} disabled={saving}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            {/* Scrollable form content */}
            <div className="modal-body">
              <form id="category-form" onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    name="categoryName"
                    value={formData.categoryName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Roses, Tulips, Birthday Bouquets"
                    minLength={2}
                    maxLength={100}
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of this category..."
                    rows="3"
                    maxLength={500}
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/category-image.jpg"
                    disabled={saving}
                  />
                  {formData.imageUrl && (
                    <div className="image-preview">
                      <img src={formData.imageUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    disabled={saving}
                  />
                  <small className="form-hint">Lower numbers appear first in the list</small>
                </div>
              </form>
            </div>

            {/* Fixed footer */}
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="category-form"
                className="btn btn-primary"
                disabled={saving || !formData.categoryName.trim()}
              >
                {saving ? (
                  <>
                    <span className="spinner-small"></span>
                    {editingCategory ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingCategory ? 'Update Category' : 'Create Category'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesManager;