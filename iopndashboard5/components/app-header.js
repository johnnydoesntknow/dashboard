"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Menu } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useAuth } from "@/hooks/use-auth"
import { useDiscord } from "@/hooks/use-discord"
import { useBadgeMarketplace } from "@/hooks/use-badge-marketplace"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useState, useEffect } from 'react'

export function AppHeader() {
  const { walletAddress, disconnectWallet } = useWallet()
  const { user } = useAuth()
  const { discordUser, isDiscordConnected } = useDiscord()
  const { userREP } = useBadgeMarketplace()
  const { theme } = useTheme()
  const router = useRouter()
  const { wallets } = useWallets()
  const [opnBalance, setOpnBalance] = useState('0.00')
  
  // Fetch balance using Privy's embedded wallet
  useEffect(() => {
    const fetchBalance = async () => {
      if (wallets && wallets.length > 0) {
        try {
          const wallet = wallets[0]
          const provider = await wallet.getEthereumProvider()
          const balanceHex = await provider.request({
            method: 'eth_getBalance',
            params: [wallet.address, 'latest']
          })
          // Convert from hex to decimal and format
          const balanceInWei = parseInt(balanceHex, 16)
          const balanceInEth = (balanceInWei / 1e18).toFixed(2)
          setOpnBalance(balanceInEth)
        } catch (error) {
          console.error('Error fetching balance:', error)
          setOpnBalance('0.00')
        }
      }
    }
    
    fetchBalance()
    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000)
    return () => clearInterval(interval)
  }, [wallets])

  const formatWalletAddress = (address) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleResetFlow = () => {
    // Clear ALL localStorage data
    localStorage.removeItem("iopn-wallet-address")
    localStorage.removeItem("iopn-discord-user")
    localStorage.removeItem("iopn-discord-skipped")
    localStorage.removeItem("iopn-user")
    localStorage.removeItem("iopn-user-nft")
    localStorage.removeItem("iopn-completed-tutorials")
    localStorage.removeItem("iopn-tutorial-cycle-completed")
    localStorage.removeItem("iopn-achievements")
    localStorage.removeItem("iopn-badges")
    localStorage.removeItem("iopn-marketplace-data")
    localStorage.removeItem("iopn-missions-data")
    localStorage.removeItem("iopn-referrals-data")
    localStorage.removeItem("iopn_user_badges")
    localStorage.removeItem("iopn_user_rep")
    localStorage.removeItem("iopn_marketplace_listings")

    // Clear everything that starts with "iopn-"
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("iopn-")) {
        localStorage.removeItem(key)
      }
    })

    // Disconnect wallet
    disconnectWallet()

    // Force page reload to reset all states
    window.location.reload()
  }

  // Get username - prioritize Discord username if connected
  const username = isDiscordConnected && discordUser?.username 
    ? discordUser.username 
    : user?.name || "Jimi"
  
  const userInitial = username.charAt(0).toUpperCase()

  // Build Discord avatar URL if connected and has avatar
  const discordAvatarUrl = isDiscordConnected && discordUser?.id && discordUser?.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    : null

  return (
    <header className={`sticky top-0 z-30 flex h-14 lg:h-16 items-center gap-2 border-b px-3 sm:px-4 transition-all duration-300 ${
      theme === "light" 
        ? "bg-white backdrop-blur-md border-gray-200" 
        : "bg-black/95 backdrop-blur-md border-bright-aqua/20"
    }`}>
      <div className="flex items-center justify-between w-full">
        {/* Left - Mobile menu button and Welcome message */}
        <div className="flex items-center gap-2">
          {/* Mobile Sidebar Trigger - Only visible on mobile */}
          <SidebarTrigger className={`md:hidden h-9 w-9 ${
            theme === "light"
              ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-300"
              : "text-bright-aqua hover:text-white hover:bg-bright-aqua/10 border border-bright-aqua/30"
          }`} />
          
          {/* Welcome message with username */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            <Avatar className={`h-8 w-8 border ${
              theme === "light" ? "border-gray-300" : "border-bright-aqua/30"
            }`}>
              <AvatarImage src={discordAvatarUrl || "/placeholder.svg"} />
              <AvatarFallback
                className={`text-sm ${
                  theme === "light" ? "bg-blue-500 text-white" : "bg-violet-indigo text-white"
                }`}
              >
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className={`text-xs lg:text-sm font-medium ${
                  theme === "light" ? "text-gray-800" : "text-white"
                }`}>
                  Welcome back, {username}
                </p>
                {isDiscordConnected && (
                  <div className="flex items-center">
                    <svg className={`w-3 h-3 ${theme === "light" ? "text-blue-600" : "text-violet-indigo"}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25-1.845-.276-3.68-.276-5.487 0-.164-.394-.406-.875-.618-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
                    </svg>
                  </div>
                )}
              </div>
              <p className={`text-xs truncate ${
                theme === "light" ? "text-gray-600" : "text-gray-500"
              }`}>
                {formatWalletAddress(walletAddress)}
              </p>
            </div>
          </div>
        </div>

        {/* Right - Compact stats and reset button */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          <div className="text-right hidden sm:block">
            <p
              className={`text-xs uppercase tracking-wide font-medium ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
            >
              Wallet Balance
            </p>
            <p className={`text-sm font-bold ${
              theme === "light" ? "text-blue-600" : "text-bright-aqua"
            }`}>{opnBalance} OPN</p>
          </div>
          <div className="text-right">
            <p
              className={`text-xs uppercase tracking-wide font-medium ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
            >
              Current REP
            </p>
            <p
              className={`text-sm font-bold transition-all duration-300 ${
                theme === "light" ? "text-blue-600" : "text-white"
              }`}
            >
              {userREP?.toLocaleString()} REP
            </p>
          </div>
          <Button
            onClick={handleResetFlow}
            variant="outline"
            size="sm"
            className={`text-xs hidden lg:inline-flex ${
              theme === "light"
                ? "border-blue-300 text-blue-600 hover:bg-blue-50 bg-white"
                : "border-bright-aqua/30 text-bright-aqua hover:bg-bright-aqua/10 bg-transparent"
            }`}
          >
            Reset Flow
          </Button>
          
          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`lg:hidden h-8 w-8 ${
                  theme === "light" ? "hover:bg-gray-100" : ""
                }`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleResetFlow}>
                Reset Flow
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}