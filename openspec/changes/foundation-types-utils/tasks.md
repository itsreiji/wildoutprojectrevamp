## 1. Implementation

### 1.1 Type Definitions
- [x] Create `src/types/` directory
- [x] Create `src/types/events.ts` with Event interface (extract from ContentContext)
- [x] Create `src/types/team.ts` with TeamMember interface
- [x] Create `src/types/partners.ts` with Partner interface
- [x] Create `src/types/content.ts` with HeroContent, AboutContent, and GalleryImage interfaces
- [x] Create `src/types/settings.ts` with SiteSettings interface
- [x] Create `src/types/index.ts` to export all types for convenient importing

### 1.2 Utility Functions
- [x] Create `src/utils/formatting.ts` with date formatting functions
  - [x] Implement `formatDate(date: Date | string): string` using Intl.DateTimeFormat
  - [x] Implement `formatTime(time: string): string` for time formatting
  - [x] Implement `formatCurrency(amount: number, currency?: string): string` for price formatting
- [x] Create `src/utils/validation.ts` with validation functions
  - [x] Implement `isValidEmail(email: string): boolean` with regex validation
  - [x] Implement `isValidUrl(url: string): boolean` for URL validation
  - [x] Implement `isValidPhone(phone: string): boolean` for phone number validation (Indonesian format)
- [x] Create `src/utils/api.ts` with Supabase API helper functions (placeholders)
  - [x] Define `getEvents(): Promise<Event[]>` function signature
  - [x] Define `getTeamMembers(): Promise<TeamMember[]>` function signature
  - [x] Define `getPartners(): Promise<Partner[]>` function signature
  - [x] Define `getGalleryImages(): Promise<GalleryImage[]>` function signature
  - [x] Define `getHeroContent(): Promise<HeroContent>` function signature
  - [x] Define `getAboutContent(): Promise<AboutContent>` function signature
  - [x] Define `getSiteSettings(): Promise<SiteSettings>` function signature

### 1.3 Update ContentContext
- [x] Update `src/contexts/ContentContext.tsx` to import types from `src/types/` instead of defining them inline
- [x] Remove inline type definitions from ContentContext.tsx
- [x] Verify all imports work correctly

### 1.4 Testing & Validation
- [x] Run `tsc --noEmit` to verify all types compile without errors
- [x] Write unit tests for formatting functions (if Vitest is configured)
- [x] Write unit tests for validation functions (if Vitest is configured)
- [x] Verify no runtime errors occur when using updated ContentContext

