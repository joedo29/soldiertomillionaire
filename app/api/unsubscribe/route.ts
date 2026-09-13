import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { decodeEmail, verifyUnsubscribeToken } from '@/lib/unsubscribe'

/**
 * POST only. Handles both:
 *   - RFC 8058 one-click unsubscribe from mail providers (query string e & t)
 *   - the confirm button on /unsubscribe (JSON body { e, t })
 * No GET handler, so link scanners that pre-fetch URLs cannot unsubscribe anyone.
 */
export async function POST(req: NextRequest) {
  let e = req.nextUrl.searchParams.get('e') ?? ''
  let t = req.nextUrl.searchParams.get('t') ?? ''

  if ((!e || !t) && req.headers.get('content-type')?.includes('application/json')) {
    const body = await req.json().catch(() => null)
    e = String(body?.e ?? '')
    t = String(body?.t ?? '')
  }

  const email = decodeEmail(e)
  if (!email || !t || !verifyUnsubscribeToken(email, t)) {
    return NextResponse.json({ error: 'This unsubscribe link is invalid.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!apiKey || !audienceId) {
    console.error('Unsubscribe: missing RESEND_API_KEY or RESEND_AUDIENCE_ID')
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.contacts.update({ email, audienceId, unsubscribed: true })

  if (error) {
    const message = error.message.toLowerCase()
    // Already removed from the audience: the outcome the person wants.
    const notFound = error.statusCode === 404 || message.includes('not found')
    if (!notFound) {
      console.error('Unsubscribe failed:', error)
      return NextResponse.json({ error: 'Could not unsubscribe. Please try again.' }, { status: 502 })
    }
  }

  return NextResponse.json({ ok: true })
}
