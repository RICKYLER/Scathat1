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
        
        // Wallet connection state
        this.walletConnected = false;
        this.walletAddress = null;
        this.networkInfo = null;
        this.provider = null;
        this.signer = null;
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.checkConnectionStatus();
        await this.checkWalletConnection();
        this.setupEventListeners();
        this.updateUI();
        
        console.log('Scathat popup initialized');
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['settings', 'stats']);
            this.settings = result.settings || {
                autoScan: true,
                notifications: true,
                highlightContracts: true
            };
            
            if (result.stats) {
                this.stats = result.stats;
            }
            
            this.updateSettingsUI();
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async checkConnectionStatus() {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_STATUS'
            });
            
            this.connected = response.connected;
            this.sessionId = response.sessionId;
            this.updateConnectionUI();
        } catch (error) {
            console.error('Error checking connection status:', error);
            this.connected = false;
            this.updateConnectionUI();
        }
    }

    setupEventListeners() {
        // Connection buttons
        document.getElementById('connectBtn').addEventListener('click', () => {
            this.handleConnect();
        });

        document.getElementById('disconnectBtn').addEventListener('click', () => {
            this.handleDisconnect();
        });

        // Quick actions
        document.getElementById('scanCurrentPage').addEventListener('click', () => {
            this.scanCurrentPage();
        });

        document.getElementById('openDashboard').addEventListener('click', () => {
            this.openDashboard();
        });

        // Settings toggles
        document.getElementById('autoScanToggle').addEventListener('change', (e) => {
            this.updateSetting('autoScan', e.target.checked);
        });

        document.getElementById('notificationsToggle').addEventListener('change', (e) => {
            this.updateSetting('notifications', e.target.checked);
        });

        document.getElementById('highlightToggle').addEventListener('change', (e) => {
            this.updateSetting('highlightContracts', e.target.checked);
        });

        // Footer links
        document.getElementById('helpLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openHelp();
        });

        document.getElementById('feedbackLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openFeedback();
        });

        // Wallet connection buttons
        document.getElementById('connectWalletBtn').addEventListener('click', () => {
            this.connectWallet();
        });

        document.getElementById('disconnectWalletBtn').addEventListener('click', () => {
            this.disconnectWallet();
        });

        document.getElementById('switchNetworkBtn').addEventListener('click', () => {
            this.switchToBaseNetwork();
        });

        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleBackgroundMessage(message);
        });
    }

    updateUI() {
        this.updateConnectionUI();
        this.updateWalletUI();
        this.updateStatsUI();
        this.updateSettingsUI();
    }

    updateConnectionUI() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusDot = statusIndicator.querySelector('.status-dot');
        const statusText = statusIndicator.querySelector('.status-text');
        const connectBtn = document.getElementById('connectBtn');
        const disconnectBtn = document.getElementById('disconnectBtn');
        const statsSection = document.getElementById('statsSection');
        const activitySection = document.getElementById('activitySection');

        if (this.connected) {
            statusDot.classList.add('connected');
            statusText.textContent = 'Connected';
            connectBtn.style.display = 'none';
            disconnectBtn.style.display = 'block';
            statsSection.style.display = 'block';
            activitySection.style.display = 'block';
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = 'Disconnected';
            connectBtn.style.display = 'block';
            disconnectBtn.style.display = 'none';
            statsSection.style.display = 'none';
            activitySection.style.display = 'none';
        }
    }

    updateStatsUI() {
        document.getElementById('scannedContracts').textContent = this.stats.scannedContracts.toLocaleString();
        document.getElementById('threatsBlocked').textContent = this.stats.threatsBlocked.toLocaleString();
        document.getElementById('savedFunds').textContent = `$${this.stats.savedFunds.toLocaleString()}`;
    }

    updateSettingsUI() {
        document.getElementById('autoScanToggle').checked = this.settings.autoScan;
        document.getElementById('notificationsToggle').checked = this.settings.notifications;
        document.getElementById('highlightToggle').checked = this.settings.highlightContracts;
    }

    updateWalletUI() {
        const walletDot = document.getElementById('walletDot');
        const walletText = document.getElementById('walletText');
        const walletInfo = document.getElementById('walletInfo');
        const walletAddress = document.getElementById('walletAddress');
        const networkInfo = document.getElementById('networkInfo');
        const connectWalletBtn = document.getElementById('connectWalletBtn');
        const disconnectWalletBtn = document.getElementById('disconnectWalletBtn');
        const switchNetworkBtn = document.getElementById('switchNetworkBtn');

        if (this.walletConnected && this.walletAddress) {
            walletDot.classList.add('connected');
            walletDot.classList.remove('wrong-network');
            walletText.textContent = 'Connected';
            walletInfo.style.display = 'flex';
            walletAddress.textContent = this.walletAddress;
            networkInfo.textContent = this.networkInfo ? `Network: ${this.networkInfo.name} (${this.networkInfo.chainId})` : 'Network: Unknown';
            connectWalletBtn.style.display = 'none';
            disconnectWalletBtn.style.display = 'block';
            
            // Show switch network button if not on Base
            if (this.networkInfo && this.networkInfo.chainId !== 8453) {
                switchNetworkBtn.style.display = 'block';
                walletDot.classList.remove('connected');
                walletDot.classList.add('wrong-network');
                walletText.textContent = 'Wrong Network';
            } else {
                switchNetworkBtn.style.display = 'none';
            }
        } else {
            walletDot.classList.remove('connected', 'wrong-network');
            walletText.textContent = 'Not connected';
            walletInfo.style.display = 'none';
            connectWalletBtn.style.display = 'block';
            disconnectWalletBtn.style.display = 'none';
            switchNetworkBtn.style.display = 'none';
        }
    }

    async checkWalletConnection() {
        try {
            // Check if window.ethereum is available
            if (typeof window.ethereum !== 'undefined') {
                // Try to get accounts
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                
                if (accounts.length > 0) {
                    this.walletConnected = true;
                    this.walletAddress = accounts[0];
                    
                    // Get network information
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                    this.networkInfo = this.getNetworkInfo(parseInt(chainId));
                    
                    // Set up provider and signer
                    this.provider = new ethers.BrowserProvider(window.ethereum);
                    this.signer = await this.provider.getSigner();
                    
                    // Listen for account changes
                    window.ethereum.on('accountsChanged', (accounts) => {
                        this.handleAccountsChanged(accounts);
                    });
                    
                    // Listen for chain changes
                    window.ethereum.on('chainChanged', (chainId) => {
                        this.handleChainChanged(chainId);
                    });
                }
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        }
    }

    async connectWallet() {
        try {
            // Use content script to access window.ethereum in webpage context
            const response = await chrome.runtime.sendMessage({
                type: 'CONNECT_WALLET'
            });

            if (response && response.success) {
                this.walletConnected = true;
                this.walletAddress = response.address;
                this.networkInfo = response.networkInfo;
                
                // Set up provider and signer using the content script as proxy
                this.provider = new ethers.JsonRpcProvider('https://mainnet.base.org'); // Use a default provider
                
                this.updateWalletUI();
                this.addActivity(`Wallet connected: ${this.formatAddress(this.walletAddress)}`, 'success');
                
                // Save wallet connection info
                await chrome.storage.local.set({
                    walletConnection: {
                        address: this.walletAddress,
                        network: this.networkInfo,
                        connectedAt: Date.now()
                    }
                });
            } else {
                this.showError(response?.error || 'Failed to connect wallet');
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            this.showError('Failed to connect wallet: ' + error.message);
        }
    }

    async disconnectWallet() {
        try {
            this.walletConnected = false;
            this.walletAddress = null;
            this.networkInfo = null;
            this.provider = null;
            this.signer = null;
            
            // Remove event listeners
            if (window.ethereum && window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', this.handleChainChanged);
            }

            this.updateWalletUI();
            this.addActivity('Wallet disconnected', 'info');
            
            // Remove wallet connection info
            await chrome.storage.local.remove('walletConnection');
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            this.showError('Failed to disconnect wallet: ' + error.message);
        }
    }

    async switchToBaseNetwork() {
        try {
            if (typeof window.ethereum === 'undefined') {
                this.showError('No Ethereum wallet found');
                return;
            }

            // Base Mainnet chain ID: 8453
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x2105' }] // 0x2105 = 8453 in hex
            });

            this.addActivity('Switched to Base network', 'success');
        } catch (error) {
            console.error('Error switching network:', error);
            
            if (error.code === 4902) {
                // Chain not added, try to add it
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0x2105',
                            chainName: 'Base Mainnet',
                            nativeCurrency: {
                                name: 'Ethereum',
                                symbol: 'ETH',
                                decimals: 18
                            },
                            rpcUrls: ['https://mainnet.base.org'],
                            blockExplorerUrls: ['https://basescan.org']
                        }]
                    });
                } catch (addError) {
                    this.showError('Failed to add Base network: ' + addError.message);
                }
            } else {
                this.showError('Failed to switch network: ' + error.message);
            }
        }
    }

    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // Wallet disconnected
            this.walletConnected = false;
            this.walletAddress = null;
            this.addActivity('Wallet disconnected', 'info');
        } else if (accounts[0] !== this.walletAddress) {
            // Account changed
            this.walletAddress = accounts[0];
            this.addActivity(`Account changed: ${this.formatAddress(this.walletAddress)}`, 'info');
        }
        this.updateWalletUI();
    }

    async handleChainChanged(chainId) {
        const newChainId = parseInt(chainId);
        this.networkInfo = this.getNetworkInfo(newChainId);
        
        // Update provider and signer
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        this.updateWalletUI();
        this.addActivity(`Network changed: ${this.networkInfo.name}`, 'info');
    }

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

    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    async handleConnect() {
        try {
            const apiKey = document.getElementById('apiKey').value.trim();
            
            const response = await chrome.runtime.sendMessage({
                type: 'CONNECT',
                data: {
                    apiKey: apiKey || null,
                    timestamp: Date.now()
                }
            });

            if (response.success) {
                this.connected = true;
                this.sessionId = response.sessionId;
                this.updateConnectionUI();
                this.addActivity('Connected to Scathat service', 'success');
                
                // Save connection info
                await chrome.storage.local.set({
                    lastConnection: {
                        timestamp: Date.now(),
                        sessionId: this.sessionId
                    }
                });
            } else {
                this.showError('Connection failed: ' + response.error);
            }
        } catch (error) {
            console.error('Connection error:', error);
            this.showError('Connection error: ' + error.message);
        }
    }

    async handleDisconnect() {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'DISCONNECT'
            });

            if (response.success) {
                this.connected = false;
                this.sessionId = null;
                this.updateConnectionUI();
                this.addActivity('Disconnected from Scathat service', 'info');
            }
        } catch (error) {
            console.error('Disconnection error:', error);
            this.showError('Disconnection error: ' + error.message);
        }
    }

    async scanCurrentPage() {
        try {
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (tab) {
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
                }
            }
        } catch (error) {
            console.error('Scan error:', error);
            this.showError('Scan error: ' + error.message);
        }
    }

    openDashboard() {
        // Open the main Scathat dashboard
        chrome.tabs.create({
            url: chrome.runtime.getURL('../../dashboard/index.html')
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

    addActivity(text, type = 'info') {
        const activityList = document.getElementById('activityList');
        const now = new Date();
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        let icon = '💡';
        switch (type) {
            case 'success':
                icon = '✅';
                break;
            case 'error':
                icon = '❌';
                break;
            case 'scan':
                icon = '🔍';
                break;
            case 'settings':
                icon = '⚙️';
                break;
        }
        
        activityItem.innerHTML = `
            <span class="activity-icon">${icon}</span>
            <span class="activity-text">${text}</span>
            <span class="activity-time">${now.toLocaleTimeString()}</span>
        `;
        
        // Add to top of list
        activityList.insertBefore(activityItem, activityList.firstChild);
        
        // Limit to 10 activities
        if (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
    }

    handleBackgroundMessage(message) {
        switch (message.type) {
            case 'CONTRACTS_FOUND':
                this.handleContractsFound(message.data);
                break;
            case 'SCAN_COMPLETED':
                this.handleScanCompleted(message.data);
                break;
        }
    }

    handleContractsFound(data) {
        this.addActivity(`${data.count} contracts found on ${new URL(data.url).hostname}`, 'scan');
    }

    handleScanCompleted(data) {
        this.stats.scannedContracts++;
        if (data.result.vulnerabilities.length > 0) {
            this.stats.threatsBlocked++;
            // Estimate saved funds based on vulnerabilities
            const threatValue = data.result.vulnerabilities.reduce((sum, vuln) => {
                return sum + (vuln.severity === 'high' ? 1000 : vuln.severity === 'medium' ? 500 : 100);
            }, 0);
            this.stats.savedFunds += threatValue;
        }
        
        this.updateStatsUI();
        this.saveStats();
        
        this.addActivity(
            `Scan completed: ${data.result.securityScore.toFixed(1)} security score`,
            data.result.vulnerabilities.length > 0 ? 'error' : 'success'
        );
    }

    showError(message) {
        this.addActivity(message, 'error');
        
        // Show temporary error notification
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff4757;
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

    openHelp() {
        chrome.tabs.create({
            url: 'https://docs.scathat.com/extension-help'
        });
    }

    openFeedback() {
        chrome.tabs.create({
            url: 'https://github.com/scathat/extension/issues'
        });
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScathatPopup();
});