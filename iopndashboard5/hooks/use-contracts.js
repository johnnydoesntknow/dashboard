"use client"

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallets } from '@privy-io/react-auth'
import { 
  ORIGIN_NFT_ABI, 
  REP_MANAGER_ABI, 
  BADGE_MANAGER_ABI, 
  MARKETPLACE_ABI,
  CONTRACT_ADDRESSES 
} from '@/lib/contracts/abis'

export function useContracts() {
  const { wallets } = useWallets()
  const [contracts, setContracts] = useState({})
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [loading, setLoading] = useState(false)

  // Initialize contracts when wallet is connected
  useEffect(() => {
    const initContracts = async () => {
      if (wallets && wallets.length > 0) {
        try {
          const wallet = wallets[0]
          const ethereumProvider = await wallet.getEthereumProvider()
          
          // Create ethers provider and signer
          const provider = new ethers.providers.Web3Provider(ethereumProvider)
          const signer = provider.getSigner()
          
          // Initialize contracts
          const originNFT = new ethers.Contract(CONTRACT_ADDRESSES.originNFT, ORIGIN_NFT_ABI, signer)
          const repManager = new ethers.Contract(CONTRACT_ADDRESSES.repManager, REP_MANAGER_ABI, provider)
          const badgeManager = new ethers.Contract(CONTRACT_ADDRESSES.badgeManager, BADGE_MANAGER_ABI, signer)
          const marketplace = new ethers.Contract(CONTRACT_ADDRESSES.marketplace, MARKETPLACE_ABI, signer)
          
          setProvider(provider)
          setSigner(signer)
          setContracts({
            originNFT,
            repManager,
            badgeManager,
            marketplace
          })
        } catch (error) {
          console.error('Failed to initialize contracts:', error)
        }
      }
    }
    
    initContracts()
  }, [wallets])

  // Mint NFT
  const mintNFT = useCallback(async (referralCode = '') => {
    if (!contracts.originNFT) throw new Error('Contracts not initialized')
    
    setLoading(true)
    try {
      const tx = await contracts.originNFT.mint(referralCode)
      const receipt = await tx.wait()
      return receipt
    } finally {
      setLoading(false)
    }
  }, [contracts.originNFT])

  // Get user's on-chain REP
  const getUserREP = useCallback(async (address) => {
    if (!contracts.repManager) return { currentRep: 0, lifetimeRep: 0, spentRep: 0 }
    
    try {
      const profile = await contracts.repManager.users(address)
      return {
        currentRep: profile[0].toNumber(),
        lifetimeRep: profile[1].toNumber(),
        spentRep: profile[2].toNumber(),
        discordId: profile[6],
        isDiscordLinked: profile[11]
      }
    } catch (error) {
      console.error('Failed to get user REP:', error)
      return { currentRep: 0, lifetimeRep: 0, spentRep: 0 }
    }
  }, [contracts.repManager])

  // Check if user has NFT
  const checkHasNFT = useCallback(async (address) => {
    if (!contracts.originNFT) return false
    
    try {
      const tokenId = await contracts.originNFT.addressToTokenId(address)
      return tokenId.toNumber() > 0
    } catch (error) {
      console.error('Failed to check NFT:', error)
      return false
    }
  }, [contracts.originNFT])

  // Get user's badges
  const getUserBadges = useCallback(async (address) => {
    if (!contracts.originNFT) return { badgeIds: [], balances: [] }
    
    try {
      const result = await contracts.originNFT.getUserBadges(address)
      return {
        badgeIds: result[0].map(id => id.toNumber()),
        balances: result[1].map(bal => bal.toNumber())
      }
    } catch (error) {
      console.error('Failed to get user badges:', error)
      return { badgeIds: [], balances: [] }
    }
  }, [contracts.originNFT])

  // Purchase badge
  const purchaseBadge = useCallback(async (badgeId, amount) => {
    if (!contracts.badgeManager) throw new Error('Contracts not initialized')
    
    setLoading(true)
    try {
      const tx = await contracts.badgeManager.purchaseBadge(badgeId, amount)
      const receipt = await tx.wait()
      return receipt
    } finally {
      setLoading(false)
    }
  }, [contracts.badgeManager])

  return {
    contracts,
    provider,
    signer,
    loading,
    mintNFT,
    getUserREP,
    checkHasNFT,
    getUserBadges,
    purchaseBadge
  }
}