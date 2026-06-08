import type { Metadata } from 'next'
import { client, allTestimonialsQuery } from '@/lib/sanity'
import type { Testimonial } from '@/lib/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Book a Free Session — Soldier to Millionaire',
  description:
    'Book a free 30-minute financial strategy session with Joe Do — a US Army soldier who built $750K net worth. Get a personalized military financial freedom plan.',
  keywords: ['military financial coaching', 'free financial planning soldiers', 'army financial advisor', 'military wealth coaching'],
}

const features = [
  { icon: '🎯', title: 'Personalized to your situation', desc: 'Your rank, pay, benefits, and goals — not generic advice.' },
  { icon: '💰', title: 'TSP & Roth IRA setup', desc: 'I\'ll walk you through the exact accounts to open and how much to put in.' },
  { icon: '🏠', title: 'VA Loan & BAH strategy', desc: 'How to turn your housing benefits into a wealth-building tool.' },
  { icon: '📈', title: 'Investment plan', desc: 'Simple S&P 500 strategy that works on any military salary.' },
  { icon: '🗓️', title: '30 minutes, structured', desc: 'I come prepared. We leave with a written action plan.' },
  { icon: '❤️', title: '100% free. No pitch.', desc: 'I\'m not selling anything. This is how I give back.' },
]

export default async function BookPage() {
  const testimonials: Testimonial[] = await client.fetch(allTestimonialsQuery).catch(() => [])
  // Rotate through testimonials by day so it feels fresh without being random on every load
  const featured = testimonials.length > 0
    ? testimonials[Math.floor(Date.now() / 86400000) % testimonials.length]
    : null

  return (
    <main>
      <div className="page-hero">
        <div className="section-tag gold">Free Coaching</div>
        <h1>Let&apos;s Build<br />Your Plan.</h1>
        <p>30 minutes. Your rank, your pay, your goals. We leave with a written action plan.</p>
      </div>

      <section className="book-page">
        <div className="container-prose">

          {/* What we cover */}
          <div className="section-tag" style={{ marginBottom: 16 }}>What We Cover</div>
          <div className="book-card">
            {features.map(f => (
              <div key={f.title} className="book-feature">
                <div className="book-feature-icon">{f.icon}</div>
                <div className="book-feature-text">
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Booking CTA */}
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '32px 24px', textAlign: 'center', marginBottom: 24,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗓️</div>
            <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, marginBottom: 10 }}>
              Pick a Time That Works
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 24, lineHeight: 1.6 }}>
              Sessions are available evenings and weekends. All time zones welcome —
              I work around your duty schedule.
            </p>
            <a
              href="https://cal.com/soldiertomillionaire/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold btn-full btn-lg"
            >
              Choose a Time →
            </a>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 12 }}>
              Opens in a new tab · Free · No account required to book
            </p>
          </div>

          {/* Social proof — pulled from Sanity */}
          {featured && (
            <div style={{ background: 'var(--army)', borderRadius: 14, padding: '24px 20px' }}>
              <div className="section-tag gold" style={{ marginBottom: 16 }}>What Soldiers Say</div>

              {/* Before */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Before</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>
                  &ldquo;{featured.challenge}&rdquo;
                </p>
              </div>

              {/* After */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>After</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>
                  &ldquo;{featured.breakthrough}&rdquo;
                </p>
              </div>

              {/* Standout quote — advice */}
              <blockquote style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 18, color: '#fff', lineHeight: 1.6, borderLeft: '3px solid var(--gold)', paddingLeft: 16, marginBottom: 14 }}>
                &ldquo;{featured.advice}&rdquo;
              </blockquote>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                — {featured.name}, {featured.branch}
              </p>
            </div>
          )}

          <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
            I am not a licensed financial advisor. Sessions are educational and based on my personal
            experience. Please consult a licensed professional for personalized financial advice.
          </p>
        </div>
      </section>
    </main>
  )
}
