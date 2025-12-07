import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase client
vi.mock('../supabase/client', () => ({
  supabaseClient: {
    from: vi.fn(() => ({
      select: vi.fn().mockImplementation((options: { order?: any; single?: any }) => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: vi.fn().mockImplementation((data: any) => Promise.resolve({ data: null, error: null })),
      update: vi.fn().mockImplementation((data: any) => Promise.resolve({ data: null, error: null })),
      delete: vi.fn().mockImplementation((data: any) => Promise.resolve({ data: null, error: null })),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ unsubscribe: vi.fn() })),
      signInWithOAuth: vi.fn(() => Promise.resolve({ error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      refreshSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockImplementation((data: any) => Promise.resolve({ data: null, error: null })),
        getPublicUrl: vi.fn().mockImplementation(() => ({ data: { publicUrl: '' } })),
        remove: vi.fn().mockImplementation((data: any) => Promise.resolve({ data: null, error: null })),
      })),
    },
  },
  getStoredSessionId: vi.fn(() => null),
  clearStoredSessionId: vi.fn(() => {}),
}))

// Mock TanStack Query - Fix the QueryClient constructor issue
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockImplementation((query: any) => ({
    invalidateQueries: vi.fn(),
  })),
  useMutation: vi.fn(),
  useQueryClient: vi.fn().mockImplementation((options: any) => ({
    invalidateQueries: vi.fn(),
  })),
  QueryClient: vi.fn().mockImplementation((options: any) => ({
    ...options,
    queryCache: new Map(),
    mutationCache: new Map(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock Next Themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock environment variables
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});