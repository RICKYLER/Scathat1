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
        
        // Wallet functionality removed
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.checkConnectionStatus();
        // Wallet functionality removed
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

        // Wallet functionality removed

        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleBackgroundMessage(message);
        });
    }

    updateUI() {
        this.updateConnectionUI();
        // Wallet UI removed
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

    // Wallet UI removed

    // Wallet functionality removed

    // Wallet functionality removed

    // Wallet functionality removed

    // Wallet functionality removed

    // Wallet functionality removed

    // Wallet functionality removed

    getNetworkInfo(chainId) {
        return { name: 'Network disabled', chainId };
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
