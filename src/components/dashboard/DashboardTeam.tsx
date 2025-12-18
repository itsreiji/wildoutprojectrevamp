/**
 * DashboardTeam Component
 *
 * Manages the complete CRUD workflow for team members in the dashboard.
 * Features:
 * - Display team members in a grid with search/filter capabilities
 * - Create new team members with avatar uploads
 * - Edit existing team members with avatar replacement
 * - Delete team members with confirmation and storage cleanup
 *
 * File Upload Pipeline:
 * - Client-side validation for image type and size (max 10MB)
 * - Avatars are stored in Supabase Storage (event-media bucket)
 * - Uploads are validated before database mutations
 * - If mutation fails, uploaded files are automatically cleaned up
 * - Public URLs are stored in team member avatar_url field
 *
 * Error Handling:
 * - Delete dialog stays open if deletion fails, allowing user to retry
 * - Granular error messages for each upload/operation
 * - Toast notifications for success and failure states
 */

import { supabaseClient } from "@/supabase/client";
import type { TeamMember } from "@/types/content";
import { Edit, Mail, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useTeam } from "../../contexts/TeamContext";
import { ImageWithFallback } from "../figma/ImageWithFallback";
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
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { DashboardTeamForm, type TeamFormValues } from "./DashboardTeamForm";
// member.avatar_url → member.photoUrl || member.avatar_url

