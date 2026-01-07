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
import { ImageUpload } from './ImageUpload';
import { useContent } from '../../contexts/ContentContextCore';
import { GalleryImage } from '../../types/content';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-2">VISUAL DATABASE</h1>
          <p className="text-white/40 font-mono text-sm">:: MEDIA ASSET CONTROL ::</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedImages.size > 0 && (
            <Button
              variant="outline"
              onClick={handleBulkDelete}
              className="px-6 py-3 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-300 flex items-center gap-2"
            >
              <Trash2 size={18} />
              DELETE SELECTED ({selectedImages.size})
            </Button>
          )}
          <Button 
            onClick={handleUpload} 
            className="px-6 py-3 bg-[#E93370] hover:bg-[#D61E5C] text-white rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_-5px_#E93370] transition-all flex items-center gap-2 border border-white/10"
          >
            <Plus size={18} />
            UPLOAD ASSET
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#E93370]/20 to-blue-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-[#E93370] transition-colors duration-300" />
          <Input
            type="text"
            placeholder="SEARCH DATABASE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-[#0A0A0A] border-white/10 text-white placeholder:text-white/20 rounded-full focus:border-[#E93370]/50 focus:ring-[#E93370]/20 transition-all duration-300"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`group relative aspect-square overflow-hidden rounded-2xl bg-white/5 border transition-all duration-500 ${
              selectedImages.has(image.id)
                ? 'border-[#E93370] shadow-[0_0_30px_rgba(233,51,112,0.2)]'
                : 'border-white/10 hover:border-[#E93370]/50 hover:shadow-[0_0_20px_rgba(233,51,112,0.1)]'
            }`}
          >
            {/* Image */}
            <div className="w-full h-full overflow-hidden">
              <ImageWithFallback
                src={image.url}
                alt={image.caption}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                <p className="text-white font-bold truncate">{image.caption}</p>
                {image.event && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1 h-1 rounded-full bg-[#E93370]" />
                    <p className="text-[#E93370] text-xs font-mono uppercase tracking-wider">{image.event}</p>
                  </div>
                )}
                <p className="text-white/30 text-[10px] font-mono mt-2">
                  UPLOADED: {new Date(image.uploadDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Selection Checkbox */}
            <button
              onClick={() => toggleImageSelection(image.id)}
              className={`absolute top-4 left-4 w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 z-10 ${
                selectedImages.has(image.id)
                  ? 'bg-[#E93370] border-[#E93370] text-white'
                  : 'bg-black/40 border-white/20 text-transparent hover:border-white/40 backdrop-blur-md'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(image.id);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-[-10px] group-hover:translate-y-0"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 border border-white/5 rounded-3xl bg-white/[0.02]">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
            <ImageIcon className="h-10 w-10 text-white/20" />
          </div>
          <p className="text-white/40 font-mono text-sm">:: NO ASSETS DETECTED ::</p>
          <Button 
            variant="link" 
            onClick={handleUpload}
            className="text-[#E93370] hover:text-[#E93370]/80 mt-2"
          >
            INITIATE UPLOAD SEQUENCE
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">UPLOAD ASSET</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <ImageUpload
                label="Source Asset"
                required
                value={formData.url}
                onChange={(url) => setFormData({ ...formData, url })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Asset Caption</Label>
              <Input
                id="caption"
                required
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                placeholder="Enter description..."
                className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-white/20 focus:border-[#E93370]/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Associated Event</Label>
              <Input
                id="event"
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                placeholder="Event name (optional)"
                className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-white/20 focus:border-[#E93370]/50"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="bg-[#E93370] hover:bg-[#E93370]/90 text-white"
              >
                {isProcessing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 border-2 border-white/20 border-t-white rounded-full"
                    />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    CONFIRM UPLOAD
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
