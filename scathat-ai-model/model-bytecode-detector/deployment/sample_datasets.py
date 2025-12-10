#!/usr/bin/env python3
"""
Sample bytecode datasets for training the bytecode detector model
Contains both safe and malicious contract bytecode patterns
"""

import json
import os
from typing import List, Dict, Any

def create_sample_datasets():
    """Create sample datasets for bytecode analysis training"""
    
    # Sample safe bytecode patterns
    safe_bytecode_samples = [
        {
            "bytecode": "6080604052348015600f57600080fd5b506004361060325760003560e01c806306fdde0314603757806318160ddd146055575b600080fd5b603d6071565b6040518082815260200191505060405180910390f35b605b6087565b6040518082815260200191505060405180910390f35b60008054905090565b600060018054905090509056fea2646970667358221220123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef64736f6c63430007060033",
            "opcodes": ["PUSH1", "MLOAD", "CALLVALUE", "ISZERO", "PUSH2", "JUMPI", "PUSH1", "DUP1", "REVERT", "JUMPDEST", "POP", "PUSH1", "DUP1", "SSTORE", "POP", "JUMP"],
            "risk_score": 0.1,
            "vulnerabilities": [],
            "description": "Simple safe contract - basic storage operations"
        },
        {
            "bytecode": "6080604052348015600f57600080fd5b5060405160208061015d83398101806040526020811015602f57600080fd5b810190808051906020019092919050505050806000819055505060c68060526000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306fdde0314603757806318160ddd146055575b600080fd5b603d6071565b6040518082815260200191505060405180910390f35b605b6087565b6040518082815260200191505060405180910390f35b60008054905090565b600060018054905090509056fea2646970667358221220123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef64736f6c63430007060033",
            "opcodes": ["PUSH1", "MLOAD", "CALLVALUE", "ISZERO", "PUSH2", "JUMPI", "PUSH1", "DUP1", "REVERT", "JUMPDEST", "POP", "PUSH1", "DUP1", "SLOAD", "DUP2", "SWAP1", "SSTORE", "POP", "JUMP"],
            "risk_score": 0.2,
            "vulnerabilities": [],
            "description": "Safe contract with storage operations and validation"
        },
        {
            "bytecode": "6080604052348015600f57600080fd5b5060405160208061015d83398101806040526020811015602f57600080fd5b810190808051906020019092919050505050806000819055505060c68060526000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306fdde0314603757806318160ddd146055575b600080fd5b603d6071565b6040518082815260200191505060405180910390f35b605b6087565b6040518082815260200191505060405180910390f35b60008054905090565b600060018054905090509056fea2646970667358221220123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef64736f6c63430007060033",
            "opcodes": ["PUSH1", "MLOAD", "CALLVALUE", "ISZERO", "PUSH2", "JUMPI", "PUSH1", "DUP1", "REVERT", "JUMPDEST", "POP", "PUSH1", "DUP1", "CALLDATALOAD", "SWAP1", "POP", "PUSH1", "DUP2", "LT", "ISZERO", "PUSH2", "JUMPI", "PUSH1", "DUP1", "REVERT", "JUMPDEST", "POP", "JUMP"],
            "risk_score": 0.15,
            "vulnerabilities": [],
            "description": "Safe contract with input validation"
        }
    ]
    
    # Sample malicious bytecode patterns
    malicious_bytecode_samples = [
        {
            "bytecode": "6080604052348015600f57600080fd5b5060405160208061015d83398101806040526020811015602f57600080fd5b810190808051906020019092919050505050806000819055505060c68060526000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306fdde0314603757806318160ddd146055575b600080fd5b603d6071565b6040518082815260200191505060405180910390f35b605b6087565b6040518082815260200191505060405180910390f35b60008054905090565b600060018054905090509056fea2646970667358221220123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef64736f6c63430007060033",
            "opcodes": ["PUSH1", "CALLVALUE", "ISZERO", "PUSH2", "JUMPI", "PUSH1", "DUP1", "REVERT", "JUMPDEST", "POP", "PUSH1", "CALLER", "PUSH20", "AND", "PUSH20", "EQ", "PUSH2", "JUMPI", "PUSH1", "DUP1", "REVERT", "JUMPDEST", "POP", "PUSH1", "CALL", "GAS", "CALL", "POP", "JUMP"],
            "risk_score": 0.9,
            "vulnerabilities": ["reentrancy"],
            "description": "Reentrancy vulnerable contract - external call after state change"
        },
        {
            "bytecode": "6080604052348015600f57600080fd5b5060405160208061015d83398101806040526020811015602f57600080fd5b810190808051906020019092919050505050806000819055505060c68060526000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306fdde0314603757806318160ddd146055575b600080fd5b603d6071565b6040518082815260200191505060405180910390f35b605b6087565b6040518082815260200191505060405180910390f35b60008054905090565b600060018054905090509056fea2646970667358221220123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef64736f6c63430007060033",
            "opcodes": ["PUSH1", "MLOAD", "CALLVALUE", "ISZERO", "PUSH2", "JUMPI", "PUSH1", "DUP1", "REVERT", "JUMPDEST", "POP", "PUSH1", "CALLER", "PUSH20", "AND", "PUSH20", "EQ", "ISZERO", "PUSH2", "JUMPI", "PUSH1", "DUP1", "REVERT", "JUMPDEST", "POP", "PUSH1", "SELFDESTRUCT", "JUMP"],
            "risk_score": 0.95,
            "vulnerabilities": ["selfdestruct", "hidden_owner"],
            "description": "Hidden owner with selfdestruct capability"
        },
        {
            "bytecode": "6080604052348015600f57600080fd5b5060405160208061015d83398101806040526020811015602f57600080fd5b810190808051906020019092919050505050806000819055505060c68060526000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306fdde0314603757806318160ddd146055575b600080fd5b603d6071565b6040518082815260200191505060405180910390f35b605b6087565b6040518082815260200191505060405180910390f35b60008054905090565b600060018054905090509056fea2646970667358221220123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef64736f6c63430007060033",
            "opcodes": ["PUSH1", "MLOAD", "CALLVALUE", "ISZERO", "PUSH2", "JUMPI", "PUSH1", "DUP1", "REVERT", "JUMPDEST", "POP", "PUSH1", "DELEGATECALL", "GAS", "CALL", "POP", "PUSH1", "EXTCODESIZE", "ISZERO", "PUSH2", "JUMPI", "PUSH1", "DUP1", "REVERT", "JUMPDEST", "POP", "JUMP"],
            "risk_score": 0.85,
            "vulnerabilities": ["delegatecall"],
            "description": "Dangerous delegatecall usage without proper validation"
        },
        {
            "bytecode": "6080604052348015600f57600080fd5b5060405160208061015d83398101806040526020811015602f57600080fd5b810190808051906020019092919050505050806000819055505060c68060526000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306fdde0314603757806318160ddd146055575b600080fd5b603d6071565b6040518082815260200191505060405180910390f35b605b6087565b6040518082815260200191505060405180910390f35b60008054905090565b600060018054905090509056fea2646970667358221220123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef64736f6c63430007060033",
            "opcodes": ["PUSH1", "MLOAD", "CALLVALUE", "ISZERO", "PUSH2", "JUMPI", "PUSH1", "DUP1", "REVERT", "JUMPDEST", "POP", "PUSH8", "FFFFFFFFFFFFFFFF", "PUSH1", "SLOAD", "ADD", "PUSH1", "SSTORE", "POP", "JUMP"],
            "risk_score": 0.8,
            "vulnerabilities": ["integer_overflow"],
            "description": "Potential integer overflow in arithmetic operations"
        }
    ]
    
    # Create datasets directory if it doesn't exist
    os.makedirs("datasets", exist_ok=True)
    
    # Save safe samples
    with open("datasets/safe_bytecode.jsonl", "w") as f:
        for sample in safe_bytecode_samples:
            f.write(json.dumps(sample) + "\n")
    
    # Save malicious samples
    with open("datasets/malicious_bytecode.jsonl", "w") as f:
        for sample in malicious_bytecode_samples:
            f.write(json.dumps(sample) + "\n")
    
    # Create combined training dataset
    all_samples = safe_bytecode_samples + malicious_bytecode_samples
    
    with open("datasets/training_bytecode.jsonl", "w") as f:
        for sample in all_samples:
            f.write(json.dumps(sample) + "\n")
    
    print(f"Created {len(safe_bytecode_samples)} safe bytecode samples")
    print(f"Created {len(malicious_bytecode_samples)} malicious bytecode samples")
    print(f"Total {len(all_samples)} training samples")
    
    return all_samples

