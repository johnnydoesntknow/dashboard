"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"

const TutorialContext = createContext(undefined)

const tutorials = {
  dashboard: {
    id: "dashboard",
    path: "/",
    title: "Welcome to IOPn Dashboard! 🎉",
    content: "This is your main hub where you can see your REP points, recent activity, and quick actions. REP points are earned through missions, social media engagement, and referrals.",
    primaryButton: "Got it!",
    secondaryButton: "Mint your Origin NFT",
    secondaryAction: "/nft-mint"
  },
  "nft-mint": {
  id: "nft-mint",
  path: "/nft-mint",
  title: "Create Your Origin NFT 🎨",
  content: "Your Origin NFT is your personal identity within the IOPn ecosystem. It acts as your profile picture, evolves with the badges you earn, boosts your REP with multipliers, and may unlock exclusive features. Each wallet can mint only one Origin NFT, so make it count!",
  primaryButton: "Got it!",
  secondaryButton: "After minting, customize it",
  secondaryAction: "/nft-showcase"
},

  "nft-showcase": {
    id: "nft-showcase",
    path: "/nft-showcase",
    title: "NFT Showcase & Badge Forge 🏆",
    content: "Here you can customize your Origin NFT by adding and removing badges you've earned. Badges show your achievements and can provide REP multipliers. Drag and drop badges anywhere on your NFT to position them perfectly!",
    primaryButton: "Got it!",
    secondaryButton: "Start earning badges through missions",
    secondaryAction: "/missions"
  },
  missions: {
    id: "missions",
    path: "/missions",
    title: "Missions Dashboard 🎯",
    content: "Complete missions to earn REP points and badges! There are daily missions, weekly missions, and special limited-time missions. The more missions you complete, the more rewards you'll earn!",
    primaryButton: "Got it!",
    secondaryButton: "Check out the marketplace",
    secondaryAction: "/marketplace"
  },
  marketplace: {
    id: "marketplace",
    path: "/marketplace",
    title: "Badge Marketplace 🛒",
    content: "Buy and sell badges with other players using your REP points! You can also purchase IOPn merchandise. Rare badges can significantly boost your REP earning potential, so invest wisely!",
    primaryButton: "Got it!",
    secondaryButton: "Build your referral network",
    secondaryAction: "/referrals"
  },
  referrals: {
    id: "referrals",
    path: "/referrals",
    title: "Referral Program 👥",
    content: "Invite friends to join IOPn and earn REP when they complete actions! Share your unique referral code and build your network. The more active referrals you have, the more passive REP you'll earn!",
    primaryButton: "Got it!",
    secondaryButton: "Check out the leaderboard",
    secondaryAction: "/leaderboard"
  },
  leaderboard: {
    id: "leaderboard",
    path: "/leaderboard",
    title: "Leaderboard 🏆",
    content: "See how you rank against other players! Compete to be at the top and earn rewards for your achievements. Check back regularly to see your progress!",
    primaryButton: "Got it!",
    secondaryButton: "Back to Dashboard",
    secondaryAction: "/"
  }
}

// Helper function to get tutorial by pathname
const getTutorialByPath = (pathname) => {
  return Object.values(tutorials).find(tutorial => tutorial.path === pathname)
}

export function TutorialProvider({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [viewedTutorials, setViewedTutorials] = useState([])
  const [currentTutorial, setCurrentTutorial] = useState(null)

  // Load viewed tutorials from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("iopn-viewed-tutorials")
    if (saved) {
      try {
        setViewedTutorials(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse viewed tutorials:", e)
        setViewedTutorials([])
      }
    }
  }, [])

  // Show tutorial when pathname changes
  useEffect(() => {
    const tutorial = getTutorialByPath(pathname)
    
    if (tutorial && !viewedTutorials.includes(tutorial.id)) {
      // Delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        setCurrentTutorial(tutorial)
        setIsVisible(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [pathname, viewedTutorials])

  const showTutorial = useCallback((pageId) => {
    let tutorial;
    
    if (pageId) {
      // If pageId provided, find by ID
      tutorial = tutorials[pageId]
    } else {
      // Otherwise, use current pathname
      tutorial = getTutorialByPath(pathname)
    }
    
    if (tutorial) {
      setCurrentTutorial(tutorial)
      setIsVisible(true)
    }
  }, [pathname])

  const closeTutorial = useCallback(() => {
    if (currentTutorial && !viewedTutorials.includes(currentTutorial.id)) {
      const updated = [...viewedTutorials, currentTutorial.id]
      setViewedTutorials(updated)
      localStorage.setItem("iopn-viewed-tutorials", JSON.stringify(updated))
    }
    
    setIsVisible(false)
    setTimeout(() => setCurrentTutorial(null), 300)
  }, [currentTutorial, viewedTutorials])

  const handleSecondaryAction = useCallback(() => {
    if (currentTutorial?.secondaryAction) {
      closeTutorial()
      router.push(currentTutorial.secondaryAction)
    }
  }, [currentTutorial, closeTutorial, router])

  const resetTutorials = useCallback(() => {
    setViewedTutorials([])
    localStorage.removeItem("iopn-viewed-tutorials")
  }, [])

  const value = {
    isVisible,
    currentTutorial,
    showTutorial,
    closeTutorial,
    handleSecondaryAction,
    resetTutorials,
  }

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider")
  }
  return context
}






