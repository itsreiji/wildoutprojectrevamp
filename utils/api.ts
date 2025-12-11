// utils/api.ts
// API rate limiting and security utilities

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting store
interface RateLimitRecord {
  count: number;
  lastReset: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Rate limiting middleware for API routes
 * @param request Next.js request object
 * @param maxRequests Maximum allowed requests per window
 * @param windowMs Time window in milliseconds
 * @returns NextResponse or null if request should be allowed
 */
export function applyRateLimiting(
  request: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 60000,
): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const key = `rate-limit:${ip}`;
  const now = Date.now();

  // Initialize or reset rate limit record
  let record = rateLimitStore.get(key);
  if (!record || now - record.lastReset > windowMs) {
    record = {
      count: 1,
      lastReset: now,
    };
    rateLimitStore.set(key, record);
    return null; // Allow request
  }

  // Check if rate limit exceeded
  if (record.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests, please try again later' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((windowMs - (now - record.lastReset)) / 1000).toString(),
        },
      },
    );
  }

  // Increment counter
  record.count++;
  rateLimitStore.set(key, record);
  return null; // Allow request
}

/**
 * Validate API request headers
 * @param request Next.js request object
 * @returns Validation result
 */
export function validateRequestHeaders(request: NextRequest): { valid: boolean; error?: string } {
  const contentType = request.headers.get('content-type');

  // For POST/PUT requests, require Content-Type header
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    if (!contentType?.includes('application/json')) {
      return {
        valid: false,
        error: 'Content-Type header must be application/json',
      };
    }
  }

  return { valid: true };
}

/**
 * Sanitize API response to remove sensitive data
 * @param data Response data
 * @returns Sanitized data
 */
export function sanitizeApiResponse(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };

  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.access_token;
  delete sanitized.refresh_token;
  delete sanitized.api_key;
  delete sanitized.secret;

  // Recursively sanitize nested objects
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeApiResponse(sanitized[key]);
    }
  });

  return sanitized;
}
