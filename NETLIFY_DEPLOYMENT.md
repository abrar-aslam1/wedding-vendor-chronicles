# Netlify Deployment Guide for Next.js

## Prerequisites

Your site is now using Next.js with SSG (Static Site Generation). Netlify fully supports Next.js with their Next.js Runtime plugin.

## Configuration Files

### ✅ Already Configured

- **netlify.toml** - Updated for Next.js deployment
- **.gitignore** - Excludes Next.js build artifacts
- **package.json** - Contains `build:next` script

## Deployment Steps

### Option 1: Automatic Deployment (Recommended)

Your existing Netlify site will automatically deploy when you push to GitHub:

```bash
git push origin main
```

Netlify will:
1. Detect the updated `netlify.toml`
2. Run `npm run build:next`
3. Deploy the `.next` folder
4. Use the `@netlify/plugin-nextjs` runtime

### Option 2: Manual Deployment via Netlify UI

1. Go to your Netlify dashboard
2. Navigate to Site Settings → Build & Deploy
3. Update build settings:
   - **Build command**: `npm run build:next`
   - **Publish directory**: `.next`
4. Save and trigger a new deploy

### Option 3: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## Environment Variables

Make sure these are set in Netlify (Site Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_VERSION=18
```

## Post-Deployment Checklist

### 1. Verify Build Logs
- Check Netlify build logs for errors
- Ensure all 50 state pages are generated
- Confirm no TypeScript errors (temporarily ignored in config)

### 2. Test Key Pages
- ✅ Homepage: `https://findmyweddingvendor.com/`
- ✅ States listing: `https://findmyweddingvendor.com/states`
- ✅ State detail: `https://findmyweddingvendor.com/states/texas`
- ✅ State detail: `https://findmyweddingvendor.com/states/california`

### 3. Verify SEO
- View page source (right-click → View Page Source)
- Confirm full HTML is present (not just `<div id="root">`)
- Check meta tags are in `<head>`
- Verify Open Graph tags

### 4. Test Performance
- Run Lighthouse audit
- Check Core Web Vitals
- Verify images load correctly

## Troubleshooting

### Build Fails with "Module not found"

**Solution**: Make sure all dependencies are in `package.json`:
```bash
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Build Times Out

**Solution**: Netlify free tier has 300 second timeout. If needed:
1. Reduce number of SSG pages initially
2. Use ISR for dynamic pages
3. Upgrade to Pro plan

### Environment Variables Not Working

**Solution**:
1. Check they're prefixed with `NEXT_PUBLIC_` for client-side
2. Rebuild after adding variables
3. Clear cache: Site Settings → Build & Deploy → Clear cache

### Pages Return 404

**Solution**: Next.js handles routing differently than Vite:
- Remove any custom `_redirects` file
- Let Next.js routing handle all paths
- Check `next.config.mjs` for redirect rules

## Performance Optimizations

### Enable Netlify Edge Functions (Optional)

For even faster SSG with edge caching:

```toml
# Add to netlify.toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

### Enable Image Optimization

Netlify automatically optimizes images with Next.js. No additional config needed!

## Monitoring

### Analytics

Netlify Analytics shows:
- Page views
- Bandwidth usage
- Build times
- Deploy frequency

### Logs

View real-time logs:
```bash
netlify logs:function
```

## Rollback

If deployment fails, rollback to previous version:

1. Go to Netlify Dashboard → Deploys
2. Find last successful deploy
3. Click "Publish deploy"

Or via CLI:
```bash
netlify deploy:list
netlify deploy:switch [deploy-id]
```

## Migration Path

### Current Status (After This Commit):
- ✅ Homepage (SSG)
- ✅ States listing (SSG)
- ✅ 50 State detail pages (SSG)

### Still Using Vite (Until Fully Migrated):
- Search pages
- Vendor detail pages
- City detail pages
- User dashboards
- Static pages

### Transition Strategy:

**Option A - Dual Deploy (Recommended)**:
Keep both builds running temporarily:
1. Next.js for: `/`, `/states`, `/states/*`
2. Vite for everything else
3. Use Netlify redirects to route appropriately

**Option B - Full Cutover (When All Pages Migrated)**:
1. Complete migration of all pages
2. Remove Vite build from netlify.toml
3. Single Next.js deployment

## Expected Results

### Build Time:
- **First build**: 3-5 minutes (generating 50+ pages)
- **Subsequent builds**: 1-2 minutes (with caching)

### Bundle Sizes:
- Homepage: ~200-300 KB (initial)
- State pages: ~180-250 KB each
- Total: Optimized with code splitting

### SEO Impact Timeline:
- **Week 1**: Google recrawls, sees new HTML
- **Week 2-3**: Indexing increases 40-60%
- **Week 4+**: Full indexing of all pages (80-90%)

## Support

### Resources:
- [Netlify Next.js Docs](https://docs.netlify.com/frameworks/next-js/)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- Your migration guide: [NEXTJS_MIGRATION_GUIDE.md](NEXTJS_MIGRATION_GUIDE.md)

### Common Issues:
- Check Netlify build logs first
- Review Next.js error messages
- Test locally: `npm run build:next && npm run start`

---

**Status**: Ready to deploy! 🚀

Push this commit to trigger your first Next.js deployment on Netlify.
