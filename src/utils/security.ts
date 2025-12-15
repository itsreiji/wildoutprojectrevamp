import CryptoJS from 'crypto-js';

// Secure password hashing configuration
export const HASH_CONFIG = {
  ITERATIONS: 100000,
  KEY_SIZE: 256,
  SALT_SIZE: 16,
  ALGORITHM: 'SHA-256'
} as const;

// Password hash result interface
export interface PasswordHashResult {
  hash: string;
  salt: string;
  iterations: number;
  algorithm: string;
}

// CSRF protection interface
export interface CSRFProtection {
  token: string;
  timestamp: number;
  signature: string;
}

/**
 * Generate a cryptographically secure salt
 */
export const generateSalt = (length: number = HASH_CONFIG.SALT_SIZE): string => {
  if (typeof window === 'undefined') {
    // Fallback for SSR
    return Math.random().toString(36).substring(2, 2 + length);
  }

  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash password using PBKDF2 with SHA-256
 */
export const hashPassword = async (
  password: string,
  salt?: string,
  iterations: number = HASH_CONFIG.ITERATIONS
): Promise<PasswordHashResult> => {
  const useSalt = salt || generateSalt();

  if (typeof window === 'undefined') {
    // Fallback for SSR using crypto-js
    const derivedKey = CryptoJS.PBKDF2(password, useSalt, {
      keySize: HASH_CONFIG.KEY_SIZE / 32,
      iterations,
      hasher: CryptoJS.algo.SHA256
    });

    return {
      hash: derivedKey.toString(CryptoJS.enc.Hex),
      salt: useSalt,
      iterations,
      algorithm: HASH_CONFIG.ALGORITHM
    };
  }

  // Use Web Crypto API for better security
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(useSalt),
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    HASH_CONFIG.KEY_SIZE
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    hash: hashHex,
    salt: useSalt,
    iterations,
    algorithm: HASH_CONFIG.ALGORITHM
  };
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (
  password: string,
  hash: string,
  salt: string,
  iterations: number = HASH_CONFIG.ITERATIONS
): Promise<boolean> => {
  const result = await hashPassword(password, salt, iterations);
  return result.hash === hash;
};

/**
 * Generate CSRF token with signature
 */
export const generateCSRFToken = (secret: string): CSRFProtection => {
  const token = crypto.randomUUID();
  const timestamp = Date.now();
  const data = `${token}:${timestamp}`;

  // Create signature using HMAC-SHA256
  // CryptoJS accepts string directly for the secret key
  const signature = CryptoJS.HmacSHA256(data, secret).toString();

  return {
    token,
    timestamp,
    signature
  };
};

/**
 * Verify CSRF token
 */
export const verifyCSRFToken = (
  token: string,
  timestamp: number,
  signature: string,
  secret: string,
  maxAge: number = 3600000 // 1 hour
): boolean => {
  const now = Date.now();

  // Check if token is expired
  if (now - timestamp > maxAge) {
    return false;
  }

  // Verify signature
  const data = `${token}:${timestamp}`;
  const expectedSignature = CryptoJS.HmacSHA256(data, secret).toString();

  return signature === expectedSignature;
};

/**
 * Create secure headers for API requests
 */
export const createSecureHeaders = (csrfToken?: CSRFProtection): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': '1.0.0'
  };

  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken.token;
    headers['X-CSRF-Timestamp'] = csrfToken.timestamp.toString();
    headers['X-CSRF-Signature'] = csrfToken.signature;
  }

  return headers;
};

/**
 * Validate password complexity
 */
