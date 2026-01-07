# Vercel Deployment Guide

This project is now configured for deployment to Vercel. Follow these steps to deploy your WildOut! Landing Page and Dashboard.

## Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher
- Supabase project with Edge Functions deployed
- Vercel account

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables Setup

**Option A: Vercel Dashboard (Recommended)**
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```env
VITE_SUPABASE_URL=https://yanjivicgslwutjzhzdx.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_zm-kn6CTFg3epMFOT4_jbA_TDrz0T25
VITE_APP_ENV=production
VITE_ADMIN_BASE_PATH=/admin
VITE_USE_DUMMY_DATA=false
```

**Option B: Vercel CLI**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
# ... add other variables
```

### 3. Local Development

```bash
# Start development server
pnpm dev

# Or with enhanced dev server (API proxy)
pnpm dev:smart
```

### 4. Build Locally

```bash
# Clean build
pnpm build:clean

# Standard build
pnpm build

# Preview built site
pnpm preview
```

## Deployment Methods

### Method 1: Vercel Git Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: make project Vercel ready"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Vite project

3. **Configure Build Settings**
   - Build Command: `pnpm build`
   - Output Directory: `build`
   - Install Command: `pnpm install`

4. **Add Environment Variables**
   - Add all environment variables from above
   - Click "Deploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# First deployment will ask questions:
# - Set up project? Yes
# - Which scope? Your Vercel account
# - Link to existing project? No
# - Project name? wildout-landing-dashboard
# - In which directory? ./
# - Override settings? No (uses vercel.json)

# Subsequent deployments
vercel --prod
```

### Method 3: GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build project
        run: pnpm build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Project Structure

```
wildout-landing-dashboard/
├── src/                    # React application source
├── build/                  # Production build output (Vercel serves this)
├── vercel.json            # Vercel configuration
├── vite.config.ts         # Vite build configuration
├── package.json           # Dependencies and scripts
└── .env.example           # Environment variable template
```

## Key Configuration Files

### vercel.json
- **Build Command**: `pnpm build`
- **Output Directory**: `build`
- **Routes**: Single-page application routing
- **Environment Variables**: Mapped to Vercel secrets

### vite.config.ts
- **Build Target**: `esnext` for modern browsers
- **Output Directory**: `build`
- **Code Splitting**: Manual chunks for optimal performance
- **Minification**: Terser for production

### package.json
- **Scripts**: `build`, `preview`, `test`
- **Engines**: Node >=18, pnpm >=8

## Supabase Edge Functions

This application requires Supabase Edge Functions to be deployed:

```bash
# Deploy Edge Functions (from Supabase CLI)
supabase functions deploy make-server-41a567c3
```

**Required Edge Functions Endpoints:**
- `GET/PUT /hero` - Hero section
- `GET/PUT /about` - About section
- `GET/POST/PUT/DELETE /events/:id` - Events management
- `GET/POST/PUT/DELETE /team/:id` - Team management
- `GET/POST/PUT/DELETE /partners/:id` - Partners management
- `GET/POST/PUT/DELETE /gallery/:id` - Gallery management
- `GET/PUT /settings` - Site settings

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite build
pnpm install
pnpm build:clean
```

### Environment Variables Not Working
- Ensure variables are prefixed with `VITE_`
- Redeploy after adding environment variables
- Check Vercel project settings

### Supabase Connection Issues
- Verify Supabase URL and publishable key
- Check Edge Function deployment status
- Ensure RLS policies are configured correctly

### Routing Issues (404)
- Vercel should automatically handle SPA routing
- If issues occur, add `vercel.json` redirects:
```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

## Performance Optimization

The build includes:
- **Code Splitting**: Vendor chunks for faster loading
- **Tree Shaking**: Unused code elimination
- **Minification**: Terser minification
- **Modern Target**: ESNext for optimal performance

## Monitoring & Analytics

### Vercel Analytics
Enable in Vercel dashboard for:
- Real-time traffic
- Performance metrics
- Error tracking

### Supabase Logs
Monitor Edge Functions:
```bash
supabase functions logs make-server-41a567c3
```

## Security Checklist

- [ ] Environment variables set in Vercel (not in code)
- [ ] Supabase publishable key (not secret key)
- [ ] RLS policies enabled on database tables
- [ ] CORS configured for production domain
- [ ] Authentication required for admin routes
- [ ] Input validation on all API endpoints

## Post-Deployment

1. **Test All Features**
   - Public landing page
   - Admin login and dashboard
   - All CRUD operations
   - Image uploads
   - Settings updates

2. **Monitor Performance**
   - Check Vercel analytics
   - Monitor Supabase logs
   - Test on different devices

3. **Set Up Custom Domain** (Optional)
   - Add domain in Vercel settings
   - Configure DNS records
   - Enable SSL automatically

## Support

For issues:
1. Check browser console for errors
2. Review Vercel deployment logs
3. Check Supabase Edge Function logs
4. Verify environment variables
5. Test API endpoints directly

---

**Ready for production!** 🚀