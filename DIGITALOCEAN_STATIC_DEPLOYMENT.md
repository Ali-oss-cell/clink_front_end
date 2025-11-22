# DigitalOcean Static Website Deployment Guide

This guide will help you deploy the Clink Frontend as a **static website** on DigitalOcean.

## 📋 Deployment Options

You have two main options for static website hosting on DigitalOcean:

1. **DigitalOcean App Platform (Static Site)** - Recommended (Easiest)
2. **DigitalOcean Spaces + CDN** - Alternative (More control)

---

## 🚀 Option 1: DigitalOcean App Platform (Static Site)

This is the easiest option with automatic deployments, SSL, and CDN.

### Step 1: Prepare Your Repository

1. **Ensure all files are committed**:
   ```bash
   git add .
   git commit -m "Ready for static site deployment"
   git push origin main
   ```

2. **Verify build works locally**:
   ```bash
   npm run build
   ```
   This should create a `dist` folder with all static files.

### Step 2: Create Static Site on DigitalOcean

1. **Log in to DigitalOcean** and navigate to **App Platform**

2. **Click "Create App"**

3. **Connect your repository**:
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Select your repository
   - Choose the branch (usually `main`)

4. **Configure as Static Site**:
   - **Resource Type**: Select **"Static Site"**
   - **Name**: `clink-frontend` (or your preferred name)
   - **Build Command**: `npm ci && npm run build`
   - **Output Directory**: `dist`
   - **HTTP Port**: Leave default (or 4173)

### Step 3: Configure Environment Variables

1. Go to **Settings** → **App-Level Environment Variables**

2. Add these variables:

   ```
   VITE_API_BASE_URL=https://your-backend-api.com/api
   VITE_ENV=production
   VITE_APP_NAME=Clink Psychology Clinic
   VITE_DEBUG=false
   ```

   **Important**: Replace `https://your-backend-api.com/api` with your actual backend API URL.

### Step 4: Configure SPA Routing

Since this is a React SPA, configure routing:

1. Go to **Settings** → **Static Site Settings**

2. **Add a rewrite rule**:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Type**: Rewrite

   This ensures all routes are handled by React Router.

### Step 5: Deploy

1. Click **"Create Resources"** or **"Deploy"**

2. DigitalOcean will:
   - Install dependencies (`npm ci`)
   - Build the app (`npm run build`)
   - Deploy static files from `dist` folder
   - Set up CDN and SSL automatically

3. Wait for deployment (usually 5-10 minutes)

### Step 6: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Configure DNS with provided CNAME record
5. SSL certificate is automatically provisioned

---

## 🌐 Option 2: DigitalOcean Spaces + CDN

This option gives you more control and uses object storage.

### Step 1: Build Your Site

```bash
npm run build
```

This creates a `dist` folder with all static files.

### Step 2: Create DigitalOcean Space

1. Go to **Spaces** in DigitalOcean dashboard
2. Click **"Create a Space"**
3. Configure:
   - **Name**: `clink-frontend` (or your choice)
   - **Region**: Choose closest to your users
   - **CDN**: Enable CDN (recommended)
   - **File Listing**: Disable (for security)

### Step 3: Upload Files

**Option A: Using DigitalOcean Control Panel**
1. Go to your Space
2. Click **"Upload"**
3. Upload all files from the `dist` folder
4. **Important**: Upload `index.html` to the root

**Option B: Using `s3cmd` or `rclone`**
```bash
# Install s3cmd
pip install s3cmd

# Configure (use your Spaces access key)
s3cmd --configure

# Upload files
cd dist
s3cmd sync . s3://your-space-name/ --acl-public
```

**Option C: Using GitHub Actions (Automated)**
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to DigitalOcean Spaces

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
      
      - name: Deploy to Spaces
        uses: digitalocean/app_action@v1
        with:
          spaces_access_key: ${{ secrets.SPACES_ACCESS_KEY }}
          spaces_secret_key: ${{ secrets.SPACES_SECRET_KEY }}
          spaces_name: your-space-name
          spaces_endpoint: nyc3.digitaloceanspaces.com
          source_dir: dist
