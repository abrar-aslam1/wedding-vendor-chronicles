# Next.js Migration - Workflow Guide

## How Task Continuation Works

At the end of each completed batch, you'll receive **an exact prompt** to use for creating the next task. This keeps context manageable and progress organized.

---

## ✅ Completed Batches

### Phase 1: Foundation Setup ✅
**Status:** Complete  
**Files:** 
- `src/types/database.types.ts` (generated)
- `lib/migration-helpers.ts` (created)
- `tsconfig.json` (updated)

### Batch 1: Auth Pages ✅
**Status:** Complete  
**Files Migrated:**
- `app/auth/page.tsx` ✅
- `app/auth/callback/page.tsx` ✅
- `app/auth/test/page.tsx` ✅

### Batch 2: Portal Pages ✅
**Status:** Complete  
**Files Migrated:**
- `app/portal/page.tsx` ✅
- `app/vendor-dashboard/page.tsx` ✅

---

## 🚀 NEXT TASK: Batch 3 - Search Pages

Copy this **exact prompt** to create the next task:

```
Continue Next.js migration - Batch 3: Search Pages

CONTEXT:
- Phase 1 (Foundation) is complete with Supabase types and migration helpers
- Batch 1 (Auth Pages) is complete - 3 files migrated
- Batch 2 (Portal Pages) is complete - 2 files migrated
- Migration helpers available in lib/migration-helpers.ts
- strictNullChecks enabled in tsconfig.json

FILES TO MIGRATE:
1. src/pages/Search.tsx → app/search/[category]/[state]/[city]/page.tsx
2. src/pages/Category.tsx → app/category/[category]/page.tsx

NOTE: These pages use dynamic routing with URL parameters. Need to:
- Use Next.js App Router dynamic segments ([param])
- Extract params from page props (async in Next.js 15)
- Convert useParams() hook calls to page props
- Handle searchParams for query strings (e.g., ?subcategory=value)

MIGRATION REQUIREMENTS:
- Add 'use client' directive for client components
- Create proper dynamic route structure with [brackets]
- Extract params from Next.js page props
- Use searchParams from props for query parameters
- Replace useNavigate with useNavigateCompat() or router.push()
- Maintain all existing search functionality
- Preserve SEO metadata and dynamic content

REFERENCE DOCS:
- See NEXTJS-MIGRATION-BATCH1-AUTH-COMPLETE.md for basic patterns
- See NEXTJS-MIGRATION-BATCH2-PORTAL-COMPLETE.md for auth patterns
- See lib/migration-helpers.ts for available utilities
- Use routes.search() for building search URLs

SUCCESS CRITERIA:
- No TypeScript errors
- Dynamic routes work correctly
- URL parameters are properly extracted
- Search functionality preserved
- Document changes in NEXTJS-MIGRATION-BATCH3-SEARCH-COMPLETE.md
- Provide prompt for Batch 4 at completion
```

---

## Pattern for All Future Batches

### Each batch completion will provide:

1. **Summary Document** (like `NEXTJS-MIGRATION-BATCH1-AUTH-COMPLETE.md`)
   - Lists what was migrated
   - Documents changes made
   - Shows migration patterns used

2. **Next Task Prompt** (exact text to copy)
   - Context from previous work
   - Files to migrate
   - Requirements and patterns
   - Success criteria

### Workflow:
```
Complete Batch N
    ↓
Review summary document
    ↓
Copy "Next Task Prompt"
    ↓
Create new task with prompt
    ↓
Complete Batch N+1
    ↓
Repeat
```

---

## All 16 Batches Roadmap

### ✅ Phase 1: Foundation
- Foundation Setup ✅

### Phase 2: Router Migration (Pages)
- ✅ Batch 1: Auth Pages (3 files) ✅
- ✅ Batch 2: Portal Pages (2 files) ✅
- [ ] **Batch 3: Search Pages (2 files) ← YOU ARE HERE**
- [ ] Batch 4: Location Pages (3 files)
- [ ] Batch 5: Business Pages (2 files)
- [ ] Batch 6: Tools Pages (3 files)
- [ ] Batch 7: Results & Favorites (2 files)
- [ ] Batch 8: Admin & Test (2 files)

### Phase 3: Component Migration
- [ ] Batch 9: Navigation Components (4 files)
- [ ] Batch 10: Search Components (5 files)
- [ ] Batch 11: Vendor Components (3 files)
- [ ] Batch 12: Auth Components (2 files)
- [ ] Batch 13: UI & Utility Components (3 files)

### Phase 4: Code Quality
- [ ] Batch 14: Console Log Cleanup (136 instances)
- [ ] Batch 15: TypeScript Any Fixes (40 instances)
- [ ] Batch 16: Final Configuration (enable strict mode)

---

## Quick Reference

### Migration Helpers Available
```typescript
import { 
  useNavigateCompat,     // React Router useNavigate replacement
  useSearchParamsObject, // Get params as object
  routes,                // Type-safe route builders
  buildUrl,              // Build URLs with query params
  resolveParams          // Handle Next.js 15 async params
} from "@/../lib/migration-helpers";
```

### Common Patterns
```typescript
// Navigation
const navigate = useNavigateCompat();
navigate(routes.portal());

// Search Params
const searchParams = useSearchParams();
const returnUrl = searchParams?.get("returnUrl");

// Route Building
const url = routes.search({
  category: "photographers",
  state: "texas",
  city: "austin"
});
```

---

## Benefits of This Approach

✅ **Context Efficiency** - Each task focuses on 2-5 files only  
✅ **Progress Tracking** - Clear documentation of what's done  
✅ **Easy Testing** - Small batches are easier to verify  
✅ **Flexible Scheduling** - Can pause/resume between batches  
✅ **Clear Roadmap** - Always know what's next

---

**Current Status:** Ready for Batch 3 - Search Pages  
**Files Remaining:** 25 files + components + cleanup  
**Estimated Completion:** 13-15 more batches
