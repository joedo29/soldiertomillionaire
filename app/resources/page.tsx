import type { Metadata } from 'next'
import Link from 'next/link'
import EmailCapture from '@/components/EmailCapture'

export const metadata: Metadata = {
  title: 'Resources — Soldier to Millionaire',
  description:
    'Practical Soldier to Millionaire resources for military personal finance, investing, military benefits, books, and real soldier results.',
  keywords: ['military finance resources', 'soldier financial freedom', 'TSP investing', 'military benefits', 'finance books for soldiers'],
}

function Icon({ path }: { path: string }) {
  return (
    <svg
      className="res-icon"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

const icons = {
  target: 'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0 M12 12m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0 M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0',
  chart: 'M4 19l4 -6l4 2l4 -5l4 4 M4 5v14h16',
  download: 'M12 4v12 M7 12l5 5l5 -5 M4 20h16',
  notes: 'M5 4h14v16h-14z M9 8h6 M9 12h6 M9 16h4',
  shield: 'M12 3l7 3v6c0 4.5 -3 7.5 -7 9c-4 -1.5 -7 -4.5 -7 -9v-6z M9 12l2 2l4 -4',
  book: 'M4 5a2 2 0 0 1 2 -2h5v18h-5a2 2 0 0 1 -2 -2z M20 5a2 2 0 0 0 -2 -2h-5v18h5a2 2 0 0 0 2 -2z',
}

const freeTools = [
  {
    href: '/tracker',
    icon: icons.chart,
    title: 'Net Worth Tracker',
    body: 'The exact app Joe updates every month to track his own numbers.',
    action: 'Open the tracker',
  },
  {
    href: '#playbook',
    icon: icons.download,
    title: 'Free 5-Step Playbook',
    body: 'The printable PDF that starts every soldier’s plan.',
    action: 'Get the free PDF',
  },
]

const learn = [
  {
    href: '/blog',
    icon: icons.notes,
    title: 'Blog',
    body: 'Three new posts weekly — searchable by topic.',
  },
  {
    href: '/military-benefits',
    icon: icons.shield,
    title: 'Military Benefits',
    body: 'TSP, VA loan, SCRA and more — in plain English.',
  },
  {
    href: '/books',
    icon: icons.book,
    title: 'Books',
    body: 'The 7 books that shaped the journey.',
  },
]

export default function ResourcesPage() {
  return (
    <main>
      <div className="page-hero resources-hero">
        <div className="section-tag gold">Resources</div>
        <h1>Your Mission<br />Toolkit</h1>
        <p>Every tool, guide, and story on this site — organized by what you need right now.</p>
      </div>

      <section className="resources-section">
        <div className="container">

          {/* ── Start here ── */}
          <div className="res-label gold">Start Here</div>
          <Link href="/military-wealth-path" className="res-featured">
            <div className="res-featured-icon"><Icon path={icons.target} /></div>
            <div className="res-featured-body">
              <h2>Military Wealth Path</h2>
              <p>Enter three numbers, see your dates to each milestone — free, 30 seconds.</p>
              <div className="res-chips">
                <span>$100K</span>
                <span>$500K</span>
                <span>$1M</span>
              </div>
              <span className="res-featured-btn">Run Your Free Projection →</span>
            </div>
          </Link>

          {/* ── Free tools ── */}
          <div className="res-label">Free Tools</div>
          <div className="res-grid res-grid-2">
            {freeTools.map(item => (
              <Link key={item.href} href={item.href} className="res-card">
                <Icon path={item.icon} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <span>{item.action} →</span>
              </Link>
            ))}
          </div>

          {/* ── Learn the system ── */}
          <div className="res-label">Learn the System</div>
          <div className="res-grid res-grid-3">
            {learn.map(item => (
              <Link key={item.href} href={item.href} className="res-card">
                <Icon path={item.icon} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </Link>
            ))}
          </div>

          {/* ── Proof ── */}
          <Link href="/soldiers" className="res-proof">
            <span className="res-proof-num">29+</span>
            <span className="res-proof-text">
              <strong>Soldiers already running the system</strong>
              Real stories, real TSP changes, real debt paid off.
            </span>
            <span className="res-proof-action">See results →</span>
          </Link>

        </div>
      </section>

      {/* ── Playbook email capture ── */}
      <div id="playbook">
        <EmailCapture />
      </div>

      <section className="resources-cta">
        <div className="container-prose">
          <div className="section-tag gold">Start Simple</div>
          <h2>Need a personal plan?</h2>
          <p>Book a free session and I will help you decide what to focus on first: debt, TSP, Roth IRA, benefits, budget, or your next big money move.</p>
          <Link href="/book" className="btn btn-gold btn-lg">Book a Free Session</Link>
        </div>
      </section>
    </main>
  )
}
