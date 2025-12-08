#!/usr/bin/env python3
"""
Behavior Model - Transaction Pattern Analyzer
Simple implementation for detecting malicious behavior patterns
"""

from typing import Dict, List, Any
from dataclasses import dataclass
import json

@dataclass
class Transaction:
    """Simple transaction data structure"""
    hash: str
    from_address: str
    to_address: str
    value: float
    gas_used: int
    gas_price: int
    timestamp: int
    status: str  # success/failed
    
@dataclass  
class Transfer:
    """Token transfer data structure"""
    from_address: str
    to_address: str
    value: float
    token_address: str
    timestamp: int

@dataclass
class Approval:
    """Token approval data structure"""
    owner: str
    spender: str
    value: float
    token_address: str
    timestamp: int

class BehaviorAnalyzer:
    """Simple behavior analysis for detecting malicious patterns"""
    
    def __init__(self):
        self.transactions: List[Transaction] = []
        self.transfers: List[Transfer] = []
        self.approvals: List[Approval] = []
        
    def add_transaction(self, tx: Transaction):
        """Add transaction to analysis"""
        self.transactions.append(tx)
        
    def add_transfer(self, transfer: Transfer):
        """Add transfer to analysis"""
        self.transfers.append(transfer)
        
    def add_approval(self, approval: Approval):
        """Add approval to analysis"""
        self.approvals.append(approval)
    
    def analyze_drainer_patterns(self) -> Dict[str, float]:
        """Detect drainer patterns based on transaction behavior"""
        
        if not self.transactions:
            return {"confidence": 0.0, "reason": "No transactions to analyze"}
        
        # Pattern 1: Rapid successive transactions to same address
        rapid_tx_count = 0
        recent_timestamps = sorted([tx.timestamp for tx in self.transactions])
        
        for i in range(1, len(recent_timestamps)):
            if recent_timestamps[i] - recent_timestamps[i-1] < 60:  # Within 60 seconds
                rapid_tx_count += 1
        
        # Pattern 2: Large value transfers to new addresses
        large_transfers = sum(1 for tx in self.transactions 
                            if tx.value > 1.0 and tx.status == "success")  # > 1 ETH
        
        # Pattern 3: Failed transactions followed by successful ones
        failed_before_success = 0
        for i in range(1, len(self.transactions)):
            if (self.transactions[i-1].status == "failed" and 
                self.transactions[i].status == "success"):
                failed_before_success += 1
        
        # Calculate confidence score
        confidence = min(0.9, (rapid_tx_count * 0.2 + 
                             large_transfers * 0.3 + 
                             failed_before_success * 0.2))
        
        return {
            "confidence": confidence,
            "rapid_transactions": rapid_tx_count,
            "large_transfers": large_transfers,
            "failed_before_success": failed_before_success
        }
    
    def analyze_honeypot_patterns(self) -> Dict[str, Any]:
        """Detect honeypot patterns through approval analysis"""
        
        if not self.approvals:
            return {"confidence": 0.0, "reason": "No approvals to analyze"}
        
        # Pattern 1: Unlimited approvals
        unlimited_approvals = sum(1 for approval in self.approvals 
                                if approval.value == float('inf'))
        
        # Pattern 2: Approvals to suspicious addresses
        suspicious_approvals = sum(1 for approval in self.approvals 
                                 if self._is_suspicious_address(approval.spender))
        
        # Pattern 3: Rapid approval changes
        approval_timestamps = sorted([app.timestamp for app in self.approvals])
        rapid_approvals = 0
        
        for i in range(1, len(approval_timestamps)):
            if approval_timestamps[i] - approval_timestamps[i-1] < 300:  # 5 minutes
                rapid_approvals += 1
        
        confidence = min(0.9, (unlimited_approvals * 0.4 + 
                             suspicious_approvals * 0.3 + 
                             rapid_approvals * 0.2))
        
        return {
            "confidence": confidence,
            "unlimited_approvals": unlimited_approvals,
            "suspicious_approvals": suspicious_approvals,
            "rapid_approvals": rapid_approvals
        }
    
    def analyze_flashloan_patterns(self) -> Dict[str, Any]:
        """Detect flashloan patterns"""
        
        if not self.transactions:
            return {"confidence": 0.0, "reason": "No transactions to analyze"}
        
        # Pattern 1: Large borrow immediately followed by repay
        flashloan_like = 0
        tx_by_time = sorted(self.transactions, key=lambda x: x.timestamp)
        
        for i in range(1, len(tx_by_time)):
            current = tx_by_time[i]
            previous = tx_by_time[i-1]
            
            # Large value transaction within short time window
            if (current.value > 10.0 and previous.value > 10.0 and
                current.timestamp - previous.timestamp < 30 and
                current.from_address == previous.to_address):
                flashloan_like += 1
        
        # Pattern 2: High gas usage (complex arbitrage)
        high_gas_txs = sum(1 for tx in self.transactions 
                          if tx.gas_used > 200000)  # Complex operations
        
        confidence = min(0.9, (flashloan_like * 0.5 + high_gas_txs * 0.2))
        
        return {
            "confidence": confidence,
            "flashloan_like_patterns": flashloan_like,
            "high_gas_transactions": high_gas_txs
        }
    
    def analyze_phishing_patterns(self) -> Dict[str, Any]:
        """Detect phishing contract patterns"""
        
        if not self.transactions:
            return {"confidence": 0.0, "reason": "No transactions to analyze"}
        
        # Pattern 1: Small test transactions followed by larger ones
        test_then_large = 0
        tx_by_time = sorted(self.transactions, key=lambda x: x.timestamp)
        
        for i in range(1, len(tx_by_time)):
            if (tx_by_time[i-1].value < 0.1 and  # Small test
                tx_by_time[i].value > 1.0 and    # Larger follow-up
                tx_by_time[i].timestamp - tx_by_time[i-1].timestamp < 3600):  # Within hour
                test_then_large += 1
        
        # Pattern 2: Transactions to known phishing addresses
        phishing_txs = sum(1 for tx in self.transactions 
                          if self._is_known_phishing_address(tx.to_address))
        
        # Pattern 3: Similar transactions from multiple addresses (campaign)
        from_addresses = set(tx.from_address for tx in self.transactions)
        multi_address_campaign = 1 if len(from_addresses) > 3 else 0
        
        confidence = min(0.9, (test_then_large * 0.3 + 
                             phishing_txs * 0.4 + 
                             multi_address_campaign * 0.2))
        
        return {
            "confidence": confidence,
            "test_then_large_patterns": test_then_large,
            "phishing_address_transactions": phishing_txs,
            "multi_address_campaign": multi_address_campaign
        }
    
    def _is_suspicious_address(self, address: str) -> bool:
        """Simple heuristic for suspicious addresses"""
        # Check for newly created addresses (simple heuristic)
        return address.lower().endswith('abcd') or address.lower().startswith('1234')
    
    def _is_known_phishing_address(self, address: str) -> bool:
        """Simple check for known phishing patterns"""
        # This would integrate with a real database in production
        known_patterns = ['0xaaaa', '0xbbbb', '0xcccc']  # Example patterns
        return any(pattern in address.lower() for pattern in known_patterns)
    
    def analyze_all(self) -> Dict[str, Any]:
        """Run all behavior analyses"""
        
        return {
            "drainer": self.analyze_drainer_patterns(),
            "honeypot": self.analyze_honeypot_patterns(),
            "flashloan": self.analyze_flashloan_patterns(),
            "phishing": self.analyze_phishing_patterns(),
            "summary": self._generate_summary()
        }
    
    def _generate_summary(self) -> str:
        """Generate summary of findings"""
        analyses = {
            "drainer": self.analyze_drainer_patterns(),
            "honeypot": self.analyze_honeypot_patterns(),
            "flashloan": self.analyze_flashloan_patterns(),
            "phishing": self.analyze_phishing_patterns()
        }
        
        high_risk = []
        for pattern, result in analyses.items():
            if result["confidence"] > 0.6:
                high_risk.append(f"{pattern} (confidence: {result['confidence']:.2f})")
        
        if high_risk:
            return f"High risk patterns detected: {', '.join(high_risk)}"
        else:
            return "No high-risk behavior patterns detected"

