# Change: Foundation Types and Utility Functions

## Why
The current codebase has TypeScript types defined inline within `ContentContext.tsx`, making them difficult to reuse across the application. Additionally, there are no centralized utility functions for common operations like date formatting, input validation, or API helpers. This foundational work is required before implementing data fetching and other features that depend on these types and utilities.

## What Changes
- **BREAKING**: Extract all type definitions from `src/contexts/ContentContext.tsx` into dedicated type files under `src/types/`
  - Create `src/types/events.ts` for Event interface
  - Create `src/types/team.ts` for TeamMember interface
  - Create `src/types/partners.ts` for Partner interface
  - Create `src/types/content.ts` for HeroContent, AboutContent, and GalleryImage interfaces
  - Create `src/types/settings.ts` for SiteSettings interface
- Create utility functions in `src/utils/`:
  - `formatting.ts` - Date and string formatting utilities
  - `validation.ts` - Input validation functions (email, URL, etc.)
  - `api.ts` - Supabase API helper functions (placeholders initially)
- Update `ContentContext.tsx` to import types from the new type files instead of defining them inline

## Impact
- **Affected specs**: None (no existing specs)
- **Affected code**:
  - `src/contexts/ContentContext.tsx` - Will import types instead of defining them
  - New files: `src/types/*.ts` and `src/utils/formatting.ts`, `src/utils/validation.ts`, `src/utils/api.ts`
- **Breaking changes**: Type imports will change for any code that currently imports types from ContentContext

