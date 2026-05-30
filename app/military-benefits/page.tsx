import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Military Benefits Guide — Money Soldiers Leave on the Table',
  description:
    'Comprehensive guide to military financial benefits: TSP matching, BRS pension, VA Home Loan, SCRA, Roth IRA combat zone exclusion, SDP, SGLI, MyCAA, tuition assistance, and more.',
  keywords: ['military benefits guide', 'TSP matching army', 'VA home loan zero down', 'SCRA interest cap', 'military Roth IRA', 'BRS pension', 'MyCAA military spouse'],
}

const categories = [
  {
    cat: 'Retirement',
    icon: '🏦',
    items: [
      {
        name: 'TSP — Thrift Savings Plan',
        tag: 'FREE MONEY',
        icon: '💰',
        body: `The TSP is the military's version of a 401(k). Under the Blended Retirement System (BRS), the government matches up to 5% of your base pay if you contribute at least 5%. That's a guaranteed 100% return on those dollars before they even invest.`,
        action: 'Log into MyPay today. Set TSP contribution to at least 5%. This takes 3 minutes.',
      },
      {
        name: 'BRS — Blended Retirement System',
        tag: 'Pension',
        icon: '📋',
        body: `If you joined after Jan 1, 2018, you're automatically enrolled in BRS. Serve 20+ years and you receive 40% of your average base pay as a monthly pension for life — plus TSP matching during your career. The BRS gives you retirement benefits even if you don't reach 20 years.`,
        action: 'Understand your BRS election. If you joined between 2006–2017, check if an OPT-IN made sense for you.',
      },
      {
        name: 'SDP — Savings Deposit Program',
        tag: 'Combat Zone',
        icon: '🌍',
        body: `If you're deployed to a combat zone, you can deposit up to $10,000 into the SDP and earn a guaranteed 10% annual interest rate — paid by the government. In a world of 5% savings accounts, this is extraordinary. Most deployed soldiers have no idea this exists.`,
        action: 'If you\'re currently deployed or orders incoming, contact your finance office immediately.',
      },
    ],
  },
  {
    cat: 'Housing',
    icon: '🏠',
    items: [
      {
        name: 'VA Home Loan',
        tag: 'Zero Down',
        icon: '🏡',
        body: `The VA loan is arguably the best mortgage product in America. Zero down payment, no PMI (private mortgage insurance), competitive interest rates, and no prepayment penalties. You can buy a home with $0 out of pocket. Most people using this benefit save $200–$500/month compared to conventional loans.`,
        action: 'Get your Certificate of Eligibility (COE) at va.gov. Pre-qualify before you start house hunting.',
      },
      {
        name: 'BAH — Basic Allowance for Housing',
        tag: 'Tax-Free',
        icon: '💵',
        body: `BAH covers your housing costs based on your rank, location, and dependent status — and it's completely tax-free income. In most markets, BAH fully covers rent or a significant portion of a mortgage. Strategy: live below your BAH rate and invest the difference.`,
        action: 'Look up your BAH rate at militarypay.defense.gov. Find housing that costs less. Bank the difference.',
      },
    ],
  },
  {
    cat: 'Investing & Tax',
    icon: '📈',
    items: [
      {
        name: 'Roth IRA — Combat Zone Exclusion',
        tag: 'Tax-Free',
        icon: '🛡️',
        body: `When you receive tax-free combat zone pay and contribute it to a Roth IRA, that money grows and is withdrawn completely tax-free — and you never paid taxes on it going in either. This is one of the best wealth-building opportunities in the tax code, available only to deployed service members.`,
        action: 'Open a Roth IRA at Vanguard or Fidelity if you don\'t have one. Contribute combat pay during deployment.',
      },
      {
        name: 'SCRA — Servicemembers Civil Relief Act',
        tag: 'Savings',
        icon: '⚖️',
        body: `SCRA caps interest rates on pre-service debt (credit cards, student loans, auto loans) at 6% while you're on active duty. If you have debt at higher rates, contact your lender and invoke your SCRA rights. This can save thousands per year in interest.`,
        action: 'List all pre-service debts. Contact each lender with a copy of your orders. Request the 6% SCRA cap.',
      },
    ],
  },
  {
    cat: 'Education',
    icon: '🎓',
    items: [
      {
        name: 'Tuition Assistance (TA)',
        tag: 'Education',
        icon: '📚',
        body: `The Army pays up to $4,000/year in tuition assistance for active duty soldiers pursuing college courses during off-duty time. Combined with the GI Bill (Post-9/11 or Montgomery), you can get a full college education with zero out-of-pocket cost.`,
        action: 'Apply through ArmyIgnitED at armyignited.army.mil. Use TA first — it doesn\'t reduce your GI Bill entitlement.',
      },
      {
        name: 'MyCAA — Military Spouse Scholarship',
        tag: 'Spouse',
        icon: '👩‍🎓',
        body: `MyCAA provides up to $4,000 in scholarships for military spouses pursuing portable career fields (licenses, certificates, associate degrees). If your spouse wants to build a career that travels with your PCS moves, this funds it.`,
        action: 'Eligible spouses: apply at mycaa.com. Programs must lead to a portable career field.',
      },
      {
        name: 'Post-9/11 GI Bill',
        tag: 'Education',
        icon: '🏫',
        body: `After 36+ months of active duty, you're entitled to full tuition at any in-state public school, a monthly housing allowance (at BAH E-5 rates), and a book stipend — for up to 36 months of schooling. You can also transfer unused benefits to dependents.`,
        action: 'Apply at va.gov/education. Use TA while on active duty to preserve GI Bill for after separation.',
      },
    ],
  },
  {
    cat: 'Insurance & Protection',
    icon: '🛡️',
    items: [
      {
        name: 'SGLI — Servicemembers\' Group Life Insurance',
        tag: 'Insurance',
        icon: '❤️',
        body: `SGLI provides up to $400,000 in life insurance coverage for only $28/month — one of the cheapest term life policies available anywhere. Make sure your coverage is maxed and your beneficiary designations are current (especially after marriage, divorce, or having children).`,
        action: 'Log into milConnect. Verify SGLI coverage is at max ($400K) and beneficiaries are correct.',
      },
      {
        name: 'TRICARE Health Insurance',
        tag: 'Healthcare',
        icon: '🏥',
        body: `Active duty soldiers receive comprehensive health insurance at no cost through TRICARE. Dependents are covered at low cost. This eliminates one of the largest household expenses for civilian families — often $500–$1,500/month. That's money that can go straight to investing.`,
        action: 'Enroll dependents. Locate your nearest MTF. Understand TRICARE Prime vs. Select options.',
      },
    ],
  },
]

