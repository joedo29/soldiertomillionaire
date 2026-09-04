/**
 * ============================================================================
 * VA COMBINED DISABILITY RATING ENGINE — 38 CFR §§ 4.25 and 4.26
 * ============================================================================
 *
 * The VA does NOT combine ratings as continuous decimals. Per § 4.25, each
 * pairwise combination is read off the Combined Ratings Table (Table I), which
 * contains whole numbers, and "the combined value, exactly as found in table I,
 * will be combined with the degree of the third disability." Conversion to the
 * nearest degree divisible by 10 happens exactly once, at the very end.
 *
 * Carrying decimals through every step and rounding only at the end usually
 * lands on the same answer, but not always — near a boundary the two methods
 * can differ by a full 10-point step, which is hundreds of dollars a month.
 * `decimalOnly*` fields below exist purely so the UI can show when that happens.
 *
 * Verified against the § 4.26 worked example:
 *   60, 20, 10, 10 (the two 10s bilateral)
 *   -> the two 10s combine to 19; +10% = 20.9 -> 21
 *   -> order of severity 60, 21, 20
 *   -> 60 and 21 combine to 68; 68 and 20 combine to 74
 *   -> converted to 70 percent as the final degree of disability
 *
 * Table I rounds HALF UP. Confirmed against published table cells:
 *   45 + 10 -> 50.5 -> 51,  55 + 10 -> 59.5 -> 60,  65 + 10 -> 68.5 -> 69.
 * ============================================================================
 */

export type BodyLocation = 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg' | 'other'

export interface Condition {
  id: string
  name: string
  /** Schedular evaluation: 0, 10, 20 ... 100. */
  rating: number
  location: BodyLocation
}

export const LOCATION_LABELS: Record<BodyLocation, string> = {
  left_arm: 'Left arm',
  right_arm: 'Right arm',
  left_leg: 'Left leg',
  right_leg: 'Right leg',
  other: 'Other / not paired',
}

export const RATING_CHOICES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as const

export type StepKind = 'bilateral' | 'bilateral-factor' | 'normal'

export interface Step {
  kind: StepKind
  label: string
  /** Rating being combined in at this step (null for the factor row). */
  rating: number | null
  /** Efficiency remaining before this step, as a whole number. */
  remainingEfficiency: number
  /** Efficiency lost at this step, exact arithmetic before rounding. */
  loss: number
  /** Arithmetic result before rounding to the table value. */
  exactValue: number
  /** The whole-number value carried forward — what Table I actually contains. */
  combined: number
}

export interface CombinedRatingResult {
  /** Conditions that qualified for the bilateral factor. */
  bilateralGroup: Condition[]
  bilateralApplies: boolean
  /** Combined value of the bilateral group before the 10% factor. */
  bilateralCombined: number
  /** The 10% added (not combined) — exact, before rounding. */
  bilateralFactorAmount: number
  /** Bilateral group value after the factor, rounded to a whole number. */
  bilateralWithFactor: number
  /** Final combined value per Table I, before conversion to a degree of 10. */
  combinedValue: number
  /** Official rating: combined value converted to the nearest degree of 10. */
  officialRating: number
  /** What a naive all-decimals method would produce, for comparison only. */
  decimalOnlyValue: number
  decimalOnlyRating: number
  /** True when the naive decimal method reaches a different official rating. */
  methodsDisagree: boolean
  steps: Step[]
  /** Locations that formed a valid pair. */
  pairedSets: ('arms' | 'legs')[]
}

/**
 * One cell of the Combined Ratings Table.
 *
 * value = a + b x (100 - a) / 100, rounded half up.
 *
 * Computed in integer space (scaled by 100) so floating-point error can never
 * push an exact .5 to the wrong side.
 */
export function combineTable(a: number, b: number): number {
  const scaled = 100 * a + b * (100 - a) // exactly value x 100
  return Math.floor((scaled + 50) / 100)
}

/** § 4.26: add 10% of the combined bilateral value, then round to a whole number. */
export function applyBilateralFactor(combined: number): number {
  // combined x 1.1, rounded half up, in integer space.
  return Math.floor((combined * 11 + 5) / 10)
}

/** § 4.25: convert to the nearest degree divisible by 10; values ending in 5 go up. */
export function toOfficialRating(combinedValue: number): number {
  if (combinedValue <= 0) return 0
  return Math.min(100, Math.floor((combinedValue + 5) / 10) * 10)
}

const ARM_LOCATIONS: BodyLocation[] = ['left_arm', 'right_arm']
const LEG_LOCATIONS: BodyLocation[] = ['left_leg', 'right_leg']

/**
 * § 4.26 applies to disabilities of both arms, both legs, or paired skeletal
 * muscles. A pair requires a compensable condition on EACH side of the same
 * limb set — two right-knee conditions do not qualify.
 */
