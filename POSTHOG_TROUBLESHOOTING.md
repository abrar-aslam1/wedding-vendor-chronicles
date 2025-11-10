# PostHog Troubleshooting Guide

Can't see events in PostHog? Follow this step-by-step guide to diagnose and fix the issue.

---

## Quick Test Page

I've created a test page to verify your PostHog connection:

**Visit:** http://localhost:3000/posthog-test

This page will:
- Show if PostHog is initialized
- Let you send test events with one click
- Display your configuration
- Provide step-by-step verification instructions

---

## Step 1: Verify PostHog is Initializing

### Open Browser Console

1. Start your dev server: `npm run dev:next`
2. Open http://localhost:3000 in your browser
3. Press **F12** to open DevTools
4. Go to the **Console** tab
5. Look for: `[PostHog] Initialized successfully`

**✅ If you see it:** PostHog is loading correctly, continue to Step 2
**❌ If you don't see it:** Check Step 1 fixes below

### Step 1 Fixes

**Issue: PostHog not initializing**

Check your environment variables:
```bash
# In .env.local, verify these exist:
NEXT_PUBLIC_POSTHOG_KEY=phc_eks7eRTlisR8V7DRjY0s1ZfPaDa0oNfj9TkeZmCvA9A
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**Important:** Environment variables starting with `NEXT_PUBLIC_` must be set BEFORE starting the dev server. If you just added them:
1. Stop the dev server (Ctrl+C)
2. Run `npm run dev:next` again
3. Refresh your browser

---

## Step 2: Verify Network Requests

### Check Network Activity

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by typing: `ingest`
4. Visit the test page or trigger an auth event
5. Look for requests to `/ingest/batch` or `/ingest/decide`

**✅ If you see requests:** PostHog is sending data, continue to Step 3
**❌ If you see no requests:** Check Step 2 fixes below

### Step 2 Fixes

**Issue: No network requests**

1. **Check if events are being captured:**
   ```javascript
   // Open browser console and run:
   posthog.capture('manual_test_event', { test: true })
   ```
   Then check Network tab for a new request

2. **Verify PostHog is loaded:**
   ```javascript
   // In browser console:
   console.log(posthog.__loaded)
   // Should return: true
   ```

3. **Check for JavaScript errors:**
   - Look in Console tab for any red errors
   - PostHog won't work if there are blocking errors

---

## Step 3: Verify PostHog Dashboard Access

### Check Your PostHog Account

1. Go to https://us.posthog.com
2. Log in to your account
3. Verify you're in the **correct project**
4. Check the project settings for your API key

**Your API Key:** `phc_eks7eRTlisR8V7DRjY0s1ZfPaDa0oNfj9TkeZmCvA9A`

### Find Events

1. In PostHog dashboard, click **Events** in the left sidebar
2. Look for recent events (last 24 hours)
3. Events may take **1-2 minutes** to appear

**Common events to look for:**
- `posthog_initialized` (sent on page load in development)
- `$pageview` (automatic page views)
- `user_signed_in` / `vendor_signed_in` (after authentication)

---

## Step 4: Test Authentication Tracking

The easiest way to generate events is through authentication:

### Test User Sign Up

1. Go to http://localhost:3000/auth (if using old routes) or your auth page
2. Create a test account with email/password
3. Check browser console for confirmation
4. Wait 1-2 minutes
5. Check PostHog Events page

**Expected events:**
- `user_signed_up` or `vendor_signed_up`
- Properties: method, user_type

### Test User Sign In

1. Sign in with your test account
2. Check console for `posthog.identify()` call
3. Wait 1-2 minutes
4. Check PostHog **Persons** tab (not just Events)

**You should see:**
- A person identified by their user ID
- Properties: email, user_type, email_verified

---

## Common Issues & Solutions

### Issue 1: "Events not showing up"

**Cause:** PostHog has a delay in processing events

**Solution:**
- Wait 1-2 minutes after sending events
- Refresh the PostHog dashboard
- Check that you're looking at the last 24 hours of data

### Issue 2: "Wrong project in PostHog"

**Cause:** Multiple projects in your PostHog organization

**Solution:**
1. In PostHog, click your project name in top-left
2. Verify it matches the project for your API key
3. Check Settings → Project → API Key matches your `.env.local`

### Issue 3: "Ad blocker blocking requests"

**Cause:** Browser extension blocking analytics

**Solution:**
- We use `/ingest` proxy which should prevent this
- Try disabling ad blockers temporarily
- Check Network tab for blocked requests (will show in red)

### Issue 4: "Environment variables not working"

**Cause:** Next.js caches environment variables

**Solution:**
1. Stop the dev server completely (Ctrl+C)
2. Delete `.next` folder: `rm -rf .next`
3. Restart: `npm run dev:next`
4. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

### Issue 5: "CORS or network errors"

**Cause:** Proxy configuration issue

**Solution:**
1. Verify `next.config.mjs` has the rewrite rules:
   ```javascript
   async rewrites() {
     return [
       {
         source: '/ingest/static/:path*',
         destination: 'https://us-assets.i.posthog.com/static/:path*',
       },
       {
         source: '/ingest/:path*',
         destination: 'https://us.i.posthog.com/:path*',
       },
     ];
   }
   ```
2. Restart dev server

---

## Debugging Commands

Run these in your browser console to debug:

```javascript
// Check if PostHog is loaded
console.log('PostHog loaded:', posthog.__loaded)

