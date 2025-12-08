#!/usr/bin/env python3
"""
Transformer-based model architecture for bytecode analysis
Simple implementation focusing on vulnerability detection
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import numpy as np

class BytecodeDataset(Dataset):
    """Dataset for bytecode sequences"""
    
    def __init__(self, sequences, labels=None):
        self.sequences = sequences
        self.labels = labels
        self.has_labels = labels is not None
        
        # Create vocabulary from all sequences
        all_tokens = set()
        for seq in sequences:
            all_tokens.update(seq)
        
        self.vocab = {token: idx for idx, token in enumerate(sorted(all_tokens))}
        self.vocab_size = len(self.vocab)
        
    def __len__(self):
        return len(self.sequences)
    
    def __getitem__(self, idx):
        sequence = self.sequences[idx]
        
        # Convert tokens to indices
        token_indices = [self.vocab[token] for token in sequence if token in self.vocab]
        
        # Pad sequence to fixed length
        padded = self.pad_sequence(token_indices, max_length=256)
        
        if self.has_labels:
            return torch.tensor(padded, dtype=torch.long), torch.tensor(self.labels[idx], dtype=torch.float)
        else:
            return torch.tensor(padded, dtype=torch.long)
    
    def pad_sequence(self, sequence, max_length=256):
        """Pad sequence to fixed length"""
        if len(sequence) >= max_length:
            return sequence[:max_length]
        else:
            return sequence + [0] * (max_length - len(sequence))

class BytecodeTransformer(nn.Module):
    """Simple Transformer model for bytecode analysis"""
    
    def __init__(self, vocab_size, embed_dim=128, num_heads=4, num_layers=2, num_classes=1):
        super().__init__()
        
        # Embedding layer
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        
        # Transformer encoder
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=embed_dim,
            nhead=num_heads,
            dim_feedforward=512,
            dropout=0.1,
            activation='relu'
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        # Classification head
        self.classifier = nn.Sequential(
            nn.Linear(embed_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, num_classes),
            nn.Sigmoid()  # For risk score output (0-1)
        )
        
        # Pattern detection heads
        self.pattern_heads = nn.ModuleDict({
            'reentrancy': nn.Linear(embed_dim, 1),
            'selfdestruct': nn.Linear(embed_dim, 1),
            'delegatecall': nn.Linear(embed_dim, 1),
            'hidden_owner': nn.Linear(embed_dim, 1)
        })
        
    def forward(self, x):
        # x shape: (batch_size, seq_len)
        
        # Embed tokens
        embedded = self.embedding(x)  # (batch_size, seq_len, embed_dim)
        
        # Transformer expects (seq_len, batch_size, embed_dim)
        embedded = embedded.permute(1, 0, 2)
        
        # Apply transformer
        encoded = self.transformer(embedded)  # (seq_len, batch_size, embed_dim)
        
        # Use mean pooling for sequence representation
        pooled = encoded.mean(dim=0)  # (batch_size, embed_dim)
        
        # Main risk score
        risk_score = self.classifier(pooled)
        
        # Pattern detection scores
        pattern_scores = {}
        for pattern_name, head in self.pattern_heads.items():
            pattern_scores[pattern_name] = torch.sigmoid(head(pooled))
        
        return {
            'risk_score': risk_score,
            'pattern_scores': pattern_scores,
            'sequence_embeddings': encoded
        }

def train_model(model, train_loader, val_loader=None, num_epochs=10, learning_rate=0.001):
    """Train the bytecode analysis model"""
    
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    criterion = nn.BCELoss()  # Binary cross entropy for risk scoring
    
    model.train()
    
    for epoch in range(num_epochs):
        total_loss = 0
        
        for batch_idx, (data, targets) in enumerate(train_loader):
            optimizer.zero_grad()
            
            # Forward pass
            outputs = model(data)
            
            # Calculate loss
            loss = criterion(outputs['risk_score'], targets)
            
            # Add pattern detection losses
            for pattern_name in outputs['pattern_scores']:
                # For simplicity, use same targets for all patterns
                pattern_loss = criterion(outputs['pattern_scores'][pattern_name], targets)
                loss += pattern_loss * 0.2  # Weight pattern losses lower
            
            # Backward pass
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            
            if batch_idx % 100 == 0:
                print(f'Epoch {epoch+1}/{num_epochs}, Batch {batch_idx}, Loss: {loss.item():.4f}')
        
        avg_loss = total_loss / len(train_loader)
        print(f'Epoch {epoch+1}/{num_epochs}, Average Loss: {avg_loss:.4f}')
        
        # Validation (if validation loader provided)
        if val_loader:
            validate_model(model, val_loader)
    
    return model

def validate_model(model, val_loader):
    """Validate model performance"""
    model.eval()
    
    total_correct = 0
    total_samples = 0
    
    with torch.no_grad():
        for data, targets in val_loader:
            outputs = model(data)
            
            # Convert risk scores to binary predictions (threshold 0.5)
            predictions = (outputs['risk_score'] > 0.5).float()
            total_correct += (predictions == targets).sum().item()
            total_samples += targets.size(0)
    
    accuracy = total_correct / total_samples
    print(f'Validation Accuracy: {accuracy:.4f}')
    
    model.train()
    return accuracy

def predict_risk(model, token_sequences):
    """Predict risk scores for new bytecode sequences"""
    model.eval()
    
    # Create dataset without labels
    dataset = BytecodeDataset(token_sequences)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=False)
    
    predictions = []
    
    with torch.no_grad():
        for data in dataloader:
            outputs = model(data)
            predictions.extend(outputs['risk_score'].cpu().numpy())
    
    return predictions

if __name__ == "__main__":
    # Example usage
    print("Bytecode Transformer Model Architecture")
    
    # Sample data (in real usage, this would come from tokenized bytecode)
    sample_sequences = [
        ['PUSH1', 'CALL', 'SSTORE', 'JUMP'],
        ['PUSH1', 'SLOAD', 'DELEGATECALL', 'SELFDESTRUCT'],
        ['PUSH1', 'ADD', 'MUL', 'RETURN']
    ]
    
    # Sample labels (1 = risky, 0 = safe)
    sample_labels = [1.0, 1.0, 0.0]
    
    # Create dataset
    dataset = BytecodeDataset(sample_sequences, sample_labels)
    dataloader = DataLoader(dataset, batch_size=2, shuffle=True)
    
    # Initialize model
    model = BytecodeTransformer(vocab_size=dataset.vocab_size)
    
    print(f"Model initialized with {dataset.vocab_size} vocabulary size")
    print("Model architecture ready for training")