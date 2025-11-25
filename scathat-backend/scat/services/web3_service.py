"""
Web3 Service

Provides Web3 integration for direct blockchain interaction, contract deployment,
and real-time data retrieval from various blockchain networks.
"""

import logging
from web3 import Web3
from web3.exceptions import ContractLogicError, TransactionNotFound
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass
import json

logger = logging.getLogger(__name__)

@dataclass
class Web3Config:
    """Configuration for Web3 provider connections."""
    rpc_url: str
    chain_id: int
    chain_name: str
    explorer_url: str
    native_currency: str

class Web3Service:
    """Service for Web3 blockchain interactions."""
    
    def __init__(self, config: Web3Config):
        """
        Initialize the Web3 service.
        
        Args:
            config (Web3Config): Configuration for Web3 provider
        """
        self.config = config
        self.w3 = Web3(Web3.HTTPProvider(config.rpc_url))
        
        # Check connection
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to {config.chain_name} at {config.rpc_url}")
        
        logger.info(f"Connected to {config.chain_name} (Chain ID: {config.chain_id})")
    
    def get_contract_instance(self, contract_address: str, abi: Optional[List[Dict[str, Any]]] = None) -> Optional[Any]:
        """
        Get a Web3 contract instance for interaction.
        
        Args:
            contract_address (str): The contract address
            abi (Optional[List[Dict[str, Any]]]): Contract ABI
            
        Returns:
            Optional[Any]: Web3 contract instance if successful
        """
        try:
            # Validate address format
            if not self.w3.is_address(contract_address):
                logger.error(f"Invalid contract address: {contract_address}")
                return None
            
            checksum_address = self.w3.to_checksum_address(contract_address)
            
            if abi:
                contract = self.w3.eth.contract(address=checksum_address, abi=abi)
            else:
                # Try to get contract code to see if it's a contract
                code = self.w3.eth.get_code(checksum_address)
                if code == b'':
                    logger.error(f"No contract code at address: {contract_address}")
                    return None
                
                # Create basic contract instance without ABI
                contract = self.w3.eth.contract(address=checksum_address)
            
            return contract
            
        except Exception as e:
            logger.error(f"Error creating contract instance for {contract_address}: {str(e)}")
            return None
    
    def get_contract_code(self, contract_address: str) -> Optional[str]:
        """
        Get contract bytecode from blockchain.
        
        Args:
            contract_address (str): The contract address
            
        Returns:
            Optional[str]: Contract bytecode as hex string
        """
        try:
            checksum_address = self.w3.to_checksum_address(contract_address)
            code = self.w3.eth.get_code(checksum_address)
            return code.hex() if code else None
            
        except Exception as e:
            logger.error(f"Error getting contract code for {contract_address}: {str(e)}")
            return None
    
    def read_contract_state(self, contract_address: str, abi: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Read current state of a contract by calling view functions.
        
        Args:
            contract_address (str): The contract address
            abi (List[Dict[str, Any]]): Contract ABI
            
        Returns:
            Optional[Dict[str, Any]]: Contract state information
        """
        try:
            contract = self.get_contract_instance(contract_address, abi)
            if not contract:
                return None
            
            state = {}
            
            # Get all view functions from ABI
            view_functions = [
                func for func in abi 
                if func.get('type') == 'function' and 
                (func.get('stateMutability') == 'view' or func.get('constant'))
            ]
            
            for func in view_functions:
                func_name = func['name']
                try:
                    # Call the view function
                    result = getattr(contract.functions, func_name)().call()
                    state[func_name] = result
                except ContractLogicError as e:
                    logger.warning(f"Function {func_name} reverted: {str(e)}")
                    state[func_name] = f"REVERTED: {str(e)}"
                except Exception as e:
                    logger.warning(f"Error calling {func_name}: {str(e)}")
                    state[func_name] = f"ERROR: {str(e)}"
            
            return state
            
        except Exception as e:
            logger.error(f"Error reading contract state for {contract_address}: {str(e)}")
            return None
    
    def get_transaction_receipt(self, tx_hash: str) -> Optional[Dict[str, Any]]:
        """
        Get transaction receipt for a given transaction hash.
        
        Args:
            tx_hash (str): The transaction hash
            
        Returns:
            Optional[Dict[str, Any]]: Transaction receipt if found
        """
        try:
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            return dict(receipt)
            
        except TransactionNotFound:
            logger.warning(f"Transaction not found: {tx_hash}")
            return None
        except Exception as e:
            logger.error(f"Error getting transaction receipt for {tx_hash}: {str(e)}")
            return None
    
    def get_block_info(self, block_number: int) -> Optional[Dict[str, Any]]:
        """
        Get block information for a given block number.
        
        Args:
            block_number (int): The block number
            
        Returns:
            Optional[Dict[str, Any]]: Block information if found
        """
        try:
            block = self.w3.eth.get_block(block_number)
            return dict(block)
            
        except Exception as e:
            logger.error(f"Error getting block info for {block_number}: {str(e)}")
            return None
    
    def get_gas_price(self) -> Optional[int]:
        """
        Get current gas price from the network.
        
        Returns:
            Optional[int]: Current gas price in wei
        """
        try:
            return self.w3.eth.gas_price
        except Exception as e:
            logger.error(f"Error getting gas price: {str(e)}")
            return None
    
    def get_balance(self, address: str) -> Optional[int]:
        """
        Get native currency balance for an address.
        
        Args:
            address (str): The wallet address
            
        Returns:
            Optional[int]: Balance in wei
        """
        try:
            checksum_address = self.w3.to_checksum_address(address)
            return self.w3.eth.get_balance(checksum_address)
        except Exception as e:
            logger.error(f"Error getting balance for {address}: {str(e)}")
            return None
    
    def estimate_gas(self, transaction: Dict[str, Any]) -> Optional[int]:
        """
        Estimate gas required for a transaction.
        
        Args:
            transaction (Dict[str, Any]): Transaction parameters
            
        Returns:
            Optional[int]: Estimated gas limit
        """
        try:
            return self.w3.eth.estimate_gas(transaction)
        except Exception as e:
            logger.error(f"Error estimating gas: {str(e)}")
            return None
    
    def get_chain_info(self) -> Dict[str, Any]:
        """
        Get information about the connected blockchain.
        
        Returns:
            Dict[str, Any]: Chain information
        """
        return {
            "chain_id": self.config.chain_id,
            "chain_name": self.config.chain_name,
            "block_number": self.w3.eth.block_number,
            "gas_price": self.get_gas_price(),
            "is_connected": self.w3.is_connected(),
            "client_version": self.w3.client_version if hasattr(self.w3, 'client_version') else "unknown"
        }

    def write_score_to_chain(self, contract_address: str, risk_score: str, 
                           private_key: str, registry_address: str, 
                           registry_abi: List[Dict[str, Any]]) -> Optional[str]:
        """
        Write risk score to the ResultsRegistry contract on-chain.
        
        Args:
            contract_address (str): The contract address to score
            risk_score (str): The risk score to write
            private_key (str): Private key for signing transaction
            registry_address (str): ResultsRegistry contract address
            registry_abi (List[Dict[str, Any]]): ResultsRegistry contract ABI
            
        Returns:
            Optional[str]: Transaction hash if successful
        """
        try:
            # Get contract instance
            registry_contract = self.get_contract_instance(registry_address, registry_abi)
            if not registry_contract:
                logger.error(f"Failed to get ResultsRegistry instance at {registry_address}")
                return None
            
            # Build transaction
            transaction = registry_contract.functions.writeRiskScore(
                self.w3.to_checksum_address(contract_address),
                risk_score
            ).build_transaction({
                'from': self.w3.eth.account.from_key(private_key).address,
                'nonce': self.w3.eth.get_transaction_count(self.w3.eth.account.from_key(private_key).address),
                'gas': 100000,  # Adjust based on contract requirements
                'gasPrice': self.w3.eth.gas_price
            })
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, private_key)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            logger.info(f"Risk score written to chain for {contract_address}. Tx hash: {tx_hash.hex()}")
            return tx_hash.hex()
            
        except Exception as e:
            logger.error(f"Error writing risk score to chain for {contract_address}: {str(e)}")
            return None

    def read_score_from_chain(self, contract_address: str, 
                            registry_address: str, 
                            registry_abi: List[Dict[str, Any]]) -> Optional[str]:
        """
        Read risk score from the ResultsRegistry contract on-chain.
        
        Args:
            contract_address (str): The contract address to query
            registry_address (str): ResultsRegistry contract address
            registry_abi (List[Dict[str, Any]]): ResultsRegistry contract ABI
            
        Returns:
            Optional[str]: Risk score if found, None otherwise
        """
        try:
            # Get contract instance
            registry_contract = self.get_contract_instance(registry_address, registry_abi)
            if not registry_contract:
                logger.error(f"Failed to get ResultsRegistry instance at {registry_address}")
                return None
            
            # Call the view function
            risk_score = registry_contract.functions.riskScores(
                self.w3.to_checksum_address(contract_address)
            ).call()
            
            logger.info(f"Risk score read from chain for {contract_address}: {risk_score}")
            return risk_score
            
        except Exception as e:
            logger.error(f"Error reading risk score from chain for {contract_address}: {str(e)}")
            return None