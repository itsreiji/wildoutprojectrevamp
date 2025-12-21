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
import { Skeleton } from './ui/skeleton';

export const LandingPage = React.memo(() => {
  const { loading } = useContent();

  if (loading) {
    return (
      <div 
        className="relative min-h-screen bg-background text-foreground overflow-x-hidden" 
        id="landing-page-container"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">Loading page content...</span>
        {/* Background remains for continuity */}
        <Background3D />
        <Navigation />
        
        <div className="relative z-10 pt-20">
          {/* Hero Skeleton */}
          <div className="min-h-[80vh] flex items-center justify-center px-4" aria-hidden="true">
            <div className="w-full max-w-4xl space-y-8 text-center">
              <Skeleton className="h-24 md:h-32 w-3/4 mx-auto rounded-xl" />
              <Skeleton className="h-6 md:h-8 w-1/2 mx-auto rounded-xl" />
              <div className="flex justify-center gap-4">
                <Skeleton className="h-12 w-32 rounded-xl" />
                <Skeleton className="h-12 w-32 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Events Section Skeleton */}
          <div className="px-4 py-20" aria-hidden="true">
            <div className="container mx-auto max-w-7xl">
              <Skeleton className="h-12 w-1/3 mb-12 rounded-xl mx-auto" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 rounded-xl" />
                    <Skeleton className="h-6 w-3/4 rounded-xl" />
                    <Skeleton className="h-4 w-1/2 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Section Skeleton */}
          <div className="px-4 py-20">
            <div className="container mx-auto max-w-7xl">
              <Skeleton className="h-12 w-1/3 mb-6 rounded-xl mx-auto" />
              <Skeleton className="h-6 w-1/2 mb-8 rounded-xl mx-auto" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-72 rounded-xl" />
                    <div className="space-y-2 p-4">
                      <Skeleton className="h-4 w-3/4 rounded-xl" />
                      <Skeleton className="h-4 w-1/2 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gallery Section Skeleton */}
          <div className="px-4 py-20">
            <div className="container mx-auto max-w-7xl">
              <Skeleton className="h-12 w-1/3 mb-6 rounded-xl mx-auto" />
              <Skeleton className="h-6 w-1/2 mb-8 rounded-xl mx-auto" />
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden">
                    <Skeleton className="w-full h-full rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Partners Section Skeleton */}
          <div className="px-4 py-20">
            <div className="container mx-auto max-w-7xl">
              <Skeleton className="h-12 w-1/3 mb-6 rounded-xl mx-auto" />
              <Skeleton className="h-6 w-1/2 mb-8 rounded-xl mx-auto" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-32 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-2/3 rounded-xl mx-auto" />
                      <Skeleton className="h-4 w-1/2 rounded-xl mx-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden" id="landing-page-container">
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
