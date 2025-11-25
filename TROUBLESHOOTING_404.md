# Troubleshooting 404 Error on Root Domain

## 🔍 Problem
Getting `HTTP ERROR 404` when visiting `https://tailoredpsychology.com.au/`

## ✅ Step-by-Step Fix

### 1. Check if Domain is Added to DigitalOcean App

**Go to:** DigitalOcean Dashboard → Your App → Settings → Domains

**Check:**
- ✅ Is `tailoredpsychology.com.au` listed?
- ✅ Is it showing as "Active" or "Pending"?
- ✅ What is the status? (Active, Pending, Error)

**If domain is NOT listed:**
1. Click **"Add Domain"**
2. Enter: `tailoredpsychology.com.au`
3. Choose: **"We manage your domain"** (recommended)
4. Click **"Add Domain"**
5. Wait 5-10 minutes for DNS propagation

---

### 2. Check DNS Configuration

**Option A: If DigitalOcean manages your domain**
- DNS records are automatically configured
- Check in DigitalOcean → Networking → Domains
- Should see CNAME or A records pointing to your app

**Option B: If you manage your domain**
- Go to your domain registrar (where you bought the domain)
- Add these DNS records:

**For CNAME (recommended):**
```
Type: CNAME
Name: @ (or leave blank)
Value: hammerhead-app-vup4g.ondigitalocean.app
TTL: 3600
```

**OR for A Records:**
```
Type: A
Name: @ (or leave blank)
Value: 162.159.140.98
TTL: 3600

Type: A
Name: @ (or leave blank)
Value: 172.66.0.96
TTL: 3600
```

**Check DNS propagation:**
```bash
# In terminal, check if DNS is resolving
nslookup tailoredpsychology.com.au
# OR
dig tailoredpsychology.com.au
```

---

### 3. Check App Deployment Status

**Go to:** DigitalOcean Dashboard → Your App → Deployments

**Check:**
- ✅ Is there a successful deployment?
- ✅ Is the latest deployment "Live"?
- ✅ Are there any build errors?

**If deployment failed:**
- Check build logs
- Fix any errors
- Redeploy

---

### 4. Check App URL

**Go to:** DigitalOcean Dashboard → Your App → Overview

**Check:**
- What is the default app URL? (e.g., `https://hammerhead-app-vup4g.ondigitalocean.app`)
- Does this default URL work?

**If default URL works but custom domain doesn't:**
- Domain DNS is not configured correctly
- Go back to Step 2

**If default URL also shows 404:**
- App deployment issue
- Check Step 3

---

### 5. Verify App Configuration

**Go to:** DigitalOcean Dashboard → Your App → Settings → App Spec

**Check these settings:**
```yaml
static_sites:
  - name: frontend
    build_command: npm ci && npm run build
    output_dir: dist
    routes:
      - path: /
    catchall_document: index.html  # ← This is CRITICAL for SPA
```

**If `catchall_document` is missing:**
- Add it in the dashboard
- Or update `.do/app.yaml` and push to git

---

### 6. Check SSL Certificate

**Go to:** DigitalOcean Dashboard → Your App → Settings → Domains

**Check:**
- ✅ Is SSL certificate "Active" or "Pending"?
- ✅ Is there an SSL error?

**If SSL is pending:**
- Wait 5-10 minutes
- DNS must be configured first
- SSL is automatically provisioned by Let's Encrypt

---

### 7. Test with Default URL First

**Before troubleshooting custom domain:**
1. Visit the default DigitalOcean URL (e.g., `https://hammerhead-app-vup4g.ondigitalocean.app`)
2. Does it work?
3. If yes → Domain/DNS issue
4. If no → App deployment issue

---

## 🚨 Common Issues & Solutions

### Issue 1: Domain Not Added
**Symptom:** 404 on custom domain, but default URL works
**Solution:** Add domain in DigitalOcean dashboard (Step 1)

### Issue 2: DNS Not Configured
**Symptom:** Domain added but still 404
**Solution:** Configure DNS records (Step 2)

### Issue 3: DNS Propagation Delay
**Symptom:** Just added domain, still 404
**Solution:** Wait 5-10 minutes (can take up to 72 hours)

### Issue 4: App Not Deployed
**Symptom:** Both default and custom domain show 404
**Solution:** Check deployment status and redeploy (Step 3)

### Issue 5: Missing catchall_document
**Symptom:** Root works but `/privacy-policy` shows 404
**Solution:** Add `catchall_document: index.html` (Step 5)

---

## 🔧 Quick Fix Checklist

- [ ] Domain added in DigitalOcean dashboard
- [ ] DNS records configured (CNAME or A records)
- [ ] App deployment successful and "Live"
- [ ] `catchall_document: index.html` is set
- [ ] SSL certificate is active
- [ ] Default app URL works
- [ ] Waited 5-10 minutes after DNS changes

---

## 📞 Still Not Working?

1. **Check browser console** (F12) for errors
2. **Check DigitalOcean app logs** for errors
3. **Verify build succeeded** in deployment logs
4. **Test default URL** to isolate domain vs app issue
5. **Contact DigitalOcean support** if all else fails

---

## ✅ Expected Result

After fixing:
- `https://tailoredpsychology.com.au/` → Shows homepage
- `https://tailoredpsychology.com.au/privacy-policy` → Shows privacy policy
- All routes work through React Router
- SSL certificate is active (green padlock)

