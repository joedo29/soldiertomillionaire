import type { ToolIconName } from '@/components/ToolIcons'

export interface Tool {
  href: string
  title: string
  tagline: string
  audience: string
  action: string
  /** Key into the icon family in components/ToolIcons.tsx. */
  icon: ToolIconName
}

// Add new tools here — the /tools index page and sitemap pick them up
// automatically. Every tool needs an `icon`; draw a new one to the same spec
// in components/ToolIcons.tsx and reference its key.
export const tools: Tool[] = [
  {
    href: '/tools/federal-contracting-readiness',
    title: 'Federal Contracting Readiness Checker',
    tagline: 'Answer 8 questions, get a readiness score and a personalized checklist for winning federal contracts as a veteran-owned business.',
    audience: 'Veteran Entrepreneurs',
    action: 'Check your readiness',
    icon: 'contracting',
  },
  {
    href: '/tools/va-disability-rating',
    title: 'VA Combined Rating Calculator',
    tagline: 'Two 50% ratings do not make 100%. Runs the real Combined Ratings Table with the bilateral factor, shows every step, and gives your monthly compensation.',
    audience: 'Veterans & Service Members',
    action: 'Combine your ratings',
    icon: 'combinedRating',
  },
  {
    href: '/tools/military-retirement',
    title: 'Military Retirement Planner',
    tagline: 'BRS vs Legacy High-3 with your real numbers — the 20-year cliff, TSP matching, VA disability with the concurrent-receipt rules most calculators get wrong, and state taxes.',
    audience: 'Service Members & Veterans',
    action: 'Run your retirement',
    icon: 'retirement',
  },
  {
    href: '/tools/mortgage-payoff',
    title: 'Mortgage Payoff Calculator',
    tagline: 'See what one extra payment a month really buys you — an earlier payoff date and the interest you never pay. Exports to a live Excel workbook.',
    audience: 'Homeowners',
    action: 'Run your loan',
    icon: 'mortgage',
  },
  {
    href: '/military-wealth-path',
    title: 'Military Wealth Path',
    tagline: 'Enter three numbers, see your projected dates to $100K, $500K and $1M.',
    audience: 'Service Members',
    action: 'Run your projection',
    icon: 'wealthPath',
  },
  {
    href: '/tracker',
    title: 'Net Worth Tracker',
    tagline: 'The exact app Joe updates every month to track his own numbers.',
    audience: 'Everyone',
    action: 'Open the tracker',
    icon: 'ledger',
  },
]
