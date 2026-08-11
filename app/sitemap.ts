import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'
import { tools } from '@/lib/tools'

const BASE = 'https://soldiertomillionaire.com'

const staticRoutes = [
  '',
  '/about',
  '/my-story',
  '/net-worth',
  '/strategy',
  '/resources',
  '/tools',
  '/military-wealth-path',
  '/military-benefits',
  '/blog',
  '/soldiers',
  '/books',
  '/tracker',
  '/book',
  '/contact',
]

const sitemapPostsQuery = `*[_type == "post" && defined(slug.current)]{ "slug": slug.current, publishedAt }`

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const posts: { slug: string; publishedAt?: string }[] = await client
    .fetch(sitemapPostsQuery)
    .catch(() => [])

  const toolRoutes = tools
    .map((t) => t.href)
    .filter((href) => !staticRoutes.includes(href))

  return [
    ...staticRoutes.map((route) => ({
      url: `${BASE}${route}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...toolRoutes.map((route) => ({
      url: `${BASE}${route}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
