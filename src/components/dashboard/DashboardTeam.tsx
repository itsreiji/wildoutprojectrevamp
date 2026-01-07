import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit, Trash2, Mail, Instagram, Shield, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useContent, TeamMember } from '../../contexts/ContentContext';
import { toast } from 'sonner';
import { ImageUpload } from './ImageUpload';

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
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.role.trim()) {
      toast.error('Role is required');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

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
    } catch (error: any) {
      console.error('Error saving team member:', error);
      toast.error(error.message || 'Failed to save team member');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">TEAM MANAGEMENT</h1>
          <p className="text-white/40 font-mono text-sm">:: MANAGE PERSONNEL & ROLES ::</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-white transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-white placeholder:text-white/20 focus:outline-none focus:border-[#E93370]/50 focus:bg-white/10 transition-all w-64"
            />
          </div>
          <button 
             onClick={handleCreate}
             className="px-4 py-2.5 bg-[#E93370] hover:bg-[#D61E5C] text-white rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_-5px_#E93370] transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            ADD MEMBER
          </button>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTeam.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.07]"
            >
               <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                     onClick={() => handleEdit(member)}
                     className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                  >
                     <Edit size={16} />
                  </button>
                  <button 
                     onClick={() => handleDelete(member.id)}
                     className="p-2 hover:bg-red-500/20 rounded-lg text-white/60 hover:text-red-500 transition-colors"
                  >
                     <Trash2 size={16} />
                  </button>
               </div>

               <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E93370]/20 group-hover:border-[#E93370] transition-colors mb-4 bg-black/50">
                     <ImageWithFallback
                        src={member.photoUrl}
                        alt={member.name}
                        className="w-full h-full object-cover"
                     />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                  <div className="flex items-center gap-2 text-[#E93370] text-sm font-medium mb-4">
                     <Shield size={14} />
                     {member.role}
                  </div>

                  <p className="text-white/60 text-sm line-clamp-2 mb-6 h-10">
                     {member.bio || 'No bio available'}
                  </p>

                  <div className="flex items-center gap-3 w-full justify-center border-t border-white/10 pt-4">
                     {member.email && (
                        <a href={`mailto:${member.email}`} className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                           <Mail size={18} />
                        </a>
                     )}
                     {member.instagram && (
                        <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                           <Instagram size={18} />
                        </a>
                     )}
                  </div>
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="!bg-black border border-white/10 text-white max-w-4xl w-[95vw] max-h-[90vh] flex flex-col shadow-2xl p-0 overflow-hidden rounded-2xl"
          style={{ backgroundColor: 'black', opacity: 1 }}
        >
          <DialogHeader className="px-6 py-5 border-b border-white/5 flex-shrink-0">
            <DialogTitle className="text-xl font-bold tracking-tighter uppercase italic">
              {editingMember ? ':: EDIT PERSONNEL ::' : ':: ADD PERSONNEL ::'}
            </DialogTitle>
            <p className="text-white/30 font-mono text-[9px] mt-0.5 tracking-[0.4em]">AUTHENTICATED SESSION // DATABASE_v2.0</p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-6">
              {/* Primary Info Column */}
              <div className="lg:col-span-7 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase text-[#E93370] font-black tracking-[0.4em] ml-1">Full Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/[0.03] border-white/5 text-white focus:border-[#E93370]/50 focus:bg-white/[0.07] h-11 text-sm px-4 rounded-lg transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase text-[#E93370] font-black tracking-[0.4em] ml-1">Role</Label>
                    <Input
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="bg-white/[0.03] border-white/5 text-white focus:border-[#E93370]/50 focus:bg-white/[0.07] h-11 text-sm px-4 rounded-lg transition-all"
                      placeholder="e.g. Creative Director"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] uppercase text-white/40 font-bold tracking-[0.4em] ml-1">Contact Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/[0.03] border-white/5 text-white focus:border-[#E93370]/50 focus:bg-white/[0.07] h-11 text-sm px-4 rounded-lg transition-all"
                    placeholder="email@wildoutproject.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] uppercase text-white/40 font-bold tracking-[0.4em] ml-1">Social Profile (Instagram)</Label>
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <Input
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      className="bg-white/[0.03] border-white/5 text-white focus:border-[#E93370]/50 focus:bg-white/[0.07] h-11 text-sm pl-10 pr-4 rounded-lg transition-all"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <Label className="text-[9px] uppercase text-white/40 font-bold tracking-[0.4em] ml-1">Professional Biography</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-white/[0.03] border-white/5 text-white focus:border-[#E93370]/50 focus:bg-white/[0.07] min-h-[140px] max-h-[180px] resize-y leading-relaxed text-sm p-4 rounded-lg transition-all"
                    placeholder="Brief professional overview..."
                  />
                </div>
              </div>

              {/* Media Column */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-lg space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-white font-bold tracking-tight text-xs">IDENTITY IMAGE</h4>
                    <p className="text-white/20 text-[8px] font-mono tracking-widest uppercase">:: HIGH RESOLUTION RECOMMENDED ::</p>
                  </div>

                  <div className="space-y-3">
                    <ImageUpload
                      label=""
                      value={formData.photoUrl}
                      onChange={(url) => setFormData({ ...formData, photoUrl: url })}
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#E93370]/5 border border-[#E93370]/10 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-[#E93370]/20 rounded text-[#E93370] flex-shrink-0">
                      <Shield size={14} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-[10px] mb-1 uppercase tracking-wider">Access Level: Member</h4>
                      <p className="text-white/40 text-[9px] leading-relaxed">This profile will be visible on the public team directory. Ensure all information is accurate and matches the brand voice.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-white/5 flex-shrink-0 flex items-center justify-between bg-black">
            <div className="hidden md:block">
              <p className="text-white/20 text-[8px] font-mono tracking-widest uppercase italic">// UNSAVED CHANGES WILL BE DISCARDED //</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="h-10 px-5 border-white/10 text-white hover:bg-white/5 hover:text-white rounded-lg font-bold tracking-widest text-[10px] uppercase transition-all flex-1 md:flex-none"
              >
                DISCARD
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="h-10 px-5 bg-[#E93370] hover:bg-[#D61E5C] text-white rounded-lg font-bold tracking-widest text-[10px] uppercase shadow-[0_0_20px_-3px_#E93370] transition-all flex-1 md:flex-none"
              >
                {isProcessing ? 'SYNCHRONIZING...' : editingMember ? 'UPDATE PROFILE' : 'CREATE PROFILE'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

DashboardTeam.displayName = 'DashboardTeam';
