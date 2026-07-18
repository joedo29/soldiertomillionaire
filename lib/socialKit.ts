export type SocialCopy = {
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

export function buildSocialKitEmailHtml(title: string, slug: string, imageUrl: string | undefined, copy: SocialCopy) {
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

export async function sendSocialKitEmail(params: {
  title: string
  slug: string
  excerpt?: string
  imageUrl?: string
  socialCopy?: SocialCopy
}) {
  const apiKey    = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Joe Do <joe@soldiertomillionaire.com>'
  const toEmail   = process.env.SOCIAL_KIT_TO ?? process.env.RESEND_REPLY_TO ?? 'joedo0209@gmail.com'

  if (!apiKey) throw new Error('RESEND_API_KEY not configured.')

  const url = `https://www.soldiertomillionaire.com/blog/${params.slug}`
  const fallback = `${params.title}\n\n${params.excerpt ?? ''}\n\nRead it free: ${url}`
  const copy: SocialCopy = {
    facebook:  params.socialCopy?.facebook  ?? fallback,
    instagram: params.socialCopy?.instagram ?? `${params.title}\n\n${params.excerpt ?? ''}\n\nFull post — link in bio.`,
    linkedin:  params.socialCopy?.linkedin  ?? fallback,
    x:         params.socialCopy?.x         ?? undefined,
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
      subject: `Social kit: ${params.title}`,
      html: buildSocialKitEmailHtml(params.title, params.slug, params.imageUrl, copy),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend API failed: ${err}`)
  }

  const { id } = await res.json()
  return id as string
}
