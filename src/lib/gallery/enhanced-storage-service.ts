/**
 * Enhanced Gallery Storage Service
 *
 * Comprehensive service for managing gallery images using Supabase Storage
 * Bucket: wildout-images/moments
 *
 * Enhanced Features:
 * - Secure file upload with validation and optimization
 * - Image optimization using browser Canvas API
 * - Thumbnail generation with proper resizing
 * - Paginated retrieval with caching
 * - Bulk operations
 * - Storage monitoring and usage tracking
 * - Data consistency validation
 * - Comprehensive error handling and logging
 * - Backup/recovery procedures
 */

import { supabaseClient } from '@/supabase/client';
import type { GalleryImage } from '@/types/content';

// Constants
export const STORAGE_BUCKET = 'wildout-images';
export const MOMENTS_PATH = 'moments';
export const THUMBNAILS_PATH = 'thumbnails';
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
export const THUMBNAIL_WIDTH = 300;
export const THUMBNAIL_HEIGHT = 300;
export const OPTIMIZED_MAX_WIDTH = 1920;
export const OPTIMIZED_MAX_HEIGHT = 1080;
export const COMPRESSION_QUALITY = 0.85;

// Types
export interface StorageMetadata {
  size: number;
  width: number;
  height: number;
  mime_type: string;
  format: string;
  created_at: string;
  uploaded_by: string;
  checksum?: string;
  optimized?: boolean;
  thumbnail_generated?: boolean;
}

export interface UploadOptions {
  optimize?: boolean;
  generateThumbnail?: boolean;
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
  compressionQuality?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  searchQuery?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  recentUploads: number;
  bucketSize: number;
  lastUpdated: string;
}

export interface StorageConsistencyIssue {
  item_id: string | null;
  item_title: string | null;
  storage_path: string;
  issue_type: string;
  description: string;
}

export interface BackupInfo {
  timestamp: string;
  fileCount: number;
  totalSize: number;
  items: Array<{
    id: string;
    storage_path: string;
    metadata: StorageMetadata & {
      title?: string;
      description?: string;
      category?: string;
      status?: string;
      tags?: string[];
      file_metadata?: any;
      created_at?: string;
      updated_at?: string;
    };
  }>;
}

// Error classes
export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class ValidationError extends StorageError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class UploadError extends StorageError {
  constructor(message: string, details?: any) {
    super(message, 'UPLOAD_ERROR', details);
    this.name = 'UploadError';
  }
}

export class DownloadError extends StorageError {
  constructor(message: string, details?: any) {
    super(message, 'DOWNLOAD_ERROR', details);
    this.name = 'DownloadError';
  }
}

/**
 * Enhanced Gallery Storage Service Class
 */
export class EnhancedGalleryStorageService {
  private bucket: string;
  private basePath: string;
  private thumbnailsPath: string;

  constructor(bucket: string = STORAGE_BUCKET, basePath: string = MOMENTS_PATH) {
    this.bucket = bucket;
    this.basePath = basePath;
    this.thumbnailsPath = `${basePath}/${THUMBNAILS_PATH}`;
  }

  // ==================== VALIDATION ====================

