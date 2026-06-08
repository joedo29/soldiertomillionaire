import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Mockup — Soldier to Millionaire',
  description:
    'Mockup proposal for the Soldier to Millionaire About page combining Joe Do’s story, credibility, mission, and call to action.',
  robots: { index: false, follow: false },
}

const stats = [
  { value: '$750K', label: 'Net Worth Built' },
  { value: '2 yrs 9 mo', label: 'House Paid Off' },
  { value: '25+', label: 'Soldiers Helped' },
  { value: 'Active Duty', label: 'U.S. Army Soldier' },
]

const journey = [
  ['2008', 'Came to America from Vietnam and started building a life from zero.'],
  ['Seattle Years', 'Worked three jobs while going to school for Computer Science.'],
  ['Ratio', 'Worked in software, building websites and mobile apps.'],
  ['Dental Lab + Restaurant', 'Took hands-on jobs while trying to survive and move forward.'],
  ['Data Analyst', 'Worked in Bellevue, Washington, learning to make decisions through evidence.'],
  ['Open Doors', 'Served multicultural families and people with developmental and intellectual disabilities.'],
  ['2022', 'Moved to North Carolina to work at Duke University in Healthcare IT.'],
  ['Duke University', 'Worked with large healthcare data and learned how data can improve patient care and drug discovery.'],
  ['2026', 'Joined the U.S. Army and began helping soldiers with financial freedom.'],
]

const shaped = [
  {
    title: 'Software taught me how to build systems',
    body: 'A good system turns a complex problem into repeatable steps. That is how I think about money: inputs, rules, automation, feedback, and discipline.',
  },
  {
    title: 'Nonprofit work taught me compassion and service',
    body: 'Working with families reminded me that money is never just money. It affects stress, dignity, opportunity, and the people we love.',
  },
  {
    title: 'Healthcare data taught me evidence-based decisions',
    body: 'Data showed me how better decisions can change lives. I use the same mindset with investing: facts over fear, evidence over emotion.',
  },
]

const freedoms = [
  ['Create Wealth', 'Track it. Save it. Invest it. Let the numbers tell the truth.'],
  ['Create Family Happiness', 'My wife Truc and daughter Summer are the reason the mission matters.'],
  ['Create Freedom', 'Freedom means time, options, and the ability to be present for the people I love.'],
  ['Create Helpful Content', 'If what I build helps another soldier create wealth, happiness, or freedom, it is worth doing.'],
]

export default function AboutMockupPage() {
  return (
    <main className="about-mockup">
      <section className="about-mockup-hero">
        <div className="about-mockup-copy">
          <div className="section-tag gold">About Joe Do</div>
          <h1>I&apos;m Not a Financial Guru. I&apos;m Your Battle Buddy Who Has Done It.</h1>
          <p>
            I went from working three jobs, living paycheck to paycheck, and having $20 in my pocket
            to building a $750,000 net worth, paying off my house in under three years, and now
            helping soldiers build their own path to financial freedom.
          </p>
          <div className="about-mockup-actions">
            <Link href="/book" className="btn btn-gold">Start Your Financial Freedom Plan</Link>
            <a href="#about-journey" className="btn btn-outline">Read My Full Story</a>
          </div>
        </div>

        <div className="about-mockup-photo">
          <Image
            src="/og-image.jpg"
            alt="Joe Do, founder of Soldier to Millionaire"
            width={1200}
            height={630}
            priority
          />
          <div className="about-mockup-photo-note">
            <span>Founder</span>
            <strong>Joe Do</strong>
          </div>
        </div>
      </section>

      <section className="about-mockup-stats" aria-label="Trust snapshot">
        {stats.map((stat) => (
          <div className="about-mockup-stat" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section id="about-journey" className="about-mockup-section about-mockup-journey-section">
        <div className="about-mockup-section-head">
          <div className="section-tag">My Journey</div>
          <h2 className="section-title">Every Chapter Built the Mission</h2>
          <p className="section-sub">
            Before Soldier to Millionaire, I was a student, builder, restaurant worker, data analyst,
            nonprofit servant, healthcare IT professional, husband, father, and soldier.
          </p>
        </div>
        <div className="about-mockup-timeline">
          {journey.map(([year, body]) => (
            <article className="about-mockup-timeline-item" key={year}>
              <div className="about-mockup-timeline-dot" />
              <div>
                <h3>{year}</h3>
                <p>{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-mockup-band">
        <div className="about-mockup-section-head">
          <div className="section-tag">What Shaped Me</div>
          <h2 className="section-title">Systems. Service. Evidence.</h2>
        </div>
        <div className="about-mockup-card-grid">
          {shaped.map((item) => (
            <article className="about-mockup-card" key={item.title}>
              <span>✦</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-mockup-section about-mockup-why">
        <div className="about-mockup-quote-card">
          <div className="section-tag gold">Why I Built Soldier to Millionaire</div>
          <h2>Everything I have done led me here.</h2>
          <p>
            I realized I have experience many young soldiers have not had yet. I am turning 39 in
            2026, almost twice the age of many soldiers I meet. I have already made financial
            mistakes, learned hard lessons, built wealth, paid off a home, invested consistently,
            and created systems that work.
          </p>
          <p>
            Soldier to Millionaire exists because I do not want young soldiers to wait ten years to
            learn what I had to learn the hard way.
          </p>
        </div>
      </section>

      <section className="about-mockup-promise">
        <div className="about-mockup-promise-inner">
          <div className="section-tag gold">Battle Buddy Promise</div>
          <h2>I&apos;m Not Here to Sell You a Dream. I&apos;m Here to Share the System I Actually Used.</h2>
          <p>
            I am not someone repeating what I heard online. I am sharing what I personally did:
            saving aggressively, using tax-advantaged accounts, investing in the S&amp;P 500,
            avoiding lifestyle inflation, paying off debt, and using discipline to create freedom.
          </p>
        </div>
      </section>

      <section className="about-mockup-section">
        <div className="about-mockup-section-head">
          <div className="section-tag">Family and Freedom</div>
          <h2 className="section-title">The Four Things I&apos;m Building</h2>
          <p className="section-sub">
            Wealth is measurable, but the real mission is what wealth makes possible.
          </p>
        </div>
        <div className="about-mockup-card-grid four">
          {freedoms.map(([title, body], index) => (
            <article className="about-mockup-card compact" key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-mockup-final">
        <div className="about-mockup-final-inner">
          <h2>Your Mission Starts Here.</h2>
          <p>
            You do not need to be rich to start. You need a system, discipline, and someone willing
            to show you the path.
          </p>
          <Link href="/book" className="btn btn-gold btn-lg">Book a Free Session</Link>
        </div>
      </section>
    </main>
  )
}
