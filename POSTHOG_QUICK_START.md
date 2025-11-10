# PostHog Quick Start - Can't See Events? Start Here!

## 🚀 Fastest Way to Test PostHog

Your dev server is running at: **http://localhost:3000**

### Option 1: Use the Test Page (Easiest!)

1. **Open:** http://localhost:3000/posthog-test
2. **Open DevTools:** Press F12
3. **Go to Network tab:** Filter by "ingest"
4. **Click:** "Send Test Event" button
5. **Watch:** Network tab for POST to `/ingest/batch`
6. **Wait:** 1-2 minutes
7. **Check:** https://us.posthog.com → Events

✅ If you see the request in Network tab → PostHog is working!
✅ Events will appear in PostHog dashboard in 1-2 minutes

### Option 2: Quick Console Test

1. Open your app: http://localhost:3000
2. Press **F12** → Console tab
3. Paste and run:

```javascript
posthog.capture('quick_test', { test: true })
console.log('Test event sent! Check Network tab.')
```

4. Go to **Network** tab → Filter "ingest"
5. Should see POST to `/ingest/batch`

## 🔍 What to Look For

### In Browser Console
Look for: `[PostHog] Initialized successfully`

**✅ If you see it:** PostHog is working
**❌ If you don't:** Restart dev server and refresh browser

### In Network Tab (F12 → Network)
Filter by: `ingest`

Look for:
- `/ingest/decide` (when PostHog loads)
- `/ingest/batch` (when events are sent)

**✅ Status 200:** Events are being sent successfully
**❌ Status 400/500:** Check your API key
**❌ No requests:** PostHog might not be initialized

### In PostHog Dashboard
Go to: https://us.posthog.com → **Events**

Set date range to: **Last 24 hours**

Look for events like:
- `posthog_initialized` (development only)
- `$pageview` (automatic)
- `test_event_*` (from test page)
- `user_signed_in` / `vendor_signed_in` (after auth)

**⏱️ Events take 1-2 minutes to appear!**

## 🐛 Common Issues

### "Nothing in browser console"
**Fix:** Restart dev server
```bash
# Stop server (Ctrl+C)
npm run dev:next
# Hard refresh browser (Cmd+Shift+R)
```

### "No network requests"
**Fix:** Check initialization
```javascript
// In browser console:
console.log(posthog.__loaded)
// Should be: true
```

### "Events not in PostHog"
**Fix:** Wait 1-2 minutes, then check:
1. Correct project selected in PostHog
2. Date range set to "Last 24 hours"
3. Looking at "Events" tab (not "Persons")

### "Environment variables not working"
**Fix:** They must be set BEFORE starting server
```bash
# Stop server
# Verify .env.local has:
# NEXT_PUBLIC_POSTHOG_KEY=phc_eks7eRTlisR8V7DRjY0s1ZfPaDa0oNfj9TkeZmCvA9A
# NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Start server fresh
npm run dev:next
```

## 📚 Full Documentation

- **Setup Guide:** [POSTHOG_SETUP.md](POSTHOG_SETUP.md)
- **Troubleshooting:** [POSTHOG_TROUBLESHOOTING.md](POSTHOG_TROUBLESHOOTING.md)
- **Build Status:** [BUILD_STATUS.md](BUILD_STATUS.md)

## ✅ Verification Checklist

- [ ] Dev server running (`npm run dev:next`)
- [ ] Browser console shows: `[PostHog] Initialized successfully`
- [ ] Network tab shows requests to `/ingest/`
- [ ] Test page works: http://localhost:3000/posthog-test
- [ ] Waited 1-2 minutes for events to appear
- [ ] PostHog dashboard open: https://us.posthog.com
- [ ] Viewing correct project
- [ ] Events tab shows recent events

## 🆘 Still Stuck?

1. **Check server logs** - Look for errors when server starts
2. **Try test page first** - http://localhost:3000/posthog-test
3. **Run manual test** - Copy commands from [POSTHOG_TROUBLESHOOTING.md](POSTHOG_TROUBLESHOOTING.md)
4. **Check PostHog status** - https://status.posthog.com

## 🎯 Key Points

- ⏱️ **Events take 1-2 minutes** to appear in PostHog
- 🔄 **Restart server** after changing environment variables
- 🌐 **Network tab** is your friend for debugging
- 📱 **Test page** is the fastest way to verify setup
- 🔍 **Console logs** will show if PostHog loaded

---

**Your Configuration:**
- API Key: `phc_eks7eRTlisR8V7DRjY0s1ZfPaDa0oNfj9TkeZmCvA9A`
- API Host: `/ingest` (proxied)
- UI Host: `https://us.posthog.com`
- Dashboard: https://us.posthog.com

**Dev Server:** http://localhost:3000
**Test Page:** http://localhost:3000/posthog-test

---

Need more help? Check [POSTHOG_TROUBLESHOOTING.md](POSTHOG_TROUBLESHOOTING.md) for detailed debugging steps!
