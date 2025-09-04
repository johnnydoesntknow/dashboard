"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { usePrivy, useLogin } from '@privy-io/react-auth'

const DiscordContext = createContext(undefined)

export function DiscordProvider({ children }) {
  const { ready, authenticated, user } = usePrivy()
  const { login } = useLogin()
  
  const [discordUser, setDiscordUser] = useState(null)
  const [isDiscordConnected, setIsDiscordConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [sessionExpiry, setSessionExpiry] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Update Discord user when Privy user changes
  useEffect(() => {
    setIsCheckingAuth(!ready)
    
    if (user && user.discord) {
      // Map Privy Discord data to your existing format
      const discordData = {
        id: user.discord.subject || user.discord.id,
        username: user.discord.username,
        discriminator: user.discord.discriminator || '0',
        avatar: user.discord.profilePictureUrl || user.discord.picture,
        email: user.discord.email,
        // Privy doesn't provide guilds directly, but you can add this later via API if needed
        guilds: []
      }
      
      setDiscordUser(discordData)
      setIsDiscordConnected(true)
      
      // Set session expiry (Privy handles this internally but we'll set 7 days for compatibility)
      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000)
      setSessionExpiry(expiryTime)
      
      // Store in localStorage for compatibility with existing code
      localStorage.setItem('iopn-discord-user', JSON.stringify(discordData))
      localStorage.setItem('iopn-discord-expiry', expiryTime.toString())
    } else if (ready && !user) {
      // User is not authenticated
      setDiscordUser(null)
      setIsDiscordConnected(false)
      setSessionExpiry(null)
      localStorage.removeItem('iopn-discord-user')
      localStorage.removeItem('iopn-discord-expiry')
    }
  }, [user, ready])

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      const savedUser = localStorage.getItem('iopn-discord-user')
      const savedExpiry = localStorage.getItem('iopn-discord-expiry')
      
      if (savedUser && savedExpiry) {
        const expiry = parseInt(savedExpiry)
        if (expiry > Date.now()) {
          // Use cached data while Privy loads
          setDiscordUser(JSON.parse(savedUser))
          setIsDiscordConnected(true)
          setSessionExpiry(expiry)
        }
      }
    }
    
    checkExistingSession()
  }, [])

  // Connect to Discord using Privy
  const connectDiscord = async () => {
    setIsConnecting(true)
    
    try {
      // Privy will handle the Discord OAuth flow
      await login({
        loginMethods: ['discord']
      })
      // After successful login, the useEffect above will handle setting the user data
    } catch (error) {
      console.error('Failed to connect Discord via Privy:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  // Refresh token (Privy handles this automatically, but keeping for compatibility)
  const refreshToken = async () => {
    // Privy automatically refreshes tokens
    // Just update our expiry time for compatibility
    if (isDiscordConnected) {
      const newExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000)
      setSessionExpiry(newExpiry)
      localStorage.setItem('iopn-discord-expiry', newExpiry.toString())
      return true
    }
    return false
  }

  // Disconnect Discord (handled by Privy's logout)
  const disconnectDiscord = async () => {
    // Note: With Privy, this will disconnect the entire session, not just Discord
    // If you need Discord-only disconnect, you'd need to implement that separately
    
    // Clear local state
    setDiscordUser(null)
    setIsDiscordConnected(false)
    setSessionExpiry(null)
    
    // Clear localStorage
    localStorage.removeItem('iopn-discord-user')
    localStorage.removeItem('iopn-discord-expiry')
    localStorage.removeItem('iopn-discord-skipped')
  }

  // Skip Discord connection
  const skipDiscord = () => {
    localStorage.setItem('iopn-discord-skipped', 'true')
  }

  // Get avatar URL
  const getAvatarUrl = useCallback(() => {
    if (!discordUser) return null
    
    // Privy provides the full URL directly
    if (discordUser.avatar && discordUser.avatar.startsWith('http')) {
      return discordUser.avatar
    }
    
    // Fallback to Discord CDN format if needed
    if (discordUser.avatar && discordUser.id) {
      return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${
        discordUser.avatar.startsWith('a_') ? 'gif' : 'png'
      }?size=128`
    }
    
    // Default avatar
    const defaultAvatarNumber = parseInt(discordUser.discriminator || '0') % 5
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
  }, [discordUser])

  // Get banner URL (Privy doesn't provide this, keeping for compatibility)
  const getBannerUrl = useCallback(() => {
    // Privy doesn't provide banner data
    return null
  }, [])

  // Check if user is in a specific guild (would need separate API call with Privy)
  const isInGuild = useCallback((guildId) => {
    // This would require a separate backend API call with Privy
    // For now, return false or implement later
    return false
  }, [])

  // Get time until expiry
  const getTimeUntilExpiry = useCallback(() => {
    if (!sessionExpiry) return null
    
    const remaining = sessionExpiry - Date.now()
    if (remaining <= 0) return 'expired'
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`
    }
  }, [sessionExpiry])

  // Fetch user data (keeping for compatibility but using Privy's user object)
  const fetchUserData = useCallback(async () => {
    // With Privy, user data is automatically available via the user object
    if (user && user.discord) {
      return discordUser
    }
    return null
  }, [user, discordUser])

  const value = {
    discordUser,
    isDiscordConnected,
    isConnecting,
    isCheckingAuth,
    sessionExpiry,
    connectDiscord,
    disconnectDiscord,
    skipDiscord,
    refreshToken,
    getAvatarUrl,
    getBannerUrl,
    isInGuild,
    getTimeUntilExpiry,
    fetchUserData
  }

  return (
    <DiscordContext.Provider value={value}>
      {children}
    </DiscordContext.Provider>
  )
}

export function useDiscord() {
  const context = useContext(DiscordContext)
  if (context === undefined) {
    throw new Error('useDiscord must be used within a DiscordProvider')
  }
  return context
}