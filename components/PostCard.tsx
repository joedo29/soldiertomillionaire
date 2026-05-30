import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import type { Post } from '@/lib/types'

export default function PostCard({ post }: { post: Post }) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : 'Draft'

  return (
    <Link href={`/blog/${post.slug.current}`} className="post-card">
      <div className="post-card-img">
        {post.mainImage ? (
          <Image
            src={urlFor(post.mainImage).width(600).height(338).url()}
            alt={post.mainImage.alt ?? post.title}
            width={600}
            height={338}
          />
        ) : (
          <div className="post-card-img-placeholder">📝</div>
        )}
      </div>
      <div className="post-card-body">
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}
        <h2>{post.title}</h2>
        {post.excerpt && <p>{post.excerpt}</p>}
        <time>{date}</time>
      </div>
    </Link>
  )
}
