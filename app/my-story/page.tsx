import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'My Story — From Vietnam to $750K',
  description:
    'How a Vietnamese immigrant working 3 jobs went from broke to $750K net worth through disciplined saving, tax-advantaged accounts, and S&P 500 investing — now serving in the US Army.',
  keywords: ['soldier financial freedom story', 'military millionaire story', 'immigrant to millionaire', 'army personal finance'],
}

const milestones = [
  { year: '2008', age: 21, icon: '✈️', title: 'A New Country, Zero Dollars',
    body: `I arrived in the United States from Vietnam at 21 with almost nothing to my name. No English fluency, no network, no savings. To survive, I worked three jobs simultaneously — whatever it took. For nearly a decade, every paycheck disappeared before the next one arrived. I was living proof that income alone doesn't build wealth.` },
  { year: '2018', age: 31, icon: '🌺', title: 'The Hawaii Moment That Changed Everything',
    body: `My family took a trip to Hawaii and I realized I had just $20 in my pocket. My family covered everything — airfare, hotel, food. I was 31, working constantly, and had nothing to show for it. That humiliation was the best thing that ever happened to me. On the flight home I promised myself it would never happen again.` },
  { year: '2018', age: 31, icon: '📖', title: 'Two Books That Rewired My Brain',
    body: `I read The Intelligent Investor by Benjamin Graham and Naked Statistics by Charles Wheelan back to back. Graham's core lesson — that the market rewards patience and punishes emotion — completely changed how I thought about money. I stopped seeing my paycheck as something to spend and started seeing it as ammunition to invest.` },
  { year: '2018–2022', age: '31–35', icon: '🏦', title: 'The System: Save, Tax-Advantaged, S&P 500',
    body: `I built a simple, repeatable system: (1) Save aggressively — live below my means, no lifestyle inflation. (2) Funnel every available dollar into tax-advantaged accounts — Roth IRA first, then TSP once I joined the Army. (3) Invest in S&P 500 index funds and never touch it. No stock picks. No timing the market. Just boring, relentless consistency.` },
  { year: '2022', age: 35, icon: '📈', title: 'First $100K — The Hardest Milestone',
    body: `Hitting $100,000 net worth took years and felt impossibly slow. But there's a mathematical reality that most people don't feel until they see it: the first $100K is the hardest because you're building the machine, not running it. After $100K, compounding starts doing heavy lifting. I knew then that the system was working.` },
  { year: '2023', age: 36, icon: '🎖️', title: 'Joining the US Army',
    body: `Enlisting in the Army wasn't just a career decision — it was strategic. The military provides stability, benefits, and most importantly, the Thrift Savings Plan (TSP) with matching contributions. I began teaching other soldiers the same system that got me to $100K. The response was overwhelming. Soldiers wanted this information desperately but had no one to teach them.` },
  { year: '2025', age: 38, icon: '🏆', title: '$750,000 — And Just Getting Started',
    body: `At 38, my net worth crossed $750,000. Not from luck. Not from a high salary. From a simple system applied with discipline over seven years. I've now shared that system with more than 20 soldiers. Four have fully committed to the plan and are executing it. I built this site to reach the other thousands who need it.` },
]

export default function MyStoryPage() {
  return (
    <main>
      <div className="page-hero">
        <div className="section-tag gold">My Story</div>
        <h1>From Broke<br />To $750K</h1>
        <p>A Vietnamese immigrant, three jobs, and one decision that changed everything.</p>
      </div>

      <div className="prose-section">
        <div className="container-prose">
          <div className="prose">
            <p style={{ fontSize: 18, fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', color: 'var(--text-light)', marginBottom: 40 }}>
              This is the story of how discipline — not income — builds wealth. I'm sharing every number,
              every mistake, and every decision so you can skip the decade I lost and start building now.
            </p>
          </div>

          {milestones.map((m, i) => (
            <div key={i} style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#E8F0DF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {m.icon}
                </div>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 3 }}>
                    {m.year} · Age {m.age}
                  </div>
                  <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--text)', margin: 0 }}>
                    {m.title}
                  </h2>
                </div>
              </div>
              <div className="prose">
                <p>{m.body}</p>
              </div>
              {i < milestones.length - 1 && <hr />}
            </div>
          ))}

          <div style={{ background: 'var(--army)', borderRadius: 14, padding: '28px 24px', textAlign: 'center', marginTop: 48 }}>
            <p style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', fontSize: 20, color: '#fff', marginBottom: 20 }}>
              &ldquo;You don&apos;t need to earn more. You need a system. Let me show you mine.&rdquo;
            </p>
            <Link href="/book" className="btn btn-gold btn-lg">
              Book a Free Session →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
