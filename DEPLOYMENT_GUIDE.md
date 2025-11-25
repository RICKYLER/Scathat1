# Scathat v3 - Deployment Guide

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Smart contracts deployed
- [ ] Extension built and tested
- [ ] API health checks passing
- [ ] Frontend builds successfully

## Web Application Deployment (Vercel)

### 1. Connect Repository
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
\`\`\`

### 2. Configure Environment
In Vercel dashboard:
\`\`\`
NEXT_PUBLIC_API_URL = https://api.scathat.io
DATABASE_URL = [your-postgres-url]
STRIPE_SECRET_KEY = [your-stripe-key]
\`\`\`

## Backend Deployment (Docker/Cloud Run)

### 1. Create Dockerfile
\`\`\`dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0"]
\`\`\`

### 2. Deploy to Google Cloud Run
\`\`\`bash
gcloud builds submit --tag gcr.io/PROJECT_ID/scathat-api
gcloud run deploy scathat-api --image gcr.io/PROJECT_ID/scathat-api
\`\`\`

## Extension Deployment (Chrome Web Store)

### 1. Build Extension
\`\`\`bash
cd extension
npm run build
\`\`\`

### 2. Create Zip
\`\`\`bash
zip -r scathat-extension.zip build/
\`\`\`

### 3. Upload to Chrome Web Store
- Go to https://chrome.google.com/webstore/devconsole
- Click "New item"
- Upload zip file
- Fill in store listing details
- Submit for review (48-72 hours)

## Smart Contract Deployment

### 1. Testnet Deployment
\`\`\`bash
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
\`\`\`

### 2. Mainnet Deployment
\`\`\`bash
npx hardhat run scripts/deploy.ts --network mainnet
\`\`\`

### 3. Verify Contract
\`\`\`bash
npx hardhat verify --network mainnet [CONTRACT_ADDRESS] [CONSTRUCTOR_ARGS]
\`\`\`

## Database Setup

### 1. Create PostgreSQL Database
\`\`\`sql
CREATE DATABASE scathat;
CREATE USER scathat_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE scathat TO scathat_user;
\`\`\`

### 2. Run Migrations
\`\`\`bash
cd backend
python -m alembic upgrade head
\`\`\`

## Monitoring

### Health Checks
\`\`\`bash
# Web app
curl https://scathat.io/api/health

# Backend
curl https://api.scathat.io/health

# Database
psql -U scathat_user -d scathat -c "SELECT 1"
\`\`\`

### Error Tracking
Configure in production:
- Sentry for error logging
- DataDog for monitoring
- CloudWatch for logs