```

### Step 4: Configure Static Website Hosting

1. Go to your Space → **Settings** → **Static Website Hosting**
2. Enable **"Static Website Hosting"**
3. Set **Index Document**: `index.html`
4. Set **Error Document**: `index.html` (for SPA routing)

### Step 5: Configure Custom Domain

1. Go to **Settings** → **Custom Domain**
2. Add your domain
3. Configure DNS:
   - Add CNAME record pointing to your Space CDN endpoint
   - Or use provided IP address with A record
4. SSL certificate is automatically provisioned

### Step 6: Set Environment Variables

Since Spaces is static hosting, you need to:
1. Build with production environment variables
2. Or use a build-time script to inject variables

**Build script with env vars**:
```bash
# Build with environment variables
VITE_API_BASE_URL=https://your-backend.com/api \
VITE_ENV=production \
npm run build
```

---

## 🔧 Configuration Files

### For App Platform (Static Site)

Update `.do/app.yaml`:
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
    catchall_document: index.html
    envs:
      - key: VITE_API_BASE_URL
        value: https://your-backend-api.com/api
        scope: RUN_TIME
      - key: VITE_ENV
        value: production
        scope: RUN_TIME
```

### For Spaces Deployment

Use the `nginx.conf` as reference, but Spaces handles this automatically when you enable static website hosting.

---

## 🔍 Post-Deployment Checklist

- [ ] Verify app loads at provided URL
- [ ] Test all routes (no 404 errors)
- [ ] Test API connectivity
- [ ] Verify SSL certificate (HTTPS)
- [ ] Test authentication flow
- [ ] Check mobile responsiveness
- [ ] Verify environment variables are working
- [ ] Test on different browsers

---

## 🐛 Troubleshooting

### Issue: Routes return 404

**Solution**:
- **App Platform**: Verify rewrite rule is set (`/*` → `/index.html`)
- **Spaces**: Ensure "Error Document" is set to `index.html` in Static Website Hosting settings

### Issue: API calls failing

**Solution**:
- Check `VITE_API_BASE_URL` is set correctly
- Ensure backend allows CORS from your frontend domain
- Check browser console for CORS errors
- Verify environment variables are set at build time (for Spaces)

### Issue: Environment variables not working

**Solution**:
- **App Platform**: Variables must be set in dashboard, rebuild required
- **Spaces**: Variables must be set at build time (before upload)
- Remember: Vite requires `VITE_` prefix

### Issue: Build fails

**Solution**:
- Check build logs
- Verify Node.js version compatibility
- Ensure all dependencies are in `package.json`
- Test build locally first: `npm run build`

---

## 💰 Cost Comparison

### App Platform (Static Site)
- **Free tier**: Available
- **Paid**: $0/month for static sites
- Includes: CDN, SSL, automatic deployments

### Spaces + CDN
- **Storage**: $5/month for 250GB
- **Bandwidth**: First 1TB free, then $0.01/GB
- **CDN**: Included
- **Total**: ~$5-10/month

---

## 📊 Recommended Approach

**For most users**: Use **DigitalOcean App Platform (Static Site)**
- Easiest setup
- Automatic deployments
- Free tier available
- Built-in CDN and SSL
- Environment variable management

**For advanced users**: Use **DigitalOcean Spaces**
- More control
- Lower cost at scale
- Can integrate with CI/CD
- Better for large files

---

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Store in DigitalOcean environment variables (App Platform) or build-time secrets (Spaces)
3. **CORS**: Configure backend to only allow your frontend domain
4. **HTTPS**: Always use HTTPS (automatically handled)
5. **File Listing**: Disable directory listing in Spaces

---

## 📝 Quick Start Commands

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Test build output
cd dist
python -m http.server 8000
# Then visit http://localhost:8000
```

---

## 🎯 Next Steps

1. Choose your deployment method (App Platform recommended)
2. Follow the steps above
3. Test thoroughly
4. Set up custom domain (optional)
5. Monitor performance and errors

---

**Last Updated**: Static Website Deployment Guide for DigitalOcean

