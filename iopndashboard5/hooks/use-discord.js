"use client"

import { createContext, useContext, useState, useEffect } from "react"

const DiscordContext = createContext(undefined)

export function DiscordProvider({ children }) {
  const [discordUser, setDiscordUser] = useState(null)
  const [isDiscordConnected, setIsDiscordConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Check for existing Discord connection
    const savedDiscordUser = localStorage.getItem("iopn-discord-user")
    if (savedDiscordUser) {
      const user = JSON.parse(savedDiscordUser)
      setDiscordUser(user)
      setIsDiscordConnected(true)
    }
  }, [])

  const connectDiscord = async () => {
    setIsConnecting(true)
    
    try {
      // Simulate Discord OAuth
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate mock Discord user
      const mockUser = {
        id: Math.random().toString(36).substr(2, 9),
        username: `User${Math.floor(Math.random() * 9999)}`,
        discriminator: Math.floor(Math.random() * 9999).toString().padStart(4, '0'),
        avatar: null,
      }
      
      setDiscordUser(mockUser)
      setIsDiscordConnected(true)
      
      // Save to localStorage
      localStorage.setItem("iopn-discord-user", JSON.stringify(mockUser))
      
      return mockUser
    } catch (error) {
      console.error("Failed to connect Discord:", error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectDiscord = () => {
    setDiscordUser(null)
    setIsDiscordConnected(false)
    localStorage.removeItem("iopn-discord-user")
    localStorage.removeItem("iopn-discord-skipped")
  }

  const skipDiscord = () => {
    localStorage.setItem("iopn-discord-skipped", "true")
  }

  const value = {
    discordUser,
    isDiscordConnected,
    isConnecting,
    connectDiscord,
    disconnectDiscord,
    skipDiscord,
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