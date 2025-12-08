#!/usr/bin/env python3
"""
Main training script for Bytecode Detector model
Simple implementation focusing on core functionality
"""

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import numpy as np
import json
import os
import time

# Import our modules
from bytecode_tokenizer import preprocess_bytecode, extract_opcode_sequence
from model_architecture import BytecodeTransformer, BytecodeDataset, train_model
from sample_datasets import load_training_data, analyze_bytecode_patterns

def prepare_training_data():
    """Prepare training data from sample datasets"""
    
    print("Loading training data...")
    sequences, labels = load_training_data()
    
    print(f"Loaded {len(sequences)} sequences for training")
    
    # Create dataset
    dataset = BytecodeDataset(sequences, labels)
    
    # Create data loader
    dataloader = DataLoader(dataset, batch_size=8, shuffle=True)
    
    return dataset, dataloader

def train_bytecode_model():
    """Train the bytecode analysis model"""
    
    print("=== Bytecode Detector Model Training ===")
    print("Preparing training data...")
    
    # Prepare data
    dataset, train_loader = prepare_training_data()
    
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
    print("Starting training...")
    trained_model = train_model(model, train_loader, num_epochs=5, learning_rate=0.001)
    
    # Save model
    os.makedirs("models", exist_ok=True)
    model_path = "models/bytecode_detector.pth"
    torch.save({
        'model_state_dict': trained_model.state_dict(),
        'vocab': dataset.vocab,
        'vocab_size': dataset.vocab_size
    }, model_path)
    
    print(f"Model saved to {model_path}")
    
    return trained_model, dataset.vocab

def load_trained_model():
    """Load a trained model"""
    
    model_path = "models/bytecode_detector.pth"
    
    if not os.path.exists(model_path):
        print("No trained model found. Please train the model first.")
        return None, None
    
    checkpoint = torch.load(model_path)
    
    # Initialize model
    model = BytecodeTransformer(vocab_size=checkpoint['vocab_size'])
    model.load_state_dict(checkpoint['model_state_dict'])
    
    print("Trained model loaded successfully")
    return model, checkpoint['vocab']

def predict_bytecode_risk(model, vocab, bytecode_str):
    """Predict risk for a single bytecode string"""
    
    # Preprocess and tokenize bytecode
    processed_bytecode = preprocess_bytecode(bytecode_str)
    opcode_sequence = extract_opcode_sequence(processed_bytecode)
    
    print(f"Opcode sequence: {opcode_sequence}")
    
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

def test_model_predictions():
    """Test the model with sample predictions"""
    
    print("\n=== Testing Model Predictions ===")
    
    # Load or train model
    model, vocab = load_trained_model()
    if model is None:
        print("Training new model...")
        model, vocab = train_bytecode_model()
    
    # Test samples
    test_samples = [
        # Safe sample
        "6080604052348015600f57600080fd5b506004361060325760003560e01c806306fdde0314603757806318160ddd146055575b600080fd5b603d6071565b6040518082815260200191505060405180910390f35b605b6087565b6040518082815260200191505060405180910390f35b60008054905090565b600060018054905090509056fea2646970667358221220123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef64736f6c63430007060033",
        
        # Malicious sample (reentrancy)
        "6080604052348015600f57600080fd5b5060405160208061015d83398101806040526020811015602f57600080fd5b810190808051906020019092919050505050806000819055505060c68060526000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806306fdde0314603757806318160ddd146055575b600080fd5b603d6071565b6040518082815260200191505060405180910390f35b605b6087565b6040518082815260200191505060405180910390f35b60008054905090565b600060018054905090509056fea2646970667358221220123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef64736f6c63430007060033"
    ]
    
    for i, bytecode in enumerate(test_samples):
        print(f"\n--- Test Sample {i+1} ---")
        
        result = predict_bytecode_risk(model, vocab, bytecode)
        
        print(f"Risk Score: {result['risk_score']:.3f}")
        print("Model Pattern Scores:")
        for pattern, score in result['model_pattern_scores'].items():
            print(f"  {pattern}: {score:.3f}")
        
        print("Rule-based Pattern Scores:")
        for pattern, score in result['rule_based_pattern_scores'].items():
            if score > 0:
                print(f"  {pattern}: {score:.3f}")

def main():
    """Main function"""
    
    print("Bytecode Detector - Simple Implementation")
    print("=========================================")
    
    # Create sample datasets if they don't exist
    from sample_datasets import create_sample_datasets
    create_sample_datasets()
    
    # Train or load model
    model, vocab = load_trained_model()
    if model is None:
        print("No trained model found. Starting training...")
        model, vocab = train_bytecode_model()
    
    # Test predictions
    test_model_predictions()
    
    print("\n=== Bytecode Detector Ready ===")
    print("Model can analyze bytecode for vulnerabilities and risk scoring")

if __name__ == "__main__":
    main()