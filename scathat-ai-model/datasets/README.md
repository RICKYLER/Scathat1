# Datasets

## 📋 Overview

Structured datasets for training and evaluating Scathat AI models. This directory contains all data required for model development, organized by type and processing stage.

## 🗂️ Directory Structure

```
datasets/
├── raw/           # Original, unprocessed data
├── processed/     # Cleaned and formatted data
├── training/      # Training datasets
├── validation/    # Validation datasets  
├── test/         # Test datasets
└── external/      # Third-party datasets
```

## 📊 Dataset Types

### 1. Code Analysis Datasets
**Purpose**: Training code analyzer model
**Content**:
- Solidity source code with vulnerability labels
- Code quality annotations
- Gas optimization examples
- Best practice compliance labels

**Format**:
```json
{
  "source_code": "contract Example { ... }",
  "vulnerabilities": [
    {
      "type": "reentrancy",
      "severity": "high",
      "line_number": 42,
      "description": "Potential reentrancy vulnerability"
    }
  ],
  "quality_score": 0.85,
  "gas_efficiency": 0.92
}
```

### 2. Bytecode Datasets
**Purpose**: Training bytecode detector model
**Content**:
- Ethereum bytecode samples
- Pattern recognition labels
- Contract type annotations
- Vulnerability patterns in bytecode

**Format**:
```json
{
  "bytecode": "0x608060405234801561001057600080fd5b5060...",
  "contract_type": "ERC20",
  "patterns": ["proxy_storage", "upgradeable"],
  "vulnerabilities": ["delegatecall_risk"],
  "is_creation_code": false
}
```

### 3. Behavior Analysis Datasets
**Purpose**: Training behavior model
**Content**:
- Transaction sequences
- Interaction graph data
- Anomaly labels
- Risk assessment annotations

**Format**:
```json
{
  "transactions": [
    {
      "hash": "0x...",
      "from": "0x...",
      "to": "0x...",
      "value": "1.5",
      "gas_used": 21000,
      "timestamp": 1672531200
    }
  ],
  "interaction_graph": {
    "nodes": ["0x...", "0x..."],
    "edges": [{"from": "0x...", "to": "0x...", "weight": 5}]
  },
  "anomaly_score": 0.82,
  "risk_level": "high"
}
```

### 4. Aggregator Training Datasets
**Purpose**: Training model aggregator
**Content**:
- Multi-model output combinations
- Expert risk assessments
- Explanation quality ratings
- Ground truth evaluations

**Format**:
```json
{
  "model_outputs": {
    "code_analysis": {...},
    "bytecode_analysis": {...},
    "behavior_analysis": {...}
  },
  "expert_assessment": {
    "risk_score": 0.78,
    "confidence": 0.89,
    "explanation": "Combined risk factors...",
    "recommendations": ["Review required"]
  }
}
```

## 🔄 Data Processing Pipeline

### Raw Data
- Original data sources
- Unprocessed format
- May contain inconsistencies
- Requires cleaning and normalization

### Processed Data
- Cleaned and standardized
- Consistent format
- Feature engineering applied
- Ready for training

### Final Datasets
- Train/validation/test splits
- Properly formatted
- Quality assured
- Version controlled

## 📈 Dataset Statistics

### Target Sizes
- **Code Analysis**: 50,000+ labeled contracts
- **Bytecode**: 100,000+ bytecode samples  
- **Behavior**: 500,000+ transaction sequences
- **Aggregator**: 10,000+ expert assessments

### Quality Metrics
- **Accuracy**: >98% label accuracy
- **Coverage**: Comprehensive vulnerability types
- **Diversity**: Wide range of contract patterns
- **Balance**: Proper class distribution

## 🚀 Usage

### Loading Datasets
```python
from datasets import load_dataset

# Load training data
code_data = load_dataset("code_vulnerabilities", split="train")
bytecode_data = load_dataset("bytecode_patterns", split="train")
```

### Data Preparation
```python
from datasets import preprocess_data

# Preprocess for specific model
processed_data = preprocess_data(
    raw_data, 
    model_type="code_analyzer",
    config_path="configs/preprocessing.yaml"
)
```

### Dataset Splitting
```python
from datasets import create_splits

train_data, val_data, test_data = create_splits(
    dataset, 
    train_ratio=0.8,
    val_ratio=0.1,
    test_ratio=0.1,
    random_seed=42
)
```

## 🔒 Data Security

### Privacy Protection
- Anonymization of sensitive data
- Encryption of personal information
- Access control mechanisms

### Integrity Assurance
- Checksum verification
- Version control
- Backup and recovery procedures

### Compliance
- GDPR compliance
- Data usage agreements
- Ethical guidelines adherence

## 📝 Dataset Documentation

### Metadata
```yaml
name: "code_vulnerabilities_v1.0"
description: "Solidity contracts with vulnerability labels"
version: "1.0.0"
created_date: "2025-01-15"
num_samples: 50000
source: "Ethereum mainnet and testnets"
license: "CC BY-NC-SA 4.0"
contact: "data@scathat.com"
```

### Schema Documentation
- Field definitions and types
- Data format specifications
- Validation rules
- Example values

### Quality Reports
- Data completeness metrics
- Label accuracy assessments
- Distribution analysis
- Bias detection reports

## 🔄 Version Control

### Dataset Versions
- Semantic versioning (major.minor.patch)
- Change logs
- Backward compatibility

### Updates
- Regular updates with new data
- Quality improvements
- Bug fixes
- Schema evolution

## 🧪 Validation

### Data Validation
```python
from datasets import validate_dataset

# Validate dataset quality
validation_report = validate_dataset(
    dataset_path="./datasets/training/code_vulnerabilities",
    validation_rules="configs/validation_rules.yaml"
)
```

### Quality Metrics
- Label consistency
- Data completeness
- Format compliance
- Statistical properties

### Automated Testing
- Unit tests for data loading
- Integration tests for pipelines
- Performance tests for scaling

## 📊 Monitoring

### Data Quality Monitoring
- Continuous quality assessment
- Drift detection
- Performance tracking
- Alerting for issues

### Usage Monitoring
- Dataset access patterns
- Performance metrics
- Resource utilization
- Cost optimization

## 🛠️ Customization

### Adding New Datasets
1. Create raw data directory
2. Define data schema
3. Implement preprocessing
4. Add to dataset registry
5. Update documentation

### Custom Formats
1. Define custom loader
2. Implement validation
3. Add to processing pipeline
4. Test compatibility

### Extended Metadata
1. Add custom fields
2. Update validation rules
3. Modify loading logic
4. Update documentation

## 🔍 Troubleshooting

### Common Issues
- Data format mismatches
- Missing files
- Corruption issues
- Permission problems

### Debug Tools
- Data validation scripts
- Quality assessment tools
- Logging and monitoring
- Support documentation

### Support Resources
- Dataset documentation
- Example configurations
- Community forums
- Technical support

## 📈 Scaling Considerations

### Large Datasets
- Distributed storage
- Efficient data loading
- Streaming capabilities
- Memory optimization

### Multiple Datasets
- Namespace management
- Version coordination
- Dependency tracking
- Resource allocation

### Production Deployment
- High availability
- Backup strategies
- Disaster recovery
- Performance optimization

## 🎯 Best Practices

### Data Management
- Regular backups
- Version control
- Documentation
- Quality assurance

### Performance
- Efficient storage formats
- Compression techniques
- Caching strategies
- Load balancing

### Security
- Access control
- Encryption
- Audit logging
- Compliance monitoring

### Maintenance
- Regular updates
- Bug fixes
- Performance optimization
- User support