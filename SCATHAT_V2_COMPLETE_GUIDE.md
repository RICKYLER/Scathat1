# Scathat V2 - Complete Implementation Guide

## Project Overview

Scathat V2 is a comprehensive smart contract security platform inspired by GoPlusLabs, featuring:
- Modern, responsive web interface with contract scanner
- Powerful backend API with AI-powered analysis
- Robust database with Redis caching
- Admin dashboard for platform monitoring
- Browser extension for seamless integration

## Architecture

### Frontend (Next.js + React)
- **Location**: `/web`
- **Tech Stack**: Next.js 16, TypeScript, Tailwind CSS, React 19
- **Key Pages**:
  - `/` - Landing page with hero scanner
  - `/admin` - Admin dashboard
  - `/auth` - Authentication flows

### Backend (FastAPI + Python)
- **Location**: `/backend`
- **Tech Stack**: FastAPI, SQLAlchemy, PostgreSQL, Redis
- **Key Services**:
  - Contract scanning and analysis
  - User management
  - Scan history and watchlist
  - Admin metrics and monitoring

### Database
- **Primary**: PostgreSQL for persistent data
- **Cache**: Redis for recent scan results
- **Schema**: Users, Scans, Watchlist, Audit Logs

### Smart Contracts
- **Location**: `/contracts`
- **Purpose**: On-chain risk assessment registry
- **Networks**: Ethereum, Polygon, Base, Arbitrum

## File Structure

\`\`\`
scathat-v2/
├── web/                          # Next.js frontend
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── admin/               # Admin dashboard
│   │   └── auth/                # Authentication
│   ├── components/
│   │   ├── marketing/           # Landing page sections
│   │   ├── admin/               # Admin components
│   │   └── ui/                  # Shadcn components
│   ├── hooks/                   # Custom React hooks
│   └── config/                  # Configuration files
│
├── backend/                      # FastAPI backend
│   ├── src/
│   │   ├── main.py              # App entry point
│   │   ├── routers/             # API endpoints
│   │   ├── services/            # Business logic
│   │   └── utils/               # Helper functions
│   ├── database/
│   │   ├── models.py            # SQLAlchemy models
│   │   └── migrations/          # Database schemas
│   ├── tests/                   # Test suites
│   └── requirements.txt         # Dependencies
│
├── contracts/                    # Solidity smart contracts
│   ├── RiskRegistry.sol         # Main registry contract
│   ├── interfaces/              # Contract interfaces
│   ├── test/                    # Contract tests
│   └── scripts/                 # Deployment scripts
│
└── docs/                        # Documentation
    ├── API_DOCUMENTATION.md
    ├── DEPLOYMENT_GUIDE.md
    └── INTEGRATION_GUIDE.md
\`\`\`

## Quick Start

### Frontend Setup
\`\`\`bash
cd web
npm install
npm run dev
# Visit http://localhost:3000
\`\`\`

### Backend Setup
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn src.main:app --reload
# Visit http://localhost:8000/docs
\`\`\`

### Database Setup
\`\`\`bash
# Create PostgreSQL database
createdb scathat

# Run migrations
python backend/scripts/migrate.py

# Seed test data (optional)
python backend/scripts/seed_data.py
\`\`\`

## Key Features

### 1. Contract Scanner
- Input contract address from 50+ networks
- Real-time risk assessment (SAFE/WARNING/DANGEROUS)
- Detailed vulnerability analysis
- Historical scanning data

### 2. User Dashboard
- Scan history and results
- Watchlist for monitored contracts
- Profile and settings

### 3. Admin Panel
- Real-time metrics and KPIs
- Recent scans monitoring
- User activity tracking
- System health status

### 4. API Integration
- RESTful API for third-party integrations
- Webhook support for real-time alerts
- WebSocket for live updates

## Environment Variables

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CHAIN_ID=1
\`\`\`

### Backend (.env)
\`\`\`env
DATABASE_URL=postgresql://user:password@localhost/scathat
REDIS_URL=redis://localhost:6379
ETHERSCAN_API_KEY=your_key
VENICE_AI_API_KEY=your_key
WEB3_PROVIDER_URL=https://eth.rpc.endpoint
JWT_SECRET=your_secret
\`\`\`

## Deployment

### Frontend (Vercel)
\`\`\`bash
# Push to GitHub
git push origin main

# Deploy to Vercel
vercel deploy
\`\`\`

### Backend (Cloud Run / AWS)
\`\`\`bash
# Build Docker image
docker build -t scathat-backend .

# Deploy
# See DEPLOYMENT_GUIDE.md for detailed instructions
\`\`\`

## API Endpoints

### Contracts
- `POST /api/contracts/scan` - Scan contract
- `GET /api/contracts/{address}` - Get contract details

### Scans
- `GET /api/scans` - List user scans
- `GET /api/scans/{scan_id}` - Get scan details
- `DELETE /api/scans/{scan_id}` - Delete scan

### Admin
- `GET /api/admin/metrics` - Platform metrics
- `GET /api/admin/scans` - All scans
- `GET /api/admin/users` - User list

## Testing

### Frontend Tests
\`\`\`bash
cd web
npm run test
\`\`\`

### Backend Tests
\`\`\`bash
cd backend
pytest
\`\`\`

### Contract Tests
\`\`\`bash
cd contracts
npx hardhat test
\`\`\`

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

## Monitoring & Maintenance

### Performance Monitoring
- Datadog/New Relic for APM
- Sentry for error tracking
- Custom dashboards for key metrics

### Database Maintenance
- Daily backup scheduled
- Query optimization on slow endpoints
- Index maintenance on high-traffic tables

### Security
- Rate limiting on all endpoints
- Input validation on all inputs
- CORS configuration for production
- SQL injection prevention with prepared statements

## Troubleshooting

### Common Issues

**Database Connection Error**
\`\`\`
Error: connect ECONNREFUSED 127.0.0.1:5432
Solution: Ensure PostgreSQL is running
\`\`\`

**Redis Connection Error**
\`\`\`
Error: ECONNREFUSED 127.0.0.1:6379
Solution: Ensure Redis is running
\`\`\`

**API Response Timeout**
\`\`\`
Solution: Check backend logs, verify Venice.ai API key
\`\`\`

## Support & Resources

- Documentation: `docs/`
- API Reference: `http://localhost:8000/docs`
- GitHub Issues: Report bugs and features
- Community Discord: Join for support

## Roadmap

- v2.1: Multi-signature wallet support
- v2.2: Advanced threat intelligence
- v2.3: Custom risk scoring rules
- v2.4: DeFi protocol integration

## License

MIT License - See LICENSE file for details
