# Instagram Cart Vendor Collection - Summary

## ✅ What We've Accomplished

### 1. Created Comprehensive Seed Data
- **Cart Categories Added:** 48 entries (6 cart types × 8 Tier 1 cities)
- **Cart Types:**
  - Coffee Carts
  - Matcha Carts
  - Cocktail Carts
  - Dessert Carts
  - Flower Carts
  - Champagne Carts

- **Tier 1 Cities:** NYC, LA, Chicago, Miami, Dallas, Seattle, Boston, Atlanta

### 2. Seed Data Files Created
- `data/ig_mcp_apify_seed.csv` - Main seed file with cart categories appended
- `data/ig_carts_seed.csv` - Dedicated cart categories seed file
- `data/ig_all_vendors_seed.csv` - Complete vendor categories including carts

### 3. Collection Scripts Created
- `scripts/collect-cart-instagram-vendors.js` - Node.js collection script
- `scripts/run-cart-collection.sh` - Bash automation script

## 🚨 Current Issue
The automation system is experiencing memory issues when processing large batches. This is a known limitation when running many MCP calls simultaneously.

## 📋 Recommended Approach

### Option 1: Run Individual Collections (Most Stable)
Run one city/category at a time to avoid memory issues:

```bash
# Example for New York Coffee Carts
CITY="New York" STATE="NY" CATEGORY="coffee-carts" LIMIT_PER_ROW=20 MAX_ENRICH=25 npm run play:backfill:city

# Example for Los Angeles Matcha Carts  
CITY="Los Angeles" STATE="CA" CATEGORY="matcha-carts" LIMIT_PER_ROW=20 MAX_ENRICH=25 npm run play:backfill:city

# Continue for other combinations...
```

### Option 2: Use Smaller Batches
Reduce the batch size to prevent memory issues:

```bash
# Run with smaller limits
TIER=1 LIMIT_PER_ROW=3 MAX_ENRICH=5 npm run play:backfill:tier
```

### Option 3: Manual Collection Commands

Here are all 48 commands for complete cart vendor collection:

#### New York
```bash
CITY="New York" STATE="NY" CATEGORY="coffee-carts" npm run play:backfill:city
CITY="New York" STATE="NY" CATEGORY="matcha-carts" npm run play:backfill:city
CITY="New York" STATE="NY" CATEGORY="cocktail-carts" npm run play:backfill:city
CITY="New York" STATE="NY" CATEGORY="dessert-carts" npm run play:backfill:city
CITY="New York" STATE="NY" CATEGORY="flower-carts" npm run play:backfill:city
CITY="New York" STATE="NY" CATEGORY="champagne-carts" npm run play:backfill:city
```

#### Los Angeles
```bash
CITY="Los Angeles" STATE="CA" CATEGORY="coffee-carts" npm run play:backfill:city
CITY="Los Angeles" STATE="CA" CATEGORY="matcha-carts" npm run play:backfill:city
CITY="Los Angeles" STATE="CA" CATEGORY="cocktail-carts" npm run play:backfill:city
CITY="Los Angeles" STATE="CA" CATEGORY="dessert-carts" npm run play:backfill:city
CITY="Los Angeles" STATE="CA" CATEGORY="flower-carts" npm run play:backfill:city
CITY="Los Angeles" STATE="CA" CATEGORY="champagne-carts" npm run play:backfill:city
```

#### Chicago
```bash
CITY="Chicago" STATE="IL" CATEGORY="coffee-carts" npm run play:backfill:city
CITY="Chicago" STATE="IL" CATEGORY="matcha-carts" npm run play:backfill:city
CITY="Chicago" STATE="IL" CATEGORY="cocktail-carts" npm run play:backfill:city
CITY="Chicago" STATE="IL" CATEGORY="dessert-carts" npm run play:backfill:city
CITY="Chicago" STATE="IL" CATEGORY="flower-carts" npm run play:backfill:city
CITY="Chicago" STATE="IL" CATEGORY="champagne-carts" npm run play:backfill:city
```

