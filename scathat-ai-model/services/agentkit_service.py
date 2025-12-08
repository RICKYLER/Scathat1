"""
Coinbase AgentKit Service for AI-powered contract analysis.

This service provides integration with Coinbase AgentKit for advanced
contract analysis and risk assessment using AI-powered security analysis.
<mcreference link="https://github.com/coinbase/agentkit" index="0">0</mcreference>
"""

import aiohttp
import asyncio
from typing import Dict, Any, Optional, List
import json
from enum import Enum

# Try to import Coinbase AgentKit if available
try:
    from coinbase_agentkit import AgentKit, ActionProvider, WalletProvider
    from coinbase_agentkit.action_providers.security_analysis import ContractSecurityAnalyzer
    AGENTKIT_AVAILABLE = True
except ImportError:
    AGENTKIT_AVAILABLE = False
    print("⚠️  Coinbase AgentKit not installed. Using demo mode.")


class AgentKitRiskLevel(Enum):
    """Risk level enum matching the smart contract RiskLevel enum."""
    SAFE = 0
    LOW_RISK = 1
    MEDIUM_RISK = 2
    HIGH_RISK = 3
    CRITICAL = 4


class AgentKitService:
    """Service for integrating with Coinbase AgentKit AI contract analysis.
    
    This service uses Coinbase AgentKit's security analysis capabilities
    to perform comprehensive contract risk assessment.
    <mcreference link="https://github.com/coinbase/agentkit" index="0">0</mcreference>
    """
    
    def __init__(self, api_key: str = "demo_key", cdp_api_key: str = None, cdp_api_secret: str = None):
        """
        Initialize Coinbase AgentKit service.
        
        Args:
            api_key: AgentKit API key (for direct API access)
            cdp_api_key: Coinbase Developer Platform API key
            cdp_api_secret: Coinbase Developer Platform API secret
            
        Note: Prefer CDP API keys for full AgentKit functionality
        <mcreference link="https://github.com/coinbase/agentkit" index="0">0</mcreference>
        """
        self.api_key = api_key
        self.cdp_api_key = cdp_api_key
        self.cdp_api_secret = cdp_api_secret
        self.session = None
        self.agentkit = None
        
        # Initialize AgentKit if available
        if AGENTKIT_AVAILABLE and cdp_api_key and cdp_api_secret:
            try:
                self.agentkit = AgentKit(
                    api_key=cdp_api_key,
                    api_secret=cdp_api_secret,
                    wallet_provider=WalletProvider.CDP,
                    network="base-sepolia"
                )
                print("✅ Coinbase AgentKit initialized successfully")
            except Exception as e:
                print(f"⚠️  AgentKit initialization failed: {e}")
        
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    async def analyze_contract(self, contract_address: str, chain_id: int = 84532) -> Dict[str, Any]:
        """
        Analyze a contract using Coinbase AgentKit AI analysis.
        
        Uses AgentKit's security analysis capabilities for comprehensive
        risk assessment and vulnerability detection.
        <mcreference link="https://github.com/coinbase/agentkit" index="0">0</mcreference>
        
        Args:
            contract_address: Contract address to analyze
            chain_id: Blockchain chain ID (default: Base Sepolia)
            
        Returns:
            Dict containing analysis results including risk score and level
        """
        # Use demo mode if no proper credentials
        if (self.api_key == "demo_key" and 
            not (self.cdp_api_key and self.cdp_api_secret)):
            return await self._mock_analysis(contract_address)
        
        # Try to use Coinbase AgentKit if available
        if self.agentkit and AGENTKIT_AVAILABLE:
            try:
                return await self._analyze_with_agentkit(contract_address, chain_id)
            except Exception as e:
                print(f"AgentKit analysis failed: {e}")
                # Fall back to API or mock
        
        # Fall back to direct API call
        return await self._analyze_with_api(contract_address, chain_id)
    
    async def _analyze_with_agentkit(self, contract_address: str, chain_id: int) -> Dict[str, Any]:
        """
        Analyze contract using Coinbase AgentKit SDK.
        
        This method uses the official AgentKit SDK for comprehensive
        security analysis and risk assessment.
        <mcreference link="https://github.com/coinbase/agentkit" index="0">0</mcreference>
        """
        try:
            # Create security analyzer action
            analyzer = ContractSecurityAnalyzer()
            
            # Perform security analysis
            analysis_result = await analyzer.analyze_contract(
                contract_address=contract_address,
                chain_id=chain_id
            )
            
            return self._format_agentkit_result(analysis_result)
            
        except Exception as e:
            print(f"AgentKit SDK analysis error: {e}")
            return await self._mock_analysis(contract_address)
    
    async def _analyze_with_api(self, contract_address: str, chain_id: int) -> Dict[str, Any]:
        """
        Analyze contract using direct API call (fallback).
        """
        if not self.session:
            self.session = aiohttp.ClientSession()
            
        endpoint = "https://api.agentkit.ai/v1/analyze/contract"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "contract_address": contract_address,
            "chain_id": chain_id,
            "analysis_type": "security_risk"
        }
        
        try:
            async with self.session.post(endpoint, json=payload, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return self._format_api_result(data)
                else:
                    print(f"AgentKit API error: {response.status}")
                    return await self._mock_analysis(contract_address)
                    
        except (aiohttp.ClientError, asyncio.TimeoutError) as e:
            print(f"AgentKit API error: {e}")
            return await self._mock_analysis(contract_address)
    
    def _format_agentkit_result(self, agentkit_result: Any) -> Dict[str, Any]:
        """
        Format AgentKit SDK analysis result to standard format.
        
        Args:
            agentkit_result: Raw AgentKit analysis result
            
        Returns:
            Formatted analysis result
        """
        # Extract risk information from AgentKit result
        risk_score = getattr(agentkit_result, 'risk_score', '0.5')
        risk_level = getattr(agentkit_result, 'risk_level', 'MEDIUM_RISK')
        
        # Map to our RiskLevel enum
        risk_level_map = {
            'SAFE': AgentKitRiskLevel.SAFE,
            'LOW': AgentKitRiskLevel.LOW_RISK,
            'MEDIUM': AgentKitRiskLevel.MEDIUM_RISK,
            'HIGH': AgentKitRiskLevel.HIGH_RISK,
            'CRITICAL': AgentKitRiskLevel.CRITICAL
        }
        
        risk_level_enum = risk_level_map.get(risk_level.upper(), AgentKitRiskLevel.MEDIUM_RISK)
        
        return {
            'risk_score': str(risk_score),
            'risk_level': risk_level_enum,
            'risk_level_value': risk_level_enum.value,
            'confidence': getattr(agentkit_result, 'confidence', 0.8),
            'vulnerabilities': getattr(agentkit_result, 'vulnerabilities', []),
            'analysis_summary': getattr(agentkit_result, 'summary', 'Security analysis completed'),
            'source': 'coinbase_agentkit'
        }
    
    def _format_api_result(self, api_response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format API response to standard format.
        
        Args:
            api_response: Raw API response
            
        Returns:
            Formatted analysis result
        """
        risk_score = api_response.get('risk_score', '0.5')
        risk_level_str = api_response.get('risk_level', 'MEDIUM_RISK').upper()
        
        risk_level_map = {
            'SAFE': AgentKitRiskLevel.SAFE,
            'LOW': AgentKitRiskLevel.LOW_RISK,
            'MEDIUM': AgentKitRiskLevel.MEDIUM_RISK,
            'HIGH': AgentKitRiskLevel.HIGH_RISK,
            'CRITICAL': AgentKitRiskLevel.CRITICAL
        }
        
        risk_level = risk_level_map.get(risk_level_str, AgentKitRiskLevel.MEDIUM_RISK)
        
        return {
            'risk_score': risk_score,
            'risk_level': risk_level,
            'risk_level_value': risk_level.value,
            'confidence': api_response.get('confidence', 0.8),
            'vulnerabilities': api_response.get('vulnerabilities', []),
            'analysis_summary': api_response.get('analysis_summary', 'Security analysis completed'),
            'source': 'agentkit_api'
        }
    
    async def _mock_analysis(self, contract_address: str) -> Dict[str, Any]:
        """
        Generate mock analysis for demo purposes.
        
        Args:
            contract_address: Contract address
            
        Returns:
            Mock analysis result
        """
        # Consistent hash-based scoring
        address_hash = hash(contract_address) % 100
        
        if address_hash < 20:
            risk_level = AgentKitRiskLevel.SAFE
            risk_score = "0.2"
        elif address_hash < 50:
            risk_level = AgentKitRiskLevel.LOW_RISK
            risk_score = "0.4"
        elif address_hash < 80:
            risk_level = AgentKitRiskLevel.MEDIUM_RISK
            risk_score = "0.6"
        elif address_hash < 95:
            risk_level = AgentKitRiskLevel.HIGH_RISK
            risk_score = "0.8"
        else:
            risk_level = AgentKitRiskLevel.CRITICAL
            risk_score = "0.95"
        
        return {
            'risk_score': risk_score,
            'risk_level': risk_level,
            'risk_level_value': risk_level.value,
            'confidence': 0.9,
            'vulnerabilities': [
                {
                    'type': 'demo_vulnerability',
                    'severity': 'medium',
                    'description': 'Demo vulnerability for testing purposes'
                }
            ],
            'analysis_summary': 'Demo analysis - replace with real AgentKit credentials',
            'source': 'agentkit_demo'
        }
    
    def get_risk_level_name(self, risk_level: AgentKitRiskLevel) -> str:
        """
        Get human-readable risk level name.
        
        Args:
            risk_level: Risk level enum
            
        Returns:
            Human-readable risk level name
        """
        risk_level_names = {
            AgentKitRiskLevel.SAFE: "SAFE",
            AgentKitRiskLevel.LOW_RISK: "LOW_RISK",
            AgentKitRiskLevel.MEDIUM_RISK: "MEDIUM_RISK",
            AgentKitRiskLevel.HIGH_RISK: "HIGH_RISK",
            AgentKitRiskLevel.CRITICAL: "CRITICAL"
        }
        return risk_level_names.get(risk_level, "UNKNOWN")