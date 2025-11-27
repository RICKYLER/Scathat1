class ScathatAPIClient {
  constructor() {
    this.baseURL = 'http://localhost:8000'; // Default backend URL
    this.timeout = 10000; // 10 second timeout
    this.cache = new Map(); // In-memory cache for quick lookups
  }

  /**
   * Configure the API client with custom settings
   * @param {Object} config - Configuration object
   * @param {string} config.baseURL - Base URL for the backend API
   * @param {number} config.timeout - Request timeout in milliseconds
   */
  configure(config) {
    if (config.baseURL) this.baseURL = config.baseURL;
    if (config.timeout) this.timeout = config.timeout;
  }

  /**
   * Analyze a smart contract using the backend AI service
   * @param {string} contractAddress - The contract address to analyze
   * @param {number} chainId - The blockchain chain ID
   * @param {Object} transactionData - Optional transaction data for context
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeContract(contractAddress, chainId, transactionData = null) {
    const cacheKey = this._getCacheKey(contractAddress, chainId);
    
    // Check in-memory cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this._makeRequest('/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractAddress: contractAddress.toLowerCase(),
          chainId,
          transactionData,
          timestamp: Date.now()
        })
      });

      // Cache the successful response
      this.cache.set(cacheKey, response);
      
      return response;
    } catch (error) {
      console.error('Contract analysis failed:', error);
      
      // Return a fallback analysis for network errors
      return this._getFallbackAnalysis(contractAddress, chainId, error);
    }
  }

  /**
   * Get contract analysis from cache if available
   * @param {string} contractAddress - The contract address
   * @param {number} chainId - The blockchain chain ID
   * @returns {Object|null} - Cached analysis or null
   */
  getCachedAnalysis(contractAddress, chainId) {
    const cacheKey = this._getCacheKey(contractAddress, chainId);
    return this.cache.get(cacheKey) || null;
  }

  /**
   * Clear the in-memory cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Make an HTTP request with timeout and error handling
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} - Response data
   * @private
   */
  async _makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from backend');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Cannot connect to backend service');
      }
      
      throw error;
    }
  }

  /**
   * Generate a cache key for contract analysis
   * @param {string} contractAddress - The contract address
   * @param {number} chainId - The blockchain chain ID
   * @returns {string} - Cache key
   * @private
   */
  _getCacheKey(contractAddress, chainId) {
    return `${contractAddress.toLowerCase()}_${chainId}`;
  }

  /**
   * Provide fallback analysis when backend is unavailable
   * @param {string} contractAddress - The contract address
   * @param {number} chainId - The blockchain chain ID
   * @param {Error} error - The original error
   * @returns {Object} - Fallback analysis
   * @private
   */
  _getFallbackAnalysis(contractAddress, chainId, error) {
    return {
      contractAddress,
      chainId,
      analysis: {
        securityScore: 50,
        riskLevel: 'unknown',
        vulnerabilities: [],
        recommendations: [
          'Backend analysis service temporarily unavailable',
          'Proceed with caution - unable to verify contract safety'
        ],
        metadata: {
          source: 'fallback',
          timestamp: Date.now(),
          error: error.message
        }
      },
      metadata: {
        cached: false,
        fromCache: false,
        error: true,
        errorMessage: error.message,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Health check for backend service
   * @returns {Promise<boolean>} - True if backend is healthy
   */
  async healthCheck() {
    try {
      const response = await this._makeRequest('/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      return response.status === 'ok';
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  }

  /**
   * Get backend configuration and capabilities
   * @returns {Promise<Object>} - Backend configuration
   */
  async getConfig() {
    try {
      return await this._makeRequest('/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.warn('Failed to get backend config:', error);
      return { supportedChains: [], features: [] };
    }
  }
}

// Create and export a singleton instance
const scathatAPI = new ScathatAPIClient();

// Export for ES6 modules
export { scathatAPI };

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { scathatAPI };
}

// Make available globally for content scripts
if (typeof window !== 'undefined') {
  window.ScathatAPI = scathatAPI;
}