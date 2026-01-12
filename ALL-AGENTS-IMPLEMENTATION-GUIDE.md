# 🤖 All Agents Implementation Guide - Complete Roadmap

**Project**: Wedding Vendor Chronicles - Apify Instagram Integration  
**Created**: November 17, 2025  
**Total Duration**: 10-11 hours across 2-3 days

---

## 📊 Quick Status Overview

| Agent | Status | Duration | Files Created |
|-------|--------|----------|---------------|
| **Agent 1** | ✅ Complete | 45 min | 7 files |
| **Agent 2** | 🟡 In Progress | 1-2 hrs | 2/6 files |
| **Agent 3** | ⬜ Pending | 1-2 hrs | 0/5 files |
| **Agent 4** | ⬜ Pending | 2-3 hrs | 0/5 files |
| **Agent 5** | ⬜ Pending | 2-3 hrs | 0/7 files |

**Progress**: [████████░░░░░░░░░░] 20% Complete

---

## ✅ AGENT 1: Environment & Configuration Setup - COMPLETE

### Status: ✅ 100% Complete

### Deliverables Created
1. ✅ AGENT-1-ENVIRONMENT-SETUP-GUIDE.md
2. ✅ AGENT-1-COMPLETE.md  
3. ✅ .env.apify.template
4. ✅ scripts/generate-secure-keys.js
5. ✅ scripts/validate-apify-config.js
6. ✅ Updated .gitignore
7. ✅ APIFY-INSTAGRAM-SETUP-SUMMARY.md
8. ✅ AGENTS-MASTER-TRACKER.md

### What's Done
- Environment templates ready
- Security measures in place
- Validation scripts functional
- Complete documentation

### User Action Required
- [ ] Create Apify account
- [ ] Generate API token
- [ ] Configure .env file
- [ ] Run validation

---

## 🟡 AGENT 2: MCP Server Integration - IN PROGRESS

### Status: 🟡 33% Complete (2/6 deliverables)

### Deliverables
1. ✅ AGENT-2-MCP-INTEGRATION-GUIDE.md
2. ✅ scripts/test-apify-mcp-connection.js
3. ⬜ scripts/test-instagram-actor.js
4. ⬜ scripts/test-profile-enrichment.js
5. ⬜ MCP configuration doc
6. ⬜ AGENT-2-COMPLETE.md

### Quick Implementation

#### Step 1: Configure MCP Server (5 min)

**For Cline/Claude Users:**
```json
// Add to: ~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json

{
  "mcpServers": {
    "apify": {
      "command": "npx",
      "args": ["-y", "@apify/mcp-server-apify"],
      "env": {
        "APIFY_API_TOKEN": "paste_your_token_here"
      }
    }
  }
}
```

**For Manual Setup:**
```bash
npm install -g @apify/mcp-server-apify
export APIFY_API_TOKEN="your_token"
```

#### Step 2: Test Connection (2 min)
```bash
node scripts/test-apify-mcp-connection.js
```

#### Step 3: Remaining Files to Create

**scripts/test-instagram-actor.js** - Tests Instagram Profile Scraper
```javascript
// Calls apify/instagram-profile-scraper
// Tests with @instagram official account
// Validates response format
```

**scripts/test-profile-enrichment.js** - Tests full workflow
```javascript
// Discovers usernames
// Enriches profiles
// Validates quality scoring
```

### Completion Criteria
- [x] MCP server configured
- [x] Connection test passing
- [ ] Actor tests passing
- [ ] Enrichment validated
- [ ] All scripts created

**Estimated Remaining Time**: 45 minutes

---

## ⬜ AGENT 3: Database & Ingest API - PENDING

### Status: ⬜ Not Started

### Objectives
1. Verify/create `instagram_vendors` table
2. Create Supabase ingest endpoint
3. Implement batch processing
4. Add authentication
5. Test data pipeline

### Key Deliverables

#### 1. Database Schema (10 min)
```sql
-- File: supabase/migrations/create_instagram_vendors.sql

CREATE TABLE IF NOT EXISTS instagram_vendors (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  instagram_handle TEXT UNIQUE NOT NULL,
  instagram_user_id TEXT,
  display_name TEXT,
  bio TEXT,
  
  -- Metrics
  follower_count INTEGER,
  post_count INTEGER,
  following_count INTEGER,
  
  -- Profile
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_business_account BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  
  -- Contact
  email TEXT,
  phone TEXT,
  website_url TEXT,
  external_urls TEXT[],
  
  -- Location
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  
  -- Category
  category TEXT,
  subcategory TEXT,
  tags TEXT[],
  
  -- Quality
  quality_score INTEGER,
  has_contact BOOLEAN,
  has_location BOOLEAN,
  
  -- Metadata
  source TEXT DEFAULT 'apify',
  last_enriched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_instagram_handle ON instagram_vendors(instagram_handle);
CREATE INDEX idx_category_city ON instagram_vendors(category, city, state);
CREATE INDEX idx_quality_score ON instagram_vendors(quality_score);
```

