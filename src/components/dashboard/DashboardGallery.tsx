import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Trash2 } from 'lucide-react';
const Upload = Plus;
const ImageIcon = Plus;
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useContent, GalleryImage } from '../../contexts/ContentContext';
import { toast } from 'sonner';

export const DashboardGallery = React.memo(() => {
  const { gallery, updateGallery } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ url: '', caption: '', event: '' });
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredImages = gallery.filter(
    (image) =>
      image.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.event?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = () => {
    setFormData({ url: '', caption: '', event: '' });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const newImage: GalleryImage = {
        id: Date.now().toString(),
        ...formData,
        uploadDate: new Date().toISOString().split('T')[0],
      };
      await updateGallery([newImage, ...gallery]);
      toast.success('Photo uploaded successfully!');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      setIsProcessing(true);
      try {
        await updateGallery(gallery.filter((img) => img.id !== id));
        setSelectedImages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        toast.success('Photo deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete photo');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;
    if (window.confirm(`Delete ${selectedImages.size} selected images?`)) {
      setIsProcessing(true);
      try {
        await updateGallery(gallery.filter((img) => !selectedImages.has(img.id)));
        setSelectedImages(new Set());
        toast.success(`${selectedImages.size} photos deleted successfully!`);
      } catch (error) {
        toast.error('Failed to delete photos');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
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
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({selectedImages.size})
            </Button>
          )}
          <Button onClick={handleUpload} className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Upload Photo
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
        <Input
          type="text"
          placeholder="Search by caption or event..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
        />
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border transition-all duration-300 ${
              selectedImages.has(image.id)
                ? 'border-[#E93370] shadow-lg shadow-[#E93370]/20'
                : 'border-white/10 hover:border-[#E93370]/50'
            }`}
          >
            {/* Image */}
            <div className="aspect-square overflow-hidden">
              <ImageWithFallback
                src={image.url}
                alt={image.caption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm mb-1">{image.caption}</p>
                {image.event && (
                  <p className="text-white/60 text-xs mb-2">{image.event}</p>
                )}
                <p className="text-white/40 text-xs">
                  {new Date(image.uploadDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Selection Checkbox */}
            <button
              onClick={() => toggleImageSelection(image.id)}
              className={`absolute top-3 left-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                selectedImages.has(image.id)
                  ? 'bg-[#E93370] border-[#E93370]'
                  : 'bg-black/60 border-white/30 backdrop-blur-sm'
              }`}
            >
              {selectedImages.has(image.id) && (
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

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(image.id)}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12 text-white/60">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-white/40" />
          <p>No photos found. Upload your first photo!</p>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Upload New Photo</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="url">Image URL</Label>
                <Input
                  id="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
                <p className="text-xs text-white/40">
                  Enter the URL of the image you want to add
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  required
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Enter photo caption"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event">Event (Optional)</Label>
                <Input
                  id="event"
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  placeholder="Event name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              {formData.url && (
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <ImageWithFallback
                    src={formData.url}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-white/10 text-white/70 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 border-2 border-white/20 border-t-white rounded-full"
                    />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
});

DashboardGallery.displayName = 'DashboardGallery';
