"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Zap, Shield, Star, Lock, ShoppingCart, Filter, Package, DollarSign, Gift, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { mockBadges } from "@/lib/mock-data"
import { useBadgeMarketplace } from "@/hooks/use-badge-marketplace"
import { useAchievement } from "@/hooks/use-achievement"
import { useTutorial } from "@/hooks/use-tutorial"
import { TutorialButton } from "@/components/tutorial-button"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { AppHeader } from "@/components/app-header"
import { useWallet } from "@/hooks/use-wallet"
import { useDiscord } from "@/hooks/use-discord"
import { TutorialPopup } from "@/components/tutorial-popup"
import { useContracts } from '@/hooks/use-contracts'
import { useBalance } from "@/hooks/use-balance"

export default function MarketplacePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { isConnected } = useWallet()
  const { isDiscordConnected } = useDiscord()
  const { 
    userBadges, 
    userREP,  
    canPurchaseBadge,
    isLoading 
  } = useBadgeMarketplace()
  const { triggerAchievement } = useAchievement()
  const { showTutorial } = useTutorial()
  
  const [selectedRarity, setSelectedRarity] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [purchasingBadgeId, setPurchasingBadgeId] = useState(null)
  const [activeMainTab, setActiveMainTab] = useState("buy")
  const [equippedBadgeIds, setEquippedBadgeIds] = useState([])
  const [userListings, setUserListings] = useState([])
  const [showSellDialog, setShowSellDialog] = useState(false)
  const [selectedBadgeToSell, setSelectedBadgeToSell] = useState(null)
  const [salePrice, setSalePrice] = useState("")
  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const { purchaseBadge, getUserBadges, loading } = useContracts()
