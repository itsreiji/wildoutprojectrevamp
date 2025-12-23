/**
 * Supabase Gallery Context
 *
 * Comprehensive gallery management context that integrates with Supabase Storage
 * Provides all gallery operations with proper authentication, error handling, and logging
 */

import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import type { GalleryImage } from "@/types/content";
import type { TablesInsert, TablesUpdate } from "@/supabase/types";
import { useAuth } from "./AuthContext";
import { supabaseClient } from "@/supabase/client";
import {
  validateItemAccess,
  getCurrentUserPermissions,
  validateBatchOperation,
} from "@/lib/gallery/permissions";

// Import enhanced storage service
import {
  EnhancedGalleryStorageService,
  type StorageStats,
  type StorageConsistencyIssue,
  type BackupInfo,
  type UploadOptions,
  type PaginatedResult
} from "@/lib/gallery/enhanced-storage-service";

// Import enhanced hooks
import {
  useEnhancedGalleryManager
} from "@/lib/gallery/enhanced-hooks";

// Context type
interface SupabaseGalleryContextType {
  // Data
  gallery: GalleryImage[];
  paginatedGallery: PaginatedResult<GalleryImage>;
  stats: StorageStats | null;
  analytics: any | null;
  health: any | null;
  consistencyIssues: StorageConsistencyIssue[];
  orphanedFiles: string[];
  backup: BackupInfo | null;

  // State
  loading: boolean;
  isUploading: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  isChecking: boolean;
  error: string | null;

  // Core operations
  uploadGalleryFiles: (files: File[], options?: UploadOptions) => Promise<Array<{
    path: string;
    url: string;
    metadata: any;
    thumbnailUrl?: string;
    thumbnailPath?: string;
    fileName: string;
    success: boolean;
    error?: string;
  }>>;

  addGalleryImage: (item: TablesInsert<"gallery_items">) => Promise<GalleryImage>;
  updateGalleryImage: (
    id: string,
    updates: TablesUpdate<"gallery_items">
  ) => Promise<GalleryImage>;
  deleteGalleryImage: (id: string) => Promise<void>;

  // Pagination & filtering
  getGalleryItemsPaginated: (page?: number, limit?: number, filters?: any) => Promise<PaginatedResult<GalleryImage>>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: any) => void;

  // Storage management
  getStorageStats: () => Promise<StorageStats>;
  getStorageAnalytics: () => Promise<any>;
  getStorageHealth: () => Promise<any>;
  checkStorageConsistency: () => Promise<StorageConsistencyIssue[]>;
  findOrphanedFiles: () => Promise<string[]>;
  cleanupOrphanedFiles: () => Promise<{
    attempted: number;
    deleted: number;
    errors: string[];
  }>;

  // Backup & recovery
  createBackup: () => Promise<BackupInfo>;
  restoreFromBackup: (backup: BackupInfo) => Promise<{
    restored: number;
    failed: number;
    errors: string[];
  }>;

  // Bulk operations
  bulkUpload: (files: File[]) => Promise<{
    success: number;
    failed: number;
    results: Array<{
      fileName: string;
      success: boolean;
      path?: string;
      url?: string;
      error?: string;
    }>;
  }>;
  bulkDelete: (itemIds: string[]) => Promise<{
    success: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
  }>;

  // Utility
  refreshGallery: () => Promise<void>;
  getFileUrl: (path: string) => string;
  fileExists: (path: string) => Promise<boolean>;

  // Real-time monitoring
  monitoring: {
    health: any;
    stats: StorageStats | null;
    alerts: Array<{ type: 'error' | 'warning' | 'info'; message: string }>;
    isLoading: boolean;
    refetch: () => void;
  };
}

const SupabaseGalleryContext = createContext<SupabaseGalleryContextType | undefined>(undefined);

