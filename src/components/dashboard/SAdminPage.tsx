import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useContent } from '../../contexts/ContentContext';
import type { Json } from '@/types/content';

type SectionData = Record<string, any>;

export const SAdminPage = () => {
  const { publicContent, updatePublicContent } = useContent();
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'settings'>('hero');
  const [formData, setFormData] = useState<SectionData>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync formData with publicContent
    setFormData({
      hero: publicContent.hero || { title: '', subtitle: '', description: '', stats: {}, ctaText: '', ctaLink: '' },
      about: publicContent.about || { title: '', subtitle: '', foundedYear: '', story: [], features: [] },
      settings: publicContent.settings || { siteName: '', tagline: '', email: '', phone: '', address: '', socialMedia: {} }
    });
  }, [publicContent]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof SectionData],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section: string, field: string, index: number, value: string) => {
    setFormData(prev => {
      const arr = prev[section as keyof SectionData][field as keyof SectionData] as string[];
      const newArr = [...arr];
      newArr[index] = value;
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof SectionData],
          [field]: newArr
        }
      };
    });
  };

  const handleSubmit = async (section: string) => {
    setLoading(true);
    try {
      await updatePublicContent(section, formData[section]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sectionData = formData[activeTab as keyof typeof formData] || {};

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-[#E93370] bg-clip-text text-transparent">
        Site Content Admin (/sadmin)
      </h1>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border-white/10 rounded-2xl p-1">
          <TabsTrigger value="hero" className="data-[state=active]:bg-white data-[state=active]:text-black rounded-xl">Hero</TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:text-black rounded-xl">About</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:text-black rounded-xl">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="hero" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle>Hero Section Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input value={sectionData.title || ''} onChange={(e) => handleInputChange('hero', 'title', e.target.value)} />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Input value={sectionData.subtitle || ''} onChange={(e) => handleInputChange('hero', 'subtitle', e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={sectionData.description || ''} onChange={(e) => handleInputChange('hero', 'description', e.target.value)} rows={4} />
              </div>
              <div>
                <Label>CTA Text</Label>
                <Input value={sectionData.ctaText || ''} onChange={(e) => handleInputChange('hero', 'ctaText', e.target.value)} />
              </div>
              <div>
                <Label>CTA Link</Label>
                <Input value={sectionData.ctaLink || ''} onChange={(e) => handleInputChange('hero', 'ctaLink', e.target.value)} />
              </div>
              <Button onClick={() => handleSubmit('hero')} disabled={loading} className="bg-[#E93370] hover:bg-[#E93370]/90">
                {loading ? 'Saving...' : 'Save Hero'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="about" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle>About Section Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input value={sectionData.title || ''} onChange={(e) => handleInputChange('about', 'title', e.target.value)} />
                </div>
                <div>
                  <Label>Founded Year</Label>
                  <Input value={sectionData.foundedYear || ''} onChange={(e) => handleInputChange('about', 'foundedYear', e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input value={sectionData.subtitle || ''} onChange={(e) => handleInputChange('about', 'subtitle', e.target.value)} />
              </div>
              <div>
                <Label>Story (JSON array)</Label>
                <Textarea value={JSON.stringify(sectionData.story || [], null, 2)} onChange={(e) => handleInputChange('about', 'story', JSON.parse(e.target.value))} rows={6} />
              </div>
              <Button onClick={() => handleSubmit('about')} disabled={loading} className="bg-[#E93370] hover:bg-[#E93370]/90">
                {loading ? 'Saving...' : 'Save About'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="mt-6">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Site Name</Label>
                  <Input value={sectionData.siteName || ''} onChange={(e) => handleInputChange('settings', 'siteName', e.target.value)} />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input value={sectionData.tagline || ''} onChange={(e) => handleInputChange('settings', 'tagline', e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={sectionData.email || ''} onChange={(e) => handleInputChange('settings', 'email', e.target.value)} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={sectionData.phone || ''} onChange={(e) => handleInputChange('settings', 'phone', e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input value={sectionData.address || ''} onChange={(e) => handleInputChange('settings', 'address', e.target.value)} />
              </div>
              <Button onClick={() => handleSubmit('settings')} disabled={loading} className="bg-[#E93370] hover:bg-[#E93370]/90">
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
