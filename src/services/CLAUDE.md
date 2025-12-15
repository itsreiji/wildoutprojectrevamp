# WildOut! Services - CLAUDE.md

> **Parent Context**: This extends [../CLAUDE.md](../CLAUDE.md)

## 1. Services Identity

### Overview

- **Technology**: TypeScript 5.9, Supabase Client, TanStack Query
- **Pattern**: Service layer for business logic and data access
- **Purpose**: Centralized data operations, API integration, and business rules

## 2. Directory Structure

```
src/services/
├── auditService.ts          # Audit logging service
├── contentService.ts        # Content management service
├── eventService.ts          # Event management service
├── partnerService.ts        # Partner management service
├── teamService.ts           # Team management service
├── userService.ts           # User management service
└── index.ts                 # Service exports
```

## 3. Service Architecture

### Design Principles

✅ **DO**: Follow these principles for new services

1. **Single Responsibility**: Each service handles one domain
2. **Separation of Concerns**: Business logic separate from UI
3. **Type Safety**: Full TypeScript support for all operations
4. **Error Handling**: Consistent error handling patterns
5. **Testability**: Easy to test in isolation
6. **Reusability**: Can be used by multiple components

### Service Structure

✅ **DO**: Use this structure for new services

```typescript
// 1. Imports
import { supabase } from '@/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

// 2. Types and Schemas
export interface ItemType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const itemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// 3. Validation Functions
export function validateItem(item: unknown): ItemType {
  return itemSchema.parse(item);
}

// 4. Service Functions
// 4.1 Query Functions (GET operations)
export async function getItems(): Promise<ItemType[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch items: ${error.message}`);
  }

  return data.map(validateItem);
}

export async function getItemById(id: string): Promise<ItemType> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch item: ${error.message}`);
  }

  return validateItem(data);
}

// 4.2 Mutation Functions (POST, PUT, DELETE operations)
export async function createItem(itemData: Omit<ItemType, 'id' | 'created_at' | 'updated_at'>): Promise<ItemType> {
  const { data, error } = await supabase
    .from('items')
    .insert([itemData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create item: ${error.message}`);
  }

  return validateItem(data);
}

export async function updateItem(id: string, updates: Partial<Omit<ItemType, 'id' | 'created_at' | 'updated_at'>>): Promise<ItemType> {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update item: ${error.message}`);
  }

  return validateItem(data);
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete item: ${error.message}`);
  }
}

// 5. React Query Hooks (Optional)
export function useItems() {
  return useQuery<ItemType[]>({
    queryKey: ['items'],
    queryFn: getItems,
  });
}

