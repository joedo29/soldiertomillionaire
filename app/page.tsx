import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { client, recentPostsQuery, urlFor } from '@/lib/sanity'
import type { Post } from '@/lib/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Soldier to Millionaire — Financial Freedom for Those Who Serve',
  description:
    'A Vietnamese immigrant and US Army soldier who went from 3 jobs & zero savings to $750K net worth. Free military finance tracker, benefits guide, and 1-on-1 coaching.',
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
  { emoji: '🐷', gradient: 'g1', cat: 'Investing',  title: 'Why Every Soldier Should Open a Roth IRA Today',        meta: '5 min · Joe Do' },
  { emoji: '🧮', gradient: 'g2', cat: 'Budgeting',  title: 'The 50/30/20 Rule — Military Edition',                   meta: '4 min · Joe Do' },
  { emoji: '🛡️', gradient: 'g3', cat: 'Benefits',   title: 'The TSP Match Is Free Money — Are You Getting It?',     meta: '3 min · Joe Do' },
]

export default async function HomePage() {
  const posts: Post[] = await client.fetch(recentPostsQuery).catch(() => [])

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
                  <div className={`blog-img${post.mainImage ? '' : ' g1'}`}>
                    {post.mainImage ? (
                      <Image
                        src={urlFor(post.mainImage).width(440).height(220).url()}
                        alt={post.title}
                        width={440}
                        height={220}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : '📰'}
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
                  <div className={`blog-img ${p.gradient}`}>{p.emoji}</div>
                  <div className="blog-body">
                    <div className="blog-cat">{p.cat}</div>
                    <div className="blog-title">{p.title}</div>
                    <div className="blog-meta">{p.meta}</div>
                  </div>
                </Link>
              ))}
        </div>
      </section>

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
