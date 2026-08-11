export interface Tool {
  href: string
  title: string
  tagline: string
  audience: string
  action: string
}

// Add new tools here — the /tools index page and sitemap pick them up automatically.
export const tools: Tool[] = [
  {
    href: '/tools/federal-contracting-readiness',
    title: 'Federal Contracting Readiness Checker',
    tagline: 'Answer 8 questions, get a readiness score and a personalized checklist for winning federal contracts as a veteran-owned business.',
    audience: 'Veteran Entrepreneurs',
    action: 'Check your readiness',
  },
  {
    href: '/military-wealth-path',
    title: 'Military Wealth Path',
    tagline: 'Enter three numbers, see your projected dates to $100K, $500K and $1M.',
    audience: 'Service Members',
    action: 'Run your projection',
  },
  {
    href: '/tracker',
    title: 'Net Worth Tracker',
    tagline: 'The exact app Joe updates every month to track his own numbers.',
    audience: 'Everyone',
    action: 'Open the tracker',
  },
]
