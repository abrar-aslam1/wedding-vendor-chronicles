# 🚀 Production Deployment Guide - Instagram Vendor Automation with GitHub Actions

## Overview

This guide sets up automated Instagram vendor collection using GitHub Actions workflows with approval-based oversight. The system runs on a schedule and requires admin approval for major data collection operations.

## 📋 Prerequisites

- ✅ GitHub repository with Actions enabled
- ✅ Production website deployed (Netlify/Vercel/etc.)
- ✅ Supabase database with `automation_approvals` table
- ✅ Admin dashboard accessible at `/admin/approvals`
- ✅ Apify account for Instagram data collection

## 🔧 Step 1: Configure GitHub Repository Secrets

Navigate to your GitHub repository → Settings → Secrets and Variables → Actions

### Required Secrets:

```bash
# Production Website
APP_URL = "https://your-production-site.com"

# Database & API
NEXT_PUBLIC_SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE = "your-service-role-key-here"
INGEST_SHARED_KEY = "your-secure-ingest-api-key"

# Optional: Apify Integration (if using direct API)
APIFY_API_TOKEN = "your-apify-token"
```

### How to Get Each Secret:

#### 1. `APP_URL`
- Your production website URL (e.g., `https://findmyweddingvendor.com`)
- Used for admin dashboard links and API calls

#### 2. `NEXT_PUBLIC_SUPABASE_URL`
- From your Supabase project settings → API
- Format: `https://abcdefgh.supabase.co`

#### 3. `SUPABASE_SERVICE_ROLE`
- From Supabase project settings → API → Service Role Key
- **⚠️ KEEP PRIVATE** - Full database access

#### 4. `INGEST_SHARED_KEY`
- Generate a secure random string: `openssl rand -hex 32`
- Must match the key in your production environment variables
- Used to authenticate automation → ingest API calls

#### 5. `APIFY_API_TOKEN` (Optional)
- From Apify Console → Integrations → API
- Only needed if using direct Apify API instead of MCP

## 📅 Step 2: Workflow Schedule Overview

Your GitHub Actions are configured to run:

| Workflow | Schedule | Approval Required | Purpose |
|----------|----------|-------------------|---------|
| **Daily QC** | 6 AM UTC daily | ❌ No | Generate quality reports |
| **Weekly Maintenance** | 7 AM UTC Sundays | ❌ No | Refresh existing data |
| **Tier 1 Backfill** | 5 AM UTC, 1st of month | ✅ **YES** | Collect ~400 vendors |
| **Tier 2 Backfill** | 5 AM UTC, 2nd of month | ✅ **YES** | Collect ~300 vendors |

### Time Zone Reference:
- **6 AM UTC** = 1 AM EST / 2 AM EDT
- **7 AM UTC** = 2 AM EST / 3 AM EDT  
- **5 AM UTC** = 12 AM EST / 1 AM EDT

## ✅ Step 3: Enable GitHub Actions Workflows

1. **Commit and push** all workflow files to your repository
2. **Navigate to** GitHub → Actions tab
3. **Verify workflows** appear in the list:
   - Instagram Vendor Automation - Daily QC Report
   - Instagram Vendor Automation - Weekly Maintenance  
   - Instagram Vendor Automation - Tier 1 Backfill (Requires Approval)
   - Instagram Vendor Automation - Tier 2 Backfill (Requires Approval)

## 🎯 Step 4: Test the System

### 4.1 Test Manual Workflow Trigger
```bash
# Go to GitHub → Actions → Select "Daily QC Report"
# Click "Run workflow" → Use workflow from main
# Monitor the execution logs
```

### 4.2 Test Approval Workflow
```bash
# Go to GitHub → Actions → Select "Tier 1 Backfill"
# Click "Run workflow" → Keep force_run as "false"
# Should create approval request and wait
# Check your admin dashboard at: https://your-site.com/admin/approvals
```

### 4.3 Test Admin Dashboard
```bash
# Visit: https://your-site.com/admin/approvals
# Login with admin credentials
# Verify you see pending approval requests
# Test approve/reject functionality
```

## 🔄 Step 5: Production Approval Workflow

### How It Works:

