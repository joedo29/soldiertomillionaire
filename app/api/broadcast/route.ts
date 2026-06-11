import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ── Verify Sanity webhook signature ──────────────────────────────────────────
function verifySignature(body: string, header: string, secret: string): boolean {
  try {
    const parts = Object.fromEntries(header.split(',').map(p => p.split('=')))
    const ts  = parts['t']
    const v1  = parts['v1']
    if (!ts || !v1) return false
    const expected = createHmac('sha256', secret)
      .update(`${ts}.${body}`)
      .digest('hex')
    return timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

// ── Email template ────────────────────────────────────────────────────────────
function buildEmailHtml(title: string, excerpt: string, slug: string) {
  const url = `https://soldiertomillionaire.com/blog/${slug}`
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

  <!-- Label -->
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

      <p style="margin:0 0 4px;font-size:14px;color:#4A4A3A;line-height:1.7;">
        — Joe Do
      </p>
      <p style="margin:0 0 32px;font-size:12px;color:#7A7A6A;">
        US Army · Founder, Soldier to Millionaire
      </p>
    </td></tr>
  </table>

  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0DDD4;">
    <tr><td style="padding:20px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9A9A8A;line-height:1.6;">
        You're on this list because you downloaded the Free 5-Step Financial Freedom Plan at
        <a href="https://soldiertomillionaire.com" style="color:#2D4A1E;">soldiertomillionaire.com</a>.<br/>
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
  const fromEmail     = process.env.RESEND_FROM_EMAIL ?? 'Joe Do <joe@soldiertomillionaire.com>'
  const replyTo       = process.env.RESEND_REPLY_TO   ?? 'joedo0209@gmail.com'

  if (!webhookSecret || !audienceId) {
    return NextResponse.json({ error: 'Server misconfigured.' }, { status: 500 })
  }

  // Verify Sanity signature
  const rawBody = await req.text()
  const sigHeader = req.headers.get('sanity-webhook-signature') ?? ''

  if (!verifySignature(rawBody, sigHeader, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)

  // Only act on first publication (publishedAt newly set)
  const title   = payload?.title   as string | undefined
  const slug    = payload?.slug?.current as string | undefined
  const excerpt = payload?.excerpt as string | undefined

  if (!title || !slug) {
    return NextResponse.json({ skipped: 'Missing title or slug.' })
  }

  const html = buildEmailHtml(title, excerpt ?? '', slug)

  // 1. Create broadcast
  const createRes = await fetch('https://api.resend.com/broadcasts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audience_id: audienceId,
      from: fromEmail,
      reply_to: replyTo,
      subject: title,
      html,
      name: `Blog: ${title}`,
    }),
  })

  if (!createRes.ok) {
    const err = await createRes.text()
    console.error('Broadcast create failed:', err)
    return NextResponse.json({ error: 'Failed to create broadcast.' }, { status: 502 })
  }

  const { id: broadcastId } = await createRes.json()

  // 2. Send broadcast
  const sendRes = await fetch(`https://api.resend.com/broadcasts/${broadcastId}/send`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
  })

  if (!sendRes.ok) {
    const err = await sendRes.text()
    console.error('Broadcast send failed:', err)
    return NextResponse.json({ error: 'Failed to send broadcast.' }, { status: 502 })
  }

  console.log(`Broadcast sent for post: ${title} (${broadcastId})`)
  return NextResponse.json({ ok: true, broadcastId })
}
