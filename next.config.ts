import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  async redirects() {
    return [
      {
        source: '/blog/how-i-hit-100k-army-salary',
        destination: '/blog/how-i-hit-100k-before-the-army',
        permanent: true,
      },
    ]
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