export const SupabaseGalleryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const authContext = useAuth();
  const user = authContext.user;

  // Service instance
  const storageService = new EnhancedGalleryStorageService();

  // Use enhanced manager hooks
  const galleryManager = useEnhancedGalleryManager();

  // Local state for backward compatibility
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [paginatedGallery, setPaginatedGallery] = useState<PaginatedResult<GalleryImage>>({
    data: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [health, setHealth] = useState<any | null>(null);
  const [consistencyIssues, setConsistencyIssues] = useState<StorageConsistencyIssue[]>([]);
  const [orphanedFiles, setOrphanedFiles] = useState<string[]>([]);
  const [backup, setBackup] = useState<BackupInfo | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadGalleryData();
    }
  }, [user]);

  const loadGalleryData = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);

      // Load paginated gallery (first page)
      const result = await storageService.getGalleryItems({ page: 1, limit: 20, status: 'published' });
      setPaginatedGallery(result);
      setGallery(result.data);

      // Load stats
      const statsData = await storageService.getStorageStats();
      setStats(statsData);

      // Load analytics
      const analyticsData = await storageService.getStorageAnalytics();
      setAnalytics(analyticsData);

      // Load health
      const healthData = await storageService.getStorageHealth();
      setHealth(healthData);

    } catch (err) {
      console.error("Error loading gallery data:", err);
      setError("Failed to load gallery data");
      toast.error("Failed to load gallery data");
    }
  }, [user]);

  const refreshGallery = useCallback(async () => {
    await loadGalleryData();
  }, [loadGalleryData]);

  // Core operations
  const uploadGalleryFiles = useCallback(async (files: File[], options?: UploadOptions) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const results = await storageService.uploadMultipleFiles(files, user.id, {
        optimize: true,
        generateThumbnail: true,
        ...options,
      });

      // Refresh data after successful uploads
      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        await refreshGallery();
        toast.success(`Successfully uploaded ${successCount} files`);
      }

      const failCount = results.filter(r => !r.success).length;
      if (failCount > 0) {
        toast.error(`${failCount} files failed to upload`);
      }

      return results;
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
      throw err;
    }
  }, [user, storageService]);

  const addGalleryImage = useCallback(async (item: TablesInsert<"gallery_items">): Promise<GalleryImage> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Permission check
      const permissions = await getCurrentUserPermissions();
      if (!permissions.can_upload) {
        throw new Error("Permission denied: Cannot upload images");
      }

      // If item has a storage_path, ensure the file exists
      if (item.storage_path) {
        const exists = await storageService.fileExists(item.storage_path);
        if (!exists) {
          throw new Error(`Storage file not found: ${item.storage_path}`);
        }

        // Update image_url to use storage URL if not provided
        if (!item.image_url) {
          item.image_url = storageService.getFileUrl(item.storage_path);
        }
      }

      const { data, error } = await supabaseClient
        .from("gallery_items")
        .insert(item)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to add gallery image: ${error.message}`);
      }

      if (data) {
        const newImage: GalleryImage = {
          id: data.id || "",
          title: data.title || "",
          description: data.description ?? null,
          image_url: data.storage_path
            ? storageService.getFileUrl(data.storage_path)
            : (data.image_url || ""),
          thumbnail_url: data.thumbnail_url || null,
          category: data.category || "",
          status: data.status || "published",
          tags: data.tags || [],
          display_order: data.display_order ?? null,
          event_id: data.event_id ?? null,
          partner_id: data.partner_id ?? null,
          metadata: data.file_metadata || data.metadata || {},
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        };

        setGallery((prev) => [...prev, newImage]);
        toast.success("Gallery item added successfully");
        return newImage;
      }
      throw new Error("No data returned from insert operation");
    } catch (err) {
      console.error("Error in addGalleryImage:", err);
      toast.error("Failed to add gallery item");
      throw err;
    }
  }, [user, storageService]);

  const updateGalleryImage = useCallback(async (
    id: string,
    updates: TablesUpdate<"gallery_items">
  ): Promise<GalleryImage> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Permission check
      const validation = await validateItemAccess(id, user.id, 'can_edit');
      if (!validation.allowed) {
        throw new Error(`Permission denied: ${validation.reason || 'Cannot edit this item'}`);
      }

      // Handle storage path updates
      if (updates.storage_path) {
        const exists = await storageService.fileExists(updates.storage_path);
        if (!exists) {
          throw new Error(`Storage file not found: ${updates.storage_path}`);
        }

        // Update image_url to use storage URL
        if (!updates.image_url) {
          updates.image_url = storageService.getFileUrl(updates.storage_path);
        }
      }

      const { data, error } = await supabaseClient
        .from("gallery_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update gallery item: ${error.message}`);
      }

      if (data) {
        const updatedImage: GalleryImage = {
          id: data.id || "",
          title: data.title || "",
          description: data.description ?? null,
          image_url: data.storage_path
            ? storageService.getFileUrl(data.storage_path)
            : (data.image_url || ""),
          thumbnail_url: data.thumbnail_url || null,
          category: data.category || "",
          status: data.status || "published",
          tags: data.tags || [],
          display_order: data.display_order ?? null,
          event_id: data.event_id ?? null,
          partner_id: data.partner_id ?? null,
          metadata: data.file_metadata || data.metadata || {},
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        };

        setGallery((prev) =>
          prev.map((image) => image.id === id ? updatedImage : image)
        );

        toast.success("Gallery item updated successfully");
        return updatedImage;
      }
      throw new Error("No data returned from update operation");
    } catch (err) {
      console.error("Error in updateGalleryImage:", err);
      toast.error("Failed to update gallery item");
      throw err;
    }
  }, [user, storageService]);

  const deleteGalleryImage = useCallback(async (id: string): Promise<void> => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Permission check
      const validation = await validateItemAccess(id, user.id, 'can_delete');
      if (!validation.allowed) {
        throw new Error(`Permission denied: ${validation.reason || 'Cannot delete this item'}`);
      }

      const itemToDelete = gallery.find((item) => item.id === id);

      // Get storage path from storage_path property
      const storagePath = itemToDelete?.storage_path || undefined;
      const thumbnailUrl = itemToDelete?.thumbnail_url;

      // Delete from database first
      const { error } = await supabaseClient
        .from("gallery_items")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Failed to delete gallery item: ${error.message}`);
      }

      // Delete from storage if path exists
      if (storagePath) {
        try {
          await storageService.deleteStorageFile(storagePath);
        } catch (storageError) {
          console.warn("Failed to delete storage file:", storageError);
        }
      }

      // Delete thumbnail if exists
      if (thumbnailUrl) {
        const thumbPath = thumbnailUrl.split('/storage/v1/object/public/')[1];
        if (thumbPath) {
          try {
            await storageService.deleteStorageFile(thumbPath);
          } catch (thumbError) {
            console.warn("Failed to delete thumbnail:", thumbError);
          }
        }
      }

      setGallery((prev) => prev.filter((image) => image.id !== id));
      toast.success("Item deleted successfully");
    } catch (err) {
      console.error("Error in deleteGalleryImage:", err);
      toast.error("Failed to delete gallery item");
      throw err;
    }
  }, [user, gallery, storageService]);

  // Pagination & filtering
  const getGalleryItemsPaginated = useCallback(async (page = 1, limit = 20, filters?: any) => {
    try {
      const result = await storageService.getGalleryItems({
        page,
        limit,
        ...filters
      });
      setPaginatedGallery(result);
      return result;
    } catch (err) {
      console.error("Error fetching paginated items:", err);
      throw err;
    }
  }, [storageService]);

  const setPage = useCallback((page: number) => {
    galleryManager.setPage(page);
  }, [galleryManager]);

  const setLimit = useCallback((limit: number) => {
    galleryManager.setLimit(limit);
  }, [galleryManager]);

  const setFilters = useCallback((filters: any) => {
    galleryManager.setFilters(filters);
  }, [galleryManager]);

  // Storage management
  const getStorageStats = useCallback(async (): Promise<StorageStats> => {
    try {
      const statsData = await storageService.getStorageStats();
      setStats(statsData);
      return statsData;
    } catch (err) {
      console.error("Error getting storage stats:", err);
      throw err;
    }
  }, [storageService]);

  const getStorageAnalytics = useCallback(async () => {
    try {
      const analyticsData = await storageService.getStorageAnalytics();
      setAnalytics(analyticsData);
      return analyticsData;
    } catch (err) {
      console.error("Error getting storage analytics:", err);
      throw err;
    }
  }, [storageService]);

  const getStorageHealth = useCallback(async () => {
    try {
      const healthData = await storageService.getStorageHealth();
      setHealth(healthData);
      return healthData;
    } catch (err) {
      console.error("Error getting storage health:", err);
      throw err;
    }
  }, [storageService]);

  const checkStorageConsistency = useCallback(async (): Promise<StorageConsistencyIssue[]> => {
    try {
      const issues = await storageService.checkConsistency();
      setConsistencyIssues(issues);

      if (issues.length === 0) {
        toast.success("No consistency issues found");
      } else {
        toast.warning(`Found ${issues.length} consistency issues`);
      }

      return issues;
    } catch (err) {
      toast.error("Consistency check failed");
      throw err;
    }
  }, [storageService]);

  const findOrphanedFiles = useCallback(async (): Promise<string[]> => {
    try {
      const files = await storageService.findOrphanedFiles();
      setOrphanedFiles(files);
      return files;
    } catch (err) {
      console.error("Error finding orphaned files:", err);
      throw err;
    }
  }, [storageService]);

  const cleanupOrphanedFiles = useCallback(async () => {
    try {
      const result = await storageService.cleanupOrphanedFiles();

      if (result.deleted > 0) {
        toast.success(`Cleaned up ${result.deleted} orphaned files`);
        await refreshGallery();
      } else {
        toast.info("No orphaned files found");
      }

      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} cleanup errors occurred`);
      }

      return result;
    } catch (err) {
      toast.error("Cleanup failed");
      throw err;
    }
  }, [storageService, refreshGallery]);

  // Backup & recovery
  const createBackup = useCallback(async (): Promise<BackupInfo> => {
    try {
      const backupData = await storageService.createBackup();
      setBackup(backupData);
      toast.success("Backup metadata created successfully");
      return backupData;
    } catch (err) {
      toast.error("Backup creation failed");
      throw err;
    }
  }, [storageService]);

  const restoreFromBackup = useCallback(async (backup: BackupInfo) => {
    try {
      const result = await storageService.restoreFromBackup(backup);

      if (result.restored > 0) {
        toast.success(`Restored ${result.restored} items`);
        await refreshGallery();
      }

      if (result.failed > 0) {
        toast.error(`${result.failed} items failed to restore`);
      }

      return result;
    } catch (err) {
      toast.error("Restore failed");
      throw err;
    }
  }, [storageService, refreshGallery]);

  // Bulk operations
  const bulkUpload = useCallback(async (files: File[]) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      const permissions = await getCurrentUserPermissions();
      if (!permissions.can_upload) {
        throw new Error("Permission denied: Cannot upload images");
      }

      const result = await storageService.bulkUpload(files, user.id, {
        optimize: true,
        generateThumbnail: true,
      });

      if (result.success > 0) {
        toast.success(`Uploaded ${result.success} files`);
        await refreshGallery();
      }

      if (result.failed > 0) {
        toast.error(`${result.failed} files failed`);
      }

      return result;
    } catch (err) {
      toast.error("Bulk upload failed");
      throw err;
    }
  }, [user, storageService, refreshGallery]);

  const bulkDelete = useCallback(async (itemIds: string[]) => {
    if (!user) throw new Error("User not authenticated");

    try {
      // Validate permissions for all items
      const validation = await validateBatchOperation(itemIds, user.id, 'can_delete');

      if (validation.invalidItems.length > 0) {
        toast.warning(`Skipping ${validation.invalidItems.length} items: Permission denied`);
      }

      if (validation.validItems.length === 0) {
        return {
          success: 0,
          failed: itemIds.length,
          errors: validation.invalidItems.map(i => ({ id: i.id, error: i.reason }))
        };
      }

      // Only delete valid items
      const result = await storageService.bulkDelete(validation.validItems);

      if (result.success > 0) {
        toast.success(`Deleted ${result.success} items`);
        await refreshGallery();
      }

      if (result.failed > 0) {
        toast.error(`${result.failed} items failed`);
      }

      return result;
    } catch (err) {
      toast.error("Bulk delete failed");
      throw err;
    }
  }, [user, storageService, refreshGallery]);

  // Utility
  const getFileUrl = useCallback((path: string): string => {
    return storageService.getFileUrl(path);
  }, [storageService]);

  const fileExists = useCallback(async (path: string): Promise<boolean> => {
    return await storageService.fileExists(path);
  }, [storageService]);

  // Monitoring
  const monitoring = galleryManager.monitoring;

  // Value for context provider
  const value: SupabaseGalleryContextType = {
    // Data
    gallery: galleryManager.items,
    paginatedGallery,
    stats,
    analytics,
    health,
    consistencyIssues,
    orphanedFiles,
    backup,

    // State
    loading: galleryManager.isLoading,
    isUploading: galleryManager.isUploading,
    isDeleting: galleryManager.isDeleting,
    isUpdating: galleryManager.isUpdating,
    isChecking: galleryManager.isChecking,
    error,

    // Core operations
    uploadGalleryFiles,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,

    // Pagination & filtering
    getGalleryItemsPaginated,
    setPage,
    setLimit,
    setFilters,

    // Storage management
    getStorageStats,
    getStorageAnalytics,
    getStorageHealth,
    checkStorageConsistency,
    findOrphanedFiles,
    cleanupOrphanedFiles,

    // Backup & recovery
    createBackup,
    restoreFromBackup,

    // Bulk operations
    bulkUpload,
    bulkDelete,

    // Utility
    refreshGallery,
    getFileUrl,
    fileExists,

    // Monitoring
    monitoring,
  };

  return (
    <SupabaseGalleryContext.Provider value={value}>
      {children}
    </SupabaseGalleryContext.Provider>
  );
};

export const useSupabaseGallery = () => {
  const context = useContext(SupabaseGalleryContext);
  if (!context) {
    throw new Error("useSupabaseGallery must be used within SupabaseGalleryProvider");
  }
  return context;
};