/**
 * Enhanced Gallery React Hooks
 *
 * Provides React hooks for gallery operations with advanced features:
 * - Caching and optimistic updates
 * - Real-time progress tracking
 * - Error handling with retry logic
 * - Pagination state management
 * - Bulk operations
 * - Storage monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import {
  EnhancedGalleryStorageService,
  type PaginationOptions,
  type BackupInfo,
  type UploadOptions
} from './enhanced-storage-service';
import type { GalleryImage } from '@/types/content';

// Service instance
const storageService = new EnhancedGalleryStorageService();

// Cache keys
const CACHE_KEYS = {
  gallery: (params: PaginationOptions) => ['gallery', params] as const,
  stats: ['gallery-stats'] as const,
  analytics: ['gallery-analytics'] as const,
  health: ['gallery-health'] as const,
  consistency: ['gallery-consistency'] as const,
  item: (id: string) => ['gallery-item', id] as const,
  orphaned: ['gallery-orphaned'] as const,
  backup: ['gallery-backup'] as const,
};

// ==================== HOOKS ====================

/**
 * Hook for fetching paginated gallery items with advanced caching
 */
export function useGalleryItems(params: PaginationOptions = {}) {
  const queryKey = CACHE_KEYS.gallery(params);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      return await storageService.getGalleryItems(params);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    meta: {
      persist: true, // Custom meta for persistence strategy
    }
  });

  return {
    ...query,
    galleryItems: query.data?.data || [],
    pagination: {
      page: params.page || 1,
      limit: params.limit || 20,
      total: query.data?.total || 0,
      totalPages: query.data?.totalPages || 0,
    },
  };
}

/**
 * Hook for fetching single gallery item
 */
export function useGalleryItem(id: string | null) {
  const query = useQuery({
    queryKey: CACHE_KEYS.item(id || ''),
    queryFn: async () => {
      if (!id) return null;
      return await storageService.getGalleryItem(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return query;
}

/**
 * Hook for storage statistics with enhanced monitoring
 */
export function useStorageStats() {
  const query = useQuery({
    queryKey: CACHE_KEYS.stats,
    queryFn: async () => {
      return await storageService.getStorageStats();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });

  return query;
}

/**
 * Hook for storage analytics
 */
export function useStorageAnalytics() {
  const query = useQuery({
    queryKey: CACHE_KEYS.analytics,
    queryFn: async () => {
      return await storageService.getStorageAnalytics();
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });

  return query;
}

/**
 * Hook for storage health monitoring
 */
export function useStorageHealth() {
  const query = useQuery({
    queryKey: CACHE_KEYS.health,
    queryFn: async () => {
      return await storageService.getStorageHealth();
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 3, // Refetch every 3 minutes
  });

  return query;
}

/**
 * Hook for consistency checking
 */
export function useConsistencyCheck() {
  const query = useQuery({
    queryKey: CACHE_KEYS.consistency,
    queryFn: async () => {
      return await storageService.checkConsistency();
    },
    staleTime: 1000 * 60 * 5,
    enabled: false, // Only run when manually triggered
  });

  return query;
}

/**
 * Hook for orphaned files detection
 */
export function useOrphanedFiles() {
  const query = useQuery({
    queryKey: CACHE_KEYS.orphaned,
    queryFn: async () => {
      return await storageService.findOrphanedFiles();
    },
    staleTime: 1000 * 60 * 5,
    enabled: false, // Only run when manually triggered
  });

  return query;
}

/**
 * Hook for backup operations
 */
export function useBackup() {
  const query = useQuery({
    queryKey: CACHE_KEYS.backup,
    queryFn: async () => {
      return await storageService.createBackup();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: false, // Only run when manually triggered
  });

  return query;
}

// ==================== MUTATIONS ====================

/**
 * Hook for uploading files with enhanced features
 */
export function useUploadGallery() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: { files: File[]; options?: UploadOptions }) => {
      if (!user) throw new Error('Authentication required');

      const results = await storageService.uploadMultipleFiles(params.files, user.id, {
        optimize: true,
        generateThumbnail: true,
        ...params.options,
      });

      const errors = results.filter(r => !r.success);
      if (errors.length > 0) {
        throw new Error(`${errors.length} files failed to upload`);
      }

      return results;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-analytics'] });
      toast.success('Upload completed successfully');
    },
    onError: (error) => {
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    },
  });
}

/**
 * Hook for deleting gallery items
 */
export function useDeleteGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      await storageService.deleteGalleryItem(itemId);
    },
    onSuccess: (_, itemId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: CACHE_KEYS.item(itemId) });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-analytics'] });
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      toast.error('Delete failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    },
  });
}

