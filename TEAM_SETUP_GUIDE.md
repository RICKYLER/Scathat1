# Scathat v3 - Complete Team Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- Python 3.9+
- Git
- Chrome/Chromium for extension testing

### 1. Clone & Install

\`\`\`bash
# Clone repository
git clone https://github.com/yourteam/scathat.git
cd scathat

# Install web dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
\`\`\`

### 2. Setup Environment

\`\`\`bash
# Copy environment template
cp .env.example .env.local

# Update with your values:
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgresql://user:pass@localhost:5432/scathat
STRIPE_SECRET_KEY=sk_test_...
\`\`\`

### 3. Run Development

\`\`\`bash
# Terminal 1 - Web app (http://localhost:3000)
npm run dev

# Terminal 2 - Backend API (http://localhost:3001)
cd backend && python -m uvicorn src.main:app --reload

# Terminal 3 - Watch extension build
cd extension && npm run watch
\`\`\`

## Project Structure for Your Team

### Folders to Know

| Folder | Purpose | Who Works Here |
|--------|---------|----------------|
| `web/components/marketing` | Landing pages | Frontend team |
| `web/components/pricing` | Pricing section | Frontend team |
| `web/components/dashboard` | User dashboard | Frontend team |
| `extension/src/popup` | Extension UI | Extension dev |
| `backend/src/routers` | API endpoints | Backend team |
| `contracts/src` | Smart contracts | Blockchain dev |

### Making Changes

1. **Landing Page**: Edit files in `web/components/marketing`
2. **Pricing**: Modify `web/components/pricing`
3. **Extension**: Update `extension/src/popup`
4. **API**: Add endpoints in `backend/src/routers`

## Common Tasks

### Add a New Page to Website

\`\`\`bash
# Create page file
touch web/app/yourpage/page.tsx

# Add route and components
# Import in layout if needed
\`\`\`

### Update Extension UI

\`\`\`bash
# Edit extension popup
vim extension/src/popup/popup.tsx
vim extension/src/popup/popup.css

# Test in Chrome:
# 1. Go to chrome://extensions
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select extension folder
\`\`\`

### Add Backend Endpoint

\`\`\`bash
# Create new router file
touch backend/src/routers/newfeature.py

# Add route and include in main.py
\`\`\`

## Testing

\`\`\`bash
# Run web tests
npm run test

# Run backend tests
cd backend && pytest

# Run contract tests
cd contracts && npm run test
\`\`\`

## Deployment

### Web Application
\`\`\`bash
npm run build
# Deploy to Vercel or your hosting
\`\`\`

### Backend
\`\`\`bash
cd backend
pip install -r requirements.txt
python -m uvicorn src.main:app --host 0.0.0.0
\`\`\`

### Extension
\`\`\`bash
cd extension
npm run build
# Zip the build folder and upload to Chrome Web Store
\`\`\`

## Troubleshooting

### Issue: Cannot connect to backend
**Solution**: Check `NEXT_PUBLIC_API_URL` in `.env.local` matches backend port

### Issue: Extension not loading
**Solution**: Go to `chrome://extensions`, enable Developer mode, click "Load unpacked"

### Issue: Database connection error
**Solution**: Verify `DATABASE_URL` is correct and PostgreSQL is running

### Issue: Module not found
**Solution**: Run `npm install` or `pip install -r requirements.txt`

## Getting Help

- **Frontend questions**: Check `web/` component files for examples
- **Extension questions**: See `extension/README.md`
- **Backend questions**: See `backend/API_DOCUMENTATION.md`
- **Contracts**: See `contracts/README.md`

## Important Links

- Design System: See `web/app/globals.css`
- API Docs: `backend/API_DOCUMENTATION.md`
- Extension Guide: `extension/README.md`
- Smart Contracts: `contracts/README.md`
