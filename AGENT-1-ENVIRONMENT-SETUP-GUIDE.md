# 🤖 Agent 1: Environment & Configuration Setup

**Role**: Infrastructure preparation specialist  
**Duration**: 30-45 minutes  
**Status**: 🟡 In Progress

---

## 📋 Overview

This agent handles all prerequisite setup needed before Instagram vendor collection can begin. This includes Apify account creation, environment configuration, and security setup.

---

## ✅ Tasks Checklist

### Phase 1.1: Apify Account Setup
- [ ] Create Apify account at https://apify.com
- [ ] Navigate to Settings → Integrations → API
- [ ] Generate new API token
- [ ] Copy token to secure location
- [ ] Select subscription plan

### Phase 1.2: Environment Variables
- [ ] Review `.env.example` or create from template
- [ ] Add Apify credentials
- [ ] Generate secure `INGEST_SHARED_KEY`
- [ ] Configure rate limiting settings
- [ ] Set initial collection parameters

### Phase 1.3: Security & Documentation
- [ ] Store API token securely (1Password, environment variables)
- [ ] Document account details
- [ ] Set up billing alerts
- [ ] Review Apify pricing

---

## 🔧 Step-by-Step Instructions

### Step 1: Create Apify Account

1. **Visit Apify Platform**
   - Go to: https://apify.com
   - Click "Sign Up" or "Get Started Free"

2. **Complete Registration**
   - Use your business email
   - Verify email address
   - Complete profile setup

3. **Choose Your Plan**
   
   | Plan | Cost | Credits | Best For |
   |------|------|---------|----------|
   | **Free** | $0/mo | Limited | Testing only |
   | **Starter** | $49/mo | $49 credits | Recommended for initial rollout |
   | **Scale** | $499/mo | $499 credits | Large-scale operations |

   **Recommendation**: Start with **Starter Plan** ($49/mo)
   - Sufficient for ~18,800 profile enrichments/month
   - Good for processing your seed data (87 entries × 40 results = ~3,480 profiles)
   - Can upgrade later as needed

4. **Generate API Token**
   - Navigate to: Settings → Integrations → API
   - Click "Generate new token"
   - Name it: "Wedding Vendor Chronicles - Instagram Collection"
   - Copy the token immediately (shown only once!)
   - Store securely

---

### Step 2: Configure Environment Variables

I've created `.env.apify.template` for you. Copy it to `.env` and fill in the values:

```bash
# Copy template
cp .env.apify.template .env

# Or append to existing .env
cat .env.apify.template >> .env
```

**Required Variables:**

```bash
# ========================================
# APIFY CONFIGURATION
# ========================================
APIFY_API_TOKEN="your_apify_token_here"          # From Step 1

# ========================================
# APPLICATION URLS
# ========================================
APP_URL="http://localhost:3000"                   # Development
# APP_URL="https://your-production-url.com"      # Production

# ========================================
# SECURITY & AUTHENTICATION
# ========================================
INGEST_SHARED_KEY=""                              # Generate in Step 3

# ========================================
# APIFY RATE LIMITING
# ========================================
MCP_APIFY_RPS=1                                   # Requests per second (conservative)
MCP_APIFY_BURST=3                                 # Burst capacity

# ========================================
# COLLECTION PARAMETERS
# ========================================
TIER=1                                            # Start with tier 1 (major cities)
LIMIT_PER_ROW=40                                  # Results per search term
MAX_ENRICH=400                                    # Max profiles to enrich per run

# ========================================
# SUPABASE (Verify these exist)
# ========================================
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

---

### Step 3: Generate Secure Keys

Run the provided key generation script:

```bash
node scripts/generate-secure-keys.js
```

This will generate:
- `INGEST_SHARED_KEY` - For API authentication
- Display the keys for you to copy to `.env`

**Manual Generation (if needed):**
```bash
# Using Node.js
node -e "console.log('INGEST_SHARED_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

---

### Step 4: Verify Configuration

Run the configuration validator:

```bash
node scripts/validate-apify-config.js
```

