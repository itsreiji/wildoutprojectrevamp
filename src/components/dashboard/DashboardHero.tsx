import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Sparkles, LayoutTemplate, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useContent } from '../../contexts/ContentContextCore';
import { toast } from 'sonner';

export const DashboardHero = React.memo(() => {
  const { hero, updateHero } = useContent();
  const [formData, setFormData] = useState(hero);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateHero(formData);
      toast.success('Hero section updated successfully!');
    } catch (err) {
      toast.error('Failed to save hero section. Please check your connection.');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-2">HERO CONFIG</h1>
          <p className="text-white/40 font-mono text-sm">:: LANDING PAGE ENTRY POINT ::</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-[#E93370] hover:bg-[#D61E5C] text-white rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_-5px_#E93370] transition-all flex items-center gap-2 border border-white/10 min-w-[160px] h-12"
        >
          {isSaving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full"
              />
              SAVING...
            </>
          ) : (
            <>
              <Save size={18} />
              SAVE CHANGES
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Content Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#E93370]/30 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#E93370]/10 text-[#E93370]">
                <LayoutTemplate className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Content Parameters</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Main Heading</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#E93370]/50 focus:ring-[#E93370]/20 h-12 text-lg"
                  placeholder="WildOut!"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Subtitle / Tagline</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#E93370]/50 focus:ring-[#E93370]/20 h-12"
                  placeholder="Media Digital Nightlife & Event Multi-Platform"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#E93370]/50 focus:ring-[#E93370]/20 min-h-[120px] resize-none"
                  placeholder="Indonesia's premier creative community..."
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#E93370]/30 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Live Statistics</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="statsEvents" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">TOTAL EVENTS</Label>
                <Input
                  id="statsEvents"
                  value={formData.stats.events}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stats: { ...formData.stats, events: e.target.value },
                    })
                  }
                  className="bg-[#0A0A0A] border-white/10 text-white focus:border-blue-500/50 text-center font-mono"
                  placeholder="500+"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statsMembers" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">ACTIVE MEMBERS</Label>
                <Input
                  id="statsMembers"
                  value={formData.stats.members}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stats: { ...formData.stats, members: e.target.value },
                    })
                  }
                  className="bg-[#0A0A0A] border-white/10 text-white focus:border-blue-500/50 text-center font-mono"
                  placeholder="5K+"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statsPartners" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">PARTNER NETWORK</Label>
                <Input
                  id="statsPartners"
                  value={formData.stats.partners}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stats: { ...formData.stats, partners: e.target.value },
                    })
                  }
                  className="bg-[#0A0A0A] border-white/10 text-white focus:border-blue-500/50 text-center font-mono"
                  placeholder="100+"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="sticky top-6"
        >
          <div className="rounded-2xl bg-black border border-white/10 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E93370]/20 via-transparent to-blue-600/20 opacity-50" />
            
            {/* Preview Header */}
            <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
              </div>
              <div className="ml-4 px-3 py-1 rounded bg-black/50 text-[10px] font-mono text-white/40 flex-1 text-center">
                LIVE PREVIEW
              </div>
            </div>

            <div className="p-8 md:p-12 min-h-[500px] flex flex-col items-center justify-center text-center relative z-10">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
              
              <motion.h1 
                className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent"
                layoutId="preview-title"
              >
                {formData.title || 'Your Title'}
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl font-light text-[#E93370] mb-6"
                layoutId="preview-subtitle"
              >
                {formData.subtitle || 'Your subtitle will appear here'}
              </motion.p>
              
              <motion.p 
                className="text-white/60 max-w-md mx-auto leading-relaxed mb-10"
                layoutId="preview-desc"
              >
                {formData.description || 'Your description will appear here'}
              </motion.p>

              <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white mb-1">{formData.stats.events || '0'}</div>
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Events</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white mb-1">{formData.stats.members || '0'}</div>
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Members</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white mb-1">{formData.stats.partners || '0'}</div>
                  <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Partners</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-white/30 text-xs font-mono">
             <Sparkles className="w-3 h-3" />
             <span>PREVIEW MODE ACTIVE</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

DashboardHero.displayName = 'DashboardHero';
