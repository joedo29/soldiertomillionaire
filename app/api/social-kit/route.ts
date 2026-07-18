import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { sendSocialKitEmail, type SocialCopy } from '@/lib/socialKit'

// ── Verify Sanity webhook signature (same scheme as /api/broadcast) ─────────
function verifySignature(body: string, header: string, secret: string): boolean {
  try {
    const parts = Object.fromEntries(header.split(',').map(p => p.split('=')))
    const ts = parts['t']
    const v1 = parts['v1']
    if (!ts || !v1) return false
    const expected = createHmac('sha256', secret)
      .update(`${ts}.${body}`)
      .digest('hex')
    return timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET
  const apiKey        = process.env.RESEND_API_KEY

  if (!webhookSecret || !apiKey) {
    return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 })
  }

  const rawBody   = await req.text()
  const sigHeader = req.headers.get('sanity-webhook-signature') ?? ''
  if (!verifySignature(rawBody, sigHeader, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
  }

  const payload     = JSON.parse(rawBody)
  const title       = payload?.title as string | undefined
  const slug        = payload?.slug?.current as string | undefined
  const publishedAt = payload?.publishedAt as string | undefined
  const imageUrl    = payload?.imageUrl as string | undefined
  const excerpt     = payload?.excerpt as string | undefined
  const socialCopy  = (payload?.socialCopy ?? {}) as SocialCopy

  if (!title || !slug || !publishedAt) {
    return NextResponse.json({ skipped: 'Not a published post or missing fields.' })
  }

  // Only email for fresh publishes — edits to old posts (tag cleanups etc.) skip.
  const ageMs = Date.now() - new Date(publishedAt).getTime()
  if (Number.isNaN(ageMs) || ageMs > 3 * 60 * 60 * 1000 || ageMs < -60 * 60 * 1000) {
    return NextResponse.json({ skipped: 'Post is not freshly published.' })
  }

  try {
    const id = await sendSocialKitEmail({ title, slug, excerpt, imageUrl, socialCopy })
    console.log(`Social kit sent for: ${slug} (${id})`)
    return NextResponse.json({ ok: true, id, slug })
  } catch (err) {
    console.error('Social kit email failed:', err)
    return NextResponse.json({ error: 'Failed to send social kit.' }, { status: 502 })
  }
}
