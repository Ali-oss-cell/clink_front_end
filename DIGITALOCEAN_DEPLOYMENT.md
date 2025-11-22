# DigitalOcean App Platform Deployment Guide

This guide will help you deploy the Clink Frontend application to DigitalOcean App Platform.

## 📋 Prerequisites

1. **DigitalOcean Account**: Sign up at [digitalocean.com](https://www.digitalocean.com)
2. **GitHub/GitLab Repository**: Your code should be in a Git repository
3. **Backend API**: Your Django backend should be deployed and accessible
4. **Environment Variables**: Know your backend API URL

---

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Ensure all files are committed**:
   ```bash
   git add .
   git commit -m "Prepare for DigitalOcean deployment"
   git push origin main
   ```

2. **Verify `.env.example` exists** (already created)

3. **Verify `package.json` has build script**:
   ```json
   {
     "scripts": {
       "build": "tsc -b && vite build"
     }
   }
   ```

### Step 2: Create App on DigitalOcean

1. **Log in to DigitalOcean** and navigate to **App Platform**

2. **Click "Create App"**

3. **Connect your repository**:
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository
   - Choose the branch (usually `main` or `master`)

4. **Configure the app**:
   - **Name**: `clink-frontend` (or your preferred name)
   - **Type**: Static Site
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Configure Environment Variables

In the DigitalOcean App Platform dashboard:

1. Go to **Settings** → **App-Level Environment Variables**

2. Add the following variables:

   ```
   VITE_API_BASE_URL=https://your-backend-api.com/api
   VITE_ENV=production
   VITE_APP_NAME=Clink Psychology Clinic
   VITE_DEBUG=false
   ```

   **Important**: Replace `https://your-backend-api.com/api` with your actual backend API URL.

### Step 4: Configure Build Settings

1. **Runtime**: Node.js
2. **Build Command**: `npm ci && npm run build`
3. **Output Directory**: `dist`
4. **HTTP Port**: Leave default (or 4173 for preview)

### Step 5: Configure Routes (SPA Support)

Since this is a React SPA (Single Page Application), you need to configure routing:

1. In DigitalOcean App Platform, go to **Settings** → **Static Site Settings**

2. **Add a rewrite rule**:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Type**: Rewrite

   This ensures all routes are handled by React Router.

### Step 6: Deploy

1. Click **"Create Resources"** or **"Deploy"**

2. DigitalOcean will:
   - Install dependencies
   - Run the build command
   - Deploy the static files

3. Wait for the deployment to complete (usually 5-10 minutes)

---

## 🔧 Configuration Files

### Option 1: Using DigitalOcean App Spec (Recommended)

Create a `.do/app.yaml` file in your repository:

```yaml
name: clink-frontend
static_sites:
  - name: frontend
    github:
      repo: your-username/your-repo
      branch: main
      deploy_on_push: true
    build_command: npm ci && npm run build
    output_dir: dist
    routes:
      - path: /
    envs:
      - key: VITE_API_BASE_URL
        value: ${backend.API_URL}
        scope: RUN_TIME
      - key: VITE_ENV
        value: production
        scope: RUN_TIME
      - key: VITE_APP_NAME
        value: Clink Psychology Clinic
        scope: RUN_TIME
      - key: VITE_DEBUG
        value: "false"
        scope: RUN_TIME
```

### Option 2: Manual Configuration

Use the DigitalOcean dashboard to configure everything manually (as described in steps above).

---

## 🌐 Custom Domain Setup

1. **In DigitalOcean App Platform**:
   - Go to **Settings** → **Domains**
   - Click **"Add Domain"**
   - Enter your domain name (e.g., `app.yourdomain.com`)

2. **Configure DNS**:
   - Add a CNAME record pointing to your DigitalOcean app
   - Or add an A record with the provided IP address

3. **SSL Certificate**:
   - DigitalOcean automatically provisions SSL certificates via Let's Encrypt
   - Wait for certificate provisioning (usually 5-10 minutes)

---

## 🔍 Post-Deployment Checklist

- [ ] Verify the app is accessible at the provided URL
- [ ] Test authentication (login/logout)
- [ ] Test API connectivity (check browser console for errors)
- [ ] Test all major routes (dashboard, appointments, etc.)
- [ ] Verify environment variables are set correctly
- [ ] Check that 404 routes redirect properly
- [ ] Test on mobile devices
- [ ] Verify SSL certificate is active (HTTPS)

---

## 🐛 Troubleshooting

### Issue: API calls failing

**Solution**: 
- Check `VITE_API_BASE_URL` is set correctly
- Ensure backend API allows CORS from your frontend domain
- Check browser console for CORS errors

### Issue: Routes return 404

**Solution**:
- Verify rewrite rule is configured (`/*` → `/index.html`)
- Check that `dist/index.html` exists after build

### Issue: Build fails

**Solution**:
- Check build logs in DigitalOcean dashboard
- Verify all dependencies are in `package.json`
- Ensure Node.js version is compatible (check `package.json` engines if specified)

### Issue: Environment variables not working

**Solution**:
- Remember: Vite requires `VITE_` prefix for environment variables
- Variables must be set at **App-Level**, not component-level
- Rebuild the app after changing environment variables

---

## 📊 Monitoring & Logs

1. **View Logs**:
   - Go to **Runtime Logs** in DigitalOcean dashboard
   - Filter by build or runtime logs

2. **Monitor Performance**:
   - Check **Metrics** tab for:
     - Response times
     - Error rates
     - Request counts

3. **Set up Alerts**:
   - Configure alerts for:
     - High error rates
     - Slow response times
     - Deployment failures

---

## 🔄 Continuous Deployment

DigitalOcean App Platform supports automatic deployments:

1. **On Push to Main Branch**: Automatically deploys when you push to main
2. **Manual Deploy**: Deploy specific commits or branches
3. **Preview Deployments**: Test changes before merging

---

## 💰 Cost Estimation

- **Static Site**: $0/month (free tier available)
- **Custom Domain**: Included
- **SSL Certificate**: Included (free)
- **Bandwidth**: First 100GB free, then $0.01/GB

---

## 📚 Additional Resources

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/en/main/start/overview#deployment)

---

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Store sensitive keys in DigitalOcean environment variables
3. **CORS**: Configure backend to only allow requests from your frontend domain
4. **HTTPS**: Always use HTTPS in production (automatically handled by DigitalOcean)

---

## 📝 Notes

- The build process creates optimized production files in the `dist` directory
- All environment variables must be prefixed with `VITE_` to be accessible in the frontend
- Changes to environment variables require a rebuild
- Static files are served via CDN for fast global access

---

**Last Updated**: Generated for DigitalOcean App Platform deployment

