"use client"

import { PrivyProvider } from '@privy-io/react-auth'

export function PrivyProviderWrapper({ children }) {
  return (
    <PrivyProvider
      appId="cmf4wrqn4005vk00b1bjrry0n"
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#00FFFF',
          logo: 'https://i.ibb.co/dN1sMhw/logo.jpg',
        },
        // Enable ONLY wallet connections
        loginMethods: ['wallet'],
        // No embedded wallets
        embeddedWallets: {
          createOnLogin: 'off'
        },
        // Don't specify chains - let Privy use defaults
        // This will support all major chains
      }}
    >
      {children}
    </PrivyProvider>
  )
}