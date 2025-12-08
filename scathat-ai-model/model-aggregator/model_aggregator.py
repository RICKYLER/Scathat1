#!/usr/bin/env python3
"""
Model Aggregator - Simple Weighted Scoring System
Combines outputs from Code Analyzer, Bytecode Detector, and Behavior Model
"""

from typing import Dict, List, Any
from dataclasses import dataclass

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