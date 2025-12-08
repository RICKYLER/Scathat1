#!/usr/bin/env python3
"""
Bytecode tokenizer and preprocessing module
Converts Ethereum bytecode to token sequences for ML models
"""

import re
from typing import List, Dict

# EVM opcode mappings (simplified for demonstration)
OPCODES = {
    '00': 'STOP', '01': 'ADD', '02': 'MUL', '03': 'SUB', '04': 'DIV',
    '05': 'SDIV', '06': 'MOD', '07': 'SMOD', '08': 'ADDMOD', '09': 'MULMOD',
    '10': 'EXP', '11': 'SIGNEXTEND', '20': 'SHA3', '30': 'ADDRESS',
    '31': 'BALANCE', '32': 'ORIGIN', '33': 'CALLER', '34': 'CALLVALUE',
    '35': 'CALLDATALOAD', '36': 'CALLDATASIZE', '37': 'CALLDATACOPY',
    '38': 'CODESIZE', '39': 'CODECOPY', '40': 'GASPRICE', '41': 'EXTCODESIZE',
    '42': 'EXTCODECOPY', '50': 'BLOCKHASH', '51': 'COINBASE', '52': 'TIMESTAMP',
    '53': 'NUMBER', '54': 'DIFFICULTY', '55': 'GASLIMIT', '56': 'CHAINID',
    '57': 'SELFBALANCE', '58': 'BASEFEE', '60': 'PUSH1', '61': 'PUSH2',
    '80': 'DUP1', '81': 'DUP2', '90': 'SWAP1', '91': 'SWAP2',
    'F0': 'CREATE', 'F1': 'CALL', 'F2': 'CALLCODE', 'F3': 'RETURN',
    'F4': 'DELEGATECALL', 'F5': 'CREATE2', 'FA': 'STATICCALL',
    'FD': 'REVERT', 'FE': 'INVALID', 'FF': 'SELFDESTRUCT'
}

# Security-sensitive opcodes for vulnerability detection
RISKY_OPCODES = {
    'DELEGATECALL', 'CALLCODE', 'SELFDESTRUCT', 'CREATE', 'CREATE2',
    'CALL', 'STATICCALL', 'SSTORE', 'SLOAD', 'JUMP', 'JUMPI'
}

def preprocess_bytecode(bytecode: str) -> str:
    """
    Preprocess raw bytecode by removing metadata and standardizing format
    
    Args:
        bytecode: Raw Ethereum bytecode string (with 0x prefix)
    
    Returns:
        Cleaned bytecode string
    """
    if bytecode.startswith('0x'):
        bytecode = bytecode[2:]
    
    # Remove metadata (commonly appended after contract code)
    # This is a simple heuristic - real implementation would be more robust
    bytecode = re.sub(r'a165627a7a72.*$', '', bytecode, flags=re.IGNORECASE)
    bytecode = re.sub(r'646576656c6f706572.*$', '', bytecode, flags=re.IGNORECASE)
    
    return bytecode.upper()

def tokenize_bytecode(bytecode: str) -> List[str]:
    """
    Convert bytecode to sequence of opcode tokens
    
    Args:
        bytecode: Preprocessed bytecode string
    
    Returns:
        List of opcode tokens
    """
    tokens = []
    i = 0
    
    while i < len(bytecode):
        if i + 2 <= len(bytecode):
            opcode_hex = bytecode[i:i+2]
            
            if opcode_hex in OPCODES:
                tokens.append(OPCODES[opcode_hex])
                i += 2
            elif opcode_hex.startswith('6'):  # PUSH operations
                # PUSH1 through PUSH32
                push_length = int(opcode_hex[1], 16) + 1
                tokens.append(f"PUSH{push_length}")
                # Skip the push data
                i += 2 + (push_length * 2)
            else:
                # Unknown opcode or data, skip
                i += 2
        else:
            # Incomplete byte, skip
            i += 1
    
    return tokens

def extract_features(tokens: List[str]) -> Dict:
    """
    Extract features from token sequence for ML model
    
    Args:
        tokens: List of opcode tokens
    
    Returns:
        Dictionary of extracted features
    """
    features = {
        'total_ops': len(tokens),
        'unique_ops': len(set(tokens)),
        'risky_ops_count': sum(1 for token in tokens if token in RISKY_OPCODES),
        'risky_ops_ratio': 0,
        'opcode_frequency': {},
        'sequence_patterns': []
    }
    
    if features['total_ops'] > 0:
        features['risky_ops_ratio'] = features['risky_ops_count'] / features['total_ops']
    
    # Count opcode frequencies
    for token in tokens:
        features['opcode_frequency'][token] = features['opcode_frequency'].get(token, 0) + 1
    
    # Detect common vulnerability patterns
    features['sequence_patterns'] = detect_vulnerability_patterns(tokens)
    
    return features

def detect_vulnerability_patterns(tokens: List[str]) -> List[Dict]:
    """
    Detect known vulnerability patterns in opcode sequences
    
    Args:
        tokens: List of opcode tokens
    
    Returns:
        List of detected patterns with confidence scores
    """
    patterns = []
    
    # Pattern 1: SELFDESTRUCT without proper access control
    if 'SELFDESTRUCT' in tokens:
        # Check if there's access control before SELFDESTRUCT
        has_access_control = any(token in ['CALLER', 'ORIGIN', 'EQ', 'ISZERO'] 
                               for token in tokens[:tokens.index('SELFDESTRUCT')])
        
        patterns.append({
            'pattern_type': 'selfdestruct_without_access_control',
            'confidence': 0.8 if not has_access_control else 0.2,
            'description': 'SELFDESTRUCT opcode detected with potentially insufficient access control'
        })
    
    # Pattern 2: DELEGATECALL patterns (common in proxy vulnerabilities)
    delegatecall_indices = [i for i, token in enumerate(tokens) if token == 'DELEGATECALL']
    for idx in delegatecall_indices:
        # Check if delegatecall uses arbitrary storage
        context = tokens[max(0, idx-10):min(len(tokens), idx+10)]
        has_arbitrary_storage = any(token in ['SLOAD', 'SSTORE'] for token in context)
        
        patterns.append({
            'pattern_type': 'delegatecall_arbitrary_storage',
            'confidence': 0.7 if has_arbitrary_storage else 0.3,
            'description': 'DELEGATECALL with potential arbitrary storage access'
        })
    
    # Pattern 3: Reentrancy patterns (CALL followed by state changes)
    call_indices = [i for i, token in enumerate(tokens) if token in ['CALL', 'CALLCODE', 'STATICCALL']]
    for idx in call_indices:
        # Check if state changes happen after call
        subsequent_ops = tokens[idx+1:min(len(tokens), idx+20)]
        has_state_changes = any(token in ['SSTORE', 'SELFDESTRUCT'] for token in subsequent_ops)
        
        patterns.append({
            'pattern_type': 'potential_reentrancy',
            'confidence': 0.6 if has_state_changes else 0.2,
            'description': 'External call followed by state changes (potential reentrancy)'
        })
    
    return patterns

if __name__ == "__main__":
    # Example usage
    sample_bytecode = "0x608060405234801561001057600080fd5b5060..."
    
    print("Preprocessing bytecode...")
    cleaned = preprocess_bytecode(sample_bytecode)
    
    print("Tokenizing...")
    tokens = tokenize_bytecode(cleaned)
    print(f"Extracted {len(tokens)} tokens")
    
    print("Extracting features...")
    features = extract_features(tokens)
    print(f"Features: {features}")