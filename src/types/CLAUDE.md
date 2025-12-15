# WildOut! Types - CLAUDE.md

> **Parent Context**: This extends [../CLAUDE.md](../CLAUDE.md)

## 1. Types Identity

### Overview

- **Technology**: TypeScript 5.9
- **Pattern**: Type definitions and interfaces
- **Purpose**: Centralized type system for the WildOut! project

## 2. Directory Structure

```
src/types/
├── content.ts              # Content-related types
├── events.ts               # Event-related types
├── index.ts                # Main type exports
├── partners.ts             # Partner-related types
├── settings.ts             # Application settings types
├── team.ts                 # Team-related types
└── [future type files]     # Additional type definitions
```

## 3. Type Development Patterns

### Type Structure

✅ **DO**: Use this structure for new types

```typescript
// 1. Imports
import { z } from "zod";

// 2. Type Definitions
export interface EventType {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// 3. Zod Schemas (for validation)
export const eventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  date: z.string().datetime(),
  location: z.string().min(1).max(200),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  is_active: z.boolean(),
});

// 4. Type Guards
export function isEventType(value: unknown): value is EventType {
  return eventSchema.safeParse(value).success;
}

// 5. Utility Types
export type EventCreateType = Omit<
  EventType,
  "id" | "created_at" | "updated_at"
>;
export type EventUpdateType = Partial<
  Omit<EventType, "id" | "created_at" | "updated_at">
>;
```

## 4. Common Type Categories

### Database Types

✅ **DO**: Match database schema exactly

```typescript
// Example: Event type matching database table
export interface EventType {
  id: string; // UUID primary key
  title: string; // VARCHAR(100)
  description: string; // TEXT
  date: string; // TIMESTAMP
  location: string; // VARCHAR(200)
  created_at: string; // TIMESTAMP (auto-generated)
  updated_at: string; // TIMESTAMP (auto-generated)
  is_active: boolean; // BOOLEAN
}
```

### API Response Types

✅ **DO**: Include API-specific fields

```typescript
// Example: API response type
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
}

// Usage
export interface GetEventsResponse extends ApiResponse<EventType[]> {}
```

### Form Types

✅ **DO**: Create types for form data

```typescript
// Example: Form data type
export interface EventFormData {
  title: string;
  description: string;
  date: string;
  location: string;
  is_active: boolean;
}
```

### Utility Types

✅ **DO**: Use TypeScript utility types

```typescript
// Example: Utility types for CRUD operations
export type EventCreateType = Omit<
  EventType,
  "id" | "created_at" | "updated_at"
>;
export type EventUpdateType = Partial<
  Omit<EventType, "id" | "created_at" | "updated_at">
>;
export type EventReadType = Pick<
  EventType,
  "id" | "title" | "date" | "location"
>;
```

## 5. Type Validation

### Zod Validation

✅ **DO**: Use Zod for runtime validation

```typescript
// Example: Zod schema with validation
export const eventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description too long"),
  date: z.string().datetime("Invalid date format"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location too long"),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  is_active: z.boolean(),
});

// Usage in validation
export function validateEvent(data: unknown): EventType {
  return eventSchema.parse(data);
}
```

### Type Guards

✅ **DO**: Create type guards for complex types

```typescript
// Example: Type guard function
export function isEventType(value: unknown): value is EventType {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "title" in value &&
    "description" in value
  );
}

// Usage
if (isEventType(data)) {
  // data is now typed as EventType
}
```

## 6. Type Organization

### Index File Pattern

✅ **DO**: Export all types from index.ts

```typescript
// src/types/index.ts
export * from "./events";
export * from "./team";
export * from "./partners";
export * from "./content";
export * from "./settings";
```

### Type Grouping

✅ **DO**: Group related types together

```typescript
// Example: Event-related types in events.ts
export interface EventType {
  /* ... */
}
export interface EventCreateType {
  /* ... */
}
export interface EventUpdateType {
  /* ... */
}
export interface EventFilterType {
  /* ... */
}
export interface EventPaginationType {
  /* ... */
}
```

## 7. Common Gotchas

### Type Safety

- ❌ **DON'T**: Use `any` type without justification
- ❌ **DON'T**: Use type assertions (`as`) without validation
- ❌ **DON'T**: Ignore TypeScript errors with `@ts-ignore`

### Type Mismatches

- ❌ **DON'T**: Assume API responses match your types exactly
- ❌ **DON'T**: Forget to handle optional fields
- ❌ **DON'T**: Mix up similar types (e.g., EventType vs EventCreateType)

### Performance

- ❌ **DON'T**: Create complex types in render functions
- ❌ **DON'T**: Import entire type files when you only need one type
- ❌ **DON'T**: Re-export types unnecessarily

## 8. Type Testing

### Type Validation Tests

✅ **DO**: Test type validation

```typescript
// Example: Type validation tests
import { describe, it, expect } from "vitest";
import { eventSchema, EventType } from "@/types/events";

describe("Event Type Validation", () => {
  it("validates correct event data", () => {
    const validEvent: EventType = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      title: "Test Event",
      description: "Test Description",
      date: "2025-12-15T10:00:00Z",
      location: "Test Location",
      created_at: "2025-12-15T09:00:00Z",
      updated_at: "2025-12-15T09:00:00Z",
      is_active: true,
    };

    expect(() => eventSchema.parse(validEvent)).not.toThrow();
  });

  it("rejects invalid event data", () => {
    const invalidEvent = {
      title: "", // Invalid: empty title
      // Missing required fields
    };

    expect(() => eventSchema.parse(invalidEvent)).toThrow();
  });
});
```

## 9. JIT Search Commands

```bash
# Find all type definitions
rg -n "export.*type\|export.*interface" src/types

# Find specific type usage
rg -n "EventType" src/

# Find Zod schemas
rg -n "z\.object" src/types

# Find type exports
rg -n "export.*from.*types" src/
```

## 10. Pre-PR Checklist

```bash
# Verify all types are exported
pnpm type-check

# Check for unused types
rg -n "export.*type\|export.*interface" src/types | grep -v "export.*from"

# Validate type usage
pnpm test src/test/**/*.test.*
```
