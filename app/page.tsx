import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { client, recentPostsQuery, allTestimonialsQuery, urlFor } from '@/lib/sanity'
import type { Post, Testimonial } from '@/lib/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Soldier to Millionaire — Financial Freedom for Those Who Serve',
  description:
    'A Vietnamese immigrant and US Army soldier who went from 3 jobs & zero savings to $750K net worth. Free military finance tracker, benefits guide, and 1-on-1 coaching.',
}

// ── Extract action chips from breakthrough text ───────────────────────────
const ACTION_PATTERNS = [
  { pattern: /roth ira/i,        label: '✅ Roth IRA Opened' },
  { pattern: /tsp/i,             label: '✅ TSP Increased' },
  { pattern: /bank.*bonus|bonus.*bank/i, label: '✅ Bank Bonuses' },
  { pattern: /index fund/i,      label: '✅ Index Funds' },
  { pattern: /emergency fund/i,  label: '✅ Emergency Fund' },
  { pattern: /budget/i,          label: '✅ Budget Built' },
  { pattern: /debt/i,            label: '✅ Debt Tackled' },
  { pattern: /invest/i,          label: '✅ Investing' },
  { pattern: /sav/i,             label: '✅ Saving More' },
]
function extractActions(text: string): string[] {
  const found: string[] = []
  for (const { pattern, label } of ACTION_PATTERNS) {
    if (pattern.test(text) && !found.includes(label)) found.push(label)
    if (found.length >= 3) break
  }
  return found
}

// ── Blog card fallback graphic (used when a post has no cover image) ──────────
const tagMeta: Record<string, { icon: string; accent: string }> = {
  'TSP':              { icon: '📈', accent: '#C9A84C' },
  'Investing':        { icon: '📊', accent: '#C9A84C' },
  'Retirement':       { icon: '🏦', accent: '#4CAF7C' },
  'Budgeting':        { icon: '💰', accent: '#C9A84C' },
  'Military Benefits':{ icon: '🎖️', accent: '#A8C8E8' },
  'Personal Finance': { icon: '🧭', accent: '#C9A84C' },
  'Strategy':         { icon: '♟️', accent: '#C9A84C' },
  'VA Loan':          { icon: '🏠', accent: '#4CAF7C' },
  'Real Estate':      { icon: '🏠', accent: '#4CAF7C' },
  'Home Buying':      { icon: '🔑', accent: '#4CAF7C' },
  'Personal Story':   { icon: '🎯', accent: '#E8A84C' },
  'Roth IRA':         { icon: '📈', accent: '#C9A84C' },
}
const defaultMeta = { icon: '📋', accent: '#C9A84C' }

function BlogImgFallback({ tag, title }: { tag?: string; title: string }) {
  const meta = (tag ? tagMeta[tag] : null) ?? defaultMeta
  return (
    <div className="blog-img-fallback">
      <div className="bif-bg" />
      <div className="bif-icon">{meta.icon}</div>
      <div className="bif-label" style={{ color: meta.accent }}>
        {tag ?? 'Finance'}
      </div>
      <div className="bif-wordmark">S2M</div>
    </div>
  )
}

const journey = [
  {
    icon: '✈️',
    year: '2008 · Age 20',
    title: 'Arrived in America',
    desc: 'Came from Vietnam with nothing. Worked 3 jobs. Lived paycheck to paycheck for nearly a decade.',
    amount: null,
    highlight: false,
  },
  {
    icon: '📖',
    year: '2018 · Age 30',
    title: 'The Wake-Up Call',
    desc: 'Hawaii trip with $20 in my pocket. Read The Intelligent Investor. Opened my first tax-advantaged account. Started investing in the S&P 500.',
    amount: null,
    highlight: false,
  },
  {
    icon: '📈',
    year: '2022 · Age 35',
    title: 'First $100K',
    desc: 'Hit the hardest milestone. Proof that discipline beats income every time.',
    amount: '$100,000',
    highlight: false,
  },
  {
    icon: '🏆',
    year: '2025 · Age 38',
    title: 'Financial Freedom',
    desc: 'Reached $750K through seven years of disciplined saving and investing. Enlisted in the US Army in January 2026 and began teaching fellow soldiers to build the same wealth.',
    amount: '$750,000',
    highlight: true,
  },
]

