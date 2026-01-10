// Background service worker for Scathat extension
import { scathatAPI } from '../api-client.js';

class ScathatBackground {
  constructor() {
    console.log('ScathatBackground constructor called');
    this.connected = false;
    this.sessionId = null;
    this.apiClient = null;
    this.keepAliveInterval = null;
    this.init();
  }

  async init() {
    console.log('Scathat background service starting initialization...');
    this.setupListeners();
    await this.initializeStorage();
    await this.initializeAPIClient();
    this.startKeepAlive();
    console.log('Scathat background service initialized successfully');
  }

  setupListeners() {
    console.log('Setting up extension listeners...');
    
    // Handle service worker activation
    chrome.runtime.onStartup.addListener(() => {
      console.log('Extension started up - reinitializing service worker');
      this.init();
    });

    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') this.onExtensionInstall();
      if (details.reason === 'update') this.onExtensionUpdate();
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // Handle wallet events from content script
      if (message.type === 'WALLET_EVENT') {
        this.handleWalletEvent(message.event, message.data);
        return false; // No response needed for events
      }
      switch (message.type) {
        case 'CONNECT':
          this.handleConnect(message.data).then((res) => sendResponse(res));
          return true;
        case 'DISCONNECT':
          this.handleDisconnect().then((res) => sendResponse(res));
          return true;
        case 'UPDATE_SETTINGS':
          this.updateSettings(message.data).then((res) => sendResponse(res));
          return true;
        case 'SCAN_CONTRACT':
          this.scanContract(message.data).then((res) => sendResponse(res));
          return true;
        case 'GET_STATUS':
          sendResponse({ connected: this.connected, sessionId: this.sessionId });
          return true;
        case 'DETECT_WALLET':
          this.handleDetectWallet(sender.tab?.id).then((res) => sendResponse(res));
          return true;
        case 'CONNECT_WALLET':
          this.handleWalletConnect(sender.tab?.id).then((res) => sendResponse(res));
          return true;
        case 'GET_ACCOUNTS':
          this.handleGetAccounts(sender.tab?.id).then((res) => sendResponse(res));
          return true;
        case 'GET_CHAIN_ID':
          this.handleGetChainId(sender.tab?.id).then((res) => sendResponse(res));
          return true;
        case 'SIGN_MESSAGE':
          this.handleSignMessage(sender.tab?.id, message.data).then((res) => sendResponse(res));
          return true;
        case 'SEND_TRANSACTION':
          this.handleSendTransaction(sender.tab?.id, message.data).then((res) => sendResponse(res));
          return true;
      }
    });

    // Listen for external messages from frontend website
    console.log('Setting up external message listener...');
    chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
      console.log('Received external message:', { message, sender: sender.url });
      
      // Allow localhost for development and production domain
      const allowedOrigins = [
        'https://scathat.com',
        'http://localhost:3000',
        'http://localhost'
      ];
      
      const isAllowed = sender.url && allowedOrigins.some(origin => sender.url.startsWith(origin));
      console.log('Is allowed origin:', isAllowed, 'from:', sender.url);

      if (isAllowed) {
        switch (message.type) {
          case 'WALLET_STATE_UPDATE':
            console.log('Processing WALLET_STATE_UPDATE message');
            this.handleWalletStateUpdate(message);
            sendResponse({ success: true });
            return true;
          case 'KEEP_ALIVE_PING':
            // Just respond to keep service worker active
            sendResponse({ success: true, pong: true });
            return true;
          default:
            console.log('Unknown message type:', message.type);
            sendResponse({ success: false, error: 'Unknown message type' });
            return true;
        }
      }
      console.log('Message from disallowed origin:', sender.url);
      return false; // Not from allowed origin
    });
  }

  // Keep service worker alive to receive external messages
  startKeepAlive() {
    this.keepAliveInterval = setInterval(() => {
      // More aggressive keep-alive to prevent service worker from going inactive
      console.log('Service worker keep-alive ping');
      // Send a message to ourselves to keep the service worker active
      chrome.runtime.sendMessage({ type: 'KEEP_ALIVE_PING' }).catch(() => {
        // Ignore errors - this is just to keep the service worker active
      });
      // Also check if we can receive external messages
      this.testExternalMessaging();
    }, 10000); // Ping every 10 seconds to prevent inactivity
  }

  testExternalMessaging() {
    // Test if external messaging is working by sending a test message to ourselves
    chrome.runtime.sendMessage(
      chrome.runtime.id,
      { type: 'TEST_MESSAGE', timestamp: Date.now() },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log('Internal messaging test failed:', chrome.runtime.lastError);
        } else {
          console.log('Internal messaging test successful');
        }
      }
    );
  }

  stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  handleWalletStateUpdate(message) {
    console.log('Received wallet state update from frontend:', message);
    
    // Save wallet state to storage
    chrome.storage.local.set({
      walletState: {
        connected: message.walletConnected,
        accounts: message.accounts || [],
        chainId: message.chainId || "",
        timestamp: Date.now()
      }
    });

    // Forward wallet state to popup
    chrome.runtime.sendMessage({
      type: 'WALLET_STATE_UPDATE',
      walletConnected: message.walletConnected,
      accounts: message.accounts || [],
      chainId: message.chainId || ""
    }).then(() => {
      console.log('Wallet state forwarded to popup successfully');
    }).catch(error => {
      console.log('Popup not available for wallet state update:', error);
    });
  }

  async initializeStorage() {
    try {
      const result = await chrome.storage.local.get(['settings', 'stats']);
      if (!result.settings) {
        await chrome.storage.local.set({
          settings: {
            autoScan: true,
            notifications: true,
            highlightContracts: true,
            backendURL: 'http://localhost:8000'
          },
          stats: {
            scannedContracts: 0,
            threatsBlocked: 0,
            savedFunds: 0
          }
        });
      }
    } catch (e) {
      console.error('initializeStorage error:', e);
    }
  }

  async initializeAPIClient() {
    try {
      this.apiClient = scathatAPI;
      this.apiClient.configure({ baseURL: 'http://localhost:8000' });
    } catch (e) {
      console.error('initializeAPIClient error:', e);
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
      iconUrl: chrome.runtime.getURL('assets/icons/logo1.jpg'),
      title: 'Scathat Installed',
      message: 'Your AI-powered smart contract security shield is now active!',
      priority: 2
    });
  }

  async handleConnect(data) {
    try {
      this.connected = true;
      this.sessionId = crypto.randomUUID();
      return { success: true, sessionId: this.sessionId };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async handleDisconnect() {
    try {
      this.connected = false;
      this.sessionId = null;
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async updateSettings(partial) {
    try {
      const result = await chrome.storage.local.get(['settings']);
      const settings = { ...(result.settings || {}), ...(partial || {}) };
      await chrome.storage.local.set({ settings });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async scanContract({ address }) {
    try {
      // Simulate scan call
      const res = await this.apiClient.analyze(address);
      return { success: true, result: res };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Wallet connection handlers - Using Content Script as Bridge
  async getTargetTabId(tabId) {
    let targetTabId = tabId;
    
    if (!targetTabId) {
      try {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (activeTab && activeTab.id) {
          targetTabId = activeTab.id;
        }
      } catch (error) {
        console.log('Could not get active tab:', error.message);
      }
    }
    
    if (!targetTabId) {
      throw new Error('Please navigate to a regular website to connect your wallet');
    }
    
    // Check if this is a browser internal page
    const tab = await chrome.tabs.get(targetTabId);
    if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('about:'))) {
      throw new Error('Cannot connect wallet on browser internal pages. Please navigate to a regular website.');
    }
    
    return targetTabId;
  }

  async ensureContentScriptReady(tabId) {
    try {
      // Send PING to check if content script is ready
      const response = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
      return response?.ready === true;
    } catch (error) {
      console.log('Content script not ready, attempting to inject...');
      
      // Inject content script if not ready
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['src/content/content.js']
      });
      
      // Wait for content script to initialize
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Verify content script is ready
      try {
        const verifyResponse = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
        return verifyResponse?.ready === true;
      } catch (verifyError) {
        throw new Error('Content script failed to initialize after injection');
      }
    }
  }

  async handleDetectWallet(tabId) {
    try {
      const targetTabId = await this.getTargetTabId(tabId);
      
      // Check if we're on a browser internal page
      const tab = await chrome.tabs.get(targetTabId);
      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('about:')) {
        return { 
          success: false, 
          error: 'Cannot detect wallet on browser internal pages. Please navigate to a regular website.',
          detected: false, 
          connected: false,
          accounts: [],
          wallets: []
        };
      }
      
      await this.ensureContentScriptReady(targetTabId);
      
      // Send message to content script for wallet detection
      const response = await chrome.tabs.sendMessage(targetTabId, { type: 'DETECT_WALLET' });
      return response;
      
    } catch (error) {
      console.error('Wallet detection error:', error);
      
      // Check if this is a content script not available error
      if (error.message.includes('Receiving end does not exist')) {
        return { 
          success: false, 
          error: 'Cannot detect wallet on this page. Please navigate to a regular website.',
          detected: false, 
          connected: false,
          accounts: [],
          wallets: []
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'Failed to detect wallet',
        detected: false,
        connected: false,
        accounts: [],
        wallets: []
      };
    }
  }

  async handleWalletConnect(tabId) {
    try {
      const targetTabId = await this.getTargetTabId(tabId);
      
      // Check if we're on a browser internal page
      const tab = await chrome.tabs.get(targetTabId);
      if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('about:')) {
        // Try to open a bridge page if no regular website is available
        const bridgeResult = await this.tryBridgePageConnection();
        if (bridgeResult.success) {
          return bridgeResult;
        }
        
        return { 
          success: false, 
          error: 'Cannot connect wallet on browser internal pages. Please navigate to a regular website.',
          detected: false, 
          connected: false 
        };
      }
      
      await this.ensureContentScriptReady(targetTabId);
      
      // Send message to content script for wallet connection
      const response = await chrome.tabs.sendMessage(targetTabId, { type: 'CONNECT_WALLET' });
      return response;
      
    } catch (error) {
      console.error('Wallet connection error:', error);
      
      // Check if this is a content script not available error
      if (error.message.includes('Receiving end does not exist')) {
        // Try to open a bridge page if content script is not available
        const bridgeResult = await this.tryBridgePageConnection();
        if (bridgeResult.success) {
          return bridgeResult;
        }
        
        return { 
          success: false, 
          error: 'Cannot connect wallet on this page. Please navigate to a regular website.',
          detected: false, 
          connected: false 
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'Failed to connect wallet',
        detected: false,
        connected: false
      };
    }
  }
  
  async tryBridgePageConnection() {
    // Pattern 2: Use a controlled bridge webpage
    try {
      // Create a new tab with a simple HTML page that can host wallet connection
      const bridgeTab = await chrome.tabs.create({
        url: chrome.runtime.getURL('src/bridge/bridge.html'),
        active: false
      });
      
      // Wait for the tab to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId: bridgeTab.id },
        files: ['src/content/content.js']
      });
      
      // Wait for content script to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Attempt wallet connection on bridge page
      const response = await chrome.tabs.sendMessage(bridgeTab.id, { 
        type: 'CONNECT_WALLET' 
      });
      
      if (response.success) {
        // Store bridge tab ID for future communications
        this.bridgeTabId = bridgeTab.id;
        return {
          ...response,
          bridgeTabId: bridgeTab.id,
          usingBridge: true
        };
      }
      
      // Close bridge tab if connection failed
      await chrome.tabs.remove(bridgeTab.id);
      return response;
      
    } catch (bridgeError) {
      console.error('Bridge page connection failed:', bridgeError);
      return {
        success: false,
        error: 'Bridge connection failed: ' + bridgeError.message,
        usingBridge: false
      };
    }
  }

  async handleGetAccounts(tabId) {
    try {
      const targetTabId = await this.getTargetTabId(tabId);
      await this.ensureContentScriptReady(targetTabId);
      
      const response = await chrome.tabs.sendMessage(targetTabId, { type: 'GET_ACCOUNTS' });
      return response;
      
    } catch (error) {
      console.error('Get accounts error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleGetChainId(tabId) {
    try {
      const targetTabId = await this.getTargetTabId(tabId);
      await this.ensureContentScriptReady(targetTabId);
      
      const response = await chrome.tabs.sendMessage(targetTabId, { type: 'GET_CHAIN_ID' });
      return response;
      
    } catch (error) {
      console.error('Get chain ID error:', error);
      return { success: false, error: error.message };
    }
  }

  async handleWalletStatus(tabId) {
    try {
      // Try to get status via content script if we have an active tab
      if (tabId) {
        try {
          // Use direct injection for wallet status checking - no more content script messaging
          const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
              try {
                return {
                  detected: typeof window.ethereum !== 'undefined',
                  connected: window.ethereum?.isConnected?.() || false,
                  accounts: window.ethereum?.selectedAddress ? [window.ethereum.selectedAddress] : []
                };
              } catch (error) {
                console.error('Wallet status check error:', error);
                return {
                  detected: false,
                  connected: false,
                  accounts: [],
                  error: error.message
                };
              }
            }
          });
          
          if (injectionResults && injectionResults[0]?.result) {
            const walletStatus = injectionResults[0].result;
            await chrome.storage.local.set({ walletStatus });
            return walletStatus;
          }
        } catch (injectionError) {
          console.log('Direct wallet status injection failed:', injectionError.message);
        }
      }

      // Fallback: check if we have any wallet info in storage
      const result = await chrome.storage.local.get(['walletStatus']);
      if (result.walletStatus) {
        return result.walletStatus;
      }

      // Default response if no wallet info found
      return { detected: false, connected: false, accounts: [] };
    } catch (error) {
      console.error('Wallet status check error:', error);
      return { detected: false, connected: false, accounts: [], error: error.message };
    }
  }

  // Handle message signing requests
  async handleSignMessage(tabId, data) {
    try {
      const targetTabId = await this.getTargetTabId(tabId);
      await this.ensureContentScriptReady(targetTabId);
      
      // Send message to content script for message signing
      const response = await chrome.tabs.sendMessage(targetTabId, { 
        type: 'SIGN_MESSAGE',
        data: data
      });
      return response;
      
    } catch (error) {
      console.error('Message signing error:', error);
      return { success: false, error: error.message || 'Failed to sign message' };
    }
  }

  // Handle contract interaction requests
  async handleContractInteraction(tabId, transactionData) {
    try {
      if (!tabId) {
        return { success: false, error: 'No active tab found' };
      }
      
      // Use direct injection for contract interaction - no more content script messaging
      const interactionResult = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: async (txData) => {
          try {
            // Check if wallet is available and connected
            if (typeof window.ethereum === 'undefined') {
              return { 
                success: false, 
                error: 'No Ethereum wallet detected. Please connect your wallet first.'
              };
            }
            
            if (!window.ethereum.selectedAddress) {
              return { 
                success: false, 
                error: 'Wallet not connected. Please connect your wallet first.'
              };
            }
            
            // Send transaction
            const txHash = await window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [txData]
            });
            
            return { success: true, result: { transactionHash: txHash } };
            
          } catch (error) {
            console.error('Contract interaction failed:', error);
            
            // Provide user-friendly error messages
            let errorMessage = error.message || 'Failed to interact with contract';
            if (error.code === 4001) {
              errorMessage = 'Transaction rejected by user.';
            }
            
            return { 
              success: false, 
              error: errorMessage
            };
          }
        },
        args: [transactionData]
      });
      
      if (interactionResult && interactionResult[0] && interactionResult[0].result) {
        return interactionResult[0].result;
      }
      
      throw new Error('Failed to get interaction result from injected script');
      
    } catch (error) {
      console.error('Contract interaction failed:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to interact with contract. Make sure wallet is connected.' 
      };
    }
  }

  // Handle transaction sending requests
  async handleSendTransaction(tabId, data) {
    try {
      const targetTabId = await this.getTargetTabId(tabId);
      await this.ensureContentScriptReady(targetTabId);
      
      // Send message to content script for transaction sending
      const response = await chrome.tabs.sendMessage(targetTabId, { 
        type: 'SEND_TRANSACTION',
        data: data
      });
      return response;
      
    } catch (error) {
      console.error('Transaction sending error:', error);
      return { success: false, error: error.message || 'Failed to send transaction' };
    }
  }

  // Handle wallet events from content script
  async handleWalletEvent(event, data) {
    console.log('Wallet event received:', event, data);
    
    switch (event) {
      case 'ACCOUNTS_CHANGED':
        await this.handleAccountsChanged(data.accounts);
        break;
      case 'CHAIN_CHANGED':
        await this.handleChainChanged(data.chainId);
        break;
      case 'DISCONNECTED':
        await this.handleWalletDisconnected(data.error);
        break;
    }
  }

  async handleAccountsChanged(accounts) {
    // Update extension state when accounts change
    console.log('Accounts changed:', accounts);
    
    // Notify popup if it's open
    try {
      await chrome.runtime.sendMessage({
        type: 'WALLET_ACCOUNTS_CHANGED',
        accounts: accounts
      });
    } catch (error) {
      // Popup might not be listening, which is fine
    }
  }

  async handleChainChanged(chainId) {
    // Update extension state when chain changes
    console.log('Chain changed:', chainId);
    
    // Notify popup if it's open
    try {
      await chrome.runtime.sendMessage({
        type: 'WALLET_CHAIN_CHANGED',
        chainId: chainId
      });
    } catch (error) {
      // Popup might not be listening, which is fine
    }
  }

  async handleWalletDisconnected(error) {
    // Handle wallet disconnection
    console.log('Wallet disconnected:', error);
    
    // Notify popup if it's open
    try {
      await chrome.runtime.sendMessage({
        type: 'WALLET_DISCONNECTED',
        error: error
      });
    } catch (error) {
      // Popup might not be listening, which is fine
    }
  }
}

// Initialize the background service
new ScathatBackground();

