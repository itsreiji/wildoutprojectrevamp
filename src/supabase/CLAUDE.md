# WildOut! Supabase - CLAUDE.md

> **Parent Context**: This extends [../CLAUDE.md](../CLAUDE.md)

## 1. Supabase Identity

### Overview

- **Technology**: Supabase JavaScript Client, PostgreSQL, Auth, Storage
- **Pattern**: Database and authentication integration
- **Purpose**: Backend services for WildOut! project

## 2. Directory Structure

```
src/supabase/
├── client.ts                # Supabase client configuration
├── types.ts                 # Database type definitions
├── functions/               # Edge functions
│   └── [future functions]   # Supabase edge functions
└── [future files]           # Additional Supabase utilities
```

## 3. Supabase Configuration

### Client Setup

✅ **DO**: Use the centralized client

```typescript
// src/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Environment Variables

✅ **DO**: Use .env for configuration

```env
# .env file
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 4. Database Operations

### Query Patterns

✅ **DO**: Use consistent query patterns

```typescript
// Basic query
export async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  return data;
}
```

### Error Handling

✅ **DO**: Handle errors consistently

```typescript
// Error handling pattern
export async function createEvent(eventData: EventCreateType) {
  const { data, error } = await supabase
    .from("events")
    .insert([eventData])
    .select();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to create event: ${error.message}`);
  }

  return data[0];
}
```

## 5. Authentication

### Auth Flow

✅ **DO**: Use Supabase auth methods

```typescript
// Sign in with email
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Sign in failed: ${error.message}`);
  }

  return data;
}
```

### Session Management

✅ **DO**: Handle sessions properly

```typescript
// Get current session
export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

// Listen for auth state changes
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
```

## 6. Real-time Subscriptions

### Real-time Setup

✅ **DO**: Use real-time for live updates

```typescript
// Subscribe to changes
export function subscribeToEvents(callback: (payload: any) => void) {
  return supabase
    .channel("events-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "events",
      },
      callback
    )
    .subscribe();
}
```

### Cleanup

✅ **DO**: Clean up subscriptions

```typescript
// Cleanup pattern
const subscription = subscribeToEvents(handleEventUpdate);

// Later, when component unmounts
subscription.unsubscribe();
```

## 7. Storage Operations

### File Uploads

✅ **DO**: Use Supabase storage

```typescript
// Upload file
export async function uploadFile(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from("uploads")
    .upload(path, file);

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return data;
}
```

### File Downloads

✅ **DO**: Handle file downloads

```typescript
// Download file
export async function downloadFile(path: string) {
  const { data, error } = await supabase.storage.from("uploads").download(path);

  if (error) {
    throw new Error(`Download failed: ${error.message}`);
  }

  return data;
}
```

## 8. Type Generation

### Database Types

✅ **DO**: Generate types from database

```typescript
// src/supabase/types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          date: string;
          location: string;
          created_at: string;
          updated_at: string;
          is_active: boolean;
        };
        Insert: {
          title: string;
          description: string;
          date: string;
          location: string;
          is_active?: boolean;
        };
        Update: {
          title?: string;
          description?: string;
          date?: string;
          location?: string;
          is_active?: boolean;
        };
      };
    };
  };
}
```

## 9. Edge Functions

### Function Structure

✅ **DO**: Use this structure for edge functions

```typescript
// src/supabase/functions/example.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { url, method } = req;

  // Initialize Supabase client
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Handle request
    if (method === "GET") {
      const { data, error } = await supabaseClient.from("events").select("*");

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

## 10. Security Best Practices

### Row Level Security

✅ **DO**: Implement RLS policies

```sql
-- Example RLS policy
CREATE POLICY "Enable read access for all users"
ON public.events
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON public.events
FOR INSERT
WITH CHECK (true);
```

### Service Role

✅ **DO**: Use service role carefully

```typescript
// Only use service role for admin operations
const adminClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey // Only in secure environments
);
```

## 11. Common Gotchas

### Configuration

- ❌ **DON'T**: Commit Supabase keys to git
- ❌ **DON'T**: Use service role key in client-side code
- ❌ **DON'T**: Hardcode URLs or keys

### Queries

- ❌ **DON'T**: Forget to handle query errors
- ❌ **DON'T**: Assume data is always returned
- ❌ **DON'T**: Forget to unsubscribe from real-time channels

### Performance

- ❌ **DON'T**: Fetch all records without pagination
- ❌ **DON'T**: Use complex queries without indexes
- ❌ **DON'T**: Forget to limit query results

## 12. Testing Supabase

### Mocking Supabase

✅ **DO**: Mock Supabase in tests

```typescript
// Example: Mock Supabase client
import { vi } from "vitest";

const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: mockEvent, error: null }),
};

vi.mock("@/supabase/client", () => ({
  supabase: mockSupabase,
}));
```

### Integration Tests

✅ **DO**: Test with real Supabase (in CI)

```typescript
// Example: Integration test
import { supabase } from "@/supabase/client";

describe("Supabase Integration", () => {
  it("connects to Supabase", async () => {
    const { data, error } = await supabase.from("events").select("*").limit(1);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });
});
```

## 13. JIT Search Commands

```bash
# Find Supabase client usage
rg -n "supabase\." src/

# Find database queries
rg -n "\.from\|\.select\|\.insert\|\.update\|\.delete" src/

# Find auth operations
rg -n "auth\." src/

# Find real-time subscriptions
rg -n "channel\|subscribe" src/
```

## 14. Pre-PR Checklist

```bash
# Verify Supabase configuration
pnpm type-check

# Test database operations
pnpm test src/test/**/*.test.*

# Check for hardcoded secrets
rg -n "SUPABASE_URL\|SUPABASE_KEY" src/ | grep -v "import.meta.env"
```
