import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogOverlay, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DashboardPartnerForm, type PartnerFormValues } from './DashboardPartnerForm';
import { supabaseClient } from '@/supabase/client';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { usePartners } from '@/contexts/PartnersContext';
import { AlertDialog, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, AlertDialogTrigger, AlertDialogContent } from '@/components/ui/alert-dialog';
import type { Partner } from '@/types/content';

export const DashboardPartners = () => {
  const { partners = [], addPartner, updatePartner, deletePartner } = usePartners();
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
    const newUploadedFiles: string[] = [];
    let logoUrl: string | undefined = editingPartner?.logo_url ?? undefined;
    try {
      // Handle logo upload
      if (values.logo_file) {
        const file = values.logo_file as File;
        const validation = validateFile(file);
        if (!validation.valid) {
          toast.error(`Logo: ${validation.message}`);
          return;
        }
        // Upload logo
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
        const { data, error } = await supabaseClient.storage.from('event-media').upload(uniqueName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabaseClient.storage.from('event-media').getPublicUrl(data.path);
        logoUrl = publicUrl;
        newUploadedFiles.push(data.path);
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

      // Update or create partner
      if (editingPartner?.id) {
        await updatePartner(editingPartner.id, partnerData, editingPartner.logo_url);
        toast.success('Partner updated successfully!');
      } else {
        await addPartner({
          ...partnerData,
          status: 'active',
          category: 'general',
        });
        toast.success('Partner added successfully!');
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Cleanup uploaded files if mutation failed
      if (newUploadedFiles.length > 0) {
        try {
          await supabaseClient.storage.from('event-media').remove(newUploadedFiles);
        } catch (cleanupError) {
          console.error('Error cleaning up uploaded files:', cleanupError);
        }
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to save partner';
      toast.error(errorMessage);
      console.error('Save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="dashboard-partners-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id="dashboard-partners-header">
        <div id="dashboard-partners-header-content">
          <h2 className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent" id="dashboard-partners-title">
            Partner Management
          </h2>
          <p className="text-white/60" id="dashboard-partners-subtitle">Manage brand partnerships - changes sync to landing page instantly</p>
        </div>
        <Button className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl" id="dashboard-partners-create-button" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" id="dashboard-partners-create-icon" />
          Add Partner
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative" id="dashboard-partners-search-container">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" id="dashboard-partners-search-icon" />
        <Input
          className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
          id="dashboard-partners-search-input"
          placeholder="Search partners..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="dashboard-partners-grid">
        {filteredPartners.map((partner, index) => (
          <motion.div
            key={partner.id}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-300 relative"
            id={`dashboard-partner-card-${partner.id}`}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {/* Featured Badge */}
            {partner.featured && (
              <div className="absolute top-4 right-4" id={`dashboard-partner-featured-badge-container-${partner.id}`}>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30" id={`dashboard-partner-featured-badge-${partner.id}`}>Featured</Badge>
              </div>
            )}

            {/* Status Badge */}
            <div className="flex items-start justify-between mb-4" id={`dashboard-partner-status-container-${partner.id}`}>
              <Badge className={partner.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'} id={`dashboard-partner-status-${partner.id}`}>
                {partner.status}
              </Badge>
            </div>

            {/* Logo */}
            {partner.logo_url ? (
              <div className="w-full h-24 rounded-lg overflow-hidden border border-white/10 mb-4 bg-white/5 flex items-center justify-center" id={`dashboard-partner-logo-container-${partner.id}`}>
                <ImageWithFallback
                  alt={partner.name}
                  className="w-full h-full object-contain p-2"
                  id={`dashboard-partner-logo-${partner.id}`}
                  src={partner.logo_url}
                />
              </div>
            ) : (
              <div className="w-full h-24 rounded-lg overflow-hidden border border-white/10 mb-4 bg-white/5 flex items-center justify-center" id={`dashboard-partner-logo-placeholder-${partner.id}`}>
                <span className="text-sm text-white/40" id={`dashboard-partner-logo-placeholder-text-${partner.id}`}>No logo</span>
              </div>
            )}

            {/* Info */}
            <h3 className="text-xl text-white mb-2" id={`dashboard-partner-name-${partner.id}`}>{partner.name}</h3>
            {partner.description && (
              <p className="text-sm text-white/60 mb-4 line-clamp-2" id={`dashboard-partner-description-${partner.id}`}>{partner.description}</p>
            )}

            {/* Contact Info */}
            <div className="space-y-2 mb-4 text-sm text-white/70" id={`dashboard-partner-contact-container-${partner.id}`}>
              {partner.contact_email && (
                <div id={`dashboard-partner-email-container-${partner.id}`}>
                  <span className="text-white/40" id={`dashboard-partner-email-label-${partner.id}`}>Email:</span>{' '}
                  <a className="text-[#E93370] hover:text-[#E93370]/80" href={`mailto:${partner.contact_email}`} id={`dashboard-partner-email-link-${partner.id}`}>
                    {partner.contact_email}
                  </a>
                </div>
              )}
              {partner.website_url && (
                <div id={`dashboard-partner-website-container-${partner.id}`}>
                  <span className="text-white/40" id={`dashboard-partner-website-label-${partner.id}`}>Website:</span>{' '}
                  <a className="text-[#E93370] hover:text-[#E93370]/80 inline-flex items-center gap-1" href={partner.website_url} id={`dashboard-partner-website-link-${partner.id}`} rel="noopener noreferrer" target="_blank">
                    Visit <ExternalLink className="h-3 w-3" id={`dashboard-partner-website-icon-${partner.id}`} />
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2 mt-6" id={`dashboard-partner-actions-${partner.id}`}>
              <Button
                className="flex-1 border-white/10 text-white/70 hover:bg-white/10 hover:text-white rounded-lg"
                id={`dashboard-partner-edit-button-${partner.id}`}
                size="sm"
                variant="outline"
                onClick={() => handleEdit(partner)}
              >
                <Edit className="mr-2 h-4 w-4" id={`dashboard-partner-edit-icon-${partner.id}`} />
                Edit
              </Button>
              <AlertDialog open={isDeleteDialogOpen && deletingPartnerId === partner.id} onOpenChange={(open) => {
                if (!open) setDeletingPartnerId(null);
                setIsDeleteDialogOpen(open);
              }}>
                <AlertDialogTrigger asChild>
                  <Button
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg"
                    id={`dashboard-partner-delete-trigger-${partner.id}`}
                    size="sm"
                    variant="outline"
                    onClick={() => setDeletingPartnerId(partner.id)}
                  >
                    <Trash2 className="h-4 w-4" id={`dashboard-partner-delete-icon-${partner.id}`} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black/95 backdrop-blur-xl border-white/10" id={`dashboard-partner-delete-dialog-${partner.id}`}>
                  <AlertDialogHeader id={`dashboard-partner-delete-dialog-header-${partner.id}`}>
                    <AlertDialogTitle className="sr-only" id={`dashboard-partner-delete-dialog-title-${partner.id}`}>Delete Partner?</AlertDialogTitle>
                    <DialogTitle className="sr-only">Delete confirmation dialog</DialogTitle>
                    <AlertDialogDescription className="text-white/70" id={`dashboard-partner-delete-dialog-description-${partner.id}`}>
                      Are you sure you want to delete <span className="font-semibold text-white" id={`dashboard-partner-delete-dialog-name-${partner.id}`}>{partner.name}</span>? This action cannot be undone. Their logo will be removed from storage.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter id={`dashboard-partner-delete-dialog-footer-${partner.id}`}>
                    <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20 border-white/20" id={`dashboard-partner-delete-dialog-cancel-${partner.id}`}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      disabled={isDeleting}
                      id={`dashboard-partner-delete-dialog-confirm-${partner.id}`}
                      onClick={() => handleDelete(partner.id)}
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
        <div className="text-center py-12 text-white/60" id="dashboard-partners-empty-state">
          No partners found. Add your first partner!
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogOverlay className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" id="dashboard-partners-dialog-overlay">
          <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-2xl" id="dashboard-partners-create-edit-dialog">
            <DialogHeader id="dashboard-partners-create-edit-dialog-header">
              <DialogTitle className="sr-only text-2xl" id="dashboard-partners-create-edit-dialog-title">
                {editingPartner ? 'Edit Partner' : 'Add Partner'}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto" id="dashboard-partners-create-edit-dialog-content">
              <DashboardPartnerForm
                defaultValues={editingPartner || undefined}
                isSubmitting={isSubmitting}
                onCancel={() => setIsDialogOpen(false)}
                onSubmit={handleSubmit}
              />
            </div>
          </DialogContent>
        </DialogOverlay>
      </Dialog>
    </div>
  );
}
