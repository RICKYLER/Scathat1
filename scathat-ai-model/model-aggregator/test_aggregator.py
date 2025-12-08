#!/usr/bin/env python3
"""
Test Script for Model Aggregator - Simple demonstration of weighted scoring
"""

import json
from model_aggregator import ResultAggregator, create_sample_model_outputs

def test_basic_aggregation():
    """Test basic aggregation functionality"""
    
    print("=== Testing Basic Aggregation ===\n")
    
    aggregator = ResultAggregator()
    
    # Test case 1: High risk scenario
    print("1. High Risk Scenario:")
    high_risk_outputs = {
        "code_analysis": {"risk_score": 0.92, "confidence": 0.95},
        "bytecode_analysis": {"risk_score": 0.88, "confidence": 0.90}, 
        "behavior_analysis": {"behavior_score": 0.85, "anomaly_score": 0.88}
    }
    
    result = aggregator.aggregate(high_risk_outputs)
    print(f"   Final Score: {result['final_risk_score']} ({result['risk_level']})")
    print(f"   Explanation: {result['explanation']}")
    
    # Test case 2: Mixed risk scenario
    print("\n2. Mixed Risk Scenario:")
    mixed_risk_outputs = {
        "code_analysis": {"risk_score": 0.75, "confidence": 0.85},
        "bytecode_analysis": {"risk_score": 0.45, "confidence": 0.80},
        "behavior_analysis": {"behavior_score": 0.30, "anomaly_score": 0.75}
    }
    
    result = aggregator.aggregate(mixed_risk_outputs)
    print(f"   Final Score: {result['final_risk_score']} ({result['risk_level']})")
    print(f"   Explanation: {result['explanation']}")
    
    # Test case 3: Low risk scenario
    print("\n3. Low Risk Scenario:")
    low_risk_outputs = {
        "code_analysis": {"risk_score": 0.15, "confidence": 0.90},
        "bytecode_analysis": {"risk_score": 0.20, "confidence": 0.85},
        "behavior_analysis": {"behavior_score": 0.10, "anomaly_score": 0.80}
    }
    
    result = aggregator.aggregate(low_risk_outputs)
    print(f"   Final Score: {result['final_risk_score']} ({result['risk_level']})")
    print(f"   Explanation: {result['explanation']}")

def test_confidence_weighting():
    """Test confidence-based weighting"""
    
    print("\n=== Testing Confidence Weighting ===\n")
    
    aggregator = ResultAggregator()
    
    # Same scores, different confidences
    outputs_low_conf = {
        "code_analysis": {"risk_score": 0.80, "confidence": 0.60},  # Lower confidence
        "bytecode_analysis": {"risk_score": 0.80, "confidence": 0.90},  # Higher confidence
        "behavior_analysis": {"behavior_score": 0.80, "anomaly_score": 0.70}
    }
    
    outputs_high_conf = {
        "code_analysis": {"risk_score": 0.80, "confidence": 0.95},  # Higher confidence
        "bytecode_analysis": {"risk_score": 0.80, "confidence": 0.85},
        "behavior_analysis": {"behavior_score": 0.80, "anomaly_score": 0.90}
    }
    
    result_low = aggregator.aggregate(outputs_low_conf)
    result_high = aggregator.aggregate(outputs_high_conf)
    
    print("Same scores, different confidences:")
    print(f"Low confidence result: {result_low['final_risk_score']} (conf: {result_low['overall_confidence']})")
    print(f"High confidence result: {result_high['final_risk_score']} (conf: {result_high['overall_confidence']})")
    
    # Show weight differences
    print("\nWeight distribution (low confidence case):")
    for model, contrib in result_low['model_contributions'].items():
        print(f"  {model}: weight={contrib['weight']:.3f}")

def test_edge_cases():
    """Test edge cases and error handling"""
    
    print("\n=== Testing Edge Cases ===\n")
    
    aggregator = ResultAggregator()
    
    # Missing model outputs
    print("1. Missing model outputs:")
    partial_outputs = {
        "code_analysis": {"risk_score": 0.70, "confidence": 0.85},
        "behavior_analysis": {"behavior_score": 0.60, "anomaly_score": 0.80}
        # bytecode_analysis missing
    }
    
    result = aggregator.aggregate(partial_outputs)
    print(f"   Result: {result['final_risk_score']} ({result['risk_level']})")
    
    # Very low confidence
    print("\n2. Very low confidence:")
    low_conf_outputs = {
        "code_analysis": {"risk_score": 0.90, "confidence": 0.20},
        "bytecode_analysis": {"risk_score": 0.10, "confidence": 0.25},
        "behavior_analysis": {"behavior_score": 0.80, "anomaly_score": 0.15}
    }
    
    result = aggregator.aggregate(low_conf_outputs)
    print(f"   Result: {result['final_risk_score']} ({result['risk_level']})")
    print(f"   Overall confidence: {result['overall_confidence']}")

def demonstrate_weighted_scoring():
    """Demonstrate the weighted scoring system"""
    
    print("\n=== Weighted Scoring System Demonstration ===\n")
    
    print("Base Weights:")
    print("- Code Analyzer: 40%")
    print("- Bytecode Detector: 30%")
    print("- Behavior Model: 30%")
    print("\nConfidence Adjustment:")
    print("- Models with higher confidence get more weight")
    print("- Dynamic weighting based on input characteristics")
    print("- Normalized to ensure weights sum to 1.0")
    
    print("\nRisk Level Classification:")
    print("- Critical: ≥ 0.8")
    print("- High: 0.6 - 0.8") 
    print("- Medium: 0.4 - 0.6")
    print("- Low: 0.2 - 0.4")
    print("- Very Low: < 0.2")

def main():
    """Main test function"""
    
    print("Model Aggregator - Weighted Scoring System")
    print("=" * 50)
    
    # Run all tests
    test_basic_aggregation()
    test_confidence_weighting()
    test_edge_cases()
    demonstrate_weighted_scoring()
    
    # Show sample usage
    print("\n" + "=" * 50)
    print("Sample Usage:")
    
    aggregator = ResultAggregator()
    sample_outputs = create_sample_model_outputs()
    result = aggregator.aggregate(sample_outputs)
    
    print(f"Final Risk Score: {result['final_risk_score']}")
    print(f"Risk Level: {result['risk_level']}")
    print(f"Explanation: {result['explanation']}")
    
    print("\n" + "=" * 50)
    print("Test completed successfully!")
    print("\nKey Features Demonstrated:")
    print("- Weighted scoring system (40%/30%/30% base weights)")
    print("- Confidence-based dynamic weighting")
    print("- Risk level classification")
    print("- Human-readable explanations")
    print("- Actionable recommendations")

if __name__ == "__main__":
    main()