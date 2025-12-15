# src/supabase/functions/ - Supabase Edge Functions

**Detailed guidance for Supabase Edge Functions**

## Package Identity

- **Purpose**: Supabase Edge Functions for serverless backend logic
- **Primary Tech**: TypeScript, Deno, Supabase Edge Functions
- **Pattern**: Serverless functions deployed to Supabase Edge Runtime

## Setup & Run

```bash
# Deploy edge functions (via MCP only - DO NOT run locally)
# pnpm supabase functions deploy

# Serve functions locally (via MCP only - DO NOT run locally)
# pnpm supabase functions serve

# Test functions
pnpm test -- src/supabase/functions/**/*.test.*
```

## Patterns & Conventions

### File Organization Rules

- **Function Files**: Individual function files in `src/supabase/functions/`
- **Server Functions**: `src/supabase/functions/server/` - Server-side functions
- **Entry Points**: Each function has its own entry file

### Naming Conventions

- **Function Files**: kebab-case with descriptive names (e.g., `process-event.ts`)
- **Functions**: camelCase with descriptive names
- **Types**: PascalCase with proper TypeScript typing
- **Constants**: UPPER_SNAKE_CASE for configuration

### Preferred Patterns

✅ **DO**: Use proper Supabase Edge Function structure

```typescript
// Example: src/supabase/functions/process-event.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { eventId } = await req.json();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    // Process event logic
    const { data, error } = await supabase
      .from("events")
      .update({ processed: true })
      .eq("id", eventId)
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
```

✅ **DO**: Use proper error handling with try/catch
✅ **DO**: Use async/await for database operations
✅ **DO**: Validate input parameters
✅ **DO**: Use proper HTTP response codes
✅ **DO**: Set proper Content-Type headers
✅ **DO**: Use environment variables for secrets

❌ **DON'T**: Hardcode database credentials
❌ **DON'T**: Swallow errors silently
❌ **DON'T**: Use synchronous I/O operations
❌ **DON'T**: Make functions too large or complex

### Server Functions Pattern

✅ **DO**: Follow pattern for server-side functions

```typescript
// Example: src/supabase/functions/server/process-data.ts
export async function processData(data: any) {
  // Business logic here
  return { processed: true, result: data };
}
```

## Touch Points / Key Files

- **Function Entry**: Individual function files in `src/supabase/functions/`
- **Server Functions**: `src/supabase/functions/server/` - Reusable server logic
- **Supabase Client**: Use Supabase client for database access
- **Environment Variables**: Use Deno.env for configuration

## JIT Index Hints

```bash
# Find edge function files
find src/supabase/functions/ -name "*.ts" -not -path "*/node_modules/*"

# Find Supabase client usage
rg -n "createClient|supabase" src/supabase/functions/

# Find function exports
rg -n "export.*function|serve(" src/supabase/functions/

# Find error handling patterns
rg -n "try.*catch|throw.*error" src/supabase/functions/
```

## Common Gotchas

- **Edge Runtime**: Functions run in Deno Edge Runtime, not Node.js
- **Environment Variables**: Must be set in Supabase dashboard
- **Database Access**: Use Supabase client, not direct PostgreSQL
- **Error Handling**: Always return proper HTTP responses
- **Performance**: Edge functions have execution time limits
- **Security**: Validate all input parameters

## Pre-PR Checks

```bash
# Run type checking for functions
pnpm type-check

# Test functions if applicable
pnpm test -- src/supabase/functions/
```
