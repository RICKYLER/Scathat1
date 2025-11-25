"""
Integration tests for ExplorerService.
"""

import pytest
from unittest.mock import patch
from services.explorer_service import ExplorerService, ExplorerConfig


class TestExplorerService:
    """Tests for ExplorerService functionality."""
    
    def setup_method(self):
        """Set up test service instance."""
        self.config = ExplorerConfig(
            api_key="demo_key",
            chain_id=84532
        )
        self.service = ExplorerService(self.config)
    
    @patch('services.explorer_service.requests.get')
    def test_get_contract_source_code_success(self, mock_get):
        """Test successful contract source code retrieval."""
        # Mock successful API response
        mock_response = mock_get.return_value
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "1",
            "message": "OK",
            "result": [{
                "SourceCode": "pragma solidity ^0.8.0; contract Test {}",
                "ContractName": "Test",
                "CompilerVersion": "v0.8.20+commit.a1b79de6"
            }]
        }
        
        result = self.service.get_contract_source_code("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
        
        assert result["source_code"] == "pragma solidity ^0.8.0; contract Test {}"
        assert result["contract_name"] == "Test"
        assert result["compiler_version"] == "v0.8.20+commit.a1b79de6"
    
    @patch('services.explorer_service.requests.get')
    def test_get_contract_source_code_api_error(self, mock_get):
        """Test API error handling."""
        # Mock API error
        mock_response = mock_get.return_value
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        
        result = self.service.get_contract_source_code("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
        
        # Should return None on error
        assert result is None
    
    @patch('services.explorer_service.requests.get')
    def test_get_contract_source_code_invalid_response(self, mock_get):
        """Test handling of invalid API response format."""
        # Mock invalid response format
        mock_response = mock_get.return_value
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "0",
            "message": "No data found"
        }
        
        result = self.service.get_contract_source_code("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
        
        # Should return None for invalid responses
        assert result is None
    
    def test_get_explorer_url(self):
        """Test explorer URL generation."""
        url = self.service.get_explorer_url("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
        assert url == "https://base-sepolia.blockscout.com/address/0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    
    def test_invalid_chain_id(self):
        """Test behavior with invalid chain ID."""
        config = ExplorerConfig(
            api_key="demo_key",
            chain_id=999  # Invalid chain ID
        )
        service = ExplorerService(config)
        
        # Should return None for unsupported chain
        result = service.get_contract_source_code("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
        assert result is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])