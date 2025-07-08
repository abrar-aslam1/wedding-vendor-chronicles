# Enterprise Instagram Wedding Vendor Collection System

A scalable Python-based system for collecting Instagram profiles of wedding vendors (makeup artists, hair stylists, etc.) integrated with Supabase.

## Features

- 🎯 **Targeted Collection**: Focuses on wedding-related vendors in major US markets
- 🔍 **Smart Quality Scoring**: Filters profiles based on bio content, follower count, and business indicators
- 📍 **Geographic Coverage**: Systematically covers major and secondary wedding markets
- 🔄 **Supabase Integration**: Direct integration with existing Wedding Vendor Chronicles database
- 📊 **Built-in Analytics**: Track collection performance and coverage
- 🚀 **Scalable Architecture**: Supports Docker deployment and distributed processing

## Quick Start

### 1. Prerequisites

- Python 3.9+
- Apify account with API token
- Supabase project with service key
- Access to the Wedding Vendor Chronicles database

### 2. Installation

```bash
# Clone and navigate to the script directory
cd scripts/python/instagram_scraper

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your credentials
```

### 3. Configuration

Edit `.env` file with your credentials:

```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
APIFY_TOKEN=your-apify-token

# Optional
MIN_FOLLOWERS=500
QUALITY_THRESHOLD=4
```

### 4. Usage

#### Collect All Categories
```bash
python enterprise_collection.py collect-all
```

#### Collect Specific Category
```bash
python enterprise_collection.py collect-category makeup-artists
python enterprise_collection.py collect-category hair-stylists
```

#### Manual Collection with Custom Hashtags
```bash
python enterprise_collection.py collect-hashtags makeup-artists "#dallasmua,#dallasbridal,#texasmakeupartist"
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f instagram-scraper

# Stop service
docker-compose down
```

### Option 2: Systemd Service (Linux VPS)

```bash
# Copy service file
sudo cp instagram-scraper.service /etc/systemd/system/

# Update paths in service file
sudo nano /etc/systemd/system/instagram-scraper.service

# Enable and start service
sudo systemctl enable instagram-scraper
sudo systemctl start instagram-scraper

# Check status
sudo systemctl status instagram-scraper
```

### Option 3: Manual Execution

```bash
# Activate virtual environment
source venv/bin/activate

# Run collection
python enterprise_collection.py collect-all
```

## How It Works

### 1. Geographic Strategy
The system targets major wedding markets across the US:
- **Primary Markets**: Dallas, Houston, NYC, LA, Chicago, Miami, etc.
- **Secondary Markets**: Fort Worth, Sacramento, Tampa, Columbus, etc.

### 2. Quality Scoring
Profiles are scored (0-10) based on:
- **Bio Content**: Wedding/bridal keywords, location info, booking details
- **Metrics**: Follower count, post count
- **Business Indicators**: External URL, verification, business account status

### 3. Data Collection Flow
1. Generate location and category-specific hashtags
2. Query Instagram via Apify API
3. Filter profiles by quality score and follower count
4. Extract business information (contact, location, etc.)
5. Save to Supabase `instagram_vendors` table

### 4. Supabase Integration
The system integrates seamlessly with the existing database:
- Uses the same `instagram_vendors` table structure
- Respects unique constraints on `(instagram_handle, category)`
- Maintains compatibility with existing vendor search functionality

## Categories Supported

- `makeup-artists`: Bridal makeup artists, MUAs
- `hair-stylists`: Wedding hair stylists, updo specialists

### Subcategories Detected
- **Makeup Artists**: airbrush-specialist, natural-makeup, glam-specialist, cultural-specialist
- **Hair Stylists**: updo-specialist, extensions-specialist, color-specialist, textured-hair-specialist

## Performance & Scaling

### Expected Collection Rates
- **Conservative**: 500-1,000 profiles/day per category
- **With Scaling**: 2,000-5,000 profiles/day per category

### Cost Estimates
- Apify Instagram Scraper: ~$0.005 per profile
- Monthly budget for 30,000 profiles: ~$150

### Scaling Options
1. **Multiple Apify Accounts**: Increase concurrent scraping
2. **Distributed Deployment**: Use Redis queue for multiple workers
3. **Geographic Partitioning**: Assign regions to different instances

## Monitoring & Maintenance

### Logs
- Application logs: `instagram_collection.log`
- Docker logs: `docker-compose logs instagram-scraper`
- Systemd logs: `journalctl -u instagram-scraper`

### Database Queries
```sql
-- Check collection progress
SELECT category, COUNT(*) as total, 
       COUNT(DISTINCT state) as states_covered,
       AVG(follower_count) as avg_followers
FROM instagram_vendors
GROUP BY category;

-- Recent high-quality profiles
SELECT instagram_handle, business_name, follower_count, city, state
FROM instagram_vendors
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND follower_count > 5000
ORDER BY follower_count DESC
LIMIT 20;
```

## Troubleshooting

### Common Issues

1. **Rate Limiting**
   - Increase delays between requests in code
   - Use residential proxies (already configured)

2. **Low Quality Results**
   - Adjust `QUALITY_THRESHOLD` in .env
   - Review hashtag strategy for location

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure service key has proper permissions

4. **Memory Issues**
   - Reduce batch sizes
   - Increase Docker memory limits

## Advanced Configuration

### Custom Location Strategy
Edit `GeographicStrategy` class in `enterprise_collection.py` to add/modify target markets.

### Custom Quality Scoring
Modify `calculate_quality_score()` method to adjust scoring criteria.

### Integration with Existing Scripts
The collected data is fully compatible with existing vendor search functionality:
- Same database schema
- Same category structure
- Can be queried alongside Google vendors

## Support & Updates

For issues or feature requests related to the Instagram scraper:
1. Check logs for error details
2. Verify environment configuration
3. Ensure Apify account has sufficient credits
4. Review Supabase connection and permissions

The system is designed to run autonomously once configured, building a comprehensive directory of wedding vendors from Instagram.