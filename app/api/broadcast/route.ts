import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { Resend } from 'resend'

// ── Verify Sanity webhook signature ──────────────────────────────────────────
function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer)
}

function verifySignature(body: string, header: string, secret: string): boolean {
  try {
    const trimmedHeader = header.trim()
    const expectedHex = createHmac('sha256', secret).update(body).digest('hex')
    const expectedBase64 = createHmac('sha256', secret).update(body).digest('base64')

    // Sanity sends the HMAC in `sanity-webhook-signature`. Depending on webhook
    // tooling/version it may be the raw digest or prefixed as `sha256=...`.
    const directSignature = trimmedHeader.replace(/^sha256=/, '')
    if (safeCompare(directSignature, expectedHex) || safeCompare(directSignature, expectedBase64)) {
      return true
    }

    // Keep support for Standard Webhooks/Svix-style signatures in case the
    // endpoint is tested through a relay that signs as `t=...,v1=...`.
    const parts = Object.fromEntries(
      trimmedHeader.split(',').map((p) => {
        const [key, ...value] = p.split('=')
        return [key.trim(), value.join('=').trim()]
      }),
    )
    const ts = parts['t']
    const v1 = parts['v1']
    if (!ts || !v1) return false
    const expected = createHmac('sha256', secret)
      .update(`${ts}.${body}`)
      .digest('hex')
    return safeCompare(v1, expected)
  } catch {
    return false
  }
}

// ── Check if broadcast already sent for this slug ────────────────────────────
async function broadcastAlreadySent(slug: string, resend: Resend): Promise<boolean> {
  const { data, error } = await resend.broadcasts.list({ limit: 100 })
  if (error) {
    throw new Error(`Unable to check existing broadcasts: ${error.message}`)
  }

  return data.data.some((b) => b.name === `Blog: ${slug}` && b.status === 'sent')
}

// ── Email template ────────────────────────────────────────────────────────────
function buildEmailHtml(title: string, excerpt: string, slug: string) {
  const url = `https://www.soldiertomillionaire.com/blog/${slug}`
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#F9F5EE;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#2D4A1E;">
    <tr><td style="padding:20px 32px;">
      <span style="font-size:18px;font-weight:700;letter-spacing:1px;color:#fff;">
        SOLDIER<span style="color:#C9A84C;">2</span>MILLIONAIRE
      </span>
    </td></tr>
  </table>
  <div style="height:3px;background:#C9A84C;"></div>

  <!-- Body -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9F5EE;">
    <tr><td style="padding:32px 32px 0;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:2px;color:#C9A84C;text-transform:uppercase;">
        New Post from the Field
      </p>
      <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1A1F14;line-height:1.3;">
        ${title}
      </h1>
      ${excerpt ? `<p style="margin:0 0 24px;font-size:15px;color:#4A4A3A;line-height:1.7;">${excerpt}</p>` : ''}

      <!-- CTA -->
      <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
        <tr><td style="background:#2D4A1E;border-radius:8px;padding:14px 28px;">
          <a href="${url}" style="color:#C9A84C;font-size:15px;font-weight:700;text-decoration:none;display:block;">
            Read the Full Post →
          </a>
        </td></tr>
      </table>

      <!-- Divider -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="border-top:1px solid #E0DDD4;"></td></tr>
      </table>

      <p style="margin:0 0 4px;font-size:14px;color:#4A4A3A;line-height:1.7;">— Joe Do</p>
      <p style="margin:0 0 32px;font-size:12px;color:#7A7A6A;">US Army · Founder, Soldier to Millionaire</p>
    </td></tr>
  </table>

  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0DDD4;">
    <tr><td style="padding:20px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9A9A8A;line-height:1.6;">
        You're on this list because you downloaded the Free 5-Step Financial Freedom Plan at
        <a href="https://www.soldiertomillionaire.com" style="color:#2D4A1E;">soldiertomillionaire.com</a>.<br/>
        <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:#9A9A8A;">Unsubscribe</a>
      </p>
    </td></tr>
  </table>

</body>
</html>`
}

// ── Handler ───────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET
  const audienceId    = process.env.RESEND_AUDIENCE_ID
  const apiKey        = process.env.RESEND_API_KEY
  const fromEmail     = process.env.RESEND_FROM_EMAIL ?? 'Joe Do <joe@soldiertomillionaire.com>'
  const replyTo       = process.env.RESEND_REPLY_TO   ?? 'joedo0209@gmail.com'

  if (!webhookSecret || !audienceId || !apiKey) {
    return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 })
  }

  // 1. Verify Sanity signature
  const rawBody   = await req.text()
  const sigHeader = req.headers.get('sanity-webhook-signature') ?? ''

  if (!verifySignature(rawBody, sigHeader, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
  }

  const payload   = JSON.parse(rawBody)
  const document = payload?.document ?? payload?.result ?? payload
  const type = document?._type as string | undefined
  const title = document?.title as string | undefined
  const slugValue = document?.slug
  const slug = typeof slugValue === 'string' ? slugValue : slugValue?.current as string | undefined
  const excerpt = document?.excerpt as string | undefined
  const publishedAt = document?.publishedAt as string | undefined

  // Must be a published post with all required fields
  if ((type && type !== 'post') || !title || !slug || !publishedAt) {
    return NextResponse.json({ skipped: 'Not a published post or missing fields.' })
  }

  const resend = new Resend(apiKey)

  // 2. Deduplicate — skip if we already sent a broadcast for this slug
  const alreadySent = await broadcastAlreadySent(slug, resend)
  if (alreadySent) {
    console.log(`Broadcast already sent for: ${slug} — skipping.`)
    return NextResponse.json({ skipped: 'Already sent for this post.' })
  }

  const html = buildEmailHtml(title, excerpt ?? '', slug)

  // 3. Create and immediately send the broadcast
  const { data, error } = await resend.broadcasts.create({
    audienceId,
    from: fromEmail,
    replyTo,
    subject: title,
    html,
    name: `Blog: ${slug}`,
    send: true,
  })

  if (error) {
    console.error('Broadcast failed:', error)
    return NextResponse.json({ error: 'Failed to send broadcast.' }, { status: 502 })
  }

  const broadcastId = data.id
  console.log(`Broadcast sent for: ${slug} (${broadcastId})`)
  return NextResponse.json({ ok: true, broadcastId, slug })
}
