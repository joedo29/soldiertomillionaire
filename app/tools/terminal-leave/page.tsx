import type { Metadata } from 'next'
import ToolShell from '@/components/ToolShell'
import Calculator from './Calculator'

export const metadata: Metadata = {
  title: 'Terminal Leave vs. Selling Leave Calculator — Military Separation',
  description:
    'Free terminal leave vs. sell-back calculator for separating service members. Your pay through separation is the same either way — see what selling leave actually adds, with the 60-day career limit, taxes on both sides, and use-or-lose built in.',
  keywords: [
    'terminal leave vs selling leave',
    'sell back leave military calculator',
    'terminal leave calculator',
    'military leave sell back 60 days',
    'selling leave taxes',
    'terminal leave civilian job',
    'military separation leave',
  ],
  alternates: {
    canonical: 'https://soldiertomillionaire.com/tools/terminal-leave',
  },
}

export default function TerminalLeavePage() {
  return (
    <ToolShell
      tag="Free Tool"
      title={<>Terminal Leave<br />vs. Sell-Back</>}
      intro="Most calculators say terminal leave always wins because they count your military pay on one side only. It is paid either way. This compares what actually differs — and tells you plainly when selling is the better deal."
    >
      <Calculator />
    </ToolShell>
  )
}
