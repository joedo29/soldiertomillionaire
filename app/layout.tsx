import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://soldiertomillionaire.com'),
  title: {
    default: 'Soldier to Millionaire — Financial Freedom for Those Who Serve',
    template: '%s | Soldier to Millionaire',
  },
  description:
    'A US Army soldier who went from broke to $750K net worth. Free finance tracker, military benefits guide, investment strategy, and 1-on-1 coaching for soldiers.',
  keywords: [
    'military personal finance', 'soldier financial freedom', 'TSP investing',
    'military millionaire', 'how to save money in the army', 'VA loan',
    'military benefits', 'Roth IRA combat zone', 'army financial coaching',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://soldiertomillionaire.com',
    siteName: 'Soldier to Millionaire',
    title: 'Soldier to Millionaire — Financial Freedom for Those Who Serve',
    description: 'From $0 to $750K on an Army salary. I\'ll show you exactly how.',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
