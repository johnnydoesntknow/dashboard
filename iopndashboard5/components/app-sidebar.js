"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Gift, Zap, Users, Sparkles, Trophy, Moon, Sun, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useDiscord } from "@/hooks/use-discord"
import { useAuth } from "@/hooks/use-auth"
import { mockUser } from "@/lib/mock-data"
import { useSidebar } from "@/components/ui/sidebar"
import { useBadgeMarketplace } from "@/hooks/use-badge-marketplace"

const navigationItems = [
  { name: "Dashboard", href: "/", icon: TrendingUp },
  { name: "NFT Mint", href: "/nft-mint", icon: Sparkles },
  { name: "NFT Showcase", href: "/nft-showcase", icon: Gift },
  { name: "Missions", href: "/missions", icon: Target },
  { name: "Marketplace", href: "/marketplace", icon: Zap },
  { name: "Referrals", href: "/referrals", icon: Users },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
]

export function AppSidebar({ ...props }) {
  const { walletAddress, isConnected, connectWallet, disconnectWallet } = useWallet()
  const { isDiscordConnected, disconnectDiscord } = useDiscord()
  const { state, toggleSidebar, isMobile } = useSidebar()
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const { userREP } = useBadgeMarketplace()
  const currentRep = userREP ?? 0
  const isCollapsed = state === "collapsed"
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatWalletAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleDisconnect = () => {
    disconnectWallet()
  }

  const handleDiscordDisconnect = () => {
    disconnectDiscord()
  }

  // Don't render until theme is loaded
  if (!mounted) {
    return null
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      className={`transition-all duration-200 ${
        theme === "light"
          ? "bg-white border-r border-gray-200"
          : "bg-black/95 border-r border-bright-aqua/30"
      }`}
      data-state={state}
      style={{
        backgroundColor: theme === "light" ? "#ffffff" : "rgba(0, 0, 0, 0.95)",
        borderRight: theme === "light" ? "1px solid #e5e7eb" : "1px solid rgba(0, 255, 255, 0.3)"
      }}
      {...props}
    >
      {/* Collapse Button - Top Right of Sidebar */}
      {!isMobile && (
        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="icon"
          className={`absolute top-4 right-4 z-50 w-8 h-8 transition-all duration-200 hidden md:flex ${
            theme === "light"
              ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              : "text-bright-aqua hover:text-white hover:bg-bright-aqua/10"
          }`}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      )}

      <SidebarHeader className={`pt-16 ${
        theme === "light" ? "bg-white" : "bg-transparent"
      }`}>
        <div className="flex items-center space-x-3 px-2 py-4">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            {theme === "light" ? (
              <img
                src="/images/iopn-logo.png"
                alt="IOPn Logo"
                className="w-8 h-8 object-contain rounded"
              />
            ) : (
              <Image
                src="/images/iopn-logo-white.png"
                alt="IOPn Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className={`text-lg font-bold ${
                theme === "light" ? "text-gray-800" : "text-white glow-text"
              }`}>IOPn</h1>
              <p className={`text-xs ${
                theme === "light" ? "text-gray-600" : "text-gray-400"
              }`}>Dashboard</p>
            </div>
          )}
        </div>

        {/* Social Media Icons - Hide when collapsed */}
        {!isCollapsed && (
          <div className="px-2 pb-4">
            <div className="flex items-center justify-center space-x-4">
              <a
                href="https://twitter.com/iopn"
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${
                  theme === "light"
                    ? "text-gray-500 hover:text-blue-600"
                    : "text-gray-400 hover:text-bright-aqua"
                }`}
                title="Follow us on X (Twitter)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://discord.gg/iopn"
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${
                  theme === "light"
                    ? "text-gray-500 hover:text-blue-600"
                    : "text-gray-400 hover:text-bright-aqua"
                }`}
                title="Join our Discord"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25-1.845-.276-3.68-.276-5.487 0-.164-.394-.406-.875-.618-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
                </svg>
              </a>
              <a
                href="https://t.me/iopn"
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${
                  theme === "light"
                    ? "text-gray-500 hover:text-blue-600"
                    : "text-gray-400 hover:text-bright-aqua"
                }`}
                title="Join our Telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/iopn"
                target="_blank"
                rel="noopener noreferrer"
                className={`transition-colors ${
                  theme === "light"
                    ? "text-gray-500 hover:text-blue-600"
                    : "text-gray-400 hover:text-bright-aqua"
                }`}
                title="Follow us on Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* User Stats - Show minimal version when collapsed */}
        {isConnected && (
          <div className="px-2 pb-4 space-y-2">
            {!isCollapsed ? (
              <div className={`rounded-lg p-3 text-center transition-all duration-300 ${
                theme === "light"
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-black/80 border border-violet-indigo/20"
              }`}>
                <p className={`text-xs mb-1 font-medium ${
                  theme === "light" ? "text-blue-600" : "text-gray-300"
                }`}>Connected</p>
                <p className={`text-sm font-bold ${
                  theme === "light" ? "text-gray-800" : "text-white"
                }`}>{formatWalletAddress(walletAddress)}</p>
              </div>
            ) : (
              <div className={`rounded-lg p-2 flex items-center justify-center ${
                theme === "light"
                  ? "bg-blue-100"
                  : "bg-violet-indigo/20"
              }`}>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            )}
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={`flex-1 overflow-y-auto ${
        theme === "light" ? "bg-white" : "bg-transparent"
      }`}>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel className={
            theme === "light" ? "text-gray-600" : "text-gray-400"
          }>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-2 py-2 rounded-lg transition-all duration-200 ${
                          isActive 
                            ? theme === "light"
                              ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600"
                              : "bg-violet-indigo/20 text-bright-aqua border-l-2 border-bright-aqua"
                            : theme === "light"
                              ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <item.icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'}`} />
                        {!isCollapsed && <span>{item.name}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats - Only show when not collapsed */}
        {isConnected && isDiscordConnected && !isCollapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className={
              theme === "light" ? "text-gray-600" : "text-gray-400"
            }>Quick Stats</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 space-y-3">
                <div className={`rounded-lg p-3 transition-all duration-300 ${
                  theme === "light"
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-gradient-to-r from-bright-aqua/10 to-bright-aqua/5 border border-bright-aqua/20"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}>REP Points</span>
                    <Badge variant="outline" className={
                      theme === "light"
                        ? "bg-blue-100 text-blue-600 border-blue-300"
                        : "bg-bright-aqua/10 text-bright-aqua border-bright-aqua"
                    }>
                      {currentRep.toLocaleString()}
                    </Badge>
                  </div>
                </div>
                <div className={`rounded-lg p-3 transition-all duration-300 ${
                  theme === "light"
                    ? "bg-purple-50 border border-purple-200"
                    : "bg-gradient-to-r from-violet-indigo/10 to-violet-indigo/5 border border-violet-indigo/20"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}>Badges</span>
                    <Badge variant="outline" className={
                      theme === "light"
                        ? "bg-purple-100 text-purple-600 border-purple-300"
                        : "bg-violet-indigo/10 text-violet-indigo border-violet-indigo"
                    }>
                      {mockUser.badges.length}
                    </Badge>
                  </div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer - Show minimal version when collapsed */}
      <SidebarFooter className={
        theme === "light" ? "bg-white" : "bg-transparent"
      }>
        {isConnected && !isCollapsed && (
          <div className="px-2 pb-2 space-y-2">
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className={`w-full justify-start transition-all duration-200 ${
                theme === "light"
                  ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400"
                  : "bg-crimson-red/20 border-crimson-red/40 text-crimson-red hover:bg-crimson-red/30 hover:border-crimson-red/60"
              }`}
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </Button>
          </div>
        )}

        {isDiscordConnected && !isCollapsed && (
          <div className="px-2 pb-2">
            <Button
              onClick={handleDiscordDisconnect}
              variant="outline"
              className={`w-full justify-start transition-all duration-200 ${
                theme === "light"
                  ? "bg-purple-50 border-purple-300 text-purple-600 hover:bg-purple-100 hover:border-purple-400"
                  : "bg-purple-500/20 border-purple-500/40 text-purple-400 hover:bg-purple-500/30 hover:border-purple-500/60"
              }`}
              size="sm"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25-1.845-.276-3.68-.276-5.487 0-.164-.394-.406-.875-.618-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
              </svg>
              Disconnect Discord
            </Button>
          </div>
        )}

        
        {/* Theme Toggle Button */}
        <div className={`px-2 pb-2 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <Button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            variant="outline"
            className={`${isCollapsed ? 'w-10 h-10 p-0' : 'w-full justify-start'} transition-all duration-200 ${
              theme === "light"
                ? "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 hover:border-gray-400"
                : "bg-violet-indigo/20 border-violet-indigo/40 text-violet-indigo hover:bg-violet-indigo/30 hover:border-violet-indigo/60"
            }`}
            size="sm"
          >
            {theme === "light" ? (
              <Moon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-2'}`} />
            ) : (
              <Sun className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-2'}`} />
            )}
            {!isCollapsed && (theme === "light" ? "Dark Mode" : "Light Mode")}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}