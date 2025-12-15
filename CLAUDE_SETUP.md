# WildOut! Claude Code Setup Guide

This guide explains how to set up and use the Claude Code system for the WildOut! project.

## 🎯 Overview

The WildOut! project has been configured with a comprehensive **CLAUDE.md hierarchical system** optimized for Claude Code. This system provides:

- **Authoritative rules** for development
- **Context-specific guidance** for different parts of the codebase
- **Automated hooks** for safety and quality
- **Custom commands** for common workflows
- **MCP server integration** for enhanced capabilities

## 📁 CLAUDE.md Hierarchy

```
CLAUDE.md                          # Root - Universal project rules (8,098 chars)
├── src/CLAUDE.md                  # Core application guidance (10,966 chars)
│   ├── src/components/CLAUDE.md    # UI component patterns (20,895 chars)
│   ├── src/contexts/CLAUDE.md     # State management rules (19,765 chars)
│   ├── src/services/CLAUDE.md     # Business logic patterns (32,789 chars)
│   └── src/utils/CLAUDE.md         # Utility functions patterns (19,070 chars)
└── tests/CLAUDE.md                 # Testing-specific rules (23,458 chars)
```

**Total**: 135,041 characters across 7 CLAUDE.md files

## 🚀 Getting Started

### 1. Install Required Tools

```bash
# Install pnpm (if not already installed)
npm install -g pnpm

# Install project dependencies
pnpm install

# Install MCP servers (if needed)
pnpm add -D @modelcontextprotocol/server-github context7-mcp @modelcontextprotocol/server-sequential-thinking
```

### 2. Configure Environment

```bash
# Copy .env.example to .env
cp .env.example .env

# Set up required environment variables
# GITHUB_TOKEN for GitHub integration
# SUPABASE_URL and SUPABASE_KEY for database access
```

### 3. Start Development

```bash
# Start the development server
pnpm dev

# Run tests to verify setup
pnpm test
```

## 🤖 Claude Code Features

### 1. Hierarchical Memory System

Claude Code reads CLAUDE.md files recursively:

1. **Root CLAUDE.md**: Universal rules for the entire project
2. **Directory CLAUDE.md**: Context-specific rules that extend parent context
3. **Automatic Discovery**: Claude Code finds and reads all CLAUDE.md files

### 2. Hooks System

Configured in `.claude/settings.json`:

- **PreToolUse**: Safety checks before operations
- **PostToolUse**: Auto-formatting and test execution
- **UserPromptSubmit**: Context validation
- **Notification**: Event handling

**Safety Features**:
- ✅ Blocks `.env` file editing
- ✅ Prevents dangerous commands (`rm -rf`, `git push --force`)
- ✅ Warns about critical configuration changes
- ✅ Auto-formats TypeScript files
- ✅ Runs tests for modified test files

### 3. Custom Slash Commands

Available commands in `.claude/commands/`:

| Command | Description | Usage |
|---------|-------------|-------|
| `/review-pr` | Comprehensive PR review | `/review-pr` |
| `/fix-issue` | Issue analysis and resolution | `/fix-issue 123` |
| `/db-migration` | Database migration creation | `/db-migration add_field` |
| `/test-all` | Complete test suite execution | `/test-all --coverage` |

### 4. MCP Servers

Configured in `.mcp.json`:

| Server | Purpose | Environment |
|--------|---------|-------------|
| `github` | GitHub integration | Development & Production |
| `supabase` | Database access | Production |
| `context7` | Web search & docs | Development |
| `sequential-thinking` | Complex decisions | Development |

## 📖 Using CLAUDE.md

### Reading CLAUDE.md Files

```bash
# Read root CLAUDE.md
cat CLAUDE.md

# Read component-specific CLAUDE.md
cat src/components/CLAUDE.md

# Search for specific patterns
rg -n "✅ DO" src/**/CLAUDE.md
```

### CLAUDE.md Structure

Each CLAUDE.md follows this structure:

1. **Identity**: Package purpose and technology
2. **Setup & Commands**: Development commands
3. **Architecture & Patterns**: Code organization
4. **Key Files**: Important files to understand
5. **JIT Search Hints**: Quick search commands
6. **Common Gotchas**: Things to watch out for
7. **Testing**: Testing strategies
8. **Performance**: Optimization techniques
9. **Security**: Best practices
10. **Documentation**: Standards and examples

### CLAUDE.md Best Practices

✅ **DO**:
- Read the relevant CLAUDE.md before starting work
- Follow the established patterns
- Use the provided search commands
- Reference CLAUDE.md in code reviews

❌ **DON'T**:
- Ignore CLAUDE.md guidelines
- Create patterns not documented in CLAUDE.md
- Modify CLAUDE.md without team review

## 🔧 Development Workflows

### 1. Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/description

