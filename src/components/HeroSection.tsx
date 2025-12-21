import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Users } from 'lucide-react';
import { Button } from './ui/button';
import { H1, LeadText, BodyText } from './ui/typography';
import { useContent } from '../contexts/ContentContext';
import { MOCK_HERO } from '../utils/mockData';
import { Skeleton } from './ui/skeleton';

export const HeroSection = React.memo(() => {
  const { hero: contextHero, loading } = useContent();

  // Use context hero if available, otherwise fallback to mock hero
  const hero = contextHero || MOCK_HERO;

  if (loading && !contextHero) {
    return (
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20" id="hero-section-loading" aria-busy="true">
        <div className="container mx-auto max-w-7xl flex flex-col items-center text-center space-y-8">
          <Skeleton className="h-20 md:h-32 w-3/4 max-w-4xl rounded-3xl" />
          <Skeleton className="h-8 w-2/3 max-w-2xl rounded-2xl" />
          <Skeleton className="h-20 w-1/2 max-w-xl rounded-2xl" />
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Skeleton className="h-14 w-40 rounded-2xl" />
            <Skeleton className="h-14 w-40 rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20" id="hero-section">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo/Brand */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative"
            id="hero-brand-container"
            initial={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            className="absolute inset-0 opacity-50"
            id="hero-brand-glow"
            style={{
              background: 'radial-gradient(circle, #E93370 0%, transparent 70%)',
              filter: 'blur(64px)'
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
            <H1
              gradient="from-white via-[#E93370] to-white"
              className="relative text-5xl md:text-8xl lg:text-9xl tracking-normal"
              id="hero-title"
            >
              {hero.title}
            </H1>
          </motion.div>

          {/* Tagline */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <LeadText className="text-white/80 max-w-3xl" id="hero-subtitle">
              {hero.subtitle}
            </LeadText>
          </motion.div>

          {/* Description */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <BodyText className="text-white/60 max-w-2xl" id="hero-description">
              {hero.description}
            </BodyText>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white px-8 py-6 rounded-2xl backdrop-blur-xl"
              id="hero-explore-events-button"
              size="lg"
              onClick={() => {
                document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Explore Events
            </Button>
            <Button
              className="border-[#E93370]/50 text-white hover:bg-[#E93370]/10 px-8 py-6 rounded-2xl backdrop-blur-xl"
              id="hero-join-community-button"
              size="lg"
              variant="outline"
              onClick={() => {
                document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Users className="mr-2 h-5 w-5" />
              Join Community
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 pt-12 w-full max-w-3xl"
            id="hero-stats-container"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex flex-col items-center p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10" id="hero-events-stats-card">
              <div className="text-2xl md:text-3xl lg:text-4xl text-[#E93370] font-bold mb-2" id="hero-events-stats-value">
                {hero.stats && typeof hero.stats === 'object' && !Array.isArray(hero.stats) && 'events' in hero.stats ? String(hero.stats.events) : '0'}
              </div>
              <div className="text-xs md:text-sm lg:text-base text-white/60 uppercase tracking-wider font-medium" id="hero-events-stats-label">Events</div>
            </div>
            <div className="flex flex-col items-center p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10" id="hero-members-stats-card">
              <div className="text-2xl md:text-3xl lg:text-4xl text-[#E93370] font-bold mb-2" id="hero-members-stats-value">
                {hero.stats && typeof hero.stats === 'object' && !Array.isArray(hero.stats) && 'members' in hero.stats ? String(hero.stats.members) : '0'}
              </div>
              <div className="text-xs md:text-sm lg:text-base text-white/60 uppercase tracking-wider font-medium" id="hero-members-stats-label">Members</div>
            </div>
            <div className="flex flex-col items-center p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10" id="hero-partners-stats-card">
              <div className="text-2xl md:text-3xl lg:text-4xl text-[#E93370] font-bold mb-2" id="hero-partners-stats-value">
                {hero.stats && typeof hero.stats === 'object' && !Array.isArray(hero.stats) && 'partners' in hero.stats ? String(hero.stats.partners) : '0'}
              </div>
              <div className="text-xs md:text-sm lg:text-base text-white/60 uppercase tracking-wider font-medium" id="hero-partners-stats-label">Partners</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{
          y: [0, 10, 0],
        }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-[#E93370]/50 flex items-start justify-center p-2">
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            className="w-1.5 h-1.5 bg-[#E93370] rounded-full"
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
