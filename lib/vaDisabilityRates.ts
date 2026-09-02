/**
 * ============================================================================
 * VA DISABILITY COMPENSATION RATE TABLE — DATA MODULE
 * ============================================================================
 * Update this file once a year when the COLA takes effect (December 1).
 *
 * Current data:  2026 rates, effective December 1, 2025 (2.8% COLA)
 * Source:        https://www.va.gov/disability/compensation-rates/veteran-rates/
 * Last verified: 2026-09-02
 *
 * HOW TO UPDATE AT THE NEXT COLA
 *   1. Open the va.gov URL above.
 *   2. Replace every number in RATES below from the "Basic monthly rates"
 *      tables (both the 30–60% and 70–100% tables).
 *   3. `parent` is not printed directly by the VA. Derive it as
 *      ("With 1 parent, no spouse or children" − "Veteran alone").
 *      Sanity check: the 2-parent row must equal alone + 2 × parent.
 *   4. `addlChild` comes from the "Each additional child under age 18" row
 *      of the added-amounts table.
 *   5. Update RATE_YEAR, RATE_EFFECTIVE_DATE, COLA_PERCENT and LAST_VERIFIED.
 * ============================================================================
 */

export const RATE_YEAR = 2026
export const RATE_EFFECTIVE_DATE = 'December 1, 2025'
export const COLA_PERCENT = 2.8
export const LAST_VERIFIED = '2026-09-02'
export const VA_RATES_SOURCE_URL =
  'https://www.va.gov/disability/compensation-rates/veteran-rates/'

export type FamilyStatus =
  | 'veteran_alone'
  | 'spouse_only'
  | 'spouse_one_child'
  | 'one_child_only'

export interface VaRateRow {
  /** Veteran alone, no dependents. */
  alone: number
  /** With spouse, no parents or children. */
  spouse: number
  /** With spouse and 1 child, no parents. */
  spouseChild: number
  /** With 1 child only, no spouse or parents. */
  childOnly: number
  /** Added amount for each additional child under 18. */
  addlChild: number
  /** Added amount per dependent parent. */
  parent: number
}

/**
 * Ratings 10% and 20% pay a flat rate with no dependent allowances —
 * the VA only pays dependent amounts at a combined rating of 30% or higher.
 */
export const FLAT_RATES: Record<number, number> = {
  10: 180.42,
  20: 356.66,
}

export const RATES: Record<number, VaRateRow> = {
  30: { alone: 552.47, spouse: 617.47, spouseChild: 666.47, childOnly: 596.47, addlChild: 32.0, parent: 52.0 },
  40: { alone: 795.84, spouse: 882.84, spouseChild: 947.84, childOnly: 853.84, addlChild: 43.0, parent: 70.0 },
  50: { alone: 1132.9, spouse: 1241.9, spouseChild: 1322.9, childOnly: 1205.9, addlChild: 54.0, parent: 88.0 },
  60: { alone: 1435.02, spouse: 1566.02, spouseChild: 1663.02, childOnly: 1523.02, addlChild: 65.0, parent: 105.0 },
  70: { alone: 1808.45, spouse: 1961.45, spouseChild: 2074.45, childOnly: 1910.45, addlChild: 76.0, parent: 123.0 },
  80: { alone: 2102.15, spouse: 2277.15, spouseChild: 2406.15, childOnly: 2219.15, addlChild: 87.0, parent: 140.0 },
  90: { alone: 2362.3, spouse: 2559.3, spouseChild: 2704.3, childOnly: 2494.3, addlChild: 98.0, parent: 158.0 },
  100: { alone: 3938.58, spouse: 4158.17, spouseChild: 4318.99, childOnly: 4085.43, addlChild: 109.11, parent: 176.24 },
}

export const RATING_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const

/** Dependent allowances only exist at 30% and above. */
export const DEPENDENTS_MIN_RATING = 30

/**
 * Monthly VA compensation for a rating and family situation.
 * Returns 0 for an unrated veteran.
 */
export function vaCompensation(
  rating: number,
  status: FamilyStatus,
  additionalChildren: number,
  dependentParents: number,
): number {
  if (rating <= 0) return 0
  if (FLAT_RATES[rating] !== undefined) return FLAT_RATES[rating]

  const row = RATES[rating]
  if (!row) return 0

  let base: number
  switch (status) {
    case 'spouse_only':
      base = row.spouse
      break
    case 'spouse_one_child':
      base = row.spouseChild
      break
    case 'one_child_only':
      base = row.childOnly
      break
    default:
      base = row.alone
  }

  return base + additionalChildren * row.addlChild + dependentParents * row.parent
}

/** Short label for the rating dropdown, showing the veteran-alone base rate. */
export function ratingLabel(rating: number): string {
  if (rating === 0) return '0% — no compensation'
  const flat = FLAT_RATES[rating]
  if (flat !== undefined) {
    return `${rating}% — $${flat.toFixed(2)}/mo (flat, no dependents)`
  }
  const row = RATES[rating]
  return row ? `${rating}% — from $${row.alone.toFixed(2)}/mo` : `${rating}%`
}