  /**
   * Validate file before upload with enhanced checks
   */
  validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      errors.push(`File type ${file.type} is not supported. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
    }

    // Check if it's actually an image
    if (!file.type.startsWith('image/')) {
      errors.push('File is not an image');
    }

    // Check for suspicious file names
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      errors.push('File name contains invalid characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate unique storage path for file
   */
  generateStoragePath(file: File, userId: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').replace(/_{2,}/g, '_');

    return `${this.basePath}/${userId}/${timestamp}-${randomString}-${sanitizedFileName}`;
  }

  /**
   * Generate thumbnail path
   */
  generateThumbnailPath(originalPath: string): string {
    const filename = originalPath.split('/').pop();
    const nameWithoutExt = filename?.split('.').slice(0, -1).join('.');
    return `${this.thumbnailsPath}/${nameWithoutExt}_thumb.jpg`;
  }

  // ==================== IMAGE PROCESSING ====================

  /**
   * Optimize image using browser Canvas API
   */
  private async optimizeImage(file: File, quality: number = COMPRESSION_QUALITY): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          // Calculate new dimensions
          let { width, height } = img;
          const ratio = Math.min(OPTIMIZED_MAX_WIDTH / width, OPTIMIZED_MAX_HEIGHT / height, 1);

          width = Math.round(width * ratio);
          height = Math.round(height * ratio);

          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not create canvas context'));
            return;
          }

          // Draw and optimize
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to optimized format (WebP if supported, otherwise JPEG)
          const outputFormat = 'image/webp';
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            outputFormat,
            quality
          );
        };

        img.onerror = () => reject(new Error('Image loading failed'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate thumbnail from file
   */
  private async generateThumbnailFromImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          // Calculate square crop
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;

          const canvas = document.createElement('canvas');
          canvas.width = THUMBNAIL_WIDTH;
          canvas.height = THUMBNAIL_HEIGHT;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not create canvas context'));
            return;
          }

          // Draw thumbnail with square crop
          ctx.drawImage(
            img,
            sx, sy, size, size, // Source
            0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT // Destination
          );

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Thumbnail generation failed'));
              }
            },
            'image/jpeg',
            0.85
          );
        };

        img.onerror = () => reject(new Error('Image loading failed'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get image dimensions
   */
  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => reject(new Error('Could not get image dimensions'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  }

  // ==================== UPLOAD OPERATIONS ====================

  /**
   * Upload single file with validation, optimization, and thumbnail generation
   */
  async uploadFile(
    file: File,
    userId: string,
    options: UploadOptions = {}
  ): Promise<{
    path: string;
    url: string;
    metadata: StorageMetadata;
    thumbnailUrl?: string;
    thumbnailPath?: string;
  }> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new ValidationError('File validation failed', validation.errors);
      }

      // Get original dimensions
      const originalDimensions = await this.getImageDimensions(file);

      // Generate storage path
      const storagePath = this.generateStoragePath(file, userId);

      // Notify progress
      if (options.onProgress) options.onProgress(10);

      let uploadFile: File | Blob = file;
      let optimized = false;

      // Optimize if requested
      if (options.optimize) {
        try {
          const quality = options.compressionQuality || COMPRESSION_QUALITY;
          uploadFile = await this.optimizeImage(file, quality);
          optimized = true;
        } catch (optError) {
          console.warn('Optimization failed, using original:', optError);
        }
      }

      // Upload main file
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from(this.bucket)
        .upload(storagePath, uploadFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: uploadFile.type
        });

      if (uploadError) {
        throw new UploadError(`Upload failed: ${uploadError.message}`, uploadError);
      }

      if (options.onProgress) options.onProgress(50);

      // Get public URL
      const { data: urlData } = supabaseClient.storage
        .from(this.bucket)
        .getPublicUrl(uploadData.path);

      // Generate thumbnail if requested
      let thumbnailUrl: string | undefined;
      let thumbnailPath: string | undefined;
      let thumbnailGenerated = false;

      if (options.generateThumbnail) {
        try {
          const thumbnailBlob = await this.generateThumbnailFromImage(file);
          const thumbPath = this.generateThumbnailPath(storagePath);

          const { error: thumbError } = await supabaseClient.storage
            .from(this.bucket)
            .upload(thumbPath, thumbnailBlob, {
              cacheControl: '3600',
              upsert: true,
              contentType: 'image/jpeg'
            });

          if (!thumbError) {
            const { data: thumbUrlData } = supabaseClient.storage
              .from(this.bucket)
              .getPublicUrl(thumbPath);

            thumbnailUrl = thumbUrlData.publicUrl;
            thumbnailPath = thumbPath;
            thumbnailGenerated = true;
          }
        } catch (thumbError) {
          console.warn('Thumbnail generation failed:', thumbError);
        }
      }

      if (options.onProgress) options.onProgress(100);

      // Create metadata
      const metadata: StorageMetadata = {
        size: uploadFile.size,
        width: originalDimensions.width,
        height: originalDimensions.height,
        mime_type: uploadFile.type,
        format: file.name.split('.').pop() || 'unknown',
        created_at: new Date().toISOString(),
        uploaded_by: userId,
        optimized,
        thumbnail_generated: thumbnailGenerated
      };

      // Log operation
      await this.logOperation('upload', storagePath, metadata, true);

      return {
        path: uploadData.path,
        url: urlData.publicUrl,
        metadata,
        thumbnailUrl,
        thumbnailPath
      };

    } catch (error) {
      await this.logOperation('upload', '', null, false, error);
      throw error;
    }
  }

  /**
   * Upload multiple files with progress tracking
   */
  async uploadMultipleFiles(
    files: File[],
    userId: string,
    options: UploadOptions = {}
  ): Promise<Array<{
    path: string;
    url: string;
    metadata: StorageMetadata;
    thumbnailUrl?: string;
    thumbnailPath?: string;
    fileName: string;
    success: boolean;
    error?: string;
  }>> {
    const results: Array<{
      path: string;
      url: string;
      metadata: StorageMetadata;
      thumbnailUrl?: string;
      thumbnailPath?: string;
      fileName: string;
      success: boolean;
      error?: string;
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.uploadFile(file, userId, {
          ...options,
          onProgress: (progress) => {
            if (options.onProgress) {
              const totalProgress = ((i + progress / 100) / files.length) * 100;
              options.onProgress(totalProgress);
            }
          }
        });
        results.push({
          ...result,
          fileName: file.name,
          success: true
        });
      } catch (error) {
        results.push({
          path: '',
          url: '',
          metadata: {} as StorageMetadata,
          fileName: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  // ==================== RETRIEVAL OPERATIONS ====================

  /**
   * Get paginated gallery items with enhanced filtering
   */
  async getGalleryItems(
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<GalleryImage>> {
    const {
      page = 1,
      limit = 20,
      category,
      status = 'published',
      searchQuery
    } = options;

    const offset = (page - 1) * limit;

    try {
      // Call the database function for paginated results
      const { data, error } = await supabaseClient.rpc('get_gallery_items_paginated', {
        p_limit: limit,
        p_offset: offset,
        p_category: category || null,
        p_status: status || null,
        p_search_query: searchQuery || null
      });

      if (error) {
        throw new DownloadError(`Failed to fetch gallery items: ${error.message}`, error);
      }

      if (!data || data.length === 0) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          totalPages: 0
        };
      }

      // Transform database result to GalleryImage type
      const galleryItems: GalleryImage[] = data.map((item: any) => ({
        id: item.id,
        title: item.title || '',
        description: item.description || null,
        image_url: item.storage_public_url || item.image_url || '',
        thumbnail_url: item.thumbnail_url || null,
        category: item.category || 'general',
        status: item.status || 'published',
        tags: item.tags || [],
        display_order: item.display_order || 0,
        event_id: item.event_id || null,
        partner_id: item.partner_id || null,
        metadata: item.file_metadata || {},
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        storage_path: item.storage_path || null
      }));

      const total = data[0]?.total_count || 0;
      const totalPages = Math.ceil(total / limit);

      // Log operation
      await this.logOperation('list', `${this.basePath}`, null, true, null, {
        page,
        limit,
        total,
        category,
        status
      });

      return {
        data: galleryItems,
        total,
        page,
        limit,
        totalPages
      };

    } catch (error) {
      await this.logOperation('list', `${this.basePath}`, null, false, error);
      throw error;
    }
  }

  /**
   * Get single gallery item by ID
   */
  async getGalleryItem(id: string): Promise<GalleryImage | null> {
    try {
      const { data, error } = await supabaseClient
        .from('gallery_items_enhanced')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new DownloadError(`Failed to fetch gallery item: ${error.message}`, error);
      }

      if (!data) return null;

      const item: GalleryImage = {
        id: data.id,
        title: data.title || '',
        description: data.description || null,
        image_url: data.storage_public_url || data.image_url || '',
        thumbnail_url: data.thumbnail_url || null,
        category: data.category || 'general',
        status: data.status || 'published',
        tags: data.tags || [],
        display_order: data.display_order || 0,
        event_id: data.event_id || null,
        partner_id: data.partner_id || null,
        metadata: data.file_metadata || {},
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        storage_path: data.storage_path || null
      };

      await this.logOperation('download', data.storage_path, null, true);

      return item;

    } catch (error) {
      await this.logOperation('download', '', null, false, error);
      throw error;
    }
  }

  /**
   * Get storage usage statistics with enhanced monitoring
   */
  async getStorageStats(): Promise<StorageStats> {
    try {
      const { data, error } = await supabaseClient.rpc('get_storage_usage_stats');

      if (error) {
        throw new Error(`Failed to get storage stats: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          totalFiles: 0,
          totalSize: 0,
          byCategory: {},
          byStatus: {},
          recentUploads: 0,
          bucketSize: 0,
          lastUpdated: new Date().toISOString()
        };
      }

      // Get bucket size from storage.objects
      const { data: bucketData, error: bucketError } = await supabaseClient
        .from('storage.objects')
        .select('metadata')
        .eq('bucket_id', this.bucket)
        .like('name', `${this.basePath}%`);

      let bucketSize = 0;
      if (!bucketError && bucketData) {
        bucketSize = bucketData.reduce((sum, obj) => sum + (obj.metadata?.size || 0), 0);
      }

      const stats = data[0];

      return {
        totalFiles: stats.total_files || 0,
        totalSize: stats.total_size || 0,
        byCategory: stats.by_category || {},
        byStatus: stats.by_status || {},
        recentUploads: stats.recent_uploads || 0,
        bucketSize,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Failed to get storage stats:', error);
      throw error;
    }
  }

  // ==================== UPDATE OPERATIONS ====================

  /**
   * Update gallery item with new file
   */
  async updateGalleryItem(
    itemId: string,
    updates: {
      title?: string;
      description?: string;
      category?: string;
      tags?: string[];
      display_order?: number;
      newFile?: File;
      userId?: string;
    }
  ): Promise<GalleryImage> {
    try {
      const { newFile, userId, ...dbUpdates } = updates;
      let storagePath: string | null = null;
      let fileMetadata: StorageMetadata | null = null;
      let thumbnailPath: string | null = null;

      // If new file provided, upload it
      if (newFile && userId) {
        const uploadResult = await this.uploadFile(newFile, userId, {
          optimize: true,
          generateThumbnail: true
        });
        storagePath = uploadResult.path;
        fileMetadata = uploadResult.metadata;
        thumbnailPath = uploadResult.thumbnailPath || null;

        // Get old storage path for cleanup
        const currentItem = await this.getGalleryItem(itemId);
        if (currentItem?.storage_path) {
          await this.deleteStorageFile(currentItem.storage_path);
          // Also delete old thumbnail if exists
          if (currentItem.thumbnail_url) {
            const oldThumbPath = this.extractPathFromUrl(currentItem.thumbnail_url);
            if (oldThumbPath) {
              await this.deleteStorageFile(oldThumbPath);
            }
          }
        }
      }

      // Update database record
      const updateData: any = { ...dbUpdates };
      if (storagePath) {
        updateData.storage_path = storagePath;
        updateData.file_metadata = fileMetadata;
        updateData.thumbnail_url = thumbnailPath ?
          this.getFileUrl(thumbnailPath) : null;
        updateData.image_url = ''; // Clear old URL, use storage path
      }

      const { data, error } = await supabaseClient
        .from('gallery_items')
        .update(updateData)
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update gallery item: ${error.message}`);
      }

      // Log operation
      await this.logOperation('update', storagePath || '', fileMetadata, true);

      // Return updated item
      return await this.getGalleryItem(itemId) as GalleryImage;

    } catch (error) {
      await this.logOperation('update', '', null, false, error);
      throw error;
    }
  }

  // ==================== DELETE OPERATIONS ====================

  /**
   * Delete single gallery item and its storage files
   */
  async deleteGalleryItem(itemId: string): Promise<void> {
    try {
      // Get item to find storage paths
      const item = await this.getGalleryItem(itemId);
      if (!item) {
        throw new Error('Gallery item not found');
      }

      // Delete storage files if they exist
      const storagePath = item.storage_path || undefined;
      const thumbnailUrl = item.thumbnail_url;

      if (storagePath) {
        await this.deleteStorageFile(storagePath);
      }

      if (thumbnailUrl) {
        const thumbPath = this.extractPathFromUrl(thumbnailUrl);
        if (thumbPath) {
          await this.deleteStorageFile(thumbPath);
        }
      }

      // Delete database record
      const { error } = await supabaseClient
        .from('gallery_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        throw new Error(`Failed to delete gallery item: ${error.message}`);
      }

      // Log operation
      await this.logOperation('delete', storagePath || '', null, true);

    } catch (error) {
      await this.logOperation('delete', '', null, false, error);
      throw error;
    }
  }

  /**
   * Delete multiple gallery items
   */
  async deleteMultipleGalleryItems(itemIds: string[]): Promise<Array<{ id: string; success: boolean; error?: string }>> {
    const results: Array<{ id: string; success: boolean; error?: string }> = [];

    for (const itemId of itemIds) {
      try {
        await this.deleteGalleryItem(itemId);
        results.push({ id: itemId, success: true });
      } catch (error) {
        results.push({
          id: itemId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Delete storage file directly
   */
  async deleteStorageFile(storagePath: string): Promise<void> {
    try {
      const { error } = await supabaseClient.storage
        .from(this.bucket)
        .remove([storagePath]);

      if (error) {
        throw new Error(`Failed to delete storage file: ${error.message}`);
      }

      await this.logOperation('delete', storagePath, null, true);

    } catch (error) {
      await this.logOperation('delete', storagePath, null, false, error);
      throw error;
    }
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Bulk upload with progress tracking
   */
  async bulkUpload(
    files: File[],
    userId: string,
    options: UploadOptions = {}
  ): Promise<{
    success: number;
    failed: number;
    results: Array<{
      fileName: string;
      success: boolean;
      path?: string;
      url?: string;
      error?: string;
    }>;
  }> {
    const results: Array<{
      fileName: string;
      success: boolean;
      path?: string;
      url?: string;
      error?: string;
    }> = [];
    let success = 0;
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.uploadFile(file, userId, {
          ...options,
          onProgress: (progress) => {
            if (options.onProgress) {
              const totalProgress = ((i + progress / 100) / files.length) * 100;
              options.onProgress(totalProgress);
            }
          }
        });

        results.push({
          fileName: file.name,
          success: true,
          path: result.path,
          url: result.url
        });
        success++;
      } catch (error) {
        results.push({
          fileName: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failed++;
      }
    }

    return { success, failed, results };
  }

  /**
   * Bulk delete with cleanup
   */
  async bulkDelete(itemIds: string[]): Promise<{
    success: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
  }> {
    const results = await this.deleteMultipleGalleryItems(itemIds);
    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const errors = results.filter(r => !r.success).map(r => ({ id: r.id, error: r.error || 'Unknown error' }));

    return { success, failed, errors };
  }

  // ==================== STORAGE MANAGEMENT ====================

  /**
   * Check storage consistency with enhanced reporting
   */
  async checkConsistency(): Promise<StorageConsistencyIssue[]> {
    try {
      const { data, error } = await supabaseClient.rpc('check_gallery_storage_consistency');

      if (error) {
        throw new Error(`Failed to check consistency: ${error.message}`);
      }

      return data || [];

    } catch (error) {
      console.error('Consistency check failed:', error);
      return [];
    }
  }

  /**
   * Find orphaned storage files
   */
  async findOrphanedFiles(): Promise<string[]> {
    try {
      const { data: allFiles, error: listError } = await supabaseClient.storage
        .from(this.bucket)
        .list(this.basePath, {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError) {
        throw new Error(`Failed to list files: ${listError.message}`);
      }

      const { data: galleryItems, error: itemsError } = await supabaseClient
        .from('gallery_items')
        .select('storage_path')
        .not('storage_path', 'is', null);

      if (itemsError) {
        throw new Error(`Failed to get gallery items: ${itemsError.message}`);
      }

      const referencedPaths = new Set(galleryItems.map(item => item.storage_path));
      const orphaned: string[] = [];

      for (const file of allFiles) {
        const fullPath = `${this.basePath}/${file.name}`;
        if (!referencedPaths.has(fullPath)) {
          orphaned.push(fullPath);
        }
      }

      return orphaned;

    } catch (error) {
      console.error('Orphaned file check failed:', error);
      return [];
    }
  }

  /**
   * Clean up orphaned files
   */
  async cleanupOrphanedFiles(): Promise<{
    attempted: number;
    deleted: number;
    errors: string[];
  }> {
    const orphaned = await this.findOrphanedFiles();
    const errors: string[] = [];
    let deleted = 0;

    for (const path of orphaned) {
      try {
        await this.deleteStorageFile(path);
        deleted++;
      } catch (error) {
        errors.push(`Failed to delete ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      attempted: orphaned.length,
      deleted,
      errors
    };
  }

  /**
   * Create backup information (metadata only)
   */
  async createBackup(): Promise<BackupInfo> {
    try {
      // Get all gallery items with storage info
      const { data: items, error } = await supabaseClient
        .from('gallery_items_enhanced')
        .select('*')
        .not('storage_path', 'is', null);

      if (error) {
        throw new Error(`Failed to get items for backup: ${error.message}`);
      }

      const backupItems = items.map((item: any) => ({
        id: item.id,
        storage_path: item.storage_path,
        metadata: {
          title: item.title,
          description: item.description,
          category: item.category,
          status: item.status,
          tags: item.tags,
          file_metadata: item.file_metadata,
          created_at: item.created_at,
          updated_at: item.updated_at
        }
      }));

      return {
        timestamp: new Date().toISOString(),
        fileCount: backupItems.length,
        totalSize: backupItems.reduce((sum, item) =>
          sum + (item.metadata.file_metadata?.size || 0), 0
        ),
        items: backupItems
      };

    } catch (error) {
      console.error('Backup creation failed:', error);
      throw error;
    }
  }

  /**
   * Restore from backup (metadata restoration)
   */
  async restoreFromBackup(backup: BackupInfo): Promise<{
    restored: number;
    failed: number;
    errors: string[];
  }> {
    let restored = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of backup.items) {
      try {
        // Check if file exists in storage
        const exists = await this.fileExists(item.storage_path);
        if (!exists) {
          errors.push(`File not found in storage: ${item.storage_path}`);
          failed++;
          continue;
        }

        // Check if item already exists
        const existing = await supabaseClient
          .from('gallery_items')
          .select('id')
          .eq('storage_path', item.storage_path)
          .single();

        if (existing.data) {
          // Update existing
          const { error } = await supabaseClient
            .from('gallery_items')
            .update({
              title: item.metadata.title,
              description: item.metadata.description,
              category: item.metadata.category,
              status: item.metadata.status,
              tags: item.metadata.tags,
              file_metadata: item.metadata.file_metadata
            })
            .eq('id', existing.data.id);

          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabaseClient
            .from('gallery_items')
            .insert({
              title: item.metadata.title,
              description: item.metadata.description,
              category: item.metadata.category,
              status: item.metadata.status,
              tags: item.metadata.tags,
              storage_path: item.storage_path,
              file_metadata: item.metadata.file_metadata,
              image_url: this.getFileUrl(item.storage_path)
            });

          if (error) throw error;
        }

        restored++;
      } catch (error) {
        errors.push(`Failed to restore ${item.storage_path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failed++;
      }
    }

    return { restored, failed, errors };
  }

  // ==================== MONITORING & ANALYTICS ====================

  /**
   * Get detailed storage analytics
   */
  async getStorageAnalytics(): Promise<{
    totalSize: number;
    fileCount: number;
    averageFileSize: number;
    largestFile: { path: string; size: number };
    oldestFile: { path: string; created: string };
    byExtension: Record<string, number>;
    byDay: Record<string, number>;
  }> {
    try {
      const { data: items, error } = await supabaseClient
        .from('gallery_items_enhanced')
        .select('storage_path, file_metadata, created_at')
        .not('storage_path', 'is', null);

      if (error) {
        throw new Error(`Failed to get analytics: ${error.message}`);
      }

      const analytics = {
        totalSize: 0,
        fileCount: items.length,
        averageFileSize: 0,
        largestFile: { path: '', size: 0 },
        oldestFile: { path: '', created: '' },
        byExtension: {} as Record<string, number>,
        byDay: {} as Record<string, number>
      };

      items.forEach((item: any) => {
        const size = item.file_metadata?.size || 0;
        analytics.totalSize += size;

        // Largest file
        if (size > analytics.largestFile.size) {
          analytics.largestFile = { path: item.storage_path, size };
        }

        // Oldest file
        if (!analytics.oldestFile.created || item.created_at < analytics.oldestFile.created) {
          analytics.oldestFile = { path: item.storage_path, created: item.created_at };
        }

        // By extension
        const ext = item.storage_path?.split('.').pop() || 'unknown';
        analytics.byExtension[ext] = (analytics.byExtension[ext] || 0) + 1;

        // By day
        const day = item.created_at?.split('T')[0] || 'unknown';
        analytics.byDay[day] = (analytics.byDay[day] || 0) + 1;
      });

      analytics.averageFileSize = analytics.fileCount > 0 ? analytics.totalSize / analytics.fileCount : 0;

      return analytics;

    } catch (error) {
      console.error('Analytics fetch failed:', error);
      throw error;
    }
  }

  /**
   * Get storage health status
   */
  async getStorageHealth(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check consistency
      const consistencyIssues = await this.checkConsistency();
      if (consistencyIssues.length > 0) {
        issues.push(`${consistencyIssues.length} consistency issues found`);
        recommendations.push('Run consistency check and cleanup');
      }

      // Check orphaned files
      const orphaned = await this.findOrphanedFiles();
      if (orphaned.length > 0) {
        issues.push(`${orphaned.length} orphaned files found`);
        recommendations.push('Run cleanup to remove orphaned files');
      }

      // Get stats for usage analysis
      const stats = await this.getStorageStats();

      // Check if approaching limits (example: > 80% of expected capacity)
      const expectedCapacity = 100 * 1024 * 1024 * 1024; // 100GB example
      if (stats.bucketSize > expectedCapacity * 0.8) {
        issues.push('Storage usage approaching capacity');
        recommendations.push('Consider expanding storage or archiving old files');
      }

      // Check recent uploads
      if (stats.recentUploads === 0) {
        recommendations.push('No recent uploads - verify upload functionality');
      }

      const status = issues.length === 0 ? 'healthy' : (issues.length <= 2 ? 'warning' : 'error');

      return { status, issues, recommendations };

    } catch (error) {
      return {
        status: 'error',
        issues: ['Failed to check storage health'],
        recommendations: ['Check Supabase connection and permissions']
      };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get file metadata
   */
  private async getFileMetadata(path: string, file: File): Promise<StorageMetadata> {
    // Get file info from storage
    const { data: fileInfo, error } = await supabaseClient.storage
      .from(this.bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        limit: 1,
        offset: 0,
        search: path.split('/').pop()
      });

    // Create metadata object
    const metadata: StorageMetadata = {
      size: file.size,
      width: 0, // Would need image processing library to get actual dimensions
      height: 0,
      mime_type: file.type,
      format: file.name.split('.').pop() || 'unknown',
      created_at: new Date().toISOString(),
      uploaded_by: 'user' // Would get from auth context
    };

    return metadata;
  }

  /**
   * Extract storage path from URL
   */
  private extractPathFromUrl(url: string): string | null {
    const prefix = `storage/v1/object/public/${this.bucket}/`;
    const index = url.indexOf(prefix);
    if (index === -1) return null;
    return url.substring(index + prefix.length);
  }

  /**
   * Log storage operation
   */
  private async logOperation(
    action: string,
    filePath: string,
    metadata: StorageMetadata | null,
    success: boolean,
    error?: any,
    extraData?: Record<string, any>
  ): Promise<void> {
    try {
      // Call database function to log operation
      await supabaseClient.rpc('log_storage_operation', {
        p_action: action,
        p_bucket_name: this.bucket,
        p_file_path: filePath,
        p_file_size: metadata?.size || null,
        p_mime_type: metadata?.mime_type || null,
        p_metadata: {
          ...metadata,
          ...extraData
        } as any,
        p_success: success,
        p_error_message: error ? (error instanceof Error ? error.message : String(error)) : null
      });
    } catch (logError) {
      // Log errors don't throw
      console.warn('Failed to log storage operation:', logError);
    }
  }

  /**
   * Get file URL
   */
  getFileUrl(path: string): string {
    const { data } = supabaseClient.storage
      .from(this.bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Check if file exists
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseClient.storage
        .from(this.bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          limit: 1,
          offset: 0,
          search: path.split('/').pop()
        });

      if (error) return false;
      return data && data.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get file info from storage
   */
  async getFileInfo(path: string): Promise<any | null> {
    try {
      const { data, error } = await supabaseClient.storage
        .from(this.bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          limit: 1,
          offset: 0,
          search: path.split('/').pop()
        });

      if (error || !data || data.length === 0) return null;
      return data[0];
    } catch {
      return null;
    }
  }
}

// Create default instance
export const enhancedGalleryStorageService = new EnhancedGalleryStorageService();

// ==================== BACKEND API ENDPOINTS ====================

/**
 * Enhanced API endpoints for gallery storage operations
 * These would be deployed as serverless functions
 */

/**
 * POST /api/gallery/upload
 * Upload single or multiple files with optimization
 */
export const galleryUploadEndpoint = async (request: Request): Promise<Response> => {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const userId = formData.get('userId') as string;
    const optimize = formData.get('optimize') === 'true';
    const generateThumbnail = formData.get('generateThumbnail') === 'true';

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: 'No files provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const results = await enhancedGalleryStorageService.uploadMultipleFiles(files, userId, {
      optimize,
      generateThumbnail
    });

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Upload failed',
      details: error
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * GET /api/gallery/items
 * Get paginated gallery items with caching headers
 */
export const galleryGetEndpoint = async (request: Request): Promise<Response> => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const category = url.searchParams.get('category') || undefined;
    const status = url.searchParams.get('status') || 'published';
    const searchQuery = url.searchParams.get('search') || undefined;

    const result = await enhancedGalleryStorageService.getGalleryItems({
      page,
      limit,
      category,
      status,
      searchQuery
    });

    // Add caching headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'X-Total-Count': result.total.toString(),
      'X-Total-Pages': result.totalPages.toString()
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to fetch items',
      details: error
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * DELETE /api/gallery/items/:id
 * Delete gallery item
 */
export const galleryDeleteEndpoint = async (request: Request, itemId: string): Promise<Response> => {
  try {
    await enhancedGalleryStorageService.deleteGalleryItem(itemId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Delete failed',
      details: error
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * GET /api/gallery/stats
 * Get storage statistics with analytics
 */
export const galleryStatsEndpoint = async (): Promise<Response> => {
  try {
    const [stats, analytics, health] = await Promise.all([
      enhancedGalleryStorageService.getStorageStats(),
      enhancedGalleryStorageService.getStorageAnalytics(),
      enhancedGalleryStorageService.getStorageHealth()
    ]);

    return new Response(JSON.stringify({
      stats,
      analytics,
      health,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to get stats',
      details: error
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * GET /api/gallery/consistency
 * Check storage consistency
 */
export const galleryConsistencyEndpoint = async (): Promise<Response> => {
  try {
    const issues = await enhancedGalleryStorageService.checkConsistency();

    return new Response(JSON.stringify({ issues, count: issues.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Consistency check failed',
      details: error
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * POST /api/gallery/cleanup
 * Cleanup orphaned files
 */
export const galleryCleanupEndpoint = async (): Promise<Response> => {
  try {
    const result = await enhancedGalleryStorageService.cleanupOrphanedFiles();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Cleanup failed',
      details: error
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * GET /api/gallery/backup
 * Create backup metadata
 */
export const galleryBackupEndpoint = async (): Promise<Response> => {
  try {
    const backup = await enhancedGalleryStorageService.createBackup();

    return new Response(JSON.stringify(backup), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="gallery-backup-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Backup creation failed',
      details: error
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

/**
 * POST /api/gallery/restore
 * Restore from backup
 */
export const galleryRestoreEndpoint = async (request: Request): Promise<Response> => {
  try {
    const backup = await request.json();
    const result = await enhancedGalleryStorageService.restoreFromBackup(backup);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Restore failed',
      details: error
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};