"""
Scathat Backend API
Main FastAPI application for blockchain contract scanning and analysis.
"""

import logging
import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import services
from services.explorer_service import ExplorerService, ExplorerConfig
from services.venice_service import VeniceService, VeniceConfig
from services.web3_service import Web3Service, Web3Config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("scathat.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

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

# Initialize services
try:
    # Explorer Service Configuration (for Base Sepolia)
    explorer_config = ExplorerConfig(
        api_key=os.getenv("BASESCAN_API_KEY", os.getenv("ETHERSCAN_API_KEY", "")),
        base_url="https://api-sepolia.basescan.org/api",
        chain_id=84532,
        chain_name="Base Sepolia"
    )
    explorer_service = ExplorerService(explorer_config)
    
    # Venice Service Configuration
    venice_config = VeniceConfig(
        api_url=os.getenv("VENICE_API_URL"),
        api_key=os.getenv("VENICE_API_KEY"),
        model_id=os.getenv("VENICE_MODEL_ID")
    )
    venice_service = VeniceService(venice_config)
    
    # Web3 Service Configuration (for Base Sepolia)
    web3_config = Web3Config(
        rpc_url=os.getenv("BASE_SEPOLIA_RPC_URL", "https://base-sepolia-rpc.publicnode.com"),
        chain_id=os.getenv("BASE_SEPOLIA_CHAIN_ID", 84532),
        chain_name="Base Sepolia",
        explorer_url="https://sepolia.basescan.org",
        native_currency="ETH"
    )
    web3_service = Web3Service(web3_config)
    
    logger.info("All services initialized successfully")
    
except Exception as e:
    logger.error(f"Failed to initialize services: {str(e)}")
    raise RuntimeError(f"Service initialization failed: {str(e)}")

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
        
        logger.info(f"Starting full scan for contract: {request.contract_address} on chain: {request.chain_id}")
        
        # 1. Fetch contract data from blockchain explorer
        logger.info(f"Fetching contract data for {request.contract_address}")
        contract_data = await explorer_service.get_contract_source_code(request.contract_address)
        
        if not contract_data or not contract_data.get("source_code"):
            raise HTTPException(
                status_code=404,
                detail="Contract not found or source code not available on Base Sepolia."
            )
        
        # 2. Analyze contract with Venice.ai AI
        logger.info(f"Analyzing contract {request.contract_address} with Venice.ai")
        risk_analysis = await venice_service.analyze_contract_code(contract_data["source_code"])
        
        if not risk_analysis or not risk_analysis.get("risk_score"):
            raise HTTPException(
                status_code=500,
                detail="Failed to analyze contract with AI. Venice.ai service unavailable."
            )
        
        risk_score = risk_analysis["risk_score"]
        
        # 3. Write risk score to on-chain registry
        logger.info(f"Writing risk score to blockchain for {request.contract_address}")
        registry_address = os.getenv("RESULTS_REGISTRY_ADDRESS")
        private_key = os.getenv("DEPLOYER_PRIVATE_KEY")
        
        if not registry_address or not private_key:
            logger.warning("Registry address or private key not configured. Skipping on-chain write.")
            tx_hash = None
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
        logger.error(f"Error during contract scanning: {str(e)}")
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
        
        logger.info(f"Retrieving risk score for contract: {contract_address}")
        
        # Read risk score from on-chain registry
        registry_address = os.getenv("RESULTS_REGISTRY_ADDRESS")
        
        if not registry_address:
            raise HTTPException(
                status_code=500,
                detail="Results registry address not configured. Please deploy the registry contract first."
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
        logger.error(f"Error retrieving risk score for {contract_address}: {str(e)}")
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