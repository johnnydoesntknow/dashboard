"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Target, Users, Trophy, Zap, CheckCircle, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { useBadgeMarketplace } from "@/hooks/use-badge-marketplace"
import { useAchievement } from "@/hooks/use-achievement"
import { AppHeader } from "@/components/app-header"
import { useWallet } from "@/hooks/use-wallet"
import { useDiscord } from "@/hooks/use-discord"
import { TutorialButton } from "@/components/tutorial-button"
import { TutorialPopup } from "@/components/tutorial-popup"
import { toast } from "sonner"

export default function MissionsPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { isConnected, walletAddress } = useWallet()
  const { isDiscordConnected } = useDiscord()
  const { earnREP } = useBadgeMarketplace()
  const { triggerAchievement } = useAchievement()
  const [missions, setMissions] = useState([])
  const [filter, setFilter] = useState("all")
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [missionsLoading, setMissionsLoading] = useState(true)
  const [completedMissions, setCompletedMissions] = useState([])

  

  useEffect(() => {
  const hasNFT = localStorage.getItem('iopn-has-nft') === 'true';
  
  if (!hasNFT) {
    router.push('/nft-mint');
    return;
  }
}, [router]);
  
  // Auth guard - check if user has completed onboarding
  useEffect(() => {
    const checkAuth = () => {
      const discordSkipped = localStorage.getItem("iopn-discord-skipped")
      
      if (!isConnected) {
        router.push("/")
        return
      }
      
      if (!isDiscordConnected && !discordSkipped) {
        router.push("/")
        return
      }
      
      setIsAuthChecking(false)
    }
    
    checkAuth()
  }, [isConnected, isDiscordConnected, router])

  // Load missions from backend or localStorage
  useEffect(() => {
    const loadMissions = async () => {
      setMissionsLoading(true)
      try {
        // Try to fetch from backend
        const response = await fetch('http://localhost:3001/api/missions')
        if (response.ok) {
          const data = await response.json()
          setMissions(data)
        } else {
          // If backend fails, use empty array to show "no missions"
          setMissions([])
        }
      } catch (error) {
        console.error('Failed to load missions:', error)
        setMissions([])
      } finally {
        setMissionsLoading(false)
      }
    }

    // Load completed missions from localStorage
    const savedCompleted = localStorage.getItem("iopn_completed_missions")
    if (savedCompleted) {
      try {
        setCompletedMissions(JSON.parse(savedCompleted))
      } catch {
        setCompletedMissions([])
      }
    }

    if (!isAuthChecking) {
      loadMissions()
    }
  }, [isAuthChecking])

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

  const completeMission = async (missionId) => {
    const mission = missions.find(m => m.id === missionId)
    if (!mission || completedMissions.includes(missionId)) return

    // Update local state
    const updatedCompleted = [...completedMissions, missionId]
    setCompletedMissions(updatedCompleted)
    localStorage.setItem("iopn_completed_missions", JSON.stringify(updatedCompleted))

    // Award REP locally
    earnREP(mission.repReward)

    // Trigger achievement
    triggerAchievement({
      id: `mission_${missionId}`,
      title: `Mission Complete!`,
      description: `+${mission.repReward} REP earned`,
      type: "reward",
    })
  
    // Credit REP on-chain (backend pays gas)
    if (walletAddress) {
      try {
        const response = await fetch('http://localhost:3001/api/rep', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'creditRep',
            user: walletAddress,
            amount: mission.repReward || 100,
            reason: `Mission: ${mission.title}`
          })
        })
        
        if (response.ok) {
          toast.success('REP credited on-chain!')
        }
      } catch (error) {
        console.error('Failed to credit on-chain REP:', error)
        // Still keep the local completion even if on-chain fails
      }
    }
  }

  const filteredMissions = missions.filter(mission => {
    const isCompleted = completedMissions.includes(mission.id)
    
    if (filter === "all") return true
    if (filter === "available") return !isCompleted
    if (filter === "completed") return isCompleted
    if (filter === "daily") return mission.type === "daily"
    if (filter === "weekly") return mission.type === "weekly"
    if (filter === "special") return mission.type === "special"
    return false
  })

  const getMissionIcon = (category) => {
    switch (category) {
      case "social": return Users
      case "gaming": return Trophy
      case "referral": return Zap
      default: return Target
    }
  }

  const getMissionColor = (category) => {
    switch (category) {
      case "social": 
        return theme === "light" ? "text-blue-600" : "text-bright-aqua"
      case "gaming": 
        return theme === "light" ? "text-purple-600" : "text-violet-indigo"
      case "referral": 
        return theme === "light" ? "text-orange-600" : "text-amber-rust"
      default: 
        return theme === "light" ? "text-red-600" : "text-crimson-red"
    }
  }

  // Calculate stats
  const dailyMissions = missions.filter(m => m.type === "daily" && !completedMissions.includes(m.id))
  const weeklyMissions = missions.filter(m => m.type === "weekly" && !completedMissions.includes(m.id))
  const totalREPAvailable = missions.reduce((sum, m) => 
    !completedMissions.includes(m.id) ? sum + (m.repReward || 0) : sum, 0
  )
  const completedCount = missions.filter(m => completedMissions.includes(m.id)).length

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        
        <div className="flex-1 overflow-y-auto">
          <div className={`min-h-full p-4 md:p-8 ${
            theme === "light" ? "bg-white" : "bg-black cyber-grid hex-pattern"
          }`}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 pb-2 ${
                  theme === "light" 
                    ? "from-gray-800 to-gray-600" 
                    : "from-bright-aqua to-white drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                }`}>
                  Missions
                </h1>
                <p className={`text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent ${
                  theme === "light" 
                    ? "from-gray-800 to-gray-600" 
                    : "from-bright-aqua to-white drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                }`}>
                  Complete challenges and earn rewards in the IOPn ecosystem.
                </p>
              </div>

              {/* Mission Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className={`${
                  theme === "light" 
                    ? "bg-blue-50 border-gray-200 shadow-sm" 
                    : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${
                          theme === "light" ? "text-black" : "text-bright-aqua"
                        }`}>
                          Daily Missions
                        </p>
                        <p className={`text-2xl font-bold ${
                          theme === "light" ? "text-black" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        }`}>
                          {dailyMissions.length}
                        </p>
                      </div>
                      <Clock className={`w-8 h-8 ${
                        theme === "light" ? "text-blue-500" : "text-bright-aqua drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                      }`} />
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${
                  theme === "light" 
                    ? "bg-purple-50 border-gray-200 shadow-sm" 
                    : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${
                          theme === "light" ? "text-black" : "text-violet-indigo"
                        }`}>
                          Weekly Missions
                        </p>
                        <p className={`text-2xl font-bold ${
                          theme === "light" ? "text-black" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        }`}>
                          {weeklyMissions.length}
                        </p>
                      </div>
                      <Target className={`w-8 h-8 ${
                        theme === "light" ? "text-purple-500" : "text-violet-indigo drop-shadow-[0_0_10px_rgba(139,0,255,0.5)]"
                      }`} />
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${
                  theme === "light" 
                    ? "bg-green-50 border-gray-200 shadow-sm" 
                    : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${
                          theme === "light" ? "text-black" : "text-amber-rust"
                        }`}>
                          Total REP Available
                        </p>
                        <p className={`text-2xl font-bold ${
                          theme === "light" ? "text-black" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        }`}>
                          {totalREPAvailable}
                        </p>
                      </div>
                      <Zap className={`w-8 h-8 ${
                        theme === "light" ? "text-green-500" : "text-amber-rust drop-shadow-[0_0_10px_rgba(255,140,0,0.5)]"
                      }`} />
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${
                  theme === "light" 
                    ? "bg-orange-50 border-gray-200 shadow-sm" 
                    : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${
                          theme === "light" ? "text-black" : "text-crimson-red"
                        }`}>
                          Completed
                        </p>
                        <p className={`text-2xl font-bold ${
                          theme === "light" ? "text-black" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        }`}>
                          {completedCount}
                        </p>
                      </div>
                      <CheckCircle className={`w-8 h-8 ${
                        theme === "light" ? "text-orange-500" : "text-crimson-red drop-shadow-[0_0_10px_rgba(220,20,60,0.5)]"
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mission Tabs */}
              <Card className={theme === "light" 
                ? "bg-white border-gray-200 shadow-sm" 
                : "holo-card neon-border bg-gradient-to-br from-black/80 to-midnight-indigo/30"
              }>
                <CardHeader>
                  <CardTitle className={theme === "light" ? "text-gray-900" : "text-white"}>
                    Available Missions
                  </CardTitle>
                  <CardDescription className={theme === "light" ? "text-gray-600" : "text-gray-300"}>
                    Choose your missions and start earning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={filter} onValueChange={setFilter} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="daily">Daily</TabsTrigger>
                      <TabsTrigger value="weekly">Weekly</TabsTrigger>
                      <TabsTrigger value="special">Special</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>

                    <TabsContent value={filter} className="mt-6 space-y-4">
                      {missionsLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bright-aqua mx-auto mb-4"></div>
                          <p className={theme === "light" ? "text-gray-600" : "text-gray-300"}>
                            Loading missions...
                          </p>
                        </div>
                      ) : filteredMissions.length === 0 ? (
                        <div className="text-center py-12">
                          <Target className={`w-16 h-16 mx-auto mb-4 ${
                            theme === "light" ? "text-gray-400" : "text-gray-500"
                          }`} />
                          <p className={theme === "light" ? "text-gray-600" : "text-gray-300"}>
                            {missions.length === 0 
                              ? "No missions available yet. Check back later!"
                              : "No missions found in this category"}
                          </p>
                        </div>
                      ) : (
                        filteredMissions.map((mission) => {
                          const Icon = getMissionIcon(mission.category)
                          const isCompleted = completedMissions.includes(mission.id)
                          
                          return (
                            <Card
                              key={mission.id}
                              className={`transition-all ${
                                theme === "light"
                                  ? `bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md ${
                                      isCompleted ? "opacity-60" : ""
                                    }`
                                  : `bg-black/60 border-gray-700 hover:border-bright-aqua/50 ${
                                      isCompleted ? "opacity-60" : ""
                                    }`
                              }`}
                            >
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <div className={`p-3 rounded-lg ${
                                    theme === "light" ? "bg-gray-100" : "bg-gray-800/50"
                                  }`}>
                                    <Icon className={`w-6 h-6 ${getMissionColor(mission.category)}`} />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h3 className={`font-semibold ${
                                          theme === "light" ? "text-gray-900" : "text-white"
                                        }`}>
                                          {mission.title}
                                        </h3>
                                        <p className={`text-sm mt-1 ${
                                          theme === "light" ? "text-gray-600" : "text-gray-300"
                                        }`}>
                                          {mission.description}
                                        </p>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className={
                                          theme === "light"
                                            ? "bg-purple-100 text-purple-700 border-purple-200"
                                            : "bg-violet-indigo/20 text-violet-indigo"
                                        }>
                                          +{mission.repReward} REP
                                        </Badge>
                                        {mission.badgeReward && (
                                          <Badge variant="secondary" className={
                                            theme === "light"
                                              ? "bg-orange-100 text-orange-700 border-orange-200"
                                              : "bg-amber-rust/20 text-amber-rust"
                                          }>
                                            {mission.badgeReward}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {/* Requirements */}
                                    {mission.requirements && mission.requirements.length > 0 && (
                                      <div className="space-y-2 mb-4">
                                        {mission.requirements.map((req, index) => (
                                          <div key={index} className="flex items-center gap-2 text-sm">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                              isCompleted 
                                                ? "bg-green-500 border-green-500" 
                                                : theme === "light"
                                                  ? "border-gray-300 bg-white"
                                                  : "border-gray-500 bg-gray-800"
                                            }`}>
                                              {isCompleted && (
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                              )}
                                            </div>
                                            <span className={
                                              isCompleted 
                                                ? theme === "light" 
                                                  ? "text-gray-500 line-through" 
                                                  : "text-gray-400 line-through"
                                                : theme === "light"
                                                  ? "text-gray-700"
                                                  : "text-gray-300"
                                            }>
                                              {req}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Progress (for missions with progress tracking) */}
                                    {mission.progress !== undefined && mission.target && (
                                      <div className="mb-4">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                          <span className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                                            Progress
                                          </span>
                                          <span className={theme === "light" ? "text-gray-700" : "text-gray-300"}>
                                            {mission.progress}/{mission.target}
                                          </span>
                                        </div>
                                        <Progress 
                                          value={(mission.progress / mission.target) * 100} 
                                          className="h-2"
                                        />
                                      </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-between">
                                      <span className={`text-xs ${
                                        theme === "light" ? "text-gray-500" : "text-gray-300"
                                      }`}>
                                        {mission.timeLimit && (
                                          <>
                                            <Clock className="w-3 h-3 inline mr-1" />
                                            {mission.timeLimit}
                                          </>
                                        )}
                                      </span>
                                      
                                      <Button
                                        onClick={() => completeMission(mission.id)}
                                        disabled={isCompleted}
                                        size="sm"
                                        className={`${
                                          isCompleted
                                            ? theme === "light"
                                              ? "bg-gray-200 text-gray-400 border-gray-300"
                                              : "bg-gray-600"
                                            : theme === "light"
                                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                                              : "cyber-button bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white"
                                        }`}
                                      >
                                        {isCompleted ? (
                                          <>
                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                            Completed
                                          </>
                                        ) : (
                                          "Start Mission"
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <TutorialButton />
        <TutorialPopup />
      </SidebarInset>
    </SidebarProvider>
  )
}