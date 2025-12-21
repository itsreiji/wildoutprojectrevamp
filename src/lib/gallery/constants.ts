/**
 * Gallery Constants and Configuration
 */

// Storage Configuration
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'wildout-images',
  MOMENTS_PATH: 'moments',
  PUBLIC_URL_BASE: 'https://qhimllczaejftnuymrsr.supabase.co/storage/v1/object/public/wildout-images/',

  // File limits
  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20MB
  MAX_TOTAL_SIZE: 500 * 1024 * 1024, // 500MB per user

  // Allowed types
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ],

  // Optimization settings
  THUMBNAIL_WIDTH: 300,
  THUMBNAIL_HEIGHT: 300,
  COMPRESSION_QUALITY: 0.8,

  // Caching
  CACHE_DURATION: 1000 * 60 * 5, // 5 minutes
  STATS_CACHE_DURATION: 1000 * 60 * 10, // 10 minutes

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// File validation messages
export const VALIDATION_MESSAGES = {
  FILE_TOO_LARGE: (maxSize: number) =>
    `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,

  INVALID_TYPE: (allowedTypes: string[]) =>
    `File type not supported. Allowed: ${allowedTypes.join(', ')}`,

  NOT_AN_IMAGE: 'File is not an image',

  UPLOAD_FAILED: 'Upload failed',

  DELETE_FAILED: 'Delete failed',

  CONSISTENCY_ISSUES: (count: number) =>
    `Found ${count} consistency issues`,
};

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  DOWNLOAD_ERROR: 'DOWNLOAD_ERROR',
  DELETE_ERROR: 'DELETE_ERROR',
  CONSISTENCY_ERROR: 'CONSISTENCY_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
};

// Storage operation types
export const STORAGE_OPERATIONS = {
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  DELETE: 'delete',
  UPDATE: 'update',
  LIST: 'list',
  COPY: 'copy',
  MOVE: 'move',
} as const;

// Gallery categories
export const GALLERY_CATEGORIES = {
  EVENT: 'event',
  PARTNER: 'partner',
  TEAM: 'team',
  GENERAL: 'general',
} as const;

// File size limits
export const FILE_SIZE_LIMITS = {
  SINGLE: 20 * 1024 * 1024, // 20MB
  BATCH: 100 * 1024 * 1024, // 100MB
  TOTAL_QUOTA: 500 * 1024 * 1024, // 500MB
  MAX_FILES: 10, // Max files per batch
} as const;

// Supported formats
export const SUPPORTED_FORMATS = {
  IMAGE: {
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    WEBP: 'image/webp',
    GIF: 'image/gif',
    SVG: 'image/svg+xml',
  },
  EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'],
} as const;

// Image optimization settings
export const IMAGE_OPTIMIZATION = {
  LOW: { quality: 60, width: 800, height: 800 },
  MEDIUM: { quality: 80, width: 1200, height: 1200 },
  HIGH: { quality: 90, width: 2000, height: 2000 },
} as const;

// Gallery audit actions
export const GALLERY_AUDIT_ACTIONS = {
  UPLOAD: 'upload',
  BATCH_UPLOAD: 'batch_upload',
  DELETE: 'delete',
  UPDATE: 'update',
  RESTORE: 'restore',
  DOWNLOAD: 'download',
  BULK_DELETE: 'bulk_delete',
} as const;

// Backup intervals
export const BACKUP_INTERVALS = {
  DAILY: 24, // hours
  WEEKLY: 168, // hours (7 days)
  MONTHLY: 720, // hours (30 days)
} as const;

// Sort options
export const SORT_OPTIONS = {
  CREATED_AT: 'created_at',
  TITLE: 'title',
  DISPLAY_ORDER: 'display_order',
  FILE_SIZE: 'file_size',
} as const;

// Sort directions
export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [12, 24, 48, 96],
} as const;

// Gallery statuses
export const GALLERY_STATUSES = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
} as const;

// Processing statuses
export const PROCESSING_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
  DELETED: 'deleted',
} as const;

// Consistency issue types
export const CONSISTENCY_ISSUES = {
  MISSING_FILE: 'missing_file',
  ORPHANED_FILE: 'orphaned_file',
  PROCESSING_FAILED: 'processing_failed',
  CORRUPTED_METADATA: 'corrupted_metadata',
} as const;

// Cache keys
export const CACHE_KEYS = {
  GALLERY: 'gallery',
  STATS: 'gallery-stats',
  CONSISTENCY: 'gallery-consistency',
  ITEM: 'gallery-item',
  UPLOAD_QUEUE: 'gallery-upload-queue',
} as const;

// API endpoints (for reference)
export const API_ENDPOINTS = {
  UPLOAD: '/api/gallery/upload',
  ITEMS: '/api/gallery/items',
  ITEM: (id: string) => `/api/gallery/items/${id}`,
  STATS: '/api/gallery/stats',
  CONSISTENCY: '/api/gallery/consistency',
  BULK_DELETE: '/api/gallery/bulk-delete',
  CLEANUP: '/api/gallery/cleanup',
} as const;

// File naming patterns
export const FILE_PATTERNS = {
  // Format: moments/{userId}/{timestamp}-{random}-{filename}
  MOMENTS_PATH: (userId: string, fileName: string) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const sanitized = fileName.replace(/[^a-zA-Z0-9.]/g, '_').replace(/_{2,}/g, '_');
    return `${STORAGE_CONFIG.MOMENTS_PATH}/${userId}/${timestamp}-${random}-${sanitized}`;
  },

  // Thumbnail path
  THUMBNAIL_PATH: (originalPath: string) => {
    return originalPath.replace(/(\.[^.]+)$/, '_thumb$1');
  },
};

// Storage metadata fields
export const METADATA_FIELDS = {
  SIZE: 'size',
  WIDTH: 'width',
  HEIGHT: 'height',
  MIME_TYPE: 'mime_type',
  FORMAT: 'format',
  CREATED_AT: 'created_at',
  UPLOADED_BY: 'uploaded_by',
  CHECKSUM: 'checksum',
  OPTIMIZED: 'optimized',
  THUMBNAIL_GENERATED: 'thumbnail_generated',
} as const;

// Progress thresholds
export const PROGRESS_THRESHOLDS = {
  VALIDATION: 10,
  UPLOAD_START: 20,
  UPLOAD_PROGRESS: 70,
  OPTIMIZATION: 80,
  THUMBNAIL: 90,
  COMPLETE: 100,
};

// Default metadata template
export const DEFAULT_METADATA = {
  width: 0,
  height: 0,
  size: 0,
  mime_type: '',
  format: '',
  created_at: new Date().toISOString(),
  uploaded_by: '',
  optimized: false,
  thumbnail_generated: false,
};

// Storage monitoring intervals
export const MONITORING_INTERVALS = {
  STATS_REFRESH: 1000 * 60 * 5, // 5 minutes
  CONSISTENCY_CHECK: 1000 * 60 * 30, // 30 minutes
  UPLOAD_QUEUE_CHECK: 1000 * 5, // 5 seconds
};

// Batch operation limits
export const BATCH_LIMITS = {
  UPLOAD: 10, // Max files per batch upload
  DELETE: 20, // Max items per batch delete
  PROCESSING: 5, // Max concurrent processing operations
};

// UI display constants
export const UI_DISPLAY = {
  GRID_COLS: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 3,
    WIDE: 4,
  },

  IMAGE_SIZES: {
    THUMBNAIL: 300,
    MEDIUM: 600,
    LARGE: 1200,
  },

  TOAST_DURATION: {
    SUCCESS: 3000,
    ERROR: 5000,
    WARNING: 4000,
    INFO: 2000,
  },
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// File type formatting
export const formatFileType = (mimeType: string): string => {
  return mimeType.split('/')[1]?.toUpperCase() || 'UNKNOWN';
};

// Date formatting for gallery items
export const formatGalleryDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Validation helper
export const validateGalleryItem = (item: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!item.title || item.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!item.image_url && !item.storage_path) {
    errors.push('Image URL or storage path is required');
  }

  if (item.category && !Object.values(GALLERY_CATEGORIES).includes(item.category)) {
    errors.push(`Invalid category: ${item.category}`);
  }

  if (item.status && !Object.values(GALLERY_STATUSES).includes(item.status)) {
    errors.push(`Invalid status: ${item.status}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Error message helper
export const getErrorMessage = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  return 'Unknown error occurred';
};

