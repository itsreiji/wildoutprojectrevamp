# Project Context

## Purpose
WildOut! is a media digital nightlife & event multi-platform for Indonesia's creative community. The platform connects artists, events, and experiences, serving as both a public-facing landing page and an administrative dashboard for managing events, team members, partners, gallery content, and site settings.

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

### Testing Strategy
- **Current Status**: No testing framework configured
- **Recommendation**: Consider adding Vitest for unit tests and React Testing Library for component tests
- **Future Testing Approach**:
  - Unit tests for utility functions
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
- Status: upcoming, ongoing, or completed

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
