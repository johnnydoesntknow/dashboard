"use client"

import { PrivyProvider } from '@privy-io/react-auth'
import { opnNetwork } from '@/lib/chains/opn-chain'

export function PrivyProviderWrapper({ children }) {
  return (
    <PrivyProvider
      appId="cmf4wrqn4005vk00b1bjrry0n"
      config={{
        // Appearance
        appearance: {
          theme: 'dark',
          accentColor: '#00FFFF',
          logo: 'https://i.ibb.co/dN1sMhw/logo.jpg',
        },
        
        // Login Methods - Discord first for your 100k users!
        loginMethods: ['discord', 'email', 'google'],
        
        // Auto-create wallets for Discord users
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
        
        // Use your OPN Network configuration
        defaultChain: {
          id: opnNetwork.id,
          name: opnNetwork.name,
          nativeCurrency: opnNetwork.nativeCurrency,
          rpcUrl: opnNetwork.rpcUrls.default.http[0],
        },
        
        // Support custom chain
        supportedChains: [
          {
            id: opnNetwork.id,
            name: opnNetwork.name,
            nativeCurrency: opnNetwork.nativeCurrency,
            rpcUrl: opnNetwork.rpcUrls.default.http[0],
            blockExplorerUrl: opnNetwork.blockExplorers.default.url,
          }
        ],
      }}
    >
      {children}
    </PrivyProvider>
  )
}