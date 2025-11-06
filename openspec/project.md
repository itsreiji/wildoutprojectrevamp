# Project Context

## Purpose

WildOut! is Indonesia's premier nightlife and creative community platform that connects artists, events, and experiences. The platform serves as a digital hub for Jakarta's vibrant nightlife scene, featuring:

- **Landing Page**: Modern dark-themed showcase of upcoming events, featured artists, and brand partnerships
- **Admin Dashboard**: Complete content management system for event organizers and community managers
- **Real-time Sync**: Seamless integration between public-facing content and admin management
- **Community Building**: Connecting creative professionals, event attendees, and brand partners

**Goals:**
- Democratize access to Jakarta's nightlife scene
- Provide comprehensive event management tools
- Foster creative community collaboration
- Showcase Indonesian cultural innovation
- Enable seamless brand-event partnerships

## Tech Stack

### Frontend
- **React 19.2.0** - Modern React with concurrent features and hooks
- **TypeScript 5.9.3** - Full type safety with strict mode throughout the application
- **Vite 7.1.12** - Fast build tool with SWC for rapid development
- **React Router DOM 7.9.5** - Client-side routing with protected admin routes
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **shadcn/ui** - High-quality React components built on Radix UI

### UI/UX Libraries
- **Radix UI** - Accessible, unstyled UI primitives
- **Lucide React** - Beautiful, consistent icon library
- **Motion (Framer Motion)** - Smooth animations and transitions
- **Sonner** - Toast notifications
- **React Hook Form** - Performant form handling

### Development Tools
- **ESLint 9** - Code linting with flat config format, TypeScript and React rules
- **Prettier 3.6** - Code formatting integrated with ESLint
- **TypeScript Compiler** - Type checking with strict mode enabled
- **Vite Plugin React SWC** - Fast refresh and optimized builds

### Build Configuration
- **Target**: ES2020 for modern JavaScript features
- **Bundle Output**: `build/` directory
- **Dev Server**: Port 5173 with strict port enforcement
- **Preview Server**: Port 3000 for production preview
- **Path Aliases**: `@` resolves to `./src` for clean imports

### Backend/Storage (Planned)
- **Supabase** - PostgreSQL database, authentication, and real-time subscriptions
- **Edge Functions** - Serverless functions for API endpoints

## Project Conventions

### Code Style

#### TypeScript Standards
- **Strict Mode**: All TypeScript files use strict type checking
- **Compiler Options**: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` enabled
- **Interface vs Type**: Use `interface` for object shapes, `type` for unions/primitives
- **Generic Naming**: Use PascalCase for types (e.g., `Event`, `Partner`, `TeamMember`)
- **Property Naming**: camelCase for object properties and variables
- **Optional Properties**: Use `?:` for optional properties, avoid `| undefined`
- **Ignored Arguments**: Use `_` prefix for intentionally unused arguments

#### React Patterns
- **Functional Components**: Always use functional components with hooks
- **React.memo()**: Use for components that re-render frequently
- **Custom Hooks**: Prefix with `use` (e.g., `useContent`, `useAuth`)
- **Props Destructuring**: Always destructure props in function parameters

#### File Naming
- **Components**: PascalCase (e.g., `DashboardHome.tsx`)
- **Utilities**: camelCase (e.g., `apiHelpers.ts`)
- **Directories**: kebab-case for feature directories
- **Index Files**: Use `index.ts` for clean imports

### Architecture Patterns

#### State Management
- **Context Pattern**: Use React Context for global application state
- **Local State**: Use `useState` for component-specific state
- **Server State**: Supabase for server-side data (planned)

#### Component Architecture
```
src/
├── components/
│   ├── ui/           # Reusable UI components (shadcn/ui)
│   ├── dashboard/    # Admin dashboard components
│   │   ├── DashboardLayout.tsx    # Main dashboard shell
│   │   ├── DashboardHome.tsx      # Dashboard overview
│   │   ├── DashboardEvents.tsx    # Event management
│   │   ├── DashboardGallery.tsx   # Gallery management
│   │   ├── DashboardPartners.tsx  # Partner management
│   │   ├── DashboardTeam.tsx      # Team management
│   │   └── DashboardSettings.tsx  # Site settings
│   ├── HeroSection.tsx       # Landing page hero
│   ├── EventsSection.tsx     # Events showcase
│   ├── AboutSection.tsx      # About content
│   ├── TeamSection.tsx       # Team display
│   ├── GallerySection.tsx    # Gallery display
│   ├── PartnersSection.tsx   # Partners showcase
│   ├── Background3D.tsx      # 3D background effects
│   ├── FloatingDock.tsx      # Navigation dock
│   └── Footer.tsx            # Site footer
├── contexts/         # React contexts for global state
│   └── ContentContext.tsx    # Main content state management
├── utils/            # Utility functions
│   └── supabase/     # Supabase integration utilities
├── styles/           # Global styles and themes
│   └── globals.css   # Global CSS with Tailwind
└── guidelines/       # Development guidelines
```

#### Data Flow
- **Unidirectional**: Data flows down through props, up through callbacks
- **Context Updates**: All state mutations go through context update functions
- **Real-time Sync**: Dashboard changes immediately reflect on landing page

#### Data Models
The application uses strongly-typed TypeScript interfaces for all data:

```typescript
// Core Content Types
Event {
  id, title, description, date, time, venue, venueAddress, image,
  category, capacity, attendees, price, artists[], gallery[],
  highlights[], status: 'upcoming' | 'ongoing' | 'completed'
}

