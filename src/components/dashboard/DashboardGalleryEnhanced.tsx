/**
 * Enhanced Dashboard Gallery Component
 *
 * Updated version of DashboardGallery that integrates with the new
 * Supabase Storage-based gallery system while maintaining the existing UI/UX.
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Upload, Trash2, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useEnhancedStaticContent } from "@/contexts/EnhancedStaticContentContext";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { galleryStorageService } from "@/lib/gallery/storage-service";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import type { GalleryImage } from "@/types/content";
import type { TablesInsert, TablesUpdate } from "@/supabase/types";

interface UploadProgress {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  message?: string;
}

export function DashboardGalleryEnhanced() {
  const { user, role } = useAuth();
  const {
    gallery,
    loading,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    uploadGalleryFiles,
    getStorageStats,
    checkStorageConsistency,
    cleanupOrphanedFiles,
    refreshStaticContent,
    error: contextError,
  } = useEnhancedStaticContent();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [storageStats, setStorageStats] = useState<any>(null);
  const [showConsistencyCheck, setShowConsistencyCheck] = useState(false);
  const [consistencyIssues, setConsistencyIssues] = useState<any[]>([]);

  // Form state for manual add
  const [newItem, setNewItem] = useState<TablesInsert<"gallery_items">>({
    title: "",
    description: "",
    image_url: "",
    category: "general",
    status: "published",
    tags: [],
    display_order: 0,
  });
  const [manualStoragePath, setManualStoragePath] = useState("");

  // Load storage stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getStorageStats();
        setStorageStats(stats);
      } catch (err) {
        console.warn("Could not load storage stats:", err);
      }
    };
    loadStats();
  }, [getStorageStats]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);

      // Initialize progress tracking
      const progress: UploadProgress[] = files.map(file => ({
        fileName: file.name,
        progress: 0,
        status: "pending"
      }));
      setUploadProgress(progress);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!user || selectedFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Update progress to uploading
      setUploadProgress(prev => prev.map(p => ({
        ...p,
        status: p.status === "pending" ? "uploading" : p.status
      })));

      // Upload files using new storage service
      const results = await uploadGalleryFiles(selectedFiles);

      // Update progress based on results
      setUploadProgress(prev => prev.map((p, index) => {
        const result = results[index];
        if (!result) return p;

        return {
          fileName: p.fileName,
          progress: result.success ? 100 : p.progress,
          status: result.success ? "success" : "error",
          message: result.error
        };
      }));

      // Create gallery items for successful uploads
      for (const result of results) {
        if (result.success && result.path) {
          try {
            // Extract filename from path for title
            const fileName = result.fileName.split('.')[0];

            // Build file_metadata object
            const fileMetadata: Record<string, any> = {};
            if (result.metadata) {
              fileMetadata.size = result.metadata.size || 0;
              fileMetadata.mime_type = result.metadata.mime_type || '';
              fileMetadata.width = result.metadata.width || 0;
              fileMetadata.height = result.metadata.height || 0;
              fileMetadata.format = result.metadata.format || '';
            }

            const galleryItem: TablesInsert<"gallery_items"> = {
              title: fileName,
              description: "",
              image_url: result.url,
              storage_path: result.path,
              file_metadata: fileMetadata,
              category: "general",
              status: "published",
              tags: [],
              display_order: 0,
            };

            await addGalleryImage(galleryItem);
          } catch (err) {
            console.error("Failed to create gallery item:", err);
          }
        }
      }

      // Show success message
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} files`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} files failed to upload`);
      }

      // Reset after delay
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadProgress([]);
        setIsUploading(false);
      }, 2000);

    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
      setIsUploading(false);
    }
  };

  // Handle manual add with storage path
  const handleManualAdd = async () => {
    if (!user) return;

    try {
      const galleryItem: TablesInsert<"gallery_items"> = {
        ...newItem,
        storage_path: manualStoragePath || undefined,
        image_url: manualStoragePath
          ? galleryStorageService.getFileUrl(manualStoragePath)
          : newItem.image_url,
      };

      await addGalleryImage(galleryItem);

      toast.success("Gallery item added successfully");
      setShowAddDialog(false);

      // Reset form
      setNewItem({
        title: "",
        description: "",
        image_url: "",
        category: "general",
        status: "published",
        tags: [],
        display_order: 0,
      });
      setManualStoragePath("");

    } catch (err) {
      console.error("Failed to add gallery item:", err);
      toast.error("Failed to add item", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteGalleryImage(id);
      toast.success("Item deleted successfully");
      setItemToDelete(null);
      setShowDeleteDialog(false);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Delete failed", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
    }
  };

  // Check storage consistency
  const handleConsistencyCheck = async () => {
    try {
      const issues = await checkStorageConsistency();
      setConsistencyIssues(issues);
      setShowConsistencyCheck(true);

      if (issues.length === 0) {
        toast.success("No consistency issues found");
      } else {
        toast.warning(`Found ${issues.length} consistency issues`);
      }
    } catch (err) {
      toast.error("Consistency check failed");
    }
  };

  // Cleanup orphaned files
  const handleCleanup = async () => {
    try {
      const result = await cleanupOrphanedFiles();

      if (result.deleted > 0) {
        toast.success(`Cleaned up ${result.deleted} orphaned files`);
        await refreshStaticContent();
      } else {
        toast.info("No orphaned files found");
      }

      if (result.errors.length > 0) {
        toast.error(`${result.errors.length} cleanup errors occurred`);
      }
    } catch (err) {
      toast.error("Cleanup failed");
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#E93370]" />
        <span className="ml-3">Loading gallery...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gallery Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage your gallery images with Supabase Storage
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleConsistencyCheck}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Check
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(true)}
          >
            Stats
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {contextError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
          {contextError}
        </div>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
          />

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">
                {selectedFiles.length} file(s) selected
              </p>
              {uploadProgress.map((progress, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate">{progress.fileName}</span>
                    <span className="text-xs text-muted-foreground">
                      {progress.status === "uploading" ? `${progress.progress}%` :
                       progress.status === "success" ? "✓" :
                       progress.status === "error" ? "✗" : ""}
                    </span>
                  </div>
                  {progress.status === "uploading" && (
                    <Progress value={progress.progress} className="h-1" />
                  )}
                  {progress.message && (
                    <p className="text-xs text-red-500">{progress.message}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              className="bg-[#E93370] hover:bg-[#E93370]/90"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </>
              )}
            </Button>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Manually
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Gallery Item</DialogTitle>
                  <DialogDescription>
                    Add a gallery item with existing storage path
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Title"
                    value={newItem.title || ""}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  />
                  <Textarea
                    placeholder="Description"
                    value={newItem.description || ""}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  />
                  <Input
                    placeholder="Storage Path (e.g., moments/user123/file.jpg)"
                    value={manualStoragePath}
                    onChange={(e) => setManualStoragePath(e.target.value)}
                  />
                  <Input
                    placeholder="Image URL (optional, auto-generated from storage path)"
                    value={newItem.image_url || ""}
                    onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
                  />
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({...newItem, category: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={newItem.status}
                    onValueChange={(value) => setNewItem({...newItem, status: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleManualAdd}>Add Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gallery.map((item) => (
          <div key={item.id} className="border rounded-lg overflow-hidden bg-white/5">
            <div className="aspect-square bg-black/40 relative">
              {item.image_url ? (
                <ImageWithFallback
                  src={item.image_url}
                  alt={item.title || "Gallery image"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-white/20" />
                </div>
              )}
              <Badge
                className="absolute top-2 left-2"
                variant={item.status === "published" ? "default" : "secondary"}
              >
                {item.status}
              </Badge>
            </div>
            <div className="p-3 space-y-2">
              <h3 className="font-semibold truncate">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="outline">{item.category}</Badge>
                 {item.metadata?.size && (
                   <span>{formatFileSize(item.metadata.size as number)}</span>
                 )}
                </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    // Edit functionality would go here
                    toast.info("Edit functionality coming soon");
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setItemToDelete(item.id);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {gallery.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No gallery items yet</p>
          <p className="text-sm">Upload images to get started</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gallery Item</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The item will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Storage Statistics</DialogTitle>
            <DialogDescription>
              Overview of your storage usage
            </DialogDescription>
          </DialogHeader>
          {storageStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-xl">{storageStats.totalFiles || 0}</CardTitle>
                    <p className="text-xs text-muted-foreground">Total Files</p>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-xl">
                      {formatFileSize(storageStats.totalSize || 0)}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Total Size</p>
                  </CardHeader>
                </Card>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Recent Uploads (24h)</p>
                <p className="text-2xl">{storageStats.recentUploads || 0}</p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCleanup}
              >
                Cleanup Orphaned Files
              </Button>
            </div>
          ) : (
            <p className="text-center py-4">Loading statistics...</p>
          )}
          <DialogFooter>
            <Button onClick={() => setShowStats(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consistency Check Dialog */}
      <Dialog open={showConsistencyCheck} onOpenChange={setShowConsistencyCheck}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Storage Consistency Check</DialogTitle>
            <DialogDescription>
              Verify data integrity between database and storage
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            {consistencyIssues.length === 0 ? (
              <div className="text-center py-8 text-green-600">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2" />
                <p>No consistency issues found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {consistencyIssues.map((issue, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded border">
                    <p className="font-semibold text-sm">
                      {issue.issue_type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {issue.description}
                    </p>
                    {issue.storage_path && (
                      <p className="text-xs font-mono mt-1 text-muted-foreground">
                        {issue.storage_path}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={handleCleanup}>
              Cleanup Files
            </Button>
            <Button onClick={() => setShowConsistencyCheck(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export for use in other components
export default DashboardGalleryEnhanced;