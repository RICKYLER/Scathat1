# Scathat - Smart Contract Security AI

AI-powered smart contract security analysis platform with browser extension, web dashboard, and desktop/mobile support.

## Overview

Scathat helps users protect their crypto investments by scanning smart contracts for vulnerabilities, malicious code, and security risks before interaction.

**Key Features:**
- Real-time AI contract analysis
- Browser extension for one-click scanning
- Detailed vulnerability reports
- Risk scoring and recommendations
- Support for multiple blockchains (Ethereum, Polygon, BSC, Avalanche)
- User-friendly dashboard

## Project Structure

\`\`\`
scathat/
├── web/                    # Next.js web application
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities and helpers
│   ├── hooks/            # Custom React hooks
│   ├── styles/           # Global styles and themes
│   └── public/           # Static assets
├── extension/            # Browser extension
│   ├── src/             # Source code
│   ├── public/          # Manifest and icons
│   └── dist/            # Build output
├── shared/              # Shared utilities (types, constants, utils)
├── scripts/             # Database scripts and utilities
├── docs/                # Documentation
└── package.json         # Root dependencies
\`\`\`

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Web App Setup

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm run start
\`\`\`

Visit `http://localhost:3000` to see the web app.

### Extension Development

\`\`\`bash
# Build extension
npm run build:extension

# Watch for changes
npm run watch:extension

# Load in Chrome:
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select extension/dist folder
\`\`\`

## Architecture

### Web Application (`/web`)

**Pages:**
- `/` - Landing page with features and CTAs
- `/dashboard` - Protected dashboard with scanning interface
- `/auth` - Authentication pages

**Components:**
- `marketing/` - Landing page sections
- `dashboard/` - Dashboard UI components
- `auth/` - Authentication forms
- `ui/` - Shadcn UI components

**Styling:**
- Tailwind CSS v4
- Custom theme tokens in `styles/globals.css`
- Dark mode by default

### Browser Extension (`/extension`)

**Files:**
- `manifest.json` - Extension configuration
- `background/` - Service worker
- `content/` - Content scripts for page injection
- `popup/` - Extension popup UI
- `utils/` - API and helper functions

**Supported Sites:**
- Etherscan.io
- Polygonscan.com
- BSC Scan
- Snowtrace.io

### Shared Code (`/shared`)

Common utilities used by both web and extension:
- Type definitions
- API constants
- Helper functions
- Configuration

## File Organization Guidelines

### Component Naming
- **Files**: kebab-case (`header.tsx`, `how-it-works.tsx`)
- **Components**: PascalCase (`Header`, `HowItWorks`)
- **Functions**: camelCase (`getContractInfo`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CONTRACT_SIZE`)

### Component Structure
\`\`\`
components/
├── feature-name/
│   ├── index.tsx          # Main component export
│   ├── component.tsx      # Sub-components
│   └── types.ts           # Types/interfaces
\`\`\`

### New Feature Checklist
- [ ] Create component file
- [ ] Add TypeScript types
- [ ] Create styles (Tailwind)
- [ ] Export from parent index file
- [ ] Add to appropriate page/layout
- [ ] Test on mobile and desktop
- [ ] Document in README if needed

## Styling Guide

### Colors
- **Primary**: Cyan (`#00bcd4` / `#00d4e8`)
- **Background**: Dark (`#0a0e27`)
- **Accent**: Green/Orange/Red for risk levels
- **Text**: Light gray (`#e0e0e0`)

### Theme System
All colors are defined in `web/styles/globals.css` using CSS variables:
\`\`\`css
--background: oklch(0.145 0 0);
--foreground: oklch(0.985 0 0);
--cyan-400: #00bcd4;
--cyan-600: #0097a7;
\`\`\`

### Responsive Breakpoints
- `md:` - 768px and up
- `lg:` - 1024px and up
- Mobile-first approach

## API Integration

### Contract Scanning
\`\`\`typescript
POST /api/scan
{
  "address": "0x...",
  "chainId": 1
}
\`\`\`

Response:
\`\`\`json
{
  "address": "0x...",
  "riskLevel": "safe|warning|dangerous",
  "score": 85,
  "vulnerabilities": [
    { "type": "reentrancy", "severity": "high" }
  ]
}
\`\`\`

## Environment Variables

### Web App
\`\`\`env
NEXT_PUBLIC_API_URL=https://api.scathat.io
NEXT_PUBLIC_APP_URL=https://scathat.io
API_SECRET=your_secret_key
\`\`\`

### Extension
\`\`\`env
VITE_API_URL=https://api.scathat.io
\`\`\`

## Development Workflow

### Adding a Landing Page Section
1. Create component in `web/components/marketing/section-name.tsx`
2. Import in `web/app/page.tsx`
3. Add to page JSX
4. Style with Tailwind classes

### Adding Dashboard Feature
1. Create component in `web/components/dashboard/feature-name.tsx`
2. Import in dashboard page
3. Add data fetching with SWR if needed
4. Style and test responsiveness

### Updating Extension
1. Edit files in `extension/src/`
2. Run `npm run build:extension`
3. Reload extension in Chrome (`chrome://extensions/`)

## Testing

\`\`\`bash
# Run tests
npm run test

# Test extension
npm run test:extension

# Build and test
npm run build
npm run preview
\`\`\`

## Deployment

### Web App (Vercel)
\`\`\`bash
vercel deploy
\`\`\`

### Extension (Chrome Web Store)
1. Build: `npm run build:extension`
2. Create `.zip` of `extension/dist`
3. Upload to [Chrome Web Store Dashboard](https://chrome.google.com/webstore/devconsole)

## Performance Optimization

- Images use next/image for optimization
- Lazy loading for dashboard components
- Code splitting with dynamic imports
- Extension popup < 100KB

## Browser Support

- Chrome 90+
- Firefox 88+
- Edge 90+

## Troubleshooting

### Extension not appearing
- Check `extension/public/manifest.json` is valid
- Verify icons exist in `extension/public/icons/`
- Check browser console for errors

### Styles not applying
- Ensure Tailwind CSS is properly configured
- Check that `globals.css` is imported in `layout.tsx`
- Clear `.next` folder and rebuild

### API calls failing
- Verify environment variables are set
- Check API endpoint is accessible
- Look at Network tab in DevTools

## Contributing

1. Create a feature branch
2. Make changes following conventions
3. Test on mobile and desktop
4. Submit PR with description

## Security

- Never commit `.env` files
- Sanitize contract addresses
- Validate all user inputs
- Use HTTPS for API calls

## License

MIT

## Support

- Documentation: https://docs.scathat.io
- Discord: https://discord.gg/scathat
- Email: support@scathat.io
