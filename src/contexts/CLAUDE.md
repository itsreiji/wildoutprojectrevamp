# WildOut! Contexts - CLAUDE.md

> **Parent Context**: This extends [../CLAUDE.md](../CLAUDE.md)

## 1. State Management Identity

### Overview

- **Technology**: React Context API + TanStack Query
- **Pattern**: Compound components with hooks
- **Purpose**: Global state management for authentication, events, and application state

## 2. Directory Structure

```
src/contexts/
├── AuthContext.tsx          # Authentication state
├── EventsContext.tsx        # Events management
├── PartnersContext.tsx      # Partners management
├── TeamContext.tsx          # Team management
├── ContentContext.tsx       # Content management
├── StaticContentContext.tsx # Static content
├── AuditContext.tsx         # Audit logging
└── index.ts                 # Context exports
```

## 3. Context Architecture

### Design Principles

✅ **DO**: Follow these principles for new contexts

1. **Single Responsibility**: Each context manages one domain
2. **Hook-Based API**: Expose state and actions via custom hooks
3. **Type Safety**: Full TypeScript support for all context values
4. **Performance**: Use memoization to prevent unnecessary re-renders
5. **Initialization**: Provide default values and loading states

### Context Structure

✅ **DO**: Use this structure for new contexts

```tsx
// 1. Imports
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

// 2. Types
interface ContextType {
  // State
  items: ItemType[];
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<ItemType, 'id'>) => Promise<ItemType>;
  updateItem: (id: string, updates: Partial<ItemType>) => Promise<ItemType>;
  deleteItem: (id: string) => Promise<void>;
}

interface ItemType {
  id: string;
  name: string;
  // other properties
}

interface ProviderProps {
  children: React.ReactNode;
}

// 3. Create Context
const Context = createContext<ContextType | undefined>(undefined);

// 4. Provider Component
export function Provider({ children }: ProviderProps) {
  // State management
  const [items, setItems] = useState<ItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Data fetching
  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/items');
      const data = await response.json();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD operations
  const addItem = async (item: Omit<ItemType, 'id'>) => {
    const response = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    const newItem = await response.json();
    setItems([...items, newItem]);
    return newItem;
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    items,
    isLoading,
    error,
    fetchItems,
    addItem,
    // other actions
  }), [items, isLoading, error]);

  // Initial data fetch
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
}

// 5. Custom Hook
export function useContextName() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useContextName must be used within a ContextNameProvider');
  }
  return context;
}

// 6. Named exports
export { Context as ContextNameContext };
```

## 4. AuthContext Pattern

### Authentication State Management

✅ **DO**: Use this pattern for authentication

```tsx
// ✅ Correct: AuthContext pattern
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Memoize context value
  const contextValue = {
    user,
    isLoading,
    error,
    login,
    logout,
    signUp,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### AuthContext Usage

✅ **DO**: Use the hook in components

```tsx
// ✅ Correct: AuthContext usage
import { useAuth } from '@/contexts/AuthContext';

