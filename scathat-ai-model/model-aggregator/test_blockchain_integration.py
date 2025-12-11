#!/usr/bin/env python3
"""
Test script for blockchain integration

This script tests the connection between AI analysis and blockchain smart contract
"""

import os
import sys
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def test_blockchain_connection():
    """Test blockchain connection and smart contract client"""
    
    try:
        from smart_contract_client import smart_contract_client
        
        logger.info("Testing blockchain connection...")
        
        # Check connection
        if smart_contract_client.is_connected():
            logger.info("✅ Blockchain connection successful")
            logger.info(f"Chain ID: {smart_contract_client.w3.eth.chain_id}")
            logger.info(f"Contract address: {smart_contract_client.contract_address}")
        else:
            logger.warning("⚠️  Blockchain connection failed")
            logger.warning("Please check your environment variables:")
            logger.warning("- ETH_RPC_URL: Ethereum RPC endpoint")
            logger.warning("- RESULTS_REGISTRY_ADDRESS: Deployed contract address")
            logger.warning("- PRIVATE_KEY: Wallet private key (for writes)")
            return False
        
        return True
        
    except ImportError:
        logger.error("❌ Smart contract client not available")
        return False
    except Exception as e:
        logger.error(f"❌ Blockchain connection test failed: {e}")
        return False

def test_ai_to_blockchain_integration():
    """Test complete AI to blockchain integration"""
    
    try:
        from model_aggregator import ResultAggregator
        from model_aggregator import create_sample_model_outputs
        
        logger.info("Testing AI to blockchain integration...")
        
        # Create aggregator
        aggregator = ResultAggregator()
        
        # Generate sample analysis
        sample_outputs = create_sample_model_outputs()
        result = aggregator.aggregate(sample_outputs)
        
        logger.info(f"AI Analysis Result:")
        logger.info(f"  Risk Score: {result['final_risk_score']}")
        logger.info(f"  Risk Level: {result['risk_level']}")
        logger.info(f"  Confidence: {result['overall_confidence']}")
        
        # Test blockchain write (using test address)
        test_contract_address = "0x1234567890123456789012345678901234567890"
        
        logger.info(f"Testing blockchain write for contract: {test_contract_address}")
        
        write_result = aggregator.write_to_blockchain(test_contract_address, result)
        
        if write_result['success']:
            logger.info("✅ Blockchain write successful!")
            logger.info(f"Transaction hash: {write_result['transaction_hash']}")
            return True
        else:
            logger.warning(f"⚠️  Blockchain write failed: {write_result['error']}")
            logger.warning("This is expected if:")
            logger.warning("- No private key configured")
            logger.warning("- Contract not deployed")
            logger.warning("- Insufficient funds")
            return False
        
    except Exception as e:
        logger.error(f"❌ AI to blockchain integration test failed: {e}")
        return False

def main():
    """Main test function"""
    
    logger.info("🚀 Starting AI to Blockchain Integration Test")
    logger.info("=" * 50)
    
    # Test blockchain connection
    connection_ok = test_blockchain_connection()
    
    if connection_ok:
        logger.info("\n" + "=" * 50)
        # Test full integration
        integration_ok = test_ai_to_blockchain_integration()
        
        if integration_ok:
            logger.info("\n🎉 All tests passed! AI to blockchain integration is working!")
        else:
            logger.info("\n⚠️  Integration test completed with warnings")
            logger.info("Some features may not work until blockchain is properly configured")
    else:
        logger.info("\n❌ Blockchain connection test failed")
        logger.info("Please configure your blockchain environment before testing integration")
    
    logger.info("\n" + "=" * 50)
    logger.info("Test completed")

if __name__ == "__main__":
    main()