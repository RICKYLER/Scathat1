'use client'

import { useState, useCallback } from 'react'
import { ethers } from 'ethers'

interface WalletConnection {
  isConnected: boolean
  account: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isLoading: boolean
  error: string | null
}

// Base Sepolia network configuration
const BASE_SEPOLIA_CONFIG = {
  chainId: '0x14a34', // 84532 in hex
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
}

export const useWalletConnection = (): WalletConnection => {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const switchToBaseSepolia = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CONFIG.chainId }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_SEPOLIA_CONFIG],
          })
        } catch (addError) {
          throw new Error('Failed to add Base Sepolia network to MetaMask')
        }
      } else {
        throw new Error('Failed to switch to Base Sepolia network')
      }
    }
  }, [])

  const connect = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to connect your wallet')
      }

      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Switch to Base Sepolia network
      await switchToBaseSepolia()

      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      
      setAccount(address)
      setIsConnected(true)
      
    } catch (err) {
      console.error('Error connecting wallet:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }, [switchToBaseSepolia])

  const disconnect = useCallback(() => {
    setAccount(null)
    setIsConnected(false)
    setError(null)
  }, [])

  return {
    isConnected,
    account,
    connect,
    disconnect,
    isLoading,
    error,
  }
}

declare global {
  interface Window {
    ethereum?: any
  }
}