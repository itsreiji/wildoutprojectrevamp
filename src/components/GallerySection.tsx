import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
  const { gallery, events } = useContent();
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  const filteredGallery = useMemo(() => {
    if (selectedEventId === 'all') return gallery;
    return gallery.filter((item) => item.event_id === selectedEventId);
  }, [gallery, selectedEventId]);

  const displayImages = filteredGallery.slice(0, 6);
  return (
    <section className="relative py-20 px-4" id="gallery-section">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-4 tracking-normal">
            <span className="bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
              Photo Moments
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Capturing unforgettable memories from our events and community gatherings
          </p>
        </motion.div>

        {/* Event Filter */}
        <div className="flex justify-center mb-8">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-[280px] bg-white/5 border-white/20 text-white">
              <SelectValue placeholder="Filter by event (optional)" />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-black/95 border-white/10 text-white">
              <SelectItem value="all">All Events</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id || ''}>
                  {event.title || 'Untitled Event'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {displayImages.map((image, index) => (
            <motion.div
              key={index}
              className={`${SPAN_PATTERNS[index % SPAN_PATTERNS.length]} group relative overflow-hidden rounded-2xl`}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, scale: 1 }}
            >
              <div className="relative w-full h-full">
                <ImageWithFallback
                  alt={image.title || image.description || 'Gallery image'}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src={image.image_url || "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800"}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm">{image.title || image.description || ''}</p>
                    {image.event_id && events.find(e => e.id === image.event_id) && (
                      <p className="text-white/60 text-xs mt-1">{events.find(e => e.id === image.event_id)?.title}</p>
                    )}
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
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <p className="text-white/60 mb-4">
            Want to see more? Follow us on social media for daily updates
          </p>
          <div className="flex justify-center gap-4">
            <a
              className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 text-white transition-all duration-300"
              href="#"
            >
              Instagram
            </a>
            <a
              className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 text-white transition-all duration-300"
              href="#"
            >
              TikTok
            </a>
            <a
              className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 text-white transition-all duration-300"
              href="#"
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
