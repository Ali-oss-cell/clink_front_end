# Fix Privacy Policy 404 Error

## 🔍 Problem
- ✅ Root `/` works (returns index.html)
- ❌ `/privacy-policy` returns 404 HTML page (not index.html)

## 🔧 Solution

The catchall_document is working for root but not for other paths. This is likely a DigitalOcean configuration issue.

### Step 1: Verify Catchall Document in DigitalOcean Dashboard

1. **Go to:** DigitalOcean Dashboard → Your App → Settings → Static Site Settings

2. **Check:**
   - ✅ **Catchall Document:** Should be `index.html`
   - ✅ **Routes section:** Should be EMPTY (no individual routes)

3. **If catchall_document is missing or wrong:**
   - Set it to: `index.html`
   - Save

### Step 2: Check for Error Document

1. **Go to:** Settings → Static Site Settings

2. **Check if there's an "Error Document" setting:**
   - If it's set to something other than `index.html`, change it to `index.html`
   - OR remove it entirely (catchall_document should handle errors)

### Step 3: Clear CDN Cache

The 404 might be cached. Try:

1. **In DigitalOcean Dashboard:**
   - Go to your App
   - Look for "Cache" or "CDN" settings
   - Clear cache or purge CDN

2. **Or wait 10-15 minutes** for cache to expire

### Step 4: Verify Deployment

1. **Check:** DigitalOcean Dashboard → Deployments
2. **Ensure:** Latest deployment is "Live"
3. **Check build logs:** Make sure build succeeded

### Step 5: Test After Fix

```bash
# Should return index.html (200 OK), not 404
curl -I https://tailoredpsychology.com.au/privacy-policy

# Should show HTML with <div id="root"></div>
curl -s https://tailoredpsychology.com.au/privacy-policy | grep "root"
```

## 🎯 Expected Result

After fix:
- `https://tailoredpsychology.com.au/` → ✅ Returns index.html
- `https://tailoredpsychology.com.au/privacy-policy` → ✅ Returns index.html (React Router handles it)
- All routes → ✅ Return index.html

## 🔍 Alternative: Check if Using Spaces Instead of App Platform

If you're using DigitalOcean Spaces (not App Platform), you need:

1. **Go to:** Spaces → Your Space → Settings → Static Website Hosting
2. **Set:**
   - **Index Document:** `index.html`
   - **Error Document:** `index.html` (important!)

## 📝 Quick Checklist

- [ ] Catchall Document = `index.html` in dashboard
- [ ] Error Document = `index.html` (if option exists)
- [ ] No individual routes configured
- [ ] Latest deployment is "Live"
- [ ] CDN cache cleared (or wait 10-15 min)
- [ ] Test `/privacy-policy` returns index.html

