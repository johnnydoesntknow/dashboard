"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, Gift, Target, ExternalLink, Heart, MessageCircle, Repeat2, MoreVertical, Menu } from "lucide-react"
import Link from "next/link"
import { useWallet } from "@/hooks/use-wallet"
import { useDiscord } from "@/hooks/use-discord"
import { useNFT } from "@/hooks/use-nft"
import { useTutorial } from "@/hooks/use-tutorial"
import { useAchievement } from "@/hooks/use-achievement"
import { ParticleSystem } from "@/components/particle-system"
import { DiscordConnection } from "@/components/discord-connection"
import { TutorialPopup } from "@/components/tutorial-popup"
import { TutorialButton } from "@/components/tutorial-button"
import { repThresholds } from "@/lib/mock-data"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useBadgeMarketplace } from "@/hooks/use-badge-marketplace"
import { Progress } from "@/components/ui/progress"
import { AppHeader } from "@/components/app-header"
import { CustomConnectButton } from "@/components/custom-connect-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Dashboard() {
  const { walletAddress, isConnected, disconnectWallet } = useWallet()
  const { isDiscordConnected } = useDiscord()
  const { hasNFT } = useNFT()
  const { showTutorial } = useTutorial()
  const { triggerAchievement, currentAchievement, isTriggered } = useAchievement()
  const { theme } = useTheme()
  const router = useRouter()
  const { userREP } = useBadgeMarketplace()

  const [showFlashEvent, setShowFlashEvent] = useState(true)
  const [showDiscordConnection, setShowDiscordConnection] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Check user flow on component mount
  useEffect(() => {
  const discordSkipped = localStorage.getItem("iopn-discord-skipped")
  const savedNFT = localStorage.getItem("iopn-user-nft")

  if (isConnected && !isDiscordConnected && !discordSkipped) {
    // Show Discord connection only if not connected and not previously skipped
    setShowDiscordConnection(true)
  } else if (isConnected && (isDiscordConnected || discordSkipped) && !savedNFT) {
    // Redirect to mint page if Discord is connected/skipped but no NFT
    setIsTransitioning(true)
    setTimeout(() => {
      router.push("/nft-mint")
    }, 300)
  }
  // If user has everything set up, just let them use the dashboard
  // Tutorial will be shown automatically by the TutorialProvider if not viewed
}, [isConnected, isDiscordConnected, router, hasNFT])

const handleConnectDiscord = () => {
  setShowDiscordConnection(true)
}

