import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const WELCOME_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Free 5-Step Financial Freedom Plan</title>
</head>
<body style="margin:0;padding:0;background:#F9F5EE;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <!-- Header -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#2D4A1E;">
    <tr>
      <td style="padding:20px 32px;">
        <span style="font-size:18px;font-weight:700;letter-spacing:1px;color:#fff;">
          SOLDIER<span style="color:#C9A84C;">2</span>MILLIONAIRE
        </span>
      </td>
    </tr>
  </table>

  <!-- Gold stripe -->
  <div style="height:3px;background:#C9A84C;"></div>

  <!-- Body -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="padding:40px 32px 0;max-width:560px;margin:0 auto;">

        <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1A1F14;line-height:1.3;">
          Your Free 5-Step Financial Freedom Plan is here.
        </h1>

        <p style="margin:0 0 24px;font-size:15px;color:#4A4A3A;line-height:1.7;">
          This is the exact system I used to go from $0 to $750,000 net worth on an Army salary —
          in 7 years, while serving. Print the checklist on the last page and start with Step 1 today.
        </p>

        <!-- CTA Button -->
        <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
          <tr>
            <td style="background:#C9A84C;border-radius:8px;padding:14px 28px;">
              <a href="https://soldiertomillionaire.com/downloads/military-financial-freedom-playbook.pdf"
                 style="color:#2D4A1E;font-size:15px;font-weight:700;text-decoration:none;display:block;">
                Download the Free 5-Step Plan →
              </a>
            </td>
          </tr>
        </table>

        <!-- Steps preview -->
        <table width="100%" cellpadding="0" cellspacing="0"
               style="background:#2D4A1E;border-radius:10px;margin-bottom:32px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:2px;color:#C9A84C;text-transform:uppercase;">
              What's inside
            </p>
            ${[
              ['01', 'Become Debt Free'],
              ['02', 'Save Aggressively — At Least 50%'],
              ['03', 'Max Out Tax-Advantaged Accounts'],
              ['04', 'Invest in S&P 500 Index Funds — Never Sell'],
              ['05', 'Buy a Home and Pay It Off Quickly'],
            ].map(([num, title]) => `
            <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
              <tr>
                <td style="width:28px;height:28px;background:#C9A84C;border-radius:50%;text-align:center;vertical-align:middle;">
                  <span style="font-size:11px;font-weight:700;color:#2D4A1E;">${num}</span>
                </td>
                <td style="padding-left:12px;font-size:14px;color:rgba(255,255,255,0.85);">${title}</td>
              </tr>
            </table>`).join('')}
          </td></tr>
        </table>

        <p style="margin:0 0 8px;font-size:15px;color:#4A4A3A;line-height:1.7;">
          If you have questions about any of the steps — just reply to this email.
          I answer every message personally.
        </p>

        <p style="margin:0 0 32px;font-size:15px;color:#4A4A3A;line-height:1.7;">
          — Joe Do<br/>
          <span style="color:#7A7A6A;font-size:13px;">US Army · Founder, Soldier to Millionaire</span>
        </p>

      </td>
    </tr>
  </table>

  <!-- Footer -->
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0DDD4;margin-top:16px;">
    <tr>
      <td style="padding:20px 32px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#9A9A8A;line-height:1.6;">
          You're receiving this because you signed up at
          <a href="https://soldiertomillionaire.com" style="color:#2D4A1E;">soldiertomillionaire.com</a>.<br/>
          I am not a licensed financial advisor. This guide is educational, based on personal experience.
        </p>
      </td>
    </tr>
  </table>

</body>
</html>
`

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required.' }, { status: 400 })
  }

  const apiKey     = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  const fromEmail  = process.env.RESEND_FROM_EMAIL ?? 'Joe Do <onboarding@resend.dev>'
  const replyTo    = process.env.RESEND_REPLY_TO ?? 'joedo0209@gmail.com'

  if (!apiKey) {
    console.error('Missing RESEND_API_KEY')
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 })
  }

  // 1. Add to Resend Audience (if configured)
  if (audienceId) {
    await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    }).catch(err => console.error('Audience add failed:', err))
  }

  // 2. Send welcome email
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: email,
    replyTo: replyTo,
    subject: 'Your Free 5-Step Military Financial Freedom Plan',
    html: WELCOME_HTML,
  })

  if (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
