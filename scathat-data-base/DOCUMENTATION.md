# Scathat Database Documentation

## 🏗️ Architecture Overview

The Scathat database system provides a dual-database architecture combining PostgreSQL for structured data and Pinecone for vector embeddings and similarity search.

```
scathat-data-base/
├── database.py          # PostgreSQL database operations
├── vector_db.py         # Pinecone vector database operations  
├── data_access.py      # Unified data access layer
├── setup_postgres.sh   # PostgreSQL setup script
├── test_database.py    # PostgreSQL tests
├── test_vector_db.py    # Pinecone tests
├── requirements.txt     # Python dependencies
└── .env.example        # Environment configuration template
```

## 📊 Database Architecture

### 1. PostgreSQL - Structured Data Storage
**Purpose**: Relational data storage for contract metadata, analysis history, and user activity.

**Key Tables**:

#### `contract_metadata` - Contract Details
```sql
CREATE TABLE contract_metadata (
    id SERIAL PRIMARY KEY,
    contract_address VARCHAR(42) UNIQUE NOT NULL,
    chain_id INTEGER NOT NULL,
    creator_address VARCHAR(42),
    creation_block INTEGER,
    creation_tx_hash VARCHAR(66),
    is_proxy BOOLEAN DEFAULT FALSE,
    implementation_address VARCHAR(42),
    verified_status BOOLEAN DEFAULT FALSE,
    source_code TEXT,
    abi JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `analysis_history` - Analysis Results
```sql
CREATE TABLE analysis_history (
    id SERIAL PRIMARY KEY,
    contract_address VARCHAR(42) NOT NULL,
    chain_id INTEGER NOT NULL,
    scan_id UUID NOT NULL,
    risk_score FLOAT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    vulnerabilities JSONB,
    model_outputs JSONB,
    analysis_duration INTEGER,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_address) REFERENCES contract_metadata(contract_address)
);
```

#### `risk_score_records` - Historical Risk Tracking
```sql
CREATE TABLE risk_score_records (
    id SERIAL PRIMARY KEY,
    contract_address VARCHAR(42) NOT NULL,
    chain_id INTEGER NOT NULL,
    risk_score FLOAT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scan_id UUID NOT NULL,
    FOREIGN KEY (contract_address) REFERENCES contract_metadata(contract_address)
);
```

#### `user_logs` - Anonymized Activity Tracking
```sql
CREATE TABLE user_logs (
    id SERIAL PRIMARY KEY,
    hashed_ip VARCHAR(64) NOT NULL,
    hashed_user_agent VARCHAR(64),
    contract_address VARCHAR(42),
    action_type VARCHAR(50) NOT NULL,
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chain_id INTEGER,
    scan_id UUID
);
```

#### `onchain_registry` - Blockchain Event Indexing
```sql
CREATE TABLE onchain_registry (
    id SERIAL PRIMARY KEY,
    contract_address VARCHAR(42) NOT NULL,
    chain_id INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    block_number INTEGER NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    event_data JSONB,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Pinecone - Vector Database
**Purpose**: High-dimensional vector storage for AI/ML embeddings and similarity search.

**Key Indexes**:
- **Contract Embeddings**: Vector representations of contract bytecode and behavior
- **Exploit Patterns**: Known vulnerability pattern vectors
- **Similarity Search**: Fast nearest-neighbor search for contract matching
- **Cluster Analysis**: Behavioral clustering of contract interactions

## 🛠️ Installation & Setup

### Prerequisites
- PostgreSQL 13+
- Python 3.9+
- Pinecone account and API key

### 1. PostgreSQL Setup

**Using setup script**:
```bash
# Make script executable
chmod +x setup_postgres.sh

# Run setup script
./setup_postgres.sh
```

**Manual setup**:
```bash
# Install PostgreSQL
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE scathat_db;"
sudo -u postgres psql -c "CREATE USER scathat_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE scathat_db TO scathat_user;"

# Initialize schema
psql -h localhost -U scathat_user -d scathat_db -f schema.sql
```

### 2. Pinecone Setup

**Create Pinecone index**:
```python
import pinecone

pinecone.init(api_key="your_api_key", environment="your_environment")

# Create index for contract embeddings
pinecone.create_index(
    name="contract-embeddings",
    dimension=768,  # Adjust based on your model
    metric="cosine",
    spec=pinecone.Spec(serverless={
        "cloud": "aws",
        "region": "us-east-1"
    })
)
```

### 3. Environment Configuration

Copy and update the environment file:
```bash
cp .env.example .env
```

**`.env` configuration**:
```bash
# PostgreSQL Database
DATABASE_URL=postgresql://scathat_user:your_password@localhost:5432/scathat_db

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX=contract-embeddings

# Optional: Connection pool settings
DB_MAX_CONNECTIONS=20
DB_POOL_TIMEOUT=30
```

## 🔧 Core Components

### 1. Database Service (`database.py`)
**Purpose**: PostgreSQL database operations and connection management.

**Key Features**:
- Connection pooling and management
- CRUD operations for all tables
- Transaction support
- Batch operations for bulk data
- Query optimization and indexing

**Example Usage**:
```python
from database import DatabaseService

# Initialize database service
db = DatabaseService()

# Store contract metadata
contract_data = {
    "contract_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "chain_id": 1,
    "creator_address": "0x...",
    "is_proxy": False,
    "verified_status": True
}
db.store_contract_metadata(contract_data)

# Query analysis history
history = db.get_analysis_history("0x742d35Cc6634C0532925a3b844Bc454e4438f44e", 1)
```

### 2. Vector Database Service (`vector_db.py`)
**Purpose**: Pinecone vector database operations for embeddings.

**Key Features**:
- Vector embedding storage and retrieval
- Similarity search and matching
- Batch vector operations
- Index management and optimization

**Example Usage**:
```python
from vector_db import VectorDBService

# Initialize vector database
vector_db = VectorDBService()

# Store contract embedding
embedding = [0.1, 0.2, 0.3, ...]  # 768-dimensional vector
vector_db.store_embedding(
    contract_address="0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    embedding=embedding,
    metadata={"chain_id": 1, "risk_score": 0.85}
)

# Similarity search
results = vector_db.similarity_search(
    query_embedding=embedding,
    top_k=10,
    filter={"risk_level": "high"}
)
```

### 3. Data Access Layer (`data_access.py`)
**Purpose**: Unified interface for both PostgreSQL and Pinecone operations.

**Key Features**:
- Combined database operations
- Transaction consistency across databases
- Data synchronization between SQL and vector stores
- Cache management and invalidation

**Example Usage**:
```python
from data_access import DataAccessService

data_access = DataAccessService()

# Store complete contract analysis
analysis_data = {
    "contract_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "chain_id": 1,
    "risk_score": 0.92,
    "embedding": [0.1, 0.2, 0.3, ...],
    "vulnerabilities": [...],
    "metadata": {...}
}

data_access.store_complete_analysis(analysis_data)

# Query with combined SQL and vector search
results = data_access.hybrid_search(
    sql_filters={"risk_level": "high", "chain_id": 1},
    vector_query=embedding,
    top_k=20
)
```

## 📊 Data Operations

### CRUD Operations

**Create**:
```python
# Store new contract
db.store_contract_metadata({
    "contract_address": "0x...",
    "chain_id": 1,
    "creator_address": "0x...",
    "is_proxy": False
})

# Store vector embedding
vector_db.store_embedding(
    contract_address="0x...", 
    embedding=[...],
    metadata={"risk_score": 0.75}
)
```

**Read**:
```python
# Get contract metadata
metadata = db.get_contract_metadata("0x...", 1)

# Similarity search
similar = vector_db.similarity_search(embedding, top_k=5)
```

**Update**:
```python
# Update risk score
db.update_risk_score("0x...", 1, 0.88, "high")

# Update vector metadata
vector_db.update_metadata("0x...", {"risk_score": 0.88, "risk_level": "high"})
```

**Delete**:
```python
# Delete contract data
db.delete_contract_data("0x...", 1)

# Delete vector
vector_db.delete_embedding("0x...")
```

### Batch Operations

**Bulk insert**:
```python
# Bulk contract storage
contracts = [{...}, {...}, {...}]
db.bulk_store_contracts(contracts)

# Bulk vector storage
vectors = [
    ("0x1", embedding1, metadata1),
    ("0x2", embedding2, metadata2),
    ("0x3", embedding3, metadata3)
]
vector_db.bulk_store_embeddings(vectors)
```

### Advanced Queries

**Complex SQL queries**:
```python
# Get high-risk contracts with recent analysis
high_risk = db.query("""
    SELECT cm.contract_address, cm.chain_id, ah.risk_score, ah.analyzed_at
    FROM contract_metadata cm
    JOIN analysis_history ah ON cm.contract_address = ah.contract_address
    WHERE ah.risk_level = 'high' 
    AND ah.analyzed_at > NOW() - INTERVAL '7 days'
    ORDER BY ah.risk_score DESC
    LIMIT 100
""")
```

**Hybrid search**:
```python
# Combine SQL filters with vector similarity
results = data_access.hybrid_search(
    sql_filters={
        "risk_level": "critical",
        "chain_id": 1,
        "verified_status": True
    },
    vector_query=query_embedding,
    top_k=10,
    min_similarity=0.8
)
```

## 🔒 Security & Compliance

### Data Protection
- **Anonymization**: User IPs and user agents are hashed before storage
- **Encryption**: Sensitive data encrypted at rest and in transit
- **Access Control**: Role-based database access permissions
- **Audit Logging**: Comprehensive activity logging for compliance

### GDPR Compliance
- **Right to be Forgotten**: Data deletion procedures implemented
- **Data Portability**: Export capabilities for user data
- **Consent Management**: User consent tracking and management
- **Data Minimization**: Only necessary data is collected and stored

### Security Best Practices
- **SQL Injection Prevention**: Parameterized queries and ORM usage
- **Input Validation**: Comprehensive input sanitization
- **Connection Security**: SSL/TLS for database connections
- **Regular Audits**: Security audits and penetration testing

## 📈 Performance Optimization

### Database Optimization

**Indexing Strategy**:
```sql
-- Contract metadata indexes
CREATE INDEX idx_contract_address ON contract_metadata(contract_address);
CREATE INDEX idx_chain_id ON contract_metadata(chain_id);
CREATE INDEX idx_creator ON contract_metadata(creator_address);

-- Analysis history indexes  
CREATE INDEX idx_analysis_contract ON analysis_history(contract_address, chain_id);
CREATE INDEX idx_analysis_timestamp ON analysis_history(analyzed_at);
CREATE INDEX idx_risk_level ON analysis_history(risk_level);

-- Risk score indexes
CREATE INDEX idx_risk_timestamp ON risk_score_records(recorded_at);
CREATE INDEX idx_risk_contract ON risk_score_records(contract_address, chain_id);
```

**Query Optimization**:
- Connection pooling with max connections limit
- Query timeout configuration
- Batch processing for bulk operations
- Read replica support for scaling

### Vector Database Optimization

**Pinecone Configuration**:
- Appropriate dimension size for embeddings
- Optimal metric selection (cosine, euclidean, dotproduct)
- Proper pod type and size for workload
- Index replication for high availability

**Performance Tips**:
- Batch upsert operations for better throughput
- Use metadata filtering for efficient searches
- Monitor index size and performance metrics
- Regular index optimization and maintenance

## 🧪 Testing

### Running Tests
```bash
# PostgreSQL tests
python test_database.py

# Pinecone tests  
python test_vector_db.py

# Integration tests
python -m pytest tests/
```

### Test Coverage
- Database connection and connection pooling
- CRUD operations for all tables
- Transaction consistency and rollback
- Vector storage and retrieval operations
- Error handling and edge cases
- Performance benchmarking

### Test Data

**Sample contract data**:
```python
test_contract = {
    "contract_address": "0xE41d2489571d322189246DaFA5ebDe1F4699F498",
    "chain_id": 1,
    "creator_address": "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
    "is_proxy": False,
    "verified_status": True,
    "source_code": "contract Test { ... }",
    "abi": [...]
}
```

**Sample vector data**:
```python
test_embedding = [0.1] * 768  # 768-dimensional vector
test_metadata = {
    "risk_score": 0.85,
    "risk_level": "high",
    "chain_id": 1,
    "analysis_timestamp": "2024-01-13T12:00:00Z"
}
```

## 🚀 Deployment

### Docker Deployment

**Dockerfile**:
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Expose health check port
EXPOSE 8080

CMD ["python", "-m", "http.server", "8080"]
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  scathat-db:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/scathat_db
      - PINECONE_API_KEY=${PINECONE_API_KEY}
    depends_on:
      - postgres

  postgres:
    image: postgres:13
    environment:
      - POSTGRES_DB=scathat_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Kubernetes Deployment

**Deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scathat-database
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: database-service
        image: scathat-database:latest
        ports:
        - containerPort: 8080
        envFrom:
        - secretRef:
            name: scathat-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify PostgreSQL is running
   - Check connection string in .env
   - Ensure firewall allows connections

2. **Pinecone Connection Issues**:
   - Verify API key and environment
   - Check internet connectivity
   - Verify index exists and is accessible

3. **Performance Issues**:
   - Check database connection pool settings
   - Monitor query performance with EXPLAIN ANALYZE
   - Optimize indexes for frequent queries

### Monitoring

**Database Metrics**:
- Connection pool utilization
- Query response times
- Transaction rates
- Storage usage

**Vector Database Metrics**:
- Index size and performance
- Query latency
- Upsert throughput
- Error rates

### Logs

Check application logs for detailed error information:
```bash
# Database operation logs
tail -f /var/log/postgresql/postgresql-13-main.log

# Application logs
docker logs scathat-database
```

## 🔗 Integration Points

- **Backend Services**: RESTful API for data operations
- **AI Models**: Vector storage for embeddings and similarity search
- **Blockchain Indexers**: Real-time data ingestion from blockchain events
- **Monitoring Systems**: Metrics and health check integration

---
*Last Updated: 2026-01-13*