# WildOut! Tests - CLAUDE.md

> **Parent Context**: This extends [../CLAUDE.md](../CLAUDE.md)

## 1. Testing Identity

### Overview

- **Technology**: Vitest 4.0, @testing-library/react, @testing-library/jest-dom
- **Pattern**: Comprehensive test coverage with TypeScript
- **Purpose**: Ensure code quality and prevent regressions

## 2. Test Directory Structure

```
tests/
├── formatting.test.ts          # Formatting utility tests
└── [future test files]

src/test/
├── AuthContext.test.tsx        # Auth context tests
├── contexts/                    # Context tests
│   └── AuthContext.test.tsx    # Auth context tests (duplicate)
├── LoginPage.integration.test.tsx # Integration tests
├── LoginPage.test.tsx          # Login page tests
├── formatting.test.ts          # Formatting tests (duplicate)
└── validation.test.ts           # Validation tests
```

## 3. Testing Philosophy

### Test Pyramid

```
          UI Tests (E2E)
            /      \
   Integration Tests
     /            \
Unit Tests (Foundation)
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage for business logic
- **Integration Tests**: Critical paths and API interactions
- **Component Tests**: UI components and user interactions
- **E2E Tests**: Major user flows (future implementation)

## 4. Test Setup

### Vitest Configuration

✅ **DO**: Use consistent Vitest setup

```typescript
// vite.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### Test Setup File

✅ **DO**: Configure test environment

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Supabase
globalThis.supabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: {}, error: null }),
};
```

## 5. Test Patterns

### Unit Test Structure

✅ **DO**: Follow consistent unit test structure

```typescript
// ✅ Correct: Unit test structure
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { functionToTest } from '@/utils/function';

describe('functionToTest', () => {
  // Test setup
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('when input is valid', () => {
    it('should return expected result', () => {
      const result = functionToTest('valid-input');
      expect(result).toBe('expected-result');
    });

    it('should handle edge cases', () => {
      const result = functionToTest('edge-case');
      expect(result).toBe('edge-result');
    });
  });

  describe('when input is invalid', () => {
    it('should throw appropriate error', () => {
      expect(() => functionToTest('invalid')).toThrow('Invalid input');
    });

    it('should handle null input', () => {
      const result = functionToTest(null);
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle unexpected errors gracefully', () => {
      // Mock dependencies to throw errors
      vi.spyOn(dependency, 'method').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = functionToTest('input');
      expect(result).toBe('fallback-value');
    });
  });
});
```

### Component Test Structure

✅ **DO**: Test user behavior, not implementation

```typescript
// ✅ Correct: Component test structure
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Component } from '@/components/Component';
import { renderWithProviders } from '@/utils/test-utils';

describe('Component', () => {
  const mockProps = {
    onAction: vi.fn(),
    data: 'test-data',
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('rendering', () => {
    it('should render with default props', () => {
      renderWithProviders(<Component />);
      expect(screen.getByText('Default Content')).toBeInTheDocument();
    });

    it('should render with custom props', () => {
      renderWithProviders(<Component {...mockProps} />);
      expect(screen.getByText('test-data')).toBeInTheDocument();
    });

    it('should show loading state when loading', () => {
      renderWithProviders(<Component isLoading />);
      expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    });
  });

  describe('user interaction', () => {
    it('should call onAction when button clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Component {...mockProps} />);

      await user.click(screen.getByRole('button'));
      expect(mockProps.onAction).toHaveBeenCalledTimes(1);
    });

    it('should handle form submission', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Component {...mockProps} />);

      await user.type(screen.getByLabelText('Input'), 'test value');
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(mockProps.onAction).toHaveBeenCalledWith('test value');
    });
  });

  describe('error handling', () => {
    it('should show error message when API fails', async () => {
      // Mock API to fail
      vi.spyOn(api, 'fetchData').mockRejectedValue(new Error('API failed'));

      renderWithProviders(<Component {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load data')).toBeInTheDocument();
      });
    });

    it('should handle empty data gracefully', () => {
      renderWithProviders(<Component data={null} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should be accessible to screen readers', () => {
      renderWithProviders(<Component {...mockProps} />);
      expect(screen.getByRole('button')).toHaveAccessibleName();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithProviders(<Component {...mockProps} />);

      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();

      await user.keyboard('[Enter]');
      expect(mockProps.onAction).toHaveBeenCalled();
    });
  });
});
```

### Integration Test Structure

✅ **DO**: Test component integration

```typescript
// ✅ Correct: Integration test structure
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '@/components/auth/LoginPage';
import { renderWithProviders } from '@/utils/test-utils';
import { useAuth } from '@/contexts/AuthContext';

