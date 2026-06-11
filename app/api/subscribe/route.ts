import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
  }

  const apiKey  = process.env.CONVERTKIT_API_KEY
  const formId  = process.env.CONVERTKIT_FORM_ID

  if (!apiKey || !formId) {
    console.error('Missing CONVERTKIT_API_KEY or CONVERTKIT_FORM_ID')
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  const res = await fetch(
    `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_secret: apiKey, email }),
    }
  )

  if (!res.ok) {
    const body = await res.text()
    console.error('ConvertKit error:', res.status, body)
    return NextResponse.json({ error: 'Subscription failed. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
