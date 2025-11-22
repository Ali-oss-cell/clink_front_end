# Deployment Checklist

Use this checklist to ensure your app is ready for DigitalOcean deployment.

## ✅ Pre-Deployment Checklist

### Code Preparation
- [x] All code committed to Git
- [x] `.env.example` file created with all required variables
- [x] Environment variables updated to use `VITE_API_BASE_URL`
- [x] `vite.config.ts` optimized for production
- [x] Build script works locally (`npm run build`)
- [x] No TypeScript errors (`npm run build` succeeds)
- [x] No linter errors

### Configuration Files
- [x] `ROUTES.md` - Complete routes documentation
- [x] `.do/app.yaml` - DigitalOcean App Platform spec (update with your repo)
- [x] `nginx.conf` - Nginx config for VPS deployment (optional)
- [x] `DIGITALOCEAN_DEPLOYMENT.md` - Deployment guide
- [x] `.gitignore` - Excludes `.env` and build files

### Testing
- [ ] Test build locally: `npm run build`
- [ ] Test preview build: `npm run preview`
- [ ] Verify all routes work in preview
- [ ] Test API connectivity with production API URL
- [ ] Test authentication flow
- [ ] Test on mobile devices (responsive design)

### Environment Variables
- [ ] `VITE_API_BASE_URL` - Set to production backend URL
- [ ] `VITE_ENV` - Set to `production`
- [ ] `VITE_APP_NAME` - Set to your app name
- [ ] `VITE_DEBUG` - Set to `false`

## 🚀 Deployment Steps

1. **Update `.do/app.yaml`**:
   - Replace `your-username/your-repo-name` with your actual repository
   - Update `VITE_API_BASE_URL` with your production backend URL

2. **Push to Git**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

3. **Create App on DigitalOcean**:
   - Go to App Platform
   - Create new app
   - Connect repository
   - Use `.do/app.yaml` or configure manually

4. **Set Environment Variables**:
   - Add all `VITE_*` variables in DigitalOcean dashboard
   - Ensure `VITE_API_BASE_URL` points to production backend

5. **Configure Routes**:
   - Add rewrite rule: `/*` → `/index.html`
   - This enables SPA routing

6. **Deploy**:
   - Click "Deploy" or push to trigger auto-deploy
   - Wait for build to complete

7. **Verify**:
   - Check app URL is accessible
   - Test login/logout
   - Test API calls
   - Check browser console for errors

## 🔍 Post-Deployment Verification

- [ ] App loads at provided URL
- [ ] Homepage displays correctly
- [ ] Login page works
- [ ] API calls succeed (check Network tab)
- [ ] All routes accessible (no 404s)
- [ ] SSL certificate active (HTTPS)
- [ ] Mobile responsive design works
- [ ] No console errors
- [ ] Environment variables loaded correctly

## 📝 Quick Reference

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```bash
VITE_API_BASE_URL=https://your-backend.com/api
VITE_ENV=production
VITE_APP_NAME=Clink Psychology Clinic
VITE_DEBUG=false
```

### Important Files
- `ROUTES.md` - All application routes
- `DIGITALOCEAN_DEPLOYMENT.md` - Detailed deployment guide
- `.do/app.yaml` - DigitalOcean App Platform configuration
- `.env.example` - Environment variable template

---

**Status**: ✅ Ready for deployment (pending final testing)

