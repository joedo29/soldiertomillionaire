// Mortgage payoff math. Ported from the PyScript MVP; the loop semantics are
// preserved exactly so results match the prototype to the cent.

export interface MortgageInputs {
  homePrice: number
  downPayment: number
  annualRate: number
  termYears: number
  annualTax: number
  annualInsurance: number
  extraPrincipal: number
}

export interface YearRow {
  /** Year mark, rounded to 2dp. A final partial year shows e.g. 12.75. */
  year: number
  principal: number
  interest: number
  balance: number
}

export interface ChartPoint {
  year: number
  balance: number
  cumulativeInterest: number
}

export interface TermComparison {
  monthlyPI: number
  totalInterest: number
}

export interface MortgageResult {
  loanAmount: number
  monthlyPI: number
  monthlyTax: number
  monthlyInsurance: number
  extraPrincipal: number
  totalMonthlyOutflow: number
  /** Lifetime interest actually paid, including the effect of extra principal. */
  totalInterestPaid: number
  /** Lifetime interest with no extra principal, used as the savings baseline. */
  baselineInterest: number
  interestSaved: number
  monthsTaken: number
  /** Payoff time in years, rounded to 1dp (matches the MVP's summary line). */
  payoffYears: number
  comparison30: TermComparison
  comparison15: TermComparison
  diffMonthlyPI: number
  diffTotalInterest: number
  yearRows: YearRow[]
  chartPoints: ChartPoint[]
}

export const TERM_OPTIONS = [30, 20, 15, 10] as const

export function currency(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function compactCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `$${Math.round(value / 1_000)}K`
  return `$${Math.round(value)}`
}

/** Round half away from zero, matching the MVP's use of Python round() on non-tie values. */
function roundTo(value: number, digits: number): number {
  const f = 10 ** digits
  return Math.sign(value) * Math.round(Math.abs(value) * f) / f
}

/** Standard amortization payment. Falls back to straight-line when the rate is 0. */
export function monthlyPayment(loanAmount: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 100 / 12
  if (monthlyRate === 0) return loanAmount / months
  const growth = (1 + monthlyRate) ** months
  return (loanAmount * monthlyRate * growth) / (growth - 1)
}

/**
 * Closed-form term comparison. The MVP derives total interest as
 * (payment x months) - principal rather than simulating, so we do too --
 * simulating would drift by a few dollars on the final payment.
 */
export function baseScenario(
  loanAmount: number,
  annualRate: number,
  years: number,
): TermComparison {
  const months = years * 12
  const monthlyRate = annualRate / 100 / 12
  if (monthlyRate === 0) {
    return { monthlyPI: loanAmount / months, totalInterest: 0 }
  }
  const pi = monthlyPayment(loanAmount, annualRate, months)
  return { monthlyPI: pi, totalInterest: pi * months - loanAmount }
}

/** Simulated lifetime interest with no extra principal — the savings baseline. */
function baselineInterest(
  loanAmount: number,
  monthlyRate: number,
  numPayments: number,
  monthlyPI: number,
): number {
  let balance = loanAmount
  let totalInterest = 0

  for (let i = 0; i < numPayments; i++) {
    if (balance <= 0) break
    let interest: number
    let principal: number
    if (monthlyRate === 0) {
      interest = 0
      principal = monthlyPI
    } else {
      interest = balance * monthlyRate
      principal = monthlyPI - interest
    }
    if (balance < principal) principal = balance
    totalInterest += interest
    balance -= principal
  }

  return totalInterest
}

export interface ValidationError {
  field: 'homePrice' | 'extraPrincipal'
  message: string
}

/** Validation rules carried over from the MVP, unchanged. */
export function validate(inputs: MortgageInputs): ValidationError | null {
  if (inputs.homePrice <= 0 || inputs.downPayment >= inputs.homePrice) {
    return {
      field: 'homePrice',
      message: 'Verify your home price and down payment parameters.',
    }
  }
  if (inputs.extraPrincipal < 0) {
    return { field: 'extraPrincipal', message: 'Extra principal cannot be negative.' }
  }
  return null
}

export function calculate(inputs: MortgageInputs): MortgageResult {
  const {
    homePrice,
    downPayment,
    annualRate,
    termYears,
    annualTax,
    annualInsurance,
    extraPrincipal,
  } = inputs

  const loanAmount = homePrice - downPayment
  const monthlyRate = annualRate / 100 / 12
  const numPayments = termYears * 12
  const monthlyPI = monthlyPayment(loanAmount, annualRate, numPayments)

  const monthlyTax = annualTax / 12
  const monthlyInsurance = annualInsurance / 12
  const totalMonthlyOutflow = monthlyPI + monthlyTax + monthlyInsurance + extraPrincipal

  const baseline = baselineInterest(loanAmount, monthlyRate, numPayments, monthlyPI)

  const comparison30 = baseScenario(loanAmount, annualRate, 30)
  const comparison15 = baseScenario(loanAmount, annualRate, 15)

  // Amortization with extra principal applied.
  let balance = loanAmount
  let yearlyInterest = 0
  let yearlyPrincipal = 0
  let totalInterestPaid = 0
  let monthsTaken = 0

  const yearRows: YearRow[] = []
  const chartPoints: ChartPoint[] = [
    { year: 0, balance: loanAmount, cumulativeInterest: 0 },
  ]

  for (let month = 1; month <= numPayments; month++) {
    if (balance <= 0) break
    monthsTaken = month

    let interest: number
    let basePrincipal: number
    if (monthlyRate === 0) {
      interest = 0
      basePrincipal = monthlyPI
    } else {
      interest = balance * monthlyRate
      basePrincipal = monthlyPI - interest
    }

    let principalPaid = basePrincipal + extraPrincipal
    if (balance < principalPaid) principalPaid = balance

    yearlyInterest += interest
    yearlyPrincipal += principalPaid
    totalInterestPaid += interest
    balance -= principalPaid

    if (balance < 0.01) balance = 0

    if (month % 12 === 0 || balance === 0) {
      const yearMark = roundTo(month / 12, 2)
      chartPoints.push({ year: yearMark, balance, cumulativeInterest: totalInterestPaid })
      yearRows.push({
        year: yearMark,
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        balance,
      })
      yearlyInterest = 0
      yearlyPrincipal = 0
    }

    if (balance === 0) break
  }

  return {
    loanAmount,
    monthlyPI,
    monthlyTax,
    monthlyInsurance,
    extraPrincipal,
    totalMonthlyOutflow,
    totalInterestPaid,
    baselineInterest: baseline,
    interestSaved: Math.max(0, baseline - totalInterestPaid),
    monthsTaken,
    payoffYears: roundTo(monthsTaken / 12, 1),
    comparison30,
    comparison15,
    diffMonthlyPI: comparison15.monthlyPI - comparison30.monthlyPI,
    diffTotalInterest: comparison30.totalInterest - comparison15.totalInterest,
    yearRows,
    chartPoints,
  }
}
