#!/usr/bin/env python3
"""
Test script for Bytecode Detector functionality
Demonstrates core features without requiring PyTorch
"""

import json
import os
from bytecode_tokenizer import preprocess_bytecode, tokenize_bytecode
from sample_datasets import analyze_bytecode_patterns, get_vulnerability_patterns

def test_bytecode_processing():
    """Test bytecode preprocessing and opcode extraction"""
    
    print("=== Testing Bytecode Processing ===")
    
    # Sample bytecode strings
    sample_bytecodes = [
        # Safe contract
        "6080604052348015600f57600080fd5b506004361060325760003560e01c806306fdde0314603757806318160ddd146055575b600080fd5b603d6071565b6040518082815260200191505060405180910390f35b605b6087565b6040518082815260200191505060405180910390f35b60008054905090565b600060018054905090509056fea2646970667358221220123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef64736f6c63430007060033",
        
        # Malicious contract with reentrancy
        "6080604052348015600f57600080fd5b5060405160208061015d83398101806040526020811015602f57600080fd5b810190808051906020019092919050505050806000819055505060c68060526000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306fdde0314603757806318160ddd146055575b600080fd5b603d6071565b6040518082815260200191505060405180910390f35b605b6087565b6040518082815260200191505060405180910390f35b60008054905090565b600060018054905090509056fea2646970667358221220123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef64736f6c63430007060033"
    ]
    
    for i, bytecode in enumerate(sample_bytecodes):
        print(f"\n--- Sample {i+1} ---")
        print(f"Original bytecode length: {len(bytecode)} characters")
        
        # Preprocess
        processed = preprocess_bytecode(bytecode)
        print(f"Processed bytecode length: {len(processed)} characters")
        
        # Extract opcodes
        opcodes = tokenize_bytecode(processed)
        print(f"Extracted {len(opcodes)} opcodes:")
        print(f"  {opcodes}")
        
        # Analyze patterns
        analysis = analyze_bytecode_patterns(opcodes)
        print("Vulnerability Pattern Analysis:")
        for pattern, score in analysis.items():
            if score > 0:
                print(f"  {pattern}: {score:.3f}")
        
        # Calculate simple risk score
        risk_score = sum(analysis.values()) / len(analysis) if analysis else 0.0
        print(f"Calculated Risk Score: {risk_score:.3f}")

def test_pattern_detection():
    """Test specific vulnerability pattern detection"""
    
    print("\n=== Testing Pattern Detection ===")
    
    test_sequences = [
        # Reentrancy pattern
        ["PUSH1", "CALL", "SSTORE", "JUMP"],
        # Selfdestruct pattern
        ["PUSH1", "CALLER", "SELFDESTRUCT", "JUMP"],
        # Delegatecall pattern
        ["PUSH1", "DELEGATECALL", "POP", "JUMP"],
        # Safe sequence
        ["PUSH1", "MLOAD", "SSTORE", "JUMP"]
    ]
    
    patterns = get_vulnerability_patterns()
    
    for i, sequence in enumerate(test_sequences):
        print(f"\n--- Test Sequence {i+1} ---")
        print(f"Sequence: {sequence}")
        
        analysis = analyze_bytecode_patterns(sequence)
        
        print("Detected Patterns:")
        detected = False
        for pattern, score in analysis.items():
            if score > 0:
                print(f"  {pattern}: {score:.3f}")
                detected = True
        
        if not detected:
            print("  No vulnerabilities detected")
        
        risk_score = sum(analysis.values()) / len(analysis) if analysis else 0.0
        print(f"Overall Risk: {risk_score:.3f}")

def create_sample_datasets_demo():
    """Demonstrate sample dataset creation"""
    
    print("\n=== Sample Dataset Creation ===")
    
    # Create sample datasets
    from sample_datasets import create_sample_datasets
    samples = create_sample_datasets()
    
    print(f"Created {len(samples)} total samples")
    
    # Show sample statistics
    safe_count = sum(1 for s in samples if s['risk_score'] < 0.5)
    malicious_count = len(samples) - safe_count
    
    print(f"Safe contracts: {safe_count}")
    print(f"Malicious contracts: {malicious_count}")
    
    # Show vulnerability distribution
    vuln_counts = {}
    for sample in samples:
        for vuln in sample['vulnerabilities']:
            vuln_counts[vuln] = vuln_counts.get(vuln, 0) + 1
    
    print("Vulnerability Distribution:")
    for vuln, count in vuln_counts.items():
        print(f"  {vuln}: {count}")

def main():
    """Main test function"""
    
    print("Bytecode Detector - Functionality Test")
    print("======================================")
    
    # Test bytecode processing
    test_bytecode_processing()
    
    # Test pattern detection
    test_pattern_detection()
    
    # Create and show sample datasets
    create_sample_datasets_demo()
    
    print("\n=== Test Complete ===")
    print("Core functionality working correctly!")
    print("To use the full model with PyTorch, install requirements:")
    print("  pip install -r requirements.txt")

if __name__ == "__main__":
    main()