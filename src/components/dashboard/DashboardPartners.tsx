import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePartners } from "@/contexts/PartnersContext";
import { supabaseClient } from "@/supabase/client";
import type { Partner } from "@/types/content";
import { Edit, ExternalLink, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { StatusBadge } from "../ui/StatusBadge";
import { H2, BodyText } from "../ui/typography";
import {
  DashboardPartnerForm,
  type PartnerFormValues,
} from "./DashboardPartnerForm";

export const DashboardPartners = () => {
  const {
    partners = [],
    addPartner,
    updatePartner,
    deletePartner,
  } = usePartners();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPartnerId, setDeletingPartnerId] = useState<string | null>(
    null
  );
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
      toast.success("Partner deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeletingPartnerId(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete partner.";
      toast.error(errorMessage);
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Validate file type and size
  const validateFile = (file: File): { valid: boolean; message?: string } => {
    const maxSizeMB = 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        message: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    if (!file.type.startsWith("image/")) {
      return { valid: false, message: "Only image files are allowed" };
    }

    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!validImageTypes.includes(file.type)) {
      return {
        valid: false,
        message: "Only JPEG, PNG, WebP, and GIF formats are supported",
      };
    }

    return { valid: true };
  };

  const handleSubmit = async (values: PartnerFormValues) => {
    setIsSubmitting(true);
    const newUploadedFiles: string[] = [];
    // Use the URL from the form field if provided
    let logoUrl: string | undefined = values.logo_url || undefined;
    try {
      // Handle logo upload (takes precedence over the URL field if a new file is uploaded)
      if (values.logo_file) {
        const file = values.logo_file as File;
        const validation = validateFile(file);
        if (!validation.valid) {
          toast.error(`Logo: ${validation.message}`);
          return;
        }
        // Upload logo
        const uniqueName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}-${file.name}`;
        const { data, error } = await supabaseClient.storage
          .from("event-media")
          .upload(uniqueName, file);
        if (error) throw error;
        const {
          data: { publicUrl },
        } = supabaseClient.storage.from("event-media").getPublicUrl(data.path);
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
        await updatePartner(
          editingPartner.id,
          partnerData,
          editingPartner.logo_url
        );
        toast.success("Partner updated successfully!");
      } else {
        await addPartner({
          ...partnerData,
          status: "active",
          category: "general",
        });
        toast.success("Partner added successfully!");
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Cleanup uploaded files if mutation failed
      if (newUploadedFiles.length > 0) {
        try {
          await supabaseClient.storage
            .from("event-media")
            .remove(newUploadedFiles);
        } catch (cleanupError) {
          console.error("Error cleaning up uploaded files:", cleanupError);
        }
      }
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save partner";
      toast.error(errorMessage);
      console.error("Save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="dashboard-partners-container">
      {/* Header */}
      <div
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        id="dashboard-partners-header"
      >
        <div id="dashboard-partners-header-content">
          <H2 gradient="from-white via-[#E93370] to-white" id="dashboard-partners-title">
            Partner Management
          </H2>
          <BodyText className="text-white/60" id="dashboard-partners-subtitle">
            Manage brand partnerships - changes sync to landing page instantly
          </BodyText>
        </div>
        <Button
          className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl"
          id="dashboard-partners-create-button"
          onClick={handleCreate}
        >
          <Plus className="mr-2 h-4 w-4" id="dashboard-partners-create-icon" />
          Add Partner
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative" id="dashboard-partners-search-container">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40"
          id="dashboard-partners-search-icon"
        />
        <Input
          className="pl-12 pr-4 h-10 bg-white/5 border-white/10 focus-visible:ring-[#E93370] rounded-xl"
          id="dashboard-partners-search-input"
          placeholder="Search partners..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Partners Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--gap-lg)]"
        id="dashboard-partners-grid"
      >
        {filteredPartners.map((partner, index) => (
          <motion.div
            key={partner.id}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col h-full p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-300 relative shadow-lg"
            id={`dashboard-partner-card-${partner.id}`}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {/* Badges Row */}
            <div className="flex items-start justify-between mb-[var(--form-field-gap)] gap-2">
              <div id={`dashboard-partner-status-container-${partner.id}`}>
                <StatusBadge status={partner.status || "active"} />
              </div>

              {partner.featured && (
                <div id={`dashboard-partner-featured-badge-container-${partner.id}`}>
                  <StatusBadge
                    status="upcoming"
                    showDot={false}
                    className="bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)] text-[10px] px-2 py-0.5"
                    id={`dashboard-partner-featured-badge-${partner.id}`}
                  >
                    FEATURED
                  </StatusBadge>
                </div>
              )}
            </div>

            {/* Logo */}
            {partner.logo_url ? (
              <div
                className="w-full h-32 rounded-xl overflow-hidden border border-white/10 mb-[var(--gap-lg)] bg-white/[0.03] group-hover:bg-white/[0.06] transition-colors flex items-center justify-center p-4"
                id={`dashboard-partner-logo-container-${partner.id}`}
              >
                <ImageWithFallback
                  alt={partner.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  id={`dashboard-partner-logo-${partner.id}`}
                  src={partner.logo_url}
                />
              </div>
            ) : (
              <div
                className="w-full h-32 rounded-xl overflow-hidden border border-white/10 mb-[var(--gap-lg)] bg-white/[0.03] flex items-center justify-center"
                id={`dashboard-partner-logo-placeholder-${partner.id}`}
              >
                <span
                  className="text-sm text-white/20 font-medium"
                  id={`dashboard-partner-logo-placeholder-text-${partner.id}`}
                >
                  No logo provided
                </span>
              </div>
            )}

            {/* Info */}
            <div className="mb-[var(--gap-lg)]">
              <h3
                className="text-lg font-bold text-white mb-2 group-hover:text-[#E93370] transition-colors"
                id={`dashboard-partner-name-${partner.id}`}
              >
                {partner.name}
              </h3>
              {partner.description ? (
                <p
                  className="text-sm text-white/60 line-clamp-2 leading-relaxed min-h-[2.5rem]"
                  id={`dashboard-partner-description-${partner.id}`}
                >
                  {partner.description}
                </p>
              ) : (
                <p className="text-sm text-white/30 italic line-clamp-2 leading-relaxed min-h-[2.5rem]">
                  No description available
                </p>
              )}
            </div>

            {/* Contact & Actions Container - Pushed to bottom */}
            <div className="mt-auto space-y-[var(--gap-lg)]">
              {/* Contact Info */}
              <div
                className="space-y-[var(--form-field-gap)] pt-4 border-t border-white/5 text-sm"
                id={`dashboard-partner-contact-container-${partner.id}`}
              >
                {partner.contact_email && (
                  <div className="flex items-center gap-2 text-white/70" id={`dashboard-partner-email-container-${partner.id}`}>
                    <span className="text-white/40 w-16" id={`dashboard-partner-email-label-${partner.id}`}>Email:</span>
                    <a
                      className="text-[#E93370] hover:text-[#E93370]/80 transition-colors truncate font-medium"
                      href={`mailto:${partner.contact_email}`}
                      id={`dashboard-partner-email-link-${partner.id}`}
                    >
                      {partner.contact_email}
                    </a>
                  </div>
                )}
                {partner.website_url && (
                  <div className="flex items-center gap-2 text-white/70" id={`dashboard-partner-website-container-${partner.id}`}>
                    <span className="text-white/40 w-16" id={`dashboard-partner-website-label-${partner.id}`}>Website:</span>
                    <a
                      className="text-[#E93370] hover:text-[#E93370]/80 inline-flex items-center gap-1 transition-colors font-medium"
                      href={partner.website_url}
                      id={`dashboard-partner-website-link-${partner.id}`}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Visit site
                      <ExternalLink
                        className="h-3 w-3"
                        id={`dashboard-partner-website-icon-${partner.id}`}
                      />
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div
                className="flex space-x-2"
                id={`dashboard-partner-actions-${partner.id}`}
              >
                <Button
                  className="flex-1 border-white/10 text-white/70 hover:bg-white/10 hover:text-white rounded-xl h-10 transition-all"
                  id={`dashboard-partner-edit-button-${partner.id}`}
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(partner)}
                >
                  <Edit
                    className="mr-2 h-4 w-4"
                    id={`dashboard-partner-edit-icon-${partner.id}`}
                  />
                  Edit
                </Button>
                <AlertDialog
                  open={isDeleteDialogOpen && deletingPartnerId === partner.id}
                  onOpenChange={(open) => {
                    if (!open) setDeletingPartnerId(null);
                    setIsDeleteDialogOpen(open);
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      className="border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-xl h-10 w-10 p-0 transition-all"
                      id={`dashboard-partner-delete-trigger-${partner.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingPartnerId(partner.id)}
                    >
                      <Trash2
                        className="h-4 w-4"
                        id={`dashboard-partner-delete-icon-${partner.id}`}
                      />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent
                    className="bg-[#0a0a0a] border-white/10 text-white max-w-md rounded-2xl"
                    id={`dashboard-partner-delete-dialog-content-${partner.id}`}
                  >
                    <AlertDialogHeader
                      id={`dashboard-partner-delete-dialog-header-${partner.id}`}
                    >
                      <AlertDialogTitle
                        className="text-xl font-bold"
                        id={`dashboard-partner-delete-dialog-title-${partner.id}`}
                      >
                        Remove Partner?
                      </AlertDialogTitle>
                      <AlertDialogDescription
                        className="text-white/60"
                        id={`dashboard-partner-delete-dialog-description-${partner.id}`}
                      >
                        This action cannot be undone. This will permanently remove{" "}
                        <span className="text-white font-medium">
                          {partner.name}
                        </span>{" "}
                        from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter
                      id={`dashboard-partner-delete-dialog-footer-${partner.id}`}
                    >
                      <AlertDialogCancel
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-colors rounded-xl"
                        id={`dashboard-partner-cancel-delete-button-${partner.id}`}
                        onClick={() => setDeletingPartnerId(null)}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/20 rounded-xl"
                        id={`dashboard-partner-confirm-delete-button-${partner.id}`}
                        onClick={() => handleDelete(partner.id)}
                      >
                        {isDeleting ? "Removing..." : "Remove Partner"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <div
          className="text-center py-12 text-white/60"
          id="dashboard-partners-empty-state"
        >
          No partners found. Add your first partner!
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-xl w-[95vw] !h-[800px] max-h-[90vh] bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden shadow-2xl flex flex-col gap-0 rounded-2xl sm:rounded-[32px]"
          id="dashboard-partners-create-edit-dialog"
          aria-label={editingPartner ? `Edit Partner: ${editingPartner.name}` : "Add Partner"}
          aria-labelledby="dashboard-partners-create-edit-dialog-title"
        >
          <DialogTitle
            className="text-xl font-bold text-white flex items-center gap-2 px-8 py-6 border-b border-white/10"
            id="dashboard-partners-create-edit-dialog-title"
          >
            <div className="w-2 h-2 rounded-full bg-[#E93370] animate-pulse"></div>
            {editingPartner ? "Edit Partner" : "Add Partner"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {editingPartner ? "Edit partner details" : "Add a new partner to the system"}
          </DialogDescription>

          <DashboardPartnerForm
            defaultValues={editingPartner || undefined}
            isSubmitting={isSubmitting}
            onCancel={() => setIsDialogOpen(false)}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
