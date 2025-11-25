# Scathat Chrome Extension

One-click smart contract security scanning directly in your browser.

## Features

- Instant vulnerability detection
- AI-powered code analysis
- Works on Etherscan, Polygonscan, BSC Scan, Snowtrace
- One-click scanning
- Risk scoring and recommendations

## Installation

### Development
1. Clone this repository
2. Run `npm install`
3. Run `npm run build:extension`
4. Open `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the `dist` folder

### Production
Install from [Chrome Web Store](https://chrome.webstore.google.com/detail/scathat)

## File Structure

\`\`\`
extension/
├── src/
│   ├── popup/           # Extension popup UI
│   ├── background/      # Service worker
│   ├── content/         # Content scripts
│   ├── components/      # Reusable components
│   ├── utils/          # API and utilities
│   ├── types/          # TypeScript types
│   ├── styles/         # CSS stylesheets
│   └── assets/         # Icons and images
├── public/
│   ├── manifest.json   # Extension manifest
│   └── icons/          # Extension icons
└── dist/               # Build output
\`\`\`

## Development

### Build
\`\`\`bash
npm run build:extension
\`\`\`

### Watch for changes
\`\`\`bash
npm run watch:extension
\`\`\`

### Test
\`\`\`bash
npm run test:extension
\`\`\`

## API Endpoints

- `POST /scan` - Scan a contract
- `GET /contract/:address` - Get contract details
- `POST /user-scans` - Save scan result

## Permissions

- `activeTab` - Access current tab
- `scripting` - Inject scripts
- `storage` - Store user data
- `webRequest` - Monitor network

## Host Permissions

- Etherscan (etherscan.io)
- Polygonscan (polygonscan.com)
- BSC Scan (bscscan.com)
- Snowtrace (snowtrace.io)

## Troubleshooting

**Extension not loading?**
- Check that manifest.json is valid
- Ensure all icons exist in `public/icons/`

**Scans not working?**
- Verify API endpoint is accessible
- Check browser console for errors
- Ensure contract address is valid