describe('LoginPage Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should integrate with AuthContext and handle login flow', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    // Mock AuthContext
    vi.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        login: mockLogin,
        isLoading: false,
        error: null,
        user: null,
      }),
    }));

    renderWithProviders(<LoginPage />);

    // Fill out form
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Login' }));

    // Verify login was called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    // Verify success message
    expect(screen.getByText('Login successful!')).toBeInTheDocument();
  });

  it('should handle login errors gracefully', async () => {
    const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
    const user = userEvent.setup();

    vi.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        login: mockLogin,
        isLoading: false,
        error: null,
        user: null,
      }),
    }));

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should show loading state during login', async () => {
    const mockLogin = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );
    const user = userEvent.setup();

    vi.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        login: mockLogin,
        isLoading: false,
        error: null,
        user: null,
      }),
    }));

    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByRole('status')).toHaveTextContent('Logging in...');

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
```

## 6. Testing Best Practices

### Test Organization

✅ **DO**: Organize tests effectively

```bash
# Test file naming conventions
Component.tsx → Component.test.tsx
utility.ts → utility.test.ts

# Test file location
# Colocate tests with source files
src/components/Button/Button.test.tsx
src/utils/formatting.test.ts

# Or use dedicated test directory
src/test/Button.test.tsx
src/test/formatting.test.ts
```

### Test Naming

✅ **DO**: Use descriptive test names

```typescript
// ✅ Good test names
describe('LoginForm', () => {
  it('should show validation error when email is invalid');
  it('should enable submit button when form is valid');
  it('should call onSubmit with form data when submitted');
  it('should disable submit button while loading');
  it('should show error message when submission fails');
});

// ❌ Avoid vague test names
describe('LoginForm', () => {
  it('should work'); // Too vague
  it('should do the thing'); // Not descriptive
  it('test 1'); // Meaningless
});
```

### Test Isolation

✅ **DO**: Keep tests isolated

```typescript
// ✅ Isolated tests
beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  // Clean up between tests
});

afterEach(() => {
  cleanup();
  // Clean up DOM
});

// ❌ Avoid test dependencies
describe('Component', () => {
  it('should set up state', () => {
    // This test affects the next one
  });

  it('should use the state from previous test'); // ❌ Bad
});
```

### Mocking Strategies

✅ **DO**: Mock external dependencies

```typescript
// ✅ Good mocking
// Mock API calls
vi.spyOn(api, 'fetchData').mockResolvedValue(mockData);

// Mock context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

// Mock utilities
vi.mock('@/utils/api', () => ({
  fetchWithAuth: vi.fn().mockResolvedValue({ data: mockResponse }),
}));

// ❌ Avoid over-mocking
// Don't mock implementation details
// Don't mock what you're testing
```

## 7. Test Coverage

### Coverage Analysis

```bash
# Run tests with coverage
pnpm test:coverage

# Analyze coverage report
cat coverage/coverage-summary.json

# Find untested files
find src -name "*.ts" -o -name "*.tsx" | grep -v test | while read file; do
  if [ ! -f "${file%.ts}.test.ts" ] && [ ! -f "${file%.tsx}.test.tsx" ]; then
    echo "No test found for: $file"
  fi
