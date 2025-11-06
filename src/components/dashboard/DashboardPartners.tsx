import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { useContent, Partner } from '../../contexts/ContentContext';
import { toast } from 'sonner';

export const DashboardPartners = React.memo(() => {
  const { partners, updatePartners } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({ name: '', category: '', website: '' });

  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingPartner(null);
    setFormData({ name: '', category: '', website: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({ name: partner.name, category: partner.category, website: partner.website });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this partner?')) {
      updatePartners(partners.filter((p) => p.id !== id));
      toast.success('Partner deleted successfully!');
    }
  };

  const handleSubmit = () => {
    if (editingPartner) {
      updatePartners(
        partners.map((p) =>
          p.id === editingPartner.id ? { ...p, ...formData } : p
        )
      );
      toast.success('Partner updated successfully!');
    } else {
      const newPartner: Partner = {
        id: Date.now().toString(),
        ...formData,
        status: 'active',
      };
      updatePartners([...partners, newPartner]);
      toast.success('Partner added successfully!');
    }
    setIsDialogOpen(false);
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
            className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-xl bg-[#E93370]/10 flex items-center justify-center">
                <span className="text-2xl text-[#E93370]">{partner.name.charAt(0)}</span>
              </div>
              <Badge className={partner.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'}>
                {partner.status}
              </Badge>
            </div>

            <h3 className="text-xl text-white mb-2">{partner.name}</h3>
            <p className="text-sm text-white/60 mb-4">{partner.category}</p>

            <a
              href={`https://${partner.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm text-[#E93370] hover:text-[#E93370]/80 mb-4"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{partner.website}</span>
            </a>

            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(partner)}
                className="flex-1 border-white/10 text-white/70 hover:bg-white/10 hover:text-white rounded-lg"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(partner.id)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
        <DialogContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingPartner ? 'Edit Partner' : 'Add New Partner'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Partner Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter partner name"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Music, Lifestyle, Technology"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="example.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-white/10 text-white/70 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-[#E93370] hover:bg-[#E93370]/90 text-white">
              {editingPartner ? 'Update Partner' : 'Add Partner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

DashboardPartners.displayName = 'DashboardPartners';
