"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

const DiscordContext = createContext(undefined)

export function DiscordProvider({ children }) {
  const [discordUser, setDiscordUser] = useState(null)
  const [isDiscordConnected, setIsDiscordConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [sessionExpiry, setSessionExpiry] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      const savedUser = localStorage.getItem('iopn-discord-user')
      const savedExpiry = localStorage.getItem('iopn-discord-expiry')
      
      if (savedUser && savedExpiry) {
        const expiry = parseInt(savedExpiry)
        if (expiry > Date.now()) {
          setDiscordUser(JSON.parse(savedUser))
          setIsDiscordConnected(true)
          setSessionExpiry(expiry)
        } else {
          // Session expired, clear it
          localStorage.removeItem('iopn-discord-user')
          localStorage.removeItem('iopn-discord-expiry')
        }
      }
      setIsCheckingAuth(false)
    }
    
    checkExistingSession()
  }, [])

  // Connect to Discord using your backend
  const connectDiscord = () => {
    setIsConnecting(true)
    // Simple redirect to your backend OAuth endpoint
    window.location.href = 'http://localhost:3001/auth/discord'
  }

  // Process OAuth callback (call this from your component when token is received)
  const processOAuthCallback = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      const discordUserData = {
        id: payload.id,
        username: payload.username,
        discriminator: payload.discriminator || '0',
        avatar: payload.avatar,
        email: payload.email,
        verified: true,
        guilds: payload.guilds || [],
        timestamp: payload.timestamp || Date.now()
      }
      
      // Set expiry (2 hours instead of 7 days if you prefer)
      const expiryTime = Date.now() + (2 * 60 * 60 * 1000) // 2 hours
      
      setDiscordUser(discordUserData)
      setIsDiscordConnected(true)
      setSessionExpiry(expiryTime)
      setIsConnecting(false)
      
      // Store in localStorage
      localStorage.setItem('iopn-discord-user', JSON.stringify(discordUserData))
      localStorage.setItem('iopn-discord-expiry', expiryTime.toString())
      
      return true
    } catch (error) {
      console.error('Failed to process Discord token:', error)
      setIsConnecting(false)
      return false
    }
  }

  // Refresh token
  const refreshToken = async () => {
    if (isDiscordConnected) {
      const newExpiry = Date.now() + (2 * 60 * 60 * 1000) // 2 hours
      setSessionExpiry(newExpiry)
      localStorage.setItem('iopn-discord-expiry', newExpiry.toString())
      return true
    }
    return false
  }

  // Disconnect Discord
  const disconnectDiscord = () => {
    setDiscordUser(null)
    setIsDiscordConnected(false)
    setSessionExpiry(null)
    
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
    
    if (discordUser.avatar && discordUser.id) {
      return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${
        discordUser.avatar.startsWith('a_') ? 'gif' : 'png'
      }?size=128`
    }
    
    // Default avatar
    const defaultAvatarNumber = parseInt(discordUser.discriminator || '0') % 5
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
  }, [discordUser])

  // Get banner URL
  const getBannerUrl = useCallback(() => {
    // Not implemented in basic OAuth
    return null
  }, [])

  // Check if user is in a specific guild
  const isInGuild = useCallback((guildId) => {
    if (!discordUser || !discordUser.guilds) return false
    return discordUser.guilds.some(guild => guild.id === guildId)
  }, [discordUser])

  // Get time until expiry
  const getTimeUntilExpiry = useCallback(() => {
    if (!sessionExpiry) return null
    
    const remaining = sessionExpiry - Date.now()
    if (remaining <= 0) return 'expired'
    
    const hours = Math.floor(remaining / (60 * 60 * 1000))
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }, [sessionExpiry])

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    return discordUser
  }, [discordUser])

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
    fetchUserData,
    processOAuthCallback,
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
    throw new Error("useDiscord must be used within a DiscordProvider")
  }
  return context
}