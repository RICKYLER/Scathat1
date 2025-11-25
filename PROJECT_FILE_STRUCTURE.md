# Scathat v3 - Complete File Structure

## Project Organization

\`\`\`
scathat/
│
├── web/                          # Main Next.js web application
│   ├── app/
│   │   ├── page.tsx             # Landing page with hero scanner
│   │   ├── layout.tsx           # Root layout with metadata
│   │   ├── globals.css          # Global styles and theme tokens
│   │   ├── pricing/
│   │   │   └── page.tsx         # Pricing page with plans
│   │   ├── dashboard/
│   │   │   └── page.tsx         # User dashboard (protected)
│   │   ├── mobile/
│   │   │   ├── page.tsx         # Mobile-optimized home
│   │   │   ├── layout.tsx       # Mobile layout with bottom nav
│   │   │   └── scanner/
│   │   │       └── page.tsx     # Mobile scanner page
│   │   ├── admin/
│   │   │   └── page.tsx         # Admin dashboard
│   │   └── auth/
│   │       └── page.tsx         # Login/signup
│   │
│   ├── components/
│   │   ├── marketing/           # Landing page components
│   │   │   ├── header.tsx
│   │   │   ├── hero-scanner.tsx
│   │   │   ├── stats-dashboard.tsx
│   │   │   ├── supported-networks.tsx
│   │   │   ├── features.tsx
│   │   │   ├── security-section.tsx
│   │   │   ├── footer.tsx
│   │   │   └── cta.tsx
│   │   │
│   │   ├── pricing/             # Pricing page components
│   │   │   ├── pricing-plans.tsx
│   │   │   ├── pricing-comparison.tsx
│   │   │   └── pricing-faq.tsx
│   │   │
│   │   ├── dashboard/           # Dashboard components
│   │   │   ├── scanner-panel.tsx
│   │   │   ├── results-display.tsx
│   │   │   ├── stats-overview.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── admin/               # Admin dashboard
│   │   │   ├── admin-header.tsx
│   │   │   ├── metrics-grid.tsx
│   │   │   ├── recent-scans.tsx
│   │   │   └── user-activity.tsx
│   │   │
│   │   ├── auth/                # Authentication components
│   │   │   ├── auth-form.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   └── ui/                  # Shared UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── modal.tsx
│   │
│   ├── config/
│   │   └── contracts.ts         # Smart contract addresses
│   │
│   ├── hooks/
│   │   ├── use-risk-registry.ts # Contract interaction hook
│   │   └── use-mobile.ts        # Mobile detection
│   │
│   ├── utils/
│   │   ├── contract-integration/
│   │   │   └── risk-registry-client.ts
│   │   └── types/
│   │       └── contract-types.ts
│   │
│   └── styles/
│       └── globals.css
│
├── extension/                    # Chrome browser extension
│   ├── public/
│   │   ├── manifest.json        # Extension configuration
│   │   ├── icons/               # Extension icons (128x128, 256x256)
│   │   └── logo.png
│   │
│   ├── src/
│   │   ├── popup/
│   │   │   ├── popup.tsx        # Popup UI component
│   │   │   ├── popup.css        # Popup styles
│   │   │   └── index.tsx        # Entry point
│   │   │
│   │   ├── background/
│   │   │   └── index.ts         # Service worker
│   │   │
│   │   ├── content/
│   │   │   └── index.ts         # Content script
│   │   │
│   │   ├── utils/
│   │   │   ├── api.ts           # API helpers
│   │   │   └── storage.ts       # Chrome storage utilities
│   │   │
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript types
│   │   │
│   │   └── styles/
│   │       └── popup.css
│   │
│   ├── build/                   # Compiled extension
│   ├── package.json
│   └── README.md
│
├── backend/                     # Backend API (Python/FastAPI)
│   ├── src/
│   │   ├── main.py              # FastAPI app setup
│   │   ├── routers/
│   │   │   ├── contracts.py     # Contract endpoints
│   │   │   └── scans.py         # Scan endpoints
│   │   ├── models/
│   │   │   ├── contract.py
│   │   │   └── scan.py
│   │   ├── services/
│   │   │   ├── scanner.py       # AI scanning service
│   │   │   └── blockchain.py    # Web3 integration
│   │   └── utils/
│   │       └── config.py        # Configuration
│   │
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 001_init_schema.sql
│   │   └── models.py            # SQLAlchemy models
│   │
│   ├── tests/
│   │   └── test_scanner.py
│   │
│   ├── requirements.txt
│   └── README.md
│
├── contracts/                   # Smart contracts (Solidity)
│   ├── src/
│   │   ├── RiskRegistry.sol     # Main contract
│   │   └── interfaces/
│   │       └── IRiskRegistry.sol
│   │
│   ├── test/
│   │   └── RiskRegistry.test.ts
│   │
│   ├── scripts/
│   │   ├── deploy.ts
│   │   └── setup.ts
│   │
│   └── README.md
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md
│   ├── SETUP.md
│   ├── API_GUIDE.md
│   └── EXTENSION_GUIDE.md
│
├── README.md
├── package.json
└── .env.example
\`\`\`

## Key Directories Explained

### `/web` - Main Application
- **`/app`**: Next.js App Router pages and layouts
- **`/components/marketing`**: Landing page sections
- **`/components/pricing`**: Pricing page components
- **`/components/dashboard`**: User dashboard UI
- **`/components/admin`**: Admin panel components
- **`/hooks`**: React hooks for common functionality
- **`/utils`**: Helper functions and API clients

### `/extension` - Chrome Extension
- **`/popup`**: Extension popup interface (what users see when clicking icon)
- **`/background`**: Service worker for handling messages and background tasks
- **`/content`**: Content scripts that run on web pages
- **`/utils`**: Helper functions specific to extension

### `/backend` - API Server
- **`/routers`**: API endpoint definitions
- **`/services`**: Business logic (scanning, blockchain interaction)
- **`/models`**: Database models
- **`/database`**: SQL migrations and schemas

### `/contracts` - Blockchain
- Smart contract source code in Solidity
- Test files for contract testing
- Deployment scripts

## File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `hero-scanner.tsx`)
- **Pages**: `page.tsx` (Next.js convention)
- **Utilities**: `kebab-case.ts` (e.g., `risk-registry-client.ts`)
- **Types**: `kebab-case.ts` with export (e.g., `contract-types.ts`)
- **Styles**: `kebab-case.css` (e.g., `popup.css`)

## Development Workflow

1. **UI Development**: Create components in `/web/components`
2. **Page Setup**: Add routes in `/web/app`
3. **Extension Development**: Update `/extension/src/popup`
4. **Mobile**: Use responsive components or `/web/app/mobile`
5. **Backend**: Add endpoints in `/backend/src/routers`

## Building for Production

\`\`\`bash
# Web application
npm run build

# Chrome extension
npm run build:extension

# Backend
pip install -r requirements.txt
