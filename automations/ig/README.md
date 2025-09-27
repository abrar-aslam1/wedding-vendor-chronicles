# Instagram Vendor Collection Automation

This directory contains MCP-driven automation playbooks for collecting Instagram vendor data using Apify tools.

## Playbooks

- `backfill-tier.yml` - Backfill vendors by tier (major cities, medium cities, etc.)
- `backfill-city.yml` - Backfill vendors for specific city/state/category combinations
- `maintenance-due.yml` - Refresh vendors that are due for updates
- `qc-daily-report.yml` - Generate daily quality control reports

## Usage

```bash
# Backfill by tier
TIER=1 LIMIT_PER_ROW=40 MAX_ENRICH=400 pnpm play:backfill:tier

# Backfill specific city
CITY="Dallas" STATE="TX" CATEGORY="wedding-planners" pnpm play:backfill:city

# Run maintenance 
pnpm play:maintain:due

# Generate QC report
pnpm play:qc:daily
```

## Environment Variables Required

- `APP_URL` - Base URL for API calls
- `INGEST_SHARED_KEY` - Authentication key for ingest endpoint
- `MCP_APIFY_RPS` - Rate limit (requests per second)
- `MCP_APIFY_BURST` - Burst limit for rate limiting
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE` - Service role key for database access
