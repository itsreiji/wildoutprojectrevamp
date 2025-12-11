import { beforeEach, describe, expect, it } from 'vitest';
import { sanitizeApiResponse } from '../utils/api';
import {
  checkRateLimit,
  clearRateLimit as clearLoginAttempts,
  generateCSRFToken,
  recordRateLimitAttempt,
  sanitizeInput,
  validatePasswordComplexity as validatePassword,
  validateSecureEmail,
  verifyCSRFToken
} from '../utils/security';

describe('Security Utilities Tests', () => {
  describe('Rate Limiting', () => {
    const testKey = 'test-ip';

    beforeEach(() => {
      // Clear rate limit before each test
      clearLoginAttempts(testKey);
    });

    it('should allow requests within limit', () => {
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(testKey, 5);
        expect(result.allowed).toBe(true);
        recordRateLimitAttempt(testKey);
      }
    });

    it('should block requests when limit exceeded', () => {
      // Fill up the limit
      for (let i = 0; i < 5; i++) {
        recordRateLimitAttempt(testKey);
      }

      // Next request should be blocked
      const result = checkRateLimit(testKey, 5);
      expect(result.allowed).toBe(false);
      expect(result.timeRemaining).toBeGreaterThan(0);
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPassword = 'StrongP@ssw0rd123!';
      const result = validatePassword(strongPassword);
      expect(result.isValid).toBe(true);
      expect(result.feedback.length).toBe(0);
    });

    it('should reject weak passwords', () => {
      const weakPassword = 'password';
      const result = validatePassword(weakPassword);
      expect(result.isValid).toBe(false);
      expect(result.feedback.length).toBeGreaterThan(0);
      // Check that feedback contains at least one validation message
      const allFeedback = result.feedback.join(' ');
      expect(allFeedback).toMatch(/characters|uppercase|number|special/);
    });
  });

  describe('Email Validation', () => {
    it('should validate secure email formats', () => {
      const validEmail = 'user@example.com';
      const result = validateSecureEmail(validEmail);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid email formats', () => {
      const invalidEmail = 'not-an-email';
      const result = validateSecureEmail(invalidEmail);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize HTML input', () => {
      const dirtyInput = '<script>alert("xss")</script>Safe text';
      const sanitized = sanitizeInput(dirtyInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Safe text');
    });
  });

  describe('CSRF Protection', () => {
    const secret = 'test-secret';

    it('should generate and verify CSRF tokens', () => {
      const { token, timestamp, signature } = generateCSRFToken(secret);
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThan(10);

      // Should verify valid token
      expect(verifyCSRFToken(token, timestamp, signature, secret)).toBe(true);

      // Should reject invalid token
      expect(verifyCSRFToken('invalid-token', Date.now(), 'invalid-sig', secret)).toBe(false);
    });

    it('should reject expired CSRF tokens', () => {
      const { token, signature } = generateCSRFToken(secret);
      const expiredTimestamp = Date.now() - 1000000; // 16+ minutes ago

      expect(verifyCSRFToken(token, expiredTimestamp, signature, secret)).toBe(false);
    });
  });
});

describe('API Utilities Tests', () => {
  describe('Response Sanitization', () => {
    it('should remove sensitive data from API responses', () => {
      const sensitiveData = {
        id: 1,
        name: 'John Doe',
        password: 'secret123',
        access_token: 'token123',
        email: 'john@example.com',
        profile: {
          api_key: 'key123',
          safe_data: 'keep this'
        }
      };

      const sanitized = sanitizeApiResponse(sensitiveData);

      expect(sanitized.password).toBeUndefined();
      expect(sanitized.access_token).toBeUndefined();
      expect(sanitized.profile.api_key).toBeUndefined();
      expect(sanitized.name).toBe('John Doe');
      expect(sanitized.profile.safe_data).toBe('keep this');
    });

    it('should handle null and non-object inputs', () => {
      expect(sanitizeApiResponse(null)).toBeNull();
      expect(sanitizeApiResponse('string')).toBe('string');
      expect(sanitizeApiResponse(123)).toBe(123);
    });
  });
});