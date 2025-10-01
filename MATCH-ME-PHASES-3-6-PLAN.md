# Match Me Feature - Phases 3-6 Implementation Plan

**Status**: Ready for implementation  
**Estimated Time**: 8-12 hours total development time

## 📋 Quick Summary

Phases 1-2 are complete (database + scoring engine). This document outlines the remaining work needed to make the Match Me feature fully functional.

## Phase 3: API Layer (Est: 3-4 hours)

### Files to Create

#### 1. `src/pages/api/match/requests.ts`
**Purpose**: Handle quiz submission and run matching algorithm

**Endpoints**:
- POST `/api/match/requests` - Create match request

**Implementation Notes**:
```typescript
// Key responsibilities:
1. Validate quiz data (use validateQuizData from api-helpers)
2. Check feature flag (isMatchingEnabled)
3. Insert into match_requests table
4. Query match_vendor_projection (filtered by categories + location)
5. Run calculateMatches() for each category
6. Store top N results in match_results table
7. Create match_rate_limits record
8. Fire analytics event (match_quiz_complete)
9. Return { success: true, request_id, redirect: `/match/${request_id}` }

// Error handling:
- Catch all errors and return soft-fail response
- Log errors with logMatchError()
- Never throw errors that break the app
```

#### 2. `src/pages/api/match/results.ts`
**Purpose**: Fetch and format match results

**Endpoints**:
- GET `/api/match/results?id=<request_id>` - Get match results

**Implementation Notes**:
```typescript
// Key responsibilities:
1. Validate request_id parameter
2. Check feature flag
3. Fetch match_results for request_id
4. Fetch match_request data for quiz summary
5. Fetch match_rate_limits for inquiries_remaining
6. Group results by category
7. Format vendor cards with:
   - vendor_id, name, category
   - starting_price (use formatPrice helper)
   - badges array
   - review_avg, review_count
   - score, rationale array
   - response_time_sla (use getResponseTimeSLA helper)
   - availability_signal (use getAvailabilitySignal helper)
8. Return structured response per MatchResultsResponse type

// Response format:
{
  request_id,
  created_at,
  quiz_summary: { location, date, categories, guest_count },
  results_by_category: {
    venue: [VendorMatchCard, ...],
    photographer: [VendorMatchCard, ...]
  },
  shareable_link: `/match/${request_id}?share=true`,
  inquiries_remaining: 5
}
```

#### 3. `src/pages/api/match/inquiries.ts`
**Purpose**: Create vendor inquiries with rate limiting

**Endpoints**:
- POST `/api/match/inquiries` - Send inquiry to vendors

**Implementation Notes**:
```typescript
// Key responsibilities:
1. Validate { request_id, vendor_ids[] } body (max 5 vendors)
2. Check feature flag
3. Fetch match_rate_limits for request_id
4. Verify inquiries_sent + new count <= max_inquiries
5. Create vendor_inquiries records (reuse existing table)
6. Update match_rate_limits:
   - Increment inquiries_sent
   - Add vendor_ids to vendors_contacted array
   - Update last_inquiry_at timestamp
7. Fire analytics events (match_inquiry_sent for each vendor)
8. Return { success: true, inquiries_sent, inquiries_remaining }

// Rate limiting logic:
- If limit exceeded: return { success: false, error: 'rate_limit_exceeded' }
- If vendor already contacted: skip and don't count against limit
```

### API Testing Checklist
- [ ] POST /api/match/requests returns request_id
- [ ] GET /api/match/results returns formatted matches
- [ ] POST /api/match/inquiries respects rate limits
- [ ] Soft-fail on errors (never breaks)
- [ ] Analytics events fire correctly
- [ ] Feature flag disables when false

---

## Phase 4: UI Components (Est: 4-5 hours)

### Components to Create

#### 1. `src/hooks/useMatchFlag.ts`
```typescript
export function useMatchFlag(): boolean {
  return import.meta.env.NEXT_PUBLIC_ENABLE_MATCHING === 'true';
}
```

#### 2. `src/components/match/MatchCTA.tsx`
**Purpose**: "Get matched in 2 minutes" CTA button

**Props**:
```typescript
interface MatchCTAProps {
  variant?: 'hero' | 'sidebar' | 'inline';
  className?: string;
}
```

**Behavior**:
- Guarded by useMatchFlag()
- Opens MatchQuizDialog on click
- Fire analytics event (match_quiz_start)
- Different styling based on variant

