"use client"

import React, { useEffect, useState } from "react"
import { createAppKit } from "@reown/appkit/react"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { mainnet, polygon, arbitrum, optimism } from "@reown/appkit/networks"
import { opnNetwork } from "@/lib/chains/opn-chain"
import { injectChainImages } from "@/lib/chain-images"
import { watchAccount } from '@wagmi/core'

const queryClient = new QueryClient()

function AppKitContent({ children }) {
  const [wagmiAdapter, setWagmiAdapter] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [appKitInstance, setAppKitInstance] = useState(null)

  useEffect(() => {
    const initAppKit = async () => {
      try {
        // Inject chain images first
        injectChainImages()
        
        // 1. Project ID
        const projectId = "ebc52553bc90f2f63204ad5ac0395e65"
        
        console.log('Initializing AppKit with project ID:', projectId)

        // 2. Create metadata
        const metadata = {
          name: "IOPn Dashboard",
          description: "Your gateway to the IOPn ecosystem",
          url: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
          icons: ["https://i.ibb.co/dN1sMhw/logo.jpg"]
        }

        // 3. Create wagmi adapter
        const adapter = new WagmiAdapter({
          networks: [opnNetwork, mainnet, polygon, arbitrum, optimism],
          projectId
        })

        // 4. SIMPLE Theme variables - like in your airdrop tool
        // 4. Theme variables - add background colors
const themeVariables = {
 
  // Add these to force dark backgrounds
  '--w3m-accent': '#00FFFF',
  '--w3m-background-color': '#000000',
  '--w3m-background-border-radius': '12px',
  '--w3m-container-border-radius': '12px',
  '--w3m-wallet-icon-border-radius': '12px',
  '--w3m-wallet-icon-large-border-radius': '12px',
  '--w3m-wallet-icon-small-border-radius': '12px',
  '--w3m-input-border-radius': '8px',
  '--w3m-button-border-radius': '8px',
  '--w3m-notification-border-radius': '12px',
  '--w3m-secondary-button-border-radius': '8px',
  '--w3m-icon-box-border-radius': '12px',
  '--w3m-button-hover-highlight-border-radius': '8px',
  // Force dark colors
  '--w3m-color-overlay': 'rgba(0, 0, 0, 0.9)',
  '--w3m-color-bg-1': '#000000',
  '--w3m-color-bg-2': '#121212',
  '--w3m-color-bg-3': '#1a1a1a',
  '--w3m-color-inverse-1': '#ffffff',
  '--w3m-color-inverse-2': '#e0e0e0',
  '--w3m-color-inverse-3': '#cccccc',
  '--w3m-color-fg-1': '#ffffff',
  '--w3m-color-fg-2': '#e0e0e0',
  '--w3m-color-fg-3': '#cccccc',
  '--w3m-color-success': '#00ff00',
  '--w3m-color-error': '#ff0000',
}

        // 5. Create AppKit
        const appKit = createAppKit({
          adapters: [adapter],
          networks: [opnNetwork, mainnet, polygon, arbitrum, optimism],
          projectId,
          metadata,
          features: {
            analytics: true,
            swaps: false,
            onramp: false,
            email: true,
            socials: ['google', 'x', 'discord', 'github'],
          },
          themeMode: 'dark',
          themeVariables, // Simple theme variables
          defaultNetwork: opnNetwork,
          allowUnsupportedChain: true,
          enableNetworkView: true,
          enableAccountView: true,
          termsConditionsUrl: 'https://iopn.network/terms',
          privacyPolicyUrl: 'https://iopn.network/privacy',
          chainImages: {
            984: 'https://i.ibb.co/dN1sMhw/logo.jpg'
          }
        })

        // Watch for account changes and auto-close modal
        const unwatch = watchAccount(adapter.wagmiConfig, {
          onChange(account) {
            console.log('Account changed:', account)
            if (account.isConnected && account.address) {
              // Close the modal when connected
              setTimeout(() => {
                appKit.close()
              }, 500)
            }
          }
        })

        setWagmiAdapter(adapter)
        setAppKitInstance(appKit)
        setIsInitialized(true)
        console.log('AppKit initialized successfully')
        
        // Return cleanup function
        return () => {
          unwatch()
        }
      } catch (error) {
        console.error('Failed to initialize AppKit:', error)
      }
    }

    // Initialize
    const cleanup = initAppKit()
    
    return () => {
      cleanup?.then(fn => fn?.())
    }
  }, [])

  if (!isInitialized || !wagmiAdapter) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bright-aqua mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing wallet connection...</p>
        </div>
      </div>
    )
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export function AppKitProvider({ children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bright-aqua mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return <AppKitContent>{children}</AppKitContent>
}