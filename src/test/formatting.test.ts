import { describe, it, expect } from "vitest";
import { formatDate, formatTime, formatCurrency } from "../utils/formatting";

describe("formatting utilities", () => {
  describe("formatDate", () => {
    it("should format a Date object correctly", () => {
      const date = new Date("2025-11-15");
      const result = formatDate(date);
      expect(result).toBe("November 15, 2025");
    });

    it("should format a date string correctly", () => {
      const result = formatDate("2025-11-15");
      expect(result).toBe("November 15, 2025");
    });

    it("should handle invalid date strings", () => {
      const result = formatDate("invalid-date");
      expect(result).toBe("Invalid Date");
    });
  });

  describe("formatTime", () => {
    it("should return time string as-is", () => {
      const time = "21:00 - 04:00";
      const result = formatTime(time);
      expect(result).toBe("21:00 - 04:00");
    });
  });

  describe("formatCurrency", () => {
    it("should format amount with default IDR currency", () => {
      const result = formatCurrency(250000);
      expect(result).toBe("IDR 250.000");
    });

    it("should format amount with custom currency", () => {
      const result = formatCurrency(100, "USD");
      expect(result).toBe("$100");
    });

    it("should handle zero amount", () => {
      const result = formatCurrency(0);
      expect(result).toBe("IDR 0");
    });
  });
});
