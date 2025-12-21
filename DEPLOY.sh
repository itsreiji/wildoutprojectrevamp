#!/bin/bash

# 🚀 Wildout Project - Quick Deployment Script
# This script prepares and deploys the project to Vercel

set -e  # Exit on error

echo "🚀 Wildout Project - Production Deployment"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️ ${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory"
    exit 1
fi

print_success "Project directory confirmed"

# Step 1: Check environment variables
print_status "Step 1: Checking environment variables..."
if [ -f ".env.production" ]; then
    print_success "Production environment file exists"
    echo "   Please ensure these variables are set in Vercel:"
    grep -E "VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY|VITE_INNGEST_EVENT_KEY|VITE_INNGEST_APP_ID" .env.production | sed 's/^/   - /'
else
    print_warning ".env.production not found - create it from .env.example"
fi

# Step 2: Install dependencies
print_status "Step 2: Installing dependencies..."
pnpm install --frozen-lockfile
print_success "Dependencies installed"

# Step 3: Type checking
print_status "Step 3: Running type check..."
pnpm run type-check
print_success "Type check passed"

# Step 4: Run tests
print_status "Step 4: Running tests..."
pnpm run test
print_success "Tests passed"

# Step 5: Build the project
print_status "Step 5: Building project..."
pnpm run build
print_success "Build completed"

# Step 6: Verify build output
print_status "Step 6: Verifying build output..."
if [ -f "dist/index.html" ]; then
    print_success "Build output verified"
    echo "   Build size: $(du -sh dist/ | cut -f1)"
else
    print_error "Build output missing"
    exit 1
fi

# Step 7: Run verification script
print_status "Step 7: Running production verification..."
node scripts/verify-production-setup.js

# Final instructions
echo ""
echo "=========================================="
echo "🎉 DEPLOYMENT PREPARATION COMPLETE!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Go to vercel.com/new"
echo "2. Import your repository"
echo "3. Configure environment variables"
echo "4. Deploy!"
echo ""
echo "📖 Full guide: cat PRODUCTION_DEPLOYMENT_GUIDE.md"
echo "📋 Summary: cat DEPLOYMENT_SUMMARY.md"
echo ""
print_success "Ready for production deployment!"