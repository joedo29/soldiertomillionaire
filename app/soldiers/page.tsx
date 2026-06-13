import type { Metadata } from 'next'
import Link from 'next/link'
import CountUp from '@/components/CountUp'
import { client, allTestimonialsQuery } from '@/lib/sanity'
import type { Testimonial } from '@/lib/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Soldier Stories — Real Results from Real Soldiers',
  description:
    'Hear directly from US Army soldiers who took control of their financial future after one conversation with Joe Do. Real stories. Real steps. Real results.',
}

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  return (
    <article className="st-card">
      <header className="st-card-header">
        <div className="st-avatar">{t.name.charAt(0)}</div>
        <div>
          <div className="st-name">{t.name}</div>
          <div className="st-branch">{t.branch}</div>
        </div>
        <div className="st-num">#{index + 1}</div>
      </header>

      <div className="st-section">
        <div className="st-section-label challenge">The Challenge</div>
        <p className="st-section-body">&ldquo;{t.challenge}&rdquo;</p>
      </div>

      <div className="st-divider" />

      <div className="st-section">
        <div className="st-section-label breakthrough">The Breakthrough</div>
        <p className="st-section-body">&ldquo;{t.breakthrough}&rdquo;</p>
      </div>

      <div className="st-divider" />

      <div className="st-section advice-section">
        <div className="st-section-label advice">Advice to Fellow Soldiers</div>
        <p className="st-section-body">&ldquo;{t.advice}&rdquo;</p>
      </div>
    </article>
  )
}

export default async function SoldiersPage() {
  const testimonials: Testimonial[] = await client.fetch(allTestimonialsQuery).catch(() => [])

  return (
    <main>

      {/* ── Hero ── */}
      <section className="soldiers-hero">
        <div className="container-prose">
          <div className="section-tag gold">Real Results</div>
          <h1 className="soldiers-hero-headline">
            <CountUp from={1} to={29} suffix="+" /> Soldiers.<br />One System.<br /><em>Real Lives Changed.</em>
          </h1>
          <p className="soldiers-hero-sub">
            These are not polished marketing quotes. These are unedited responses
            from fellow soldiers — in their own words — about what changed after
            one conversation.
          </p>
          <div className="soldiers-hero-ctas">
            <Link href="/book" className="btn btn-gold btn-lg">Book Your Free Session</Link>
            <Link href="/strategy" className="btn btn-outline btn-lg">See the 5-Step System →</Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="trust-section">
        <div className="trust-grid">
          {[
            { num: '29+',  label: 'Soldiers Helped',           countFrom: 1,   countTo: 29,  suffix: '+' },
            { num: '100%', label: 'Free Sessions' },
            { num: '0',    label: 'Upsells or Products' },
            { num: '1',    label: 'Goal: Your Financial Freedom' },
          ].map(s => (
            <div key={s.label} className="trust-card">
              <div className="trust-num">
                {s.countTo != null
                  ? <CountUp from={s.countFrom!} to={s.countTo} suffix={s.suffix} />
                  : s.num}
              </div>
              <div className="trust-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonial grid ── */}
      <section className="soldiers-grid-section">
        <div className="container">
          <div className="section-tag">Soldier Stories</div>
          <h2 className="section-title" style={{ marginBottom: 40 }}>
            In Their Own Words
          </h2>

          {testimonials.length === 0 ? (
            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '60px 0' }}>
              Stories coming soon.
            </p>
          ) : (
            <div className="soldiers-grid">
              {testimonials.map((t, i) => (
                <TestimonialCard key={t._id} t={t} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta-section">
        <div className="about-cta-icon">🎖️</div>
        <h2 className="about-cta-headline">
          Your Name<br /><em>Could Be Next.</em>
        </h2>
        <p className="about-cta-body">
          One free session. No pitch. No products. Just a plan built around
          your military situation — the same way it worked for every soldier
          on this page.
        </p>
        <Link href="/book" className="btn btn-gold btn-lg">Book a Free Session</Link>
        <p className="about-cta-sub">Takes 30 minutes. Could change your financial future.</p>
      </section>

    </main>
  )
}
