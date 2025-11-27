// Background service worker for Scathat extension
import { scathatAPI } from '../api-client.js';

class ScathatBackground {
  constructor() {
    this.connected = false;
    this.sessionId = null;
    this.apiClient = null;
    this.init();
  }

  async init() {
    this.setupListeners();
    await this.initializeStorage();
    await this.initializeAPIClient();
    console.log('Scathat background service initialized');
  }

  setupListeners() {
    // Handle extension installation
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.onExtensionInstall();
      } else if (details.reason === 'update') {
        this.onExtensionUpdate();
      }
    });

    // Handle messages from content scripts and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      return this.handleMessage(message, sender, sendResponse);
    });

    // Handle tab updates for smart contract detection
    chrome.webNavigation.onCompleted.addListener((details) => {
      this.handlePageLoad(details);
    });
  }

  async initializeStorage() {
    const data = await chrome.storage.local.get(['settings', 'session']);
    if (!data.settings) {
      await chrome.storage.local.set({
        settings: {
          autoScan: true,
          securityLevel: 'high',
          notifications: true,
          whitelistedSites: [],
          backendURL: 'http://localhost:8000'
        }
      });
    }
  }

  async initializeAPIClient() {
    try {
      const settings = await this.getSettings();
      
      // Configure API client with settings
      scathatAPI.configure({
        baseURL: settings.backendURL || 'http://localhost:8000',
        timeout: 15000 // 15 second timeout
      });

      this.apiClient = scathatAPI;
      
      // Test backend connection
      const isHealthy = await this.apiClient.healthCheck();
      if (isHealthy) {
        console.log('Backend API connected successfully');
      } else {
        console.warn('Backend API health check failed - using fallback mode');
      }
      
    } catch (error) {
      console.error('Failed to initialize API client:', error);
      this.apiClient = scathatAPI; // Still assign for fallback functionality
    }
  }

  onExtensionInstall() {
    console.log('Scathat extension installed');
    this.showWelcomeNotification();
  }

  onExtensionUpdate() {
    console.log('Scathat extension updated');
  }

  showWelcomeNotification() {
    chrome.notifications.create('welcome', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('assets/icons/icon-128.png'),
      title: 'Scathat Installed',
      message: 'Your AI-powered smart contract security shield is now active!',
      priority: 2
    });
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'CONNECT':
          await this.handleConnect(message.data);
          sendResponse({ success: true, sessionId: this.sessionId });
          break;

        case 'DISCONNECT':
          await this.handleDisconnect();
          sendResponse({ success: true });
          break;

        case 'SCAN_CONTRACT':
          const result = await this.scanContract(message.data);
          sendResponse({ success: true, result });
          break;

        case 'ANALYZE_TRANSACTION':
          const analysis = await this.analyzeTransaction(message.data);
          sendResponse({ success: true, result: analysis });
          break;

        case 'GET_STATUS':
          sendResponse({
            connected: this.connected,
            sessionId: this.sessionId,
            settings: await this.getSettings()
          });
          break;

        case 'UPDATE_SETTINGS':
          await this.updateSettings(message.data);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true; // Keep message channel open for async response
  }

  async handleConnect(connectionData) {
    // Implement secure connection to main application
    // This would typically involve authentication and session establishment
    this.connected = true;
    this.sessionId = this.generateSessionId();
    
    await chrome.storage.local.set({
      session: {
        id: this.sessionId,
        connected: true,
        timestamp: Date.now(),
        user: connectionData?.user
      }
    });

    console.log('Connected to Scathat service with session:', this.sessionId);
  }

  async handleDisconnect() {
    this.connected = false;
    this.sessionId = null;
    
    await chrome.storage.local.remove('session');
    console.log('Disconnected from Scathat service');
  }

  async scanContract(contractData) {
    if (!this.connected) {
      throw new Error('Not connected to Scathat service');
    }

    // Simulate contract scanning - in production, this would call your backend API
    const analysisResult = {
      contractAddress: contractData.address,
      securityScore: this.calculateSecurityScore(contractData),
      vulnerabilities: this.detectVulnerabilities(contractData),
      timestamp: Date.now(),
      recommendations: this.generateRecommendations(contractData)
    };

    return analysisResult;
  }

  calculateSecurityScore(contractData) {
    // Placeholder for actual security scoring logic
    return Math.random() * 100;
  }

  detectVulnerabilities(contractData) {
    // Placeholder for vulnerability detection logic
    return [
      {
        type: 'reentrancy',
        severity: 'high',
        description: 'Potential reentrancy vulnerability detected'
      }
    ];
  }

  generateRecommendations(contractData) {
    return [
      'Review contract access controls',
      'Implement proper error handling',
      'Add event logging for critical operations'
    ];
  }

  async analyzeTransaction(txDetails) {
    try {
      // Check cache first
      const cachedResult = await this.getCachedTransactionAnalysis(txDetails.to);
      if (cachedResult) {
        console.log('Using cached transaction analysis for:', txDetails.to);
        return cachedResult;
      }

      // Use API client for backend analysis
      const analysisResult = await this.apiClient.analyzeContract(
        txDetails.to,
        await this.getCurrentChainId(),
        txDetails
      );

      // Cache the result
      await this.cacheTransactionAnalysis(txDetails.to, analysisResult);

      return analysisResult;

    } catch (error) {
      console.error('Error analyzing transaction:', error);
      // Fallback to local analysis if API fails
      return {
        securityScore: this.calculateTransactionSecurityScore(txDetails),
        risks: this.detectTransactionRisks(txDetails),
        recommendations: this.generateTransactionRecommendations(txDetails),
        timestamp: Date.now(),
        metadata: {
          fromCache: false,
          error: true,
          errorMessage: error.message,
          source: 'fallback'
        }
      };
    }
  }

  calculateTransactionSecurityScore(txDetails) {
    // Placeholder for actual transaction security scoring
    // This would analyze the transaction data, value, gas settings, etc.
    let score = 80; // Base score
    
    // Adjust score based on transaction characteristics
    if (txDetails.value && parseInt(txDetails.value) > 0) {
      score -= 10; // Deduct for value transfer
    }
    
    if (txDetails.data && txDetails.data.length > 0) {
      // Complex transactions with data are riskier
      score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  detectTransactionRisks(txDetails) {
    const risks = [];
    
    // Detect common risks
    if (txDetails.value && parseInt(txDetails.value) > 0) {
      risks.push('Value transfer detected - ensure contract is trustworthy');
    }
    
    if (txDetails.gasPrice && parseInt(txDetails.gasPrice) > 100000000000) {
      risks.push('High gas price detected - potential frontrunning risk');
    }
    
    // Add more risk detection logic here
    if (!txDetails.data || txDetails.data === '0x') {
      risks.push('Simple ETH transfer - ensure recipient address is correct');
    }
    
    return risks.length > 0 ? risks : ['No immediate risks detected'];
  }

  generateTransactionRecommendations(txDetails) {
    const recommendations = [];
    
    recommendations.push('Verify contract address on block explorer');
    recommendations.push('Check recent contract activity');
    
    if (txDetails.value && parseInt(txDetails.value) > 0) {
      recommendations.push('Consider sending a small test amount first');
    }
    
    return recommendations;
  }

  async getCachedTransactionAnalysis(contractAddress) {
    try {
      const cacheKey = `tx_analysis_${contractAddress}`;
      const data = await chrome.storage.local.get(cacheKey);
      
      if (data[cacheKey]) {
        const cachedData = data[cacheKey];
        // Check if cache is still valid (1 hour)
        if (Date.now() - cachedData.timestamp < 3600000) {
          return cachedData.result;
        }
        // Cache expired, remove it
        await chrome.storage.local.remove(cacheKey);
      }
    } catch (error) {
      console.error('Error reading transaction cache:', error);
    }
    return null;
  }

  async cacheTransactionAnalysis(contractAddress, analysisResult) {
    try {
      const cacheKey = `tx_analysis_${contractAddress}`;
      const cacheData = {
        result: analysisResult,
        timestamp: Date.now()
      };
      await chrome.storage.local.set({ [cacheKey]: cacheData });
    } catch (error) {
      console.error('Error caching transaction analysis:', error);
    }
  }

  async getSettings() {
    const data = await chrome.storage.local.get('settings');
    return data.settings || {};
  }

  async updateSettings(newSettings) {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await chrome.storage.local.set({ settings: updatedSettings });
  }

  handlePageLoad(details) {
    if (details.frameId === 0) { // Main frame only
      this.detectSmartContractPages(details.url);
    }
  }

  async detectSmartContractPages(url) {
    // Check if this is a known smart contract interface
    const isContractPage = this.isContractRelatedUrl(url);
    
    if (isContractPage) {
      const settings = await this.getSettings();
      if (settings.autoScan) {
        this.notifyContractPageDetected(url);
      }
    }
  }

  isContractRelatedUrl(url) {
    const contractPatterns = [
      /etherscan\.io\/address\//,
      /basescan\.org\/address\//,
      /.*\.eth$/,
      /.*contract.*/i
    ];
    
    return contractPatterns.some(pattern => pattern.test(url));
  }

  notifyContractPageDetected(url) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'CONTRACT_PAGE_DETECTED',
          url: url
        });
      }
    });
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get the current chain ID (placeholder - would need integration with wallet)
   * For now, default to Ethereum Mainnet (1) or Base (8453)
   */
  async getCurrentChainId() {
    try {
      // In a real implementation, this would query the connected wallet
      // or use a configuration setting
      const settings = await this.getSettings();
      return settings.defaultChainId || 1; // Default to Ethereum Mainnet
    } catch (error) {
      console.warn('Failed to get chain ID, defaulting to Ethereum Mainnet:', error);
      return 1;
    }
  }
}

// Initialize the background service
new ScathatBackground();