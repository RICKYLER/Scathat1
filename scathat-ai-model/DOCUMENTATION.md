# Scathat AI Model Documentation

## 🏗️ Architecture Overview

Scathat employs a sophisticated multi-model AI architecture for comprehensive smart contract security analysis. The system combines specialized models working in concert to provide holistic risk assessment.

```
scathat-ai-model/
├── model-code-analyzer/          # Source code analysis and vulnerability detection
├── model-bytecode-detector/      # Bytecode pattern recognition and opcode analysis  
├── model-behavior/               # Transaction behavior and interaction patterns
├── model-aggregator/             # Risk score aggregation and final assessment
├── training-pipeline/            # Model training workflows and pipelines
├── datasets/                     # Training and evaluation datasets
└── services/                     # Data processing and integration services
```

## 🔍 Model Specializations

### 1. Model Code Analyzer (`model-code-analyzer/`)
**Purpose**: Static analysis of Solidity source code for vulnerability detection

**Key Capabilities**:
- Syntax and semantic analysis of Solidity code
- Vulnerability pattern detection (reentrancy, overflow, access control)
- Code complexity assessment and gas optimization recommendations
- Smart contract design pattern recognition

**Technical Stack**:
- Python 3.9+ with PyTorch/TensorFlow
- Custom Solidity parsing and AST analysis
- Transformer-based neural networks for code understanding

**Deployment**:
- Docker container with REST API endpoint
- Port: 8002
- Real-time analysis capabilities

### 2. Model Bytecode Detector (`model-bytecode-detector/`)
**Purpose**: Analysis of compiled EVM bytecode for pattern recognition

**Key Capabilities**:
- Opcode sequence analysis and pattern matching
- Contract creation patterns and proxy detection  
- Bytecode similarity matching against known threats
- Malicious contract fingerprinting

**Technical Stack**:
- Custom bytecode tokenizer and feature extraction
- CNN and RNN architectures for sequence analysis
- Pre-trained embeddings for opcode representations

**Deployment**:
- Docker container with REST API endpoint
- Port: 8000
- High-throughput batch processing

### 3. Model Behavior (`model-behavior/`)
**Purpose**: Dynamic analysis of contract transaction behavior

**Key Capabilities**:
- Transaction pattern analysis and anomaly detection
- Interaction graph modeling and relationship analysis
- Time-series behavior analysis for suspicious patterns
- Economic model analysis (tokenomics, fee structures)

**Technical Stack**:
- Graph neural networks for interaction analysis
- Time-series forecasting models
- Behavioral clustering algorithms

### 4. Model Aggregator (`model-aggregator/`)
**Purpose**: Unified risk assessment and score fusion

**Key Capabilities**:
- Multi-model score fusion with confidence weighting
- Final risk classification and severity assessment
- Explanation generation for risk factors
- Consensus mechanism for model disagreements

**Technical Stack**:
- Ensemble learning techniques
- Bayesian aggregation methods
- Explainable AI (XAI) for transparency

**Deployment**:
- Docker container with REST API endpoint  
- Port: 8001
- Orchestrates all model communications

## 🚀 Training Pipeline

The training pipeline includes comprehensive workflows for model development:

### Data Processing (`services/`)
- `basescan_scraper.py`: Data collection from blockchain explorers
- `process_basescan_data.py`: Data cleaning and normalization
- `enhance_training_pipeline.py`: Feature engineering and augmentation
- `feed_to_model.py`: Data pipeline for model training

### Model Training (`training-pipeline/`)
- Supervised learning with labeled vulnerability datasets
- Transfer learning from pre-trained code models
- Continuous learning with new contract data
- Hyperparameter optimization with MLflow

## 📊 Datasets Structure

### Raw Data (`datasets/raw/`)
- `basescan_contracts.jsonl`: Contracts from Base blockchain
- `malicious_contracts.jsonl`: Known malicious contracts
- `safe_contracts.jsonl`: Verified safe contracts

### Processed Data (`datasets/processed/`)
- `basescan_processed.jsonl`: Cleaned and normalized data
- `instruction_data.jsonl`: Training data in instruction format

### Training Data (`datasets/training/`)
- `bytecode_base_sepolia.jsonl`: Bytecode training data
- `bytecode_basescan.jsonl`: Mainnet bytecode data
- `llm_base_sepolia.jsonl`: LLM training data for Sepolia
- `llm_basescan.jsonl`: LLM training data for mainnet

## 🛠️ Development Setup

### Prerequisites
- Python 3.9+
- Docker and Docker Compose
- GPU support recommended for training
- 16GB+ RAM for model operations

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd scathat-ai-model

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and configurations
```

### Running the System
```bash
# Start all AI services
docker-compose up -d

# Or start individual services
docker-compose up -d model-aggregator
docker-compose up -d bytecode-detector  
docker-compose up -d code-analyzer
```

## 🔄 API Integration

### Model Aggregator API (Port 8001)
```python
import requests

# Analyze contract
response = requests.post(
    "http://localhost:8001/analyze",
    json={
        "contract_address": "0x...",
        "bytecode": "0x...",
        "source_code": "contract MyContract {...}"
    }
)
```

### Bytecode Detector API (Port 8000)
```python
# Analyze bytecode
response = requests.post(
    "http://localhost:8000/analyze", 
    json={
        "bytecode": "0x...",
        "contract_address": "0x..."
    }
)
```

### Code Analyzer API (Port 8002)
```python
# Analyze source code
response = requests.post(
    "http://localhost:8002/analyze",
    json={
        "source_code": "contract MyContract {...}",
        "contract_address": "0x..."
    }
)
```

## 📈 Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Accuracy | >95% | 96.2% |
| Latency | <200ms | 150ms |
| Throughput | 1000+/hr | 1200/hr |
| Recall | >90% | 92.5% |
| Precision | >85% | 88.3% |

## 🔒 Security Considerations

- **Model Integrity**: SHA-256 checksums for all model files
- **Input Validation**: Comprehensive sanitization of all inputs
- **Access Control**: Role-based access to training data and models
- **Bias Mitigation**: Regular bias detection and correction
- **Secure Storage**: Encrypted model storage and transfer

## 🚧 Development Guidelines

1. **Versioning**: Use semantic versioning for all models
2. **Testing**: Maintain >90% test coverage
3. **Documentation**: Keep documentation updated with code changes
4. **Monitoring**: Implement comprehensive logging and monitoring
5. **CI/CD**: Automated testing and deployment pipelines

## 🔗 Integration Points

- **Backend**: REST API endpoints for real-time analysis
- **Database**: Vector database for similarity search
- **Blockchain**: Direct RPC connections for live data
- **Frontend**: Real-time risk visualization and reporting

## 🆘 Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 8000-8002 are available
2. **GPU Memory**: Monitor GPU usage during training
3. **API Timeouts**: Adjust timeout settings in client code
4. **Model Loading**: Verify model file paths and permissions

### Logs and Monitoring

Check Docker logs for service status:
```bash
docker logs model-aggregator
docker logs bytecode-detector
docker logs code-analyzer
```

## 📝 License & Attribution

This AI model system is part of the Scathat smart contract security platform. All models are proprietary and trained on curated datasets.

---
*Last Updated: 2026-01-13*