# Scathat Data Base

Dual Database System for Scathat - PostgreSQL for structured data + Pinecone for vector embeddings

## Overview

This module provides a simple, non-complex dual database implementation:

### PostgreSQL - Structured Data Storage
- Contract metadata and details
- Analysis history and results  
- Risk score records over time
- Anonymized user activity logs
- On-chain registry indexing

### Pinecone - Vector Database (AI/ML Embeddings)
- Contract embeddings for similarity search
- Bytecode pattern vectors
- Exploit vector storage and matching
- High-dimensional similarity search

## Overview

This module provides a simple, non-complex PostgreSQL database implementation for storing:
- Contract metadata and details
- Analysis history and results
- Risk score records over time
- Anonymized user activity logs
- On-chain registry indexing

## Database Schema

### Tables

1. **contract_metadata** - Contract details and creation information
2. **analysis_history** - Analysis results with timestamps
3. **risk_score_records** - Risk score tracking over time
4. **user_logs** - Anonymized user activity (IP/user agent hashed)
5. **onchain_registry** - On-chain event indexing

## Setup

### 1. Install PostgreSQL and Configure Vector DB

#### PostgreSQL Installation
```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql postgresql-contrib

# Windows: Download from https://www.postgresql.org/download/
```

#### Pinecone Vector Database Setup
1. Create a free account at [Pinecone.io](https://www.pinecone.io/)
2. Get your API key from the Pinecone console
3. Create an index with 384 dimensions (cosine metric)

### 2. Configure Environment

Update your `.env` file with both PostgreSQL and Pinecone settings:

```bash
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scathat_db
DB_USER=scathat_user
DB_PASSWORD=scathat_pass

# Optional: Connection pool settings
DB_POOL_MIN=1
DB_POOL_MAX=10
DB_POOL_TIMEOUT=30

# Pinecone Vector Database Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=us-east1-gcp
PINECONE_INDEX_NAME=scathat-vectors
```

```bash
# macOS
brew install postgresql

# Ubuntu
sudo apt-get install postgresql postgresql-contrib

# Windows: Download from https://www.postgresql.org/download/
```

### 2. Create Database and User

```bash
# Run as postgres user
sudo -u postgres psql -c "CREATE DATABASE scathat_db;"
sudo -u postgres psql -c "CREATE USER scathat_user WITH PASSWORD 'scathat_pass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE scathat_db TO scathat_user;"
sudo -u postgres psql -c "ALTER USER scathat_user CREATEDB;"
```

### 3. Configure Environment

```bash
cd scathat-data-base
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Create Tables

```bash
python3 database.py
```

## Usage

### Vector Database Operations (Pinecone)

The vector database stores high-dimensional embeddings for:
- **Contract Embeddings**: AI model outputs for similarity search
- **Bytecode Patterns**: Known malicious/safe code patterns  
- **Exploit Vectors**: Historical attack signatures for matching

#### Basic Vector Operations

```python
from vector_db import VectorDatabase
import numpy as np

# Initialize vector database
db = VectorDatabase()

# Store contract embedding
contract_embedding = list(np.random.rand(384))  # From your ML model
db.store_contract_embedding(
    contract_address="0x1234...",
    embedding=contract_embedding,
    metadata={"risk_score": 0.8, "compiler": "0.8.19"}
)

# Store bytecode pattern  
bytecode_pattern = list(np.random.rand(384))
db.store_bytecode_pattern(
    pattern_id="reentrancy_guard_v1",
    embedding=bytecode_pattern, 
    pattern_type="reentrancy_protection",
    metadata={"confidence": 0.92, "description": "Standard reentrancy guard"}
)

# Store exploit vector
exploit_vector = list(np.random.rand(384))
db.store_exploit_vector(
    exploit_id="flashloan_attack_2024_001",
    embedding=exploit_vector,
    exploit_type="flashloan_attack", 
    risk_score=0.95,
    metadata={"loss_amount": "$2.1M", "target": "Uniswap V3"}
)

# Search for similar contracts
query_embedding = list(np.random.rand(384))
results = db.search_similar_contracts(query_embedding, top_k=5)

for result in results:
    print(f"Contract: {result['metadata']['contract_address']}")
    print(f"Similarity: {result['score']:.3f}")
```

### Basic Operations (PostgreSQL)

```python
from data_access import ContractMetadataDAO, AnalysisHistoryDAO

# Save contract metadata
contract_data = {
    'contract_address': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    'contract_name': 'USDT',
    'compiler_version': 'v0.4.26',
    # ... other fields
}
contract_id = ContractMetadataDAO.save_contract_metadata(contract_data)

# Save analysis result
analysis_data = {
    'contract_address': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    'analysis_type': 'full_scan',
    'risk_score': 0.15,
    # ... other fields
}
analysis_id = AnalysisHistoryDAO.save_analysis_result(analysis_data)
```

### Data Access Objects

- `ContractMetadataDAO`: Contract details and metadata
- `AnalysisHistoryDAO`: Analysis results and history
- `RiskScoreDAO`: Risk score tracking
- `UserLogsDAO`: Anonymized user activity logging
- `OnchainRegistryDAO`: On-chain event indexing

## Testing

### PostgreSQL Database Testing
Run the test script to verify database operations:

```bash
python3 test_database.py
```

### Vector Database Testing
Test the Pinecone vector database functionality:

```bash
# Set your Pinecone API key first
export PINECONE_API_KEY='your-api-key-here'

# Run vector database tests
python3 test_vector_db.py
```

The vector database test will demonstrate:
- Storing contract embeddings
- Saving bytecode patterns  
- Storing exploit vectors
- Similarity search across all vector types
- Record retrieval and management

## Schema Details

### contract_metadata
- `contract_address` (PK): Ethereum address (42 chars)
- `contract_name`: Human-readable name
- `compiler_version`: Solidity compiler version
- `optimization_enabled`: Whether optimization was used
- `creation_block`: Block number when created
- `creator_address`: Address of contract creator
- `source_code_hash`: SHA-256 hash of source code
- `bytecode_hash`: SHA-256 hash of bytecode

### analysis_history
- Foreign key: `contract_address` → `contract_metadata.contract_address`
- `analysis_type`: Type of analysis performed
- Risk scores from all three models
- Detailed analysis results in JSONB
- Timestamps and performance metrics

### risk_score_records
- Time-series risk score data
- Individual model scores and confidence
- Risk level classification

### user_logs
- **Anonymized** user activity tracking
- Hashed IP and user agent for privacy
- Session-based tracking
- Error logging and performance metrics

### onchain_registry
- On-chain event indexing
- Registry type categorization
- Event data in JSONB format
- Block number and transaction hash

## Security & Privacy

- User logs are anonymized with hashed IP/user agent
- No personally identifiable information stored
- All database credentials via environment variables
- Proper connection pooling and error handling

## Development

### Adding New Tables

1. Add table creation SQL in `database.py`
2. Create corresponding DAO class in `data_access.py`
3. Add test cases in `test_database.py`

### Environment Variables

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scathat_db
DB_USER=scathat_user
DB_PASSWORD=scathat_pass
```

## Production Considerations

- Use connection pooling in production
- Implement proper database backups
- Consider read replicas for scaling
- Use environment-specific database credentials
- Monitor database performance metrics