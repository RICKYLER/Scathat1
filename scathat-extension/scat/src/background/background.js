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
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') this.onExtensionInstall();
      if (details.reason === 'update') this.onExtensionUpdate();
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
      }
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
      this.apiClient = scathatAPI({ baseURL: 'http://localhost:8000' });
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
}

export default new ScathatBackground();

