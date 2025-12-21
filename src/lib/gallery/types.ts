/**
 * Gallery Management System Types
 * Definisi tipe data untuk sistem manajemen galeri
 */

import type { Tables, TablesInsert, TablesUpdate } from '@/supabase/types';

// Tipe dasar galeri dari database
export type GalleryItemDB = Tables<'gallery_items'>;
export type GalleryItemInsert = TablesInsert<'gallery_items'>;
export type GalleryItemUpdate = TablesUpdate<'gallery_items'>;

// Tipe metadata galeri
export interface GalleryMetadata {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  author?: string;
  event_id?: string;
  partner_id?: string;
  display_order?: number;
  watermark?: boolean;
  watermark_position?: string;
  optimize?: boolean;
  original_filename?: string;
  file_size?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  color_profile?: string;
  [key: string]: any;
}

// Tipe item galeri yang diperluas
export interface GalleryItem extends GalleryItemDB {
  metadata_obj?: GalleryMetadata;
  thumbnail_url?: string;
  image_url?: string;
  file_name?: string;
  file_extension?: string;
  created_by_name?: string;
  updated_by_name?: string;
  partner_name?: string;
  event_title?: string;
}

// Tipe untuk upload batch
export interface BatchUploadItem {
  file: File;
  metadata: Partial<GalleryMetadata>;
  validation_errors?: string[];
  preview_url?: string;
}

export interface BatchUploadResult {
  success: boolean;
  item_id?: string;
  error?: string;
  original_file: string;
}

export interface BatchUploadSummary {
  total_files: number;
  successful: number;
  failed: number;
  results: BatchUploadResult[];
}

// Tipe untuk pencarian dan filter
export interface GalleryFilter {
  category?: string[];
  tags?: string[];
  status?: string[];
  search_query?: string;
  date_from?: string;
  date_to?: string;
  partner_id?: string;
  event_id?: string;
  created_by?: string;
}

export interface GallerySort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface GalleryPagination {
  page: number;
  limit: number;
  total?: number;
  total_pages?: number;
}

export interface GalleryQuery extends GalleryFilter, GallerySort, GalleryPagination {
  // Gabungan semua parameter query
}

// Tipe untuk permission
export interface GalleryPermission {
  can_view: boolean;
  can_upload: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_manage: boolean;
}

// Tipe untuk audit log
export interface GalleryAuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string;
  user_id: string | null;
  user_role: string | null;
  old_data: any | null;
  new_data: any | null;
  ip_address: any;
  user_agent: string | null;
  session_id: string | null;
  created_at: string | null;
}

// Tipe untuk versioning
export interface GalleryVersion {
  id: string;
  gallery_item_id: string;
  version: number;
  payload: any;
  created_by: string | null;
  created_at: string | null;
  is_active: boolean;
}

// Tipe untuk backup
export interface GalleryBackup {
  id: string;
  backup_type: 'daily' | 'weekly' | 'monthly';
  file_count: number;
  total_size: number;
  storage_path: string;
  created_by: string;
  created_at: string;
  status: 'pending' | 'completed' | 'failed';
}

// Tipe untuk optimasi gambar
export interface ImageOptimizationConfig {
  format: 'jpeg' | 'png' | 'webp';
  quality: number;
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill';
  watermark?: boolean;
  watermark_position?: string;
}

// Tipe untuk response API
export interface GalleryResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
  };
}

// Tipe untuk validasi file
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  info: {
    size: number;
    type: string;
    extension: string;
    name: string;
  };
}

// Tipe untuk watermark
export interface WatermarkConfig {
  text?: string;
  image?: string;
  position: string;
  opacity: number;
  size: number;
  color: string;
}

// Tipe untuk statistik galeri
export interface GalleryStats {
  total_items: number;
  total_size: number;
  by_category: Record<string, number>;
  by_status: Record<string, number>;
  recent_uploads: GalleryItem[];
  storage_used: number;
  storage_limit: number;
}

// Tipe untuk notifikasi
export interface GalleryNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string[];
  timestamp: string;
}

