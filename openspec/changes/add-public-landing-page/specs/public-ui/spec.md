## ADDED Requirements

### Requirement: LandingPage aggregates content sections from ContentContext
The root landing page SHALL call the `useContent` hook and pass the returned hero, events, partners, team, and about data to their respective section components.

#### Scenario: LandingPage composes every section
- **WHEN** a visitor navigates to `/`
- **THEN** `LandingPage` calls `useContent()` once during render
- **AND** it renders `HeroSection`, `EventsSection`, `PartnersSection`, `TeamSection`, and `AboutSection`
- **AND** each section receives the matching slice of the context payload (e.g., hero data flows to `HeroSection`, event array to `EventsSection`)

### Requirement: LandingPage surface loading and error states
LandingPage SHALL reflect the `loading` and `error` values from `ContentContext` before rendering the sections.

#### Scenario: Loading indicator appears while data is pending
- **WHEN** `loading` is `true`
- **THEN** LandingPage displays a lightweight loading indicator in place of the sections
- **AND** the section components are not rendered until `loading` becomes `false`

#### Scenario: Error state surfaces a message without breaking the page
- **WHEN** `error` from `useContent()` is non-null
- **THEN** LandingPage shows a user-friendly error banner
- **AND** section rendering is skipped or limited so that broken data does not render

### Requirement: LandingPage keeps spacing and layout responsive
The landing page SHALL wrap every section in a responsive container that provides consistent spacing, alignment, and mobile-friendly stacking that matches the Figma spacing system.

#### Scenario: Layout adapts to screen size
- **WHEN** the viewport width changes (mobile, tablet, desktop)
- **THEN** the `main` container adjusts spacing (e.g., `gap-y` utilities, responsive padding)
- **AND** each section stretches to the full width on small screens while maintaining centered content on larger screens

### Requirement: LandingPage reflects live content updates
LandingPage SHALL re-render immediately when the `ContentContext` data changes so that updates to Supabase-managed content appear live on the page.

#### Scenario: Hero text update propagates
- **WHEN** admin updates hero content (title, CTA, image) via the dashboard
- **THEN** `LandingPage` re-runs `useContent()` and passes the new hero payload to `HeroSection`
- **AND** the hero section displays the updated copy without a full reload

