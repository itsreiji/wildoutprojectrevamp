# src/contexts/ - State Management

**Detailed guidance for React context providers**

## Package Identity

- **Purpose**: State management using React Context API
- **Primary Tech**: React 19, TypeScript 5.9, React Context API
- **Pattern**: Provider pattern with custom hooks

## Setup & Run

```bash
# No special setup needed - contexts are part of main app
# Test context functionality
pnpm test -- src/contexts/**/*.test.*
```

## Patterns & Conventions

### File Organization Rules

- **Context Files**: One file per context (e.g., `AuthContext.tsx`, `EventsContext.tsx`)
- **Provider Components**: Export provider component from each context file
- **Custom Hooks**: Export custom hook for consuming context
- **Types**: Define context types in the same file

### Naming Conventions

- **Context Files**: ContextName + "Context.tsx" (e.g., `AuthContext.tsx`)
- **Provider Components**: ContextName + "Provider" (e.g., `AuthProvider`)
- **Custom Hooks**: "use" + ContextName (e.g., `useAuth`)
- **Context Types**: ContextName + "Type" (e.g., `AuthContextType`)

### Preferred Patterns

✅ **DO**: Use the provider pattern with custom hooks

```typescript
// Example: src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/supabase/client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const value = { user, loading, login, logout, signUp };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

✅ **DO**: Handle authentication state changes properly

```typescript
// Example: Supabase auth state handling
useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user ?? null);
    setLoading(false);
  });

  return () => subscription.unsubscribe();
}, []);
```

✅ **DO**: Provide proper error handling in context methods

```typescript
// Example: Error handling in context methods
const login = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
```

✅ **DO**: Use TypeScript interfaces for context values

```typescript
// Example: Well-typed context interface
interface EventsContextType {
  events: Event[];
  loading: boolean;
  error: Error | null;
  fetchEvents: () => Promise<void>;
  createEvent: (eventData: Omit<Event, "id">) => Promise<Event>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
}
```

❌ **DON'T**: Create contexts that manage local component state

```typescript
// Avoid: Context for local state
const LocalStateContext = createContext(); // ❌ Use useState instead
```

❌ **DON'T**: Forget to provide error boundaries for context consumers

```typescript
// Avoid: Missing error handling in custom hooks
function useContext() {
  const context = useContext(MyContext);
  return context; // ❌ Should check if context exists
}
```

## Touch Points / Key Files

- **Auth Context**: `src/contexts/AuthContext.tsx` - Authentication state
- **Events Context**: `src/contexts/EventsContext.tsx` - Events management
- **Content Context**: `src/contexts/ContentContext.tsx` - Content management
- **Partners Context**: `src/contexts/PartnersContext.tsx` - Partners data
- **Team Context**: `src/contexts/TeamContext.tsx` - Team management
- **Audit Context**: `src/contexts/AuditContext.tsx` - Audit logging

## JIT Index Hints

```bash
# Find all context providers
rg -n "createContext" src/contexts/

# Find context usage in components
rg -n "useContext|useAuth|useEvents" src/

# Find context provider usage
rg -n "<.*Provider>" src/

# Find context tests
find src/contexts/ -name "*.test.*"

# Find specific context methods
rg -n "login|logout|fetchEvents" src/contexts/
```

## Common Gotchas

- **Context Provider Wrapping**: Ensure all context providers wrap the entire app tree
- **Custom Hook Errors**: Always check if context exists in custom hooks
- **Performance**: Avoid unnecessary re-renders with memoization
- **Supabase Integration**: Use the configured Supabase client
- **Error Handling**: Always handle async errors in context methods

## Best Practices

1. **Single Responsibility**: Each context should manage one specific domain
2. **Type Safety**: Always define TypeScript interfaces for context values
3. **Error Handling**: Provide proper error handling in all async methods
4. **Loading States**: Manage loading states appropriately
5. **Cleanup**: Unsubscribe from Supabase listeners in useEffect cleanup

## Pre-PR Checks

```bash
# Run context tests
pnpm test -- src/contexts/**/*.test.*

# Check TypeScript types
pnpm type-check

# Verify context usage
rg -n "useContext" src/ | wc -l && echo "Context usage found"
```

## Research Requirements

- If model cutoff < current_date then they need to research no matter what to improve their knowledge.
