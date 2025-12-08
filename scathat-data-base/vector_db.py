import os
import pinecone
import numpy as np
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class VectorRecord:
    """Simple data class for vector records"""
    id: str
    vector: List[float]
    metadata: Dict[str, Any]
    namespace: str = "default"

class VectorDatabase:
    """Simple Pinecone vector database wrapper for Scathat"""
    
    def __init__(self):
        """Initialize Pinecone client with environment variables"""
        api_key = os.getenv('PINECONE_API_KEY')
        environment = os.getenv('PINECONE_ENVIRONMENT', 'us-east1-gcp')
        index_name = os.getenv('PINECONE_INDEX_NAME', 'scathat-vectors')
        
        if not api_key:
            raise ValueError("PINECONE_API_KEY environment variable is required")
        
        # Initialize Pinecone
        pinecone.init(api_key=api_key, environment=environment)
        
        # Get or create index
        if index_name not in pinecone.list_indexes():
            # Create index with 384 dimensions (common for sentence transformers)
            pinecone.create_index(
                index_name,
                dimension=384,
                metric="cosine",
                metadata_config={"indexed": ["contract_address", "vector_type", "risk_score"]}
            )
        
        self.index = pinecone.Index(index_name)
    
    def store_contract_embedding(self, contract_address: str, embedding: List[float], 
                               metadata: Optional[Dict[str, Any]] = None) -> bool:
        """Store contract embedding in vector database"""
        if metadata is None:
            metadata = {}
        
        metadata.update({
            "contract_address": contract_address,
            "vector_type": "contract_embedding"
        })
        
        record = VectorRecord(
            id=f"contract_{contract_address}",
            vector=embedding,
            metadata=metadata,
            namespace="contracts"
        )
        
        return self._upsert_record(record)
    
    def store_bytecode_pattern(self, pattern_id: str, embedding: List[float], 
                             pattern_type: str, metadata: Optional[Dict[str, Any]] = None) -> bool:
        """Store bytecode pattern in vector database"""
        if metadata is None:
            metadata = {}
        
        metadata.update({
            "pattern_id": pattern_id,
            "pattern_type": pattern_type,
            "vector_type": "bytecode_pattern"
        })
        
        record = VectorRecord(
            id=f"bytecode_{pattern_id}",
            vector=embedding,
            metadata=metadata,
            namespace="bytecode_patterns"
        )
        
        return self._upsert_record(record)
    
    def store_exploit_vector(self, exploit_id: str, embedding: List[float], 
                           exploit_type: str, risk_score: float, 
                           metadata: Optional[Dict[str, Any]] = None) -> bool:
        """Store exploit vector in vector database"""
        if metadata is None:
            metadata = {}
        
        metadata.update({
            "exploit_id": exploit_id,
            "exploit_type": exploit_type,
            "risk_score": risk_score,
            "vector_type": "exploit_vector"
        })
        
        record = VectorRecord(
            id=f"exploit_{exploit_id}",
            vector=embedding,
            metadata=metadata,
            namespace="exploit_vectors"
        )
        
        return self._upsert_record(record)
    
    def _upsert_record(self, record: VectorRecord) -> bool:
        """Internal method to upsert a vector record"""
        try:
            self.index.upsert(
                vectors=[(record.id, record.vector, record.metadata)],
                namespace=record.namespace
            )
            return True
        except Exception as e:
            print(f"Error upserting vector record: {e}")
            return False
    
    def search_similar_contracts(self, query_embedding: List[float], top_k: int = 5, 
                               min_score: float = 0.7) -> List[Dict[str, Any]]:
        """Search for similar contracts based on embedding similarity"""
        return self._search_namespace("contracts", query_embedding, top_k, min_score)
    
    def search_bytecode_patterns(self, query_embedding: List[float], top_k: int = 5, 
                               min_score: float = 0.7) -> List[Dict[str, Any]]:
        """Search for similar bytecode patterns"""
        return self._search_namespace("bytecode_patterns", query_embedding, top_k, min_score)
    
    def search_exploit_vectors(self, query_embedding: List[float], top_k: int = 5, 
                             min_score: float = 0.7) -> List[Dict[str, Any]]:
        """Search for similar exploit vectors"""
        return self._search_namespace("exploit_vectors", query_embedding, top_k, min_score)
    
    def _search_namespace(self, namespace: str, query_embedding: List[float], 
                        top_k: int, min_score: float) -> List[Dict[str, Any]]:
        """Internal method to search within a namespace"""
        try:
            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True,
                namespace=namespace
            )
            
            # Filter by minimum score and format results
            filtered_results = []
            for match in results.get('matches', []):
                if match['score'] >= min_score:
                    filtered_results.append({
                        'id': match['id'],
                        'score': match['score'],
                        'metadata': match['metadata']
                    })
            
            return filtered_results
        except Exception as e:
            print(f"Error searching namespace {namespace}: {e}")
            return []
    
    def get_record(self, record_id: str, namespace: str = "default") -> Optional[Dict[str, Any]]:
        """Retrieve a specific vector record"""
        try:
            result = self.index.fetch(ids=[record_id], namespace=namespace)
            if record_id in result['vectors']:
                vector_data = result['vectors'][record_id]
                return {
                    'id': vector_data['id'],
                    'vector': vector_data['values'],
                    'metadata': vector_data['metadata']
                }
            return None
        except Exception as e:
            print(f"Error fetching record {record_id}: {e}")
            return None
    
    def delete_record(self, record_id: str, namespace: str = "default") -> bool:
        """Delete a vector record"""
        try:
            self.index.delete(ids=[record_id], namespace=namespace)
            return True
        except Exception as e:
            print(f"Error deleting record {record_id}: {e}")
            return False

# Simple utility functions for common operations
def create_sample_embedding() -> List[float]:
    """Create a sample embedding vector for testing"""
    return list(np.random.rand(384))

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    return dot_product / (norm1 * norm2) if norm1 * norm2 != 0 else 0.0