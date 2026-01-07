import React, { useState } from 'react';
import { Upload, Link2, Image as ImageIcon, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
  compact?: boolean;
}

export const ImageUpload = React.memo(({
  value,
  onChange,
  label,
  placeholder = 'https://example.com/image.jpg',
  required = false,
  compact = false,
}: ImageUploadProps) => {
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="image" className="text-[10px] uppercase text-white/40 font-bold tracking-widest">
          {label} {required && <span className="text-[#E93370]">*</span>}
        </Label>
        {value && (
           <Button 
             variant="ghost" 
             size="sm" 
             onClick={() => onChange('')}
             className="h-6 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
           >
             <X className="w-3 h-3 mr-1" />
             Clear
           </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as 'url' | 'upload')} className="w-full">
        <TabsList className={`grid w-full grid-cols-2 bg-white/[0.03] border border-white/5 p-1.5 rounded-2xl mb-6 ${compact ? 'h-10 mb-4' : 'h-14'}`}>
          <TabsTrigger 
            value="url" 
            className="rounded-xl data-[state=active]:bg-[#E93370] data-[state=active]:text-white text-white/40 data-[state=active]:shadow-[0_0_20px_-5px_#E93370] transition-all duration-500 font-bold tracking-widest text-[10px] uppercase"
          >
            <Link2 className="h-4 w-4 mr-2" />
            URL Link
          </TabsTrigger>
          <TabsTrigger 
            value="upload" 
            className="rounded-xl data-[state=active]:bg-[#E93370] data-[state=active]:text-white text-white/40 data-[state=active]:shadow-[0_0_20px_-5px_#E93370] transition-all duration-500 font-bold tracking-widest text-[10px] uppercase"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </TabsTrigger>
        </TabsList>

        <div className="relative">
          <TabsContent value="url" className="space-y-4 m-0">
            <div className="relative group flex flex-col gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#E93370]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700" />
                <div className="relative">
                  <Input
                    id="image-url"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`bg-white/[0.02] border-white/5 text-white placeholder:text-white/10 pl-14 focus:border-[#E93370]/30 focus:bg-white/[0.05] rounded-xl transition-all w-full font-mono text-xs ${compact ? 'h-11' : 'h-14'}`}
                  />
                  <Link2 className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-[#E93370] transition-colors" />
                </div>
              </div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-mono text-center">
                :: PASTE DIRECT IMAGE LINK ::
              </p>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="m-0">
            <div 
              className={`relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden ${
                compact ? 'h-32' : 'h-48'
              } ${
                isDragging 
                  ? 'border-[#E93370] bg-[#E93370]/10 scale-[1.01]' 
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer z-10" />
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              
              <div className={`flex flex-col items-center justify-center text-center px-4 pointer-events-none z-20 ${compact ? 'pt-2 pb-3' : 'pt-5 pb-6'}`}>
                <div className={`rounded-2xl transition-all duration-500 ${compact ? 'p-2 mb-2' : 'p-4 mb-4'} ${isDragging ? 'bg-[#E93370] text-white shadow-[0_0_20px_#E93370]' : 'bg-white/5 text-white/20'}`}>
                   <Upload className={compact ? 'w-4 h-4' : 'w-6 h-6'} />
                </div>
                <p className={`text-white/60 font-bold tracking-tight ${compact ? 'text-xs mb-1' : 'text-sm mb-2'}`}>
                  <span className="text-[#E93370]">DRAG & DROP</span> OR CLICK
                </p>
                <p className="text-[9px] text-white/20 font-mono tracking-widest uppercase">PNG, JPG, GIF // MAX 10MB</p>
              </div>

              {/* Grid Pattern Background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

              {/* Scanning Effect */}
              {isDragging && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E93370]/20 to-transparent pointer-events-none z-30"
                  initial={{ top: '-100%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Preview */}
      <AnimatePresence>
        {value && (
          <div className="flex justify-center w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className={`${compact ? 'mt-4' : 'mt-6'} w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0A] relative group shadow-2xl`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
              
              <ImageWithFallback
                src={value}
                alt="Preview"
                className={`w-full object-cover transition-transform duration-1000 group-hover:scale-110 ${compact ? 'h-48' : 'h-72'}`}
              />
              
              {/* Overlay Content */}
              <div className={`absolute inset-0 z-20 flex flex-col justify-between ${compact ? 'p-4' : 'p-6'}`}>
                <div className="flex justify-end">
                  <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-[9px] font-black tracking-[0.2em] text-white/60">LIVE PREVIEW</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] w-8 bg-[#E93370]" />
                    <span className="text-[10px] font-black tracking-[0.4em] text-[#E93370] uppercase">Identity Card</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-white/40 text-[9px] font-mono truncate max-w-[200px]">{value.substring(0, 40)}...</p>
                    <div className={`rounded-full bg-[#E93370] text-white shadow-[0_0_15px_-3px_#E93370] scale-0 group-hover:scale-100 transition-transform duration-500 ${compact ? 'p-1.5' : 'p-2'}`}>
                      <ImageIcon size={compact ? 12 : 14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Scanning Line Effect on Hover */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <motion.div 
                  className="w-full h-[2px] bg-[#E93370]/50 shadow-[0_0_15px_#E93370]"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{ position: 'absolute' }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';
