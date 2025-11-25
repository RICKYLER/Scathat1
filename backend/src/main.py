"""
Scathat Backend - FastAPI Application

Main entry point for the Scathat security scanning backend.
Handles contract analysis, risk assessment, and blockchain interactions.

Environment Variables Required:
- DATABASE_URL: PostgreSQL connection string
- REDIS_URL: Redis connection for caching
- ETHERSCAN_API_KEY: Etherscan API key for contract source code
- VENICE_AI_API_KEY: Venice.ai API key for risk analysis
- WEB3_PROVIDER_URL: RPC endpoint for Web3 interactions
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Scathat API",
    description="Smart contract security scanning and risk assessment API",
    version="2.0.0"
)

# CORS configuration - allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Simple health check endpoint to verify API is running
    """
    return {
        "status": "healthy",
        "service": "Scathat Backend",
        "version": "2.0.0"
    }


# API Routes will be imported from routers
# from routers import contracts, users, scans, admin

# Example error handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )
