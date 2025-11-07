# Project Context

## Purpose
WildOut! is a media digital nightlife & event multi-platform for Indonesia's creative community. The platform connects artists, events, and experiences, serving as both a public-facing landing page and an administrative dashboard for managing events, team members, partners, gallery content, and site settings.

## Problem Statement
WildOut! currently has a React/TypeScript landing page and admin dashboard. The platform needs structured development with clear separation of concerns, dependency mapping, and phased implementation of features. The core challenge is managing complex content relationships (events, team, partners, gallery, settings) while maintaining code quality, performance, and maintainability as the platform scales from initial launch to supporting 500+ events, 50K+ members, and 100+ partners.

## Target Users

**Primary:**
- **Event Organizers**: Need to create, manage, and promote events (festivals, club nights, exhibitions, live music)
- **Platform Administrators**: Manage content, team members, partners, gallery, and site settings
- **Creative Community Members**: Browse events, discover artists, connect with venues and other creatives

**Secondary:**
- **Venue Owners**: List their venues and managed events
- **Artists/DJs**: Showcase their profiles and upcoming performances
- **Partners/Sponsors**: Brand visibility and partnership opportunities

## Success Metrics

- **Launch**: Fully functional landing page + admin dashboard deployed (v0.1.0)
- **Content Scale**: Support 500+ events, 50K+ members, 100+ partners without performance degradation
- **Admin Efficiency**: Content management operations completed in < 5 seconds per action
- **Developer Velocity**: New features implemented in phased sprints with minimal blockers
- **Code Quality**: 80%+ test coverage for critical paths, < 2 bugs per release
- **Platform Availability**: 99%+ uptime for user-facing pages

**Key Goals:**
- Showcase upcoming and past events (music festivals, art exhibitions, club nights, live music)
- Manage a creative community platform with 500+ events, 50K+ members, and 100+ partners
- Provide administrative tools for content management
- Connect artists, venues, and event organizers
- Celebrate Indonesia's vibrant nightlife and creative culture

## Tech Stack

### Core Framework & Language
- **React 19.2.0** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite 7.2.1** - Build tool and dev server (port 3000)

### UI & Styling
- **Tailwind CSS v4.1.3** - Utility-first CSS framework
- **Radix UI** - Comprehensive set of accessible, unstyled components
  - Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu, Form, Select, Tabs, Tooltip, and more
- **shadcn/ui** style components - Located in `src/components/ui/`
- **Lucide React** - Icon library
- **Motion** - Animation library
- **next-themes** - Theme management

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - Project ID: `qhimllczaejftnuymrsr`
  - Client: `@jsr/supabase__supabase-js` v2.58.0
  - Edge Functions support (Hono framework)

### State Management & Routing
- **React Context API** - For global state (`ContentContext`)
- **Custom Router** - Client-side routing using React Context and History API
  - Routes: `/` (landing), `/admin` (dashboard), `/events` (all events page)

### Additional Libraries
- **React Hook Form** - Form management
- **Sonner** - Toast notifications
- **Recharts** - Data visualization
- **React Day Picker** - Date selection
- **Embla Carousel** - Carousel component
- **CMDK** - Command menu component
- **Clsx** - Conditional CSS class names
- **Tailwind Merge** - Merge Tailwind classes

### Technology Decisions & Rationale

**React + TypeScript over Vue/Svelte**
- **Rationale**: React ecosystem maturity, TypeScript first-class support, larger community resources
- **Trade-offs**: Larger bundle size than Vue, more verbose than Svelte

**Context API instead of Redux/Zustand**
- **Rationale**: Simpler setup for medium-complexity state, sufficient for current scope (5 main entities)
- **Trade-offs**: Manual memoization needed to prevent unnecessary renders
- **Mitigation**: Implement useMemo/useCallback in context, consider split contexts per entity

**Custom Router instead of React Router**
- **Rationale**: Reduced dependencies, simple routing needs (3 main routes), control over implementation
- **Trade-offs**: No built-in features like nested routes, code splitting

