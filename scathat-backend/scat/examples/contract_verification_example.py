"""
Contract Verification Example

Demonstrates the enhanced contract verification, error handling, and gas optimization
capabilities for comprehensive on-chain contract analysis with Base network integration.
"""

import os
import json
from services.web3_service import Web3Service, Web3Config
from services.contract_verification_service import ContractVerificationService, VerificationStatus
from services.network_config import get_web3_config, get_default_network

# Configuration - Using Base network configuration
NETWORK_NAME = os.getenv('NETWORK_NAME', get_default_network())
config = get_web3_config(NETWORK_NAME)

if not config:
    raise ValueError(f"Network configuration not found for: {NETWORK_NAME}")

RPC_URL = config.rpc_url
CHAIN_ID = config.chain_id
CHAIN_NAME = config.chain_name

# Example contract addresses for testing
CONTRACTS_TO_VERIFY = [
    '0x70f5a33cdB629E3d174e4976341EF7Fe2fA4D4F1',  # Your ResultsRegistry
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',  # WETH (Ethereum mainnet - should fail on testnet)
    '0x0000000000000000000000000000000000000001',  # EOA address
    'invalid_address',  # Invalid address
]

def setup_web3_service():
    """Set up Web3 service with Base network configuration"""
    return Web3Service(config)

def demonstrate_verification_capabilities():
    """Demonstrate comprehensive contract verification capabilities"""
    print("🔍 Scathat Contract Verification Demo")
    print("=" * 50)
    
    # Setup services
    try:
        web3_service = setup_web3_service()
        verification_service = ContractVerificationService(web3_service)
        
        print(f"✅ Connected to {CHAIN_NAME} (Chain ID: {CHAIN_ID})")
        print(f"📡 RPC URL: {RPC_URL}")
        print(f"🔗 Client version: {web3_service.w3.client_version if hasattr(web3_service.w3, 'client_version') else 'N/A'}")
        print()
        
    except Exception as e:
        print(f"❌ Failed to setup services: {e}")
        return
    
    # Demonstrate individual contract verification
    print("🧪 Individual Contract Verification:")
    print("-" * 40)
    
    for contract_address in CONTRACTS_TO_VERIFY:
        try:
            print(f"\nVerifying: {contract_address}")
            
            result = verification_service.verify_contract_deployment(contract_address)
            
            status_emoji = {
                VerificationStatus.VERIFIED: "✅",
                VerificationStatus.UNVERIFIED: "⚠️",
                VerificationStatus.SUSPICIOUS: "🔴",
                VerificationStatus.MALICIOUS: "💀",
                VerificationStatus.ERROR: "❌"
            }.get(result['status'], "❓")
            
            print(f"   Status: {status_emoji} {result['status'].value}")
            
            if result['status'] == VerificationStatus.VERIFIED:
                print(f"   ✅ Contract verified successfully")
                print(f"   📏 Bytecode length: {result.get('bytecode_length', 'N/A')} bytes")
                
                # Show security analysis if available
                security = result.get('security_analysis', {})
                if security:
                    print(f"   🛡️  Security score: {security.get('risk_score', 0)}/100")
                    if security.get('malicious_indicators', 0) > 0:
                        print(f"   ⚠️  Malicious patterns detected: {security.get('malicious_indicators', 0)}")
            
            elif result['status'] == VerificationStatus.ERROR:
                print(f"   ❌ Error: {result.get('message', 'Unknown error')}")
                
            elif result['status'] in [VerificationStatus.SUSPICIOUS, VerificationStatus.MALICIOUS]:
                print(f"   🔴 Security issues detected!")
                security = result.get('security_analysis', {})
                print(f"   💀 Risk score: {security.get('risk_score', 0)}/100")
                print(f"   ⚠️  Issues found: {security.get('patterns_found', [])}")
                
        except Exception as e:
            print(f"   💥 Verification failed: {e}")
    
    # Demonstrate batch verification
    print(f"\n\n🔄 Batch Contract Verification:")
    print("-" * 40)
    
    batch_results = verification_service.batch_verify_contracts(CONTRACTS_TO_VERIFY)
    
    verified_count = sum(1 for result in batch_results.values() 
                        if result.get('status') == VerificationStatus.VERIFIED)
    error_count = sum(1 for result in batch_results.values() 
                     if result.get('status') == VerificationStatus.ERROR)
    
    print(f"   📊 Results: {verified_count} verified, {error_count} errors, {len(CONTRACTS_TO_VERIFY) - verified_count - error_count} other")
    
    # Demonstrate gas optimization
    print(f"\n\n⛽ Gas Optimization Demo:")
    print("-" * 40)
    
    try:
        # Create a simple transaction for gas estimation
        sample_tx = {
            'to': CONTRACTS_TO_VERIFY[0],  # Use first contract
            'from': '0x0000000000000000000000000000000000000001',  # Dummy address
            'value': 0,
            'data': '0x'  # Empty data
        }
        
        gas_estimate = web3_service.estimate_gas(sample_tx)
        
        if gas_estimate:
            current_gas_price = web3_service.get_gas_price() or 0
            estimated_cost = gas_estimate * current_gas_price
            
            print(f"   📈 Gas estimate: {gas_estimate} units")
            print(f"   💰 Current gas price: {current_gas_price} wei")
            print(f"   💵 Estimated cost: {estimated_cost} wei ({estimated_cost / 10**18:.6f} ETH)")
            print(f"   🎯 Optimization: Added 20% safety margin to base estimate")
        else:
            print("   ❌ Gas estimation failed")
            
    except Exception as e:
        print(f"   💥 Gas estimation demo failed: {e}")
    
    # Demonstrate enhanced error handling
    print(f"\n\n🛡️ Enhanced Error Handling:")
    print("-" * 40)
    
    print("   ✅ Custom exception classes for specific error types:")
    print("      - InsufficientFundsError: Handle missing ETH for gas")
    print("      - ContractExecutionError: Handle contract reverts") 
    print("      - GasEstimationError: Handle gas estimation failures")
    print("      - ContractVerificationError: Handle verification issues")
    print("   ✅ Retry logic with exponential backoff")
    print("   ✅ Comprehensive error messages with context")
    print("   ✅ Graceful degradation for partial failures")
    
    print(f"\n\n🎯 Verification Capabilities Summary:")
    print("=" * 50)
    
    capabilities = [
        "✅ On-chain contract deployment verification",
        "✅ Bytecode validation and comparison", 
        "✅ Malicious pattern detection in bytecode",
        "✅ Security risk scoring (0-100 scale)",
        "✅ Batch verification for efficiency",
        "✅ Gas optimization with safety margins",
        "✅ Comprehensive error handling with retries",
        "✅ Custom exception classes for specific failures",
        "⚠️  Source code verification (requires compiler integration)",
        "⚠️  Multi-chain support (currently configured for Base Sepolia)"
    ]
    
    for capability in capabilities:
        print(f"   {capability}")

def main():
    """Main demonstration function"""
    try:
        demonstrate_verification_capabilities()
        print(f"\n🎉 Demo completed successfully!")
        print("\nNext steps:")
        print("1. Set RPC_URL environment variable for your target network")
        print("2. Configure chain parameters in Web3Config")
        print("3. Integrate verification service with your AI analysis pipeline")
        print("4. Add compiler integration for source code verification")
        
    except Exception as e:
        print(f"\n💥 Demo failed with error: {e}")
        print("\nMake sure you have:")
        print("1. A valid RPC URL for a supported blockchain")
        print("2. Internet connection for RPC access")
        print("3. Required Python packages installed (web3.py, etc.)")

if __name__ == "__main__":
    main()