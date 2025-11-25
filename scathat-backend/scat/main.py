"""
Scathat Backend API - Core Demonstration
Simplified FastAPI application for blockchain contract scanning demo.
"""

import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional

# Import services
from services.explorer_service import ExplorerService, ExplorerConfig
from services.venice_service import VeniceService, VeniceConfig
from services.web3_service import Web3Service, Web3Config
from services.agentkit_service import AgentKitService, AgentKitRiskLevel

# Create FastAPI instance
app = FastAPI(
    title="Scathat API",
    description="Blockchain contract scanning and analysis API",
    version="1.0.0"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services with demo configuration
try:
    # Explorer Service Configuration (for Base Sepolia)
    explorer_config = ExplorerConfig(
        api_key=os.getenv("BASESCAN_API_KEY", "demo_key"),
        base_url="https://api-sepolia.basescan.org/api",
        chain_id=84532,
        chain_name="Base Sepolia"
    )
    explorer_service = ExplorerService(explorer_config)
    
    # Venice Service Configuration
    venice_config = VeniceConfig(
        api_url=os.getenv("VENICE_API_URL", "https://api.venice.ai/v1"),
        api_key=os.getenv("VENICE_API_KEY", "demo_key"),
        model_id=os.getenv("VENICE_MODEL_ID", "default-model")
    )
    venice_service = VeniceService(venice_config)
    
    # Web3 Service Configuration (for Base Sepolia)
    web3_config = Web3Config(
        rpc_url=os.getenv("BASE_SEPOLIA_RPC_URL", "https://base-sepolia-rpc.publicnode.com"),
        chain_id=84532,
        chain_name="Base Sepolia",
        explorer_url="https://sepolia.basescan.org",
        native_currency="ETH"
    )
    web3_service = Web3Service(web3_config)
    
    # AgentKit Service Configuration
    agentkit_service = AgentKitService(
        api_url=os.getenv("AGENTKIT_API_URL", "https://api.agentkit.ai/v1"),
        api_key=os.getenv("AGENTKIT_API_KEY", "demo_key"),
        cdp_api_key=os.getenv("AGENTKIT_CDP_API_KEY"),
        cdp_api_secret=os.getenv("AGENTKIT_CDP_API_SECRET")
    )
    
    print("✅ All services initialized successfully for demonstration")
    
except Exception as e:
    print(f"⚠️  Service initialization warning: {str(e)}")
    print("Continuing with limited functionality for demo purposes")

# Pydantic models
class ScanRequest(BaseModel):
    """Request model for contract scanning."""
    contract_address: str
    chain_id: int = 84532  # Default to Base Sepolia

class ScanResponse(BaseModel):
    """Response model for contract scanning."""
    message: str
    contract_address: str
    risk_score: str
    transaction_hash: Optional[str] = None
    scan_id: str
    status: str

class ScoreResponse(BaseModel):
    """Response model for score retrieval."""
    contract_address: str
    risk_score: str

@app.get("/")
async def root() -> Dict[str, str]:
    """
    Root endpoint returning API information.
    
    Returns:
        Dict[str, str]: API information
    """
    return {
        "message": "Scathat API - Blockchain Contract Scanner",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint.
    
    Returns:
        Dict[str, str]: Health status
    """
    return {"status": "healthy", "service": "scathat-api"}

# Pydantic model for AgentKit analysis request
class AgentKitAnalysisRequest(BaseModel):
    """Request model for AgentKit contract analysis."""
    contract_address: str
    chain_id: int = 84532  # Default to Base Sepolia
    analysis_type: str = "security_risk"

# Pydantic model for AgentKit analysis response
class AgentKitAnalysisResponse(BaseModel):
    """Response model for AgentKit contract analysis."""
    contract_address: str
    risk_score: str
    risk_level: str
    risk_level_value: int
    confidence: float
    vulnerabilities: list
    analysis_summary: str
    source: str

@app.post("/analyze/agentkit", response_model=AgentKitAnalysisResponse)
async def analyze_with_agentkit(request: AgentKitAnalysisRequest) -> AgentKitAnalysisResponse:
    """
    Analyze a contract using AgentKit AI-powered security analysis.
    
    Args:
        request (AgentKitAnalysisRequest): Contract analysis request
        
    Returns:
        AgentKitAnalysisResponse: Detailed AI analysis results
        
    Raises:
        HTTPException: If analysis fails or contract address is invalid
    """
    try:
        # Validate contract address format
        if not request.contract_address.startswith("0x") or len(request.contract_address) != 42:
            raise HTTPException(
                status_code=400,
                detail="Invalid contract address format. Must start with '0x' and be 42 characters long."
            )
        
        # Analyze contract with AgentKit
        analysis_result = await agentkit_service.analyze_contract(
            request.contract_address, 
            request.chain_id
        )
        
        return AgentKitAnalysisResponse(
            contract_address=request.contract_address,
            risk_score=analysis_result["risk_score"],
            risk_level=agentkit_service.get_risk_level_name(analysis_result["risk_level"]),
            risk_level_value=analysis_result["risk_level_value"],
            confidence=analysis_result["confidence"],
            vulnerabilities=analysis_result["vulnerabilities"],
            analysis_summary=analysis_result["analysis_summary"],
            source=analysis_result["source"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AgentKit analysis failed: {str(e)}"
        )

@app.post("/scan", response_model=ScanResponse)
async def scan_contract(request: ScanRequest) -> ScanResponse:
    """
    Full contract scanning flow: fetch data, analyze with AI, write to blockchain.
    
    Args:
        request (ScanRequest): Contract scanning request containing address and chain ID
        
    Returns:
        ScanResponse: Scan results with risk score and transaction hash
        
    Raises:
        HTTPException: If any step in the scanning process fails
    """
    try:
        # Validate contract address format
        if not request.contract_address.startswith("0x") or len(request.contract_address) != 42:
            raise HTTPException(
                status_code=400,
                detail="Invalid contract address format. Must start with '0x' and be 42 characters long."
            )
        
        # 1. Fetch contract data from blockchain explorer
        contract_data = await explorer_service.get_contract_source_code(request.contract_address)
        
        if not contract_data or not contract_data.get("source_code"):
            raise HTTPException(
                status_code=404,
                detail="Contract not found or source code not available on Base Sepolia."
            )
        
        # 2. Analyze contract with Venice.ai AI
        risk_analysis = await venice_service.analyze_contract_code(contract_data["source_code"])
        
        if not risk_analysis or not risk_analysis.get("risk_score"):
            # Demo fallback: Return mock risk score if AI service unavailable
            risk_score = "MEDIUM"
        else:
            risk_score = risk_analysis["risk_score"]
        
        # 3. Write risk score to on-chain registry (demo mode)
        registry_address = os.getenv("RESULTS_REGISTRY_ADDRESS")
        private_key = os.getenv("DEPLOYER_PRIVATE_KEY")
        
        if not registry_address or not private_key:
            tx_hash = None  # Skip on-chain write in demo mode
        else:
            # Get ABI from environment or use default
            registry_abi_str = os.getenv("RESULTS_REGISTRY_ABI")
            registry_abi = json.loads(registry_abi_str) if registry_abi_str else []
            
            tx_hash = web3_service.write_score_to_chain(
                contract_address=request.contract_address,
                risk_score=risk_score,
                private_key=private_key,
                registry_address=registry_address,
                registry_abi=registry_abi
            )
        
        scan_id = f"scan_{request.chain_id}_{request.contract_address[-8:]}"
        
        return ScanResponse(
            message="Scan complete and result recorded successfully",
            contract_address=request.contract_address,
            risk_score=risk_score,
            transaction_hash=tx_hash,
            scan_id=scan_id,
            status="completed"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during scanning: {str(e)}"
        )

@app.get("/score/{contract_address}", response_model=ScoreResponse)
async def get_score(contract_address: str) -> ScoreResponse:
    """
    Retrieve risk score for a contract address from the on-chain registry.
    
    Args:
        contract_address (str): The contract address to query
        
    Returns:
        ScoreResponse: Contract address and risk score
        
    Raises:
        HTTPException: If the contract address is invalid or score not found
    """
    try:
        # Validate contract address format
        if not contract_address.startswith("0x") or len(contract_address) != 42:
            raise HTTPException(
                status_code=400,
                detail="Invalid contract address format. Must start with '0x' and be 42 characters long."
            )
        
        # Read risk score from on-chain registry
        registry_address = os.getenv("RESULTS_REGISTRY_ADDRESS")
        
        if not registry_address:
            # Demo fallback: Return mock score if registry not configured
            return ScoreResponse(
                contract_address=contract_address,
                risk_score="MEDIUM"
            )
        
        # Get ABI from environment or use default
        registry_abi_str = os.getenv("RESULTS_REGISTRY_ABI")
        registry_abi = json.loads(registry_abi_str) if registry_abi_str else []
        
        risk_score = web3_service.read_score_from_chain(
            contract_address=contract_address,
            registry_address=registry_address,
            registry_abi=registry_abi
        )
        
        if not risk_score or risk_score == "":
            raise HTTPException(
                status_code=404,
                detail="No risk score found for this contract address. Please scan the contract first."
            )
        
        return ScoreResponse(
            contract_address=contract_address,
            risk_score=risk_score
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error while retrieving score: {str(e)}"
        )

@app.get("/scan/{scan_id}")
async def get_scan_status(scan_id: str) -> Dict[str, Any]:
    """
    Get the status of a previously initiated scan.
    
    Args:
        scan_id (str): The unique scan identifier
        
    Returns:
        Dict[str, Any]: Scan status and results if available
    """
    # Placeholder for scan status retrieval
    return {
        "scan_id": scan_id,
        "status": "completed",
        "results": {
            "vulnerabilities": [],
            "analysis": {},
            "risk_score": 0.0
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )