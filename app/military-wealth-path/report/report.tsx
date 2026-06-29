'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  calculateWealthPath,
  currency,
  wealthPathAnnualReturn,
} from '@/lib/wealthPath'
import type { WealthPathInputs } from '@/lib/wealthPath'

const reportStorageKey = 'soldier2millionaire:military-wealth-path-report'

function readStoredInputs(): WealthPathInputs | null {
  try {
    const raw = window.localStorage.getItem(reportStorageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      currentNetWorth: Number(parsed.currentNetWorth) || 0,
      monthlyInvestment: Number(parsed.monthlyInvestment) || 0,
      monthlyIncome: Number(parsed.monthlyIncome) || 0,
    }
  } catch {
    return null
  }
}

function downloadHtml(filename: string, html: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function percent(value: number | null) {
  return value === null ? 'Add income to calculate' : `${value.toFixed(1)}%`
}

function essentialExpenseTarget(inputs: WealthPathInputs) {
  return Math.max(0, inputs.monthlyIncome - inputs.monthlyInvestment)
}

function emergencyFundTargets(inputs: WealthPathInputs) {
  const monthlyEssentials = essentialExpenseTarget(inputs)
  return {
    monthlyEssentials,
    starter: Math.min(1000, Math.max(0, monthlyEssentials)),
    threeMonths: monthlyEssentials * 3,
    sixMonths: monthlyEssentials * 6,
  }
}

function reportHtml(inputs: WealthPathInputs, result: ReturnType<typeof calculateWealthPath>) {
  const rows = result.fiveYearRows
    .map((row) => `<tr><td>Year ${row.year}</td><td>${currency(row.value)}</td><td>${currency(row.value - inputs.currentNetWorth)}</td></tr>`)
    .join('')
  const milestones = result.milestoneRows
    .map((row) => `
      <div class="milestone">
        <span>${currency(row.target)}</span>
        <strong>${row.date}</strong>
        <small>${row.label}</small>
      </div>
    `)
    .join('')
  const recommendations = result.recs.map((rec) => `<li>${rec}</li>`).join('')
  const emergency = emergencyFundTargets(inputs)
  const monthlySpending = Math.max(0, inputs.monthlyIncome - inputs.monthlyInvestment)
  const tspTarget = Math.round(inputs.monthlyInvestment * 0.6)
  const rothTarget = Math.round(inputs.monthlyInvestment * 0.25)
  const extraTarget = Math.max(0, inputs.monthlyInvestment - tspTarget - rothTarget)
  const reportDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Military Wealth Path Report</title>
  <style>
    * { box-sizing: border-box; }
    body { background: #F5F1E8; color: #1A1F14; font-family: Arial, sans-serif; line-height: 1.58; margin: 0; }
    main { background: #fff; margin: 0 auto; max-width: 920px; min-height: 100vh; padding: 42px; }
    h1, h2, h3 { color: #1A1F14; line-height: 1.08; margin: 0; }
    h1 { font-size: 46px; letter-spacing: -0.02em; max-width: 760px; }
    h2 { border-top: 1px solid #DDD6C6; font-size: 25px; margin-top: 34px; padding-top: 24px; }
    h3 { font-size: 17px; margin-top: 18px; }
    p { color: #4F5A49; margin: 10px 0 0; }
    ul, ol { color: #4F5A49; padding-left: 22px; }
    li { margin: 8px 0; }
    table { border-collapse: collapse; margin-top: 14px; width: 100%; }
    td, th { border: 1px solid #DDD6C6; padding: 11px; text-align: left; vertical-align: top; }
    th { background: #F5F1E8; color: #1A1F14; }
    .brand { color: #2D4A1E; font-size: 12px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
    .cover { background: #1A1F14; color: #fff; margin: -42px -42px 34px; padding: 42px; }
    .cover h1 { color: #fff; margin-top: 18px; }
    .cover p { color: rgba(255,255,255,0.72); font-size: 17px; max-width: 680px; }
    .meta { color: #C9A84C; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; margin-top: 28px; text-transform: uppercase; }
    .note { color: #6B7565; font-size: 13px; }
    .grid { display: grid; gap: 12px; grid-template-columns: repeat(3, 1fr); margin-top: 18px; }
    .card { background: #F5F1E8; border: 1px solid #DDD6C6; border-radius: 12px; padding: 16px; }
    .card span, .milestone span { color: #6B7565; display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .card strong, .milestone strong { color: #1A1F14; display: block; font-size: 24px; margin-top: 5px; }
    .milestones { display: grid; gap: 12px; grid-template-columns: repeat(3, 1fr); margin-top: 16px; }
    .milestone { border: 1px solid #DDD6C6; border-radius: 12px; padding: 16px; }
    .milestone small { color: #6B7565; display: block; margin-top: 3px; }
    .callout { background: #EEF3EA; border-left: 5px solid #2D4A1E; border-radius: 10px; margin-top: 16px; padding: 16px; }
    .gold { background: #FFF8DF; border-left-color: #C9A84C; }
    .checklist td:first-child { width: 34px; }
    .signature { color: #6B7565; margin-top: 34px; }
    @media (max-width: 720px) {
      main { padding: 24px; }
      .cover { margin: -24px -24px 28px; padding: 28px 24px; }
      h1 { font-size: 34px; }
      .grid, .milestones { grid-template-columns: 1fr; }
      table { font-size: 13px; }
    }
    @media print {
      body { background: #fff; }
      main { max-width: none; padding: 0.45in; }
      .cover { margin: -0.45in -0.45in 0.35in; padding: 0.45in; }
      h2 { break-after: avoid; }
      table, .card, .milestone, .callout { break-inside: avoid; }
    }
  </style>
</head>
<body>
<main>
  <section class="cover">
    <div class="brand">Soldier to Millionaire</div>
    <h1>Your Military Wealth Path Roadmap</h1>
    <p>A practical plan built from your numbers. The mission is simple: protect your savings rate, invest consistently, avoid lifestyle inflation, and use time as your advantage.</p>
    <div class="meta">Prepared ${reportDate} | Projection uses ${(wealthPathAnnualReturn * 100).toFixed(0)}% annual return, compounded yearly</div>
  </section>

  <p class="note">Educational only, not financial advice. Returns are not guaranteed. Use this as a planning tool and verify account/tax decisions with qualified professionals when needed.</p>

  <h2>Your Starting Numbers</h2>
  <div class="grid">
    <div class="card"><span>Current net worth</span><strong>${currency(inputs.currentNetWorth)}</strong></div>
    <div class="card"><span>Monthly investing</span><strong>${currency(inputs.monthlyInvestment)}</strong></div>
    <div class="card"><span>Savings rate</span><strong>${percent(result.savingsRate)}</strong></div>
  </div>
  <div class="callout">
    <strong>What this means:</strong>
    <p>Your most important number is not income. It is the amount you keep and put to work every month. Protect the ${currency(inputs.monthlyInvestment)} monthly investment first, then build the rest of your lifestyle around what remains.</p>
  </div>

  <h2>Major Milestones</h2>
  <div class="milestones">${milestones}</div>

  <h2>Five-Year Milestone Table</h2>
  <table>
    <tr><th>Timeline</th><th>Projected net worth</th><th>Projected growth from today</th></tr>
    <tbody>${rows}</tbody>
  </table>

  <h2>Your Roadmap</h2>
  <ol>${recommendations}</ol>
  <div class="callout gold">
    <strong>Battle rhythm:</strong>
    <p>Automate investing on payday, review spending once per week, update net worth once per month, and increase contributions every time your income rises.</p>
  </div>

  <h2>Next 30 Days</h2>
  <table class="checklist">
    <tr><th></th><th>Action</th><th>Why it matters</th></tr>
    <tr><td>[ ]</td><td>Write down every debt balance, interest rate, and minimum payment.</td><td>High-interest debt can destroy your compounding before it starts.</td></tr>
    <tr><td>[ ]</td><td>Confirm your TSP contribution captures the full match.</td><td>A match is part of your compensation. Do not leave it behind.</td></tr>
    <tr><td>[ ]</td><td>Set your automatic monthly investing to at least ${currency(inputs.monthlyInvestment)}.</td><td>The system works when the money moves before you can spend it.</td></tr>
    <tr><td>[ ]</td><td>Open or review your Roth IRA if eligible.</td><td>Tax-free growth can become powerful when you give it enough years.</td></tr>
  </table>

  <h2>Next 90 Days</h2>
  <table class="checklist">
    <tr><th></th><th>Action</th><th>Target</th></tr>
    <tr><td>[ ]</td><td>Build starter emergency cash.</td><td>${currency(emergency.starter)}</td></tr>
    <tr><td>[ ]</td><td>Cut or renegotiate one recurring expense.</td><td>Move the savings into investing or debt payoff.</td></tr>
    <tr><td>[ ]</td><td>Increase TSP by 1% if your budget survives the first month.</td><td>Small automatic increases beat big temporary motivation.</td></tr>
    <tr><td>[ ]</td><td>Review SCRA, TSP, VA loan basics, insurance, and education benefits.</td><td>Military benefits are part of your financial advantage.</td></tr>
  </table>

  <h2>Next 12 Months</h2>
  <table class="checklist">
    <tr><th></th><th>Action</th><th>Standard</th></tr>
    <tr><td>[ ]</td><td>Reach a 3-month emergency fund.</td><td>${currency(emergency.threeMonths)}</td></tr>
    <tr><td>[ ]</td><td>Raise your savings rate closer to 50% if possible.</td><td>Current rate: ${percent(result.savingsRate)}</td></tr>
    <tr><td>[ ]</td><td>Update your net worth tracker every month.</td><td>12 updates completed.</td></tr>
    <tr><td>[ ]</td><td>Review your allocation and rebalance only if needed.</td><td>Stay boring, consistent, and disciplined.</td></tr>
  </table>

  <h2>TSP and Roth IRA Allocation Worksheet</h2>
  <p>Simple default: use broad stock index exposure first. For TSP, the C Fund most closely tracks the S&P 500. For Roth IRA, consider a low-cost S&P 500 or total-market index fund. Fill this in with the exact funds available to you.</p>
  <table>
    <tr><th>Account</th><th>Suggested role</th><th>Monthly target</th><th>Your selected fund</th></tr>
    <tr><td>TSP</td><td>Core retirement account. Start with match, then increase over time.</td><td>${currency(tspTarget)}</td><td></td></tr>
    <tr><td>Roth IRA</td><td>Personal tax-advantaged account if eligible.</td><td>${currency(rothTarget)}</td><td></td></tr>
    <tr><td>HSA / Taxable</td><td>Use after basics are covered, based on eligibility and goals.</td><td>${currency(extraTarget)}</td><td></td></tr>
  </table>

  <h2>Emergency Fund Target</h2>
  <p>Your estimated monthly amount after investing is ${currency(emergency.monthlyEssentials)}. Use that as a rough essential-expense planning number until you track the exact amount.</p>
  <div class="grid">
    <div class="card"><span>Starter cash</span><strong>${currency(emergency.starter)}</strong></div>
    <div class="card"><span>3 months</span><strong>${currency(emergency.threeMonths)}</strong></div>
    <div class="card"><span>6 months</span><strong>${currency(emergency.sixMonths)}</strong></div>
  </div>

  <h2>Monthly Spending Targets</h2>
  <p>Protect your investing number first: ${currency(inputs.monthlyInvestment)} per month. Use the remaining ${currency(monthlySpending)} for needs, family, giving, debt payoff, and lifestyle.</p>
  <table>
    <tr><th>Category</th><th>Suggested guardrail</th><th>Your target</th></tr>
    <tr><td>Investing</td><td>Pay yourself first</td><td>${currency(inputs.monthlyInvestment)}</td></tr>
    <tr><td>Needs</td><td>Housing, food, transportation, insurance, family basics</td><td></td></tr>
    <tr><td>Debt payoff</td><td>Prioritize anything above 8% interest</td><td></td></tr>
    <tr><td>Lifestyle</td><td>Keep this honest so the plan can survive</td><td></td></tr>
  </table>

  <h2>Debt-Free Priority System</h2>
  <p>If you have debt, use this order. Do not overthink it.</p>
  <ol>
    <li>Stay current on every minimum payment.</li>
    <li>Kill credit cards, payday loans, and high-interest personal loans first.</li>
    <li>Keep investing enough to capture any match while attacking high-interest debt.</li>
    <li>Once high-interest debt is gone, redirect that payment into emergency fund or investing.</li>
    <li>Do not add new consumer debt while calling the plan progress.</li>
  </ol>

  <h2>Annual Review Checklist</h2>
  <ul>
    <li>Update net worth.</li>
    <li>Update monthly investing.</li>
    <li>Review TSP/Roth IRA allocation.</li>
    <li>Raise savings rate if income increased.</li>
    <li>Check milestone dates and adjust the plan.</li>
  </ul>

  <h2>Your One-Page Mission Brief</h2>
  <div class="callout">
    <p><strong>Mission:</strong> Build wealth without hype by saving aggressively, using tax-advantaged accounts, investing in broad index funds, and refusing lifestyle inflation.</p>
    <p><strong>Next checkpoint:</strong> ${currency(result.milestoneRows[0].target)} by ${result.milestoneRows[0].date}.</p>
    <p><strong>Monthly standard:</strong> Invest ${currency(inputs.monthlyInvestment)}, update your tracker, and make one decision that protects future freedom.</p>
  </div>

  <p class="signature">Built by Soldier to Millionaire. Stay disciplined, stay humble, and keep the system simple.</p>
</main>
</body>
</html>`
}

export default function MilitaryWealthPathReport() {
  const [inputs, setInputs] = useState<WealthPathInputs | null>(null)

  useEffect(() => {
    setInputs(readStoredInputs())
  }, [])

  const result = useMemo(() => (inputs ? calculateWealthPath(inputs) : null), [inputs])
  const emergency = inputs ? emergencyFundTargets(inputs) : null

  if (!inputs || !result || !emergency) {
    return (
      <main className="mwp-report-page">
        <section className="container mwp-report-download">
          <div className="section-tag gold">Military Wealth Path</div>
          <h1>No saved report inputs found.</h1>
          <p>
            Go back to Military Wealth Path, enter your numbers, then click the Square payment button.
            Your report inputs are saved on this device before checkout.
          </p>
          <Link href="/military-wealth-path" className="btn btn-gold btn-lg">Return to Wealth Path</Link>
        </section>
      </main>
    )
  }

  return (
    <main className="mwp-report-page">
      <section className="container mwp-report-download">
        <div className="section-tag gold">Paid Report</div>
        <h1>Your Military Wealth Path Report</h1>
        <p>
          Download the report as a printable HTML file, or use your browser&apos;s print command
          and choose &quot;Save as PDF.&quot;
        </p>
        <div className="mwp-report-actions">
          <button
            type="button"
            className="btn btn-gold btn-lg"
            onClick={() => downloadHtml('military-wealth-path-report.html', reportHtml(inputs, result))}
          >
            Download Report
          </button>
          <button type="button" className="btn btn-outline" onClick={() => window.print()}>
            Print / Save PDF
          </button>
        </div>

        <div className="mwp-report-preview">
          <h2>Snapshot</h2>
          <div className="mwp-report-preview-grid">
            <div><span>Current net worth</span><strong>{currency(inputs.currentNetWorth)}</strong></div>
            <div><span>Monthly investing</span><strong>{currency(inputs.monthlyInvestment)}</strong></div>
            <div><span>Savings rate</span><strong>{percent(result.savingsRate)}</strong></div>
          </div>
          <h2>Milestones</h2>
          {result.milestoneRows.map((row) => (
            <div key={row.target} className="mwp-report-row">
              <span>{currency(row.target)}</span>
              <strong>{row.date}</strong>
              <small>{row.label}</small>
            </div>
          ))}
          <h2>Included in the full report</h2>
          <div className="mwp-report-row">
            <span>Action plan</span>
            <strong>30 / 90 / 365 days</strong>
            <small>Concrete next steps for debt, TSP, Roth IRA, emergency fund and spending.</small>
          </div>
          <div className="mwp-report-row">
            <span>Emergency fund target</span>
            <strong>{currency(emergency.threeMonths)} to {currency(emergency.sixMonths)}</strong>
            <small>Based on your current income and monthly investing number.</small>
          </div>
          <div className="mwp-report-row">
            <span>Worksheets</span>
            <strong>TSP, Roth IRA, budget and annual review</strong>
            <small>Printable tables you can fill in and revisit every month.</small>
          </div>
        </div>
      </section>
    </main>
  )
}