This checks:
- ✅ All required environment variables present
- ✅ Apify token format valid
- ✅ Supabase connection works
- ✅ Rate limiting values reasonable
- ✅ Collection parameters within safe ranges

---

## 📊 Cost Estimation & Budgeting

### Apify Pricing Model
- **Instagram Profile Scraper**: ~$2.60 per 1,000 results
- **Search/Discovery**: Included in platform fee

### Your Project Estimates

**Test Phase** (Week 1):
- 50-100 profiles
- Cost: $0.13-$0.26
- Budget: $5 safety margin

**Tier 1 Rollout** (Week 2):
- 2,000-3,000 profiles
- Cost: $5.20-$7.80
- Budget: $15 for safety

**Full Deployment** (Month 1):
- 8,000-12,000 profiles
- Cost: $20.80-$31.20
- Budget: $49 Starter Plan

**Ongoing Maintenance**:
- ~500 profiles/week refresh
- Cost: ~$1.30/week (~$5.20/month)

### Set Up Billing Alerts

1. In Apify Console → Billing
2. Set alert at: **80% of monthly budget**
3. Set hard limit at: **100% of monthly budget**
4. Add notification email

---

## 🔒 Security Best Practices

### API Token Storage

**DO:**
- ✅ Store in environment variables
- ✅ Use `.env` file (already in `.gitignore`)
- ✅ Use password manager for backup
- ✅ Rotate tokens periodically (every 90 days)

**DON'T:**
- ❌ Commit to git
- ❌ Share in Slack/Discord
- ❌ Hardcode in scripts
- ❌ Store in plaintext files

### Access Control
- Limit Apify API token to minimum required permissions
- Use separate tokens for dev/staging/production
- Rotate tokens if compromised

---

## 📝 Documentation Requirements

Create/update these files:

1. **`.env`** - Your actual environment configuration (not committed)
2. **`.env.example`** - Template for team members (committed)
3. **`APIFY-CREDENTIALS.md`** - Account details (stored securely, not in repo)

Template for `APIFY-CREDENTIALS.md`:
```markdown
# Apify Account Details

**Account Email**: your-email@company.com
**Account ID**: [from Apify dashboard]
**Plan**: Starter ($49/mo)
**API Token Location**: 1Password vault "Wedding Vendor Chronicles"
**Billing Contact**: billing@company.com
**Monthly Budget**: $49
**Alert Threshold**: $39 (80%)

## Token Rotation Schedule
- Last Rotated: [Date]
- Next Rotation: [Date + 90 days]

## Usage Limits
- Max profiles/month: 18,800
- Current usage: [Check Apify dashboard]
- Remaining: [Calculate]
```

---

## ✅ Completion Criteria

Agent 1 is complete when:

- [x] Apify account created and verified
- [x] API token generated and stored securely
- [x] All environment variables configured in `.env`
- [x] `INGEST_SHARED_KEY` generated
- [x] Configuration validated with test script
- [x] Billing alerts configured
- [x] Documentation completed
- [x] `.env.example` updated for team

---

## 🐛 Troubleshooting

### "Invalid API token" error
- Verify token copied correctly (no extra spaces)
- Check token hasn't been revoked
- Generate new token if needed

### "Supabase connection failed"
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` (not anon key!)
- Test connection manually

### "Rate limit too high" warning
- Reduce `MCP_APIFY_RPS` to 1
- Lower `MCP_APIFY_BURST` to 2-3
- Start conservative, scale up later

---

## 🚀 Next Steps

Once Agent 1 is complete, you're ready for:

**Agent 2**: MCP Server Integration
- Connect Apify MCP server
- Test actor access
- Validate enrichment workflow

**Estimated Time to Agent 2**: You can start immediately after this agent completes!

---

## 📞 Support Resources

- **Apify Documentation**: https://docs.apify.com
- **Apify Support**: support@apify.com
- **Rate Limiting Guide**: https://docs.apify.com/platform/limits
- **Instagram Scraper Docs**: https://apify.com/apify/instagram-profile-scraper

---

**Status**: Ready to begin! Follow steps 1-4 above.
**Next Agent**: Agent 2 (MCP Server Integration)
