# Services Directory - AGENTS.md

## 1. Package Identity
- **Scope**: Business logic, complex data operations, external service integrations.
- **Tech**: TypeScript, Server-side logic (mostly).

## 2. Patterns & Conventions
- **Abstraction**:
    - ✅ DO: Encapsulate complex logic here, keep Components/API routes clean.
    - ✅ DO: Return typed responses/errors.
- **Naming**: `nounService.ts` (e.g., `auditService.ts`).
- **Functions**: `get...`, `create...`, `update...`, `delete...`.

### Examples
- **Audit**: `services/auditService.ts`

## 3. Touch Points
- **Database**: Imports `lib/supabase/client.ts` or server equivalent.
- **Types**: Imports from `types/*.ts`.

## 4. JIT Index Hints
- Find services: `glob "services/*.ts"`