# Ethers.js v5 Quick Reference

This extension uses `ethers` to interact with Ethereum-compatible networks.

## Core Concepts

- Providers: `new ethers.BrowserProvider(window.ethereum)` for wallet-injected provider, `ethers.getDefaultProvider()` for public RPC.
- Signers: `await provider.getSigner()` to sign and send transactions.
- Utilities: `ethers.isAddress(addr)`, `ethers.formatEther(value)`, ENS resolution via `provider.resolveName(name)`.

## Common Snippets

```js
// Request accounts
await provider.send("eth_requestAccounts", [])

// Read balance
const bal = await provider.getBalance(address)
const eth = ethers.formatEther(bal)

// Send tx
const signer = await provider.getSigner()
const tx = await signer.sendTransaction({ to, value: ethers.parseEther("0.01") })
await tx.wait()
```

## Docs

Full documentation: https://docs.ethers.org/v5/
