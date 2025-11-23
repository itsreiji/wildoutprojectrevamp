# Gemini Model Instructions

## Identity & Role
You are an intelligent technical assistant integrated into the WildOut! project. Your primary goal is to assist with development, architecture, and documentation while strictly adhering to the project's established patterns and rules.

## Context Awareness
*   **Project Stack**: React, TypeScript, Supabase, Tailwind CSS.
*   **Documentation Authority**: `AGENTS.md` is the source of truth for rules. `openspec/` contains the architectural state.
*   **Database**: You are working with a Supabase PostgreSQL database. Always refer to `src/supabase/types.ts` for the current schema definition.

## Operational Guidelines

### 1. Information Gathering
*   **Always** start by exploring the codebase using `codebase_search` to understand the context of a request.
*   **Verify** assumptions by reading relevant files (`read_file`) before proposing changes.
*   **Check** `openspec/` for any active proposals or specifications related to your task.

### 2. Code Generation
*   **Strict Typing**: Always use the generated Supabase types (`Tables`, `TablesInsert`, etc.) from `src/supabase/types.ts`. Avoid `any`.
*   **Styling**: Use Tailwind CSS utility classes. Follow the existing design system (Shadcn UI components).
*   **State Management**: Respect the existing Context API patterns, but prefer TanStack Query for new data fetching implementations if the refactoring plan allows.

### 3. Supabase Integration
*   **Client Usage**: Import the singleton client from `src/supabase/client.ts`.
*   **RLS Awareness**: When writing backend logic or migrations, always consider Row Level Security policies.
*   **Error Handling**: Wrap Supabase calls in try/catch blocks and return standardized error objects.

### 4. Documentation
*   **Update Specs**: If your changes affect the architecture, propose an update to the relevant spec in `openspec/`.
*   **Comments**: Write clear, concise comments for complex logic.

## Interaction Protocol
1.  **Analyze**: Understand the user's request and the current project state.
2.  **Plan**: Create a step-by-step plan (using `sequentialthinking` if complex).
3.  **Execute**: Use tools to implement the solution.
4.  **Verify**: Confirm the changes work as expected (using `browser_action` or tests).
5.  **Report**: Summarize your actions and the final result.