const pillars = [
  { num: '01', name: 'Create Wealth',  desc: 'Numbers don\'t lie. Track, invest, grow.' },
  { num: '02', name: 'Family First',   desc: 'My wife and daughter\'s smiles are the mission.' },
  { num: '03', name: 'True Freedom',   desc: 'Movies on a Tuesday. No permission needed.' },
  { num: '04', name: 'Pay It Forward', desc: 'Help others achieve the same. This site.' },
]

const benefits = [
  { text: 'TSP (Thrift Savings Plan) matching',  tag: 'FREE $'     },
  { text: 'BRS & pension contributions',          tag: 'Retirement' },
  { text: 'VA Home Loan — zero down',             tag: 'Housing'    },
  { text: 'SCRA interest rate cap',               tag: 'Savings'    },
  { text: 'MyCAA & tuition assistance',           tag: 'Education'  },
]

const placeholderPosts = [
  { tag: 'Investing', title: 'Why Every Soldier Should Open a Roth IRA Today',    meta: '5 min · Joe Do' },
  { tag: 'Budgeting', title: 'The 50/30/20 Rule — Military Edition',              meta: '4 min · Joe Do' },
  { tag: 'TSP',       title: 'The TSP Match Is Free Money — Are You Getting It?', meta: '3 min · Joe Do' },
]

