# Environment Variables Setup for Netlify

## 🚨 URGENT: Required for Build to Succeed

Your Netlify build is failing because it needs the correct environment variables. Follow these steps **immediately**:

## Required Variables for Netlify

Add these in **Netlify Dashboard** → **Site Settings** → **Environment Variables**:

### 1. Supabase Configuration (Next.js)

```
NEXT_PUBLIC_SUPABASE_URL=https://wpbdveyuuudhmwflrmqw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A
```

### 2. Supabase Configuration (Vite - Legacy)

```
VITE_SUPABASE_URL=https://wpbdveyuuudhmwflrmqw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A
```

**Note**: Both sets are needed during migration because old components still use VITE_ prefix.

## Step-by-Step Setup in Netlify

### Method 1: Via Netlify UI (Recommended)

1. Go to https://app.netlify.com
2. Select your site: `wedding-vendor-chronicles`
3. Click **Site Settings** (in top nav)
4. Click **Environment Variables** (in sidebar under "Build & deploy")
5. Click **Add a variable**
6. Add each variable:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://wpbdveyuuudhmwflrmqw.supabase.co`
   - Scopes: Check "All branches" and "All deploys"
   - Click **Create variable**
7. Repeat for all 4 variables above

### Method 2: Via Netlify CLI

```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Login
netlify login

# Link to your site
netlify link

# Set variables
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://wpbdveyuuudhmwflrmqw.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A"
netlify env:set VITE_SUPABASE_URL "https://wpbdveyuuudhmwflrmqw.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwYmR2ZXl1dXVkaG13ZmxybXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4NDMyNjYsImV4cCI6MjA1MzQxOTI2Nn0.zjyA1hS9Da2tXEuUu7W44tCMGSIp2ZTpK3RpJXQdL4A"
```

## After Adding Variables

1. **Trigger a new deploy**:
   - Go to Netlify Dashboard → Deploys
   - Click **Trigger deploy** → **Deploy site**

2. **Or push a new commit**:
   ```bash
   git commit --allow-empty -m "Trigger rebuild with env vars"
   git push
   ```

## Verify Variables Are Set

### In Netlify UI:
1. Site Settings → Environment Variables
2. Should see all 4 variables listed

### During Build:
Check build logs for these lines:
```
Loaded environment variables from .env
NEXT_PUBLIC_SUPABASE_URL is set ✓
```

## Complete Variable List

Here's the full list for reference:

| Variable | Required For | Value |
|----------|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Next.js | `https://wpbdveyuuudhmwflrmqw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Next.js | Your anon key |
| `VITE_SUPABASE_URL` | Legacy components | Same as above |
| `VITE_SUPABASE_ANON_KEY` | Legacy components | Same as above |

## Optional Variables

These are optional but recommended:

```
NODE_VERSION=18
NPM_FLAGS=--include=dev --legacy-peer-deps
NEXT_TELEMETRY_DISABLED=1
```

## Troubleshooting

### Build Still Failing?

1. **Check variable names** - Must be exact (case-sensitive)
2. **Check variable scopes** - Must include "All branches" and "Deploy previews"
3. **Clear build cache**:
   - Site Settings → Build & deploy → Clear cache
   - Then trigger new deploy

### Variables Not Loading?

1. Make sure variables don't have quotes in Netlify UI
2. Check for extra spaces before/after values
3. Ensure scopes are set to "All" (not just production)

### Still Getting "undefined" Error?

The issue is likely that old Vite components are being built by Next.js.

**Quick Fix**:
Add this to your next.config.mjs:

```js
env: {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}
```

## Security Notes

⚠️ **NEVER commit `.env` or `.env.local` to Git**

✅ **Safe to commit**: `.env.example` (template only)
❌ **Never commit**: `.env`, `.env.local`, `.env.production`

The anon key shown above is safe to expose (it's public anyway), but:
- Never expose `SUPABASE_SERVICE_ROLE` key
- Never expose Stripe secret keys
- Keep all sensitive keys in Netlify environment variables only

## After Migration is Complete

Once all pages are migrated to Next.js:
1. Remove `VITE_*` variables
2. Update all components to use `NEXT_PUBLIC_*` instead
3. Clean up legacy configuration

---

**Next Step**: Add these variables to Netlify now, then trigger a new deployment!
