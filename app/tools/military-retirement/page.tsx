import type { Metadata } from 'next'
import ToolShell from '@/components/ToolShell'
import Planner from './Planner'
import { RATE_YEAR } from '@/lib/vaDisabilityRates'

export const metadata: Metadata = {
  title: 'Military Retirement Calculator — BRS vs Legacy High-3, VA & State Taxes',
  description:
    `Free military retirement planner. Compare BRS vs Legacy High-3, model the 20-year vesting cliff, TSP with BRS matching, ${RATE_YEAR} VA disability rates with CRDP and the VA waiver, and state tax on retired pay. Exports a live Excel workbook.`,
  keywords: [
    'military retirement calculator',
    'BRS vs Legacy High-3',
    'blended retirement system calculator',
    'high-3 pension calculator',
    'CRDP calculator',
    'VA waiver retired pay',
    'military pension 20 year',
    'TSP matching BRS',
    'state tax military retirement',
  ],
  alternates: {
    canonical: 'https://soldiertomillionaire.com/tools/military-retirement',
  },
}

export default function MilitaryRetirementPage() {
  return (
    <ToolShell
      tag="Free Tool"
      title={<>Military Retirement<br />Planner</>}
      intro="Compare BRS against Legacy High-3 with your real numbers: the 20-year cliff, TSP with matching, VA disability including the concurrent-receipt rules most calculators get wrong, and what your state does to your pension."
    >
      <Planner />
    </ToolShell>
  )
}
