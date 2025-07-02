#!/bin/bash

# Setup States Page - Run migration and populate location metadata
# This script sets up the database table and populates it with state data

echo "🚀 Setting up States Page..."
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Missing required environment variables"
    echo "Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file"
    exit 1
fi

echo "📋 Step 1: Running database migration..."
echo "Creating location_metadata table..."

# Apply the migration using Supabase CLI if available, otherwise skip with warning
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI to apply migration..."
    supabase db push
    if [ $? -eq 0 ]; then
        echo "✅ Migration applied successfully"
    else
        echo "⚠️  Migration may have failed. Please check manually."
    fi
else
    echo "⚠️  Supabase CLI not found. Please apply the migration manually:"
    echo "   Run the SQL in: supabase/migrations/20250702000000_create_location_metadata_table.sql"
    echo "   Or use the Supabase dashboard to execute the migration."
    echo ""
    read -p "Press Enter after applying the migration manually, or Ctrl+C to exit..."
fi

echo ""
echo "📊 Step 2: Populating location metadata..."
echo "This will aggregate vendor data by state and populate the location_metadata table..."

# Run the population script
node scripts/data-collection/populate-location-metadata.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 States page setup completed successfully!"
    echo "================================"
    echo "✅ Database table created"
    echo "✅ Location metadata populated"
    echo "✅ Navigation links added"
    echo "✅ Enhanced UI components"
    echo ""
    echo "You can now:"
    echo "1. Visit /states to see the states page"
    echo "2. Click 'Browse by State' in the navigation"
    echo "3. Click on any state card to search vendors in that state"
    echo ""
    echo "🔧 To update the data later, run:"
    echo "   node scripts/data-collection/populate-location-metadata.js"
else
    echo ""
    echo "❌ Error occurred during location metadata population"
    echo "Please check the error messages above and try again"
    exit 1
fi
