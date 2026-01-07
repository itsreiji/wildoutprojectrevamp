
import React, { useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { apiClient } from '../supabase/api/client';
import type { 
  Event, 
  Partner, 
  GalleryImage, 
  TeamMember, 
  HeroContent, 
  AboutContent, 
  SiteSettings,
  ContentContextType
} from '../types/content';

import { 
  INITIAL_EVENTS, 
  INITIAL_PARTNERS, 
  INITIAL_GALLERY, 
  INITIAL_TEAM, 
  INITIAL_HERO, 
  INITIAL_ABOUT, 
  INITIAL_SETTINGS
} from './ContentData';
import { ContentContext } from './ContentContextCore';

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [gallery, setGallery] = useState<GalleryImage[]>(INITIAL_GALLERY);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [hero, setHero] = useState<HeroContent>(INITIAL_HERO);
  const [about, setAbout] = useState<AboutContent>(INITIAL_ABOUT);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);

  const [loading, setLoading] = useState(false);

  // Refs to store current state for use in callbacks without stale closures
  const teamRef = useRef<TeamMember[]>(INITIAL_TEAM);
  const eventsRef = useRef<Event[]>(INITIAL_EVENTS);
  const partnersRef = useRef<Partner[]>(INITIAL_PARTNERS);
  const galleryRef = useRef<GalleryImage[]>(INITIAL_GALLERY);
  const heroRef = useRef<HeroContent>(INITIAL_HERO);
  const aboutRef = useRef<AboutContent>(INITIAL_ABOUT);
  const settingsRef = useRef<SiteSettings>(INITIAL_SETTINGS);

  // Keep refs in sync with state
  useEffect(() => {
    teamRef.current = team;
  }, [team]);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    partnersRef.current = partners;
  }, [partners]);

  useEffect(() => {
    galleryRef.current = gallery;
  }, [gallery]);

  useEffect(() => {
    heroRef.current = hero;
  }, [hero]);

  useEffect(() => {
    aboutRef.current = about;
  }, [about]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const refresh = useCallback(async () => {
    console.log("🔄 REFRESH STARTED - Fetching all data from server...");
    setLoading(true);
    try {
      // Individual timeouts for each API call to prevent complete hang
      const fetchWithTimeout = async <T extends unknown>(promise: Promise<T>, name: string, timeoutMs: number = 5000): Promise<T | null> => {
        let completed = false;
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => {
            if (!completed) {
              console.warn(`⏱️ ${name} timeout after ${timeoutMs}ms`);
              resolve(null);
            }
          }, timeoutMs)
        );
        try {
          const result = await Promise.race([promise.finally(() => { completed = true; }), timeoutPromise]);
          return result;
        } catch (err) {
          console.warn(`⚠️ ${name} failed:`, err);
          return null;
        }
      };

      console.log("🚀 Starting parallel API calls with individual timeouts...");

      // Fetch all data with individual timeouts - increased to 15s for slow Supabase
      const [fetchedHero, fetchedEvents, fetchedAbout, fetchedTeam, fetchedPartners, fetchedSettings] = await Promise.all([
        fetchWithTimeout(apiClient.getHero(), "Hero", 15000),
        fetchWithTimeout(apiClient.getEvents(), "Events", 15000),
        fetchWithTimeout(apiClient.getAbout(), "About", 15000),
        fetchWithTimeout(apiClient.getTeam(), "Team", 15000),
        fetchWithTimeout(apiClient.getPartners(), "Partners", 15000),
        fetchWithTimeout(apiClient.getSettings(), "Settings", 15000).catch(() => null)
      ]);

      console.log("✅ API calls completed - processing results...");

      if (fetchedHero) {
        console.log("✅ Hero data received");
        setHero({
          ...fetchedHero,
          subtitle: fetchedHero.subtitle ?? "",
          description: fetchedHero.description ?? "",
          stats: (fetchedHero.stats as any) || INITIAL_HERO.stats
        });
      }

      if (fetchedAbout) {
        console.log("✅ About data received");
        setAbout(fetchedAbout);
      }

      if (fetchedTeam && fetchedTeam.length > 0) {
        console.log(`✅ Team data received: ${fetchedTeam.length} members`);
        setTeam(fetchedTeam);
      }

      if (fetchedEvents && fetchedEvents.length > 0) {
        console.log(`✅ Events data received: ${fetchedEvents.length} events`);
        setEvents(fetchedEvents);
      }

      if (fetchedPartners && fetchedPartners.length > 0) {
        console.log(`✅ Partners data received: ${fetchedPartners.length} partners`);
        setPartners(fetchedPartners);
      }

      if (fetchedSettings !== null && fetchedSettings !== undefined) {
        console.log("✅ Settings data received");
        setSettings(fetchedSettings);
      } else {
        console.log("⚠️ Settings not found, keeping default");
      }

      console.log("✅ REFRESH COMPLETED - Data updated from server");

    } catch (err) {
      console.error("❌ REFRESH FAILED:", err);
      console.warn("⚠️ Using existing local data as fallback");
    } finally {
      setLoading(false);
      console.log("🔄 REFRESH FINISHED");
    }
  }, []);

  // Update hero function that saves to Supabase
  const updateHeroContent = useCallback(async (heroData: HeroContent) => {
    const oldHero = {...heroRef.current}; // Store old state for rollback using ref
    console.log("Starting hero save process...", heroData);

    try {
      // Update local state immediately for responsive UI
      setHero(heroData);
      console.log("Local hero state updated");

      console.log("Making API call to Supabase edge function...");
      const result = await apiClient.updateHero(heroData);
      console.log("✅ Hero section saved to Supabase successfully:", result);

    } catch (err: any) {
      console.error("❌ Failed to save hero section to Supabase, reverting:", err);
      // Revert local changes if save fails
      setHero(oldHero);
      throw err;
    }
  }, [apiClient]);

  // Update about function that saves to Supabase
  const updateAboutContent = useCallback(async (aboutData: AboutContent) => {
    const oldAbout = {...aboutRef.current}; // Store old state for rollback using ref
    try {
      setAbout(aboutData);
      await apiClient.updateAbout(aboutData);
      console.log("✅ About section saved to Supabase successfully");
    } catch (err) {
      console.error("❌ Failed to save about section to Supabase, reverting:", err);
      setAbout(oldAbout);
      throw err;
    }
  }, [apiClient]);

  // Update team function that saves to Supabase
  const updateTeamContent = useCallback(async (teamData: TeamMember[]) => {
    // Store old state for potential rollback using ref to avoid stale closures
    const oldTeam = [...teamRef.current];

    console.log("=== 🔄 TEAM UPDATE FLOW START ===");
    console.log("Old team:", oldTeam);
    console.log("New team:", teamData);

    try {
      // Update local state immediately for responsive UI
      setTeam(teamData);
      console.log("✅ Local state updated");

      // Process changes
      const errors: string[] = [];

      // Find added/updated members
      for (const member of teamData) {
        const oldMember = oldTeam.find(m => m.id === member.id);
        try {
          if (!oldMember) {
            console.log(`🚀 CREATE: ${member.name}`);
            await apiClient.createTeamMember(member);
          } else if (JSON.stringify(oldMember) !== JSON.stringify(member)) {
            console.log(`🔄 UPDATE: ${member.name}`);
            await apiClient.updateTeamMember(member.id, member);
          }
        } catch (err: any) {
          console.error(`❌ FAILED ${member.name}:`, err);
          errors.push(`Member ${member.name}: ${err.message}`);
        }
      }

      // Find deleted members
      for (const oldMember of oldTeam) {
        if (!teamData.find(m => m.id === oldMember.id)) {
          try {
            console.log(`🗑️  DELETE: ${oldMember.name}`);
            await apiClient.deleteTeamMember(oldMember.id);
          } catch (err: any) {
            console.error(`❌ FAILED DELETE ${oldMember.name}:`, err);
            errors.push(`Delete ${oldMember.name}: ${err.message}`);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(`Some operations failed:\n${errors.join('\n')}`);
      }

      console.log("✅ ALL API CALLS SUCCESSFUL");
      console.log("=== 🔄 TEAM UPDATE FLOW COMPLETE ===");
    } catch (err) {
      console.error("❌ FAILURE - Reverting:", err);
      // Revert to old state
      setTeam(oldTeam);
      throw err;
    }
  }, [apiClient]);

  // Update partners function that saves to Supabase
  const updatePartnersContent = useCallback(async (partnersData: Partner[]) => {
    const oldPartners = [...partnersRef.current]; // Store old state for rollback using ref

    try {
      setPartners(partnersData);
      console.log("Local partners state updated:", partnersData);

      const errors: string[] = [];

      // Find added/updated partners
      for (const partner of partnersData) {
        const oldPartner = oldPartners.find(p => p.id === partner.id);
        try {
          if (!oldPartner) {
            console.log("Creating new partner:", partner.id);
            await apiClient.createPartner(partner);
          } else if (JSON.stringify(oldPartner) !== JSON.stringify(partner)) {
            console.log("Updating partner:", partner.id);
            await apiClient.updatePartner(partner.id, partner);
          }
        } catch (err: any) {
          console.error(`Failed to process partner ${partner.id}:`, err);
          errors.push(`Partner ${partner.name}: ${err.message}`);
        }
      }

      // Find deleted partners
      for (const oldPartner of oldPartners) {
        if (!partnersData.find(p => p.id === oldPartner.id)) {
          try {
            console.log("Deleting partner:", oldPartner.id);
            await apiClient.deletePartner(oldPartner.id);
          } catch (err: any) {
            console.error(`Failed to delete partner ${oldPartner.id}:`, err);
            errors.push(`Delete ${oldPartner.name}: ${err.message}`);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(`Some operations failed:\n${errors.join('\n')}`);
      }

      console.log("✅ Partners successfully synchronized with Supabase");
    } catch (err) {
      console.error("❌ Failed to update partners in Supabase, reverting:", err);
      setPartners(oldPartners);
      throw err;
    }
  }, [apiClient]);

  // Update settings function that saves to Supabase
  const updateSettingsContent = useCallback(async (settingsData: SiteSettings) => {
    const oldSettings = {...settingsRef.current}; // Store old state for rollback using ref
    try {
      setSettings(settingsData);
      await apiClient.updateSettings(settingsData);
      console.log("✅ Settings saved to Supabase successfully");
    } catch (err) {
      console.error("❌ Failed to save settings to Supabase, reverting:", err);
      setSettings(oldSettings);
      throw err;
    }
  }, [apiClient]);

  const updateEventsContent = useCallback(async (eventsData: Event[]) => {
    const oldEvents = [...eventsRef.current]; // Store old state for rollback using ref
    try {
      setEvents(eventsData);
      console.log("Local events state updated:", eventsData);

      const errors: string[] = [];

      // Update or create events
      for (const event of eventsData) {
        const oldEvent = oldEvents.find(e => e.id === event.id);
        try {
          if (!oldEvent) {
            console.log("Creating new event:", event.id);
            await apiClient.createEvent(event);
          } else if (JSON.stringify(oldEvent) !== JSON.stringify(event)) {
            console.log("Updating event:", event.id);
            await apiClient.updateEvent(event.id, event);
          }
        } catch (err: any) {
          console.error(`Failed to process event ${event.id}:`, err);
          errors.push(`Event ${event.title}: ${err.message}`);
        }
      }

      // Delete removed events
      for (const oldEvent of oldEvents) {
        if (!eventsData.find(e => e.id === oldEvent.id)) {
          try {
            console.log("Deleting event:", oldEvent.id);
            await apiClient.deleteEvent(oldEvent.id);
          } catch (err: any) {
            console.error(`Failed to delete event ${oldEvent.id}:`, err);
            errors.push(`Delete ${oldEvent.title}: ${err.message}`);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(`Some operations failed:\n${errors.join('\n')}`);
      }

      console.log("✅ Events successfully synchronized with Supabase");
    } catch (err) {
      console.error("❌ Failed to update events in Supabase, reverting:", err);
      setEvents(oldEvents);
      throw err;
    }
  }, [apiClient]);

  const updateGalleryContent = useCallback(async (galleryData: GalleryImage[]) => {
    const oldGallery = [...galleryRef.current]; // Store old state for rollback using ref
    try {
      setGallery(galleryData);
      console.log("Local gallery state updated:", galleryData);

      const errors: string[] = [];

      // Update or create images
      for (const image of galleryData) {
        const oldImage = oldGallery.find(img => img.id === image.id);
        try {
          if (!oldImage) {
            console.log("Creating new gallery image:", image.id);
            await apiClient.createGalleryImage(image);
          }
        } catch (err: any) {
          console.error(`Failed to process gallery image ${image.id}:`, err);
          errors.push(`Gallery image ${image.caption}: ${err.message}`);
        }
      }

      // Delete removed images
      for (const oldImage of oldGallery) {
        if (!galleryData.find(img => img.id === oldImage.id)) {
          try {
            console.log("Deleting gallery image:", oldImage.id);
            await apiClient.deleteGalleryImage(oldImage.id);
          } catch (err: any) {
            console.error(`Failed to delete gallery image ${oldImage.id}:`, err);
            errors.push(`Delete ${oldImage.caption}: ${err.message}`);
          }
        }
      }

      if (errors.length > 0) {
        throw new Error(`Some operations failed:\n${errors.join('\n')}`);
      }

      console.log("✅ Gallery successfully synchronized with Supabase");
    } catch (err) {
      console.error("❌ Failed to update gallery in Supabase, reverting:", err);
      setGallery(oldGallery);
      throw err;
    }
  }, [apiClient]);

  // Load data from Supabase on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = {
    events,
    partners,
    gallery,
    team,
    hero,
    about,
    settings,
    updateEvents: updateEventsContent,
    updatePartners: updatePartnersContent,
    updateGallery: updateGalleryContent,
    updateTeam: updateTeamContent,
    updateHero: updateHeroContent,
    updateAbout: updateAboutContent,
    updateSettings: updateSettingsContent,
    loading,
    refresh
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};
