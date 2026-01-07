# Scathat Browser Extension Testing Procedures

Comprehensive testing guide for the Scathat browser extension to ensure quality, security, and reliability.

## Test Environment Setup

### Browser Requirements
- Google Chrome 88+
- Mozilla Firefox 85+
- Microsoft Edge 88+
- Brave Browser 1.19+

### Test Accounts
- Standard user account
- Developer account with API access
- Test wallet addresses

## Test Categories

### 1. Installation & Loading Tests

#### Test Case: Extension Installation
- **Objective**: Verify extension loads correctly in all supported browsers
- **Steps**:
  1. Load extension in developer mode
  2. Verify icon appears in toolbar
  3. Check no console errors
- **Expected**: Extension loads without errors, icon visible

#### Test Case: Manifest Validation
- **Objective**: Validate manifest.json structure and permissions
- **Steps**:
  1. Use Chrome extension validator
  2. Verify permissions are minimal and justified
  3. Check content security policy
- **Expected**: No validation errors, proper CSP

### 2. Connection & Authentication Tests

#### Test Case: Connection Establishment
- **Objective**: Test secure connection to Scathat service
- **Steps**:
  1. Click "Connect to Scathat"
  2. Verify status indicator turns green
  3. Check local storage for session data
- **Expected**: Successful connection, session stored securely

#### Test Case: API Key Validation
- **Objective**: Test API key authentication
- **Steps**:
  1. Enter valid API key
  2. Attempt connection
  3. Verify authentication success
  4. Enter invalid key and verify rejection

### 3. Scanning & Detection Tests

#### Test Case: Contract Detection in Text
- **Objective**: Detect addresses in chat and articles
- **Steps**:
  1. Open pages with addresses like `0x...`
  2. Verify highlighting and badges
  3. Hover to see tooltips
- **Expected**: Addresses detected and annotated

#### Test Case: Risk Badge Rendering
- **Objective**: Display dynamic risk badges based on analysis
- **Steps**:
  1. Load sample text containing links and addresses
  2. Verify badges display with correct color and score
- **Expected**: Badges reflect risk levels correctly

### 4. Popup UI Tests

#### Test Case: Connection UI Flow
- **Objective**: UI updates with connection status
- **Steps**:
  1. Click Connect
  2. Verify status changes to Connected
  3. Test Disconnect
- **Expected**: Status indicator updates and actions visible

#### Test Case: Settings Persistence
- **Objective**: Settings are stored and restored
- **Steps**:
  1. Toggle settings
  2. Reload popup
  3. Verify state persistence
- **Expected**: Settings persist via chrome.storage

### 5. Background & Messaging Tests

#### Test Case: Background Initialization
- **Objective**: Background initializes and logs
- **Steps**:
  1. Load extension
  2. Check service worker logs
- **Expected**: Initialization message and storage setup

#### Test Case: Message Passing
- **Objective**: Messages reach background and content
- **Steps**:
  1. Trigger Scan from popup
  2. Verify content script receives message
- **Expected**: Response returned and stats updated

### 6. Performance & Stability

#### Test Case: Long Page Stability
- **Objective**: Handles pages with thousands of nodes
- **Steps**:
  1. Load long article/chat pages
  2. Monitor performance
- **Expected**: No crashes, acceptable performance

### 7. Cross-Browser Compatibility

| Browser | Minimum Version | Tested Version |
|---------|------------------|----------------|
| Chrome  | 88               | 120+           |
| Firefox | 85               | 89+            |
| Edge    | 88               | 91+            |
| Brave   | 1.19             | 1.24+          |

### API Compatibility
- Chrome Extension APIs
- WebExtension APIs (Firefox)
- Microsoft Edge Extensions API
- Brave-specific considerations

## Continuous Integration

### GitHub Actions Setup
```yaml
name: Extension Testing
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Run tests
      run: npm test
    - name: Build extension
      run: zip -r extension.zip . -x "*.git*"
```

## Release Process

### Staging Testing
1. Load extension in staging environment
2. Perform full test suite
3. Verify all functionality
4. Security review
5. Performance testing

### Production Deployment
1. Package extension for store submission
2. Submit to respective extension stores
3. Monitor initial user adoption
4. Address immediate issues

### Post-Release Monitoring
1. Track error rates
2. Monitor performance metrics
3. Collect user feedback
4. Plan iterative improvements

---

**Last Updated**: $(date)
**Test Suite Version**: 1.0.0

For questions or issues, contact the development team or create an issue in the project repository.

