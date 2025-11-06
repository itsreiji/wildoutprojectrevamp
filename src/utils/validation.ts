/**
 * Validate email format using regex
 * @param email - Email string to validate
 * @returns True if email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format using regex
 * @param url - URL string to validate
 * @returns True if URL is valid, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate Indonesian phone number format
 * @param phone - Phone number string to validate
 * @returns True if phone is valid Indonesian format, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  // Indonesian phone number format: +62 8xx-xxxx-xxxx or 08xx-xxxx-xxxx
  const phoneRegex = /^(\+62|62)?[ -]?8[1-9]\d{1,2}[ -]?\d{4,8}$/;
  return phoneRegex.test(phone);
};
