// utils/security.ts
import CryptoJS from 'crypto-js';

// Rate limiting implementation
interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitState>();

export const checkRateLimit = (key: string, maxAttempts = 5): { allowed: boolean; timeRemaining?: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    // First attempt, allow
    return { allowed: true };
  }

  if (now > record.resetTime) {
    // Window has passed, reset
    rateLimitStore.delete(key);
    return { allowed: true };
  }

  if (record.attempts >= maxAttempts) {
    // Rate limit exceeded
    return {
      allowed: false,
      timeRemaining: record.resetTime - now,
    };
  }

  return { allowed: true };
};

export const recordRateLimitAttempt = (key: string, windowMs = 900000) => {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window or no previous attempt
    rateLimitStore.set(key, {
      attempts: 1,
      lastAttempt: now,
      resetTime: now + windowMs,
    });
  } else {
    // Increment attempt count
    rateLimitStore.set(key, {
      ...record,
      attempts: record.attempts + 1,
      lastAttempt: now,
    });
  }
};

export const clearRateLimit = (key: string) => {
  rateLimitStore.delete(key);
};

// CSRF token generation
export const generateCSRFToken = (secret: string) => {
  const timestamp = Date.now();
  const token = `${timestamp}.${Math.random().toString(36).substring(2, 15)}`;
  const signature = CryptoJS.HmacSHA256(`${token}.${secret}`, secret).toString();

  return {
    token,
    timestamp,
    signature,
  };
};

export const verifyCSRFToken = (token: string, timestamp: number, signature: string, secret: string): boolean => {
  // Check if token is too old (15 minutes)
  if (Date.now() - timestamp > 900000) {
    return false;
  }

  const expectedSignature = CryptoJS.HmacSHA256(`${token}.${secret}`, secret).toString();
  return signature === expectedSignature;
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  // Remove potentially dangerous characters/scripts
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .trim();
};

// Enhanced email validation
export const validateSecureEmail = (email: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Basic format validation
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
    return { isValid: false, errors };
  }

  // Length validation
  if (email.length > 254) {
    errors.push('Email is too long');
  }

  // Format validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  // Check for dangerous patterns
  if (email.includes('\'') || email.includes('"') || email.includes('<') || email.includes('>')) {
    errors.push('Email contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Password validation
export const validatePasswordComplexity = (password: string) => {
  const feedback: string[] = [];

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    feedback.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Password must contain at least one special character');
  }

  return {
    isValid: feedback.length === 0,
    feedback,
  };
};
