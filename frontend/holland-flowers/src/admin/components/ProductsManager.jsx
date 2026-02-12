import React, { useState, useEffect, useCallback } from 'react';
import { productsAPI, categoriesAPI, authAPI } from '../services/api';
import './ProductsManager.css';
import ImageUpload from './ImageUpload';  // ← NEW IMPORT ADDED

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [offerFilter, setOfferFilter] = useState('all'); // Offer filter
  const [showModal, setShowModal] = useState(false);
  const [showBulkOfferModal, setShowBulkOfferModal] = useState(false);
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
    imageUrl: '',
    additionalImages: [],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    tags: ''
  });

  // Bulk offer form data
  const [bulkOfferData, setBulkOfferData] = useState({
    selectedCategories: [],
    offerPercentage: '',
    startDate: '',
    endDate: ''
  });
  const [applyingBulkOffer, setApplyingBulkOffer] = useState(false);

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
  }, [debouncedSearchTerm, categoryFilter, offerFilter]);

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
        let productsData = response.data.content || response.data || [];
        productsData = Array.isArray(productsData) ? productsData : [];
        
        // Apply offer/discount filter on client side
        if (offerFilter === 'no-offer') {
          // No offer (0%)
          productsData = productsData.filter(p => !p.offerPercentage || p.offerPercentage === 0);
        } else if (offerFilter === 'any-offer') {
          // Any offer (> 0%)
          productsData = productsData.filter(p => p.offerPercentage && p.offerPercentage > 0);
        } else if (offerFilter !== 'all') {
          // Specific percentage (10, 15, 20, 25, 30, 50)
          const targetPercentage = parseInt(offerFilter);
          if (!isNaN(targetPercentage)) {
            // Filter products with exact percentage match (with 2% tolerance for flexibility)
            productsData = productsData.filter(p => {
              const discount = p.offerPercentage || 0;
              return discount >= targetPercentage - 2 && discount <= targetPercentage + 2;
            });
          }
        }
        
        setProducts(productsData);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(offerFilter === 'all' ? (response.data.totalElements || productsData.length) : productsData.length);
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
  }, [currentPage, debouncedSearchTerm, categoryFilter, offerFilter]);

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

  // Generate next SKU number based on existing products
  const generateNextSKU = async () => {
    try {
      // Fetch all products to find the maximum SKU
      const response = await productsAPI.getAll({ page: 0, size: 1000 });
      
      if (response.success && response.data) {
        const allProducts = response.data.content || response.data || [];
        
        // Find the maximum numeric SKU
        let maxSKU = 0;
        allProducts.forEach(product => {
          if (product.sku) {
            const skuNumber = parseInt(product.sku);
            if (!isNaN(skuNumber) && skuNumber > maxSKU) {
              maxSKU = skuNumber;
            }
          }
        });
        
        // Return next SKU (max + 1)
        return (maxSKU + 1).toString();
      }
      
      // If no products found, start from 1
      return '1';
    } catch (error) {
      console.error('Failed to generate SKU:', error);
      // Fallback to timestamp-based SKU if API fails
      return Date.now().toString().slice(-6);
    }
  };

  const handleAddProduct = async () => {
    if (!isSuperAdmin) return;
    
    // Generate next SKU automatically
    const nextSKU = await generateNextSKU();
    
    setEditingProduct(null);
    setFormData({
      categoryId: categories[0]?.categoryId || '',
      productName: '',
      sku: nextSKU,
      description: '',
      shortDescription: '',
      actualPrice: '',
      offerPercentage: '0',
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
    if (!isSuperAdmin) return;
    setEditingProduct(product);
    setFormData({
      categoryId: product.categoryId || '',
      productName: product.productName || '',
      sku: product.sku || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      actualPrice: product.actualPrice?.toString() || '',
      offerPercentage: product.offerPercentage?.toString() || '0',
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
    if (!isSuperAdmin) return;
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
    if (!isSuperAdmin) return;
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
        stockQuantity: 50, // Default stock value
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
    setOfferFilter('all');
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

  // Bulk Offer Functions
  const handleOpenBulkOfferModal = () => {
    setBulkOfferData({
      selectedCategories: [],
      offerPercentage: '',
      startDate: '',
      endDate: ''
    });
    setShowBulkOfferModal(true);
  };

  const handleBulkOfferInputChange = (e) => {
    const { name, value } = e.target;
    setBulkOfferData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setBulkOfferData(prev => {
      const isSelected = prev.selectedCategories.includes(categoryId);
      return {
        ...prev,
        selectedCategories: isSelected
          ? prev.selectedCategories.filter(id => id !== categoryId)
          : [...prev.selectedCategories, categoryId]
      };
    });
  };

  const handleSelectAllCategories = () => {
    setBulkOfferData(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.length === categories.length
        ? []
        : categories.map(c => c.categoryId)
    }));
  };

  const handleApplyBulkOffer = async (e) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    
    if (bulkOfferData.selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }
    
    if (!bulkOfferData.offerPercentage || parseFloat(bulkOfferData.offerPercentage) <= 0) {
      alert('Please enter a valid offer percentage');
      return;
    }

    const confirmMsg = `Apply ${bulkOfferData.offerPercentage}% discount to ${bulkOfferData.selectedCategories.length} categories?\n\nStart: ${bulkOfferData.startDate || 'Immediately'}\nEnd: ${bulkOfferData.endDate || 'No end date'}`;
    
    if (!window.confirm(confirmMsg)) return;

    setApplyingBulkOffer(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const categoryId of bulkOfferData.selectedCategories) {
        try {
          const response = await productsAPI.getByCategory(categoryId, { page: 0, size: 1000 });
          if (response.success && response.data) {
            const categoryProducts = response.data.content || response.data || [];
            
            for (const product of categoryProducts) {
              try {
                await productsAPI.update(product.productId, {
                  ...product,
                  offerPercentage: parseFloat(bulkOfferData.offerPercentage)
                });
                successCount++;
              } catch (err) {
                errorCount++;
                console.error(`Failed to update product ${product.productId}:`, err);
              }
            }
          }
        } catch (err) {
          console.error(`Failed to get products for category ${categoryId}:`, err);
        }
      }

      alert(`Bulk offer applied!\n✅ ${successCount} products updated\n${errorCount > 0 ? `❌ ${errorCount} failed` : ''}`);
      setShowBulkOfferModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Failed to apply bulk offer:', error);
      alert('Failed to apply bulk offer: ' + error.message);
    } finally {
      setApplyingBulkOffer(false);
    }
  };

  const handleRemoveBulkOffer = async () => {
    if (!isSuperAdmin) return;
    
    if (bulkOfferData.selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    if (!window.confirm(`Remove all offers from ${bulkOfferData.selectedCategories.length} categories?`)) return;

    setApplyingBulkOffer(true);

    try {
      let successCount = 0;

      for (const categoryId of bulkOfferData.selectedCategories) {
        const response = await productsAPI.getByCategory(categoryId, { page: 0, size: 1000 });
        if (response.success && response.data) {
          const categoryProducts = response.data.content || response.data || [];
          
          for (const product of categoryProducts) {
            if (product.offerPercentage > 0) {
              await productsAPI.update(product.productId, {
                ...product,
                offerPercentage: 0
              });
              successCount++;
            }
          }
        }
      }

      alert(`Offers removed from ${successCount} products!`);
      setShowBulkOfferModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Failed to remove bulk offer:', error);
      alert('Failed to remove bulk offer: ' + error.message);
    } finally {
      setApplyingBulkOffer(false);
    }
  };

  const hasActiveFilters = searchTerm || categoryFilter !== 'all' || offerFilter !== 'all';

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
        <div className="header-actions">
          {isSuperAdmin && (
            <>
              <button className="btn btn-secondary" onClick={handleOpenBulkOfferModal}>
                🏷️ Bulk Offer
              </button>
              <button className="btn btn-primary" onClick={handleAddProduct}>
                + Add Product
              </button>
            </>
          )}
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
        {/* Discount Filter with Specific Percentages */}
        <select
          value={offerFilter}
          onChange={(e) => setOfferFilter(e.target.value)}
          className="filter-select offer-filter"
        >
          <option value="all">All Offers</option>
          <option value="no-offer">No Offer (0%)</option>
          <option value="10">🔖 10% Discount</option>
          <option value="15">🏷️ 15% Discount</option>
          <option value="20">💰 20% Discount</option>
          <option value="25">🎯 25% Discount</option>
          <option value="30">⭐ 30% Discount</option>
          <option value="50">🔥 50% Discount</option>
          <option value="any-offer">✨ Any Offer</option>
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
              <th>STATUS</th>
              {isSuperAdmin && <th>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={isSuperAdmin ? "9" : "8"} style={{ textAlign: 'center', padding: '40px' }}>
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

      {/* Product Modal */}
      {showModal && isSuperAdmin && (
        <div className="modal-overlay" onClick={() => !saving && setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-btn" onClick={() => !saving && setShowModal(false)}>✕</button>
            </div>

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
                    <label>
                      SKU 
                      {!editingProduct && <span className="auto-label">(Auto-generated)</span>}
                      {editingProduct && <span className="auto-label">(Non-editable)</span>}
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      placeholder={!editingProduct ? "Auto-generated sequence number" : "SKU cannot be changed"}
                      disabled={true}
                      readOnly={true}
                      className="read-only-field sku-field"
                      title={editingProduct ? "SKU cannot be modified" : "SKU is auto-generated"}
                    />
                    {!editingProduct && (
                      <small className="field-hint">✓ Next available SKU: {formData.sku}</small>
                    )}
                    {editingProduct && (
                      <small className="field-hint">⚠️ SKU is permanent and cannot be changed</small>
                    )}
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
                <h3>Pricing</h3>
                
                <div className="form-row">
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

              {/* Image Upload Section - REPLACED WITH IMAGEUPLOAD COMPONENT */}
              <div className="form-section">
                <h3>Product Image</h3>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  disabled={saving}
                />
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

      {/* Bulk Offer Modal */}
      {showBulkOfferModal && isSuperAdmin && (
        <div className="modal-overlay" onClick={() => !applyingBulkOffer && setShowBulkOfferModal(false)}>
          <div className="modal-box bulk-offer-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏷️ Bulk Offer Management</h2>
              <button className="close-btn" onClick={() => !applyingBulkOffer && setShowBulkOfferModal(false)}>✕</button>
            </div>

            <form onSubmit={handleApplyBulkOffer} className="modal-form">
              <div className="form-section">
                <h3>Select Categories</h3>
                <p className="section-hint">Choose categories to apply the bulk offer</p>
                
                <div className="select-all-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={bulkOfferData.selectedCategories.length === categories.length}
                      onChange={handleSelectAllCategories}
                    />
                    <strong>Select All Categories ({categories.length})</strong>
                  </label>
                </div>

                <div className="categories-grid">
                  {categories.map(cat => (
                    <label key={cat.categoryId} className="category-checkbox">
                      <input
                        type="checkbox"
                        checked={bulkOfferData.selectedCategories.includes(cat.categoryId)}
                        onChange={() => handleCategorySelect(cat.categoryId)}
                      />
                      <span className="category-name">{cat.categoryName}</span>
                      <span className="product-count">({cat.productCount || 0} products)</span>
                    </label>
                  ))}
                </div>

                {bulkOfferData.selectedCategories.length > 0 && (
                  <div className="selected-count">
                    ✓ {bulkOfferData.selectedCategories.length} categories selected
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3>Offer Details</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Discount Percentage *</label>
                    <div className="input-with-suffix">
                      <input
                        type="number"
                        name="offerPercentage"
                        value={bulkOfferData.offerPercentage}
                        onChange={handleBulkOfferInputChange}
                        min="0"
                        max="100"
                        placeholder="e.g. 20"
                        required
                      />
                      <span className="suffix">%</span>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date (Optional)</label>
                    <input
                      type="date"
                      name="startDate"
                      value={bulkOfferData.startDate}
                      onChange={handleBulkOfferInputChange}
                    />
                    <small>Leave empty to apply immediately</small>
                  </div>
                  <div className="form-group">
                    <label>End Date (Optional)</label>
                    <input
                      type="date"
                      name="endDate"
                      value={bulkOfferData.endDate}
                      onChange={handleBulkOfferInputChange}
                    />
                    <small>Leave empty for no end date</small>
                  </div>
                </div>
              </div>

              <div className="modal-footer bulk-offer-footer">
                <button 
                  type="button" 
                  className="btn-danger" 
                  onClick={handleRemoveBulkOffer}
                  disabled={applyingBulkOffer || bulkOfferData.selectedCategories.length === 0}
                >
                  Remove Offers
                </button>
                <div className="footer-right">
                  <button type="button" className="btn-cancel" onClick={() => setShowBulkOfferModal(false)}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-save" 
                    disabled={applyingBulkOffer || bulkOfferData.selectedCategories.length === 0}
                  >
                    {applyingBulkOffer ? 'Applying...' : 'Apply Offer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;