const handleDiscordComplete = () => {
  setIsTransitioning(true)
  setShowDiscordConnection(false)
  // Always redirect to NFT mint after Discord connection
  setTimeout(() => {
    router.push("/nft-mint")
  }, 300)
}

  const handleDiscordSkip = () => {
    setIsTransitioning(true)
    setShowDiscordConnection(false)
    // This will be handled by the skipDiscord function in the DiscordConnection component
    if (!hasNFT) {
      setTimeout(() => {
        router.push("/nft-mint")
      }, 300)
    }
  }

  // Mock points distribution data
  const pointsDistribution = [
    { day: "Mon", gaming: 120, social: 80, referral: 50, missions: 100 },
    { day: "Tue", gaming: 200, social: 60, referral: 0, missions: 75 },
    { day: "Wed", gaming: 150, social: 100, referral: 100, missions: 125 },
    { day: "Thu", gaming: 180, social: 90, referral: 0, missions: 50 },
    { day: "Fri", gaming: 250, social: 120, referral: 150, missions: 200 },
    { day: "Sat", gaming: 300, social: 150, referral: 0, missions: 100 },
    { day: "Sun", gaming: 220, social: 110, referral: 50, missions: 150 },
  ]

  // Mock social tasks data
  const socialTasks = [
    {
      id: 1,
      platform: "Twitter",
      content:
        "🎉 IOPn community just hit 10,000 members! Thank you for being part of our amazing journey. What's your favorite feature so far? #IOPn #Community #Web3",
      likes: 234,
      retweets: 89,
      comments: 45,
      reward: 25,
      completed: false,
    },
    {
      id: 2,
      platform: "Twitter",
      content:
        "💎 New legendary badges are now available in the marketplace! Get yours before they're gone. What's your favorite badge so far? #IOPn #NFT",
      likes: 156,
      retweets: 67,
      comments: 32,
      reward: 25,
      completed: true,
    },
    {
      id: 3,
      platform: "Twitter",
      content:
        "🎯 Weekly mission reset is here! Complete your daily tasks to climb the leaderboard and earn exclusive rewards! #IOPn #Missions",
      likes: 189,
      retweets: 78,
      comments: 28,
      reward: 25,
      completed: false,
    },
  ]

  const handleSocialTaskComplete = (taskId, reward) => {
    // Note: This would need to be handled by the badge marketplace hook
    // For now, just trigger the achievement
    triggerAchievement({
      id: `social_${taskId}`,
      title: `+${reward} REP Earned!`,
      description: "Social media task completed",
      type: "reward",
    })
  }

  const handleQuickAction = (actionType) => {
    // Trigger different particle effects based on action
    const achievements = {
      mint: {
        id: "mint_nft",
        title: "NFT Mint Started!",
        description: "Create your unique Origin NFT",
        type: "achievement",
      },
      missions: {
        id: "view_missions",
        title: "Mission Console Accessed!",
        description: "Ready to earn REP points",
        type: "achievement",
      },
    }

    const achievement = achievements[actionType]
    if (achievement) {
      triggerAchievement(achievement)
    }
  }

  const handleRefresh = () => {
    disconnectWallet()
    // This will automatically redirect to connect wallet page since isConnected becomes false
  }

  // Get current REP tier benefits
  const getCurrentBenefits = (userREP) => {
    const benefits = []
    if (userREP >= repThresholds.rareBadgeAccess) benefits.push("Access to Rare badge marketplace")
    if (userREP >= repThresholds.doubleRepGaming) benefits.push("2x REP from gaming tournaments")
    if (userREP >= repThresholds.prioritySupport) benefits.push("Priority Discord support")
    if (userREP >= repThresholds.exclusiveEvents) benefits.push("Exclusive community events")
    if (userREP >= repThresholds.tripleRepGaming) benefits.push("3x REP from special tournaments")
    if (userREP >= repThresholds.marketplaceDiscount) benefits.push("10% marketplace discount")

    return benefits.length > 0 ? benefits : ["Basic marketplace access", "Standard REP earning", "Community access"]
  }

  // Helper function to get rank color classes
  const getRankColorClasses = (rank, color) => {
    switch (rank) {
      case 1:
        return "bg-amber-rust text-white"
      case 2:
        return "bg-violet-indigo text-white"
      case 3:
        return "bg-bright-aqua text-white"
      case 4:
        return "bg-crimson-red text-white"
      default:
        return "bg-gray-600 text-gray-200"
    }
  }

  // Helper function to get badge color classes
  const getBadgeColorClasses = (color) => {
    switch (color) {
      case "violet-indigo":
        return "bg-violet-indigo/20 text-violet-indigo border-violet-indigo/50"
      default:
        return "bg-gray-800 text-gray-200 border-gray-600"
    }
  }

  if (!isConnected) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-black cyber-grid hex-pattern flex items-center justify-center p-4 transition-all duration-300">
            <div className="text-center space-y-6 max-w-md w-full">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-indigo to-bright-aqua bg-clip-text text-transparent">
                  Welcome to IOPn
                </h1>
                <p className="text-gray-400 text-base sm:text-lg">Please connect your wallet to access the dashboard</p>
              </div>

              <div className="space-y-4">
                