export function useItem(id: string) {
  return useQuery<ItemType>({
    queryKey: ['items', id],
    queryFn: () => getItemById(id),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation<ItemType, Error, Omit<ItemType, 'id' | 'created_at' | 'updated_at'>>({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation<ItemType, Error, { id: string; updates: Partial<Omit<ItemType, 'id' | 'created_at' | 'updated_at'>> }>({
    mutationFn: ({ id, updates }) => updateItem(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['items', id] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
}
```

## 4. Audit Service Pattern

### Audit Logging Implementation

✅ **DO**: Use this pattern for audit logging

```typescript
// ✅ Correct: Audit service pattern
import { supabase } from '@/supabase/client';
import { z } from 'zod';

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_value: unknown | null;
  new_value: unknown | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  action: z.string().min(1),
  entity_type: z.string().min(1),
  entity_id: z.string().uuid().nullable(),
  old_value: z.unknown().nullable(),
  new_value: z.unknown().nullable(),
  ip_address: z.string().ip().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.string().datetime(),
});

export async function logAuditAction(
  action: string,
  entityType: string,
  entityId: string | null = null,
  oldValue: unknown | null = null,
  newValue: unknown | null = null,
  userId: string | null = null
): Promise<AuditLogEntry> {
  try {
    // Get client information if available
    const ipAddress = null; // Would get from request in server-side
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : null;

    const auditData = {
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
      ip_address: ipAddress,
      user_agent: userAgent,
    };

    const { data, error } = await supabase
      .from('audit_log')
      .insert([auditData])
      .select()
      .single();

    if (error) {
      console.error('Failed to log audit action:', error);
      // Don't throw - audit logging should not break main functionality
      return {
        id: 'failed',
        ...auditData,
        created_at: new Date().toISOString(),
      } as AuditLogEntry;
    }

    return auditLogSchema.parse(data);
  } catch (err) {
    console.error('Audit logging error:', err);
    // Return a fallback audit entry
    return {
      id: 'error',
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
      ip_address: null,
      user_agent: null,
      created_at: new Date().toISOString(),
    };
  }
}

export async function getAuditLogs(
  filters?: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }
): Promise<AuditLogEntry[]> {
  let query = supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters) {
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters.entityId) {
      query = query.eq('entity_id', filters.entityId);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }

  return data.map(auditLogSchema.parse);
}
```

### Audit Service Usage

✅ **DO**: Integrate audit logging in business operations

```typescript
// ✅ Correct: Audit service usage
import { logAuditAction } from '@/services/auditService';
import { updateEvent } from '@/services/eventService';

export async function updateEventWithAudit(
  eventId: string,
  updates: Partial<EventType>,
  userId: string
): Promise<EventType> {
  // Get current event for audit trail
  const currentEvent = await getEventById(eventId);

  // Perform the update
  const updatedEvent = await updateEvent(eventId, updates);

  // Log the audit action
  await logAuditAction(
    'UPDATE',
    'event',
    eventId,
    currentEvent,
    updatedEvent,
    userId
  );

  return updatedEvent;
}
```

## 5. Event Service Pattern

### Event Management

✅ **DO**: Use comprehensive event service

```typescript
// ✅ Correct: Event service pattern
import { supabase } from '@/supabase/client';
import { z } from 'zod';
import { logAuditAction } from './auditService';

export interface EventType {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  location: string | null;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  partner_id: string | null;
  created_at: string;
  updated_at: string;
}

export const eventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).nullable(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  location: z.string().max(200).nullable(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']),
  partner_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Validation
function validateEventDates(startDate: string, endDate: string): void {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    throw new Error('End date must be after start date');
  }
}

// CRUD Operations
export async function getEvents(): Promise<EventType[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) throw new Error(`Failed to fetch events: ${error.message}`);
  return data.map(eventSchema.parse);
}

export async function getEventById(id: string): Promise<EventType> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Failed to fetch event: ${error.message}`);
  return eventSchema.parse(data);
}

export async function createEvent(
  eventData: Omit<EventType, 'id' | 'created_at' | 'updated_at'>,
  userId: string
): Promise<EventType> {
  // Validate dates
  validateEventDates(eventData.start_date, eventData.end_date);

  const { data, error } = await supabase
    .from('events')
    .insert([{
      ...eventData,
      status: eventData.status || 'draft',
    }])
    .select()
    .single();

  if (error) throw new Error(`Failed to create event: ${error.message}`);

  const createdEvent = eventSchema.parse(data);

  // Audit log
  await logAuditAction('CREATE', 'event', createdEvent.id, null, createdEvent, userId);

  return createdEvent;
}

export async function updateEvent(
  id: string,
  updates: Partial<Omit<EventType, 'id' | 'created_at' | 'updated_at'>>,
  userId: string
): Promise<EventType> {
  // Get current event for validation and audit
  const currentEvent = await getEventById(id);

  // Validate dates if they're being updated
  if (updates.start_date || updates.end_date) {
    const startDate = updates.start_date || currentEvent.start_date;
    const endDate = updates.end_date || currentEvent.end_date;
    validateEventDates(startDate, endDate);
  }

  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update event: ${error.message}`);

  const updatedEvent = eventSchema.parse(data);

  // Audit log
  await logAuditAction('UPDATE', 'event', id, currentEvent, updatedEvent, userId);

  return updatedEvent;
}

