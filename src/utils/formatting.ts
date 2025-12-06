/**
 * Format a date string or Date object into a localized format
 * @param date - Date object or date string to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Format a time string into a more readable format
 * @param time - Time string to format (e.g., "21:00 - 04:00")
 * @returns Formatted time string
 */
export const formatTime = (time: string): string => {
  // Simple formatting for time ranges
  return time;
};

/**
 * Format a currency amount with optional currency code
 * @param amount - Number to format as currency
 * @param currency - Currency code (default: 'IDR' for Indonesian Rupiah)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'IDR'): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
  
  // Replace non-breaking space with regular space for consistency
  return formatted.replace(/\u00A0/g, ' ');
};
