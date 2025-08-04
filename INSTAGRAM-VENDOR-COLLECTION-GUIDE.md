# Instagram Vendor Collection System - Complete Guide

## 🎯 Overview

This system uses Bright Data MCP to systematically collect high-quality wedding vendors from Instagram across multiple cities and categories. It's designed to scale your vendor database efficiently while maintaining quality standards.

## 🏗️ System Architecture

### Core Components

1. **InstagramCollector Class** - Base collection engine with mock data for testing
2. **ProductionInstagramCollector Class** - Production version with real MCP integration
3. **Wedding Categories Configuration** - 12 wedding vendor categories with search optimization
4. **Target Cities Database** - 24 cities across 3 priority tiers
5. **Quality Scoring Algorithm** - Comprehensive vendor evaluation system

### Files Structure

```
scripts/
├── instagram-vendor-collection-system.js  # Core collection engine
├── run-instagram-collection.js           # Runner with MCP integration
├── test-brightdata-instagram.js          # Testing utilities
└── instagram-vendor-collector.js         # Original prototype
```

## 🎯 Wedding Vendor Categories

### Configured Categories (12 Total)

| Category | Search Terms | Min Followers | Quality Weight |
|----------|-------------|---------------|----------------|
| **Wedding Photographer** | wedding photographer, bridal photographer, engagement photographer, wedding photography | 500 | 1.0 |
| **Wedding Videographer** | wedding videographer, wedding cinematographer, wedding filmmaker, bridal videography | 300 | 0.9 |
| **Wedding Planner** | wedding planner, wedding coordinator, event planner wedding, bridal planner | 1000 | 1.2 |
| **Wedding Venue** | wedding venue, wedding reception venue, bridal venue, event venue wedding | 500 | 1.1 |
| **Wedding Florist** | wedding florist, bridal florist, wedding flowers, floral designer wedding | 300 | 0.8 |
| **Wedding Caterer** | wedding caterer, wedding catering, bridal catering, event catering wedding | 200 | 0.7 |
| **Wedding DJ** | wedding dj, wedding music, bridal dj, reception dj | 200 | 0.6 |
| **Wedding Band** | wedding band, wedding music band, live wedding music, bridal band | 300 | 0.7 |
| **Wedding Cake** | wedding cake, wedding baker, bridal cake, custom wedding cake | 200 | 0.6 |
| **Wedding Dress** | wedding dress, bridal gown, wedding boutique, bridal shop | 500 | 0.8 |
| **Wedding Makeup** | wedding makeup, bridal makeup, wedding makeup artist, bridal beauty | 300 | 0.7 |
| **Wedding Hair** | wedding hair, bridal hair, wedding hairstylist, bridal hairstylist | 300 | 0.7 |

## 🏙️ Target Cities

### Priority 1 - Major Markets (8 Cities)
- New York, NY (8.4M population)
- Los Angeles, CA (4.0M population)
- Chicago, IL (2.7M population)
- Miami, FL (2.7M population)
- San Francisco, CA (2.7M population)
- Boston, MA (2.4M population)
- Washington, DC (2.3M population)
- Seattle, WA (2.2M population)

### Priority 2 - Secondary Markets (8 Cities)
- Atlanta, GA | Denver, CO | Nashville, TN | Portland, OR
- San Diego, CA | Phoenix, AZ | Las Vegas, NV | Philadelphia, PA

### Priority 3 - Emerging/Destination Markets (8 Cities)
- Austin, TX | Charleston, SC | Savannah, GA | Napa, CA
- Aspen, CO | Martha's Vineyard, MA | Hamptons, NY | Big Sur, CA

## 📊 Quality Scoring Algorithm

### Scoring Breakdown (100 Points Total)

1. **Follower Count (25 points)**
   - 50,000+: 25 points
   - 20,000+: 22 points
   - 10,000+: 20 points
   - 5,000+: 17 points
   - 2,000+: 15 points
   - 1,000+: 12 points
   - 500+: 8 points
   - 200+: 5 points

2. **Account Verification (15 points)**
   - Verified account: 8 points
   - Business account: 7 points

3. **Contact Information (15 points)**
   - Email available: 5 points
   - Phone available: 5 points
   - Website available: 5 points

4. **Engagement Quality (20 points)**
   - 5%+ engagement: 20 points
   - 3%+ engagement: 17 points
   - 2%+ engagement: 15 points
   - 1%+ engagement: 12 points
   - 0.5%+ engagement: 8 points
   - 0.2%+ engagement: 5 points

5. **Content Quality & Relevance (15 points)**
   - 90%+ quality & wedding relevance: 15 points
   - 80%+ quality & wedding relevance: 13 points
   - 70%+ quality & wedding relevance: 11 points
   - 60%+ quality & wedding relevance: 8 points
   - 50%+ quality & wedding relevance: 5 points

6. **Activity & Consistency (10 points)**
   - Recent activity (last 30 days): 5 points
   - High posting consistency: 5 points

### Category-Specific Weighting
Final score is multiplied by category quality weight:
- Wedding Planner: 1.2x (highest priority)
- Wedding Venue: 1.1x
- Wedding Photographer: 1.0x (baseline)
- Wedding Videographer: 0.9x
- Other categories: 0.6x - 0.8x

## 🚀 Usage Guide

### 1. Display System Information
```bash
node scripts/run-instagram-collection.js --info
```

