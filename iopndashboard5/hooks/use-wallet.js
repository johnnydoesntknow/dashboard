"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { usePrivy, useWallets, useConnectWallet } from '@privy-io/react-auth'

const WalletContext = createContext(undefined)

export function WalletProvider({ children }) {
  const { ready, authenticated, logout } = usePrivy()
  const { wallets, ready: walletsReady } = useWallets()
  const { connectWallet } = useConnectWallet({
    onSuccess: ({ wallet }) => {
      console.log('Wallet connected:', wallet.address)
    },
    onError: (error) => {
      console.error('Wallet connection failed:', error)
    }
  })
  
  const [walletAddress, setWalletAddress] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    if (walletsReady && wallets && wallets.length > 0) {
      setWalletAddress(wallets[0].address)
    } else {
      setWalletAddress(null)
    }
  }, [wallets, walletsReady])

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    try {
      // This opens Privy's wallet selection modal (MetaMask, etc.)
      await connectWallet()
    } catch (error) {
      console.error("Failed to connect wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    if (authenticated) {
      await logout()
    }
    setWalletAddress(null)
  }

  const value = {
    walletAddress,
    isConnected: walletAddress !== null,
    isConnecting,
    connectWallet: handleConnectWallet,  // Use the Privy connectWallet
    disconnectWallet,
    modalReady: ready && walletsReady,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}