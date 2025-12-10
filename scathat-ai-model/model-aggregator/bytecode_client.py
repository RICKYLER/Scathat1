#!/usr/bin/env python3
"""
Bytecode Detector API Client
Client for interacting with the deployed bytecode detector service
"""

import requests
import json
from typing import Dict, Any, Optional
from dataclasses import dataclass
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class BytecodeClientConfig:
    """Configuration for bytecode detector API client"""
    base_url: str = "http://localhost:8000"
    timeout: int = 30  # seconds
    retry_attempts: int = 3
    retry_delay: float = 1.0  # seconds

class BytecodeDetectorClient:
    """Client for interacting with the bytecode detector API"""
    
    def __init__(self, config: Optional[BytecodeClientConfig] = None):
        self.config = config or BytecodeClientConfig()
        self.session = requests.Session()
        
    def analyze_bytecode(self, bytecode: str, contract_address: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze EVM bytecode using the deployed detector
        
        Args:
            bytecode: EVM bytecode string (with or without 0x prefix)
            contract_address: Optional contract address for context
            
        Returns:
            Analysis results including risk score and detected patterns
        """
        
        # Prepare request payload
        payload = {
            "bytecode": bytecode,
            "contract_address": contract_address
        }
        
        # Remove None values
        payload = {k: v for k, v in payload.items() if v is not None}
        
        endpoint = f"{self.config.base_url}/analyze"
        
        for attempt in range(self.config.retry_attempts):
            try:
                response = self.session.post(
                    endpoint,
                    json=payload,
                    timeout=self.config.timeout,
                    headers={"Content-Type": "application/json"}
                )
                
                response.raise_for_status()
                
                result = response.json()
                
                # Convert to aggregator format
                return self._format_for_aggregator(result)
                
            except requests.exceptions.RequestException as e:
                logger.warning(f"Attempt {attempt + 1} failed: {e}")
                if attempt == self.config.retry_attempts - 1:
                    logger.error(f"All {self.config.retry_attempts} attempts failed")
                    return self._create_fallback_response()
                
                # Wait before retry
                import time
                time.sleep(self.config.retry_delay)
        
        return self._create_fallback_response()
    
    def health_check(self) -> bool:
        """Check if the bytecode detector service is healthy"""
        try:
            response = self.session.get(
                f"{self.config.base_url}/health",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("status") == "healthy" and data.get("model_loaded", False)
            
            return False
            
        except requests.exceptions.RequestException:
            return False
    
    def get_metrics(self) -> Optional[Dict[str, Any]]:
        """Get Prometheus metrics from the bytecode detector"""
        try:
            response = self.session.get(
                f"{self.config.base_url}/metrics",
                timeout=10
            )
            
            if response.status_code == 200:
                return {"metrics": response.text}
            
            return None
            
        except requests.exceptions.RequestException:
            return None
    
    def _format_for_aggregator(self, api_result: Dict[str, Any]) -> Dict[str, Any]:
        """Convert API response to aggregator format"""
        
        # Extract risk score (convert from 0-100 scale to 0-1 if needed)
        risk_score = api_result.get("risk_score", 0.0)
        if risk_score > 1.0:  # Assuming it might be percentage
            risk_score = risk_score / 100.0
        
        # Extract confidence
        confidence = api_result.get("confidence", 0.7)
        
        # Extract detected patterns
        detected_patterns = api_result.get("detected_patterns", [])
        
        return {
            "risk_score": risk_score,
            "confidence": confidence,
            "detected_patterns": detected_patterns,
            "processing_time_ms": api_result.get("processing_time_ms", 0),
            "raw_response": api_result  # Keep original for debugging
        }
    
    def _create_fallback_response(self) -> Dict[str, Any]:
        """Create fallback response when API is unavailable"""
        return {
            "risk_score": 0.5,  # Neutral score when uncertain
            "confidence": 0.1,  # Very low confidence
            "detected_patterns": [],
            "processing_time_ms": 0,
            "error": "bytecode_service_unavailable",
            "fallback": True
        }

def create_bytecode_client() -> BytecodeDetectorClient:
    """Factory function to create bytecode client with default config"""
    return BytecodeDetectorClient()

# Example usage
def demo_bytecode_analysis():
    """Demonstrate bytecode analysis"""
    
    client = BytecodeDetectorClient()
    
    # Check service health
    is_healthy = client.health_check()
    print(f"Bytecode service healthy: {is_healthy}")
    
    if is_healthy:
        # Sample bytecode (truncated for demo)
        sample_bytecode = "0x6080604052348015600f57600080fd5b506004361060325760003560e01c8063"
        
        # Analyze bytecode
        result = client.analyze_bytecode(sample_bytecode, "0x1234567890abcdef")
        
        print("\nBytecode Analysis Result:")
        print(f"Risk Score: {result['risk_score']:.3f}")
        print(f"Confidence: {result['confidence']:.3f}")
        print(f"Detected Patterns: {result['detected_patterns']}")
        
        if result.get('fallback'):
            print("⚠️  Using fallback response (service may be down)")
    else:
        print("❌ Bytecode service is not available")

if __name__ == "__main__":
    demo_bytecode_analysis()