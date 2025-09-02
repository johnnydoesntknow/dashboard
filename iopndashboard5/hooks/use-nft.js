"use client"

import { createContext, useContext, useState, useEffect } from "react"

const NFTContext = createContext(undefined)

export function NFTProvider({ children }) {
  const [userNFT, setUserNFT] = useState(null)
  const [hasNFT, setHasNFT] = useState(false)
  const [isMinting, setIsMinting] = useState(false)

  useEffect(() => {
    // Check localStorage for existing NFT
    const savedNFT = localStorage.getItem("iopn-user-nft")
    if (savedNFT) {
      const nft = JSON.parse(savedNFT)
      setUserNFT(nft)
      setHasNFT(true)
    }
  }, [])

  const mintNFT = async (nftData) => {
    setIsMinting(true)
    
    try {
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newNFT = {
        id: `nft_${Date.now()}`,
        name: nftData.name || `Origin Genesis #${Math.floor(Math.random() * 9999) + 1}`,
        description: nftData.description || "A unique Origin NFT",
        image: nftData.image || "/placeholder.svg?height=400&width=400",
        traits: nftData.traits || ["Unique", "Original"],
        mintedAt: new Date().toLocaleDateString(),
        owner: localStorage.getItem("iopn-wallet-address"),
        referralCode: nftData.referralCode,
      }
      
      setUserNFT(newNFT)
      setHasNFT(true)
      
      // Save to localStorage
      localStorage.setItem("iopn-user-nft", JSON.stringify(newNFT))
      
      // If referral code was used, credit the referrer
      if (nftData.referralCode) {
        // In production, this would call an API
        console.log(`Referral code ${nftData.referralCode} credited`)
      }
      
    } catch (error) {
      console.error("Failed to mint NFT:", error)
      throw error
    } finally {
      setIsMinting(false)
    }
  }

  const updateNFT = (updates) => {
    if (!userNFT) return
    
    const updatedNFT = { ...userNFT, ...updates }
    setUserNFT(updatedNFT)
    localStorage.setItem("iopn-user-nft", JSON.stringify(updatedNFT))
  }

  const value = {
    userNFT,
    hasNFT,
    isMinting,
    mintNFT,
    updateNFT,
  }

  return (
    <NFTContext.Provider value={value}>
      {children}
    </NFTContext.Provider>
  )
}

export function useNFT() {
  const context = useContext(NFTContext)
  if (context === undefined) {
    throw new Error("useNFT must be used within an NFTProvider")
  }
  return context
}