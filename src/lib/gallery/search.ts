/**
 * Gallery Search and Filter System
 * Sistem pencarian dan filter komprehensif untuk galeri
 */

import { supabaseClient } from '@/supabase/client';
import type { GalleryFilter, GallerySort, GalleryPagination, GalleryItem } from './types';
import { SORT_OPTIONS, SORT_DIRECTIONS, PAGINATION } from './constants';

/**
 * Build query dengan filter
 */
export function buildGalleryQuery(
  filters: GalleryFilter = {},
  sort: GallerySort = { field: SORT_OPTIONS.CREATED_AT, direction: SORT_DIRECTIONS.DESC },
  pagination: GalleryPagination = { page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.DEFAULT_LIMIT }
) {
  let query = supabaseClient
    .from('gallery_items')
    .select('*', { count: 'exact' });

  // Filter berdasarkan kategori
  if (filters.category && filters.category.length > 0) {
    query = query.in('category', filters.category);
  }

  // Filter berdasarkan tags
  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  // Filter berdasarkan status
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  // Filter berdasarkan partner
  if (filters.partner_id) {
    query = query.eq('partner_id', filters.partner_id);
  }

  // Filter berdasarkan event
  if (filters.event_id) {
    query = query.eq('event_id', filters.event_id);
  }

  // Filter berdasarkan creator
  if (filters.created_by) {
    query = query.eq('created_by', filters.created_by);
  }

  // Filter berdasarkan tanggal
  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from);
  }
  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  // Pencarian full-text
  if (filters.search_query) {
    const searchQuery = filters.search_query.toLowerCase();
    
    // Gunakan or untuk mencari di multiple fields
    query = query.or(
      `title.ilike.%${searchQuery}%,` +
      `description.ilike.%${searchQuery}%,` +
      `tags.cs.{${searchQuery}}`
    );
  }

  // Sorting
  if (sort.field) {
    query = query.order(sort.field, { ascending: sort.direction === SORT_DIRECTIONS.ASC });
  }

  // Pagination
  const offset = (pagination.page - 1) * pagination.limit;
  query = query.range(offset, offset + pagination.limit - 1);
  query = query.limit(pagination.limit);

  return query;
}

/**
 * Search gallery items
 */
