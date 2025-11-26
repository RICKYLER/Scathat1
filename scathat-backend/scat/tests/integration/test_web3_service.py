"""
Integration tests for Web3Service.
"""

import pytest
from unittest.mock import patch, MagicMock
from services.web3_service import Web3Service, Web3Config


class TestWeb3Service:
    """Tests for Web3Service functionality."""
    
    def setup_method(self):
        """Set up test service instance."""
        self.config = Web3Config(
            chain_id=84532,
            rpc_url="https://base-sepolia.g.alchemy.com/v2/demo"
        )
        self.service = Web3Service(self.config)
    
    @patch('services.web3_service.Web3')
    def test_initialize_web3_success(self, mock_web3):
        """Test successful Web3 initialization."""
        # Mock Web3 instance
        mock_web3_instance = MagicMock()
        mock_web3.return_value = mock_web3_instance
        
        # Mock successful connection
        mock_web3_instance.is_connected.return_value = True
        
        service = Web3Service(self.config)
        
        assert service.web3 is not None
        assert service.web3.is_connected() == True
    
    @patch('services.web3_service.Web3')
    def test_initialize_web3_connection_failure(self, mock_web3):
        """Test Web3 connection failure."""
        # Mock Web3 instance with connection failure
        mock_web3_instance = MagicMock()
        mock_web3.return_value = mock_web3_instance
        mock_web3_instance.is_connected.return_value = False
        
        service = Web3Service(self.config)
        
        # Should still have web3 instance but not connected
        assert service.web3 is not None
        assert service.web3.is_connected() == False
    
    @patch('services.web3_service.Web3')
    def test_read_score_from_chain_success(self, mock_web3):
        """Test successful score reading from chain."""
        # Mock Web3 and contract
        mock_web3_instance = MagicMock()
        mock_web3.return_value = mock_web3_instance
        mock_web3_instance.is_connected.return_value = True
        
        mock_contract = MagicMock()
        mock_contract.functions.getRiskLevel.return_value.call.return_value = 2  # MEDIUM
        mock_web3_instance.eth.contract.return_value = mock_contract
        
        service = Web3Service(self.config)
        
        # Test reading score
        result = service.read_score_from_chain(
            "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            "0x1234567890abcdef1234567890abcdef12345678"
        )
        
        assert result == "MEDIUM"
    
    @patch('services.web3_service.Web3')
    def test_read_score_from_chain_contract_error(self, mock_web3):
        """Test contract call error handling."""
        # Mock Web3 and contract with error
        mock_web3_instance = MagicMock()
        mock_web3.return_value = mock_web3_instance
        mock_web3_instance.is_connected.return_value = True
        
        mock_contract = MagicMock()
        mock_contract.functions.getRiskLevel.return_value.call.side_effect = Exception("Contract error")
        mock_web3_instance.eth.contract.return_value = mock_contract
        
        service = Web3Service(self.config)
        
        # Test reading score with error
        result = service.read_score_from_chain(
            "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            "0x1234567890abcdef1234567890abcdef12345678"
        )
        
        # Should return None on error
        assert result is None
    
    @patch('services.web3_service.Web3')
    def test_read_score_from_chain_no_registry(self, mock_web3):
        """Test reading score when no registry address is configured."""
        # Mock Web3
        mock_web3_instance = MagicMock()
        mock_web3.return_value = mock_web3_instance
        mock_web3_instance.is_connected.return_value = True
        
        service = Web3Service(self.config)
        
        # Test reading score without registry address
        result = service.read_score_from_chain(
            "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            None  # No registry address
        )
        
        # Should return None when no registry
        assert result is None
    
    def test_get_risk_level_name(self):
        """Test risk level name conversion."""
        assert self.service._get_risk_level_name(0) == "LOW"
        assert self.service._get_risk_level_name(1) == "LOW"
        assert self.service._get_risk_level_name(2) == "MEDIUM"
        assert self.service._get_risk_level_name(3) == "HIGH"
        assert self.service._get_risk_level_name(4) == "CRITICAL"
        assert self.service._get_risk_level_name(999) == "UNKNOWN"
    
    def test_validate_address(self):
        """Test address validation."""
        # Valid addresses
        assert self.service._validate_address("0x742d35Cc6634C0532925a3b844Bc454e4438f44e") == True
        assert self.service._validate_address("0x1234567890abcdef1234567890abcdef12345678") == True
        
        # Invalid addresses
        assert self.service._validate_address("invalid") == False
        assert self.service._validate_address("0x123") == False
        assert self.service._validate_address("") == False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])