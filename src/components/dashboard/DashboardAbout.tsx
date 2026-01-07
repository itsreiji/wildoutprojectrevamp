import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Plus, Trash2, Info, BookOpen, Star, GripVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useContent } from '../../contexts/ContentContextCore';
import { toast } from 'sonner';

export const DashboardAbout = React.memo(() => {
  const { about, updateAbout } = useContent();
  const [formData, setFormData] = useState(about);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAbout(formData);
      toast.success('About section updated successfully!');
    } catch (error) {
      toast.error('Failed to update About section');
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-2">ABOUT CONFIG</h1>
          <p className="text-white/40 font-mono text-sm">:: COMPANY IDENTITY & NARRATIVE ::</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Basic Info & Story */}
        <div className="xl:col-span-2 space-y-8">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#E93370]/30 transition-colors duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-[#E93370]/10 text-[#E93370]">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                <p className="text-xs text-white/40 font-mono">CORE IDENTITY PARAMETERS</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Section Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#E93370]/50 focus:ring-[#E93370]/20 h-11"
                    placeholder="About WildOut!"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundedYear" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    value={formData.foundedYear}
                    onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
                    className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#E93370]/50 focus:ring-[#E93370]/20 h-11 text-center font-mono"
                    placeholder="2020"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Subtitle / Introduction</Label>
                <Textarea
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="bg-[#0A0A0A] border-white/10 text-white focus:border-[#E93370]/50 focus:ring-[#E93370]/20 min-h-[80px]"
                  placeholder="A brief introduction about your organization..."
                />
              </div>
            </div>
          </motion.div>

          {/* Story Paragraphs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#E93370]/30 transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Our Story</h3>
                  <p className="text-xs text-white/40 font-mono">NARRATIVE CONTENT BLOCKS</p>
                </div>
              </div>
              <Button
                onClick={handleAddStoryParagraph}
                size="sm"
                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
              >
                <Plus className="mr-2 h-3 w-3" />
                ADD PARAGRAPH
              </Button>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {formData.story.map((paragraph, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group relative"
                  >
                    <div className="absolute -left-3 top-4 text-white/20">
                       <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="space-y-2 pl-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`story-${index}`} className="text-xs font-mono text-white/40">
                          PARAGRAPH {index + 1}
                        </Label>
                        <Button
                          onClick={() => handleRemoveStoryParagraph(index)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Textarea
                        id={`story-${index}`}
                        value={paragraph}
                        onChange={(e) => handleUpdateStoryParagraph(index, e.target.value)}
                        className="bg-black/40 border-white/10 text-white focus:border-purple-500/50 focus:ring-purple-500/20 min-h-[100px]"
                        placeholder="Write a paragraph about your story..."
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {formData.story.length === 0 && (
                 <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl text-white/30">
                    <p>No story content yet.</p>
                    <Button variant="link" onClick={handleAddStoryParagraph} className="text-[#E93370]">Add your first paragraph</Button>
                 </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="xl:col-span-1"
        >
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#E93370]/30 transition-colors duration-300 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Key Features</h3>
                  <p className="text-xs text-white/40 font-mono">HIGHLIGHTS</p>
                </div>
              </div>
              <Button
                onClick={handleAddFeature}
                size="icon"
                className="h-8 w-8 bg-[#E93370]/20 text-[#E93370] hover:bg-[#E93370] hover:text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[calc(100vh-300px)]">
              <AnimatePresence mode="popLayout">
                {formData.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-colors group relative"
                  >
                    <div className="space-y-3">
                       <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-[10px] font-mono text-white/60">
                               {index + 1}
                            </span>
                            <Input
                              value={feature.title}
                              onChange={(e) => handleUpdateFeature(index, 'title', e.target.value)}
                              className="bg-transparent border-none text-white font-medium placeholder:text-white/20 focus:ring-0 p-0 h-auto"
                              placeholder="Feature Title"
                            />
                          </div>
                          <Button
                            onClick={() => handleRemoveFeature(index)}
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                       </div>
                      <Textarea
                        value={feature.description}
                        onChange={(e) => handleUpdateFeature(index, 'description', e.target.value)}
                        className="bg-white/5 border-white/5 text-white/80 text-sm focus:border-yellow-500/50 focus:ring-yellow-500/20 min-h-[60px] resize-none"
                        placeholder="Feature description..."
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {formData.features.length === 0 && (
                 <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl text-white/30">
                    <Star className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Add key features to highlight</p>
                 </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

DashboardAbout.displayName = 'DashboardAbout';
