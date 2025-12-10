#!/usr/bin/env python3
"""
Simple LLM fine-tuning script for Solidity code analysis
Uses Hugging Face Transformers for efficient training
"""

import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from datasets import Dataset
import json

def load_instruction_data(file_path):
    """Load instruction-formatted training data"""
    data = []
    
    with open(file_path, 'r') as f:
        for line in f:
            item = json.loads(line)
            
            # Format for LLM training: instruction + input -> output
            text = f"### Instruction:\n{item['instruction']}\n\n### Input:\n{item['input']}\n\n### Response:\n{item['output']}"
            data.append({"text": text})
    
    return data

def fine_tune_llm(model_name, train_data, output_dir):
    """
    Fine-tune a pre-trained LLM for Solidity code analysis
    
    Args:
        model_name: Hugging Face model name (e.g., "microsoft/DialoGPT-medium")
        train_data: List of training examples
        output_dir: Directory to save fine-tuned model
    """
    
    # Load tokenizer and model
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    
    model = AutoModelForCausalLM.from_pretrained(model_name)
    
    # Prepare dataset
    dataset = Dataset.from_list(train_data)
    
    def tokenize_function(examples):
        return tokenizer(examples["text"], truncation=True, max_length=1024)
    
    tokenized_dataset = dataset.map(tokenize_function, batched=True)
    
    # Data collator
    data_collator = DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False  # Causal language modeling
    )
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        overwrite_output_dir=True,
        num_train_epochs=3,
        per_device_train_batch_size=4,
        save_steps=500,
        save_total_limit=2,
        prediction_loss_only=True,
        logging_dir='./logs',
        logging_steps=100,
    )
    
    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        data_collator=data_collator,
        train_dataset=tokenized_dataset,
    )
    
    # Train
    print("Starting training...")
    trainer.train()
    
    # Save model
    trainer.save_model()
    tokenizer.save_pretrained(output_dir)
    
    print(f"Model saved to {output_dir}")

if __name__ == "__main__":
    # Configuration
    instruction_file = "../datasets/processed/instruction_data_enhanced.jsonl"
    model_name = "microsoft/DialoGPT-medium"  # Good for dialogue/instruction tasks
    output_dir = "./fine_tuned_model"
    
    # Load training data
    print("Loading training data...")
    train_data = load_instruction_data(instruction_file)
    print(f"Loaded {len(train_data)} training examples")
    
    # Fine-tune model
    fine_tune_llm(model_name, train_data, output_dir)