export const validatePasswordComplexity = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  else feedback.push('Password must be at least 8 characters long');

  // Character variety checks
  const checks = [
    { regex: /[a-z]/, message: 'Add lowercase letters' },
    { regex: /[A-Z]/, message: 'Add uppercase letters' },
    { regex: /[0-9]/, message: 'Add numbers' },
    { regex: /[^a-zA-Z0-9]/, message: 'Add special characters' }
  ];

  checks.forEach(check => {
    if (check.regex.test(password)) {
      score += 1;
    } else {
      feedback.push(check.message);
    }
  });

  // Common patterns check
  const commonPatterns = [
    /(.)\1{2,}/, // Repeating characters
    /123456/,
    /abcdef/,
    /qwerty/,
    /password/i,
    /admin/i
  ];

  commonPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      score -= 1;
      feedback.push('Avoid common patterns and sequences');
    }
  });

  // Dictionary words check (basic)
  const commonWords = ['password', 'admin', 'user', 'test', 'welcome'];
  const lowerPassword = password.toLowerCase();
  commonWords.forEach(word => {
    if (lowerPassword.includes(word)) {
      score -= 1;
      feedback.push('Avoid using common words');
    }
  });

  // Ensure score is within bounds
  score = Math.max(0, Math.min(5, score));

  return {
    isValid: score >= 3,
    score,
    feedback
  };
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate email format with additional security checks
 */
export const validateSecureEmail = (email: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  // Length checks
  if (email.length > 254) {
    errors.push('Email address is too long');
  }

  // Disallow certain characters
  const dangerousChars = /[<>{}[\]\\]/;
  if (dangerousChars.test(email)) {
    errors.push('Email contains invalid characters');
  }

  // Disallow common disposable email domains
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    errors.push('Disposable email addresses are not allowed');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate secure random string for tokens
 */
export const generateSecureToken = (length: number = 32): string => {
  if (typeof window === 'undefined') {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Rate limiting check with exponential backoff
 */
export const checkRateLimit = (
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000,
  blockDurationMs: number = 30 * 60 * 1000
): { allowed: boolean; timeRemaining?: number; attemptsRemaining?: number } => {
  if (typeof window === 'undefined') {
    return { allowed: true, attemptsRemaining: maxAttempts };
  }

  try {
    const now = Date.now();
    const storageKey = `rate_limit_${key}`;
    const stored = localStorage.getItem(storageKey);

    let info = { attempts: 0, lastAttempt: 0, blockedUntil: 0 };

    if (stored) {
      try {
        info = JSON.parse(stored);
      } catch {
        // Ignore parse errors
      }
    }

    // Check if currently blocked
    if (info.blockedUntil && now < info.blockedUntil) {
      return {
        allowed: false,
        timeRemaining: info.blockedUntil - now
      };
    }

    // Reset window if enough time has passed
    if (now - info.lastAttempt > windowMs) {
      info = { attempts: 0, lastAttempt: 0, blockedUntil: 0 };
    }

    // Check if limit exceeded
    if (info.attempts >= maxAttempts) {
      // Block for exponentially increasing duration
      const blockDuration = Math.min(
        blockDurationMs * Math.pow(2, Math.floor(info.attempts / maxAttempts)),
        24 * 60 * 60 * 1000 // Max 24 hours
      );

      info.blockedUntil = now + blockDuration;
      localStorage.setItem(storageKey, JSON.stringify(info));

      return {
        allowed: false,
        timeRemaining: blockDuration
      };
    }

    return {
      allowed: true,
      attemptsRemaining: maxAttempts - info.attempts
    };
  } catch (error) {
    console.warn('Rate limit check failed:', error);
    return { allowed: true, attemptsRemaining: maxAttempts };
  }
};

/**
 * Record rate limit attempt
 */
export const recordRateLimitAttempt = (key: string): void => {
  if (typeof window === 'undefined') return;

  try {
    const now = Date.now();
    const storageKey = `rate_limit_${key}`;
    const stored = localStorage.getItem(storageKey);

    let info = { attempts: 0, lastAttempt: 0, blockedUntil: 0 };

    if (stored) {
      try {
        info = JSON.parse(stored);
      } catch {
        // Ignore parse errors
      }
    }

    // Reset window if enough time has passed
    if (now - info.lastAttempt > 15 * 60 * 1000) {
      info = { attempts: 1, lastAttempt: now, blockedUntil: 0 };
    } else {
      info.attempts += 1;
      info.lastAttempt = now;
    }

    localStorage.setItem(storageKey, JSON.stringify(info));
  } catch (error) {
    console.warn('Failed to record rate limit attempt:', error);
  }
};

/**
 * Clear rate limit for a key
 */
export const clearRateLimit = (key: string): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(`rate_limit_${key}`);
  } catch (error) {
    console.warn('Failed to clear rate limit:', error);
  }
};