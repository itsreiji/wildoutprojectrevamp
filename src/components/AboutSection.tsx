import React from 'react';
import { motion } from 'motion/react';
import { Heart, Zap, Users, Sparkles } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { H2, H3, BodyText, SmallText } from './ui/typography';
import { type AboutData, type Feature } from '../types/content';

const ICON_MAP: Record<number, React.ComponentType> = {
  0: Heart,
  1: Zap,
  2: Users,
  3: Sparkles,
};

export const AboutSection = React.memo(() => {
  const { about, hero } = useContent();

  if (!about) return null;

  const aboutData: AboutData = about;

  return (
    <section className="relative py-32 px-4 overflow-hidden" id="about-section">
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
            <Sparkles className="w-3 h-3" />
            <span>Discover Our Story</span>
          </motion.div>
          <H2 gradient="from-white via-[#E93370] to-white" className="mb-6">
            {aboutData.title}
          </H2>
          <BodyText className="text-white/60 max-w-3xl mx-auto">
            {aboutData.subtitle}
          </BodyText>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {Array.isArray(aboutData.features) && (aboutData.features as Feature[]).map((feature, index) => {
            const Icon = ICON_MAP[index % 4] || Heart;
            return (
              <motion.div
                key={index}
                className="relative group focus:outline-none"
                initial={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                role="article"
                tabIndex={0}
                aria-label={`Feature: ${feature.title}`}
              >
                <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-500 h-full flex flex-col">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-[#E93370]/10 flex items-center justify-center mb-6 group-hover:bg-[#E93370]/20 transition-colors duration-300">
                    <div className="h-7 w-7 text-[#E93370]">
                      <Icon />
                    </div>
                  </div>

                  {/* Content */}
                  <H3 className="text-white mb-3 text-xl md:text-2xl">
                    {feature.title}
                  </H3>
                  <BodyText className="text-white/60 text-sm leading-relaxed">
                    {feature.description}
                  </BodyText>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#E93370]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Story Section */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="p-8 md:p-12 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
            <div className="relative z-10 max-w-4xl mx-auto">
              <H3 className="text-white mb-6">
                Our Story
              </H3>
              <BodyText className="text-white/70">
                {(aboutData.story || []).map((paragraph, index) => (
                  <span key={index}>{paragraph}{index < (aboutData.story || []).length - 1 ? ' ' : ''}</span>
                ))}
              </BodyText>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div>
                  <div className="text-3xl md:text-4xl text-[#E93370] mb-2">{aboutData.founded_year || ''}</div>
                  <SmallText className="text-white/60">Founded</SmallText>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl text-[#E93370] mb-2">{hero?.stats && typeof hero.stats === 'object' && !Array.isArray(hero.stats) && 'events' in hero.stats ? String(hero.stats.events) : '0'}</div>
                  <SmallText className="text-white/60">Events Hosted</SmallText>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl text-[#E93370] mb-2">{hero?.stats && typeof hero.stats === 'object' && !Array.isArray(hero.stats) && 'members' in hero.stats ? String(hero.stats.members) : '0'}</div>
                  <SmallText className="text-white/60">Community Members</SmallText>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl text-[#E93370] mb-2">{hero?.stats && typeof hero.stats === 'object' && !Array.isArray(hero.stats) && 'partners' in hero.stats ? String(hero.stats.partners) : '0'}</div>
                  <SmallText className="text-white/60">Brand Partners</SmallText>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';
