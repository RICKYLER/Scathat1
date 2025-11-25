# Scathat Getting Started Guide

## Quick Start (5 minutes)

### 1. Install & Run Web App
\`\`\`bash
npm install
npm run dev
\`\`\`
Open http://localhost:3000

### 2. Setup Extension
\`\`\`bash
npm run build:extension
# Open chrome://extensions/
# Enable "Developer mode"
# Click "Load unpacked"
# Select extension/dist folder
\`\`\`

## Project Structure at a Glance

\`\`\`
web/                          # Main website
├── app/page.tsx             # Landing page
├── app/dashboard/page.tsx   # Dashboard
└── components/
    ├── marketing/           # Landing sections
    └── dashboard/           # Dashboard UI

extension/                    # Browser extension
├── src/popup/index.tsx      # Extension popup
├── src/background/index.ts  # Service worker
└── public/manifest.json     # Configuration
\`\`\`

## Development Tips

### Edit Landing Page
All landing page sections are in `web/components/marketing/`:
- `header.tsx` - Top navigation
- `hero.tsx` - Main headline
- `problem.tsx` - Problem statement
- `solution.tsx` - Solution overview
- `how-it-works.tsx` - 6-step process
- `testimonials.tsx` - User reviews
- `download.tsx` - Download section
- `cta.tsx` - Call-to-action
- `footer.tsx` - Footer

Just edit the component, save, and see changes instantly!

### Edit Dashboard
Dashboard components are in `web/components/dashboard/`:
- `layout.tsx` - Sidebar layout
- `scanner-panel.tsx` - Contract input
- `results-display.tsx` - Results view
- `stats-overview.tsx` - Stats cards

### Edit Extension Popup
Extension popup is in `extension/src/popup/index.tsx`
- Styling in `extension/src/styles/popup.css`
- After editing, run `npm run build:extension`

## Adding a New Page

### Add to Web App
\`\`\`tsx
// 1. Create web/app/newpage/page.tsx
export default function NewPage() {
  return <div>New Page</div>
}

// 2. Access at /newpage
\`\`\`

### Add to Extension
\`\`\`tsx
// Extension pages go in extension/src/
// Update extension/public/manifest.json
\`\`\`

## Styling (Tailwind)

All styling uses Tailwind CSS classes:
\`\`\`tsx
<div className="bg-background text-foreground p-4 rounded-lg">
  <h1 className="text-2xl font-bold text-cyan-400">Title</h1>
</div>
\`\`\`

Color tokens:
- `bg-background` - Main background
- `text-foreground` - Main text
- `text-cyan-400` - Primary color
- `border-border/40` - Borders

## Common Tasks

### Change Hero Headline
Edit `web/components/marketing/hero.tsx` line ~20

### Add New Feature Section
1. Create `web/components/marketing/new-section.tsx`
2. Import in `web/app/page.tsx`
3. Add to JSX

### Update Theme Colors
Edit `web/styles/globals.css` CSS variables

### Add Dashboard Widget
1. Create component in `web/components/dashboard/`
2. Import in `web/app/dashboard/page.tsx`
3. Add to grid layout

## Environment Setup

Create `.env.local` in project root:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
\`\`\`

## Debugging

### Web App
Open browser DevTools (F12):
- Console tab for errors
- Network tab for API calls
- React DevTools for component props

### Extension
1. Open `chrome://extensions/`
2. Click "Service worker" to debug background script
3. Right-click extension icon → "Inspect popup" for popup UI

## Next Steps

1. ✅ Run the app (`npm run dev`)
2. ✅ Explore landing page
3. ✅ Check dashboard
4. ✅ Edit a component and see changes
5. ✅ Build extension (`npm run build:extension`)
6. ✅ Load extension in Chrome

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com)
- [Next.js Docs](https://nextjs.org)
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [React Docs](https://react.dev)

## Questions?

- Check README.md for full documentation
- Look at existing components for examples
- Check ARCHITECTURE.md for file organization