export async function searchGallery(
  filters: GalleryFilter = {},
  sort: GallerySort = { field: SORT_OPTIONS.CREATED_AT, direction: SORT_DIRECTIONS.DESC },
  pagination: GalleryPagination = { page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.DEFAULT_LIMIT }
): Promise<{
  data: GalleryItem[];
  count: number | null;
  error: string | null;
}> {
  try {
    const query = buildGalleryQuery(filters, sort, pagination);
    const { data, count, error } = await query;

    if (error) {
      return { data: [], count: null, error: error.message };
    }

    // Transform data
    const transformedData: GalleryItem[] = (data || []).map(item => ({
      ...item,
      metadata_obj: typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata,
    }));

    return {
      data: transformedData,
      count,
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      count: null,
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

/**
 * Search with advanced options
 */
export async function advancedSearch(
  filters: GalleryFilter & {
    min_size?: number;
    max_size?: number;
    min_width?: number;
    min_height?: number;
    has_metadata?: boolean;
    has_tags?: boolean;
  } = {},
  sort: GallerySort = { field: SORT_OPTIONS.CREATED_AT, direction: SORT_DIRECTIONS.DESC },
  pagination: GalleryPagination = { page: PAGINATION.DEFAULT_PAGE, limit: PAGINATION.DEFAULT_LIMIT }
) {
  const baseQuery = buildGalleryQuery(filters, sort, pagination);

  // Apply advanced filters after initial query
  let { data, count, error } = await baseQuery;

  if (error) {
    return { data: [], count: null, error: error.message };
  }

  // Filter berdasarkan ukuran file
  if (filters.min_size || filters.max_size) {
    data = data?.filter(item => {
      const size = item.metadata?.file_size || 0;
      if (filters.min_size && size < filters.min_size) return false;
      if (filters.max_size && size > filters.max_size) return false;
      return true;
    });
  }

  // Filter berdasarkan dimensi
  if (filters.min_width || filters.min_height) {
    data = data?.filter(item => {
      const dims = item.metadata?.dimensions;
      if (!dims) return false;
      if (filters.min_width && dims.width < filters.min_width) return false;
      if (filters.min_height && dims.height < filters.min_height) return false;
      return true;
    });
  }

  // Filter item dengan metadata
  if (filters.has_metadata) {
    data = data?.filter(item => item.metadata && Object.keys(item.metadata).length > 0);
  }

  // Filter item dengan tags
  if (filters.has_tags) {
    data = data?.filter(item => item.tags && item.tags.length > 0);
  }

  const transformedData: GalleryItem[] = (data || []).map(item => ({
    ...item,
    metadata_obj: typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata,
  }));

  return {
    data: transformedData,
    count: data?.length || 0,
    error: null,
  };
}

/**
 * Search suggestions
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 5
): Promise<string[]> {
  if (!query || query.length < 2) return [];

  try {
    // Cari di titles
    const { data: titleData } = await supabaseClient
      .from('gallery_items')
      .select('title')
      .ilike('title', `%${query}%`)
      .limit(limit);

    // Cari di tags
    const { data: tagData } = await supabaseClient
      .from('gallery_items')
      .select('tags')
      .contains('tags', [query])
      .limit(limit);

    const suggestions = new Set<string>();

    titleData?.forEach(item => {
      if (item.title) suggestions.add(item.title);
    });

    tagData?.forEach(item => {
      item.tags?.forEach(tag => suggestions.add(tag));
    });

    return Array.from(suggestions).slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Filter statistics
 */
export async function getFilterStats(): Promise<{
  categories: Record<string, number>;
  statuses: Record<string, number>;
  totalSize: number;
  totalCount: number;
}> {
  try {
    // Get all items for statistics
    const { data, error } = await supabaseClient
      .from('gallery_items')
      .select('category, status, metadata');

    if (error) {
      throw error;
    }

    const categories: Record<string, number> = {};
    const statuses: Record<string, number> = {};
    let totalSize = 0;
    let totalCount = data?.length || 0;

    data?.forEach(item => {
      // Count categories
      if (item.category) {
        categories[item.category] = (categories[item.category] || 0) + 1;
      }

      // Count statuses
      if (item.status) {
        statuses[item.status] = (statuses[item.status] || 0) + 1;
      }

      // Sum file sizes
      if (item.metadata?.file_size) {
        totalSize += item.metadata.file_size;
      }
    });

    return {
      categories,
      statuses,
      totalSize,
      totalCount,
    };
  } catch {
    return {
      categories: {},
      statuses: {},
      totalSize: 0,
      totalCount: 0,
    };
  }
}

/**
 * Filter by date range
 */
export async function filterByDateRange(
  startDate: string,
  endDate: string,
  sort: GallerySort = { field: SORT_OPTIONS.CREATED_AT, direction: SORT_DIRECTIONS.DESC }
) {
  return searchGallery(
    { date_from: startDate, date_to: endDate },
    sort,
    { page: 1, limit: 1000 } // Ambil semua dalam rentang
  );
}

/**
 * Search by metadata field
 */
export async function searchByMetadata(
  field: string,
  value: any,
  exact: boolean = false
): Promise<GalleryItem[]> {
  try {
    let query = supabaseClient
      .from('gallery_items')
      .select('*')
      .eq('metadata->>' + field, exact ? value : `%${value}%`);

    const { data, error } = await query;

    if (error) {
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      metadata_obj: typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata,
    }));
  } catch {
    return [];
  }
}

/**
 * Search with fuzzy matching
 */
export function fuzzySearch(items: GalleryItem[], query: string): GalleryItem[] {
  if (!query) return items;

  const lowerQuery = query.toLowerCase();
  
  return items.filter(item => {
    const title = (item.title || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const tags = (item.tags || []).join(' ').toLowerCase();
    const category = (item.category || '').toLowerCase();

    // Simple fuzzy matching
    return (
      title.includes(lowerQuery) ||
      description.includes(lowerQuery) ||
      tags.includes(lowerQuery) ||
      category.includes(lowerQuery) ||
      // Check for partial matches
      title.split(' ').some(word => word.startsWith(lowerQuery)) ||
      tags.split(' ').some(word => word.startsWith(lowerQuery))
    );
  });
}

/**
 * Search with relevance scoring
 */
export function searchWithRelevance(
  items: GalleryItem[],
  query: string
): Array<GalleryItem & { relevance: number }> {
  if (!query) return items.map(item => ({ ...item, relevance: 0 }));

  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(' ').filter(w => w.length > 2);

  return items
    .map(item => {
      let score = 0;

      // Exact title match
      if (item.title?.toLowerCase().includes(lowerQuery)) score += 10;

      // Word matches in title
      words.forEach(word => {
        if (item.title?.toLowerCase().includes(word)) score += 3;
      });

      // Exact description match
      if (item.description?.toLowerCase().includes(lowerQuery)) score += 5;

      // Word matches in description
      words.forEach(word => {
        if (item.description?.toLowerCase().includes(word)) score += 2;
      });

      // Tag matches
      item.tags?.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (tagLower.includes(lowerQuery)) score += 4;
        words.forEach(word => {
          if (tagLower.includes(word)) score += 1;
        });
      });

      // Category match
      if (item.category?.toLowerCase().includes(lowerQuery)) score += 3;

      return { ...item, relevance: score };
    })
    .filter(item => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance);
}

