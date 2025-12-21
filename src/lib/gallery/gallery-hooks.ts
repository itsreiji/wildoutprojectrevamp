/**
 * Gallery React Hooks
 * 
 * Provides React hooks for gallery operations with caching, 
 * optimistic updates, and error handling.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { 
  GalleryStorageService, 
  type PaginationOptions,
  type StorageStats,
  type StorageConsistencyIssue 
} from './storage-service';
import type { GalleryImage } from '@/types/content';
import { useAuth } from '@/contexts/AuthContext';

// Service instance
const storageService = new GalleryStorageService();

// Cache keys
const CACHE_KEYS = {
  gallery: (params: PaginationOptions) => ['gallery', params] as const,
  stats: ['gallery-stats'] as const,
  consistency: ['gallery-consistency'] as const,
  item: (id: string) => ['gallery-item', id] as const,
};

// ==================== HOOKS ====================

/**
 * Hook for fetching paginated gallery items with caching
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
 * Hook for storage statistics
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

// ==================== MUTATIONS ====================

/**
 * Hook for uploading files
 */
export function useUploadGallery() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (files: File[]) => {
      if (!user) throw new Error('Authentication required');
      
      const results = await storageService.uploadMultipleFiles(files, user.id, {
        optimize: true,
        generateThumbnail: true,
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
 * Hook for bulk operations
 */
export function useBulkGalleryOperations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const bulkUpload = useMutation({
    mutationFn: async (files: File[]) => {
      if (!user) throw new Error('Authentication required');
      return await storageService.bulkUpload(files, user.id);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });
      
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

  return { cleanupOrphaned };
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
    error?: string;
  }>>([]);

  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setCurrentFile('');
    setResults([]);
  }, []);

  const trackUpload = useCallback(async (files: File[], userId: string) => {
    setIsUploading(true);
    setResults([]);
    
    try {
      const uploadResults = await storageService.uploadMultipleFiles(files, userId, {
        onProgress: (p) => setProgress(p),
      });
      
      setResults(uploadResults);
      return uploadResults;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { progress, isUploading, currentFile, results, trackUpload, reset };
}

/**
 * Hook for pagination state management
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

  const optimisticUpload = useCallback(async (files: File[]) => {
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
      metadata: { size: file.size, name: file.name },
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
    const results = await storageService.uploadMultipleFiles(files, user.id);

    // Update cache with real data
    queryClient.invalidateQueries({ queryKey: ['gallery'] });
    queryClient.invalidateQueries({ queryKey: ['gallery-stats'] });

    return results;
  }, [user, queryClient]);

  return { optimisticUpload };
}

// ==================== PRE-BUILT COMPONENTS ====================

/**
 * Hook for gallery management with all features
 */
export function useGalleryManager() {
  const pagination = useGalleryPagination();
  const galleryQuery = useGalleryItems(pagination.params);
  const statsQuery = useStorageStats();
  const consistencyQuery = useConsistencyCheck();
  
  const uploadMutation = useUploadGallery();
  const deleteMutation = useDeleteGallery();
  const bulkOps = useBulkGalleryOperations();
  const storageMgmt = useStorageManagement();
  const optimistic = useOptimisticGallery();

  const refresh = useCallback(() => {
    galleryQuery.refetch();
    statsQuery.refetch();
  }, [galleryQuery, statsQuery]);

  return {
    // Data
    items: galleryQuery.data?.data || [],
    pagination: galleryQuery.pagination,
    stats: statsQuery.data,
    consistencyIssues: consistencyQuery.data || [],
    
    // State
    isLoading: galleryQuery.isLoading || statsQuery.isLoading,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isChecking: consistencyQuery.isFetching,
    
    // Actions
    upload: uploadMutation.mutate,
    delete: deleteMutation.mutate,
    bulkUpload: bulkOps.bulkUpload.mutate,
    bulkDelete: bulkOps.bulkDelete.mutate,
    cleanup: storageMgmt.cleanupOrphaned.mutate,
    checkConsistency: consistencyQuery.refetch,
    optimisticUpload: optimistic.optimisticUpload,
    refresh,
    
    // Pagination
    setPage: pagination.setPage,
    setLimit: pagination.setLimit,
    setFilters: pagination.setFilters,
    
    // Errors
    error: galleryQuery.error || statsQuery.error,
  };
}