1. **📅 Scheduled Trigger**: GitHub Actions runs monthly (Tier 1: 1st, Tier 2: 2nd)
2. **🔍 Approval Check**: Workflow queries your Supabase `automation_approvals` table
3. **❌ Not Approved**: Creates approval request and stops execution
4. **📧 Notification**: You get GitHub Actions notification about pending approval
5. **🖥️ Admin Review**: You visit `/admin/approvals` to review job details
6. **✅ Approval**: You approve the job in your admin dashboard
7. **🚀 Execution**: Next scheduled run detects approval and executes collection
8. **📊 Results**: 300-400 new vendors added to your database

### Approval States:

```bash
# Pending: Workflow created request, waiting for your approval
# Approved: You approved via admin dashboard, next run will execute
# Rejected: You rejected with reason, workflow will not run
```

## 🛠️ Step 6: Emergency Operations

### Force Run (Emergency Only)
```bash
# Go to GitHub → Actions → Select workflow
# Click "Run workflow"
# Set force_run to "true"
# This bypasses approval check - USE WITH CAUTION
```

### Manual Vendor Collection
```bash
# SSH to your server or run locally
npm run play:backfill:tier  # With TIER=1 env var
npm run play:backfill:city  # With CITY/STATE/CATEGORY env vars
npm run play:qc:daily       # Generate QC report
npm run play:maintain:due   # Refresh due vendors
```

## 📊 Step 7: Monitoring & Logs

### GitHub Actions Logs
- Navigate to Actions tab → Select workflow run
- View detailed logs for each step
- Monitor for rate limiting or API errors

### Admin Dashboard Monitoring  
- Visit `/admin/approvals` regularly
- Review vendor quality samples before approving
- Monitor approval statistics

### Production Logs
```bash
# If using server deployment
tail -f logs/automation.log

# Check database for new vendors
SELECT COUNT(*) FROM vendors WHERE created_at > NOW() - INTERVAL '1 day';
```

## 🔒 Security Best Practices

### Environment Variables
- ✅ Use GitHub Secrets for all sensitive data
- ✅ Never commit API keys to repository
- ✅ Rotate keys periodically

### Database Access
- ✅ Use service role only for automation
- ✅ Enable RLS (Row Level Security) on tables
- ✅ Monitor database usage and queries

### Rate Limiting
- ✅ Keep default 1 RPS limit for Instagram data
- ✅ Monitor API usage in Apify dashboard
- ✅ Set up alerts for quota limits

## 🚨 Troubleshooting

### Common Issues:

#### "Approval required" but no request visible
```bash
# Check GitHub Actions logs for errors
# Verify SUPABASE_SERVICE_ROLE secret is correct
# Check database connection in admin dashboard
```

#### Workflow fails with "unauthorized"
```bash
# Verify all GitHub secrets are set correctly
# Check INGEST_SHARED_KEY matches production
# Confirm APP_URL points to correct production site
```

#### No vendors collected despite approval
```bash
# Check GitHub Actions logs for MCP tool errors
# Verify Apify integration is working
# Test manual collection with same parameters
```

#### Rate limiting errors
```bash
# Check if MCP_APIFY_RPS/BURST values are too high
# Default: RPS=1, BURST=3 (safe for free tiers)
# Monitor Apify dashboard for quota usage
```

## 📈 Expected Results

### After Initial Setup:
- ✅ Daily QC reports in GitHub Actions logs
- ✅ Weekly maintenance runs automatically  
- ✅ Monthly approval requests appear in admin dashboard

### After Approving Tier 1 Backfill:
- ✅ ~400 Instagram vendors collected from major metros
- ✅ Data appears in admin dashboard vendor preview
- ✅ Vendors available in your production search

### Monthly Growth:
- ✅ 600-700 new vendors per month (both tiers)
- ✅ Automatic quality filtering and deduplication
- ✅ Comprehensive approval audit trail

## 🎉 Success Metrics

Your automation is working correctly when:

- ✅ **GitHub Actions** show green checkmarks for all workflows
- ✅ **Admin dashboard** shows realistic pending approval counts
- ✅ **Vendor previews** display high-quality businesses with contact info
- ✅ **Production search** returns newly collected Instagram vendors
- ✅ **Database growth** shows 300-400 new vendors after each approved backfill

## 🆘 Support & Maintenance

### Monthly Tasks:
- Review and approve pending automation jobs
- Monitor vendor quality in admin dashboard  
- Check GitHub Actions for any failures
- Review database growth and performance

### Quarterly Tasks:
- Rotate GitHub secrets and API keys
- Review and adjust rate limiting if needed
- Analyze vendor collection effectiveness
- Update seed data for new cities/categories

Your Instagram vendor automation system is now production-ready with proper oversight and quality control! 🚀
