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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useContracts } from '@/hooks/use-contracts'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"
import { BalanceDisplay } from "@/components/balance-display"
import { useBalance } from "@/hooks/use-balance"

export default function Dashboard() {
  const { walletAddress, isConnected, disconnectWallet, connectWallet } = useWallet()
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
  const { getUserREP } = useContracts()
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [convertAmount, setConvertAmount] = useState("")
  const [convertDirection, setConvertDirection] = useState("toOnChain")
  const [isConverting, setIsConverting] = useState(false)
  const [userBadgeCount, setUserBadgeCount] = useState(0)
  const [referralCount, setReferralCount] = useState(0)
  const [recentActivity, setRecentActivity] = useState([])
  const [topContributors, setTopContributors] = useState([])
  const [pointsDistribution, setPointsDistribution] = useState([])
  const { balance, addBalance, subtractBalance } = useBalance()
  const [onChainREP, setOnChainREP] = useState(0)

  useEffect(() => {
  const hasNFT = localStorage.getItem('iopn-has-nft') === 'true';
  
  if (!hasNFT) {
    router.push('/nft-mint');
    return;
  }
}, [router]);


  useEffect(() => {
    const fetchOnChainREP = async () => {
      if (walletAddress) {
        const repData = await getUserREP(walletAddress)
        setOnChainREP(repData?.currentRep || 0)
      }
    }
    fetchOnChainREP()
  }, [walletAddress, getUserREP])

  useEffect(() => {
    // Just use localStorage for now
    const savedBadges = localStorage.getItem("iopn_user_badges")
    if (savedBadges) {
      try {
        const badges = JSON.parse(savedBadges)
        setUserBadgeCount(badges.length)
      } catch {
        setUserBadgeCount(0)
      }
    }
  }, [])

  useEffect(() => {
    // Just use localStorage for now
    const savedReferrals = localStorage.getItem("iopn_referral_count")
    setReferralCount(parseInt(savedReferrals) || 0)
  }, [])

  useEffect(() => {
    // Initialize with mock data for now - remove "gaming" from distribution
    setPointsDistribution([
      { day: "Mon", social: 80, referral: 50, missions: 100 },
      { day: "Tue", social: 60, referral: 0, missions: 75 },
      { day: "Wed", social: 100, referral: 100, missions: 125 },
      { day: "Thu", social: 90, referral: 0, missions: 50 },
      { day: "Fri", social: 120, referral: 150, missions: 200 },
      { day: "Sat", social: 150, referral: 0, missions: 100 },
      { day: "Sun", social: 110, referral: 50, missions: 150 },
    ])
  }, [])

  useEffect(() => {
    const discordSkipped = localStorage.getItem("iopn-discord-skipped")
    const savedNFT = localStorage.getItem("iopn-user-nft")

    if (isConnected && !isDiscordConnected && !discordSkipped) {
      setShowDiscordConnection(true)
    } else if (isConnected && (isDiscordConnected || discordSkipped) && !savedNFT) {
      setIsTransitioning(true)
      setTimeout(() => {
        router.push("/nft-mint")
      }, 300)
    }
  }, [isConnected, isDiscordConnected, router, hasNFT])

  const handleConnectDiscord = () => {
    setShowDiscordConnection(true)
  }

  const handleDiscordComplete = () => {
    setIsTransitioning(true)
    setShowDiscordConnection(false)
    setTimeout(() => {
      router.push("/nft-mint")
    }, 300)
  }

  const handleDiscordSkip = () => {
    setIsTransitioning(true)
    setShowDiscordConnection(false)
    if (!hasNFT) {
      setTimeout(() => {
        router.push("/nft-mint")
      }, 300)
    }
  }

  // Empty social tasks to show "no tasks" message
  const [socialTasks, setSocialTasks] = useState([])

  const handleSocialTaskComplete = (taskId, reward) => {
    triggerAchievement({
      id: `social_${taskId}`,
      title: `+${reward} REP Earned!`,
      description: "Social media task completed",
      type: "reward",
    })
  }

  const handleQuickAction = (actionType) => {
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
  }

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
          <div className="min-h-screen bg-black cyber-grid flex items-center justify-center p-4">
            <div className="max-w-lg w-full space-y-8">
              <div className="text-center">
                <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 pb-2 ${
                  theme === "light" 
                    ? "from-gray-800 to-gray-600" 
                    : "from-bright-aqua to-white drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                }`}>
                  Welcome to IOPn
                </h1>
                <p className={`text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent ${
                  theme === "light" 
                    ? "from-gray-800 to-gray-600" 
                    : "from-bright-aqua to-white drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                }`}>
                  Please connect your wallet to access the dashboard
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={connectWallet}
                  className="w-full bg-gradient-to-r from-bright-aqua to-blue-500 hover:from-bright-aqua/90 hover:to-blue-500/90"
                  size="lg"
                >
                  Connect Wallet
                </Button>
                
                <p className={`text-xs sm:text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent ${
                  theme === "light" 
                    ? "from-gray-600 to-gray-500" 
                    : "from-bright-aqua/90 to-white/70 drop-shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                }`}>
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
          <AppHeader />
          
          <ParticleSystem
            trigger={isTriggered}
            type={currentAchievement?.type || "achievement"}
            position={currentAchievement?.position}
          />

          <TutorialPopup />
          <TutorialButton pageId="dashboard" />

          <main className={`flex-1 overflow-y-auto p-4 md:p-8 bg-black cyber-grid hex-pattern`}>
            <div className="text-center mb-8">
              <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 pb-2 ${
                theme === "light" 
                  ? "from-gray-800 to-gray-600" 
                  : "from-bright-aqua to-white drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
              }`}>
                Your Dashboard
              </h1>
              <p className={`text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent ${
                theme === "light" 
                  ? "from-gray-800 to-gray-600" 
                  : "from-bright-aqua to-white drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
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
                      ? "bg-blue-50 border-gray-200 shadow-sm" 
                      : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-xs sm:text-sm font-medium ${
                      theme === "light" ? "text-black" : "text-gray-400"
                    }`}>
                      Total REP Points
                    </CardTitle>
                    <Star className={`h-4 w-4 ${
                      theme === "light" ? "text-blue-500" : "text-bright-aqua"
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <p className={`text-xs ${
                          theme === "light" ? "text-gray-600" : "text-gray-500"
                        }`}>
                          Off-chain
                        </p>
                        <div className={`text-lg sm:text-xl font-bold ${
                          theme === "light" ? "text-black" : "text-bright-aqua"
                        }`}>
                          {userREP?.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <p className={`text-xs ${
                          theme === "light" ? "text-gray-600" : "text-gray-500"
                        }`}>
                          On-chain
                        </p>
                        <div className={`text-lg sm:text-xl font-bold ${
                          theme === "light" ? "text-black" : "text-violet-indigo"
                        }`}>
                          {onChainREP?.toLocaleString()}
                        </div>
                        
                      </div>
                      
                      <Button
                        onClick={() => setShowConvertModal(true)}
                        size="sm"
                        className="w-full mt-2 bg-gradient-to-r from-bright-aqua to-violet-indigo hover:from-bright-aqua/90 hover:to-violet-indigo/90 text-white"
                      >
                        Convert REP
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                    <BalanceDisplay compact={false} showActions={true} />
  
                <Card
                  className={`transition-all duration-300 ${
                    theme === "light" 
                      ? "bg-orange-50 border-gray-200 shadow-sm" 
                      : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-xs sm:text-sm font-medium ${
                      theme === "light" ? "text-black" : "text-gray-400"
                    }`}>
                      Badges Earned
                    </CardTitle>
                    <Gift className={`h-4 w-4 ${
                      theme === "light" ? "text-orange-500" : "text-amber-rust"
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl sm:text-2xl font-bold ${
                      theme === "light" ? "text-black" : "text-amber-rust"
                    }`}>
                      {userBadgeCount}
                    </div>
                    <p className={`text-xs ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}>
                      Total badges
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`transition-all duration-300 ${
                    theme === "light" 
                      ? "bg-pink-50 border-gray-200 shadow-sm" 
                      : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                  }`}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-xs sm:text-sm font-medium ${
                      theme === "light" ? "text-black" : "text-gray-400"
                    }`}>
                      Referrals
                    </CardTitle>
                    <Users className={`h-4 w-4 ${
                      theme === "light" ? "text-pink-500" : "text-crimson-red"
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl sm:text-2xl font-bold ${
                      theme === "light" ? "text-black" : "text-crimson-red"
                    }`}>
                      {referralCount}
                    </div>
                    <p className={`text-xs ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}>
                      Total referrals
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Points Distribution Chart - Updated without gaming */}
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
                  {pointsDistribution.length === 0 ? (
                    <div className="text-center p-8">
                      <p className={`text-gray-500 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                        No activity data available
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto pb-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 lg:gap-4 min-w-[600px]">
                          {pointsDistribution.map((day, index) => {
                            const total = day.social + day.referral + day.missions
                            const socialPercent = total > 0 ? (day.social / total) * 100 : 0
                            const referralPercent = total > 0 ? (day.referral / total) * 100 : 0
                            const missionsPercent = total > 0 ? (day.missions / total) * 100 : 0

                            return (
                              <div key={day.day} className="relative group min-w-[80px]">
                                <div className="hover:scale-105 transition-all duration-300">
                                  <div className="relative w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-3">
                                    <svg className="w-16 h-16 lg:w-20 lg:h-20 transform -rotate-90" viewBox="0 0 80 80">
                                      <circle
                                        cx="40"
                                        cy="40"
                                        r="32"
                                        stroke="currentColor"
                                        strokeWidth="6"
                                        fill="none"
                                        className="text-gray-100"
                                      />

                                      <circle
                                        cx="40"
                                        cy="40"
                                        r="32"
                                        stroke="#15BFC2"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeDasharray={`${(socialPercent / 100) * 201.06} 201.06`}
                                        strokeDashoffset="0"
                                        className="transition-all duration-500"
                                      />

                                      <circle
                                        cx="40"
                                        cy="40"
                                        r="32"
                                        stroke="#CB121C"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeDasharray={`${(referralPercent / 100) * 201.06} 201.06`}
                                        strokeDashoffset={`-${(socialPercent / 100) * 201.06}`}
                                        className="transition-all duration-500"
                                      />

                                      <circle
                                        cx="40"
                                        cy="40"
                                        r="32"
                                        stroke="#CA6B0D"
                                        strokeWidth="6"
                                        fill="none"
                                        strokeDasharray={`${(missionsPercent / 100) * 201.06} 201.06`}
                                        strokeDashoffset={`-${((socialPercent + referralPercent) / 100) * 201.06}`}
                                        className="transition-all duration-500"
                                      />
                                    </svg>

                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                      <span className="text-sm lg:text-lg font-bold text-violet-indigo">{total}</span>
                                      <span className="text-xs text-gray-500">REP</span>
                                    </div>
                                  </div>

                                  <div className="text-center">
                                    <h3 className="font-semibold text-white text-xs lg:text-sm">{day.day}</h3>
                                    <div className="mt-1 lg:mt-2 space-y-1 text-xs">
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

                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                  <div className="bg-black text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                                    <div className="space-y-1">
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

                      <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-6 pt-4 border-t">
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
                    </>
                  )}
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
                    <span>On-Chain Tasks</span>
                  </CardTitle>
                  <CardDescription className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    Engage with our latest posts to earn REP rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {socialTasks.length === 0 ? (
                      <div className="text-center p-8">
                        <p className={`text-gray-500 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                          No tasks available at this moment
                        </p>
                      </div>
                    ) : (
                      socialTasks.map((task) => (
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
                                  : ""
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
                      ))
                    )}
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
                    {recentActivity.length === 0 ? (
                      <div className="text-center p-4">
                        <p className={`text-gray-500 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                          No recent activity
                        </p>
                      </div>
                    ) : (
                      recentActivity.map((activity, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 sm:p-3 rounded-lg shadow-sm transition-all duration-300 ${
                            theme === "light"
                              ? "bg-white border border-gray-200 hover:border-gray-300"
                              : "bg-black/40 border border-bright-aqua/20 holo-card"
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
                      ))
                    )}
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
                    <Link href="/nft-showcase" className="block">
                      <Button className={`w-full justify-start transition-all duration-300 text-sm py-6 ${
                        theme === "light"
                          ? "bg-blue-50 hover:bg-blue-100 text-black border border-gray-200 shadow-sm"
                          : "bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white"
                      }`}>
                        <span className="mr-2">✨</span>
                        View Your NFT Showcase
                      </Button>
                    </Link>
                    
                    <Link href="/missions" className="block">
                      <Button className={`w-full justify-start transition-all duration-300 text-sm py-6 ${
                        theme === "light"
                          ? "bg-purple-50 hover:bg-purple-100 text-black border border-gray-200 shadow-sm"
                          : "bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white"
                      }`}>
                        <span className="mr-2">🎯</span>
                        View Available Missions
                      </Button>
                    </Link>
                    
                    <Link href="/marketplace" className="block">
                      <Button className={`w-full justify-start transition-all duration-300 text-sm py-6 ${
                        theme === "light"
                          ? "bg-cyan-50 hover:bg-cyan-100 text-black border border-gray-200 shadow-sm"
                          : "bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white"
                      }`}>
                        <span className="mr-2">🛒</span>
                        Browse Badge Marketplace
                      </Button>
                    </Link>
                    
                    <Link href="/referrals" className="block">
                      <Button className={`w-full justify-start transition-all duration-300 text-sm py-6 ${
                        theme === "light"
                          ? "bg-pink-50 hover:bg-pink-100 text-black border border-gray-200 shadow-sm"
                          : "bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white"
                      }`}>
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
                    {topContributors.length === 0 ? (
                      <div className="text-center p-4">
                        <p className={`text-gray-500 ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                          Leaderboard data unavailable
                        </p>
                      </div>
                    ) : (
                      topContributors.map((contributor, index) => (
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
                      ))
                    )}
                  </div>
                  {topContributors.length > 0 && (
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
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarInset>
      
      {/* Conversion Modal - unchanged */}
      {showConvertModal && (
        <Dialog open={showConvertModal} onOpenChange={setShowConvertModal}>
          <DialogContent className={`${
            theme === "light" 
              ? "bg-white border-gray-200" 
              : "bg-black/95 border-bright-aqua/30"
          }`}>
            <DialogHeader>
              <DialogTitle className={`text-xl ${
                theme === "light" ? "text-gray-800" : "text-white"
              }`}>
                Convert REP
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={convertDirection === "toOnChain" ? "default" : "outline"}
                  onClick={() => setConvertDirection("toOnChain")}
                  className={convertDirection === "toOnChain" 
                    ? "bg-violet-indigo text-white" 
                    : theme === "light" 
                      ? "border-gray-300 text-gray-600"
                      : "border-gray-600 text-gray-400"}
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  To On-chain
                </Button>
                <Button
                  variant={convertDirection === "toOffChain" ? "default" : "outline"}
                  onClick={() => setConvertDirection("toOffChain")}
                  className={convertDirection === "toOffChain" 
                    ? "bg-bright-aqua text-white" 
                    : theme === "light"
                      ? "border-gray-300 text-gray-600"
                      : "border-gray-600 text-gray-400"}
                >
                  <ArrowDown className="w-4 h-4 mr-2" />
                  To Off-chain
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className={`p-3 rounded-lg border ${
                  theme === "light" 
                    ? "bg-gray-50 border-gray-200" 
                    : "bg-black/50 border-gray-700"
                }`}>
                  <p className={`text-sm mb-1 ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}>
                    From
                  </p>
                  <p className={`text-lg font-bold ${
                    theme === "light" ? "text-gray-800" : "text-white"
                  }`}>
                    {convertDirection === "toOnChain" 
                      ? `${userREP?.toLocaleString()} Off-chain REP`
                      : `${onChainREP?.toLocaleString()} On-chain REP`}
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <ArrowDown className={`w-6 h-6 ${
                    theme === "light" ? "text-gray-400" : "text-gray-500"
                  }`} />
                </div>
                
                <div className={`p-3 rounded-lg border ${
                  theme === "light" 
                    ? "bg-gray-50 border-gray-200" 
                    : "bg-black/50 border-gray-700"
                }`}>
                  <p className={`text-sm mb-1 ${
                    theme === "light" ? "text-gray-600" : "text-gray-400"
                  }`}>
                    To
                  </p>
                  <p className={`text-lg font-bold ${
                    theme === "light" ? "text-gray-800" : "text-white"
                  }`}>
                    {convertDirection === "toOnChain" 
                      ? "On-chain REP"
                      : "Off-chain REP"}
                  </p>
                </div>
              </div>
              
              <div>
                <label className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-gray-400"
                }`}>
                  Amount to Convert
                </label>
                <input
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value)}
                  max={convertDirection === "toOnChain" ? userREP : onChainREP}
                  className={`w-full mt-1 px-4 py-2 rounded-lg border ${
                    theme === "light" 
                      ? "bg-white border-gray-300 text-gray-800" 
                      : "bg-black/50 border-gray-600 text-white"
                  }`}
                  placeholder="Enter amount"
                />
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs ${
                    theme === "light" ? "text-gray-500" : "text-gray-500"
                  }`}>
                    Maximum: {convertDirection === "toOnChain" 
                      ? userREP?.toLocaleString()
                      : onChainREP?.toLocaleString()} REP
                  </p>
                  <Button
                    onClick={() => {
                      const maxAmount = convertDirection === "toOnChain" ? userREP : onChainREP
                      setConvertAmount(maxAmount.toString())
                    }}
                    size="sm"
                    variant="ghost"
                    className={`text-xs px-2 py-1 h-6 ${
                      theme === "light" 
                        ? "text-blue-600 hover:bg-blue-50" 
                        : "text-bright-aqua hover:bg-bright-aqua/10"
                    }`}
                  >
                    Max
                  </Button>
                </div>
              </div>
              
              <div className={`p-3 rounded-lg border ${
                theme === "light" 
                  ? "bg-yellow-50 border-yellow-200" 
                  : "bg-amber-rust/10 border-amber-rust/30"
              }`}>
                <p className={`text-sm ${
                  theme === "light" ? "text-yellow-700" : "text-amber-rust"
                }`}>
                  {convertDirection === "toOnChain" 
                    ? "⚠️ Converting to on-chain requires gas fees"
                    : "✓ Converting to off-chain is instant and free"}
                </p>
              </div>
              
              <Button
                onClick={async () => {
                  if (!convertAmount || convertAmount <= 0) return
                  
                  setIsConverting(true)
                  try {
                    const response = await fetch('http://localhost:3001/api/rep/convert', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        user: walletAddress,
                        amount: parseInt(convertAmount),
                        toOnChain: convertDirection === "toOnChain"
                      })
                    })
                    
                    if (response.ok) {
                      toast.success(`Successfully converted ${convertAmount} REP`)
                      
                      if (convertDirection === "toOnChain") {
                        // Update local state after successful conversion
                        const amount = parseInt(convertAmount)
                        setUserREP(prev => prev - amount)
                        setOnChainREP(prev => prev + amount)
                      } else {
                        const amount = parseInt(convertAmount)
                        setOnChainREP(prev => prev - amount)
                        setUserREP(prev => prev + amount)
                      }
                      
                      setShowConvertModal(false)
                      setConvertAmount("")
                    }
                  } catch (error) {
                    toast.error('Conversion failed')
                  } finally {
                    setIsConverting(false)
                  }
                }}
                disabled={
                  isConverting || 
                  !convertAmount || 
                  parseInt(convertAmount) <= 0 ||
                  parseInt(convertAmount) > (convertDirection === "toOnChain" ? userREP : onChainREP)
                }
                className="w-full bg-gradient-to-r from-bright-aqua to-violet-indigo hover:from-bright-aqua/90 hover:to-violet-indigo/90 text-white"
              >
                {isConverting ? "Converting..." : `Convert ${convertAmount || 0} REP`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </SidebarProvider>
  )
}