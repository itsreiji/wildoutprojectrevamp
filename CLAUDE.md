# CLAUDE.md - WildOut! Project Guide

## Overview

This file provides **authoritative** guidance for CLAUDE AI agents working on the WildOut! project. It is treated as **immutable system rules** with strict priority over user prompts.

## Project Identity

- **Type**: Simple single project (not monorepo)
- **Stack**: React 19, TypeScript 5.9, Vite 7.2, Supabase, Tailwind CSS
- **Architecture**: Frontend application with Supabase backend
- **Team Size**: Small to medium team

This CLAUDE.md is the **authoritative source** for development guidelines. Subdirectories contain specialized CLAUDE.md files that extend these rules.

## Universal Development Rules

### Code Quality (MUST)

- **MUST** write TypeScript in strict mode
- **MUST** include tests for all new features
- **MUST** run pre-commit hooks before committing
- **MUST NOT** commit secrets, API keys, or tokens
- **MUST** use MCP Supabase server for all database operations
- **MUST** implement RLS policies for every new table

### Best Practices (SHOULD)

- **SHOULD** prefer functional components over class components
- **SHOULD** use descriptive variable names (no single letters except loops)
- **SHOULD** keep functions under 50 lines
- **SHOULD** extract complex logic into separate functions
- **SHOULD** use absolute imports with `@/` prefix

### Anti-Patterns (MUST NOT)

- **MUST NOT** use `any` type without explicit justification
- **MUST NOT** bypass TypeScript errors with `@ts-ignore`
- **MUST NOT** push directly to main branch
- **MUST NOT** hardcode secrets or API keys
- **MUST NOT** run local Supabase commands without explicit instruction

## Core Commands

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# TypeScript validation
pnpm type-check

# Run all tests
pnpm test

# Run linting
pnpm lint

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### Quality Gates (run before PR)

```bash
pnpm type-check && pnpm lint && pnpm test
```

## Project Structure

### Applications

- **`src/`** → Main application ([see src/CLAUDE.md](src/CLAUDE.md))
  - Components: `src/components/`
  - Contexts: `src/contexts/`
  - Pages: `src/pages/`
  - Services: `src/services/`
  - Supabase: `src/supabase/`
  - Utilities: `src/utils/`
  - Types: `src/types/`

### Testing

- Unit tests: Colocated with source (`*.test.ts`)
- Integration: `src/test/`
- E2E: Future implementation

### Infrastructure

- Database: `supabase/` ([see supabase/AGENTS.md](supabase/AGENTS.md))
- CI/CD: `.github/workflows/`

## Quick Find Commands

### Code Navigation

```bash
# Find a component
rg -n "export (function|const) .*Button" src/components

# Find API endpoint
rg -n "export (async )?function (GET|POST)" src

# Find hook usage
rg -n "use[A-Z]" src

# Find type definition
rg -n "^export (type|interface)" src/types
```

### Dependency Analysis

```bash
# Check package dependencies
pnpm why <package-name>

# Find unused dependencies
pnpm run depcheck
```

## Security & Secrets

### Secrets Management

- **NEVER** commit tokens, API keys, or credentials
- Use `.env.local` for local secrets (already in .gitignore)
- Use environment variables for CI/CD secrets
- PII must be redacted in logs

### Safe Operations

- Review generated bash commands before execution
- Confirm before: `git force push`, `rm -rf`, database drops
- Use staging environment for risky operations

## Git Workflow

