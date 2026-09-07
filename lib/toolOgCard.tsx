import { ImageResponse } from 'next/og'
import ToolIcon from '@/components/ToolIcons'
import { tools } from './tools'

/**
 * Shared renderer for per-tool Open Graph cards.
 *
 * Each tool page's opengraph-image.tsx is a three-line file that hands its href
 * to `toolOgImage`, so the card is generated from the same lib/tools.ts entry
 * that drives the index — title, audience and icon all stay in sync with no
 * duplicated copy.
 *
 * Written for satori (Next's ImageResponse), which is stricter than a browser:
 *   - only inline styles, no classes or custom properties
 *   - every element with more than one child needs an explicit display value
 *   - SVG needs real colour attributes, hence the `tone` prop on ToolIcon
 */

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

const DARK = '#1A1F14'
const GOLD = '#C9A84C'
const GOLD_SOFT = 'rgba(201,168,76,0.20)'
const CREAM = '#F9F5EE'

/** Matches the tools index tile: gold accents on the dark hero. */
const OG_TONE = { base: CREAM, accent: GOLD, nodeFill: DARK }

const DANGLING = /\s+(a|an|the|and|or|of|to|for|with|in|on|at|as|by|from)$/i

/** Trim to a whole word, then drop trailing punctuation and dangling articles. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  let out = lastSpace > 40 ? cut.slice(0, lastSpace) : cut
  out = out.replace(/[,;:—-]+$/, '')
  while (DANGLING.test(out)) out = out.replace(DANGLING, '')
  return `${out.replace(/[,;:—-]+$/, '')}…`
}

export function toolOgImage(href: string) {
  const tool = tools.find((t) => t.href === href)

  const title = tool?.title ?? 'Free Tools'
  const audience = tool?.audience ?? 'Veterans & Service Members'
  const tagline = tool?.tagline ?? ''
  const icon = tool?.icon ?? 'ledger'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: DARK,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Soft gold bloom, mirroring the blog card */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 420,
            height: 420,
            display: 'flex',
            background:
              'radial-gradient(circle, rgba(201,168,76,0.16) 0%, transparent 70%)',
          }}
        />

        {/* Brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: GOLD_SOFT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Drawn, not typed: satori has no font for ★ and would try to
                fetch one, which fails and blanks the card. */}
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path
                d="M12 3.2l2.4 6.4 6.4 2.4-6.4 2.4-2.4 6.4-2.4-6.4L3.2 12l6.4-2.4z"
                fill={GOLD}
              />
            </svg>
          </div>
          <span
            style={{
              color: GOLD,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            SOLDIER2MILLIONAIRE
          </span>
        </div>

        {/* Icon + copy */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 34,
              background: 'rgba(249,245,238,0.07)',
              border: '1px solid rgba(201,168,76,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 34,
            }}
          >
            {/* Stroke scales with the render so weight matches the web icon. */}
            <ToolIcon name={icon} size={86} tone={OG_TONE} strokeWidth={1.5} />
          </div>

          <div
            style={{
              display: 'flex',
              color: GOLD,
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            {audience}
          </div>

          <div
            style={{
              display: 'flex',
              color: '#FFFFFF',
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            {title}
          </div>

          {tagline && (
            <div
              style={{
                display: 'flex',
                color: 'rgba(255,255,255,0.62)',
                fontSize: 24,
                lineHeight: 1.4,
                marginTop: 18,
                maxWidth: 880,
              }}
            >
              {truncate(tagline, 118)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: 22,
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 21 }}>
            soldiertomillionaire.com
          </span>
          <span style={{ color: GOLD, fontSize: 21, fontWeight: 700 }}>
            Free · No signup
          </span>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  )
}
