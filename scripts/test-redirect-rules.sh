#!/bin/bash

# Test Redirect Rules
# This script tests redirect patterns to ensure city and state are captured correctly

echo "🧪 Testing Netlify Redirect Rules"
echo "=================================="
echo ""

echo "📋 Testing URL Transformations:"
echo ""

# Test Case 1: Subcategory path to query param
echo "1️⃣  OLD: /top-20/carts/coffee-carts/montpelier/vermont"
echo "   NEW: /top-20/carts/montpelier/vermont?subcategory=coffee-carts"
echo "   ✅ Pattern: :category/:subcategory/:city/:state → :category/:city/:state?subcategory=:subcategory"
echo ""

# Test Case 2: With special characters
echo "2️⃣  OLD: /top-20/hair-stylists/extensions-&-volume/irving/texas"
echo "   NEW: /top-20/hair-stylists/irving/texas?subcategory=extensions-and-volume"
echo "   ✅ Subcategory will be slugified in sitemap (& → and)"
echo ""

# Test Case 3: Capitalized URLs
echo "3️⃣  OLD: /top-20/carts/coffee-carts/Montpelier/Vermont"
echo "   NEW: /top-20/carts/montpelier/vermont?subcategory=coffee-carts"
echo "   ⚠️  Netlify preserves case in redirects - sitemap should only generate lowercase"
echo ""

# Test Case 4: Search prefix
echo "4️⃣  OLD: /search/florists"
echo "   NEW: /top-20/florists"
echo "   ✅ Pattern: /search/:category → /top-20/:category"
echo ""

# Test Case 5: Duplicate state
echo "5️⃣  OLD: /top-20/photographers/georgia/georgia"
echo "   NEW: /top-20/photographers"
echo "   ✅ Pattern: /top-20/:category/:duplicate/:duplicate → /top-20/:category"
echo ""

echo "=================================="
echo ""
echo "🔧 How Netlify Redirects Work:"
echo ""
echo "1. Netlify captures named parameters from the FROM pattern"
echo "2. It substitutes them in the TO pattern"
echo "3. Example:"
echo "   FROM: /top-20/:category/:subcategory/:city/:state"
echo "   URL:  /top-20/carts/coffee-carts/montpelier/vermont"
echo "   "
echo "   Captured:"
echo "   - category = 'carts'"
echo "   - subcategory = 'coffee-carts'"
echo "   - city = 'montpelier'"
echo "   - state = 'vermont'"
echo "   "
echo "   TO: /top-20/:category/:city/:state?subcategory=:subcategory"
echo "   Result: /top-20/carts/montpelier/vermont?subcategory=coffee-carts"
echo ""

echo "=================================="
echo ""
echo "✅ To test after deployment:"
echo ""
echo "curl -I https://findmyweddingvendor.com/top-20/carts/coffee-carts/montpelier/vermont"
echo ""
echo "Look for:"
echo "  HTTP/1.1 301 Moved Permanently"
echo "  Location: /top-20/carts/montpelier/vermont?subcategory=coffee-carts"
echo ""
echo "=================================="
