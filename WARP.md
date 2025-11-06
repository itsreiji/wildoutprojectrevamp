# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

WildOut! is a React-based event management and media platform consisting of a landing page, admin dashboard, and events listing page. It's built with modern web technologies including TypeScript, Vite, React, and Tailwind CSS.

## Development Commands

### Essential Commands
- **Start development**: `npm run dev` (starts Vite dev server on port 5173)
- **Build production**: `npm run build` (creates optimized build in `build/` directory)
- **Lint code**: `npx eslint . --ext .ts,.tsx` (checks TypeScript and React files)
- **Format code**: Prettier is integrated with ESLint, configured in `.prettierrc.json`

### Project Setup
- Install dependencies: `npm install`
- The project requires Node.js 18.x or higher (recommended: 20.x LTS)

## Architecture Overview

### Technology Stack
- **Framework**: React 19.2.0 with TypeScript 5.9.3
- **Build Tool**: Vite 7.2.1 with SWC for fast compilation
- **Styling**: Tailwind CSS v4 with custom dark theme (#0a0a0a) and primary color (#E93370)
- **UI Components**: Extensive use of shadcn/ui components from Radix UI
- **Development Tools**: ESLint with TypeScript support, Prettier integration

### File Structure
```
src/
├── components/          # React components (organized by feature)
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── dashboard/      # Dashboard-specific components
│   └── figma/          # Components for Figma integrations
├── contexts/           # React contexts (ContentContext contains main data)
├── styles/             # Global styles and Tailwind config
├── utils/              # Utility functions
├── supabase/           # Supabase functions and server code
└── main.tsx            # Application entry point
```

### Core Implementation Patterns

#### React Component Structure
- Components use TypeScript with strict type checking
- Follow functional component pattern with hooks
- Use the `useContent` hook from ContentContext for data access

#### Routing System
- Custom routing implementation in `components/Router.tsx`
- Uses browser History API for navigation
- Three main routes: 'landing' (/), 'admin' (/admin), and 'all-events' (/events)

#### Data Management
- `ContentContext.tsx` acts as a centralized state store
- Contains initial mock data for events, partners, gallery images, and team members
- Provides update functions for each data type

#### UI Patterns
- Consistent use of shadcn/ui components
- Components follow semantic HTML structure
- Responsive design with Tailwind classes
- Dark theme support throughout the application

### Key Files to Understand

1. `src/App.tsx` - Main application structure with routing
2. `src/components/Router.tsx` - Custom routing implementation
3. `src/contexts/ContentContext.tsx` - Central state management with mock data
4. `src/components/LandingPage.tsx` - Public-facing homepage
5. `src/components/Dashboard.tsx` - Admin dashboard interface
6. `vite.config.ts` - Build configuration with path aliases

## Development Workflow

### Code Style
- Use TypeScript for all new files
- Follow ESLint rules configured in `eslint.config.js`
- Use Prettier for formatting (auto-format on save recommended)
- Use the `@/` alias for imports from the `src/` directory

### Component Development
- Create components in appropriate feature directories
- Import UI components from the `src/components/ui/` directory
- Use the `useContent()` hook to access data from context
- Add proper PropTypes and TypeScript types

### Styling Approach
- Use Tailwind classes for styling
- Leverage the existing dark theme color scheme
- Use consistent spacing and typography patterns
- Components should be responsive by default

## Important Project Rules

- Always run `npm run dev` to test changes during development
- Check linting with `npx eslint . --ext .ts,.tsx` before committing
- The build output goes to `build/` directory (not `dist/`)
- Port 5173 is used in development; configure in `vite.config.ts` if needed
- The project uses strict TypeScript mode with no unused variables allowed

## Testing for Development

This project currently does not have a configured testing framework. When implementing test coverage, update the package.json with appropriate test scripts.

