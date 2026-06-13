import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
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
      <figure className="post-inline-figure">
        <Image
          src={urlFor(value).width(1100).url()}
          alt={value.alt ?? ''}
          width={1100}
          height={620}
          className="post-inline-image"
        />
        {value.alt && (
          <figcaption className="post-caption">
            {value.alt}
          </figcaption>
        )}
      </figure>
    ),
  },
  block: {
    h2: ({ children }: any) => <h2>{children}</h2>,
    h3: ({ children }: any) => <h3>{children}</h3>,
    blockquote: ({ children }: any) => <blockquote>{children}</blockquote>,
  },
  list: {
    bullet: ({ children }: any) => <ul>{children}</ul>,
    number: ({ children }: any) => <ol>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li>{children}</li>,
    number: ({ children }: any) => <li>{children}</li>,
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
      <section className="post-hero">
        <div className="post-container">
          <Link href="/blog" className="post-back">← Back to Blog</Link>

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
        </div>
      </section>

      <article className="post-article">
        <div className="post-container">
          {post.mainImage && (
            <div className="post-cover">
              <Image
                src={urlFor(post.mainImage).width(1400).height(760).url()}
                alt={post.mainImage.alt ?? post.title}
                width={1400}
                height={760}
                priority
              />
            </div>
          )}

          {post.excerpt && (
            <p className="post-excerpt">{post.excerpt}</p>
          )}

          {post.body && (
            <div className="prose post-prose">
              <PortableText value={post.body} components={portableComponents} />
            </div>
          )}

          <div className="post-cta">
            <div className="post-cta-icon">🗓️</div>
            <h3>Found this helpful?</h3>
            <p>Book a free 30-minute session with Joe and get a personalized financial plan built around your military situation.</p>
            <Link href="/book" className="btn btn-gold btn-lg">Book a Free Session</Link>
            <span className="post-cta-note">No cost. No pitch. Just a plan.</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="post-tags-footer">
              <span>Filed under:</span>
              {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
          )}

          {/* ── Comments ── */}
          <div className="post-comments">
            <div className="post-comments-header">
              <div className="post-comments-icon">💬</div>
              <div>
                <h3 className="post-comments-title">Join the Conversation</h3>
                <p className="post-comments-sub">Have a question or want to share your story? Drop a comment below — I read every one.</p>
              </div>
            </div>
            <div className="post-comments-widget">
              <div
                id="cusdis_thread"
                data-host="https://cusdis.com"
                data-app-id="a5a811cf-b05b-4228-b02c-8774fbafbc46"
                data-page-id={post.slug.current}
                data-page-url={`https://www.soldiertomillionaire.com/blog/${post.slug.current}`}
                data-page-title={post.title}
                data-theme="light"
              />
            </div>
            <Script
              src="https://cusdis.com/js/cusdis.es.js"
              strategy="lazyOnload"
            />
          </div>
        </div>
      </article>
    </main>
  )
}
