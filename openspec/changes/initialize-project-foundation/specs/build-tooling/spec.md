# Build Tooling Specification

## ADDED Requirements

### Requirement: Vite Build System with SWC
The project SHALL use Vite as the build tool with the SWC plugin for fast development and production builds.

#### Scenario: Development server starts successfully
- **WHEN** developer runs `npm run dev`
- **THEN** Vite dev server starts on port 3000
- **AND** browser automatically opens to `http://localhost:3000`
- **AND** hot module replacement (HMR) is functional

#### Scenario: Production build completes
- **WHEN** developer runs `npm run build`
- **THEN** optimized assets are generated in `build/` directory
- **AND** build completes without errors
- **AND** output includes minified JS and CSS files

#### Scenario: Path aliases resolve correctly
- **WHEN** code imports using `@/` prefix
- **THEN** Vite resolves the import to `./src/` directory
- **AND** no import errors occur during build or dev server

### Requirement: TypeScript Strict Mode
The project SHALL use TypeScript with strict mode enabled to catch type errors at compile time.

#### Scenario: Strict type checking catches invalid code
- **WHEN** developer writes code with type mismatch
- **THEN** TypeScript compiler reports error
- **AND** build/dev server fails until error is fixed

#### Scenario: Unused variables are flagged
- **WHEN** developer declares variable without using it
- **THEN** TypeScript compiler reports `noUnusedLocals` error
- **AND** code must be cleaned up before build succeeds

#### Scenario: JSX syntax compiles correctly
- **WHEN** React component uses JSX syntax
- **THEN** TypeScript transforms JSX to `react-jsx` runtime
- **AND** no manual React import is required in components

### Requirement: ESLint Code Quality Enforcement
The project SHALL use ESLint with plugins for React, TypeScript, React Hooks, and Prettier to enforce code quality standards.

#### Scenario: ESLint detects rule violations
- **WHEN** developer writes code violating configured rules
- **THEN** ESLint reports error or warning
- **AND** provides context on rule violation
- **AND** suggests fix if auto-fixable

#### Scenario: Prettier formatting is enforced
- **WHEN** code does not match Prettier formatting
- **THEN** ESLint reports `prettier/prettier` error
- **AND** developer must format code to pass linting

#### Scenario: React Hooks rules are validated
- **WHEN** React Hooks are used incorrectly
- **THEN** ESLint React Hooks plugin reports violation
- **AND** explains proper Hook usage pattern

#### Scenario: Unused TypeScript variables are caught
- **WHEN** TypeScript variable is declared but not used
- **THEN** ESLint reports error with `@typescript-eslint/no-unused-vars`
- **AND** allows underscore-prefixed names to be ignored

### Requirement: Tailwind CSS Dark Theme Configuration
The project SHALL use Tailwind CSS v4 with a dark theme using background color `#0a0a0a` and primary color `#E93370`.

#### Scenario: Dark theme styles apply correctly
- **WHEN** page loads in browser
- **THEN** background color is `#0a0a0a` (dark gray/black)
- **AND** primary color `#E93370` (pink) is used for accent elements
- **AND** all CSS custom properties are available

#### Scenario: Tailwind v4 @theme inline directive works
- **WHEN** `src/styles/globals.css` is processed
- **THEN** Tailwind v4 compiles CSS with inline theme variables
- **AND** custom properties from `:root` and `.dark` are accessible
- **AND** utility classes reference theme colors correctly

#### Scenario: Utility classes apply styling
- **WHEN** component uses Tailwind class like `bg-[#E93370]`
- **THEN** element displays with correct pink background
- **AND** no console warnings about missing classes
- **AND** styles are compiled into final CSS output

### Requirement: Development Environment Setup
The project SHALL provide clear documentation for setting up the development environment and maintaining code quality standards.

#### Scenario: New developer can set up project
- **WHEN** new developer follows README instructions
- **THEN** all dependencies install successfully
- **AND** dev server starts without errors
- **AND** build completes successfully
- **AND** linting passes with zero errors

#### Scenario: Code style is consistent across team
- **WHEN** multiple developers contribute code
- **THEN** ESLint and Prettier enforce consistent formatting
- **AND** TypeScript strict mode catches type errors
- **AND** all code follows documented style guidelines

#### Scenario: Editor integration works
- **WHEN** developer uses VS Code or similar editor
- **THEN** ESLint and Prettier auto-format on save
- **AND** TypeScript errors show inline in editor
- **AND** recommended extensions are documented

