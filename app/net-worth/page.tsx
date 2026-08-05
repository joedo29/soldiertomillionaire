import type { Metadata } from 'next'
import Link from 'next/link'
import { client, netWorthQuery } from '@/lib/sanity'
import type { NetWorth } from '@/lib/types'
import CountUp from '@/components/CountUp'
import NetWorthGrid from './NetWorthGrid'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Our Real Net Worth — Soldier to Millionaire',
  description:
    'The real numbers behind Soldier to Millionaire, updated monthly with account screenshots — every dollar, verified, no projections.',
  keywords: ['military net worth', 'real net worth proof', 'financial transparency', 'soldier to millionaire net worth'],
}

export default async function NetWorthPage() {
  const data: NetWorth | null = await client.fetch(netWorthQuery).catch(() => null)
  const assets = data?.assets ?? []
  const total = assets.reduce((sum, a) => sum + (a.balance || 0), 0)
  const lastUpdated = data?.lastUpdated
    ? new Date(`${data.lastUpdated}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    : null

  return (
    <main>
      <div className="page-hero">
        <div className="section-tag gold">Real Numbers</div>
        <h1>Our Actual<br />Net Worth.</h1>
        <p>Not a projection. Not a round number for a headline. The real accounts, updated every month.</p>
      </div>

      <section className="nw-total-section">
        <div className="container-prose">
          <div className="nw-total-label">Total Net Worth</div>
          <div className="nw-total-number">
            <CountUp from={100000} to={total} prefix="$" duration={2000} commas />
          </div>
          {lastUpdated && <div className="nw-total-updated">Last updated {lastUpdated}</div>}
        </div>
      </section>

      <section className="nw-section">
        <div className="container">
          {assets.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📊</div>
              <p>Net worth breakdown coming soon.</p>
            </div>
          ) : (
            <NetWorthGrid assets={assets} />
          )}

          <p className="nw-disclosure">
            Every account above is real and mine. I show the screenshots because anyone can claim a number —
            proof is what makes it worth reading. Balances change monthly with the market and contributions;
            I update this page every time I update my own tracker.
          </p>
          <p className="nw-disclosure">
            This is educational, not financial advice. I am not a licensed financial advisor.
          </p>
        </div>
      </section>

      <section className="booking-section">
        <div className="booking-icon">🗓️</div>
        <h2 className="booking-title">Want to Build<br />Numbers Like These?</h2>
        <p className="booking-sub">
          Book a free 30-minute session and I&apos;ll walk you through exactly how to start —
          whatever your rank, pay, or starting point.
        </p>
        <Link href="/book" className="btn btn-gold btn-full btn-lg">Book a Free Session</Link>
        <p className="booking-small">No cost. No pitch. Just a plan.</p>
      </section>
    </main>
  )
}
