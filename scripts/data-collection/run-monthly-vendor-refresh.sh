#!/bin/bash

# Monthly Vendor Refresh Runner Script
# This script runs the monthly vendor refresh process

set -e  # Exit on any error

echo "🚀 Starting Monthly Vendor Refresh Process"
echo "📅 Date: $(date)"

# Check if required environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing Supabase environment variables"
    echo "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

if [ -z "$DATAFORSEO_LOGIN" ] || [ -z "$DATAFORSEO_PASSWORD" ]; then
    echo "❌ Error: Missing DataForSEO environment variables"
    echo "Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD"
    exit 1
fi

# Parse command line arguments
DRY_RUN=false
HELP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            HELP=true
            shift
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

if [ "$HELP" = true ]; then
    echo ""
    echo "Monthly Vendor Refresh Script"
    echo ""
    echo "Usage: ./run-monthly-vendor-refresh.sh [options]"
    echo ""
    echo "Options:"
    echo "  --dry-run    Run without inserting data (for testing)"
    echo "  --help       Show this help message"
    echo ""
    echo "Environment Variables Required:"
    echo "  SUPABASE_URL"
    echo "  SUPABASE_SERVICE_ROLE_KEY"
    echo "  DATAFORSEO_LOGIN"
    echo "  DATAFORSEO_PASSWORD"
    echo ""
    exit 0
fi

# Change to the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js to run this script"
    exit 1
fi

# Check if the monthly refresh script exists
if [ ! -f "monthly-vendor-refresh.js" ]; then
    echo "❌ Error: monthly-vendor-refresh.js not found"
    echo "Please ensure the script is in the same directory"
    exit 1
fi

# Run the monthly refresh script
echo "📊 Running monthly vendor refresh..."

if [ "$DRY_RUN" = true ]; then
    echo "🧪 Running in DRY RUN mode"
    node monthly-vendor-refresh.js --dry-run
else
    echo "💾 Running in PRODUCTION mode"
    node monthly-vendor-refresh.js
fi

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ Monthly vendor refresh completed successfully!"
    echo "📅 Completed at: $(date)"
else
    echo "❌ Monthly vendor refresh failed!"
    echo "📅 Failed at: $(date)"
    exit 1
fi