export async function deleteEvent(id: string, userId: string): Promise<void> {
  // Get event for audit before deletion
  const eventToDelete = await getEventById(id);

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete event: ${error.message}`);

  // Audit log
  await logAuditAction('DELETE', 'event', id, eventToDelete, null, userId);
}

// Query Functions
export async function getUpcomingEvents(limit: number = 10): Promise<EventType[]> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('end_date', now)
    .order('start_date', { ascending: true })
    .limit(limit);

  if (error) throw new Error(`Failed to fetch upcoming events: ${error.message}`);
  return data.map(eventSchema.parse);
}

export async function getEventsByPartner(partnerId: string): Promise<EventType[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('partner_id', partnerId)
    .order('start_date', { ascending: true });

  if (error) throw new Error(`Failed to fetch partner events: ${error.message}`);
  return data.map(eventSchema.parse);
}
```

## 6. Service Composition

### Combining Services

✅ **DO**: Compose services for complex operations

```typescript
// ✅ Correct: Service composition
import { createEvent } from '@/services/eventService';
import { getPartnerById } from '@/services/partnerService';
import { logAuditAction } from '@/services/auditService';

export async function createEventWithPartner(
  eventData: Omit<EventType, 'id' | 'created_at' | 'updated_at' | 'partner_id'>,
  partnerId: string,
  userId: string
): Promise<EventType> {
  // Verify partner exists
  const partner = await getPartnerById(partnerId);
  
  if (partner.status !== 'active') {
    throw new Error('Cannot create event with inactive partner');
  }

  // Create event with partner
  const event = await createEvent(
    {
      ...eventData,
      partner_id: partnerId,
    },
    userId
  );

  // Additional audit logging for partner relationship
  await logAuditAction(
    'LINK',
    'partner_event',
    `${partnerId}_${event.id}`,
    null,
    { partner_id: partnerId, event_id: event.id },
    userId
  );

  return event;
}
```

### Service Layer vs Context

✅ **DO**: Use this decision matrix

| Use Services When | Use Context When |
|-------------------|------------------|
| Complex business logic | Simple state management |
| Multiple data sources | Single data source |
| Reusable across components | Component-specific state |
| Data validation and transformation | UI state (modals, forms) |
| Audit logging and side effects | Authentication state |

## 7. Error Handling Patterns

### Consistent Error Handling

✅ **DO**: Use consistent error handling

```typescript
// ✅ Correct: Consistent error handling
// 1. Service-level error handling
try {
  const { data, error } = await supabase
    .from('items')
    .select('*');
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  return data;
} catch (err) {
  // Log error
  console.error('Service error:', err);
  
  // Re-throw with consistent format
  if (err instanceof Error) {
    throw new Error(`Failed to fetch items: ${err.message}`);
  }
  
  throw new Error('Failed to fetch items: Unknown error');
}

// 2. Component-level error handling
try {
  const items = await getItems();
  setItems(items);
} catch (err) {
  if (err instanceof Error) {
    showToast({ 
      title: 'Error',
      description: err.message,
      variant: 'destructive'
    });
  }
}
```

### Error Types

✅ **DO**: Define custom error types

```typescript
// ✅ Correct: Custom error types
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} with ID ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class AuthorizationError extends Error {
  constructor(action: string) {
    super(`Not authorized to ${action}`);
    this.name = 'AuthorizationError';
  }
}

// Usage
export async function getItemById(id: string): Promise<ItemType> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Not found
      throw new NotFoundError('Item', id);
    }
    throw new Error(`Failed to fetch item: ${error.message}`);
  }

  if (!data) {
    throw new NotFoundError('Item', id);
  }

  return validateItem(data);
}
```

## 8. Testing Services

### Service Test Structure

✅ **DO**: Test services in isolation

```typescript
// ✅ Correct: Service test
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getItems, createItem, updateItem, deleteItem } from '@/services/itemService';
import { supabase } from '@/supabase/client';

// Mock Supabase
vi.mock('@/supabase/client');

describe('Item Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getItems', () => {
    it('should return items on success', async () => {
      const mockItems = [
        { id: '1', name: 'Item 1', created_at: '2023-01-01', updated_at: '2023-01-01' },
        { id: '2', name: 'Item 2', created_at: '2023-01-02', updated_at: '2023-01-02' },
      ];

      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockItems, error: null }),
        }),
      } as any);

      const result = await getItems();
      
      expect(result).toEqual(mockItems);
      expect(result.length).toBe(2);
    });

    it('should throw error on failure', async () => {
      const mockError = new Error('Database error');

      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      } as any);

      await expect(getItems()).rejects.toThrow('Failed to fetch items');
    });
  });

  describe('createItem', () => {
    it('should create and return item', async () => {
      const newItem = { name: 'New Item' };
      const createdItem = { id: '3', ...newItem, created_at: '2023-01-03', updated_at: '2023-01-03' };

      vi.spyOn(supabase, 'from').mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: createdItem, error: null }),
          }),
        }),
      } as any);

      const result = await createItem(newItem);
      
      expect(result).toEqual(createdItem);
      expect(result.name).toBe('New Item');
    });

    it('should throw error on validation failure', async () => {
      const invalidItem = { name: '' }; // Empty name

      await expect(createItem(invalidItem)).rejects.toThrow('Validation error');
    });
  });

  // More tests for update and delete...
});
```

### Mocking Dependencies

✅ **DO**: Mock external dependencies

```typescript
// ✅ Correct: Mocking dependencies
import { vi } from 'vitest';
import { logAuditAction } from '@/services/auditService';

// Mock audit service
vi.mock('@/services/auditService', () => ({
  logAuditAction: vi.fn().mockResolvedValue({
    id: 'audit-1',
    action: 'TEST',
    entity_type: 'test',
    created_at: '2023-01-01',
  }),
}));

describe('Service with Audit Logging', () => {
  it('should call audit service on successful operation', async () => {
    const mockLogAudit = logAuditAction as jest.Mock;
    
    // Call service function that uses audit logging
    await someServiceOperation();
    
    expect(mockLogAudit).toHaveBeenCalled();
    expect(mockLogAudit).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.any(String),
      expect.anything(),
      expect.anything(),
      expect.any(String)
    );
  });
});
```

## 9. Performance Optimization

### Query Optimization

✅ **DO**: Optimize database queries

```typescript
// ✅ Correct: Optimized queries
// 1. Select only needed columns
export async function getEventSummaries(): Promise<Pick<EventType, 'id' | 'title' | 'start_date'>[]> {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, start_date') // Only select what we need
    .order('start_date', { ascending: true })
    .limit(50); // Add reasonable limits

  if (error) throw new Error(`Failed to fetch event summaries: ${error.message}`);
  return data;
}

// 2. Use proper indexing
// Ensure database has indexes on frequently queried columns
// Example: CREATE INDEX idx_events_start_date ON events(start_date);

// 3. Batch operations
export async function updateMultipleEvents(
  eventIds: string[],
  updates: Partial<EventType>
): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update(updates)
    .in('id', eventIds);

  if (error) throw new Error(`Failed to update events: ${error.message}`);
}
```

### Caching Strategies

✅ **DO**: Implement caching where appropriate

```typescript
// ✅ Correct: Caching strategies
// 1. In-memory cache
let eventsCache: EventType[] | null = null;
let lastFetched: Date | null = null;

export async function getEventsWithCache(): Promise<EventType[]> {
  // Return cached data if recent
  if (eventsCache && lastFetched && 
      (Date.now() - lastFetched.getTime()) < 5 * 60 * 1000) { // 5 minutes
    return eventsCache;
  }

  // Fetch fresh data
  const events = await getEvents();
  eventsCache = events;
  lastFetched = new Date();
  
  return events;
}

// 2. Cache invalidation
export async function invalidateEventsCache(): Promise<void> {
  eventsCache = null;
  lastFetched = null;
}

// 3. Use TanStack Query for automatic caching
// (Implemented in React hooks)
```

### Batch Processing

✅ **DO**: Use batch processing for bulk operations

```typescript
// ✅ Correct: Batch processing
export async function processEventsInBatches(
  eventIds: string[],
  processFn: (eventId: string) => Promise<void>,
  batchSize: number = 10
): Promise<void> {
  for (let i = 0; i < eventIds.length; i += batchSize) {
    const batch = eventIds.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(eventId => processFn(eventId))
    );
    
    // Optional: Add delay between batches to avoid rate limiting
    if (i + batchSize < eventIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
```

## 10. Security Considerations

### Input Validation

✅ **DO**: Validate all inputs

```typescript
// ✅ Correct: Comprehensive validation
export async function createEvent(eventData: Omit<EventType, 'id' | 'created_at' | 'updated_at'>): Promise<EventType> {
  // 1. Schema validation
  const eventSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
    location: z.string().max(200).optional(),
    status: z.enum(['draft', 'published', 'cancelled', 'completed']),
    partner_id: z.string().uuid().optional(),
  });

  const validatedData = eventSchema.parse(eventData);

  // 2. Business rule validation
  const startDate = new Date(validatedData.start_date);
  const endDate = new Date(validatedData.end_date);

  if (startDate >= endDate) {
    throw new ValidationError('End date must be after start date');
  }

  if (startDate < new Date()) {
    throw new ValidationError('Cannot create event in the past');
  }

  // 3. Database operation
  const { data, error } = await supabase
    .from('events')
    .insert([validatedData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`);
  }

  return eventSchema.parse(data);
}
```

### Row Level Security

✅ **DO**: Respect Supabase RLS policies

```typescript
// ✅ Correct: RLS considerations
// 1. Always use Supabase client with proper RLS
// 2. Don't bypass RLS with service role
// 3. Handle RLS errors appropriately

