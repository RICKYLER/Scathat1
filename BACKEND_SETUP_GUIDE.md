# Backend Setup Guide

## Prerequisites

- Python 3.10+
- PostgreSQL 14+
- Redis 7+
- Node.js 18+ (for Web3 interactions)

## Installation

1. **Clone repository and navigate to backend**:
\`\`\`bash
cd backend
\`\`\`

2. **Create virtual environment**:
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
\`\`\`

3. **Install dependencies**:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

4. **Setup environment variables**:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

5. **Run database migrations**:
\`\`\`bash
python -m alembic upgrade head
\`\`\`

6. **Start the server**:
\`\`\`bash
uvicorn src.main:app --reload --port 8000
\`\`\`

## Database Setup

1. **Create PostgreSQL database**:
\`\`\`bash
createdb scathat
\`\`\`

2. **Run migrations**:
\`\`\`bash
python scripts/migrate.py
\`\`\`

3. **Seed test data** (optional):
\`\`\`bash
python scripts/seed_data.py
\`\`\`

## API Testing

Visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

## Deployment

See DEPLOYMENT.md for production deployment instructions.
