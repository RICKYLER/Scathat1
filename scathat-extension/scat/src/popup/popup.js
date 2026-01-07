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

    updateUI() {
        const indicator = document.getElementById('statusIndicator');
        const dot = indicator.querySelector('.status-dot');
        const text = indicator.querySelector('.status-text');
        
        if (this.connected) {
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

        document.getElementById('scanCurrentPage').addEventListener('click', async () => {
            await this.scanCurrentPage();
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
        
        document.getElementById('helpLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openHelp();
        });
        
        document.getElementById('feedbackLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.openFeedback();
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
            const apiKey = (document.getElementById('apiKey').value || '').trim();
            const result = await chrome.runtime.sendMessage({ type: 'CONNECT', data: { apiKey } });
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

