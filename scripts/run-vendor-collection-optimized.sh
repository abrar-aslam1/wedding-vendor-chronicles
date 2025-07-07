#!/bin/bash

# OPTIMIZED Vendor Collection Runner
# This script runs the optimized vendor collection with proper DataForSEO rate limits

echo "🚀 OPTIMIZED Wedding Vendor Collection"
echo "======================================"
echo "📄 Loading environment variables from .env file..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "⚠️  No .env file found. Using default values."
fi

echo ""
echo "📊 OPTIMIZED Collection Overview:"
echo "   • 50 US states + major cities"
echo "   • 13 vendor categories (including Wedding Decorators!)"
echo "   • ~26,000 total searches estimated"
echo "   • Rate limit: 1,800 requests/minute (180x faster!)"
echo "   • Concurrent requests: 25 simultaneous"
echo "   • NO daily limits - full speed collection"
echo "   • Estimated completion time: 15-20 minutes"
echo ""

read -p "Do you want to start the OPTIMIZED collection? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔄 Starting OPTIMIZED collection... (Press Ctrl+C to pause and save progress)"
    echo ""
    
    # Run the optimized collection script
    node scripts/collect-all-vendors-optimized.js
else
    echo "Collection cancelled."
    exit 0
fi
