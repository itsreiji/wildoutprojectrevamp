# src/types/ - TypeScript Type Definitions

**Detailed guidance for TypeScript type definitions and interfaces**

## Package Identity

- **Purpose**: TypeScript type definitions and interfaces for the WildOut! application
- **Primary Tech**: TypeScript 5.9, TypeScript interfaces and types
- **Pattern**: Modular type organization with proper TypeScript typing

## Setup & Run

```bash
# No special setup needed - types are part of main app
# Type checking validates all types
pnpm type-check
```

## Patterns & Conventions

### File Organization Rules

- **Domain Types**: One file per domain (e.g., `events.ts`, `partners.ts`, `team.ts`)
- **Index File**: `index.ts` for exporting all types
- **Content Types**: `content.ts` for content-related types
- **Settings Types**: `settings.ts` for application settings

### Naming Conventions

- **Type Files**: kebab-case (e.g., `events.ts`, `partners.ts`)
- **Interfaces**: PascalCase with `I` prefix (e.g., `IEvent`, `IPartner`)
- **Types**: PascalCase with `Type` suffix (e.g., `EventType`, `PartnerType`)
- **Enums**: PascalCase (e.g., `EventStatus`, `PartnerType`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_EVENT_SETTINGS`)

### Preferred Patterns

✅ **DO**: Create modular type definitions

```typescript
// Example: src/types/events.ts
export interface IEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  created_at: string;
  updated_at: string;
}

export type EventType = "conference" | "workshop" | "meetup" | "webinar";

export interface IEventResponse {
  data: IEvent[];
  error: Error | null;
}
```

✅ **DO**: Use interfaces for object shapes
✅ **DO**: Use types for unions, intersections, and utility types
✅ **DO**: Export all types from index.ts for easy importing
✅ **DO**: Use proper TypeScript generics when needed
✅ **DO**: Document complex types with JSDoc comments

❌ **DON'T**: Use `any` type (avoid at all costs)
❌ **DON'T**: Create circular type dependencies
❌ **DON'T**: Duplicate type definitions

### Index File Pattern

✅ **DO**: Follow pattern from `src/types/index.ts`

```typescript
// Example: src/types/index.ts
export * from "./events";
export * from "./partners";
export * from "./team";
export * from "./content";
export * from "./settings";
```

## Touch Points / Key Files

- **Events Types**: `src/types/events.ts` - Event-related type definitions
- **Partners Types**: `src/types/partners.ts` - Partner-related type definitions
- **Team Types**: `src/types/team.ts` - Team member type definitions
- **Content Types**: `src/types/content.ts` - Content-related type definitions
- **Settings Types**: `src/types/settings.ts` - Application settings types
- **Main Export**: `src/types/index.ts` - Central export point for all types

## JIT Index Hints

```bash
# Find a specific type definition
rg -n "interface|type" src/types/

# Find type usage in components
rg -n "import.*from.*@/types" src/

# Find all exported types
rg -n "export.*interface|export.*type" src/types/

# Find type references
rg -n "IEvent|IPartner|ITeamMember" src/
```

## Common Gotchas

- **Type Safety**: Always prefer strict typing over `any` or `unknown`
- **Circular Dependencies**: Avoid circular type references
- **Type Imports**: Use `@/types` prefix for absolute imports
- **Type Compatibility**: Ensure types match Supabase database schema
- **Type Documentation**: Document complex types for maintainability

## Pre-PR Checks

```bash
# Run type checking to validate all types
pnpm type-check
```

> **Note**: If model cutoff is less than the current date, then research is required to improve knowledge.
