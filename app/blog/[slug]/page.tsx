import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { client, postBySlugQuery, allPostsQuery, urlFor } from '@/lib/sanity'
import type { Post } from '@/lib/types'

export const revalidate = 60

export async function generateStaticParams() {
  const posts: Post[] = await client.fetch(allPostsQuery).catch(() => [])
  return posts.map((p) => ({ slug: p.slug.current }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post: Post | null = await client.fetch(postBySlugQuery, { slug }).catch(() => null)
  return {
    title: post?.title ?? 'Post not found',
    description: post?.excerpt,
  }
}

// Estimate reading time from portable text body
function readingTime(body: any[]): number {
  if (!body) return 1
  const text = body
    .filter((b) => b._type === 'block')
    .flatMap((b) => b.children ?? [])
    .map((c: any) => c.text ?? '')
    .join(' ')
  return Math.max(1, Math.ceil(text.split(/\s+/).length / 200))
}

const portableComponents = {
  types: {
    image: ({ value }: { value: { asset: { _ref: string }; alt?: string } }) => (
      <figure style={{ margin: '32px 0' }}>
        <Image
          src={urlFor(value).width(800).url()}
          alt={value.alt ?? ''}
          width={800}
          height={450}
          style={{ width: '100%', height: 'auto', borderRadius: 10 }}
        />
        {value.alt && (
          <figcaption style={{
            textAlign: 'center', fontSize: 13,
            color: 'var(--muted)', marginTop: 8, fontStyle: 'italic',
          }}>
            {value.alt}
          </figcaption>
        )}
      </figure>
    ),
  },
  block: {
    h2: ({ children }: any) => (
      <h2 style={{
        fontFamily: 'DM Serif Display, serif',
        fontSize: 'clamp(20px, 4vw, 26px)',
        color: 'var(--text)', margin: '40px 0 14px', lineHeight: 1.25,
      }}>{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 style={{
        fontSize: 18, fontWeight: 700,
        color: 'var(--text)', margin: '28px 0 10px',
      }}>{children}</h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote style={{
        borderLeft: '3px solid var(--gold)',
        padding: '4px 0 4px 18px', margin: '28px 0',
        fontFamily: 'DM Serif Display, serif', fontStyle: 'italic',
        fontSize: 'clamp(16px, 3vw, 19px)', color: 'var(--text-light)',
        lineHeight: 1.65,
      }}>{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul style={{ paddingLeft: 22, margin: '0 0 20px' }}>{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol style={{ paddingLeft: 22, margin: '0 0 20px' }}>{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => (
      <li style={{ marginBottom: 8, color: 'var(--text)', lineHeight: 1.65 }}>{children}</li>
    ),
    number: ({ children }: any) => (
      <li style={{ marginBottom: 8, color: 'var(--text)', lineHeight: 1.65 }}>{children}</li>
    ),
  },
}

export default async function PostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post: Post | null = await client.fetch(postBySlugQuery, { slug }).catch(() => null)
  if (!post) notFound()

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null

  const mins = readingTime(post.body ?? [])

  return (
    <main className="post-page">
      <div className="container-narrow">

        {/* Back link */}
        <Link href="/blog" className="post-back">← Back to Blog</Link>

        {/* Header */}
        <header className="post-header">
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
          )}
          <h1>{post.title}</h1>

          {/* Author + meta row */}
          <div className="post-author-row">
            <div className="post-author-avatar">🎖️</div>
            <div>
              <div className="post-author-name">Joe Do</div>
              <div className="post-author-meta">
                {date && <time>{date}</time>}
                <span className="post-dot">·</span>
                <span>{mins} min read</span>
              </div>
            </div>
          </div>
        </header>

        {/* Cover image */}
        {post.mainImage && (
          <div className="post-cover">
            <Image
              src={urlFor(post.mainImage).width(1200).height(525).url()}
              alt={post.mainImage.alt ?? post.title}
              width={1200}
              height={525}
              style={{ width: '100%', height: 'auto' }}
              priority
            />
          </div>
        )}

        {/* Excerpt pull-quote */}
        {post.excerpt && (
          <p className="post-excerpt">{post.excerpt}</p>
        )}

        {/* Body */}
        {post.body && (
          <div className="prose">
            <PortableText value={post.body} components={portableComponents} />
          </div>
        )}

        {/* Bottom CTA */}
        <div className="post-cta">
          <div className="post-cta-icon">🗓️</div>
          <h3>Found this helpful?</h3>
          <p>Book a free 30-minute session with Joe and get a personalized financial plan built around your military situation.</p>
          <Link href="/book" className="btn btn-gold btn-lg">Book a Free Session</Link>
          <span className="post-cta-note">No cost. No pitch. Just a plan.</span>
        </div>

        {/* Tags footer */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags-footer">
            <span>Filed under:</span>
            {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        )}

      </div>
    </main>
  )
}