done
```

### Coverage Improvement

✅ **DO**: Improve test coverage systematically

```typescript
// ✅ Coverage improvement strategy

// 1. Identify low coverage areas
// 2. Write tests for critical paths first
// 3. Add edge case tests
// 4. Verify coverage improves

// Example: Improving utility coverage
describe('formatDate', () => {
  // Basic functionality
  it('should format valid dates');
  
  // Edge cases
  it('should handle invalid dates');
  it('should handle null input');
  it('should handle undefined input');
  
  // Different formats
  it('should format with custom options');
  it('should handle different locales');
});
```

## 8. Performance Testing

### Test Optimization

✅ **DO**: Optimize test performance

```typescript
// ✅ Optimized tests

// Use vi.fn() for mocks instead of complex implementations
const mockFunction = vi.fn().mockResolvedValue('result');

// Avoid unnecessary renders
beforeEach(() => {
  // Set up once per test
});

// Use test.each for similar test cases
test.each([
  ['input1', 'expected1'],
  ['input2', 'expected2'],
  ['input3', 'expected3'],
])('formatDate(%s) should return %s', (input, expected) => {
  expect(formatDate(input)).toBe(expected);
});
```

### Slow Test Identification

```bash
# Identify slow tests
pnpm test --reporter=json | jq '.testResults[] | select(.duration > 1000)'

# Optimize slow tests
# - Mock external dependencies
# - Reduce setup complexity
# - Use faster assertions
```

## 9. Continuous Integration

### CI Configuration

✅ **DO**: Configure CI for test execution

```yaml
# .github/workflows/test.yml
name: WildOut Tests

on: [push, pull_request]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run type checking
        run: pnpm type-check
      
      - name: Run linting
        run: pnpm lint
      
      - name: Run tests
        run: pnpm test
      
      - name: Run tests with coverage
        run: pnpm test:coverage
      
      - name: Upload coverage report
        uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: coverage/
      
      - name: Check coverage thresholds
        run: |
          COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
          if [ "$(echo "$COVERAGE < 80" | bc)" -eq 1 ]; then
            echo "Coverage below threshold: ${COVERAGE}%"
            exit 1
          fi
```

## 10. Debugging Tests

### Common Test Issues

**Test Fails Intermittently**:
- Check for race conditions
- Add proper waits and assertions
- Use `waitFor` for async operations

**Test Times Out**:
- Increase timeout for slow operations
- Mock external dependencies
- Optimize test setup

**Test Environment Issues**:
- Check environment variables
- Verify test database connection
- Clear test data between runs

### Debugging Techniques

```typescript
// ✅ Debugging techniques

// 1. Add console.log for debugging
console.log('Test setup:', { props, mocks });

// 2. Use screen.debug() to inspect DOM
screen.debug();

// 3. Use pretty DOM formatting
import { prettyDOM } from '@testing-library/react';
console.log(prettyDOM(screen.getByTestId('component')));

// 4. Run specific test with verbose output
pnpm test src/components/Component.test.tsx --reporter=verbose

// 5. Use test UI for visual debugging
pnpm test:ui
```

## 11. Test Maintenance

### Updating Tests

✅ **DO**: Keep tests up to date

```bash
# Update snapshots when UI changes
pnpm test --update-snapshots

# Find outdated tests
rg -n "it\.skip\|test\.skip" src/

# Find untyped test files
find src -name "*.test.js" -o -name "*.test.jsx"
```

### Test Refactoring

✅ **DO**: Refactor tests when code changes

```typescript
// ✅ Test refactoring example

// Before: Testing implementation details
it('should call useEffect', () => {
  // ❌ Bad - tests implementation
});

