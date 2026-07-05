'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  calculateWealthPath,
  currency,
  monthsToTarget,
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

  // "What if you invested $200 more?" scenario for the plain-English section
  const baseMillionMonths = result.milestoneRows[2].months
  const boostedMillionMonths = monthsToTarget(inputs.currentNetWorth, inputs.monthlyInvestment + 200, 1000000)
  const monthsSavedWith200 = baseMillionMonths !== null && boostedMillionMonths !== null
    ? baseMillionMonths - boostedMillionMonths
    : null
  const firstUnreached = result.milestoneRows.find((row) => row.months !== null && row.months > 0)

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

  heading('A Letter From Joe')
  text('Nobody handed me a plan. At 30 I was working three jobs, and I came back from a trip to Hawaii with $20 to my name. Not $20 in savings. $20, period. What changed my life was not a raise, a hot stock, or luck. It was a system simple enough to follow on my worst weeks, and the discipline to never break it.', {
    size: 11,
    color: [79, 90, 73],
    gap: 10,
  })
  text('Eight years later that system took me from $0 to over $750,000 in net worth, a paid-off house, and the freedom to enlist in the U.S. Army at 38 because I wanted to serve, not because I needed a paycheck. This report is that same system, rebuilt around your numbers. It is not theory. Every page is something I actually did.', {
    size: 11,
    color: [79, 90, 73],
    gap: 10,
  })
  text('Read it once top to bottom. Then execute the Priority Ladder one rung at a time. That is the whole secret: boring on purpose, relentless by design.', {
    size: 11,
    color: [79, 90, 73],
    gap: 8,
  })
  text('— Joe Do, US Army | Founder, Soldier to Millionaire', {
    size: 11,
    bold: true,
    color: [45, 74, 30],
    gap: 14,
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
  heading('Your Situation in Plain English')
  if (result.savingsRate === null) {
    text('You did not enter a monthly income, so I cannot score your savings rate yet. That number matters more than any other on this page: it is the single biggest predictor of when you reach financial freedom. Add it to your tracker this week.', {
      size: 10,
      color: [79, 90, 73],
    })
  } else if (result.savingsRate >= 50) {
    text(`You are saving ${result.savingsRate.toFixed(1)}% of your take-home pay. That is elite territory — the level I held while building my own net worth. Most Americans save under 5%. Your only real enemies now are lifestyle inflation and panic selling. Protect the rate, stay invested, and the timeline below takes care of itself.`, {
      size: 10,
      color: [79, 90, 73],
    })
  } else if (result.savingsRate >= 20) {
    text(`You are saving ${result.savingsRate.toFixed(1)}% of your take-home pay. That already puts you ahead of most soldiers — and most Americans, who save under 5%. You are past the hardest part, which is starting. The next mission is pushing that rate toward 50% every time your income rises: promotions, raises, special pay, bonuses. Send the increase to investments before your lifestyle can find it.`, {
      size: 10,
      color: [79, 90, 73],
    })
  } else {
    text(`You are saving ${result.savingsRate.toFixed(1)}% of your take-home pay. I am not going to sugarcoat it: at this rate, compounding cannot do its job yet. The good news is that this is the exact spot I started from, and the fix is not a bigger paycheck — it is a system. Start with the Priority Ladder in this report and raise your rate 1% each month. Small moves, repeated, are how I went from $20 in my pocket to financial freedom.`, {
      size: 10,
      color: [79, 90, 73],
    })
  }
  if (firstUnreached && monthsSavedWith200 !== null && monthsSavedWith200 > 0) {
    text(`One number to sit with: if you invest just $200 more per month, you reach $1,000,000 roughly ${Math.max(1, Math.round(monthsSavedWith200 / 12))} year(s) sooner. Your next checkpoint is ${currency(firstUnreached.target)} by ${firstUnreached.date} — every extra dollar you invest now pulls that date closer.`, {
      size: 10,
      color: [79, 90, 73],
    })
  }
  text(`The rule that makes all of this work: protect the ${currency(inputs.monthlyInvestment)} monthly investment first, then build your lifestyle around what remains — never the other way around.`, {
    size: 10,
    bold: true,
    color: [45, 74, 30],
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

  heading('Military Wealth Accelerators')
  text('These are the advantages the uniform gives you that no civilian financial tool will ever mention. Each one is a legal, built-in accelerant. Use every one you qualify for.', {
    size: 10,
    color: [79, 90, 73],
  })
  text('1. The BAH gap.', { size: 11, bold: true, gap: 6 })
  text('If your housing allowance is bigger than your actual rent, that gap is tax-free income. Most soldiers let it disappear into lifestyle. Instead, set up an automatic transfer of the difference into investments on the day BAH hits. A $400/month gap invested is roughly $92,000 in ten years at 12%.', {
    size: 10, color: [79, 90, 73],
  })
  text('2. Combat Zone Tax Exclusion + Roth IRA.', { size: 11, bold: true, gap: 6 })
  text('Pay earned in a combat zone is federal-tax-free. Contribute that tax-free pay to a Roth IRA and it grows tax-free and comes out tax-free. Money that is never taxed at any point in its life is the single best deal in the entire U.S. tax code. If you deploy, max the Roth from combat pay before anything else.', {
    size: 10, color: [79, 90, 73],
  })
  text('3. SCRA 6% interest cap.', { size: 11, bold: true, gap: 6 })
  text('The Servicemembers Civil Relief Act caps interest at 6% on debts you took on before entering active duty — credit cards, car loans, even mortgages. Lenders will not volunteer this. You must request it in writing with a copy of your orders. If you carry pre-service debt above 6%, this is a phone call worth thousands.', {
    size: 10, color: [79, 90, 73],
  })
  text('4. Special pays are invisible money.', { size: 11, bold: true, gap: 6 })
  text('Jump pay, flight pay, hazardous duty pay, sea pay, reenlistment bonuses — none of it existed in your budget before you got it. Route 100% of special pay straight to investments before it ever touches your checking account. Your lifestyle never misses money it never saw.', {
    size: 10, color: [79, 90, 73],
  })
  text('5. The BRS match is a 100% return.', { size: 11, bold: true, gap: 6 })
  text('Under the Blended Retirement System, the government matches up to 5% of your base pay into the TSP. Contributing less than 5% is refusing free money — a guaranteed, instant 100% return no investment on Earth can match. This is rung two of the Priority Ladder for a reason.', {
    size: 10, color: [79, 90, 73],
  })
  text('6. The VA loan — used with discipline.', { size: 11, bold: true, gap: 6 })
  text('Zero down and no PMI is a powerful tool, and a dangerous one: the same benefit that gets you a home with no down payment also makes it easy to buy too much house. Use the VA loan for a home that fits your life, not the maximum you are approved for. The goal is a payment small enough that extra principal attacks are possible.', {
    size: 10, color: [79, 90, 73],
  })

  heading('5 Mistakes That Kill Military Wealth')
  text('I have watched each of these up close. Every one is avoidable, and every one costs six figures over a career.', {
    size: 10,
    color: [79, 90, 73],
  })
  text('1. The PCS car upgrade.', { size: 11, bold: true, gap: 6 })
  text('New duty station, new car, new loan. A $700/month car payment invested instead is over $160,000 in ten years. Drive the paid-off car and let the parking lot at your next post impress itself.', {
    size: 10, color: [79, 90, 73],
  })
  text('2. Leaving the TSP match on the table.', { size: 11, bold: true, gap: 6 })
  text('Thousands of soldiers contribute less than 5% and forfeit the match. That is refusing part of your own compensation. Fix it in MyPay tonight — it takes three minutes.', {
    size: 10, color: [79, 90, 73],
  })
  text('3. Promotion-day lifestyle inflation.', { size: 11, bold: true, gap: 6 })
  text('Every promotion is a fork: raise your lifestyle or raise your savings rate. The soldiers who reach freedom fast treat every raise as invisible — the increase goes to investments automatically, and life continues exactly as it was.', {
    size: 10, color: [79, 90, 73],
  })
  text('4. Cashing out the TSP at separation.', { size: 11, bold: true, gap: 6 })
  text('Cashing out means taxes, a 10% penalty, and the death of every year of compounding that money had left. Roll it over or leave it invested. Your 55-year-old self is counting on your 25-year-old self not to raid the account.', {
    size: 10, color: [79, 90, 73],
  })
  text('5. Buying at the top of the VA approval.', { size: 11, bold: true, gap: 6 })
  text('The lender tells you what you can borrow, not what you can afford. A house at the top of your approval turns you house-poor and makes every other rung of the ladder impossible. Buy below your means and keep your firepower.', {
    size: 10, color: [79, 90, 73],
  })

  heading('The Priority Ladder')
  text('Forget juggling ten priorities. Climb one rung at a time — do not move to the next rung until the current one is done. If you only keep one page of this report, keep this one.', {
    size: 10,
    color: [79, 90, 73],
  })
  rows([
    ['Rung 1', 'Stay current on every minimum payment + save starter cash: ' + currency(emergency.starter)],
    ['Rung 2', 'Set TSP to at least 5% — capture the full BRS match (free money)'],
    ['Rung 3', 'Kill every debt above 8% interest, highest rate first'],
    ['Rung 4', `Build the 3-month emergency fund: ${currency(emergency.threeMonths)}`],
    ['Rung 5', 'Max your Roth IRA ($7,000/yr) — from combat pay first if deployed'],
    ['Rung 6', 'Raise TSP toward the annual max ($23,500/yr)'],
    ['Rung 7', 'Fund an HSA if eligible — triple tax advantage'],
    ['Rung 8', 'Taxable brokerage and extra mortgage principal'],
  ])
  text(`Where you likely stand today: with ${currency(inputs.currentNetWorth)} net worth and ${currency(inputs.monthlyInvestment)}/month invested, find your rung, finish it, and climb. Update your tracker monthly and re-check the ladder every time your income changes.`, {
    size: 10,
    color: [79, 90, 73],
  })

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

  heading('Your Mission Brief')
  text('SITUATION:', { size: 10, bold: true, gap: 4 })
  text(`Net worth ${currency(inputs.currentNetWorth)}. Monthly investing ${currency(inputs.monthlyInvestment)}. Savings rate ${percent(result.savingsRate)}. Time and compounding are on your side — but only if you start now.`, {
    size: 10, color: [79, 90, 73],
  })
  text('MISSION:', { size: 10, bold: true, gap: 4 })
  text(`Reach ${firstUnreached ? `${currency(firstUnreached.target)} by ${firstUnreached.date}` : 'your next milestone'} by protecting your savings rate, climbing the Priority Ladder, and refusing lifestyle inflation. Long-range objective: ${currency(1000000)} by ${result.milestoneRows[2].date}.`, {
    size: 10, color: [79, 90, 73],
  })
  text('EXECUTION:', { size: 10, bold: true, gap: 4 })
  text(`Invest ${currency(inputs.monthlyInvestment)} automatically on payday. Update your net worth tracker monthly. Route every raise, bonus, and special pay to investments before your lifestyle sees it. Never sell in a downturn. Re-read this report every time your income changes.`, {
    size: 10, color: [79, 90, 73],
  })
  text('COMMANDER\'S INTENT:', { size: 10, bold: true, gap: 4 })
  text('Freedom. Not a number on a screen — the ability to choose your schedule, protect your family, and serve because you want to, not because you have to. Every dollar you invest this month is a soldier working for you around the clock.', {
    size: 10, color: [79, 90, 73],
  })
  text('Your mission starts today. Not next payday. Today.', {
    size: 11,
    bold: true,
    color: [45, 74, 30],
    gap: 8,
  })
  text('— Joe Do, US Army | $0 to $750K in 8 years | soldiertomillionaire.com', {
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
            <strong>The 8-rung Priority Ladder</strong>
            <small>Exactly what to do and in what order — debt, TSP match, Roth IRA, emergency fund and beyond.</small>
          </div>
          <div className="mwp-report-row">
            <span>Military accelerators</span>
            <strong>BAH gap, combat-zone Roth, SCRA, special pays</strong>
            <small>The advantages the uniform gives you that civilian tools never mention.</small>
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
