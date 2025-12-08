#!/usr/bin/env python3
"""
Test script for Vector Database functionality
Demonstrates storing and searching contract embeddings, bytecode patterns, and exploit vectors
"""

import os
import sys
from vector_db import VectorDatabase, create_sample_embedding

def test_vector_database():
    """Test the vector database functionality"""
    print("🧪 Testing Scathat Vector Database")
    print("=" * 50)
    
    # Initialize vector database
    try:
        vector_db = VectorDatabase()
        print("✅ Vector database initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize vector database: {e}")
        print("Please set PINECONE_API_KEY environment variable")
        return False
    
    # Test 1: Store contract embeddings
    print("\n1. Testing Contract Embeddings Storage")
    contract_address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    contract_embedding = create_sample_embedding()
    
    success = vector_db.store_contract_embedding(
        contract_address=contract_address,
        embedding=contract_embedding,
        metadata={
            "compiler_version": "0.8.19",
            "risk_score": 0.85,
            "analysis_timestamp": "2024-01-15T10:30:00Z"
        }
    )
    
    if success:
        print(f"✅ Stored embedding for contract {contract_address}")
    else:
        print(f"❌ Failed to store contract embedding")
    
    # Test 2: Store bytecode pattern
    print("\n2. Testing Bytecode Pattern Storage")
    bytecode_pattern = create_sample_embedding()
    
    success = vector_db.store_bytecode_pattern(
        pattern_id="reentrancy_guard_v1",
        embedding=bytecode_pattern,
        pattern_type="reentrancy_protection",
        metadata={
            "description": "Standard reentrancy guard pattern",
            "confidence": 0.92,
            "detected_in": 150
        }
    )
    
    if success:
        print("✅ Stored bytecode pattern")
    else:
        print("❌ Failed to store bytecode pattern")
    
    # Test 3: Store exploit vector
    print("\n3. Testing Exploit Vector Storage")
    exploit_embedding = create_sample_embedding()
    
    success = vector_db.store_exploit_vector(
        exploit_id="flashloan_attack_2024_001",
        embedding=exploit_embedding,
        exploit_type="flashloan_attack",
        risk_score=0.95,
        metadata={
            "description": "Flashloan-based price manipulation",
            "target_protocol": "Uniswap V3",
            "loss_amount": "$2.1M"
        }
    )
    
    if success:
        print("✅ Stored exploit vector")
    else:
        print("❌ Failed to store exploit vector")
    
    # Test 4: Search for similar contracts
    print("\n4. Testing Similarity Search")
    query_embedding = create_sample_embedding()
    
    # Search contracts
    contract_results = vector_db.search_similar_contracts(query_embedding, top_k=3)
    print(f"📊 Found {len(contract_results)} similar contracts")
    for result in contract_results:
        print(f"   - Contract: {result['metadata'].get('contract_address', 'N/A')} "
              f"(Score: {result['score']:.3f})")
    
    # Search bytecode patterns
    pattern_results = vector_db.search_bytecode_patterns(query_embedding, top_k=2)
    print(f"📊 Found {len(pattern_results)} similar bytecode patterns")
    for result in pattern_results:
        print(f"   - Pattern: {result['metadata'].get('pattern_id', 'N/A')} "
              f"(Score: {result['score']:.3f})")
    
    # Search exploit vectors
    exploit_results = vector_db.search_exploit_vectors(query_embedding, top_k=2)
    print(f"📊 Found {len(exploit_results)} similar exploit vectors")
    for result in exploit_results:
        print(f"   - Exploit: {result['metadata'].get('exploit_id', 'N/A')} "
              f"(Score: {result['score']:.3f})")
    
    # Test 5: Retrieve specific record
    print("\n5. Testing Record Retrieval")
    record = vector_db.get_record(f"contract_{contract_address}", namespace="contracts")
    if record:
        print(f"✅ Retrieved contract record: {record['id']}")
        print(f"   Vector length: {len(record['vector'])}")
        print(f"   Metadata keys: {list(record['metadata'].keys())}")
    else:
        print("❌ Failed to retrieve contract record")
    
    print("\n" + "=" * 50)
    print("🎉 Vector Database Test Completed!")
    print("\nTo use this in production:")
    print("1. Set PINECONE_API_KEY environment variable")
    print("2. Configure PINECONE_ENVIRONMENT and PINECONE_INDEX_NAME")
    print("3. Install dependencies: pip install -r requirements.txt")
    
    return True

def demonstrate_simple_usage():
    """Show simple usage examples"""
    print("\n📋 Simple Usage Examples:")
    print("=" * 40)
    
    print("\n# Store a contract embedding:")
    print("""
from vector_db import VectorDatabase
import numpy as np

# Initialize
db = VectorDatabase()

# Create sample embedding (in real usage, use your ML model)
embedding = list(np.random.rand(384))

# Store contract
db.store_contract_embedding(
    contract_address="0x1234...",
    embedding=embedding,
    metadata={"risk_score": 0.8, "compiler": "0.8.19"}
)
""")
    
    print("\n# Search for similar contracts:")
    print("""
# Search with query embedding
results = db.search_similar_contracts(query_embedding, top_k=5)
for result in results:
    print(f"Contract: {result['metadata']['contract_address']}")
    print(f"Similarity: {result['score']:.3f}")
""")

if __name__ == "__main__":
    # Check if Pinecone API key is set
    if not os.getenv('PINECONE_API_KEY'):
        print("⚠️  PINECONE_API_KEY environment variable not set")
        print("Please set it or the tests will use demo mode")
        print("Example: export PINECONE_API_KEY='your-api-key-here'")
        
        # Show usage examples instead
        demonstrate_simple_usage()
    else:
        test_vector_database()