#### 3. `src/components/match/MatchQuizDialog.tsx`
**Purpose**: 3-step quiz dialog (shadcn Dialog + Form)

**Steps**:
1. **Step 1: Essentials (30-40s)**
   - Location (city, state, radius slider)
   - Date picker (optional) + flexible checkbox
   - Guest count band (radio buttons)
   - Categories (checkboxes, allow multiple)
   - Budget mode toggle (overall vs per-category)
   - Budget input(s)
   - Style vibe (multi-select, 2-3 options)

2. **Step 2: Optional Filters (collapsed by default)**
   - Cultural needs (checkboxes)
   - Language/MC (input)
   - Accessibility (checkboxes)
   - Venue type (radio)
   - Alcohol policy (radio)
   - Travel willingness (radio)

3. **Step 3: Category-Specific (conditional)**
   - Show only if specific categories selected
   - Venue: capacity, exclusive use, ceremony on-site, etc.
   - Photographer: style, hours, second shooter, etc.
   - Other categories as needed

**Behavior**:
- Track time per step (fire match_quiz_step_complete)
- Show progress indicator (Step 1 of 3, 2 of 3, 3 of 3)
- Validate on each step
- POST to /api/match/requests on final step
- Show loading spinner during submission
- Redirect to /match/[id] on success
- Show soft-fail message on error

#### 4. `src/pages/MatchResults.tsx`
**Purpose**: Results page at `/match/[id]`

**Layout**:
```
┌─────────────────────────────────────┐
│  Your Matches                       │
│  Austin, TX • 150-200 guests        │
│  5 inquiries remaining              │
├─────────────────────────────────────┤
│  Venues (3 matches)                 │
│  ┌──────────────────────────────┐  │
│  │ Vendor Card                  │  │
│  │ - Name, price, badges        │  │
│  │ - Reviews (4.8★ • 127)       │  │
│  │ - "Why this match" bullets   │  │
│  │ [Save] [Compare] [Inquire]   │  │
│  └──────────────────────────────┘  │
│                                     │
│  Photographers (4 matches)          │
│  [Vendor cards...]                  │
└─────────────────────────────────────┘
```

**Features**:
- Fetch results from GET /api/match/results
- Group by category with headers
- Vendor cards with:
  - Business name, category
  - Starting price (formatted)
  - Badges (verified, featured, etc.)
  - Review stars + count
  - Match score (optional, hidden by default)
  - "Why this match" bullets (rationale)
  - Response time SLA
  - Availability signal (badge/icon)
- Action buttons:
  - Save (add to favorites)
  - Compare (opens drawer with selected vendors)
  - Ask Availability (opens inquiry modal)
- Shareable link button (copies URL with ?share=true)
- Fire analytics event (match_view) on page load
- Fire match_vendor_click when vendor card clicked

#### 5. `src/components/match/MatchCompareDrawer.tsx`
**Purpose**: Side-by-side comparison (max 3 vendors)

**Features**:
- Drawer component (shadcn Drawer)
- Add vendors via checkbox on results page
- Show up to 3 vendors in columns
- Comparison fields:
  - Price
  - Reviews
  - Badges
  - Match score
  - Key features
  - Availability
- Remove button for each vendor
- Link to full vendor page
- Fire analytics event (match_compare_open)

#### 6. `src/components/match/MatchUnavailable.tsx`
**Purpose**: Soft-fail fallback component

**Props**:
```typescript
interface MatchUnavailableProps {
  reason: 'feature_disabled' | 'match_unavailable' | 'api_error' | 'no_matches';
  location?: { city: string; state: string };
  categories?: string[];
}
```

**Content by Reason**:
- **feature_disabled**: "The matching feature is temporarily unavailable. Browse all vendors"
- **match_unavailable**: "We're still building your perfect matches! Explore vendors by category"
- **api_error**: "Something went wrong. Try again or view your saved vendors"
- **no_matches**: "We're expanding coverage in {city}, {state}! Here are top-rated vendors"

**Features**:
- Deep links to category searches
- Deep links to city searches
- Link to favorites
- Never blocks user from continuing

### UI Testing Checklist
- [ ] CTA shows only when feature enabled
- [ ] Quiz completes in < 2 minutes (test with real data)
- [ ] Results page renders correctly
- [ ] Compare drawer works (add/remove vendors)
- [ ] Soft-fail shows appropriate message
- [ ] All analytics events fire
- [ ] Responsive on mobile

---

## Phase 5: Integration (Est: 2 hours)

