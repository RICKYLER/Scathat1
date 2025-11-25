"""
Blockchain Explorer Service

Provides functionality to interact with blockchain explorers like Etherscan, BscScan, etc.
Handles contract verification, source code retrieval, and transaction history analysis.
"""

import logging
import aiohttp
import asyncio
import time
from typing import Dict, Any, Optional, Tuple, List
from dataclasses import dataclass
from urllib.parse import urlencode

logger = logging.getLogger(__name__)

@dataclass
class ExplorerConfig:
    """Configuration for blockchain explorer APIs."""
    api_key: str
    base_url: str
    chain_id: int
    chain_name: str
    timeout: int = 30
    max_retries: int = 3
    retry_delay: float = 1.0

class ExplorerService:
    """Service for interacting with blockchain explorers."""
    
    def __init__(self, config: ExplorerConfig):
        """
        Initialize the explorer service.
        
        Args:
            config (ExplorerConfig): Configuration for the explorer API
        """
        self.config = config
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        """Async context manager entry."""
        await self._ensure_session()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()
        
    async def _ensure_session(self):
        """Ensure aiohttp session is created."""
        if self.session is None or self.session.closed:
            connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
            self.session = aiohttp.ClientSession(connector=connector)
    
    async def close(self):
        """Close the aiohttp session."""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def fetch_contract_data(self, address: str) -> Dict[str, Any]:
        """
        Fetch comprehensive contract data from Basescan API.
        
        Makes authenticated API calls to Basescan to retrieve both source code and ABI
        for a given contract address. Includes comprehensive error handling, retry logic,
        and proper parameter encoding.
        
        Args:
            address (str): The contract address to fetch data for
            
        Returns:
            Dict[str, Any]: Structured dictionary containing:
                - 'source_code': Verified source code if successful (str)
                - 'abi': Contract ABI if successful (list)
                - 'error': Descriptive error message if failed (str)
                - 'success': Boolean indicating overall success
                
        Example:
            >>> async with ExplorerService(config) as service:
            ...     result = await service.fetch_contract_data("0x123...")
            ...     if result['success']:
            ...         print(result['source_code'])
            ...         print(result['abi'])
        """
        result = {
            'source_code': None,
            'abi': None,
            'error': None,
            'success': False
        }
        
        # Validate contract address format
        if not self._is_valid_address(address):
            result['error'] = f"Invalid contract address format: {address}"
            logger.warning(result['error'])
            return result
        
        try:
            await self._ensure_session()
            
            # Fetch source code and ABI concurrently using async
            source_code_task = self._fetch_with_retry(
                'contract', 'getsourcecode', {'address': address}
            )
            abi_task = self._fetch_with_retry(
                'contract', 'getabi', {'address': address}
            )
            
            # Wait for both requests to complete
            source_code_result, abi_result = await asyncio.gather(
                source_code_task, abi_task, return_exceptions=True
            )
            
            # Process source code result
            if not isinstance(source_code_result, Exception) and source_code_result and source_code_result.get('status') == '1':
                source_data = source_code_result.get('result', [{}])[0]
                result['source_code'] = source_data.get('SourceCode', '')
            else:
                error_msg = source_code_result.get('message', 'Unknown error') if not isinstance(source_code_result, Exception) and source_code_result else 'No response or error occurred'
                logger.warning(f"Failed to fetch source code for {address}: {error_msg}")
            
            # Process ABI result
            if not isinstance(abi_result, Exception) and abi_result and abi_result.get('status') == '1':
                result['abi'] = abi_result.get('result')
            else:
                error_msg = abi_result.get('message', 'Unknown error') if not isinstance(abi_result, Exception) and abi_result else 'No response or error occurred'
                logger.warning(f"Failed to fetch ABI for {address}: {error_msg}")
            
            # Determine overall success
            if result['source_code'] is not None or result['abi'] is not None:
                result['success'] = True
            else:
                result['error'] = f"Failed to retrieve both source code and ABI for {address}"
                
        except Exception as e:
            error_msg = f"Unexpected error fetching contract data for {address}: {str(e)}"
            result['error'] = error_msg
            logger.error(error_msg)
        
        return result
    
    async def _fetch_with_retry(self, module: str, action: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Make API request with retry logic for transient failures.
        
        Args:
            module (str): API module name
            action (str): API action name
            params (Dict[str, Any]): Additional parameters
            
        Returns:
            Optional[Dict[str, Any]]: API response data or None if all retries failed
        """
        base_params = {
            'module': module,
            'action': action,
            'apikey': self.config.api_key
        }
        all_params = {**base_params, **params}
        
        for attempt in range(self.config.max_retries + 1):
            try:
                async with self.session.get(
                    self.config.base_url,
                    params=all_params,
                    timeout=aiohttp.ClientTimeout(total=self.config.timeout)
                ) as response:
                    response.raise_for_status()
                    
                    data = await response.json()
                    
                    # Handle rate limiting
                    if data.get('message') == 'NOTOK' and 'rate limit' in data.get('result', '').lower():
                        if attempt < self.config.max_retries:
                            delay = self.config.retry_delay * (2 ** attempt)
                            logger.warning(f"Rate limited on attempt {attempt + 1}. Retrying in {delay}s...")
                            await asyncio.sleep(delay)
                            continue
                        else:
                            logger.error("Max retries exceeded due to rate limiting")
                            return None
                    
                    return data
                    
            except aiohttp.ClientResponseError as e:
                if e.status == 429:  # Rate limited
                    if attempt < self.config.max_retries:
                        delay = self.config.retry_delay * (2 ** attempt)
                        logger.warning(f"HTTP 429 Rate limited on attempt {attempt + 1}. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error("Max retries exceeded due to HTTP 429 rate limiting")
                        return None
                elif 400 <= e.status < 500:
                    logger.error(f"HTTP {e.status} error: {str(e)}")
                    return None
                else:
                    if attempt < self.config.max_retries:
                        delay = self.config.retry_delay
                        logger.warning(f"HTTP error on attempt {attempt + 1}. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error(f"Max retries exceeded after HTTP error: {str(e)}")
                        return None
                        
            except (aiohttp.ClientConnectionError, aiohttp.ClientError) as e:
                if attempt < self.config.max_retries:
                    delay = self.config.retry_delay * (2 ** attempt)
                    logger.warning(f"Network error on attempt {attempt + 1}. Retrying in {delay}s...: {str(e)}")
                    await asyncio.sleep(delay)
                    continue
                else:
                    logger.error(f"Max retries exceeded after network error: {str(e)}")
                    return None
                    
            except Exception as e:
                logger.error(f"Unexpected error in API request: {str(e)}")
                return None
        
        return None
    
    def _is_valid_address(self, address: str) -> bool:
        """
        Validate Ethereum/BSC contract address format.
        
        Args:
            address (str): Address to validate
            
        Returns:
            bool: True if address format is valid
        """
        if not address or not isinstance(address, str):
            return False
        
        # Basic format validation - should start with 0x and be 42 characters
        if not address.startswith('0x') or len(address) != 42:
            return False
            
        # Check if it's a valid hexadecimal string
        try:
            int(address, 16)
            return True
        except ValueError:
            return False
        
    async def get_contract_abi(self, contract_address: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve contract ABI from the blockchain explorer.
        
        Args:
            contract_address (str): The contract address to query
            
        Returns:
            Optional[Dict[str, Any]]: Contract ABI if available, None otherwise
        """
        try:
            await self._ensure_session()
            
            params = {
                'module': 'contract',
                'action': 'getabi',
                'address': contract_address,
                'apikey': self.config.api_key
            }
            
            async with self.session.get(self.config.base_url, params=params) as response:
                response.raise_for_status()
                
                data = await response.json()
                if data['status'] == '1' and data['message'] == 'OK':
                    return data['result']
                else:
                    logger.warning(f"Failed to get ABI for {contract_address}: {data['message']}")
                    return None
                    
        except aiohttp.ClientError as e:
            logger.error(f"Request error getting ABI for {contract_address}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting ABI for {contract_address}: {str(e)}")
            return None
    
    async def get_contract_source_code(self, contract_address: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve contract source code from the blockchain explorer.
        
        Args:
            contract_address (str): The contract address to query
            
        Returns:
            Optional[Dict[str, Any]]: Contract source code if available, None otherwise
        """
        try:
            await self._ensure_session()
            
            params = {
                'module': 'contract',
                'action': 'getsourcecode',
                'address': contract_address,
                'apikey': self.config.api_key
            }
            
            async with self.session.get(self.config.base_url, params=params) as response:
                response.raise_for_status()
                
                data = await response.json()
                if data['status'] == '1' and data['message'] == 'OK':
                    return data['result']
                else:
                    logger.warning(f"Failed to get source code for {contract_address}: {data['message']}")
                    return None
                    
        except aiohttp.ClientError as e:
            logger.error(f"Request error getting source code for {contract_address}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting source code for {contract_address}: {str(e)}")
            return None
    
    async def get_transaction_history(self, contract_address: str, start_block: int = 0, end_block: int = 99999999) -> Optional[Dict[str, Any]]:
        """
        Retrieve transaction history for a contract address.
        
        Args:
            contract_address (str): The contract address to query
            start_block (int): Starting block number
            end_block (int): Ending block number
            
        Returns:
            Optional[Dict[str, Any]]: Transaction history if available, None otherwise
        """
        try:
            await self._ensure_session()
            
            params = {
                'module': 'account',
                'action': 'txlist',
                'address': contract_address,
                'startblock': start_block,
                'endblock': end_block,
                'sort': 'asc',
                'apikey': self.config.api_key
            }
            
            async with self.session.get(self.config.base_url, params=params) as response:
                response.raise_for_status()
                
                data = await response.json()
                if data['status'] == '1' and data['message'] == 'OK':
                    return data['result']
                else:
                    logger.warning(f"Failed to get transaction history for {contract_address}: {data['message']}")
                    return None
                    
        except aiohttp.ClientError as e:
            logger.error(f"Request error getting transaction history for {contract_address}: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error getting transaction history for {contract_address}: {str(e)}")
            return None
    
    async def verify_contract(self, contract_address: str, source_code: str, compiler_version: str, optimization_used: bool = False) -> bool:
        """
        Verify contract source code on the blockchain explorer.
        
        Args:
            contract_address (str): The contract address to verify
            source_code (str): The contract source code
            compiler_version (str): Compiler version used
            optimization_used (bool): Whether optimization was used
            
        Returns:
            bool: True if verification was successful, False otherwise
        """
        # TODO: Implement contract verification logic
        logger.warning("Contract verification not yet implemented")
        return False