import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { client, postBySlugQuery, allPostsQuery, urlFor } from '@/lib/sanity'
import type { Post } from '@/lib/types'

export const revalidate = 60

// Pre-generate all published post pages at build time
export async function generateStaticParams() {
  const posts: Post[] = await client.fetch(allPostsQuery).catch(() => [])
  return posts.map((p) => ({ slug: p.slug.current }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post: Post | null = await client
    .fetch(postBySlugQuery, { slug })
    .catch(() => null)
  return {
    title: post?.title ?? 'Post not found',
    description: post?.excerpt,
  }
}

const portableComponents = {
  types: {
    image: ({ value }: { value: { asset: { _ref: string }; alt?: string } }) => (
      <Image
        src={urlFor(value).width(800).url()}
        alt={value.alt ?? ''}
        width={800}
        height={450}
        style={{ borderRadius: 8, margin: '28px 0' }}
      />
    ),
  },
}

export default async function PostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post: Post | null = await client
    .fetch(postBySlugQuery, { slug })
    .catch(() => null)

  if (!post) notFound()

  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <main className="post-page">
      <div className="container-narrow">
        <Link href="/blog" className="post-back">
          ← Back to Blog
        </Link>

        <header className="post-header">
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
          )}
          <h1>{post.title}</h1>
          {date && (
            <div className="post-meta">
              <time>{date}</time>
            </div>
          )}
        </header>

        {post.mainImage && (
          <div className="post-cover">
            <Image
              src={urlFor(post.mainImage).width(1200).height(525).url()}
              alt={post.mainImage.alt ?? post.title}
              width={1200}
              height={525}
              priority
            />
          </div>
        )}

        {post.body && (
          <div className="prose">
            <PortableText value={post.body} components={portableComponents} />
          </div>
        )}
      </div>
    </main>
  )
}
