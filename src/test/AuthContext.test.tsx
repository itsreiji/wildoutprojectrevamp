import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword, validatePasswordStrength, checkLoginRateLimit, recordFailedLogin, clearLoginAttempts, generateCsrfToken, validateCsrfToken } from '../utils/authValidation';
import { hashPassword, verifyPassword, sanitizeInput, validateSecureEmail, checkRateLimit, recordRateLimitAttempt, validatePasswordComplexity, generateSecureToken, clearRateLimit } from '../utils/security';

// Mock Supabase client
vi.mock('../../supabase/client', () => ({
  supabaseClient: {
    auth: {
      signInWithOAuth: vi.fn(),
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        unsubscribe: vi.fn()
      }))
    },
    rpc: vi.fn()
  }
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should validate email correctly', () => {
    // Valid email
    const validResult = validateEmail('test@example.com');
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    // Invalid email
    const invalidResult = validateEmail('invalid-email');
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toContain('Email is required');
  });

  it('should validate password correctly', () => {
    // Valid password
    const validResult = validatePassword('ValidPass123!');
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    // Invalid password - too short
    const shortResult = validatePassword('123');
    expect(shortResult.isValid).toBe(false);
    expect(shortResult.errors).toContain('Password must be at least 8 characters long');

    // Invalid password - missing uppercase
    const noUpperResult = validatePassword('validpass123!');
    expect(noUpperResult.isValid).toBe(false);
    expect(noUpperResult.errors).toContain('Password must contain at least one uppercase letter');
  });

  it('should check login rate limiting', () => {
    // Not blocked initially
    const notBlocked = checkLoginRateLimit('test@example.com');
    expect(notBlocked.isBlocked).toBe(false);

    // After multiple failed attempts
    recordFailedLogin('test@example.com');
    recordFailedLogin('test@example.com');
    recordFailedLogin('test@example.com');
    recordFailedLogin('test@example.com');
    recordFailedLogin('test@example.com');

    const blocked = checkLoginRateLimit('test@example.com');
    expect(blocked.isBlocked).toBe(true);
  });

  it('should clear login attempts on successful login', () => {
    // Record some failed attempts
    recordFailedLogin('test@example.com');
    recordFailedLogin('test@example.com');

    // Clear on successful login
    clearLoginAttempts('test@example.com');

    const result = checkLoginRateLimit('test@example.com');
    expect(result.isBlocked).toBe(false);
  });

  it('should generate and validate CSRF tokens', () => {
    const token = generateCsrfToken();

    expect(token.token).toBeDefined();
    expect(token.timestamp).toBeDefined();
    expect(token.signature).toBeDefined();

    const isValid = validateCsrfToken(token.token, token.timestamp, token.signature, 'wildout-secret');
    expect(isValid).toBe(true);

    // Invalid token
    const invalid = validateCsrfToken('invalid-token', token.timestamp, token.signature, 'wildout-secret');
    expect(invalid).toBe(false);
  });

  it('should sanitize input', () => {
    const maliciousInput = '<script>alert("xss")</script>test@example.com';
    const sanitized = sanitizeInput(maliciousInput);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
    expect(sanitized).toBe('test@example.com');
  });

  it('should validate secure email', () => {
    // Valid email
    const valid = validateSecureEmail('test@example.com');
    expect(valid.isValid).toBe(true);
    expect(valid.errors).toHaveLength(0);

    // Invalid format
    const invalid = validateSecureEmail('invalid-email');
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors).toContain('Invalid email format');

    // Too long
    const longEmail = 'a'.repeat(255) + '@example.com';
    const longResult = validateSecureEmail(longEmail);
    expect(longResult.isValid).toBe(false);
    expect(longResult.errors).toContain('Email address is too long');

    // Disposable email
    const disposable = validateSecureEmail('test@10minutemail.com');
    expect(disposable.isValid).toBe(false);
    expect(disposable.errors).toContain('Disposable email addresses are not allowed');
  });

  it('should check rate limiting', () => {
    // Not blocked initially
    const notBlocked = checkRateLimit('test_key');
    expect(notBlocked.allowed).toBe(true);
    expect(notBlocked.attemptsRemaining).toBe(5);

    // Record attempts
    recordRateLimitAttempt('test_key');
    recordRateLimitAttempt('test_key');
    recordRateLimitAttempt('test_key');
    recordRateLimitAttempt('test_key');
    recordRateLimitAttempt('test_key');

    // Should be blocked now
    const blocked = checkRateLimit('test_key');
    expect(blocked.allowed).toBe(false);
  });

  it('should hash password securely', async () => {
    const password = 'TestPassword123!';
    const result = await hashPassword(password);

    expect(result.hash).toBeDefined();
    expect(result.salt).toBeDefined();
    expect(result.iterations).toBe(100000);
    expect(result.algorithm).toBe('SHA-256');

    // Hash should be different each time due to salt
    const result2 = await hashPassword(password);
    expect(result.hash).not.toBe(result2.hash);
  });

  it('should verify password correctly', async () => {
    const password = 'TestPassword123!';
    const hashResult = await hashPassword(password);

    const isValid = await verifyPassword(password, hashResult.hash, hashResult.salt);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword('WrongPassword123!', hashResult.hash, hashResult.salt);
    expect(isInvalid).toBe(false);
  });

  it('should validate password complexity', () => {
    // Strong password
    const strong = validatePasswordComplexity('StrongPass123!');
    expect(strong.isValid).toBe(true);
    expect(strong.score).toBeGreaterThan(2);

    // Weak password
    const weak = validatePasswordComplexity('weak');
    expect(weak.isValid).toBe(false);
    expect(weak.score).toBeLessThan(3);
  });

  it('should generate secure tokens', () => {
    const token1 = generateSecureToken(32);
    const token2 = generateSecureToken(32);

    expect(token1).toBeDefined();
    expect(token2).toBeDefined();
    expect(token1).not.toBe(token2);
    // generateSecureToken returns hex string, so 32 bytes = 64 hex chars
    expect(token1.length).toBe(64);
    expect(token2.length).toBe(64);
  });

  it('should clear rate limit', () => {
    // Record some attempts
    recordRateLimitAttempt('test_key');
    recordRateLimitAttempt('test_key');

    // Should be blocked
    let result = checkRateLimit('test_key');
    expect(result.allowed).toBe(false);

    // Clear rate limit
    clearRateLimit('test_key');

    // Should not be blocked anymore
    result = checkRateLimit('test_key');
    expect(result.allowed).toBe(true);
  });
});