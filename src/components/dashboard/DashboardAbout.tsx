import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, Plus, Trash2, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useContent } from '../../contexts/ContentContext';
import { toast } from 'sonner';
import type { Feature } from '@/types/content';

export const DashboardAbout = React.memo(() => {
  const { about, saveAboutContent } = useContent();
  const [formData, setFormData] = useState({
    ...about,
    foundedYear: about.founded_year || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveAboutContent(formData);
      toast.success('About section updated successfully!');
    } catch (error) {
      toast.error('Failed to save about section');
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

  return (
    <div id="admin-about-container" className="space-y-6">
      {/* Header */}
      <div id="admin-about-header">
        <h2 id="admin-about-title" className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
          About Section
        </h2>
        <p id="admin-about-subtitle" className="text-white/60">Manage the About Us content - changes sync to landing page instantly</p>
      </div>

      {/* Basic Info */}
      <motion.div
        id="admin-about-basic-info"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card id="admin-about-basic-info-card" className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader id="admin-about-basic-info-card-header">
            <CardTitle id="admin-about-basic-info-card-title" className="flex items-center space-x-2">
              <Info id="admin-about-basic-info-icon" className="h-5 w-5 text-[#E93370]" />
              <span id="admin-about-basic-info-label">Basic Information</span>
            </CardTitle>
            <CardDescription id="admin-about-basic-info-card-description" className="text-white/60">
              Update the main heading and subtitle for your About section
            </CardDescription>
          </CardHeader>
          <CardContent id="admin-about-basic-info-card-content" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin-about-section-title-input">Section Title</Label>
              <Input
                id="admin-about-section-title-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="About WildOut!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-about-subtitle-textarea">Subtitle</Label>
              <Textarea
                id="admin-about-subtitle-textarea"
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                placeholder="A brief introduction about your organization..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-about-founded-year-input">Founded Year</Label>
              <Input
                id="admin-about-founded-year-input"
                value={formData.foundedYear || ''}
                onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="2020"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Story Paragraphs */}
      <motion.div
        id="admin-about-story"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card id="admin-about-story-card" className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader id="admin-about-story-card-header">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle id="admin-about-story-title">Our Story</CardTitle>
                <CardDescription id="admin-about-story-description" className="text-white/60">
                  Tell your organization's story in multiple paragraphs
                </CardDescription>
              </div>
              <Button
                id="admin-about-story-add-button"
                onClick={handleAddStoryParagraph}
                size="sm"
                className="bg-[#E93370] hover:bg-[#E93370]/90 text-white"
              >
                <Plus id="admin-about-story-add-icon" className="mr-2 h-4 w-4" />
                Add Paragraph
              </Button>
            </div>
          </CardHeader>
          <CardContent id="admin-about-story-card-content" className="space-y-4">
            {(formData.story || []).map((paragraph: string, index: number) => (
              <div key={`admin-about-story-paragraph-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`admin-about-story-paragraph-${index}-textarea`}>Paragraph {index + 1}</Label>
                  <Button
                    id={`admin-about-story-paragraph-${index}-remove-button`}
                    onClick={() => handleRemoveStoryParagraph(index)}
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8"
                  >
                    <Trash2 id={`admin-about-story-paragraph-${index}-remove-icon`} className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id={`admin-about-story-paragraph-${index}-textarea`}
                  value={paragraph}
                  onChange={(e) => handleUpdateStoryParagraph(index, e.target.value)}
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  placeholder="Write a paragraph about your story..."
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Features */}
      <motion.div
        id="admin-about-features"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card id="admin-about-features-card" className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader id="admin-about-features-card-header">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle id="admin-about-features-title">Key Features</CardTitle>
                <CardDescription id="admin-about-features-description" className="text-white/60">
                  Highlight what makes your organization unique
                </CardDescription>
              </div>
              <Button
                id="admin-about-features-add-button"
                onClick={handleAddFeature}
                size="sm"
                className="bg-[#E93370] hover:bg-[#E93370]/90 text-white"
              >
                <Plus id="admin-about-features-add-icon" className="mr-2 h-4 w-4" />
                Add Feature
              </Button>
            </div>
          </CardHeader>
          <CardContent id="admin-about-features-card-content" className="space-y-6">
            {(Array.isArray(formData.features) ? formData.features : []).map((feature: any, index: number) => {
              const featureObj = feature as Feature;
              return (
              <div key={`admin-about-feature-${index}`} id={`admin-about-feature-${index}`} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 id={`admin-about-feature-${index}-title`} className="text-white/90">Feature {index + 1}</h4>
                  <Button
                    id={`admin-about-feature-${index}-remove-button`}
                    onClick={() => handleRemoveFeature(index)}
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8"
                  >
                    <Trash2 id={`admin-about-feature-${index}-remove-icon`} className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`admin-about-feature-${index}-title-input`}>Title</Label>
                  <Input
                    id={`admin-about-feature-${index}-title-input`}
                    value={featureObj.title}
                    onChange={(e) => handleUpdateFeature(index, 'title', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Feature title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`admin-about-feature-${index}-desc-textarea`}>Description</Label>
                  <Textarea
                    id={`admin-about-feature-${index}-desc-textarea`}
                    value={featureObj.description}
                    onChange={(e) => handleUpdateFeature(index, 'description', e.target.value)}
                    className="bg-white/5 border-white/10 text-white min-h-[80px]"
                    placeholder="Feature description..."
                  />
                </div>
              </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <div id="admin-about-actions" className="flex justify-end">
        <Button
          id="admin-about-save-button"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#E93370] hover:bg-[#E93370]/90 text-white shadow-lg shadow-[#E93370]/20 disabled:opacity-50"
        >
          <Save id="admin-about-save-icon" className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save About Section'}
        </Button>
      </div>
    </div>
  );
});

DashboardAbout.displayName = 'DashboardAbout';
