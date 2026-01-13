// Scathat Popup JavaScript
class ScathatPopup {
    constructor() {
        this.connected = false;
        this.sessionId = null;
        this.settings = {};
        this.stats = {
            scannedContracts: 0,
            threatsBlocked: 0,
            savedFunds: 0
        };
        
        // Wallet connection properties
        this.walletDetected = false;
        this.walletConnected = false;
        this.walletAccounts = [];
        this.walletSignature = null;
        this.contractAuthorized = false;
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.checkConnectionStatus();
        this.setupEventListeners();
        this.setupWalletListener();
        this.updateUI();
        this.updateWalletUI();
        
        console.log('Scathat popup initialized');
    }

    setupWalletListener() {
        // Listen for wallet state updates from frontend
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.type === 'WALLET_STATE_UPDATE') {
                this.handleWalletStateUpdate(request);
                sendResponse({ success: true });
            }
            return true; // Keep message channel open for async response
        });
    }

    handleWalletStateUpdate(request) {
        this.walletConnected = request.walletConnected;
        this.walletAccounts = request.accounts || [];
        this.walletChainId = request.chainId || "";
        
        console.log('Wallet state updated from frontend:', {
            connected: this.walletConnected,
            accounts: this.walletAccounts,
            chainId: this.walletChainId
        });
        
        this.updateWalletUI();
        
        if (this.walletConnected) {
            this.addActivity('Wallet connected from frontend', 'connect');
        } else {
            this.addActivity('Wallet disconnected from frontend', 'disconnect');
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['settings', 'stats', 'walletState']);
            this.settings = result.settings || {
                autoScan: true,
                notifications: true,
                highlightContracts: true
            };
            
            if (result.stats) {
                this.stats = result.stats;
            }

            // Load saved wallet state
            if (result.walletState) {
                this.walletConnected = result.walletState.connected;
                this.walletAccounts = result.walletState.accounts || [];
                this.walletChainId = result.walletState.chainId || "";
                
                console.log('Loaded saved wallet state:', result.walletState);
            }
            
            this.updateSettingsUI();
            // We need to update wallet UI here as well since we loaded the state
            this.updateWalletUI(); 
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    updateUI() {
        const indicator = document.getElementById('statusIndicator');
        const dot = indicator.querySelector('.status-dot');
        const text = indicator.querySelector('.status-text');
        
        // Show wallet connection status instead of backend connection status
        if (this.walletConnected && this.walletAccounts.length > 0) {
            dot.classList.add('connected');
            text.textContent = 'Wallet Connected';
        } else if (this.connected) {
            dot.classList.add('connected');
            text.textContent = 'Connected';
        } else {
            dot.classList.remove('connected');
            text.textContent = 'Disconnected';
        }
        
        document.getElementById('disconnectBtn').style.display = this.connected ? '' : 'none';
    }

    setupEventListeners() {
        document.getElementById('connectBtn').addEventListener('click', async () => {
            await this.connect();
        });

        document.getElementById('disconnectBtn').addEventListener('click', async () => {
            await this.disconnect();
        });





        document.getElementById('openDashboard').addEventListener('click', () => {
            this.openDashboard();
        });
        
        document.getElementById('autoScanToggle').addEventListener('change', (e) => {
            this.updateSetting('autoScan', e.target.checked);
        });
        
        document.getElementById('notificationsToggle').addEventListener('change', (e) => {
            this.updateSetting('notifications', e.target.checked);
        });
        
        document.getElementById('highlightToggle').addEventListener('change', (e) => {
            this.updateSetting('highlightContracts', e.target.checked);
        });
    }

    async checkConnectionStatus() {
        try {
            const result = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
            this.connected = !!(result && result.connected);
        } catch (error) {
            console.error('Error checking connection status:', error);
        }
        this.updateUI();
    }

    async connect() {
        try {
            const result = await chrome.runtime.sendMessage({ type: 'CONNECT' });
            if (result && result.success) {
                this.connected = true;
                this.sessionId = result.sessionId;
                this.addActivity('Connected to Scathat', 'connect');
                await this.saveStats();
            } else {
                this.showError('Connection failed');
            }
        } catch (error) {
            console.error('Connection error:', error);
            this.showError('Connection error: ' + error.message);
        }
        this.updateUI();
    }

    async disconnect() {
        try {
            await chrome.runtime.sendMessage({ type: 'DISCONNECT' });
            this.connected = false;
            this.sessionId = null;
            this.addActivity('Disconnected from Scathat', 'disconnect');
        } catch (error) {
            console.error('Disconnect error:', error);
        }
        this.updateUI();
    }

    // Wallet connection methods
    async checkWalletStatus() {
        try {
            // Send message to background script to check wallet status
            const response = await chrome.runtime.sendMessage({ type: 'DETECT_WALLET' });
            this.walletDetected = response?.detected || false;
            this.walletConnected = response?.connected || false;
            this.walletAccounts = response?.accounts || [];
            
            if (response?.wallets) {
                console.log('Detected wallets:', response.wallets);
            }
        } catch (error) {
            console.log('No wallet detected or content script not ready:', error.message);
            this.walletDetected = false;
            this.walletConnected = false;
            this.walletAccounts = [];
        }
    }

    async connectWallet() {
        try {
            this.showLoading('Connecting wallet...');
            
            const response = await chrome.runtime.sendMessage({ type: 'CONNECT_WALLET' });
            
            if (response.success) {
                this.walletConnected = true;
                
                if (response.usingBridge) {
                    this.addActivity('Wallet connected via bridge page', 'connect');
                    this.showInfo('Wallet connected using bridge page. You can close the bridge tab.');
                } else {
                    this.addActivity('Wallet connected successfully', 'connect');
                }
                
                // Update wallet accounts and chain info
                await this.updateWalletInfo();
                
                // After connecting, try to sign a message for authentication
                await this.signAuthenticationMessage();
                
            } else {
                // Handle specific error cases
                if (response.error?.includes('browser internal pages')) {
                    this.showError('Please navigate to a regular website to connect your wallet');
                } else if (response.error?.includes('navigate to a regular website')) {
                    this.showError('No website available for wallet connection. Using bridge page...');
                    // Auto-retry with bridge page
                    await this.connectWithBridge();
                } else {
                    this.showError('Wallet connection failed: ' + response.error);
                }
            }
            
        } catch (error) {
            console.error('Wallet connection error:', error);
            this.showError('Wallet connection error: ' + error.message);
        }
        this.updateWalletUI();
    }
    
    async connectWithBridge() {
        try {
            this.showLoading('Opening bridge page for wallet connection...');
            
            // Create bridge page tab
            const bridgeTab = await chrome.tabs.create({
                url: chrome.runtime.getURL('src/bridge/bridge.html'),
                active: true
            });
            
            // Wait for bridge page to load and attempt connection
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Try connecting again
            const response = await chrome.runtime.sendMessage({ type: 'CONNECT_WALLET' });
            
            if (response.success) {
                this.walletConnected = true;
                this.addActivity('Wallet connected via bridge', 'connect');
                await this.updateWalletInfo();
                await this.signAuthenticationMessage();
            } else {
                this.showError('Bridge connection failed: ' + response.error);
            }
            
        } catch (error) {
            console.error('Bridge connection error:', error);
            this.showError('Bridge connection failed: ' + error.message);
        }
    }
    
    async updateWalletInfo() {
        try {
            // Get current accounts
            const accountsResponse = await chrome.runtime.sendMessage({ type: 'GET_ACCOUNTS' });
            if (accountsResponse.success) {
                this.walletAccounts = accountsResponse.accounts || [];
            }
            
            // Get current chain ID
            const chainResponse = await chrome.runtime.sendMessage({ type: 'GET_CHAIN_ID' });
            if (chainResponse.success) {
                this.currentChainId = chainResponse.chainId;
            }
            
        } catch (error) {
            console.error('Error updating wallet info:', error);
        }
    }

    // Sign an authentication message to prove wallet ownership
    async signAuthenticationMessage() {
        try {
            const message = `Scathat Authentication: ${Date.now()}`;
            const response = await chrome.runtime.sendMessage({ 
                type: 'SIGN_MESSAGE', 
                data: message 
            });
            
            if (response.success) {
                console.log('Authentication signature:', response.signature);
                this.addActivity('Wallet authentication successful', 'security');
                
                // Store the signature for future contract interactions
                this.walletSignature = response.signature;
                
                // Check if we can interact with the smart contract
                await this.checkContractAuthorization();
            } else {
                this.showError('Authentication failed: ' + response.error);
            }
        } catch (error) {
            console.error('Authentication error:', error);
            this.showError('Authentication error: ' + error.message);
        }
    }

    // Check if wallet is authorized to interact with the smart contract
    async checkContractAuthorization() {
        try {
            // This would be implemented to check against the smart contract
            // For now, we'll simulate the check
            const isAuthorized = true; // Simulated authorization check
            
            if (isAuthorized) {
                this.addActivity('Contract access authorized', 'contract');
                this.contractAuthorized = true;
            } else {
                this.addActivity('Contract access not authorized', 'warning');
                this.contractAuthorized = false;
            }
        } catch (error) {
            console.error('Authorization check failed:', error);
            this.contractAuthorized = false;
        }
    }

    // Interact with smart contract (example method)
    async interactWithContract() {
        try {
            if (!this.walletConnected) {
                throw new Error('Wallet not connected');
            }

            if (!this.contractAuthorized) {
                throw new Error('Not authorized to interact with contract');
            }

            // Example contract interaction data
            const transactionData = {
                from: this.walletAccounts[0],
                to: '0x8dCcDf8Be8B32492896281413B45e075B1f5EDe5', // Contract address
                value: '0x0', // No value transfer
                data: '0x12345678' // Example contract call data
            };

            const response = await chrome.runtime.sendMessage({
                type: 'INTERACT_WITH_CONTRACT',
                data: transactionData
            });

            if (response.success) {
                this.addActivity('Contract interaction successful', 'contract');
                return response.result;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Contract interaction failed:', error);
            this.showError('Contract interaction failed: ' + error.message);
            throw error;
        }
    }

    async disconnectWallet() {
        // For Ethereum wallets, disconnection is typically handled by the wallet itself
        // We just update our local state
        this.walletConnected = false;
        this.walletAccounts = [];
        this.addActivity('Wallet disconnected', 'disconnect');
        this.updateWalletUI();
    }

    async switchToBaseSepolia() {
        try {
            this.showLoading('Switching to Base Sepolia network...');
            
            const response = await chrome.runtime.sendMessage({ 
                type: 'SWITCH_TO_BASE_SEPOLIA' 
            });
            
            if (response.success) {
                if (response.alreadyOnNetwork) {
                    this.showInfo('Already connected to Base Sepolia network');
                } else if (response.networkAdded) {
                    this.showInfo('Base Sepolia network added successfully');
                } else {
                    this.showInfo('Switched to Base Sepolia network successfully');
                }
                
                // Update wallet info to reflect the new network
                await this.updateWalletInfo();
                this.addActivity('Switched to Base Sepolia network', 'network');
                
            } else {
                this.showError('Failed to switch to Base Sepolia: ' + response.error);
            }
            
        } catch (error) {
            console.error('Base Sepolia switch error:', error);
            this.showError('Failed to switch to Base Sepolia: ' + error.message);
        }
    }

    updateWalletUI() {
        const walletStatus = document.getElementById('walletStatus');
        const walletDot = walletStatus.querySelector('.wallet-dot');
        const walletText = walletStatus.querySelector('.wallet-text');
        const walletAddress = document.getElementById('walletAddress');
        const walletAddressText = document.getElementById('walletAddressText');

        console.log('Updating wallet UI:', {
            connected: this.walletConnected,
            accounts: this.walletAccounts,
            walletAddressElement: !!walletAddress,
            walletAddressTextElement: !!walletAddressText
        });

        if (this.walletConnected && this.walletAccounts.length > 0) {
            walletDot.classList.add('connected');
            walletText.textContent = 'Wallet Connected';
            if (walletAddress) walletAddress.style.display = 'block';
            if (walletAddressText) walletAddressText.textContent = `${this.walletAccounts[0].slice(0, 6)}...${this.walletAccounts[0].slice(-4)}`;
        } else {
            walletDot.classList.remove('connected');
            walletText.textContent = 'Not Connected';
            if (walletAddress) walletAddress.style.display = 'none';
        }
    }

    async scanCurrentPage() {
        try {
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab) {
                const url = tab.url || '';
                const allowed = url.startsWith('http://') || url.startsWith('https://');
                if (!allowed) {
                    this.showError('Scan error: Current page does not allow content scripts');
                    return;
                }
                // Send message to content script to scan the page
                const response = await chrome.tabs.sendMessage(tab.id, {
                    type: 'SCAN_CURRENT_PAGE'
                });

                if (response && response.success) {
                    this.addActivity(`Scanned page: ${response.results.length} contracts found`, 'scan');
                    
                    // Update stats
                    this.stats.scannedContracts += response.results.length;
                    this.updateStatsUI();
                    await this.saveStats();
                } else {
                    this.showError('Scan error: Unable to reach content script');
                }
            }
        } catch (error) {
            console.error('Scan error:', error);
            this.showError('Scan error: ' + error.message);
        }
    }

    openDashboard() {
        // Open the main Scathat website
        chrome.tabs.create({
            url: 'https://scathat.vercel.app/'
        });
    }

    async updateSetting(key, value) {
        this.settings[key] = value;
        
        try {
            await chrome.storage.local.set({ settings: this.settings });
            
            // Notify background script of setting changes
            await chrome.runtime.sendMessage({
                type: 'UPDATE_SETTINGS',
                data: { [key]: value }
            });
            
            this.addActivity(`Setting updated: ${key} = ${value}`, 'settings');
        } catch (error) {
            console.error('Error updating setting:', error);
        }
    }

    async saveStats() {
        try {
            await chrome.storage.local.set({ stats: this.stats });
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }

    updateStatsUI() {
        document.getElementById('scannedContracts').textContent = String(this.stats.scannedContracts);
        document.getElementById('threatsBlocked').textContent = String(this.stats.threatsBlocked);
        document.getElementById('savedFunds').textContent = `$${this.stats.savedFunds}`;
    }

    addActivity(text, type) {
        const item = document.createElement('div');
        item.className = 'activity-item';
        const icon = type === 'error' ? '⚠️' : type === 'scan' ? '🔍' : type === 'connect' ? '🔗' : type === 'disconnect' ? '❌' : 'ℹ️';
        item.innerHTML = `<span class="activity-icon">${icon}</span><span class="activity-text">${text}</span><span class="activity-time">${new Date().toLocaleTimeString()}</span>`;
        document.getElementById('activityList').prepend(item);
    }

    showError(message) {
        this.addActivity(message, 'error');
        
        // Show temporary error notification
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: hsl(0 84% 60%);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 1000;
            font-size: 14px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 3000);
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScathatPopup();
});

