import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The Strategy — How I Built $750K on an Army Salary',
  description:
    'The exact five-step financial freedom strategy I used: become debt free, save aggressively, max tax-advantaged accounts, invest in S&P 500, and pay off your home fast.',
  keywords: ['military financial strategy', 'TSP investing strategy', 'S&P 500 index fund investing', 'Roth IRA military', 'how to invest in the army', 'military debt free', 'pay off mortgage early'],
}

const strategies = [
  {
    num: '01',
    tag: 'Step One',
    title: 'Become Debt Free',
    body: [
      `Before you do anything else, eliminate your debt. Debt is a guaranteed negative return. If you are paying 20% interest on a credit card, that is the same as losing 20% on every dollar you hold — no investment in the world reliably beats that.`,
      `List every debt you have — credit cards, car loans, personal loans, student loans. Order them from highest interest rate to lowest. Attack the highest rate first while making minimum payments on the rest. Every dollar you free up goes to the next debt on the list. This is called the avalanche method, and it is the mathematically optimal approach.`,
      `The one exception: if your employer offers a retirement account match, always contribute enough to capture it — even while paying off debt. A 100% match is a guaranteed return that beats almost any interest rate. Outside of that, eliminate the debt first. Everything else waits.`,
    ],
    callout: 'No debt, no drag. Every dollar you earn works for you — not for your lender.',
  },
  {
    num: '02',
    tag: 'Step Two',
    title: 'Save Aggressively — At Least 50% of Your Income',
    body: [
      `Once you are debt free, the mission shifts to saving as much as possible. I saved roughly 60% of my income. I lived well below my means and refused to let my lifestyle grow with my income. Every raise, every bonus, every extra dollar went into the system — not into a bigger apartment or a newer car.`,
      `Most people budget their spending. I budgeted my saving. The moment my paycheck landed, I moved my savings target out first. Whatever was left was my spending allowance. I did not need willpower — the system made the decision for me automatically.`,
      `If 50% feels impossible right now, start with 20% and increase by 5% every time your income goes up. The military gives you a huge advantage here: housing, healthcare, and food can all be subsidized, which dramatically reduces your cost of living compared to civilians. Use that advantage. Your civilian peers cannot.`,
    ],
    callout: 'Target: Save at least 50% of take-home. Automate it before you can spend it.',
  },
  {
    num: '03',
    tag: 'Step Three',
    title: 'Max Out Every Tax-Advantaged Account',
    body: [
      `Tax-advantaged accounts are the single most powerful legal tool available to build wealth. The government lets your money grow — and in some cases lets you contribute — without paying taxes. That difference, compounded over decades, is worth hundreds of thousands of dollars.`,
      `Fill them in this order:\n1. Employer-sponsored retirement account (TSP for military) — at minimum, contribute enough to capture the full employer match. This is free money you cannot afford to leave on the table.\n2. Personal Roth IRA — max it every year ($7,000 in 2025). If you are deployed to a combat zone and receiving tax-free pay, your Roth IRA contributions may also go in tax-free — one of the best wealth-building opportunities in the entire tax code.\n3. Health Savings Account (HSA) — triple tax advantage: contributions are pre-tax, growth is tax-free, and withdrawals for medical expenses are tax-free.\n4. 529 College Savings Account — if you have children, open one and start funding it. The earlier you start, the more compounding works in your favor.\n5. Go back and max the employer retirement account — after the above are funded, maximize your TSP contribution ($23,500 in 2025).`,
      `Only after all of the above are maxed should you invest in a taxable brokerage account.`,
    ],
    callout: 'Order: Employer match → Roth IRA → HSA → 529 → Max employer account → Taxable brokerage.',
  },
  {
    num: '04',
    tag: 'Step Four',
    title: 'Invest Everything in S&P 500 Index Funds — and Never Sell',
    body: [
      `I do not pick stocks. I do not time the market. I do not watch CNBC. I put every dollar into the C Fund (TSP) or a low-cost S&P 500 index fund — VFIAX, FXAIX, or VOO — and I wait.`,
      `Why the S&P 500? Because over any 20-year period in history, it has never lost money. The average annual return is approximately 10%. Compounding 10% over 20 to 30 years turns small, consistent contributions into life-changing wealth. One number to internalize: $500 per month invested at 10% annual return for 25 years grows to $598,000. You do not need to be a genius. You need to be consistent.`,
      `The enemy of investing is not a bear market — it is you selling during one. I lived through multiple downturns between 2018 and 2025 and never sold a single share. Every dip was a sale. The market always recovered. Boring on purpose. Relentless by design.`,
    ],
    callout: 'C Fund (TSP) + Roth IRA in VFIAX or VOO. Set it. Forget it. Never sell in panic.',
  },
  {
    num: '05',
    tag: 'Step Five',
    title: 'Buy a Home and Pay It Off Quickly',
    body: [
      `Once your investment accounts are funded and running, buy a home — and pay it off as fast as possible. This step has two powerful benefits: it eliminates your largest monthly expense, and it positions you to capture a significant tax-free gain when you sell.`,
      `Under the IRS Section 121 exclusion, if you have lived in your home as your primary residence for at least two of the last five years, you can exclude up to $250,000 of capital gains from federal taxes when you sell ($500,000 if married filing jointly). That is a quarter of a million dollars, completely tax free.`,
      `I paid my home off in 2 years and 9 months. By doing so, I paid only $13,500 in total interest — a fraction of what a standard 30-year mortgage would have cost. The faster you pay it off, the less you give to the bank and the more you keep for yourself.`,
      `If you are in the military, use your VA loan benefit — zero down payment, no private mortgage insurance, and competitive interest rates. It is one of the best mortgage products available to anyone. Use it wisely.`,
    ],
    callout: 'Buy smart. Pay it off fast. Sell after 2 years. Keep up to $250K tax free.',
  },
]

const faqs = [
  {
    q: 'What is the very first thing I should do today?',
    a: 'Two things, right now. First, log into MyPay and set your TSP contribution to at least 5% to capture the full employer match — that is free money and it takes three minutes. Second, list every debt you have with the interest rate next to each one. Those two actions put you ahead of most soldiers immediately.',
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
        <p>Five steps. No shortcuts. Repeatable by anyone in uniform.</p>
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
