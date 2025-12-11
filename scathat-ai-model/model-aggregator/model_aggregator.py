#!/usr/bin/env python3
"""
Model Aggregator - Simple Weighted Scoring System
Combines outputs from Code Analyzer, Bytecode Detector, and Behavior Model

Enhanced with real API integration for bytecode analysis
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ModelWeights:
    """Configuration for model weighting"""
    code_analyzer: float = 0.4    # 40% weight
    bytecode_detector: float = 0.3  # 30% weight  
    behavior_model: float = 0.3   # 30% weight

class ResultAggregator:
    """Simple aggregator with weighted scoring and confidence-based weighting"""
    
    def __init__(self, weights: ModelWeights = None):
        self.weights = weights or ModelWeights()
        
        # Import bytecode client (optional dependency)
        self.bytecode_client = None
        try:
            from bytecode_client import BytecodeDetectorClient
            self.bytecode_client = BytecodeDetectorClient()
            logger.info("Bytecode client initialized successfully")
        except ImportError:
            logger.warning("Bytecode client not available - using mock data")
        except Exception as e:
            logger.warning(f"Failed to initialize bytecode client: {e}")
        
        # Import code analyzer client (optional dependency)
        self.code_analyzer_client = None
        try:
            from code_analyzer_client import CodeAnalyzerClient
            self.code_analyzer_client = CodeAnalyzerClient()
            logger.info("Code analyzer client initialized successfully")
        except ImportError:
            logger.warning("Code analyzer client not available - using mock data")
        except Exception as e:
            logger.warning(f"Failed to initialize code analyzer client: {e}")
        
        # Import smart contract client (optional dependency)
        self.smart_contract_client = None
        try:
            from smart_contract_client import smart_contract_client
            self.smart_contract_client = smart_contract_client
            if self.smart_contract_client.is_connected():
                logger.info("Smart contract client initialized successfully")
            else:
                logger.warning("Smart contract client not connected to blockchain")
        except ImportError:
            logger.warning("Smart contract client not available - blockchain writes disabled")
        except Exception as e:
            logger.warning(f"Failed to initialize smart contract client: {e}")
        
    def aggregate(self, model_outputs: Dict[str, Dict]) -> Dict[str, Any]:
        """
        Aggregate results from all three models with weighted scoring
        
        Args:
            model_outputs: Dictionary with outputs from each model
                {
                    "code_analysis": {...},
                    "bytecode_analysis": {...}, 
                    "behavior_analysis": {...}
                }
        
        Returns:
            Comprehensive aggregated result with final risk score and explanation
        """
        
        # Extract scores and confidences
        code_score = model_outputs.get("code_analysis", {}).get("risk_score", 0.0)
        code_confidence = model_outputs.get("code_analysis", {}).get("confidence", 0.5)
        
        bytecode_score = model_outputs.get("bytecode_analysis", {}).get("risk_score", 0.0)
        bytecode_confidence = model_outputs.get("bytecode_analysis", {}).get("confidence", 0.5)
        
        behavior_score = model_outputs.get("behavior_analysis", {}).get("behavior_score", 0.0)
        behavior_confidence = model_outputs.get("behavior_analysis", {}).get("anomaly_score", 0.5)
        
        # Apply confidence-based weighting
        effective_weights = self._calculate_effective_weights(
            code_confidence, bytecode_confidence, behavior_confidence
        )
        
        # Calculate weighted final score
        final_score = (
            code_score * effective_weights.code_analyzer +
            bytecode_score * effective_weights.bytecode_detector + 
            behavior_score * effective_weights.behavior_model
        )
        
        # Determine risk level
        risk_level = self._determine_risk_level(final_score)
        
        # Generate explanation
        explanation = self._generate_explanation(
            code_score, bytecode_score, behavior_score,
            effective_weights, risk_level
        )
        
        return {
            "final_risk_score": round(final_score, 3),
            "overall_confidence": round((code_confidence + bytecode_confidence + behavior_confidence) / 3, 3),
            "risk_level": risk_level,
            "explanation": explanation,
            "model_contributions": {
                "code_analyzer": {
                    "score": round(code_score, 3),
                    "confidence": round(code_confidence, 3),
                    "weight": round(effective_weights.code_analyzer, 3)
                },
                "bytecode_detector": {
                    "score": round(bytecode_score, 3), 
                    "confidence": round(bytecode_confidence, 3),
                    "weight": round(effective_weights.bytecode_detector, 3)
                },
                "behavior_model": {
                    "score": round(behavior_score, 3),
                    "confidence": round(behavior_confidence, 3),
                    "weight": round(effective_weights.behavior_model, 3)
                }
            },
            "recommendations": self._generate_recommendations(risk_level)
        }
    
    def analyze_bytecode_real(self, bytecode: str, contract_address: Optional[str] = None) -> Dict[str, Any]:
        """
        Perform real bytecode analysis using the deployed API
        
        Args:
            bytecode: EVM bytecode string
            contract_address: Optional contract address for context
            
        Returns:
            Analysis results in aggregator format
        """
        
        if not self.bytecode_client:
            logger.warning("Bytecode client not available - using mock data")
            return self._create_mock_bytecode_analysis()
        
        try:
            # Perform real analysis
            result = self.bytecode_client.analyze_bytecode(bytecode, contract_address)
            
            if result.get('fallback'):
                logger.warning("Using fallback bytecode analysis (service may be down)")
            else:
                logger.info(f"Bytecode analysis completed: score={result['risk_score']:.3f}")
            
            return result
            
        except Exception as e:
            logger.error(f"Bytecode analysis failed: {e}")
            return self._create_mock_bytecode_analysis()
    
    def aggregate_with_real_bytecode(self, bytecode: str, contract_address: Optional[str] = None, 
                                   code_analysis: Optional[Dict] = None, 
                                   behavior_analysis: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Enhanced aggregation with real bytecode analysis
        
        Args:
            bytecode: EVM bytecode to analyze
            contract_address: Optional contract address
            code_analysis: Optional code analysis results
            behavior_analysis: Optional behavior analysis results
            
        Returns:
            Comprehensive aggregated result
        """
        
        # Perform real bytecode analysis
        bytecode_result = self.analyze_bytecode_real(bytecode, contract_address)
        
        # Prepare model outputs
        model_outputs = {
            "bytecode_analysis": {
                "risk_score": bytecode_result.get("risk_score", 0.0),
                "confidence": bytecode_result.get("confidence", 0.5),
                "detected_patterns": bytecode_result.get("detected_patterns", []),
                "processing_time_ms": bytecode_result.get("processing_time_ms", 0)
            }
        }
        
        # Add optional code analysis
        if code_analysis:
            model_outputs["code_analysis"] = code_analysis
        else:
            model_outputs["code_analysis"] = {
                "risk_score": 0.0,
                "confidence": 0.1,  # Low confidence for missing data
                "vulnerabilities": []
            }
        
        # Add optional behavior analysis
        if behavior_analysis:
            model_outputs["behavior_analysis"] = behavior_analysis
        else:
            model_outputs["behavior_analysis"] = {
                "behavior_score": 0.0,
                "anomaly_score": 0.1,  # Low confidence for missing data
                "detected_patterns": []
            }
        
        # Perform aggregation
        return self.aggregate(model_outputs)
    
    def _create_mock_bytecode_analysis(self) -> Dict[str, Any]:
        """Create mock bytecode analysis for fallback"""
        return {
            "risk_score": 0.5,  # Neutral score
            "confidence": 0.1,  # Low confidence
            "detected_patterns": [],
            "processing_time_ms": 0,
            "fallback": True
        }
    
    def _create_mock_code_analysis(self) -> Dict[str, Any]:
        """Create mock code analysis for fallback"""
        return {
            "risk_score": 0.5,  # Neutral score
            "confidence": 0.1,  # Low confidence
            "vulnerabilities": [],
            "code_quality": {
                "complexity": "unknown",
                "readability": "unknown", 
                "maintainability": "unknown"
            },
            "processing_time_ms": 0,
            "fallback": True
        }
    
    def is_bytecode_service_available(self) -> bool:
        """Check if bytecode analysis service is available"""
        if not self.bytecode_client:
            return False
        
        try:
            return self.bytecode_client.health_check()
        except Exception:
            return False
    
    def is_code_analyzer_service_available(self) -> bool:
        """Check if code analyzer service is available"""
        if not self.code_analyzer_client:
            return False
        
        try:
            return self.code_analyzer_client.health_check()
        except Exception:
            return False
    
    def analyze_code_real(self, solidity_code: str, contract_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Perform real code analysis using the deployed code analyzer API
        
        Args:
            solidity_code: Solidity source code to analyze
            contract_name: Optional contract name for context
            
        Returns:
            Analysis results in aggregator format
        """
        
        if not self.code_analyzer_client:
            logger.warning("Code analyzer client not available - using mock data")
            return self._create_mock_code_analysis()
        
        try:
            # Perform real analysis
            result = self.code_analyzer_client.analyze_code(solidity_code, contract_name)
            
            if result.get('fallback'):
                logger.warning("Using fallback code analysis (service may be down)")
            else:
                logger.info(f"Code analysis completed: score={result['risk_score']:.3f}")
            
            return result
            
        except Exception as e:
            logger.error(f"Code analysis failed: {e}")
            return self._create_mock_code_analysis()
    
    def _calculate_effective_weights(self, code_conf: float, bytecode_conf: float, behavior_conf: float) -> ModelWeights:
        """Calculate effective weights based on model confidence"""
        
        # Base weights
        base_weights = self.weights
        
        # Adjust weights based on confidence
        # Models with higher confidence get more weight
        total_conf = code_conf + bytecode_conf + behavior_conf
        
        if total_conf > 0:
            effective_code = base_weights.code_analyzer * (code_conf / total_conf) * 3
            effective_bytecode = base_weights.bytecode_detector * (bytecode_conf / total_conf) * 3
            effective_behavior = base_weights.behavior_model * (behavior_conf / total_conf) * 3
            
            # Normalize to sum to 1.0
            total_effective = effective_code + effective_bytecode + effective_behavior
            
            if total_effective > 0:
                return ModelWeights(
                    code_analyzer=effective_code / total_effective,
                    bytecode_detector=effective_bytecode / total_effective,
                    behavior_model=effective_behavior / total_effective
                )
        
        # Fallback to base weights if confidence calculation fails
        return self.weights
    
    def _determine_risk_level(self, score: float) -> str:
        """Convert numerical score to risk level"""
        
        if score >= 0.8:
            return "critical"
        elif score >= 0.6:
            return "high" 
        elif score >= 0.4:
            return "medium"
        elif score >= 0.2:
            return "low"
        else:
            return "very_low"
    
    def _generate_explanation(self, code_score: float, bytecode_score: float, 
                            behavior_score: float, weights: ModelWeights, 
                            risk_level: str) -> str:
        """Generate human-readable explanation of the aggregation"""
        
        explanations = []
        
        # Code analysis contribution
        if code_score > 0.5:
            explanations.append(f"Code analysis detected significant risks ({code_score:.1%})")
        elif code_score > 0.2:
            explanations.append(f"Code analysis found some concerns ({code_score:.1%})")
        
        # Bytecode analysis contribution  
        if bytecode_score > 0.5:
            explanations.append(f"Bytecode patterns indicate potential issues ({bytecode_score:.1%})")
        elif bytecode_score > 0.2:
            explanations.append(f"Bytecode analysis shows minor concerns ({bytecode_score:.1%})")
        
        # Behavior analysis contribution
        if behavior_score > 0.5:
            explanations.append(f"Behavior patterns suggest suspicious activity ({behavior_score:.1%})")
        elif behavior_score > 0.2:
            explanations.append(f"Behavior analysis indicates some anomalies ({behavior_score:.1%})")
        
        if not explanations:
            explanations.append("All models indicate low risk levels")
        
        # Add weighting information
        weight_info = []
        if weights.code_analyzer > 0.35:
            weight_info.append("code analysis was most influential")
        if weights.bytecode_detector > 0.35:
            weight_info.append("bytecode patterns were most influential") 
        if weights.behavior_model > 0.35:
            weight_info.append("behavior analysis was most influential")
        
        if weight_info:
            explanations.append("Based on model confidence, " + " and ".join(weight_info))
        
        return ". ".join(explanations) + f" Overall risk level: {risk_level}."
    
    def _generate_recommendations(self, risk_level: str) -> List[str]:
        """Generate recommendations based on risk level"""
        
        if risk_level == "critical":
            return [
                "Immediate intervention required",
                "Block all interactions with this contract",
                "Notify security team immediately"
            ]
        elif risk_level == "high":
            return [
                "High risk detected - review required",
                "Limit interactions until further analysis",
                "Monitor for suspicious activity"
            ]
        elif risk_level == "medium":
            return [
                "Moderate risk - proceed with caution",
                "Review contract details before significant interactions",
                "Monitor for changes in risk profile"
            ]
        elif risk_level == "low":
            return [
                "Low risk - normal operations acceptable",
                "Continue standard monitoring procedures",
                "Review if risk profile changes"
            ]
        else:  # very_low
            return [
                "Very low risk - safe to interact",
                "Maintain standard security practices",
                "No immediate action needed"
            ]
    
    def write_to_blockchain(self, contract_address: str, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Write analysis results to the blockchain using the smart contract
        
        Args:
            contract_address: The contract address being analyzed
            analysis_result: The aggregated analysis result to store
            
        Returns:
            Dictionary with blockchain write status and transaction details
        """
        
        if not self.smart_contract_client:
            logger.warning("Smart contract client not available - blockchain writes disabled")
            return {
                "success": False,
                "error": "Smart contract client not available",
                "transaction_hash": None
            }
        
        if not self.smart_contract_client.is_connected():
            logger.warning("Smart contract client not connected to blockchain")
            return {
                "success": False,
                "error": "Blockchain connection not available",
                "transaction_hash": None
            }
        
        try:
            # Format the risk score for blockchain storage
            formatted_score = self.smart_contract_client.format_risk_score(analysis_result)
            
            # Write to blockchain
            tx_hash = self.smart_contract_client.write_risk_score(
                contract_address=contract_address,
                risk_score=formatted_score["risk_score"],
                risk_level=formatted_score["risk_level"],
                confidence=formatted_score["confidence"]
            )
            
            logger.info(f"Successfully wrote risk score to blockchain for {contract_address}")
            logger.info(f"Transaction hash: {tx_hash}")
            
            return {
                "success": True,
                "transaction_hash": tx_hash,
                "contract_address": contract_address,
                "risk_score": formatted_score["risk_score"],
                "risk_level": formatted_score["risk_level"]
            }
            
        except Exception as e:
            logger.error(f"Failed to write to blockchain: {e}")
            return {
                "success": False,
                "error": str(e),
                "transaction_hash": None
            }

def create_sample_model_outputs() -> Dict[str, Dict]:
    """Create sample model outputs for testing"""
    
    return {
        "code_analysis": {
            "risk_score": 0.85,
            "confidence": 0.92,
            "vulnerabilities": ["reentrancy", "access_control"],
            "processing_time_ms": 45
        },
        "bytecode_analysis": {
            "risk_score": 0.72, 
            "confidence": 0.88,
            "detected_patterns": ["hidden_owner", "selfdestruct"],
            "processing_time_ms": 28
        },
        "behavior_analysis": {
            "behavior_score": 0.68,
            "anomaly_score": 0.82,
            "detected_patterns": ["drainer", "unusual_approvals"],
            "processing_time_ms": 75
        }
    }

if __name__ == "__main__":
    # Simple demonstration
    aggregator = ResultAggregator()
    
    # Test with sample data
    sample_outputs = create_sample_model_outputs()
    result = aggregator.aggregate(sample_outputs)
    
    print("=== Model Aggregator Demo ===\n")
    print("Input Model Outputs:")
    for model_name, output in sample_outputs.items():
        print(f"  {model_name}: risk_score={output['risk_score']}, confidence={output['confidence']}")
    
    print("\nAggregated Result:")
    print(f"Final Risk Score: {result['final_risk_score']}")
    print(f"Risk Level: {result['risk_level']}")
    print(f"Overall Confidence: {result['overall_confidence']}")
    print(f"Explanation: {result['explanation']}")
    
    print("\nModel Contributions:")
    for model_name, contrib in result['model_contributions'].items():
        print(f"  {model_name}: score={contrib['score']}, confidence={contrib['confidence']}, weight={contrib['weight']}")
    
    print("\nRecommendations:")
    for i, rec in enumerate(result['recommendations'], 1):
        print(f"  {i}. {rec}")