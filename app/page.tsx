import Link from 'next/link'
import PostCard from '@/components/PostCard'
import { client, recentPostsQuery } from '@/lib/sanity'
import type { Post } from '@/lib/types'

export const revalidate = 60

export default async function HomePage() {
  const recent: Post[] = await client
    .fetch(recentPostsQuery)
    .catch(() => [])

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <h1>Track your money.<br />Share your story.</h1>
        <p>
          A personal finance tracker paired with a blog for thinking out loud
          about money, savings, and financial independence.
        </p>
        <div className="hero-actions">
          <Link href="/finance" className="btn-primary">
            Open Finance Tracker
          </Link>
          <Link href="/blog" className="btn-ghost">
            Read the Blog
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <div className="features">
        <Link href="/finance" className="feature-card" style={{ textDecoration: 'none' }}>
          <div className="feature-icon green">📊</div>
          <h3>Finance Tracker</h3>
          <p>
            Log income, expenses, and assets. See monthly summaries, category
            breakdowns, and your running net worth — all stored privately in your browser.
          </p>
          <span>Open tracker →</span>
        </Link>
        <Link href="/blog" className="feature-card" style={{ textDecoration: 'none' }}>
          <div className="feature-icon blue">✍️</div>
          <h3>Blog</h3>
          <p>
            Regular posts on budgeting, investing, and lessons learned from
            tracking my own finances. No fluff, just honest numbers and stories.
          </p>
          <span>Read posts →</span>
        </Link>
      </div>

      {/* Recent posts */}
      {recent.length > 0 && (
        <div className="container" style={{ paddingBottom: 80 }}>
          <div className="section-header">
            <h2>Recent Posts</h2>
            <Link href="/blog">View all →</Link>
          </div>
          <div className="posts-grid">
            {recent.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
