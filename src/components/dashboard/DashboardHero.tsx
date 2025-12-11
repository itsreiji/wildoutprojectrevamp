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
  const { hero, saveHeroContent } = useContent();
  const [formData, setFormData] = useState({
    ...hero,
    stats: hero.stats || { events: '500+', members: '50K+', partners: '100+' }
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveHeroContent(formData);
      toast.success('Hero section updated successfully!');
    } catch (error) {
      toast.error('Failed to save hero section');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="admin-hero-container" className="space-y-6">
      {/* Header */}
      <div id="admin-hero-header">
        <h2 id="admin-hero-title" className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
          Hero Section
        </h2>
        <p id="admin-hero-subtitle" className="text-white/60">Manage the main landing page hero content</p>
      </div>

      {/* Hero Content */}
      <motion.div
        id="admin-hero-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card id="admin-hero-content-card" className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader id="admin-hero-content-card-header">
            <CardTitle id="admin-hero-content-card-title" className="flex items-center space-x-2">
              <Sparkles id="admin-hero-content-icon" className="h-5 w-5 text-[#E93370]" />
              <span id="admin-hero-content-label">Main Content</span>
            </CardTitle>
            <CardDescription id="admin-hero-content-card-description" className="text-white/60">
              Update the hero section that appears at the top of your landing page
            </CardDescription>
          </CardHeader>
          <CardContent id="admin-hero-content-card-content" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin-hero-title-input">Site Title</Label>
              <Input
                id="admin-hero-title-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/5 border-white/10 text-white text-2xl"
                placeholder="WildOut!"
              />
              <p id="admin-hero-title-help-text" className="text-xs text-white/40">Main brand name displayed prominently</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-hero-subtitle-input">Subtitle / Tagline</Label>
              <Input
                id="admin-hero-subtitle-input"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Media Digital Nightlife & Event Multi-Platform"
              />
              <p id="admin-hero-subtitle-help-text" className="text-xs text-white/40">Short tagline that appears below the title</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-hero-description-textarea">Description</Label>
              <Textarea
                id="admin-hero-description-textarea"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                placeholder="Indonesia's premier creative community..."
              />
              <p id="admin-hero-description-help-text" className="text-xs text-white/40">
                Detailed description of your platform (2-3 sentences)
              </p>
            </div>

            {/* Stats Section */}
            <div id="admin-hero-stats-section" className="pt-6 border-t border-white/10">
              <h3 id="admin-hero-stats-title" className="text-lg mb-4 text-white/90">Statistics Display</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-hero-stats-events-input">Events Count</Label>
                  <Input
                    id="admin-hero-stats-events-input"
                    value={typeof formData.stats === 'object' && formData.stats !== null && !Array.isArray(formData.stats) && 'events' in formData.stats ? String(formData.stats.events) : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stats: {
                          ...(typeof formData.stats === 'object' && formData.stats !== null && !Array.isArray(formData.stats) ? formData.stats : { events: '', members: '', partners: '' }),
                          events: e.target.value
                        },
                      })
                    }
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="500+"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-hero-stats-members-input">Members Count</Label>
                  <Input
                    id="admin-hero-stats-members-input"
                    value={typeof formData.stats === 'object' && formData.stats !== null && !Array.isArray(formData.stats) && 'members' in formData.stats ? String(formData.stats.members) : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stats: {
                          ...(typeof formData.stats === 'object' && formData.stats !== null && !Array.isArray(formData.stats) ? formData.stats : { events: '', members: '', partners: '' }),
                          members: e.target.value
                        },
                      })
                    }
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="50K+"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-hero-stats-partners-input">Partners Count</Label>
                  <Input
                    id="admin-hero-stats-partners-input"
                    value={typeof formData.stats === 'object' && formData.stats !== null && !Array.isArray(formData.stats) && 'partners' in formData.stats ? String(formData.stats.partners) : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stats: {
                          ...(typeof formData.stats === 'object' && formData.stats !== null && !Array.isArray(formData.stats) ? formData.stats : { events: '', members: '', partners: '' }),
                          partners: e.target.value
                        },
                      })
                    }
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="100+"
                  />
                </div>
              </div>
              <p id="admin-hero-stats-help-text" className="text-xs text-white/40 mt-2">
                These numbers are displayed in the hero section stats cards
              </p>
            </div>

            <Button
              id="admin-hero-save-button"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white shadow-lg shadow-[#E93370]/20 disabled:opacity-50"
            >
              <Save id="admin-hero-save-icon" className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Hero Section'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview */}
      <motion.div
        id="admin-hero-preview"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card id="admin-hero-preview-card" className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader id="admin-hero-preview-card-header">
            <CardTitle id="admin-hero-preview-title">Live Preview</CardTitle>
            <CardDescription id="admin-hero-preview-description" className="text-white/60">
              How your hero section will appear on the landing page
            </CardDescription>
          </CardHeader>
          <CardContent id="admin-hero-preview-card-content">
            <div id="admin-hero-preview-content" className="p-8 rounded-xl bg-black/40 border border-white/10 text-center space-y-6">
              <h1 id="admin-hero-preview-title-display" className="text-5xl tracking-tight bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
                {formData.title || 'Your Title'}
              </h1>
              <p id="admin-hero-preview-subtitle-display" className="text-xl text-white/80">
                {formData.subtitle || 'Your subtitle will appear here'}
              </p>
              <p id="admin-hero-preview-description-display" className="text-white/60 max-w-2xl mx-auto">
                {formData.description || 'Your description will appear here'}
              </p>
              <div id="admin-hero-preview-stats-grid" className="grid grid-cols-3 gap-4 pt-8 max-w-2xl mx-auto">
                <div id="admin-hero-preview-stats-events" className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div id="admin-hero-preview-stats-events-display" className="text-2xl text-[#E93370]">
                    {typeof formData.stats === 'object' && formData.stats !== null && !Array.isArray(formData.stats) && 'events' in formData.stats ? String(formData.stats.events) : '0'}
                  </div>
                  <div id="admin-hero-preview-stats-events-label" className="text-sm text-white/60">Events</div>
                </div>
                <div id="admin-hero-preview-stats-members" className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div id="admin-hero-preview-stats-members-display" className="text-2xl text-[#E93370]">
                    {typeof formData.stats === 'object' && formData.stats !== null && !Array.isArray(formData.stats) && 'members' in formData.stats ? String(formData.stats.members) : '0'}
                  </div>
                  <div id="admin-hero-preview-stats-members-label" className="text-sm text-white/60">Members</div>
                </div>
                <div id="admin-hero-preview-stats-partners" className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div id="admin-hero-preview-stats-partners-display" className="text-2xl text-[#E93370]">
                    {typeof formData.stats === 'object' && formData.stats !== null && !Array.isArray(formData.stats) && 'partners' in formData.stats ? String(formData.stats.partners) : '0'}
                  </div>
                  <div id="admin-hero-preview-stats-partners-label" className="text-sm text-white/60">Partners</div>
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