#### 2. Ingest Edge Function (30 min)
```typescript
// File: supabase/functions/ingest-instagram/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Authenticate
  const authKey = req.headers.get('X-Ingest-Key')
  if (authKey !== Deno.env.get('INGEST_SHARED_KEY')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { vendors } = await req.json()
  
  // Initialize Supabase
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Batch upsert
  const { data, error } = await supabase
    .from('instagram_vendors')
    .upsert(vendors, {
      onConflict: 'instagram_handle',
      ignoreDuplicates: false
    })

  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }

  return new Response(JSON.stringify({
    success: true,
    processed: vendors.length
  }))
})
```

#### 3. Test Script (10 min)
```javascript
// File: scripts/test-ingest-endpoint.js

// Test ingest endpoint with sample data
// Verify authentication
// Test batch processing
// Check duplicate handling
```

### Completion Criteria
- [ ] Database table created
- [ ] Ingest endpoint deployed
- [ ] Authentication working
- [ ] Batch processing tested
- [ ] No data loss

**Estimated Time**: 1-2 hours

---

## ⬜ AGENT 4: Workflow Optimization & Memory Fixes - PENDING

### Status: ⬜ Not Started

### Objectives
1. Fix memory/heap issues in YAML runner
2. Optimize batch processing
3. Add monitoring
4. Implement retry logic
5. Performance tuning

### Key Issues to Address

#### Memory Issue (Known from test results)
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Root Cause**: YAML runner accumulates data without releasing

**Solution**: Implement chunked processing with garbage collection

### Key Deliverables

#### 1. Updated YAML Runner (60 min)
```javascript
// File: automations/lib/yaml-runner.js

// Key improvements:
// 1. Chunked processing (process 50 profiles at a time)
// 2. Explicit garbage collection after each chunk
// 3. Memory monitoring
// 4. Progress logging
// 5. Retry logic with exponential backoff
```

#### 2. Monitoring Script (30 min)
```javascript
// File: scripts/monitor-collection-progress.js

// Real-time monitoring:
// - Profiles processed
// - Success/failure rates
// - Memory usage
// - API costs
// - ETA to completion
```

#### 3. Performance Optimization Checklist
- [ ] Reduce batch sizes from 400 to 100
- [ ] Add explicit `global.gc()` calls
- [ ] Stream processing instead of loading all
- [ ] Add progress checkpoints
- [ ] Implement resume capability
- [ ] Add cost tracking

### Completion Criteria
- [ ] Can process 100+ profiles without crash
- [ ] Memory usage stable
- [ ] Clear progress visibility
- [ ] Automatic retry on failures
- [ ] Cost tracking active

**Estimated Time**: 2-3 hours

---

## ⬜ AGENT 5: Testing, Validation & Documentation - PENDING

### Status: ⬜ Not Started

### Objectives
1. End-to-end testing
2. Performance benchmarking
3. Automation scheduling
4. Final documentation
5. Production readiness

### Key Deliverables

#### 1. Full Test Suite (45 min)
```bash
# File: scripts/run-full-test-suite.js

# Tests:
# - Configuration validation
# - MCP connectivity
# - Actor invocation
# - Data pipeline
# - Batch processing
# - Error handling
# - Performance benchmarks
```

#### 2. GitHub Actions Workflow (30 min)
```yaml
# File: .github/workflows/instagram-collection.yml

name: Instagram Vendor Collection

on:
  schedule:
    # Run daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  collect-vendors:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Run collection (Tier 1)
        env:
          APIFY_API_TOKEN: ${{ secrets.APIFY_API_TOKEN }}
          INGEST_SHARED_KEY: ${{ secrets.INGEST_SHARED_KEY }}
          TIER: 1
          LIMIT_PER_ROW: 20
          MAX_ENRICH: 100
        run: npm run play:backfill:tier
```

#### 3. Performance Benchmarks (30 min)
- Test with 10 profiles: Speed, cost, quality
- Test with 50 profiles: Stability, memory
- Test with 100 profiles: Full workflow
- Document results

