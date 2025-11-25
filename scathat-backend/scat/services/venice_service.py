"""
Venice Protocol Service

Provides integration with the Venice protocol for decentralized AI model inference
and blockchain contract analysis using machine learning models.
"""

import logging
import aiohttp
import asyncio
import json
import time
import os
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class VeniceConfig:
    """Configuration for Venice protocol integration."""
    api_url: str
    api_key: str
    model_id: str
    timeout: int = 60
    max_retries: int = 3
    retry_delay: float = 2.0

class VeniceService:
    """Service for interacting with Venice protocol AI models."""
    
    def __init__(self, config: VeniceConfig):
        """
        Initialize the Venice service.
        
        Args:
            config (VeniceConfig): Configuration for Venice protocol API
        """
        self.config = config
        self.session: Optional[aiohttp.ClientSession] = None
        self.headers = {
            'Authorization': f'Bearer {config.api_key}',
            'Content-Type': 'application/json'
        }
    
    async def __aenter__(self):
        """Async context manager entry."""
        await self._ensure_session()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()
    
    async def _ensure_session(self) -> None:
        """Ensure aiohttp session is created."""
        if self.session is None or self.session.closed:
            connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
            self.session = aiohttp.ClientSession(
                connector=connector,
                headers=self.headers,
                timeout=aiohttp.ClientTimeout(total=self.config.timeout)
            )
    
    async def close(self) -> None:
        """Close the aiohttp session."""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def analyze_contract(self, source_code: str) -> Tuple[str, Optional[Dict[str, Any]]]:
        """
        Analyze contract source code using Venice.ai API for risk assessment.
        
        Makes authenticated POST requests to Venice.ai API endpoint to analyze
        contract source code for security vulnerabilities and risk classification.
        
        Args:
            source_code (str): The contract source code to analyze
            
        Returns:
            Tuple[str, Optional[Dict[str, Any]]]: A tuple containing:
                - Primary risk score classification ("safe"/"warning"/"dangerous")
                - Optional analysis details dictionary with additional findings
                
        Raises:
            ValueError: If source code is empty or invalid
            requests.RequestException: For network or API errors
            
        Example:
            >>> service = VeniceService(config)
            >>> risk_score, analysis_details = service.analyze_contract(source_code)
            >>> print(f"Risk: {risk_score}")
            >>> print(f"Details: {analysis_details}")
        """
        if not source_code or not isinstance(source_code, str):
            error_msg = "Source code must be a non-empty string"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        if len(source_code.strip()) == 0:
            error_msg = "Source code cannot be empty or whitespace only"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        try:
            await self._ensure_session()
            
            # Construct request payload according to Venice.ai API specifications
            payload = {
                "model_id": self.config.model_id,
                "inputs": {
                    "source_code": source_code,
                    "language": "solidity",
                    "analysis_type": "security_scan",
                    "risk_assessment": True
                },
                "parameters": {
                    "max_tokens": 4000,
                    "temperature": 0.1,
                    "response_format": "detailed"
                }
            }
            
            # Make authenticated API request with retry logic
            response_data = await self._make_venice_api_request(
                f"{self.config.api_url}/inference",
                payload
            )
            
            if not response_data:
                return "unknown", {"error": "No response from Venice.ai API"}
            
            # Parse response and extract risk score
            risk_score = self._extract_risk_score(response_data)
            analysis_details = self._parse_analysis_details(response_data)
            
            logger.info(f"Contract analysis completed. Risk score: {risk_score}")
            return risk_score, analysis_details
            
        except aiohttp.ClientError as e:
            error_msg = f"Venice.ai API request failed: {str(e)}"
            logger.error(error_msg)
            raise aiohttp.ClientError(error_msg) from e
            
        except Exception as e:
            error_msg = f"Unexpected error during contract analysis: {str(e)}"
            logger.error(error_msg)
            return "error", {"error": error_msg}
    
    async def _make_venice_api_request(self, url: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Make authenticated POST request to Venice.ai API with retry logic.
        
        Args:
            url (str): API endpoint URL
            payload (Dict[str, Any]): Request payload
            
        Returns:
            Optional[Dict[str, Any]]: API response data or None if all retries failed
        """
        for attempt in range(self.config.max_retries + 1):
            try:
                async with self.session.post(url, json=payload) as response:
                    response.raise_for_status()
                    
                    data = await response.json()
                    
                    # Handle API-specific error codes
                    if data.get('status') == 'error':
                        error_msg = data.get('message', 'Unknown API error')
                        
                        # Handle rate limiting
                        if 'rate limit' in error_msg.lower() and attempt < self.config.max_retries:
                            delay = self.config.retry_delay * (2 ** attempt)
                            logger.warning(f"Rate limited on attempt {attempt + 1}. Retrying in {delay}s...")
                            await asyncio.sleep(delay)
                            continue
                        
                        logger.error(f"Venice.ai API error: {error_msg}")
                        return None
                    
                    return data
                    
            except aiohttp.ClientResponseError as e:
                if e.status == 429:  # Rate limited
                    if attempt < self.config.max_retries:
                        delay = self.config.retry_delay * (2 ** attempt)
                        logger.warning(f"HTTP 429 Rate limited on attempt {attempt + 1}. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error("Max retries exceeded due to HTTP 429 rate limiting")
                        return None
                elif e.status == 401:  # Unauthorized
                    logger.error("API key authentication failed - check VENICE_API_KEY configuration")
                    return None
                elif 400 <= e.status < 500:
                    logger.error(f"HTTP {e.status} error: {str(e)}")
                    return None
                else:
                    if attempt < self.config.max_retries:
                        delay = self.config.retry_delay
                        logger.warning(f"HTTP error on attempt {attempt + 1}. Retrying in {delay}s...")
                        await asyncio.sleep(delay)
                        continue
                    else:
                        logger.error(f"Max retries exceeded after HTTP error: {str(e)}")
                        return None
                        
            except aiohttp.ClientError as e:
                if attempt < self.config.max_retries:
                    delay = self.config.retry_delay * (2 ** attempt)
                    logger.warning(f"Network error on attempt {attempt + 1}. Retrying in {delay}s...: {str(e)}")
                    await asyncio.sleep(delay)
                    continue
                else:
                    logger.error(f"Max retries exceeded after network error: {str(e)}")
                    return None
                    
            except Exception as e:
                logger.error(f"Unexpected error in Venice.ai API request: {str(e)}")
                return None
        
        return None
    
    def _extract_risk_score(self, response_data: Dict[str, Any]) -> str:
        """
        Extract risk score classification from Venice.ai API response.
        
        Args:
            response_data (Dict[str, Any]): API response data
            
        Returns:
            str: Risk score classification ("safe"/"warning"/"dangerous"/"unknown")
        """
        try:
            # Extract risk score from response structure
            # This assumes Venice.ai returns risk assessment in a specific format
            analysis_result = response_data.get('outputs', {})
            
            # Check various possible locations for risk score
            risk_score = analysis_result.get('risk_score') or \
                         analysis_result.get('risk_assessment', {}).get('score') or \
                         analysis_result.get('security_assessment', {}).get('overall_risk')
            
            if risk_score:
                risk_score = str(risk_score).lower()
                
                # Normalize risk score to standard classifications
                if any(keyword in risk_score for keyword in ['safe', 'low', 'green']):
                    return "safe"
                elif any(keyword in risk_score for keyword in ['warning', 'medium', 'yellow', 'moderate']):
                    return "warning"
                elif any(keyword in risk_score for keyword in ['dangerous', 'high', 'red', 'critical']):
                    return "dangerous"
            
            # Default to unknown if no clear risk score found
            return "unknown"
            
        except Exception as e:
            logger.warning(f"Failed to extract risk score from response: {str(e)}")
            return "unknown"
    
    def _parse_analysis_details(self, response_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parse additional analysis details from Venice.ai API response.
        
        Args:
            response_data (Dict[str, Any]): API response data
            
        Returns:
            Dict[str, Any]: Structured analysis details
        """
        try:
            analysis_result = response_data.get('outputs', {})
            
            details = {
                'vulnerabilities': analysis_result.get('vulnerabilities', []),
                'security_issues': analysis_result.get('security_issues', []),
                'complexity_score': analysis_result.get('complexity_score', 0.0),
                'code_quality': analysis_result.get('code_quality', 'unknown'),
                'recommendations': analysis_result.get('recommendations', []),
                'raw_response': response_data  # Include full response for debugging
            }
            
            # Remove raw response if it's too large for logging
            if len(str(details['raw_response'])) > 1000:
                details['raw_response'] = 'response_too_large_for_logging'
            
            return details
            
        except Exception as e:
            logger.warning(f"Failed to parse analysis details: {str(e)}")
            return {'error': 'failed_to_parse_analysis_details'}
    
    async def analyze_contract_code(self, source_code: str, language: str = "solidity") -> Optional[Dict[str, Any]]:
        """
        Analyze contract source code using AI models for vulnerabilities and patterns.
        
        Args:
            source_code (str): The contract source code to analyze
            language (str): Programming language of the contract
            
        Returns:
            Optional[Dict[str, Any]]: Analysis results including vulnerabilities and risk assessment
        """
        try:
            await self._ensure_session()
            
            payload = {
                "model_id": self.config.model_id,
                "inputs": {
                    "source_code": source_code,
                    "language": language,
                    "analysis_type": "security_scan"
                },
                "parameters": {
                    "max_tokens": 4000,
                    "temperature": 0.1
                }
            }
            
            async with self.session.post(f"{self.config.api_url}/inference", json=payload) as response:
                response.raise_for_status()
                
                result = await response.json()
                return self._parse_analysis_result(result)
                
        except aiohttp.ClientError as e:
            logger.error(f"Request error analyzing contract code: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error analyzing contract code: {str(e)}")
            return None
    
    async def analyze_contract_abi(self, abi: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Analyze contract ABI for function patterns and potential risks.
        
        Args:
            abi (List[Dict[str, Any]]): The contract ABI to analyze
            
        Returns:
            Optional[Dict[str, Any]]: Analysis results including function patterns and risk indicators
        """
        try:
            await self._ensure_session()
            
            payload = {
                "model_id": self.config.model_id,
                "inputs": {
                    "contract_abi": abi,
                    "analysis_type": "abi_pattern_analysis"
                },
                "parameters": {
                    "max_tokens": 2000,
                    "temperature": 0.1
                }
            }
            
            async with self.session.post(f"{self.config.api_url}/inference", json=payload) as response:
                response.raise_for_status()
                
                result = await response.json()
                return self._parse_abi_analysis_result(result)
                
        except aiohttp.ClientError as e:
            logger.error(f"Request error analyzing contract ABI: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error analyzing contract ABI: {str(e)}")
            return None
    
    async def generate_risk_assessment(self, 
                                 source_code: Optional[str] = None,
                                 abi: Optional[List[Dict[str, Any]]] = None,
                                 transaction_history: Optional[List[Dict[str, Any]]] = None) -> Optional[Dict[str, Any]]:
        """
        Generate comprehensive risk assessment using multiple data sources.
        
        Args:
            source_code (Optional[str]): Contract source code
            abi (Optional[List[Dict[str, Any]]]): Contract ABI
            transaction_history (Optional[List[Dict[str, Any]]]): Transaction history
            
        Returns:
            Optional[Dict[str, Any]]: Comprehensive risk assessment report
        """
        try:
            analysis_data = {}
            
            if source_code:
                analysis_data["source_code_analysis"] = await self.analyze_contract_code(source_code)
            
            if abi:
                analysis_data["abi_analysis"] = await self.analyze_contract_abi(abi)
            
            if transaction_history:
                analysis_data["transaction_analysis"] = await self.analyze_transaction_patterns(transaction_history)
            
            # Combine all analyses into comprehensive risk assessment
            risk_assessment = self._generate_comprehensive_risk_score(analysis_data)
            
            return {
                "risk_score": risk_assessment["overall_risk"],
                "vulnerabilities": risk_assessment.get("vulnerabilities", []),
                "recommendations": risk_assessment.get("recommendations", []),
                "detailed_analysis": analysis_data
            }
            
        except Exception as e:
            logger.error(f"Error generating risk assessment: {str(e)}")
            return None
    
    async def analyze_transaction_patterns(self, transactions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """
        Analyze transaction patterns for suspicious activities.
        
        Args:
            transactions (List[Dict[str, Any]]): List of transaction data
            
        Returns:
            Optional[Dict[str, Any]]: Analysis of transaction patterns and risk indicators
        """
        try:
            await self._ensure_session()
            
            payload = {
                "model_id": self.config.model_id,
                "inputs": {
                    "transactions": transactions,
                    "analysis_type": "transaction_pattern_analysis"
                },
                "parameters": {
                    "max_tokens": 3000,
                    "temperature": 0.1
                }
            }
            
            async with self.session.post(f"{self.config.api_url}/inference", json=payload) as response:
                response.raise_for_status()
                
                result = await response.json()
                return self._parse_transaction_analysis_result(result)
                
        except aiohttp.ClientError as e:
            logger.error(f"Request error analyzing transaction patterns: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error analyzing transaction patterns: {str(e)}")
            return None
    
    def _parse_analysis_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Parse and format the analysis result from Venice API."""
        # Placeholder for result parsing logic
        return {
            "vulnerabilities": result.get("vulnerabilities", []),
            "complexity_score": result.get("complexity", 0.0),
            "security_issues": result.get("security_issues", []),
            "code_quality": result.get("code_quality", "unknown")
        }
    
    def _parse_abi_analysis_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Parse and format the ABI analysis result from Venice API."""
        # Placeholder for ABI result parsing logic
        return {
            "function_patterns": result.get("function_patterns", []),
            "access_control_issues": result.get("access_control", []),
            "upgradeability_analysis": result.get("upgradeability", {})
        }
    
    def _generate_comprehensive_risk_score(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate comprehensive risk score from multiple analyses."""
        # Placeholder for risk score calculation logic
        return {
            "overall_risk": 0.0,
            "vulnerabilities": [],
            "recommendations": ["Conduct thorough manual review"]
        }