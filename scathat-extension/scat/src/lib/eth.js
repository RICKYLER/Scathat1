import { ethers } from "ethers"

export function getProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }
  return ethers.getDefaultProvider()
}

export async function getSigner(provider) {
  const p = provider || getProvider()
  return await p.getSigner()
}

export async function requestAccounts(provider) {
  const p = provider || getProvider()
  if (p.send) {
    return await p.send("eth_requestAccounts", [])
  }
  return []
}

export async function getNetwork(provider) {
  const p = provider || getProvider()
  return await p.getNetwork()
}

export function isAddress(address) {
  return ethers.isAddress(address)
}

export async function getBalance(address, provider) {
  const p = provider || getProvider()
  const bal = await p.getBalance(address)
  return ethers.formatEther(bal)
}

export async function resolveEns(name, provider) {
  const p = provider || getProvider()
  return await p.resolveName(name)
}

export async function sendTransaction(tx, signer) {
  const s = signer || (await getSigner())
  return await s.sendTransaction(tx)
}
