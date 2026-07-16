import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

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

type SocialCopy = {
  x?: string
  facebook?: string
  instagram?: string
  linkedin?: string
}

function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
}

function copyBlock(label: string, note: string, copy: string | undefined) {
  if (!copy) return ''
  return `
  <tr><td style="padding:0 32px;">
    <p style="margin:24px 0 4px;font-size:12px;font-weight:700;letter-spacing:2px;color:#C9A84C;text-transform:uppercase;">${label}</p>
    <p style="margin:0 0 8px;font-size:12px;color:#7A7A6A;">${note}</p>
    <div style="background:#fff;border:1px solid #E0DDD4;border-radius:8px;padding:16px;font-size:14px;color:#1A1F14;line-height:1.6;">
      ${esc(copy)}
    </div>
  </td></tr>`
}

function buildEmailHtml(title: string, slug: string, imageUrl: string | undefined, copy: SocialCopy) {
  const url = `https://www.soldiertomillionaire.com/blog/${slug}`
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#F9F5EE;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#2D4A1E;">
    <tr><td style="padding:20px 32px;">
      <span style="font-size:18px;font-weight:700;letter-spacing:1px;color:#fff;">
        SOLDIER<span style="color:#C9A84C;">2</span>MILLIONAIRE
      </span>
      <span style="font-size:12px;color:rgba(255,255,255,0.6);margin-left:12px;">SOCIAL KIT</span>
    </td></tr>
  </table>
  <div style="height:3px;background:#C9A84C;"></div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F5EE;">
    <tr><td style="padding:28px 32px 0;">
      <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1A1F14;line-height:1.3;">${esc(title)}</h1>
      <p style="margin:0 0 16px;font-size:13px;"><a href="${url}" style="color:#2D4A1E;">${url}</a></p>
      ${imageUrl ? `<a href="${imageUrl}"><img src="${imageUrl}" width="100%" style="max-width:536px;border-radius:8px;display:block;" alt="Editorial image — click to open full size"/></a>
      <p style="margin:6px 0 0;font-size:11px;color:#9A9A8A;">Tap the image to open full size, then save it to attach on each platform.</p>` : ''}
    </td></tr>
    ${copyBlock('Facebook', 'Paste as the post text, attach the image.', copy.facebook)}
    ${copyBlock('Instagram', 'Attach the image, paste as caption. Link is in bio.', copy.instagram)}
    ${copyBlock('LinkedIn', 'Paste as the post text, attach the image.', copy.linkedin)}
    ${copyBlock('X / Twitter', 'Under 280 characters, image attached.', copy.x)}
    <tr><td style="padding:28px 32px 36px;">
      <p style="margin:0;font-size:12px;color:#9A9A8A;">Sent automatically when a post publishes on soldiertomillionaire.com.</p>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET
  const apiKey        = process.env.RESEND_API_KEY
  const fromEmail     = process.env.RESEND_FROM_EMAIL ?? 'Joe Do <joe@soldiertomillionaire.com>'
  const toEmail       = process.env.SOCIAL_KIT_TO ?? process.env.RESEND_REPLY_TO ?? 'joedo0209@gmail.com'

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

  // Fallback copy if the automation did not provide any (e.g. manual posts).
  const url = `https://www.soldiertomillionaire.com/blog/${slug}`
  const fallback = `${title}\n\n${excerpt ?? ''}\n\nRead it free: ${url}`
  const copy: SocialCopy = {
    facebook:  socialCopy.facebook  ?? fallback,
    instagram: socialCopy.instagram ?? `${title}\n\n${excerpt ?? ''}\n\nFull post — link in bio.`,
    linkedin:  socialCopy.linkedin  ?? fallback,
    x:         socialCopy.x         ?? undefined,
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: `Social kit: ${title}`,
      html: buildEmailHtml(title, slug, imageUrl, copy),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Social kit email failed:', err)
    return NextResponse.json({ error: 'Failed to send social kit.' }, { status: 502 })
  }

  const { id } = await res.json()
  console.log(`Social kit sent for: ${slug} (${id})`)
  return NextResponse.json({ ok: true, id, slug })
}
