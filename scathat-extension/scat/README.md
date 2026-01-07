# Scathat Browser Extension

AI-powered smart contract security protection for your browser. Real-time detection and analysis of smart contract vulnerabilities across web3 platforms.

## Features

- 🔍 **Smart Contract Detection**: Automatically identifies contract addresses on web pages
- 🛡️ **Real-time Security Analysis**: Instant security scoring and vulnerability detection
- ⚡ **Cross-browser Support**: Works on Chrome, Firefox, Edge, and Brave
- 🔒 **Secure Communication**: Encrypted messaging between extension and main application
- 📊 **Activity Monitoring**: Track scans, threats blocked, and funds protected
- ⚙️ **Customizable Settings**: Configure auto-scan, notifications, and highlighting

## Installation

### Development Installation

1. **Clone or navigate to the extension directory:**
   ```bash
   cd /Users/rackerjoyjugalbot/Scathat/scathat-extension/scat
   ```

2. **Load the extension in your browser:**

   #### Google Chrome
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked" and select the extension directory
   - The Scathat icon should appear in your toolbar

   #### Mozilla Firefox
   - Open Firefox and navigate to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select any file in the extension directory

   #### Microsoft Edge
   - Open Edge and navigate to `edge://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the extension directory

   #### Brave Browser
   - Follow the same instructions as Google Chrome

### Production Installation

For end-users, package the extension and distribute through:
- Chrome Web Store
- Firefox Add-ons Marketplace
- Microsoft Edge Add-ons Store
- Direct download with installation instructions

## Usage

### Connecting to Scathat

1. Click the Scathat icon in your browser toolbar
2. Click "Connect to Scathat" to establish secure connection
3. (Optional) Enter your API key for enhanced features
4. The status indicator will show green when connected

### Automatic Protection

- The extension automatically scans pages for contract addresses
- Detected contracts are highlighted with security indicators
- Hover over contracts to see quick security assessment
- Click contracts to run detailed security analysis

### Manual Scanning

1. Navigate to any webpage with smart contract content
2. Click the Scathat icon
3. Click "Scan Current Page" to manually trigger detection
4. Review results in the popup interface

### Settings Configuration

- **Auto-scan**: Toggle automatic page scanning
- **Notifications**: Enable/disable security alerts
- **Highlighting**: Control contract highlighting behavior
- All settings sync across browser sessions

## Architecture

### File Structure
```
scathat-extension/scat/
├── manifest.json          # Extension manifest
├── src/
│   ├── background/        # Background scripts
│   │   └── background.js  # Service worker
│   ├── content/           # Content scripts
│   │   └── content.js     # Page interaction
│   └── popup/             # User interface
│       ├── popup.html     # Popup HTML
│       ├── popup.css      # Popup styles
│       └── popup.js       # Popup logic
├── assets/
│   └── icons/             # Extension icons
│       └── icon.svg       # SVG icon
└── README.md             # This file
```

### Communication Flow

1. **Content Script** → Detects contracts on web pages
2. **Background Script** → Manages extension lifecycle and security analysis
3. **Popup Interface** → User interaction and settings management
4. **Secure Messaging** → Encrypted communication between components

## Security Features

- 🔐 **Manifest V3**: Latest extension security standards
- 🚫 **No Permissions Abuse**: Minimal required permissions
- 🔒 **Encrypted Storage**: Secure local storage for sensitive data
- 🛡️ **Content Security Policy**: Prevents injection attacks
- 📝 **Audit Logging**: Comprehensive activity tracking

## Development

### Prerequisites

- Modern browser with extension support
- Basic understanding of web extension development
- Familiarity with JavaScript and Chrome APIs

### Building

1. **Development Mode**:
   ```bash
   # No build process required for development
   # Load directly as unpacked extension
   ```

2. **Production Build**:
   ```bash
   # Package for distribution
   zip -r scathat-extension.zip . -x "*.git*" "*.DS_Store"
   ```

### Testing

1. **Unit Tests**:
   ```bash
   # Add test files in src/test/ directory
   # Use Jest or Mocha for testing
   ```

2. **Integration Testing**:
   - Load extension in browser
   - Test on various contract platforms
   - Verify security analysis functionality

3. **Cross-browser Testing**:
   - Test on Chrome, Firefox, Edge, Brave
   - Verify consistent behavior

## API Integration

The extension can integrate with the main Scathat application:

```javascript
// Example API usage
const response = await chrome.runtime.sendMessage({
  type: 'SCAN_CONTRACT',
  data: { address: '0x...' }
});
```

### Available Message Types

- `CONNECT`: Establish secure connection
- `DISCONNECT`: Terminate connection
- `SCAN_CONTRACT`: Analyze contract security
- `GET_STATUS`: Check connection status
- `UPDATE_SETTINGS`: Modify extension settings

## Troubleshooting

### Common Issues

1. **Extension not loading**:
   - Verify developer mode is enabled
   - Check for console errors

2. **Connection issues**:
   - Verify main application is running
   - Check network connectivity

3. **Detection not working**:
   - Ensure auto-scan is enabled
   - Check content script permissions

### Debugging

1. **View console logs**:
   - Background script: Extension service worker
   - Content script: Web page console
   - Popup: Popup developer tools

2. **Check storage**:
   ```javascript
   chrome.storage.local.get(null, console.log);
   ```

## Support

- 📖 [Documentation](https://docs.scathat.com)
- 🐛 [Issue Tracker](https://github.com/scathat/extension/issues)
- 💬 [Community Discord](https://discord.gg/scathat)
- 📧 [Support Email](mailto:support@scathat.com)

## License

This extension is part of the Scathat ecosystem. See main project repository for licensing information.

## Version History

- **v1.0.0** (Current)
  - Initial release
  - Basic contract detection
  - Security analysis integration
  - Cross-browser support
  - User interface

---

**Important**: This extension is designed for security purposes only. Always verify contract addresses and exercise caution when interacting with smart contracts.

For enhanced protection, use with the full Scathat application suite.

