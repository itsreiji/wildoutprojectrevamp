/**
 * DashboardGallery Component
 *
 * Manages the complete CRUD workflow for gallery items in the dashboard.
 * Features:
 * - Display gallery items in a responsive grid with search/filter
 * - Create new gallery items with single or multiple image uploads
 * - Edit existing gallery items with additional image uploads
 * - Delete individual items or bulk delete selected items
 * - Image preview generation and selection
 * - Storage cleanup on deletion
 *
 * File Upload Pipeline:
 * - Client-side validation for image type and size (max 10MB per file)
 * - Images are stored in Supabase Storage (event-media bucket)
 * - Uploads are validated before database mutations
 * - If mutation fails, uploaded files are automatically cleaned up
 * - Public URLs are stored in gallery_items image_urls field (JSON array)
 *
 * Error Handling:
 * - Granular error messages for each upload/operation
 * - Toast notifications for success and failure states
 * - Partial upload failures show warnings but continue operation
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useContent, GalleryImage } from '../../contexts/ContentContext';
import { toast } from 'sonner';
import { DashboardGalleryForm, GalleryFormValues } from './DashboardGalleryForm';
import { supabaseClient } from '@/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

export const DashboardGallery = React.memo(() => {
  const { gallery = [], addGalleryImage, updateGalleryImage, deleteGalleryImage } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredItems = gallery.filter((item) =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingGallery(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: GalleryImage) => {
    setEditingGallery(item);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteGalleryImage(id);
      toast.success('Gallery item deleted successfully!');
      setIsDeleteDialogOpen(false);
      setDeletingItemId(null);
      setSelectedImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete gallery item.';
      toast.error(errorMessage);
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;

    setIsDeleting(true);
    let deleted = 0;
    const errors: string[] = [];

    for (const id of selectedImages) {
      try {
        await deleteGalleryImage(id);
        deleted++;
      } catch (error) {
        errors.push(id);
      }
    }

    setIsDeleting(false);

    if (errors.length === 0) {
      toast.success(`${deleted} gallery items deleted successfully!`);
      setSelectedImages(new Set());
    } else {
      toast.error(`Failed to delete ${errors.length} items. ${deleted} were deleted successfully.`);
    }
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Validate file type and size
  const validateFile = (file: File): { valid: boolean; message?: string } => {
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return { valid: false, message: `File size exceeds ${maxSizeMB}MB limit` };
    }

    if (!file.type.startsWith('image/')) {
      return { valid: false, message: 'Only image files are allowed' };
    }

    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validImageTypes.includes(file.type)) {
      return { valid: false, message: 'Only JPEG, PNG, WebP, and GIF formats are supported' };
    }

    return { valid: true };
  };

  const handleSubmit = async (values: GalleryFormValues) => {
    setIsSubmitting(true);
    try {
      const imageUrls: string[] = [];
      const uploadedFiles: string[] = [];

      // Upload new images
      if (values.image_files && values.image_files.length > 0) {
        toast.loading(`Uploading ${values.image_files.length} image(s)...`);

        for (let i = 0; i < values.image_files.length; i++) {
          const file = values.image_files[i] as File;
          const validation = validateFile(file);

          if (!validation.valid) {
            toast.error(`Image ${i + 1}: ${validation.message}`);
            continue;
          }

          try {
            const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
            const { data, error } = await supabaseClient.storage
              .from('event-media')
              .upload(uniqueName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabaseClient.storage.from('event-media').getPublicUrl(data.path);
            imageUrls.push(publicUrl);
            uploadedFiles.push(data.path);
          } catch (error) {
            console.error(`Failed to upload image ${i + 1}:`, error);
            // Continue with other uploads
          }
        }

        toast.dismiss();

        if (imageUrls.length === 0) {
          toast.error('No images were successfully uploaded');
          setIsSubmitting(false);
          return;
        }

        if (imageUrls.length < values.image_files.length) {
          toast.warning(`Only ${imageUrls.length} of ${values.image_files.length} images uploaded successfully`);
        }
      }

      // Prepare gallery data
      const galleryData = {
        title: values.title,
        description: values.description || null,
        category: values.category ?? undefined,
        tags: values.tags ?? [],
        image_urls: imageUrls.length > 0 ? imageUrls : (editingGallery?.image_urls || []),
      };

      try {
        if (editingGallery?.id) {
          // Update existing gallery
          await updateGalleryImage(editingGallery.id, galleryData);
          toast.success('Gallery item updated successfully!');
        } else {
          // Create new gallery
          await addGalleryImage({
            ...galleryData,
            status: 'published',
          });
          toast.success('Gallery item created successfully!');
        }
        setIsDialogOpen(false);
      } catch (error) {
        // If mutation fails and we uploaded files, clean them up
        if (uploadedFiles.length > 0) {
          try {
            await supabaseClient.storage
              .from('event-media')
              .remove(uploadedFiles);
          } catch (cleanupError) {
            console.error('Error cleaning up uploaded files:', cleanupError);
          }
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to save gallery item';
        toast.error(errorMessage);
        console.error('Save error:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract first image URL from image_urls array
  const getGalleryImage = (item: GalleryImage): string => {
    if (Array.isArray(item.image_urls) && item.image_urls.length > 0) {
      return item.image_urls[0] as string;
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
            Gallery Management
          </h2>
          <p className="text-white/60">Manage event photos - changes sync to landing page instantly</p>
        </div>
        <div className="flex space-x-2">
          {selectedImages.size > 0 && (
            <Button
              variant="outline"
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedImages.size})
            </Button>
          )}
          <Button onClick={handleCreate} className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            New Gallery
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
        <Input
          type="text"
          placeholder="Search by title, description or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
        />
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item, index) => {
          const imageUrl = getGalleryImage(item);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border transition-all duration-300 cursor-pointer ${
                selectedImages.has(item.id)
                  ? 'border-[#E93370] shadow-lg shadow-[#E93370]/20'
                  : 'border-white/10 hover:border-[#E93370]/50'
              }`}
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden bg-black/40">
                {imageUrl ? (
                  <ImageWithFallback
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-white/20" />
                  </div>
                )}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm mb-1 font-semibold">{item.title}</p>
                  {item.description && (
                    <p className="text-white/60 text-xs mb-2 line-clamp-2">{item.description}</p>
                  )}
                  {item.category && (
                    <p className="text-white/40 text-xs">{item.category}</p>
                  )}
                </div>
              </div>

              {/* Selection Checkbox */}
              <button
                onClick={() => toggleImageSelection(item.id)}
                className={`absolute top-3 left-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  selectedImages.has(item.id)
                    ? 'bg-[#E93370] border-[#E93370]'
                    : 'bg-black/60 border-white/30 backdrop-blur-sm'
                }`}
              >
                {selectedImages.has(item.id) && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              {/* Actions */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                  className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-[#E93370]/20 hover:border-[#E93370]/30 transition-all duration-200"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <AlertDialog open={isDeleteDialogOpen && deletingItemId === item.id} onOpenChange={(open) => {
                  if (!open) setDeletingItemId(null);
                  setIsDeleteDialogOpen(open);
                }}>
                  <AlertDialogTrigger asChild>
                    <button
                      onClick={() => setDeletingItemId(item.id)}
                      className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black/95 backdrop-blur-xl border-white/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Delete Gallery Item?</AlertDialogTitle>
                      <AlertDialogDescription className="text-white/70">
                        Are you sure you want to delete <span className="font-semibold text-white">"{item.title}"</span>? This action cannot be undone. All associated images will be removed from storage.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(item.id)}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-white/60">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-white/40" />
          <p>No gallery items found. Create your first gallery!</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingGallery ? 'Edit Gallery Item' : 'Create New Gallery'}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            <DashboardGalleryForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              defaultValues={editingGallery || undefined}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

DashboardGallery.displayName = 'DashboardGallery';
