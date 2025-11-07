/**
 * DashboardPartners Component
 *
 * Manages the complete CRUD workflow for partners in the dashboard.
 * Features:
 * - Display partners in a grid with search/filter capabilities
 * - Create new partners with logo uploads
 * - Edit existing partners with logo replacement
 * - Delete partners with confirmation and storage cleanup
 * - Support for featured partners highlighting
 *
 * File Upload Pipeline:
 * - Client-side validation for image type and size (max 10MB)
 * - Logos are stored in Supabase Storage (event-media bucket)
 * - Uploads are validated before database mutations
 * - If mutation fails, uploaded files are automatically cleaned up
 * - Public URLs are stored in partner logo_url field
 *
 * Error Handling:
 * - Delete dialog stays open if deletion fails, allowing user to retry
 * - Granular error messages for each upload/operation
 * - Toast notifications for success and failure states
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { useContent, Partner } from '../../contexts/ContentContext';
import { toast } from 'sonner';
import { DashboardPartnerForm, PartnerFormValues } from './DashboardPartnerForm';
import { supabaseClient } from '@/supabase/client';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

export const DashboardPartners = React.memo(() => {
  const { partners = [], addPartner, updatePartner, deletePartner } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPartnerId, setDeletingPartnerId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingPartner(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await deletePartner(id);
      toast.success('Partner deleted successfully!');
      setIsDeleteDialogOpen(false);
      setDeletingPartnerId(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete partner.';
      toast.error(errorMessage);
      console.error('Delete error:', error);
      // Keep the dialog open on error so user can retry or cancel
    } finally {
      setIsDeleting(false);
    }
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

  const handleSubmit = async (values: PartnerFormValues) => {
    setIsSubmitting(true);
    try {
      let logoUrl: string | undefined = editingPartner?.logo_url;
      const newUploadedFiles: string[] = [];

      // Handle logo upload
      if (values.logo_file) {
        const file = values.logo_file as File;
        const validation = validateFile(file);

        if (!validation.valid) {
          toast.error(`Logo: ${validation.message}`);
          setIsSubmitting(false);
          return;
        }

        try {
          toast.loading('Uploading logo...');
          const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
          const { data, error } = await supabaseClient.storage
            .from('event-media')
            .upload(uniqueName, file);

          if (error) throw error;

          const { data: { publicUrl } } = supabaseClient.storage.from('event-media').getPublicUrl(data.path);
          logoUrl = publicUrl;
          newUploadedFiles.push(data.path);
          toast.dismiss();
        } catch (error) {
          toast.error(`Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare partner data
      const partnerData = {
        name: values.name,
        website_url: values.website_url || null,
        description: values.description || null,
        contact_email: values.contact_email || null,
        contact_phone: values.contact_phone || null,
        featured: values.featured || false,
        logo_url: logoUrl || null,
        social_links: values.social_links || {},
      };

      try {
        if (editingPartner?.id) {
          // Update existing partner
          await updatePartner(editingPartner.id, partnerData, editingPartner.logo_url);
          toast.success('Partner updated successfully!');
        } else {
          // Create new partner
          await addPartner({
            ...partnerData,
            status: 'active',
          });
          toast.success('Partner added successfully!');
        }
        setIsDialogOpen(false);
      } catch (error) {
        // If mutation fails and we uploaded files, clean them up
        if (newUploadedFiles.length > 0) {
          try {
            await supabaseClient.storage
              .from('event-media')
              .remove(newUploadedFiles);
          } catch (cleanupError) {
            console.error('Error cleaning up uploaded files:', cleanupError);
          }
        }

        const errorMessage = error instanceof Error ? error.message : 'Failed to save partner';
        toast.error(errorMessage);
        console.error('Save error:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
            Partner Management
          </h2>
          <p className="text-white/60">Manage brand partnerships - changes sync to landing page instantly</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Add Partner
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
        <Input
          type="text"
          placeholder="Search partners..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
        />
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner, index) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-300 relative"
          >
            {/* Featured Badge */}
            {partner.featured && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Featured</Badge>
              </div>
            )}

            {/* Status Badge */}
            <div className="flex items-start justify-between mb-4">
              <Badge className={partner.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                {partner.status}
              </Badge>
            </div>

            {/* Logo */}
            {partner.logo_url ? (
              <div className="w-full h-24 rounded-lg overflow-hidden border border-white/10 mb-4 bg-white/5 flex items-center justify-center">
                <ImageWithFallback
                  src={partner.logo_url}
                  alt={partner.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>
            ) : (
              <div className="w-full h-24 rounded-lg overflow-hidden border border-white/10 mb-4 bg-white/5 flex items-center justify-center">
                <span className="text-sm text-white/40">No logo</span>
              </div>
            )}

            {/* Info */}
            <h3 className="text-xl text-white mb-2">{partner.name}</h3>
            {partner.description && (
              <p className="text-sm text-white/60 mb-4 line-clamp-2">{partner.description}</p>
            )}

            {/* Contact Info */}
            <div className="space-y-2 mb-4 text-sm text-white/70">
              {partner.contact_email && (
                <div>
                  <span className="text-white/40">Email:</span>{' '}
                  <a href={`mailto:${partner.contact_email}`} className="text-[#E93370] hover:text-[#E93370]/80">
                    {partner.contact_email}
                  </a>
                </div>
              )}
              {partner.website_url && (
                <div>
                  <span className="text-white/40">Website:</span>{' '}
                  <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-[#E93370] hover:text-[#E93370]/80 inline-flex items-center gap-1">
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2 mt-6">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(partner)}
                className="flex-1 border-white/10 text-white/70 hover:bg-white/10 hover:text-white rounded-lg"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <AlertDialog open={isDeleteDialogOpen && deletingPartnerId === partner.id} onOpenChange={(open) => {
                if (!open) setDeletingPartnerId(null);
                setIsDeleteDialogOpen(open);
              }}>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeletingPartnerId(partner.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black/95 backdrop-blur-xl border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete Partner?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/70">
                      Are you sure you want to delete <span className="font-semibold text-white">{partner.name}</span>? This action cannot be undone. Their logo will be removed from storage.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(partner.id)}
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
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <div className="text-center py-12 text-white/60">
          No partners found. Add your first partner!
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingPartner ? 'Edit Partner' : 'Add Partner'}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            <DashboardPartnerForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              defaultValues={editingPartner || undefined}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

DashboardPartners.displayName = 'DashboardPartners';
