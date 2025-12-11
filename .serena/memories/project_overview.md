# WildOut! Project Overview

## Project Purpose
WildOut! is a Next.js 16 application that provides a landing page and admin dashboard with real-time synchronization. The application features:

- **Landing Page ↔ Admin Dashboard Sync**: Real-time content management with Supabase as the source of truth
- **Authentication & User Management**: Complete user authentication with role-based access control
- **Supabase-Driven Admin Menu & RBAC**: Dynamic admin interface with role-based permissions
- **Configurable Admin Base Path**: Flexible admin routing configuration

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **UI Components**: Shadcn UI, Radix UI
- **Testing**: Vitest
- **Linting/Formatting**: ESLint, Prettier
- **Package Manager**: pnpm

## Project Structure
```
/
├── app/              # Routes and pages (Next.js App Router)
├── components/       # UI components (atomic + feature-specific)
├── lib/              # Utilities and configuration
├── services/         # Business logic
├── supabase/         # Database configuration and migrations
├── providers/        # React context providers
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── test/             # Test files
```

## Key Features
1. **Real-time Content Sync**: Admin changes immediately appear on landing page
2. **Role-Based Access Control**: Admin/Editor/User roles with fine-grained permissions
3. **Dynamic Admin Menu**: Loaded from Supabase admin_sections table
4. **Supabase Integration**: All content stored and served from Supabase
5. **Import Tool**: Automatic data seeding from repository

## Development Commands
- **Install**: `pnpm install`
- **Dev Server**: `pnpm dev`
- **Build**: `pnpm build`
- **Test**: `pnpm test` (Vitest)
- **Lint**: `pnpm lint`
- **Type Check**: `pnpm type-check`
- **Format**: `pnpm format`
- **All Checks**: `pnpm lint:all` (lint + type-check + format)