export default function MilitaryBenefitsPage() {
  return (
    <main>
      <div className="page-hero">
        <div className="section-tag gold">For Soldiers</div>
        <h1>Military Benefits<br />You&apos;re Leaving<br />on the Table</h1>
        <p>Most soldiers use less than half their benefits. Here&apos;s the complete guide — every program I found, applied for, and used.</p>
      </div>

      <section style={{ background: 'var(--army)', padding: '24px 20px' }}>
        <div className="container-prose">
          <p style={{ fontFamily: 'DM Serif Display, serif', fontStyle: 'italic', color: '#fff', fontSize: 16, lineHeight: 1.6 }}>
            &ldquo;I didn&apos;t know about most of these when I enlisted. I found them by reading, asking, and digging.
            This page is everything I wish someone had handed me on day one.&rdquo;
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>— Tuan, US Army</p>
        </div>
      </section>

      {categories.map(cat => (
        <section key={cat.cat} className="benefits-page-section">
          <div className="container-prose">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '32px 0 20px' }}>
              <span style={{ fontSize: 24 }}>{cat.icon}</span>
              <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, color: 'var(--text)' }}>{cat.cat}</h2>
            </div>
            {cat.items.map(item => (
              <div key={item.name} className="benefit-card">
                <div className="benefit-card-header">
                  <div className="benefit-icon">{item.icon}</div>
                  <div className="benefit-name">{item.name}</div>
                  <span className="benefit-tag">{item.tag}</span>
                </div>
                <p className="benefit-desc">{item.body}</p>
                <div className="benefit-action">→ {item.action}</div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="booking-section">
        <div className="booking-icon">🗓️</div>
        <h2 className="booking-title">Not Sure Which<br />Benefits Apply to You?</h2>
        <p className="booking-sub">
          Book a free 30-minute session and I&apos;ll walk you through exactly which
          benefits you&apos;re eligible for based on your rank, situation, and goals.
        </p>
        <Link href="/book" className="btn btn-gold btn-full btn-lg">Book a Free Session</Link>
        <p className="booking-small">No cost. No pitch. Just answers.</p>
      </section>
    </main>
  )
}