def load_training_data():
    """Load training data for model training"""
    
    sequences = []
    labels = []
    
    try:
        with open("datasets/training_bytecode.jsonl", "r") as f:
            for line in f:
                data = json.loads(line.strip())
                sequences.append(data["opcodes"])
                labels.append(data["risk_score"])
    except FileNotFoundError:
        print("Training data not found. Creating sample datasets...")
        all_samples = create_sample_datasets()
        for sample in all_samples:
            sequences.append(sample["opcodes"])
            labels.append(sample["risk_score"])
    
    return sequences, labels

def get_vulnerability_patterns():
    """Get common vulnerability patterns for pattern detection"""
    
    return {
        "reentrancy": ["CALL", "CALLCODE", "DELEGATECALL", "STATICCALL"],
        "selfdestruct": ["SELFDESTRUCT"],
        "delegatecall": ["DELEGATECALL"],
        "hidden_owner": ["CALLER", "ORIGIN", "ADDRESS", "BALANCE"],
        "integer_overflow": ["ADD", "MUL", "EXP", "SUB"],
        "gas_issues": ["EXP", "SHA3", "CREATE", "CREATE2"],
        "access_control": ["SLOAD", "SSTORE", "MLOAD", "MSTORE"]
    }

def analyze_bytecode_patterns(opcode_sequence: List[str]) -> Dict[str, float]:
    """Analyze bytecode for vulnerability patterns"""
    
    patterns = get_vulnerability_patterns()
    analysis = {}
    
    for pattern_name, pattern_ops in patterns.items():
        # Count occurrences of pattern opcodes
        count = sum(1 for op in opcode_sequence if op in pattern_ops)
        
        # Simple scoring based on occurrence count
        if count > 0:
            # Normalize score between 0.1 and 0.9 based on count
            score = min(0.1 + (count * 0.2), 0.9)
            analysis[pattern_name] = score
        else:
            analysis[pattern_name] = 0.0
    
    return analysis

if __name__ == "__main__":
    # Create sample datasets
    samples = create_sample_datasets()
    
    # Test pattern analysis
    test_sequence = ["PUSH1", "CALL", "SSTORE", "DELEGATECALL", "SELFDESTRUCT"]
    analysis = analyze_bytecode_patterns(test_sequence)
    
    print("\nPattern analysis test:")
    print(f"Sequence: {test_sequence}")
    print(f"Analysis: {analysis}")
    
    print("\nSample datasets created successfully!")