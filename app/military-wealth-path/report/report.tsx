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

function reportHtml(inputs: WealthPathInputs, result: ReturnType<typeof calculateWealthPath>) {
  const rows = result.fiveYearRows
    .map((row) => `<tr><td>Year ${row.year}</td><td>${currency(row.value)}</td></tr>`)
    .join('')
  const milestones = result.milestoneRows
    .map((row) => `<li><strong>${currency(row.target)}</strong>: ${row.date} (${row.label})</li>`)
    .join('')
  const recommendations = result.recs.map((rec) => `<li>${rec}</li>`).join('')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Military Wealth Path Report</title>
  <style>
    body { font-family: Arial, sans-serif; color: #1A1F14; line-height: 1.55; margin: 40px; }
    h1, h2 { color: #1A1F14; }
    h1 { font-size: 34px; }
    h2 { border-top: 1px solid #DDD6C6; padding-top: 20px; margin-top: 28px; }
    table { border-collapse: collapse; width: 100%; margin-top: 12px; }
    td, th { border: 1px solid #DDD6C6; padding: 10px; text-align: left; }
    .brand { color: #2D4A1E; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .note { color: #6B7565; font-size: 13px; }
  </style>
</head>
<body>
  <div class="brand">Soldier to Millionaire</div>
  <h1>Military Wealth Path Report</h1>
  <p class="note">Projection assumes ${(wealthPathAnnualReturn * 100).toFixed(0)}% annual return, compounded yearly. Educational only, not financial advice.</p>

  <h2>Your Starting Numbers</h2>
  <ul>
    <li>Current net worth: <strong>${currency(inputs.currentNetWorth)}</strong></li>
    <li>Monthly investing: <strong>${currency(inputs.monthlyInvestment)}</strong></li>
    <li>Monthly take-home income: <strong>${currency(inputs.monthlyIncome)}</strong></li>
    <li>Savings rate: <strong>${result.savingsRate === null ? 'Add income to calculate' : `${result.savingsRate.toFixed(1)}%`}</strong></li>
  </ul>

  <h2>Major Milestones</h2>
  <ul>${milestones}</ul>

  <h2>Five-Year Milestone Table</h2>
  <table><tbody>${rows}</tbody></table>

  <h2>Your Roadmap</h2>
  <ol>${recommendations}</ol>

  <h2>TSP and Roth IRA Allocation Worksheet</h2>
  <p>Simple default: use broad stock index exposure first. For TSP, the C Fund most closely tracks the S&P 500. For Roth IRA, consider a low-cost S&P 500 or total-market index fund. Write your chosen fund, monthly amount, and automation date below.</p>
  <table>
    <tr><th>Account</th><th>Fund</th><th>Monthly Amount</th><th>Automation Date</th></tr>
    <tr><td>TSP</td><td></td><td></td><td></td></tr>
    <tr><td>Roth IRA</td><td></td><td></td><td></td></tr>
    <tr><td>HSA / Taxable</td><td></td><td></td><td></td></tr>
  </table>

  <h2>Emergency Fund Target</h2>
  <p>Target 3 months of essential expenses first, then build toward 6 months if you have dependents, unstable expenses, or an upcoming transition.</p>

  <h2>Monthly Spending Targets</h2>
  <p>Protect your investing number first: ${currency(inputs.monthlyInvestment)} per month. Use the remaining ${currency(Math.max(0, inputs.monthlyIncome - inputs.monthlyInvestment))} for giving, bills, food, housing gaps, family, and lifestyle.</p>

  <h2>Printable Action Plan</h2>
  <ol>
    <li>Confirm your TSP contribution captures the full match.</li>
    <li>Automate monthly investing before spending.</li>
    <li>List all debts by interest rate and attack the highest first.</li>
    <li>Review insurance, emergency fund, and benefits once per quarter.</li>
    <li>Increase investing after every raise, bonus, promotion, or special pay.</li>
  </ol>

  <h2>Annual Review Checklist</h2>
  <ul>
    <li>Update net worth.</li>
    <li>Update monthly investing.</li>
    <li>Review TSP/Roth IRA allocation.</li>
    <li>Raise savings rate if income increased.</li>
    <li>Check milestone dates and adjust the plan.</li>
  </ul>
</body>
</html>`
}

export default function MilitaryWealthPathReport() {
  const [inputs, setInputs] = useState<WealthPathInputs | null>(null)

  useEffect(() => {
    setInputs(readStoredInputs())
  }, [])

  const result = useMemo(() => (inputs ? calculateWealthPath(inputs) : null), [inputs])

  if (!inputs || !result) {
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
            <div><span>Savings rate</span><strong>{result.savingsRate === null ? 'Add income' : `${result.savingsRate.toFixed(1)}%`}</strong></div>
          </div>
          <h2>Milestones</h2>
          {result.milestoneRows.map((row) => (
            <div key={row.target} className="mwp-report-row">
              <span>{currency(row.target)}</span>
              <strong>{row.date}</strong>
              <small>{row.label}</small>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
