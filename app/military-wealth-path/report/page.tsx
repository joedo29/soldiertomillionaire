import type { Metadata } from 'next'
import MilitaryWealthPathReport from './report'

export const metadata: Metadata = {
  title: 'Military Wealth Path Report',
  description: 'Download your personalized Military Wealth Path roadmap.',
  robots: { index: false, follow: false },
}

export default function MilitaryWealthPathReportPage() {
  return <MilitaryWealthPathReport />
}