export async function getUserEvents(userId: string): Promise<EventType[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`created_by.eq.${userId},public.eq.true`); // Respect RLS

    if (error) {
      if (error.code === 'PGRST301') { // RLS violation
        throw new AuthorizationError('read events');
      }
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return data.map(eventSchema.parse);
  } catch (err) {
    if (err instanceof AuthorizationError) {
      console.warn('RLS violation attempted');
    }
    throw err;
  }
}
```

### Data Sanitization

✅ **DO**: Sanitize data before storage

```typescript
// ✅ Correct: Data sanitization
import { sanitize } from '@/utils/security';

export async function createEvent(eventData: Omit<EventType, 'id' | 'created_at' | 'updated_at'>): Promise<EventType> {
  // Sanitize user-provided data
  const sanitizedData = {
    ...eventData,
    title: sanitize(eventData.title),
    description: eventData.description ? sanitize(eventData.description) : null,
    location: eventData.location ? sanitize(eventData.location) : null,
  };

  // Proceed with sanitized data
  const { data, error } = await supabase
    .from('events')
    .insert([sanitizedData])
    .select()
    .single();

  if (error) throw new Error(`Failed to create event: ${error.message}`);

  return eventSchema.parse(data);
}
```

## 11. API Design Patterns

### RESTful Service Design

✅ **DO**: Follow RESTful patterns

```typescript
// ✅ Correct: RESTful service design
// GET /items        - getItems()
// GET /items/:id    - getItemById(id)
// POST /items       - createItem(itemData)
// PUT /items/:id    - updateItem(id, updates)
// DELETE /items/:id - deleteItem(id)

