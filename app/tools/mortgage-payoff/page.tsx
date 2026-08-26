import type { Metadata } from 'next'
import ToolShell from '@/components/ToolShell'
import Calculator from './Calculator'

export const metadata: Metadata = {
  title: 'Mortgage Payoff Calculator — See What Extra Principal Really Saves',
  description:
    'Free mortgage payoff calculator. Add extra monthly principal and see your real payoff date, lifetime interest, and total interest saved — plus a 15-vs-30-year comparison and a downloadable Excel workbook.',
  keywords: [
    'mortgage payoff calculator',
    'extra principal payment calculator',
    'pay off mortgage early',
    '15 vs 30 year mortgage',
    'amortization schedule calculator',
    'mortgage interest saved calculator',
    'military mortgage calculator',
  ],
  alternates: {
    canonical: 'https://soldiertomillionaire.com/tools/mortgage-payoff',
  },
}

export default function MortgagePayoffPage() {
  return (
    <ToolShell
      tag="Free Tool"
      title={<>Mortgage Payoff<br />Calculator</>}
      intro="Most calculators stop at the monthly payment. This one shows what one extra payment a month actually buys you: an earlier payoff date, and the interest you never pay."
    >
      <Calculator />
    </ToolShell>
  )
}
