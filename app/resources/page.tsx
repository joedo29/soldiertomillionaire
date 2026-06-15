import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Resources — Soldier to Millionaire',
  description:
    'Practical Soldier to Millionaire resources for military personal finance, investing, military benefits, books, and real soldier results.',
  keywords: ['military finance resources', 'soldier financial freedom', 'TSP investing', 'military benefits', 'finance books for soldiers'],
}

const resources = [
  {
    href: '/blog',
    eyebrow: 'Latest Intel',
    title: 'Blog',
    body: 'Field notes on saving, investing, military money, family freedom, and the lessons I am learning as I build Soldier to Millionaire.',
    action: 'Read the blog',
  },
  {
    href: '/military-benefits',
    eyebrow: 'For Soldiers',
    title: 'Military Benefits',
    body: 'A plain-English guide to TSP, VA loans, SCRA, education benefits, insurance, housing allowance, and other programs soldiers often miss.',
    action: 'Explore benefits',
  },
  {
    href: '/books',
    eyebrow: 'Reading List',
    title: 'Books',
    body: 'The books that shaped how I think about money, discipline, data, family, purpose, and long-term decision-making.',
    action: 'See the list',
  },
  {
    href: '/soldiers',
    eyebrow: 'Real Results',
    title: 'Results',
    body: 'Stories and testimonials from soldiers who started changing their TSP, budgeting, debt, and investing after learning the system.',
    action: 'See results',
  },
]

export default function ResourcesPage() {
  return (
    <main>
      <div className="page-hero resources-hero">
        <div className="section-tag gold">Resources</div>
        <h1>Tools for<br />the Mission</h1>
        <p>Everything I am building to help soldiers learn the system, use their benefits, and keep moving toward freedom.</p>
      </div>

      <section className="resources-section">
        <div className="container">
          <div className="resources-grid">
            {resources.map(item => (
              <Link key={item.href} href={item.href} className="resource-card">
                <div className="resource-eyebrow">{item.eyebrow}</div>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
                <span>{item.action} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
