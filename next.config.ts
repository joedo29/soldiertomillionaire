import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  async rewrites() {
    return [
      // Finance tracker at /finance (legacy URL)
      { source: '/finance', destination: '/finance-app/index.html' },
      // Finance tracker at /tracker (primary URL shown in nav)
      { source: '/tracker', destination: '/finance-app/index.html' },
    ]
  },
}

export default nextConfig