// Check configuration
console.log('PostHog config:', {
  api_host: posthog.config.api_host,
  debug: posthog.config.debug
})

// Send a test event
posthog.capture('debug_test_event', {
  test: true,
  timestamp: new Date().toISOString()
})

// Check if you're identified
console.log('Distinct ID:', posthog.get_distinct_id())

// See what events are in the queue
console.log('Request queue:', posthog._requestQueue)
```

---

## Manual Testing Script

Copy and paste this in browser console after logging in:

```javascript
// Test complete flow
console.log('=== PostHog Manual Test ===')

// 1. Check initialization
console.log('1. PostHog loaded:', posthog.__loaded)

// 2. Send test event
posthog.capture('manual_test_event', {
  test: true,
  timestamp: new Date().toISOString(),
  page: window.location.pathname
})
console.log('2. Test event sent')

// 3. Identify test user
posthog.identify('test-user-' + Date.now(), {
  email: 'test@example.com',
  test_user: true
})
console.log('3. User identified')

// 4. Check distinct ID
console.log('4. Your distinct ID:', posthog.get_distinct_id())

console.log('=== Test Complete ===')
console.log('Check Network tab for /ingest/batch requests')
console.log('Check PostHog dashboard in 1-2 minutes')
```

---

## Still Not Working?

### Check These Files

1. **PostHogProvider** - [app/providers/PostHogProvider.tsx](app/providers/PostHogProvider.tsx)
   - Should have `debug: true` in development
   - Should call `posthog.init()` with your API key

2. **Layout** - [app/layout.tsx](app/layout.tsx)
   - Should wrap children with `<PostHogProvider>`
   - Located inside `<body>` tag

3. **Environment Variables** - `.env.local`
   - Must start with `NEXT_PUBLIC_` for client-side
   - No quotes around values
   - Server must be restarted after changes

4. **Proxy Config** - [next.config.mjs](next.config.mjs)
   - Should have `rewrites()` function
   - Should proxy `/ingest/*` to PostHog

### Get Support

If you're still stuck:

1. **Check PostHog Status:** https://status.posthog.com
2. **PostHog Docs:** https://posthog.com/docs/libraries/next-js
3. **PostHog Community Slack:** https://posthog.com/slack
4. **Check API key validity:** Try creating a new project in PostHog

### What to Include When Asking for Help

1. Console logs (screenshot)
2. Network tab showing /ingest requests (or lack thereof)
3. Your PostHog project ID
4. Whether you see `[PostHog] Initialized successfully` in console
5. Any error messages

---

## Quick Checklist

Use this checklist to verify everything:

- [ ] `.env.local` has `NEXT_PUBLIC_POSTHOG_KEY` set
- [ ] `.env.local` has `NEXT_PUBLIC_POSTHOG_HOST` set
- [ ] Dev server restarted after setting env vars
- [ ] Browser console shows `[PostHog] Initialized successfully`
- [ ] Network tab shows requests to `/ingest/batch`
- [ ] No errors in browser console
- [ ] Waiting 1-2 minutes for events to appear in PostHog
- [ ] Viewing correct project in PostHog dashboard
- [ ] Looking at Events page (not Persons page)
- [ ] Date range set to "Last 24 hours"

---

## Test Page Instructions

The fastest way to verify everything:

1. **Start dev server:** `npm run dev:next`
2. **Open test page:** http://localhost:3000/posthog-test
3. **Open DevTools:** Press F12
4. **Go to Network tab:** Filter by "ingest"
5. **Click "Send Test Event" button**
6. **Check Network tab:** Should see POST to /ingest/batch (status 200)
7. **Check Console:** Should see "[PostHog Test] Event sent"
8. **Wait 1-2 minutes**
9. **Open PostHog:** https://us.posthog.com → Events
10. **Look for:** `test_event_` + timestamp

If all steps work, PostHog is working correctly!

---

**Last Updated:** November 10, 2025
**PostHog Version:** posthog-js v1.290.0