// Tipe untuk export data
export interface ExportFormat {
  format: 'json' | 'csv' | 'xml';
  include_metadata: boolean;
  include_images: boolean;
  compress: boolean;
}

// Tipe untuk import data
export interface ImportFormat {
  format: 'json' | 'csv';
  validate_only: boolean;
  overwrite_existing: boolean;
}

// Tipe untuk batch operations
export interface BatchOperation {
  operation: 'delete' | 'update' | 'export';
  items: string[];
  parameters?: any;
}

// Tipe untuk caching
export interface CacheConfig {
  key: string;
  ttl: number; // time to live in seconds
  tags: string[];
}

// Tipe untuk error handling
export interface GalleryError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Tipe untuk user session dalam galeri
export interface GalleryUserSession {
  user_id: string;
  role: string;
  permissions: GalleryPermission;
  session_id: string;
  last_activity: string;
}

// Tipe untuk storage quota
export interface StorageQuota {
  used: number;
  limit: number;
  percentage: number;
  available: number;
}

// Tipe untuk event tracking
export interface GalleryAnalytics {
  item_id: string;
  views: number;
  downloads: number;
  last_accessed: string;
  access_count: number;
  unique_users: number;
}

// Tipe untuk integrasi dengan event system
export interface GalleryEventIntegration {
  event_id: string;
  gallery_items: string[];
  sync_status: 'synced' | 'pending' | 'failed';
  last_sync: string;
}

// Tipe untuk partner integration
export interface GalleryPartnerIntegration {
  partner_id: string;
  gallery_items: string[];
  branding_config: any;
  sync_status: 'synced' | 'pending' | 'failed';
}

// Tipe untuk system health
export interface SystemHealth {
  database: 'healthy' | 'degraded' | 'down';
  storage: 'healthy' | 'degraded' | 'down';
  backup: 'healthy' | 'degraded' | 'down';
  last_check: string;
  issues: string[];
}

// Tipe untuk maintenance operations
export interface MaintenanceTask {
  id: string;
  type: 'cleanup' | 'optimize' | 'backup' | 'restore';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  started_at: string;
  completed_at?: string;
  result?: any;
}

// Tipe untuk API configuration
export interface GalleryAPIConfig {
  base_url: string;
  endpoints: {
    upload: string;
    list: string;
    detail: string;
    delete: string;
    update: string;
    batch: string;
    search: string;
    stats: string;
    backup: string;
    audit: string;
  };
  timeout: number;
  retry_count: number;
}

// Tipe untuk UI configuration
export interface GalleryUIConfig {
  grid_columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  thumbnail_size: {
    width: number;
    height: number;
  };
  max_preview_size: number;
  show_metadata: boolean;
  show_actions: boolean;
  allow_bulk_actions: boolean;
}

// Tipe untuk error codes
export const GalleryErrorCodes = {
  INVALID_FORMAT: 'GALLERY_001',
  FILE_TOO_LARGE: 'GALLERY_002',
  QUOTA_EXCEEDED: 'GALLERY_003',
  PERMISSION_DENIED: 'GALLERY_004',
  INVALID_METADATA: 'GALLERY_005',
  UPLOAD_FAILED: 'GALLERY_006',
  DELETE_FAILED: 'GALLERY_007',
  UPDATE_FAILED: 'GALLERY_008',
  BATCH_FAILED: 'GALLERY_009',
  VALIDATION_FAILED: 'GALLERY_010',
  OPTIMIZATION_FAILED: 'GALLERY_011',
  WATERMARK_FAILED: 'GALLERY_012',
  BACKUP_FAILED: 'GALLERY_013',
  RESTORE_FAILED: 'GALLERY_014',
  VERSION_CONFLICT: 'GALLERY_015',
  STORAGE_ERROR: 'GALLERY_016',
  DATABASE_ERROR: 'GALLERY_017',
  NETWORK_ERROR: 'GALLERY_018',
  AUTH_ERROR: 'GALLERY_019',
  RATE_LIMIT: 'GALLERY_020',
} as const;