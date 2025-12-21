#!/bin/bash

# Vercel Build Script for Wildout Project
# This script ensures proper build process for Vercel deployment

echo "🚀 Starting Vercel Build Process..."

# Set environment
export NODE_ENV=production
export VERCEL_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Type checking
echo "🔍 Running type check..."
pnpm run type-check

# Linting
echo "🔍 Running linting..."
pnpm run lint

# Run tests
echo "🧪 Running tests..."
pnpm run test

# Build the application
echo "🏗️ Building application..."
pnpm run build

# Verify build output
echo "✅ Verifying build output..."
if [ -d "dist" ]; then
    echo "✅ Build directory exists"
    ls -la dist/
else
    echo "❌ Build directory not found"
    exit 1
fi

# Check for critical files
echo "📋 Checking critical files..."
if [ -f "dist/index.html" ]; then
    echo "✅ index.html found"
else
    echo "❌ index.html not found"
    exit 1
fi

if [ -f "dist/assets/index-*.js" ]; then
    echo "✅ Main JS bundle found"
else
    echo "⚠️  Main JS bundle naming may vary"
fi

# Create API directory if it doesn't exist
echo "📁 Preparing API directory..."
mkdir -p dist/api

# Copy API files (if any need to be copied)
if [ -f "api/inngest.ts" ]; then
    echo "✅ Inngest API file found"
    # Note: Vercel will handle TypeScript compilation for serverless functions
fi

echo "✅ Build process completed successfully!"
echo "📊 Build output size:"
du -sh dist/

echo "🎉 Ready for Vercel deployment!"