import React, { useState } from 'react';
import { Upload, Link2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export const ImageUpload = React.memo(({
  value,
  onChange,
  label,
  placeholder = 'https://example.com/image.jpg',
  required = false,
}: ImageUploadProps) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image">
        {label} {required && <span className="text-[#E93370]">*</span>}
      </Label>
      
      <Tabs value={activeTab} onValueChange={(v: 'url' | 'upload') => setActiveTab(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/10">
          <TabsTrigger value="url" className="data-[state=active]:bg-[#E93370]">
            <Link2 className="h-4 w-4 mr-2" />
            URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="data-[state=active]:bg-[#E93370]">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-2 mt-2">
          <Input
            id="image-url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <p className="text-xs text-white/40">
            Enter the direct URL to your image
          </p>
        </TabsContent>

        <TabsContent value="upload" className="space-y-2 mt-2">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-xl cursor-pointer bg-white/10 hover:bg-white/15 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-white/40" />
                <p className="mb-2 text-sm text-white/60">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-white/40">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </label>
          </div>
          <p className="text-xs text-white/40">
            Upload an image file from your computer
          </p>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {value && (
        <div className="mt-3 rounded-xl overflow-hidden border border-white/20">
          <ImageWithFallback
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
        </div>
      )}
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';
