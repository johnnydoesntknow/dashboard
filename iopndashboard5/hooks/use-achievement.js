"use client"

import { createContext, useContext, useState, useCallback } from "react"

const AchievementContext = createContext(undefined)

export function AchievementProvider({ children }) {
  const [achievements, setAchievements] = useState([])
  const [currentAchievement, setCurrentAchievement] = useState(null)
  const [isTriggered, setIsTriggered] = useState(false)

  const triggerAchievement = useCallback((achievement) => {
    setCurrentAchievement(achievement)
    setIsTriggered(true)
    
    // Auto-hide after animation
    setTimeout(() => {
      setIsTriggered(false)
      setCurrentAchievement(null)
    }, 3000)
    
    // Add to achievements list
    setAchievements(prev => [...prev, {
      ...achievement,
      unlockedAt: new Date().toISOString(),
    }])
  }, [])

  const checkAchievement = useCallback((type, value) => {
    // Check for specific achievement conditions
    const achievementConditions = {
      firstMint: {
        id: 'first_mint',
        title: 'Genesis Creator',
        description: 'Minted your first Origin NFT',
        type: 'achievement',
      },
      repMilestone100: {
        id: 'rep_100',
        title: 'Rising Star',
        description: 'Reached 100 REP points',
        type: 'milestone',
      },
      repMilestone500: {
        id: 'rep_500',
        title: 'Community Hero',
        description: 'Reached 500 REP points',
        type: 'milestone',
      },
      repMilestone1000: {
        id: 'rep_1000',
        title: 'Legend in the Making',
        description: 'Reached 1,000 REP points',
        type: 'milestone',
      },
      firstBadge: {
        id: 'first_badge',
        title: 'Badge Collector',
        description: 'Purchased your first badge',
        type: 'achievement',
      },
      socialButterfly: {
        id: 'social_butterfly',
        title: 'Social Butterfly',
        description: 'Completed 10 social tasks',
        type: 'achievement',
      },
      referralKing: {
        id: 'referral_king',
        title: 'Referral King',
        description: 'Referred 5 new members',
        type: 'achievement',
      },
    }

    // Logic to check and trigger achievements would go here
    // This is a simplified version
    if (type === 'rep' && value >= 100 && !achievements.find(a => a.id === 'rep_100')) {
      triggerAchievement(achievementConditions.repMilestone100)
    }
  }, [achievements, triggerAchievement])

  const value = {
    achievements,
    currentAchievement,
    isTriggered,
    triggerAchievement,
    checkAchievement,
  }

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  )
}

export function useAchievement() {
  const context = useContext(AchievementContext)
  if (context === undefined) {
    throw new Error("useAchievement must be used within an AchievementProvider")
  }
  return context
}