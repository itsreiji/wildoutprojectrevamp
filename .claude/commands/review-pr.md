# Review Pull Request

Perform a comprehensive code review of the current pull request or specified changes.

## Steps

1. **Check Context**: Read relevant CLAUDE.md files for project standards
2. **Analyze Changes**: Review all modified files in the PR
3. **Code Quality**: Verify adherence to TypeScript and React conventions
4. **Error Handling**: Ensure proper error handling and loading states
5. **Accessibility**: Check WCAG compliance (ARIA labels, keyboard navigation)
6. **Testing**: Review test coverage for new functionality
7. **Security**: Check for vulnerabilities (XSS, SQL injection, auth bypasses)
8. **Performance**: Validate performance implications (bundle size, render cycles)
9. **Documentation**: Confirm documentation is updated

## Review Criteria

### TypeScript & React
- ✅ Proper TypeScript interfaces and types
- ✅ Functional components with hooks
- ✅ No `any` types without justification
- ✅ Proper null/undefined handling

### Architecture
- ✅ Follows established patterns from CLAUDE.md
- ✅ Proper separation of concerns
- ✅ Appropriate use of contexts and services
- ✅ TanStack Query usage for data fetching

### Testing
- ✅ Unit tests for business logic
- ✅ Integration tests for API calls
- ✅ Component tests for UI
- ✅ Edge cases covered

### Security
- ✅ No hardcoded secrets
- ✅ Proper input validation
- ✅ RLS policies respected
- ✅ No SQL injection vulnerabilities

### Performance
- ✅ Efficient data fetching
- ✅ Proper memoization
- ✅ No unnecessary re-renders
- ✅ Bundle size considerations

## Output Format

Provide specific, actionable feedback with:
- File paths and line numbers
- Clear explanations of issues
- Suggested fixes
- Priority level (High/Medium/Low)

## Example Output

```markdown
## PR Review: #123 - Add User Profile Feature

### 🟢 Approved Changes
- ✅ User profile component follows Shadcn UI patterns
- ✅ Proper TypeScript interfaces for user data
- ✅ Comprehensive test coverage (95%)

### 🟡 Suggested Improvements

#### src/components/UserProfile.tsx (Line 45)
**Issue**: Missing error boundary for profile data loading
**Priority**: Medium
**Fix**: Wrap component in ErrorBoundary
```tsx
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <UserProfileData />
</ErrorBoundary>
```

#### src/services/userService.ts (Line 88)
**Issue**: No input sanitization for user bio
**Priority**: High
**Fix**: Add sanitization before database insert
```typescript
import { sanitize } from '@/utils/security';
const safeBio = bio ? sanitize(bio) : null;
```

### 🔴 Critical Issues

#### src/contexts/AuthContext.tsx (Line 122)
**Issue**: Potential memory leak in auth listener
**Priority**: High
**Fix**: Clean up subscription in useEffect cleanup
```typescript
return () => {
  if (subscription) subscription.unsubscribe();
};
```

## Summary
- **Approved**: 8/10 files
- **Needs Fixes**: 2/10 files (2 critical, 3 medium, 1 low)
- **Test Coverage**: 92% (Target: 85%+)
- **Recommendation**: Approve with requested changes
```