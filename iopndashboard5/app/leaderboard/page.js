"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, TrendingUp, Users, Star, Crown, Award } from "lucide-react"
import { mockLeaderboard, getUserRank, getPointsToTop50 } from "@/lib/mock-data"
import { useBadgeMarketplace } from "@/hooks/use-badge-marketplace"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { AppHeader } from "@/components/app-header"
import { useWallet } from "@/hooks/use-wallet"
import { useDiscord } from "@/hooks/use-discord"
import { useRouter } from "next/navigation"
import { useTutorial } from "@/hooks/use-tutorial"
import { TutorialButton } from "@/components/tutorial-button"
import { TutorialPopup } from "@/components/tutorial-popup"

export default function LeaderboardPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { isConnected } = useWallet()
  const { isDiscordConnected } = useDiscord()
  const { userREP } = useBadgeMarketplace()
  const { showTutorial } = useTutorial()
  const [timeFilter, setTimeFilter] = useState("all")
  const [dynamicLeaderboard, setDynamicLeaderboard] = useState(mockLeaderboard)
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  
  // Auth guard - check if user has completed onboarding
  useEffect(() => {
    const checkAuth = () => {
      const discordSkipped = localStorage.getItem("iopn-discord-skipped")
      
      if (!isConnected) {
        // Not connected to wallet, redirect to dashboard
        router.push("/")
        return
      }
      
      if (!isDiscordConnected && !discordSkipped) {
        // Discord not connected or skipped, redirect to dashboard
        router.push("/")
        return
      }
      
      // Auth check passed
      setIsAuthChecking(false)
    }
    
    checkAuth()
  }, [isConnected, isDiscordConnected, router])
  
  // Update leaderboard with actual user REP
  useEffect(() => {
    if (!isAuthChecking) {
      // Update the current user's data in the leaderboard
      const updatedLeaderboard = mockLeaderboard.map(player => {
        if (player.isUser) {
          return {
            ...player,
            totalPoints: userREP
          }
        }
        return player
      })
      
      // Re-sort the leaderboard based on total points
      const sortedLeaderboard = updatedLeaderboard.sort((a, b) => b.totalPoints - a.totalPoints)
      
      // Update ranks based on new positions
      const rankedLeaderboard = sortedLeaderboard.map((player, index) => ({
        ...player,
        rank: index + 1
      }))
      
      setDynamicLeaderboard(rankedLeaderboard)
    }
  }, [userREP, isAuthChecking])

  // Show loading while checking auth
  if (isAuthChecking) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-black cyber-grid hex-pattern flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bright-aqua mx-auto mb-4"></div>
              <p className="text-gray-400">Checking authentication...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }
  
  // Get user's actual rank based on dynamic leaderboard
  const currentUser = dynamicLeaderboard.find(player => player.isUser)
  const userRank = currentUser?.rank || 1
  const pointsToTop50 = userRank > 50 ? dynamicLeaderboard[49].totalPoints - userREP + 1 : 0
  
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return Crown
      case 2: return Medal
      case 3: return Award
      default: return Trophy
    }
  }
  
  const getRankColor = (rank) => {
    if (theme === "light") {
      switch (rank) {
        case 1: return "text-yellow-600"
        case 2: return "text-gray-600"
        case 3: return "text-orange-600"
        default: return "text-gray-700"
      }
    }
    switch (rank) {
      case 1: return "text-yellow-500"
      case 2: return "text-gray-400"
      case 3: return "text-orange-600"
      default: return "text-gray-600"
    }
  }
  
  const getRankBgColor = (rank) => {
    if (theme === "light") {
      switch (rank) {
        case 1: return "from-yellow-100 to-yellow-200"
        case 2: return "from-gray-100 to-gray-200"
        case 3: return "from-orange-100 to-orange-200"
        default: return "from-gray-50 to-gray-100"
      }
    }
    switch (rank) {
      case 1: return "from-yellow-500/20 to-yellow-600/20"
      case 2: return "from-gray-400/20 to-gray-500/20"
      case 3: return "from-orange-500/20 to-orange-600/20"
      default: return "from-gray-600/10 to-gray-700/10"
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        
        <div className="flex-1 overflow-y-auto">
          <div className={`min-h-full p-4 md:p-8 ${
            theme === "light" ? "bg-gray-50" : "bg-black cyber-grid hex-pattern"
          }`}>
            {/* Tutorial Button */}
            <TutorialButton pageId="leaderboard" />
            
            <div className="max-w-[1400px] mx-auto w-full">
              {/* Page Title */}
              <div className="text-center mb-8">
  <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 pb-2 ${
    theme === "light" 
      ? "from-gray-800 to-gray-600" 
      : "from-bright-aqua to-white drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
  }`}>
    Leaderboard
  </h1>
  <p className={`text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent ${
    theme === "light" 
      ? "from-gray-800 to-gray-600" 
      : "from-bright-aqua to-white drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
  }`}>
    See how you rank against other members of the IOPn community.
  </p>
</div>

              {/* User Stats - Enhanced Light Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
                <Card className={`${
                  theme === "light" 
                    ? "bg-gradient-to-br from-cyan-500 to-cyan-600 border-0 shadow-lg" 
                    : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${
                          theme === "light" ? "text-white" : "text-bright-aqua"
                        }`}>
                          Your Rank
                        </p>
                        <p className={`text-2xl font-bold ${
                          theme === "light" ? "text-white" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        }`}>
                          #{userRank}
                        </p>
                      </div>
                      <Trophy className={`w-8 h-8 ${
                        theme === "light" ? "text-white" : "text-bright-aqua drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                      }`} />
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${
                  theme === "light" 
                    ? "bg-gradient-to-br from-cyan-500 to-cyan-600 border-0 shadow-lg" 
                    : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${
                          theme === "light" ? "text-white" : "text-violet-indigo"
                        }`}>
                          Total REP
                        </p>
                        <p className={`text-2xl font-bold ${
                          theme === "light" ? "text-white" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        }`}>
                          {userREP.toLocaleString()}
                        </p>
                      </div>
                      <Star className={`w-8 h-8 ${
                        theme === "light" ? "text-white" : "text-violet-indigo drop-shadow-[0_0_10px_rgba(139,0,255,0.5)]"
                      }`} />
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${
                  theme === "light" 
                    ? "bg-gradient-to-br from-cyan-500 to-cyan-600 border-0 shadow-lg" 
                    : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${
                          theme === "light" ? "text-white" : "text-amber-rust"
                        }`}>
                          Weekly Points
                        </p>
                        <p className={`text-2xl font-bold ${
                          theme === "light" ? "text-white" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        }`}>
                          {currentUser?.weeklyPoints || 5}
                        </p>
                      </div>
                      <TrendingUp className={`w-8 h-8 ${
                        theme === "light" ? "text-white" : "text-amber-rust drop-shadow-[0_0_10px_rgba(255,140,0,0.5)]"
                      }`} />
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${
                  theme === "light" 
                    ? "bg-gradient-to-br from-cyan-500 to-cyan-600 border-0 shadow-lg" 
                    : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${
                          theme === "light" ? "text-white" : "text-crimson-red"
                        }`}>
                          To Top 50
                        </p>
                        <p className={`text-2xl font-bold ${
                          theme === "light" ? "text-white" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        }`}>
                          {pointsToTop50 > 0 ? `${pointsToTop50} REP` : "You're in!"}
                        </p>
                      </div>
                      <Users className={`w-8 h-8 ${
                        theme === "light" ? "text-white" : "text-crimson-red drop-shadow-[0_0_10px_rgba(220,20,60,0.5)]"
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top 3 Showcase - Enhanced Light Mode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {dynamicLeaderboard.slice(0, 3).map((player, index) => {
                  const Icon = getRankIcon(player.rank)
                  return (
                    <Card
                      key={player.id}
                      className={`relative overflow-hidden ${
                        theme === "light"
                          ? `${
                              player.rank === 1 ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300" :
                              player.rank === 2 ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300" :
                              "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300"
                            } shadow-xl`
                          : `holo-card neon-border ${
                              player.rank === 1 ? "ring-2 ring-yellow-500" :
                              player.rank === 2 ? "ring-2 ring-gray-400" :
                              "ring-2 ring-orange-600"
                            }`
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${getRankBgColor(player.rank)} ${
                        theme === "light" ? "opacity-30" : "opacity-50"
                      }`} />
                      <CardContent className="relative p-6 text-center">
                        <Icon className={`w-12 h-12 mx-auto mb-3 ${getRankColor(player.rank)}`} />
                        <h3 className={`font-bold text-xl mb-1 ${
                          theme === "light" ? "text-gray-800" : "text-white"
                        }`}>
                          {player.name}
                        </h3>
                        <p className={`text-3xl font-bold mb-2 ${
                          theme === "light" ? "text-cyan-600" : "text-bright-aqua"
                        }`}>
                          {player.totalPoints.toLocaleString()}
                        </p>
                        <p className={`text-sm mb-3 ${
                          theme === "light" ? "text-gray-600" : "text-gray-400"
                        }`}>
                          Total REP
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <Badge variant="secondary" className={
                            theme === "light" 
                              ? "bg-purple-100 text-purple-700 border-purple-300" 
                              : "bg-violet-indigo/20 text-violet-indigo"
                          }>
                            {player.badges} Badges
                          </Badge>
                          <Badge variant="secondary" className={
                            theme === "light" 
                              ? "bg-orange-100 text-orange-700 border-orange-300" 
                              : "bg-amber-rust/20 text-amber-rust"
                          }>
                            +{player.weeklyPoints} Weekly
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Full Leaderboard */}
              <Card className={`${
                theme === "light" 
                  ? "bg-white border-gray-200 shadow-xl" 
                  : "holo-card neon-border"
              }`}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className={theme === "light" ? "text-gray-800" : "text-white"}>
                        Rankings
                      </CardTitle>
                      <CardDescription className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                        Top players in the IOPn ecosystem
                      </CardDescription>
                    </div>
                    <Tabs value={timeFilter} onValueChange={setTimeFilter}>
                      <TabsList className={`${theme === "light" ? "bg-gray-100" : ""} w-full md:w-auto`}>
                        <TabsTrigger value="all" className="flex-1 md:flex-initial">All Time</TabsTrigger>
                        <TabsTrigger value="weekly" className="flex-1 md:flex-initial">This Week</TabsTrigger>
                        <TabsTrigger value="monthly" className="flex-1 md:flex-initial">This Month</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {/* Table Header - Hidden on mobile */}
                    <div className={`hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium ${
                      theme === "light" ? "text-gray-700" : "text-gray-400"
                    }`}>
                      <div className="col-span-1">Rank</div>
                      <div className="col-span-5">Player</div>
                      <div className="col-span-2 text-right">Total REP</div>
                      <div className="col-span-2 text-right">Weekly</div>
                      <div className="col-span-2 text-right">Badges</div>
                    </div>

                    {/* Mobile Table Header */}
                    <div className={`md:hidden grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium ${
                      theme === "light" ? "text-gray-700" : "text-gray-400"
                    }`}>
                      <div className="col-span-1">#</div>
                      <div className="col-span-7">Player</div>
                      <div className="col-span-4 text-right">REP</div>
                    </div>

                    {/* Top 50 Leaderboard Rows */}
                    {dynamicLeaderboard.slice(0, 50).map((player) => {
                      const Icon = getRankIcon(player.rank)
                      const isCurrentUser = player.isUser
                      
                      // Skip rendering user in top 50 if they'll be shown at bottom
                      if (isCurrentUser && userRank > 50) {
                        return null
                      }
                      
                      return (
                        <div
                          key={player.id}
                          className={`grid grid-cols-12 gap-2 md:gap-4 px-4 py-3 rounded-lg transition-all ${
                            isCurrentUser
                              ? theme === "light"
                                ? "bg-blue-50 border border-blue-200"
                                : "bg-violet-indigo/10 border border-violet-indigo/30"
                              : theme === "light"
                                ? "hover:bg-gray-50 border border-transparent hover:border-gray-200"
                                : "hover:bg-gray-900/50"
                          }`}
                        >
                          {/* Rank - Mobile & Desktop */}
                          <div className="col-span-1 flex items-center">
                            {player.rank <= 3 ? (
                              <Icon className={`w-4 h-4 md:w-5 md:h-5 ${getRankColor(player.rank)}`} />
                            ) : (
                              <span className={`text-sm md:text-base font-medium ${
                                theme === "light" ? "text-gray-700" : "text-gray-300"
                              }`}>
                                {player.rank}
                              </span>
                            )}
                          </div>
                          
                          {/* Player Name - Mobile: col-span-7, Desktop: col-span-5 */}
                          <div className="col-span-7 md:col-span-5 flex items-center gap-2 md:gap-3">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br ${
                              player.rank === 1 ? "from-yellow-400 to-yellow-600" :
                              player.rank === 2 ? "from-gray-300 to-gray-500" :
                              player.rank === 3 ? "from-orange-400 to-orange-600" :
                              theme === "light" ? "from-purple-400 to-purple-600" : "from-violet-indigo to-bright-aqua"
                            } flex items-center justify-center flex-shrink-0`}>
                              <span className="text-white font-semibold text-xs">
                                {player.name.charAt(0)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className={`font-medium ${theme === "light" ? "text-gray-800" : "text-white"} flex flex-col md:flex-row md:items-center md:gap-2`}>
                                <span className="truncate text-sm md:text-base">{player.name}</span>
                                {isCurrentUser && (
                                  <Badge variant="secondary" className={`text-xs mt-1 md:mt-0 w-fit ${
                                    theme === "light" 
                                      ? "bg-blue-100 text-blue-700 border-blue-300" 
                                      : ""
                                  }`}>
                                    You
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Total REP - Mobile: col-span-4, Desktop: col-span-2 */}
                          <div className="col-span-4 md:col-span-2 text-right">
                            <p className={`font-semibold text-sm md:text-base ${
                              theme === "light" ? "text-cyan-600" : "text-bright-aqua"
                            }`}>
                              {player.totalPoints.toLocaleString()}
                            </p>
                          </div>
                          
                          {/* Weekly Points - Hidden on mobile */}
                          <div className="hidden md:block md:col-span-2 text-right">
                            <p className={`font-medium ${
                              player.weeklyPoints > 0 
                                ? theme === "light" ? "text-green-600" : "text-green-500" 
                                : theme === "light" ? "text-gray-400" : "text-gray-500"
                            }`}>
                              {player.weeklyPoints > 0 ? `+${player.weeklyPoints}` : "-"}
                            </p>
                          </div>
                          
                          {/* Badges - Hidden on mobile */}
                          <div className="hidden md:block md:col-span-2 text-right">
                            <Badge variant="secondary" className={
                              theme === "light" 
                                ? "bg-purple-100 text-purple-700 border-purple-300" 
                                : "bg-violet-indigo/20 text-violet-indigo"
                            }>
                              {player.badges}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}

                    {/* If user is not in top 50, show their position */}
                    {userRank > 50 && currentUser && (
                      <>
                        {/* Separator */}
                        <div className="my-4 text-center">
                          <div className="flex items-center justify-center gap-4">
                            <div className={`h-px flex-1 ${
                              theme === "light" ? "bg-gray-300" : "bg-gray-700"
                            }`} />
                            <span className={theme === "light" ? "text-gray-500 text-sm" : "text-gray-500 text-sm"}>
                              • • •
                            </span>
                            <div className={`h-px flex-1 ${
                              theme === "light" ? "bg-gray-300" : "bg-gray-700"
                            }`} />
                          </div>
                        </div>

                        {/* User's Position - Mobile Responsive */}
                        <div
                          className={`grid grid-cols-12 gap-2 md:gap-4 px-4 py-3 rounded-lg transition-all ${
                            theme === "light"
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-violet-indigo/10 border border-violet-indigo/30"
                          }`}
                        >
                          <div className="col-span-1 flex items-center">
                            <span className={`text-sm md:text-base font-medium ${
                              theme === "light" ? "text-gray-700" : "text-gray-300"
                            }`}>
                              {userRank}
                            </span>
                          </div>
                          
                          <div className="col-span-7 md:col-span-5 flex items-center gap-2 md:gap-3">
                            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br ${
                              theme === "light" ? "from-purple-400 to-purple-600" : "from-violet-indigo to-bright-aqua"
                            } flex items-center justify-center flex-shrink-0`}>
                              <span className="text-white font-semibold text-xs">
                                {currentUser.name.charAt(0)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className={`font-medium ${theme === "light" ? "text-gray-800" : "text-white"} flex flex-col md:flex-row md:items-center md:gap-2`}>
                                <span className="truncate text-sm md:text-base">{currentUser.name}</span>
                                <Badge variant="secondary" className={`text-xs mt-1 md:mt-0 w-fit ${
                                  theme === "light" 
                                    ? "bg-blue-100 text-blue-700 border-blue-300" 
                                    : ""
                                }`}>
                                  You
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-span-4 md:col-span-2 text-right">
                            <p className={`font-semibold text-sm md:text-base ${
                              theme === "light" ? "text-cyan-600" : "text-bright-aqua"
                            }`}>
                              {currentUser.totalPoints.toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="hidden md:block md:col-span-2 text-right">
                            <p className={`font-medium ${
                              currentUser.weeklyPoints > 0 
                                ? theme === "light" ? "text-green-600" : "text-green-500" 
                                : theme === "light" ? "text-gray-400" : "text-gray-500"
                            }`}>
                              {currentUser.weeklyPoints > 0 ? `+${currentUser.weeklyPoints}` : "-"}
                            </p>
                          </div>
                          
                          <div className="hidden md:block md:col-span-2 text-right">
                            <Badge variant="secondary" className={
                              theme === "light" 
                                ? "bg-purple-100 text-purple-700 border-purple-300" 
                                : "bg-violet-indigo/20 text-violet-indigo"
                            }>
                              {currentUser.badges}
                            </Badge>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        {/* Tutorial Button */}
        <TutorialButton pageId="leaderboard" />

        {/* Tutorial Popup */}
        <TutorialPopup />
      </SidebarInset>
    </SidebarProvider>
  )
}