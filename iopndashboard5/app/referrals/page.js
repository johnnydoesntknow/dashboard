"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Users, Copy, Check, Gift, TrendingUp, UserPlus, Star } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useDiscord } from "@/hooks/use-discord"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { AppHeader } from "@/components/app-header"
import { TutorialButton } from "@/components/tutorial-button"
import { TutorialPopup } from "@/components/tutorial-popup"

export default function ReferralsPage() {
  const router = useRouter()
  const { walletAddress, isConnected } = useWallet()
  const { isDiscordConnected } = useDiscord()
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)
  const [referrals, setReferrals] = useState([])
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  
  
  
  
  useEffect(() => {
  const hasNFT = localStorage.getItem('iopn-has-nft') === 'true';
  
  if (!hasNFT) {
    router.push('/nft-mint');
    return;
  }
}, [router]);
  
  // Define handleCopy BEFORE any conditional returns
  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])
  
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

  // Load referrals data
  useEffect(() => {
    const loadReferrals = async () => {
      if (isAuthChecking) return
      
      setIsLoading(true)
      try {
        // Try to fetch from backend
        const response = await fetch(`http://localhost:3001/api/referrals/${walletAddress}`)
        if (response.ok) {
          const data = await response.json()
          setReferrals(data || [])
        } else {
          // Backend failed, check localStorage
          const savedReferrals = localStorage.getItem("iopn_user_referrals")
          if (savedReferrals) {
            try {
              setReferrals(JSON.parse(savedReferrals))
            } catch {
              setReferrals([])
            }
          } else {
            setReferrals([])
          }
        }
      } catch (error) {
        console.error('Failed to load referrals:', error)
        // Use localStorage as fallback
        const savedReferrals = localStorage.getItem("iopn_user_referrals")
        if (savedReferrals) {
          try {
            setReferrals(JSON.parse(savedReferrals))
          } catch {
            setReferrals([])
          }
        } else {
          setReferrals([])
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    loadReferrals()
  }, [isAuthChecking, walletAddress])

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
  
  // Generate referral code from wallet address
  const referralCode = walletAddress ? `IOPn-${walletAddress.slice(-6).toUpperCase()}` : "IOPn-XXXXXX"
  const referralLink = `https://iopn.network/join?ref=${referralCode}`
  
  // Calculate stats from actual referrals data
  const totalEarned = referrals.reduce((sum, ref) => sum + (ref.repEarned || 0), 0)
  const activeReferrals = referrals.filter(ref => ref.status === "active").length
  const pendingReferrals = referrals.filter(ref => ref.status === "pending").length

  const nextMilestone = activeReferrals < 5 ? 5 : activeReferrals < 10 ? 10 : 25
  const progress = (activeReferrals / nextMilestone) * 100

  // Share functions
  const shareOnTwitter = () => {
    const text = `Join me on IOPn Network and earn rewards! Use my referral code: ${referralCode}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`, '_blank')
  }

  const shareOnDiscord = () => {
    // Copy to clipboard for Discord
    handleCopy(`Join me on IOPn Network and earn rewards!\n${referralLink}`)
  }

  const shareOnTelegram = () => {
    const text = `Join me on IOPn Network and earn rewards! Use my referral code: ${referralCode}`
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, '_blank')
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
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 pb-2 ${
                  theme === "light" 
                    ? "from-gray-800 to-gray-600" 
                    : "from-bright-aqua to-white drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
                }`}>
                  Referral Program
                </h1>
                <p className={`text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent ${
                  theme === "light" 
                    ? "from-gray-800 to-gray-600" 
                    : "from-bright-aqua to-white drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                }`}>
                  Invite friends to join IOPn and earn rewards together.
                </p>
              </div>

              {/* Referral Stats */}
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
                          Total Referrals
                        </p>
                        <p className={`text-2xl font-bold ${
                          theme === "light" ? "text-black" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        }`}>
                          {referrals.length}
                        </p>
                      </div>
                      <Users className={`w-8 h-8 ${
                        theme === "light" ? "text-blue-500" : "text-bright-aqua drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]"
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
                          theme === "light" ? "text-black" : "text-violet-indigo"
                        }`}>
                          Active Users
                        </p>
                        <p className={`text-2xl font-bold ${
                          theme === "light" ? "text-black" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        }`}>
                          {activeReferrals}
                        </p>
                      </div>
                      <UserPlus className={`w-8 h-8 ${
                        theme === "light" ? "text-green-500" : "text-violet-indigo drop-shadow-[0_0_10px_rgba(139,0,255,0.5)]"
                      }`} />
                    </div>
                  </CardContent>
                </Card>

                <Card className={`${
                  theme === "light" 
                    ? "bg-yellow-50 border-gray-200 shadow-sm" 
                    : "holo-card card-hover bg-gradient-to-br from-black/80 to-midnight-indigo/30 neon-border"
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${
                          theme === "light" ? "text-black" : "text-amber-rust"
                        }`}>
                          Pending
                        </p>
                        <p className={`text-2xl font-bold ${
                          theme === "light" ? "text-black" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        }`}>
                          {pendingReferrals}
                        </p>
                      </div>
                      <Star className={`w-8 h-8 ${
                        theme === "light" ? "text-yellow-500" : "text-amber-rust drop-shadow-[0_0_10px_rgba(255,140,0,0.5)]"
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
                          theme === "light" ? "text-black" : "text-crimson-red"
                        }`}>
                          REP Earned
                        </p>
                        <p className={`text-2xl font-bold ${
                          theme === "light" ? "text-black" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        }`}>
                          {totalEarned}
                        </p>
                      </div>
                      <TrendingUp className={`w-8 h-8 ${
                        theme === "light" ? "text-purple-500" : "text-crimson-red drop-shadow-[0_0_10px_rgba(220,20,60,0.5)]"
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Referral Link Section */}
                <Card className={`${
                  theme === "light" 
                    ? "bg-white border-gray-200 shadow-xl" 
                    : "holo-card card-hover neon-border"
                }`}>
                  <CardHeader>
                    <CardTitle className={theme === "light" ? "text-gray-800" : "text-white"}>
                      Your Referral Link
                    </CardTitle>
                    <CardDescription className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                      Share your unique link to invite friends
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Referral Code */}
                    <div>
                      <label className={`text-sm mb-2 block font-medium ${
                        theme === "light" ? "text-gray-700" : "text-gray-400"
                      }`}>
                        Referral Code
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={referralCode}
                          readOnly
                          className={`font-mono ${
                            theme === "light" 
                              ? "bg-gray-100 border-gray-300 text-gray-900 font-semibold" 
                              : "bg-black/50 border-bright-aqua/30 text-white"
                          }`}
                        />
                        <Button
                          onClick={() => handleCopy(referralCode)}
                          variant="outline"
                          className={
                            theme === "light" 
                              ? "border-gray-300 hover:bg-gray-100 text-gray-700" 
                              : "border-bright-aqua/50 hover:bg-bright-aqua/10"
                          }
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Referral Link */}
                    <div>
                      <label className={`text-sm mb-2 block font-medium ${
                        theme === "light" ? "text-gray-700" : "text-gray-400"
                      }`}>
                        Referral Link
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={referralLink}
                          readOnly
                          className={`text-sm ${
                            theme === "light" 
                              ? "bg-gray-100 border-gray-300 text-gray-900" 
                              : "bg-black/50 border-bright-aqua/30 text-white"
                          }`}
                        />
                        <Button
                          onClick={() => handleCopy(referralLink)}
                          variant="outline"
                          className={
                            theme === "light" 
                              ? "border-gray-300 hover:bg-gray-100 text-gray-700" 
                              : "border-bright-aqua/50 hover:bg-bright-aqua/10"
                          }
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Rewards Info */}
                    <div className={`p-4 rounded-lg border ${
                      theme === "light" 
                        ? "bg-purple-50 border-purple-200" 
                        : "bg-violet-indigo/10 border-violet-indigo/20"
                    }`}>
                      <h4 className={`font-semibold mb-3 ${
                        theme === "light" ? "text-purple-700" : "text-violet-indigo"
                      }`}>
                        Referral Rewards
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className={
                            theme === "light" ? "text-gray-700" : "text-gray-400"
                          }>
                            Per Referral
                          </span>
                          <Badge variant="secondary" className={
                            theme === "light" 
                              ? "bg-purple-100 text-purple-700 border-purple-300" 
                              : "bg-violet-indigo/20 text-violet-indigo"
                          }>
                            +50 REP
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={
                            theme === "light" ? "text-gray-700" : "text-gray-400"
                          }>
                            Referral Bonus
                          </span>
                          <Badge variant="secondary" className={
                            theme === "light" 
                              ? "bg-cyan-100 text-cyan-700 border-cyan-300" 
                              : "bg-bright-aqua/20 text-bright-aqua"
                          }>
                            +100 REP
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={
                            theme === "light" ? "text-gray-700" : "text-gray-400"
                          }>
                            5 Referrals
                          </span>
                          <Badge variant="secondary" className={
                            theme === "light" 
                              ? "bg-orange-100 text-orange-700 border-orange-300" 
                              : "bg-amber-rust/20 text-amber-rust"
                          }>
                            Bonus Badge
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Progress to Next Milestone */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm ${
                          theme === "light" ? "text-gray-700 font-medium" : "text-gray-400"
                        }`}>
                          Progress to {nextMilestone} Referrals
                        </span>
                        <span className={`text-sm font-semibold ${
                          theme === "light" ? "text-gray-900" : "text-gray-300"
                        }`}>
                          {activeReferrals}/{nextMilestone}
                        </span>
                      </div>
                      <Progress 
                        value={progress} 
                        className={`h-2 ${
                          theme === "light" ? "bg-gray-200" : ""
                        }`}
                      />
                      {activeReferrals >= 5 && (
                        <p className={`text-xs mt-2 font-medium ${
                          theme === "light" ? "text-green-600" : "text-green-500"
                        }`}>
                          <Gift className="w-3 h-3 inline mr-1" />
                          Referral King badge unlocked!
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Referral List */}
                <Card className={`${
                  theme === "light" 
                    ? "bg-white border-gray-200 shadow-xl" 
                    : "holo-card neon-border"
                }`}>
                  <CardHeader>
                    <CardTitle className={theme === "light" ? "text-gray-800" : "text-white"}>
                      Your Referrals
                    </CardTitle>
                    <CardDescription className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                      Track your referral activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bright-aqua mx-auto mb-4"></div>
                          <p className={theme === "light" ? "text-gray-600" : "text-gray-300"}>
                            Loading referrals...
                          </p>
                        </div>
                      ) : referrals.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className={`w-16 h-16 mx-auto mb-4 ${
                            theme === "light" ? "text-gray-400" : "text-gray-600"
                          }`} />
                          <p className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                            No referrals yet
                          </p>
                          <p className={`text-sm mt-2 ${
                            theme === "light" ? "text-gray-500" : "text-gray-500"
                          }`}>
                            Share your link to start earning rewards!
                          </p>
                        </div>
                      ) : (
                        referrals.map((referral) => (
                          <div
                            key={referral.id}
                            className={`p-4 rounded-lg border ${
                              theme === "light"
                                ? "bg-gray-50 border-gray-200"
                                : "bg-black/40 border-gray-800"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                                  referral.status === "active" 
                                    ? "from-green-400 to-green-600" 
                                    : "from-yellow-400 to-yellow-600"
                                } flex items-center justify-center`}>
                                  <span className="text-white font-semibold text-sm">
                                    {referral.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className={`font-medium ${
                                    theme === "light" ? "text-gray-800" : "text-white"
                                  }`}>
                                    {referral.name}
                                  </p>
                                  <p className={`text-xs ${
                                    theme === "light" ? "text-gray-500" : "text-gray-400"
                                  }`}>
                                    Joined {referral.joinDate}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge
                                  variant={referral.status === "active" ? "default" : "secondary"}
                                  className={
                                    referral.status === "active"
                                      ? theme === "light" 
                                        ? "bg-green-100 text-green-700 border-green-300"
                                        : "bg-green-500/20 text-green-500"
                                      : theme === "light"
                                        ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                        : "bg-yellow-500/20 text-yellow-500"
                                  }
                                >
                                  {referral.status}
                                </Badge>
                                {referral.status === "active" && (
                                  <p className={`text-xs mt-1 font-medium ${
                                    theme === "light" ? "text-gray-600" : "text-gray-400"
                                  }`}>
                                    +{referral.repEarned} REP
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Share Buttons */}
              <Card className={`mt-8 ${
                theme === "light" 
                  ? "bg-white border-gray-200 shadow-xl" 
                  : "holo-card neon-border"
              }`}>
                <CardHeader>
                  <CardTitle className={theme === "light" ? "text-gray-800" : "text-white"}>
                    Share on Social Media
                  </CardTitle>
                  <CardDescription className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                    Spread the word and grow your network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      onClick={shareOnTwitter}
                      className={
                        theme === "light" 
                          ? "bg-blue-50 hover:bg-blue-100 text-black font-medium border border-gray-200 shadow-sm" 
                          : "cyber-button bg-blue-500 hover:bg-blue-600 text-white"
                      }
                    >
                      Share on Twitter
                    </Button>
                    <Button 
                      onClick={shareOnDiscord}
                      className={
                        theme === "light" 
                          ? "bg-purple-50 hover:bg-purple-100 text-black font-medium border border-gray-200 shadow-sm" 
                          : "cyber-button bg-purple-600 hover:bg-purple-700 text-white"
                      }
                    >
                      Share on Discord
                    </Button>
                    <Button 
                      onClick={shareOnTelegram}
                      className={
                        theme === "light" 
                          ? "bg-cyan-50 hover:bg-cyan-100 text-black font-medium border border-gray-200 shadow-sm" 
                          : "cyber-button bg-blue-600 hover:bg-blue-700 text-white"
                      }
                    >
                      Share on Telegram
                    </Button>
                  </div>
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