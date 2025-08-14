/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'placeholder.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle external packages
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    
    // Add fallbacks for Node.js modules
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
    }
    
    // Optimize chunk splitting for AppKit
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            appkit: {
              name: 'appkit',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@reown[\\/]/,
              priority: 10,
            },
            wagmi: {
              name: 'wagmi',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](wagmi|viem)[\\/]/,
              priority: 10,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    
    return config
  },
  // Suppress specific warnings
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Disable source maps in production for smaller builds
  productionBrowserSourceMaps: false,
}

export default nextConfig