import React from 'react';
import { Background3D } from './Background3D';
import { Navigation } from './Navigation';
import { HeroSection } from './HeroSection';
import { EventsSection } from './EventsSection';
import { AboutSection } from './AboutSection';
import { TeamSection } from './TeamSection';
import { GallerySection } from './GallerySection';
import { PartnersSection } from './PartnersSection';
import { Footer } from './Footer';
import { useContent } from '../contexts/ContentContext';

export const LandingPage = React.memo(() => {
  const { hero, events, about, team, partners, loading, error } = useContent();
  const hasError = Boolean(error);
  const showContent = !loading && !hasError;

  return (
    <div className="dark relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <Background3D />
      <Navigation />

      <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-y-12 px-4 py-12 md:gap-y-16 lg:px-8">
        {loading && (
          <div className="min-h-[60vh] flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-8 text-lg font-medium text-white/80 shadow-2xl backdrop-blur-xl">
            Loading landing page content...
          </div>
        )}

        {hasError && (
          <div className="rounded-3xl border border-red-500/60 bg-red-500/10 p-6 text-sm text-red-100 shadow-xl">
            <p className="font-semibold text-base text-red-100">We hit a snag loading the page.</p>
            <p className="mt-1 text-[13px] text-red-200">{error}</p>
          </div>
        )}

        {showContent && (
          <>
            <HeroSection hero={hero} />
            <EventsSection events={events} />
            <AboutSection about={about} />
            <TeamSection team={team} />
            <GallerySection />
            <PartnersSection partners={partners} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
});

LandingPage.displayName = 'LandingPage';
