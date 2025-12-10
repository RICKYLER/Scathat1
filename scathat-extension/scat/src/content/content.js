// Content script for Scathat extension - runs in web pages
class ScathatContent {
  constructor() {
    this.initialized = false;
    this.contractElements = [];
    this.init();
  }

  init() {
    this.setupMutationObserver();
    this.scanPageForContracts();
    this.setupMessageListeners();
    this.initialized = true;
    console.log('Scathat content script initialized');
  }

  setupMutationObserver() {
    // Watch for dynamic content changes that might include contract addresses
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
          this.scanNewContent(mutation.addedNodes);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  setupMessageListeners() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'CONTRACT_PAGE_DETECTED':
        this.handleContractPageDetection(message.url);
        sendResponse({ success: true });
        break;

      case 'SCAN_CURRENT_PAGE':
        const results = this.scanPageForContracts();
        sendResponse({ success: true, results });
        break;

      case 'HIGHLIGHT_CONTRACTS':
        this.highlightContractElements();
        sendResponse({ success: true });
        break;

      case 'CONNECT_WALLET':
        sendResponse({ success: false, error: 'Wallet connection disabled in this build.' });
        return true;

      case 'INTERCEPT_TRANSACTION':
        try {
          const result = await this.interceptTransaction(message.data);
          sendResponse({ success: true, result });
        } catch (error) {
          console.error('Error intercepting transaction:', error);
          sendResponse({ success: false, error: error.message });
        }
        return true;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
    return true;
  }

  scanPageForContracts() {
    const contractAddresses = this.findContractAddresses();
    const results = [];

    contractAddresses.forEach((address, index) => {
      const element = this.markContractElement(address.element, address.value);
      if (element) {
        results.push({
          address: address.value,
          element: element,
          context: this.getElementContext(address.element)
        });
      }
    });

    this.contractElements = results;
    
    if (results.length > 0) {
      this.notifyContractsFound(results);
    }

    return results;
  }

  scanNewContent(nodes) {
    nodes.forEach(node => {
      if (node.nodeType === 1) { // Element node
        const addresses = this.findContractAddressesInElement(node);
        addresses.forEach(address => {
          const element = this.markContractElement(address.element, address.value);
          if (element) {
            this.contractElements.push({
              address: address.value,
              element: element,
              context: this.getElementContext(address.element)
            });
            this.notifyContractFound(address.value, element);
          }
        });
      }
    });
  }

  findContractAddresses() {
    const addresses = [];
    const textNodes = this.findAllTextNodes(document.body);

    textNodes.forEach(node => {
      const text = node.textContent;
      const contractMatches = this.detectContractAddresses(text);
      
      contractMatches.forEach(match => {
        addresses.push({
          value: match,
          element: node.parentElement,
          context: text
        });
      });
    });

    return addresses;
  }

  findContractAddressesInElement(element) {
    const addresses = [];
    const textNodes = this.findAllTextNodes(element);

    textNodes.forEach(node => {
      const text = node.textContent;
      const contractMatches = this.detectContractAddresses(text);
      
      contractMatches.forEach(match => {
        addresses.push({
          value: match,
          element: node.parentElement,
          context: text
        });
      });
    });

    return addresses;
  }

