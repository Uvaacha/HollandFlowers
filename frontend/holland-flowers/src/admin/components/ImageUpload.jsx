import React, { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';
import './ImageUpload.css';

const ImageUpload = ({ value, onChange, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMode, setUploadMode] = useState('upload');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, WEBP, or GIF)');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(30);

      const response = await uploadAPI.uploadProductImage(file);
      setUploadProgress(100);

      if (response.success && response.data && response.data.url) {
        onChange({ target: { name: 'imageUrl', value: response.data.url } });
        setTimeout(() => setUploadProgress(0), 1000);
      } else if (response.data && response.data.url) {
        // Handle case where success flag might be missing
        onChange({ target: { name: 'imageUrl', value: response.data.url } });
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        throw new Error('Upload failed - no URL returned');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const msg = error.message || 'Unknown error';
      if (msg.toLowerCase().includes('login') || 
          msg.toLowerCase().includes('unauthorized') || 
          msg.toLowerCase().includes('session')) {
        // Force fresh login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('adminUser');
        alert('Session expired. Please log in again.');
        window.location.href = '/admin';
      } else {
        alert('Failed to upload image: ' + msg);
      }
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    if (window.confirm('Remove this image?')) {
      onChange({ target: { name: 'imageUrl', value: '' } });
    }
  };

  return (
    <div className="image-upload-container">
      <div className="upload-mode-toggle">
        <button
          type="button"
          className={`mode-btn ${uploadMode === 'upload' ? 'active' : ''}`}
          onClick={() => setUploadMode('upload')}
        >
          📤 Upload Image
        </button>
        <button
          type="button"
          className={`mode-btn ${uploadMode === 'manual' ? 'active' : ''}`}
          onClick={() => setUploadMode('manual')}
        >
          ✏️ Enter Path
        </button>
      </div>

      {uploadMode === 'upload' && (
        <div className="upload-section">
          <div
            className={`dropzone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
              disabled={disabled || uploading}
            />

            {uploading ? (
              <div className="upload-progress">
                <div className="spinner"></div>
                <p>Uploading... {uploadProgress}%</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <>
                <div className="dropzone-icon">📁</div>
                <p className="dropzone-text">Drag & drop an image here, or click to select</p>
                <button type="button" className="upload-btn" onClick={handleButtonClick} disabled={disabled}>
                  Choose File
                </button>
                <p className="dropzone-hint">Supports: JPG, PNG, WEBP, GIF (max 5MB)</p>
              </>
            )}
          </div>
        </div>
      )}

      {uploadMode === 'manual' && (
        <div className="manual-section">
          <label>Image Path</label>
          <input
            type="text"
            name="imageUrl"
            value={value}
            onChange={onChange}
            placeholder="/images/Flowers And Chocolates Offer's/Yellow Box.webp"
            disabled={disabled}
            className="path-input"
          />
          <small>Enter path from public folder, e.g., /images/products/flower.jpg</small>
        </div>
      )}

      {value && (
        <div className="image-preview-section">
          <div className="preview-header">
            <h4>Preview</h4>
            <button type="button" className="remove-btn" onClick={handleRemoveImage} disabled={disabled} title="Remove image">
              🗑️ Remove
            </button>
          </div>
          <div className="preview-container">
            <img
              src={value}
              alt="Product preview"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="preview-error" style={{ display: 'none' }}>
              <span>❌</span>
              <p>Image failed to load</p>
              <small>{value}</small>
            </div>
          </div>
          <div className="image-path-display">
            <small><strong>Path:</strong> {value}</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;