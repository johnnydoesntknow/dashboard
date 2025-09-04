"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { usePrivy, useWallets } from '@privy-io/react-auth'

const WalletContext = createContext(undefined)

export function WalletProvider({ children }) {
  const { ready, authenticated, user, login, logout } = usePrivy()
  const { wallets } = useWallets()
  
  const [walletAddress, setWalletAddress] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Update wallet address when wallets change
  useEffect(() => {
    if (wallets && wallets.length > 0) {
      setWalletAddress(wallets[0].address)
    } else {
      setWalletAddress(null)
    }
  }, [wallets])

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      // Privy login - will show Discord/Email options
      await login()
    } catch (error) {
      console.error("Failed to connect:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    await logout()
    setWalletAddress(null)
    
    // Clear all stored data
    localStorage.removeItem("iopn-discord-user")
    localStorage.removeItem("iopn-discord-skipped")
    localStorage.removeItem("iopn-user")
    localStorage.removeItem("iopn-user-nft")
  }

  const value = {
    walletAddress,
    isConnected: authenticated && walletAddress !== null,
    isConnecting,
    connectWallet,
    disconnectWallet,
    modalReady: ready,
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