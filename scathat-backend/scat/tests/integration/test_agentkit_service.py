"""
Integration tests for Coinbase AgentKitService.

Tests for the official Coinbase AgentKit integration.
<mcreference link="https://github.com/coinbase/agentkit" index="0">0</mcreference>
"""

import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from services.agentkit_service import AgentKitService, AgentKitRiskLevel


class TestAgentKitService:
    """Tests for Coinbase AgentKitService functionality."""
    
    def setup_method(self):
        """Set up test service instance."""
        self.service = AgentKitService(
            api_key="demo_key",
            cdp_api_key="test_cdp_key",
            cdp_api_secret="test_cdp_secret"
        )
    
    @patch('services.agentkit_service.ContractSecurityAnalyzer')
    @patch('services.agentkit_service.AGENTKIT_AVAILABLE', True)
    def test_analyze_with_agentkit_success(self, mock_analyzer):
        """Test successful contract analysis using Coinbase AgentKit SDK."""
        # Mock AgentKit analysis result
        mock_result = MagicMock()
        mock_result.risk_score = 0.65
        mock_result.risk_level = "MEDIUM_RISK"
        mock_result.confidence = 0.92
        mock_result.vulnerabilities = [
            {
                "type": "reentrancy",
                "severity": "medium",
                "description": "Potential reentrancy vulnerability"
            }
        ]
        mock_result.summary = "Contract shows moderate risk with potential reentrancy issues"
        
        mock_analyzer_instance = AsyncMock()
        mock_analyzer_instance.analyze_contract.return_value = mock_result
        mock_analyzer.return_value = mock_analyzer_instance
        
        # Enable AgentKit for this test
        self.service.agentkit = MagicMock()
        
        # Run the async test
        async def run_test():
            result = await self.service._analyze_with_agentkit(
                "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                84532
            )
            
            assert result["risk_score"] == "0.65"
            assert result["risk_level"] == AgentKitRiskLevel.MEDIUM_RISK
            assert result["risk_level_value"] == 2
            assert result["confidence"] == 0.92
            assert len(result["vulnerabilities"]) == 1
            assert result["vulnerabilities"][0]["type"] == "reentrancy"
            assert result["source"] == "coinbase_agentkit"
        
        # Run the async function
        import asyncio
        asyncio.run(run_test())
    
    @patch('services.agentkit_service.aiohttp.ClientSession.post')
    def test_analyze_with_api_success(self, mock_post):
        """Test successful contract analysis using API fallback."""
        # Mock successful API response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {
            "risk_score": "0.65",
            "risk_level": "MEDIUM_RISK",
            "confidence": 0.92,
            "vulnerabilities": [
                {
                    "type": "reentrancy",
                    "severity": "medium",
                    "description": "Potential reentrancy vulnerability"
                }
            ],
            "analysis_summary": "Contract shows moderate risk with potential reentrancy issues"
        }
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Run the async test
        async def run_test():
            result = await self.service._analyze_with_api(
                "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                84532
            )
            
            assert result["risk_score"] == "0.65"
            assert result["risk_level"] == AgentKitRiskLevel.MEDIUM_RISK
            assert result["risk_level_value"] == 2
            assert result["confidence"] == 0.92
            assert len(result["vulnerabilities"]) == 1
            assert result["vulnerabilities"][0]["type"] == "reentrancy"
            assert result["source"] == "agentkit_api"
        
        # Run the async function
        import asyncio
        asyncio.run(run_test())
    
    @patch('services.agentkit_service.aiohttp.ClientSession.post')
    def test_analyze_with_api_error(self, mock_post):
        """Test API error handling in fallback mode."""
        # Mock API error
        mock_response = AsyncMock()
        mock_response.status = 500
        mock_response.text.return_value = "Internal Server Error"
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Run the async test
        async def run_test():
            result = await self.service._analyze_with_api(
                "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                84532
            )
            
            # Should return mock response on error
            assert "risk_score" in result
            assert "risk_level" in result
            assert "confidence" in result
            assert "vulnerabilities" in result
            assert result["source"] == "agentkit_demo"
        
        # Run the async function
        import asyncio
        asyncio.run(run_test())
    
    def test_analyze_contract_demo_mode(self):
        """Test contract analysis in demo mode."""
        # Create service with demo credentials
        demo_service = AgentKitService(api_key="demo_key")
        
        # Run the async test
        async def run_test():
            result = await demo_service.analyze_contract(
                "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
                84532
            )
            
            assert "risk_score" in result
            assert "risk_level" in result
            assert "confidence" in result
            assert "vulnerabilities" in result
            assert result["source"] == "agentkit_demo"
        
        # Run the async function
        import asyncio
        asyncio.run(run_test())
    
    def test_mock_analysis_consistency(self):
        """Test mock analysis produces consistent results for same address."""
        contract_address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        
        result1 = self.service._mock_analysis(contract_address)
        result2 = self.service._mock_analysis(contract_address)
        
        # Same address should produce same results
        assert result1["risk_score"] == result2["risk_score"]
        assert result1["risk_level"] == result2["risk_level"]
        assert result1["risk_level_value"] == result2["risk_level_value"]
    
    def test_get_risk_level_name(self):
        """Test risk level name conversion."""
        assert self.service.get_risk_level_name(AgentKitRiskLevel.SAFE) == "SAFE"
        assert self.service.get_risk_level_name(AgentKitRiskLevel.LOW_RISK) == "LOW_RISK"
        assert self.service.get_risk_level_name(AgentKitRiskLevel.MEDIUM_RISK) == "MEDIUM_RISK"
        assert self.service.get_risk_level_name(AgentKitRiskLevel.HIGH_RISK) == "HIGH_RISK"
        assert self.service.get_risk_level_name(AgentKitRiskLevel.CRITICAL) == "CRITICAL"
        assert self.service.get_risk_level_name(999) == "UNKNOWN"
    
    def test_format_agentkit_result(self):
        """Test AgentKit SDK result formatting."""
        # Mock AgentKit result object
        mock_result = MagicMock()
        mock_result.risk_score = 0.65
        mock_result.risk_level = "MEDIUM_RISK"
        mock_result.confidence = 0.92
        mock_result.vulnerabilities = [
            {
                "type": "reentrancy",
                "severity": "medium",
                "description": "Potential reentrancy vulnerability"
            }
        ]
        mock_result.summary = "Contract shows moderate risk"
        
        formatted = self.service._format_agentkit_result(mock_result)
        
        assert formatted["risk_score"] == "0.65"
        assert formatted["risk_level"] == AgentKitRiskLevel.MEDIUM_RISK
        assert formatted["risk_level_value"] == 2
        assert formatted["confidence"] == 0.92
        assert len(formatted["vulnerabilities"]) == 1
        assert formatted["source"] == "coinbase_agentkit"
    
    def test_format_api_result(self):
        """Test API result formatting."""
        raw_result = {
            "risk_score": "0.65",
            "risk_level": "MEDIUM_RISK",
            "confidence": 0.92,
            "vulnerabilities": [
                {
                    "type": "reentrancy",
                    "severity": "medium",
                    "description": "Potential reentrancy vulnerability"
                }
            ],
            "analysis_summary": "Contract shows moderate risk"
        }
        
        formatted = self.service._format_api_result(raw_result)
        
        assert formatted["risk_score"] == "0.65"
        assert formatted["risk_level"] == AgentKitRiskLevel.MEDIUM_RISK
        assert formatted["risk_level_value"] == 2
        assert formatted["confidence"] == 0.92
        assert len(formatted["vulnerabilities"]) == 1
        assert formatted["source"] == "agentkit_api"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])