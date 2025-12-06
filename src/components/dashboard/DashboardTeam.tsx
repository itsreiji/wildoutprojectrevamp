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

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit, Trash2, Mail, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useTeam } from '../../contexts/TeamContext';
import { toast } from 'sonner';
import { DashboardTeamForm, TeamFormValues } from './DashboardTeamForm';
import { supabaseClient } from '@/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import type { TeamMember } from '@/types/content';
// member.avatar_url → member.photoUrl || member.avatar_url

export const DashboardTeam = React.memo(() => {
  const { team = [], addTeamMember, updateTeamMember, deleteTeamMember } = useTeam();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTeam = team.filter((member) =>
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
      toast.success('Team member deleted successfully!');
      setIsDeleteDialogOpen(false);
      setDeletingMemberId(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete team member.';
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

  const handleSubmit = async (values: TeamFormValues) => {
    setIsSubmitting(true);
    try {
      let avatarUrl: string | undefined = editingMember?.avatar_url ?? undefined;
      const newUploadedFiles: string[] = [];

      // Handle avatar upload
      if (values.avatar_file) {
        const file = values.avatar_file as File;
        const validation = validateFile(file);

        if (!validation.valid) {
          toast.error(`Avatar: ${validation.message}`);
          setIsSubmitting(false);
          return;
        }

        try {
          toast.loading('Uploading avatar...');
          const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
          const { data, error } = await supabaseClient.storage
            .from('event-media')
            .upload(uniqueName, file);

          if (error) throw error;

          const { data: { publicUrl } } = supabaseClient.storage.from('event-media').getPublicUrl(data.path);
          avatarUrl = publicUrl;
          newUploadedFiles.push(data.path);
          toast.dismiss();
        } catch (error) {
          toast.error(`Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare team member data
      const memberData = {
        name: values.name,
        title: values.title,
        email: values.email,
        bio: values.bio || null,
        avatar_url: avatarUrl || null,
        social_links: values.social_links || {},
      };

      try {
        if (editingMember?.id) {
          // Update existing member (pass old avatar_url for cleanup if media is replaced)
          await updateTeamMember(editingMember.id, memberData, editingMember.avatar_url);
          toast.success('Team member updated successfully!');
        } else {
          // Create new member
          await addTeamMember({
            ...memberData,
            status: 'active',
          });
          toast.success('Team member added successfully!');
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

        const errorMessage = error instanceof Error ? error.message : 'Failed to save team member';
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
            Team Management
          </h2>
          <p className="text-white/60">Manage your team members - changes sync to landing page instantly</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#E93370] hover:bg-[#E93370]/90 text-white rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
        <Input
          type="text"
          placeholder="Search team members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl"
        />
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeam.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {member.avatar_url ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E93370]/30">
                    <ImageWithFallback
                      src={member.avatar_url}
                      alt={member.name}
                      className="w-full h-full object-cover"
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
              <Badge className={member.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                {member.status}
              </Badge>
            </div>

            {/* Info */}
            <div className="mb-4">
              <h3 className="text-xl text-white mb-1">{member.name}</h3>
              <p className="text-sm text-[#E93370]">{member.title}</p>
            </div>

            <p className="text-sm text-white/60 mb-4 line-clamp-2">{member.bio}</p>

            {/* Contact */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-white/70">
                <Mail className="h-4 w-4 text-[#E93370]" />
                <a href={`mailto:${member.email}`} className="hover:text-[#E93370] transition-colors">
                  {member.email}
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(member)}
                className="flex-1 border-white/10 text-white/70 hover:bg-white/10 hover:text-white rounded-lg"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <AlertDialog open={isDeleteDialogOpen && deletingMemberId === member.id} onOpenChange={(open) => {
                if (!open) setDeletingMemberId(null);
                setIsDeleteDialogOpen(open);
              }}>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeletingMemberId(member.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black/95 backdrop-blur-xl border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete Team Member?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/70">
                      Are you sure you want to delete <span className="font-semibold text-white">{member.name}</span>? This action cannot be undone. Their avatar will be removed from storage.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(member.id)}
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

      {filteredTeam.length === 0 && (
        <div className="text-center py-12 text-white/60">
          No team members found. Add your first team member!
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            <DashboardTeamForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              defaultValues={editingMember || undefined}
              onCancel={() => setIsDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

DashboardTeam.displayName = 'DashboardTeam';
