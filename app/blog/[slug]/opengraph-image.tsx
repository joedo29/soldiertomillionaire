import { ImageResponse } from 'next/og'
import { client, postBySlugQuery } from '@/lib/sanity'
import type { Post } from '@/lib/types'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post: Post | null = await client
    .fetch(postBySlugQuery, { slug })
    .catch(() => null)

  const title = post?.title ?? 'Soldier to Millionaire'
  const tag   = post?.tags?.[0] ?? 'Finance'

  return new ImageResponse(
    (
      <div
        style={{
          background: '#1A1F14',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '56px 72px',
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative top-right accent */}
        <div style={{
          position: 'absolute',
          top: 0, right: 0,
          width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(201,168,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: '#C9A84C',
          }}>★</div>
          <span style={{ color: '#C9A84C', fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>
            SOLDIER2MILLIONAIRE
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Tag badge */}
          <div style={{
            display: 'flex',
            alignSelf: 'flex-start',
            background: 'rgba(201,168,76,0.15)',
            border: '1px solid rgba(201,168,76,0.35)',
            color: '#E8C86A',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase',
            padding: '6px 14px',
            borderRadius: 4,
            marginBottom: 24,
          }}>
            {tag}
          </div>

          {/* Title */}
          <div style={{
            color: '#FFFFFF',
            fontSize: title.length > 60 ? 44 : 54,
            fontWeight: 800,
            lineHeight: 1.12,
            maxWidth: 900,
          }}>
            {title}
          </div>
        </div>

        {/* Bottom row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: '#2D4A1E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#E8C86A', fontSize: 20,
            }}>🎖</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>Joe Do</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>US Army · soldiertomillionaire.com</span>
            </div>
          </div>

          <div style={{
            background: '#2D4A1E',
            border: '1px solid rgba(201,168,76,0.3)',
            color: '#E8C86A',
            fontSize: 17,
            fontWeight: 700,
            padding: '10px 22px',
            borderRadius: 8,
            letterSpacing: 0.5,
          }}>
            $750K in 8 Years
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
