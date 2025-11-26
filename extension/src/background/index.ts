// Background service worker for Scathat extension

declare const chrome: any

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scanContract") {
    handleContractScan(message.contractAddress)
      .then((result) => sendResponse({ success: true, result }))
      .catch((error) => sendResponse({ success: false, error: (error as Error).message }))
    return true
  }
})

async function handleContractScan(contractAddress: string) {
  try {
    const response = await fetch("https://api.scathat.io/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: contractAddress }),
    })
    if (!response.ok) throw new Error("Scan failed")
    return await response.json()
  } catch (error) {
    throw error
  }
}

function isExplorerUrl(url: string): boolean {
  return /(etherscan|basescan|bscscan|arbiscan|polygonscan|snowtrace)/i.test(url)
}

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: any, tab: any) => {
  if (changeInfo.status !== "complete") return
  const url: string = tab?.url ?? ""
  if (!isExplorerUrl(url)) return

  chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: injectScathatButton,
  })
})

function injectScathatButton() {
  if (document.getElementById("scathat-inject-button")) return
  const button = document.createElement("button")
  button.id = "scathat-inject-button"
  button.textContent = "Scan with Scathat"
  button.setAttribute("aria-label", "Scan contract with Scathat")
  Object.assign(button.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    padding: "10px 20px",
    backgroundColor: "#00bcd4",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    zIndex: "10000",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  })

  button.addEventListener("click", () => {
    const addrEl = document.querySelector('[data-test="page-nav-up-to-date-address"]') as HTMLElement | null
    const address = addrEl?.textContent || ""
    chrome.runtime.sendMessage({ action: "scanContract", contractAddress: address })
  })

  document.body.appendChild(button)
}
