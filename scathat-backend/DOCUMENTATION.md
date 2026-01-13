# Scathat Backend Documentation

## 🏗️ Architecture Overview

The Scathat backend provides a comprehensive API for smart contract security analysis, integrating blockchain data, AI models, and database services.

```
scathat-backend/
├── scat/                    # Main FastAPI application
│   ├── services/           # Core service implementations
│   │   ├── agentkit_service.py      # AgentKit AI integration
│   │   ├── ai_aggregator_service.py # AI model aggregation
│   │   ├── ai_engine_service.py    # Local AI engine
│   │   ├── database_service.py      # Database operations
│   │   ├── explorer_service.py      # Blockchain explorer integration
│   │   ├── pinecone_service.py      # Vector database operations
│   │   ├── scan_orchestrator_service.py # Main orchestration logic
│   │   └── web3_service.py          # Web3 blockchain interactions
│   ├── tests/              # Test suites
│   │   └── integration/    # Integration tests
│   └── main.py             # FastAPI application entry point
├── simple_backend.py       # Simplified standalone backend
├── .env                    # Environment configuration
└── requirements.txt        # Python dependencies
```

## 🔧 Core Services

### 1. Scan Orchestrator Service (`scan_orchestrator_service.py`)
**Purpose**: Main orchestration logic for contract analysis workflow

**Key Responsibilities**:
- Coordinate between all services for end-to-end analysis
- Manage analysis pipeline and error handling
- Generate comprehensive risk reports
- Handle retry logic and fallback mechanisms

### 2. Explorer Service (`explorer_service.py`)
**Purpose**: Integration with blockchain explorers (Etherscan, Basescan, etc.)

**Key Capabilities**:
- Contract ABI and source code retrieval
- Transaction history analysis
- Contract verification status checking
- Multi-chain support (Ethereum, Base, Polygon, BSC, Avalanche)

**Supported Chains**:
- Ethereum Mainnet (Chain ID: 1)
- Base Mainnet (Chain ID: 8453)  
- Base Sepolia (Chain ID: 84532)
- Polygon (Chain ID: 137)
- BSC (Chain ID: 56)
- Avalanche (Chain ID: 43114)

### 3. Web3 Service (`web3_service.py`)
**Purpose**: Direct blockchain interactions via Web3.py

**Key Capabilities**:
- Live contract state reading
- Transaction simulation
- Gas estimation
- Event log analysis
- Multi-RPC endpoint support

### 4. AI Aggregator Service (`ai_aggregator_service.py`)
**Purpose**: Integration with Scathat AI models

**Key Capabilities**:
- Communication with AI model containers
- Risk score aggregation from multiple models
- Confidence-weighted result fusion
- Explanation generation for risk factors

### 5. AgentKit Service (`agentkit_service.py`)
**Purpose**: Integration with AgentKit AI platform

**Key Capabilities**:
- Advanced AI analysis capabilities
- Large language model integration
- Complex pattern recognition
- Natural language explanations

### 6. Database Service (`database_service.py`)
**Purpose**: Persistent data storage and retrieval

**Key Capabilities**:
- Scan result storage
- Historical analysis tracking
- User management
- Report generation

### 7. Pinecone Service (`pinecone_service.py`)
**Purpose**: Vector database operations for similarity search

**Key Capabilities**:
- Contract similarity matching
- Pattern recognition storage
- Fast nearest-neighbor search
- High-dimensional data indexing

### 8. AI Engine Service (`ai_engine_service.py`)
**Purpose**: Local AI model execution

**Key Capabilities**:
- Fast local inference
- Batch processing capabilities
- Model caching and optimization
- Fallback when external services are unavailable

## 🚀 API Endpoints

### Main Application (`scat/main.py`)

**Base URL**: `http://localhost:8000`

**Endpoints**:
- `POST /scan` - Analyze a smart contract
- `GET /scan/{scan_id}` - Get scan results
- `GET /health` - Health check endpoint
- `GET /chains` - List supported blockchains

**Example Request**:
```python
import requests

response = requests.post(
    "http://localhost:8000/scan",
    json={
        "contract_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        "chain_id": 1  # Ethereum Mainnet
    }
)
```

### Simple Backend (`simple_backend.py`)

**Base URL**: `http://localhost:8001`

**Endpoints**:
- `POST /analyze` - Simple contract analysis
- `GET /health` - Health check
- `POST /analyze/ai` - AI-powered analysis

## ⚙️ Configuration

### Environment Variables (`.env`)

