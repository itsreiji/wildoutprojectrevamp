# WildOut! Utilities - CLAUDE.md

> **Parent Context**: This extends [../CLAUDE.md](../CLAUDE.md)

## 1. Utilities Identity

### Overview

- **Technology**: TypeScript 5.9
- **Pattern**: Utility functions and helpers
- **Purpose**: Reusable utilities for the WildOut! project

## 2. Directory Structure

```
src/utils/
├── api.ts                     # API utilities
├── authValidation.ts          # Authentication validation
├── cn.ts                      # Class name utility
├── formatting.ts              # Formatting utilities
├── security.ts                # Security utilities
├── storageHelpers.ts         # Storage utilities
├── validation.ts              # Validation utilities
├── supabase/                  # Supabase utilities
│   └── info.tsx               # Supabase info component
└── index.ts                   # Utility exports
```

## 3. Utility Patterns

### API Utilities

✅ **DO**: Use consistent API patterns

```typescript
// ✅ Correct: API utility pattern
import { supabase } from '@/supabase/client';

export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get auth token
  const { data: { session } } = await supabase.auth.getSession();
  
  // Add authorization header
  const headers = new Headers(options.headers);
  headers.append('Authorization', `Bearer ${session?.access_token}`);
  
  // Make request
  const response = await fetch(endpoint, {
    ...options,
    headers,
  });
  
  // Handle errors
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return response;
}

export async function handleApiError(error: unknown): Promise<Error> {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  return new Error('Unknown API error');
}
```

### Class Name Utility

✅ **DO**: Use `cn()` for conditional class names

```typescript
// ✅ Correct: Class name utility
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class',
  size === 'large' && 'text-lg',
  'hover:opacity-90'
)}>
  Content
</div>
```

### Formatting Utilities

✅ **DO**: Centralize formatting logic

```typescript
// ✅ Correct: Formatting utilities
export function formatDate(
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function truncateText(
  text: string,
  maxLength: number = 100,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}
```

### Validation Utilities

✅ **DO**: Use Zod for complex validation

```typescript
// ✅ Correct: Validation utilities
import { z } from 'zod';

export const emailSchema = z.string().email({
  message: 'Please enter a valid email address',
});

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        error.errors.map(err => err.message).join('\n')
      );
    }
    
    throw new Error('Validation failed');
  }
}
```

### Security Utilities

✅ **DO**: Implement security best practices

```typescript
// ✅ Correct: Security utilities
export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[\\\/]/g, '')
    .replace(/[\"\']/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

export function hashString(input: string): string {
  // Simple hash function for non-cryptographic purposes
  let hash = 0;
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash.toString();
}
```

### Storage Utilities

✅ **DO**: Use localStorage with TypeScript

```typescript
// ✅ Correct: Storage utilities
export function getLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) as T : null;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return null;
  }
}

export function setLocalStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
    return false;
  }
}

export function removeLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

export function clearLocalStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}
```

## 4. Testing Utilities

### Test Helpers

✅ **DO**: Create reusable test utilities

```typescript
// ✅ Correct: Test utilities
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

export function renderWithProviders(
  ui: React.ReactElement,
  {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
    authContext = {},
  }: {
    queryClient?: QueryClient;
    authContext?: Partial<AuthContextType>;
  } = {}
) {
  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider {...authContext}>
          {ui}
        </AuthProvider>
      </QueryClientProvider>
    ),
    queryClient,
  };
}

export function mockSupabase() {
  return {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  };
}
```

### Mock Data

✅ **DO**: Use consistent mock data

```typescript
// ✅ Correct: Mock data utilities
export function generateMockEvent(overrides: Partial<EventType> = {}): EventType {
  return {
    id: 'event-123',
    title: 'Test Event',
    description: 'This is a test event',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 86400000).toISOString(),
    location: 'Test Location',
    status: 'published',
    partner_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function generateMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'member',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function generateMockTeamMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: 'team-123',
    name: 'Test Member',
    title: 'Developer',
    bio: 'Test bio',
    image_url: 'https://example.com/image.jpg',
    instagram: '@test',
    twitter: '@test',
    linkedin: 'test',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}
```

## 5. Performance Utilities

### Debounce and Throttle

✅ **DO**: Use for performance optimization

```typescript
// ✅ Correct: Performance utilities
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function (...args: Parameters<T>): void {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastFunc: NodeJS.Timeout | null = null;
  let lastRan = 0;
  
  return function (...args: Parameters<T>): void {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      if (lastFunc) {
        clearTimeout(lastFunc);
      }
      
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}
```

### Memoization

✅ **DO**: Cache expensive computations

```typescript
// ✅ Correct: Memoization utility
export function memoize<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  
  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  };
}
```

## 6. Error Handling Utilities

### Error Classes

✅ **DO**: Use custom error classes

```typescript
// ✅ Correct: Error classes
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(
      `${entity} with ID ${id} not found`,
      'NOT_FOUND',
      404
    );
    this.name = 'NotFoundError';
  }
}

export class AuthorizationError extends AppError {
  constructor(action: string) {
    super(
      `Not authorized to ${action}`,
      'AUTHORIZATION_ERROR',
      403
    );
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
  }
}
```