### 2. Run Test Collection (Mock Data)
```bash
node scripts/run-instagram-collection.js --test
```

### 3. Collect Specific Category
```bash
node scripts/run-instagram-collection.js --category="Wedding Photographer" --cities=5
```

### 4. Production Collection (Requires MCP Integration)
```bash
node scripts/run-instagram-collection.js --production --cities=3 --categories=4
```

### 5. Custom Configuration
```bash
# Collect from priority 1 cities only
node scripts/instagram-vendor-collection-system.js --cities=8 --priority=1

# Focus on photographers and videographers
node scripts/instagram-vendor-collection-system.js --categories=2
```

## 🔧 MCP Integration

### Bright Data MCP Tools Used

1. **search_engine** - Find Instagram profiles via Google search
   ```javascript
   {
     server_name: "github.com/luminati-io/brightdata-mcp",
     tool_name: "search_engine",
     arguments: {
       query: 'site:instagram.com "wedding photographer" "New York" "NYC"',
       engine: "google"
     }
   }
   ```

2. **web_data_instagram_profiles** - Extract detailed profile data
   ```javascript
   {
     server_name: "github.com/luminati-io/brightdata-mcp",
     tool_name: "web_data_instagram_profiles",
     arguments: {
       url: "https://www.instagram.com/rubyolivia.photography/"
     }
   }
   ```

3. **web_data_instagram_posts** - Analyze post engagement and content
   ```javascript
   {
     server_name: "github.com/luminati-io/brightdata-mcp",
     tool_name: "web_data_instagram_posts",
     arguments: {
       url: "https://www.instagram.com/rubyolivia.photography/"
     }
   }
   ```

### Real Data Example (Ruby Olivia Photography)
```json
{
  "account": "rubyolivia.photography",
  "followers": 33459,
  "posts_count": 1055,
  "is_business_account": true,
  "is_verified": false,
  "avg_engagement": 0.0182,
  "external_url": ["http://rubyoliviaphotography.com/"],
  "biography": "Documenting weddings on Film & Digital, Based in NYC\nAs seen in Vogue Australia, Brides, & Together Journal",
  "category_name": "Photographer"
}
```

## 📈 Expected Collection Results

### Per City/Category Combination
- **Search Results**: 5-15 Instagram profiles found
- **Processed Profiles**: 10-20 profiles analyzed
- **Quality Vendors**: 3-8 vendors meeting criteria
- **Success Rate**: 30-60% (varies by category and city)

### Daily Collection Capacity
- **Conservative**: 100-200 vendor profiles per day
- **Aggressive**: 500-1000 vendor profiles per day
- **Quality Rate**: 40-70% of processed profiles meet standards

### Database Growth Projections

| Timeframe | Cities | Categories | Expected Vendors |
|-----------|--------|------------|------------------|
| Week 1 | 8 | 3 | 500-800 |
| Month 1 | 16 | 6 | 2,000-3,500 |
| Month 3 | 24 | 12 | 8,000-15,000 |
| Month 6 | 50+ | 12 | 20,000-40,000 |

## 🛡️ Quality Assurance

### Automatic Filtering
- Minimum follower requirements by category
- Business account preference
- Recent activity verification
- Wedding content relevance check
- Duplicate prevention

### Manual Review Triggers
- Vendors with quality scores 30-50 (borderline)
- Unverified business accounts with high engagement
- Profiles with unusual follower/engagement ratios

## 📊 Monitoring & Analytics

### Collection Statistics Tracked
- Total searches performed
- Profiles analyzed vs. successful extractions
- Quality vendors added vs. low-quality skipped
- Success rates by city and category
- Average quality scores by category

### Performance Metrics
- Collection speed (profiles per hour)
- Quality rate (% meeting standards)
- Category distribution
- Geographic coverage
- Engagement score averages

## 🔄 Automation & Scheduling

### Recommended Schedule
- **Daily**: Update existing vendor engagement scores
- **Weekly**: Collect new vendors from priority 1 cities
- **Monthly**: Expand to priority 2 and 3 cities
- **Quarterly**: Review and optimize quality criteria

### Rate Limiting
- 2-second delay between profile extractions
- 5-second delay between search terms
- 10-second delay between categories
- 30-second delay between cities

## 🚨 Compliance & Ethics

### Instagram Terms Compliance
- Public data only
- Respect rate limits
- No automated interactions
- Proper attribution

### Data Privacy
- Store only publicly available information
- Provide opt-out mechanisms
- Regular data cleanup
- GDPR compliance considerations

## 🎯 Next Steps

### Phase 1: Testing & Validation (Week 1)
1. Run test collections with mock data
2. Validate MCP integration with real calls
3. Test quality scoring algorithm
4. Optimize search terms and filters

### Phase 2: Limited Production (Week 2-4)
1. Start with 2-3 priority 1 cities
2. Focus on Wedding Photographer and Planner categories
3. Monitor quality and adjust parameters
4. Build admin dashboard for monitoring

### Phase 3: Full Scale Deployment (Month 2+)
1. Expand to all priority 1 cities
2. Add all 12 vendor categories
3. Implement automated scheduling
4. Scale to priority 2 and 3 cities

### Phase 4: Advanced Features (Month 3+)
1. AI-powered content analysis
2. Competitive intelligence
3. Market trend analysis
4. Vendor recruitment automation

This system will significantly expand your wedding vendor database while maintaining high quality standards and providing valuable market insights for your platform.
