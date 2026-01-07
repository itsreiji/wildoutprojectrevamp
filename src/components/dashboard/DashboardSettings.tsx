import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Save, 
  Globe, 
  Mail, 
  MapPin, 
  Instagram, 
  Twitter, 
  Facebook, 
  Youtube,
  Shield,
  Server,
  Database,
  Radio,
  Cpu,
  Lock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useContent } from '../../contexts/ContentContext';
import { toast } from 'sonner';

export const DashboardSettings = React.memo(() => {
  const { settings, updateSettings } = useContent();
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(formData);
      toast.success('System configuration updated successfully!');
    } catch (error) {
      toast.error('Failed to update system configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with System Status */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-2 flex items-center gap-3">
            <Cpu className="h-10 w-10 text-[#E93370]" />
            SYSTEM CONFIG
          </h1>
          <p className="text-white/40 font-mono text-sm">:: GLOBAL PARAMETERS & KERNEL SETTINGS ::</p>
        </div>
        
        {/* System Status Indicators */}
        <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2 px-3 border-r border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-white/60">CORE: ONLINE</span>
          </div>
          <div className="flex items-center gap-2 px-3 border-r border-white/10">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-mono text-white/60">DB: CONNECTED</span>
          </div>
          <div className="flex items-center gap-2 px-3">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-[10px] font-mono text-white/60">SECURE: TLS 1.3</span>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-[#E93370] hover:bg-[#D61E5C] text-white rounded-xl font-bold text-sm tracking-wide shadow-[0_0_20px_-5px_#E93370] transition-all flex items-center justify-center gap-2 border border-white/10 min-w-[160px] h-12"
        >
          {isSaving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full"
              />
              WRITING...
            </>
          ) : (
            <>
              <Save size={18} />
              SAVE CONFIG
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Site Identity Module */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2 group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#E93370]/10 to-blue-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md hover:border-[#E93370]/30 transition-colors duration-300">
            <div className="flex items-center space-x-4 mb-8 border-b border-white/5 pb-6">
              <div className="p-3 bg-[#E93370]/10 rounded-xl border border-[#E93370]/20 shadow-[0_0_15px_rgba(233,51,112,0.2)]">
                <Globe className="h-6 w-6 text-[#E93370]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">SITE IDENTITY</h3>
                <p className="text-white/40 text-xs font-mono uppercase">Primary Metadata & SEO Configuration</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="siteName" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Platform Name</Label>
                <div className="relative group/input">
                  <Input
                    id="siteName"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#E93370]/50 focus:ring-[#E93370]/20 h-12 pl-4 transition-all duration-300"
                    placeholder="WILDOUT"
                  />
                  <div className="absolute inset-0 border border-[#E93370]/20 rounded-md scale-105 opacity-0 group-focus-within/input:opacity-100 transition-all duration-300 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="siteDescription" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Meta Description</Label>
                <div className="relative group/input">
                  <Input
                    id="siteDescription"
                    value={formData.siteDescription}
                    onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                    className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#E93370]/50 focus:ring-[#E93370]/20 h-12 pl-4 transition-all duration-300"
                    placeholder="Short description for search engines"
                  />
                </div>
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="tagline" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Global Tagline</Label>
                <Textarea
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="bg-[#0A0A0A] border-white/10 text-white min-h-[100px] focus:border-[#E93370]/50 focus:ring-[#E93370]/20 resize-none p-4"
                  placeholder="The main slogan appearing on the landing page..."
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Module */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative h-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md hover:border-blue-500/30 transition-colors duration-300">
            <div className="flex items-center space-x-4 mb-8 border-b border-white/5 pb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Mail className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">COMMUNICATION</h3>
                <p className="text-white/40 text-xs font-mono uppercase">Public Contact Channels</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">System Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-12 h-12 bg-[#0A0A0A] border-white/10 text-white focus:border-blue-500/50 focus:ring-blue-500/20"
                    placeholder="contact@wildout.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="instagram_contact" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Instagram Handle</Label>
                <div className="relative">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="instagram_contact"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, instagram: e.target.value } })}
                    className="pl-12 h-12 bg-[#0A0A0A] border-white/10 text-white focus:border-blue-500/50 focus:ring-blue-500/20"
                    placeholder="@wildoutproject"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="address" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">HQ Coordinates</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-12 h-12 bg-[#0A0A0A] border-white/10 text-white focus:border-blue-500/50 focus:ring-blue-500/20"
                    placeholder="Jakarta, Indonesia"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Matrix Module */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative h-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md hover:border-purple-500/30 transition-colors duration-300">
            <div className="flex items-center space-x-4 mb-8 border-b border-white/5 pb-6">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <Radio className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">SOCIAL MATRIX</h3>
                <p className="text-white/40 text-xs font-mono uppercase">Network Integrations</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { id: 'instagram', icon: Instagram, label: 'Instagram', placeholder: 'https://instagram.com/...' },
                { id: 'twitter', icon: Twitter, label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
                { id: 'facebook', icon: Facebook, label: 'Facebook', placeholder: 'https://facebook.com/...' },
                { id: 'youtube', icon: Youtube, label: 'YouTube', placeholder: 'https://youtube.com/...' },
              ].map((item) => (
                <div key={item.id} className="space-y-2">
                  <Label htmlFor={item.id} className="text-[10px] uppercase text-white/40 font-bold tracking-widest">{item.label} URL</Label>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-purple-400 transition-colors">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <Input
                      id={item.id}
                      value={formData.socialMedia[item.id as keyof typeof formData.socialMedia]}
                      onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, [item.id]: e.target.value } })}
                      className="pl-12 h-10 bg-[#0A0A0A] border-white/10 text-white focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                      placeholder={item.placeholder}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Visual Identity Module */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <div className="h-6 w-6 bg-gradient-to-tr from-[#E93370] to-blue-500 rounded-lg" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">VISUAL CORE</h3>
                <p className="text-white/40 text-xs font-mono uppercase">System Aesthetics & Branding</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group flex items-start space-x-6 p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-[#E93370]/30 transition-all duration-300">
                <div className="w-20 h-20 rounded-2xl bg-[#E93370] shadow-[0_0_30px_rgba(233,51,112,0.3)] ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                   <span className="text-white/80 font-mono text-xs">Aa</span>
                </div>
                <div>
                  <h4 className="text-white font-bold tracking-wide">Primary Accent</h4>
                  <p className="text-[#E93370] font-mono mt-1 text-sm">#E93370</p>
                  <p className="text-white/40 text-xs mt-2 font-mono uppercase">WildOut Pink / Neon Rose</p>
                  <div className="mt-4 flex gap-2">
                     <div className="h-1 flex-1 bg-[#E93370] rounded-full opacity-100" />
                     <div className="h-1 flex-1 bg-[#E93370] rounded-full opacity-60" />
                     <div className="h-1 flex-1 bg-[#E93370] rounded-full opacity-30" />
                  </div>
                </div>
              </div>

              <div className="group flex items-start space-x-6 p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-white/20 transition-all duration-300">
                <div className="w-20 h-20 rounded-2xl bg-[#0a0a0a] ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30" />
                </div>
                <div>
                  <h4 className="text-white font-bold tracking-wide">Base Layer</h4>
                  <p className="text-white/60 font-mono mt-1 text-sm">#0a0a0a</p>
                  <p className="text-white/40 text-xs mt-2 font-mono uppercase">Midnight Void / Deep Space</p>
                   <div className="mt-4 flex gap-2">
                     <div className="h-1 flex-1 bg-[#0a0a0a] border border-white/20 rounded-full" />
                     <div className="h-1 flex-1 bg-[#1a1a1a] border border-white/10 rounded-full" />
                     <div className="h-1 flex-1 bg-[#2a2a2a] border border-white/5 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

DashboardSettings.displayName = 'DashboardSettings';