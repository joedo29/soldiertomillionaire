'use client'
import { useEffect } from 'react'

export default function CalEmbed() {
  useEffect(() => {
    // Avoid double-loading if already present
    if (document.getElementById('cal-embed-script')) return

    const script = document.createElement('script')
    script.id = 'cal-embed-script'
    script.src = 'https://app.cal.com/embed/embed.js'
    script.async = true

    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Cal = (window as any).Cal
      if (!Cal) return

      Cal('init', { origin: 'https://cal.com' })

      Cal('inline', {
        elementOrSelector: '#cal-inline',
        calLink: 'soldiertomillionaire/30min',
        layout: 'month_view',
      })

      Cal('ui', {
        theme: 'dark',
        styles: { branding: { brandColor: '#C9A84C' } },
        hideEventTypeDetails: false,
        layout: 'month_view',
      })
    }

    document.head.appendChild(script)
  }, [])

  return (
    <div
      id="cal-inline"
      style={{
        width: '100%',
        minHeight: 600,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}
    />
  )
}
