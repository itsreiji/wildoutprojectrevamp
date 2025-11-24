import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Crown } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useContent } from '../contexts/ContentContext';

export const PartnersSection = React.memo(() => {
  const { partners } = useContent();
  const [filterTier, setFilterTier] = useState<string>('all');

  const tierOrder: Record<string, number> = {
    platinum: 4,
    gold: 3,
    silver: 2,
    bronze: 1,
  };

  const getBadgeVariant = (tier: string): 'default' | 'secondary' | 'outline' => {
    switch (tier) {
      case 'bronze': return 'secondary';
      case 'silver': return 'default';
      case 'gold': return 'outline';
      case 'platinum': return 'default';
      default: return 'secondary';
    }
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
    <section id="partners" className="relative py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#E93370]/10 border border-[#E93370]/30 mb-6">
            <Sparkles className="h-4 w-4 text-[#E93370] mr-2" />
            <span className="text-sm text-[#E93370]">Trusted Collaborations</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl mb-4">
            <span className="bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
              Our Partners
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Collaborating with leading brands to deliver exceptional experiences
          </p>
        </motion.div>

        {/* Tier Filter */}
        <div className="flex justify-center mb-8">
          <Select value={filterTier} onValueChange={setFilterTier}>
            <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="platinum">Platinum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {activePartners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative"
            >
              <div className="aspect-square p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-500 flex flex-col items-center justify-center">
                {/* Logo Placeholder */}
                <div className="w-full h-full flex items-center justify-center mb-2">
                  <div className="text-3xl md:text-4xl text-white/80 group-hover:text-[#E93370] transition-colors duration-300">
                    {partner.name.charAt(0)}
                  </div>
                </div>

                {/* Partner Info */}
                <div className="text-center">
                  <div className="text-white group-hover:text-[#E93370] transition-colors duration-300">
                    {partner.name}
                  </div>
                  {(partner as any).sponsorship_level && (
                    <Badge
                      variant={getBadgeVariant((partner as any).sponsorship_level)}
                      className="mt-1 text-xs"
                    >
                      {(partner as any).sponsorship_level === 'platinum' && <Crown className="h-3 w-3 mr-1" />}
                      {(partner as any).sponsorship_level.toUpperCase()}
                    </Badge>
                  )}
                  <div className="text-xs text-white/50 mt-1">
                    {partner.category}
                  </div>
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#E93370]/0 via-[#E93370]/10 to-[#E93370]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partnership CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#E93370]/10 to-[#E93370]/5 backdrop-blur-xl border border-[#E93370]/30 text-center">
            <h3 className="text-3xl md:text-4xl text-white mb-4">
              Become a Partner
            </h3>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Join our network of innovative brands and create unforgettable experiences
              together. Let's collaborate and reach Indonesia's creative community.
            </p>
            <button className="px-8 py-4 rounded-xl bg-[#E93370] hover:bg-[#E93370]/90 text-white transition-colors duration-300">
              Get in Touch
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

PartnersSection.displayName = 'PartnersSection';