export const DashboardTeam = React.memo(() => {
  const {
    team = [],
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
  } = useTeam();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTeam = team.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingMember(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteTeamMember(id);
      toast.success("Team member deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeletingMemberId(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete team member.";
      toast.error(errorMessage);
      console.error("Delete error:", error);
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

  const handleSubmit = async (values: TeamFormValues) => {
    console.log("Form submitted with values:", JSON.stringify(values, null, 2));
    setIsSubmitting(true);
    try {
      let avatarUrl: string | undefined =
        editingMember?.avatar_url ?? undefined;
      const newUploadedFiles: string[] = [];

      // Handle avatar upload
      if (values.avatar_file) {
        const file = values.avatar_file as File;
        const validation = validateFile(file);

        if (!validation.valid) {
          const errorMsg = `Avatar: ${validation.message}`;
          console.error("Validation failed:", errorMsg);
          toast.error(errorMsg);
          setIsSubmitting(false);
          return;
        }

        try {
          toast.loading("Uploading avatar...");
          const uniqueName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}-${file.name}`;
          const { data, error } = await supabaseClient.storage
            .from("event-media")
            .upload(uniqueName, file);

          if (error) throw error;

          const {
            data: { publicUrl },
          } = supabaseClient.storage
            .from("event-media")
            .getPublicUrl(data.path);
          avatarUrl = publicUrl;
          newUploadedFiles.push(data.path);
          toast.dismiss();
        } catch (error) {
          toast.error(
            `Failed to upload avatar: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare social links with proper typing
      const socialLinks: Record<string, string | null> = {
        ...(editingMember?.metadata?.social_links || {}),
        ...(values.social_links?.instagram
          ? { instagram: values.social_links.instagram }
          : {}),
      };

      // Clean up social_links to remove null/undefined/empty values
      Object.keys(socialLinks).forEach((key: string) => {
        if (!socialLinks[key]) {
          delete socialLinks[key];
        }
      });

      // Prepare team member data
      const memberData = {
        name: values.name,
        title: values.title,
        email: values.email,
        bio: values.bio || null,
        avatar_url: avatarUrl || null,
        metadata: {
          ...(editingMember?.metadata || {}),
          social_links:
            Object.keys(socialLinks).length > 0 ? socialLinks : null,
        },
        updated_at: new Date().toISOString(),
      };

      try {
        if (editingMember?.id) {
          console.log("Updating team member with data:", {
            id: editingMember.id,
            updates: memberData,
            oldAvatarUrl: editingMember.avatar_url,
          });
          // Update existing member (pass old avatar_url for cleanup if media is replaced)
          await updateTeamMember(
            editingMember.id,
            memberData,
            editingMember.avatar_url
          );
          console.log("Team member updated successfully");
          toast.success("Team member updated successfully!");
        } else {
          // Create new member
          console.log(
            "Adding new team member with data:",
            JSON.stringify(
              {
                ...memberData,
                status: "active",
              },
              null,
              2
            )
          );
          await addTeamMember({
            ...memberData,
            status: "active",
          });
          console.log("Team member added successfully");
          toast.success("Team member added successfully!");
        }
        setIsDialogOpen(false);
      } catch (error) {
        // If mutation fails and we uploaded files, clean them up
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
          error instanceof Error ? error.message : "Failed to save team member";
        console.error("Save error details:", {
          error,
          values,
          editingMemberId: editingMember?.id,
          avatarUrl: editingMember?.avatar_url,
        });
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="dashboard-team-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
            Team Management
          </h2>
          <p className="text-white/60">
            Manage your team members - changes sync to landing page instantly
          </p>
        </div>
        <Button
          className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl"
          onClick={handleCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
        <Input
          className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
          placeholder="Search team members..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeam.map((member, index) => (
          <motion.div
            key={member.id}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {member.avatar_url ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E93370]/30">
                    <ImageWithFallback
                      alt={member.name}
                      className="w-full h-full object-cover"
                      src={member.avatar_url}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#E93370]/20 flex items-center justify-center border-2 border-[#E93370]/30">
                    <span className="text-2xl text-[#E93370]">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <Badge
                className={
                  member.status === "active"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }
              >
                {member.status}
              </Badge>
            </div>

            {/* Info */}
            <div className="mb-4">
              <h3 className="text-xl text-white mb-1">{member.name}</h3>
              <p className="text-sm text-[#E93370]">{member.title}</p>
            </div>

            <p className="text-sm text-white/60 mb-4 line-clamp-2">
              {member.bio}
            </p>

            {/* Contact */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <Mail className="h-4 w-4 text-[#E93370] flex-shrink-0" />
                <a
                  className="hover:text-[#E93370] transition-colors truncate"
                  href={`mailto:${member.email}`}
                >
                  {member.email}
                </a>
              </div>
              {member.social_links?.instagram && (
                <div className="flex items-center space-x-2 text-sm text-white/70">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-[#E93370] flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      clipRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.415-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.399 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      fillRule="evenodd"
                    />
                  </svg>
                  <a
                    className="hover:text-[#E93370] transition-colors truncate"
                    href={`https://instagram.com/${member.social_links.instagram}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    @{member.social_links.instagram.replace("@", "")}
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                className="flex-1 border-white/10 text-white/70 hover:bg-white/10 hover:text-white rounded-lg"
                size="sm"
                variant="outline"
                onClick={() => handleEdit(member)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <AlertDialog
                open={isDeleteDialogOpen && deletingMemberId === member.id}
                onOpenChange={(open) => {
                  if (!open) setDeletingMemberId(null);
                  setIsDeleteDialogOpen(open);
                }}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg"
                    size="sm"
                    variant="outline"
                    onClick={() => setDeletingMemberId(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#0a0a0a] border-white/10 text-white max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold">
                      Remove Team Member?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">
                      This action cannot be undone. This will permanently remove{" "}
                      <span className="text-white font-medium">
                        {member.name}
                      </span>{" "}
                      from the team and delete all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white transition-colors"
                      onClick={() => setDeletingMemberId(null)}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/20"
                      onClick={() => handleDelete(member.id)}
                    >
                      {isDeleting ? "Removing..." : "Remove Member"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTeam.length === 0 && (
        <div className="text-center py-12 text-white/60">
          No team members found. Add your first team member!
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-xl w-[95vw] !h-[800px] max-h-[90vh] bg-[#0a0a0a] border-white/10 text-white p-0 overflow-hidden shadow-2xl flex flex-col gap-0"
          id="dashboard-team-create-edit-dialog"
        >
          <DialogHeader
            className="px-8 py-6 border-b border-white/10"
            id="dashboard-team-create-edit-dialog-header"
          >
            <DialogTitle
              className="text-xl font-bold text-white flex items-center gap-2"
              id="dashboard-team-create-edit-dialog-title"
            >
              <div className="w-2 h-2 rounded-full bg-[#E93370] animate-pulse"></div>
              {editingMember ? "Edit Team Member" : "Add Team Member"}
            </DialogTitle>
          </DialogHeader>

          <DashboardTeamForm
            defaultValues={editingMember || undefined}
            isSubmitting={isSubmitting}
            onCancel={() => setIsDialogOpen(false)}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
});

DashboardTeam.displayName = "DashboardTeam";