**Supabase for Backend**
- **Rationale**: PostgreSQL database, real-time capabilities, built-in auth, low operational overhead
- **Trade-offs**: Vendor lock-in, limited scalability options compared to self-hosted

**Tailwind CSS + Radix UI**
- **Rationale**: Accessibility built-in (Radix), utility-first styling (Tailwind) reduces custom CSS, consistent design system
- **Trade-offs**: Large CSS file (mitigated by Vite purging), learning curve for utility-first

**React Hook Form over Formik**
- **Rationale**: Smaller bundle size, performance optimized, minimal re-renders
- **Trade-offs**: Less out-of-the-box validation compared to Formik

## Project Conventions

### Code Style
- **TypeScript**: Strict typing throughout, no `any` types unless absolutely necessary
- **File Naming**: PascalCase for components (e.g., `LandingPage.tsx`, `EventDetailModal.tsx`)
- **Component Structure**: Functional components with hooks
- **Import Organization**:
  - React imports first
  - Third-party libraries
  - Local imports (components, contexts, utils)
  - Type imports
- **Path Aliases**: Use `@/` alias for `src/` directory (configured in `vite.config.ts`)
- **CSS**: Tailwind utility classes preferred; custom CSS in `src/styles/globals.css` when needed

### Architecture Patterns
- **Component-Based Architecture**: Modular, reusable components
- **Context API Pattern**: Global state management via `ContentContext` for:
  - Events, Partners, Gallery, Team, Hero content, About content, Site settings
- **Custom Router Pattern**: Lightweight client-side routing without external router library
- **Separation of Concerns**:
  - `src/components/` - UI components
  - `src/components/dashboard/` - Dashboard-specific components
  - `src/components/ui/` - Reusable UI primitives (shadcn/ui style)
  - `src/contexts/` - React Context providers
  - `src/utils/` - Utility functions and helpers
  - `src/supabase/` - Supabase configuration and Edge Functions
- **Provider Pattern**: App wrapped in `ContentProvider` and `RouterProvider`

### System Architecture

**Frontend Application (React + TypeScript)**
- Browser-based single-page application
- Uses React Context for state management
- Custom client-side router for navigation
- Component-based architecture with separation of concerns

**UI Layer**
- Built on Radix UI primitives for accessibility
- Styled with Tailwind CSS for utility-first styling
- Dark mode support via next-themes
- Responsive design for mobile, tablet, desktop

**Backend Services (Supabase)**
- PostgreSQL database for persistent storage
- Edge Functions (Hono) for serverless operations
- File storage for images and media
- Real-time subscriptions for collaborative features (future)

**Data Flow**
- User interactions → React Components → Hooks → ContentContext → Supabase Client → Database
- Admin edits → ContentContext → Supabase → Real-time → Landing page re-render

### Dependency Chain (Implementation Phases)

**Phase 0: Foundation Layer**
- Types, Styles, Utils (no dependencies)

**Phase 1: UI Layer**
- UI Components (depends on Types, Styles)

**Phase 2: Configuration & Integration**
- Supabase Client (depends on Types)
- React Hooks (depends on Types, Utils, Supabase Client)

**Phase 3: State Management**
- ContentContext (depends on Types, Supabase Client, Hooks)
- Router (depends on React)

**Phase 4: Component Layer**
- UI Components (app-specific) (depends on UI Components, ContentContext, Router)

**Phase 5: Page Components**
- LandingPage, AllEventsPage, Dashboard (depends on Component Layer, ContentContext, Router)

**Phase 6: Root Application**
- App (depends on all Page Components, Router, ContentContext)

### Testing Strategy

**Test Pyramid:**
- **Unit Tests**: 60% (Fast, isolated, deterministic) - Utility functions, hooks, pure logic
- **Integration Tests**: 30% (Module interactions, data flow) - Context providers, form submissions, data flow
- **E2E Tests**: 10% (End-to-end, slow, comprehensive) - Critical user flows only

**Coverage Requirements:**
- Line coverage: 80% minimum
- Branch coverage: 75% minimum
- Function coverage: 85% minimum
- Statement coverage: 80% minimum

