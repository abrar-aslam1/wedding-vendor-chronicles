# Match Me Feature - Implementation Guide

**Status**: Phases 1-2 Complete (Database + Scoring Engine)  
**Last Updated**: 2025-01-15

## 📋 Overview

The "Match Me" feature is a namespaced, additive vendor matching system that provides couples with personalized vendor recommendations through a 2-minute quiz. This feature is fully isolated from existing schema and can be toggled on/off via environment variable.

## ✅ Completed Work

### Phase 1: Database Foundation ✓

**Files Created:**
- `scripts/match/create-match-tables.sql` - Complete database schema
- `scripts/match/run-match-migration.js` - Migration runner
- `scripts/match/sync-vendor-projection.js` - Vendor projection sync

**Database Tables Created:**
1. **match_requests** - Quiz submissions with all filter data
2. **match_vendor_projection** - Read-only vendor data optimized for matching
3. **match_results** - Scored matches with rationale
4. **match_rate_limits** - Per-request inquiry throttling (max 5)
5. **match_analytics_events** - KPI tracking events

**Key Features:**
- All tables prefixed with `match_`
- Row Level Security (RLS) policies enabled
- Comprehensive indexes for performance
- Foreign key constraints for data integrity
- Audit triggers for updated_at columns

**Projection Sync:**
- Reads from existing `vendors` table (READ-ONLY)
- Extracts style keywords from descriptions
- Determines price tiers
- Parses cultural specialties
- Generates verification badges
- No writes to existing vendor schema

### Phase 2: Scoring Engine ✓

**Files Created:**
- `src/lib/match/types.ts` - TypeScript type definitions
- `src/lib/match/score.ts` - Pure, testable scoring algorithm

**Scoring Algorithm:**
```typescript
Category Match:        25 points (HARD REQUIREMENT)
Location Proximity:    20 points (distance-based scaling)
Budget Alignment:      20 points (tier overlap)
Style Match:           15 points (keyword matching)
Availability:          10 points (date compatibility)
Social Proof:          10 points (reviews + badges)
-----------------------------------
Total:                100 points
```

**Deal-Breakers (Hard Filters):**
- Category must match selected categories
- Cultural needs must be met (if specified)
- Accessibility features must be present (if specified)
- Guest count must fit venue capacity

**Rationale Generation:**
- Top 3 reasons why vendor was matched
- Human-readable bullets for UI display
- Based on highest-scoring dimensions

## 🔧 Setup Instructions

### 1. Run Database Migration

```bash
# Option A: Using migration script
node scripts/match/run-match-migration.js

# Option B: Manual SQL execution
# Copy contents of scripts/match/create-match-tables.sql
# Paste into Supabase SQL Editor and execute
```

### 2. Sync Vendor Projections

```bash
# Full sync (all vendors)
node scripts/match/sync-vendor-projection.js

# Test with limited vendors
node scripts/match/sync-vendor-projection.js --limit=100

# Sync specific category
node scripts/match/sync-vendor-projection.js --category=venue

# Dry run (preview without writing)
node scripts/match/sync-vendor-projection.js --dry-run --limit=10
```

### 3. Enable Feature Flag

Add to `.env`:
```bash
NEXT_PUBLIC_ENABLE_MATCHING=true
MATCH_MAX_RESULTS_PER_CATEGORY=10
MATCH_MAX_INQUIRIES_PER_REQUEST=5
```

## 📊 Database Schema Details

### match_requests

Stores quiz submissions from couples.

**Key Columns:**
- Core Filters: location, date, guest_count_band, categories, budget, style_vibe
- Optional Toggles: cultural_needs, accessibility, venue_type, alcohol_policy
- Category-Specific: category_filters (JSONB for flexibility)
- Metadata: quiz_completion_time_seconds, ip_address, user_agent

**Indexes:**
- GIN index on categories array
- Composite index on (location_state, location_city)
- Index on date (where not null)

### match_vendor_projection

Read-only projection of vendor data optimized for matching.

**Key Columns:**
- Identity: vendor_id (FK to vendors.id), business_name, category, city, state
- Pricing: price_tier, starting_price, price_range_min/max
- Capacity: typical_capacity_min/max, books_months_advance
- Style: style_keywords (array), features (JSONB), description
- Social Proof: review_avg, review_count, verification_badges, response_time_hours
- Cultural: cultural_specialties, accessibility_features, languages_supported
- Metadata: active, last_synced, sync_source, sync_version

**Indexes:**
- Partial index on (category) where active = true
- Partial index on (state, city) where active = true
- Index on (price_tier, starting_price)
- GIN indexes on arrays (style_keywords, badges, cultural_specialties)

