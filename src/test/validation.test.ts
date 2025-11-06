import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidUrl, isValidPhone } from '../utils/validation';

describe('validation utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('just-text')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate correct Indonesian phone numbers', () => {
      expect(isValidPhone('+62 812 3456 7890')).toBe(true);
      expect(isValidPhone('0812 3456 7890')).toBe(true);
      expect(isValidPhone('62812345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidPhone('+1 234 567 8901')).toBe(false);
      expect(isValidPhone('123456')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone('text')).toBe(false);
    });
  });
});
