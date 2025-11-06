# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

WildOut! is a nightlife and event management platform built with React, TypeScript, and Vite. The application consists of a public-facing landing page and an admin dashboard for content management.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build
```

## Architecture

### Technology Stack
- **Frontend**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 
- **UI Framework**: Shadcn/ui components with RadixUI primitives
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React Context (ContentContext)
- **Backend**: Planned Supabase integration (not yet implemented)

### Application Structure
The app uses a custom client-side router with URL-based navigation but no traditional React Router:

```typescript
// Three main pages
type Page = 'landing' | 'admin' | 'all-events';
```

1. **Landing Page** (`/`): Public-facing marketing page with sections for events, team, gallery, etc.
2. **Admin Dashboard** (`/admin`): Content management interface for managing all site data
3. **All Events Page** (`/events`): Dedicated page for listing all events

### Key Components

#### File Organization
- `src/components/` - Main application components
  - `LandingPage.tsx` - Main public landing page
  - `Dashboard.tsx` - Admin dashboard shell
  - `AllEventsPage.tsx` - Events listing page
  - `Navigation.tsx` - Site navigation
  - `ui/` - Reusable UI components (shadcn/ui)
  - `dashboard/` - Admin dashboard page components

#### Data Management
- All content is managed through React Context (`ContentContext.tsx`)
- Initial data is hardcoded (`INITIAL_*` constants) with future Supabase integration
- State is updated through provided setter functions

#### Styling
- Uses Tailwind CSS with a custom dark theme
- Theme variables defined in `src/styles/globals.css`
- Primary brand color: `#E93370`
- Background color: `#0a0a0a` (dark mode)

### UI Components
The project extensively uses shadcn/ui components for a consistent design system:
- Forms, modals, cards, badges, buttons, etc.
- Components are located in `src/components/ui/`
- When adding new UI elements, prefer using existing shadcn/ui components or extending them

### Development Notes

#### Content Management
- All content (events, team, partners, gallery) is managed in-memory through React Context
- The admin dashboard provides UI for managing this data but changes are not persisted
- Supabase integration is planned for backend persistence

#### Asset Management
- Static images are stored in `src/assets/`
- Figma assets are directly referenced through the Vite config aliases
- Unsplash URLs are used for placeholder images in initial data

#### Component Patterns
- Components are memoized with `React.memo()` for performance
- Custom hooks are used for data fetching (`useContent`, `useRouter`)
- TypeScript interfaces are fully typed for all data structures

#### Dashboard Implementation
- The dashboard has its own internal routing system separate from the app's main router
- Dashboard pages are in `src/components/dashboard/`
- Each dashboard section has its own component file (e.g., `DashboardHome.tsx`, `DashboardEvents.tsx`)

## Future Development Areas

1. **Backend Integration**: Supabase connection is planned but not implemented
2. **Data Persistence**: Currently all changes are lost on page refresh
3. **Image Upload**: Media management system needs implementation
4. **Authentication**: Admin area should be protected
5. **Testing**: No test framework is currently configured

## File Structure Highlights

```
src/
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── dashboard/      # Admin dashboard pages
│   └── ...             # Application components
├── contexts/
│   └── ContentContext.tsx  # Global state management
├── styles/
│   └── globals.css     # Global styles and theme
├── main.tsx           # Application entry point
```

## Key Files to Understand

- `src/App.tsx` - Main application structure with routing
- `src/contexts/ContentContext.tsx` - Data model and state management
- `src/components/Router.tsx` - Custom client-side routing
- `vite.config.ts` - Build configuration with asset aliases