// OPN Chain configuration
export const opnChain = {
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
      http: ['https://val1.iopn.pectra.zeeve.net/'],
    },
    public: {
      http: ['https://val1.iopn.pectra.zeeve.net/'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'OPN Testnet Explorer', 
      url: 'https://testnet.iopn.tech'
    },
  },
  testnet: true,
}

// Network format for wallets
export const opnNetwork = {
  id: 984,
  name: 'OPN Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OPN',
    symbol: 'OPN',
  },
  rpcUrls: {
    default: {
      http: ['https://val1.iopn.pectra.zeeve.net/'],
    },
    public: {
      http: ['https://val1.iopn.pectra.zeeve.net/'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'OPN Testnet Explorer', 
      url: 'https://testnet.iopn.tech'
    },
  },
  contracts: {},
  testnet: true,
  // Add chain icon for display in wallet modal
  imageUrl: 'https://i.ibb.co/dN1sMhw/logo.jpg',
  imageId: 'opn-logo',
}