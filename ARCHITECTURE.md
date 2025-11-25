# Scathat Project Architecture

## Overview
Scathat is a multi-platform smart contract security analysis tool with:
- Web application (Next.js)
- Browser extension (Chrome/Firefox)
- Shared utilities and types

## Directory Structure

### `/web` - Main Web Application
Next.js application hosted on the web with landing page, dashboard, and authentication.

\`\`\`
web/
├── app/                           # Next.js App Router
│   ├── (marketing)/              # Landing page routes
│   │   ├── page.tsx             # Home page
│   │   └── layout.tsx
│   ├── dashboard/                # Protected dashboard
│   │   ├── page.tsx
│   │   └── components/
│   ├── auth/                     # Authentication
│   │   ├── page.tsx
│   │   └── components/
│   ├── api/                      # Backend API routes
│   ├── layout.tsx                # Root layout
│   └── globals.css
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── marketing/                # Landing page components
│   ├── dashboard/                # Dashboard components
│   ├── auth/                     # Auth components
│   └── common/                   # Shared components
├── lib/                          # Utilities
├── hooks/                        # Custom hooks
├── styles/                       # Global styles
└── public/                       # Static assets
\`\`\`

### `/extension` - Browser Extension
Chrome/Firefox extension for one-click contract scanning.

\`\`\`
extension/
├── src/
│   ├── background/              # Service worker
│   ├── content/                 # Content scripts
│   ├── popup/                   # Popup UI
│   ├── components/              # Popup components
│   ├── utils/                   # Helpers
│   ├── types/                   # Types
│   └── assets/
├── public/
│   ├── manifest.json
│   └── icons/
└── dist/                        # Build output
\`\`\`

### `/shared` - Shared Code
Common utilities, types, and constants used by web and extension.

\`\`\`
shared/
├── types/                       # TypeScript interfaces
├── utils/                       # Helper functions
├── constants/                   # App constants
└── api/                         # API utilities
\`\`\`

## Naming Conventions

- **Components**: PascalCase (`Header.tsx`, `HowItWorks.tsx`)
- **Files**: kebab-case (`header.tsx`, `how-it-works.tsx`)
- **Functions**: camelCase (`getContractInfo()`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CONTRACT_SIZE`)

## Key Files

- `web/app/page.tsx` - Home page imports marketing components
- `web/app/dashboard/page.tsx` - Protected dashboard
- `web/components/marketing/*` - All landing page sections
- `web/styles/globals.css` - Global theme and styles
- `extension/src/manifest.json` - Extension configuration
- `extension/src/background/index.ts` - Background service worker
- `extension/src/popup/index.tsx` - Popup UI component

## Development Workflow

1. **Landing Page**: Edit files in `web/components/marketing/`
2. **Dashboard**: Edit files in `web/components/dashboard/`
3. **Extension**: Edit files in `extension/src/`
4. **Shared Logic**: Add to `shared/` and import in both web and extension
5. **Styles**: Update `web/styles/globals.css` for theme changes

## Adding New Features

### Landing Page Section
1. Create component in `web/components/marketing/section-name.tsx`
2. Import in `web/app/page.tsx`
3. Add to page JSX

### Dashboard Feature
1. Create component in `web/components/dashboard/feature-name.tsx`
2. Import in dashboard page or layout
3. Add styling and interactions

### Extension Feature
1. Create in `extension/src/` under appropriate folder
2. Update `extension/src/manifest.json` if needed
3. Export from popup component

## Deployment

### Web
\`\`\`bash
npm run build
vercel deploy
\`\`\`

### Extension
1. Build: `npm run build:extension`
2. Upload `extension/dist` to Chrome Web Store

### Shared Code
Update version and publish as npm package or import directly.

## Future Expansions

- **Mobile App**: React Native using shared types and utils
- **Desktop App**: Electron using web components
- **API**: GraphQL or REST for data management
- **Database**: PostgreSQL integration for user data
