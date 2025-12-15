# Create New Context

Create a new React context following WildOut! project conventions.

## Usage

```bash
claude /create-context ContextName
```

## Steps

1. **Create Context File**:

   - Place in `src/contexts/` directory
   - Use compound component pattern
   - Include custom hook for consumption
   - Add proper TypeScript interfaces

2. **Create Test File**:

   - Vitest + Testing Library setup
   - Test provider functionality
   - Test custom hook
   - Test state updates

3. **Update Index File**:
   - Add to `src/contexts/index.ts`
   - Export context and hook

## Context Structure

```typescript
// src/contexts/ContextName.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/supabase/client";
import { z } from "zod";

// 1. Types and Interfaces
export interface ContextItem {
  id: string;
  name: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export const contextItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  value: z.string().min(1).max(1000),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

interface ContextType {
  // State
  items: ContextItem[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  fetchItems: () => Promise<void>;
  addItem: (
    item: Omit<ContextItem, "id" | "created_at" | "updated_at">
  ) => Promise<ContextItem>;
  updateItem: (
    id: string,
    updates: Partial<ContextItem>
  ) => Promise<ContextItem>;
  deleteItem: (id: string) => Promise<void>;

  // Query functions
  getItemById: (id: string) => ContextItem | undefined;
}

interface ProviderProps {
  children: React.ReactNode;
}

// 2. Create Context
const ContextNameContext = createContext<ContextType | undefined>(undefined);

// 3. Provider Component
export function ContextNameProvider({ children }: ProviderProps) {
  // State management
  const [items, setItems] = useState<ContextItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const queryClient = useQueryClient();

  // Data fetching
  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("context_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw new Error(`Failed to fetch items: ${fetchError.message}`);
      }

      const validatedItems = data.map((item) => contextItemSchema.parse(item));
      setItems(validatedItems);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // CRUD operations
  const addItem = useCallback(
    async (itemData: Omit<ContextItem, "id" | "created_at" | "updated_at">) => {
      try {
        const { data, error: insertError } = await supabase
          .from("context_items")
          .insert([itemData])
          .select();

        if (insertError) {
          throw new Error(`Failed to add item: ${insertError.message}`);
        }

        const newItem = contextItemSchema.parse(data[0]);
        setItems((prev) => [...prev, newItem]);
        return newItem;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        throw err;
      }
    },
    []
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<ContextItem>) => {
      try {
        const { data, error: updateError } = await supabase
          .from("context_items")
          .update(updates)
          .eq("id", id)
          .select();

        if (updateError) {
          throw new Error(`Failed to update item: ${updateError.message}`);
        }

        const updatedItem = contextItemSchema.parse(data[0]);
        setItems((prev) =>
          prev.map((item) => (item.id === id ? updatedItem : item))
        );
        return updatedItem;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        throw err;
      }
    },
    []
  );

  const deleteItem = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("context_items")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error(`Failed to delete item: ${deleteError.message}`);
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      throw err;
    }
  }, []);

  // Query functions
  const getItemById = useCallback(
    (id: string) => {
      return items.find((item) => item.id === id);
    },
    [items]
  );

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      items,
      isLoading,
      error,
      fetchItems,
      addItem,
      updateItem,
      deleteItem,
      getItemById,
    }),
    [
      items,
      isLoading,
      error,
      fetchItems,
      addItem,
      updateItem,
      deleteItem,
      getItemById,
    ]
  );

  // Initial data fetch
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <ContextNameContext.Provider value={contextValue}>
      {children}
    </ContextNameContext.Provider>
  );
}

// 4. Custom Hook
export function useContextName() {
  const context = useContext(ContextNameContext);

  if (context === undefined) {
    throw new Error("useContextName must be used within a ContextNameProvider");
  }

  return context;
}

// 5. Query Hooks (Optional)
export function useContextItemsQuery() {
  return useQuery({
    queryKey: ["context-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("context_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch items: ${error.message}`);
      }

      return data.map((item) => contextItemSchema.parse(item));
    },
  });
}
```

## Test Structure

```typescript
// src/contexts/ContextName.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContextNameProvider, useContextName } from "./ContextName";
import { supabase } from "@/supabase/client";

// Mock data
const mockItems = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    name: "Test Item 1",
    value: "Test Value 1",
    created_at: "2025-12-15T10:00:00Z",
    updated_at: "2025-12-15T10:00:00Z",
  },
  {
    id: "89abcdef-1234-5678-90ab-cdef12345678",
    name: "Test Item 2",
    value: "Test Value 2",
    created_at: "2025-12-15T11:00:00Z",
    updated_at: "2025-12-15T11:00:00Z",
  },
];

// Mock Supabase
vi.mock("@/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  },
}));

// Test component
function TestComponent() {
  const { items, isLoading, error, addItem } = useContextName();

  return (
    <div>
      <div data-testid="loading">{isLoading ? "loading" : "loaded"}</div>
      <div data-testid="error">{error?.message || "no error"}</div>
      <div data-testid="count">{items.length}</div>
      <button onClick={() => addItem({ name: "New Item", value: "New Value" })}>
        Add Item
      </button>
    </div>
  );
}

describe("ContextName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides context values", async () => {
    render(
      <ContextNameProvider>
        <TestComponent />
      </ContextNameProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    expect(screen.getByTestId("count")).toHaveTextContent("2");
    expect(screen.getByTestId("error")).toHaveTextContent("no error");
  });

  it("throws error when used outside provider", () => {
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useContextName must be used within a ContextNameProvider");

    console.error = originalError;
  });

  it("adds new items", async () => {
    supabase
      .from()
      .insert()
      .select()
      .mockResolvedValue({
        data: [mockItems[0]],
        error: null,
      });

    render(
      <ContextNameProvider>
        <TestComponent />
      </ContextNameProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    const initialCount = screen.getByTestId("count").textContent;

    // Click add button
    const addButton = screen.getByRole("button", { name: /add item/i });
    addButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("count")).not.toHaveTextContent(initialCount);
    });
  });

  it("handles errors gracefully", async () => {
    supabase
      .from()
      .select()
      .order()
      .mockResolvedValue({
        data: null,
        error: { message: "Network error" },
      });

    render(
      <ContextNameProvider>
        <TestComponent />
      </ContextNameProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("error")).not.toHaveTextContent("no error");
    });
  });
});
```

## Validation

1. **TypeScript**: Run `pnpm type-check`
2. **Linting**: Run `pnpm lint`
3. **Tests**: Run `pnpm test src/contexts/ContextName.test.tsx`
4. **Formatting**: Run `pnpm format`

## Integration

1. **Wrap App**: Add provider to `src/main.tsx`
2. **Import**: `import { useContextName } from '@/contexts/ContextName'`
3. **Use**: Follow context hook interface
4. **Document**: Add to `src/contexts/CLAUDE.md`

## Best Practices

- ✅ Use compound component pattern
- ✅ Provide custom hook for consumption
- ✅ Handle errors consistently
- ✅ Use memoization for performance
- ✅ Include loading states
- ✅ Use Zod for validation
- ✅ Follow React Context API patterns
- ✅ Keep context focused on single domain