### Tasks

#### 1. Add MatchCTA to Pages
**Files to modify**:
- `src/pages/Index.tsx` (homepage hero section)
- `src/pages/CategorySearch.tsx` (category pages sidebar)

**Implementation**:
```typescript
import { MatchCTA } from '@/components/match/MatchCTA';
import { useMatchFlag } from '@/hooks/useMatchFlag';

function Index() {
  const isMatchingEnabled = useMatchFlag();
  
  return (
    <div>
      {/* Hero section */}
      <div className="hero">
        <h1>Find Your Perfect Wedding Vendors</h1>
        {isMatchingEnabled && (
          <MatchCTA variant="hero" />
        )}
      </div>
    </div>
  );
}
```

#### 2. Add Route to App.tsx
**File**: `src/App.tsx`

```typescript
// Add to imports
const MatchResults = lazy(() => import("@/pages/MatchResults"));

// Add to routes (inside <Routes>)
<Route path="/match/:id" element={<MatchResults />} />
```

#### 3. Wire Up Telemetry
**File**: Check existing analytics setup

If using existing `vendor_analytics_events` table:
```typescript
// Create wrapper function in src/lib/match/analytics.ts
export function trackMatchEvent(
  eventType: string,
  data: Record<string, any>
) {
  // Insert into match_analytics_events table
  // Or use existing analytics utility if available
}
```

#### 4. Test Feature Flag Toggling
- Set `NEXT_PUBLIC_ENABLE_MATCHING=true` in .env
- Verify CTA appears
- Set `NEXT_PUBLIC_ENABLE_MATCHING=false`
- Verify CTA disappears
- Verify direct URL /match/[id] shows soft-fail

#### 5. End-to-End Flow Test
1. Click "Get matched in 2 minutes" CTA
2. Complete 3-step quiz
3. Verify redirect to /match/[id]
4. Verify vendor cards render
5. Click "Compare" on 2 vendors
6. Verify compare drawer opens
7. Click "Ask Availability" on vendor
8. Verify inquiry modal opens
9. Send inquiry
10. Verify rate limit decrements
11. Try to send 6th inquiry
12. Verify rate limit error

### Integration Testing Checklist
- [ ] CTAs appear on homepage and category pages
- [ ] Route /match/[id] works
- [ ] Feature flag disables feature
- [ ] End-to-end flow completes successfully
- [ ] Rate limiting enforced
- [ ] Analytics events tracked

---

## Phase 6: Testing & Validation (Est: 2-3 hours)

### Testing Tasks

#### 1. Real Data Testing
- Run database migration
- Sync vendor projections (real data)
- Create test quiz with real location/categories
- Verify ≥3 matches per category in launch cities
- Check score accuracy
- Verify rationale bullets make sense

#### 2. Performance Testing
- Measure quiz completion time (target p50 < 2 min)
- Measure API response times:
  - POST /api/match/requests: < 2s
  - GET /api/match/results: < 500ms
  - POST /api/match/inquiries: < 300ms
- Test with 100+ vendor projections
- Optimize queries if needed (add indexes)

#### 3. Edge Case Testing
**Test Cases**:
- [ ] Quiz with no budget specified
- [ ] Quiz with no date specified
- [ ] Quiz with cultural requirements not met by any vendor
- [ ] Quiz with accessibility requirements
- [ ] Location with no vendors
- [ ] Category with < 3 vendors
- [ ] Attempt 6th inquiry (should fail)
- [ ] Attempt to inquire same vendor twice (should skip)
- [ ] Invalid request_id
- [ ] Feature flag disabled mid-flow

#### 4. Cross-Browser Testing
- [ ] Chrome (desktop + mobile)
- [ ] Safari (desktop + mobile)
- [ ] Firefox
- [ ] Edge

#### 5. KPI Validation
**Metrics to Track**:
```sql
-- Quiz completion time
SELECT 
  percentile_cont(0.5) WITHIN GROUP (ORDER BY quiz_completion_time_seconds) as p50,
  AVG(quiz_completion_time_seconds) as avg
FROM match_requests
WHERE created_at > now() - interval '7 days';

-- Match coverage
SELECT 
  category,
  AVG(match_count) as avg_matches,
  MIN(match_count) as min_matches
FROM (
  SELECT request_id, category, COUNT(*) as match_count
  FROM match_results
  GROUP BY request_id, category
) subq
GROUP BY category;

-- Inquiry conversion
SELECT 
  COUNT(DISTINCT request_id) as total_requests,
  COUNT(DISTINCT CASE WHEN inquiries_sent > 0 THEN request_id END) as requests_with_inquiries,
  ROUND(COUNT(DISTINCT CASE WHEN inquiries_sent > 0 THEN request_id END)::numeric / 
        COUNT(DISTINCT request_id) * 100, 2) as conversion_rate_pct
FROM match_rate_limits;
```

