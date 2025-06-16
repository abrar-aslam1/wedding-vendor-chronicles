#!/bin/bash

# CSV Import Runner Script
# This script helps you import photographer CSV data into the database

echo "🎯 Wedding Vendor Chronicles - CSV Import Tool"
echo "=============================================="

# Check if CSV file path is provided
if [ $# -eq 0 ]; then
    echo "❌ Error: Please provide the path to your CSV file"
    echo ""
    echo "Usage: ./scripts/data-collection/run-csv-import.sh <path-to-csv-file>"
    echo ""
    echo "Example:"
    echo "  ./scripts/data-collection/run-csv-import.sh ~/Desktop/photographers.csv"
    echo "  ./scripts/data-collection/run-csv-import.sh ./data/photographers.xlsx"
    echo ""
    echo "📋 Your CSV file should have these exact headers:"
    echo "   - Instagram Page URL"
    echo "   - Business Name"
    echo "   - Phone"
    echo "   - Business Email"
    echo "   - Website"
    echo "   - Address"
    echo "   - City"
    echo "   - State"
    echo "   - Zip"
    exit 1
fi

CSV_FILE="$1"

# Check if file exists
if [ ! -f "$CSV_FILE" ]; then
    echo "❌ Error: File not found: $CSV_FILE"
    exit 1
fi

# Check file extension
FILE_EXT="${CSV_FILE##*.}"
if [ "$FILE_EXT" != "csv" ] && [ "$FILE_EXT" != "CSV" ]; then
    echo "⚠️  Warning: File extension is .$FILE_EXT, expected .csv"
    echo "   If this is an Excel file (.xlsx), please convert it to CSV format first."
    echo ""
    read -p "   Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Import cancelled"
        exit 1
    fi
fi

echo "📁 CSV File: $CSV_FILE"
echo "📊 File size: $(du -h "$CSV_FILE" | cut -f1)"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "   Please make sure you have a .env file with your Supabase credentials"
    echo "   You can copy .env.example and fill in your values"
    exit 1
fi

# Check if required environment variables are set
if ! grep -q "VITE_SUPABASE_URL" .env || ! grep -q "VITE_SUPABASE_ANON_KEY" .env; then
    echo "❌ Error: Missing required environment variables in .env file"
    echo "   Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set"
    exit 1
fi

echo "✅ Environment variables found"
echo ""

# Confirm before proceeding
echo "🚀 Ready to import photographer data"
echo "   This will add photographers to your instagram_vendors table"
echo "   Existing photographers with the same Instagram handle will be updated"
echo ""
read -p "   Proceed with import? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Import cancelled"
    exit 1
fi

echo ""
echo "🔄 Starting CSV import..."
echo "========================================"

# Run the import script
node scripts/data-collection/import-photographer-csv.js "$CSV_FILE"

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "🎉 Import completed successfully!"
    echo ""
    echo "📊 Next steps:"
    echo "   1. Check your Supabase dashboard to verify the data"
    echo "   2. Run the search functionality to test the new photographers"
    echo "   3. Consider running the Instagram enrichment script to get more data"
    echo ""
    echo "🔗 Useful commands:"
    echo "   - View imported data: node scripts/data-collection/view-instagram-vendors.js"
    echo "   - Test search: npm run dev (then visit /search?category=photographers)"
else
    echo ""
    echo "========================================"
    echo "❌ Import failed!"
    echo "   Please check the error messages above and try again"
    echo ""
    echo "💡 Common issues:"
    echo "   - CSV headers don't match exactly"
    echo "   - Missing required fields (Business Name, City, State)"
    echo "   - Database connection issues"
    echo "   - Invalid data format"
fi
