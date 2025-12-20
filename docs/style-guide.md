# Style Guide

## Typography

This document outlines the standardized font hierarchy and usage guidelines for the project. All typography is controlled via centralized CSS variables in `src/index.css` and mapped to Tailwind CSS utilities in `tailwind.config.ts`.

### Font Families

- **Sans (Default):** `var(--font-sans)`
  - Used for all body text, UI elements, and headings.
  - Tailwind class: `font-sans`
- **Mono:** `var(--font-mono)`
  - Used for code blocks and technical data.
  - Tailwind class: `font-mono`

### Font Weights

All font weights are mapped to CSS variables for consistency:

| Weight | CSS Variable | Tailwind Class | Usage |
|--------|--------------|----------------|-------|
| Light | `--font-weight-light` (300) | `font-light` | Minimal use for secondary text |
| Normal | `--font-weight-normal` (400) | `font-normal` | Main body text |
| Medium | `--font-weight-medium` (500) | `font-medium` | Navigation, semi-emphasis |
| Semibold | `--font-weight-semibold` (600) | `font-semibold` | Sub-headings, buttons |
| Bold | `--font-weight-bold` (700) | `font-bold` | Main headings |
| Black | `--font-weight-black` (900) | `font-black` | Hero headings, extreme emphasis |

### Font Sizes

Standardized sizes follow a modular scale:

| Size Name | CSS Variable | Tailwind Class | Value |
|-----------|--------------|----------------|-------|
| 2XS | `--text-2xs` | `text-2xs` | 10px (0.625rem) |
| XS | `--text-xs` | `text-xs` | 12px (0.75rem) |
| SM | `--text-sm` | `text-sm` | 14px (0.875rem) |
| Base | `--text-base` | `text-base` | 16px (1rem) |
| LG | `--text-lg` | `text-lg` | 18px (1.125rem) |
| XL | `--text-xl` | `text-xl` | 20px (1.25rem) |
| 2XL | `--text-2xl` | `text-2xl` | 24px (1.5rem) |
| 3XL | `--text-3xl` | `text-3xl` | 30px (1.875rem) |
| 4XL | `--text-4xl` | `text-4xl` | 36px (2.25rem) |
| 5XL | `--text-5xl` | `text-5xl` | 48px (3rem) |
| 6XL | `--text-6xl` | `text-6xl` | 60px (3.75rem) |
| 8XL | `--text-8xl` | `text-8xl` | 96px (6rem) |
| 9XL | `--text-9xl` | `text-9xl` | 128px (8rem) |

### Heading Hierarchy (WCAG AA)

Headings are pre-configured in `src/styles/globals.css` to ensure consistent visual hierarchy and accessibility:

- **H1:** `text-5xl`, `font-bold`, `line-height: 1.2`
- **H2:** `text-4xl`, `font-bold`, `line-height: 1.3`
- **H3:** `text-3xl`, `font-semibold`, `line-height: 1.4`
- **H4:** `text-2xl`, `font-semibold`, `line-height: 1.5`
- **H5:** `text-xl`, `font-semibold`
- **H6:** `text-lg`, `font-semibold`

### Best Practices

1. **Avoid Ad-hoc Styles:** Never use arbitrary values like `text-[13px]`. Use the nearest standardized scale value.
2. **Line Heights:** Use standardized line-height variables (`--text-*-line-height`) for body text to maintain vertical rhythm.
3. **Accessibility:** Ensure a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (WCAG AA).
4. **Consistency:** Prefer semantic tags (h1-h6, p) over styling generic divs with text classes where possible.
