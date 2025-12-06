import React from 'react';
import { motion } from 'motion/react';
import { Heart, Zap, Users, Sparkles } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { AboutData, Feature } from '../types/content';

const ICON_MAP: Record<number, React.ComponentType> = {
  0: Heart,
  1: Zap,
  2: Users,
  3: Sparkles,
};

export const AboutSection = React.memo(() => {
  const { about } = useContent();
  const aboutData: AboutData = about || {
    title: '',
    subtitle: '',
    features: [],
    story: [],
    founded_year: '',
  };

  return (
    <section id="about" className="relative py-20 px-4">
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
              {aboutData.title}
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-3xl mx-auto">
            {aboutData.subtitle}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {Array.isArray(aboutData.features) && (aboutData.features as Feature[]).map((feature, index) => {
            const Icon = ICON_MAP[index % 4] || Heart;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#E93370]/50 transition-all duration-500 h-full">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-[#E93370]/10 flex items-center justify-center mb-4 group-hover:bg-[#E93370]/20 transition-colors duration-300">
                    <div className="h-7 w-7 text-[#E93370]">
                      <Icon />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/60">
                    {feature.description}
                  </p>

                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#E93370]/0 via-[#E93370]/5 to-[#E93370]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="p-8 md:p-12 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E93370]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E93370]/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-4xl mx-auto">
              <h3 className="text-3xl md:text-4xl text-white mb-6">
                Our Story
              </h3>
              <div className="space-y-4 text-white/70 leading-relaxed">
                {(aboutData.story || []).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div>
                  <div className="text-3xl md:text-4xl text-[#E93370] mb-2">{aboutData.founded_year || ''}</div>
                  <div className="text-sm text-white/60">Founded</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl text-[#E93370] mb-2">500+</div>
                  <div className="text-sm text-white/60">Events Hosted</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl text-[#E93370] mb-2">50K+</div>
                  <div className="text-sm text-white/60">Community Members</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl text-[#E93370] mb-2">100+</div>
                  <div className="text-sm text-white/60">Brand Partners</div>
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
