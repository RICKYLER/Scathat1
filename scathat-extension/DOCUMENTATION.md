# Scathat Browser Extension Documentation

## 🏗️ Architecture Overview

The Scathat browser extension provides real-time smart contract security analysis directly in the user's browser, integrating with blockchain explorers and dApps.

```
scathat-extension/
├── backend/                 # Extension backend service (Node.js/Express)
│   ├── package.json        # Backend dependencies
│   └── README.md           # Backend setup instructions
├── scat/                   # Chrome extension source code
│   ├── src/
│   │   ├── background/    # Background service worker
│   │   ├── bridge/        # External communication bridge
│   │   ├── content/       # Content scripts for page injection
│   │   ├── contract/      # Contract client utilities
│   │   └── popup/         # Extension popup UI
│   ├── assets/            # Icons and static assets
│   ├── manifest.json      # Extension manifest
│   ├── package.json       # Extension dependencies
│   └── webpack.config.js  # Build configuration
└── README.md              # Main extension documentation
```

## 🔧 Core Components

### 1. Background Service Worker (`src/background/background.js`)
**Purpose**: Main extension lifecycle management and event handling.

**Key Responsibilities**:
- Extension installation and update handling
- Message passing between content scripts and popup
- Network request interception and analysis
- State management and storage
- Connection management with backend API

### 2. Content Scripts (`src/content/content.js`)
**Purpose**: Inject security analysis into web pages and dApps.

**Key Capabilities**:
- Detect and analyze smart contract addresses on web pages
- Inject security badges and warnings into dApp interfaces
- Monitor user interactions with smart contracts
- Provide real-time security feedback

### 3. Popup UI (`src/popup/`)
**Purpose**: User interface for extension settings and quick analysis.

**Components**:
- `popup.html` - Main popup structure
- `popup.js` - Popup functionality and event handling
- `popup.css` - Styling and responsive design

### 4. Contract Client (`src/contract/contractClient.js`)
**Purpose**: Smart contract interaction and analysis utilities.

**Key Features**:
- Contract address validation and normalization
- Blockchain RPC communication
- Analysis result processing
- Risk visualization and reporting

### 5. API Client (`src/api-client.js`)
**Purpose**: Communication with Scathat backend services.

**Key Endpoints**:
- Contract analysis requests
- Health checks and status monitoring
- Configuration retrieval
- Real-time security alerts

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn package manager
- Chrome, Firefox, or Edge browser

### Development Setup

**1. Install Dependencies**:
```bash
# Install extension dependencies
cd scathat-extension/scat
npm install

# Install backend dependencies (if using local backend)
cd ../backend
npm install
```

**2. Build the Extension**:
```bash
# Development build with hot reload
npm run dev

# Production build
npm run build
```

**3. Load in Browser**:

**Chrome/Edge**:
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `scathat-extension/scat` directory

**Firefox**:
1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select any file in the `scathat-extension/scat` directory

### Environment Configuration

**Backend Configuration**:
```javascript
// Backend URL configuration
const config = {
  backendURL: process.env.BACKEND_URL || 'http://localhost:8000',
  apiVersion: 'v1',
  timeout: 30000,
  retryAttempts: 3
};
```

**Extension Settings**:
```javascript
// Default extension settings
const defaultSettings = {
  autoScan: true,
  showWarnings: true,
  riskThreshold: 'medium',
  enabledChains: [1, 8453, 84532], // Ethereum, Base, Base Sepolia
  notificationSound: true,
  darkMode: false
};
```

## 🛠️ Development Guide

### Project Structure

```
scat/
├── src/
│   ├── background/
│   │   └── background.js          # Service worker
│   ├── bridge/
│   │   └── bridge.html            # External communication
│   ├── content/
│   │   └── content.js             # Content scripts
│   ├── contract/
│   │   └── contractClient.js      # Contract utilities
│   ├── popup/
│   │   ├── popup.html            # Popup UI
│   │   ├── popup.js               # Popup logic
│   │   └── popup.css              # Popup styles
│   └── api-client.js              # Backend API client
├── assets/
│   └── icons/                     # Extension icons
├── manifest.json                  # Extension manifest
├── package.json                   # Dependencies
├── webpack.config.js              # Build config
└── wallet-connect.html           # WalletConnect interface
```

