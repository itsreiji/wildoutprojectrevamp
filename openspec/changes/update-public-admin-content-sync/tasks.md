## 1. Database Schema & Import Setup
- [ ] 1.1 Create Supabase migration for hero_content, about_content, site_settings tables
- [ ] 1.2 Add RLS policies for public read/admin write access on new tables
- [ ] 1.3 Create scripts/importContentFromRepo.ts to seed current config into Supabase
- [ ] 1.4 Regenerate TypeScript types for new tables
- [ ] 1.5 Test import script with current repo configuration

## 2. Content Provider Enhancement
- [ ] 2.1 Add fetch functions for hero, about, settings from Supabase
- [ ] 2.2 Add mutation functions (saveHeroContent, saveAboutContent, saveSiteSettings)
- [ ] 2.3 Update data loading to prioritize Supabase over dummy data
- [ ] 2.4 Add configurable admin base path support (VITE_ADMIN_BASE_PATH)
- [ ] 2.5 Update error handling for all content types

## 3. Admin Dashboard Persistence
- [ ] 3.1 Update DashboardHero.tsx to persist changes to Supabase
- [ ] 3.2 Update DashboardAbout.tsx to persist changes to Supabase
- [ ] 3.3 Update DashboardSettings.tsx to persist changes to Supabase
- [ ] 3.4 Add loading states and error handling to all admin forms
- [ ] 3.5 Ensure real-time sync between admin saves and landing page

## 4. Router & Navigation Configuration
- [ ] 4.1 Update RouterProvider to support configurable admin base path
- [ ] 4.2 Update Navigation component to use dynamic admin paths
- [ ] 4.3 Update App.tsx routing to use /sadmin instead of /admin
- [ ] 4.4 Configure Vite proxy for /sadmin routes in development
- [ ] 4.5 Update all hardcoded admin links throughout the app

## 5. Landing Page Integration
- [ ] 5.1 Verify LandingPage.tsx consumes Supabase data correctly
- [ ] 5.2 Remove any remaining dummy data fallbacks in landing sections
- [ ] 5.3 Ensure proper loading states during data fetch
- [ ] 5.4 Test real-time updates when admin content changes

## 6. Testing & Documentation
- [ ] 6.1 Update README with new env variables and import workflow
- [ ] 6.2 Add end-to-end sync testing documentation
- [ ] 6.3 Verify admin forms work with Supabase persistence
- [ ] 6.4 Verify landing page updates immediately after admin saves
