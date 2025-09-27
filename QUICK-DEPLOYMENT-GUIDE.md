# 🚀 Quick Deployment Guide - 3 Steps to Go Live

Your Instagram vendor automation system is **ready to deploy!** All files are created, you just need to push to GitHub and set up secrets.

## ✅ What's Already Done:

- ✅ **4 GitHub Actions workflows** created in `.github/workflows/`
- ✅ **Admin dashboard** at `/admin/approvals` route ready
- ✅ **MCP automation system** with YAML playbooks complete
- ✅ **GitHub secrets script** generated with your production URL
- ✅ **All environment variables** configured for `https://findmyweddingvendor.com`

## 🎯 Final 3 Steps:

### **Step 1: Install GitHub CLI (if not already installed)**
```bash
# On macOS (you're on macOS according to system info)
brew install gh

# Or download from: https://cli.github.com/
```

### **Step 2: Authenticate GitHub CLI**
```bash
gh auth login
# Follow prompts to authenticate with your GitHub account
```

### **Step 3: Set up GitHub Secrets (30 seconds)**
```bash
# Run the generated script that reads your .env file
./setup-github-secrets.sh

# This will set up all 18 secrets automatically:
# - Production URL: https://findmyweddingvendor.com
# - All Supabase keys from your .env
# - DataForSEO credentials 
# - Rate limiting settings
# - Stripe keys (optional)
```

## 🎉 That's It! Your Automation Will Be Live

After running these 3 commands, your Instagram vendor automation will be:

✅ **Running daily QC reports** at 6 AM UTC  
✅ **Running weekly maintenance** on Sundays at 7 AM UTC  
✅ **Creating approval requests** monthly for Tier 1/2 backfills  
✅ **Ready for admin approval** at https://findmyweddingvendor.com/admin/approvals  

## 📊 What Happens Next:

**This Week:**
- Daily QC reports start running automatically
- Weekly maintenance begins this Sunday

**This Month:**
- 1st of month: Tier 1 approval request appears in your admin dashboard
- 2nd of month: Tier 2 approval request appears in your admin dashboard

**After You Approve:**
- 400+ Instagram vendors from Tier 1 cities (NYC, LA, Chicago)
- 300+ Instagram vendors from Tier 2 cities (medium metros)
- All with quality filtering, contact info, and ratings

## 🔧 Manual Commands (for testing):

```bash
# Test the QC report locally
npm run play:qc:daily

# Test a city-specific collection
CITY="Austin" STATE="TX" CATEGORY="wedding-photographers" npm run play:backfill:city

# Check GitHub Actions status after deployment
gh workflow list
```

## 🎯 Verify Deployment:

1. **Check GitHub Actions**: Go to your repo → Actions tab → See 4 new workflows
2. **Test Admin Dashboard**: Visit https://findmyweddingvendor.com/admin/approvals
3. **Run Manual Test**: GitHub → Actions → "Daily QC Report" → Run workflow
4. **View Results**: Admin dashboard should show vendor quality previews

## 🆘 If You Need Help:

**GitHub CLI not working?**
- Make sure you're in the correct repository directory
- Run `gh auth status` to verify authentication
- Check repository permissions (need admin access for secrets)

**Secrets not setting up?**
- Verify you're in the root of your repo
- Make sure `.env` file exists with all values
- Run `node scripts/setup-github-secrets.js` to see the commands

**Admin dashboard not loading?**
- Check that the route is deployed: https://findmyweddingvendor.com/admin/approvals
- Verify admin authentication is working
- Test locally first: `npm run dev` → http://localhost:3000/admin/approvals

Your Instagram vendor automation system is production-ready! 🚀
