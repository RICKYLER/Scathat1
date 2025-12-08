#!/usr/bin/env python3
"""
Test Script for Behavior Model - Simple demonstration of behavior analysis
"""

import json
import os
from behavior_analyzer import BehaviorAnalyzer, load_behavior_data
from sample_datasets import create_sample_datasets

def test_basic_analysis():
    """Test basic behavior analysis with manual data"""
    
    print("=== Testing Basic Behavior Analysis ===\n")
    
    analyzer = BehaviorAnalyzer()
    
    # Add some suspicious transactions (drainer pattern)
    from behavior_analyzer import Transaction
    
    # Pattern: Rapid successive transactions to same address
    base_time = 1700000000
    
    analyzer.add_transaction(Transaction(
        hash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        from_address="0xuser1111111111111111111111111111111111111111",
        to_address="0xdrainer22222222222222222222222222222222222222",
        value=0.001,  # Small test
        gas_used=21000,
        gas_price=20,
        timestamp=base_time,
        status="success"
    ))
    
    analyzer.add_transaction(Transaction(
        hash="0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        from_address="0xuser1111111111111111111111111111111111111111", 
        to_address="0xdrainer22222222222222222222222222222222222222",
        value=2.5,  # Large drain
        gas_used=21000,
        gas_price=20,
        timestamp=base_time + 60,  # 1 minute later
        status="success"
    ))
    
    # Run analysis
    results = analyzer.analyze_all()
    
    print("Analysis Results:")
    print(json.dumps(results, indent=2))
    print()
    
    return results

def test_with_sample_datasets():
    """Test with generated sample datasets"""
    
    print("=== Testing with Sample Datasets ===\n")
    
    # Create sample datasets
    datasets = create_sample_datasets()
    
    for dataset in datasets:
        print(f"\n--- Analyzing {dataset['label']} behavior ---")
        print(f"Description: {dataset['description']}")
        
        analyzer = BehaviorAnalyzer()
        
        # Load data from dataset
        for tx_data in dataset['transactions']:
            from behavior_analyzer import Transaction
            tx = Transaction(
                hash=tx_data.get('hash', ''),
                from_address=tx_data.get('from', ''),
                to_address=tx_data.get('to', ''),
                value=tx_data.get('value', 0),
                gas_used=tx_data.get('gas_used', 0),
                gas_price=tx_data.get('gas_price', 0),
                timestamp=tx_data.get('timestamp', 0),
                status=tx_data.get('status', 'success')
            )
            analyzer.add_transaction(tx)
        
        for approval_data in dataset['approvals']:
            from behavior_analyzer import Approval
            approval = Approval(
                owner=approval_data.get('owner', ''),
                spender=approval_data.get('spender', ''),
                value=approval_data.get('value', 0),
                token_address=approval_data.get('token_address', ''),
                timestamp=approval_data.get('timestamp', 0)
            )
            analyzer.add_approval(approval)
        
        # Run targeted analysis
        if dataset['label'] == 'drainer':
            result = analyzer.analyze_drainer_patterns()
            print(f"Drainer detection confidence: {result['confidence']:.3f}")
            
        elif dataset['label'] == 'honeypot':
            result = analyzer.analyze_honeypot_patterns()
            print(f"Honeypot detection confidence: {result['confidence']:.3f}")
            
        elif dataset['label'] == 'flashloan':
            result = analyzer.analyze_flashloan_patterns()
            print(f"Flashloan detection confidence: {result['confidence']:.3f}")
            
        elif dataset['label'] == 'phishing':
            result = analyzer.analyze_phishing_patterns()
            print(f"Phishing detection confidence: {result['confidence']:.3f}")
            
        else:  # safe
            # For safe behavior, all confidences should be low
            drainer_conf = analyzer.analyze_drainer_patterns()['confidence']
            honeypot_conf = analyzer.analyze_honeypot_patterns()['confidence']
            phishing_conf = analyzer.analyze_phishing_patterns()['confidence']
            
            print(f"Drainer confidence: {drainer_conf:.3f} (should be low)")
            print(f"Honeypot confidence: {honeypot_conf:.3f} (should be low)")
            print(f"Phishing confidence: {phishing_conf:.3f} (should be low)")

def demonstrate_pattern_detection():
    """Demonstrate specific pattern detection capabilities"""
    
    print("\n=== Pattern Detection Demonstration ===\n")
    
    # Test 1: Drainer pattern detection
    print("1. Drainer Pattern Detection:")
    print("   - Rapid successive transactions")
    print("   - Small test followed by large drain")
    print("   - Failed transactions before success")
    
    # Test 2: Honeypot pattern detection  
    print("\n2. Honeypot Pattern Detection:")
    print("   - Unlimited token approvals")
    print("   - Approvals to suspicious addresses")
    print("   - Rapid approval changes")
    
    # Test 3: Flashloan pattern detection
    print("\n3. Flashloan Pattern Detection:")
    print("   - Large borrow/repay within short timeframe")
    print("   - High gas usage transactions")
    print("   - Complex arbitrage patterns")
    
    # Test 4: Phishing pattern detection
    print("\n4. Phishing Pattern Detection:")
    print("   - Test transactions followed by larger ones")
    print("   - Transactions to known phishing addresses")
    print("   - Multiple victims pattern (campaign)")

def main():
    """Main test function"""
    
    print("Behavior Model - Simple Demonstration")
    print("=" * 50)
    
    # Create sample data directory
    os.makedirs("sample_data", exist_ok=True)
    
    # Run tests
    test_basic_analysis()
    test_with_sample_datasets()
    demonstrate_pattern_detection()
    
    print("\n" + "=" * 50)
    print("Test completed successfully!")
    print("\nKey Features Demonstrated:")
    print("- Transaction pattern analysis")
    print("- Transfer history processing") 
    print("- Approval event monitoring")
    print("- Internal transaction analysis")
    print("- Drainer, honeypot, flashloan, and phishing detection")
    print("- Simple confidence-based scoring")

if __name__ == "__main__":
    main()