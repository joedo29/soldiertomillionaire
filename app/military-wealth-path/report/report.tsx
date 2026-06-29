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

async function downloadPdf(inputs: WealthPathInputs, result: ReturnType<typeof calculateWealthPath>) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 44
  const contentWidth = pageWidth - margin * 2
  const emergency = emergencyFundTargets(inputs)
  const monthlySpending = Math.max(0, inputs.monthlyIncome - inputs.monthlyInvestment)
  const tspTarget = Math.round(inputs.monthlyInvestment * 0.6)
  const rothTarget = Math.round(inputs.monthlyInvestment * 0.25)
  const extraTarget = Math.max(0, inputs.monthlyInvestment - tspTarget - rothTarget)
  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  let y = 48

  function ensureSpace(height: number) {
    if (y + height <= pageHeight - margin) return
    doc.addPage()
    y = margin
  }

  function text(value: string, options: { size?: number; bold?: boolean; color?: [number, number, number]; gap?: number; width?: number } = {}) {
    const size = options.size ?? 10
    const gap = options.gap ?? 14
    const width = options.width ?? contentWidth
    doc.setFont('helvetica', options.bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...(options.color ?? [26, 31, 20]))
    const lines = doc.splitTextToSize(value, width)
    ensureSpace(lines.length * (size + 4) + gap)
    doc.text(lines, margin, y)
    y += lines.length * (size + 4) + gap
  }

  function heading(value: string) {
    ensureSpace(36)
    y += 8
    doc.setDrawColor(221, 214, 198)
    doc.line(margin, y, pageWidth - margin, y)
    y += 22
    text(value, { size: 17, bold: true, gap: 12 })
  }

  function rows(items: Array<[string, string]>) {
    const rowHeight = 28
    ensureSpace(items.length * rowHeight + 12)
    items.forEach(([label, value]) => {
      doc.setFillColor(245, 241, 232)
      doc.rect(margin, y - 14, contentWidth, rowHeight, 'F')
      doc.setTextColor(79, 90, 73)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(label, margin + 10, y + 3)
      doc.setTextColor(26, 31, 20)
      doc.setFont('helvetica', 'bold')
      doc.text(value, margin + contentWidth * 0.48, y + 3)
      y += rowHeight + 4
    })
    y += 8
  }

  function bullets(items: string[]) {
    items.forEach((item) => text(`- ${item}`, { size: 10, color: [79, 90, 73], gap: 6 }))
    y += 8
  }

  doc.setFillColor(26, 31, 20)
  doc.rect(0, 0, pageWidth, 210, 'F')
  doc.setTextColor(201, 168, 76)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('SOLDIER TO MILLIONAIRE', margin, 48)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(34)
  doc.text('Your Military Wealth', margin, 96)
  doc.text('Path Roadmap', margin, 136)
  doc.setTextColor(201, 168, 76)
  doc.setFontSize(10)
  doc.text(`Prepared ${reportDate} | Projection uses ${(wealthPathAnnualReturn * 100).toFixed(0)}% annual return, compounded yearly`, margin, 178)
  y = 248

  text('A practical plan built from your numbers. The mission is simple: protect your savings rate, invest consistently, avoid lifestyle inflation, and use time as your advantage.', {
    size: 12,
    color: [79, 90, 73],
    gap: 18,
  })
  text('Educational only, not financial advice. Returns are not guaranteed. Use this as a planning tool and verify account/tax decisions with qualified professionals when needed.', {
    size: 9,
    color: [107, 117, 101],
    gap: 16,
  })

  heading('Your Starting Numbers')
  rows([
    ['Current net worth', currency(inputs.currentNetWorth)],
    ['Monthly investing', currency(inputs.monthlyInvestment)],
    ['Monthly take-home income', currency(inputs.monthlyIncome)],
    ['Savings rate', percent(result.savingsRate)],
  ])
  text(`What this means: Your most important number is not income. It is the amount you keep and put to work every month. Protect the ${currency(inputs.monthlyInvestment)} monthly investment first, then build the rest of your lifestyle around what remains.`, {
    size: 10,
    color: [79, 90, 73],
  })

  heading('Major Milestones')
  rows(result.milestoneRows.map((row) => [currency(row.target), `${row.date} (${row.label})`]))

  heading('Five-Year Milestone Table')
  rows(result.fiveYearRows.map((row) => [`Year ${row.year}`, `${currency(row.value)} projected net worth | ${currency(row.value - inputs.currentNetWorth)} growth from today`]))

  heading('Your Roadmap')
  bullets(result.recs)
  text('Battle rhythm: Automate investing on payday, review spending once per week, update net worth once per month, and increase contributions every time your income rises.', {
    size: 10,
    color: [79, 90, 73],
  })

  heading('Next 30 Days')
  bullets([
    'Write down every debt balance, interest rate, and minimum payment.',
    'Confirm your TSP contribution captures the full match.',
    `Set automatic monthly investing to at least ${currency(inputs.monthlyInvestment)}.`,
    'Open or review your Roth IRA if eligible.',
  ])

  heading('Next 90 Days')
  bullets([
    `Build starter emergency cash: ${currency(emergency.starter)}.`,
    'Cut or renegotiate one recurring expense and move the savings into investing or debt payoff.',
    'Increase TSP by 1% if your budget survives the first month.',
    'Review SCRA, TSP, VA loan basics, insurance, and education benefits.',
  ])

  heading('Next 12 Months')
  bullets([
    `Reach a 3-month emergency fund: ${currency(emergency.threeMonths)}.`,
    `Raise your savings rate closer to 50% if possible. Current rate: ${percent(result.savingsRate)}.`,
    'Update your net worth tracker every month.',
    'Review your allocation and rebalance only if needed.',
  ])

  heading('TSP and Roth IRA Allocation Worksheet')
  text('Simple default: use broad stock index exposure first. For TSP, the C Fund most closely tracks the S&P 500. For Roth IRA, consider a low-cost S&P 500 or total-market index fund. Fill this in with the exact funds available to you.', {
    size: 10,
    color: [79, 90, 73],
  })
  rows([
    ['TSP target', `${currency(tspTarget)} per month | core retirement account`],
    ['Roth IRA target', `${currency(rothTarget)} per month | personal tax-advantaged account if eligible`],
    ['HSA / taxable target', `${currency(extraTarget)} per month | use after basics are covered`],
  ])

  heading('Emergency Fund Target')
  rows([
    ['Estimated monthly essentials', currency(emergency.monthlyEssentials)],
    ['Starter cash', currency(emergency.starter)],
    ['3-month emergency fund', currency(emergency.threeMonths)],
    ['6-month emergency fund', currency(emergency.sixMonths)],
  ])

  heading('Monthly Spending Targets')
  text(`Protect your investing number first: ${currency(inputs.monthlyInvestment)} per month. Use the remaining ${currency(monthlySpending)} for needs, family, giving, debt payoff, and lifestyle.`, {
    size: 10,
    color: [79, 90, 73],
  })
  rows([
    ['Investing', currency(inputs.monthlyInvestment)],
    ['Needs', 'Housing, food, transportation, insurance, family basics'],
    ['Debt payoff', 'Prioritize anything above 8% interest'],
    ['Lifestyle', 'Keep this honest so the plan can survive'],
  ])

  heading('Debt-Free Priority System')
  bullets([
    'Stay current on every minimum payment.',
    'Kill credit cards, payday loans, and high-interest personal loans first.',
    'Keep investing enough to capture any match while attacking high-interest debt.',
    'Once high-interest debt is gone, redirect that payment into emergency fund or investing.',
    'Do not add new consumer debt while calling the plan progress.',
  ])

  heading('Annual Review Checklist')
  bullets([
    'Update net worth.',
    'Update monthly investing.',
    'Review TSP/Roth IRA allocation.',
    'Raise savings rate if income increased.',
    'Check milestone dates and adjust the plan.',
  ])

  heading('Your One-Page Mission Brief')
  text(`Mission: Build wealth without hype by saving aggressively, using tax-advantaged accounts, investing in broad index funds, and refusing lifestyle inflation. Next checkpoint: ${currency(result.milestoneRows[0].target)} by ${result.milestoneRows[0].date}. Monthly standard: invest ${currency(inputs.monthlyInvestment)}, update your tracker, and make one decision that protects future freedom.`, {
    size: 10,
    color: [79, 90, 73],
  })
  text('Built by Soldier to Millionaire. Stay disciplined, stay humble, and keep the system simple.', {
    size: 10,
    bold: true,
    color: [45, 74, 30],
  })

  doc.save('military-wealth-path-report.pdf')
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

export default function MilitaryWealthPathReport() {
  const [inputs, setInputs] = useState<WealthPathInputs | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

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
          Download the report as a PDF file, or use your browser&apos;s print command
          if you want a second copy.
        </p>
        <div className="mwp-report-actions">
          <button
            type="button"
            className="btn btn-gold btn-lg"
            disabled={isGenerating}
            onClick={async () => {
              setIsGenerating(true)
              try {
                await downloadPdf(inputs, result)
              } finally {
                setIsGenerating(false)
              }
            }}
          >
            {isGenerating ? 'Creating PDF...' : 'Download PDF Report'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => window.print()}>
            Print Backup
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
