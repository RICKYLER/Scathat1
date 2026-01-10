// Content Script - Wallet Bridge
class WalletBridge {
  constructor() {
    this.initialized = false;
    this.walletDetected = false;
    this.walletConnected = false;
    this.currentAccount = null;
    this.currentChainId = null;
    this.walletEvents = new Map();
    
    this.setupMessageListeners();
    this.detectWallet();
    this.setupWalletEventListeners();
    
    this.initialized = true;
    console.log('WalletBridge initialized');
    
    // Notify background that content script is ready
    chrome.runtime.sendMessage({ 
      type: 'CONTENT_SCRIPT_READY',
      tabId: this.getCurrentTabId()
    });
  }
  
  getCurrentTabId() {
    // Get tab ID from URL parameters or other means
    const match = window.location.href.match(/tabId=(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'PING':
          sendResponse({ ready: true, initialized: this.initialized });
          return true;
          
        case 'DETECT_WALLET':
          this.detectWallet().then(result => sendResponse(result));
          return true;
          
        case 'CONNECT_WALLET':
          this.connectWallet().then(result => sendResponse(result));
          return true;
          
        case 'GET_ACCOUNTS':
          this.getAccounts().then(result => sendResponse(result));
          return true;
          
        case 'GET_CHAIN_ID':
          this.getChainId().then(result => sendResponse(result));
          return true;
          
        case 'SIGN_MESSAGE':
          this.signMessage(message.data).then(result => sendResponse(result));
          return true;
          
        case 'SEND_TRANSACTION':
          this.sendTransaction(message.data).then(result => sendResponse(result));
          return true;
      }
    });
  }

  async detectWallet() {
    try {
      // Check if we're on a browser internal page
      if (window.location.protocol === 'chrome:' || window.location.protocol === 'about:') {
        return {
          success: false,
          error: 'Cannot detect wallet on browser internal pages',
          detected: false,
          wallets: {}
        };
      }
      
      const wallets = this.detectMultipleWallets();
      this.walletDetected = Object.keys(wallets).length > 0;
      
      return {
        success: true,
        wallets,
        detected: this.walletDetected
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        detected: false,
        wallets: {}
      };
    }
  }

  detectMultipleWallets() {
    const detectedWallets = {};
    
    // Check for standard Ethereum providers
    if (window.ethereum) {
      detectedWallets.ethereum = {
        isMetaMask: window.ethereum.isMetaMask,
        isRabby: window.ethereum.isRabby,
        isOKExWallet: window.ethereum.isOKExWallet,
        isTrust: window.ethereum.isTrust,
        isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
        providers: window.ethereum.providers || []
      };
    }
    
    // Check for individual wallet flags
    if (window.ethereum?.isMetaMask) detectedWallets.metamask = true;
    if (window.ethereum?.isRabby) detectedWallets.rabby = true;
    if (window.ethereum?.isOKExWallet) detectedWallets.okx = true;
    if (window.ethereum?.isTrust) detectedWallets.trust = true;
    if (window.ethereum?.isCoinbaseWallet) detectedWallets.coinbase = true;
    
    // Check for Phantom
    if (window.phantom?.ethereum) detectedWallets.phantom = true;
    
    return detectedWallets;
  }

  async connectWallet() {
    try {
      // Security: Validate we're on a regular website
      if (window.location.protocol === 'chrome:' || window.location.protocol === 'about:') {
        throw new Error('Cannot connect wallet on browser internal pages');
      }

      if (!this.walletDetected) {
        throw new Error('No Ethereum wallet detected');
      }

      if (!window.ethereum || typeof window.ethereum.request !== 'function') {
        throw new Error('Ethereum provider not ready');
      }

      // Security: Only allow specific methods
      const allowedMethods = ['eth_requestAccounts', 'eth_accounts', 'eth_chainId'];
      
      // Validate method is allowed (security measure)
      const method = 'eth_requestAccounts';
      if (!allowedMethods.includes(method)) {
        throw new Error(`Method ${method} not allowed`);
      }
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: method
      });

      if (accounts && accounts.length > 0) {
        this.walletConnected = true;
        this.currentAccount = accounts[0];
        
        // Get current chain ID
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        });
        this.currentChainId = chainId;

        return {
          success: true,
          account: this.currentAccount,
          chainId: this.currentChainId,
          walletConnected: true
        };
      } else {
        throw new Error('No accounts returned from wallet');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      
      // Handle specific error codes
      if (error.code === 4001) {
        throw new Error('Connection rejected by user');
      } else if (error.code === -32002) {
        throw new Error('Wallet connection already pending');
      }
      
      throw error;
    }
  }

  async getAccounts() {
    try {
      if (!this.walletConnected) {
        throw new Error('Wallet not connected');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });

      return {
        success: true,
        accounts: accounts || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getChainId() {
    try {
      if (!this.walletConnected) {
        throw new Error('Wallet not connected');
      }

      const chainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      return {
        success: true,
        chainId: chainId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async signMessage({ message, account }) {
    try {
      // Security: Validate we're on a regular website
      if (window.location.protocol === 'chrome:' || window.location.protocol === 'about:') {
        throw new Error('Cannot sign messages on browser internal pages');
      }

      if (!this.walletConnected) {
        throw new Error('Wallet not connected');
      }

      // Security: Validate message parameters
      if (typeof message !== 'string' || message.length > 10000) {
        throw new Error('Invalid message format');
      }

      const result = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account]
      });

      return {
        success: true,
        signature: result
      };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error('Signature rejected by user');
      }
      throw error;
    }
  }

  async sendTransaction(transaction) {
    try {
      // Security: Validate we're on a regular website
      if (window.location.protocol === 'chrome:' || window.location.protocol === 'about:') {
        throw new Error('Cannot send transactions on browser internal pages');
      }

      if (!this.walletConnected) {
        throw new Error('Wallet not connected');
      }

      // Security: Validate transaction parameters
      if (!transaction || typeof transaction !== 'object') {
        throw new Error('Invalid transaction object');
      }

      // Security: Basic transaction validation
      const allowedKeys = ['from', 'to', 'value', 'data', 'gas', 'gasPrice', 'chainId'];
      const transactionKeys = Object.keys(transaction);
      if (transactionKeys.some(key => !allowedKeys.includes(key))) {
        throw new Error('Transaction contains invalid parameters');
      }

      // Security: Validate Ethereum addresses
      if (transaction.from && !this.isValidEthereumAddress(transaction.from)) {
        throw new Error('Invalid from address');
      }
      
      if (transaction.to && !this.isValidEthereumAddress(transaction.to)) {
        throw new Error('Invalid to address');
      }

      // Security: Validate value format
      if (transaction.value && !/^0x[a-fA-F0-9]+$/.test(transaction.value)) {
        throw new Error('Invalid value format');
      }

      // Security: Validate gas limits
      if (transaction.gas) {
        const gasLimit = parseInt(transaction.gas, 16);
        if (gasLimit > 30000000) { // 30 million gas limit
          throw new Error('Gas limit too high');
        }
      }

      const result = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transaction]
      });

      return {
        success: true,
        transactionHash: result
      };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error('Transaction rejected by user');
      }
      throw error;
    }
  }

  setupWalletEventListeners() {
    if (window.ethereum) {
      // Security: Only setup listeners on regular websites
      if (window.location.protocol === 'chrome:' || window.location.protocol === 'about:') {
        console.warn('Skipping wallet event listeners on internal page');
        return;
      }

      // Handle account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        this.handleAccountsChanged(accounts);
      });

      // Handle chain changes
      window.ethereum.on('chainChanged', (chainId) => {
        this.handleChainChanged(chainId);
      });

      // Handle disconnect
      window.ethereum.on('disconnect', (error) => {
        this.handleDisconnect(error);
      });
      
      // Handle connection events
      window.ethereum.on('connect', (connectionInfo) => {
        this.handleConnect(connectionInfo);
      });
    }
  }
  
  handleConnect(connectionInfo) {
    this.walletConnected = true;
    this.notifyBackground('CONNECTED', { connectionInfo });
  }

  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // Wallet disconnected
      this.walletConnected = false;
      this.currentAccount = null;
      this.notifyBackground('ACCOUNTS_CHANGED', { accounts: [] });
    } else {
      // Account changed
      this.currentAccount = accounts[0];
      this.notifyBackground('ACCOUNTS_CHANGED', { accounts });
    }
  }

  handleChainChanged(chainId) {
    this.currentChainId = chainId;
    this.notifyBackground('CHAIN_CHANGED', { chainId });
  }

  handleDisconnect(error) {
    this.walletConnected = false;
    this.currentAccount = null;
    this.currentChainId = null;
    this.notifyBackground('DISCONNECTED', { error: error?.message });
  }

  notifyBackground(event, data) {
    // Security: Validate event types before sending
    const allowedEvents = ['CONNECTED', 'DISCONNECTED', 'ACCOUNTS_CHANGED', 'CHAIN_CHANGED'];
    
    if (!allowedEvents.includes(event)) {
      console.warn('Attempted to send unauthorized event:', event);
      return;
    }
    
    // Security: Sanitize data before sending
    const sanitizedData = this.sanitizeWalletData(data);
    
    chrome.runtime.sendMessage({
      type: 'WALLET_EVENT',
      event,
      data: sanitizedData
    });
  }
  
  sanitizeWalletData(data) {
    // Security: Prevent sending sensitive information
    const sanitized = { ...data };
    
    // Remove any private keys or sensitive data
    if (sanitized.privateKey) delete sanitized.privateKey;
    if (sanitized.seedPhrase) delete sanitized.seedPhrase;
    if (sanitized.mnemonic) delete sanitized.mnemonic;
    
    // Truncate large data
    if (sanitized.message && sanitized.message.length > 1000) {
      sanitized.message = sanitized.message.substring(0, 1000) + '...';
    }
    
    return sanitized;
  }
  
  // Security: Validate Ethereum addresses
  isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  // Security: Validate chain IDs
  isValidChainId(chainId) {
    const validChainIds = new Set(['0x1', '0x5', '0xaa36a7', '0x89', '0x13881', '0x38', '0x61']);
    return validChainIds.has(chainId);
  }
}

// Initialize the wallet bridge when content script loads
window.scathatWalletBridge = new WalletBridge();