function UserProfile() {
  const { user, isLoading, error, logout } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <div>
      <h2>Welcome, {user.email}</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 5. EventsContext Pattern

### Events Management

✅ **DO**: Use TanStack Query for data fetching

```tsx
// ✅ Correct: EventsContext with TanStack Query
import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabase/client';
import { EventType } from '@/types/events';

interface EventsContextType {
  events: EventType[];
  isLoading: boolean;
  error: Error | null;
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<EventType, 'id'>) => Promise<EventType>;
  updateEvent: (id: string, updates: Partial<EventType>) => Promise<EventType>;
  deleteEvent: (id: string) => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch events
  const {
    data: events = [],
    isLoading,
    error,
    refetch: fetchEvents,
  } = useQuery<EventType[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      return data;
    },
  });

  // Add event mutation
  const { mutateAsync: addEvent } = useMutation({
    mutationFn: async (event: Omit<EventType, 'id'>) => {
      const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Update event mutation
  const { mutateAsync: updateEvent } = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EventType> }) => {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Delete event mutation
  const { mutateAsync: deleteEvent } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const contextValue = {
    events,
    isLoading,
    error,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
  };

  return (
    <EventsContext.Provider value={contextValue}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
```

## 6. Context Composition

### Provider Composition Pattern

✅ **DO**: Compose multiple providers

```tsx
// ✅ Correct: Provider composition in main.tsx
import { AuthProvider } from '@/contexts/AuthContext';
import { EventsProvider } from '@/contexts/EventsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EventsProvider>
          <App />
        </EventsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

### Custom Provider Component

✅ **DO**: Create a custom provider for complex apps

```tsx
// ✅ Correct: Custom provider component
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EventsProvider>
          <PartnersProvider>
            <TeamProvider>
              {children}
            </TeamProvider>
          </PartnersProvider>
        </EventsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Usage in main.tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
```

## 7. Performance Optimization

### Memoization

✅ **DO**: Memoize context values

```tsx
// ✅ Correct: Memoized context value
const contextValue = useMemo(() => ({
  items,
  isLoading,
  error,
  fetchItems,
  addItem,
}), [items, isLoading, error]); // Only re-create when dependencies change
```

### Selective Consumption

✅ **DO**: Consume only needed context values

```tsx
// ✅ Correct: Selective context consumption
function ItemList() {
  const { items } = useItems(); // Only get items, not the whole context
  
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### Context Splitting

✅ **DO**: Split large contexts into smaller ones

```tsx
// ✅ Correct: Split context
// Instead of one huge AppContext:
// - AuthContext (authentication)
// - EventsContext (events)
// - UserContext (user profile)
// - SettingsContext (app settings)
```

## 8. Testing Contexts

### Context Test Structure

✅ **DO**: Test context providers and hooks

```tsx
// ✅ Correct: Context test
import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import { supabase } from '@/supabase/client';

// Mock supabase
jest.mock('@/supabase/client');

describe('AuthContext', () => {
  it('should provide initial state', () => {
    const wrapper = ({ children }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle login', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ error: null });
    supabase.auth.signInWithPassword = mockSignIn;
    
    const wrapper = ({ children }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initial loading
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });
    
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should handle login error', async () => {
    const mockError = new Error('Invalid credentials');
    const mockSignIn = jest.fn().mockRejectedValue(mockError);
    supabase.auth.signInWithPassword = mockSignIn;
    
    const wrapper = ({ children }) => (
      <AuthProvider>{children}</AuthProvider>
    );
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Wait for initial loading
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrongpassword');
      } catch (error) {
        // Expected
      }
    });
    
    expect(result.current.error).toEqual(mockError);
  });
});
```

### Testing Context Consumers

✅ **DO**: Test components that use context

```tsx
// ✅ Correct: Testing context consumers
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import UserProfile from '@/components/UserProfile';

describe('UserProfile', () => {
  it('should show loading state initially', () => {
    render(
      <AuthProvider>
        <UserProfile />
      </AuthProvider>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show login prompt when not authenticated', async () => {
    render(
      <AuthProvider>
        <UserProfile />
      </AuthProvider>
    );
    
    // Wait for loading to complete
    await screen.findByText('Please login to continue');
    
    expect(screen.getByText('Please login to continue')).toBeInTheDocument();
  });

  // More tests for authenticated state...
});
```

## 9. Common Patterns

### Error Handling

✅ **DO**: Handle errors gracefully

```tsx
// ✅ Correct: Error handling in context
try {
  const { data, error } = await supabase
    .from('items')
    .select('*');
  
  if (error) {
    throw error;
  }
  
  setItems(data);
  setError(null);
} catch (err) {
  setError(err as Error);
  console.error('Failed to fetch items:', err);
  // Optionally show user-friendly error
}
```

### Loading States

✅ **DO**: Manage loading states properly

```tsx
// ✅ Correct: Loading state management
const [isLoading, setIsLoading] = useState(false);

const fetchItems = async () => {
  try {
    setIsLoading(true);
    setError(null);
    // Fetch data
  } catch (err) {
    setError(err);
  } finally {
    setIsLoading(false); // Always set to false
  }
};
```

### Type Safety

✅ **DO**: Ensure type safety throughout

```tsx
// ✅ Correct: Type-safe context
interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'admin' | 'editor' | 'member';
}

interface AuthContextType {
  user: User | null;
  // ... other properties
}

// Use the interface consistently
```

## 10. Migration to TanStack Query

### When to Use Context vs TanStack Query

✅ **DO**: Use this decision matrix

| Use Context When | Use TanStack Query When |
|------------------|-------------------------|
| Client-side state management | Server-side data fetching |
| Authentication state | Database operations |
| UI state (modals, themes) | API calls with caching |
| Simple global state | Complex data relationships |
| Frequent state updates | Data that needs caching |

### Hybrid Approach

✅ **DO**: Combine both for optimal performance

```tsx
// ✅ Correct: Hybrid approach
function EventsPage() {
  // Use TanStack Query for data fetching
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  // Use Context for UI state
  const { isModalOpen, openModal, closeModal } = useUIState();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <button onClick={openModal}>Add Event</button>
      <EventList events={events} />
      {isModalOpen && (
        <EventFormModal onClose={closeModal} />
      )}
    </div>
  );
}
```

## 11. Security Considerations

### Sensitive Data

✅ **DO**: Protect sensitive data in context

```tsx
// ✅ Correct: Protect sensitive data
// Don't store tokens or passwords in context
// Use Supabase auth session instead

const { user } = useAuth();
// user object contains only safe data
// tokens are managed by Supabase auth
```

### Role-Based Access

✅ **DO**: Implement role-based access control

```tsx
// ✅ Correct: Role-based access
function AdminOnlyComponent() {
  const { user } = useAuth();

  if (!user) {
    return <LoginRequired />;
  }

  if (user.role !== 'admin') {
    return <NotAuthorized />;
  }

  return <AdminDashboard />;
}
```

### Data Validation

✅ **DO**: Validate all incoming data

```tsx
// ✅ Correct: Data validation
const addItem = async (item: Omit<ItemType, 'id'>) => {
  // Validate input
  const validation = itemSchema.safeParse(item);
  
  if (!validation.success) {
    throw new Error('Invalid item data');
  }
  
  // Proceed with validated data
  const validatedItem = validation.data;
  // ...
};
```

## 12. Performance Monitoring

### Context Performance

✅ **DO**: Monitor context performance

```tsx
// ✅ Correct: Performance monitoring
// Use React DevTools to:
// - Check context re-renders
// - Monitor provider tree
// - Identify unnecessary updates

// Use why-did-you-render for debugging
import 'why-did-you-render';
```

### Optimization Techniques

✅ **DO**: Apply these optimizations

1. **Memoize context values** - Prevent unnecessary re-renders
2. **Split large contexts** - Reduce re-render scope
3. **Use selective consumption** - Only consume needed values
4. **Lazy initialization** - Delay expensive operations
5. **Batch updates** - Group multiple state updates

```tsx
// ✅ Correct: Optimized context
const contextValue = useMemo(() => ({
  // Only include what's needed
  items,
  addItem,
  deleteItem,
  // Don't include derived data that can be computed in components
}), [items]); // Minimal dependencies
```