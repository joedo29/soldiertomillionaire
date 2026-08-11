import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio', '/api/', '/about-mockup', '/military-wealth-path/report'],
    },
    sitemap: 'https://soldiertomillionaire.com/sitemap.xml',
  }
}
