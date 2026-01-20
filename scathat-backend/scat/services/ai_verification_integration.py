"""
AI Verification Integration Service

Integrates contract verification capabilities with AI analysis pipeline
for comprehensive on-chain security assessment.
"""

import logging
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
import json

from .web3_service import Web3Service, Web3Config
from .contract_verification_service import ContractVerificationService, VerificationStatus
from .network_config import get_web3_config, get_default_network

logger = logging.getLogger(__name__)

@dataclass
class AIVerificationResult:
    """Comprehensive result combining AI analysis and on-chain verification."""
    contract_address: str
    ai_risk_score: float
    ai_confidence: float
    verification_status: VerificationStatus
    security_analysis: Dict[str, Any]
    gas_optimization: Dict[str, Any]
    error_details: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary for easy serialization."""
        return {
            'contract_address': self.contract_address,
            'ai_risk_score': self.ai_risk_score,
            'ai_confidence': self.ai_confidence,
            'verification_status': self.verification_status.value,
            'security_analysis': self.security_analysis,
            'gas_optimization': self.gas_optimization,
            'error_details': self.error_details,
            'overall_risk_level': self._calculate_overall_risk()
        }
    
    def _calculate_overall_risk(self) -> str:
        """Calculate overall risk level based on AI score and verification status."""
        if self.verification_status == VerificationStatus.MALICIOUS:
            return 'CRITICAL'
        elif self.verification_status == VerificationStatus.SUSPICIOUS:
            return 'HIGH'
        elif self.ai_risk_score >= 0.7:
            return 'HIGH'
        elif self.ai_risk_score >= 0.4:
            return 'MEDIUM'
        else:
            return 'LOW'

class AIVerificationIntegration:
    """
    Integration service that combines AI analysis with on-chain verification
    for comprehensive contract security assessment.
    """
    
    def __init__(self, network_name: str = None):
        """
        Initialize AI verification integration service.
        
        Args:
            network_name: Name of the blockchain network to use
        """
        self.network_name = network_name or get_default_network()
        self.web3_config = get_web3_config(self.network_name)
        
        if not self.web3_config:
            raise ValueError(f"Network configuration not found for: {self.network_name}")
        
        # Initialize services
        self.web3_service = Web3Service(self.web3_config)
        self.verification_service = ContractVerificationService(self.web3_service)
        
        logger.info(f"AI Verification Integration initialized for {self.network_name}")
    
    def analyze_contract(self, contract_address: str, 
                        ai_risk_score: float, 
                        ai_confidence: float = 0.8,
                        expected_bytecode: Optional[str] = None) -> AIVerificationResult:
        """
        Perform comprehensive analysis combining AI assessment with on-chain verification.
        
        Args:
            contract_address: Contract address to analyze
            ai_risk_score: AI-generated risk score (0.0-1.0)
            ai_confidence: Confidence level of AI analysis (0.0-1.0)
            expected_bytecode: Expected bytecode for verification (optional)
            
        Returns:
            AIVerificationResult: Comprehensive analysis result
        """
        try:
            # Perform on-chain verification
            verification_result = self.verification_service.verify_contract_deployment(
                contract_address, expected_bytecode
            )
            
            # Perform gas optimization analysis
            gas_analysis = self._analyze_gas_optimization(contract_address)
            
            # Create comprehensive result
            result = AIVerificationResult(
                contract_address=contract_address,
                ai_risk_score=ai_risk_score,
                ai_confidence=ai_confidence,
                verification_status=verification_result['status'],
                security_analysis=verification_result.get('security_analysis', {}),
                gas_optimization=gas_analysis,
                error_details=verification_result.get('message')
            )
            
            logger.info(f"Comprehensive analysis completed for {contract_address}")
            return result
            
        except Exception as e:
            logger.error(f"Error during comprehensive analysis of {contract_address}: {str(e)}")
            
            # Return error result
            return AIVerificationResult(
                contract_address=contract_address,
                ai_risk_score=ai_risk_score,
                ai_confidence=ai_confidence,
                verification_status=VerificationStatus.ERROR,
                security_analysis={},
                gas_optimization={},
                error_details=f"Analysis failed: {str(e)}"
            )
    
    def _analyze_gas_optimization(self, contract_address: str) -> Dict[str, Any]:
        """Analyze gas optimization opportunities for a contract."""
        try:
            # Get contract code to estimate complexity
            contract_code = self.web3_service.get_contract_code(contract_address)
            
            if not contract_code:
                return {'optimization_available': False, 'reason': 'No contract code'}
            
            # Simple gas optimization analysis based on code size
            code_size = len(contract_code) // 2  # Approximate bytes
            
            optimization = {
                'optimization_available': code_size > 1000,  # Large contracts may benefit
                'estimated_savings_percent': min(15, code_size // 100),  # Up to 15%
                'code_complexity': self._estimate_complexity(code_size),
                'recommendations': []
            }
            
            # Add recommendations based on size
            if code_size > 2000:
                optimization['recommendations'].append(
                    "Consider contract splitting or library usage"
                )
            if code_size > 1000:
                optimization['recommendations'].append(
                    "Review storage patterns for gas optimization"
                )
            
            return optimization
            
        except Exception as e:
            logger.warning(f"Gas optimization analysis failed for {contract_address}: {str(e)}")
            return {'optimization_available': False, 'error': str(e)}
    
    def _estimate_complexity(self, code_size: int) -> str:
        """Estimate contract complexity based on code size."""
        if code_size < 500:
            return 'LOW'
        elif code_size < 2000:
            return 'MEDIUM'
        else:
            return 'HIGH'
    
    def batch_analyze_contracts(self, contracts: List[Dict[str, Any]]) -> List[AIVerificationResult]:
        """
        Perform batch analysis of multiple contracts.
        
        Args:
            contracts: List of contract data with AI analysis
            
        Returns:
            List of comprehensive analysis results
        """
        results = []
        
        for contract_data in contracts:
            result = self.analyze_contract(
                contract_address=contract_data['address'],
                ai_risk_score=contract_data.get('risk_score', 0.5),
                ai_confidence=contract_data.get('confidence', 0.8),
                expected_bytecode=contract_data.get('expected_bytecode')
            )
            results.append(result)
        
        return results
    
    def write_risk_assessment_to_chain(self, 
                                     verification_result: AIVerificationResult,
                                     private_key: str,
                                     registry_address: str,
                                     registry_abi: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Write comprehensive risk assessment to blockchain.
        
        Args:
            verification_result: Comprehensive analysis result
            private_key: Private key for signing
            registry_address: ResultsRegistry contract address
            registry_abi: ResultsRegistry contract ABI
            
        Returns:
            Transaction result
        """
        try:
            # Convert risk level for on-chain storage
            risk_level_map = {'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'CRITICAL': 3}
            risk_level = risk_level_map.get(verification_result.overall_risk_level, 1)
            
            # Create comprehensive risk score
            comprehensive_score = (
                f"AI:{verification_result.ai_risk_score:.2f}:" +
                f"VER:{verification_result.verification_status.value}:" +
                f"GAS:{verification_result.gas_optimization.get('estimated_savings_percent', 0)}"
            )
            
            # Write to chain
            tx_result = self.web3_service.write_score_to_chain(
                contract_address=verification_result.contract_address,
                risk_score=comprehensive_score,
                risk_level=risk_level,
                private_key=private_key,
                registry_address=registry_address,
                registry_abi=registry_abi
            )
            
            logger.info(f"Risk assessment written to chain for {verification_result.contract_address}")
            return tx_result
            
        except Exception as e:
            logger.error(f"Failed to write risk assessment to chain: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_network_info(self) -> Dict[str, Any]:
        """Get information about the connected network."""
        return self.web3_service.get_chain_info()

# Example usage and integration with AI services
def create_ai_verification_service() -> AIVerificationIntegration:
    """
    Factory function to create AI verification service.
    Integrates with your existing AI analysis pipeline.
    """
    return AIVerificationIntegration()

def integrate_with_ai_pipeline(ai_analysis_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Main integration function for AI analysis pipeline.
    
    Args:
        ai_analysis_results: List of AI analysis results from your models
        
    Returns:
        List of comprehensive results with on-chain verification
    """
    integration_service = create_ai_verification_service()
    
    # Perform comprehensive analysis
    comprehensive_results = integration_service.batch_analyze_contracts(ai_analysis_results)
    
    # Convert to serializable format
    return [result.to_dict() for result in comprehensive_results]