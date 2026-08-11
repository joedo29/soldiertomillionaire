import type { Metadata } from 'next'
import ToolShell from '@/components/ToolShell'
import Checker from './Checker'

export const metadata: Metadata = {
  title: 'Federal Contracting Readiness Checker for Veteran-Owned Businesses',
  description:
    'Free readiness check for veteran-owned small businesses pursuing federal contracts. Answer 8 questions and get a score plus a personalized SAM.gov and SBA VetCert action plan.',
  keywords: [
    'veteran owned business federal contracts',
    'SDVOSB certification',
    'VOSB certification',
    'SAM.gov registration veteran',
    'SBA VetCert',
    'federal contracting readiness',
    'service disabled veteran owned small business',
  ],
  alternates: {
    canonical: 'https://soldiertomillionaire.com/tools/federal-contracting-readiness',
  },
}

export default function FederalContractingReadinessPage() {
  return (
    <ToolShell
      tag="Free Tool"
      title={<>Federal Contracting<br />Readiness Checker</>}
      intro="Eight questions. A readiness score, and a personalized list of exactly what to do next to compete for federal contracts as a veteran-owned business."
    >
      <Checker />
    </ToolShell>
  )
}
