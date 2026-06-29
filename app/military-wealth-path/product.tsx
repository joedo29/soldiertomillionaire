'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'

const milestones = [100000, 500000, 1000000]
const annualReturn = 0.08
const monthlyReturn = annualReturn / 12
const paymentUrl = process.env.NEXT_PUBLIC_MILITARY_WEALTH_PATH_PAYMENT_URL

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function compactCurrency(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`
  if (value >= 1000) return `$${Math.round(value / 1000)}K`
  return currency(value)
}

function monthLabel(months: number | null) {
  if (months === null) return 'Not reached'
  if (months <= 0) return 'Already there'

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (years === 0) return `${remainingMonths} mo`
  if (remainingMonths === 0) return `${years} yr`
  return `${years} yr ${remainingMonths} mo`
}

function targetDate(months: number | null) {
  if (months === null) return 'Increase monthly investing'
  const date = new Date()
  date.setMonth(date.getMonth() + Math.max(months, 0))
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function monthsToTarget(current: number, monthlyInvestment: number, target: number) {
  if (current >= target) return 0
  if (monthlyInvestment <= 0 && current <= 0) return null

  let balance = current
  for (let month = 1; month <= 12 * 80; month += 1) {
    balance = balance * (1 + monthlyReturn) + monthlyInvestment
    if (balance >= target) return month
  }

  return null
}

function futureValue(current: number, monthlyInvestment: number, months: number) {
  let balance = current
  for (let month = 0; month < months; month += 1) {
    balance = balance * (1 + monthlyReturn) + monthlyInvestment
  }
  return balance
}

function scoreSavingsRate(rate: number | null) {
  if (rate === null) return { label: 'Add income', score: 0, tone: 'neutral' }
  if (rate >= 50) return { label: 'Elite', score: 100, tone: 'strong' }
  if (rate >= 30) return { label: 'Strong', score: 78, tone: 'good' }
  if (rate >= 20) return { label: 'Building', score: 58, tone: 'steady' }
  if (rate >= 10) return { label: 'Starter', score: 36, tone: 'warning' }
  return { label: 'At risk', score: 18, tone: 'danger' }
}

function recommendations(input: {
  currentNetWorth: number
  monthlyInvestment: number
  monthlyIncome: number
  savingsRate: number | null
  firstMilestoneMonths: number | null
}) {
  const recs: string[] = []

  if (input.monthlyIncome > 0 && (input.savingsRate ?? 0) < 20) {
    recs.push('Move toward a 20% savings rate first. Start by raising TSP 1% each month until it feels normal.')
  } else if (input.monthlyIncome > 0 && (input.savingsRate ?? 0) < 50) {
    recs.push('Your savings rate is moving. Aim for 50% over time by sending raises, bonuses and special pay into investments.')
  } else {
    recs.push('Keep your savings rate high and protect it. Lifestyle inflation is the biggest threat once the system starts working.')
  }

  if (input.monthlyInvestment < 500) {
    recs.push('Build the monthly investing habit before chasing perfect investments. Even $100 more per month changes the timeline.')
  } else {
    recs.push('Keep the investing simple: TSP C Fund or broad S&P 500 index funds, bought consistently without panic selling.')
  }

  if (input.currentNetWorth < 0) {
    recs.push('Attack high-interest debt first. A 20% credit card balance is a guaranteed negative return.')
  } else if (input.firstMilestoneMonths !== null && input.firstMilestoneMonths <= 36) {
    recs.push('You are close to the first major milestone. Do not slow down before $100K; that is where compounding starts to feel real.')
  } else {
    recs.push('Use tax-advantaged accounts first: TSP match, Roth IRA, HSA if eligible, then taxable brokerage after that.')
  }

  return recs.slice(0, 3)
}

function buildChartPoints(current: number, monthlyInvestment: number) {
  const values = Array.from({ length: 11 }, (_, i) => futureValue(current, monthlyInvestment, i * 12))
  const max = Math.max(100000, ...values)
  return values.map((value, i) => {
    const x = (i / 10) * 100
    const y = 100 - Math.min(100, Math.max(0, (value / max) * 100))
    return { x, y, value, year: i }
  })
}

export default function MilitaryWealthPath() {
  const [currentNetWorth, setCurrentNetWorth] = useState(25000)
  const [monthlyInvestment, setMonthlyInvestment] = useState(1000)
  const [monthlyIncome, setMonthlyIncome] = useState(4000)
  const [copied, setCopied] = useState(false)
  const shareCanvasRef = useRef<HTMLCanvasElement>(null)

  const result = useMemo(() => {
    const milestoneRows = milestones.map((target) => {
      const months = monthsToTarget(currentNetWorth, monthlyInvestment, target)
      return { target, months, label: monthLabel(months), date: targetDate(months) }
    })
    const savingsRate = monthlyIncome > 0 ? (monthlyInvestment / monthlyIncome) * 100 : null
    const score = scoreSavingsRate(savingsRate)
    const recs = recommendations({
      currentNetWorth,
      monthlyInvestment,
      monthlyIncome,
      savingsRate,
      firstMilestoneMonths: milestoneRows[0].months,
    })
    const chartPoints = buildChartPoints(currentNetWorth, monthlyInvestment)

    return { milestoneRows, savingsRate, score, recs, chartPoints }
  }, [currentNetWorth, monthlyInvestment, monthlyIncome])

  function drawShareImage() {
    const canvas = shareCanvasRef.current
    if (!canvas) return null

    canvas.width = 1200
    canvas.height = 630
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.fillStyle = '#1A1F14'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#C9A84C'
    ctx.fillRect(0, 0, canvas.width, 12)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '700 54px Arial'
    ctx.fillText('Military Wealth Path', 72, 104)

    ctx.fillStyle = '#C9A84C'
    ctx.font = '700 34px Arial'
    ctx.fillText(`Current net worth: ${currency(currentNetWorth)}`, 72, 166)
    ctx.fillText(`Monthly investing: ${currency(monthlyInvestment)}`, 72, 214)

    ctx.fillStyle = '#FFFFFF'
    ctx.font = '700 44px Arial'
    result.milestoneRows.forEach((row, index) => {
      const y = 320 + index * 82
      ctx.fillText(`${compactCurrency(row.target)}:`, 72, y)
      ctx.fillStyle = '#C9A84C'
      ctx.fillText(row.date, 285, y)
      ctx.fillStyle = '#FFFFFF'
    })

    ctx.fillStyle = 'rgba(255,255,255,0.62)'
    ctx.font = '28px Arial'
    ctx.fillText('soldiertomillionaire.com', 72, 580)

    return canvas.toDataURL('image/png')
  }

  function downloadShareImage() {
    const url = drawShareImage()
    if (!url) return

    const link = document.createElement('a')
    link.download = 'military-wealth-path.png'
    link.href = url
    link.click()
  }

  async function copyResults() {
    const text = `My Military Wealth Path:
Current net worth: ${currency(currentNetWorth)}
Monthly investing: ${currency(monthlyInvestment)}
$100K: ${result.milestoneRows[0].date}
$500K: ${result.milestoneRows[1].date}
$1M: ${result.milestoneRows[2].date}

Built with Soldier to Millionaire`

    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const path = result.chartPoints.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')

  return (
    <main>
      <section className="mwp-hero">
        <div className="container mwp-hero-grid">
          <div>
            <div className="section-tag gold">First Product</div>
            <h1>Military<br />Wealth Path</h1>
            <p>
              See when you could reach $100,000, $500,000 and $1 million, then get
              a practical plan to move faster.
            </p>
            <div className="mwp-hero-actions">
              <a href="#calculator" className="btn btn-gold btn-lg">Run the Free Projection</a>
              <a href="#report" className="btn btn-outline btn-lg">$19 Roadmap</a>
            </div>
          </div>

          <div className="mwp-proof">
            <span>Built for soldiers who want numbers, not hype.</span>
            <strong>{targetDate(result.milestoneRows[2].months)}</strong>
            <small>Projected $1M milestone with your current inputs</small>
          </div>
        </div>
      </section>

      <section id="calculator" className="mwp-tool">
        <div className="container mwp-tool-grid">
          <div className="mwp-panel">
            <div className="section-tag">Your Inputs</div>
            <h2>Run the numbers.</h2>

            <label className="mwp-field">
              <span>Current net worth</span>
              <input
                type="number"
                value={currentNetWorth}
                onChange={(event) => setCurrentNetWorth(Number(event.target.value))}
                inputMode="numeric"
              />
            </label>

            <label className="mwp-field">
              <span>Monthly investing</span>
              <input
                type="number"
                value={monthlyInvestment}
                onChange={(event) => setMonthlyInvestment(Math.max(0, Number(event.target.value)))}
                inputMode="numeric"
              />
            </label>

            <label className="mwp-field">
              <span>Monthly take-home income</span>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(event) => setMonthlyIncome(Math.max(0, Number(event.target.value)))}
                inputMode="numeric"
              />
            </label>

            <p className="mwp-note">
              Projection assumes an 8% annual return, compounded monthly. This is educational, not financial advice.
            </p>
          </div>

          <div className="mwp-results">
            <div className="mwp-score-card">
              <div>
                <span>Savings-rate score</span>
                <strong>{result.score.label}</strong>
                <small>
                  {result.savingsRate === null ? 'Add income to calculate' : `${result.savingsRate.toFixed(1)}% of take-home`}
                </small>
              </div>
              <div className="mwp-score-ring" style={{ ['--score' as string]: `${result.score.score}%` }}>
                {result.score.score}
              </div>
            </div>

            <div className="mwp-milestones">
              {result.milestoneRows.map((row) => (
                <div key={row.target} className="mwp-milestone">
                  <span>{compactCurrency(row.target)}</span>
                  <strong>{row.date}</strong>
                  <small>{row.label}</small>
                </div>
              ))}
            </div>

            <div className="mwp-chart" aria-label="10 year projection chart">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M 0 100 L 100 100" className="mwp-chart-base" />
                <path d={path} className="mwp-chart-line" />
              </svg>
              <div className="mwp-chart-labels">
                <span>Today</span>
                <span>10 years: {currency(result.chartPoints.at(-1)?.value ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mwp-recs">
        <div className="container">
          <div className="mwp-section-head">
            <div>
              <div className="section-tag">Personalized Recommendations</div>
              <h2>Three moves to get there faster.</h2>
            </div>
            <div className="mwp-share-actions">
              <button className="btn btn-outline-dark" type="button" onClick={copyResults}>
                {copied ? 'Copied' : 'Copy Results'}
              </button>
              <button className="btn btn-army" type="button" onClick={downloadShareImage}>
                Download Image
              </button>
            </div>
          </div>

          <div className="mwp-rec-grid">
            {result.recs.map((rec, index) => (
              <div key={rec} className="mwp-rec-card">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="report" className="mwp-report">
        <div className="container mwp-report-grid">
          <div>
            <div className="section-tag gold">Paid Report</div>
            <h2>Get the complete $19 roadmap.</h2>
            <p>
              The free projection shows the destination. The paid report turns your numbers
              into a printable action plan you can follow every month.
            </p>
            {paymentUrl ? (
              <a href={paymentUrl} className="btn btn-gold btn-lg" target="_blank" rel="noopener noreferrer">
                Get the $19 Report
              </a>
            ) : (
              <Link href="/book" className="btn btn-gold btn-lg">
                Request the $19 Report
              </Link>
            )}
          </div>

          <div className="mwp-report-list">
            {[
              'Complete financial roadmap',
              'TSP and Roth IRA allocation worksheet',
              'Emergency-fund target',
              'Monthly spending targets',
              'Five-year milestone table',
              'Printable action plan',
              'Annual review checklist',
            ].map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <canvas ref={shareCanvasRef} className="mwp-share-canvas" aria-hidden="true" />
    </main>
  )
}
