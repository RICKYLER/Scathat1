#!/usr/bin/env python3
"""
Sample Behavior Datasets for Model C - Behavior Model
Generates realistic transaction, transfer, and approval data for testing
"""

import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Common Ethereum addresses for realistic data
SAFE_ADDRESSES = [
    "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",  # Binance
    "0x53D284357ec70cE289D6D64134DfAc8E511c8a3D",  # Known safe
    "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae"   # Ethereum Foundation
]

SUSPICIOUS_ADDRESSES = [
    "0xaaaa1234567890abcdef1234567890abcdef1234",
    "0xbbbb9876543210fedcba9876543210fedcba9876", 
    "0xcccc111122223333444455556666777788889999"
]

PHISHING_ADDRESSES = [
    "0xphish111111111111111111111111111111111111",
    "0xscam222222222222222222222222222222222222",
    "0xdrain333333333333333333333333333333333333"
]

def generate_timestamp(start_hours_ago: int = 24) -> int:
    """Generate random timestamp within last N hours"""
    now = datetime.now()
    start = now - timedelta(hours=start_hours_ago)
    random_time = start + timedelta(seconds=random.randint(0, start_hours_ago * 3600))
    return int(random_time.timestamp())

def generate_drainer_dataset() -> Dict[str, Any]:
    """Generate dataset showing drainer behavior patterns"""
    
    transactions = []
    transfers = []
    approvals = []
    
    # Victim address
    victim = "0xuser1234567890abcdef1234567890abcdef1234"
    drainer = random.choice(SUSPICIOUS_ADDRESSES)
    
    # Pattern: Small test transaction followed by large drain
    timestamp1 = generate_timestamp(2)
    transactions.append({
        "hash": f"0x{random.getrandbits(256):064x}",
        "from": victim,
        "to": drainer,
        "value": 0.001,  # Small test
        "gas_used": 21000,
        "gas_price": 20,
        "timestamp": timestamp1,
        "status": "success"
    })
    
    timestamp2 = timestamp1 + 60  # 1 minute later
    transactions.append({
        "hash": f"0x{random.getrandbits(256):064x}",
        "from": victim,
        "to": drainer,
        "value": 2.5,  # Large drain
        "gas_used": 21000,
        "gas_price": 20,
        "timestamp": timestamp2,
        "status": "success"
    })
    
    # Additional rapid transactions
    for i in range(3):
        transactions.append({
            "hash": f"0x{random.getrandbits(256):064x}",
            "from": victim,
            "to": drainer,
            "value": random.uniform(0.5, 3.0),
            "gas_used": 21000,
            "gas_price": 20,
            "timestamp": timestamp2 + (i * 30),  # Every 30 seconds
            "status": "success"
        })
    
    return {
        "label": "drainer",
        "description": "Wallet drainer behavior with rapid successive transactions",
        "transactions": transactions,
        "transfers": transfers,
        "approvals": approvals
    }

def generate_honeypot_dataset() -> Dict[str, Any]:
    """Generate dataset showing honeypot behavior patterns"""
    
    transactions = []
    transfers = []
    approvals = []
    
    victim = "0xuser1234567890abcdef1234567890abcdef1234"
    honeypot = random.choice(SUSPICIOUS_ADDRESSES)
    
    # Pattern: Unlimited approvals to suspicious address
    approvals.append({
        "owner": victim,
        "spender": honeypot,
        "value": float('inf'),  # Unlimited approval
        "token_address": "0xToken1234567890abcdef1234567890abcdef1234",
        "timestamp": generate_timestamp(6)
    })
    
    # Multiple rapid approvals
    base_time = generate_timestamp(3)
    for i in range(4):
        approvals.append({
            "owner": victim,
            "spender": honeypot,
            "value": random.uniform(1000, 10000),
            "token_address": f"0xToken{random.getrandbits(160):040x}",
            "timestamp": base_time + (i * 120)  # Every 2 minutes
        })
    
    # Some transactions to make it look legitimate
    transactions.append({
        "hash": f"0x{random.getrandbits(256):064x}",
        "from": victim,
        "to": honeypot,
        "value": 0.1,
        "gas_used": 50000,
        "gas_price": 25,
        "timestamp": generate_timestamp(4),
        "status": "success"
    })
    
    return {
        "label": "honeypot", 
        "description": "Honeypot with unlimited approvals and rapid approval changes",
        "transactions": transactions,
        "transfers": transfers,
        "approvals": approvals
    }

