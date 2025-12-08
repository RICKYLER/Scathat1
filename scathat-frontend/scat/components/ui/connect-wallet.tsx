'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useWalletConnection } from '@/hooks/useWalletConnection'

interface ConnectWalletProps {
  className?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({
  className = '',
  variant = 'default',
  size = 'default',
}) => {
  const { isConnected, account, connect, disconnect, isLoading, error } = useWalletConnection()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleConnect = async () => {
    try {
      await connect()
    } catch (err) {
      console.error('Failed to connect wallet:', err)
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {formatAddress(account)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className={className}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleConnect}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
}