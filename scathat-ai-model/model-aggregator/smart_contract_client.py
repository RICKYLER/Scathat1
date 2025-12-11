"""
Smart Contract Client for ResultsRegistry Integration

This module provides a client to interact with the ResultsRegistry smart contract,
allowing AI analysis results to be written to the blockchain.
"""

import os
import json
import logging
from typing import Optional, Dict, Any
from enum import Enum
from web3 import Web3
from web3.exceptions import ContractLogicError, TransactionNotFound
from web3.middleware import geth_poa_middleware

# Configure logging
logger = logging.getLogger(__name__)

class RiskLevel(Enum):
    """Risk level enum matching the smart contract"""
    Safe = 0
    Warning = 1
    Dangerous = 2

class SmartContractClient:
    """
    Client for interacting with the ResultsRegistry smart contract
    """
    
    def __init__(self, rpc_url: Optional[str] = None, contract_address: Optional[str] = None):
        """
        Initialize the smart contract client
        
        Args:
            rpc_url: Ethereum RPC URL (default: env var ETH_RPC_URL)
            contract_address: ResultsRegistry contract address (default: env var RESULTS_REGISTRY_ADDRESS)
        """
        self.rpc_url = rpc_url or os.getenv('ETH_RPC_URL')
        self.contract_address = contract_address or os.getenv('RESULTS_REGISTRY_ADDRESS')
        self.private_key = os.getenv('PRIVATE_KEY')
        
        if not self.rpc_url:
            logger.warning("No RPC URL provided, client will run in read-only mode")
        
        if not self.contract_address:
            logger.warning("No contract address provided, client will not be able to interact with contract")
        
        self.w3 = None
        self.contract = None
        self.is_initialized = False
        
        self._initialize_web3()
    
    def _initialize_web3(self) -> None:
        """Initialize Web3 connection and contract instance"""
        if not self.rpc_url:
            return
            
        try:
            # Initialize Web3
            self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            
            # Add POA middleware if needed (for testnets like Base Sepolia)
            if 'sepolia' in self.rpc_url.lower() or 'testnet' in self.rpc_url.lower():
                self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
            
            # Check connection
            if not self.w3.is_connected():
                logger.error("Failed to connect to Ethereum node")
                return
            
            logger.info(f"Connected to Ethereum node: {self.rpc_url}")
            logger.info(f"Chain ID: {self.w3.eth.chain_id}")
            
            # Load contract ABI
            contract_abi = self._load_contract_abi()
            if not contract_abi:
                logger.error("Failed to load contract ABI")
                return
            
            # Create contract instance
            if self.contract_address:
                self.contract = self.w3.eth.contract(
                    address=Web3.to_checksum_address(self.contract_address),
                    abi=contract_abi
                )
                logger.info(f"Contract instance created for address: {self.contract_address}")
                self.is_initialized = True
            
        except Exception as e:
            logger.error(f"Failed to initialize Web3: {e}")
    
    def _load_contract_abi(self) -> Optional[list]:
        """Load contract ABI from file or environment"""
        # Try to load from environment variable
        abi_json = os.getenv('RESULTS_REGISTRY_ABI')
        if abi_json:
            try:
                return json.loads(abi_json)
            except json.JSONDecodeError:
                logger.warning("Failed to parse ABI from environment variable")
        
        # Try to load from file
        abi_path = os.getenv('CONTRACT_ABI_PATH', './contracts/ResultsRegistry.abi')
        if os.path.exists(abi_path):
            try:
                with open(abi_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load ABI from file {abi_path}: {e}")
        
        logger.warning("No contract ABI available")
        return None
    
    def is_connected(self) -> bool:
        """Check if client is connected to blockchain"""
        return self.w3 is not None and self.w3.is_connected() and self.is_initialized
    
    def get_risk_score(self, contract_address: str) -> Optional[str]:
        """
        Get risk score for a contract from the blockchain
        
        Args:
            contract_address: The contract address to query
            
        Returns:
            Risk score string or None if not found
        """
        if not self.is_connected() or not self.contract:
            logger.warning("Client not initialized for read operations")
            return None
        
        try:
            checksum_address = Web3.to_checksum_address(contract_address)
            risk_score = self.contract.functions.getRiskScore(checksum_address).call()
            return risk_score
        except ContractLogicError as e:
            # Contract reverts when no score exists
            if "no risk score found" in str(e).lower():
                return None
            logger.error(f"Contract logic error: {e}")
        except Exception as e:
            logger.error(f"Failed to get risk score: {e}")
        
        return None
    
    def has_risk_score(self, contract_address: str) -> bool:
        """
        Check if a risk score exists for a contract
        
        Args:
            contract_address: The contract address to check
            
        Returns:
            True if risk score exists, False otherwise
        """
        if not self.is_connected() or not self.contract:
            return False
        
        try:
            checksum_address = Web3.to_checksum_address(contract_address)
            return self.contract.functions.hasRiskScore(checksum_address).call()
        except Exception as e:
            logger.error(f"Failed to check risk score existence: {e}")
            return False
    
    def write_risk_score(
        self, 
        contract_address: str, 
        risk_score: str, 
        risk_level: RiskLevel,
        gas_limit: int = 300000
    ) -> Optional[str]:
        """
        Write risk score to the blockchain
        
        Args:
            contract_address: The contract address to write score for
            risk_score: The risk score string to write
            risk_level: The risk level enum
            gas_limit: Gas limit for the transaction
            
        Returns:
            Transaction hash if successful, None otherwise
        """
        if not self.is_connected() or not self.contract:
            logger.error("Client not initialized for write operations")
            return None
        
        if not self.private_key:
            logger.error("No private key available for signing transactions")
            return None
        
        try:
            # Get account from private key
            account = self.w3.eth.account.from_key(self.private_key)
            checksum_address = Web3.to_checksum_address(contract_address)
            
            # Build transaction
            transaction = self.contract.functions.writeRiskScore(
                checksum_address,
                risk_score,
                risk_level.value
            ).build_transaction({
                'from': account.address,
                'gas': gas_limit,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(account.address),
                'chainId': self.w3.eth.chain_id
            })
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            logger.info(f"Transaction sent: {tx_hash.hex()}")
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            if receipt.status == 1:
                logger.info(f"Transaction confirmed: {tx_hash.hex()}")
                return tx_hash.hex()
            else:
                logger.error(f"Transaction failed: {tx_hash.hex()}")
                return None
            
        except ContractLogicError as e:
            logger.error(f"Contract logic error: {e}")
        except Exception as e:
            logger.error(f"Failed to write risk score: {e}")
        
        return None
    
    def convert_to_risk_level(self, risk_score: float) -> RiskLevel:
        """
        Convert numerical risk score to RiskLevel enum
        
        Args:
            risk_score: Numerical risk score (0.0 to 1.0)
            
        Returns:
            Corresponding RiskLevel enum value
        """
        if risk_score < 0.3:
            return RiskLevel.Safe
        elif risk_score < 0.7:
            return RiskLevel.Warning
        else:
            return RiskLevel.Dangerous
    
    def format_risk_score(self, analysis_result: Dict[str, Any]) -> str:
        """
        Format AI analysis result into a risk score string for blockchain storage
        
        Args:
            analysis_result: The AI analysis result dictionary
            
        Returns:
            Formatted risk score string
        """
        try:
            # Extract key information
            risk_score = analysis_result.get('risk_score', 0.0)
            risk_level = analysis_result.get('risk_level', 'unknown')
            explanation = analysis_result.get('explanation', '')
            
            # Truncate explanation if too long
            max_explanation_length = 150
            if len(explanation) > max_explanation_length:
                explanation = explanation[:max_explanation_length] + "..."
            
            # Create formatted string
            formatted_score = (
                f"Score: {risk_score:.3f} | "
                f"Level: {risk_level} | "
                f"Explanation: {explanation}"
            )
            
            # Ensure it doesn't exceed blockchain storage limits
            max_length = 256  # Matching contract MAX_RISK_SCORE_LENGTH
            if len(formatted_score) > max_length:
                formatted_score = formatted_score[:max_length-3] + "..."
            
            return formatted_score
            
        except Exception as e:
            logger.error(f"Failed to format risk score: {e}")
            return f"AI Analysis Error: {str(e)[:200]}"

# Singleton instance for easy import
smart_contract_client = SmartContractClient()