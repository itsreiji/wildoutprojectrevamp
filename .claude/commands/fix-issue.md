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