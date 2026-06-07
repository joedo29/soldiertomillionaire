import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Joe Do — Soldier, Investor, Battle Buddy',
  description:
    'From Vietnam to $750K net worth in 8 years. Joe Do is a US Army soldier who went from 3 jobs and $20 in his pocket to financial freedom — and now helps soldiers build theirs.',
  keywords: [
    'Joe Do soldier to millionaire', 'military financial freedom', 'army investor story',
    'immigrant to millionaire', 'US Army financial coach', 'soldier financial advice',
  ],
}

const timeline = [
  {
    icon: '✈️',
    year: '2008 · Age 20',
    title: 'Arrived in America from Vietnam',
    body: 'No money. Limited English. No network. Worked three jobs while going to school for Computer Science. Lived paycheck to paycheck for nearly a decade.',
  },
  {
    icon: '💻',
    year: 'Seattle Years',
    title: 'Software Developer — Building Digital Products',
    body: 'Built websites and mobile apps at Ratio. Learned how to architect systems that work — a mindset I later applied directly to personal finance.',
  },
  {
    icon: '🦷',
    year: 'Hands-On Work',
    title: 'Dental Lab & Restaurant',
    body: 'Worked hands-on jobs while surviving and learning the value of every dollar earned. No job was beneath me — every shift was an investment in my future.',
  },
  {
    icon: '📊',
    year: 'Bellevue, Washington',
    title: 'Data Analyst',
    body: 'Learned to see patterns in numbers — a skill that transformed how I looked at my own finances. Data doesn\'t lie. Emotion does.',
  },
  {
    icon: '🤝',
    year: 'Nonprofit Service',
    title: 'Open Doors for Multicultural Families',
    body: 'Served families and people with developmental and intellectual disabilities. Taught me compassion, patience, and what it means to truly help someone.',
  },
  {
    icon: '🏥',
    year: '2022 — North Carolina',
    title: 'Duke University — Healthcare IT',
    body: 'Worked with large-scale healthcare data and discovered how evidence-based decisions improve patient care and drug discovery. Applied that same discipline to investing.',
  },
  {
    icon: '🎖️',
    year: 'January 2026',
    title: 'Enlisted in the U.S. Army',
    body: 'Reached financial freedom and chose to serve. Since Basic Combat Training, I have shared my financial system with 27+ soldiers. This website is how I reach thousands more.',
    highlight: true,
  },
]

const shaped = [
  {
    icon: '💻',
    title: 'Software Taught Me How to Build Systems',
    body: 'Good software is not clever — it is simple, repeatable, and scalable. I applied the same logic to personal finance. A system that works does not need you to be smart every day. It just needs you to show up.',
  },
  {
    icon: '🤝',
    title: 'Nonprofit Work Taught Me Compassion and Service',
    body: 'Working with vulnerable families taught me that the point of wealth is not to accumulate — it is to create options, reduce stress, and protect the people you love. Money is a tool, not a trophy.',
  },
  {
    icon: '📈',
    title: 'Healthcare Data Taught Me Evidence-Based Decisions',
    body: 'In healthcare, you do not guess. You follow the data. I brought that discipline to investing: no stock picks, no hot tips, no emotional decisions. Just index funds, consistency, and time.',
  },
]

const systemPills = [
  '💰 Save Aggressively (50%+)',
  '🏛️ Max Tax-Advantaged Accounts',
  '📈 S&P 500 Index Funds',
  '🚫 No Lifestyle Inflation',
  '🏠 Pay Off Debt Fast',
  '🔄 Never Sell',
]

const familyPillars = [
  { icon: '💰', title: 'Creating Wealth',    body: 'Building a financial foundation that removes stress from the family — so money is never the reason we can\'t say yes to something that matters.' },
  { icon: '😊', title: 'Creating Happiness', body: 'My wife Truc and daughter Summer are the mission. Everything I build is for the life I want them to have.' },
  { icon: '🕊️', title: 'Creating Freedom',   body: 'Freedom to choose your schedule. Freedom to say no. Freedom to be present. That is what money is for — not stuff.' },
  { icon: '📣', title: 'Paying It Forward',  body: 'Sharing the system with soldiers who remind me of who I was. If I can do it, so can you — and now you don\'t have to figure it out alone.' },
]

