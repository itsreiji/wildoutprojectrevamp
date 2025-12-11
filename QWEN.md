# WildOut! Landing Page and Dashboard - Project Context

## Project Overview

WildOut! is a comprehensive event management platform featuring a public landing page and a sophisticated admin dashboard. The application has been migrated to Next.js 16 with the App Router architecture, with Supabase serving as the backend for data management and authentication. The platform enables real-time synchronization between the public landing page and admin dashboard, with all content managed through Supabase as the single source of truth.

### Key Technologies
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Database/Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: React Context API with custom providers
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: Radix UI primitives, Lucide React icons
- **Build Tool**: Next.js Compiler
- **Package Manager**: pnpm

### Architecture Highlights
- **Supabase-Driven Architecture**: All content (events, partners, team, gallery, hero, about content) is stored in and retrieved from Supabase
- **Real-time Synchronization**: Changes made in the admin dashboard are immediately reflected on the public landing page
- **Role-Based Access Control (RBAC)**: Three-tier system (admin, editor, user) with section-level permissions
- **Dynamic Admin Menu**: Admin navigation items are loaded from Supabase `admin_sections` table
- **Configurable Admin Path**: Default admin dashboard at `/sadmin` with legacy support for `/admin`

## Directory Structure

```
app/
├── api/                      # Next.js API routes
├── sadmin/                   # Admin dashboard pages
├── login/                    # Login page
├── register/                 # Registration page
├── events/                   # Events page
├── test-ui/                  # UI test page
├── 404/                      # Not found page
├── layout.tsx               # Root layout with providers
├── page.tsx                 # Landing page
└── globals.css              # Global styles
components/
├── ui/                      # Shadcn UI components
├── admin/                   # Admin-specific components
├── LandingPage.tsx          # Landing page component
├── Dashboard.tsx            # Dashboard component
├── router.tsx               # Router components (placeholder)
└── ...                      # Other UI components
providers/
├── auth-provider.tsx        # Authentication provider
├── content-provider.tsx     # Content provider
├── events-provider.tsx      # Events provider
├── partners-provider.tsx    # Partners provider
├── static-content-provider.tsx # Static content provider
├── team-provider.tsx        # Team provider
└── query-provider.tsx       # Query provider
lib/
├── supabase/                # Supabase client
├── utils.ts                 # Utility functions
└── ...                      # Other utility modules
types/                       # Type definitions
├── content.ts               # Content-related types
├── supabase.ts              # Supabase-generated types
└── ...                      # Other type definitions
services/                    # Service implementations
utils/                       # Utility functions
```

## Building and Running

### Prerequisites
- Node.js (latest stable)
- pnpm package manager
- Supabase project (URL and anon key)

### Setup and Installation
1. Install dependencies: `pnpm install`
2. Set up environment variables (copy from `.env.example`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Optional configuration:
   - `NEXT_PUBLIC_ADMIN_BASE_PATH` to customize admin URL (default: `/sadmin`)
   - `NEXT_PUBLIC_USE_DUMMY_DATA` for development with mock data

### Development Commands
- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run Next.js linting
- `pnpm type-check`: Type check without emitting
- `pnpm test`: Run tests
- `pnpm test:ui`: Run tests with UI
- `pnpm test:coverage`: Run tests with coverage report
- `pnpm format`: Format all files with Prettier
- `pnpm format:check`: Check if files are formatted with Prettier
- `pnpm lint:parallel`: Run all linting tools in parallel (ESLint, TypeScript, Prettier)
- `pnpm lint:all`: Run all linting sequentially

### Database Setup
1. Apply Supabase migrations to create all necessary tables
2. Content tables are automatically seeded with initial data from the repository
3. Key Supabase tables include:
   - Content tables: `hero_content`, `about_content`, `site_settings`
   - Event management: `events`, `gallery_items`, `partners`, `team_members`
   - Authentication: Extended `profiles` table with roles
   - Admin system: `admin_sections`, `section_content`, `role_permissions`, `user_permissions`
   - Audit logging: `audit_log`, `user_sessions`

## Development Conventions

### Authentication System
- Role-based access control with admin/editor/user roles
- OAuth (Google) and email/password authentication
- Session validation and security measures
- Remember me functionality with Next.js cookies
- Server-side authentication handling through Next.js API routes

### State Management
- React Context API for global state (AuthContext, ContentContext, etc.)
- TanStack Query for server state management
- Custom hooks for accessing context values
- Provider pattern for component composition

### UI Components
- Radix UI primitives for accessible components
- Tailwind CSS with custom configuration for styling
- Component-based architecture with clear separation of concerns
- Reusable UI components in the `components/ui` directory

### Security Measures
- Input sanitization and validation
- CSRF protection
- Rate limiting for authentication attempts
- Role-based access control at both UI and API levels
- Secure session management with Supabase

### Content Management
- Supabase as the single source of truth
- Real-time synchronization between admin and public views
- Audit logging for content changes
- Versioned content management in some sections

## Key Features

### Landing Page ↔ Admin Dashboard Sync
- Real-time synchronization between public landing page and admin dashboard
- Admin content management for hero section, about content, and site settings
- Supabase as the source of truth for dynamic and static content
- Import tool for seeding repository data into Supabase

### Authentication & User Management
- Complete user authentication system with role-based access
- User registration and automatic 'user' role assignment
- Admin login with Supabase session validation
- Role management with admin/editor/user permissions

### Supabase-Driven Admin Menu & RBAC
- Dynamic admin menu loaded from Supabase `admin_sections` table
- Role-based access control with configurable permissions
- Section-level access control for viewing, editing, publishing, and deleting
- Permission inheritance with optional user-specific overrides

### Configurable Admin Base Path
- Default admin dashboard accessible at `/sadmin`
- Configurable via `NEXT_PUBLIC_ADMIN_BASE_PATH` environment variable
- Automatic link generation based on configured base path