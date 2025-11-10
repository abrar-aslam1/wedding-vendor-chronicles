#!/bin/bash

# Sitemap URL Verification Script
# This script tests a sample of the fixed URLs to ensure they're properly formatted

echo "🔍 Verifying Sitemap URL Formats..."
echo "=================================="
echo ""

# Test multi-word cities
echo "✓ Multi-word cities (should use hyphens):"
grep -h "las-vegas\|new-york-city\|fort-worth\|salt-lake-city" public/sitemaps/*.xml | head -4
echo ""

# Test multi-word states  
echo "✓ Multi-word states (should use hyphens):"
grep -h "north-dakota\|south-dakota\|new-hampshire\|west-virginia" public/sitemaps/*.xml | head -4
echo ""

# Test ampersand conversion
echo "✓ Ampersands converted to 'and':"
grep -h "barns-and-farms\|cupcakes-and-dessert-bars\|hotels-and-resorts" public/sitemaps/*.xml | head -4
echo ""

# Count total URLs
echo "📊 Sitemap Statistics:"
echo "=================================="
echo "Main sitemap index: $(wc -l < public/sitemap.xml) lines"
echo "Number of sitemap files: $(ls public/sitemaps/*.xml 2>/dev/null | wc -l)"
echo "Total URLs across all sitemaps: $(grep -h "<loc>" public/sitemaps/*.xml | wc -l)"
echo ""

# Validate XML
echo "✅ XML Validation:"
echo "=================================="
if command -v xmllint &> /dev/null; then
    xmllint --noout public/sitemap.xml 2>&1 && echo "✓ Main sitemap: VALID"
    
    # Test a few individual sitemaps
    for file in public/sitemaps/photographers-1.xml public/sitemaps/venues-1.xml public/sitemaps/static.xml; do
        if [ -f "$file" ]; then
            xmllint --noout "$file" 2>&1 && echo "✓ $(basename $file): VALID"
        fi
    done
else
    echo "⚠️  xmllint not found - skipping XML validation"
fi

echo ""
echo "✅ All verifications complete!"
echo ""
echo "Next steps:"
echo "1. Deploy to production: git add . && git commit -m 'Fix sitemap 404 errors' && git push"
echo "2. Submit to Google Search Console: https://search.google.com/search-console"
echo "3. Monitor progress over 2-4 weeks"
