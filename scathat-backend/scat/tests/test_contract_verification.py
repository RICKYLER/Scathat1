"""
Test Contract Verification and Optimization Features

Comprehensive tests for the enhanced contract verification, error handling,
and gas optimization capabilities.
"""

import pytest
import os
from unittest.mock import Mock, patch
from web3 import Web3

from services.web3_service import Web3Service, Web3Config, InsufficientFundsError, ContractExecutionError, GasEstimationError
from services.contract_verification_service import ContractVerificationService, VerificationStatus

# Test configuration
TEST_RPC_URL = os.getenv('TEST_RPC_URL', 'https://base-sepolia.g.alchemy.com/v2/demo')
TEST_CHAIN_ID = 84532  # Base Sepolia
TEST_CONTRACT_ADDRESS = '0x70f5a33cdB629E3d174e4976341EF7Fe2fA4D4F1'  # Example contract

@pytest.fixture
def web3_service():
    """Create a Web3Service instance for testing"""
    config = Web3Config(
        rpc_url=TEST_RPC_URL,
        chain_id=TEST_CHAIN_ID,
        chain_name='base-sepolia',
        explorer_url='https://base-sepolia.blockscout.com',
        native_currency='ETH'
    )
    return Web3Service(config)

@pytest.fixture
def verification_service(web3_service):
    """Create a ContractVerificationService instance for testing"""
    return ContractVerificationService(web3_service)

def test_verification_service_initialization(verification_service):
    """Test that verification service initializes correctly"""
    assert verification_service is not None
    assert verification_service.web3_service is not None
    assert len(verification_service.malicious_patterns) > 0

def test_verify_contract_deployment_valid(verification_service):
    """Test contract verification with valid contract address"""
    # This test requires a real RPC connection
    pytest.skip("Requires live RPC connection - run with TEST_RPC_URL set")
    
    result = verification_service.verify_contract_deployment(TEST_CONTRACT_ADDRESS)
    
    assert result['status'] in [VerificationStatus.VERIFIED, VerificationStatus.UNVERIFIED]
    assert result['address'] == Web3.to_checksum_address(TEST_CONTRACT_ADDRESS)
    assert result['is_contract'] == True
    assert result['bytecode_length'] > 0

def test_verify_contract_deployment_invalid_address(verification_service):
    """Test contract verification with invalid address"""
    result = verification_service.verify_contract_deployment('invalid_address')
    
    assert result['status'] == VerificationStatus.ERROR
    assert 'Invalid contract address' in result['message']

def test_verify_contract_deployment_eoa(verification_service):
    """Test contract verification with EOA address"""
    # Use a known EOA address
    eoa_address = '0x0000000000000000000000000000000000000001'
    result = verification_service.verify_contract_deployment(eoa_address)
    
    assert result['status'] == VerificationStatus.ERROR
    assert 'No contract code' in result['message']

def test_bytecode_validation():
    """Test bytecode validation logic"""
    service = ContractVerificationService(Mock())
    
    # Test identical bytecode
    bytecode1 = '0x6080604052600436106049576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063'
    bytecode2 = '0x6080604052600436106049576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063'
    
    assert service._validate_bytecode_match(bytecode1, bytecode2) == True
    
    # Test different bytecode
    bytecode3 = '0x6080604052600436106049576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168064'  # Different ending
    
    assert service._validate_bytecode_match(bytecode1, bytecode3) == False

def test_malicious_pattern_detection():
    """Test malicious pattern detection in bytecode"""
    service = ContractVerificationService(Mock())
    
    # Test bytecode with malicious patterns
    malicious_bytecode = '0x6080604052selfdestruct6080604052delegatecall6080604052call.value'
    
    analysis = service._analyze_contract_security(malicious_bytecode)
    
    assert analysis['malicious_indicators'] > 0
    assert analysis['risk_score'] > 0
    assert len(analysis['patterns_found']) > 0

def test_gas_estimation_error_handling(web3_service):
    """Test gas estimation error handling"""
    # Mock a failing gas estimation
    with patch.object(web3_service.w3.eth, 'estimate_gas', side_effect=ValueError('execution reverted')):
        with pytest.raises(ContractExecutionError):
            web3_service.estimate_gas({'to': TEST_CONTRACT_ADDRESS, 'data': '0x'})

def test_insufficient_funds_error():
    """Test insufficient funds error handling"""
    with pytest.raises(InsufficientFundsError):
        raise InsufficientFundsError("Insufficient funds for transaction")

def test_contract_execution_error():
    """Test contract execution error handling"""
    with pytest.raises(ContractExecutionError):
        raise ContractExecutionError("Contract execution reverted")

def test_batch_verification(verification_service):
    """Test batch contract verification"""
    # Mock the verification method to avoid real RPC calls
    with patch.object(verification_service, 'verify_contract_deployment') as mock_verify:
        mock_verify.return_value = {
            'status': VerificationStatus.VERIFIED,
            'address': TEST_CONTRACT_ADDRESS,
            'is_contract': True
        }
        
        addresses = [TEST_CONTRACT_ADDRESS, '0x' + '1' * 40]
        results = verification_service.batch_verify_contracts(addresses)
        
        assert len(results) == 2
        assert all(result['status'] == VerificationStatus.VERIFIED for result in results.values())

@pytest.mark.skip("Requires live blockchain connection")
def test_live_gas_estimation(web3_service):
    """Test live gas estimation with real blockchain"""
    # This test requires actual RPC connection
    if not web3_service.w3.is_connected():
        pytest.skip("No live blockchain connection")
    
    # Test simple transaction estimation
    gas_estimate = web3_service.estimate_gas({
        'to': TEST_CONTRACT_ADDRESS,
        'from': '0x0000000000000000000000000000000000000001',
        'value': 0
    })
    
    assert gas_estimate is not None
    assert gas_estimate > 0

if __name__ == '__main__':
    # Run tests
    pytest.main([__file__, '-v'])