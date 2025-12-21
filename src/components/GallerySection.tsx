import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Camera } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { H2, BodyText, SmallText } from './ui/typography';
import { useContent } from '../contexts/ContentContext';

const SPAN_PATTERNS = [
  'md:col-span-2 md:row-span-2',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-1',
  'md:col-span-1 md:row-span-2',
  'md:col-span-1 md:row-span-1',
  'md:col-span-2 md:row-span-1',
];

export const GallerySection = React.memo(() => {
  const { gallery, events, settings } = useContent();
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  const socialMedia = (settings?.social_media as Record<string, string>) || {};

  const filteredGallery = useMemo(() => {
    if (selectedEventId === 'all') return gallery;
    return gallery.filter((item) => item.event_id === selectedEventId);
  }, [gallery, selectedEventId]);

  const displayImages = filteredGallery.slice(0, 6);
  return (
    <section className="relative py-32 px-4 overflow-hidden" id="gallery-section">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E93370]/10 border border-[#E93370]/20 text-[#E93370] text-xs font-medium mb-6 uppercase tracking-wider"
          >
            <Camera className="w-3 h-3" />
            <span>Visual Journey</span>
          </motion.div>
          <H2 gradient="from-white via-[#E93370] to-white" className="mb-6">
            Photo Moments
          </H2>
          <BodyText className="text-white/60 max-w-2xl mx-auto">
            Capturing unforgettable memories from our events and community gatherings
          </BodyText>
        </motion.div>

        {/* Event Filter */}
        <div className="flex justify-center mb-8">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger
              className="w-full max-w-[280px] bg-white/5 border-white/20 text-white"
              aria-label="Filter gallery by event"
            >
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px] md:auto-rows-[200px]">
          {displayImages.map((image, index) => (
            <motion.div
              key={index}
              className={`${SPAN_PATTERNS[index % SPAN_PATTERNS.length]} group relative overflow-hidden rounded-2xl h-[250px] md:h-auto focus:outline-none`}
              initial={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, scale: 1 }}
              role="article"
              tabIndex={0}
              aria-label={`Gallery photo: ${image.title || image.description || 'Moment'}`}
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
                    <SmallText className="text-white">{image.title || image.description || ''}</SmallText>
                    {image.event_id && events.find(e => e.id === image.event_id) && (
                      <SmallText className="text-white/60 mt-1">{events.find(e => e.id === image.event_id)?.title}</SmallText>
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
          <BodyText className="text-white/60 mb-4">
            Want to see more? Follow us on social media for daily updates
          </BodyText>
          <div className="flex justify-center gap-4">
            {socialMedia.instagram && (
              <a
                className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 text-white transition-all duration-300"
                href={socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            )}
            {socialMedia.tiktok && (
              <a
                className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 text-white transition-all duration-300"
                href={socialMedia.tiktok}
                target="_blank"
                rel="noopener noreferrer"
              >
                TikTok
              </a>
            )}
            {socialMedia.twitter && (
              <a
                className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 text-white transition-all duration-300"
                href={socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
});

GallerySection.displayName = 'GallerySection';