export function findBilateralGroup(conditions: Condition[]): {
  group: Condition[]
  pairedSets: ('arms' | 'legs')[]
} {
  const active = conditions.filter((c) => c.rating > 0)
  const pairedSets: ('arms' | 'legs')[] = []

  const hasLeftArm = active.some((c) => c.location === 'left_arm')
  const hasRightArm = active.some((c) => c.location === 'right_arm')
  const hasLeftLeg = active.some((c) => c.location === 'left_leg')
  const hasRightLeg = active.some((c) => c.location === 'right_leg')

  const armsQualify = hasLeftArm && hasRightArm
  const legsQualify = hasLeftLeg && hasRightLeg
  if (armsQualify) pairedSets.push('arms')
  if (legsQualify) pairedSets.push('legs')

  const group = active.filter(
    (c) =>
      (armsQualify && ARM_LOCATIONS.includes(c.location)) ||
      (legsQualify && LEG_LOCATIONS.includes(c.location)),
  )

  return { group, pairedSets }
}

const byRatingDesc = (a: Condition, b: Condition) => b.rating - a.rating

export function calculateCombinedRating(conditions: Condition[]): CombinedRatingResult {
  const active = conditions.filter((c) => c.rating > 0)

  const empty: CombinedRatingResult = {
    bilateralGroup: [],
    bilateralApplies: false,
    bilateralCombined: 0,
    bilateralFactorAmount: 0,
    bilateralWithFactor: 0,
    combinedValue: 0,
    officialRating: 0,
    decimalOnlyValue: 0,
    decimalOnlyRating: 0,
    methodsDisagree: false,
    steps: [],
    pairedSets: [],
  }
  if (active.length === 0) return empty

  const { group, pairedSets } = findBilateralGroup(active)
  const bilateralApplies = group.length >= 2

  const steps: Step[] = []

  // ── Bilateral group first (§ 4.26: "before other combinations are carried out")
  let bilateralCombined = 0
  let bilateralFactorAmount = 0
  let bilateralWithFactor = 0
  let bilateralDecimal = 0

  if (bilateralApplies) {
    const ordered = [...group].sort(byRatingDesc)
    for (const cond of ordered) {
      const before = bilateralCombined
      const remaining = 100 - before
      const loss = (remaining * cond.rating) / 100
      const exact = before + loss
      bilateralCombined = combineTable(before, cond.rating)
      steps.push({
        kind: 'bilateral',
        label: cond.name || 'Bilateral condition',
        rating: cond.rating,
        remainingEfficiency: remaining,
        loss,
        exactValue: exact,
        combined: bilateralCombined,
      })
      bilateralDecimal = bilateralDecimal + ((100 - bilateralDecimal) * cond.rating) / 100
    }

    bilateralFactorAmount = bilateralCombined * 0.1
    bilateralWithFactor = applyBilateralFactor(bilateralCombined)
    steps.push({
      kind: 'bilateral-factor',
      label: 'Bilateral factor — add 10% (§ 4.26)',
      rating: null,
      remainingEfficiency: 100 - bilateralCombined,
      loss: bilateralFactorAmount,
      exactValue: bilateralCombined + bilateralFactorAmount,
      combined: bilateralWithFactor,
    })
    bilateralDecimal = bilateralDecimal * 1.1
  }

  // ── Build the units to combine: the bilateral group counts as one disability.
  interface Unit {
    label: string
    value: number
    decimalValue: number
    isBilateralGroup: boolean
  }
  const units: Unit[] = []
  if (bilateralApplies) {
    units.push({
      label: `Bilateral group (${group.length} conditions, factor applied)`,
      value: bilateralWithFactor,
      decimalValue: bilateralDecimal,
      isBilateralGroup: true,
    })
  }
  const groupIds = new Set(group.map((c) => c.id))
  for (const cond of active) {
    if (bilateralApplies && groupIds.has(cond.id)) continue
    units.push({
      label: cond.name || 'Condition',
      value: cond.rating,
      decimalValue: cond.rating,
      isBilateralGroup: false,
    })
  }

  // § 4.25: arrange in the exact order of severity, greatest first.
  units.sort((a, b) => b.value - a.value)

  // ── Fold with true table semantics (whole number carried at every step).
  let combinedValue = 0
  for (const unit of units) {
    const before = combinedValue
    const remaining = 100 - before
    const loss = (remaining * unit.value) / 100
    const exact = before + loss
    combinedValue = combineTable(before, unit.value)
    steps.push({
      kind: 'normal',
      label: unit.label,
      rating: unit.value,
      remainingEfficiency: remaining,
      loss,
      exactValue: exact,
      combined: combinedValue,
    })
  }

  // ── Naive all-decimal method, for comparison only.
  const decimalUnits = [...units].sort((a, b) => b.decimalValue - a.decimalValue)
  let decimalOnlyValue = 0
  for (const unit of decimalUnits) {
    decimalOnlyValue += ((100 - decimalOnlyValue) * unit.decimalValue) / 100
  }
  const decimalOnlyRating = Math.min(100, Math.round(decimalOnlyValue / 10) * 10)

  const officialRating = toOfficialRating(combinedValue)

  return {
    bilateralGroup: group,
    bilateralApplies,
    bilateralCombined,
    bilateralFactorAmount,
    bilateralWithFactor,
    combinedValue,
    officialRating,
    decimalOnlyValue,
    decimalOnlyRating,
    methodsDisagree: decimalOnlyRating !== officialRating,
    steps,
    pairedSets,
  }
}
