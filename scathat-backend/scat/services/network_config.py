"""
Network Configuration

Provides pre-configured Web3Config instances for various blockchain networks
with optimized settings for Base Mainnet and Base Sepolia.
"""

from dataclasses import dataclass
from typing import Dict, Optional
import os
from .web3_service import Web3Config

@dataclass
class NetworkConfig:
    """Network configuration with optimized settings for different chains."""
    name: str
    chain_id: int
    rpc_url: str
    explorer_url: str
    native_currency: str
    gas_buffer: float = 1.2  # 20% gas buffer
    max_retries: int = 3
    timeout: int = 30

# Public RPC endpoints for testing
PUBLIC_BASE_SEPOLIA_RPC = "https://base-sepolia-rpc.publicnode.com"
PUBLIC_BASE_MAINNET_RPC = "https://base-rpc.publicnode.com"
PUBLIC_ETHEREUM_RPC = "https://ethereum-rpc.publicnode.com"

# Network configurations
NETWORK_CONFIGS: Dict[str, NetworkConfig] = {
    # Base Networks
    "base-mainnet": NetworkConfig(
        name="base-mainnet",
        chain_id=8453,
        rpc_url=os.getenv('BASE_RPC_URL', PUBLIC_BASE_MAINNET_RPC),
        explorer_url="https://basescan.org",
        native_currency="ETH",
        gas_buffer=1.2,
        max_retries=3
    ),
    
    "base-sepolia": NetworkConfig(
        name="base-sepolia", 
        chain_id=84532,
        rpc_url=os.getenv('BASE_SEPOLIA_RPC_URL', PUBLIC_BASE_SEPOLIA_RPC),
        explorer_url="https://base-sepolia.blockscout.com",
        native_currency="ETH",
        gas_buffer=1.25,  # Higher buffer for testnet volatility
        max_retries=5     # More retries for testnet reliability
    ),
    
    # Ethereum Networks
    "ethereum-mainnet": NetworkConfig(
        name="ethereum-mainnet",
        chain_id=1,
        rpc_url=os.getenv('ETHEREUM_RPC_URL', PUBLIC_ETHEREUM_RPC),
        explorer_url="https://etherscan.io",
        native_currency="ETH",
        gas_buffer=1.15
    ),
    
    "ethereum-sepolia": NetworkConfig(
        name="ethereum-sepolia",
        chain_id=11155111,
        rpc_url=os.getenv('ETHEREUM_SEPOLIA_RPC_URL', "https://ethereum-sepolia-rpc.publicnode.com"),
        explorer_url="https://sepolia.etherscan.io",
        native_currency="ETH",
        gas_buffer=1.2
    ),
    
    # Polygon Networks
    "polygon-mainnet": NetworkConfig(
        name="polygon-mainnet",
        chain_id=137,
        rpc_url=os.getenv('POLYGON_RPC_URL', "https://polygon-rpc.com"),
        explorer_url="https://polygonscan.com",
        native_currency="MATIC",
        gas_buffer=1.1
    ),
    
    # BSC Networks
    "bsc-mainnet": NetworkConfig(
        name="bsc-mainnet",
        chain_id=56,
        rpc_url=os.getenv('BSC_RPC_URL', "https://bsc-dataseed.binance.org"),
        explorer_url="https://bscscan.com",
        native_currency="BNB",
        gas_buffer=1.1
    )
}

def get_network_config(network_name: str) -> Optional[NetworkConfig]:
    """Get network configuration by name."""
    return NETWORK_CONFIGS.get(network_name)

def get_web3_config(network_name: str) -> Optional[Web3Config]:
    """Convert NetworkConfig to Web3Config for Web3Service."""
    network_config = get_network_config(network_name)
    if not network_config:
        return None
    
    return Web3Config(
        rpc_url=network_config.rpc_url,
        chain_id=network_config.chain_id,
        chain_name=network_config.name,
        explorer_url=network_config.explorer_url,
        native_currency=network_config.native_currency
    )

def get_all_network_names() -> list:
    """Get list of all available network names."""
    return list(NETWORK_CONFIGS.keys())

def get_default_network() -> str:
    """Get default network based on environment."""
    return os.getenv('DEFAULT_NETWORK', 'base-sepolia')

# Default configurations for easy access
BASE_MAINNET_CONFIG = get_web3_config('base-mainnet')
BASE_SEPOLIA_CONFIG = get_web3_config('base-sepolia')
ETHEREUM_MAINNET_CONFIG = get_web3_config('ethereum-mainnet')
ETHEREUM_SEPOLIA_CONFIG = get_web3_config('ethereum-sepolia')