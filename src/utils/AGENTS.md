# src/utils/ - Utility Functions

**Detailed guidance for utility functions and helpers**

## Package Identity

- **Purpose**: Utility functions and helper libraries
- **Primary Tech**: TypeScript 5.9, JavaScript utilities
- **Pattern**: Modular utility functions with TypeScript typing

## Setup & Run

```bash
# No special setup needed - utilities are part of main app
# Test utilities individually
pnpm test -- src/utils/**/*.test.*
```

## Patterns & Conventions

### File Organization Rules

- **Utility Files**: One file per utility domain (e.g., `validation.ts`, `formatting.ts`)
- **Supabase Utils**: `src/utils/supabase/` - Supabase-specific utilities
- **API Utils**: `src/utils/api.ts` - API-related utilities
- **General Utils**: `src/utils/*.ts` - General purpose utilities

### Naming Conventions

- **Utility Files**: kebab-case (e.g., `validation.ts`, `formatting.ts`)
- **Utility Functions**: camelCase (e.g., `validateEmail()`, `formatDate()`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DATE_FORMAT`, `API_TIMEOUT`)
- **Types**: PascalCase (e.g., `ValidationResult`, `FormatOptions`)

### Preferred Patterns

✅ **DO**: Create modular utility functions

```typescript
// Example: src/utils/validation.ts
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Invalid email format" };
  }
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" };
  }
  return { isValid: true };
}
```

✅ **DO**: Use TypeScript interfaces for function parameters

```typescript
// Example: src/utils/formatting.ts
interface FormatDateOptions {
  format?: "short" | "long" | "full";
  locale?: string;
}

export function formatDate(
  date: Date,
  options: FormatDateOptions = {}
): string {
  const { format = "short", locale = "en-US" } = options;

  switch (format) {
    case "short":
      return date.toLocaleDateString(locale);
    case "long":
      return date.toLocaleDateString(locale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "full":
      return date.toLocaleString(locale);
    default:
      return date.toString();
  }
}
```

✅ **DO**: Create reusable API utilities

```typescript
// Example: src/utils/api.ts
interface ApiResponse<T> {
  data?: T;
  error?: Error;
  status: number;
}

export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return { data, status: response.status };
  } catch (error) {
    return { error: error as Error, status: 500 };
  }
}
```

✅ **DO**: Create Supabase-specific utilities

```typescript
// Example: src/utils/supabase/info.tsx
import { supabase } from "@/supabase/client";

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data;
}
```

❌ **DON'T**: Create utilities that duplicate existing library functionality

```typescript
// Avoid: Reinventing the wheel
function myCustomMap(array: any[], callback: (item: any) => any) {
  // ❌ Use Array.prototype.map instead
}
```

❌ **DON'T**: Create utilities with side effects

```typescript
// Avoid: Utilities with side effects
let counter = 0;
function incrementCounter() {
  counter++; // ❌ Avoid global state in utilities
}
```

## Touch Points / Key Files

- **Validation**: `src/utils/validation.ts` - Form validation utilities
- **Formatting**: `src/utils/formatting.ts` - Date/formatting utilities
- **API**: `src/utils/api.ts` - API request utilities
- **Security**: `src/utils/security.ts` - Security-related utilities
- **Storage**: `src/utils/storageHelpers.ts` - Storage utilities
- **Supabase**: `src/utils/supabase/` - Supabase-specific utilities

## JIT Index Hints

```bash
# Find utility functions
rg -n "export.*function|export.*const" src/utils/

# Find specific utility
rg -n "validateEmail|formatDate" src/utils/

# Find utility usage
rg -n "from.*utils" src/

# Find utility tests
find src/utils/ -name "*.test.*"

# Find TypeScript types in utilities
rg -n "interface|type" src/utils/
```

## Common Gotchas

- **Pure Functions**: Utilities should be pure functions without side effects
- **Type Safety**: Always provide TypeScript interfaces for function parameters
- **Error Handling**: Provide proper error handling in async utilities
- **Performance**: Avoid expensive operations in utilities called frequently
- **Testing**: Ensure utilities are well-tested with unit tests

## Best Practices

1. **Single Responsibility**: Each utility function should do one thing well
2. **Type Safety**: Always use TypeScript interfaces and type guards
3. **Pure Functions**: Avoid side effects and global state
4. **Error Handling**: Provide meaningful error messages
5. **Documentation**: Add JSDoc comments for complex utilities

## Pre-PR Checks

```bash
# Run utility tests
pnpm test -- src/utils/**/*.test.*

# Check TypeScript types
pnpm type-check

# Verify no side effects
rg -n "let|var" src/utils/ && echo "Found potential side effects!" || echo "No side effects found"
```

## Model Cutoff Research

> **Note**: If model cutoff < current_date then they need to research no matter what to improve their knowledge.