// After: Testing user behavior
it('should fetch data on mount', async () => {
  // ✅ Good - tests behavior
  renderWithProviders(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded data')).toBeInTheDocument();
  });
});
```

## 12. Test Documentation

### Test Documentation Standards

✅ **DO**: Document complex test scenarios

```typescript
/**
 * Test suite for LoginPage component
 * 
 * Covers:
 * - Form validation
 * - Authentication flow
 * - Error handling
 * - Loading states
 * - Accessibility
 */
describe('LoginPage', () => {
  // Tests...
});

/**
 * Integration test for login flow
 * 
 * This test verifies the complete login process:
 * 1. User enters credentials
 * 2. Form validation passes
 * 3. AuthContext.login is called
 * 4. Success/failure states are handled
 * 5. User is redirected or shown error
 */
it('should handle complete login flow', async () => {
  // Test implementation
});
```

## 13. Common Test Patterns

### Form Testing

✅ **DO**: Test form behavior comprehensively

```typescript
// ✅ Form testing pattern
describe('LoginForm', () => {
  it('should validate email format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    await user.type(screen.getByLabelText('Email'), 'invalid');
    await user.tab(); // Trigger validation
    
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('should validate password length', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.tab();
    
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('should enable submit button when form is valid', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    
    expect(screen.getByRole('button', { name: 'Login' })).toBeEnabled();
  });

  it('should call onSubmit with form data', async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();
    
    renderWithProviders(<LoginForm onSubmit={mockSubmit} />);
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### API Testing

✅ **DO**: Test API interactions

```typescript
// ✅ API testing pattern
describe('EventService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getEvents', () => {
    it('should return events on success', async () => {
      const mockEvents = [{ id: '1', title: 'Event 1' }];
      
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockEvents, error: null }),
        }),
      } as any);

      const result = await getEvents();
      
      expect(result).toEqual(mockEvents);
    });

    it('should throw error on failure', async () => {
      const mockError = new Error('Database error');
      
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      } as any);

      await expect(getEvents()).rejects.toThrow('Failed to fetch events');
    });

    it('should handle empty response', async () => {
      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      } as any);

      const result = await getEvents();
      
      expect(result).toEqual([]);
    });
  });
});
```

### Error Boundary Testing

✅ **DO**: Test error handling

```typescript
// ✅ Error boundary testing pattern
describe('ErrorBoundary', () => {
  function ProblemChild() {
    throw new Error('Test error');
    return <div>Error</div>;
  }

  it('should catch errors and show fallback', () => {
    renderWithProviders(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ProblemChild />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should allow error recovery', async () => {
    const user = userEvent.setup();
    
    function RecoverableComponent({ shouldThrow }: { shouldThrow: boolean }) {
      if (shouldThrow) {
        throw new Error('Recoverable error');
      }
      return <div>Recovered</div>;
    }

    const { rerender } = renderWithProviders(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <RecoverableComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    rerender(
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <RecoverableComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });

  it('should log errors to console', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    renderWithProviders(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
```

## 14. Test Success Criteria

### Quality Gates

- ✅ **Type Checking**: `pnpm type-check` passes
- ✅ **Linting**: `pnpm lint` passes
- ✅ **Formatting**: Code is properly formatted
- ✅ **Unit Tests**: All unit tests pass
- ✅ **Integration Tests**: All integration tests pass
- ✅ **Component Tests**: All component tests pass
- ✅ **Coverage**: ≥ 80% test coverage
- ✅ **Performance**: Tests run in reasonable time
- ✅ **Documentation**: Tests are well documented
- ✅ **Maintainability**: Tests follow established patterns

### Test Review Checklist

- ✅ Tests cover happy path
- ✅ Tests cover edge cases
- ✅ Tests cover error conditions
- ✅ Tests are isolated
- ✅ Tests use proper mocking
- ✅ Tests follow naming conventions
- ✅ Tests are performant
- ✅ Tests are maintainable
- ✅ Tests document complex scenarios
- ✅ Tests verify user behavior, not implementation