### Manifest Configuration (`manifest.json`)

**Key Permissions**:
```json
{
  "permissions": [
    "activeTab",
    "storage",
    "scripting", 
    "webNavigation",
    "notifications",
    "webRequest"
  ],
  "host_permissions": [
    "*://*/*",
    "<all_urls>",
    "about:blank"
  ],
  "externally_connectable": {
    "matches": [
      "https://scathat.vercel.app/*",
      "http://localhost:3000/*",
      "http://localhost/*"
    ]
  }
}
```

### Building and Deployment

**Development Build**:
```bash
npm run dev
```

**Production Build**:
```bash
npm run build
```

**Build Output**:
- `dist/` directory containing compiled extension
- Source maps for debugging
- Optimized assets and minified code

## 🔌 API Integration

### Backend API Endpoints

**Health Check**:
```javascript
// GET /health
const response = await fetch(`${backendURL}/health`);
```

**Configuration**:
```javascript
// GET /config
const config = await fetch(`${backendURL}/config`);
```

**Contract Analysis**:
```javascript
// POST /analyze
const analysis = await fetch(`${backendURL}/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contractAddress: '0x...',
    chainId: 1
  })
});
```

### Message Passing Architecture

**Background ↔ Content Script**:
```javascript
// Content script to background
chrome.runtime.sendMessage({
  type: 'ANALYZE_CONTRACT',
  data: { address: '0x...', chainId: 1 }
});

// Background to content script  
chrome.tabs.sendMessage(tabId, {
  type: 'ANALYSIS_RESULT',
  data: { result: {...} }
});
```

**Popup ↔ Background**:
```javascript
// Popup to background
chrome.runtime.sendMessage({
  type: 'GET_SETTINGS'
});

// Background to popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SETTINGS_UPDATED') {
    // Handle settings update
  }
});
```

## 🎨 UI Components

### Popup Interface

The extension popup provides:
- Quick contract analysis input
- Settings and configuration
- Recent scan history
- Security status overview

**Popup Structure**:
```html
<div class="popup-container">
  <header class="popup-header">
    <img src="assets/icon.png" alt="Scathat" />
    <h1>Scathat Security</h1>
  </header>
  
  <main class="popup-main">
    <section class="quick-scan">
      <input type="text" placeholder="Enter contract address" />
      <button onclick="analyzeContract()">Analyze</button>
    </section>
    
    <section class="results">
      <!-- Analysis results -->
    </section>
  </main>
  
  <footer class="popup-footer">
    <a href="#settings">Settings</a>
    <span class="status">Connected</span>
  </footer>
</div>
```

### Content Script UI Injection

The extension injects security badges into web pages:

**Security Badge Example**:
```javascript
function injectSecurityBadge(contractAddress, riskLevel) {
  const badge = document.createElement('div');
  badge.className = `scathat-badge risk-${riskLevel}`;
  badge.innerHTML = `
    <span class="risk-icon">⚠️</span>
    <span class="risk-text">${riskLevel.toUpperCase()} RISK</span>
    <span class="contract-address">${contractAddress}</span>
  `;
  
  document.body.appendChild(badge);
}
```

## ⚙️ Configuration Options

### User Settings

**Storage Structure**:
```javascript
// Chrome storage API
chrome.storage.sync.set({
  settings: {
    autoScan: true,
    showWarnings: true,
    riskThreshold: 'medium',
    enabledChains: [1, 8453, 84532],
    notificationSound: true,
    darkMode: false,
    backendURL: 'http://localhost:8000'
  },
  scanHistory: [],
  whitelist: []
});
```

### Risk Thresholds

**Risk Level Configuration**:
```javascript
const RISK_THRESHOLDS = {
  critical: 0.9,   // 90%+ risk score
  high: 0.7,       // 70-89% risk score  
  medium: 0.4,     // 40-69% risk score
  low: 0.2,        // 20-39% risk score
  info: 0.1        // 10-19% risk score
};
```

## 🔒 Security Features

### Input Validation

**Contract Address Validation**:
```javascript
function isValidEthereumAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function isValidChecksumAddress(address) {
  // EIP-55 checksum validation
  // Implementation details...
}
```

### Secure Communication

**API Request Security**:
```javascript
async function secureApiRequest(url, data) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ScathatExtension'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
```

### Privacy Protection

**User Data Handling**:
- No personal data collection
- Anonymous usage statistics only
- Local storage for user preferences
- Encrypted communication with backend

## 📊 Performance Optimization

### Resource Management

**Efficient Content Scripts**:
```javascript
// Debounced event handlers
const debouncedAnalyze = debounce((address) => {
  analyzeContract(address);
}, 1000);

