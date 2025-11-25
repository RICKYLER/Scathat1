# Scathat Backend API Documentation

## Overview

The Scathat backend provides REST API endpoints for contract scanning, risk assessment, and blockchain security analysis.

**Base URL**: `https://api.scathat.com/api`

## Authentication

All endpoints require authentication using wallet signatures or API keys.

## Endpoints

### Contracts

#### POST /contracts/scan
Scan a smart contract for vulnerabilities.

**Request Body**:
\`\`\`json
{
  "contract_address": "0x...",
  "chain_id": 1,
  "force_refresh": false
}
\`\`\`

**Response** (200 OK):
\`\`\`json
{
  "contract_address": "0x...",
  "risk_status": "SAFE",
  "risk_score": 95,
  "risk_analysis": "No significant vulnerabilities detected",
  "timestamp": "2024-01-15T10:30:00Z",
  "scan_id": "scan_123abc"
}
\`\`\`

### Scans

#### GET /scans
Get user's scan history.

**Query Parameters**:
- `limit` (integer, default: 50) - Maximum results to return
- `offset` (integer, default: 0) - Pagination offset

**Response** (200 OK):
\`\`\`json
{
  "scans": [...],
  "total": 150,
  "limit": 50,
  "offset": 0
}
\`\`\`

## Error Handling

### Error Response Format
\`\`\`json
{
  "detail": "Error message",
  "error_code": "ERROR_CODE"
}
\`\`\`

### Common Status Codes
- `200 OK` - Successful request
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

- Free tier: 100 requests/day
- Pro tier: 10,000 requests/day
- Enterprise: Custom limits

## Environment Variables

\`\`\`env
DATABASE_URL=postgresql://user:password@localhost/scathat
REDIS_URL=redis://localhost:6379
ETHERSCAN_API_KEY=your_key
VENICE_AI_API_KEY=your_key
WEB3_PROVIDER_URL=https://eth.rpc.endpoint
