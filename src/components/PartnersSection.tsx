import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Handshake } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { H2, H3, BodyText, LeadText, SmallText } from './ui/typography';
import { useContent } from '../contexts/ContentContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const PartnersSection = React.memo(() => {
  const { partners, settings } = useContent();
  const [filterTier, setFilterTier] = useState<string>('all');

  const tierOrder: Record<string, number> = {
    platinum: 4,
    gold: 3,
    silver: 2,
    bronze: 1,
  };

  let filteredPartners = partners.filter(p => p.status === 'active');
  if (filterTier !== 'all') {
    filteredPartners = filteredPartners.filter(p => ((p as any).sponsorship_level ?? 'bronze') === filterTier);
  }

  // Sort by tier descending (platinum first)
  filteredPartners.sort((a, b) => {
    const tierA = tierOrder[(a as any).sponsorship_level ?? 'bronze'] ?? 0;
    const tierB = tierOrder[(b as any).sponsorship_level ?? 'bronze'] ?? 0;
    return tierB - tierA;
  });

  const activePartners = filteredPartners;
  return (
    <section className="relative py-32 px-4 overflow-hidden" id="partners-section">
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
            <Handshake className="w-3 h-3" />
            <span>Our Network</span>
          </motion.div>
          <H2 gradient="from-white via-[#E93370] to-white" className="mb-6">
            Trusted Partners
          </H2>
          <LeadText className="text-white/60 max-w-2xl mx-auto">
            Collaborating with leading brands to deliver exceptional experiences
          </LeadText>
        </motion.div>

        {/* Tier Filter */}
        <div className="flex justify-center mb-8">
          <Select value={filterTier} onValueChange={setFilterTier}>
            <SelectTrigger
              className="w-[180px] bg-white/10 border-white/20 text-white"
              aria-label="Filter partners by tier"
            >
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {activePartners.map((partner, index) => (
            <motion.div
              key={index}
              className="group relative focus:outline-none"
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
              role="article"
              tabIndex={0}
              aria-label={`Partner: ${partner.name}`}
            >
              <div className="aspect-square p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-500 flex flex-col items-center justify-center overflow-hidden">
                {/* Logo */}
                <div className="w-full h-full flex items-center justify-center mb-2">
                  {partner.logo_url ? (
                    <ImageWithFallback
                      alt={partner.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                      src={partner.logo_url}
                    />
                  ) : (
                    <div className="text-3xl md:text-4xl text-white/80 group-hover:text-[#E93370] transition-colors duration-300">
                      {partner.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Partner Info */}
                <div className="text-center">
                  <BodyText className="text-white group-hover:text-[#E93370] transition-colors duration-300">
                    {partner.name}
                  </BodyText>
                  {(partner as any).sponsorship_level && (
                    <Badge
                      variant={(partner as any).sponsorship_level === 'platinum' ? 'brand' : (partner as any).sponsorship_level === 'gold' ? 'warning' : 'outline'}
                      size="sm"
                      className="mt-2 mb-1"
                    >
                      {(partner as any).sponsorship_level.toUpperCase()}
                    </Badge>
                  )}
                  <SmallText className="text-white/50 block">
                    {partner.category}
                  </SmallText>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#E93370]/0 via-[#E93370]/10 to-[#E93370]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partnership CTA */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#E93370]/10 to-[#E93370]/5 backdrop-blur-xl border border-[#E93370]/30 text-center">
            <H3 className="text-white mb-4">
              Become a Partner
            </H3>
            <BodyText className="text-white/70 mb-8 max-w-2xl mx-auto">
              Join our network of innovative brands and create unforgettable experiences
              together. Let's collaborate and reach Indonesia's creative community.
            </BodyText>
            <a
              className="inline-block px-8 py-4 rounded-xl bg-[#E93370] hover:bg-[#E93370]/90 text-white transition-colors duration-300"
              href={`mailto:${settings?.email || 'partnerships@wildoutproject.com'}`}
            >
              Get in Touch
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

PartnersSection.displayName = 'PartnersSection';
