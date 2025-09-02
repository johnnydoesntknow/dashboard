import { createAppKit } from "@reown/appkit/react"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { mainnet, polygon, arbitrum, optimism } from "@reown/appkit/networks"

// 1. Get projectId from https://dashboard.reown.com
const projectId = "ebc52553bc90f2f63204ad5ac0395e65"

// Debug log
if (typeof window !== 'undefined') {
  console.log('Reown Project ID:', projectId)
  console.log('Environment:', process.env.NODE_ENV)
}

// 2. Create metadata
const metadata = {
  name: "IOPn Dashboard",
  description: "Your gateway to the IOPn ecosystem",
  url: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
  icons: ["https://i.ibb.co/dN1sMhw/logo.jpg"]
}

// 3. Create wagmiAdapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, polygon, arbitrum, optimism],
  projectId
})

// 4. Create modal - wrapped in conditional to ensure client-side only
if (typeof window !== 'undefined') {
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
}