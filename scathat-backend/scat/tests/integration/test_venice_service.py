"""
Integration tests for VeniceService.
"""

import pytest
from unittest.mock import patch, AsyncMock
from services.venice_service import VeniceService, VeniceConfig


class TestVeniceService:
    """Tests for VeniceService functionality."""
    
    def setup_method(self):
        """Set up test service instance."""
        self.config = VeniceConfig(
            api_url="https://api.venice.ai/api/v1/analyze",
            api_key="demo_key",
            model_id="claude-3-sonnet-20240229"
        )
        self.service = VeniceService(self.config)
    
    @patch('services.venice_service.aiohttp.ClientSession.post')
    def test_analyze_contract_code_success(self, mock_post):
        """Test successful contract analysis."""
        # Mock successful API response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {
            "risk_score": "MEDIUM",
            "confidence": 0.85,
            "vulnerabilities": []
        }
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Run the async test
        async def run_test():
            result = await self.service.analyze_contract_code(
                "pragma solidity ^0.8.0; contract Test {}",
                "Test",
                "0.8.20"
            )
            
            assert result["risk_score"] == "MEDIUM"
            assert result["confidence"] == 0.85
            assert result["vulnerabilities"] == []
        
        # Run the async function
        import asyncio
        asyncio.run(run_test())
    
    @patch('services.venice_service.aiohttp.ClientSession.post')
    def test_analyze_contract_code_api_error(self, mock_post):
        """Test API error handling."""
        # Mock API error
        mock_response = AsyncMock()
        mock_response.status = 500
        mock_response.text.return_value = "Internal Server Error"
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Run the async test
        async def run_test():
            result = await self.service.analyze_contract_code(
                "pragma solidity ^0.8.0; contract Test {}",
                "Test",
                "0.8.20"
            )
            
            # Should return demo response on error
            assert result["risk_score"] == "MEDIUM"
            assert result["confidence"] == 0.7
            assert "vulnerabilities" in result
        
        # Run the async function
        import asyncio
        asyncio.run(run_test())
    
    @patch('services.venice_service.aiohttp.ClientSession.post')
    def test_analyze_contract_code_invalid_response(self, mock_post):
        """Test handling of invalid API response format."""
        # Mock invalid response format
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {"invalid": "response"}
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Run the async test
        async def run_test():
            result = await self.service.analyze_contract_code(
                "pragma solidity ^0.8.0; contract Test {}",
                "Test",
                "0.8.20"
            )
            
            # Should return demo response on invalid format
            assert result["risk_score"] == "MEDIUM"
            assert result["confidence"] == 0.7
            assert "vulnerabilities" in result
        
        # Run the async function
        import asyncio
        asyncio.run(run_test())
    
    def test_demo_fallback(self):
        """Test demo fallback functionality."""
        # Test with empty source code
        async def run_test():
            result = await self.service.analyze_contract_code("", "Test", "0.8.20")
            
            # Should return demo response
            assert result["risk_score"] == "MEDIUM"
            assert result["confidence"] == 0.7
            assert "vulnerabilities" in result
        
        # Run the async function
        import asyncio
        asyncio.run(run_test())


if __name__ == "__main__":
    pytest.main([__file__, "-v"])