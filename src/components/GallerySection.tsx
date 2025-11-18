import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { GalleryImage } from '@/types/content';
import { useContent } from '../contexts/ContentContext';

const SPAN_PATTERNS = [
  'col-span-2 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-1',
  'col-span-1 row-span-2',
  'col-span-1 row-span-1',
  'col-span-2 row-span-1',
];

export const GallerySection = React.memo(() => {
  const { gallery }: { gallery: GalleryImage[] } = useContent();
  const displayImages: GalleryImage[] = gallery.slice(0, 6);
  return (
    <section id="gallery" className="relative py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-4">
            <span className="bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
              Photo Moments
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Capturing unforgettable memories from our events and community gatherings
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {displayImages.map((image: GalleryImage, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`${SPAN_PATTERNS[index % SPAN_PATTERNS.length]} group relative overflow-hidden rounded-2xl`}
            >
              <div className="relative w-full h-full">
                <ImageWithFallback
                  src={image.url}
                  alt={image.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm">{image.caption}</p>
                    {image.event && <p className="text-white/60 text-xs mt-1">{image.event}</p>}
                  </div>
                </div>

                {/* Border Glow */}
                <div className="absolute inset-0 border-2 border-[#E93370]/0 group-hover:border-[#E93370]/50 rounded-2xl transition-all duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-white/60 mb-4">
            Want to see more? Follow us on social media for daily updates
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="#"
              className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 text-white transition-all duration-300"
            >
              Instagram
            </a>
            <a
              href="#"
              className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 text-white transition-all duration-300"
            >
              TikTok
            </a>
            <a
              href="#"
              className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 text-white transition-all duration-300"
            >
              Twitter
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

GallerySection.displayName = 'GallerySection';
