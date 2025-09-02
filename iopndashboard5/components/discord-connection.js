// UPDATE components/discord-connection.js

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useDiscord } from "@/hooks/use-discord"
import { useTheme } from "next-themes"

export function DiscordConnection({ onComplete, onSkip }) {
  const { connectDiscord, isConnecting, skipDiscord } = useDiscord()
  const { theme } = useTheme()
  const [error, setError] = useState(null)

  const handleConnect = async () => {
    try {
      setError(null)
      await connectDiscord()
      onComplete()
    } catch (err) {
      setError("Failed to connect Discord. Please try again.")
    }
  }

  const handleSkip = () => {
    skipDiscord()
    onSkip()
  }

  return (
    <div className="min-h-screen bg-black cyber-grid flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          {/* Discord Logo */}
          <div className="mx-auto mb-6 w-24 h-24 bg-gradient-to-br from-[#5865F2] to-[#7289DA] rounded-full flex items-center justify-center">
            {/* Discord SVG Logo */}
            <svg className="w-14 h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
            </svg>
          </div>
          
          {/* Main Header - Matching welcome page style */}
          <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 pb-2 ${
            theme === "light" 
              ? "from-gray-800 to-gray-600" 
              : "from-bright-aqua to-white drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
          }`}>
            Connect Discord
          </h1>
          
          {/* Subtitle - Matching welcome page style */}
          <p className={`text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent ${
            theme === "light" 
              ? "from-gray-800 to-gray-600" 
              : "from-bright-aqua to-white drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
          }`}>
            Link your Discord account to unlock exclusive features
          </p>
        </div>

        {/* Benefits list - simplified */}
        <div className="space-y-3 text-center">
         <p className={`text-sm font-medium ${
    theme === "light" 
      ? "text-gray-600" 
      : "text-bright-aqua/80"
  }`}>
    📊 Track your REP points and leaderboard ranking
  </p>
          <p className={`text-sm font-medium ${
            theme === "light" 
              ? "text-gray-600" 
              : "text-bright-aqua/80"
          }`}>
            🎯 Access to exclusive Discord channels
          </p>
          <p className={`text-sm font-medium ${
            theme === "light" 
              ? "text-gray-600" 
              : "text-bright-aqua/80"
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
          {/* Connect Button - Matching welcome page style */}
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
                Connecting...
              </>
            ) : (
              <>
                {/* Small Discord icon in button */}
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
                Connect Discord
              </>
            )}
          </Button>

          {/* Skip button - subtle, matching welcome page */}
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
          
          {/* Footer text - matching welcome page style */}
          <p className={`text-xs sm:text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent text-center ${
            theme === "light" 
              ? "from-gray-600 to-gray-500" 
              : "from-bright-aqua/90 to-white/70 drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]"
          }`}>
            You can always connect your Discord account later from your profile settings
          </p>
        </div>
      </div>
    </div>
  )
}

// Alternative version without any card/border at all (even cleaner)
export function DiscordConnectionMinimal({ onComplete, onSkip }) {
  const { connectDiscord, isConnecting, skipDiscord } = useDiscord()
  const { theme } = useTheme()
  const [error, setError] = useState(null)

  const handleConnect = async () => {
    try {
      setError(null)
      await connectDiscord()
      onComplete()
    } catch (err) {
      setError("Failed to connect Discord. Please try again.")
    }
  }

  const handleSkip = () => {
    skipDiscord()
    onSkip()
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          {/* Main Header */}
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
                Connecting...
              </>
            ) : (
              <>
                {/* Small Discord icon in button */}
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
                Connect Discord
              </>
            )}
          </Button>
          
          <p className={`text-xs sm:text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent ${
            theme === "light" 
              ? "from-gray-600 to-gray-500" 
              : "from-bright-aqua/90 to-white/70 drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]"
          }`}>
            Earn +100 REP and access exclusive Discord channels and events
          </p>
        </div>
      </div>
    </div>
  )
}