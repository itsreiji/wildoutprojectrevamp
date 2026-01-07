import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { useContent } from '../../contexts/ContentContextCore';
import { Partner } from '../../types/content';
import { toast } from 'sonner';

export const DashboardPartners = React.memo(() => {
  const { partners, updatePartners, refresh } = useContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState({ id: '', name: '', category: '', website: '', logoUrl: '' });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setEditingPartner(null);
    setFormData({ id: '', name: '', category: '', website: '', logoUrl: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setFormData({ id: partner.id, name: partner.name, category: partner.category, website: partner.website, logoUrl: partner.logoUrl || '' });
    setIsDialogOpen(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
      toast.success('Data refreshed from server');
    } catch (error: any) {
      toast.error('Failed to refresh data: ' + error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this partner?')) {
      setIsProcessing(true);
      try {
        const updatedPartners = partners.filter((p) => p.id !== id);
        await updatePartners(updatedPartners);
        toast.success('Partner deleted successfully!');
      } catch (error: any) {
        console.error('Delete error:', error);
        toast.error('Failed to delete partner: ' + error.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.id.trim()) {
      toast.error('ID is required for organization');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.website.trim()) {
      toast.error('Website is required');
      return;
    }

    // Check for duplicate ID when creating
    if (!editingPartner) {
      const duplicateId = partners.find(p => p.id === formData.id);
      if (duplicateId) {
        toast.error('ID already exists. Please use a unique ID.');
        return;
      }
    }

    setIsProcessing(true);
    try {
      if (editingPartner) {
        const updatedPartners = partners.map((p) =>
          p.id === editingPartner.id ? { ...p, ...formData } : p
        );
        await updatePartners(updatedPartners);
        toast.success('Partner updated successfully!');
      } else {
        const newPartner: Partner = {
          ...formData,
          status: 'active',
        };
        const updatedPartners = [...partners, newPartner];
        await updatePartners(updatedPartners);
        toast.success('Partner added successfully!');
      }
      setIsDialogOpen(false);
      setFormData({ id: '', name: '', category: '', website: '', logoUrl: '' });
      setEditingPartner(null);
    } catch (error: any) {
      console.error('Error saving partner:', error);
      toast.error('Failed to save: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">ALLIANCE NETWORK</h1>
          <p className="text-white/40 font-mono text-sm">:: STRATEGIC PARTNERSHIPS & SPONSORS ::</p>
          <p className="text-[#E93370]/60 font-mono text-[10px] mt-1">
            {partners.length} partners • Local changes stay until synced
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
             onClick={handleRefresh}
             disabled={isRefreshing}
             className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm tracking-wide transition-all flex items-center gap-2 border border-white/10"
             title="Refresh data from server"
          >
            <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? 'SYNCING' : 'SYNC'}
          </button>
          <Button
             onClick={handleCreate}
             className="bg-[#E93370] hover:bg-[#E93370]/80 text-white rounded-xl shadow-[0_0_20px_rgba(233,51,112,0.3)] hover:shadow-[0_0_30px_rgba(233,51,112,0.5)] transition-all duration-300 border border-white/10"
          >
            <Plus className="mr-2 h-4 w-4" />
            NEW PARTNER
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
            placeholder="SEARCH NETWORK..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-black/40 border-white/10 text-white placeholder:text-white/20 rounded-full focus:border-[#E93370]/50 focus:ring-[#E93370]/20 transition-all duration-300"
          />
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner, index) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#E93370]/50 hover:bg-white/[0.07] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ExternalLink className="h-4 w-4 text-white/40" />
            </div>

            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-xl bg-[#E93370]/10 border border-[#E93370]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {partner.logoUrl ? (
                  <img src={partner.logoUrl} alt={partner.name} className="w-10 h-10 object-contain opacity-80 group-hover:opacity-100" />
                ) : (
                  <span className="text-2xl font-bold text-[#E93370]">{partner.name.charAt(0)}</span>
                )}
              </div>
              <Badge className={`border ${partner.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-white/5 text-white/40 border-white/10'
              }`}>
                {partner.status.toUpperCase()}
              </Badge>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#E93370] transition-colors">{partner.name}</h3>
              <p className="text-sm text-white/40 font-mono uppercase">{partner.category}</p>
              <p className="text-[10px] text-white/30 font-mono tracking-widest mt-2">
                ID: {partner.id}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(partner)}
                className="flex-1 border-white/10 text-white/60 hover:bg-white/5 hover:text-white rounded-lg h-10"
              >
                EDIT DETAILS
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(partner.id)}
                className="w-10 h-10 border-red-500/20 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 rounded-lg p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 border border-white/5 rounded-3xl bg-white/[0.02]">
           <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
             <Search className="h-10 w-10 text-white/20" />
           </div>
           <p className="text-white/40 font-mono text-sm">:: NO PARTNERS FOUND ::</p>
           <Button
             variant="link"
             onClick={handleCreate}
             className="text-[#E93370] hover:text-[#E93370]/80 mt-2"
           >
             ESTABLISH NEW PARTNERSHIP
           </Button>
         </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {editingPartner ? 'EDIT PARTNERSHIP' : 'NEW ALLIANCE'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="id" className="text-[10px] uppercase text-[#E93370] font-black tracking-[0.4em] ml-1">Partner ID (Unique)</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="e.g., partner-001"
                className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-white/20 focus:border-[#E93370]/50 font-mono"
                disabled={!!editingPartner}
              />
              {editingPartner && (
                <p className="text-[10px] text-white/40 font-mono mt-1">ID cannot be changed after creation</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Partner Entity Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter organization name..."
                className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-white/20 focus:border-[#E93370]/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Industry / Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., TECH, AUDIO, LIFESTYLE"
                className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-white/20 focus:border-[#E93370]/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Digital Presence</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="domain.com"
                className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-white/20 focus:border-[#E93370]/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Brand Asset URL</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://..."
                className="bg-[#0A0A0A] border-white/10 text-white placeholder:text-white/20 focus:border-[#E93370]/50"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isProcessing}
              className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
            >
              CANCEL
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
                  PROCESSING...
                </>
              ) : (
                editingPartner ? 'UPDATE RECORDS' : 'INITIATE PARTNERSHIP'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

DashboardPartners.displayName = 'DashboardPartners';
