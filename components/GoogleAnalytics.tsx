'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { GA_MEASUREMENT_ID } from '@/lib/analytics'

/**
 * Loads GA4 once for the whole site. Client-side route changes are recorded by
 * GA4's enhanced measurement ("Page changes based on browser history events",
 * on by default), so no manual page_view events are sent here.
 */
export default function GoogleAnalytics() {
  const pathname = usePathname()
  // Skip the Sanity Studio: it is an internal editing tool, not site traffic.
  if (!GA_MEASUREMENT_ID || pathname?.startsWith('/studio')) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  )
}
