/**
 * Enhanced Gallery Manager Component
 *
 * Comprehensive gallery management UI with:
 * - Secure file upload with validation and optimization
 * - Paginated gallery grid with filtering
 * - Storage monitoring and analytics
 * - Bulk operations
 * - Backup/recovery interface
 * - Real-time progress tracking
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Database,
  Activity,
  Shield,
  RefreshCw,
  Download,
  UploadCloud,
  Search,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseGallery } from "@/contexts/SupabaseGalleryContext";
import { ImageWithFallback } from "../figma/ImageWithFallback";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import type { TablesInsert } from "@/supabase/types";
import type { BackupInfo } from "@/lib/gallery/enhanced-storage-service";

interface UploadProgress {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  message?: string;
  optimized?: boolean;
  thumbnailGenerated?: boolean;
}

export function EnhancedGalleryManager() {
  const { user } = useAuth();
  const {
    paginatedGallery,
    stats,
    analytics,
    health,
    consistencyIssues,
    orphanedFiles,
    loading,
    isUploading,
    isChecking,
    uploadGalleryFiles,
    addGalleryImage,
    deleteGalleryImage,
    getGalleryItemsPaginated,
    checkStorageConsistency,
    cleanupOrphanedFiles,
    createBackup,
    restoreFromBackup,
    bulkUpload,
    bulkDelete,
    refreshGallery,
    getFileUrl,
    monitoring,
  } = useSupabaseGallery();

  // UI State
  const [activeTab, setActiveTab] = useState<"gallery" | "upload" | "monitoring" | "management">("gallery");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showConsistencyCheck, setShowConsistencyCheck] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [backupFile, setBackupFile] = useState<BackupInfo | null>(null);

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Manual add form state
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

  // Upload options
  const [optimizeImages, setOptimizeImages] = useState(true);
  const [generateThumbnails, setGenerateThumbnails] = useState(true);
  const [compressionQuality, setCompressionQuality] = useState(0.85);

  // Load data on mount and when filters change
  useEffect(() => {
    loadGalleryData();
  }, [currentPage, filterCategory, filterStatus, searchQuery]);

  const loadGalleryData = useCallback(async () => {
    try {
      await getGalleryItemsPaginated(currentPage, 20, {
        category: filterCategory || undefined,
        status: filterStatus || undefined,
        searchQuery: searchQuery || undefined,
      });
    } catch (err) {
      console.error("Failed to load gallery data:", err);
    }
  }, [currentPage, filterCategory, filterStatus, searchQuery, getGalleryItemsPaginated]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);

      // Initialize progress tracking
      const progress: UploadProgress[] = files.map(file => ({
        fileName: file.name,
        progress: 0,
        status: "pending",
        optimized: optimizeImages,
        thumbnailGenerated: generateThumbnails,
      }));
      setUploadProgress(progress);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!user || selectedFiles.length === 0) return;

    try {
      // Update progress to uploading
      setUploadProgress(prev => prev.map(p => ({
        ...p,
        status: p.status === "pending" ? "uploading" : p.status
      })));

      // Upload files using enhanced storage service
      const results = await uploadGalleryFiles(selectedFiles, {
        optimize: optimizeImages,
        generateThumbnail: generateThumbnails,
        compressionQuality: compressionQuality,
        onProgress: (progress) => {
          // Update progress for all files based on overall progress
          const perFileProgress = progress / selectedFiles.length;
          setUploadProgress(prev => prev.map((p, index) => {
            const fileProgress = Math.min(perFileProgress * (index + 1), 100);
            return {
              ...p,
              progress: p.status === "uploading" ? Math.round(fileProgress) : p.progress
            };
          }));
        }
      });

      // Update progress based on results
      setUploadProgress(prev => prev.map((p, index) => {
        const result = results[index];
        if (!result) return p;

        return {
          fileName: p.fileName,
          progress: result.success ? 100 : p.progress,
          status: result.success ? "success" : "error",
          message: result.error,
          optimized: result.metadata?.optimized,
          thumbnailGenerated: result.metadata?.thumbnail_generated,
        };
      }));

      // Create gallery items for successful uploads
      for (const result of results) {
        if (result.success && result.path) {
          try {
            const fileName = result.fileName.split('.')[0];

            const galleryItem: TablesInsert<"gallery_items"> = {
              title: fileName,
              description: "",
              image_url: result.url,
              storage_path: result.path,
              thumbnail_url: result.thumbnailUrl,
              file_metadata: {
                size: result.metadata?.size || 0,
                mime_type: result.metadata?.mime_type || '',
                width: result.metadata?.width || 0,
                height: result.metadata?.height || 0,
                optimized: result.metadata?.optimized || false,
                thumbnail_generated: result.metadata?.thumbnail_generated || false,
              },
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
      }, 2000);

    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
    }
  };

  // Handle manual add
  const handleManualAdd = async () => {
    if (!user) return;

    try {
      const galleryItem: TablesInsert<"gallery_items"> = {
        ...newItem,
        storage_path: manualStoragePath || undefined,
        image_url: manualStoragePath
          ? getFileUrl(manualStoragePath)
          : newItem.image_url,
        file_metadata: manualStoragePath ? {} : newItem.metadata,
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
      setItemToDelete(null);
      setShowDeleteDialog(false);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Delete failed", {
        description: err instanceof Error ? err.message : "Unknown error"
      });
    }
  };

  // Handle bulk operations
  const handleBulkUpload = async () => {
    if (!user || selectedFiles.length === 0) return;

    try {
      const result = await bulkUpload(selectedFiles);

      if (result.success > 0) {
        await refreshGallery();
      }

      // Reset
      setSelectedFiles([]);
      setUploadProgress([]);

    } catch (err) {
      toast.error("Bulk upload failed");
    }
  };

  // Handle consistency check
  const handleConsistencyCheck = async () => {
    try {
      await checkStorageConsistency();
      setShowConsistencyCheck(true);
    } catch (err) {
      toast.error("Consistency check failed");
    }
  };

  // Handle cleanup
  const handleCleanup = async () => {
    try {
      await cleanupOrphanedFiles();
    } catch (err) {
      toast.error("Cleanup failed");
    }
  };

  // Handle backup creation
  const handleCreateBackup = async () => {
    try {
      const backupData = await createBackup();
      // Download as JSON file
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gallery-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Backup creation failed");
    }
  };

  // Handle backup file selection
  const handleBackupFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        setBackupFile(backupData);
      } catch (err) {
        toast.error("Invalid backup file format");
      }
    };
    reader.readAsText(file);
  };

  // Handle restore
  const handleRestore = async () => {
    if (!backupFile) return;

    try {
      await restoreFromBackup(backupFile);
      setShowRestoreDialog(false);
      setBackupFile(null);
    } catch (err) {
      toast.error("Restore failed");
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

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
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
          <h2 className="text-2xl font-bold">Enhanced Gallery Management</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive gallery management with Supabase Storage
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshGallery}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {monitoring.health?.status === "error" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Storage Health Critical</span>
          </div>
          <ul className="text-sm space-y-1">
            {monitoring.health.issues.map((issue: string, idx: number) => (
              <li key={idx}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      {monitoring.health?.status === "warning" && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-600">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Storage Health Warning</span>
          </div>
          <ul className="text-sm space-y-1">
            {monitoring.health.recommendations.map((rec: string, idx: number) => (
              <li key={idx}>• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gallery">
            <ImageIcon className="h-4 w-4 mr-2" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="upload">
            <UploadCloud className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Activity className="h-4 w-4 mr-2" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="management">
            <Database className="h-4 w-4 mr-2" />
            Management
          </TabsTrigger>
        </TabsList>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filters & Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Search by title, description, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterStatus}
                  onValueChange={setFilterStatus}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {paginatedGallery.data.length} of {paginatedGallery.total} items
                </span>
                <span>
                  Page {paginatedGallery.page} of {paginatedGallery.totalPages}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedGallery.data.map((item) => (
              <div key={item.id} className="border rounded-lg overflow-hidden bg-white/5 hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-black/40 relative">
                  {item.thumbnail_url ? (
                    <ImageWithFallback
                      src={item.thumbnail_url}
                      alt={item.title || "Gallery thumbnail"}
                      className="w-full h-full object-cover"
                    />
                  ) : item.image_url ? (
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
                  {item.metadata?.optimized && (
                    <Badge className="absolute top-2 right-2" variant="outline">
                      Optimized
                    </Badge>
                  )}
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
                  {item.metadata?.width && item.metadata?.height && (
                    <div className="text-xs text-muted-foreground">
                      {item.metadata.width} × {item.metadata.height}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        // Edit functionality
                        toast.info("Edit functionality - use updateGalleryImage hook");
                      }}
                    >
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setItemToDelete(item.id);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {paginatedGallery.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {paginatedGallery.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === paginatedGallery.totalPages}
                onClick={() => setCurrentPage(prev => Math.min(paginatedGallery.totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          )}

          {/* Empty State */}
          {paginatedGallery.data.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No gallery items found</p>
              <p className="text-sm">Try adjusting your filters or upload some images</p>
            </div>
          )}
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="optimize"
                    checked={optimizeImages}
                    onChange={(e) => setOptimizeImages(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="optimize" className="text-sm">
                    Optimize Images
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="thumbnail"
                    checked={generateThumbnails}
                    onChange={(e) => setGenerateThumbnails(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="thumbnail" className="text-sm">
                    Generate Thumbnails
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm">Quality:</label>
                  <Input
                    type="number"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={compressionQuality}
                    onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                    className="w-20"
                  />
                </div>
              </div>

              {/* File Input */}
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
              />

              {/* Upload Progress */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2 border rounded-lg p-4">
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
                      {progress.optimized && (
                        <span className="text-xs text-green-600">✓ Optimized</span>
                      )}
                      {progress.thumbnailGenerated && (
                        <span className="text-xs text-green-600">✓ Thumbnail</span>
                      )}
                      {progress.message && (
                        <p className="text-xs text-red-500">{progress.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
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
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          {/* Storage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-2xl">{stats?.totalFiles || 0}</CardTitle>
                <p className="text-xs text-muted-foreground">Total Files</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-2xl">
                  {stats ? formatFileSize(stats.totalSize) : "0 B"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">Total Size</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-2xl">{stats?.recentUploads || 0}</CardTitle>
                <p className="text-xs text-muted-foreground">Recent (24h)</p>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="text-2xl">
                  {stats ? formatFileSize(stats.bucketSize) : "0 B"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">Bucket Size</p>
              </CardHeader>
            </Card>
          </div>

          {/* Health Status */}
          {health && (
            <Card>
              <CardHeader>
                <CardTitle>Storage Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-3 w-3 rounded-full ${
                    health.status === 'healthy' ? 'bg-green-500' :
                    health.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="font-semibold capitalize">{health.status}</span>
                </div>
                {health.issues.length > 0 && (
                  <div className="space-y-1 mb-3">
                    <p className="text-sm font-semibold">Issues:</p>
                    {health.issues.map((issue: string, idx: number) => (
                      <p key={idx} className="text-sm text-red-600">• {issue}</p>
                    ))}
                  </div>
                )}
                {health.recommendations.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Recommendations:</p>
                    {health.recommendations.map((rec: string, idx: number) => (
                      <p key={idx} className="text-sm text-yellow-600">• {rec}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Analytics */}
          {analytics && (
            <Card>
              <CardHeader>
                <CardTitle>Storage Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold">Average File Size</p>
                    <p className="text-lg">{formatFileSize(analytics.averageFileSize)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Largest File</p>
                    <p className="text-xs truncate">{analytics.largestFile.path || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.largestFile.size ? formatFileSize(analytics.largestFile.size) : ""}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold">By Extension</p>
                    <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
                      {Object.entries(analytics.byExtension || {}).map(([ext, count]) => (
                        <div key={ext} className="flex justify-between">
                          <span>{ext}</span>
                          <span className="text-muted-foreground">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">By Day (Recent)</p>
                    <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
                      {Object.entries(analytics.byDay || {}).slice(-5).map(([day, count]) => (
                        <div key={day} className="flex justify-between">
                          <span>{day}</span>
                          <span className="text-muted-foreground">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consistency Issues */}
          <Card>
            <CardHeader>
              <CardTitle>Consistency Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={handleConsistencyCheck}
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Check Consistency
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCleanup}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Cleanup Orphaned
                </Button>
              </div>

              {consistencyIssues.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {consistencyIssues.map((issue, idx) => (
                    <div key={idx} className="p-2 bg-white/5 rounded border text-sm">
                      <p className="font-semibold">{issue.issue_type.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-muted-foreground">{issue.description}</p>
                      {issue.storage_path && (
                        <p className="text-xs font-mono mt-1">{issue.storage_path}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {orphanedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">Orphaned Files ({orphanedFiles.length})</p>
                  <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
                    {orphanedFiles.slice(0, 10).map((path, idx) => (
                      <p key={idx} className="font-mono truncate">{path}</p>
                    ))}
                    {orphanedFiles.length > 10 && (
                      <p className="text-muted-foreground">... and {orphanedFiles.length - 10} more</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="management" className="space-y-4">
          {/* Backup & Recovery */}
          <Card>
            <CardHeader>
              <CardTitle>Backup & Recovery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button onClick={handleCreateBackup}>
                  <Download className="h-4 w-4 mr-2" />
                  Create Backup
                </Button>
                <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Restore from Backup
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Restore from Backup</DialogTitle>
                      <DialogDescription>
                        Upload a backup JSON file to restore gallery items
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={handleBackupFileSelect}
                      />
                      {backupFile && (
                        <div className="p-3 bg-white/5 rounded border text-sm">
                          <p className="font-semibold">Backup Info:</p>
                          <p>Files: {backupFile.fileCount}</p>
                          <p>Total Size: {formatFileSize(backupFile.totalSize)}</p>
                          <p>Date: {formatDate(backupFile.timestamp)}</p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRestore}
                        disabled={!backupFile}
                      >
                        Restore
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Operations */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground mb-2">
                Select multiple files for bulk upload, or enter multiple item IDs for bulk delete
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleBulkUpload}
                  disabled={selectedFiles.length === 0}
                >
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Bulk Upload ({selectedFiles.length})
                </Button>
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Bulk Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Delete</DialogTitle>
                      <DialogDescription>
                        Enter gallery item IDs (comma-separated) to delete multiple items
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="id1, id2, id3"
                      onChange={(e) => {
                        // Store IDs for bulk delete
                        const ids = e.target.value.split(',').map(id => id.trim()).filter(id => id);
                        setItemToDelete(ids.join(','));
                      }}
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={async () => {
                          if (itemToDelete) {
                            const ids = itemToDelete.split(',').map(id => id.trim());
                            await bulkDelete(ids);
                            setShowDeleteDialog(false);
                          }
                        }}
                      >
                        Delete Items
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Storage Usage by Category */}
          {stats && stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Storage by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(stats.byCategory).map(([category, count]) => (
                      <TableRow key={category}>
                        <TableCell className="capitalize">{category}</TableCell>
                        <TableCell>{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Storage Usage by Status */}
          {stats && stats.byStatus && Object.keys(stats.byStatus).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Storage by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(stats.byStatus).map(([status, count]) => (
                      <TableRow key={status}>
                        <TableCell className="capitalize">{status}</TableCell>
                        <TableCell>{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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

export default EnhancedGalleryManager;