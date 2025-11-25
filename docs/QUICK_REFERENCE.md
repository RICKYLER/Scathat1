# Scathat Quick Reference

## File Locations

| What | Where |
|------|-------|
| Landing page | `web/app/page.tsx` |
| Landing sections | `web/components/marketing/` |
| Dashboard | `web/app/dashboard/page.tsx` |
| Dashboard components | `web/components/dashboard/` |
| Auth pages | `web/app/auth/page.tsx` |
| Extension popup | `extension/src/popup/index.tsx` |
| Extension background | `extension/src/background/index.ts` |
| Global styles | `web/styles/globals.css` |
| API routes | `web/app/api/` |

## Common Commands

\`\`\`bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Check code style

# Extension
npm run build:extension # Build Chrome extension
npm run watch:extension # Watch for changes

# Database
npm run migrate         # Run migrations
npm run seed           # Seed sample data
\`\`\`

## Component Template

\`\`\`tsx
'use client'

import { Button } from '@/components/ui/button'

interface MyComponentProps {
  title: string
}

export function MyComponent({ title }: MyComponentProps) {
  return (
    <div className="bg-background border border-border/40 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-cyan-400">{title}</h2>
      <Button>Click me</Button>
    </div>
  )
}
\`\`\`

## CSS Classes

\`\`\`tsx
// Layout
flex items-center justify-between
grid grid-cols-3 gap-4
flex-col md:flex-row

// Spacing
p-4              // padding all sides
px-4 py-2        // padding X and Y
gap-4            // gap between children
mb-4             // margin bottom

// Colors
bg-background    // background
text-foreground  // foreground text
text-cyan-400    // accent text
border-border/40 // border

// Effects
rounded-lg       // border radius
shadow-md        // box shadow
hover:opacity-80 // hover effect
transition-all   // smooth transition
\`\`\`

## Environment Variables

Web app needs:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
\`\`\`

Extension needs:
\`\`\`env
VITE_API_URL=http://localhost:3000/api
\`\`\`

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/scan` - Scan contract
- `GET /api/contract/:address` - Get details
- `GET /api/user/scans` - User's scans

## Git Workflow

\`\`\`bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes, test, commit
git add .
git commit -m "Add my feature"

# Push and create PR
git push origin feature/my-feature
\`\`\`

## Debugging Tips

- Use `console.log()` in components
- Open DevTools (F12) in browser
- Check Network tab for API calls
- Use React DevTools browser extension
- For extension: `chrome://extensions/` → click "Service worker"

## Useful Links

- Web: http://localhost:3000
- Extension: chrome://extensions/
- Vercel: https://vercel.com/dashboard
- Chrome Web Store: https://chrome.google.com/webstore
