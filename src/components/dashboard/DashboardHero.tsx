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
    title: hero?.title || '',
    subtitle: hero?.subtitle || '',
    description: hero?.description || '',
    stats: (hero?.stats as any) || { events: '500+', members: '50K+', partners: '100+' },
    cta_text: hero?.cta_text || '',
    cta_link: hero?.cta_link || '',
    ...hero
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveHeroContent({
        ...formData,
        title: formData.title || 'WildOut!' // title is required
      });
      toast.success('Hero section updated successfully!');
    } catch (error) {
      toast.error('Failed to save hero section');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6" id="admin-hero-container">
      {/* Header */}
      <div id="admin-hero-header">
        <h2 className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent" id="admin-hero-title">
          Hero Section
        </h2>
        <p className="text-white/60" id="admin-hero-subtitle">Manage the main landing page hero content</p>
      </div>

      {/* Hero Content */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        id="admin-hero-content"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10" id="admin-hero-content-card">
          <CardHeader id="admin-hero-content-card-header">
            <CardTitle className="flex items-center space-x-2" id="admin-hero-content-card-title">
              <Sparkles className="h-5 w-5 text-[#E93370]" id="admin-hero-content-icon" />
              <span id="admin-hero-content-label">Main Content</span>
            </CardTitle>
            <CardDescription className="text-white/60" id="admin-hero-content-card-description">
              Update the hero section that appears at the top of your landing page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6" id="admin-hero-content-card-content">
            <div className="space-y-2">
              <Label htmlFor="admin-hero-title-input">Site Title</Label>
              <Input
                className="bg-white/5 border-white/10 text-white text-2xl focus-visible:ring-[#E93370] transition-colors"
                id="admin-hero-title-input"
                placeholder="WildOut!"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <p className="text-xs text-white/40" id="admin-hero-title-help-text">Main brand name displayed prominently</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-hero-subtitle-input">Subtitle / Tagline</Label>
              <Input
                className="bg-white/5 border-white/10 text-white focus-visible:ring-[#E93370] transition-colors"
                id="admin-hero-subtitle-input"
                placeholder="Media Digital Nightlife & Event Multi-Platform"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
              <p className="text-xs text-white/40" id="admin-hero-subtitle-help-text">Short tagline that appears below the title</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-hero-description-textarea">Description</Label>
              <Textarea
                className="bg-white/5 border-white/10 text-white min-h-[100px] focus-visible:ring-[#E93370] transition-colors"
                id="admin-hero-description-textarea"
                placeholder="Indonesia's premier creative community..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="text-xs text-white/40" id="admin-hero-description-help-text">
                Detailed description of your platform (2-3 sentences)
              </p>
            </div>

            {/* Stats Section */}
            <div className="pt-6 border-t border-white/10" id="admin-hero-stats-section">
              <h3 className="text-lg mb-4 text-white/90" id="admin-hero-stats-title">Statistics Display</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-hero-stats-events-input">Events Count</Label>
                  <Input
                    className="bg-white/5 border-white/10 text-white focus-visible:ring-[#E93370] transition-colors"
                    id="admin-hero-stats-events-input"
                    placeholder="500+"
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-hero-stats-members-input">Members Count</Label>
                  <Input
                    className="bg-white/5 border-white/10 text-white focus-visible:ring-[#E93370] transition-colors"
                    id="admin-hero-stats-members-input"
                    placeholder="50K+"
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-hero-stats-partners-input">Partners Count</Label>
                  <Input
                    className="bg-white/5 border-white/10 text-white focus-visible:ring-[#E93370] transition-colors"
                    id="admin-hero-stats-partners-input"
                    placeholder="100+"
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
                  />
                </div>
              </div>
              <p className="text-xs text-white/40 mt-2" id="admin-hero-stats-help-text">
                These numbers are displayed in the hero section stats cards
              </p>
            </div>

            <Button
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white shadow-lg shadow-[#E93370]/20 disabled:opacity-50 focus-visible:ring-[#E93370] transition-colors"
              disabled={isSaving}
              id="admin-hero-save-button"
              onClick={handleSave}
            >
              <Save className="mr-2 h-4 w-4" id="admin-hero-save-icon" />
              {isSaving ? 'Saving...' : 'Save Hero Section'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        id="admin-hero-preview"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10" id="admin-hero-preview-card">
          <CardHeader id="admin-hero-preview-card-header">
            <CardTitle id="admin-hero-preview-title">Live Preview</CardTitle>
            <CardDescription className="text-white/60" id="admin-hero-preview-description">
              How your hero section will appear on the landing page
            </CardDescription>
          </CardHeader>
          <CardContent id="admin-hero-preview-card-content">
            <div className="p-8 rounded-xl bg-black/40 border border-white/10 text-center space-y-6" id="admin-hero-preview-content">
              <h1 className="text-5xl tracking-normal bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent" id="admin-hero-preview-title-display">
                {formData.title || 'Your Title'}
              </h1>
              <p className="text-xl text-white/80" id="admin-hero-preview-subtitle-display">
                {formData.subtitle || 'Your subtitle will appear here'}
              </p>
              <p className="text-white/60 max-w-2xl mx-auto" id="admin-hero-preview-description-display">
                {formData.description || 'Your description will appear here'}
              </p>
              <div className="grid grid-cols-3 gap-4 pt-8 max-w-2xl mx-auto" id="admin-hero-preview-stats-grid">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10" id="admin-hero-preview-stats-events">
                  <div className="text-2xl text-[#E93370]" id="admin-hero-preview-stats-events-display">
                    {typeof formData.stats === 'object' && formData.stats !== null && !Array.isArray(formData.stats) && 'events' in formData.stats ? String(formData.stats.events) : '0'}
                  </div>
                  <div className="text-sm text-white/60" id="admin-hero-preview-stats-events-label">Events</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10" id="admin-hero-preview-stats-members">
                  <div className="text-2xl text-[#E93370]" id="admin-hero-preview-stats-members-display">
                    {typeof formData.stats === 'object' && formData.stats !== null && !Array.isArray(formData.stats) && 'members' in formData.stats ? String(formData.stats.members) : '0'}
                  </div>
                  <div className="text-sm text-white/60" id="admin-hero-preview-stats-members-label">Members</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10" id="admin-hero-preview-stats-partners">
                  <div className="text-2xl text-[#E93370]" id="admin-hero-preview-stats-partners-display">
                    {typeof formData.stats === 'object' && formData.stats !== null && !Array.isArray(formData.stats) && 'partners' in formData.stats ? String(formData.stats.partners) : '0'}
                  </div>
                  <div className="text-sm text-white/60" id="admin-hero-preview-stats-partners-label">Partners</div>
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
