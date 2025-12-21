import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Upload,
  Grid3X3,
  List,
  MoreVertical,
  Trash2,
  Edit2,
  Download,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Calendar,
  Tag,
  Layers,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  GalleryItem,
  GalleryFilter,
  GallerySort,
  GalleryPagination,
  BatchUploadItem,
  BatchUploadSummary
} from '@/lib/gallery/types';
import {
  GALLERY_CATEGORIES,
  GALLERY_STATUSES,
  SORT_OPTIONS,
  SORT_DIRECTIONS
} from '@/lib/gallery/constants';
import { processBatchUpload } from '@/lib/gallery/upload';
import { supabaseClient } from '@/supabase/client';

interface GalleryGridProps {
  items: GalleryItem[];
  loading?: boolean;
  onRefresh?: () => void;
  onFilterChange?: (filters: GalleryFilter) => void;
  onSortChange?: (sort: GallerySort) => void;
  onPageChange?: (page: number) => void;
  pagination?: GalleryPagination;
  filters?: GalleryFilter;
  sort?: GallerySort;
  allowUpload?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  userId?: string;
  userRole?: string;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  items,
  loading = false,
  onRefresh,
  onFilterChange,
  onSortChange,
  onPageChange,
  pagination,
  filters = {},
  sort = { field: SORT_OPTIONS.CREATED_AT, direction: SORT_DIRECTIONS.DESC },
  allowUpload = true,
  allowEdit = true,
  allowDelete = true,
  userId,
  userRole,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSummary, setUploadSummary] = useState<BatchUploadSummary | null>(null);
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchMetadata, setBatchMetadata] = useState({
    category: 'other',
    tags: [] as string[],
    watermark: false,
    optimize: true,
    display_order: 0,
    description: '',
  });

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({ ...filters, search_query: searchQuery });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, onFilterChange, filters]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setBatchFiles(prev => [...prev, ...files]);
    }
  }, []);

  // Remove file from batch
  const removeFileFromBatch = (index: number) => {
    setBatchFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle batch upload
  const handleBatchUpload = async () => {
    if (!userId || !userRole) {
      toast.error('User tidak terautentikasi');
      return;
    }

    if (batchFiles.length === 0) {
      toast.error('Pilih file terlebih dahulu');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const items: BatchUploadItem[] = batchFiles.map(file => ({
      file,
      metadata: {
        ...batchMetadata,
        tags: batchMetadata.tags,
        author: userId,
      },
    }));

    try {
      const result = await processBatchUpload(
        items,
        userId,
        userRole,
        (current, total) => {
          setUploadProgress(Math.round((current / total) * 100));
        }
      );

      setUploadSummary(result);

      if (result.successful > 0) {
        toast.success(`${result.successful} file berhasil diupload`);
        onRefresh?.();
      }

      if (result.failed > 0) {
        toast.error(`${result.failed} file gagal diupload`);
      }

      if (result.successful === 0) {
        toast.error('Semua file gagal diupload');
      }
    } catch (error) {
      toast.error('Upload gagal: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!allowDelete) {
      toast.error('Anda tidak memiliki izin untuk menghapus');
      return;
    }

    try {
      // Hapus dari database
      const { error: dbError } = await supabaseClient
        .from('gallery_items')
        .delete()
        .eq('id', itemId);

      if (dbError) throw dbError;

      // Hapus dari storage (dapatkan URL terlebih dahulu)
      const { data: itemData } = await supabaseClient
        .from('gallery_items')
        .select('image_url')
        .eq('id', itemId)
        .single();

      if (itemData?.image_url) {
        const path = itemData.image_url.split('/').slice(-2).join('/');
        await supabaseClient.storage.from('gallery').remove([path]);
      }

      toast.success('Item berhasil dihapus');
      onRefresh?.();
    } catch (error) {
      toast.error('Gagal menghapus: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    if (!allowDelete) {
      toast.error('Anda tidak memiliki izin untuk menghapus');
      return;
    }

    const confirmed = confirm(`Hapus ${selectedItems.length} item terpilih?`);
    if (!confirmed) return;

    let successCount = 0;
    let failCount = 0;

    for (const itemId of selectedItems) {
      try {
        await handleDeleteItem(itemId);
        successCount++;
      } catch {
        failCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} item berhasil dihapus`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} item gagal dihapus`);
    }

    setSelectedItems([]);
    onRefresh?.();
  };

  // Handle edit item
  const handleEditItem = (item: GalleryItem) => {
    if (!allowEdit) {
      toast.error('Anda tidak memiliki izin untuk mengedit');
      return;
    }
    setEditingItem(item);
    setShowMetadataEditor(true);
  };

  // Handle update metadata
  const handleUpdateMetadata = async (updatedItem: GalleryItem) => {
    try {
      const { error } = await supabaseClient
        .from('gallery_items')
        .update({
          title: updatedItem.title,
          description: updatedItem.description,
          category: updatedItem.category,
          tags: updatedItem.tags,
          display_order: updatedItem.display_order,
          metadata: updatedItem.metadata_obj,
        })
        .eq('id', updatedItem.id);

      if (error) throw error;

      toast.success('Metadata berhasil diperbarui');
      setShowMetadataEditor(false);
      setEditingItem(null);
      onRefresh?.();
    } catch (error) {
      toast.error('Gagal memperbarui: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Handle download
  const handleDownload = async (item: GalleryItem) => {
    if (!item.image_url) {
      toast.error('URL gambar tidak tersedia');
      return;
    }
    try {
      const response = await fetch(item.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title || 'image'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Download dimulai');
    } catch (error) {
      toast.error('Gagal download: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Toggle selection
  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Select all
  const selectAll = () => {
    setSelectedItems(items.map(item => item.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get category badge variant
  const getCategoryBadgeVariant = (category: string) => {
    const variants: Record<string, "info" | "brand" | "secondary" | "category" | "destructive" | "outline"> = {
      event: 'info',
      partner: 'brand',
      team: 'secondary',
      product: 'category',
      blog: 'destructive',
      other: 'outline',
    };
    return variants[category] || 'outline';
  };

  // Grid view
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map(item => (
        <div
          key={item.id}
          className={cn(
            "border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-all",
            selectedItems.includes(item.id) && "ring-2 ring-pink-500"
          )}
        >
          {/* Image */}
          <div className="relative aspect-square bg-muted overflow-hidden">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title || 'Gallery item'}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <ImageIcon className="h-12 w-12" />
              </div>
            )}

            {/* Status badge */}
            <div className="absolute top-2 left-2">
              <StatusBadge
                status={item.status || GALLERY_STATUSES.DRAFT}
                className="shadow-sm"
                size="sm"
              />
            </div>

            {/* Selection checkbox */}
            <div className="absolute top-2 right-2">
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onCheckedChange={() => toggleSelection(item.id)}
                className="bg-white"
              />
            </div>

            {/* Actions dropdown */}
            <div className="absolute bottom-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleEditItem(item)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Metadata
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownload(item)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setItemToDelete(item.id);
                      setShowDeleteDialog(true);
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm line-clamp-2 flex-1 leading-[1.5]">
                {item.title || 'Untitled'}
              </h3>
              {item.display_order !== null && item.display_order !== undefined && (
                <Badge variant="outline" className="text-xs">
                  #{item.display_order}
                </Badge>
              )}
            </div>

            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-[1.5]">
                {item.description}
              </p>
            )}

            <div className="flex flex-wrap gap-1">
              {item.category && (
                <Badge variant={getCategoryBadgeVariant(item.category)} className="text-xs">
                  <Layers className="h-3 w-3 mr-1" />
                  {item.category}
                </Badge>
              )}
              {item.tags?.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {item.tags && item.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 2}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(item.created_at)}
              </span>
              <span className="flex items-center gap-1">
                {formatFileSize(item.metadata_obj?.file_size)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // List view
  const ListView = () => (
    <div className="space-y-2">
      {items.map(item => (
        <div
          key={item.id}
          className={cn(
            "border rounded-lg p-3 bg-card hover:bg-muted/50 transition-colors flex items-center gap-3",
            selectedItems.includes(item.id) && "ring-2 ring-pink-500"
          )}
        >
          <Checkbox
            checked={selectedItems.includes(item.id)}
            onCheckedChange={() => toggleSelection(item.id)}
            className="mr-2"
          />

          <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-muted">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title || 'Gallery item'}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate leading-[1.5]">
                {item.title || 'Untitled'}
              </h3>
              <StatusBadge status={item.status || GALLERY_STATUSES.DRAFT} size="sm" />
              {item.category && (
                <Badge variant={getCategoryBadgeVariant(item.category)} className="text-xs">
                  {item.category}
                </Badge>
              )}
              {item.display_order !== null && item.display_order !== undefined && (
                <Badge variant="outline" className="text-xs">
                  #{item.display_order}
                </Badge>
              )}
            </div>

            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mb-1 leading-[1.5]">
                {item.description}
              </p>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(item.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                {formatFileSize(item.metadata_obj?.file_size)}
              </span>
              {item.tags && item.tags.length > 0 && (
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {item.tags.length} tags
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEditItem(item)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload(item)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setItemToDelete(item.id);
                    setShowDeleteDialog(true);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );

  // Pagination component
  const Pagination = () => {
    if (!pagination) return null;

    const { page, total_pages, total } = pagination;

    return (
      <div className="flex items-center justify-between border-t pt-4 mt-4">
        <div className="text-sm text-muted-foreground">
          Total: {total} items | Halaman {page} dari {total_pages}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            Sebelumnya
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= total_pages!}
            onClick={() => onPageChange?.(page + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    );
  };

  // Upload dialog content
  const UploadDialog = () => (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle>Upload Batch Gallery</DialogTitle>
        <DialogDescription>
          Pilih multiple file untuk diupload dengan metadata yang sama
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-4 py-4">
          {/* File selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Pilih File</label>
            <Input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Format: JPEG, PNG, WebP | Maksimal: 5MB per file, 20 file per batch
            </p>
          </div>

          {/* File list */}
          {batchFiles.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">File Terpilih ({batchFiles.length})</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {batchFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-xs truncate flex-1">{file.name}</span>
                    <span className="text-xs text-muted-foreground mr-2">
                      {formatFileSize(file.size)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-600"
                      onClick={() => removeFileFromBatch(index)}
                      disabled={uploading}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <Select
                value={batchMetadata.category}
                onValueChange={(value) => setBatchMetadata(prev => ({ ...prev, category: value }))}
                disabled={uploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GALLERY_CATEGORIES).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Display Order</label>
              <Input
                type="number"
                placeholder="0"
                value={batchMetadata.display_order}
                onChange={(e) => setBatchMetadata(prev => ({
                  ...prev,
                  display_order: parseInt(e.target.value) || 0
                }))}
                disabled={uploading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (pisahkan dengan koma)</label>
            <Input
              placeholder="tag1, tag2, tag3"
              value={batchMetadata.tags.join(', ')}
              onChange={(e) => setBatchMetadata(prev => ({
                ...prev,
                tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
              }))}
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi</label>
            <Input
              placeholder="Deskripsi untuk semua file"
              value={batchMetadata.description || ''}
              onChange={(e) => setBatchMetadata(prev => ({ ...prev, description: e.target.value }))}
              disabled={uploading}
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={batchMetadata.watermark}
                  onCheckedChange={(checked) => setBatchMetadata(prev => ({
                    ...prev,
                    watermark: checked as boolean
                  }))}
                  disabled={uploading}
                />
                Tambah Watermark
              </label>

              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={batchMetadata.optimize}
                  onCheckedChange={(checked) => setBatchMetadata(prev => ({
                    ...prev,
                    optimize: checked as boolean
                  }))}
                  disabled={uploading}
                />
                Optimasi Gambar
              </label>
            </div>
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Mengupload...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-pink-500 h-2 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Summary */}
          {uploadSummary && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium">Ringkasan Upload</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total: {uploadSummary.total_files}</div>
                <div className="text-green-600">Berhasil: {uploadSummary.successful}</div>
                <div className="text-red-600">Gagal: {uploadSummary.failed}</div>
              </div>
              {uploadSummary.results.filter(r => !r.success).length > 0 && (
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {uploadSummary.results.filter(r => !r.success).map((result, idx) => (
                    <div key={idx} className="text-xs text-red-600">
                      {result.original_file}: {result.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            setShowUploadDialog(false);
            setBatchFiles([]);
            setUploadSummary(null);
          }}
          disabled={uploading}
        >
          Batal
        </Button>
        <Button
          onClick={handleBatchUpload}
          disabled={batchFiles.length === 0 || uploading}
          className="min-w-[100px]"
        >
          {uploading ? 'Mengupload...' : 'Upload'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  // Metadata editor dialog
  const MetadataEditorDialog = () => {
    if (!editingItem) return null;

    const [formData, setFormData] = useState<GalleryItem>(editingItem);

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Metadata</DialogTitle>
          <DialogDescription>
            Perbarui informasi metadata untuk item galeri
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Judul</label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GALLERY_CATEGORIES).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Deskripsi</label>
            <Input
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <Input
                placeholder="tag1, tag2, tag3"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Display Order</label>
              <Input
                type="number"
                value={formData.display_order || 0}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  display_order: parseInt(e.target.value) || 0
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GALLERY_STATUSES.PUBLISHED}>Published</SelectItem>
                  <SelectItem value={GALLERY_STATUSES.DRAFT}>Draft</SelectItem>
                  <SelectItem value={GALLERY_STATUSES.ARCHIVED}>Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Event ID</label>
              <Input
                value={formData.event_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, event_id: e.target.value }))}
                placeholder="Opsional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Partner ID</label>
            <Input
              value={formData.partner_id || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, partner_id: e.target.value }))}
              placeholder="Opsional"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowMetadataEditor(false);
              setEditingItem(null);
            }}
          >
            Batal
          </Button>
          <Button onClick={() => handleUpdateMetadata(formData)}>
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search and Filters */}
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari judul, deskripsi, atau tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Kategori</DropdownMenuLabel>
              {Object.entries(GALLERY_CATEGORIES).map(([key, value]) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => onFilterChange?.({ ...filters, category: [value] })}
                >
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {Object.values(GALLERY_STATUSES).map(status => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onFilterChange?.({ ...filters, status: [status] })}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onFilterChange?.({})}>
                Reset Filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Berdasarkan</DropdownMenuLabel>
              {Object.entries(SORT_OPTIONS).map(([key, value]) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => onSortChange?.({
                    field: value,
                    direction: sort.direction
                  })}
                >
                  {key.charAt(0) + key.slice(1).toLowerCase()}
                  {sort.field === value && (
                    <span className="ml-2 text-pink-500">•</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onSortChange?.({
                  field: sort.field,
                  direction: sort.direction === SORT_DIRECTIONS.ASC
                    ? SORT_DIRECTIONS.DESC
                    : SORT_DIRECTIONS.ASC
                })}
              >
                {sort.direction === SORT_DIRECTIONS.ASC ? (
                  <SortDesc className="h-4 w-4 mr-2" />
                ) : (
                  <SortAsc className="h-4 w-4 mr-2" />
                )}
                Urutan: {sort.direction === SORT_DIRECTIONS.ASC ? 'Naik' : 'Turun'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid3X3 className="h-4 w-4" />
            )}
          </Button>

          {selectedItems.length > 0 && (
            <>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus ({selectedItems.length})
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearSelection}
              >
                Bersihkan
              </Button>
            </>
          )}

          {allowUpload && (
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </DialogTrigger>
              <UploadDialog />
            </Dialog>
          )}
        </div>
      </div>

      {/* Selection info */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-pink-500" />
            <span className="font-medium">{selectedItems.length} item terpilih</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={selectAll}>
              Pilih Semua
            </Button>
            <Button size="sm" variant="outline" onClick={clearSelection}>
              Bersihkan
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum ada item</h3>
          <p className="text-muted-foreground mb-4">
            Upload gambar pertama Anda untuk memulai
          </p>
          {allowUpload && (
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="bg-pink-600 hover:bg-pink-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Pertama
                </Button>
              </DialogTrigger>
              <UploadDialog />
            </Dialog>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-500 border-t-transparent mb-4" />
          <p className="text-muted-foreground">Memuat galeri...</p>
        </div>
      )}

      {/* Content */}
      {!loading && items.length > 0 && (
        <>
          {viewMode === 'grid' ? <GridView /> : <ListView />}
          <Pagination />
        </>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
            <DialogDescription>
              {itemToDelete
                ? 'Item ini akan dihapus permanen. Apakah Anda yakin?'
                : `Hapus ${selectedItems.length} item terpilih?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setItemToDelete(null);
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (itemToDelete) {
                  handleDeleteItem(itemToDelete);
                  setItemToDelete(null);
                } else {
                  handleBulkDelete();
                }
                setShowDeleteDialog(false);
              }}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Metadata editor dialog */}
      <Dialog open={showMetadataEditor} onOpenChange={setShowMetadataEditor}>
        <MetadataEditorDialog />
      </Dialog>
    </div>
  );
};

export default GalleryGrid;