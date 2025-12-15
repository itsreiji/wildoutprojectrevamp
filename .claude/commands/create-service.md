# Create New Service

Create a new service following WildOut! project conventions.

## Usage

```bash
claude /create-service ServiceName
```

## Steps

1. **Create Service File**:

   - Place in `src/services/` directory
   - Use proper TypeScript interfaces
   - Follow Supabase integration patterns
   - Include error handling

2. **Create Test File**:

   - Vitest setup with mocking
   - Test all service methods
   - Test error cases

3. **Update Index File**:
   - Add to `src/services/index.ts`
   - Export service functions and types

## Service Structure

```typescript
// src/services/ServiceName.ts
import { supabase } from "@/supabase/client";
import { z } from "zod";

// 1. Types and Schemas
export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export const serviceItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// 2. Validation Functions
export function validateServiceItem(item: unknown): ServiceItem {
  return serviceItemSchema.parse(item);
}

// 3. Service Functions
// 3.1 Query Functions
export async function getServiceItems(): Promise<ServiceItem[]> {
  const { data, error } = await supabase
    .from("service_items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch service items: ${error.message}`);
  }

  return data.map(validateServiceItem);
}

export async function getServiceItemById(id: string): Promise<ServiceItem> {
  const { data, error } = await supabase
    .from("service_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to fetch service item: ${error.message}`);
  }

  return validateServiceItem(data);
}

// 3.2 Mutation Functions
export async function createServiceItem(
  itemData: Omit<ServiceItem, "id" | "created_at" | "updated_at">
): Promise<ServiceItem> {
  const { data, error } = await supabase
    .from("service_items")
    .insert([itemData])
    .select();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to create service item: ${error.message}`);
  }

  return validateServiceItem(data[0]);
}

export async function updateServiceItem(
  id: string,
  updates: Partial<Omit<ServiceItem, "id" | "created_at" | "updated_at">>
): Promise<ServiceItem> {
  const { data, error } = await supabase
    .from("service_items")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to update service item: ${error.message}`);
  }

  return validateServiceItem(data[0]);
}

export async function deleteServiceItem(id: string): Promise<void> {
  const { error } = await supabase.from("service_items").delete().eq("id", id);

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(`Failed to delete service item: ${error.message}`);
  }
}

// 4. Utility Functions
export function createServiceItemKey(itemId: string): string {
  return [`service-items`, itemId].join("-");
}
```

## Test Structure

```typescript
// src/services/ServiceName.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/supabase/client";
import {
  getServiceItems,
  getServiceItemById,
  createServiceItem,
  updateServiceItem,
  deleteServiceItem,
  validateServiceItem,
} from "./ServiceName";

// Mock data
const mockServiceItem = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Test Item",
  description: "Test Description",
  created_at: "2025-12-15T10:00:00Z",
  updated_at: "2025-12-15T10:00:00Z",
};

// Mock Supabase
vi.mock("@/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  },
}));

describe("ServiceName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getServiceItems", () => {
    it("returns service items", async () => {
      supabase
        .from()
        .select()
        .order()
        .mockResolvedValue({
          data: [mockServiceItem],
          error: null,
        });

      const result = await getServiceItems();
      expect(result).toEqual([mockServiceItem]);
    });

    it("throws error when fetch fails", async () => {
      supabase
        .from()
        .select()
        .order()
        .mockResolvedValue({
          data: null,
          error: { message: "Network error" },
        });

      await expect(getServiceItems()).rejects.toThrow(
        "Failed to fetch service items"
      );
    });
  });

  describe("createServiceItem", () => {
    it("creates a service item", async () => {
      const newItem = { name: "New Item", description: "New Description" };
      supabase
        .from()
        .insert()
        .select()
        .mockResolvedValue({
          data: [mockServiceItem],
          error: null,
        });

      const result = await createServiceItem(newItem);
      expect(result).toEqual(mockServiceItem);
    });
  });

  describe("validateServiceItem", () => {
    it("validates correct service item", () => {
      const result = validateServiceItem(mockServiceItem);
      expect(result).toEqual(mockServiceItem);
    });

    it("throws error for invalid service item", () => {
      expect(() => validateServiceItem({})).toThrow();
    });
  });
});
```

## Validation

1. **TypeScript**: Run `pnpm type-check`
2. **Linting**: Run `pnpm lint`
3. **Tests**: Run `pnpm test src/services/ServiceName.test.ts`
4. **Formatting**: Run `pnpm format`

## Integration

1. **Import**: `import { getServiceItems } from '@/services/ServiceName'`
2. **Use**: Follow service function signatures
3. **Document**: Add to `src/services/CLAUDE.md`

## Best Practices

- ✅ Use Zod for validation
- ✅ Handle Supabase errors consistently
- ✅ Log errors for debugging
- ✅ Use async/await for database operations
- ✅ Follow RESTful naming conventions
- ✅ Keep functions focused on single operations