  findAllTextNodes(element) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: node => 
          node.textContent.trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
      }
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    return textNodes;
  }

  detectContractAddresses(text) {
    // Ethereum/BSC/Polygon addresses (0x followed by 40 hex characters)
    const ethAddressRegex = /0x[a-fA-F0-9]{40}/g;
    
    // Solana addresses (base58 format)
    const solanaAddressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
    
    const matches = [];
    
    // Check for Ethereum-style addresses
    let match;
    while ((match = ethAddressRegex.exec(text)) !== null) {
      matches.push(match[0]);
    }
    
    // Check for Solana-style addresses (with additional validation)
    while ((match = solanaAddressRegex.exec(text)) !== null) {
      if (this.isValidSolanaAddress(match[0])) {
        matches.push(match[0]);
      }
    }
    
    return matches;
  }

  isValidSolanaAddress(address) {
    // Basic Solana address validation (could be enhanced)
    return address.length >= 32 && address.length <= 44;
  }

  markContractElement(element, address) {
    if (!element || element.classList.contains('scathat-highlighted')) {
      return null;
    }

    element.classList.add('scathat-highlighted');
    
    // Add hover effect and tooltip
    element.style.position = 'relative';
    element.style.cursor = 'pointer';
    
    element.addEventListener('mouseenter', () => {
      this.showContractTooltip(element, address);
    });
    
    element.addEventListener('mouseleave', () => {
      this.hideContractTooltip();
    });
    
    element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleContractClick(address, element);
    });

    return element;
  }

  showContractTooltip(element, address) {
    this.removeExistingTooltip();
    
    const tooltip = document.createElement('div');
    tooltip.className = 'scathat-tooltip';
    tooltip.innerHTML = `
      <div class="scathat-tooltip-content">
        <strong>Contract Detected</strong><br>
        <small>${address}</small><br>
        <button class="scathat-scan-btn">Scan Security</button>
      </div>
    `;
    
    tooltip.style.cssText = `
      position: absolute;
      background: hsl(195 60% 12%);
      border: 1px solid hsl(195 40% 20%);
      padding: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: hsl(180 10% 90%);
    `;
    
    const rect = element.getBoundingClientRect();
    tooltip.style.top = (rect.bottom + window.scrollY + 5) + 'px';
    tooltip.style.left = (rect.left + window.scrollX) + 'px';
    
    document.body.appendChild(tooltip);
    
    // Add scan button functionality
    const scanBtn = tooltip.querySelector('.scathat-scan-btn');
    scanBtn.addEventListener('click', () => {
      this.scanContract(address);
    });
    
    this.currentTooltip = tooltip;
  }

  hideContractTooltip() {
    this.removeExistingTooltip();
  }

  removeExistingTooltip() {
    if (this.currentTooltip && this.currentTooltip.parentNode) {
      this.currentTooltip.parentNode.removeChild(this.currentTooltip);
      this.currentTooltip = null;
    }
  }

  handleContractClick(address, element) {
    this.scanContract(address);
  }

  async scanContract(address) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SCAN_CONTRACT',
        data: { address: address }
      });
      
      if (response.success) {
        this.showScanResults(response.result);
      } else {
        this.showError('Scan failed: ' + response.error);
      }
    } catch (error) {
      this.showError('Error scanning contract: ' + error.message);
    }
  }

  showScanResults(results) {
    this.removeExistingTooltip();
    
    const modal = document.createElement('div');
    modal.className = 'scathat-results-modal';
    modal.innerHTML = `
      <div class="scathat-modal-content">
        <h3>Security Analysis Results</h3>
        <div class="scathat-score">
          Security Score: <strong>${results.securityScore.toFixed(1)}/100</strong>
        </div>
        ${results.vulnerabilities.length > 0 ? `
          <div class="scathat-vulnerabilities">
            <h4>Vulnerabilities Found:</h4>
            <ul>
              ${results.vulnerabilities.map(vuln => `
                <li class="vuln-${vuln.severity}">
                  [${vuln.severity.toUpperCase()}] ${vuln.description}
                </li>
              `).join('')}
            </ul>
          </div>
        ` : '<p>No critical vulnerabilities found</p>'}
        <button class="scathat-close-btn">Close</button>
      </div>
    `;
    
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: hsl(195 60% 12%);
      border: 1px solid hsl(195 40% 20%);
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      z-index: 10001;
      max-width: 500px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: hsl(180 10% 90%);
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.scathat-close-btn');
    closeBtn.addEventListener('click', () => {
      modal.remove();
    });
  }

  showError(message) {
    alert('Scathat Error: ' + message);
  }

  highlightContractElements() {
    this.contractElements.forEach(contract => {
      contract.element.style.outline = '2px solid hsl(160 60% 45%)';
      contract.element.style.outlineOffset = '2px';
    });
  }

  getElementContext(element) {
    return {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      textContent: element.textContent?.substring(0, 100) + '...'
    };
  }

  notifyContractsFound(contracts) {
    chrome.runtime.sendMessage({
      type: 'CONTRACTS_FOUND',
      data: {
        count: contracts.length,
        contracts: contracts.map(c => c.address),
        url: window.location.href
      }
    });
  }

  notifyContractFound(address, element) {
    chrome.runtime.sendMessage({
      type: 'CONTRACT_FOUND',
      data: {
        address: address,
        context: this.getElementContext(element),
        url: window.location.href
      }
    });
  }

  handleContractPageDetection(url) {
    console.log('Contract page detected:', url);
    this.scanPageForContracts();
  }

  // Transaction Interception Methods
  injectTransactionInterceptor() {
    // Wallet interception removed
    return;
  }

  interceptEthereumProvider() {
    // Wallet interception removed
    return;
  }

  async interceptTransactionRequest(args, originalMethod) {
    let loadingModal = null;
    
    try {
      const transaction = args.params?.[0] || args;
      
      // Extract transaction details
      const txDetails = {
        to: transaction.to,
        data: transaction.data,
        value: transaction.value || '0',
        from: transaction.from,
        gas: transaction.gas,
        gasPrice: transaction.gasPrice
      };

      console.log('Intercepted transaction:', txDetails);

      // Check cache first
      const cachedAnalysis = this.getCachedAnalysis(txDetails.to);
      if (cachedAnalysis) {
        console.log('Using cached analysis:', cachedAnalysis);
        this.showTransactionWarning(txDetails, cachedAnalysis);
        // For now, proceed with original transaction
        return originalMethod(args);
      }

      // Show loading state while analyzing
      loadingModal = this.showLoadingState(txDetails);

      // Send to background for analysis
      const analysisResult = await this.analyzeTransaction(txDetails);
      
      // Remove loading state
      if (loadingModal) {
        loadingModal.remove();
        loadingModal = null;
      }
      
      // Cache the result
      this.cacheAnalysis(txDetails.to, analysisResult);
      
      // Show traffic-light warning modal with transaction control
      this.showTransactionWarning(txDetails, analysisResult, originalMethod, args);

      // Transaction is now paused - the modal will handle resolution
      // based on user decision (proceed, block, or acknowledge)
      throw new Error('Transaction paused for security review');

    } catch (error) {
      console.error('Error intercepting transaction:', error);
      
      // Remove loading state if it exists
      if (loadingModal) {
        loadingModal.remove();
      }
      
      // Show error state
      this.showErrorState(txDetails, error);
      
      // Fallback to original method on error
      return originalMethod(args);
    }
  }

  async analyzeTransaction(txDetails) {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'ANALYZE_TRANSACTION',
        data: txDetails
      });

      if (response.success) {
        return response.result;
      } else {
        throw new Error(response.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        securityScore: 50,
        risks: ['Analysis service unavailable'],
        recommendations: ['Proceed with caution']
      };
    }
  }

  getCachedAnalysis(contractAddress) {
    try {
      const cacheKey = `scathat_analysis_${contractAddress}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache is still valid (1 hour)
        if (Date.now() - data.timestamp < 3600000) {
          return data.result;
        }
        // Cache expired, remove it
        localStorage.removeItem(cacheKey);
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  }

  cacheAnalysis(contractAddress, analysisResult) {
    try {
      const cacheKey = `scathat_analysis_${contractAddress}`;
      const cacheData = {
        result: analysisResult,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  /**
   * Parse AI response into UI variables for traffic-light logic
   */
  parseAIResponse(aiResponse) {
    const { riskLevel, riskScore, verificationStatus, codeNotes } = aiResponse;
    
    let status, icon, title, description, color;
    
    switch (riskLevel?.toLowerCase()) {
      case 'safe':
        status = 'safe';
        icon = '✅';
        title = 'Safe Contract';
        description = 'This contract appears to be safe and verified.';
        color = '#28a745';
        break;
        
      case 'warning':
        status = 'warning';
        icon = '⚠️';
        title = 'Warning Detected';
        description = 'This contract has potential risks that require attention.';
        color = '#ffc107';
        break;
        
      case 'dangerous':
        status = 'dangerous';
        icon = '🚨';
        title = 'Dangerous Contract';
        description = 'This contract contains high-risk elements. Proceed with extreme caution.';
        color = '#dc3545';
        break;
        
      default:
        status = 'unknown';
        icon = '❓';
        title = 'Unknown Risk Level';
        description = 'Unable to determine contract safety level.';
        color = '#6c757d';
    }
    
    // Add verification status to description
    if (verificationStatus && verificationStatus !== 'Verified') {
      description += ` Contract verification: ${verificationStatus}.`;
    }
    
    // Add code notes if available
    if (codeNotes && codeNotes.length > 0) {
      description += ' ' + codeNotes.join('. ') + '.';
    }
    
    return {
      status,
      icon,
      title,
      description,
      color,
      riskScore: riskScore || 50,
      verificationStatus: verificationStatus || 'Unknown',
      codeNotes: codeNotes || []
    };
  }

  showTransactionWarning(txDetails, analysis, originalMethod, originalArgs) {
    // Parse AI response for traffic-light UI
    const uiData = this.parseAIResponse(analysis);
    
    // Create traffic-light modal
    const modal = document.createElement('div');
    modal.className = 'scathat-traffic-light-modal';
    
    let actionButtons = '';
    
    // Different button configurations based on risk level
    switch (uiData.status) {
      case 'safe':
        actionButtons = `
          <button class="scathat-proceed-btn scathat-safe-btn">
            ✅ Proceed Safely
          </button>
        `;
        break;
        
      case 'warning':
        actionButtons = `
          <button class="scathat-proceed-btn scathat-warning-btn">
            ⚠️ Proceed Anyway
          </button>
          <button class="scathat-cancel-btn scathat-warning-cancel-btn">
            🚫 Block Transaction
          </button>
        `;
        break;
        
      case 'dangerous':
        actionButtons = `
          <button class="scathat-acknowledge-btn scathat-dangerous-btn">
            🚨 I Understand
          </button>
        `;
        break;
        
      default:
        actionButtons = `
          <button class="scathat-proceed-btn">
            Proceed Anyway
          </button>
          <button class="scathat-cancel-btn">
            Cancel
          </button>
        `;
    }
    
    modal.innerHTML = `
      <div class="scathat-traffic-light-content" style="border-color: ${uiData.color};">
        <div class="scathat-header" style="color: ${uiData.color};">
          <span class="scathat-icon">${uiData.icon}</span>
          <h3>${uiData.title}</h3>
        </div>
        
        <div class="scathat-details">
          <p><strong>Contract:</strong> ${txDetails.to}</p>
          <p><strong>Risk Score:</strong> ${uiData.riskScore}/100</p>
          <p><strong>Verification:</strong> ${uiData.verificationStatus}</p>
          
          <div class="scathat-description">
            <p>${uiData.description}</p>
          </div>
          
          ${uiData.codeNotes.length > 0 ? `
            <div class="scathat-code-notes">
              <h4>Code Analysis:</h4>
              <ul>
                ${uiData.codeNotes.map(note => `<li>${note}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        
        <div class="scathat-actions">
          ${actionButtons}
        </div>
      </div>
    `;

    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: hsl(195 60% 12%);
      border: 3px solid ${uiData.color};
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 8px 32px ${this.hexToRgba(uiData.color, 0.3)};
      z-index: 10002;
      max-width: 500px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: hsl(180 10% 90%);
    `;

    document.body.appendChild(modal);

    // Store transaction context for promise resolution
    const transactionContext = {
      modal,
      txDetails,
      originalMethod,
      originalArgs,
      uiData
    };

    // Add event listeners based on risk level
    this.setupTrafficLightEventListeners(transactionContext);
    
    return modal;
  }

  /**
   * Setup event listeners for traffic-light UI based on risk level
   */
  setupTrafficLightEventListeners(context) {
    const { modal, uiData, originalMethod, originalArgs } = context;
    
    switch (uiData.status) {
      case 'safe':
        // Safe: Auto-resolve and proceed
        modal.querySelector('.scathat-proceed-btn').addEventListener('click', () => {
          modal.remove();
          // Resolve the transaction promise immediately
          originalMethod(originalArgs);
        });
        break;
        
      case 'warning':
        // Warning: User choice to proceed or block
        modal.querySelector('.scathat-proceed-btn').addEventListener('click', () => {
          modal.remove();
          // User chose to proceed
          originalMethod(originalArgs);
        });
        
        modal.querySelector('.scathat-cancel-btn').addEventListener('click', () => {
          modal.remove();
          // User chose to block - reject the transaction
          throw new Error('Transaction blocked by user due to security warnings');
        });
        break;
        
      case 'dangerous':
        // Dangerous: Only acknowledge, transaction is blocked
        modal.querySelector('.scathat-acknowledge-btn').addEventListener('click', () => {
          modal.remove();
          // Transaction is permanently blocked for dangerous contracts
          throw new Error('Transaction blocked: Contract classified as dangerous');
        });
        break;
        
      default:
        // Unknown: Default behavior
        modal.querySelector('.scathat-proceed-btn').addEventListener('click', () => {
          modal.remove();
          originalMethod(originalArgs);
        });
        
        modal.querySelector('.scathat-cancel-btn').addEventListener('click', () => {
          modal.remove();
          throw new Error('Transaction cancelled by user');
        });
    }
  }

  /**
   * Convert hex color to rgba for box shadow
   */
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Get network information from chain ID
   */
  getNetworkInfo(chainId) {
    const networks = {
      1: { name: 'Ethereum Mainnet', chainId: 1 },
      5: { name: 'Goerli Testnet', chainId: 5 },
      11155111: { name: 'Sepolia Testnet', chainId: 11155111 },
      8453: { name: 'Base Mainnet', chainId: 8453 },
      84531: { name: 'Base Goerli Testnet', chainId: 84531 },
      137: { name: 'Polygon Mainnet', chainId: 137 },
      80001: { name: 'Polygon Mumbai Testnet', chainId: 80001 },
      42161: { name: 'Arbitrum One', chainId: 42161 },
      10: { name: 'Optimism', chainId: 10 },
      56: { name: 'BNB Smart Chain', chainId: 56 }
    };
    
    return networks[chainId] || { name: 'Unknown Network', chainId };
  }

  waitForWalletInjection() {
    // Wallet interception removed
    return;
  }

  showLoadingState(txDetails) {
    // Create loading modal
    const modal = document.createElement('div');
    modal.className = 'scathat-loading-modal';
    modal.innerHTML = `
      <div class="scathat-loading-content">
        <div class="scathat-loading-spinner"></div>
        <h3>🔍 Analyzing Contract...</h3>
        <p>Analyzing security of contract: ${txDetails.to}</p>
        <p class="scathat-loading-subtitle">This may take a few moments</p>
      </div>
    `;

    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: hsl(195 60% 12%);
      border: 2px solid hsl(195 40% 20%);
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 8px 32px hsl(160 60% 45% / 0.18);
      z-index: 10001;
      max-width: 400px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: hsl(180 10% 90%);
    `;

    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
      .scathat-loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid hsl(195 40% 20%);
        border-top: 4px solid hsl(160 60% 45%);
        border-radius: 50%;
        animation: scathat-spin 1s linear infinite;
        margin: 0 auto 20px;
      }
      @keyframes scathat-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .scathat-loading-subtitle {
        color: hsl(195 20% 55%);
        font-size: 14px;
        margin-top: 10px;
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(modal);
    return modal;
  }

  showErrorState(txDetails, error) {
    // Create error modal
    const modal = document.createElement('div');
    modal.className = 'scathat-error-modal';
    modal.innerHTML = `
      <div class="scathat-error-content">
        <h3>❌ Analysis Failed</h3>
        <p>Could not analyze contract: ${txDetails.to}</p>
        <p class="scathat-error-message">Error: ${error.message}</p>
        <div class="scathat-error-actions">
          <button class="scathat-retry-btn">Retry Analysis</button>
          <button class="scathat-proceed-btn">Proceed Anyway</button>
        </div>
      </div>
    `;

    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: hsl(195 60% 12%);
      border: 2px solid hsl(0 84% 60%);
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 8px 32px hsl(0 84% 60% / 0.25);
      z-index: 10001;
      max-width: 450px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: hsl(180 10% 90%);
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelector('.scathat-retry-btn').addEventListener('click', async () => {
      modal.remove();
      // Retry analysis
      try {
        const loadingModal = this.showLoadingState(txDetails);
        const analysisResult = await this.analyzeTransaction(txDetails);
        loadingModal.remove();
        this.showTransactionWarning(txDetails, analysisResult);
      } catch (retryError) {
        this.showErrorState(txDetails, retryError);
      }
    });

    modal.querySelector('.scathat-proceed-btn').addEventListener('click', () => {
      modal.remove();
    });

    return modal;
  }
}

// Initialize content script
const scathatContent = new ScathatContent();

// Inject transaction interceptor after initialization
setTimeout(() => {
  scathatContent.injectTransactionInterceptor();
}, 1000);
