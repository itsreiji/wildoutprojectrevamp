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

export const LandingPage = React.memo(() => {
  return (
    <div className="dark relative min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden" id="landing-page-container">
      {/* 3D Animated Background */}
      <Background3D />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="relative z-10">
        <HeroSection />
        <EventsSection />
        <AboutSection />
        <TeamSection />
        <GallerySection />
        <PartnersSection />
        <Footer />
      </div>
    </div>
  );
});

LandingPage.displayName = 'LandingPage';