#### Miami
```bash
CITY="Miami" STATE="FL" CATEGORY="coffee-carts" npm run play:backfill:city
CITY="Miami" STATE="FL" CATEGORY="matcha-carts" npm run play:backfill:city
CITY="Miami" STATE="FL" CATEGORY="cocktail-carts" npm run play:backfill:city
CITY="Miami" STATE="FL" CATEGORY="dessert-carts" npm run play:backfill:city
CITY="Miami" STATE="FL" CATEGORY="flower-carts" npm run play:backfill:city
CITY="Miami" STATE="FL" CATEGORY="champagne-carts" npm run play:backfill:city
```

#### Dallas
```bash
CITY="Dallas" STATE="TX" CATEGORY="coffee-carts" npm run play:backfill:city
CITY="Dallas" STATE="TX" CATEGORY="matcha-carts" npm run play:backfill:city
CITY="Dallas" STATE="TX" CATEGORY="cocktail-carts" npm run play:backfill:city
CITY="Dallas" STATE="TX" CATEGORY="dessert-carts" npm run play:backfill:city
CITY="Dallas" STATE="TX" CATEGORY="flower-carts" npm run play:backfill:city
CITY="Dallas" STATE="TX" CATEGORY="champagne-carts" npm run play:backfill:city
```

#### Seattle
```bash
CITY="Seattle" STATE="WA" CATEGORY="coffee-carts" npm run play:backfill:city
CITY="Seattle" STATE="WA" CATEGORY="matcha-carts" npm run play:backfill:city
CITY="Seattle" STATE="WA" CATEGORY="cocktail-carts" npm run play:backfill:city
CITY="Seattle" STATE="WA" CATEGORY="dessert-carts" npm run play:backfill:city
CITY="Seattle" STATE="WA" CATEGORY="flower-carts" npm run play:backfill:city
CITY="Seattle" STATE="WA" CATEGORY="champagne-carts" npm run play:backfill:city
```

#### Boston
```bash
CITY="Boston" STATE="MA" CATEGORY="coffee-carts" npm run play:backfill:city
CITY="Boston" STATE="MA" CATEGORY="matcha-carts" npm run play:backfill:city
CITY="Boston" STATE="MA" CATEGORY="cocktail-carts" npm run play:backfill:city
CITY="Boston" STATE="MA" CATEGORY="dessert-carts" npm run play:backfill:city
CITY="Boston" STATE="MA" CATEGORY="flower-carts" npm run play:backfill:city
CITY="Boston" STATE="MA" CATEGORY="champagne-carts" npm run play:backfill:city
```

#### Atlanta
```bash
CITY="Atlanta" STATE="GA" CATEGORY="coffee-carts" npm run play:backfill:city
CITY="Atlanta" STATE="GA" CATEGORY="matcha-carts" npm run play:backfill:city
CITY="Atlanta" STATE="GA" CATEGORY="cocktail-carts" npm run play:backfill:city
CITY="Atlanta" STATE="GA" CATEGORY="dessert-carts" npm run play:backfill:city
CITY="Atlanta" STATE="GA" CATEGORY="flower-carts" npm run play:backfill:city
CITY="Atlanta" STATE="GA" CATEGORY="champagne-carts" npm run play:backfill:city
```

## 📊 Quality Control
After running collections, check the results:

```bash
# Run quality control report
npm run play:qc:daily
```

## 🎯 Next Steps
1. Run individual collections as shown above (wait 30-60 seconds between each)
2. Monitor the Supabase dashboard for incoming vendors
3. Use the QC report to verify data quality
4. Consider running collections in smaller batches during off-peak hours

## 💡 Tips
- Run collections one at a time to avoid rate limits
- Wait 30-60 seconds between collections
- Start with high-priority cities (NYC, LA, Chicago)
- Monitor your Apify usage to stay within limits
- Use smaller LIMIT_PER_ROW and MAX_ENRICH values if needed

## 🔧 Troubleshooting
If you encounter issues:
1. Reduce batch sizes (LIMIT_PER_ROW=10 MAX_ENRICH=15)
2. Increase delay between collections
3. Check Supabase logs for any database issues
4. Verify your Apify MCP server is running
5. Check environment variables are properly set

---

*Collection system prepared: January 27, 2025*
*Total potential vendors: ~960 (48 combinations × ~20 vendors each)*