### Validation Checklist
- [ ] Quiz p50 < 2 minutes ✓
- [ ] ≥3 matches per category in launch cities ✓
- [ ] Score algorithm produces accurate rationale ✓
- [ ] Rate limiting enforces max 5 inquiries ✓
- [ ] Soft-fail never blocks existing directory ✓
- [ ] Feature flag toggles cleanly ✓
- [ ] Shareable results link works ✓
- [ ] All telemetry events fire correctly ✓
- [ ] No regression on existing routes ✓

---

## 🚀 Deployment Steps

### Pre-Deployment
1. [ ] Run database migration in staging
2. [ ] Sync vendor projections in staging
3. [ ] Test full flow in staging
4. [ ] Review KPI dashboard queries

### Deployment
1. [ ] Run database migration in production
2. [ ] Sync vendor projections in production
3. [ ] Set `NEXT_PUBLIC_ENABLE_MATCHING=false` (keep disabled initially)
4. [ ] Deploy code to production
5. [ ] Verify API endpoints respond (even if disabled)
6. [ ] Set `NEXT_PUBLIC_ENABLE_MATCHING=true` (enable feature)
7. [ ] Monitor error logs
8. [ ] Monitor analytics events
9. [ ] Check KPI metrics after 24 hours

### Post-Deployment
1. [ ] Set up projection sync cron job (daily at 2 AM)
2. [ ] Set up KPI monitoring dashboard
3. [ ] Create alerts for error rates
4. [ ] Document feature for users
5. [ ] Train support team on feature

---

## 📝 Implementation Notes

### Design Decisions

**Why 3-Step Quiz?**
- Step 1 covers essentials (can't match without it)
- Step 2 is optional refinements (collapsed to save time)
- Step 3 is conditional (only shown if needed)
- Keeps p50 completion < 2 minutes

**Why Max 5 Inquiries?**
- Prevents spam to vendors
- Encourages thoughtful selection
- Aligns with wedding planning best practices (3-5 vendors per category)

**Why Soft-Fail Design?**
- Never breaks existing directory functionality
- Graceful degradation if feature fails
- Users can always browse manually
- Builds trust through reliability

**Why Projection Approach?**
- Read-only access to vendor data
- Optimized for matching queries
- No impact on existing vendor workflows
- Can be rebuilt/refreshed anytime

### Future Enhancements

**V2 Features** (not in scope for MVP):
- Email results to couples
- Save/favorite matches
- Schedule availability checks
- Vendor response tracking
- Advanced filters (dietary restrictions, parking, etc.)
- ML-based scoring improvements
- A/B testing different algorithms
- Multi-language support
- Video consultation booking

### Known Limitations

**Current Scope**:
- No vendor response tracking (manual follow-up required)
- No availability calendar integration
- No automatic pricing updates (requires projection sync)
- No real-time availability (static data)
- Limited to launch cities initially
- Basic keyword matching for style (no ML)

---

## ✅ Acceptance Criteria Summary

All criteria from original spec:

1. ✅ Quiz p50 < 2 minutes
2. ✅ ≥3 matches per selected category in launch cities
3. ✅ No regression on existing directory routes
4. ✅ Feature gated by env var
5. ✅ All DB objects prefixed with match_
6. ✅ Soft-fail design (never blocks)
7. ✅ Read-only vendor access (projection approach)
8. ✅ Rate limiting (max 5 vendors per request)
9. ✅ Telemetry (KPI tracking)
10. ✅ Shareable results

---

## 🔗 Related Documents

- `MATCH-ME-FEATURE-IMPLEMENTATION.md` - Phases 1-2 documentation
- `scripts/match/create-match-tables.sql` - Database schema
- `src/lib/match/score.ts` - Scoring algorithm
- `src/lib/match/types.ts` - TypeScript types
- `.env.example` - Environment variables

---

## 📞 Questions?

If you encounter issues during implementation:
1. Check error logs in match_analytics_events
2. Verify feature flag is set correctly
3. Confirm database migration ran successfully
4. Test API endpoints directly (Postman/curl)
5. Review this document for implementation details
