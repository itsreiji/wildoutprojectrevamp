# Change: add public landing page

## Why
- The landing page is currently a stub (or missing) and the application needs a single place that assembles the hero, events, partners, team, and about sections using the shared `ContentContext` data so the marketing copy matches the WildOut! design.
- Without a dedicated page component, each section is disconnected from the router and the content context, which slows down the next phase of verifying the supabase-powered content updates and responsive layout.

## What Changes
- Introduce `LandingPage` under `src/components` that calls `useContent`, destructures the hero/events/partners/team/about payload, and provides loading/error states.
- Have `LandingPage` import and render the section components (`HeroSection`, `EventsSection`, `PartnersSection`, `TeamSection`, `AboutSection`) and pass the appropriate slice of content data to each.
- Wrap the sections in a responsive layout container (e.g., `main` with `flex flex-col`/`gap-y` utilities) to mirror the Figma spacing and ensure the page looks polished across breakpoints.
- Register `LandingPage` as the root route in `src/app/page.tsx` so navigating to `/` renders the composed experience and respond automatically to content updates.

## Impact
- **Specs**: Adds the new `public-ui/landing-page` requirement set (`openspec/specs/public-ui/spec.md`).
- **Code**: `src/components/LandingPage.tsx`, `src/app/page.tsx`, plus the hero/events/partners/team/about sections that receive the data (`HeroSection.tsx`, `EventsSection.tsx`, `PartnersSection.tsx`, `TeamSection.tsx`, `AboutSection.tsx`).