const whyStats = [
  'Made financial mistakes early — and recovered',
  'Built wealth on a normal income — no shortcuts',
  'Paid off a home in 2 years, 9 months',
  'Used every tax-advantaged account available',
  'Saved $750K through discipline, not luck',
  'Now sharing the system — soldier to soldier',
]

export default function AboutPage() {
  return (
    <main>

      {/* ══════════════════════════════════════
          1. HERO
      ══════════════════════════════════════ */}
      <section className="about-hero">
        <div className="about-hero-inner container">

          <div className="about-hero-text">
            <div className="about-badge">🎖️&nbsp; US Army · Active Duty</div>
            <h1 className="about-hero-headline">
              I&apos;m Not a<br />
              Financial Guru.<br />
              <em>I&apos;m Your Battle<br />Buddy.</em>
            </h1>
            <p className="about-hero-sub">
              I went from working three jobs, living paycheck to paycheck, and having
              $20 in my pocket — to building a $750,000 net worth, paying off my house
              in under three years, and now helping soldiers build their own path to
              financial freedom.
            </p>
            <div className="about-hero-ctas">
              <Link href="/book" className="btn btn-gold btn-lg">Start Your Financial Freedom Plan</Link>
              <Link href="/strategy" className="btn btn-outline btn-lg">See the 5-Step System →</Link>
            </div>
          </div>

          <div className="about-hero-photo">
            <Image
              src="/hero-image.png"
              alt="Joe Do — US Army soldier, arms crossed in front of American flag at sunset"
              width={520}
              height={680}
              priority
              style={{ objectFit: 'cover', objectPosition: 'center 15%' }}
            />
            <div className="photo-tag">★ $0 → $750K · 8 Years</div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════
          2. TRUST SNAPSHOT
      ══════════════════════════════════════ */}
      <section className="trust-section">
        <div className="trust-grid container">
          {[
            { num: '$750K',  label: 'Net Worth Built' },
            { num: '2Y 9M', label: 'House Paid Off' },
            { num: '27+',   label: 'Soldiers Helped' },
            { num: 'Active',label: 'U.S. Army, Enlisted 2026' },
          ].map(s => (
            <div key={s.num} className="trust-card">
              <div className="trust-num">{s.num}</div>
              <div className="trust-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          3. WHO IS JOE
      ══════════════════════════════════════ */}
      <section className="about-intro">
        <div className="about-intro-inner container">
          <div>
            <div className="section-tag">In His Own Words</div>
            <blockquote className="intro-quote">
              &ldquo;I am not here to impress you with my net worth. I am here because
              I know what it feels like to have nothing — and I found the system that
              changes everything.&rdquo;
              <cite>— Joe Do, US Army &amp; Founder</cite>
            </blockquote>
          </div>
          <div className="intro-body">
            <p>
              My name is Joe Do. I came to America from Vietnam in 2008 at 20 years old
              with no money, limited English, and no network. I worked three jobs, went to
              school for Computer Science, and spent years surviving — not building.
            </p>
            <p>
              I worked in software development, data analytics, nonprofit service, and
              healthcare IT at Duke University. Each chapter of my career gave me something
              different: systems thinking, compassion, evidence-based decision making. None
              of it made me rich. <strong>Discipline and a simple financial system did.</strong>
            </p>
            <p>
              In January 2026, at 38, I enlisted in the U.S. Army — not because I needed
              to, but because I wanted to serve and because I saw an opportunity to help
              young soldiers who reminded me of who I used to be.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          4. TIMELINE
      ══════════════════════════════════════ */}
      <section className="about-timeline-section">
        <div className="container-prose">
          <div className="section-tag">The Journey</div>
          <h2 className="section-title">Every Chapter<br />Prepared Me for This</h2>
          <div className="about-timeline">
            {timeline.map((t, i) => (
              <div key={i} className={`tl-item${t.highlight ? ' tl-highlight' : ''}`}>
                <div className="tl-dot">{t.icon}</div>
                <div className="tl-content">
                  <div className="tl-year">{t.year}</div>
                  <div className="tl-title">{t.title}</div>
                  <p className="tl-body">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          5. WHAT SHAPED ME
      ══════════════════════════════════════ */}
      <section className="shaped-section">
        <div className="container">
          <div className="section-tag gold">The Foundation</div>
          <h2 className="section-title white">What Every Career<br />Taught Me</h2>
          <div className="shaped-grid">
            {shaped.map(s => (
              <div key={s.title} className="shaped-card">
                <div className="shaped-icon">{s.icon}</div>
                <div className="shaped-title">{s.title}</div>
                <p className="shaped-body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          6. WHY I BUILT S2M
      ══════════════════════════════════════ */}
      <section className="why-section">
        <div className="why-inner container">
          <div>
            <div className="section-tag">My Mission</div>
            <h2 className="section-title">Why I Built<br />Soldier to Millionaire</h2>
            <div className="why-body">
              <p>
                Everything I have done led me here. I am turning 39 in 2026 — almost
                twice the age of many soldiers I meet. I have already made the financial
                mistakes. I have already learned the hard lessons, built wealth, paid off
                a home, invested consistently, and created systems that actually work.
              </p>
              <p>
                I realized I have experience that many young soldiers have not had yet.
                And I have a responsibility to share it — not as a financial advisor, but
                as a battle buddy who has already walked the path.
              </p>
              <p>
                <strong>This site exists because I wish someone had done this for me at 20.</strong>
              </p>
            </div>
          </div>
          <div className="why-callout">
            <div className="why-callout-tag">The Advantage I Had at 38</div>
            <div className="why-callout-title">Every mistake becomes a lesson. Every lesson becomes your shortcut.</div>
            <div className="why-stat-row">
              {whyStats.map(s => (
                <div key={s} className="why-stat">
                  <div className="why-stat-dot" />
                  <span className="why-stat-text">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          7. BATTLE BUDDY PROMISE
      ══════════════════════════════════════ */}
      <section className="promise-section">
        <div className="promise-inner">
          <div className="promise-badge">★&nbsp; The Promise</div>
          <h2 className="promise-headline">
            I&apos;m Not Here to Sell You a Dream.<br />
            I&apos;m Here to Share the System I Actually Used.
          </h2>
          <p className="promise-body">
            I am not someone repeating what I heard online. I am sharing what I personally
            did — the exact moves that took me from $20 in Hawaii to $750,000 in net worth.
            No fluff. No theory. Just a system that works when you have the discipline to
            follow it.
          </p>
          <div className="system-pills">
            {systemPills.map(p => (
              <span key={p} className="system-pill">{p}</span>
            ))}
          </div>
          <Link href="/strategy" className="btn btn-gold btn-lg">
            Get the 5-Step System →
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════
          8. FAMILY & FREEDOM
      ══════════════════════════════════════ */}
      <section className="family-section">
        <div className="family-inner container">
          <div className="family-quote-block">
            <span className="family-quote-mark">&ldquo;</span>
            <p className="family-quote">
              Truc&apos;s smile. Summer&apos;s laugh. That&apos;s what financial
              freedom actually looks like.
            </p>
          </div>
          <div>
            <div className="section-tag">Family &amp; Freedom</div>
            <h2 className="section-title" style={{ marginBottom: 20 }}>The Real Reason<br />Behind All of It</h2>
            <div className="family-pillars">
              {familyPillars.map(p => (
                <div key={p.title} className="fp-card">
                  <div className="fp-icon">{p.icon}</div>
                  <div className="fp-title">{p.title}</div>
                  <p className="fp-body">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          9. FINAL CTA
      ══════════════════════════════════════ */}
      <section className="about-cta-section">
        <div className="about-cta-icon">🗓️</div>
        <h2 className="about-cta-headline">
          Your Mission<br /><em>Starts Here.</em>
        </h2>
        <p className="about-cta-body">
          You do not need to be rich to start. You need a system, discipline, and someone
          willing to show you the path. I have already walked it. Let me show you the way.
        </p>
        <Link href="/book" className="btn btn-gold btn-lg">Book a Free Session</Link>
        <p className="about-cta-sub">No cost. No pitch. Just a plan built around your military situation.</p>
      </section>

    </main>
  )
}
