# 🎯 Comprehensive Instagram Wedding Vendor Collection Plan

## 📊 **SCOPE & TARGETS**

### **12 Wedding Vendor Categories:**
1. **Wedding Planners** (`wedding-planners`)
2. **Photographers** (`photographers`) 
3. **Videographers** (`videographers`)
4. **Florists** (`florists`)
5. **Caterers** (`caterers`)
6. **Venues** (`venues`)
7. **DJs & Bands** (`djs-and-bands`)
8. **Cake Designers** (`cake-designers`)
9. **Bridal Shops** (`bridal-shops`)
10. **Makeup Artists** (`makeup-artists`) ✅ *Currently working*
11. **Hair Stylists** (`hair-stylists`) ✅ *Currently working*
12. **Wedding Decorators** (`wedding-decorators`)

### **Geographic Coverage:**
- **Top 20 Wedding Markets** (NYC, LA, Chicago, Miami, SF, etc.)
- **Target per category:** 20 vendors × 20 cities = **400 vendors per category**
- **Total target:** **4,800 high-quality wedding vendors**

## 🚀 **IMPLEMENTATION PHASES**

### **Phase 1: Foundation (Week 1)**
**Status: ✅ COMPLETE**
- [x] Instagram scraping system working
- [x] Database integration with Supabase
- [x] Quality scoring system (7-9/10 scores)
- [x] Makeup artists & hair stylists collection

### **Phase 2: Enhanced System (Week 2)**
**Current Focus:**

#### A. Enhanced Quality Scoring
- **Lower threshold:** 4 → 3 points (better local vendor coverage)
- **Follower minimum:** 500 → 200 (include local vendors)
- **Category-specific keywords** for all 12 categories
- **Enhanced business indicators** (contact info, location)

#### B. Category-Specific Hashtag Strategies
```python
# Example for Wedding Planners
'wedding-planners': {
    'keywords': ['weddingplanner', 'eventplanner', 'weddingcoordinator'],
    'business_terms': ['planning', 'coordinator', 'event', 'planner']
}
```

#### C. Top-20 Results Per City
- Collect 30 results per city
- Score and rank by quality + follower count
- Keep only top 20 highest-quality vendors
- Prevent low-quality mass collection

### **Phase 3: Category Expansion (Weeks 3-4)**
**Priority Order:**

1. **High-Volume Categories** (Weeks 3)
   - Photographers (huge Instagram presence)
   - Venues (visual content)
   - Florists (Instagram-heavy industry)

2. **Medium-Volume Categories** (Week 4)
   - Wedding Planners
   - Videographers  
   - Wedding Decorators

3. **Specialized Categories** (Week 4)
   - Caterers
   - DJs & Bands
   - Cake Designers
   - Bridal Shops

### **Phase 4: Scale & Optimize (Week 5)**
- **Full automation** across all categories
- **Geographic expansion** to 50+ cities
- **Quality monitoring** and threshold optimization
- **Performance analytics** and reporting

## 📈 **EXPECTED RESULTS**

### **Phase 2 Results (End of Week 2):**
```
Makeup Artists:     400 vendors (20 cities × 20 each)
Hair Stylists:      400 vendors (20 cities × 20 each)
Total:              800 high-quality vendors
```

### **Phase 3 Results (End of Week 4):**
```
All 12 Categories:  4,800 vendors (12 × 400 each)
Geographic Coverage: 20 major wedding markets
Quality Threshold:   3+ scores, 200+ followers
```

### **Phase 4 Results (End of Week 5):**
```
Extended Coverage:   7,200+ vendors (12 × 600 each)
Markets:            30+ cities
Database Growth:    From 977 → 8,000+ vendors
```

## ⚡ **IMMEDIATE NEXT STEPS**

### **Step 1: Test Enhanced System (Today)**
```bash
cd scripts/python/instagram_scraper
python comprehensive_collection_plan.py
```

### **Step 2: Validate Quality (Tomorrow)**
- Run comprehensive collection for 1-2 categories
- Verify quality scores and vendor relevance
- Adjust thresholds if needed

### **Step 3: Scale Production (This Week)**
- Deploy automated collection for all 12 categories
- Monitor performance and costs
- Set up quality monitoring dashboard

## 💰 **COST PROJECTIONS**

### **Current Costs:**
- **Apify:** ~$0.005 per profile
- **Current:** ~$150/month (30K profiles)

### **Expanded Costs:**
- **Target:** 4,800 vendors/month
- **Apify cost:** ~$24/month
- **With discovery:** ~$50/month total
- **Very affordable** for comprehensive coverage

## 🔧 **TECHNICAL IMPROVEMENTS**

### **Enhanced Quality Scoring:**
```python
def calculate_enhanced_quality_score(profile_data, category):
    # Bio keywords (0-3 points) - Category-specific
    # Wedding terms (0-1 point) - General wedding relevance  
    # Followers (0-2 points) - Lowered thresholds
    # Activity (0-2 points) - Lowered thresholds
    # Business (0-2 points) - Enhanced detection
    return score  # 0-10 total
```

### **Top-N Selection:**
```python
def get_top_vendors_per_city(profiles, category, max_results=20):
    # Score all profiles
    # Sort by (quality_score, follower_count) 
    # Return top N highest-quality vendors
    # Ensures only best vendors per city
```

### **Category-Specific Subcategories:**
```python
'photographers': {
    'engagement-photography': ['engagement', 'couple'],
    'portrait-photography': ['portrait', 'headshot'], 
    'destination-photography': ['destination', 'travel']
}
```

## 📊 **MONITORING & SUCCESS METRICS**

### **Quality Metrics:**
- **Average quality score:** Target 6+ (currently 7-9)
- **Business account %:** Target 60%+
- **Contact info %:** Target 40%+ (email/phone)
- **Location detection %:** Target 70%+

### **Coverage Metrics:**
- **Vendors per category:** Target 400+ each
- **Cities covered:** Target 20+ major markets
- **Unique vendors:** Target 95%+ (low duplicates)
- **Database growth:** Target 7,000+ new vendors

### **Performance Metrics:**
- **Collection rate:** Target 100+ vendors/day
- **Success rate:** Target 15-25% (high-quality filtering)
- **API costs:** Target <$100/month
- **Error rate:** Target <5%

## 🎯 **SUCCESS CRITERIA**

### **Week 2 Success:**
- [x] Enhanced quality scoring implemented
- [x] Top-20 filtering working
- [ ] 800+ makeup artists & hair stylists collected
- [ ] Average quality score 6+

### **Week 4 Success:**
- [ ] All 12 categories implemented
- [ ] 4,800+ vendors across all categories
- [ ] 20+ cities covered per category
- [ ] Quality distribution: 60% score 6+, 90% score 4+

### **Week 5 Success:**
- [ ] Fully automated collection system
- [ ] 7,000+ high-quality wedding vendors
- [ ] Geographic coverage: 30+ cities
- [ ] Integration with web app search
- [ ] Performance dashboard & monitoring

---

## 🚀 **READY TO EXECUTE**

The comprehensive collection system is **ready to deploy**. The enhanced quality scoring, category-specific hashtag strategies, and top-20 filtering will ensure we collect only the highest-quality wedding vendors across all categories and major markets.

**Current Status:** ✅ Foundation complete, ready for Phase 2 expansion
**Next Action:** Deploy enhanced system for all 12 categories
**Timeline:** 4,800+ vendors within 3 weeks