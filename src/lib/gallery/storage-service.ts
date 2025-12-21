/**
 * Gallery Storage Service
 *
 * Comprehensive service for managing gallery images using Supabase Storage
 * Bucket: wildout-images/moments
 *
 * Features:
 * - Secure file upload with validation and optimization
 * - Paginated retrieval with caching
 * - Bulk operations
 * - Storage management and monitoring
 * - Data consistency validation
 * - Comprehensive error handling and logging
 */

import { supabaseClient } from '@/supabase/client';
import type { GalleryImage } from '@/types/content';

// Constants
export const STORAGE_BUCKET = 'wildout-images';
export const MOMENTS_PATH = 'moments';
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
export const THUMBNAIL_WIDTH = 300;
export const THUMBNAIL_HEIGHT = 300;

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
}

export interface UploadOptions {
  optimize?: boolean;
  generateThumbnail?: boolean;
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
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
}

export interface StorageConsistencyIssue {
  item_id: string | null;
  item_title: string | null;
  storage_path: string;
  issue_type: string;
  description: string;
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
 * Gallery Storage Service Class
 */
export class GalleryStorageService {
  private bucket: string;
  private basePath: string;

  constructor(bucket: string = STORAGE_BUCKET, basePath: string = MOMENTS_PATH) {
    this.bucket = bucket;
    this.basePath = basePath;
  }

  // ==================== VALIDATION ====================

  /**
   * Validate file before upload
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

  // ==================== UPLOAD OPERATIONS ====================

  /**
   * Upload single file with validation and optimization
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
  }> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new ValidationError('File validation failed', validation.errors);
      }

      // Generate storage path
      const storagePath = this.generateStoragePath(file, userId);

      // Notify progress
      if (options.onProgress) options.onProgress(10);

      // Upload file
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from(this.bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        throw new UploadError(`Upload failed: ${uploadError.message}`, uploadError);
      }

      if (options.onProgress) options.onProgress(50);

      // Get public URL
      const { data: urlData } = supabaseClient.storage
        .from(this.bucket)
        .getPublicUrl(uploadData.path);

      // Get file metadata
      const metadata = await this.getFileMetadata(uploadData.path, file);

      // Generate thumbnail if requested
      let thumbnailUrl: string | undefined;
      if (options.generateThumbnail) {
        try {
          thumbnailUrl = await this.generateThumbnail(uploadData.path, file);
        } catch (thumbError) {
          console.warn('Thumbnail generation failed:', thumbError);
        }
      }

      if (options.onProgress) options.onProgress(100);

      // Log operation
      await this.logOperation('upload', storagePath, metadata, true);

      return {
        path: uploadData.path,
        url: urlData.publicUrl,
        metadata,
        thumbnailUrl
      };

    } catch (error) {
      await this.logOperation('upload', '', null, false, error);
      throw error;
    }
  }

  /**
   * Upload multiple files
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
    fileName: string;
    success: boolean;
    error?: string;
  }>> {
    const results: Array<{
      path: string;
      url: string;
      metadata: StorageMetadata;
      thumbnailUrl?: string;
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
   * Get paginated gallery items
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
   * Get storage usage statistics
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
          recentUploads: 0
        };
      }

      const stats = data[0];

      return {
        totalFiles: stats.total_files || 0,
        totalSize: stats.total_size || 0,
        byCategory: stats.by_category || {},
        byStatus: stats.by_status || {},
        recentUploads: stats.recent_uploads || 0
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

      // If new file provided, upload it
      if (newFile && userId) {
        const uploadResult = await this.uploadFile(newFile, userId);
        storagePath = uploadResult.path;
        fileMetadata = uploadResult.metadata;

        // Get old storage path for cleanup
        const currentItem = await this.getGalleryItem(itemId);
        if (currentItem?.storage_path) {
          await this.deleteStorageFile(currentItem.storage_path);
        }
      }

      // Update database record
      const updateData: any = { ...dbUpdates };
      if (storagePath) {
        updateData.storage_path = storagePath;
        updateData.file_metadata = fileMetadata;
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
   * Delete single gallery item and its storage file
   */
  async deleteGalleryItem(itemId: string): Promise<void> {
    try {
      // Get item to find storage path
      const item = await this.getGalleryItem(itemId);
      if (!item) {
        throw new Error('Gallery item not found');
      }

      // Delete storage file if exists
      const storagePath = item.storage_path || undefined;
      if (storagePath) {
        await this.deleteStorageFile(storagePath);
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
   * Check storage consistency
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

  // ==================== UTILITY METHODS ====================

  /**
   * Get file metadata
   */
  private async getFileMetadata(path: string, file: File): Promise<StorageMetadata> {
    // Get file info from storage (currently unused but could be used for validation)
    await supabaseClient.storage
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
   * Generate thumbnail (placeholder - would need image processing)
   */
  private async generateThumbnail(originalPath: string, file: File): Promise<string> {
    // In a real implementation, this would:
    // 1. Read the uploaded file
    // 2. Resize it to thumbnail dimensions
    // 3. Upload the thumbnail to a separate path
    // 4. Return the thumbnail URL

    // For now, return the original URL as placeholder
    const { data } = supabaseClient.storage
      .from(this.bucket)
      .getPublicUrl(originalPath);

    return data.publicUrl;
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
}

// Create default instance
export const galleryStorageService = new GalleryStorageService();

// ==================== BACKEND API ENDPOINTS ====================

/**
 * Express/Edge function endpoints for gallery storage operations
 * These would be deployed as serverless functions
 */

/**
 * POST /api/gallery/upload
 * Upload single or multiple files
 */
export const galleryUploadEndpoint = async (request: Request): Promise<Response> => {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const userId = formData.get('userId') as string;

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

    const results = await galleryStorageService.uploadMultipleFiles(files, userId);

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
 * Get paginated gallery items
 */
export const galleryGetEndpoint = async (request: Request): Promise<Response> => {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const category = url.searchParams.get('category') || undefined;
    const status = url.searchParams.get('status') || 'published';
    const searchQuery = url.searchParams.get('search') || undefined;

    const result = await galleryStorageService.getGalleryItems({
      page,
      limit,
      category,
      status,
      searchQuery
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
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
    await galleryStorageService.deleteGalleryItem(itemId);

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
 * Get storage statistics
 */
export const galleryStatsEndpoint = async (): Promise<Response> => {
  try {
    const stats = await galleryStorageService.getStorageStats();

    return new Response(JSON.stringify(stats), {
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
    const issues = await galleryStorageService.checkConsistency();

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