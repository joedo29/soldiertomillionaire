import type { Metadata } from 'next'
import ToolShell from '@/components/ToolShell'
import Calculator from './Calculator'
import { RATE_YEAR } from '@/lib/vaDisabilityRates'

export const metadata: Metadata = {
  title: 'VA Disability Combined Rating Calculator — VA Math & Bilateral Factor',
  description:
    `Free VA combined rating calculator using the real 38 CFR 4.25 Combined Ratings Table, not a decimal shortcut. Handles the bilateral factor, shows every step, and gives your ${RATE_YEAR} monthly compensation.`,
  keywords: [
    'VA combined rating calculator',
    'VA math calculator',
    'combined ratings table 38 CFR 4.25',
    'bilateral factor calculator',
    'VA disability calculator 2026',
    'VA disability pay chart',
    'how does VA combine ratings',
  ],
  alternates: {
    canonical: 'https://soldiertomillionaire.com/tools/va-disability-rating',
  },
}

export default function VaDisabilityRatingPage() {
  return (
    <ToolShell
      tag="Free Tool"
      title={<>VA Combined Rating<br />Calculator</>}
      intro="Two 50% ratings do not make 100%. This runs the real Combined Ratings Table from 38 CFR § 4.25 — including the bilateral factor and the whole-number rounding at every step that most calculators skip — and shows you each step."
    >
      <Calculator />
    </ToolShell>
  )
}
