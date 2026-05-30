import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  async rewrites() {
    return [
      // Serve the standalone finance tracker at /finance
      {
        source: '/finance',
        destination: '/finance-app/index.html',
      },
      // Also pass through any assets the tracker needs
      {
        source: '/finance-app/:path*',
        destination: '/finance-app/:path*',
      },
    ]
  },
}

export default nextConfig