const { walletAddress } = useWallet()
 const { balance, subtractBalance } = useBalance() 
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

 

  // Get user's NFT data to check equipped badges
  useEffect(() => {
    if (!isAuthChecking) {
      const nftData = localStorage.getItem("iopn-user-nft")
      if (nftData) {
        const nft = JSON.parse(nftData)
        const equipped = nft.badges?.map(b => typeof b === 'string' ? b : b.id) || []
        setEquippedBadgeIds(equipped)
      }
    }
  }, [isAuthChecking])

  // Load user listings from localStorage
  useEffect(() => {
    if (!isAuthChecking) {
      const savedListings = localStorage.getItem("iopn-user-listings")
      if (savedListings) {
        setUserListings(JSON.parse(savedListings))
      }
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

  // Get user's badges for sell tab (only unequipped and not already listed)
  const listedBadgeIds = userListings.map(listing => listing.badgeId)
  const userBadgesForSale = userBadges
    .map(badgeId => mockBadges.find(b => b.id === badgeId))
    .filter(badge => badge && !equippedBadgeIds.includes(badge.id) && !listedBadgeIds.includes(badge.id))

  // Combine marketplace badges with user listings for buy tab
  const allAvailableBadges = [
    ...mockBadges.filter(badge => !userBadges.includes(badge.id)),
    ...userListings.map(listing => ({
      ...listing.badge,
      price: listing.price,
      isUserListing: true,
      listingId: listing.id
    }))
  ]

  const handlePurchase = async (badgeId) => {
  const badgeToPurchase = allAvailableBadges.find(b => b.id === badgeId)
  if (!badgeToPurchase) return
  
  setPurchasingBadgeId(badgeId)
  
  try {
    // Add wallet confirmation
    toast.info('Please confirm transaction in your wallet...')
    
    // Call the smart contract
    const receipt = await purchaseBadge(badgeId, 1)
    
    toast.success(`Badge purchased! TX: ${receipt.transactionHash}`)
    
    // Update local state
    const newBadges = [...userBadges, badgeId]
    setUserBadges(newBadges)
    localStorage.setItem("iopn_user_badges", JSON.stringify(newBadges))
    
    triggerAchievement({
      id: `badge_purchase_${badgeId}`,
      title: "Badge Acquired!",
      description: `You purchased ${badgeToPurchase.name}`,
      type: "achievement",
    })
  } catch (error) {
    console.error('Purchase failed:', error)
    if (error.code === 4001) {
      toast.error('Transaction cancelled')
    } else {
      toast.error(`Purchase failed: ${error.message}`)
    }
  } finally {
    setPurchasingBadgeId(null)
  }

    
    try {
      const result = await purchaseBadge(badgeId)
      
      if (result.success) {
        // Remove from listings if it was listed
        const updatedListings = userListings.filter(listing => listing.badgeId !== badgeId)
        setUserListings(updatedListings)
        localStorage.setItem("iopn-user-listings", JSON.stringify(updatedListings))
        
        triggerAchievement({
          id: `badge_purchase_${badgeId}`,
          title: "Badge Acquired!",
          description: `You purchased ${result.badge.name}`,
          type: "achievement",
        })
        
        // Check if this is the first badge purchase
        if (userBadges.length === 1) {
          triggerAchievement({
            id: "first_badge",
            title: "Badge Collector!",
            description: "Purchased your first badge",
            type: "milestone",
          })
        }
      }
    } catch (error) {
      console.error("Purchase failed:", error)
    } finally {
      setPurchasingBadgeId(null)
    }
  }

  const handleSellClick = (badge) => {
    setSelectedBadgeToSell(badge)
    setSalePrice(Math.floor(badge.price * 0.7).toString()) // Default to 70% of original
    setShowSellDialog(true)
  }

  const handleListForSale = () => {
    if (!selectedBadgeToSell || !salePrice) return
    
    const newListing = {
      id: `listing_${Date.now()}`,
      badgeId: selectedBadgeToSell.id,
      badge: selectedBadgeToSell,
      price: parseInt(salePrice),
      originalPrice: selectedBadgeToSell.price,
      listedAt: new Date().toISOString(),
      sellerId: "current-user" // In real app, this would be the user's ID
    }
    
    const updatedListings = [...userListings, newListing]
    setUserListings(updatedListings)
    localStorage.setItem("iopn-user-listings", JSON.stringify(updatedListings))
    
    triggerAchievement({
      id: `badge_list_${selectedBadgeToSell.id}`,
      title: "Badge Listed!",
      description: `${selectedBadgeToSell.name} listed for ${salePrice} REP`,
      type: "success"
    })
    
    setShowSellDialog(false)
    setSelectedBadgeToSell(null)
    setSalePrice("")
  }

  const handleCancelListing = (listingId) => {
    const updatedListings = userListings.filter(listing => listing.id !== listingId)
    setUserListings(updatedListings)
    localStorage.setItem("iopn-user-listings", JSON.stringify(updatedListings))
    
    triggerAchievement({
      id: `listing_cancelled_${listingId}`,
      title: "Listing Cancelled",
      description: "Your badge listing has been removed",
      type: "info"
    })
  }

  const handleUpdatePrice = (listingId, newPrice) => {
    const updatedListings = userListings.map(listing => 
      listing.id === listingId ? { ...listing, price: parseInt(newPrice) } : listing
    )
    setUserListings(updatedListings)
    localStorage.setItem("iopn-user-listings", JSON.stringify(updatedListings))
    
    triggerAchievement({
      id: `price_updated_${listingId}`,
      title: "Price Updated",
      description: "Your listing price has been updated",
      type: "info"
    })
  }

  const filteredBadges = allAvailableBadges.filter(badge => {
    if (selectedRarity !== "all" && badge.rarity !== selectedRarity) return false
    if (selectedCategory !== "all" && badge.category !== selectedCategory) return false
    return true
  })

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "legendary": return "from-yellow-400 to-yellow-600"
      case "epic": return "from-purple-400 to-purple-600"
      case "rare": return "from-blue-400 to-blue-600"
      default: return "from-gray-400 to-gray-600"
    }
  }

  const getRarityGlow = (rarity) => {
    switch (rarity) {
      case "legendary": return "legendary-glow"
      case "epic": return "epic-glow"
      case "rare": return "rare-glow"
      default: return "common-glow"
    }
  }

  const getRarityBadgeColor = (rarity) => {
    if (theme === "light") {
      switch (rarity) {
        case "legendary": return "bg-yellow-100 text-yellow-800 border-yellow-300"
        case "epic": return "bg-purple-100 text-purple-800 border-purple-300"
        case "rare": return "bg-blue-100 text-blue-800 border-blue-300"
        default: return "bg-gray-100 text-gray-800 border-gray-300"
      }
    } else {
      switch (rarity) {
        case "legendary": return "bg-yellow-500/20 text-yellow-500"
        case "epic": return "bg-purple-500/20 text-purple-500"
        case "rare": return "bg-blue-500/20 text-blue-500"
        default: return "bg-gray-500/20 text-gray-500"
      }
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        
        <div className="flex-1 overflow-y-auto">
          <div className={`min-h-full p-4 md:p-8 ${
            theme === "light" ? "bg-white" : "bg-black cyber-grid hex-pattern"
          }`}>
            {/* Tutorial Button */}
            <TutorialButton pageId="marketplace" />

            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
  <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-4 pb-2 ${
    theme === "light" 
      ? "from-gray-800 to-gray-600" 
      : "from-bright-aqua to-white drop-shadow-[0_0_30px_rgba(0,255,255,0.5)]"
  }`}>
    Badge Marketplace
  </h1>
  <p className={`text-lg font-semibold bg-gradient-to-r bg-clip-text text-transparent ${
    theme === "light" 
      ? "from-gray-800 to-gray-600" 
      : "from-bright-aqua to-white drop-shadow-[0_0_20px_rgba(0,255,255,0.4)]"
  }`}>
    Trade and collect unique badges from the community.
  </p>
</div>

             {/* User Stats */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
  {/* Card 1 - Your REP */}
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
            Your REP
          </p>
          <p className={`text-2xl font-bold ${
            theme === "light" ? "text-black" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          }`}>
            {userREP.toLocaleString()}
          </p>
        </div>
        <Zap className={`w-8 h-8 ${
          theme === "light" ? "text-blue-500" : "text-bright-aqua drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]"
        }`} />
      </div>
    </CardContent>
  </Card>

  {/* Card 2 - Badges Owned */}
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
            Badges Owned
          </p>
          <p className={`text-2xl font-bold ${
            theme === "light" ? "text-black" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          }`}>
            {userBadges.length}
          </p>
        </div>
        <Package className={`w-8 h-8 ${
          theme === "light" ? "text-purple-500" : "text-violet-indigo drop-shadow-[0_0_10px_rgba(139,0,255,0.5)]"
        }`} />
      </div>
    </CardContent>
  </Card>

  {/* Card 3 - Active Listings */}
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
            Active Listings
          </p>
          <p className={`text-2xl font-bold ${
            theme === "light" ? "text-black" : "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          }`}>
            {userListings.length}
          </p>
        </div>
        <DollarSign className={`w-8 h-8 ${
          theme === "light" ? "text-green-500" : "text-amber-rust drop-shadow-[0_0_10px_rgba(255,140,0,0.5)]"
        }`} />
      </div>
    </CardContent>
  </Card>
</div>

              {/* Main Tabs */}
              <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
                <TabsList className={`grid w-full grid-cols-4 mb-6 ${
  theme === "light" 
    ? "bg-gray-100" 
    : "bg-gray-800/90 backdrop-blur-sm border border-gray-700"
}`}>
                  <TabsTrigger value="buy" className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Sell
                  </TabsTrigger>
                  <TabsTrigger value="listings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Manage Listings
                  </TabsTrigger>
                  <TabsTrigger value="merchandise" className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Merchandise
                  </TabsTrigger>
                </TabsList>

                {/* Buy Tab */}
                <TabsContent value="buy">
                  <Card className={`${
                    theme === "light" 
                      ? "bg-white border-gray-200 shadow-md" 
                      : "holo-card neon-border"
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className={theme === "light" ? "text-gray-800" : "text-white"}>
                            Available Badges
                          </CardTitle>
                          <CardDescription className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                            Purchase badges to customize your profile and NFT
                          </CardDescription>
                        </div>
                        <Button variant="outline" className="gap-2">
                          <Filter className="w-4 h-4" />
                          Filters
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="all" className="w-full">
                        <TabsList className="filter-buttons grid w-full grid-cols-5 mb-6">
                          <TabsTrigger value="all" onClick={() => setSelectedRarity("all")}>
                            All
                          </TabsTrigger>
                          <TabsTrigger value="common" onClick={() => setSelectedRarity("common")}>
                            Common
                          </TabsTrigger>
                          <TabsTrigger value="rare" onClick={() => setSelectedRarity("rare")}>
                            Rare
                          </TabsTrigger>
                          <TabsTrigger value="epic" onClick={() => setSelectedRarity("epic")}>
                            Epic
                          </TabsTrigger>
                          <TabsTrigger value="legendary" onClick={() => setSelectedRarity("legendary")}>
                            Legendary
                          </TabsTrigger>
                        </TabsList>

                        <div className="badge-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredBadges.map((badge) => {
                            const isOwned = userBadges.includes(badge.id)
                            const canPurchase = badge.isUserListing ? userREP >= badge.price : canPurchaseBadge(badge.id)
                            const isPurchasing = purchasingBadgeId === badge.id
                            
                            return (
                              <Card
                                key={badge.isUserListing ? badge.listingId : badge.id}
                                className={`relative overflow-hidden transition-all duration-300 ${
                                  theme === "light"
                                    ? "bg-white border-gray-200 hover:shadow-lg"
                                    : `bg-black/60 border-gray-800 hover:border-bright-aqua/50 ${getRarityGlow(badge.rarity)}`
                                }`}
                              >
                                <CardContent className="p-6">
                                  {/* User Listing Badge */}
                                  {badge.isUserListing && (
                                    <Badge className={
                                      theme === "light"
                                        ? "absolute top-2 right-2 bg-purple-600 text-white"
                                        : "absolute top-2 right-2 bg-violet-indigo text-white"
                                    }>
                                      User Listing
                                    </Badge>
                                  )}
                                  
                                  {/* Badge Icon */}
                                  <div className="text-center mb-4">
                                    <div className={`w-32 h-32 mx-auto mb-4 ${
                                      isOwned ? "opacity-50" : ""
                                    }`}>
                                      <img
                                        src={badge.image || `/images/badges/${badge.name.replace(/ /g, ' ')}.png`}
                                        alt={badge.name}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    
                                    <h3 className={`font-bold text-lg mb-1 ${
                                      theme === "light" ? "text-gray-800" : "text-white"
                                    }`}>
                                      {badge.name}
                                    </h3>
                                    
                                    <Badge variant="secondary" className={`mb-3 ${
                                      getRarityBadgeColor(badge.rarity)
                                    }`}>
                                      {badge.rarity}
                                    </Badge>
                                    
                                    <p className={`text-sm mb-4 ${
                                      theme === "light" ? "text-gray-600" : "text-gray-400"
                                    }`}>
                                      {badge.description}
                                    </p>
                                  </div>

                                  {/* Price and Requirements */}
                                  <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between">
                                      <span className={`text-sm ${
                                        theme === "light" ? "text-gray-600" : "text-gray-400"
                                      }`}>Price</span>
                                      <span className={`font-semibold ${
                                        theme === "light" ? "text-cyan-600" : "text-bright-aqua"
                                      }`}>
                                        {badge.price} REP
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <span className={`text-sm ${
                                        theme === "light" ? "text-gray-600" : "text-gray-400"
                                      }`}>Category</span>
                                      <Badge variant="outline" className="text-xs">
                                        {badge.category}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Purchase Button */}
                                  {isOwned ? (
                                    <Button
                                      disabled
                                      className={`w-full ${
                                        theme === "light"
                                          ? "bg-gray-200 text-gray-500"
                                          : "bg-gray-600 text-gray-400"
                                      }`}
                                    >
                                      <Shield className="w-4 h-4 mr-2" />
                                      Owned
                                    </Button>
                                  ) : !canPurchase ? (
                                    <Button
                                      disabled
                                      className={`w-full ${
                                        theme === "light"
                                          ? "bg-gray-200 text-gray-500"
                                          : "bg-gray-600 text-gray-400"
                                      }`}
                                    >
                                      <Lock className="w-4 h-4 mr-2" />
                                      Insufficient REP
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => handlePurchase(badge.id)}
                                      disabled={isPurchasing || isLoading}
                                      className={`w-full ${
                                        theme === "light"
                                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                                          : "cyber-button bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white"
                                      }`}
                                    >
                                      {isPurchasing ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                          Purchasing...
                                        </>
                                      ) : (
                                        <>
                                          <ShoppingCart className="w-4 h-4 mr-2" />
                                          Purchase
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </CardContent>
                                
                                {/* Owned Overlay */}
                                {isOwned && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                      <Shield className="w-16 h-16 text-green-500 mb-2" />
                                      <p className="text-green-500 font-semibold">Owned</p>
                                    </div>
                                  </div>
                                )}
                              </Card>
                            )
                          })}
                        </div>
                      </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sell Tab */}
                <TabsContent value="sell">
                  <Card className={`${
                    theme === "light" 
                      ? "bg-white border-gray-200 shadow-md" 
                      : "holo-card neon-border"
                  }`}>
                    <CardHeader>
                      <div>
                        <CardTitle className={theme === "light" ? "text-gray-800" : "text-white"}>
                          Your Badges
                        </CardTitle>
                        <CardDescription className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                          Sell your unequipped badges to other players. Badges currently on your NFT cannot be sold.
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {userBadgesForSale.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className={`w-16 h-16 mx-auto mb-4 ${
                            theme === "light" ? "text-gray-400" : "text-gray-600"
                          }`} />
                          <p className={`mb-2 ${
                            theme === "light" ? "text-gray-600" : "text-gray-400"
                          }`}>No badges available to sell</p>
                          <p className={`text-sm ${
                            theme === "light" ? "text-gray-500" : "text-gray-500"
                          }`}>
                            All your badges are currently equipped on your NFT, listed for sale, or you don't own any badges yet.
                          </p>
                          <Button 
                            onClick={() => router.push("/nft-showcase")}
                            className={`mt-4 ${
                              theme === "light"
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "cyber-button bg-gradient-to-r from-violet-indigo to-bright-aqua hover:from-violet-indigo/90 hover:to-bright-aqua/90 text-white"
                            }`}
                          >
                            Manage NFT Badges
                          </Button>
                        </div>
                      ) : (
                        <div className="badge-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {userBadgesForSale.map((badge) => {
                            if (!badge) return null
                            const sellPrice = Math.floor(badge.price * 0.7)
                            
                            return (
                              <Card
                                key={badge.id}
                                className={`relative overflow-hidden transition-all duration-300 ${
                                  theme === "light"
                                    ? "bg-white border-gray-200 hover:shadow-lg"
                                    : `bg-black/60 border-gray-800 hover:border-bright-aqua/50 ${getRarityGlow(badge.rarity)}`
                                }`}
                              >
                                <CardContent className="p-6">
                                  {/* Badge Icon */}
                                  <div className="text-center mb-4">
                                    <div className="w-32 h-32 mx-auto mb-4">
                                      <img
                                        src={badge.image || `/images/badges/${badge.name.replace(/ /g, ' ')}.png`}
                                        alt={badge.name}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    
                                    <h3 className={`font-bold text-lg mb-1 ${
                                      theme === "light" ? "text-gray-800" : "text-white"
                                    }`}>
                                      {badge.name}
                                    </h3>
                                    
                                    <Badge variant="secondary" className={`mb-3 ${
                                      getRarityBadgeColor(badge.rarity)
                                    }`}>
                                      {badge.rarity}
                                    </Badge>
                                    
                                    <p className={`text-sm mb-4 ${
                                      theme === "light" ? "text-gray-600" : "text-gray-400"
                                    }`}>
                                      {badge.description}
                                    </p>
                                  </div>

                                  {/* Sell Info */}
                                  <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between">
                                      <span className={`text-sm ${
                                        theme === "light" ? "text-gray-600" : "text-gray-400"
                                      }`}>Original Price</span>
                                      <span className={`text-sm line-through ${
                                        theme === "light" ? "text-gray-500" : "text-gray-500"
                                      }`}>
                                        {badge.price} REP
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <span className={`text-sm ${
                                        theme === "light" ? "text-gray-600" : "text-gray-400"
                                      }`}>Suggested Price</span>
                                      <span className={`font-semibold ${
                                        theme === "light" ? "text-cyan-600" : "text-bright-aqua"
                                      }`}>
                                        {sellPrice} REP
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                      <span className={`text-sm ${
                                        theme === "light" ? "text-gray-600" : "text-gray-400"
                                      }`}>Category</span>
                                      <Badge variant="outline" className="text-xs">
                                        {badge.category}
                                      </Badge>
                                    </div>
                                  </div>

                                  {/* Sell Button */}
                                  <Button
                                    onClick={() => handleSellClick(badge)}
                                    className={`w-full ${
                                      theme === "light"
                                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                                        : "cyber-button bg-gradient-to-r from-amber-rust to-crimson-red hover:from-amber-rust/90 hover:to-crimson-red/90 text-white"
                                    }`}
                                  >
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Sell Badge
                                  </Button>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Manage Listings Tab */}
                <TabsContent value="listings">
                  <Card className={`${
                    theme === "light" 
                      ? "bg-white border-gray-200 shadow-md" 
                      : "holo-card neon-border"
                  }`}>
                    <CardHeader>
                      <div>
                        <CardTitle className={theme === "light" ? "text-gray-800" : "text-white"}>
                          Manage Listings
                        </CardTitle>
                        <CardDescription className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                          Update prices or cancel your active badge listings
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {userListings.length === 0 ? (
                        <div className="text-center py-12">
                          <Settings className={`w-16 h-16 mx-auto mb-4 ${
                            theme === "light" ? "text-gray-400" : "text-gray-600"
                          }`} />
                          <p className={`mb-2 ${
                            theme === "light" ? "text-gray-600" : "text-gray-400"
                          }`}>No active listings</p>
                          <p className={`text-sm ${
                            theme === "light" ? "text-gray-500" : "text-gray-500"
                          }`}>
                            List some badges for sale to manage them here.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {userListings.map((listing) => (
                            <Card key={listing.id} className={`${
                              theme === "light"
                                ? "bg-gray-50 border-gray-200"
                                : "bg-black/60 border-gray-800"
                            }`}>
                              <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-20 h-20">
                                    <img
                                      src={listing.badge.image || `/images/badges/${listing.badge.name.replace(/ /g, ' ')}.png`}
                                      alt={listing.badge.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <h4 className={`font-semibold ${
                                      theme === "light" ? "text-gray-800" : "text-white"
                                    }`}>
                                      {listing.badge.name}
                                    </h4>
                                    <Badge variant="secondary" className={`mt-1 ${
                                      getRarityBadgeColor(listing.badge.rarity)
                                    }`}>
                                      {listing.badge.rarity}
                                    </Badge>
                                  </div>
                                  
                                  <div className="text-right">
                                    <p className={`text-sm ${
                                      theme === "light" ? "text-gray-600" : "text-gray-400"
                                    }`}>Current Price</p>
                                    <p className={`text-lg font-bold ${
                                      theme === "light" ? "text-cyan-600" : "text-bright-aqua"
                                    }`}>{listing.price} REP</p>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newPrice = prompt("Enter new price:", listing.price)
                                        if (newPrice && !isNaN(newPrice)) {
                                          handleUpdatePrice(listing.id, newPrice)
                                        }
                                      }}
                                      className={theme === "light" 
                                        ? "border-cyan-300 text-cyan-600 hover:bg-cyan-50" 
                                        : "border-bright-aqua/50 text-bright-aqua hover:bg-bright-aqua/10"
                                      }
                                    >
                                      Update Price
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCancelListing(listing.id)}
                                      className={theme === "light" 
                                        ? "border-red-300 text-red-600 hover:bg-red-50" 
                                        : "border-crimson-red/50 text-crimson-red hover:bg-crimson-red/10"
                                      }
                                    >
                                      Cancel Listing
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Merchandise Tab */}
                <TabsContent value="merchandise">
                  <Card className={`${
                    theme === "light" 
                      ? "bg-white border-gray-200 shadow-md" 
                      : "holo-card neon-border"
                  }`}>
                    <CardContent className="flex flex-col items-center justify-center py-24">
                      <div className="text-center max-w-2xl">
                        <img 
                          src="https://i.ibb.co/dN1sMhw/logo.jpg" 
                          alt="IOPn Logo" 
                          className="w-24 h-24 mx-auto mb-6 rounded-lg object-contain"
                        />
                        <h2 className={`text-3xl font-bold mb-4 ${
                          theme === "light" ? "text-gray-800" : "text-white"
                        }`}>
                          Coming Soon
                        </h2>
                        <p className={`text-lg ${
                          theme === "light" ? "text-gray-600" : "text-gray-300"
                        }`}>
                          Physical merchandise and exclusive IOPn gear will be available here soon. Stay tuned for limited edition items and collectibles!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Sell Badge Dialog */}
        <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
          <DialogContent className={`${
            theme === "light" 
              ? "bg-white border-gray-200" 
              : "bg-gray-900 border-gray-800"
          }`}>
            <DialogHeader>
              <DialogTitle className={theme === "light" ? "text-gray-800" : "text-white"}>
                List Badge for Sale
              </DialogTitle>
              <DialogDescription className={theme === "light" ? "text-gray-600" : "text-gray-400"}>
                Set your price for this badge. Once listed, it will be available for other users to purchase.
              </DialogDescription>
            </DialogHeader>
            
            {selectedBadgeToSell && (
              <div className="space-y-4">
                <div className={`flex items-center gap-4 p-4 rounded-lg ${
                  theme === "light" ? "bg-gray-50" : "bg-black/40"
                }`}>
                  <div className="w-16 h-16">
                    <img
                      src={selectedBadgeToSell.image || `/images/badges/${selectedBadgeToSell.name.replace(/ /g, ' ')}.png`}
                      alt={selectedBadgeToSell.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      theme === "light" ? "text-gray-800" : "text-white"
                    }`}>
                      {selectedBadgeToSell.name}
                    </h4>
                    <Badge variant="secondary" className={`mt-1 ${
                      getRarityBadgeColor(selectedBadgeToSell.rarity)
                    }`}>
                      {selectedBadgeToSell.rarity}
                    </Badge>
                    <p className={`text-sm mt-1 ${
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    }`}>
                      {selectedBadgeToSell.description}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sale-price" className={theme === "light" ? "text-gray-700" : "text-white"}>
                    Sale Price (REP)
                  </Label>
                  <Input
                    id="sale-price"
                    type="number"
                    placeholder="Enter price in REP"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className={theme === "light" 
                      ? "bg-white border-gray-300" 
                      : "bg-black/40 border-gray-700 text-white"
                    }
                  />
                  <p className={`text-xs ${
                    theme === "light" ? "text-gray-500" : "text-gray-400"
                  }`}>
                    Original price: {selectedBadgeToSell.price} REP
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSellDialog(false)}
                className={theme === "light" 
                  ? "border-gray-300 text-gray-600 hover:bg-gray-50" 
                  : "border-gray-700 text-gray-300 hover:bg-gray-800"
                }
              >
                Cancel
              </Button>
              <Button
                onClick={handleListForSale}
                disabled={!salePrice || parseInt(salePrice) <= 0}
                className={theme === "light"
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "cyber-button bg-gradient-to-r from-amber-rust to-crimson-red hover:from-amber-rust/90 hover:to-crimson-red/90 text-white"
                }
              >
                List for Sale
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Tutorial Button */}
<TutorialButton pageId="marketplace" />

{/* Tutorial Popup */}
<TutorialPopup />
      </SidebarInset>
    </SidebarProvider>
  )
}