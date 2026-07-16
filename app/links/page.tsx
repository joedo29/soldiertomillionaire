import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { client, recentPostsQuery, urlFor } from '@/lib/sanity'
import type { Post } from '@/lib/types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Links — Soldier to Millionaire',
  description: 'The latest post and everything Soldier to Millionaire in one tap.',
  robots: { index: false, follow: true },
}

const links = [
  {
    href: '/military-wealth-path',
    title: 'Military Wealth Path',
    sub: 'See your dates to $100K, $500K and $1M — free',
    featured: true,
  },
  {
    href: '/resources#playbook',
    title: 'Free 5-Step Playbook',
    sub: 'The printable PDF that starts every soldier’s plan',
  },
  {
    href: '/book',
    title: 'Book a Free Session',
    sub: '30 minutes, your numbers, a written plan',
  },
  {
    href: '/blog',
    title: 'Read the Blog',
    sub: '3 new posts every week — tactical, no hype',
  },
  {
    href: '/books',
    title: 'The Reading List',
    sub: 'The 7 books that shaped the journey',
  },
]

export default async function LinksPage() {
  const posts: Post[] = await client.fetch(recentPostsQuery).catch(() => [])
  const latest = posts[0]

  return (
    <main className="links-page">
      <div className="links-col">

        <div className="links-head">
          <div className="links-avatar">★</div>
          <h1>Soldier<span>2</span>Millionaire</h1>
          <p>$0 → $781K on an Army salary. Battle buddy, not financial guru.</p>
        </div>

        {latest && (
          <Link href={`/blog/${latest.slug.current}`} className="links-latest">
            {latest.mainImage && (
              <Image
                src={urlFor(latest.mainImage).width(800).height(420).url()}
                alt={latest.mainImage.alt ?? latest.title}
                width={800}
                height={420}
              />
            )}
            <div className="links-latest-body">
              <span className="links-latest-tag">New Post</span>
              <strong>{latest.title}</strong>
              <em>Read it free →</em>
            </div>
          </Link>
        )}

        {links.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`links-card${item.featured ? ' featured' : ''}`}
          >
            <strong>{item.title}</strong>
            <span>{item.sub}</span>
          </Link>
        ))}

        <p className="links-foot">soldiertomillionaire.com</p>
      </div>
    </main>
  )
}
