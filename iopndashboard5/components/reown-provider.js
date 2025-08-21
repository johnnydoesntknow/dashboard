"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { wagmiAdapter } from "@/lib/reown-config"
import React from "react"

const queryClient = new QueryClient()

export function ReownProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}