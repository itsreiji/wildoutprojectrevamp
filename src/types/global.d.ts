// Global type declarations for the project

// Import basic TypeScript types
/// <reference lib="ES2015" />
/// <reference lib="DOM" />

// Third-party modules without types
declare module '*.png' {
  const value: string;
  export default value;
}

// Global interfaces
interface Window {
  confirm: (message: string) => boolean;
}

// Extend globalThis to include Date constructor for TypeScript
declare const Date: DateConstructor;

// Global functions that should be available
declare function parseInt(string: string, radix?: number): number;
declare function parseFloat(string: string): number;
declare function isNaN(number: number): boolean;
declare function isFinite(number: number): boolean;

// Utility types that should be available
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Array<T> = T[];