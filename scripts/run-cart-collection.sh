#!/bin/bash

# Instagram Cart Vendor Collection Script
# Collects Instagram vendors for all mobile cart categories in Tier 1 cities

echo "🚀 Starting Instagram Cart Vendor Collection"
echo "========================================="
echo "📊 Configuration:"
echo "  - Cities: 8 Tier 1 cities"
echo "  - Categories: 6 cart types"
echo "  - Total collections: 48"
echo "========================================="

# Cart categories
CATEGORIES=(
  "coffee-carts"
  "matcha-carts"
  "cocktail-carts"
  "dessert-carts"
  "flower-carts"
  "champagne-carts"
)

# Tier 1 cities
declare -a CITIES=(
  "New York:NY"
  "Los Angeles:CA"
  "Chicago:IL"
  "Miami:FL"
  "Dallas:TX"
  "Seattle:WA"
  "Boston:MA"
  "Atlanta:GA"
)

# Counter for progress
TOTAL=0
SUCCESS=0
FAILED=0

# Function to run collection for a city/category
run_collection() {
  local CITY=$1
  local STATE=$2
  local CATEGORY=$3
  
  echo ""
  echo "📍 Collecting $CATEGORY in $CITY, $STATE"
  echo "----------------------------------------"
  
  # Run the collection command
  CITY="$CITY" STATE="$STATE" CATEGORY="$CATEGORY" LIMIT_PER_ROW=20 MAX_ENRICH=25 npm run play:backfill:city
  
  if [ $? -eq 0 ]; then
    ((SUCCESS++))
    echo "✅ Success: $CATEGORY in $CITY, $STATE"
  else
    ((FAILED++))
    echo "❌ Failed: $CATEGORY in $CITY, $STATE"
  fi
  
  ((TOTAL++))
  
  # Print progress
  echo "📊 Progress: $TOTAL/48 ($SUCCESS successful, $FAILED failed)"
  
  # Wait 30 seconds between collections to respect rate limits
  echo "⏳ Waiting 30 seconds before next collection..."
  sleep 30
}

# Main collection loop
for CITY_STATE in "${CITIES[@]}"; do
  IFS=':' read -r CITY STATE <<< "$CITY_STATE"
  
  echo ""
  echo "🌆 Processing $CITY, $STATE"
  echo "========================================"
  
  for CATEGORY in "${CATEGORIES[@]}"; do
    run_collection "$CITY" "$STATE" "$CATEGORY"
  done
  
  echo ""
  echo "✅ Completed $CITY, $STATE"
  echo ""
done

# Final statistics
echo ""
echo "========================================="
echo "📊 FINAL COLLECTION STATISTICS"
echo "========================================="
echo "✅ Successful collections: $SUCCESS"
echo "❌ Failed collections: $FAILED"
echo "📦 Total collections attempted: $TOTAL"
echo "========================================="

if [ $FAILED -eq 0 ]; then
  echo "🎉 All collections completed successfully!"
else
  echo "⚠️ Some collections failed. Please check the logs."
fi

# Run quality control check
echo ""
echo "📋 Running Quality Control Check..."
npm run play:qc:daily

echo ""
echo "✨ Cart vendor collection complete!"
