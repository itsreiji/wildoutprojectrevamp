import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useContent } from '../../contexts/ContentContext';
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
          Hero Section
        </h2>
        <p className="text-white/60">Manage the main landing page hero content</p>
      </div>

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-[#E93370]" />
              <span>Main Content</span>
            </CardTitle>
            <CardDescription className="text-white/60">
              Update the hero section that appears at the top of your landing page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Site Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/10 border-white/20 text-white text-2xl"
                placeholder="WildOut!"
              />
              <p className="text-xs text-white/40">Main brand name displayed prominently</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle / Tagline</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Media Digital Nightlife & Event Multi-Platform"
              />
              <p className="text-xs text-white/40">Short tagline that appears below the title</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/10 border-white/20 text-white min-h-[100px]"
                placeholder="Indonesia's premier creative community..."
              />
              <p className="text-xs text-white/40">
                Detailed description of your platform (2-3 sentences)
              </p>
            </div>

            {/* Stats Section */}
            <div className="pt-6 border-t border-white/20">
              <h3 className="text-lg mb-4 text-white/90">Statistics Display</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statsEvents">Events Count</Label>
                  <Input
                    id="statsEvents"
                    value={formData.stats.events}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stats: { ...formData.stats, events: e.target.value },
                      })
                    }
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="500+"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statsMembers">Members Count</Label>
                  <Input
                    id="statsMembers"
                    value={formData.stats.members}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stats: { ...formData.stats, members: e.target.value },
                      })
                    }
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="50K+"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statsPartners">Partners Count</Label>
                  <Input
                    id="statsPartners"
                    value={formData.stats.partners}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stats: { ...formData.stats, partners: e.target.value },
                      })
                    }
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="100+"
                  />
                </div>
              </div>
              <p className="text-xs text-white/40 mt-2">
                These numbers are displayed in the hero section stats cards
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#E93370] hover:bg-[#E93370]/90 text-white shadow-lg shadow-[#E93370]/20 rounded-xl"
              >
                {isSaving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4 border-2 border-white/20 border-t-white rounded-full"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Hero Section
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="bg-white/10 backdrop-blur-xl border-white/20">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription className="text-white/60">
              How your hero section will appear on the landing page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 rounded-xl bg-black/50 border border-white/20 text-center space-y-6">
              <h1 className="text-5xl tracking-tight bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
                {formData.title || 'Your Title'}
              </h1>
              <p className="text-xl text-white/80">
                {formData.subtitle || 'Your subtitle will appear here'}
              </p>
              <p className="text-white/60 max-w-2xl mx-auto">
                {formData.description || 'Your description will appear here'}
              </p>
              <div className="grid grid-cols-3 gap-4 pt-8 max-w-2xl mx-auto">
                <div className="p-4 rounded-xl bg-white/10 border border-white/20">
                  <div className="text-2xl text-[#E93370]">{formData.stats.events || '0'}</div>
                  <div className="text-sm text-white/60">Events</div>
                </div>
                <div className="p-4 rounded-xl bg-white/10 border border-white/20">
                  <div className="text-2xl text-[#E93370]">{formData.stats.members || '0'}</div>
                  <div className="text-sm text-white/60">Members</div>
                </div>
                <div className="p-4 rounded-xl bg-white/10 border border-white/20">
                  <div className="text-2xl text-[#E93370]">{formData.stats.partners || '0'}</div>
                  <div className="text-sm text-white/60">Partners</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
});

DashboardHero.displayName = 'DashboardHero';