### match_results

Stores scored matches for each request.

**Key Columns:**
- Match Quality: score (0-100), rank_in_category, rationale (JSONB), score_breakdown (JSONB)
- Denormalized Fields: vendor_name, starting_price, badges, review_avg/count
- Signals: response_time_sla, availability_signal

**Indexes:**
- Composite index on (request_id, category, rank_in_category)
- Index on (request_id, score DESC) for sorting

### match_rate_limits

Enforces per-request inquiry throttling.

**Key Columns:**
- inquiries_sent (default 0, max 5)
- max_inquiries (configurable, default 5)
- vendors_contacted (array of vendor IDs)
- last_inquiry_at (timestamp)

**Constraints:**
- Check constraint: inquiries_sent <= max_inquiries

### match_analytics_events

Tracks matching-specific events for KPI monitoring.

**Event Types:**
- quiz_start, quiz_step_complete, quiz_complete
- match_view, match_vendor_click
- match_save_vendor, match_compare_open
- match_inquiry_sent, match_feedback

## 🎯 Scoring Algorithm Details

### Location Scoring

```typescript
Same City:              20 points (perfect match)
Within Radius:          10-20 points (scaled by distance)
Just Outside Radius:    6 points (partial credit)
Too Far:                0 points
```

### Budget Scoring

```typescript
Perfect Fit:            20 points (target within vendor range)
Close Fit:              12-16 points (scaled by gap)
Higher Budget:          16 points (vendor might be affordable)
Budget Too Low:         0-10 points (scaled penalty)
```

Price Tier Ranges (relative to target budget):
- Budget: 0% - 70% of target
- Moderate: 60% - 120% of target
- Premium: 100% - 180% of target
- Luxury: 150% - 300% of target

### Style Scoring

```typescript
All Styles Match:       15 points
Partial Match:          5-12 points (scaled by ratio)
No Match:               3 points (minimal credit)
No Data:                6-8 points (partial credit)
```

Recognized Style Keywords:
- rustic, modern, vintage, bohemian, classic, elegant, romantic
- industrial, minimalist, traditional, contemporary, garden, barn
- luxury, intimate, grand, formal, casual, chic, artistic, etc.

### Social Proof Scoring

```typescript
Review Average:         0-5 points (scaled by rating / 5)
Review Count:           0-3 points (10+, 50+, 100+ thresholds)
Badges:                 0-2 points (verified, featured, premium)
```

## 🚧 Remaining Phases

### Phase 3: API Layer

**Files to Create:**
- `src/pages/api/match/requests.ts` - POST endpoint for quiz submission
- `src/pages/api/match/results.ts` - GET endpoint for match results
- `src/pages/api/match/inquiries.ts` - POST endpoint for vendor contact

**API Responsibilities:**
1. **POST /api/match/requests**
   - Validate quiz data (Zod schema)
   - Check feature flag
   - Create match_request record
   - Query match_vendor_projection (filtered by categories + location)
   - Run scorer for each candidate
   - Store top N results per category (default 10)
   - Create match_rate_limits record
   - Return request_id

2. **GET /api/match/results?id=<request_id>**
   - Fetch match_results for request
   - Group by category
   - Format vendor cards with rationale
   - Check rate limits
   - Return structured response

3. **POST /api/match/inquiries**
   - Validate request_id + vendor_ids (max 5)
   - Check rate limits
   - Create vendor_inquiries records (existing table)
   - Update match_rate_limits counter
   - Fire telemetry events

### Phase 4: UI Components

**Components to Create:**
1. `src/hooks/useMatchFlag.ts` - Feature flag hook
2. `src/components/match/MatchCTA.tsx` - Homepage/category CTAs
3. `src/components/match/MatchQuizDialog.tsx` - 3-step quiz wizard
4. `src/pages/MatchResults.tsx` - Results page at /match/[id]
5. `src/components/match/MatchCompareDrawer.tsx` - Side-by-side comparison
6. `src/components/match/MatchUnavailable.tsx` - Soft-fail fallback

**Quiz Steps:**
- Step 1 (30-40s): Location, date, guest count, categories, budget, style
- Step 2 (20-30s): Optional toggles (collapsed by default)
- Step 3 (20-30s): Category-specific filters (conditional)

**Results Page Features:**
- Vendor cards grouped by category
- Each card shows: name, price, badges, reviews, rationale bullets
- Actions: Save, Compare (drawer), Ask Availability
- Shareable link for family review
- Inquiries remaining counter

