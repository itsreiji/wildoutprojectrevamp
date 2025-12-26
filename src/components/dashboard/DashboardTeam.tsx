import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit, Trash2, Mail, Instagram } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useContent, TeamMember } from '../../contexts/ContentContext';
import { toast } from 'sonner';

export const DashboardTeam = React.memo(() => {
  const { team, updateTeam } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    instagram: '',
    bio: '',
    photoUrl: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const filteredTeam = team.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingMember(null);
    setFormData({ name: '', role: '', email: '', instagram: '', bio: '', photoUrl: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email,
      instagram: member.instagram || '',
      bio: member.bio,
      photoUrl: member.photoUrl || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setIsProcessing(true);
      try {
        await updateTeam(team.filter((m) => m.id !== id));
        toast.success('Team member removed successfully!');
      } catch (error) {
        toast.error('Failed to remove team member');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      if (editingMember) {
        await updateTeam(
          team.map((m) =>
            m.id === editingMember.id ? { ...m, ...formData } : m
          )
        );
        toast.success('Team member updated successfully!');
      } else {
        const newMember: TeamMember = {
          id: Date.now().toString(),
          ...formData,
          status: 'active',
        };
        await updateTeam([...team, newMember]);
        toast.success('Team member added successfully!');
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save team member');
    } finally {
      setIsProcessing(false);
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
                {member.photoUrl ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E93370]/30">
                    <ImageWithFallback
                      src={member.photoUrl}
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
              <p className="text-sm text-[#E93370]">{member.role}</p>
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
              {member.instagram && (
                <div className="flex items-center space-x-2 text-sm text-white/70">
                  <Instagram className="h-4 w-4 text-[#E93370]" />
                  <a
                    href={member.instagram.startsWith('@') ? `https://instagram.com/${member.instagram.substring(1)}` : member.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#E93370] transition-colors"
                  >
                    {member.instagram}
                  </a>
                </div>
              )}
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(member.id)}
                disabled={isProcessing}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-red-500/20 border-t-red-400 rounded-full"
                  />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
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

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role/Position</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Event Manager"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@wildoutproject.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram (Optional)</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="@username"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photoUrl">Photo URL (Optional)</Label>
              <Input
                id="photoUrl"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Enter team member bio"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 min-h-[100px]"
              />
            </div>

            {formData.photoUrl && (
              <div className="rounded-xl overflow-hidden border border-white/10">
                <ImageWithFallback
                  src={formData.photoUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover mx-auto"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isProcessing}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
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
                  Saving...
                </>
              ) : (
                editingMember ? 'Update Member' : 'Add Member'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

DashboardTeam.displayName = 'DashboardTeam';