# 2. Read relevant CLAUDE.md
cat src/components/CLAUDE.md

# 3. Implement feature following patterns
# Use the examples in CLAUDE.md

# 4. Run tests
pnpm test

# 5. Validate
pnpm type-check && pnpm lint

# 6. Commit
git commit -m "feat: add new feature"

# 7. Push
git push origin feature/description
```

### 2. Bug Fixing

```bash
# Use the fix-issue command
/fix-issue 123

# Or manually:
# 1. Get issue details
gh issue view 123

# 2. Find relevant files
rg -n "keyword" src/

# 3. Read applicable CLAUDE.md
cat src/services/CLAUDE.md

# 4. Implement fix
# Follow patterns from CLAUDE.md

# 5. Write tests
# Use test patterns from tests/CLAUDE.md

# 6. Validate
pnpm test

# 7. Create PR
gh pr create --title "fix: resolve issue #123"
```

### 3. Code Review

```bash
# Use the review-pr command
/review-pr

# Or manually follow the review criteria:
# 1. Check TypeScript & React patterns
# 2. Verify architecture adherence
# 3. Confirm testing coverage
# 4. Validate security practices
# 5. Assess performance implications

# Provide specific, actionable feedback with:
# - File paths and line numbers
# - Clear explanations
# - Suggested fixes
# - Priority levels
```

### 4. Database Migration

```bash
# Use the db-migration command
/db-migration add_instagram_field

# Or manually:
# 1. Create migration file
pnpm supabase migration create add_instagram_field

# 2. Write migration following patterns
# Use examples from src/services/CLAUDE.md

# 3. Test migration
pnpm supabase db reset
pnpm supabase migration up

# 4. Verify
pnpm test