### Error Handling

✅ **DO**: Handle errors consistently

```typescript
// ✅ Correct: Error handling utility
export function handleError(error: unknown): { message: string; code?: string; status?: number } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      status: 500,
    };
  }
  
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'UNKNOWN_ERROR',
      status: 500,
    };
  }
  
  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    status: 500,
  };
}

export function logError(error: unknown, context: string = 'Application'): void {
  const { message, code, status } = handleError(error);
  
  console.error(`[${context}] [${code || 'ERROR'}]`, message);
  
  if (status && status >= 500) {
    // Log to error tracking service
    // trackError({ error, context, severity: 'critical' });
  }
}
```

## 7. Testing Utilities

### Utility Test Patterns

✅ **DO**: Test utilities thoroughly

```typescript
// ✅ Correct: Utility test pattern
import { describe, it, expect } from 'vitest';
import { formatDate, truncateText } from '@/utils/formatting';

describe('formatting utilities', () => {
  describe('formatDate', () => {
    it('should format date with default options', () => {
      const result = formatDate('2023-01-15');
      expect(result).toBe('January 15, 2023');
    });

    it('should format date with custom options', () => {
      const result = formatDate('2023-01-15', {
        year: '2-digit',
        month: 'short',
        day: 'numeric',
      });
      expect(result).toBe('Jan 15, 23');
    });

    it('should handle invalid dates', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('Invalid date');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const result = truncateText('This is a very long text that needs to be truncated', 20);
      expect(result).toBe('This is a very long...');
    });

    it('should not truncate short text', () => {
      const result = truncateText('Short text', 20);
      expect(result).toBe('Short text');
    });

    it('should use custom suffix', () => {
      const result = truncateText('Long text', 5, '... (more)');
      expect(result).toBe('Long... (more)');
    });
  });
});
```

## 8. Performance Considerations

### Utility Optimization

✅ **DO**: Optimize frequently used utilities

```typescript
// ✅ Correct: Optimized utility
// Cache date formatters for better performance
const dateFormatters = new Map<string, Intl.DateTimeFormat>();

export function formatDate(
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  // Create cache key from options
  const cacheKey = JSON.stringify(options);
  
  // Get or create formatter
  if (!dateFormatters.has(cacheKey)) {
    dateFormatters.set(cacheKey, new Intl.DateTimeFormat('en-US', options));
  }
  
  const formatter = dateFormatters.get(cacheKey)!;
  return formatter.format(date);
}
```

### Memory Management

✅ **DO**: Clean up resources

```typescript
// ✅ Correct: Memory management
export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  element: Window | HTMLElement = window
): () => void {
  const savedHandler = handler;
  
  element.addEventListener(eventName, savedHandler);
  
  return () => {
    element.removeEventListener(eventName, savedHandler);
  };
}
```

## 9. Documentation

### Utility Documentation

✅ **DO**: Document utilities thoroughly

```typescript
/**
 * Sanitizes HTML input to prevent XSS attacks
 * 
 * @param input - The string to sanitize
 * @returns Sanitized string safe for HTML rendering
 * 
 * @example
 * const safeHtml = sanitizeHtml('<script>alert("XSS")</script>');
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 */
export function sanitizeHtml(input: string): string {
  // Implementation
}

/**
 * Debounces a function to limit execution rate
 * 
 * @param func - Function to debounce
 * @param wait - Debounce time in milliseconds
 * @returns Debounced function
 * 
 * @example
 * const debouncedSearch = debounce(searchFunction, 300);
 * input.addEventListener('input', debouncedSearch);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  // Implementation
}
```

## 10. Common Patterns

### Utility Composition

✅ **DO**: Compose utilities for complex operations

```typescript
// ✅ Correct: Utility composition
export function formatUserName(user: User): string {
  return truncateText(
    sanitizeHtml(user.name || 'Unknown User'),
    20
  );
}

export function formatEventDateRange(
  startDate: string,
  endDate: string
): string {
  const start = formatDate(startDate, { month: 'short', day: 'numeric' });
  const end = formatDate(endDate, { month: 'short', day: 'numeric' });
  
  return `${start} - ${end}`;
}
```

### Type Safety

✅ **DO**: Ensure type safety in utilities

```typescript
// ✅ Correct: Type-safe utility
export function getNestedValue<T, K extends keyof T>(
  obj: T,
  key: K
): T[K] {
  return obj[key];
}

export function setNestedValue<T, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K]
): T {
  return { ...obj, [key]: value };
}
```

## 11. Error Handling in Utilities

### Defensive Programming

✅ **DO**: Handle edge cases

```typescript
// ✅ Correct: Defensive utility
export function safeParseJson(jsonString: string): unknown {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return null;
  }
}

export function safeExecute<T>(
  func: () => T,
  defaultValue: T
): T {
  try {
    return func();
  } catch (error) {
    console.error('Function execution failed:', error);
    return defaultValue;
  }
}
```

### Validation in Utilities

✅ **DO**: Validate inputs

```typescript
// ✅ Correct: Input validation
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validatePhone(phone: string): boolean {
  return /^\+?[0-9\s-]{10,}$/.test(phone);
}
```