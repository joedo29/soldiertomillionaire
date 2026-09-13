import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Signed unsubscribe links for emails sent one at a time through
 * resend.emails.send (the welcome email). Resend's {{{RESEND_UNSUBSCRIBE_URL}}}
 * placeholder only works in Broadcasts, so these emails need their own link.
 *
 * The token is an HMAC of the email address, so a link can only unsubscribe the
 * address it was sent to. Server-only: never import this into a client component.
 */

// www is the canonical host. One-click unsubscribe POSTs from mail providers
// may not follow the apex -> www redirect, so link straight to www.
const SITE = 'https://www.soldiertomillionaire.com'

/** New links are signed with the first available secret. */
function signingSecret() {
  const s = process.env.UNSUBSCRIBE_SECRET || process.env.RESEND_API_KEY
  if (!s) throw new Error('Missing UNSUBSCRIBE_SECRET or RESEND_API_KEY')
  return s
}

/**
 * Links are accepted if signed with either secret. Emails sent before
 * UNSUBSCRIBE_SECRET existed were signed with RESEND_API_KEY, and those links
 * must keep working. If the Resend key is rotated, old links signed with it stop
 * verifying; links signed with UNSUBSCRIBE_SECRET are unaffected.
 */
function verifyingSecrets() {
  return [process.env.UNSUBSCRIBE_SECRET, process.env.RESEND_API_KEY].filter((s): s is string => !!s)
}

function sign(email: string, secret: string) {
  return createHmac('sha256', secret).update(`unsubscribe:${normalizeEmail(email)}`).digest('base64url')
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function unsubscribeToken(email: string) {
  return sign(email, signingSecret())
}

export function verifyUnsubscribeToken(email: string, token: string) {
  const given = Buffer.from(token)
  return verifyingSecrets().some((secret) => {
    const expected = Buffer.from(sign(email, secret))
    return expected.length === given.length && timingSafeEqual(expected, given)
  })
}

/** Email is base64url-encoded so the address is not readable at a glance in the URL. */
export function encodeEmail(email: string) {
  return Buffer.from(normalizeEmail(email)).toString('base64url')
}

export function decodeEmail(encoded: string) {
  try {
    return normalizeEmail(Buffer.from(encoded, 'base64url').toString('utf8'))
  } catch {
    return ''
  }
}

function query(email: string) {
  return `e=${encodeEmail(email)}&t=${unsubscribeToken(email)}`
}

/** Page link shown in the email body: opens a confirm page. */
export function unsubscribePageUrl(email: string) {
  return `${SITE}/unsubscribe?${query(email)}`
}

/** RFC 8058 one-click endpoint for the List-Unsubscribe header. */
export function unsubscribeApiUrl(email: string) {
  return `${SITE}/api/unsubscribe?${query(email)}`
}

export function listUnsubscribeHeaders(email: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${unsubscribeApiUrl(email)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}