def load_behavior_data(file_path: str) -> BehaviorAnalyzer:
    """Load behavior data from JSON file"""
    analyzer = BehaviorAnalyzer()
    
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
            
            # Load transactions
            for tx_data in data.get('transactions', []):
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
            
            # Load transfers
            for transfer_data in data.get('transfers', []):
                transfer = Transfer(
                    from_address=transfer_data.get('from', ''),
                    to_address=transfer_data.get('to', ''),
                    value=transfer_data.get('value', 0),
                    token_address=transfer_data.get('token_address', ''),
                    timestamp=transfer_data.get('timestamp', 0)
                )
                analyzer.add_transfer(transfer)
            
            # Load approvals
            for approval_data in data.get('approvals', []):
                approval = Approval(
                    owner=approval_data.get('owner', ''),
                    spender=approval_data.get('spender', ''),
                    value=approval_data.get('value', 0),
                    token_address=approval_data.get('token_address', ''),
                    timestamp=approval_data.get('timestamp', 0)
                )
                analyzer.add_approval(approval)
                
    except FileNotFoundError:
        print(f"File {file_path} not found")
    
    return analyzer

if __name__ == "__main__":
    # Example usage
    analyzer = BehaviorAnalyzer()
    
    # Add sample transactions
    analyzer.add_transaction(Transaction(
        hash="0x123", from_address="0xuser", to_address="0xdrainer", 
        value=0.01, gas_used=21000, gas_price=20, timestamp=1000, status="success"
    ))
    
    analyzer.add_transaction(Transaction(
        hash="0x124", from_address="0xuser", to_address="0xdrainer", 
        value=5.0, gas_used=21000, gas_price=20, timestamp=1010, status="success"
    ))
    
    # Analyze
    results = analyzer.analyze_all()
    print("Behavior Analysis Results:")
    print(json.dumps(results, indent=2))