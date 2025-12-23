import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Plus, Trash2, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useEnhancedStaticContent } from '../../contexts/EnhancedStaticContentContext';
import { toast } from 'sonner';
import type { Feature } from '@/types/content';

export const DashboardAbout = React.memo(() => {
  const { about, saveAboutContent, loading: contentLoading } = useEnhancedStaticContent();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    founded_year: '',
    story: [] as string[],
    features: [] as Feature[],
    created_at: null as string | null,
    updated_at: null as string | null,
    updated_by: null as string | null,
    id: "00000000-0000-0000-0000-000000000002"
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync form data when about content loads - only once
  useEffect(() => {
    if (about && !isInitialized) {
      console.log('DashboardAbout: Initializing form with content', { id: about.id });
      setFormData({
        title: about.title || '',
        subtitle: about.subtitle || '',
        founded_year: about.founded_year || '',
        story: Array.isArray(about.story) ? (about.story as string[]) : [],
        features: Array.isArray(about.features) ? (about.features as any as Feature[]) : [],
        created_at: about.created_at || null,
        updated_at: about.updated_at || null,
        updated_by: about.updated_by || null,
        id: about.id || "00000000-0000-0000-0000-000000000002"
      });
      setIsInitialized(true);
    }
  }, [about, isInitialized]);

  const handleSave = async () => {
    if (isSaving || !isInitialized) return;

    // Basic validation to prevent saving empty data if somehow initialized with nothing
    if (!formData.title && (!formData.story || formData.story.length === 0)) {
      toast.error('Cannot save empty about content');
      return;
    }

    setIsSaving(true);
    try {
      console.log('DashboardAbout: Attempting to save content', formData);
      // Prepare data in the format expected by AboutContent type
      const saveData = {
        id: formData.id || "00000000-0000-0000-0000-000000000002",
        title: formData.title || 'About',
        subtitle: formData.subtitle || '',
        founded_year: formData.founded_year || '',
        story: formData.story || [],
        features: formData.features || [],
        created_at: formData.created_at,
        updated_at: formData.updated_at,
        updated_by: formData.updated_by,
      };

      await saveAboutContent(saveData);
      toast.success('About section updated successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to save about section';
      toast.error(errorMessage);
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStoryParagraph = () => {
    setFormData({
      ...formData,
      story: formData.story ? [...formData.story, ''] : [''],
    });
  };

  const handleUpdateStoryParagraph = (index: number, value: string) => {
    const newStory = formData.story ? [...formData.story] : [];
    newStory[index] = value;
    setFormData({ ...formData, story: newStory });
  };

  const handleRemoveStoryParagraph = (index: number) => {
    setFormData({
      ...formData,
      story: formData.story ? formData.story.filter((_, i) => i !== index) : [],
    });
  };

  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features: Array.isArray(formData.features) ? [...formData.features, { title: '', description: '' }] : [{ title: '', description: '' }],
    });
  };

  const handleUpdateFeature = (index: number, field: 'title' | 'description', value: string) => {
    const newFeatures = Array.isArray(formData.features) ? [...formData.features] : [];
    if (newFeatures[index]) {
      (newFeatures[index] as Feature)[field] = value;
    } else {
      newFeatures[index] = { title: '', description: '' };
      (newFeatures[index] as Feature)[field] = value;
    }
    setFormData({ ...formData, features: newFeatures });
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: Array.isArray(formData.features) ? formData.features.filter((_, i) => i !== index) : [],
    });
  };

  if (contentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E93370]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="admin-about-container">
      {/* Header */}
      <div id="admin-about-header">
        <h2 className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent" id="admin-about-title">
          About Section
        </h2>
        <p className="text-white/60" id="admin-about-subtitle">Manage the About Us content - changes sync to landing page instantly</p>
      </div>

      {/* Basic Info */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        id="admin-about-basic-info"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10" id="admin-about-basic-info-card">
          <CardHeader id="admin-about-basic-info-card-header">
            <CardTitle className="flex items-center space-x-2" id="admin-about-basic-info-card-title">
              <Info className="h-5 w-5 text-[#E93370]" id="admin-about-basic-info-icon" />
              <span id="admin-about-basic-info-label">Basic Information</span>
            </CardTitle>
            <CardDescription className="text-white/60" id="admin-about-basic-info-card-description">
              Update the main heading and subtitle for your About section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6" id="admin-about-basic-info-card-content">
            <div className="space-y-2">
              <Label htmlFor="admin-about-section-title-input">Section Title</Label>
              <Input
                className="bg-white/5 border-white/10 text-white focus-visible:ring-[#E93370] transition-colors"
                id="admin-about-section-title-input"
                placeholder="About WildOut!"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-about-subtitle-textarea">Subtitle</Label>
              <Textarea
                className="bg-white/5 border-white/10 text-white min-h-[100px] focus-visible:ring-[#E93370] transition-colors"
                id="admin-about-subtitle-textarea"
                placeholder="A brief introduction about your organization..."
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-about-founded-year-input">Founded Year</Label>
              <Input
                className="bg-white/5 border-white/10 text-white focus-visible:ring-[#E93370] transition-colors"
                id="admin-about-founded-year-input"
                placeholder="2020"
                value={formData.founded_year || ''}
                onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Story Paragraphs */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        id="admin-about-story"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10" id="admin-about-story-card">
          <CardHeader id="admin-about-story-card-header">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle id="admin-about-story-title">Our Story</CardTitle>
                <CardDescription className="text-white/60" id="admin-about-story-description">
                  Tell your organization's story in multiple paragraphs
                </CardDescription>
              </div>
              <Button
                className="bg-[#E93370] hover:bg-[#E93370]/90 text-white"
                id="admin-about-story-add-button"
                size="sm"
                onClick={handleAddStoryParagraph}
              >
                <Plus className="mr-2 h-4 w-4" id="admin-about-story-add-icon" />
                Add Paragraph
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4" id="admin-about-story-card-content">
            {(formData.story || []).map((paragraph: string, index: number) => (
              <div key={`admin-about-story-paragraph-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`admin-about-story-paragraph-${index}-textarea`}>Paragraph {index + 1}</Label>
                  <Button
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8"
                    id={`admin-about-story-paragraph-${index}-remove-button`}
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveStoryParagraph(index)}
                  >
                    <Trash2 className="h-4 w-4" id={`admin-about-story-paragraph-${index}-remove-icon`} />
                  </Button>
                </div>
                <Textarea
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  id={`admin-about-story-paragraph-${index}-textarea`}
                  placeholder="Write a paragraph about your story..."
                  value={paragraph}
                  onChange={(e) => handleUpdateStoryParagraph(index, e.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Features */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        id="admin-about-features"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10" id="admin-about-features-card">
          <CardHeader id="admin-about-features-card-header">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle id="admin-about-features-title">Key Features</CardTitle>
                <CardDescription className="text-white/60" id="admin-about-features-description">
                  Highlight what makes your organization unique
                </CardDescription>
              </div>
              <Button
                className="bg-[#E93370] hover:bg-[#E93370]/90 text-white"
                id="admin-about-features-add-button"
                size="sm"
                onClick={handleAddFeature}
              >
                <Plus className="mr-2 h-4 w-4" id="admin-about-features-add-icon" />
                Add Feature
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6" id="admin-about-features-card-content">
            {(Array.isArray(formData.features) ? formData.features : []).map((feature: any, index: number) => {
              const featureObj = feature as Feature;
              return (
              <div key={`admin-about-feature-${index}`} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4" id={`admin-about-feature-${index}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-white/90" id={`admin-about-feature-${index}-title`}>Feature {index + 1}</h4>
                  <Button
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8"
                    id={`admin-about-feature-${index}-remove-button`}
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    <Trash2 className="h-4 w-4" id={`admin-about-feature-${index}-remove-icon`} />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`admin-about-feature-${index}-title-input`}>Title</Label>
                  <Input
                    className="bg-white/5 border-white/10 text-white"
                    id={`admin-about-feature-${index}-title-input`}
                    placeholder="Feature title..."
                    value={featureObj.title}
                    onChange={(e) => handleUpdateFeature(index, 'title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`admin-about-feature-${index}-desc-textarea`}>Description</Label>
                  <Textarea
                    className="bg-white/5 border-white/10 text-white min-h-[80px] focus-visible:ring-[#E93370] transition-colors"
                    id={`admin-about-feature-${index}-desc-textarea`}
                    placeholder="Feature description..."
                    value={featureObj.description}
                    onChange={(e) => handleUpdateFeature(index, 'description', e.target.value)}
                  />
                </div>
              </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end" id="admin-about-actions">
        <Button
          className="bg-[#E93370] hover:bg-[#E93370]/90 text-white shadow-lg shadow-[#E93370]/20 disabled:opacity-50"
          disabled={isSaving}
          id="admin-about-save-button"
          onClick={handleSave}
        >
          <Save className="mr-2 h-4 w-4" id="admin-about-save-icon" />
          {isSaving ? 'Saving...' : 'Save About Section'}
        </Button>
      </div>
    </div>
  );
});

DashboardAbout.displayName = 'DashboardAbout';
