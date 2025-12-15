# Run Complete Test Suite

Execute the full test suite with coverage reporting for the WildOut! project.

## Command Usage

```bash
/test-all
/test-all --coverage
/test-all --watch
```

## Test Execution Process

### 1. Pre-Test Validation

```bash
# Check TypeScript compilation
echo "🔍 Running TypeScript validation..."
pnpm type-check

# Check linting
echo "🔍 Running linting..."
pnpm lint

# Check formatting
echo "🔍 Checking code formatting..."
pnpm exec prettier --check .
```

### 2. Run Test Suite

```bash
# Run all tests
echo "🧪 Running full test suite..."
pnpm test

# With coverage (if --coverage flag)
if [ "$ARGUMENTS" == "--coverage" ]; then
  echo "📊 Generating coverage report..."
  pnpm test:coverage
fi

# Watch mode (if --watch flag)
if [ "$ARGUMENTS" == "--watch" ]; then
  echo "👀 Running tests in watch mode..."
  pnpm test:watch
fi
```

### 3. Test Analysis

```bash
# Analyze test results
echo "📈 Analyzing test results..."

# Check test coverage thresholds
COVERAGE=$(pnpm test:coverage --json | grep -oP '"lines\.pct":\s*\K[0-9.]+')
if [ "$(echo "$COVERAGE < 80" | bc)" -eq 1 ]; then
  echo "⚠️  Coverage below 80%: $COVERAGE%"
fi

# Check for failed tests
if [ $? -ne 0 ]; then
  echo "❌ Some tests failed. Check the output above."
  exit 1
fi
```

## Test Categories

### 1. Unit Tests

```bash
# Run unit tests
echo "🧪 Running unit tests..."
pnpm test -- src/**/*.test.ts src/**/*.test.tsx
```

### 2. Integration Tests

```bash
# Run integration tests
echo "🔗 Running integration tests..."
pnpm test -- src/test/*.integration.test.tsx
```

### 3. Component Tests

```bash
# Run component tests
echo "🎨 Running component tests..."
pnpm test -- src/components/**/*.test.tsx
```

### 4. Service Tests

```bash
# Run service tests
echo "🛠️ Running service tests..."
pnpm test -- src/services/**/*.test.ts
```

## Test Reporting

### Coverage Report

```bash
# Generate HTML coverage report
echo "📊 Generating HTML coverage report..."
pnpm test:coverage

# Open coverage report
open coverage/index.html
```

### Test Summary

```bash
# Get test summary
echo "📋 Test Summary:"
echo "- Total Tests: $(grep -c '✓' test-output.txt)"
echo "- Failed Tests: $(grep -c '✗' test-output.txt)"
echo "- Coverage: ${COVERAGE}%"
echo "- Duration: $(grep 'Test Files' test-output.txt | grep -oP '\d+\.\d+ s')"
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: WildOut CI

on: [push, pull_request]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test:coverage
      
      - name: Upload coverage
        uses: actions/upload-artifact@v3
        with:
          name: coverage-report
          path: coverage/
```

## Test Best Practices

### Writing Good Tests

✅ **DO**:
- Test behavior, not implementation
- Use descriptive test names
- Test edge cases and error conditions
- Keep tests isolated
- Use test utilities and helpers

❌ **DON'T**:
- Test implementation details
- Create slow tests
- Write tests that depend on other tests
- Test third-party library behavior
- Create flaky tests

### Test Structure

```typescript
// ✅ Good test structure
describe('ComponentName', () => {
  describe('when prop is provided', () => {
    it('should render correctly', () => {
      // Test implementation
    });
    
    it('should handle user interaction', () => {
      // Test interaction
    });
  });
  
  describe('when prop is not provided', () => {
    it('should show default behavior', () => {
      // Test default behavior
    });
  });
  
  describe('error handling', () => {
    it('should handle API errors gracefully', () => {
      // Test error handling
    });
  });
});
```

## Performance Testing

### Test Optimization

```bash
# Run tests with performance profiling
echo "⏱️  Running performance tests..."
pnpm test --reporter=verbose

# Identify slow tests
pnpm test --reporter=json | jq '.testResults[] | select(.duration > 1000)'
```

### Test Parallelization

```bash
# Configure Vitest for parallel execution
# vite.config.ts
export default defineConfig({
  test: {
    threads: true, // Enable multi-threaded testing
    pool: 'forks', // Use fork pool for better isolation
    poolOptions: {
      forks: {
        maxThreads: 4, // Limit threads based on CI resources
        minThreads: 2,
      }
    }
  }
});
```

## Debugging Tests

### Common Issues

**Test Fails Intermittently**:
- Check for race conditions
- Add proper waits and assertions
- Use `waitFor` for async operations

**Test Times Out**:
- Increase timeout for slow operations
- Mock external dependencies
- Optimize test setup

**Test Environment Issues**:
- Check environment variables
- Verify test database connection
- Clear test data between runs

### Debugging Commands

```bash
# Run specific test with debugging
echo "🐛 Debugging test..."
DEBUG=true pnpm test src/components/Component.test.tsx

# Run test with verbose output
echo "🔍 Verbose test output..."
pnpm test src/components/Component.test.tsx --reporter=verbose

# Run test with UI
echo "🖥️  Running test with UI..."
pnpm test:ui src/components/Component.test.tsx
```

## Test Maintenance

### Updating Tests

```bash
# Update snapshots
echo "📸 Updating snapshots..."
pnpm test --update-snapshots

# Check for outdated tests
echo "🔍 Finding outdated tests..."
rg -n "it\.skip\|test\.skip" src/

# Find untyped test files
echo "🔍 Finding untyped test files..."
find src -name "*.test.js" -o -name "*.test.jsx"
```

### Test Coverage Improvement

```bash
# Find untested files
echo "🔍 Finding untested files..."
find src -name "*.ts" -o -name "*.tsx" | grep -v test | while read file; do
  if [ ! -f "${file%.ts}.test.ts" ] && [ ! -f "${file%.tsx}.test.tsx" ]; then
    echo "No test found for: $file"
  fi
done

# Find low coverage files
echo "📊 Finding low coverage files..."
pnpm test:coverage
cat coverage/coverage-summary.json | jq '.total | select(.lines.pct < 80)'
```

## Success Criteria

- ✅ All tests pass
- ✅ Coverage ≥ 80%
- ✅ No TypeScript errors
- ✅ No linting warnings
- ✅ Code properly formatted
- ✅ Tests follow established patterns
- ✅ Edge cases covered