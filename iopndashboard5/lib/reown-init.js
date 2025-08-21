"use client"

import { createAppKit } from "@reown/appkit/react"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { mainnet, polygon, arbitrum, optimism } from "@reown/appkit/networks"

// Ensure this only runs once
let initialized = false

export function initializeAppKit() {
  if (initialized || typeof window === 'undefined') return

  try {
    // 1. Get projectId - hardcoded for now to ensure it works
    const projectId = "ebc52553bc90f2f63204ad5ac0395e65"
    
    console.log('Initializing AppKit with project ID:', projectId)

    // 2. Create metadata
    const metadata = {
      name: "IOPn Dashboard",
      description: "Your gateway to the IOPn ecosystem",
      url: window.location.origin,
      icons: ["https://i.ibb.co/dN1sMhw/logo.jpg"]
    }

    // 3. Create wagmiAdapter
    const wagmiAdapter = new WagmiAdapter({
      networks: [mainnet, polygon, arbitrum, optimism],
      projectId
    })

    // 4. Create AppKit
    createAppKit({
      adapters: [wagmiAdapter],
      networks: [mainnet, polygon, arbitrum, optimism],
      projectId,
      metadata,
      features: {
        analytics: true,
        swaps: false,
        onramp: false
      },
      themeMode: 'dark',
      themeVariables: {
        '--w3m-color-mix': '#00FFFF',
        '--w3m-color-mix-strength': 20,
        '--w3m-accent': '#00FFFF',
        '--w3m-border-radius-master': '8px'
      }
    })

    initialized = true
    console.log('AppKit initialized successfully')
  } catch (error) {
    console.error('Failed to initialize AppKit:', error)
  }
}

// Initialize immediately if in browser
if (typeof window !== 'undefined') {
  initializeAppKit()
}