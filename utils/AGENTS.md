# Utils Directory - AGENTS.md

## 1. Package Identity
- **Scope**: Standalone utility functions, helpers, and validation logic.
- **Tech**: TypeScript (Pure functions).

## 2. Patterns & Conventions
- **Purity**:
    - ✅ DO: Keep functions pure where possible (input -> output).
    - ❌ DON'T: hold state or side effects here (use Hooks or Services).
- **Organization**:
    - Group by domain (e.g., `authValidation.ts`, `security.ts`).

### Examples
- **Validation**: `utils/authValidation.ts`
- **Security**: `utils/security.ts`

## 3. Touch Points
- **Lib**: `lib/utils.ts` is often for UI helpers (cn), while `utils/` is for logic helpers.
- **Services**: Services often import these utilities.

## 4. JIT Index Hints
- Find utilities: `glob "utils/*.ts"`
