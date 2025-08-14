"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function CustomConnectButton({ className, ...props }) {
  const { address, isConnected, isConnecting } = useAccount()
  const { theme } = useTheme()
  const [appKit, setAppKit] = useState(null)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Watch for connection changes
useEffect(() => {
  if (isConnected && address && appKit) {
    // If we're connected but modal might still be open, close it
    const { close } = appKit()
    close()
  }
}, [isConnected, address, appKit])


  useEffect(() => {
    // Only load AppKit after component is mounted
    if (!mounted) return
    
    const setupAppKit = async () => {
      try {
        const { useAppKit } = await import("@reown/appkit/react")
        setAppKit(() => useAppKit)
      } catch (error) {
        console.error("Failed to load AppKit:", error)
      }
    }
    setupAppKit()
  }, [mounted])
  
  const formatAddress = (addr) => {
    if (!addr) return ""
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }
  
  const handleClick = async () => {
    try {
      if (appKit) {
        const { open } = appKit()
        await open()
      } else {
        // Fallback: Try to open modal directly
        const modal = window.w3m || window.Web3Modal || window.AppKit
        if (modal && modal.open) {
          await modal.open()
        } else {
          // Last resort: dynamic import
          const { useAppKit } = await import("@reown/appkit/react")
          const { open } = useAppKit()
          await open()
        }
      }
    } catch (error) {
      console.error("Failed to open wallet modal:", error)
    }
  }
  
  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        disabled
        className={`${className} ${
          theme === "light" 
            ? "bg-gray-200 text-gray-500" 
            : "bg-gray-800 text-gray-500"
        } font-bold py-3 sm:py-4 text-base sm:text-lg`}
        {...props}
      >
        <span className="mr-2">🔗</span>
        Loading...
      </Button>
    )
  }
  
  if (isConnected && address) {
    return (
      <Button
        onClick={handleClick}
        className={`${className} ${
          theme === "light" 
            ? "bg-blue-600 hover:bg-blue-700 text-white" 
            : "bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white"
        }`}
        {...props}
      >
        <span className="mr-2">💳</span>
        {formatAddress(address)}
      </Button>
    )
  }
  
  return (
    <Button
      onClick={handleClick}
      disabled={isConnecting || !appKit}
      className={`${className} ${
        theme === "light" 
          ? "bg-blue-600 hover:bg-blue-700 text-white" 
          : "bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 cyber-button pulse-glow text-white"
      } font-bold py-3 sm:py-4 text-base sm:text-lg transition-all duration-300`}
      {...props}
    >
      {isConnecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          Connecting...
        </>
      ) : (
        <>
          <span className="mr-2">🔗</span>
          Connect Wallet
        </>
      )}
    </Button>
  )
}