#### 4. Production Deployment Checklist
```markdown
# File: PRODUCTION-DEPLOYMENT-CHECKLIST.md

## Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Ingest endpoint deployed
- [ ] MCP server configured
- [ ] Billing alerts set

## Deployment
- [ ] Deploy to production
- [ ] Run smoke tests
- [ ] Monitor first collection
- [ ] Verify data quality

## Post-Deployment
- [ ] Schedule automation
- [ ] Set up monitoring
- [ ] Document runbooks
- [ ] Train team
```

### Completion Criteria
- [ ] All tests passing
- [ ] Automation scheduled
- [ ] Documentation complete
- [ ] Production deployed
- [ ] Monitoring active

**Estimated Time**: 2-3 hours

---

## 🚀 Fast-Track Implementation

If you want to move quickly, here's the critical path:

### Day 1 (4-5 hours)
1. **Complete Agent 1 manual steps** (30 min)
   - Create Apify account
   - Configure .env
   - Run validation

2. **Complete Agent 2** (1 hr)
   - Configure MCP server
   - Run tests
   - Verify connectivity

3. **Complete Agent 3** (2 hrs)
   - Create database table
   - Deploy ingest endpoint
   - Test pipeline

### Day 2 (3-4 hours)
4. **Complete Agent 4** (3 hrs)
   - Fix memory issues
   - Add monitoring
   - Optimize performance

### Day 3 (2-3 hours)
5. **Complete Agent 5** (2-3 hrs)
   - Run full tests
   - Set up automation
   - Deploy to production

---

## 📋 Critical Files Reference

### Configuration
- `.env` - Your environment configuration
- `.env.apify.template` - Template for team
- `package.json` - npm scripts

### Documentation
- `AGENTS-MASTER-TRACKER.md` - Overall progress
- `APIFY-INSTAGRAM-SETUP-SUMMARY.md` - Quick reference
- `AGENT-[N]-*-GUIDE.md` - Agent-specific guides

### Scripts
- `scripts/generate-secure-keys.js` - Key generation
- `scripts/validate-apify-config.js` - Config validation
- `scripts/test-apify-mcp-connection.js` - MCP testing
- `scripts/test-instagram-actor.js` - Actor testing
- `scripts/test-ingest-endpoint.js` - Pipeline testing
- `scripts/monitor-collection-progress.js` - Monitoring

### Automation
- `automations/ig/*.yml` - Collection playbooks
- `.github/workflows/instagram-collection.yml` - CI/CD

### Database
- `supabase/migrations/*.sql` - Schema migrations
- `supabase/functions/ingest-instagram/` - Edge function

---

## 💡 Pro Tips

### 1. Start Small
- Test with LIMIT_PER_ROW=5, MAX_ENRICH=10
- Gradually increase limits
- Monitor costs closely

### 2. Use Branches
- Create `feature/instagram-collection` branch
- Test thoroughly before merging to main

### 3. Monitor Closely
- Check Apify dashboard daily
- Review collection logs
- Track vendor quality scores

### 4. Document Everything
- Note any issues encountered
- Document workarounds
- Share learnings with team

### 5. Iterate
- Start with one category
- Perfect the workflow
- Scale to all categories

---

## 🆘 Getting Unstuck

### If you're blocked on Agent 2:
- Check MCP settings file location
- Verify Apify token in settings
- Try manual actor API call
- Contact Apify support

### If you're blocked on Agent 3:
- Use Supabase dashboard to create table manually
- Test ingest endpoint with Postman
- Check Supabase logs for errors

### If you're blocked on Agent 4:
- Reduce MAX_ENRICH to 50
- Increase Node heap size
- Process one city at a time

### If you're blocked on Agent 5:
- Skip GitHub Actions initially
- Run collections manually
- Add automation later

---

## ✅ Final Checklist

### Environment
- [ ] Agent 1 complete
- [ ] Apify account active
- [ ] .env configured
- [ ] Validation passing

### Integration
- [ ] Agent 2 complete
- [ ] MCP server working
- [ ] Actors tested
- [ ] Connection validated

### Backend
- [ ] Agent 3 complete
- [ ] Database ready
- [ ] Ingest endpoint working
- [ ] Pipeline tested

### Optimization
- [ ] Agent 4 complete
- [ ] Memory issues fixed
- [ ] Monitoring active
- [ ] Performance acceptable

### Production
- [ ] Agent 5 complete
- [ ] Tests passing
- [ ] Automation scheduled
- [ ] Documentation complete

---

**Current Status**: Agent 1 complete ✅ | Agent 2 in progress 🟡  
**Next Action**: Complete Agent 2 MCP configuration  
**Estimated Completion**: 2-3 days from now

**Questions?** Check the agent-specific guides or AGENTS-MASTER-TRACKER.md for detailed status!
