'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ethers } from 'ethers'

interface WalletContextType {
  isConnected: boolean
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isLoading: boolean
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

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

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          })
          if (accounts.length > 0) {
            await initializeWallet()
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err)
        }
      }
    }

    checkConnection()
  }, [])

  const initializeWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed')
      }

      // Switch to Base Sepolia network
      await switchToBaseSepolia()

      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await browserProvider.send('eth_accounts', [])
      
      if (accounts.length > 0) {
        const signer = await browserProvider.getSigner()
        const address = await signer.getAddress()
        
        setProvider(browserProvider)
        setSigner(signer)
        setAccount(address)
        setIsConnected(true)
        setError(null)
      }
    } catch (err) {
      console.error('Error initializing wallet:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize wallet')
    }
  }

  const switchToBaseSepolia = async () => {
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
  }

  const connectWallet = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to connect your wallet')
      }

      // Request account access
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await browserProvider.send('eth_requestAccounts', [])
      
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Switch to Base Sepolia network
      await switchToBaseSepolia()

      const signer = await browserProvider.getSigner()
      const address = await signer.getAddress()
      
      setProvider(browserProvider)
      setSigner(signer)
      setAccount(address)
      setIsConnected(true)
      
    } catch (err) {
      console.error('Error connecting wallet:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    setProvider(null)
    setSigner(null)
    setAccount(null)
    setIsConnected(false)
    setError(null)
  }

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setAccount(accounts[0])
        }
      }

      const handleChainChanged = () => {
        window.location.reload()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum?.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const value: WalletContextType = {
    isConnected,
    account,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    isLoading,
    error,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

declare global {
  interface Window {
    ethereum?: any
  }
}