// Retry helper with exponential backoff
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Progress calculation helper
export const calculateProgress = (
  current: number,
  total: number,
  stage: number,
  totalStages: number
): number => {
  const stageProgress = (current / total) * (100 / totalStages);
  const previousStagesProgress = (stage / totalStages) * 100;
  return Math.min(100, Math.round(previousStagesProgress + stageProgress));
};

// Memory usage helper
export const getMemoryUsage = () => {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: formatFileSize(memory.usedJSHeapSize),
      totalJSHeapSize: formatFileSize(memory.totalJSHeapSize),
      jsHeapSizeLimit: formatFileSize(memory.jsHeapSizeLimit),
    };
  }
  return null;
};

// Export everything
export default {
  STORAGE_CONFIG,
  VALIDATION_MESSAGES,
  ERROR_CODES,
  STORAGE_OPERATIONS,
  GALLERY_CATEGORIES,
  GALLERY_STATUSES,
  PROCESSING_STATUSES,
  CONSISTENCY_ISSUES,
  CACHE_KEYS,
  API_ENDPOINTS,
  FILE_PATTERNS,
  METADATA_FIELDS,
  PROGRESS_THRESHOLDS,
  DEFAULT_METADATA,
  MONITORING_INTERVALS,
  BATCH_LIMITS,
  UI_DISPLAY,
  formatFileSize,
  formatFileType,
  formatGalleryDate,
  validateGalleryItem,
  getErrorMessage,
  withRetry,
  calculateProgress,
  getMemoryUsage,
};