**Critical Test Scenarios:**

**Event CRUD Operations:**
- Happy path: Create/edit/delete events, verify persistence
- Edge cases: Minimum fields, missing optional fields, multiple images
- Error cases: Invalid dates, oversized images, network errors
- Integration: Events appear in AllEventsPage, landing page updates

**Content Management:**
- Happy path: Team/partner/gallery CRUD operations
- Error cases: Invalid image formats, validation errors
- Integration: Content changes propagate to all pages

**Public Pages:**
- Happy path: Landing page renders, event filtering/search works
- Edge cases: No featured event, pagination, missing images
- Integration: Admin changes reflect on public pages

**Form Management:**
- Happy path: Valid form submission, success feedback
- Error cases: Validation errors, server errors, network timeouts

**Testing Framework:**
- **Current Status**: No testing framework configured
- **Recommendation**: Vitest for unit tests, React Testing Library for component tests
- **Future Testing Approach**:
  - Unit tests for utility functions (formatting, validation, API helpers)
  - Component tests for UI components
  - Integration tests for context providers and routing
  - E2E tests for critical user flows (event browsing, admin dashboard)

### Git Workflow
- **Branching**: Standard Git workflow (main branch)
- **Commit Conventions**: Not explicitly defined; consider adopting Conventional Commits
- **Recommendation**:
  - Use feature branches for new features
  - Descriptive commit messages
  - Consider using changesets for version management (see `.cursor/rules/changeset.mdc`)

## Domain Context

### Event Types
- **Music Festival**: Large-scale electronic music events with multiple DJs
- **Art & Culture**: Art exhibitions and cultural events
- **Live Music**: Intimate acoustic performances
- **Club Night**: Underground bass music and club events

### Event Structure
Each event includes:
- Basic info: title, description, date, time, venue, venue address
- Media: featured image, gallery images
- Artists: lineup with roles (Headliner, Supporting, Opening)
- Details: category, capacity, attendees, price range
- Highlights: key features and selling points
- Status: draft → upcoming → ongoing → completed → archived (lifecycle)

### Data Models

**Event**
```typescript
{
  id: string (UUID)
  title: string
  description: string
  date: Date
  time: string
  venue: string
  venue_address: string
  capacity: number
  price_min: number
  price_max: number
  category: 'festival' | 'art' | 'live_music' | 'club'
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'archived'
  featured_image: string (URL)
  gallery_images: string[] (URLs)
  artists: Artist[]
  highlights: string[]
  created_at: timestamp
  updated_at: timestamp
}
```

**Team Member**
```typescript
{
  id: string (UUID)
  name: string
  role: string
  bio: string
  photo: string (URL)
  social_links: { platform: string, url: string }[]
  created_at: timestamp
  updated_at: timestamp
}
```

**Partner**
```typescript
{
  id: string (UUID)
  name: string
  category: 'music' | 'energy' | 'beverage' | 'lifestyle' | 'technology'
  logo: string (URL)
  website_url: string
  sponsorship_level: 'platinum' | 'gold' | 'silver' | 'bronze'
  created_at: timestamp
  updated_at: timestamp
}
```

**Gallery Item**
```typescript
{
  id: string (UUID)
  image_url: string
  caption: string
  event_id: string (FK)
  uploaded_at: timestamp
}
```

**Hero Content**
```typescript
{
  title: string
  subtitle: string
  featured_event_id: string (FK)
  background_image: string (URL)
  stats: { label: string, value: string }[]
}
```

**Site Settings**
```typescript
{
  contact_email: string
  contact_phone: string
  social_links: { platform: string, url: string }[]
  site_metadata: { key: string, value: string }[]
}
```

### Content Management
The platform manages:
- **Events**: Full event lifecycle (creation, updates, status tracking)
- **Team Members**: Staff with roles, contact info, bios, photos
- **Partners**: Brand sponsors with categories (Music, Energy, Beverage, Lifestyle, Technology, etc.)
- **Gallery**: Event photos with captions and metadata
- **Hero Section**: Landing page hero content with stats
- **About Section**: Company story, founding year, features
- **Site Settings**: Contact info, social media links, site metadata

