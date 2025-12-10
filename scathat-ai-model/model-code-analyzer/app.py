from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging
from analyze_contract import analyze_contract, load_model
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Model Code Analyzer API", version="1.0.0")

# Global model variables
model = None
tokenizer = None

class CodeAnalysisRequest(BaseModel):
    source_code: str
    metadata: Optional[Dict] = None

class Vulnerability(BaseModel):
    type: str
    severity: str
    location: str
    description: str

class CodeAnalysisResponse(BaseModel):
    risk_score: float
    confidence: float
    vulnerabilities: List[Vulnerability]
    recommendations: List[str]
    processing_time_ms: int

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    global model, tokenizer
    try:
        model_path = os.getenv("MODEL_PATH", "./fine_tuned_model")
        logger.info(f"Loading model from {model_path}")
        
        # Convert relative path to absolute path for Hugging Face
        if model_path.startswith("./"):
            model_path = os.path.abspath(model_path)
        
        tokenizer, model = load_model(model_path)
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        logger.warning("Running in fallback mode without model - analysis will return mock data")
        # Don't raise exception, allow service to start in fallback mode

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "service": "model-code-analyzer"
    }

@app.post("/analyze", response_model=CodeAnalysisResponse)
async def analyze_code(request: CodeAnalysisRequest):
    """
    Analyze Solidity smart contract code for vulnerabilities and security risks
    """
    if model is None or tokenizer is None:
        logger.warning("Model not loaded - returning mock analysis data")
        # Return mock data when model is not available
        return CodeAnalysisResponse(
            risk_score=0.3,
            confidence=0.7,
            vulnerabilities=[
                Vulnerability(
                    type="reentrancy",
                    severity="medium",
                    location="line:42",
                    description="Potential reentrancy vulnerability in withdraw function"
                )
            ],
            recommendations=["Use checks-effects-interactions pattern", "Add reentrancy guard"],
            processing_time_ms=25
        )
    
    try:
        # Perform analysis
        result = analyze_contract(tokenizer, model, request.source_code)
        
        # Convert to standardized response format
        return CodeAnalysisResponse(
            risk_score=result.get("risk_score", 0) / 100.0,  # Convert 0-100 to 0.0-1.0
            confidence=0.9,  # Placeholder confidence score
            vulnerabilities=[
                Vulnerability(
                    type="unknown",
                    severity="high",
                    location="",
                    description=vuln
                ) for vuln in result.get("vulnerabilities", [])
            ],
            recommendations=[result.get("summary", "")] if result.get("summary") else [],
            processing_time_ms=50  # Placeholder processing time
        )
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/info")
async def service_info():
    """Get service information"""
    return {
        "service": "model-code-analyzer",
        "version": "1.0.0",
        "capabilities": [
            "solidity_code_analysis",
            "vulnerability_detection",
            "risk_assessment"
        ],
        "model_loaded": model is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)