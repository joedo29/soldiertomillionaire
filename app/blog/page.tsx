import type { Metadata } from 'next'
import PostCard from '@/components/PostCard'
import { client, allPostsQuery } from '@/lib/sanity'
import type { Post } from '@/lib/types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog — Military Finance, Investing & Freedom',
  description:
    'Honest, practical articles on military personal finance, TSP investing, S&P 500 strategy, military benefits, and building wealth on an Army salary.',
  keywords: ['military finance blog', 'army investing blog', 'soldier wealth building', 'TSP blog', 'military benefits articles'],
}

export default async function BlogPage() {
  const posts: Post[] = await client.fetch(allPostsQuery).catch(() => [])

  return (
    <main>
      <div className="page-hero">
        <div className="section-tag gold">Latest Intel</div>
        <h1>From<br />the Field</h1>
        <p>No fluff. No ads. Just what actually works — written from a soldier&apos;s foxhole.</p>
      </div>

      <section className="blog-page">
        {posts.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">✍️</div>
            <p>First posts coming soon — subscribe or check back shortly.</p>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
