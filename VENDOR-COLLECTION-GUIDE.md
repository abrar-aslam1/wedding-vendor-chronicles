# Comprehensive Vendor Collection System

This system automatically collects wedding vendors from all major US cities using Google Maps data through the DataForSEO API. It's designed to build a comprehensive national wedding vendor database with intelligent caching and cost management.

## 🎯 Overview

### What It Does
- **Collects vendors from 50 US states** and 200+ major cities
- **12 vendor categories** (photographers, venues, caterers, etc.)
- **Multiple subcategories** for each vendor type
- **Intelligent caching** to avoid duplicate API calls
- **Cost management** with daily limits and rate limiting
- **Progress tracking** with resume capability

### Expected Results
- **~15,000 cached searches** covering all major US markets
- **Estimated cost**: $150-400 total for DataForSEO API
- **Timeline**: 30-60 days (automated, hands-off)
- **Result**: Lightning-fast search results for your entire website

## 🚀 Quick Start

### Option 1: Interactive Mode (Recommended)
```bash
npm run collect-vendors-interactive
```

### Option 2: Direct Mode
```bash
npm run collect-vendors
```

### Option 3: Manual Script
```bash
node scripts/collect-all-vendors.js
```

## 📊 Collection Scope

### Geographic Coverage
- **All 50 US states**
- **200+ major cities** (3-5 per state)
- **Wedding destination cities** (Napa, Charleston, etc.)
- **Metropolitan areas** and state capitals

### Vendor Categories
1. **Photographers** (engagement, traditional, modern, destination, fine art, photojournalistic)
2. **Wedding Venues** (outdoor, indoor, rustic, elegant, beach, garden, historic, modern)
3. **Caterers** (traditional, italian, mexican, asian, vegan, kosher, southern, mediterranean)
4. **Florists** (bridal, ceremony, reception, rustic, elegant, modern, traditional)
5. **Wedding Planners** (full service, day of coordination, destination, luxury, budget friendly)
6. **Videographers** (cinematic, traditional, documentary, highlight reels, drone)
7. **DJs** (wedding reception, ceremony, cocktail hour, dance party)
8. **Bands** (wedding reception, jazz, acoustic, cover band, classical)
9. **Cake Designers** (traditional, modern, rustic, elegant, custom, cupcakes)
10. **Makeup Artists** (bridal, airbrush, traditional, natural, glamorous)
11. **Hair Stylists** (bridal, updo, natural, vintage, modern)
12. **Bridal Shops** (designer, budget friendly, plus size, vintage, modern)

## ⚙️ Configuration

### Rate Limiting
- **10 requests per minute** (conservative to manage costs)
- **200 requests per day** (daily budget control)
- **6-second delays** between requests

### Cost Management
- **Real-time cost tracking**
- **Daily spending limits**
- **Automatic pause on budget limits**
- **Progress save/resume capability**

## 📈 Progress Tracking

### Progress File
The script creates `vendor-collection-progress.json` with:
- Completed searches
- Current position (state, city, category)
- Statistics (success/failure rates, costs)
- Daily request counts

### Resume Capability
- **Automatic resume** from where you left off
- **Graceful shutdown** with Ctrl+C
- **Daily limit handling** (auto-pause and resume next day)

## 🔧 How It Works

### Smart Collection Process
1. **Check existing cache** - Skip if data is fresh
2. **Call Google vendors API** - Use existing Edge Function
3. **Automatic caching** - Store results for 24 hours
4. **Progress tracking** - Save state after each request
5. **Rate limiting** - Respect API limits and costs

### Leverages Existing Infrastructure
- **Uses `search-google-vendors` Edge Function** (already working)
- **Built-in caching system** (`vendor_cache` table)
- **Existing DataForSEO integration** (no new setup needed)
- **Error handling and retry logic** (production-ready)

## 📊 Expected Statistics

### Collection Metrics
```
Total Searches: 15,000+ (estimated)
States: 50
Cities: 200+
Categories: 12
Subcategories: 6-8 per category
Rate: 10 requests/minute
Daily Limit: 200 requests
Timeline: 30-60 days
```

### Cost Breakdown
```
DataForSEO API: $0.01-0.02 per search
Total Estimated: $150-400
Daily Budget: $2-4
ROI: Massive (instant search results)
```

## 🎛️ Monitoring & Control

### Real-time Statistics
- Progress percentage
- Success/failure rates
- Cost tracking
- Time estimates
- Cache hit ratios

### Control Features
- **Pause/Resume** with Ctrl+C
- **Daily limits** prevent overspending
- **Error handling** with automatic retries
- **Manual override** capabilities

## 🔍 Sample Output

```
🚀 Starting Comprehensive Vendor Collection
📍 Collecting from 50 states
🏪 12 vendor categories
📊 Estimated total searches: 15,247
⏱️  Rate limit: 10 requests/minute
💰 Daily limit: 200 requests/day

🏛️  Processing California...

🏙️  Processing Los Angeles, California...
🔍 Calling API: photographer in Los Angeles, CA (engagement specialists)
✅ API Success: 22 results for photographer in Los Angeles, CA (Cost: $0.02)

📊 COLLECTION STATISTICS
========================
Total Searches: 1,247/15,247 (8.2%)
Successful: 1,198
Failed: 12
Skipped (cached): 37
Total Cost: $24.96
Daily Requests: 187/200
Rate: 9.8 requests/minute
Estimated Time Remaining: 1,428 minutes
========================
```

## 🚨 Important Notes

### Before Starting
1. **Check DataForSEO credits** - Ensure sufficient balance
2. **Set daily budget** - Monitor costs closely
3. **Test with small batch** - Run a few searches first
4. **Backup database** - Always good practice

### During Collection
- **Monitor progress** regularly
- **Check costs** daily
- **Let it run uninterrupted** for best efficiency
- **Use Ctrl+C** to pause gracefully if needed

### After Completion
- **Verify cache coverage** - Check vendor_cache table
- **Test search performance** - Should be lightning fast
- **Monitor cache expiration** - Refresh as needed
- **Celebrate** - You now have a national vendor database!

## 🛠️ Troubleshooting

### Common Issues

**Script won't start:**
```bash
# Check Node.js version
node --version

# Install dependencies
npm install

# Check environment variables
echo $VITE_SUPABASE_URL
```

**API errors:**
- Check DataForSEO credits
- Verify Supabase connection
- Check rate limiting

**Progress lost:**
- Check `vendor-collection-progress.json`
- Script auto-resumes from last position
- Manual restart: `npm run collect-vendors`

## 📞 Support

If you encounter issues:
1. Check the progress file for current status
2. Review console logs for error details
3. Verify API credentials and limits
4. Test individual API calls first

## 🎉 Success Metrics

After completion, you'll have:
- ✅ **15,000+ cached vendor searches**
- ✅ **National coverage** of all major markets
- ✅ **Instant search results** (no API delays)
- ✅ **Cost-effective operation** (one-time investment)
- ✅ **Comprehensive vendor database** for entire US

Your wedding vendor website will be transformed into a truly national directory with lightning-fast search capabilities!
