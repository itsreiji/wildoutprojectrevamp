# WildOut! Project - test/ AGENTS.md

**Package Identity**
- This package contains test files for the application
- Primary tech/framework: Vitest, @testing-library/react, TypeScript

## Setup & Run

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run single test file
pnpm test path/to/test.file.test.ts
```

## Patterns & Conventions

### File Organization Rules
- **Test files**: Colocated with source files in `src/test/**`
- **Test files**: Use `.test.ts` or `.test.tsx` suffix
- **Integration tests**: Use `.integration.test.tsx` suffix
- **Unit tests**: Use `.test.ts` suffix for utility functions

### Naming Conventions
- ✅ **Test files**: Match source file name with `.test.` suffix (e.g., `AuthContext.test.tsx`)
- ✅ **Test functions**: Use `describe()` and `test()` or `it()`
- ✅ **Test names**: Be descriptive (e.g., "should render login form correctly")

### Preferred Patterns

**Testing React Components:**
- ✅ DO: Follow pattern from `src/test/AuthContext.test.tsx`
- ✅ DO: Use `@testing-library/react` for component testing
- ✅ DO: Use `render()` with proper providers
- ✅ DO: Test user interactions with `userEvent`
- ✅ DO: Test accessibility with `jest-dom` matchers

**Testing Hooks:**
- ✅ DO: Use `renderHook()` from `@testing-library/react`
- ✅ DO: Test hook behavior with different inputs
- ✅ DO: Test error cases and edge cases

**Testing Utilities:**
- ✅ DO: Follow pattern from `src/test/formatting.test.ts`
- ✅ DO: Test pure functions with input/output assertions
- ✅ DO: Test error cases and edge cases

**Integration Testing:**
- ✅ DO: Follow pattern from `src/test/LoginPage.integration.test.tsx`
- ✅ DO: Test component integration with context and services
- ✅ DO: Mock external dependencies
- ✅ DO: Test realistic user flows

## Touch Points / Key Files

- **Test Setup**: `src/test/setup.ts` - Vitest setup and configuration
- **Auth Context Test**: `src/test/AuthContext.test.tsx` - Example component test
- **Login Integration Test**: `src/test/LoginPage.integration.test.tsx` - Example integration test
- **Formatting Test**: `src/test/formatting.test.ts` - Example utility test
- **Vitest Config**: `vitest.config.ts` - Test configuration

## JIT Index Hints

```bash
# Find all test files
find . -name "*.test.ts" -o -name "*.test.tsx"

# Find component tests
find src -name "*.test.tsx" | grep -v integration

# Find integration tests
find src -name "*.integration.test.tsx"

# Find utility tests
find src -name "*.test.ts"

# Find tests for specific component
rg -n "describe.*ComponentName" src/test

# Find tests using specific hook
rg -n "renderHook" src/test
```

## Common Gotchas

- **Providers**: Components often need context providers to work in tests
- **Mocking**: Use `vi.mock()` for external dependencies
- **Async Testing**: Use `await` with `findBy*` queries for async operations
- **Cleanup**: Use `afterEach(() => cleanup())` to avoid memory leaks
- **JSX**: Use `jsx` extension in test files for JSX support

## Pre-PR Checks

```bash
# Run all tests with coverage
pnpm test:coverage

# Check for test coverage >80%
# Verify all critical paths are tested
```

## Testing Patterns

### Recommended Component Test Pattern

```tsx
// src/test/ExampleComponent.test.tsx
import { render, screen } from '@testing-library/react'
import { ExampleComponent } from '@/components/ExampleComponent'
import userEvent from '@testing-library/user-event'

describe('ExampleComponent', () => {
  test('should render correctly', () => {
    render(<ExampleComponent title="Test" onClick={() => {}} />)
    
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('should call onClick when button is clicked', async () => {
    const handleClick = vi.fn()
    render(<ExampleComponent title="Test" onClick={handleClick} />)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('should be accessible', () => {
    render(<ExampleComponent title="Test" onClick={() => {}} />)
    
    expect(screen.getByRole('heading', { name: 'Test' })).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})
```

### Recommended Hook Test Pattern

```tsx
// src/test/useExampleHook.test.tsx
import { renderHook, act } from '@testing-library/react'
import { useExampleHook } from '@/hooks/useExampleHook'

describe('useExampleHook', () => {
  test('should return initial state', () => {
    const { result } = renderHook(() => useExampleHook())
    
    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  test('should fetch data successfully', async () => {
    const mockData = [{ id: '1', name: 'Test' }]
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockData)
    })
    
    const { result, waitFor } = renderHook(() => useExampleHook())
    
    act(() => {
      result.current.fetchData()
    })
    
    await waitFor(() => {
      expect(result.current.data).toEqual(mockData)
      expect(result.current.loading).toBe(false)
    })
  })

  test('should handle errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed'))
    
    const { result, waitFor } = renderHook(() => useExampleHook())
    
    act(() => {
      result.current.fetchData()
    })
    
    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.loading).toBe(false)
    })
  })
})
```

### Recommended Integration Test Pattern

```tsx
// src/test/ExampleIntegration.test.tsx
import { render, screen } from '@testing-library/react'
import { ExamplePage } from '@/pages/ExamplePage'
import { AuthProvider } from '@/contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'

describe('ExamplePage Integration', () => {
  const queryClient = new QueryClient()
  
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  test('should render page with auth context', () => {
    renderWithProviders(<ExamplePage />)
    
    expect(screen.getByText('Welcome')).toBeInTheDocument()
  })

  test('should handle user interaction flow', async () => {
    renderWithProviders(<ExamplePage />)
    
    // Simulate user interaction
    await userEvent.click(screen.getByRole('button', { name: 'Load Data' }))
    
    // Verify result
    expect(await screen.findByText('Data loaded')).toBeInTheDocument()
  })

  test('should show error messages', async () => {
    // Mock error scenario
    vi.mock('@/services/api', () => ({
      fetchData: () => Promise.reject(new Error('Failed'))
    }))
    
    renderWithProviders(<ExamplePage />)
    
    await userEvent.click(screen.getByRole('button', { name: 'Load Data' }))
    
    expect(await screen.findByText('Error loading data')).toBeInTheDocument()
  })
})
```

## Mocking Strategies

### Mocking Supabase

```ts
// In test setup or individual test
vi.mock('@/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    insert: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    update: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    delete: vi.fn().mockResolvedValue({ data: mockData, error: null })
  }
}))
```

### Mocking Context

```tsx
// Create test provider
const TestProvider = ({ children }: { children: React.ReactNode }) => {
  const mockValue = {
    user: { id: 'test-user', email: 'test@example.com' },
    login: vi.fn(),
    logout: vi.fn()
  }
  
  return (
    <AuthContext.Provider value={mockValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Use in test
render(
  <TestProvider>
    <Component />
  </TestProvider>
)
```