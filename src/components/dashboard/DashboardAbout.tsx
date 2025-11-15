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

export const DashboardAbout = React.memo(() => {
  const { about, saveAboutContent } = useContent();
  const [formData, setFormData] = useState(about);
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
      story: [...formData.story, ''],
    });
  };

  const handleUpdateStoryParagraph = (index: number, value: string) => {
    const newStory = [...formData.story];
    newStory[index] = value;
    setFormData({ ...formData, story: newStory });
  };

  const handleRemoveStoryParagraph = (index: number) => {
    setFormData({
      ...formData,
      story: formData.story.filter((_, i) => i !== index),
    });
  };

  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { title: '', description: '' }],
    });
  };

  const handleUpdateFeature = (index: number, field: 'title' | 'description', value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index][field] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl mb-1 bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
          About Section
        </h2>
        <p className="text-white/60">Manage the About Us content - changes sync to landing page instantly</p>
      </div>

      {/* Basic Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-[#E93370]" />
              <span>Basic Information</span>
            </CardTitle>
            <CardDescription className="text-white/60">
              Update the main heading and subtitle for your About section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Section Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="About WildOut!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                placeholder="A brief introduction about your organization..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foundedYear">Founded Year</Label>
              <Input
                id="foundedYear"
                value={formData.foundedYear}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Our Story</CardTitle>
                <CardDescription className="text-white/60">
                  Tell your organization's story in multiple paragraphs
                </CardDescription>
              </div>
              <Button
                onClick={handleAddStoryParagraph}
                size="sm"
                className="bg-[#E93370] hover:bg-[#E93370]/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Paragraph
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.story.map((paragraph, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`story-${index}`}>Paragraph {index + 1}</Label>
                  <Button
                    onClick={() => handleRemoveStoryParagraph(index)}
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  id={`story-${index}`}
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Key Features</CardTitle>
                <CardDescription className="text-white/60">
                  Highlight what makes your organization unique
                </CardDescription>
              </div>
              <Button
                onClick={handleAddFeature}
                size="sm"
                className="bg-[#E93370] hover:bg-[#E93370]/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Feature
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.features.map((feature, index) => (
              <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white/90">Feature {index + 1}</h4>
                  <Button
                    onClick={() => handleRemoveFeature(index)}
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`feature-title-${index}`}>Title</Label>
                  <Input
                    id={`feature-title-${index}`}
                    value={feature.title}
                    onChange={(e) => handleUpdateFeature(index, 'title', e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Feature title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`feature-desc-${index}`}>Description</Label>
                  <Textarea
                    id={`feature-desc-${index}`}
                    value={feature.description}
                    onChange={(e) => handleUpdateFeature(index, 'description', e.target.value)}
                    className="bg-white/5 border-white/10 text-white min-h-[80px]"
                    placeholder="Feature description..."
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#E93370] hover:bg-[#E93370]/90 text-white shadow-lg shadow-[#E93370]/20 disabled:opacity-50"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save About Section'}
        </Button>
      </div>
    </div>
  );
});

DashboardAbout.displayName = 'DashboardAbout';
