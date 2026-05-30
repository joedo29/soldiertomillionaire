import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The Strategy — How I Built $750K on an Army Salary',
  description:
    'The exact three-part financial freedom strategy I used: aggressive saving, tax-advantaged accounts (TSP + Roth IRA), and S&P 500 index fund investing.',
  keywords: ['military financial strategy', 'TSP investing strategy', 'S&P 500 index fund investing', 'Roth IRA military', 'how to invest in the army'],
}

const strategies = [
  {
    num: '01',
    tag: 'The Foundation',
    title: 'Save Aggressively — Before You Invest Anything',
    body: [
      `Before you touch any investment account, you have to fix the leak. Most soldiers lose money not because they earn too little — but because spending expands to fill income. The answer is a spending plan before the money hits your account.`,
      `My rule: the moment my paycheck lands, I move my savings target out first. What's left is my "spending allowance." I never budgeted what I spent. I budgeted what I saved. Everything else was free.`,
      `Start with 15% of take-home. If that's impossible right now, start with 5%. Increase by 1% every time you get a raise. Automate it so you never see the money. No willpower needed.`,
    ],
    callout: 'Target: Save 20–30% of take-home. Automate it. Never touch it.',
  },
  {
    num: '02',
    tag: 'The Engine',
    title: 'Max Tax-Advantaged Accounts First — Always',
    body: [
      `This is the most important move most soldiers never make. Tax-advantaged accounts (TSP, Roth IRA, HSA) let your money grow without the government taking a cut each year. That difference compounds into hundreds of thousands of dollars over decades.`,
      `Priority order for military:\n1. TSP up to the match — this is free money from the government. Never leave it.\n2. Roth IRA (max: $7,000/year in 2025) — especially powerful if you're in a combat zone because contributions may be tax-free.\n3. TSP up to the annual limit ($23,500 in 2025).\n4. Taxable brokerage — only after the above are maxed.`,
      `If you do nothing else from this page, do this: log in to MyPay today and set your TSP contribution to at least 5% to capture the full match.`,
    ],
    callout: 'First dollar in → TSP match. Next → Roth IRA. Then → TSP max. Then → taxable.',
  },
  {
    num: '03',
    tag: 'The Multiplier',
    title: 'Invest 100% in S&P 500 Index Funds — and Never Sell',
    body: [
      `I don't pick stocks. I don't time the market. I don't follow CNBC. I put every dollar in the C Fund (TSP) or a low-cost S&P 500 index fund (VFIAX, FXAIX, or VOO) and I wait.`,
      `Why the S&P 500? Because over any 20-year period in history, it has never lost money. The average annual return is ~10%. Compounding 10% over 20–30 years turns small monthly contributions into life-changing wealth.`,
      `The enemy of investing isn't a bear market — it's you selling during one. I experienced multiple downturns between 2018 and 2025. I never sold. Each dip was a sale. The market always recovered.`,
      `One number to internalize: $500/month invested at 10% annual return for 25 years = $598,000. You don't need to be a genius. You need to be consistent.`,
    ],
    callout: 'C Fund (TSP) + Roth IRA (VFIAX/VOO). Set it. Forget it. Never sell in panic.',
  },
]

const faqs = [
  {
    q: 'What if I have debt? Do I invest first or pay it off?',
    a: 'Pay high-interest debt (credit cards, personal loans above 7%) first. But always contribute at least enough to TSP to get the full match — that\'s a guaranteed 100% return. For low-interest debt (student loans below 5%), invest in parallel.',
  },
  {
    q: 'I only make E-4 pay. Can this still work?',
    a: 'Yes. I started with less. The math doesn\'t care about your rank — it cares about your savings rate. An E-4 investing 20% of take-home consistently will massively outperform an O-3 who spends everything. Rank up, but start now.',
  },
  {
    q: 'What about the housing allowance — should I buy or rent?',
    a: 'Don\'t buy unless you plan to stay 3+ years and the local market makes sense. BAH is powerful — it fully covers rent in most markets and doesn\'t touch your base pay. Bank the difference. The VA loan is incredible but only use it when the timing is right.',
  },
  {
    q: 'When do I know I\'m financially free?',
    a: 'The simple definition: when your investments generate enough passive income to cover your expenses. The milestone is a net worth of 25× your annual expenses (the 4% rule). For many military families, that\'s between $750K–$1.5M.',
  },
]

export default function StrategyPage() {
  return (
    <main>
      <div className="page-hero">
        <div className="section-tag gold">The Strategy</div>
        <h1>How I Built<br />$750K on an<br />Army Salary</h1>
        <p>Three steps. No shortcuts. Repeatable by anyone in uniform.</p>
      </div>

      <section style={{ padding: '40px 20px 16px' }}>
        <div className="container-prose">
          <p style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 17, color: 'var(--text-light)', lineHeight: 1.65, marginBottom: 8 }}>
            This is the exact playbook I used. Not theory — I applied every word of this
            between 2018 and 2025 and went from $0 to $750K. It works because it&apos;s simple
            enough to actually do.
          </p>
        </div>
      </section>

      <section style={{ padding: '16px 20px 40px' }}>
        <div className="container-prose">
          {strategies.map((s, i) => (
            <div key={s.num} className="strategy-card">
              <div className="strategy-num">{s.num}</div>
              <div style={{ display: 'inline-block', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--army-light)', fontWeight: 600, marginBottom: 8 }}>
                {s.tag}
              </div>
              <h2 className="strategy-title">{s.title}</h2>
              {s.body.map((p, j) => (
                <p key={j} className="strategy-desc" style={{ marginBottom: j < s.body.length - 1 ? 14 : 0, whiteSpace: 'pre-line' }}>{p}</p>
              ))}
              <div style={{ background: 'var(--army-dim)', border: '1px solid rgba(45,74,30,0.2)', borderRadius: 8, padding: '12px 16px', marginTop: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--army)', fontWeight: 600 }}>📌 {s.callout}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: 'var(--bg-2)', padding: '40px 20px' }}>
        <div className="container-prose">
          <div className="section-tag">Common Questions</div>
          <h2 className="section-title" style={{ marginBottom: 24 }}>Soldiers Ask Me This</h2>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{f.q}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.65 }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="booking-section">
        <div className="booking-icon">🗓️</div>
        <h2 className="booking-title">Want Me to Build<br />Your Personal Plan?</h2>
        <p className="booking-sub">
          Every soldier&apos;s situation is different. Book a free 30-minute session and
          I&apos;ll walk you through exactly what to do with your specific pay, benefits, and goals.
        </p>
        <Link href="/book" className="btn btn-gold btn-full btn-lg">Book a Free Session</Link>
        <p className="booking-small">No cost. No pitch. Just a plan.</p>
      </section>
    </main>
  )
}
