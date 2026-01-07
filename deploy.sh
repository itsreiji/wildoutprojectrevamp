#!/bin/bash

# WildOut! Vercel Deployment Script
# This script prepares and deploys the project to Vercel

set -e  # Exit on any error

echo "🚀 WildOut! Vercel Deployment Script"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm i -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged into Vercel. Please log in..."
    vercel login
fi

# Verify environment variables
print_status "Checking environment variables..."
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your actual secrets before deploying"
    else
        print_error ".env.example not found. Please create it first."
        exit 1
    fi
fi

# Check for required environment variables
required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env 2>/dev/null; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

print_status "All required environment variables found"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf build .vercel

# Install dependencies
print_status "Installing dependencies..."
pnpm install

# Run tests
print_status "Running tests..."
if pnpm test; then
    print_status "Tests passed!"
else
    print_error "Tests failed. Please fix issues before deploying."
    exit 1
fi

# Build the project
print_status "Building project for production..."
if pnpm build; then
    print_status "Build successful!"
else
    print_error "Build failed. Please check for errors."
    exit 1
fi

# Verify build output
if [ ! -d "build" ] || [ ! -f "build/index.html" ]; then
    print_error "Build output missing or invalid"
    exit 1
fi

print_status "Build verification passed"

# Check if project is already linked
if [ -f ".vercel/project.json" ]; then
    print_status "Project already linked to Vercel"
    read -p "Do you want to deploy to production? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deploying to production..."
        vercel --prod
    else
        print_status "Skipping production deployment"
        print_status "You can deploy manually with: vercel --prod"
    fi
else
    print_warning "Project not linked to Vercel yet"
    print_status "To deploy, run: vercel --prod"
    print_status "Or link first: vercel link"
fi

print_status "Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Run 'vercel --prod' to deploy to production"
echo "2. Add environment variables in Vercel dashboard if needed"
echo "3. Set up custom domain (optional)"
echo ""
echo "For detailed instructions, see VERCEL_DEPLOYMENT.md"