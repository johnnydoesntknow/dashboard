/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ibb.co' },
      { protocol: 'https', hostname: 'placeholder.com' },
    ],
  },
  webpack: (config, { isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    config.resolve.fallback = { 
      fs: false, net: false, tls: false, crypto: false,
      stream: false, http: false, https: false, zlib: false,
      path: false, os: false,
    }
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
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
  onDemandEntries: { maxInactiveAge: 25_000, pagesBufferLength: 2 },
  productionBrowserSourceMaps: false,
}

export default nextConfig