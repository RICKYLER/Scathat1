#!/usr/bin/env python3
"""
Unified API Server for Model Aggregator
Provides REST API endpoints for multi-model security analysis
"""

import json
import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Import aggregator
from model_aggregator import ResultAggregator

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for request/response
class BytecodeAnalysisRequest(BaseModel):
    """Request model for bytecode analysis"""
    bytecode: str = Field(..., description="EVM bytecode to analyze")
    contract_address: Optional[str] = Field(None, description="Contract address for context")

class CodeAnalysisRequest(BaseModel):
    """Request model for code analysis"""
    solidity_code: str = Field(..., description="Solidity source code to analyze")
    contract_name: Optional[str] = Field(None, description="Contract name for context")

class MultiModelAnalysisRequest(BaseModel):
    """Request model for multi-model analysis"""
    bytecode: str = Field(..., description="EVM bytecode to analyze")
    contract_address: Optional[str] = Field(None, description="Contract address for context")
    code_analysis: Optional[Dict[str, Any]] = Field(None, description="Optional code analysis results")
    behavior_analysis: Optional[Dict[str, Any]] = Field(None, description="Optional behavior analysis results")

class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    bytecode_service_available: bool
    code_analyzer_service_available: bool
    aggregator_ready: bool

class AnalysisResponse(BaseModel):
    """Analysis response model"""
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time_ms: Optional[int] = None

# Create FastAPI app
app = FastAPI(
    title="Scathat Model Aggregator API",
    description="Unified API for multi-model smart contract security analysis",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global aggregator instance
aggregator = None

def initialize_aggregator():
    """Initialize the model aggregator"""
    global aggregator
    try:
        aggregator = ResultAggregator()
        logger.info("Model aggregator initialized successfully")
        
        # Check bytecode service availability
        if aggregator.is_bytecode_service_available():
            logger.info("Bytecode analysis service is available")
        else:
            logger.warning("Bytecode analysis service is not available - using fallback mode")
            
    except Exception as e:
        logger.error(f"Failed to initialize aggregator: {e}")
        raise

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    initialize_aggregator()

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Scathat Model Aggregator API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "analyze_bytecode": "/analyze/bytecode",
            "analyze_multimodel": "/analyze/multimodel"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    if not aggregator:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Aggregator not initialized"
        )
    
    bytecode_available = aggregator.is_bytecode_service_available()
    code_analyzer_available = aggregator.is_code_analyzer_service_available()
    
    return HealthResponse(
        status="healthy" if aggregator else "unhealthy",
        bytecode_service_available=bytecode_available,
        code_analyzer_service_available=code_analyzer_available,
        aggregator_ready=aggregator is not None
    )

@app.post("/analyze/bytecode", response_model=AnalysisResponse)
async def analyze_bytecode(request: BytecodeAnalysisRequest):
    """
    Analyze EVM bytecode using the bytecode detector service
    
    This endpoint performs real-time bytecode analysis using the deployed
    bytecode detector model and returns the results in aggregator format.
    """
    
    if not aggregator:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Aggregator not initialized"
        )
    
    try:
        import time
        start_time = time.time()
        
        # Perform bytecode analysis
        result = aggregator.analyze_bytecode_real(
            request.bytecode, 
            request.contract_address
        )
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        return AnalysisResponse(
            success=True,
            result=result,
            processing_time_ms=processing_time_ms
        )
        
    except Exception as e:
        logger.error(f"Bytecode analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@app.post("/analyze/code", response_model=AnalysisResponse)
async def analyze_code(request: CodeAnalysisRequest):
    """
    Analyze Solidity source code using the code analyzer service
    
    This endpoint performs real-time code analysis using the deployed
    code analyzer model and returns the results in aggregator format.
    """
    
    if not aggregator:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Aggregator not initialized"
        )
    
    try:
        import time
        start_time = time.time()
        
        # Perform code analysis
        result = aggregator.analyze_code_real(
            request.solidity_code, 
            request.contract_name
        )
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        return AnalysisResponse(
            success=True,
            result=result,
            processing_time_ms=processing_time_ms
        )
        
    except Exception as e:
        logger.error(f"Code analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@app.post("/analyze/multimodel", response_model=AnalysisResponse)
async def analyze_multimodel(request: MultiModelAnalysisRequest):
    """
    Perform comprehensive multi-model security analysis
    
    This endpoint combines bytecode analysis with optional code and behavior
    analysis to provide a comprehensive security assessment.
    """
    
    if not aggregator:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Aggregator not initialized"
        )
    
    try:
        import time
        start_time = time.time()
        
        # Perform multi-model analysis
        result = aggregator.aggregate_with_real_bytecode(
            bytecode=request.bytecode,
            contract_address=request.contract_address,
            code_analysis=request.code_analysis,
            behavior_analysis=request.behavior_analysis
        )
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        return AnalysisResponse(
            success=True,
            result=result,
            processing_time_ms=processing_time_ms
        )
        
    except Exception as e:
        logger.error(f"Multi-model analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@app.get("/models/status")
async def get_models_status():
    """Get status of all available models"""
    
    if not aggregator:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Aggregator not initialized"
        )
    
    status_info = {
        "bytecode_detector": {
            "available": aggregator.is_bytecode_service_available(),
            "description": "EVM bytecode pattern detection"
        },
        "code_analyzer": {
            "available": False,  # Placeholder for future integration
            "description": "Source code analysis (future integration)"
        },
        "behavior_analyzer": {
            "available": False,  # Placeholder for future integration
            "description": "Runtime behavior analysis (future integration)"
        },
        "aggregator": {
            "available": True,
            "description": "Weighted scoring and result aggregation"
        }
    }
    
    return status_info

def main():
    """Run the API server"""
    
    # Initialize aggregator
    initialize_aggregator()
    
    # Run server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,  # Different port from bytecode detector
        log_level="info"
    )

if __name__ == "__main__":
    main()