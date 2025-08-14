"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, X } from "lucide-react"
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
    <div className="min-h-screen bg-black cyber-grid hex-pattern flex items-center justify-center p-4">
      <Card className={`max-w-md w-full ${
        theme === "light" 
          ? "bg-white border-gray-200 shadow-xl" 
          : "holo-card neon-border"
      }`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-violet-indigo to-bright-aqua rounded-full flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <CardTitle className={`text-2xl font-bold ${
            theme === "light" ? "text-gray-800" : "text-white"
          }`}>
            Connect Discord
          </CardTitle>
          <CardDescription className={`${
            theme === "light" ? "text-gray-600" : "text-gray-400"
          }`}>
            Link your Discord account to unlock exclusive features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-violet-indigo/20 text-violet-indigo">
                +100 REP
              </Badge>
              <span className={`text-sm ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              }`}>
                Instant bonus for connecting
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-bright-aqua/20 text-bright-aqua">
                Priority
              </Badge>
              <span className={`text-sm ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              }`}>
                Access to exclusive Discord channels
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-crimson-red/20 text-crimson-red">
                Events
              </Badge>
              <span className={`text-sm ${
                theme === "light" ? "text-gray-700" : "text-gray-300"
              }`}>
                Participate in Discord-only events
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full cyber-button pulse-glow bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Connect Discord
                </>
              )}
            </Button>

            <Button
              onClick={handleSkip}
              variant="ghost"
              className={`w-full ${
                theme === "light" 
                  ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100" 
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              disabled={isConnecting}
            >
              Skip for now
            </Button>
          </div>

          <p className={`text-xs text-center ${
            theme === "light" ? "text-gray-500" : "text-gray-500"
          }`}>
            You can always connect your Discord account later from your profile settings
          </p>
        </CardContent>
      </Card>
    </div>
  )
}