### Phase 5: Integration

**Tasks:**
1. Add MatchCTA to homepage and category pages
2. Wire up telemetry events
3. Test feature flag toggling
4. End-to-end flow testing
5. Verify soft-fail scenarios

### Phase 6: Testing & Validation

**Validation Criteria:**
- [ ] Quiz p50 completion time < 2 minutes
- [ ] ≥3 vendor matches per selected category in launch cities
- [ ] Score algorithm produces accurate rationale
- [ ] Rate limiting enforces max 5 inquiries
- [ ] Soft-fail never blocks existing directory
- [ ] Feature flag toggles cleanly
- [ ] Shareable results link works
- [ ] All telemetry events fire correctly

## 🎨 Architecture Principles

### 1. Namespacing
- All DB objects prefixed with `match_`
- All files under `src/lib/match/` or `src/components/match/`
- No modifications to existing vendor tables

### 2. Feature Flagging
```typescript
// Example usage
const isMatchingEnabled = import.meta.env.NEXT_PUBLIC_ENABLE_MATCHING === 'true';

if (!isMatchingEnabled) {
  return <MatchUnavailable reason="feature_disabled" />;
}
```

### 3. Soft-Fail Design
```typescript
// API routes should catch errors and return soft-fail response
try {
  // ... matching logic
} catch (error) {
  console.error('Match error:', error);
  return { 
    success: false, 
    reason: 'match_unavailable',
    fallback: '/search'
  };
}
```

### 4. Read-Only Vendor Access
- Projection sync only READS from vendors table
- Never writes to vendors, vendor_subscriptions, etc.
- All match data stored in match_* tables

## 📈 KPI Tracking

### Events to Fire

```typescript
// Quiz flow
analytics.track('match_quiz_start', { session_id });
analytics.track('match_quiz_step_complete', { step: 1, time_seconds: 35 });
analytics.track('match_quiz_complete', { 
  total_time_seconds: 87, 
  categories_count: 3 
});

// Results interaction
analytics.track('match_view', { request_id, category_count: 3 });
analytics.track('match_vendor_click', { vendor_id, category, score });
analytics.track('match_save_vendor', { vendor_id });
analytics.track('match_compare_open', { vendor_ids: [...] });
analytics.track('match_inquiry_sent', { vendor_id, inquiry_type: 'availability' });

// Quality signals
analytics.track('match_feedback', { 
  request_id, 
  relevant: true/false, 
  comment: "optional"
});
```

### Key Metrics

**Speed:**
```sql
-- Quiz p50 completion time
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY quiz_completion_time_seconds)
FROM match_requests
WHERE created_at > now() - interval '30 days';
```

**Coverage:**
```sql
-- Match coverage by category
SELECT 
  category,
  AVG(vendor_count) as avg_matches,
  MIN(vendor_count) as min_matches
FROM (
  SELECT request_id, category, COUNT(*) as vendor_count
  FROM match_results
  WHERE created_at > now() - interval '30 days'
  GROUP BY request_id, category
) subq
GROUP BY category;
```

**Quality:**
- Vendor reply rate to inquiries (requires tracking)
- Couple "not relevant" feedback rate
- Save/compare rate vs baseline

## 🔒 Security Considerations

### Row Level Security (RLS)

All match_* tables have RLS enabled with these policies:

1. **match_vendor_projection**: Public reads (active vendors only)
2. **match_requests**: Users can create + read their own requests
3. **match_results**: Users can read results for their requests
4. **match_rate_limits**: Users can read + update limits for their requests
5. **match_analytics_events**: Anyone can insert events

### Data Privacy

- Quiz data stored with optional user_id (for logged-in users)
- Session-based access for anonymous users
- IP address and user agent logged for fraud detection
- No PII required to use feature

## 🚀 Deployment Checklist

- [ ] Run database migration
- [ ] Sync vendor projections
- [ ] Set feature flag to `true` in production .env
- [ ] Test quiz flow end-to-end
- [ ] Verify rate limiting works
- [ ] Test soft-fail scenarios
- [ ] Monitor KPI dashboard
- [ ] Set up projection sync cron job (daily at 2 AM)

## 📞 Support

For issues or questions:
1. Check this document first
2. Review SQL table comments in Supabase
3. Test with `--dry-run` and `--limit` flags
4. Check logs in match_analytics_events table

## 📝 Notes

- Projection sync can be run manually or via cron (recommended daily)
- Scoring algorithm is pure and unit-testable
- All breaking changes avoided via namespacing
- Feature can be disabled instantly via env var
- Soft-fail design ensures directory never breaks