// Efficient DOM observation
const observer = new MutationObserver((mutations) => {
  // Efficiently detect contract addresses
});
```

### Memory Management

**Cleanup Procedures**:
```javascript
// Clean up injected elements
function cleanupInjectedElements() {
  document.querySelectorAll('.scathat-badge').forEach(el => el.remove());
}

// Event listener cleanup
function removeEventListeners() {
  window.removeEventListener('message', messageHandler);
}
```

## 🧪 Testing

### Test Structure

**Unit Tests**:
```bash
npm test
```

**Integration Tests**:
```bash
npm run test:integration
```

**Test Coverage**:
```bash
npm run test:coverage
```

### Test Examples

**Contract Validation Tests**:
```javascript
describe('Contract Validation', () => {
  test('validates Ethereum addresses', () => {
    expect(isValidEthereumAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(true);
    expect(isValidEthereumAddress('invalid')).toBe(false);
  });
});
```

**API Integration Tests**:
```javascript
describe('Backend API', () => {
  test('health check endpoint', async () => {
    const response = await fetch(`${backendURL}/health`);
    expect(response.status).toBe(200);
  });
});
```

## 🚀 Deployment

### Browser Store Deployment

**Chrome Web Store**:
1. Create production build: `npm run build`
2. Zip the `dist/` directory
3. Upload to Chrome Web Store Developer Dashboard
4. Submit for review

**Firefox Add-ons**:
1. Create production build: `npm run build`
2. Zip the `dist/` directory  
3. Upload to Firefox Add-ons Developer Hub
4. Submit for review

### Manual Distribution

**Load Unpacked**:
1. Enable developer mode in browser
2. Load the `dist/` directory as unpacked extension
3. Test functionality
4. Distribute ZIP file for manual installation

### Update Process

**Version Management**:
```json
{
  "manifest_version": 3,
  "version": "1.0.1",
  "version_name": "1.0.1-beta"
}
```

**Update Notifications**:
```javascript
// Listen for update events
chrome.runtime.onUpdateAvailable.addListener((details) => {
  console.log('Update available:', details.version);
});
```

## 🆘 Troubleshooting

### Common Issues

**Extension Not Loading**:
- Check browser console for errors
- Verify manifest.json syntax
- Check permission requirements

**API Connection Issues**:
- Verify backend URL configuration
- Check CORS settings on backend
- Verify network connectivity

**Content Script Issues**:
- Check for conflicts with other extensions
- Verify content script matches in manifest
- Check DOM readiness before injection

### Debugging

**Developer Tools**:
- Extension background page debugging
- Content script debugging
- Network request monitoring
- Console logging

**Logging**:
```javascript
// Debug logging
const debug = process.env.NODE_ENV === 'development';

function log(...args) {
  if (debug) {
    console.log('[Scathat]', ...args);
  }
}
```

### User Support

**Common Questions**:
- How to add custom backend URL
- How to adjust risk sensitivity  
- How to report false positives
- How to whitelist trusted contracts

**Support Channels**:
- GitHub Issues for bug reports
- Documentation for common questions
- Community forum for discussions

## 🔗 Integration Points

### Backend Integration
- REST API endpoints for contract analysis
- WebSocket connections for real-time updates
- Health check and status monitoring

### Blockchain Integration
- Multiple blockchain support (Ethereum, Base, Polygon, etc.)
- RPC provider integration
- Contract ABI retrieval and parsing

### dApp Integration
- Seamless integration with popular dApps
- MetaMask and WalletConnect compatibility
- Transaction monitoring and analysis

### External Services
- Blockchain explorers (Etherscan, Basescan)
- Security databases and threat intelligence
- Price oracles and market data

---
*Last Updated: 2026-01-13*