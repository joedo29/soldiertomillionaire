import type { Metadata } from 'next'
import ToolShell from '@/components/ToolShell'
import Calculator from './Calculator'
import { REG_EFFECTIVE } from '@/lib/promotionPointsData'

export const metadata: Metadata = {
  title: 'Army Promotion Point Calculator — SGT & SSG, AR 600-8-19',
  description:
    `Free Army promotion point calculator for SGT and SSG, built from AR 600-8-19 effective ${REG_EFFECTIVE}. Real category caps, the current AFT table, weapons tables by system, the Airborne Advantage, and a printable S-1 review sheet.`,
  keywords: [
    'army promotion point calculator',
    'promotion points SGT SSG',
    'AR 600-8-19 promotion points',
    'semi-centralized promotion points',
    'AFT promotion points',
    'promotion point worksheet',
    'army cutoff scores',
    'E5 E6 promotion points',
  ],
  alternates: {
    canonical: 'https://soldiertomillionaire.com/tools/army-promotion-points',
  },
}

export default function ArmyPromotionPointsPage() {
  return (
    <ToolShell
      tag="Free Tool"
      title={<>Army Promotion<br />Point Calculator</>}
      intro="SGT and SSG semi-centralized points, rebuilt line by line from AR 600-8-19 — the real category ceilings, the current AFT conversion table, weapons tables by weapon system, and the Airborne Advantage that sits outside the 800."
    >
      <Calculator />
    </ToolShell>
  )
}
