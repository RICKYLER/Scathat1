// Content script for Scathat extension - runs in web pages
class ScathatContent {
  constructor() {
    this.initialized = false;
    this.contractElements = [];
    this.liveModals = new Set();
    this.badgedLinks = new WeakSet();
    this.urlRegex = /(https?:\/\/[^\s<>'")\]]+)|(\b[a-z0-9-]+\.eth\b)|(0x[a-fA-F0-9]{40})/gi;
    this.chatSelectors = [
      'div[data-testid="message-container"]',
      'div[role="row"]',
      'div[aria-label="Message"]',
      'div[role="textbox"]',
      'main',
      'article',
      'body'
    ];
    this.init();
  }

  init() {
    this.setupMutationObserver();
    this.scanChatMessages();
    this.setupMessageListeners();
    this.setupLifecycleGuards();
    this.initialized = true;
    console.log('Scathat content script initialized');
  }

  setupLifecycleGuards() {
    const cleanup = () => {
      try {
        this.liveModals.forEach((m) => {
          if (m && m.remove) m.remove();
        });
        this.liveModals.clear();
      } catch {}
    };
    window.addEventListener('pagehide', cleanup);
    window.addEventListener('beforeunload', cleanup);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') cleanup();
    });
  }

  // ... (script content truncated for brevity; full content mirrors source in workspace)
}

// Instantiate when loaded
(() => {
  try {
    new ScathatContent();
  } catch (e) {
    console.warn('ScathatContent failed to initialize:', e);
  }
})();

