import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { client } from '@/lib/sanity'
import { sendSocialKitEmail, type SocialCopy } from '@/lib/socialKit'

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

// Direct-trigger endpoint: bypasses the Sanity webhook entirely so the social
// kit email doesn't depend on webhook delivery succeeding. Called by the
// blog-post-writer automation right after it publishes a post.
export async function POST(req: NextRequest) {
  const triggerSecret = process.env.SOCIAL_KIT_TRIGGER_SECRET
  const apiKey         = process.env.RESEND_API_KEY

  if (!triggerSecret || !apiKey) {
    return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 })
  }

  const auth = req.headers.get('authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token || !safeEqual(token, triggerSecret)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const slug = body?.slug as string | undefined
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug.' }, { status: 400 })
  }

  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{title, excerpt, socialCopy, "imageUrl": mainImage.asset->url}`,
    { slug }
  ).catch(() => null)

  if (!post?.title) {
    return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  }

  try {
    const id = await sendSocialKitEmail({
      title: post.title,
      slug,
      excerpt: post.excerpt,
      imageUrl: post.imageUrl,
      socialCopy: post.socialCopy as SocialCopy | undefined,
    })
    console.log(`Social kit sent (direct trigger) for: ${slug} (${id})`)
    return NextResponse.json({ ok: true, id, slug })
  } catch (err) {
    console.error('Social kit email (direct trigger) failed:', err)
    return NextResponse.json({ error: 'Failed to send social kit.' }, { status: 502 })
  }
}