Partner {
  id, name, category, website,
  status: 'active' | 'inactive'
}

GalleryImage {
  id, url, caption, uploadDate, event?
}

TeamMember {
  id, name, role, email, instagram?, bio, photoUrl?,
  status: 'active' | 'inactive'
}

HeroContent {
  title, subtitle, description,
  stats { events, members, partners }
}

AboutContent {
  title, subtitle, story[], foundedYear,
  features[] { title, description }
}

SiteSettings {
  siteName, siteDescription, tagline, email, phone, address,
  socialMedia { instagram, twitter, facebook, youtube }
}
```

### Routing Strategy

#### Application Routes
- **`/`** - Main landing page with all public sections
- **`/admin`** - Protected admin dashboard for content management
- **`*`** - Catch-all redirects to home page

#### Route Protection
- Admin routes use a simple boolean check (placeholder for future authentication)
- Failed authentication redirects to home page
- Navigate component from React Router for programmatic navigation

### Available Scripts

```bash
npm run dev          # Start development server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build (port 3000)
npm run type-check   # Run TypeScript type checking
npm run lint         # Run ESLint on source files
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run clean        # Remove build directories
npm run analyze      # Analyze bundle size
```

### Testing Strategy

#### Current Approach
- **Manual Testing**: UI/UX testing through browser interaction
- **Type Checking**: TypeScript provides compile-time guarantees
- **Build Validation**: Automated build checks before deployment
- **Linting**: ESLint catches common code issues

#### Future Testing (Planned)
- **Unit Tests**: Jest + React Testing Library for component testing
- **Integration Tests**: Test context updates and data flow
- **E2E Tests**: Playwright for critical user journeys
- **Visual Regression**: Chromatic for UI consistency

### Git Workflow

#### Branching Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Individual feature branches
- **hotfix/***: Urgent production fixes

#### Commit Conventions
```
feat: add new event creation functionality
fix: resolve dashboard sidebar mobile layout
docs: update README with deployment instructions
style: format dashboard components with Prettier
refactor: extract event validation logic to utils
test: add unit tests for event form validation
chore: update dependencies to latest versions
```

#### Pull Request Process
- **Feature branches** must be rebased on develop
- **Code review** required before merging
- **Tests pass** and build succeeds
- **No merge commits** - use rebase strategy

## Domain Context

### Nightlife Industry Knowledge

#### Event Categories
- **Music Festival**: Large-scale electronic music events
- **Club Night**: Underground bass music and DJ performances
- **Live Music**: Acoustic and band performances
- **Art & Culture**: Contemporary art exhibitions and cultural events
- **Networking**: Industry meetups and professional gatherings
- **Workshop**: Creative skill-building sessions

#### Jakarta Nightlife Scene
- **Primary Venues**: Convention centers, rooftop bars, underground clubs
- **Peak Hours**: Events typically start 21:00-22:00, run until 04:00-05:00
- **Demographics**: Young professionals, artists, creatives (18-35 age group)
- **Cultural Context**: Blend of international electronic music with local Indonesian culture

#### Business Model
- **Event Promotion**: Platform for event discovery and ticketing
- **Brand Partnerships**: Sponsored events and brand activations
- **Community Building**: Artist networking and collaboration opportunities
- **Content Creation**: Gallery management for event documentation

### Indonesian Market Considerations

#### Language & Localization
- **Primary Language**: Indonesian (Bahasa Indonesia)
- **Secondary**: English for international artists/brands
- **Date Formats**: Use Indonesian locale for event dates
- **Currency**: Indonesian Rupiah (IDR) for pricing

#### Cultural Sensitivities
- **Time Respect**: Events respect Islamic prayer times
- **Dress Code**: Appropriate attire for diverse audience
- **Content Guidelines**: Respectful representation of Indonesian culture

## Important Constraints

### Technical Constraints
- **SPA Architecture**: Single-page application with client-side routing
- **Browser Support**: Modern browsers only (ES2020+ features)
- **Mobile First**: Responsive design prioritizing mobile experience
- **Performance Budget**: Bundle size < 500KB gzipped

### Business Constraints
- **Indonesian Market**: Compliance with local regulations and customs
- **Content Moderation**: Age-appropriate content for nightlife audience
- **Payment Processing**: Integration with Indonesian payment systems
- **Data Privacy**: GDPR-compliant user data handling

### Design System

#### Colors
- **Primary Brand**: `#E93370` (WildOut Pink)
- **Background**: `#0a0a0a` (Near black for dark theme)
- **Text**: White/Light colors for contrast
- **Glass Effects**: Backdrop blur with transparency for modern UI