```bash
# Blockchain Explorer API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
BASESCAN_API_KEY_SEPOLIA=your_basescan_sepolia_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
BSCSCAN_API_KEY=your_bscscan_api_key
SNOWTRACE_API_KEY=your_snowtrace_api_key

# RPC Endpoints
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_key
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# AI Services
AGENTKIT_API_URL=https://api.agentkit.ai/v1
AGENTKIT_API_KEY=your_agentkit_key
AGENTKIT_CDP_API_KEY=your_cdp_key
AGENTKIT_CDP_API_SECRET=your_cdp_secret

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/scathat
REDIS_URL=redis://localhost:6379

# AI Model Endpoints
BYTECODE_DETECTOR_URL=http://localhost:8000
CODE_ANALYZER_URL=http://localhost:8002
MODEL_AGGREGATOR_URL=http://localhost:8001
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.9+
- PostgreSQL database
- Redis server
- Docker (for AI model containers)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd scathat-backend

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
python -c "from scat.services.database_service import DatabaseService; DatabaseService().initialize()"
```

### Running the Application

**Development Mode**:
```bash
uvicorn scat.main:app --reload --host 0.0.0.0 --port 8000
```

**Production Mode**:
```bash
uvicorn scat.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Simple Backend**:
```bash
python simple_backend.py
```

## 🔧 Service Configuration

### Explorer Service Configuration
```python
from services.explorer_service import ExplorerConfig, ExplorerService

config = ExplorerConfig(
    api_key="your_api_key",
    base_url="https://api.basescan.org/api",
    chain_id=8453,
    chain_name="Base Mainnet"
)
explorer_service = ExplorerService(config)
```

### Web3 Service Configuration
```python
from services.web3_service import Web3Config, Web3Service

config = Web3Config(
    rpc_url="https://mainnet.base.org",
    chain_id=8453,
    chain_name="Base Mainnet",
    explorer_url="https://basescan.org",
    native_currency="ETH"
)
web3_service = Web3Service(config)
```

## 📊 Data Models

### Scan Request
```python
class ScanRequest(BaseModel):
    contract_address: str
    chain_id: int = 84532  # Default to Base Sepolia
```

### Scan Response
```python
class ScanResponse(BaseModel):
    message: str
    contract_address: str
    risk_score: str
    transaction_hash: Optional[str] = None
    scan_id: str
    status: str
```

### Risk Assessment
```python
class RiskLevel(Enum):
    CRITICAL = "critical"
    HIGH = "high" 
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"
    UNKNOWN = "unknown"
```

## 🧪 Testing

### Running Tests
```bash
# Integration tests
python -m pytest scat/tests/integration/ -v

# Individual service tests
python test_agentkit_endpoints.py
python test_ai_engine.py
python test_blockchain_integration.py
```

### Test Coverage
- API endpoint testing
- Service integration testing
- Blockchain interaction testing
- Error handling validation
- Performance benchmarking

## 🔒 Security Features

### Rate Limiting
- IP-based rate limiting
- Redis-backed rate limiting
- Configurable limits per endpoint

### Input Validation
- Pydantic model validation
- Contract address format validation
- Chain ID validation
- SQL injection prevention

### API Security
- CORS configuration
- HTTPS enforcement (production)
- Input sanitization
- Error message sanitization

## 📈 Performance Optimization

### Caching Strategies
- Redis caching for frequent queries
- Model result caching
- Contract data caching

### Database Optimization
- Indexed database queries
- Connection pooling
- Batch operations

### AI Integration
- Async API calls to AI services
- Connection pooling for model services
- Fallback mechanisms

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "scat.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scathat-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: backend
        image: scathat-backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - secretRef:
            name: scathat-secrets
```

## 🆘 Troubleshooting

### Common Issues

1. **API Key Errors**: Verify all explorer API keys in .env
2. **Database Connection**: Check PostgreSQL and Redis connections
3. **CORS Issues**: Verify frontend URLs in CORS configuration
4. **AI Service Connectivity**: Ensure AI model containers are running

### Logging

Check application logs for detailed error information:
```bash
# View application logs
tail -f logs/app.log

# Docker logs
docker logs scathat-backend
```

### Health Checks

```bash
# API health check
curl http://localhost:8000/health

# Service status
curl http://localhost:8000/status
```

## 🔗 Integration Points

- **Frontend**: REST API endpoints for UI integration
- **AI Models**: HTTP API communication with model containers
- **Blockchain**: RPC connections and explorer APIs
- **Database**: PostgreSQL for persistent storage
- **Cache**: Redis for rate limiting and temporary storage

---
*Last Updated: 2026-01-13*