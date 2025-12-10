"""
FastAPI Endpoint for Bytecode Detector Model

Provides REST API for smart contract bytecode risk assessment
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import numpy as np
from typing import List, Dict, Any
import logging
from datetime import datetime

# Import model components
from model_architecture import BytecodeTransformer
from bytecode_tokenizer import preprocess_bytecode, tokenize_bytecode

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Bytecode Detector API",
    description="API for smart contract bytecode risk assessment",
    version="1.0.0"
)

# Model configuration (will be loaded from checkpoint)
MODEL_CONFIG = {
    'vocab_size': 79,  # Actual vocab size from trained model
    'embed_dim': 128,
    'num_heads': 4,
    'num_layers': 2,
    'num_classes': 1
}

# Load model
model = None

def load_model():
    """Load the trained model"""
    global model
    try:
        model = BytecodeTransformer(**MODEL_CONFIG)
        checkpoint = torch.load("models/bytecode_detector_enhanced.pth", map_location='cpu')
        model.load_state_dict(checkpoint['model_state_dict'])
        model.eval()
        logger.info("Model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise

class BytecodeRequest(BaseModel):
    bytecode: str
    contract_address: str = None
    network: str = "mainnet"

class RiskResponse(BaseModel):
    risk_score: float
    pattern_scores: Dict[str, float]
    confidence: float
    processing_time: float
    contract_address: str = None
    network: str = "mainnet"
    timestamp: str

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    load_model()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Bytecode Detector API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/analyze", response_model=RiskResponse)
async def analyze_bytecode(request: BytecodeRequest):
    """
    Analyze EVM bytecode for security risks
    
    - **bytecode**: Contract bytecode (hex string)
    - **contract_address**: Optional contract address
    - **network**: Blockchain network
    """
    start_time = datetime.now()
    
    try:
        # Preprocess and tokenize bytecode
        processed_bytecode = preprocess_bytecode(request.bytecode)
        opcode_sequence = tokenize_bytecode(processed_bytecode)
        
        # Convert to tensor
        input_tensor = torch.tensor([opcode_sequence], dtype=torch.long)
        
        # Predict
        with torch.no_grad():
            risk_score, pattern_scores = model(input_tensor)
        
        # Convert to Python types
        risk_score = risk_score.item()
        pattern_scores = {
            'reentrancy': pattern_scores[0][0].item(),
            'selfdestruct': pattern_scores[0][1].item(),
            'delegatecall': pattern_scores[0][2].item(),
            'hidden_owner': pattern_scores[0][3].item(),
            'unchecked_call': pattern_scores[0][4].item()
        }
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return RiskResponse(
            risk_score=risk_score,
            pattern_scores=pattern_scores,
            confidence=1.0 - abs(risk_score - 0.5) * 2,  # Confidence based on distance from 0.5
            processing_time=processing_time,
            contract_address=request.contract_address,
            network=request.network,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/patterns")
async def get_supported_patterns():
    """Get list of supported vulnerability patterns"""
    return {
        "supported_patterns": [
            "reentrancy",
            "selfdestruct",
            "delegatecall",
            "hidden_owner",
            "unchecked_call"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
