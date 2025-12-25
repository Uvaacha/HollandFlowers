import React, { useState, useEffect, useCallback } from 'react';
import { productsAPI, categoriesAPI, authAPI } from '../services/api';
import './ProductsManager.css';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [formData, setFormData] = useState({
    categoryId: '',
    productName: '',
    sku: '',
    description: '',
    shortDescription: '',
    actualPrice: '',
    offerPercentage: '0',
    stockQuantity: '',
    imageUrl: '',
    additionalImages: [],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    tags: ''
  });

  // Check if user is Super Admin (can write)
  const isSuperAdmin = authAPI.isSuperAdmin();

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchTerm, categoryFilter]);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        if (response.success && response.data) {
          const categoriesData = Array.isArray(response.data) 
            ? response.data 
            : (response.data.content || []);
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      let response;
      const params = { 
        page: currentPage, 
        size: 10,
        sort: 'createdAt,desc'
      };

      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        response = await productsAPI.search({
          keyword: debouncedSearchTerm.trim(),
          categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
          ...params
        });
      } else if (categoryFilter && categoryFilter !== 'all') {
        response = await productsAPI.getByCategory(categoryFilter, params);
      } else {
        response = await productsAPI.getAll(params);
      }

      if (response.success && response.data) {
        const productsData = response.data.content || response.data || [];
        setProducts(Array.isArray(productsData) ? productsData : []);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || productsData.length);
      } else {
        setProducts([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddProduct = () => {
    if (!isSuperAdmin) return; // Extra safety check
    setEditingProduct(null);
    setFormData({
      categoryId: categories[0]?.categoryId || '',
      productName: '',
      sku: '',
      description: '',
      shortDescription: '',
      actualPrice: '',
      offerPercentage: '0',
      stockQuantity: '',
      imageUrl: '',
      additionalImages: [],
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      tags: ''
    });
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    if (!isSuperAdmin) return; // Extra safety check
    setEditingProduct(product);
    setFormData({
      categoryId: product.categoryId || '',
      productName: product.productName || '',
      sku: product.sku || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      actualPrice: product.actualPrice?.toString() || '',
      offerPercentage: product.offerPercentage?.toString() || '0',
      stockQuantity: product.stockQuantity?.toString() || '',
      imageUrl: product.imageUrl || '',
      additionalImages: product.additionalImages || [],
      isFeatured: product.isFeatured || false,
      isNewArrival: product.isNewArrival || false,
      isBestSeller: product.isBestSeller || false,
      tags: product.tags || ''
    });
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!isSuperAdmin) return; // Extra safety check
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await productsAPI.delete(productId);
        if (response.success) {
          fetchProducts();
        }
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. You may not have permission.');
      }
    }
  };

  const handleToggleStatus = async (productId) => {
    if (!isSuperAdmin) {
      alert('You do not have permission to change product status.');
      return;
    }
    try {
      const response = await productsAPI.toggleStatus(productId);
      if (response.success && response.data) {
        setProducts(products.map(p =>
          p.productId === productId ? { ...p, isActive: response.data.isActive } : p
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
      const productData = {
        categoryId: formData.categoryId,
        productName: formData.productName.trim(),
        sku: formData.sku?.trim() || null,
        description: formData.description?.trim() || null,
        shortDescription: formData.shortDescription?.trim() || null,
        actualPrice: parseFloat(formData.actualPrice),
        offerPercentage: parseFloat(formData.offerPercentage) || 0,
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0,
        imageUrl: formData.imageUrl?.trim() || null,
        additionalImages: formData.additionalImages || [],
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        isBestSeller: formData.isBestSeller,
        tags: formData.tags?.trim() || null
      };

      let response;
      if (editingProduct) {
        response = await productsAPI.update(editingProduct.productId, productData);
      } else {
        response = await productsAPI.create(productData);
      }

      if (response.success) {
        setShowModal(false);
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setCurrentPage(0);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.categoryId === categoryId);
    return category?.categoryName || 'Uncategorized';
  };

  const calculateFinalPrice = (actualPrice, offerPercentage) => {
    const price = parseFloat(actualPrice) || 0;
    const discount = parseFloat(offerPercentage) || 0;
    return price - (price * discount / 100);
  };

  const hasActiveFilters = searchTerm || categoryFilter !== 'all';

  if (loading && products.length === 0) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-manager">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products Management</h1>
          <p className="page-subtitle">
            {isSuperAdmin ? 'Add, edit, and manage your products' : 'View products (Read-only access)'}
          </p>
        </div>
        {isSuperAdmin && (
          <button className="btn btn-primary" onClick={handleAddProduct}>
            + Add Product
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

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search-btn" 
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.categoryName}
            </option>
          ))}
        </select>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Info */}
      <div className="results-info">
        {loading ? (
          <span>Searching...</span>
        ) : (
          <span>
            {totalElements} product{totalElements !== 1 ? 's' : ''} found
            {hasActiveFilters && ' (filtered)'}
          </span>
        )}
      </div>

      {/* Products Table */}
      <div className="table-container">
        {loading && (
          <div className="table-loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        <table className="data-table">
          <thead>
            <tr>
              <th>IMAGE</th>
              <th>PRODUCT NAME</th>
              <th>SKU</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>OFFER %</th>
              <th>FINAL PRICE</th>
              <th>STOCK</th>
              <th>STATUS</th>
              {isSuperAdmin && <th>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={isSuperAdmin ? "10" : "9"} style={{ textAlign: 'center', padding: '40px' }}>
                  {hasActiveFilters ? (
                    <div>
                      <p>No products found matching your filters.</p>
                      <button className="btn-link" onClick={handleClearFilters}>
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    'No products found'
                  )}
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.productId}>
                  <td>
                    <div className="product-thumb">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.productName} />
                      ) : (
                        <div className="no-image">🖼️</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="product-name-cell">
                      <span className="product-name">{product.productName}</span>
                      <div className="product-badges">
                        {product.isFeatured && <span className="featured-badge">⭐ Featured</span>}
                        {product.isNewArrival && <span className="new-arrival-badge">🆕 New Arrival</span>}
                        {product.isBestSeller && <span className="best-seller-badge">🏆 Best Seller</span>}
                      </div>
                    </div>
                  </td>
                  <td>{product.sku || '-'}</td>
                  <td><span className="category-badge">{getCategoryName(product.categoryId)}</span></td>
                  <td>KD {parseFloat(product.actualPrice || 0).toFixed(3)}</td>
                  <td>
                    {product.offerPercentage > 0 ? (
                      <span className="discount-badge">{product.offerPercentage}% OFF</span>
                    ) : '-'}
                  </td>
                  <td className="final-price">KD {parseFloat(product.finalPrice || product.actualPrice || 0).toFixed(3)}</td>
                  <td>{product.stockQuantity}</td>
                  <td>
                    {isSuperAdmin ? (
                      <button
                        className={`status-btn ${product.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleStatus(product.productId)}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </button>
                    ) : (
                      <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  {isSuperAdmin && (
                    <td>
                      <div className="action-btns">
                        <button className="edit-btn" onClick={() => handleEditProduct(product)}>✏️</button>
                        <button className="delete-btn" onClick={() => handleDeleteProduct(product.productId)}>🗑️</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(0)} 
            disabled={currentPage === 0}
            title="First page"
          >
            ««
          </button>
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
          <button 
            onClick={() => setCurrentPage(totalPages - 1)} 
            disabled={currentPage >= totalPages - 1}
            title="Last page"
          >
            »»
          </button>
        </div>
      )}

      {/* Modal - Only shown for Super Admin */}
      {showModal && isSuperAdmin && (
        <div className="modal-overlay" onClick={() => !saving && setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={() => !saving && setShowModal(false)}>✕</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="modal-form">
              {/* Basic Info */}
              <div className="form-section">
                <h3>Basic Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Red Roses Bouquet"
                    />
                  </div>
                  <div className="form-group">
                    <label>SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="e.g. RRB-001"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required>
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Short Description</label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    placeholder="Brief description for product cards"
                  />
                </div>

                <div className="form-group">
                  <label>Full Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Detailed product description..."
                    rows="3"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="form-section">
                <h3>Pricing & Stock</h3>
                
                <div className="form-row three">
                  <div className="form-group">
                    <label>Price (KD) *</label>
                    <input
                      type="number"
                      name="actualPrice"
                      value={formData.actualPrice}
                      onChange={handleInputChange}
                      required
                      step="0.001"
                      min="0"
                      placeholder="0.000"
                    />
                  </div>
                  <div className="form-group">
                    <label>Discount (%)</label>
                    <input
                      type="number"
                      name="offerPercentage"
                      value={formData.offerPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      placeholder="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Qty *</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                {formData.actualPrice && (
                  <div className="price-preview">
                    Final Price: <strong>KD {calculateFinalPrice(formData.actualPrice, formData.offerPercentage).toFixed(3)}</strong>
                    {parseFloat(formData.offerPercentage) > 0 && (
                      <span className="old-price"> KD {parseFloat(formData.actualPrice).toFixed(3)}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="form-section">
                <h3>Product Image</h3>
                
                <div className="image-section">
                  <div className="form-group">
                    <label>Image Path</label>
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="/images/picks-for-you/25 Red Roses.webp"
                    />
                    <small>Enter path from public folder, e.g., /images/products/flower.jpg</small>
                  </div>
                  
                  {formData.imageUrl && (
                    <div className="image-preview">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="form-section">
                <h3>Additional Options</h3>
                
                <div className="form-group">
                  <label>Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="romantic, birthday, anniversary"
                  />
                </div>

                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-icon featured-icon">⭐</span>
                    Mark as Featured Product
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isNewArrival"
                      checked={formData.isNewArrival}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-icon new-arrival-icon">🆕</span>
                    Mark as New Arrival
                  </label>

                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isBestSeller"
                      checked={formData.isBestSeller}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-icon best-seller-icon">🏆</span>
                    Mark as Best Seller
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;