// Additional endpoints
// GET /items/search?q=query - searchItems(query)
// GET /items/upcoming      - getUpcomingItems()
```

### Service Versioning

✅ **DO**: Plan for API evolution

```typescript
// ✅ Correct: Versioned services
// v1/itemService.ts - Current version
// v2/itemService.ts - Next version (when breaking changes needed)

// Deprecation pattern
export function getItems() {
  console.warn('getItems() is deprecated. Use getItemsV2() instead.');
  return getItemsV2();
}

export function getItemsV2() {
  // New implementation
}
```

### Service Documentation

✅ **DO**: Document service functions

```typescript
// ✅ Correct: Service documentation
/**
 * Fetches all events from the database
 * 
 * @returns Promise<EventType[]> Array of events
 * @throws Error When failed to fetch events
 * 
 * @example
 * try {
 *   const events = await getEvents();
 *   console.log(events);
 * } catch (error) {
 *   console.error('Failed to fetch events:', error);
 * }
 */
export async function getEvents(): Promise<EventType[]> {
  // Implementation
}
```

## 12. Monitoring and Logging

### Service Logging

✅ **DO**: Implement comprehensive logging

```typescript
// ✅ Correct: Service logging
import { logServiceAction } from '@/utils/logging';

export async function createItem(itemData: Omit<ItemType, 'id'>): Promise<ItemType> {
  const startTime = Date.now();
  
  try {
    logServiceAction('createItem', 'start', { itemData });
    
    const result = await performCreateOperation(itemData);
    
    const duration = Date.now() - startTime;
    logServiceAction('createItem', 'success', { 
      itemId: result.id, 
      duration
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logServiceAction('createItem', 'error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      duration
    });
    
    throw error;
  }
}
```

### Performance Monitoring

✅ **DO**: Monitor service performance

```typescript
// ✅ Correct: Performance monitoring
let serviceMetrics = {
  getItems: { calls: 0, totalTime: 0, errors: 0 },
  createItem: { calls: 0, totalTime: 0, errors: 0 },
  // ... other services
};

export async function getItems(): Promise<ItemType[]> {
  const startTime = performance.now();
  
  try {
    serviceMetrics.getItems.calls++;
    
    const result = await performGetItems();
    
    const duration = performance.now() - startTime;
    serviceMetrics.getItems.totalTime += duration;
    
    return result;
  } catch (error) {
    serviceMetrics.getItems.errors++;
    throw error;
  }
}

export function getServiceMetrics() {
  return { ...serviceMetrics };
}
```

## 13. Common Service Patterns

### Data Transformation

✅ **DO**: Transform data in services

```typescript
// ✅ Correct: Data transformation
export async function getEventStatistics(): Promise<EventStats> {
  const events = await getEvents();
  
  // Transform raw data into meaningful statistics
  const now = new Date();
  
  const stats = events.reduce((acc, event) => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (endDate < now) {
      acc.completed++;
    } else if (startDate <= now && endDate >= now) {
      acc.active++;
    } else if (startDate > now) {
      acc.upcoming++;
    }
    
    return acc;
  }, { completed: 0, active: 0, upcoming: 0 });
  
  return {
    total: events.length,
    ...stats,
  };
}
```

### Pagination

✅ **DO**: Implement pagination

```typescript
// ✅ Correct: Pagination pattern
interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getPaginatedEvents(
  options: PaginationOptions
): Promise<PaginatedResult<EventType>> {
  const { page = 1, pageSize = 10, sortBy = 'start_date', sortOrder = 'asc' } = options;
  
  // Get total count
  const { count: total, error: countError } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    throw new Error(`Failed to count events: ${countError.message}`);
  }
  
  if (total === 0) {
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }
  
  // Calculate pagination
  const totalPages = Math.ceil(total / pageSize);
  const offset = (page - 1) * pageSize;
  
  // Get paginated data
  let query = supabase
    .from('events')
    .select('*')
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1);
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to fetch paginated events: ${error.message}`);
  }
  
  return {
    data: data.map(eventSchema.parse),
    total,
    page,
    pageSize,
    totalPages,
  };
}
```

### Search and Filter

✅ **DO**: Implement search functionality

```typescript
// ✅ Correct: Search pattern
interface EventSearchOptions {
  query?: string;
  status?: EventType['status'];
  startDate?: string;
  endDate?: string;
  partnerId?: string;
}

export async function searchEvents(
  options: EventSearchOptions = {}
): Promise<EventType[]> {
  let query = supabase
    .from('events')
    .select('*');
  
  // Apply filters
  if (options.query) {
    query = query.or(`
      title.ilike.%${options.query}%,
      description.ilike.%${options.query}%,
      location.ilike.%${options.query}%
    `);
  }
  
  if (options.status) {
    query = query.eq('status', options.status);
  }
  
  if (options.partnerId) {
    query = query.eq('partner_id', options.partnerId);
  }
  
  if (options.startDate) {
    query = query.gte('start_date', options.startDate);
  }
  
  if (options.endDate) {
    query = query.lte('end_date', options.endDate);
  }
  
  // Execute query
  const { data, error } = await query.order('start_date', { ascending: true });
  
  if (error) {
    throw new Error(`Failed to search events: ${error.message}`);
  }
  
  return data.map(eventSchema.parse);
}
```