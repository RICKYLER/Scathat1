"""
Integration tests for Scathat backend services.

These tests verify the integration between all service components
and ensure they work together correctly.
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

# Import the main app and services
from main import app, explorer_service, venice_service, web3_service, agentkit_service


class TestServicesIntegration:
    """Integration tests for all backend services."""
    
    def setup_method(self):
        """Set up test client for each test."""
        self.client = TestClient(app)
    
    def test_root_endpoint(self):
        """Test that the root endpoint returns API information."""
        response = self.client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "status" in data
        assert data["status"] == "active"
    
    def test_health_check(self):
        """Test that the health check endpoint returns healthy status."""
        response = self.client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "scathat-api"
    
    @patch('services.explorer_service.ExplorerService.get_contract_source_code')
    @patch('services.venice_service.VeniceService.analyze_contract_code')
    def test_scan_contract_integration(self, mock_venice_analyze, mock_explorer_get):
        """Test the complete contract scanning flow integration."""
        # Mock explorer service response
        mock_explorer_get.return_value = {
            "source_code": "pragma solidity ^0.8.0; contract Test {}",
            "contract_name": "Test",
            "compiler_version": "0.8.20"
        }
        
        # Mock Venice service response
        mock_venice_analyze.return_value = {
            "risk_score": "MEDIUM",
            "confidence": 0.85,
            "vulnerabilities": []
        }
        
        # Test contract scan
        scan_data = {
            "contract_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            "chain_id": 84532
        }
        
        response = self.client.post("/scan", json=scan_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["contract_address"] == scan_data["contract_address"]
        assert data["risk_score"] == "MEDIUM"
        assert data["status"] == "completed"
        assert "scan_id" in data
    
    def test_scan_contract_invalid_address(self):
        """Test contract scanning with invalid address format."""
        scan_data = {
            "contract_address": "invalid_address",
            "chain_id": 84532
        }
        
        response = self.client.post("/scan", json=scan_data)
        assert response.status_code == 400
        assert "Invalid contract address format" in response.json()["detail"]
    
    @patch('services.agentkit_service.ContractSecurityAnalyzer')
    @patch('services.agentkit_service.AGENTKIT_AVAILABLE', True)
    def test_agentkit_analysis_integration(self, mock_analyzer):
        """Test AgentKit analysis endpoint integration with Coinbase AgentKit SDK."""
        # Mock successful AgentKit SDK response
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
        
        # Test AgentKit analysis
        analysis_data = {
            "contract_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            "chain_id": 84532,
            "analysis_type": "security_risk"
        }
        
        response = self.client.post("/analyze/agentkit", json=analysis_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["contract_address"] == analysis_data["contract_address"]
        assert data["risk_score"] == "0.65"
        assert data["risk_level"] == "MEDIUM_RISK"
        assert data["risk_level_value"] == 2
        assert data["confidence"] == 0.92
        assert len(data["vulnerabilities"]) == 1
        assert data["source"] == "coinbase_agentkit"
    
    def test_agentkit_analysis_invalid_address(self):
        """Test AgentKit analysis with invalid address format."""
        analysis_data = {
            "contract_address": "invalid_address",
            "chain_id": 84532,
            "analysis_type": "security_risk"
        }
        
        response = self.client.post("/analyze/agentkit", json=analysis_data)
        assert response.status_code == 400
        assert "Invalid contract address format" in response.json()["detail"]
    
    @patch('services.web3_service.Web3Service.read_score_from_chain')
    def test_get_score_integration(self, mock_read_score):
        """Test score retrieval integration."""
        # Mock Web3 service response
        mock_read_score.return_value = "HIGH"
        
        contract_address = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
        response = self.client.get(f"/score/{contract_address}")
        
        # Should work even in demo mode
        assert response.status_code == 200
        data = response.json()
        assert data["contract_address"] == contract_address
        assert data["risk_score"] in ["HIGH", "MEDIUM"]  # Could be mock or real
    
    def test_get_score_invalid_address(self):
        """Test score retrieval with invalid address format."""
        response = self.client.get("/score/invalid_address")
        assert response.status_code == 400
        assert "Invalid contract address format" in response.json()["detail"]
    
    def test_scan_status_endpoint(self):
        """Test scan status endpoint returns proper structure."""
        scan_id = "test_scan_123"
        response = self.client.get(f"/scan/{scan_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["scan_id"] == scan_id
        assert data["status"] == "completed"
        assert "results" in data
        assert "risk_score" in data["results"]


class TestServiceInitialization:
    """Tests for service initialization and configuration."""
    
    def test_services_initialized(self):
        """Test that all services are properly initialized."""
        assert explorer_service is not None
        assert venice_service is not None
        assert web3_service is not None
        assert agentkit_service is not None
        
        # Verify service configurations
        assert hasattr(explorer_service, 'config')
        assert hasattr(venice_service, 'config')
        assert hasattr(web3_service, 'config')
        assert hasattr(agentkit_service, 'api_url')
    
    def test_service_configurations(self):
        """Test that services have proper demo configurations."""
        # Explorer service should have demo config
        assert explorer_service.config.api_key == "demo_key"
        assert explorer_service.config.chain_id == 84532
        
        # Venice service should have demo config
        assert venice_service.config.api_key == "demo_key"
        
        # Web3 service should have demo config
        assert web3_service.config.chain_id == 84532
        
        # AgentKit service should have demo config
        assert agentkit_service.api_key == "demo_key"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])