import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const TOPICS: Record<string, string> = {
  general: 'General Question',
  coaching: 'Interested in a Coaching Session',
  blog: 'Blog Post Idea',
  press: 'Press / Partnership',
}

function esc(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
}

async function addContactToAudience(resend: Resend, audienceId: string, email: string) {
  const createResult = await resend.contacts.create({ email, audienceId, unsubscribed: false })
  if (!createResult.error) return

  const message = createResult.error.message.toLowerCase()
  const isExistingContact =
    createResult.error.statusCode === 409 ||
    message.includes('already') ||
    message.includes('exist') ||
    message.includes('duplicate')

  if (!isExistingContact) throw new Error(createResult.error.message)

  const updateResult = await resend.contacts.update({ email, audienceId, unsubscribed: false })
  if (updateResult.error) throw new Error(updateResult.error.message)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const name    = String(body?.name ?? '').trim()
  const email   = String(body?.email ?? '').trim().toLowerCase()
  const topic   = String(body?.topic ?? 'general')
  const message = String(body?.message ?? '').trim()
  const subscribe = Boolean(body?.subscribe)

  if (!name || !message) {
    return NextResponse.json({ error: 'Name and message are required.' }, { status: 400 })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
  }

  const apiKey     = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  const fromEmail  = process.env.RESEND_FROM_EMAIL ?? 'Joe Do <onboarding@resend.dev>'
  const toEmail    = process.env.CONTACT_TO ?? process.env.RESEND_REPLY_TO ?? 'joedo0209@gmail.com'

  if (!apiKey) {
    console.error('Missing RESEND_API_KEY')
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const resend = new Resend(apiKey)
  const topicLabel = TOPICS[topic] ?? TOPICS.general

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: email,
    subject: `[Contact] ${topicLabel} — ${name}`,
    html: `
      <div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#1A1F14;line-height:1.6;">
        <p><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;</p>
        <p><strong>Topic:</strong> ${esc(topicLabel)}</p>
        <p><strong>Subscribe to list:</strong> ${subscribe ? 'Yes' : 'No'}</p>
        <hr style="border:none;border-top:1px solid #E0DDD4;margin:16px 0;" />
        <p>${esc(message)}</p>
      </div>`,
  })

  if (error) {
    console.error('Contact email failed:', error)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 502 })
  }

  // Best-effort opt-in — a failure here shouldn't fail the whole contact submission,
  // since the message to Joe already sent successfully.
  if (subscribe && audienceId) {
    try {
      await addContactToAudience(resend, audienceId, email)
    } catch (err) {
      console.error('Contact-form audience add failed:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
