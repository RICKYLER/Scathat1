const API_BASE_URL = "https://api.scathat.io"

export async function getScanResult(contractAddress: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: contractAddress }),
    })

    if (!response.ok) {
      throw new Error(`Scan failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Scan error:", error)
    throw error
  }
}

export async function getContractDetails(contractAddress: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/contract/${contractAddress}`)
    if (!response.ok) throw new Error("Failed to fetch contract details")
    return await response.json()
  } catch (error) {
    console.error("Contract details error:", error)
    throw error
  }
}

export async function saveUserScan(contractAddress: string, result: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/user-scans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: contractAddress, result }),
    })
    return await response.json()
  } catch (error) {
    console.error("Save scan error:", error)
    throw error
  }
}