def generate_flashloan_dataset() -> Dict[str, Any]:
    """Generate dataset showing flashloan behavior patterns"""
    
    transactions = []
    transfers = []
    approvals = []
    
    user = "0xuser1234567890abcdef1234567890abcdef1234"
    
    # Pattern: Large borrow and repay within short timeframe
    base_time = generate_timestamp(1)
    
    # Borrow
    transactions.append({
        "hash": f"0x{random.getrandbits(256):064x}",
        "from": user,
        "to": "0xFlashLoanPool",
        "value": 50.0,  # Large borrow
        "gas_used": 250000,  # High gas usage
        "gas_price": 30,
        "timestamp": base_time,
        "status": "success"
    })
    
    # Repay (to different address)
    transactions.append({
        "hash": f"0x{random.getrandbits(256):064x}",
        "from": user,
        "to": "0xRepaymentAddress",
        "value": 50.5,  # Slightly more with fee
        "gas_used": 180000,
        "gas_price": 30,
        "timestamp": base_time + 15,  # 15 seconds later
        "status": "success"
    })
    
    # Additional high-gas transactions (arbitrage operations)
    for i in range(3):
        transactions.append({
            "hash": f"0x{random.getrandbits(256):064x}",
            "from": user,
            "to": random.choice(["0xDEX1", "0xDEX2", "0xDEX3"]),
            "value": random.uniform(5.0, 20.0),
            "gas_used": random.randint(150000, 300000),
            "gas_price": 35,
            "timestamp": base_time + 5 + (i * 8),
            "status": "success"
        })
    
    return {
        "label": "flashloan",
        "description": "Flashloan patterns with large borrow/repay and high gas usage",
        "transactions": transactions,
        "transfers": transfers,
        "approvals": approvals
    }

def generate_phishing_dataset() -> Dict[str, Any]:
    """Generate dataset showing phishing behavior patterns"""
    
    transactions = []
    transfers = []
    approvals = []
    
    phishing_addr = random.choice(PHISHING_ADDRESSES)
    
    # Pattern: Multiple victims sending to same phishing address
    victims = [f"0xVictim{random.getrandbits(160):040x}" for _ in range(5)]
    
    for i, victim in enumerate(victims):
        # Small test transaction
        transactions.append({
            "hash": f"0x{random.getrandbits(256):064x}",
            "from": victim,
            "to": phishing_addr,
            "value": 0.005,
            "gas_used": 21000,
            "gas_price": 20,
            "timestamp": generate_timestamp(12) + (i * 3600),  # Spread over hours
            "status": "success"
        })
        
        # Larger follow-up
        transactions.append({
            "hash": f"0x{random.getrandbits(256):064x}",
            "from": victim,
            "to": phishing_addr,
            "value": random.uniform(0.5, 2.0),
            "gas_used": 21000,
            "gas_price": 20,
            "timestamp": generate_timestamp(6) + (i * 1800),  # 30 minutes later
            "status": "success"
        })
    
    return {
        "label": "phishing",
        "description": "Phishing campaign with multiple victims and test-then-drain pattern",
        "transactions": transactions,
        "transfers": transfers,
        "approvals": approvals
    }

def generate_safe_dataset() -> Dict[str, Any]:
    """Generate dataset showing normal/safe behavior patterns"""
    
    transactions = []
    transfers = []
    approvals = []
    
    user = "0xuser1234567890abcdef1234567890abcdef1234"
    
    # Normal transactions - varied amounts, reasonable timing
    for i in range(8):
        transactions.append({
            "hash": f"0x{random.getrandbits(256):064x}",
            "from": user,
            "to": random.choice(SAFE_ADDRESSES),
            "value": random.uniform(0.01, 0.5),
            "gas_used": random.randint(21000, 50000),
            "gas_price": random.randint(15, 30),
            "timestamp": generate_timestamp(48) + (i * 10800),  # Every 3 hours
            "status": "success"
        })
    
    # Some token transfers
    for i in range(3):
        transfers.append({
            "from": user,
            "to": random.choice(SAFE_ADDRESSES),
            "value": random.uniform(10, 100),
            "token_address": f"0xToken{random.getrandbits(160):040x}",
            "timestamp": generate_timestamp(24) + (i * 7200)
        })
    
    # Limited approvals
    approvals.append({
        "owner": user,
        "spender": random.choice(SAFE_ADDRESSES),
        "value": 500.0,  # Reasonable limit
        "token_address": "0xDAI1234567890abcdef1234567890abcdef1234",
        "timestamp": generate_timestamp(36)
    })
    
    return {
        "label": "safe",
        "description": "Normal wallet behavior with reasonable transaction patterns",
        "transactions": transactions,
        "transfers": transfers,
        "approvals": approvals
    }

def create_sample_datasets() -> List[Dict[str, Any]]:
    """Create multiple sample datasets for testing"""
    
    datasets = [
        generate_drainer_dataset(),
        generate_honeypot_dataset(), 
        generate_flashloan_dataset(),
        generate_phishing_dataset(),
        generate_safe_dataset()
    ]
    
    return datasets

def save_datasets_to_files(datasets: List[Dict[str, Any]], output_dir: str = "data"):
    """Save datasets to individual JSON files"""
    
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    for dataset in datasets:
        filename = f"{dataset['label']}_behavior.json"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w') as f:
            json.dump(dataset, f, indent=2)
        
        print(f"Saved {filename}")

def load_dataset(file_path: str) -> Dict[str, Any]:
    """Load dataset from JSON file"""
    with open(file_path, 'r') as f:
        return json.load(f)

if __name__ == "__main__":
    # Generate and save sample datasets
    print("Generating sample behavior datasets...")
    datasets = create_sample_datasets()
    
    # Save to files
    save_datasets_to_files(datasets, "sample_data")
    
    print(f"\nGenerated {len(datasets)} datasets:")
    for dataset in datasets:
        print(f"- {dataset['label']}: {dataset['description']}")
        print(f"  Transactions: {len(dataset['transactions'])}")
        print(f"  Transfers: {len(dataset['transfers'])}")
        print(f"  Approvals: {len(dataset['approvals'])}")