import { vaCompensation, type FamilyStatus } from './vaDisabilityRates'
import { STATE_TAX, stateTaxMonthly } from './stateMilitaryTax'

/**
 * Military retirement math.
 *
 * Rules encoded here, with citations:
 *   • 20-year cliff vesting for regular active-duty retirement (10 U.S.C. § 1409).
 *     Under 20 years of service there is no defined-benefit pension at all.
 *   • Legacy High-3 multiplier 2.5%/year; BRS multiplier 2.0%/year.
 *   • BRS TSP: 1% automatic government contribution plus matching of the first
 *     5% contributed (dollar-for-dollar on the first 3%, 50 cents on the next 2%),
 *     for a maximum government contribution of 5%.
 *   • Legacy members may contribute to the TSP but receive NO government
 *     contribution or match.
 *   • CRDP / VA waiver (10 U.S.C. § 1414): a 20+ year retiree rated 50% or
 *     higher receives retired pay AND VA compensation concurrently. Below 50%,
 *     retired pay is reduced dollar-for-dollar by VA compensation — the benefit
 *     is that the waived portion becomes tax-free, not that it is additional money.
 *   • A veteran who separates under 20 years has no retired pay to offset, so
 *     VA compensation is paid in full with no waiver.
 */

export const LEGACY_MULTIPLIER = 0.025
export const BRS_MULTIPLIER = 0.02
export const VESTING_YEARS = 20
/** CRDP restores full concurrent receipt at this rating and above. */
export const CRDP_MIN_RATING = 50

export type RetirementSystem = 'BRS' | 'Legacy'

export const PAY_GRADES = {
  Enlisted: ['E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9'],
  Warrant: ['W-1', 'W-2', 'W-3', 'W-4', 'W-5'],
  Officer: ['O-1', 'O-2', 'O-3', 'O-4', 'O-5', 'O-6'],
} as const

export interface RetirementInputs {
  payGrade: string
  yearsOfService: number
  /** High-3 average MONTHLY base pay. */
  high3Monthly: number
  tspContributionPercent: number
  tspReturnPercent: number
  /** Annual withdrawal rate applied to the projected TSP balance. */
  withdrawalRatePercent: number
  /** Annual base-pay growth during the career. 0 keeps the simplified flat model. */
  payGrowthPercent: number
  vaRating: number
  vaFamilyStatus: FamilyStatus
  vaAdditionalChildren: number
  vaDependentParents: number
  stateCode: string
}

export interface SystemResult {
  /** Gross retired pay before any VA waiver. */
  grossPension: number
  /** Retired pay waived because VA compensation offsets it (ratings under 50%). */
  vaWaiver: number
  /** Retired pay still paid and still state-taxable. */
  taxablePension: number
  tspBalance: number
  tspMonthlyDraw: number
  /** Government share of TSP contributions, as a percent of base pay. */
  govContributionPercent: number
  totalTspPercent: number
  vaMonthly: number
  stateTaxMonthly: number
  netMonthly: number
}

export interface RetirementResult {
  isVested: boolean
  vaMonthly: number
  /** True when CRDP applies: 20+ years and a rating of 50% or higher. */
  crdpApplies: boolean
  /** True when the VA waiver reduces retired pay: 20+ years and a rating of 10–40%. */
  waiverApplies: boolean
  legacy: SystemResult
  brs: SystemResult
}

