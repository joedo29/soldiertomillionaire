import type { Metadata } from 'next'
import PostCard from '@/components/PostCard'
import { client, allPostsQuery } from '@/lib/sanity'
import type { Post } from '@/lib/types'

export const revalidate = 60
export const metadata: Metadata = { title: 'Blog' }

export default async function BlogPage() {
  const posts: Post[] = await client.fetch(allPostsQuery).catch(() => [])

  return (
    <main className="container">
      <h1 className="page-title">Blog</h1>
      <p className="page-subtitle">Thoughts on money, budgeting, and financial independence.</p>

      {posts.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 48 }}>✍️</div>
          <p>No posts yet — check back soon!</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </main>
  )
}
