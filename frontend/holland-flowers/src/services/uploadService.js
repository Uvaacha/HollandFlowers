/**
 * File Upload Service - Holland Flowers
 * Handles file uploads to Supabase storage via backend
 */

import api from './api';

const STORAGE_ENDPOINTS = {
  UPLOAD: '/storage/upload',
  UPLOAD_MULTIPLE: '/storage/upload/multiple',
  DELETE: '/storage/delete',
};

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const uploadService = {
  /**
   * Upload a single file
   * @param {File} file - File to upload
   * @param {string} folder - Destination folder (e.g., 'products', 'categories', 'avatars')
   * @returns {Promise} Upload result with file URL
   */
  uploadFile: async (file, folder = 'uploads') => {
    try {
      // Validate file
      const validation = uploadService.validateFile(file);
      if (!validation.valid) {
        throw { success: false, message: validation.error };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await api.post(STORAGE_ENDPOINTS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload multiple files
   * @param {FileList|File[]} files - Files to upload
   * @param {string} folder - Destination folder
   * @returns {Promise} Upload results with file URLs
   */
  uploadMultiple: async (files, folder = 'uploads') => {
    try {
      // Validate all files
      for (const file of files) {
        const validation = uploadService.validateFile(file);
        if (!validation.valid) {
          throw { success: false, message: `${file.name}: ${validation.error}` };
        }
      }

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      formData.append('folder', folder);

      const response = await api.post(STORAGE_ENDPOINTS.UPLOAD_MULTIPLE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete a file
   * @param {string} fileUrl - URL or path of file to delete
   * @returns {Promise} Deletion result
   */
  deleteFile: async (fileUrl) => {
    try {
      const response = await api.delete(STORAGE_ENDPOINTS.DELETE, {
        params: { fileUrl },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @returns {Object} { valid: boolean, error?: string }
   */
  validateFile: (file) => {
    // Check file exists
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` 
      };
    }

    // Check file type for images
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' 
      };
    }

    return { valid: true };
  },

  /**
   * Create a preview URL for a file
   * @param {File} file - File to preview
   * @returns {string} Object URL for preview
   */
  createPreviewUrl: (file) => {
    return URL.createObjectURL(file);
  },

  /**
   * Revoke a preview URL to free memory
   * @param {string} url - Preview URL to revoke
   */
  revokePreviewUrl: (url) => {
    URL.revokeObjectURL(url);
  },

  /**
   * Get file extension
   * @param {string} filename - File name
   * @returns {string} File extension (lowercase)
   */
  getFileExtension: (filename) => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  },

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted size string
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

export default uploadService;