/**
 * Search with filters and pagination
 */
export async function searchWithFilters(
  searchTerm: string,
  filters: GalleryFilter,
  sort: GallerySort,
  pagination: GalleryPagination
) {
  // Add search to filters
  const combinedFilters = {
    ...filters,
    search_query: searchTerm,
  };

  return searchGallery(combinedFilters, sort, pagination);
}

/**
 * Get popular tags
 */
export async function getPopularTags(limit: number = 10): Promise<Array<{ tag: string; count: number }>> {
  try {
    const { data, error } = await supabaseClient
      .from('gallery_items')
      .select('tags');

    if (error) {
      return [];
    }

    const tagCounts: Record<string, number> = {};

    data?.forEach(item => {
      item.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Search with date aggregation
 */
export async function searchWithDateAggregation(
  filters: GalleryFilter,
  groupBy: 'day' | 'week' | 'month' | 'year' = 'month'
) {
  const { data, error } = await searchGallery(filters);

  if (error || !data) {
    return [];
  }

  const grouped: Record<string, GalleryItem[]> = {};

  data.forEach(item => {
    if (!item.created_at) return;

    const date = new Date(item.created_at);
    let key: string;

    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString();
    }

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return Object.entries(grouped)
    .map(([date, items]) => ({ date, items, count: items.length }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Search with size aggregation
 */
export async function searchWithSizeAggregation(
  filters: GalleryFilter,
  ranges: Array<{ min: number; max: number; label: string }> = [
    { min: 0, max: 1024 * 1024, label: '< 1MB' },
    { min: 1024 * 1024, max: 5 * 1024 * 1024, label: '1-5MB' },
    { min: 5 * 1024 * 1024, max: 10 * 1024 * 1024, label: '5-10MB' },
    { min: 10 * 1024 * 1024, max: Infinity, label: '> 10MB' },
  ]
) {
  const { data, error } = await searchGallery(filters);

  if (error || !data) {
    return [];
  }

  const grouped: Record<string, GalleryItem[]> = {};

  data.forEach(item => {
    const size = item.metadata?.file_size || 0;
    const range = ranges.find(r => size >= r.min && size < r.max);

    if (range) {
      if (!grouped[range.label]) grouped[range.label] = [];
      grouped[range.label].push(item);
    }
  });

  return Object.entries(grouped).map(([label, items]) => ({
    label,
    items,
    count: items.length,
    totalSize: items.reduce((sum, item) => sum + (item.metadata?.file_size || 0), 0),
  }));
}

/**
 * Search with category breakdown
 */
export async function searchWithCategoryBreakdown(
  filters: GalleryFilter
) {
  const { data, error } = await searchGallery(filters);

  if (error || !data) {
    return [];
  }

  const grouped: Record<string, GalleryItem[]> = {};

  data.forEach(item => {
    const category = item.category || 'uncategorized';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(item);
  });

  return Object.entries(grouped)
    .map(([category, items]) => ({
      category,
      items,
      count: items.length,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Search with tag breakdown
 */
export async function searchWithTagBreakdown(
  filters: GalleryFilter,
  limit: number = 10
) {
  const { data, error } = await searchGallery(filters);

  if (error || !data) {
    return [];
  }

  const tagMap: Record<string, GalleryItem[]> = {};

  data.forEach(item => {
    item.tags?.forEach(tag => {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(item);
    });
  });

  return Object.entries(tagMap)
    .map(([tag, items]) => ({
      tag,
      items,
      count: items.length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Search with status breakdown
 */
export async function searchWithStatusBreakdown(
  filters: GalleryFilter
) {
  const { data, error } = await searchGallery(filters);

  if (error || !data) {
    return [];
  }

  const grouped: Record<string, GalleryItem[]> = {};

  data.forEach(item => {
    const status = item.status || 'unknown';
    if (!grouped[status]) grouped[status] = [];
    grouped[status].push(item);
  });

  return Object.entries(grouped).map(([status, items]) => ({
    status,
    items,
    count: items.length,
  }));
}

/**
 * Search with partner breakdown
 */
export async function searchWithPartnerBreakdown(
  filters: GalleryFilter
) {
  const { data, error } = await searchGallery(filters);

  if (error || !data) {
    return [];
  }

  const grouped: Record<string, GalleryItem[]> = {};

  data.forEach(item => {
    const partner = item.partner_id || 'no-partner';
    if (!grouped[partner]) grouped[partner] = [];
    grouped[partner].push(item);
  });

  return Object.entries(grouped).map(([partner, items]) => ({
    partner,
    items,
    count: items.length,
  }));
}

/**
 * Search with event breakdown
 */
export async function searchWithEventBreakdown(
  filters: GalleryFilter
) {
  const { data, error } = await searchGallery(filters);

  if (error || !data) {
    return [];
  }

  const grouped: Record<string, GalleryItem[]> = {};

  data.forEach(item => {
    const event = item.event_id || 'no-event';
    if (!grouped[event]) grouped[event] = [];
    grouped[event].push(item);
  });

  return Object.entries(grouped).map(([event, items]) => ({
    event,
    items,
    count: items.length,
  }));
}

/**
 * Search with time range analysis
 */
export async function searchWithTimeAnalysis(
  filters: GalleryFilter,
  timeRange: 'today' | 'week' | 'month' | 'year' | 'all'
) {
  const now = new Date();
  let startDate: string;

  switch (timeRange) {
    case 'today':
      startDate = new Date(now.setDate(now.getDate() - 1)).toISOString();
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      break;
    default:
      startDate = '1970-01-01T00:00:00.000Z';
  }

  return searchGallery({
    ...filters,
    date_from: startDate,
  });
}

/**
 * Search with pagination info
 */
export async function searchWithPagination(
  filters: GalleryFilter,
  sort: GallerySort,
  pagination: GalleryPagination
) {
  const result = await searchGallery(filters, sort, pagination);

  if (result.error) {
    return {
      data: [],
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: 0,
        total_pages: 0,
      },
      error: result.error,
    };
  }

  const total = result.count || 0;
  const total_pages = Math.ceil(total / pagination.limit);

  return {
    data: result.data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      total_pages,
    },
    error: null,
  };
}

/**
 * Search with live suggestions
 */
export function createLiveSearch(
  onUpdate: (results: GalleryItem[]) => void,
  delay: number = 300
) {
  let timeout: NodeJS.Timeout | null = null;

  return (filters: GalleryFilter, sort: GallerySort, pagination: GalleryPagination) => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(async () => {
      const result = await searchGallery(filters, sort, pagination);
      if (!result.error) {
        onUpdate(result.data);
      }
    }, delay);
  };
}

/**
 * Search with debounced filter updates
 */
export function createDebouncedSearch(
  onUpdate: (results: { data: GalleryItem[]; count: number | null }) => void,
  delay: number = 300
) {
  let timeout: NodeJS.Timeout | null = null;

  return async (
    filters: GalleryFilter,
    sort: GallerySort,
    pagination: GalleryPagination
  ) => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(async () => {
      const result = await searchGallery(filters, sort, pagination);
      onUpdate({ data: result.data, count: result.count });
    }, delay);
  };
}