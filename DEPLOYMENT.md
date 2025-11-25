# Scathat Deployment Guide

## Web Application (Vercel)

### Initial Setup
\`\`\`bash
# 1. Create Vercel account at vercel.com
# 2. Connect GitHub repository
# 3. Vercel will auto-detect Next.js

# Or deploy via CLI
npm i -g vercel
vercel
\`\`\`

### Environment Variables
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add variables:
\`\`\`
NEXT_PUBLIC_API_URL=https://api.scathat.io
API_SECRET=your_secret_key
\`\`\`

### Deploy
\`\`\`bash
# Automatic on git push to main
git push origin main

# Or manual
vercel deploy --prod
\`\`\`

## Browser Extension

### Build
\`\`\`bash
npm run build:extension
# Creates extension/dist folder
\`\`\`

### Chrome Web Store

1. **Register Developer Account**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Pay $5 one-time fee

2. **Create ZIP file**
   \`\`\`bash
   cd extension
   zip -r scathat.zip dist/
   \`\`\`

3. **Upload**
   - Click "New Item"
   - Upload `scathat.zip`
   - Fill in details
   - Submit for review (usually 1-3 days)

4. **Update**
   \`\`\`bash
   npm run build:extension
   zip -r scathat.zip extension/dist/
   # Upload updated ZIP to dashboard
   \`\`\`

### Firefox Add-ons (Optional)

\`\`\`bash
# Similar process at addons.mozilla.org
# Use extension/dist folder
\`\`\`

## Database Setup

### PostgreSQL (if using)
\`\`\`bash
# Create database
createdb scathat_db

# Run migrations
npm run migrate

# Seed data
npm run seed
\`\`\`

## API Deployment

### Option 1: Vercel Functions
Already deployed with web app - use API routes in `web/app/api/`

### Option 2: Standalone Server
\`\`\`bash
# Deploy to Railway, Heroku, DigitalOcean, etc.
# Copy server code and deploy

# Heroku example:
git push heroku main
\`\`\`

## Monitoring & Analytics

### Vercel Analytics
- Dashboard shows performance metrics
- Real-time request logs
- Error tracking

### Website Analytics
Add to `web/app/layout.tsx`:
\`\`\`tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
\`\`\`

## Domain Setup

### Custom Domain (Vercel)
1. Dashboard → Settings → Domains
2. Add domain name
3. Update DNS records
4. SSL certificate auto-generated

### SSL Certificate
- Vercel provides free SSL
- Auto-renewal every 90 days

## Scaling

### High Traffic
- Vercel auto-scales (no action needed)
- Consider Redis cache for API
- Optimize images with `next/image`

### Database Scaling
- Use read replicas for analytics
- Cache frequently accessed contracts
- Archive old scan results

## Backup & Recovery

\`\`\`bash
# Backup database
pg_dump scathat_db > backup.sql

# Restore
psql scathat_db < backup.sql

# Keep backups on S3 or similar
\`\`\`

## Security Checklist

- [ ] Remove console.log statements
- [ ] Set environment variables
- [ ] Enable CORS properly
- [ ] Validate all inputs
- [ ] Use HTTPS only
- [ ] Rotate API keys
- [ ] Keep dependencies updated

## Performance Optimization

### Web App
- Image optimization with next/image
- Code splitting with dynamic imports
- CSS purging (automatic with Tailwind)

### Extension
- Keep popup < 100KB
- Lazy load scripts
- Cache API responses

## Troubleshooting

### Vercel Deployment Failed
\`\`\`bash
# Check logs
vercel logs

# Rebuild
vercel deploy --force
\`\`\`

### Extension Review Rejected
- Review Chrome Web Store policies
- Ensure privacy policy is provided
- No deceptive UI elements
- Resubmit with fixes

## Post-Launch

1. Monitor error rates
2. Gather user feedback
3. Plan feature updates
4. Optimize based on usage
5. Keep dependencies updated

## Rollback

### Vercel
- Dashboard → Deployments
- Click previous version
- Click "Promote to Production"

### Extension
- Update extension manifest version
- Resubmit to Chrome Web Store
