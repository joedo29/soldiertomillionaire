export const wealthPathMilestones = [100000, 500000, 1000000]
export const wealthPathAnnualReturn = 0.12

export type WealthPathInputs = {
  currentNetWorth: number
  monthlyInvestment: number
  monthlyIncome: number
}

export type WealthPathMilestone = {
  target: number
  months: number | null
  label: string
  date: string
}

export function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function compactCurrency(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`
  if (value >= 1000) return `$${Math.round(value / 1000)}K`
  return currency(value)
}

export function monthLabel(months: number | null) {
  if (months === null) return 'Not reached'
  if (months <= 0) return 'Already there'

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (years === 0) return `${remainingMonths} mo`
  if (remainingMonths === 0) return `${years} yr`
  return `${years} yr ${remainingMonths} mo`
}

export function targetDate(months: number | null) {
  if (months === null) return 'Increase monthly investing'
  const date = new Date()
  date.setMonth(date.getMonth() + Math.max(months, 0))
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function monthsToTarget(current: number, monthlyInvestment: number, target: number) {
  if (current >= target) return 0
  if (monthlyInvestment <= 0 && current <= 0) return null

  let balance = current
  for (let month = 1; month <= 12 * 80; month += 1) {
    balance += monthlyInvestment
    if (month % 12 === 0) {
      balance *= 1 + wealthPathAnnualReturn
    }
    if (balance >= target) return month
  }

  return null
}

export function futureValue(current: number, monthlyInvestment: number, months: number) {
  let balance = current
  for (let month = 0; month < months; month += 1) {
    balance += monthlyInvestment
    if ((month + 1) % 12 === 0) {
      balance *= 1 + wealthPathAnnualReturn
    }
  }
  return balance
}

export function scoreSavingsRate(rate: number | null) {
  if (rate === null) return { label: 'Add income', score: 0, tone: 'neutral' }
  if (rate >= 50) return { label: 'Elite', score: 100, tone: 'strong' }
  if (rate >= 30) return { label: 'Strong', score: 78, tone: 'good' }
  if (rate >= 20) return { label: 'Building', score: 58, tone: 'steady' }
  if (rate >= 10) return { label: 'Starter', score: 36, tone: 'warning' }
  return { label: 'At risk', score: 18, tone: 'danger' }
}

export function recommendations(input: {
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

export function calculateWealthPath(inputs: WealthPathInputs) {
  const milestoneRows = wealthPathMilestones.map((target) => {
    const months = monthsToTarget(inputs.currentNetWorth, inputs.monthlyInvestment, target)
    return { target, months, label: monthLabel(months), date: targetDate(months) }
  })

  const savingsRate = inputs.monthlyIncome > 0
    ? (inputs.monthlyInvestment / inputs.monthlyIncome) * 100
    : null
  const score = scoreSavingsRate(savingsRate)
  const recs = recommendations({
    ...inputs,
    savingsRate,
    firstMilestoneMonths: milestoneRows[0].months,
  })
  const chartPoints = buildChartPoints(inputs.currentNetWorth, inputs.monthlyInvestment)
  const fiveYearRows = Array.from({ length: 5 }, (_, index) => {
    const year = index + 1
    return {
      year,
      value: futureValue(inputs.currentNetWorth, inputs.monthlyInvestment, year * 12),
    }
  })

  return { milestoneRows, savingsRate, score, recs, chartPoints, fiveYearRows }
}

export function buildChartPoints(current: number, monthlyInvestment: number) {
  const values = Array.from({ length: 11 }, (_, i) => futureValue(current, monthlyInvestment, i * 12))
  const max = Math.max(100000, ...values)
  return values.map((value, i) => {
    const x = (i / 10) * 100
    const y = 100 - Math.min(100, Math.max(0, (value / max) * 100))
    return { x, y, value, year: i }
  })
}

export function parseMoneyInput(value: string) {
  if (value.trim() === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
