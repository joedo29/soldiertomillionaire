'use client'

import { useMemo, useRef, useState } from 'react'
import {
  calculateWealthPath,
  compactCurrency,
  currency,
  parseMoneyInput,
  targetDate,
} from '@/lib/wealthPath'

const squarePaymentUrl = process.env.NEXT_PUBLIC_MILITARY_WEALTH_PATH_PAYMENT_URL
  ?? 'https://square.link/u/WOzeV2Hk'
const reportStorageKey = 'soldier2millionaire:military-wealth-path-report'

export default function MilitaryWealthPath() {
  const [currentNetWorthInput, setCurrentNetWorthInput] = useState('25000')
  const [monthlyInvestmentInput, setMonthlyInvestmentInput] = useState('1000')
  const [monthlyIncomeInput, setMonthlyIncomeInput] = useState('4000')
  const [copied, setCopied] = useState(false)
  const shareCanvasRef = useRef<HTMLCanvasElement>(null)

  const currentNetWorth = parseMoneyInput(currentNetWorthInput)
  const monthlyInvestment = Math.max(0, parseMoneyInput(monthlyInvestmentInput))
  const monthlyIncome = Math.max(0, parseMoneyInput(monthlyIncomeInput))

  const result = useMemo(
    () => calculateWealthPath({ currentNetWorth, monthlyInvestment, monthlyIncome }),
    [currentNetWorth, monthlyInvestment, monthlyIncome],
  )

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

  function saveReportInputs() {
    try {
      const payload = {
        currentNetWorth,
        monthlyInvestment,
        monthlyIncome,
        createdAt: new Date().toISOString(),
      }
      window.localStorage.setItem(reportStorageKey, JSON.stringify(payload))
    } catch {
      // Checkout should still proceed if the browser blocks local storage.
    }
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
                value={currentNetWorthInput}
                onChange={(event) => setCurrentNetWorthInput(event.target.value)}
                inputMode="numeric"
              />
            </label>

            <label className="mwp-field">
              <span>Monthly investing</span>
              <input
                type="number"
                value={monthlyInvestmentInput}
                onChange={(event) => setMonthlyInvestmentInput(event.target.value)}
                inputMode="numeric"
                min="0"
              />
            </label>

            <label className="mwp-field">
              <span>Monthly take-home income</span>
              <input
                type="number"
                value={monthlyIncomeInput}
                onChange={(event) => setMonthlyIncomeInput(event.target.value)}
                inputMode="numeric"
                min="0"
              />
            </label>

            <p className="mwp-note">
              Projection assumes a 12% annual return, compounded yearly. This is educational, not financial advice.
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
            <div className="mwp-payment-actions">
              <a
                href={squarePaymentUrl}
                className="btn btn-gold btn-lg"
                target="_blank"
                rel="noopener noreferrer"
                onClick={saveReportInputs}
              >
                Pay $19 with Square
              </a>
            </div>
            <p className="mwp-payment-note">
              Your current inputs are saved on this device before checkout. After payment,
              Square redirects you to the PDF report download page.
            </p>
          </div>

          <div className="mwp-report-list">
            {[
              'Your situation decoded in plain English',
              'Military wealth accelerators: BAH gap, combat-zone Roth, SCRA cap',
              '5 mistakes that kill military wealth',
              'The Priority Ladder — exactly what to do, in order',
              'TSP and Roth IRA allocation worksheet',
              'Emergency-fund and monthly spending targets',
              'Five-year milestone table',
              'Your personal mission brief from Joe',
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