export function currency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function currencyCents(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Government TSP contribution under BRS, as a percent of base pay:
 * 1% automatic, plus dollar-for-dollar on the first 3% and 50% on the next 2%.
 * Caps at 5%.
 */
export function brsGovernmentContribution(userContributionPercent: number): number {
  const c = Math.max(0, userContributionPercent)
  let gov = 1
  if (c <= 3) {
    gov += c
  } else {
    gov += 3
    gov += Math.min(c - 3, 2) * 0.5
  }
  return gov
}

/**
 * Future value of annual contributions.
 *
 * With `payGrowth` of 0 this is a plain ordinary annuity — each year contributes
 * the same amount, based on High-3 pay. That is the simplified model the MVP
 * used, and it overstates early-career contributions.
 *
 * With a positive `payGrowth`, pay is walked backwards from High-3 so that the
 * final year equals High-3 and earlier years are correspondingly smaller, which
 * is much closer to a real career.
 */
export function projectTsp(
  finalAnnualPay: number,
  contributionPercent: number,
  years: number,
  returnPercent: number,
  payGrowthPercent: number,
): number {
  const r = returnPercent / 100
  const g = payGrowthPercent / 100
  const pct = contributionPercent / 100
  if (years <= 0 || pct <= 0) return 0

  let balance = 0
  for (let k = 1; k <= years; k++) {
    // Pay in year k, working backwards from High-3 in the final year.
    const payThisYear = g === 0 ? finalAnnualPay : finalAnnualPay / (1 + g) ** (years - k)
    const contribution = payThisYear * pct
    // Contributions are made at year end, then compound for the remaining years.
    balance += contribution * (1 + r) ** (years - k)
  }
  return balance
}

function buildSystem(
  multiplier: number,
  inputs: RetirementInputs,
  vaMonthly: number,
  govContributionPercent: number,
): SystemResult {
  const { yearsOfService, high3Monthly, stateCode } = inputs
  const isVested = yearsOfService >= VESTING_YEARS

  const grossPension = isVested ? high3Monthly * yearsOfService * multiplier : 0

  // CRDP vs VA waiver. Only a retiree with actual retired pay can be offset.
  const crdp = isVested && inputs.vaRating >= CRDP_MIN_RATING
  const waiverApplies = isVested && inputs.vaRating > 0 && !crdp
  const vaWaiver = waiverApplies ? Math.min(vaMonthly, grossPension) : 0
  const taxablePension = grossPension - vaWaiver

  const totalTspPercent = inputs.tspContributionPercent + govContributionPercent
  const tspBalance = projectTsp(
    high3Monthly * 12,
    totalTspPercent,
    yearsOfService,
    inputs.tspReturnPercent,
    inputs.payGrowthPercent,
  )
  const tspMonthlyDraw = (tspBalance * (inputs.withdrawalRatePercent / 100)) / 12

  // Only retired pay still being received is state-taxable. VA compensation is
  // exempt from state income tax everywhere, and waived pay is replaced by it.
  const tax = stateTaxMonthly(taxablePension * 12, stateCode)

  return {
    grossPension,
    vaWaiver,
    taxablePension,
    tspBalance,
    tspMonthlyDraw,
    govContributionPercent,
    totalTspPercent,
    vaMonthly,
    stateTaxMonthly: tax,
    netMonthly: taxablePension + tspMonthlyDraw + vaMonthly - tax,
  }
}

export function calculateRetirement(inputs: RetirementInputs): RetirementResult {
  const isVested = inputs.yearsOfService >= VESTING_YEARS

  const vaMonthly = vaCompensation(
    inputs.vaRating,
    inputs.vaFamilyStatus,
    inputs.vaAdditionalChildren,
    inputs.vaDependentParents,
  )

  const crdpApplies = isVested && inputs.vaRating >= CRDP_MIN_RATING
  const waiverApplies = isVested && inputs.vaRating > 0 && inputs.vaRating < CRDP_MIN_RATING

  return {
    isVested,
    vaMonthly,
    crdpApplies,
    waiverApplies,
    // Legacy members can contribute to the TSP but get no government money.
    legacy: buildSystem(LEGACY_MULTIPLIER, inputs, vaMonthly, 0),
    brs: buildSystem(
      BRS_MULTIPLIER,
      inputs,
      vaMonthly,
      brsGovernmentContribution(inputs.tspContributionPercent),
    ),
  }
}

export interface ValidationIssue {
  field: string
  message: string
}

export function validateRetirement(inputs: RetirementInputs): ValidationIssue | null {
  if (inputs.high3Monthly <= 0) {
    return { field: 'high3Monthly', message: 'Enter your High-3 average monthly base pay.' }
  }
  if (inputs.yearsOfService < 0) {
    return { field: 'yearsOfService', message: 'Years of service cannot be negative.' }
  }
  if (inputs.tspContributionPercent < 0) {
    return { field: 'tspContributionPercent', message: 'TSP contribution cannot be negative.' }
  }
  if (inputs.withdrawalRatePercent <= 0) {
    return { field: 'withdrawalRatePercent', message: 'Withdrawal rate must be greater than 0%.' }
  }
  if (!STATE_TAX[inputs.stateCode]) {
    return { field: 'stateCode', message: 'Select a state of legal residence.' }
  }
  return null
}