### Business Context
- Founded in 2020
- Indonesian market focus
- Community-driven platform
- Emphasis on creative culture and nightlife
- Multi-platform approach (web, events, partnerships)

## Important Constraints

### Technical Constraints
- **Supabase Project**: Must use project-specific MCP server (`supabase-wildout-project`) for all database operations
- **Build Target**: ESNext (modern browsers)
- **Port**: Development server runs on port 3000 (strict)
- **Vite Aliases**: Complex alias configuration in `vite.config.ts` for Figma asset imports and version-specific packages

### Business Constraints
- **Indonesian Market**: Content and events primarily focused on Indonesia
- **Community-First**: Platform prioritizes community engagement over pure commerce
- **Creative Culture**: Must maintain alignment with nightlife and creative industry values

### Regulatory Constraints
- None explicitly documented; consider Indonesian data protection regulations for user data

## External Dependencies

### Supabase Services
- **Database**: PostgreSQL database for events, team, partners, gallery, and settings
- **Edge Functions**: Serverless functions using Hono framework (located in `src/supabase/functions/server/`)
- **Storage**: Likely used for image uploads (gallery, team photos, event images)
- **Authentication**: May be used for admin dashboard access (not yet visible in current code)

### Third-Party Services
- **Unsplash**: Image hosting for event and team photos (based on URLs in ContentContext)
- **Social Media Platforms**: Integration points for Instagram, Twitter, Facebook, YouTube

### Design Resources
- **Figma**: Original design available at https://www.figma.com/design/gdU03sBHxmwEdKKZb5eJHW/WildOut--Landing-Page-and-Dashboard
- **Asset Management**: Figma assets imported via Vite aliases

### API Endpoints
- Supabase API endpoints (project-specific)
- Potential external APIs for event data, artist information (not yet implemented)

## Implementation Roadmap

### Phase 0: Foundation & Configuration
**Goal**: Establish project foundation with types, styles, utilities, and configuration.
- Setup TypeScript types for all domain entities
- Configure Tailwind CSS and global styles
- Create utility functions (formatting, validation, common helpers)
- Initialize Supabase client configuration

### Phase 1: UI Component Library
**Goal**: Build reusable, accessible UI component library using Radix UI and Tailwind.
- Implement core UI components (Button, Input, Dialog, Form, Select, Tabs)
- Implement data display components (Card, Badge, Avatar, Alert, Accordion)
- Implement form components (FormField, Checkbox, RadioGroup, DatePicker)
- Implement layout components (SideNav, Header, Footer, Grid layouts)

### Phase 2: State Management & Configuration
**Goal**: Setup global state management and application configuration.
- Implement ContentContext for global state
- Implement Router context for navigation
- Create custom React hooks (useEvents, useRouter, useForm helpers)

### Phase 3: Dashboard - Core Infrastructure
**Goal**: Build dashboard layout and core management interface structure.
- Implement DashboardLayout with navigation, sidebar, and main content area
- Implement DashboardHome with overview and statistics
- Create form component wrappers for dashboard

### Phase 4: Event Management
**Goal**: Implement complete event CRUD operations and event-related features.
- Implement DashboardEvents listing page
- Implement DashboardEventsNew form for creating and editing events
- Implement event gallery & media management
- Implement event status lifecycle management

### Phase 5: Content Management (Team, Partners, Gallery, Settings)
**Goal**: Implement management interfaces for team, partners, gallery, and site settings.
- Implement DashboardTeam for team member management
- Implement DashboardPartners for sponsor/partner management
- Implement DashboardGallery for site-wide gallery management
- Implement DashboardHero and DashboardAbout for landing page content
- Implement DashboardSettings for site configuration

### Phase 6: Public Pages - Landing & Events Display
**Goal**: Build public-facing landing page and events browsing experience.
- Implement LandingPage with hero, featured events, team, partners sections
- Implement AllEventsPage with filtering, search, and pagination
- Implement EventDetail modal/view with full event information
- Implement responsive design and mobile optimization