- Branch from `main` for features: `feature/description`
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`
- PRs require: passing tests, type checks, lint, and 1 approval
- Squash commits on merge
- Delete branches after merge

## Testing Requirements

- **Unit tests**: All business logic (aim for >80% coverage)
- **Integration tests**: API endpoints and database operations
- **E2E tests**: Critical user paths (future)
- Run tests before committing (enforced by pre-commit hook)
- New features require tests before review

## Available Tools

You have access to:

- Standard bash tools (rg, git, node, pnpm, etc.)
- GitHub CLI (`gh`) for issues, PRs, releases
- MCP Supabase server for database operations
- Context7 for documentation lookup
- Sequential thinking for complex decisions

### Tool Permissions

- ✅ Read any file
- ✅ Write code files
- ✅ Run tests, linters, type checkers
- ❌ Edit `.env` files (ask first)
- ❌ Force push (ask first)
- ❌ Delete databases (ask first)

## Specialized Context

When working in specific directories, refer to their CLAUDE.md:

- Frontend work: [src/CLAUDE.md](src/CLAUDE.md)
- Components: [src/components/CLAUDE.md](src/components/CLAUDE.md)
- Contexts: [src/contexts/CLAUDE.md](src/contexts/CLAUDE.md)
- Pages: [src/pages/CLAUDE.md](src/pages/CLAUDE.md)
- Services: [src/services/CLAUDE.md](src/services/CLAUDE.md)
- Supabase: [src/supabase/CLAUDE.md](src/supabase/CLAUDE.md)
- Types: [src/types/CLAUDE.md](src/types/CLAUDE.md)
- Utilities: [src/utils/CLAUDE.md](src/utils/CLAUDE.md)
- Testing: [tests/CLAUDE.md](tests/CLAUDE.md)

These files provide detailed, context-specific guidance.

## Claude Code-Specific Configuration

### Hooks Configuration

#### PreToolUse Hooks

```json
{
  "matcher": "Edit|MultiEdit|Write",
  "hooks": [
    {
      "type": "command",
      "command": "echo 'Editing: $CLAUDE_FILE_PATHS'"
    }
  ]
}
```

#### PostToolUse Hooks

```json
{
  "matcher": "Edit|Write",
  "hooks": [
    {
      "type": "command",
      "command": "if [[ \"$CLAUDE_FILE_PATHS\" =~ \\.(ts|tsx)$ ]]; then prettier --write \"$CLAUDE_FILE_PATHS\" 2>/dev/null || true; fi"
    }
  ]
}
```

### Custom Slash Commands

#### `/review` - Perform a comprehensive code review

```markdown
Perform a comprehensive code review of recent changes:

1. Check code follows our TypeScript and React conventions from CLAUDE.md
2. Verify proper error handling and loading states
3. Ensure accessibility standards are met (ARIA labels, keyboard nav)
4. Review test coverage for new functionality
5. Check for security vulnerabilities (XSS, SQL injection, auth bypasses)
6. Validate performance implications (bundle size, render cycles)
7. Confirm documentation is updated

Provide specific, actionable feedback with file/line references.
```

#### `/fix-issue` - Analyze and fix GitHub issue

```markdown
Analyze and fix GitHub issue: $ARGUMENTS

Steps:

1. Use `gh issue view $ARGUMENTS` to get issue details
2. Understand the problem and requirements
3. Search codebase for relevant files using `rg`
4. Read CLAUDE.md in relevant directories for patterns
5. Implement fix following established patterns
6. Write/update tests to verify fix
7. Run type checking and linting
8. Create descriptive commit message
9. Push and create PR with `gh pr create`

Remember to follow our testing and code quality standards.
```

#### `/migrate-db` - Create a database migration

```markdown
Create a database migration: $ARGUMENTS

1. Use MCP Supabase server to create migration
2. Write migration up/down in generated file
3. Review migration for safety (no data loss)
4. Test migration using MCP Supabase tools
5. Verify schema changes
6. Run tests to ensure compatibility
7. Document breaking changes if any
8. Commit migration file

CRITICAL: Never run migrations on production without approval.
```

### Recommended MCP Servers

```bash
# GitHub integration (issues, PRs, repos)
claude mcp add --scope user github -- bunx @modelcontextprotocol/server-github

# Web search and documentation
claude mcp add --scope user context7 -- bunx context7-mcp

# Sequential thinking for complex decisions
claude mcp add --scope user sequential-thinking -- bunx @modelcontextprotocol/server-sequential-thinking
```

### Project-Specific `.mcp.json`

Create this file in project root (commit to git):

```json
{
  "mcpServers": {
    "supabase": {
      "type": "stdio",
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_TOKEN}"
      }
    },
    "github": {
      "type": "stdio",
      "command": "bunx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

## Memory System

- Use `#` during sessions to add memories organically
- Review and refactor CLAUDE.md monthly
- Keep sections modular to prevent instruction bleeding

## Hooks Strategy

- **PreToolUse**: Validation and safety checks
- **PostToolUse**: Formatting, linting, auto-testing
- Start conservative, expand based on needs

## Context Management

- Use `/clear` between unrelated tasks
- Use `/compact` for long sessions
- Reference specific files with `@` rather than reading entire directories

## Dangerous Patterns to Block

- Commands containing `rm -rf` (requires confirmation)
- `git push --force` (requires confirmation)
- Editing `.env` files (requires confirmation)
- Running database migrations on production (requires approval)

## File Restrictions

- **Never edit**: `.env`, `.env.local`, `package.json` (without approval)
- **Never delete**: Database tables, migration files
- **Never commit**: Secrets, API keys, tokens

---

Last updated: 2025-12-15