export default async function HomePage() {
  const posts: Post[] = await client.fetch(recentPostsQuery).catch(() => [])
  const testimonials: Testimonial[] = await client.fetch(allTestimonialsQuery).catch(() => [])

  return (
    <main>
      {/* ── Hero ── */}
      <section className="hero" aria-label="Hero">
        <div className="hero-badge">★&nbsp; From Basic Training to $750K</div>
        <h1 className="hero-headline">
          From<br />Broke<br /><em>To Free.</em>
        </h1>
        <p className="hero-sub">
          A Vietnamese immigrant. A US soldier. A dad. I went from 3 jobs &amp; zero
          savings to $750K — and I&apos;ll show you exactly how.
        </p>
        <div className="hero-cta">
          <Link href="/book"     className="btn btn-gold">Start Your Plan</Link>
          <Link href="/my-story" className="btn btn-outline">My Story</Link>
        </div>
        <div className="hero-stats" role="list">
          <div className="stat" role="listitem">
            <div className="stat-num">$750K</div>
            <div className="stat-label">Net Worth</div>
          </div>
          <div className="stat" role="listitem">
            <div className="stat-num">8 yrs</div>
            <div className="stat-label">To Freedom</div>
          </div>
          <div className="stat" role="listitem">
            <div className="stat-num">27+</div>
            <div className="stat-label">Soldiers Helped</div>
          </div>
        </div>
      </section>

      {/* ── Story strip ── */}
      <div className="story-strip">
        <div className="section-tag gold">The Turning Point</div>
        <blockquote className="strip-quote">
          &ldquo;At 30, I was working 3 jobs and still broke. At 38, I hit $750K.
          The military gave me the discipline. This site gives you the roadmap.&rdquo;
        </blockquote>
        <p className="strip-attr">— Joe Do, US Army &amp; Founder</p>
      </div>

      {/* ── Journey ── */}
      <section className="journey-section" aria-label="My journey">
        <div className="section-tag">The Journey</div>
        <h2 className="section-title">From Zero<br />to $750,000</h2>
        <p className="section-sub">Real milestones. Real numbers. No shortcuts — just a proven system.</p>
        <div className="journey">
          {journey.map(j => (
            <div key={j.year} className={`j-card${j.highlight ? ' highlight' : ''}`}>
              <div className={`j-icon${j.highlight ? ' green' : ''}`}>{j.icon}</div>
              <div>
                <div className="j-year">{j.year}</div>
                <div className="j-title">{j.title}</div>
                <p className="j-desc">{j.desc}</p>
                {j.amount && <div className="j-amount">{j.amount}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4 Pillars ── */}
      <section className="pillars-section" aria-label="4 Pillars of a fulfilled life">
        <div className="section-tag gold">The Framework</div>
        <h2 className="section-title white">4 Pillars of<br />a Fulfilled Life</h2>
        <p className="section-sub muted">Wealth is just one piece. Here&apos;s the full mission.</p>
        <div className="pillar-grid">
          {pillars.map(p => (
            <div key={p.num} className="pillar">
              <div className="pillar-num">{p.num}</div>
              <div className="pillar-name">{p.name}</div>
              <p className="pillar-desc">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Military benefits preview ── */}
      <section className="benefits-section" aria-label="Military benefits">
        <div className="section-tag">For Soldiers</div>
        <h2 className="section-title">Military Benefits<br />You&apos;re Leaving on<br />the Table</h2>
        <p className="section-sub">Most soldiers don&apos;t know about these. I didn&apos;t either — until I dug in.</p>
        <div className="benefit-list">
          {benefits.map(b => (
            <div key={b.text} className="b-item">
              <div className="b-dot" />
              <span className="b-text">{b.text}</span>
              <span className="b-tag">{b.tag}</span>
            </div>
          ))}
        </div>
        <div className="benefits-cta mt-4">
          <Link href="/military-benefits">See all benefits →</Link>
        </div>
      </section>

      {/* ── Blog preview ── */}
      <section className="blog-preview-section" aria-label="Latest posts">
        <div className="blog-preview-header">
          <div className="section-tag">Latest Intel</div>
          <h2 className="section-title">From the Field</h2>
        </div>
        <div className="blog-scroll">
          {posts.length > 0
            ? posts.map(post => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug.current}`}
                  className="blog-card"
                >
                  <div className="blog-img">
                    {post.mainImage ? (
                      <Image
                        src={urlFor(post.mainImage).width(440).height(220).url()}
                        alt={post.title}
                        width={440}
                        height={220}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <BlogImgFallback tag={post.tags?.[0]} title={post.title} />
                    )}
                  </div>
                  <div className="blog-body">
                    <div className="blog-cat">{post.tags?.[0] ?? 'Finance'}</div>
                    <div className="blog-title">{post.title}</div>
                    <div className="blog-meta">Joe Do</div>
                  </div>
                </Link>
              ))
            : placeholderPosts.map(p => (
                <Link key={p.title} href="/blog" className="blog-card">
                  <div className="blog-img">
                    <BlogImgFallback tag={p.tag} title={p.title} />
                  </div>
                  <div className="blog-body">
                    <div className="blog-cat">{p.tag}</div>
                    <div className="blog-title">{p.title}</div>
                    <div className="blog-meta">{p.meta}</div>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* ── Soldier Stories ── */}
      {testimonials.length > 0 && (
        <section className="home-testimonials">
          <div className="container">
            <div className="ht-header">
              <div>
                <div className="section-tag">Soldier Stories</div>
                <h2 className="section-title">Real Soldiers.<br />Real Results.</h2>
              </div>
              <Link href="/soldiers" className="btn btn-outline-dark">
                Read All Stories →
              </Link>
            </div>
            <div className="ht-scroll-wrap">
              <div className="ht-scroll">
                {testimonials.slice(0, 3).map(t => (
                  <div key={t._id} className="ht-card">
                    <div className="ht-quote">&ldquo;{t.advice}&rdquo;</div>
                    <div className="ht-actions">
                      {extractActions(t.breakthrough).map(a => (
                        <span key={a} className="ht-action-chip">{a}</span>
                      ))}
                    </div>
                    <div className="ht-soldier">
                      <div className="ht-avatar">{t.name.charAt(0)}</div>
                      <div>
                        <div className="ht-soldier-name">{t.name}</div>
                        <div className="ht-soldier-branch">{t.branch}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Swipe hint — visible on mobile only */}
              <div className="ht-swipe-hint" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                Swipe to see more
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Booking CTA ── */}
      <section className="booking-section" aria-label="Book a session">
        <div className="booking-icon">🗓️</div>
        <h2 className="booking-title">Let&apos;s Talk.<br />Your Mission Starts Here.</h2>
        <p className="booking-sub">
          Book a free 30-minute strategy session. I&apos;ll help you build your personal
          financial freedom plan — tailored to your military situation.
        </p>
        <Link href="/book" className="btn btn-gold btn-full btn-lg">
          Book a Free Session
        </Link>
        <p className="booking-small">No cost. No pitch. Just a plan.</p>
      </section>
    </main>
  )
}
