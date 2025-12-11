# Components Directory - AGENTS.md

## 1. Package Identity
- **Scope**: Reusable UI components, Shadcn UI primitives, Feature-specific widgets.
- **Tech**: React, Tailwind CSS, Radix UI.

## 2. Patterns & Conventions
- **Structure**:
    - `components/ui/`: Atomic, generic components (Buttons, Inputs).
    - `components/<feature>/`: Feature-specific components (e.g., `components/admin/`).
- **Styling**:
    - ✅ DO: Use `cn()` utility for class merging.
    - ✅ DO: Use `cva` for variants (see `components/ui/button.tsx`).
    - ❌ DON'T: Use style objects or CSS modules (unless unavoidable).
- **Props**: Define interface `Props` or component-specific interface (e.g., `ButtonProps`).

### Examples
- **Atomic**: `components/ui/button.tsx`
- **Compound**: `components/Dashboard.tsx`
- **Utility**: `components/router.tsx`

## 3. Touch Points
- **Utils**: `lib/utils.ts` (contains `cn` helper).
- **Icons**: `lucide-react` (standard icon set).

## 4. JIT Index Hints
- Find UI component: `glob "components/ui/*.tsx"`
- Find specific component: `search_file_content pattern="export.*function ComponentName"`