# Services - AGENTS.md

## 1. Package Identity

This directory contains business logic and service layer functions for the WildOut! application. Services handle data fetching, transformations, and interactions with external APIs.

## 2. Setup & Run

No specific setup required beyond the root project setup.

## 3. Patterns & Conventions

### File Organization

- **Service Files**: Individual service files for different domains (`authService.ts`, `eventService.ts`, etc.)
- **Utility Services**: Helper services for common operations

### Service Structure

```typescript
// ✅ Preferred service structure
export class EventService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getEvents(): Promise<Event[]> {
    try {
      const { data, error } = await this.supabase.from("events").select("*");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }
}
```

### Error Handling

- ✅ **DO**: Always wrap database/API calls in try/catch blocks
- ✅ **DO**: Log errors with context for debugging
- ✅ **DO**: Re-throw errors after logging for proper error handling upstream
- ❌ **DON'T**: Swallow errors silently

### Data Transformations

- ✅ **DO**: Transform raw database data into application models
- ✅ **DO**: Use TypeScript interfaces for input/output types
- ✅ **DO**: Validate data before processing

### Examples

- ✅ **Service Pattern**: See `src/services/authService.ts` for authentication patterns
- ✅ **Data Transformation**: See `src/services/eventService.ts` for event data handling
- ✅ **Error Handling**: See any service file for try/catch patterns

## 4. Touch Points / Key Files

- **Supabase Client**: `src/supabase/client.ts` (database connection)
- **Type Definitions**: `src/types/` (shared TypeScript interfaces)
- **Utility Functions**: `src/utils/` (helper functions)

## 5. JIT Index Hints

- Find a service: `find src/services -name "*.ts"`
- Find service usage: `grep -r "import.*ServiceName" src/`
- Find all async functions: `grep -r "async function" src/services/`

## 6. Common Gotchas

- Always validate Supabase client availability before use
- Use proper TypeScript types for all service methods
- Handle authentication/authorization in services when needed
- Follow RLS (Row Level Security) patterns for database access

## 7. Pre-PR Checks

```bash
# Run type checking
pnpm type-check

# Run tests
pnpm test

# Check for proper error handling
grep -r "try {" src/services/ | wc -l
grep -r "catch" src/services/ | wc -l
```

## 8. Model Cutoff Research Requirement

- If model cutoff < current_date then they need to research no matter what to improve their knowledge.
