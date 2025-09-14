// hooks/use-balance.js
"use client"

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useWallet } from '@/hooks/use-wallet'
import { useDiscord } from '@/hooks/use-discord'
import { balanceAPI } from '@/lib/balance-api'
import { toast } from 'sonner'

const BalanceContext = createContext({})

export function BalanceProvider({ children }) {
  const { walletAddress, isConnected } = useWallet()
  const { discordUser, isDiscordConnected } = useDiscord()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Get user ID based on available identifiers
  const getUserId = useCallback(() => {
    // Prefer Discord ID if available
    if (isDiscordConnected && discordUser?.id) {
      return balanceAPI.parseUserId(discordUser.id)
    }
    // Fall back to wallet address
    if (isConnected && walletAddress) {
      return balanceAPI.parseUserId(walletAddress)
    }
    return null
  }, [isDiscordConnected, discordUser, isConnected, walletAddress])

  // Fetch balance
  const fetchBalance = useCallback(async (showLoading = true) => {
    const userId = getUserId()
    if (!userId) {
      setBalance(0)
      return 0
    }

    if (showLoading) setLoading(true)
    setError(null)

    try {
      const userBalance = await balanceAPI.getBalance(userId)
      setBalance(userBalance)
      return userBalance
    } catch (err) {
      console.error('Failed to fetch balance:', err)
      setError(err.message)
      return 0
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [getUserId])

  // Add balance
  const addBalance = useCallback(async (amount, reason, source = 'dashboard') => {
    const userId = getUserId()
    if (!userId) {
      toast.error('Please connect your wallet or Discord first')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const result = await balanceAPI.addBalance(userId, amount, reason, source)
      setBalance(result.newBalance)
      toast.success(`Added ${amount} tokens! New balance: ${result.newBalance}`)
      return true
    } catch (err) {
      console.error('Failed to add balance:', err)
      setError(err.message)
      toast.error(err.message || 'Failed to add balance')
      return false
    } finally {
      setLoading(false)
    }
  }, [getUserId])

  // Subtract balance
  const subtractBalance = useCallback(async (amount, reason, source = 'dashboard') => {
    const userId = getUserId()
    if (!userId) {
      toast.error('Please connect your wallet or Discord first')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const result = await balanceAPI.subtractBalance(userId, amount, reason, source)
      setBalance(result.newBalance)
      toast.success(`Spent ${amount} tokens. New balance: ${result.newBalance}`)
      return true
    } catch (err) {
      console.error('Failed to subtract balance:', err)
      setError(err.message)
      
      if (err.status === 400 && err.message.includes('Insufficient')) {
        toast.error('Insufficient balance!')
      } else {
        toast.error(err.message || 'Failed to subtract balance')
      }
      return false
    } finally {
      setLoading(false)
    }
  }, [getUserId])

  // Transfer balance to another user
  const transferBalance = useCallback(async (toUserIdentifier, amount, reason = 'Transfer') => {
    const fromUserId = getUserId()
    if (!fromUserId) {
      toast.error('Please connect your wallet or Discord first')
      return false
    }

    const toUserId = balanceAPI.parseUserId(toUserIdentifier)
    
    setLoading(true)
    setError(null)

    try {
      await balanceAPI.transferBalance(fromUserId, toUserId, amount, reason)
      await fetchBalance(false) // Refresh balance without showing loading
      toast.success(`Transferred ${amount} tokens successfully!`)
      return true
    } catch (err) {
      console.error('Failed to transfer balance:', err)
      setError(err.message)
      toast.error(err.message || 'Failed to transfer tokens')
      return false
    } finally {
      setLoading(false)
    }
  }, [getUserId, fetchBalance])

  // Refresh balance manually
  const refreshBalance = useCallback(async () => {
    setRefreshing(true)
    const newBalance = await fetchBalance(false)
    setRefreshing(false)
    return newBalance
  }, [fetchBalance])

  // Auto-refresh balance when user connects/disconnects
  useEffect(() => {
    if (isConnected || isDiscordConnected) {
      fetchBalance()
    } else {
      setBalance(0)
    }
  }, [isConnected, isDiscordConnected, fetchBalance])

  // Auto-refresh balance every 30 seconds when connected
  useEffect(() => {
    if (!isConnected && !isDiscordConnected) return

    const interval = setInterval(() => {
      fetchBalance(false) // Silent refresh
    }, 30000)

    return () => clearInterval(interval)
  }, [isConnected, isDiscordConnected, fetchBalance])

  const value = {
    balance,
    loading,
    error,
    refreshing,
    fetchBalance,
    addBalance,
    subtractBalance,
    transferBalance,
    refreshBalance,
    getUserId
  }

  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  )
}

export function useBalance() {
  const context = useContext(BalanceContext)
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider')
  }
  return context
}