import { defineChain } from 'viem'

// Define OPN Testnet as a custom chain for Wagmi/Viem
export const opnTestnet = defineChain({
  id: 984,
  name: 'OPN Testnet',
  network: 'opn-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OPN',
    symbol: 'OPN',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.iopn.tech'],
    },
    public: {
      http: ['https://testnet-rpc.iopn.tech'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'OPN Testnet Explorer', 
      url: 'https://testnet.iopn.tech'
    },
  },
  testnet: true,
  contracts: {},
  // Add icon URL for chain
  iconUrl: 'https://i.ibb.co/dN1sMhw/logo.jpg',
})