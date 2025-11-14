## 1. Implementation
- [x] 1.1 Create the `LandingPage.tsx` shell and export it so `src/app/page.tsx` can render it as the `/` route.
- [x] 1.2 Call `useContent` inside `LandingPage`, destructure `hero`, `events`, `partners`, `team`, and `about`, and display loading or error UI as needed while the context resolves.
- [x] 1.3 Render `HeroSection` with the hero payload so the hero text, CTA, and background update with content context changes.
- [x] 1.4 Render `EventsSection`, `PartnersSection`, `TeamSection`, and `AboutSection` (or similarly named public sections) below the hero, passing each the respective dynamic data arrays.
- [x] 1.5 Wrap all sections in a responsive `main` container with consistent vertical spacing and responsive layout helpers (e.g., `flex flex-col gap-y-16 md:gap-y-24`) to match the Figma layout.
- [x] 1.6 Verify the landing page renders on `/` and updates when the Supabase-managed content changes.

