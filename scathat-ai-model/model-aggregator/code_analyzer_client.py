#!/usr/bin/env python3
"""
Code Analyzer API Client
Client for interacting with the deployed code analyzer service
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
class CodeAnalyzerClientConfig:
    """Configuration for code analyzer API client"""
    base_url: str = "http://localhost:8002"
    timeout: int = 30  # seconds
    retry_attempts: int = 3
    retry_delay: float = 1.0  # seconds

class CodeAnalyzerClient:
    """Client for interacting with the code analyzer API"""
    
    def __init__(self, config: Optional[CodeAnalyzerClientConfig] = None):
        self.config = config or CodeAnalyzerClientConfig()
        self.session = requests.Session()
        
    def analyze_code(self, solidity_code: str, contract_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Analyze Solidity code using the deployed code analyzer
        
        Args:
            solidity_code: Solidity source code to analyze
            contract_name: Optional contract name for context
            
        Returns:
            Analysis results including risk score and detected vulnerabilities
        """
        
        # Prepare request payload
        payload = {
            "solidity_code": solidity_code,
            "contract_name": contract_name
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
        """Check if the code analyzer service is healthy"""
        try:
            response = self.session.get(
                f"{self.config.base_url}/health",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("status") == "healthy"
            
            return False
            
        except requests.exceptions.RequestException:
            return False
    
    def get_service_info(self) -> Optional[Dict[str, Any]]:
        """Get service information from the code analyzer"""
        try:
            response = self.session.get(
                f"{self.config.base_url}/info",
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            
            return None
            
        except requests.exceptions.RequestException:
            return None
    
    def _format_for_aggregator(self, api_result: Dict[str, Any]) -> Dict[str, Any]:
        """Convert API response to aggregator format"""
        
        # Extract risk score
        risk_score = api_result.get("risk_score", 0.0)
        if risk_score > 1.0:  # Convert from percentage if needed
            risk_score = risk_score / 100.0
        
        # Extract confidence
        confidence = api_result.get("confidence", 0.7)
        
        # Extract vulnerabilities
        vulnerabilities = api_result.get("vulnerabilities", [])
        
        # Extract code quality metrics
        code_quality = api_result.get("code_quality", {})
        
        return {
            "risk_score": risk_score,
            "confidence": confidence,
            "vulnerabilities": vulnerabilities,
            "code_quality": code_quality,
            "processing_time_ms": api_result.get("processing_time_ms", 0),
            "raw_response": api_result  # Keep original for debugging
        }
    
    def _create_fallback_response(self) -> Dict[str, Any]:
        """Create fallback response when API is unavailable"""
        return {
            "risk_score": 0.5,  # Neutral score when uncertain
            "confidence": 0.1,  # Very low confidence
            "vulnerabilities": [],
            "code_quality": {
                "complexity": "unknown",
                "readability": "unknown",
                "maintainability": "unknown"
            },
            "processing_time_ms": 0,
            "error": "code_analyzer_service_unavailable",
            "fallback": True
        }

def create_code_analyzer_client() -> CodeAnalyzerClient:
    """Factory function to create code analyzer client with default config"""
    return CodeAnalyzerClient()

# Example usage
def demo_code_analysis():
    """Demonstrate code analysis"""
    
    client = CodeAnalyzerClient()
    
    # Check service health
    is_healthy = client.health_check()
    print(f"Code analyzer service healthy: {is_healthy}")
    
    if is_healthy:
        # Sample Solidity code
        sample_code = """
pragma solidity ^0.8.0;

contract VulnerableContract {
    mapping(address => uint256) public balances;
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        balances[msg.sender] -= amount;
    }
}
"""
        
        # Analyze code
        result = client.analyze_code(sample_code, "VulnerableContract")
        
        print("\nCode Analysis Result:")
        print(f"Risk Score: {result['risk_score']:.3f}")
        print(f"Confidence: {result['confidence']:.3f}")
        print(f"Vulnerabilities: {result['vulnerabilities']}")
        
        if result.get('fallback'):
            print("⚠️  Using fallback response (service may be down)")
    else:
        print("❌ Code analyzer service is not available")

if __name__ == "__main__":
    demo_code_analysis()