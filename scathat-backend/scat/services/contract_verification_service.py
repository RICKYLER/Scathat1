"""
Contract Verification Service

Provides advanced contract verification, source code validation, and security analysis
for on-chain contract verification and bytecode-to-source validation.
"""

import logging
from web3 import Web3
from web3.exceptions import ContractLogicError, TransactionNotFound
from typing import Dict, Any, Optional, List, Tuple, Set
from dataclasses import dataclass
import json
import re
from enum import Enum
import hashlib

logger = logging.getLogger(__name__)

class VerificationStatus(Enum):
    """Contract verification status"""
    VERIFIED = "verified"
    UNVERIFIED = "unverified"
    SUSPICIOUS = "suspicious"
    MALICIOUS = "malicious"
    ERROR = "error"

class ContractVerificationService:
    """Service for comprehensive contract verification and validation"""
    
    def __init__(self, web3_service):
        """
        Initialize the verification service.
        
        Args:
            web3_service: Web3Service instance for blockchain interactions
        """
        self.web3_service = web3_service
        self.w3 = web3_service.w3
        
        # Known malicious patterns and signatures
        self.malicious_patterns = [
            re.compile(r'selfdestruct', re.IGNORECASE),
            re.compile(r'delegatecall', re.IGNORECASE),
            re.compile(r'call.*value', re.IGNORECASE),
            re.compile(r'assembly', re.IGNORECASE),
        ]
        
        # Known verified contract registries
        self.verified_registries = {
            'ethereum': '0xca1207647Ff814039530D7d35df0e1Dd2e91Fa84',  # Etherscan verification
            'basescan': '0xca1207647Ff814039530D7d35df0e1Dd2e91Fa84',  # Basescan verification
        }
    
    def verify_contract_deployment(self, contract_address: str, expected_bytecode: Optional[str] = None) -> Dict[str, Any]:
        """
        Comprehensive contract deployment verification.
        
        Args:
            contract_address: Contract address to verify
            expected_bytecode: Expected bytecode for validation (optional)
            
        Returns:
            Dict with verification results and status
        """
        try:
            # Basic address validation
            if not self.w3.is_address(contract_address):
                return {
                    'status': VerificationStatus.ERROR,
                    'message': 'Invalid contract address',
                    'details': {'address': contract_address}
                }
            
            checksum_address = self.w3.to_checksum_address(contract_address)
            
            # Check if address is a contract
            bytecode = self.web3_service.get_contract_code(checksum_address)
            if not bytecode or bytecode == '0x':
                return {
                    'status': VerificationStatus.ERROR,
                    'message': 'No contract code at address',
                    'details': {'address': checksum_address}
                }
            
            # Bytecode validation if expected bytecode provided
            bytecode_match = None
            if expected_bytecode:
                bytecode_match = self._validate_bytecode_match(bytecode, expected_bytecode)
            
            # Get deployment transaction
            deployment_tx = self._get_deployment_transaction(checksum_address)
            
            # Check against known malicious patterns
            security_analysis = self._analyze_contract_security(bytecode, deployment_tx)
            
            # Build verification result
            result = {
                'status': VerificationStatus.VERIFIED if bytecode_match is not False else VerificationStatus.UNVERIFIED,
                'address': checksum_address,
                'is_contract': True,
                'bytecode_length': len(bytecode),
                'bytecode_match': bytecode_match,
                'deployment_tx': deployment_tx,
                'security_analysis': security_analysis,
                'verification_timestamp': self.w3.eth.get_block('latest')['timestamp']
            }
            
            # Update status based on security analysis
            if security_analysis.get('malicious_indicators', 0) > 0:
                result['status'] = VerificationStatus.SUSPICIOUS
            if security_analysis.get('critical_issues', 0) > 0:
                result['status'] = VerificationStatus.MALICIOUS
                
            return result
            
        except Exception as e:
            logger.error(f"Contract verification failed for {contract_address}: {e}")
            return {
                'status': VerificationStatus.ERROR,
                'message': f'Verification error: {str(e)}',
                'details': {'address': contract_address}
            }
    
    def _validate_bytecode_match(self, actual_bytecode: str, expected_bytecode: str) -> bool:
        """Validate if actual bytecode matches expected bytecode"""
        # Normalize bytecode (remove metadata and deployment code)
        actual_normalized = self._normalize_bytecode(actual_bytecode)
        expected_normalized = self._normalize_bytecode(expected_bytecode)
        
        # Compare normalized bytecode
        return actual_normalized == expected_normalized
    
    def _normalize_bytecode(self, bytecode: str) -> str:
        """Normalize bytecode for comparison"""
        if not bytecode or bytecode == '0x':
            return ''
        
        # Remove metadata (last 64 bytes typically contain metadata)
        if len(bytecode) > 130:  # 0x + 64 bytes = 130 characters
            normalized = bytecode[:-130]
        else:
            normalized = bytecode
        
        return normalized
    
    def _get_deployment_transaction(self, contract_address: str) -> Optional[Dict[str, Any]]:
        """Get deployment transaction for a contract"""
        try:
            # Get contract creation transaction
            tx_hash = self.w3.eth.get_transaction_receipt(contract_address)
            if tx_hash and tx_hash.contractAddress == contract_address:
                tx = self.w3.eth.get_transaction(tx_hash.transactionHash)
                return {
                    'hash': tx_hash.transactionHash.hex(),
                    'block_number': tx_hash.blockNumber,
                    'from': tx['from'],
                    'gas_used': tx_hash.gasUsed,
                    'gas_price': tx['gasPrice']
                }
        except:
            pass
        return None
    
    def _analyze_contract_security(self, bytecode: str, deployment_tx: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Analyze contract bytecode for security issues"""
        analysis = {
            'malicious_indicators': 0,
            'critical_issues': 0,
            'warnings': 0,
            'patterns_found': [],
            'risk_score': 0
        }
        
        # Check for known malicious patterns in bytecode
        bytecode_lower = bytecode.lower()
        
        for pattern in self.malicious_patterns:
            if pattern.search(bytecode_lower):
                analysis['malicious_indicators'] += 1
                analysis['patterns_found'].append(pattern.pattern)
        
        # Additional security checks
        if self._check_reentrancy_risk(bytecode):
            analysis['critical_issues'] += 1
            analysis['patterns_found'].append('potential_reentrancy')
        
        if self._check_hidden_functionality(bytecode):
            analysis['warnings'] += 1
            analysis['patterns_found'].append('hidden_functionality')
        
        # Calculate risk score (0-100)
        analysis['risk_score'] = min(100, analysis['critical_issues'] * 40 + analysis['malicious_indicators'] * 20 + analysis['warnings'] * 5)
        
        return analysis
    
    def _check_reentrancy_risk(self, bytecode: str) -> bool:
        """Check for potential reentrancy vulnerabilities"""
        # Look for call.value patterns without proper checks
        call_value_patterns = [
            re.compile(r'call.*value', re.IGNORECASE),
            re.compile(r'transfer.*call', re.IGNORECASE),
        ]
        
        for pattern in call_value_patterns:
            if pattern.search(bytecode.lower()):
                return True
        return False
    
    def _check_hidden_functionality(self, bytecode: str) -> bool:
        """Check for potentially hidden functionality"""
        # Look for unusual patterns that might indicate hidden features
        suspicious_patterns = [
            re.compile(r'deadbeef', re.IGNORECASE),
            re.compile(r'cafebabe', re.IGNORECASE),
            re.compile(r'1337', re.IGNORECASE),
        ]
        
        for pattern in suspicious_patterns:
            if pattern.search(bytecode.lower()):
                return True
        return False
    
    def verify_source_code(self, contract_address: str, source_code: str, compiler_version: str) -> Dict[str, Any]:
        """
        Verify source code matches deployed bytecode.
        
        Args:
            contract_address: Contract address to verify
            source_code: Solidity source code
            compiler_version: Compiler version used
            
        Returns:
            Dict with source verification results
        """
        # This would typically integrate with compiler services
        # For now, return placeholder implementation
        return {
            'status': VerificationStatus.UNVERIFIED,
            'message': 'Source code verification requires compiler integration',
            'details': {
                'address': contract_address,
                'source_hash': hashlib.sha256(source_code.encode()).hexdigest(),
                'compiler_version': compiler_version
            }
        }
    
    def batch_verify_contracts(self, contract_addresses: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Batch verify multiple contracts for efficiency.
        
        Args:
            contract_addresses: List of contract addresses to verify
            
        Returns:
            Dict with verification results for each address
        """
        results = {}
        
        for address in contract_addresses:
            try:
                results[address] = self.verify_contract_deployment(address)
            except Exception as e:
                results[address] = {
                    'status': VerificationStatus.ERROR,
                    'message': f'Batch verification failed: {str(e)}',
                    'details': {'address': address}
                }
        
        return results