{/* In the connection section, update the button: */}
<CustomConnectButton className="w-full" size="lg" />

                <p className="text-xs sm:text-sm text-gray-500">
                  Connect your Web3 wallet to start earning REP points and accessing exclusive features
                </p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const nextMilestone = Object.values(repThresholds).find((threshold) => threshold > userREP) || userREP + 1000
  const currentProgress = (userREP / nextMilestone) * 100

  // Show Discord connection within sidebar structure if needed
  if (showDiscordConnection) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DiscordConnection onComplete={handleDiscordComplete} onSkip={handleDiscordSkip} />
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Show transitioning state to prevent flash
  if (isTransitioning) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="min-h-screen bg-black cyber-grid hex-pattern flex items-center justify-center p-4 transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bright-aqua mx-auto"></div>
              <p className="text-gray-400">Loading...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen flex flex-col">
          {/* Add AppHeader here */}
          <AppHeader />
          
          {/* Particle System */}
          <ParticleSystem
            trigger={isTriggered}
            type={currentAchievement?.type || "achievement"}
            position={currentAchievement?.position}
          />

          {/* Tutorial Popup */}
          <TutorialPopup />

          {/* Tutorial Help Button */}
          <TutorialButton pageId="dashboard" />

          {/* Main Content - Scrollable */}
          <main className={`flex-1 overflow-y-auto p-4 md:p-8 bg-black cyber-grid hex-pattern`}>
            {/* Page Title Header */}
          <div className="text-center mb-8">
  <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 pb-2 ${
    theme === "light" 
      ? "from-gray-800 to-gray-600" 
      : "from-bright-aqua to-white drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
  }`}>
    Your Dashboard
  </h1>
  <p className={`text-lg font-medium ${
    theme === "light" ? "text-gray-600" : "text-bright-aqua"
  }`}>
    Your journey in the IOPn ecosystem continues. Check out your latest achievements and opportunities.
  </p>
</div>

            <div className="max-w-[1400px] mx-auto w-full">
             {/* Stats Overview - 3 CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
                <Card
                  className={`transition-all duration-300 ${
                    theme === "light" 
                      ? "bg-gradient-to-br from-blue-500 to-cyan-600 border-0 shadow-lg" 
                      : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-xs sm:text-sm font-medium ${
                      theme === "light" ? "text-white" : "text-gray-400"
                    }`}>
                      Total REP Points
                    </CardTitle>
                    <Star className={`h-4 w-4 ${
                      theme === "light" ? "text-white" : "text-bright-aqua"
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl sm:text-2xl font-bold ${
                      theme === "light" ? "text-white" : "text-bright-aqua"
                    }`}>
                      {userREP?.toLocaleString()}
                    </div>
                    <p className={`text-xs ${
                      theme === "light" ? "text-white/80" : "text-gray-400"
                    }`}>+0 from yesterday</p>
                  </CardContent>
                </Card>

                <Card
                  className={`transition-all duration-300 ${
                    theme === "light" 
                      ? "bg-gradient-to-br from-orange-500 to-amber-600 border-0 shadow-lg" 
                      : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-xs sm:text-sm font-medium ${
                      theme === "light" ? "text-white" : "text-gray-400"
                    }`}>
                      Badges Earned
                    </CardTitle>
                    <Gift className={`h-4 w-4 ${
                      theme === "light" ? "text-white" : "text-amber-rust"
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl sm:text-2xl font-bold ${
                      theme === "light" ? "text-white" : "text-amber-rust"
                    }`}>
                      12
                    </div>
                    <p className={`text-xs ${
                      theme === "light" ? "text-white/80" : "text-gray-400"
                    }`}>3 new this week</p>
                  </CardContent>
                </Card>

                <Card
                  className={`transition-all duration-300 ${
                    theme === "light" 
                      ? "bg-gradient-to-br from-red-500 to-pink-600 border-0 shadow-lg" 
                      : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-xs sm:text-sm font-medium ${
                      theme === "light" ? "text-white" : "text-gray-400"
                    }`}>
                      Referrals
                    </CardTitle>
                    <Users className={`h-4 w-4 ${
                      theme === "light" ? "text-white" : "text-crimson-red"
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl sm:text-2xl font-bold ${
                      theme === "light" ? "text-white" : "text-crimson-red"
                    }`}>8</div>
                    <p className={`text-xs ${
                      theme === "light" ? "text-white/80" : "text-gray-400"
                    }`}>2 pending rewards</p>
                  </CardContent>
                </Card>
              </div>

              {/* Points Distribution Chart */}
              <Card
                className={`mb-8 transition-all duration-300 ${theme === "light" ? "bg-white border-gray-200 shadow-lg" : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"}`}
              >
                <CardHeader>
                  <CardTitle
                    className={`${theme === "light" ? "text-gray-800" : "text-white"} flex items-center space-x-2`}
                  >
                    <Target className={`w-5 h-5 ${theme === "light" ? "text-purple-600" : "text-violet-indigo"}`} />
                    <span>REP Points Distribution (Last 7 Days)</span>
                  </CardTitle>
                  <CardDescription className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    Track how you earned your REP points across different activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto pb-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 lg:gap-4 min-w-[600px]">
                      {pointsDistribution.map((day, index) => {
                        const total = day.gaming + day.social + day.referral + day.missions
                        const gamingPercent = (day.gaming / total) * 100
                        const socialPercent = (day.social / total) * 100
                        const referralPercent = (day.referral / total) * 100
                        const missionsPercent = (day.missions / total) * 100

                        return (
                          <div key={day.day} className="relative group min-w-[80px]">
                            <div className="hover:scale-105 transition-all duration-300">
                              {/* Circular Progress Ring */}
                              <div className="relative w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-3">
                                <svg className="w-16 h-16 lg:w-20 lg:h-20 transform -rotate-90" viewBox="0 0 80 80">
                                  {/* Background circle */}
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    stroke="currentColor"
                                    strokeWidth="6"
                                    fill="none"
                                    className="text-gray-100"
                                  />

                                  {/* Gaming segment */}
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    stroke="#7D40B6"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={`${(gamingPercent / 100) * 201.06} 201.06`}
                                    strokeDashoffset="0"
                                    className="transition-all duration-500"
                                  />

                                  {/* Social segment */}
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    stroke="#15BFC2"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={`${(socialPercent / 100) * 201.06} 201.06`}
                                    strokeDashoffset={`-${(gamingPercent / 100) * 201.06}`}
                                    className="transition-all duration-500"
                                  />

                                  {/* Referral segment */}
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    stroke="#CB121C"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={`${(referralPercent / 100) * 201.06} 201.06`}
                                    strokeDashoffset={`-${((gamingPercent + socialPercent) / 100) * 201.06}`}
                                    className="transition-all duration-500"
                                  />

                                  {/* Missions segment */}
                                  <circle
                                    cx="40"
                                    cy="40"
                                    r="32"
                                    stroke="#CA6B0D"
                                    strokeWidth="6"
                                    fill="none"
                                    strokeDasharray={`${(missionsPercent / 100) * 201.06} 201.06`}
                                    strokeDashoffset={`-${((gamingPercent + socialPercent + referralPercent) / 100) * 201.06}`}
                                    className="transition-all duration-500"
                                  />
                                </svg>

                                {/* Center content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-sm lg:text-lg font-bold text-violet-indigo">{total}</span>
                                  <span className="text-xs text-gray-500">REP</span>
                                </div>
                              </div>

                              {/* Day label */}
                              <div className="text-center">
                                <h3 className="font-semibold text-white text-xs lg:text-sm">{day.day}</h3>
                                <div className="mt-1 lg:mt-2 space-y-1 text-xs">
                                  {day.gaming > 0 && (
                                    <div className="flex items-center justify-center space-x-1">
                                      <div className="w-2 h-2 bg-violet-indigo rounded-full"></div>
                                      <span className="text-xs text-gray-400">{day.gaming}</span>
                                    </div>
                                  )}
                                  {day.social > 0 && (
                                    <div className="flex items-center justify-center space-x-1">
                                      <div className="w-2 h-2 bg-bright-aqua rounded-full"></div>
                                      <span className="text-xs text-gray-400">{day.social}</span>
                                    </div>
                                  )}
                                  {day.referral > 0 && (
                                    <div className="flex items-center justify-center space-x-1">
                                      <div className="w-2 h-2 bg-crimson-red rounded-full"></div>
                                      <span className="text-xs text-gray-400">{day.referral}</span>
                                    </div>
                                  )}
                                  {day.missions > 0 && (
                                    <div className="flex items-center justify-center space-x-1">
                                      <div className="w-2 h-2 bg-amber-rust rounded-full"></div>
                                      <span className="text-xs text-gray-400">{day.missions}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Hover tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                              <div className="bg-black text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                                <div className="space-y-1">
                                  <div>Gaming: {day.gaming} REP</div>
                                  <div>Social: {day.social} REP</div>
                                  <div>Referral: {day.referral} REP</div>
                                  <div>Missions: {day.missions} REP</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-6 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-violet-indigo rounded-full"></div>
                      <span className="text-xs sm:text-sm text-gray-400">Gaming</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-bright-aqua rounded-full"></div>
                      <span className="text-xs sm:text-sm text-gray-400">Social</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-crimson-red rounded-full"></div>
                      <span className="text-xs sm:text-sm text-gray-400">Referral</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-amber-rust rounded-full"></div>
                      <span className="text-xs sm:text-sm text-gray-400">Missions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Tasks Section */}
              <Card
                className={`mb-8 transition-all duration-300 ${theme === "light" ? "bg-white border-gray-200 shadow-lg" : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"}`}
              >
                <CardHeader>
                  <CardTitle
                    className={`${theme === "light" ? "text-gray-800" : "text-white"} flex items-center space-x-2`}
                  >
                    <MessageCircle className={`w-5 h-5 ${theme === "light" ? "text-blue-500" : "text-bright-aqua"}`} />
                    <span>Social Media Tasks</span>
                  </CardTitle>
                  <CardDescription className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    Engage with our latest posts to earn REP rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {socialTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          task.completed
                            ? theme === "light"
                              ? "bg-green-50 border-green-200"
                              : "bg-gradient-to-r from-green-900/30 to-green-800/20 border-green-500/30"
                            : theme === "light"
                              ? "bg-white border-gray-200 hover:border-gray-300"
                              : "bg-gradient-to-r from-black/60 to-midnight-indigo/40 border-bright-aqua/30 hover:border-bright-aqua/50 holo-card"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                theme === "light" ? "bg-blue-500" : "bg-bright-aqua"
                              }`}
                            >
                              <span className="text-white text-xs font-bold">X</span>
                            </div>
                            <span className={`font-medium text-xs sm:text-sm ${theme === "light" ? "text-blue-600" : "text-bright-aqua"}`}>
                              X
                            </span>
                            <Badge className={`${task.completed ? "bg-green-500 text-white" : "bg-amber-rust text-white"} text-xs`}>
                              {task.completed ? "Completed" : `+${task.reward} REP`}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`${
                              theme === "light"
                                ? "border-blue-300 text-blue-600 hover:bg-blue-50 bg-white"
                                : "cyber-button pulse-glow border-bright-aqua text-bright-aqua hover:bg-bright-aqua/10 bg-transparent"
                            }`}
                            onClick={() => {
                              if (task.completed) {
                                router.push("/marketplace")
                              } else {
                                handleSocialTaskComplete(task.id, task.reward)
                              }
                            }}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {task.completed ? "View Marketplace" : "Complete"}
                          </Button>
                        </div>
                        <p className={`text-xs sm:text-sm font-medium mb-3 ${theme === "light" ? "text-gray-800" : "text-white"}`}>
                          {task.content}
                        </p>
                        <div
                          className={`flex items-center space-x-4 text-xs ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}
                        >
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{task.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Repeat2 className="w-3 h-3" />
                            <span>{task.retweets}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{task.comments}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity and Quick Actions - Side by Side */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8">
                {/* Recent Activity */}
                <Card
                  className={`transition-all duration-300 ${theme === "light" ? "bg-white border-gray-200 shadow-lg" : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"}`}
                >
                  <CardHeader>
                    <CardTitle className={`${theme === "light" ? "text-gray-800" : "text-white"}`}>
                      Recent Activity
                    </CardTitle>
                    <CardDescription className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                      Your latest achievements and interactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        action: "Completed Discord Quest",
                        points: "+50 REP",
                        time: "2 hours ago",
                        type: "quest",
                        color: "bright-aqua",
                      },
                      {
                        action: "Referred new member",
                        points: "+100 REP",
                        time: "1 day ago",
                        type: "referral",
                        color: "crimson-red",
                      },
                      {
                        action: "Completed Weekly Challenge",
                        points: "+200 REP",
                        time: "2 days ago",
                        type: "challenge",
                        color: "violet-indigo",
                      },
                      {
                        action: "Purchased Epic Badge",
                        points: "-150 REP",
                        time: "3 days ago",
                        type: "purchase",
                        color: "amber-rust",
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 sm:p-3 rounded-lg shadow-sm transition-all duration-300 ${
                          theme === "light"
                            ? "bg-white border border-gray-200 hover:border-gray-300"
                            : "data-stream bg-gradient-to-r from-black/60 to-midnight-indigo/40 border border-bright-aqua/20 holo-card"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className={`font-medium text-sm truncate ${theme === "light" ? "text-gray-800" : "text-white"}`}>
                            {activity.action}
                          </p>
                          <p className={`text-xs ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                            {activity.time}
                          </p>
                        </div>
                        <Badge
                          variant={activity.points.startsWith("+") ? "default" : "secondary"}
                          className={
                            activity.points.startsWith("+")
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-gray-800 text-gray-200 border-gray-600"
                          }
                        >
                          {activity.points}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card
                  className={`transition-all duration-300 ${theme === "light" ? "bg-white border-gray-200 shadow-lg" : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"}`}
                >
                  <CardHeader>
                    <CardTitle className={`${theme === "light" ? "text-gray-800" : "text-white"} font-bold`}>
                      Quick Actions
                    </CardTitle>
                    <CardDescription className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} font-medium`}>
                      Jump into your favorite activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link href="/nft-mint">
                      <Button className="cyber-button pulse-glow w-full justify-start bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white transition-all duration-300 text-sm">
                        <span className="mr-2">🖼️</span>
                        Mint Your Origin NFT
                      </Button>
                    </Link>
                    <Link href="/missions">
                      <Button className="cyber-button pulse-glow w-full justify-start bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white transition-all duration-300 text-sm">
                        <span className="mr-2">🎯</span>
                        View Available Missions
                      </Button>
                    </Link>
                    <Link href="/marketplace">
                      <Button className="cyber-button pulse-glow w-full justify-start bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white transition-all duration-300 text-sm">
                        <span className="mr-2">🛒</span>
                        Browse Badge Marketplace
                      </Button>
                    </Link>
                    <Link href="/referrals">
                      <Button className="cyber-button pulse-glow w-full justify-start bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white transition-all duration-300 text-sm">
                        <span className="mr-2">👥</span>
                        Share Referral Code
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Top Contributors This Week */}
              <Card
                className={`transition-all duration-300 ${theme === "light" ? "bg-white border-gray-200 shadow-lg" : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"}`}
              >
                <CardHeader>
                  <CardTitle className={`${theme === "light" ? "text-gray-800" : "text-white"}`}>
                    Top Contributors This Week
                  </CardTitle>
                  <CardDescription className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    See how you stack up against other community members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { rank: 1, name: "Jimi", rep: userREP, color: "amber-rust", isYou: true },
                      { rank: 2, name: "CryptoNinja", rep: 2450, color: "violet-indigo" },
                      { rank: 3, name: "BlockchainBoss", rep: 2380, color: "bright-aqua" },
                      { rank: 4, name: "Web3Warrior", rep: 2250, color: "crimson-red" },
                      { rank: 5, name: "DefIDemon", rep: 1890, color: "gray" },
                    ].map((contributor, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 ${
                          theme === "light"
                            ? "bg-white border border-gray-200 hover:border-gray-300"
                            : "bg-black/40 border border-gray-800/50 hover:border-bright-aqua/30"
                        }`}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div
                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${getRankColorClasses(contributor.rank, contributor.color)}`}
                          >
                            {contributor.rank}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <p className={`font-medium text-sm sm:text-base truncate ${theme === "light" ? "text-gray-800" : "text-white"}`}>
                              {contributor.name}
                            </p>
                            {contributor.isYou && (
                              <Badge
                                className={`w-fit mt-1 text-xs ${
                                  theme === "light"
                                    ? "bg-blue-100 text-blue-700 border-blue-300"
                                    : "bg-violet-indigo/20 text-violet-indigo border-violet-indigo/50"
                                }`}
                              >
                                You
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-base sm:text-lg font-bold ${theme === "light" ? "text-gray-800" : "text-white"}`}>
                            {contributor.rep?.toLocaleString()}
                          </p>
                          <p
                            className={`text-xs uppercase tracking-wide ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}
                          >
                            REP
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link href="/leaderboard">
                      <Button
                        variant="outline"
                        className="w-full border-violet-indigo text-violet-indigo hover:bg-violet-indigo hover:text-white bg-transparent"
                      >
                        View Full Leaderboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        
      </SidebarInset>
    </SidebarProvider>
  )
}