### Phase 7: Performance, Testing & Polish
**Goal**: Optimize performance, add comprehensive tests, and refine user experience.
- Implement caching strategy and performance optimization
- Add comprehensive test suite (unit, integration, E2E)
- Implement error handling and user feedback (toasts, error boundaries)
- Polish UI/UX, add animations, finalize branding

### Phase 8: Deployment & Monitoring (Post-MVP)
**Goal**: Deploy to production and setup monitoring.
- Setup CI/CD pipeline for automated testing and deployment
- Deploy to production hosting
- Setup monitoring and error tracking (Sentry, analytics)

## Risks & Mitigation

### Technical Risks

**Supabase Real-time subscriptions not scaling beyond 50K members**
- **Impact**: High - Platform can't handle live updates as community grows
- **Likelihood**: Medium
- **Mitigation**: Implement smart subscription management, use polling fallback
- **Fallback**: Migrate to self-hosted PostgreSQL with custom WebSocket layer

**React Context re-renders on every content change, performance degrades**
- **Impact**: Medium - UI becomes sluggish as data grows
- **Likelihood**: Medium
- **Mitigation**: Implement useMemo/useCallback in context, consider split contexts per entity
- **Fallback**: Migrate to Zustand or Redux for fine-grained reactivity

**Image uploads to Supabase Storage overwhelm performance or costs**
- **Impact**: Medium
- **Likelihood**: Low
- **Mitigation**: Implement image compression before upload, add CDN for image delivery
- **Fallback**: Use alternative storage (AWS S3, Cloudinary)

**TypeScript type definitions become unmaintainable as schema evolves**
- **Impact**: Low-Medium
- **Likelihood**: Medium
- **Mitigation**: Use Supabase type generation tools, automate schema → types pipeline
- **Fallback**: Accept runtime validation, add zod/runtime type checking

### Scope Risks

**Event schema requirements evolve faster than implementation**
- **Impact**: Medium - Mid-development schema changes, rework required
- **Likelihood**: High
- **Mitigation**: Build flexible schema with JSONB fields, design for extension
- **Fallback**: Prioritize core MVP, defer non-essential fields to Phase 2

**UI/UX requirements expand beyond initial scope**
- **Impact**: Low-Medium - Timeline slips, scope creep
- **Likelihood**: Medium
- **Mitigation**: Lock scope before Phase 3, use design system to standardize
- **Fallback**: Release v0.1.0 with basic UX, refine in v0.2.0

**Team capacity lower than estimated**
- **Impact**: High - Timeline extends significantly
- **Likelihood**: Medium
- **Mitigation**: Prioritize MVP features (Phases 0-5), defer nice-to-have (Phase 7-8)
- **Fallback**: Cut less critical features (analytics, monitoring), extend timeline

## References

- **Supabase Documentation**: https://supabase.com/docs
- **React Documentation**: https://react.dev
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/primitives/docs/overview/introduction
- **Vite Documentation**: https://vitejs.dev/guide/
- **WildOut! Figma Design**: https://www.figma.com/design/gdU03sBHxmwEdKKZb5eJHW/WildOut--Landing-Page-and-Dashboard
- **RPG Methodology**: Repository Planning Graph method for structured PRD creation

## Open Questions

1. **Admin Authentication**: How should admin users authenticate? (OAuth, email/password, SAML?)
2. **Event Artist Data Model**: Should artists be standalone entities or always linked to events?
3. **Community Profiles**: Should artists/venues have public profiles with their own pages?
4. **Analytics Requirements**: What specific metrics should dashboard show? (views, clicks, conversions?)
5. **Multi-language Support**: Should platform support Indonesian + English from start?
6. **Payment Integration**: Is there an event ticketing/payment flow needed?
7. **Image Storage Strategy**: CDN requirement? Image optimization preferences?
8. **Real-time Requirements**: Do admins need to see real-time collaborative editing or is eventual consistency OK?
9. **Mobile Admin App**: Is mobile admin dashboard needed or web-only?
10. **Version History**: Should content have revision history/rollback capabilities?
