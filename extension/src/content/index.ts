// Content script injected into contract pages

// Declare chrome variable
declare const chrome: any

// Extract contract address from page
function extractContractAddress(): string | null {
  const addressElement = document.querySelector('[data-test="page-nav-up-to-date-address"]')
  if (addressElement) {
    return addressElement.textContent || null
  }
  return null
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getContractAddress") {
    const address = extractContractAddress()
    sendResponse({ address })
  }
})

// Inject Scathat button into page UI
function injectScathatButton() {
  const address = extractContractAddress()
  if (!address) return

  const button = document.createElement("button")
  button.id = "scathat-page-button"
  button.textContent = "Scan with Scathat"
  button.className = "scathat-button"
  button.onclick = () => {
    chrome.runtime.sendMessage({ action: "scanContract", contractAddress: address })
  }

  const container = document.querySelector('[data-test="page-nav"]')
  if (container) {
    container.appendChild(button)
  }
}

// Initialize when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectScathatButton)
} else {
  injectScathatButton()
}
