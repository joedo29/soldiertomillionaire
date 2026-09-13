/**
 * Google Analytics 4 helpers.
 *
 * GA only loads when NEXT_PUBLIC_GA_MEASUREMENT_ID is set, so every call here
 * is a safe no-op in local dev and anywhere the ID is missing.
 *
 * Never pass personal data (emails, names, financial inputs) as event
 * parameters — Google Analytics terms prohibit sending PII.
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}

/** An email signup or contact form submission. `location` names the form, not the person. */
export function trackLead(location: string) {
  trackEvent('generate_lead', { form_location: location })
}
