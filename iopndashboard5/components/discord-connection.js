"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDiscord } from "@/hooks/use-discord"
import { useTheme } from "next-themes"
import { Shield, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export function DiscordConnection({ onComplete, onSkip }) {
  const { 
    connectDiscord, 
    isConnecting, 
    skipDiscord, 
    discordUser,
    isDiscordConnected,
    getAvatarUrl,
    getTimeUntilExpiry,
    refreshToken,
    isCheckingAuth,
    processOAuthCallback
  } = useDiscord()
  const { theme } = useTheme()
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Handle Discord OAuth callback
  useEffect(() => {
    const discordParam = searchParams.get('discord')
    const token = searchParams.get('token')
    
    if (discordParam === 'success' && token && !isDiscordConnected) {
      // Process using the Discord hook's function
      const success = processOAuthCallback(token)
      
      if (success) {
        // Clean URL
        router.replace('/')
        // onComplete will be triggered by the next useEffect
      } else {
        setError('Failed to process Discord authentication')
      }
    }
  }, [searchParams, router, processOAuthCallback, isDiscordConnected])

  // Auto-complete if already connected
  useEffect(() => {
    if (isDiscordConnected && discordUser && onComplete) {
      onComplete()
    }
  }, [isDiscordConnected, discordUser, onComplete])

  const handleConnect = async () => {
    try {
      setError(null)
      await connectDiscord()
      // OAuth flow will redirect, so no need to call onComplete here
    } catch (err) {
      setError("Failed to connect Discord. Please try again.")
    }
  }

  const handleSkip = () => {
    skipDiscord()
    if (onSkip) onSkip()
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshToken()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bright-aqua mx-auto mb-4"></div>
          <p className="text-gray-400">Checking Discord connection...</p>
        </div>
      </div>
    )
  }

  // Show connection status if already connected
  if (isDiscordConnected && discordUser) {
    const timeRemaining = getTimeUntilExpiry()
    const avatarUrl = getAvatarUrl()

    return (
      <div className="min-h-screen bg-black cyber-grid flex items-center justify-center p-4">
        <Card className={`max-w-lg w-full p-8 ${
          theme === "light"
            ? "bg-white/95 border-gray-200"
            : "bg-black/80 border-bright-aqua/30 backdrop-blur-sm"
        }`}>
          <div className="text-center space-y-6">
            {/* Success Header */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div>
              <h2 className={`text-2xl font-bold mb-2 ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}>
                Discord Connected!
              </h2>
              <p className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                Your Discord account is successfully linked
              </p>
            </div>

            {/* User Info */}
            <div className={`p-4 rounded-lg ${
              theme === "light" ? "bg-gray-50" : "bg-gray-900/50"
            }`}>
              <div className="flex items-center space-x-4">
                {avatarUrl && (
                  <img 
                    src={avatarUrl} 
                    alt="Discord Avatar" 
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div className="text-left flex-1">
                  <p className={`font-semibold text-lg ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}>
                    {discordUser.username}#{discordUser.discriminator}
                  </p>
                  {discordUser.email && (
                    <p className={`text-sm ${
                      theme === "light" ? "text-gray-500" : "text-gray-400"
                    }`}>
                      {discordUser.email}
                    </p>
                  )}
                  {discordUser.verified && (
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-500">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Session Info */}
            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                theme === "light" ? "bg-blue-50" : "bg-blue-500/10"
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm ${
                    theme === "light" ? "text-gray-700" : "text-gray-300"
                  }`}>
                    Session active
                  </span>
                </div>
                <Badge variant="outline" className="text-blue-500 border-blue-500">
                  {timeRemaining || 'Active'}
                </Badge>
              </div>

              {/* Server/Guild Count */}
              {discordUser.guilds && discordUser.guilds.length > 0 && (
                <div className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}>
                  Connected to {discordUser.guilds.length} server{discordUser.guilds.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {timeRemaining && timeRemaining !== 'expired' && (
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  className={`w-full ${
                    theme === "light"
                      ? "border-gray-300 hover:bg-gray-50"
                      : "border-gray-700 hover:bg-gray-900"
                  }`}
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Refreshing Session...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Extend Session
                    </>
                  )}
                </Button>
              )}

              {onComplete && (
                <Button
                  onClick={onComplete}
                  className="w-full bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white"
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Default connection screen
  return (
    <div className="min-h-screen bg-black cyber-grid flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          {/* Discord Logo */}
          <div className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-[#5865F2] to-[#7289DA] rounded-full flex items-center justify-center">
            <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 pb-2 ${
            theme === "light" 
              ? "from-gray-800 to-gray-600" 
              : "from-bright-aqua to-white drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
          }`}>
            Connect Discord
          </h1>
          
          <p className={`text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent ${
            theme === "light" 
              ? "from-gray-800 to-gray-600" 
              : "from-bright-aqua to-white drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
          }`}>
            Link your Discord account to unlock exclusive features
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3 text-center">
          <p className={`text-sm font-medium ${
            theme === "light" ? "text-gray-600" : "text-bright-aqua/80"
          }`}>
            🔒 Secure OAuth2 authentication
          </p>
          <p className={`text-sm font-medium ${
            theme === "light" ? "text-gray-600" : "text-bright-aqua/80"
          }`}>
            📊 Track your REP points and leaderboard ranking
          </p>
          <p className={`text-sm font-medium ${
            theme === "light" ? "text-gray-600" : "text-bright-aqua/80"
          }`}>
            🎯 Access to exclusive Discord channels
          </p>
          <p className={`text-sm font-medium ${
            theme === "light" ? "text-gray-600" : "text-bright-aqua/80"
          }`}>
            🎉 Participate in Discord-only events
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500 text-center">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`w-full ${
              theme === "light"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white"
            } font-bold py-3 sm:py-4 text-base sm:text-lg transition-all duration-300`}
            size="lg"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Redirecting to Discord...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
                Connect with Discord
              </>
            )}
          </Button>
          
          {onSkip && (
            <Button
              onClick={handleSkip}
              variant="ghost"
              className={`w-full ${
                theme === "light" 
                  ? "text-gray-600 hover:text-gray-800" 
                  : "text-gray-400 hover:text-gray-300"
              } font-medium`}
              disabled={isConnecting}
            >
              Skip for now
            </Button>
          )}
          
          <p className={`text-xs sm:text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent text-center ${
            theme === "light" 
              ? "from-gray-600 to-gray-500" 
              : "from-bright-aqua/90 to-white/70 drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]"
          }`}>
            Secure connection with Discord OAuth2
          </p>
        </div>
      </div>
    </div>
  )
}