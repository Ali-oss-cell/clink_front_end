# Clear Domain Setup Steps for DigitalOcean

## ✅ STEP 1: Add Domain (You're doing this now)

**What you see:**
- Domain: `tailoredpsychology.com.au`
- CNAME alias: `hammerhead-app-vup4g.ondigitalocean.app`
- A records: `162.159.140.98` and `172.66.0.96`

**What to do:**
1. ✅ Choose: **"We manage your domain"** (recommended)
2. ✅ Click **"Add domain"**
3. ⏳ Wait 5-10 minutes for DNS to update

**Result:** Your site will be live at `https://tailoredpsychology.com.au`

---

## ✅ STEP 2: Configure Environment Variables

**Go to:** DigitalOcean Dashboard → Your App → Settings → Environment Variables

**Add these variables:**

```
VITE_API_BASE_URL = https://your-backend-api-url.com/api
VITE_ENV = production
VITE_APP_NAME = Tailored Psychology
VITE_DEBUG = false
```

**⚠️ IMPORTANT:** Replace `https://your-backend-api-url.com/api` with your actual backend API URL.

**Examples:**
- If backend is at `https://api.tailoredpsychology.com.au/api` → use that
- If backend is at `http://209.38.89.74:8000/api` → use that (but prefer HTTPS)
- If backend is at `https://backend.example.com/api` → use that

---

## ✅ STEP 3: Verify Build Settings

**Go to:** DigitalOcean Dashboard → Your App → Settings → App Spec

**Check these are set:**
- ✅ Build Command: `npm ci && npm run build`
- ✅ Output Directory: `dist`
- ✅ SPA Routing: `catchall_document: index.html` (should be automatic)

---

## ✅ STEP 4: Test Your Site

1. Visit: `https://tailoredpsychology.com.au`
2. Open browser console (F12)
3. Check for errors
4. Test login/API calls

---

## ❓ Common Questions

**Q: Which option should I choose?**
A: Choose **"We manage your domain"** - it's easier and automatic.

**Q: What if I already have DNS records?**
A: DigitalOcean will overwrite them. If you have other services using this domain, coordinate the change or choose "You manage your domain" instead.

**Q: How long does it take?**
A: DNS propagation: 5 minutes to 72 hours (usually 10-30 minutes). SSL: Automatic once DNS is ready.

**Q: What's my backend API URL?**
A: This is where your Django backend is hosted. Check your backend deployment or ask your backend developer.

---

## 🆘 If Something Goes Wrong

1. **Domain not working?**
   - Wait 10-30 minutes
   - Check DNS propagation: https://dnschecker.org
   - Verify domain is added in DigitalOcean dashboard

2. **SSL not working?**
   - Wait for DNS to fully propagate
   - Check domain status in DigitalOcean dashboard
   - Should show "Active" with green checkmark

3. **API calls failing?**
   - Check `VITE_API_BASE_URL` is set correctly
   - Verify backend allows CORS from your domain
   - Check browser console for errors

