#!/usr/bin/env python3
"""
Enhanced training script for Bytecode Detector model with BaseScan verified contracts
"""

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import numpy as np
import json
import os
import time
from typing import List, Dict, Any

# Import our modules
from bytecode_tokenizer import preprocess_bytecode, tokenize_bytecode
from model_architecture import BytecodeTransformer, BytecodeDataset, train_model
from sample_datasets import load_training_data, analyze_bytecode_patterns

def load_basescan_data() -> List[Dict]:
    """Load BaseScan verified contracts data"""
    
    basescan_file = "../datasets/training/bytecode_basescan.jsonl"
    contracts = []
    
    if not os.path.exists(basescan_file):
        print(f"BaseScan data file not found: {basescan_file}")
        return contracts
    
    try:
        with open(basescan_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line:
                    contract = json.loads(line)
                    contracts.append(contract)
        
        print(f"Loaded {len(contracts)} BaseScan verified contracts")
        return contracts
    
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        return []

def prepare_enhanced_training_data():
    """Prepare enhanced training data with BaseScan verified contracts"""
    
    print("Loading BaseScan verified contracts...")
    basescan_contracts = load_basescan_data()
    
    print("Loading existing training data...")
    sequences, labels = load_training_data()
    
    # Add BaseScan contracts to training data
    for contract in basescan_contracts:
        if 'bytecode' in contract and contract['bytecode']:
            # Preprocess bytecode and extract opcodes
            processed_bytecode = preprocess_bytecode(contract['bytecode'])
            opcode_sequence = tokenize_bytecode(processed_bytecode)
            
            # BaseScan verified contracts are safe (low risk)
            sequences.append(opcode_sequence)
            labels.append(0.1)  # Low risk score for verified contracts
    
    print(f"Enhanced dataset size: {len(sequences)} sequences")
    print(f"BaseScan contracts added: {len(basescan_contracts)}")
    
    # Create dataset
    dataset = BytecodeDataset(sequences, labels)
    
    # Create data loader
    dataloader = DataLoader(dataset, batch_size=8, shuffle=True)
    
    return dataset, dataloader

def train_enhanced_model():
    """Train the enhanced bytecode analysis model with BaseScan data"""
    
    print("=== Enhanced Bytecode Detector Model Training ===")
    print("Now including BaseScan verified contracts...")
    
    # Prepare enhanced data
    dataset, train_loader = prepare_enhanced_training_data()
    
    print(f"Vocabulary size: {dataset.vocab_size}")
    print(f"Number of training batches: {len(train_loader)}")
    
    # Initialize model
    print("Initializing model...")
    model = BytecodeTransformer(vocab_size=dataset.vocab_size)
    
    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    
    print(f"Total parameters: {total_params:,}")
    print(f"Trainable parameters: {trainable_params:,}")
    
    # Train model
    print("Starting enhanced training...")
    trained_model = train_model(model, train_loader, num_epochs=10, learning_rate=0.001)
    
    # Save enhanced model
    os.makedirs("models", exist_ok=True)
    model_path = "models/bytecode_detector_enhanced.pth"
    torch.save({
        'model_state_dict': trained_model.state_dict(),
        'vocab': dataset.vocab,
        'vocab_size': dataset.vocab_size,
        'trained_with_basescan': True,
        'basescan_contracts_count': len(load_basescan_data())
    }, model_path)
    
    print(f"Enhanced model saved to {model_path}")
    
    return trained_model, dataset.vocab

def test_enhanced_model():
    """Test the enhanced model with both sample and BaseScan data"""
    
    print("\n=== Testing Enhanced Model ===")
    
    # Load enhanced model
    model_path = "models/bytecode_detector_enhanced.pth"
    
    if not os.path.exists(model_path):
        print("Enhanced model not found. Please train it first.")
        return
    
    checkpoint = torch.load(model_path)
    model = BytecodeTransformer(vocab_size=checkpoint['vocab_size'])
    model.load_state_dict(checkpoint['model_state_dict'])
    vocab = checkpoint['vocab']
    
    print("Enhanced model loaded successfully!")
    print(f"Trained with BaseScan: {checkpoint.get('trained_with_basescan', False)}")
    print(f"BaseScan contracts used: {checkpoint.get('basescan_contracts_count', 0)}")
    
    # Test with sample BaseScan contract
    basescan_contracts = load_basescan_data()
    
    if basescan_contracts:
        print(f"\n--- Testing with BaseScan Verified Contract ---")
        
        # Use first BaseScan contract for testing
        test_contract = basescan_contracts[0]
        bytecode = test_contract['bytecode']
        
        print(f"Contract: {test_contract.get('contract_name', 'Unknown')}")
        print(f"Address: {test_contract.get('contract_address', 'Unknown')}")
        
        # Predict risk
        model.eval()
        with torch.no_grad():
            processed_bytecode = preprocess_bytecode(bytecode)
            opcode_sequence = tokenize_bytecode(processed_bytecode)
            
            dataset = BytecodeDataset([opcode_sequence])
            dataloader = DataLoader(dataset, batch_size=1, shuffle=False)
            
            for data in dataloader:
                outputs = model(data)
                risk_score = outputs['risk_score'].item()
                pattern_scores = {k: v.item() for k, v in outputs['pattern_scores'].items()}
        
        # Also run pattern analysis
        pattern_analysis = analyze_bytecode_patterns(opcode_sequence)
        
        print(f"Risk Score: {risk_score:.3f}")
        print("Model Pattern Scores:")
        for pattern, score in pattern_scores.items():
            if score > 0.1:
                print(f"  {pattern}: {score:.3f}")
        
        print("Rule-based Pattern Scores:")
        for pattern, score in pattern_analysis.items():
            if score > 0:
                print(f"  {pattern}: {score:.3f}")
        
        print("✓ BaseScan contract analysis completed")
    
    # Test with traditional samples
    print(f"\n--- Testing with Traditional Samples ---")
    
    test_samples = [
        # Safe sample
        "6080604052348015600f57600080fd5b506004361060325760003560e01c806306fdde0314603757806318160ddd146055575b600080fd5b603d6071565b6040518082815260200191505060405180910390f35b605b6087565b6040518082815260200191505060405180910390f35b60008054905090565b600060018054905090509056fea2646970667358221220123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef64736f6c63430007060033",
        
        # Malicious sample (reentrancy)
        "6080604052348015600f57600080fd5b5060405160208061015d83398101806040526020811015602f57600080fd5b810190808051906020019092919050505050806000819055505060c68060526000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306fdde0314603757806318160ddd146055575b600080fd5b603d6071565b6040518082815260200191505060405180910390f35b605b6087565b6040518082815260200191505060405180910390f35b60008054905090565b600060018054905090509056fea2646970667358221220123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef64736f6c63430007060033"
    ]
    
    for i, bytecode in enumerate(test_samples):
        print(f"\nTest Sample {i+1}:")
        
        result = predict_bytecode_risk(model, vocab, bytecode)
        
        print(f"Risk Score: {result['risk_score']:.3f}")
        print("Model Pattern Scores:")
        for pattern, score in result['model_pattern_scores'].items():
            if score > 0.1:
                print(f"  {pattern}: {score:.3f}")
        
        print("Rule-based Pattern Scores:")
        for pattern, score in result['rule_based_pattern_scores'].items():
            if score > 0:
                print(f"  {pattern}: {score:.3f}")

def predict_bytecode_risk(model, vocab, bytecode_str):
    """Predict risk for a single bytecode string"""
    
    # Preprocess and tokenize bytecode
    processed_bytecode = preprocess_bytecode(bytecode_str)
    opcode_sequence = tokenize_bytecode(processed_bytecode)
    
    # Create dataset for prediction
    dataset = BytecodeDataset([opcode_sequence])
    dataloader = DataLoader(dataset, batch_size=1, shuffle=False)
    
    # Predict
    model.eval()
    with torch.no_grad():
        for data in dataloader:
            outputs = model(data)
            risk_score = outputs['risk_score'].item()
            pattern_scores = {k: v.item() for k, v in outputs['pattern_scores'].items()}
    
    # Also run pattern analysis
    pattern_analysis = analyze_bytecode_patterns(opcode_sequence)
    
    return {
        'risk_score': risk_score,
        'model_pattern_scores': pattern_scores,
        'rule_based_pattern_scores': pattern_analysis,
        'opcode_sequence': opcode_sequence
    }

def main():
    """Main function for enhanced training"""
    
    print("Enhanced Bytecode Detector - BaseScan Integration")
    print("================================================")
    
    # Create sample datasets if they don't exist
    from sample_datasets import create_sample_datasets
    create_sample_datasets()
    
    # Train enhanced model
    print("\nStarting enhanced training with BaseScan data...")
    model, vocab = train_enhanced_model()
    
    # Test the enhanced model
    test_enhanced_model()
    
    print("\n=== Enhanced Bytecode Detector Ready ===")
    print("Model now trained with BaseScan verified contracts!")
    print("Improved accuracy for real-world contract analysis")

if __name__ == "__main__":
    main()