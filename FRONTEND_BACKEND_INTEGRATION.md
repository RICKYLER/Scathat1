# Frontend-Backend Integration Guide

## Overview

This guide explains how the Next.js frontend communicates with the FastAPI backend and integrates smart contract data.

## API Communication

### Setup API Client

**File**: `web/utils/api-client.ts`

\`\`\`typescript
// Create reusable API client with error handling
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}
\`\`\`

### Example: Contract Scanning

**Frontend Component**:
\`\`\`typescript
// Calls backend scan endpoint
const handleScan = async (contractAddress: string) => {
  const result = await apiCall('/api/contracts/scan', {
    method: 'POST',
    body: JSON.stringify({
      contract_address: contractAddress,
      chain_id: 1,
    }),
  })
  
  setScanResult(result)
}
\`\`\`

**Backend Endpoint**:
\`\`\`python
# FastAPI endpoint that receives scan request
@router.post("/scan")
async def scan_contract(request: ScanRequest):
    # 1. Validate address
    # 2. Check cache (Redis)
    # 3. Fetch contract source
    # 4. Call Venice.ai API
    # 5. Save to database
    # 6. Return results
    return ScanResponse(...)
\`\`\`

## Data Flow

### Contract Scanning Flow

\`\`\`
User Input (Frontend)
    ↓
Frontend validation
    ↓
POST /api/contracts/scan
    ↓
Backend receives request
    ↓
Check Redis cache
    ↓ (if cached) ↓ (if not cached)
Return cached      Fetch contract source
    ↓              from block explorer
    ↓              ↓
    └─────────────→ Call Venice.ai API
                   ↓
                   Parse results
                   ↓
                   Save to PostgreSQL
                   ↓
                   Cache in Redis
                   ↓
Response to Frontend
    ↓
Update UI with results
\`\`\`

## Real-Time Updates

### WebSocket Connection

\`\`\`typescript
// Frontend: Connect to WebSocket for live updates
const ws = new WebSocket('ws://localhost:8000/ws/scans')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // Update UI with real-time scan progress
  setScanProgress(data.progress)
}
\`\`\`

## State Management

### Using React Query (SWR)

\`\`\`typescript
// Hook for fetching scan results
import useSWR from 'swr'

export function useScanResults(scanId: string) {
  const { data, error, isLoading } = useSWR(
    `/api/scans/${scanId}`,
    fetcher
  )

  return { results: data, error, isLoading }
}
\`\`\`

## Authentication

### Wallet Connection

\`\`\`typescript
// Frontend: Connect wallet
const handleConnectWallet = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const address = await signer.getAddress()
  
  // Verify with backend
  const response = await apiCall('/api/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ address }),
  })
  
  localStorage.setItem('auth_token', response.token)
}
\`\`\`

## Error Handling

### Standardized Error Response

\`\`\`typescript
// Backend returns standardized errors
{
  "detail": "Invalid contract address",
  "error_code": "INVALID_ADDRESS",
  "status_code": 400
}

// Frontend handles errors
.catch((error) => {
  if (error.error_code === 'INVALID_ADDRESS') {
    showError('Please enter a valid contract address')
  }
})
\`\`\`

## Rate Limiting

### Backend Rate Limiting

\`\`\`python
# FastAPI middleware for rate limiting
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@router.post("/scan")
@limiter.limit("100/hour")  # 100 requests per hour
async def scan_contract(request: ScanRequest):
    ...
\`\`\`

### Frontend Handling

\`\`\`typescript
// Retry with exponential backoff
const retryRequest = async (fn: Function, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (error.status === 429) {  // Too Many Requests
        await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))
      } else {
        throw error
      }
    }
  }
}
\`\`\`

## Testing Integration

### E2E Test Example

\`\`\`typescript
// test/integration.spec.ts
describe('Contract Scanner Integration', () => {
  it('should scan contract end-to-end', async () => {
    // Frontend sends request
    const response = await apiCall('/api/contracts/scan', {
      method: 'POST',
      body: JSON.stringify({
        contract_address: '0x1234567890123456789012345678901234567890',
        chain_id: 1,
      }),
    })

    // Backend processes request
    expect(response).toHaveProperty('risk_status')
    expect(response.risk_score).toBeGreaterThanOrEqual(0)
    expect(response.risk_score).toBeLessThanOrEqual(100)
  })
})
\`\`\`

## Caching Strategy

### Redis Cache Layers

\`\`\`python
# Layer 1: Frontend cache (SWR)
# Layer 2: Redis cache (24 hours)
# Layer 3: Database (permanent)

# On request:
# 1. Check frontend cache (SWR)
# 2. Check Redis cache
# 3. Fetch from DB
# 4. Cache in Redis
# 5. Return to frontend
\`\`\`

## Performance Optimization

### API Response Compression

\`\`\`python
# Enable gzip compression
from fastapi.middleware.gzip import GZIPMiddleware

app.add_middleware(GZIPMiddleware, minimum_size=1000)
\`\`\`

### Frontend Lazy Loading

\`\`\`typescript
// Lazy load heavy components
const AdminDashboard = dynamic(
  () => import('@/components/admin/admin-dashboard'),
  { loading: () => <div>Loading...</div> }
)
\`\`\`

## Monitoring Integration

### Request Logging

\`\`\`python
# Backend logs all API requests
import logging

logger.info(f"API Request: {method} {path}")
logger.debug(f"Response: {status_code}")
\`\`\`

### Frontend Analytics

\`\`\`typescript
// Track frontend metrics
import posthog from 'posthog-js'

posthog.capture('contract_scanned', {
  status: result.risk_status,
  score: result.risk_score,
})
