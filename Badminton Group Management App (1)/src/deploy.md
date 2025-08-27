# Deployment Guide

## Complete Deployment Steps

### 1. Prepare Supabase for Production

#### Configure Authentication
1. Go to Supabase Dashboard → Authentication → Settings
2. Set **Site URL** to your production domain: `https://yourdomain.com`
3. Add **Redirect URLs**: 
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com`
4. Configure **Email Templates** if using email auth
5. Set **JWT Expiry** as needed (default 3600 seconds)

#### Database Security
1. Enable **Row Level Security** if needed
2. Review **API Keys** (already configured)
3. Set up **Database Backup** schedule
4. Configure **Rate Limiting** in project settings

### 2. Frontend Deployment Options

#### Option A: Vercel (Recommended)

**Why Vercel?**
- Automatic HTTPS
- Global CDN
- Excellent React support
- Easy environment variable management
- Git integration

**Steps:**
1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/badminton-manager.git
git push -u origin main
```

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Set environment variables:
     - `VITE_SUPABASE_PROJECT_ID` = `ragbicjnfhsaosyhonzi`
     - `VITE_SUPABASE_ANON_KEY` = `your_anon_key`
   - Deploy

3. **Custom Domain** (Optional):
   - Go to project settings → Domains
   - Add your custom domain
   - Configure DNS records

#### Option B: Netlify

**Steps:**
1. **Build locally**:
```bash
npm run build
```

2. **Deploy to Netlify**:
   - Go to https://netlify.com
   - Drag and drop the `dist` folder
   - Or connect GitHub repository

3. **Environment Variables**:
   - Go to Site settings → Environment variables
   - Add the same variables as above

4. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

#### Option C: Cloudflare Pages

**Steps:**
1. **Connect Repository**:
   - Go to Cloudflare Pages
   - Connect your GitHub repository

2. **Build Settings**:
   - Framework preset: None
   - Build command: `npm run build`
   - Build output directory: `dist`

3. **Environment Variables**:
   - Add in Pages settings

### 3. Domain and SSL Setup

#### Custom Domain Configuration
1. **Purchase Domain** (if needed):
   - Namecheap, GoDaddy, or Cloudflare

2. **DNS Configuration**:
   ```
   Type: CNAME
   Name: www
   Value: your-app.vercel.app
   
   Type: A
   Name: @
   Value: 76.76.19.61 (Vercel IP)
   ```

3. **SSL Certificate**:
   - Automatically provided by hosting platforms
   - Verify HTTPS is working

### 4. Environment Configuration

#### Production Environment Variables
```bash
# Required for production
VITE_SUPABASE_PROJECT_ID=ragbicjnfhsaosyhonzi
VITE_SUPABASE_ANON_KEY=your_public_anon_key

# Optional analytics/monitoring
VITE_GOOGLE_ANALYTICS_ID=GA_TRACKING_ID
VITE_SENTRY_DSN=sentry_dsn_url
```

#### Update Supabase URLs
Ensure your production app uses the correct Supabase URL:
- `https://ragbicjnfhsaosyhonzi.supabase.co`

### 5. Performance Optimization

#### Frontend Optimizations
- ✅ Code splitting (already configured)
- ✅ Lazy loading components
- ✅ Image optimization
- ✅ Bundle analysis

#### Supabase Optimizations
- Enable **Connection Pooling**
- Set up **Database Indexes** if needed
- Configure **Edge Functions** regions
- Enable **Realtime** only where needed

### 6. Monitoring and Analytics

#### Error Monitoring
1. **Sentry Integration**:
```bash
npm install @sentry/react @sentry/tracing
```

2. **Add to main.tsx**:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: "production"
});
```

#### Analytics
1. **Google Analytics**:
```bash
npm install gtag
```

2. **Add tracking code** to index.html

#### Uptime Monitoring
- **UptimeRobot**: Free monitoring
- **Pingdom**: Advanced monitoring
- **Vercel Analytics**: Built-in if using Vercel

### 7. Security Checklist

- ✅ HTTPS enabled
- ✅ Environment variables secured
- ✅ No sensitive data in client code
- ✅ Supabase RLS policies configured
- ✅ CORS settings configured
- ✅ Rate limiting enabled

### 8. Backup and Recovery

#### Database Backups
1. **Automatic Backups**:
   - Enabled in Supabase Pro plan
   - Daily backups retained for 7 days

2. **Manual Backup**:
```bash
# Export data from Supabase dashboard
# Or use pg_dump if direct access available
```

#### Code Backups
- ✅ Git repository
- ✅ Deployment history in hosting platform

### 9. Testing Production Deploy

#### Pre-deployment Checklist
- [ ] All environment variables set
- [ ] Build completes successfully
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Database operations work
- [ ] Edge functions respond
- [ ] Mobile responsive
- [ ] Performance acceptable

#### Post-deployment Testing
1. **Create test account**
2. **Test all user flows**:
   - Sign up/login
   - Create group
   - Register players
   - Add courts
   - Generate matches
   - View reports
3. **Test admin features**
4. **Verify real-time features**

### 10. Maintenance

#### Regular Tasks
- **Monitor error logs** weekly
- **Review performance metrics** monthly
- **Update dependencies** quarterly
- **Backup verification** monthly
- **Security updates** as needed

#### Scaling Considerations
- **Database scaling**: Upgrade Supabase plan
- **CDN**: Already included with hosting
- **Edge Functions**: Auto-scaling included
- **Rate limiting**: Monitor and adjust

### Quick Deploy Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod --dir=dist
```

### Troubleshooting

#### Common Issues
1. **Environment variables not working**:
   - Check variable names (must start with VITE_)
   - Verify values in hosting platform

2. **Supabase connection failed**:
   - Check project ID and keys
   - Verify Supabase project is active

3. **Build failures**:
   - Check Node.js version compatibility
   - Clear node_modules and reinstall

4. **Authentication issues**:
   - Verify redirect URLs in Supabase
   - Check site URL configuration

Need help? Create an issue in the repository or contact support.