#### Typography
- Modern sans-serif font stack (system fonts)
- Responsive font sizes using Tailwind utilities
- Clear hierarchy with heading and body text styles

#### Component Patterns
- **Dark Theme**: All components use dark mode by default
- **Glass Morphism**: Transparent backgrounds with backdrop blur
- **Smooth Animations**: Motion/Framer Motion for transitions
- **Responsive Grid**: Mobile-first responsive layouts
- **Icon System**: Lucide React for consistent iconography

### Performance Constraints
- **Image Optimization**: All images must be compressed and responsive (Unsplash images used)
- **Loading Speed**: First contentful paint < 2 seconds
- **Bundle Splitting**: Lazy load dashboard routes
- **Caching Strategy**: Efficient caching for static assets
- **Bundle Size Target**: < 500KB gzipped

## External Dependencies

### Current Dependencies
- **Vercel/Netlify**: Hosting and deployment platform
- **GitHub**: Version control and CI/CD
- **Figma**: Design system and component library source

### Planned Integrations
- **Supabase**: Database, authentication, and real-time features
  - PostgreSQL database for event and user data
  - Row Level Security (RLS) for data access control
  - Real-time subscriptions for live updates

- **Payment Processors**: Indonesian payment gateways
  - Midtrans or similar for ticket sales
  - Multiple payment methods (bank transfer, e-wallets, cards)

- **Social Media APIs**: Content sharing and promotion
  - Instagram API for gallery integration
  - Twitter/X API for event announcements

- **Analytics**: User behavior and event performance tracking
  - Google Analytics 4 for web analytics
  - Custom event tracking for business metrics

### Third-party Services
- **Image Hosting**: Cloudinary or similar for optimized image delivery
- **Email Service**: SendGrid/Mailgun for notifications and marketing
- **SMS Service**: Local Indonesian SMS provider for OTP and alerts

## Current Implementation Status

### ✅ Completed Features

#### Landing Page
- Hero section with dynamic stats and branding
- About section with company story and features
- Events showcase with category filtering
- Team member profiles with bios and social links
- Gallery with event photos
- Partner/brand logos showcase
- Responsive footer with social links
- 3D animated background effects
- Floating navigation dock

#### Admin Dashboard
- Complete dashboard layout with sidebar navigation
- Event management (CRUD operations)
- Partner management
- Gallery management with image uploads
- Team member management
- Site settings configuration
- Real-time preview of landing page changes
- Responsive design for mobile/tablet/desktop

#### State Management
- ContentContext providing global state
- Event data with full details (artists, gallery, highlights)
- Partner information
- Gallery images with event associations
- Team member profiles
- Hero and About content management
- Site-wide settings

#### Developer Experience
- Hot module replacement with Vite
- TypeScript type checking throughout
- ESLint with Prettier integration
- Path aliases for clean imports
- Build optimization with SWC

### 🚧 Planned Features

#### Authentication & Security
- Supabase authentication for admin access
- Row-level security for data access
- User roles and permissions
- Session management

#### Database Integration
- Supabase PostgreSQL database
- Real-time subscriptions for live updates
- Image storage in Supabase Storage
- Database migrations

#### Additional Features
- Event ticketing integration
- Email notifications
- Social media integration
- Analytics dashboard
- SEO optimization
- Progressive Web App (PWA)

## Key Differentiators

### What Makes This Project Unique

1. **Modern Tech Stack**: React 19, TypeScript 5.9, Vite 7.1 - cutting-edge tools
2. **Type Safety**: Comprehensive TypeScript interfaces for all data models
3. **Real-time Sync**: Dashboard changes instantly reflect on landing page via React Context
4. **Indonesian Focus**: Tailored for Jakarta's nightlife scene with local considerations
5. **Beautiful UI**: Dark theme with glass morphism and smooth animations
6. **Developer Friendly**: Clean architecture, strict linting, path aliases
7. **Comprehensive CMS**: Full content management without external CMS platforms