# 5. Commit
git add supabase/migrations/*
git commit -m "feat(db): add instagram field"
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test src/components/Button.test.tsx

# Use the test-all command
/test-all --coverage
```

### Test Coverage

```bash
# Check coverage
cat coverage/coverage-summary.json

# Open HTML report
open coverage/index.html

# Find untested files
find src -name "*.ts" -o -name "*.tsx" | grep -v test | while read file; do
  if [ ! -f "${file%.ts}.test.ts" ] && [ ! -f "${file%.tsx}.test.tsx" ]; then
    echo "No test found for: $file"
  fi
done
```

### Test Patterns

Follow the patterns in `tests/CLAUDE.md`:

- **Unit Tests**: Test individual functions
- **Component Tests**: Test user behavior
- **Integration Tests**: Test component interactions
- **Error Handling**: Test edge cases and failures

## 🛡️ Security

### Security Best Practices

From `CLAUDE.md` and `src/services/CLAUDE.md`:

- ✅ **Secrets Management**: Never commit `.env` files
- ✅ **Input Validation**: Validate all user input
- ✅ **RLS Policies**: Respect Supabase Row Level Security
- ✅ **Data Sanitization**: Sanitize HTML and user content
- ✅ **Error Handling**: Don't expose sensitive error details

### Security Tools

```bash
# Check for secrets
pnpm exec secrets-check

# Audit dependencies
pnpm audit

# Check for vulnerabilities
pnpm exec snyk test
```

## 🚀 Deployment

### Pre-Deployment Checklist

```bash
# 1. Run all tests
pnpm test

# 2. Check coverage
pnpm test:coverage

# 3. Type checking
pnpm type-check

# 4. Linting
pnpm lint

# 5. Build
pnpm build

# 6. Verify no console errors
# Manual testing in browser
```

### Deployment Commands

```bash
# Build for production
pnpm build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

## 📚 Documentation

### CLAUDE.md Documentation Standards

Each CLAUDE.md includes:

- **Code Examples**: Real-world examples with ✅ DO and ❌ DON'T
- **Best Practices**: Established patterns to follow
- **Anti-Patterns**: Common mistakes to avoid
- **Search Commands**: Ready-to-use grep patterns
- **Testing Patterns**: Comprehensive test examples

### Adding New Documentation

```markdown
## New Feature Documentation

### Overview
Brief description of the feature

### Usage
```typescript
// Example usage
import { feature } from '@/features/feature';

feature.doSomething();
```

### Best Practices
✅ **DO**: Follow this pattern
❌ **DON'T**: Avoid this anti-pattern

### Testing
```typescript
// Test example
import { testFeature } from '@/test/feature.test';

describe('feature', () => {
  it('should work correctly', () => {
    // Test implementation
  });
});
```
```

## 🤝 Team Workflows

### Pull Request Process

```markdown
## Pull Request Template

### Description
Brief description of changes

### Related Issues
Fixes #123

### Changes Made
- File1: Description of changes
- File2: Description of changes

### Testing
- ✅ Unit tests added/updated
- ✅ Integration tests pass
- ✅ Manual testing completed
- ✅ Coverage maintained ≥ 80%

### Checklist
- ✅ Code follows CLAUDE.md patterns
- ✅ TypeScript compilation passes
- ✅ Linting passes
- ✅ Tests pass
- ✅ Documentation updated
- ✅ Ready for review
```

### Code Review Process

```markdown
## Code Review Checklist

### Quality
- ✅ Follows established patterns from CLAUDE.md
- ✅ Proper TypeScript typing
- ✅ Good variable/function names
- ✅ Consistent code style

### Testing
- ✅ Tests cover happy path
- ✅ Tests cover edge cases
- ✅ Tests cover error conditions
- ✅ Test coverage ≥ 80%

### Performance
- ✅ No unnecessary re-renders
- ✅ Efficient data fetching
- ✅ Proper memoization
- ✅ Bundle size considerations

### Security
- ✅ No hardcoded secrets
- ✅ Proper input validation
- ✅ RLS policies respected
- ✅ No XSS vulnerabilities

### Documentation
- ✅ Code is self-documenting
- ✅ Complex logic is commented
- ✅ Public APIs are documented
- ✅ CLAUDE.md updated if needed
```

## 🎓 Learning Resources

### CLAUDE.md References

```markdown
# CLAUDE.md Quick Reference

## Core Concepts
- **Root CLAUDE.md**: Universal rules
- **Directory CLAUDE.md**: Context-specific extensions
- **Hierarchical**: Child extends parent context

## Common Patterns
- **Components**: Shadcn UI + Tailwind
- **State**: TanStack Query + React Context
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + Testing Library

## Quick Search
```bash
# Find component patterns
rg -n "✅ DO" src/components/CLAUDE.md

# Find service patterns
rg -n "✅ DO" src/services/CLAUDE.md

# Find test patterns
rg -n "✅ DO" tests/CLAUDE.md
```
```

### External Resources

- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Supabase Documentation](https://supabase.com/docs)

## 🔧 Troubleshooting

### Common Issues

**Claude Code not recognizing CLAUDE.md files**:
- Ensure files are named exactly `CLAUDE.md`
- Check file permissions
- Verify Claude Code version

**Hooks not executing**:
- Check `.claude/settings.json` syntax
- Verify tool permissions
- Test with simple echo commands first

**MCP servers not connecting**:
- Check environment variables
- Verify server configuration
- Test connection manually

### Debugging

```bash
# Check Claude Code configuration
claude config show

# Test MCP server connection
claude mcp test github

# Verify CLAUDE.md hierarchy
find . -name "CLAUDE.md" -type f

# Check hooks execution
claude hooks list
```

## 📈 Metrics and Analytics

### Project Metrics

```bash
# Count CLAUDE.md files
find . -name "CLAUDE.md" -type f | wc -l

# Total CLAUDE.md content size
find . -name "CLAUDE.md" -type f -exec cat {} + | wc -c

# Test coverage
pnpm test:coverage

# Code quality
pnpm lint
```

### Performance Metrics

```bash
# Build time
time pnpm build

# Test time
time pnpm test

# Bundle size analysis
pnpm build && du -sh build/
```

## 🎉 Success Criteria

### Project Health Indicators

- ✅ **CLAUDE.md Coverage**: All major directories documented
- ✅ **Test Coverage**: ≥ 80% overall coverage
- ✅ **Type Safety**: Strict TypeScript with no `any` types
- ✅ **Code Quality**: Linting and formatting passes
- ✅ **Security**: No secrets in code, proper RLS policies
- ✅ **Performance**: Optimized components and queries
- ✅ **Documentation**: Comprehensive and up-to-date
- ✅ **Team Adoption**: All developers using CLAUDE.md system

### Continuous Improvement

```markdown
## CLAUDE.md Maintenance

### Monthly Review
- Review and update CLAUDE.md files
- Add new patterns as they emerge
- Remove outdated patterns
- Improve examples and documentation

### Pattern Evolution
- Document new best practices
- Add real-world examples
- Update based on team feedback
- Keep in sync with codebase changes

### Team Feedback
- Collect feedback on CLAUDE.md usefulness
- Identify missing or unclear sections
- Improve based on actual usage
- Add frequently asked questions
```

## 🚀 Conclusion

The WildOut! Claude Code system provides a **comprehensive, hierarchical documentation and automation system** that:

1. **Standardizes development** with clear patterns and rules
2. **Accelerates onboarding** with context-specific guidance
3. **Improves code quality** through automated checks and reviews
4. **Enhances productivity** with custom commands and MCP integration
5. **Ensures consistency** across the entire codebase

By following the CLAUDE.md hierarchy and using the provided tools, the development team can **build high-quality, maintainable software efficiently** while maintaining **consistent patterns and best practices** throughout the project.

📚 **Happy Coding!** 🚀