#!/bin/bash

# Vendor Collection Runner Script
# This script runs the comprehensive vendor collection with proper environment setup

echo "🚀 Starting Comprehensive Vendor Collection"
echo "============================================"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory."
    exit 1
fi

# Load environment variables if .env file exists
if [ -f ".env" ]; then
    echo "📄 Loading environment variables from .env file..."
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check for required environment variables
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "⚠️  Warning: Supabase environment variables not found."
    echo "   The script will use default values, but you may want to set:"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo ""
fi

# Show collection overview
echo "📊 Collection Overview:"
echo "   • 50 US states + major cities"
echo "   • 12 vendor categories"
echo "   • ~15,000 total searches estimated"
echo "   • Rate limited to 10 requests/minute"
echo "   • Daily limit: 200 requests"
echo "   • Estimated cost: $150-400 total"
echo ""

# Ask for confirmation
read -p "Do you want to start the collection? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Collection cancelled."
    exit 0
fi

echo ""
echo "🔄 Starting collection... (Press Ctrl+C to pause and save progress)"
echo ""

# Run the collection script
node scripts/collect-all-vendors.js

echo ""
echo "✅ Collection script finished."
echo "📊 Check vendor-collection-progress.json for detailed progress."
