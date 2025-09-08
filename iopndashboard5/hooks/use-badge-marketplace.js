"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { mockBadges } from "@/lib/mock-data"

const BadgeMarketplaceContext = createContext(undefined)

export function BadgeMarketplaceProvider({ children }) {
  const [userBadges, setUserBadges] = useState([])
  const [userREP, setUserREP] = useState(10000) // Starting REP
  const [marketplaceListings, setMarketplaceListings] = useState(mockBadges)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load user data from localStorage
    const savedBadges = localStorage.getItem("iopn_user_badges")
    const savedREP = localStorage.getItem("iopn_user_rep")
    
    if (savedBadges) {
      setUserBadges(JSON.parse(savedBadges))
    } else {
      // Initialize with starting badges
      const startingBadges = mockBadges.filter(badge => badge.owned).map(badge => badge.id)
      setUserBadges(startingBadges)
      localStorage.setItem("iopn_user_badges", JSON.stringify(startingBadges))
    }
    
    if (savedREP) {
      setUserREP(parseInt(savedREP))
    } else {
      localStorage.setItem("iopn_user_rep", userREP.toString())
    }
  }, [])

  const purchaseBadge = useCallback(async (badgeId) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const badge = marketplaceListings.find(b => b.id === badgeId)
      if (!badge) throw new Error("Badge not found")
      
      if (userBadges.includes(badgeId)) {
        throw new Error("Badge already owned")
      }
      
      if (userREP < badge.price) {
        throw new Error("Insufficient REP")
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user badges
      const newBadges = [...userBadges, badgeId]
      setUserBadges(newBadges)
      localStorage.setItem("iopn_user_badges", JSON.stringify(newBadges))
      
      // Update REP
      const newREP = userREP - badge.price
      setUserREP(newREP)
      localStorage.setItem("iopn_user_rep", newREP.toString())
      
      return { success: true, badge }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userBadges, userREP, marketplaceListings])

  const equipBadge = useCallback((badgeId) => {
    if (!userBadges.includes(badgeId)) {
      throw new Error("Badge not owned")
    }
    
    // In a real app, this would update the user's equipped badges
    console.log(`Equipped badge: ${badgeId}`)
  }, [userBadges])

  const earnREP = useCallback((amount) => {
    const newREP = userREP + amount
    setUserREP(newREP)
    localStorage.setItem("iopn_user_rep", newREP.toString())
  }, [userREP])

  const spendREP = useCallback((amount) => {
    if (userREP < amount) {
      throw new Error("Insufficient REP")
    }
    
    const newREP = userREP - amount
    setUserREP(newREP)
    localStorage.setItem("iopn_user_rep", newREP.toString())
  }, [userREP])

  const getUserBadgeDetails = useCallback(() => {
    return marketplaceListings.filter(badge => userBadges.includes(badge.id))
  }, [userBadges, marketplaceListings])

  const canPurchaseBadge = useCallback((badgeId) => {
    const badge = marketplaceListings.find(b => b.id === badgeId)
    if (!badge) return false
    
    return !userBadges.includes(badgeId) && userREP >= badge.price
  }, [userBadges, userREP, marketplaceListings])

  const value = {
    userBadges,
    userREP,
    marketplaceListings,
    isLoading,
    error,
    purchaseBadge,
    equipBadge,
    earnREP,
    spendREP,
    getUserBadgeDetails,
    canPurchaseBadge,
  }

  return (
    <BadgeMarketplaceContext.Provider value={value}>
      {children}
    </BadgeMarketplaceContext.Provider>
  )
}

export function useBadgeMarketplace() {
  const context = useContext(BadgeMarketplaceContext)
  if (context === undefined) {
    throw new Error("useBadgeMarketplace must be used within a BadgeMarketplaceProvider")
  }
  return context
}