/**
 * Hook for updating gallery items
 */
export function useUpdateGallery() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      itemId: string;
      updates: {
        title?: string;
        description?: string;
        category?: string;
        tags?: string[];
        display_order?: number;
        newFile?: File;
      };
    }) => {
      if (!user) throw new Error('Authentication required');

      return await storageService.updateGalleryItem(params.itemId, {
        ...params.updates,
        userId: user.id,
      });
    },
    onSuccess: (updatedItem) => {
      // Update cache
      queryClient.setQueryData(
        CACHE_KEYS.item(updatedItem.id),
        updatedItem
      );
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });
      toast.success('Item updated successfully');
    },
    onError: (error) => {
      toast.error('Update failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    },
  });
}

/**
 * Hook for bulk operations
 */
export function useBulkGalleryOperations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const bulkUpload = useMutation({
    mutationFn: async (files: File[]) => {
      if (!user) throw new Error('Authentication required');
      return await storageService.bulkUpload(files, user.id, {
        optimize: true,
        generateThumbnail: true,
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-analytics'] });

      if (result.success > 0) {
        toast.success(`Uploaded ${result.success} files`);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} files failed`);
      }
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (itemIds: string[]) => {
      return await storageService.bulkDelete(itemIds);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-analytics'] });

      if (result.success > 0) {
        toast.success(`Deleted ${result.success} items`);
      }
      if (result.failed > 0) {
        toast.error(`${result.failed} items failed`);
      }
    },
  });

  return { bulkUpload, bulkDelete };
}

/**
 * Hook for storage management operations
 */
export function useStorageManagement() {
  const queryClient = useQueryClient();

  const cleanupOrphaned = useMutation({
    mutationFn: async () => {
      return await storageService.cleanupOrphanedFiles();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-analytics'] });
      queryClient.invalidateQueries({ queryKey: CACHE_KEYS.orphaned });

      if (result.deleted > 0) {
        toast.success(`Cleaned up ${result.deleted} orphaned files`);
      } else {
        toast.info('No orphaned files found');
      }

      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} cleanup errors`);
      }
    },
    onError: (error) => {
      toast.error('Cleanup failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    },
  });

  const checkConsistency = useMutation({
    mutationFn: async () => {
      return await storageService.checkConsistency();
    },
    onSuccess: (issues) => {
      if (issues.length === 0) {
        toast.success('No consistency issues found');
      } else {
        toast.warning(`Found ${issues.length} consistency issues`);
      }
    },
    onError: (error) => {
      toast.error('Consistency check failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    },
  });

  const createBackup = useMutation({
    mutationFn: async () => {
      return await storageService.createBackup();
    },
    onSuccess: () => {
      toast.success('Backup metadata created successfully');
    },
    onError: (error) => {
      toast.error('Backup creation failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    },
  });

  const restoreBackup = useMutation({
    mutationFn: async (backup: BackupInfo) => {
      return await storageService.restoreFromBackup(backup);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });

      toast.success(`Restored ${result.restored} items`);
      if (result.failed > 0) {
        toast.error(`${result.failed} items failed to restore`);
      }
    },
    onError: (error) => {
      toast.error('Restore failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    },
  });

  return { cleanupOrphaned, checkConsistency, createBackup, restoreBackup };
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook for real-time upload progress tracking
 */
export function useUploadProgress() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentFile, setCurrentFile] = useState('');
  const [results, setResults] = useState<Array<{
    fileName: string;
    success: boolean;
    url?: string;
    thumbnailUrl?: string;
    error?: string;
  }>>([]);
  const [optimized, setOptimized] = useState(false);
  const [thumbnailGenerated, setThumbnailGenerated] = useState(false);

  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setCurrentFile('');
    setResults([]);
    setOptimized(false);
    setThumbnailGenerated(false);
  }, []);

  const trackUpload = useCallback(async (files: File[], userId: string, options: UploadOptions = {}) => {
    setIsUploading(true);
    setResults([]);
    setOptimized(options.optimize || false);
    setThumbnailGenerated(options.generateThumbnail || false);

    try {
      const uploadResults = await storageService.uploadMultipleFiles(files, userId, {
        ...options,
        onProgress: (p) => setProgress(p),
      });

      setResults(uploadResults);
      return uploadResults;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    progress,
    isUploading,
    currentFile,
    results,
    trackUpload,
    reset,
    optimized,
    thumbnailGenerated
  };
}

/**
 * Hook for pagination state management with filters
 */
export function useGalleryPagination(defaultLimit = 20) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [filters, setFilters] = useState<{
    category?: string;
    status?: string;
    searchQuery?: string;
  }>({});

  const reset = useCallback(() => {
    setPage(1);
    setLimit(defaultLimit);
    setFilters({});
  }, [defaultLimit]);

  const updateFilters = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  return {
    page,
    limit,
    filters,
    setPage,
    setLimit,
    setFilters: updateFilters,
    reset,
    params: { page, limit, ...filters },
  };
}

/**
 * Hook for optimistic gallery updates
 */
export function useOptimisticGallery() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const optimisticUpload = useCallback(async (files: File[], options: UploadOptions = {}) => {
    if (!user) throw new Error('Authentication required');

    // Generate optimistic items
    const optimisticItems: GalleryImage[] = files.map(file => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      title: file.name,
      description: null,
      image_url: '', // Will be updated after upload
      thumbnail_url: null,
      category: 'general',
      status: 'published',
      tags: [],
      display_order: 0,
      event_id: null,
      partner_id: null,
      metadata: {
        size: file.size,
        name: file.name,
        processing_status: 'pending'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Update cache optimistically
    queryClient.setQueryData(
      CACHE_KEYS.gallery({ page: 1, limit: 20 }),
      (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: [...optimisticItems, ...oldData.data],
          total: oldData.total + optimisticItems.length,
        };
      }
    );

    // Perform actual upload
    const results = await storageService.uploadMultipleFiles(files, user.id, options);

    // Update cache with real data
    queryClient.invalidateQueries({ queryKey: ['gallery'] });
    queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });
    queryClient.invalidateQueries({ queryKey: ['gallery-analytics'] });

    return results;
  }, [user, queryClient]);

  return { optimisticUpload };
}

/**
 * Hook for storage health monitoring with alerts
 */
export function useStorageMonitoring() {
  const healthQuery = useStorageHealth();
  const statsQuery = useStorageStats();

  const alerts = useCallback(() => {
    const alerts: Array<{ type: 'error' | 'warning' | 'info'; message: string }> = [];

    if (healthQuery.data) {
      if (healthQuery.data.status === 'error') {
        alerts.push({ type: 'error', message: 'Storage health is critical' });
      } else if (healthQuery.data.status === 'warning') {
        alerts.push({ type: 'warning', message: 'Storage health needs attention' });
      }

      healthQuery.data.issues.forEach(issue => {
        alerts.push({ type: 'warning', message: issue });
      });
    }

    if (statsQuery.data) {
      // Example: Alert if storage is > 90% full (assuming 100GB capacity)
      const capacity = 100 * 1024 * 1024 * 1024;
      if (statsQuery.data.bucketSize > capacity * 0.9) {
        alerts.push({ type: 'error', message: 'Storage capacity > 90%' });
      }
    }

    return alerts;
  }, [healthQuery.data, statsQuery.data]);

  return {
    health: healthQuery.data,
    stats: statsQuery.data || null,
    alerts: alerts(),
    isLoading: healthQuery.isLoading || statsQuery.isLoading,
    refetch: () => {
      healthQuery.refetch();
      statsQuery.refetch();
    }
  };
}

// ==================== PRE-BUILT COMPONENTS ====================

/**
 * Hook for comprehensive gallery management with all features
 */
export function useEnhancedGalleryManager() {
  const pagination = useGalleryPagination();
  const galleryQuery = useGalleryItems(pagination.params);
  const statsQuery = useStorageStats();
  const analyticsQuery = useStorageAnalytics();
  const healthQuery = useStorageHealth();
  const consistencyQuery = useConsistencyCheck();
  const orphanedQuery = useOrphanedFiles();
  const backupQuery = useBackup();

  const uploadMutation = useUploadGallery();
  const deleteMutation = useDeleteGallery();
  const updateMutation = useUpdateGallery();
  const bulkOps = useBulkGalleryOperations();
  const storageMgmt = useStorageManagement();
  const optimistic = useOptimisticGallery();
  const monitoring = useStorageMonitoring();

  const refresh = useCallback(() => {
    galleryQuery.refetch();
    statsQuery.refetch();
    analyticsQuery.refetch();
    healthQuery.refetch();
  }, [galleryQuery, statsQuery, analyticsQuery, healthQuery]);

  const getConsistencyIssues = useCallback(async () => {
    const issues = await storageMgmt.checkConsistency.mutateAsync();
    return issues;
  }, [storageMgmt.checkConsistency]);

  const getOrphanedFiles = useCallback(async () => {
    const result = await storageMgmt.cleanupOrphaned.mutateAsync();
    return result.errors; // Return errors as expected by the caller
  }, [storageMgmt.cleanupOrphaned]);

  const createBackupAction = useCallback(async () => {
    const backup = await storageMgmt.createBackup.mutateAsync();
    return backup;
  }, [storageMgmt.createBackup]);

  return {
    // Data
    items: galleryQuery.data?.data || [],
    pagination: galleryQuery.pagination,
    stats: statsQuery.data,
    analytics: analyticsQuery.data,
    health: healthQuery.data,
    consistencyIssues: consistencyQuery.data || [],
    orphanedFiles: orphanedQuery.data || [],
    backup: backupQuery.data,

    // State
    isLoading: galleryQuery.isLoading || statsQuery.isLoading,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
    isChecking: consistencyQuery.isPending,
    isMonitoring: monitoring.isLoading,

    // Actions
    upload: uploadMutation.mutate,
    uploadAsync: uploadMutation.mutateAsync,
    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    bulkUpload: bulkOps.bulkUpload.mutate,
    bulkDelete: bulkOps.bulkDelete.mutate,
    cleanup: storageMgmt.cleanupOrphaned.mutate,
    checkConsistency: getConsistencyIssues,
    getOrphanedFiles,
    createBackup: createBackupAction,
    restoreBackup: storageMgmt.restoreBackup.mutate,
    optimisticUpload: optimistic.optimisticUpload,
    refresh,

    // Pagination
    setPage: pagination.setPage,
    setLimit: pagination.setLimit,
    setFilters: pagination.setFilters,

    // Monitoring
    monitoring,

    // Errors
    error: galleryQuery.error || statsQuery.error,
  };
}

/**
 * Hook for gallery management with real-time updates
 */
export function useRealtimeGalleryManager() {
  const manager = useEnhancedGalleryManager();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate real-time updates (in production, use Supabase Realtime)
  useEffect(() => {
    // Skip interval in non-browser environments
    if (typeof window === 'undefined') return;

    const interval = (globalThis as any).setInterval(() => {
      manager.refresh();
      setLastUpdate(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => (globalThis as any).clearInterval(interval);
  }, [manager]);

  return {
    ...manager,
    lastUpdate,
  };
}

/**
 * Hook for gallery management with validation
 */
export function useValidatedGalleryManager() {
  const manager = useEnhancedGalleryManager();
  const { user } = useAuth();

  const validateUpload = useCallback((files: File[]) => {
    const errors: string[] = [];

    if (!user) {
      errors.push('Authentication required');
    }

    files.forEach(file => {
      if (file.size > 20 * 1024 * 1024) {
        errors.push(`${file.name} exceeds 20MB limit`);
      }

      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }, [user]);

  const safeUpload = useCallback(async (files: File[], options?: UploadOptions) => {
    const validation = validateUpload(files);
    if (!validation.valid) {
      toast.error('Validation failed', {
        description: validation.errors.join(', ')
      });
      return null;
    }

    return await manager.uploadAsync({ files, options });
  }, [manager, validateUpload]);

  return {
    ...manager,
    validateUpload,
    safeUpload,
  };
}