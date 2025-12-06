import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Users } from 'lucide-react';
import { Button } from './ui/button';
import { useContent } from '../contexts/ContentContext';

export const HeroSection = React.memo(() => {
  const { hero, events, partners } = useContent();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <motion.div
              className="absolute inset-0 blur-3xl opacity-50"
              style={{ background: '#E93370' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <h1 className="relative text-6xl md:text-8xl lg:text-9xl tracking-tight">
              <span className="bg-gradient-to-r from-white via-[#E93370] to-white bg-clip-text text-transparent">
                {hero.title}
              </span>
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl lg:text-3xl text-white/80 max-w-3xl"
          >
            {hero.subtitle}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-lg text-white/60 max-w-2xl"
          >
            {hero.description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Button
              size="lg"
              className="bg-[#E93370] hover:bg-[#E93370]/90 text-white px-8 py-6 rounded-2xl backdrop-blur-xl"
              onClick={() => {
                document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Explore Events
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#E93370]/50 text-white hover:bg-[#E93370]/10 px-8 py-6 rounded-2xl backdrop-blur-xl"
              onClick={() => {
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Users className="mr-2 h-5 w-5" />
              Join Community
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-3 gap-8 pt-12 w-full max-w-3xl"
          >
            <div className="flex flex-col items-center p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-3xl md:text-4xl text-[#E93370] mb-2">
                {hero.stats && typeof hero.stats === 'object' && !Array.isArray(hero.stats) && 'events' in hero.stats ? String(hero.stats.events) : '0'}
              </div>
              <div className="text-sm md:text-base text-white/60">Events</div>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-3xl md:text-4xl text-[#E93370] mb-2">
                {hero.stats && typeof hero.stats === 'object' && !Array.isArray(hero.stats) && 'members' in hero.stats ? String(hero.stats.members) : '0'}
              </div>
              <div className="text-sm md:text-base text-white/60">Members</div>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="text-3xl md:text-4xl text-[#E93370] mb-2">
                {hero.stats && typeof hero.stats === 'object' && !Array.isArray(hero.stats) && 'partners' in hero.stats ? String(hero.stats.partners) : '0'}
              </div>
              <div className="text-sm md:text-base text-white/60">Partners</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-[#E93370]/50 flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 bg-[#E93370] rounded-full"
            animate={{
              y: [0, 12, 0],
            }}
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
