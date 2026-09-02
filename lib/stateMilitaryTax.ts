/**
 * ============================================================================
 * STATE TAX TREATMENT OF MILITARY RETIRED PAY — DATA MODULE
 * ============================================================================
 * Last verified: 2026-09-02
 *
 * Sources:
 *   https://www.military.com/money/personal-finance/state-tax-information.html
 *   https://www.moaa.org/  (state tax update coverage)
 *   Individual state departments of revenue
 *
 * IMPORTANT MODELLING CAVEATS — surfaced in the UI, not hidden here:
 *   • `rate` is an APPROXIMATE EFFECTIVE rate, not a marginal bracket. Real
 *     state tax depends on total household income, filing status, deductions
 *     and credits. Treat the output as a ballpark, never as a tax return.
 *   • Many partial-exclusion states gate the exclusion on AGE or INCOME.
 *     Where a 20-year retiree (typically retiring in their late 30s to 40s)
 *     would NOT yet qualify, the conservative value is used and `note`
 *     explains the condition. That is deliberate: it is better to overstate
 *     tax than to have someone plan around an exclusion they cannot claim.
 *   • VA disability compensation is exempt from state income tax in all 50
 *     states and DC, so it never enters the taxable base.
 *
 * HOW TO UPDATE
 *   Change `cap`, `rate`, `status` and `note` for the affected state, then
 *   move LAST_VERIFIED forward.
 * ============================================================================
 */

export const LAST_VERIFIED = '2026-09-02'

export type TaxStatus = 'exempt' | 'partial' | 'taxable'

export interface StateTaxInfo {
  name: string
  status: TaxStatus
  /** Approximate effective state income tax rate applied to the taxable portion. */
  rate: number
  /** Annual dollars of military retired pay excluded before tax applies. */
  cap: number
  /** True when eligibility depends on age or income the tool does not collect. */
  conditional?: boolean
  note?: string
}

const NO_INCOME_TAX = 'No state income tax.'
const FULLY_EXEMPT = 'Military retired pay is fully exempt from state income tax.'

export const STATE_TAX: Record<string, StateTaxInfo> = {
  // ── No state income tax ──────────────────────────────────────────────────
  AK: { name: 'Alaska', status: 'exempt', rate: 0, cap: 0, note: NO_INCOME_TAX },
  FL: { name: 'Florida', status: 'exempt', rate: 0, cap: 0, note: NO_INCOME_TAX },
  NV: { name: 'Nevada', status: 'exempt', rate: 0, cap: 0, note: NO_INCOME_TAX },
  NH: { name: 'New Hampshire', status: 'exempt', rate: 0, cap: 0, note: 'No tax on earned or retirement income.' },
  SD: { name: 'South Dakota', status: 'exempt', rate: 0, cap: 0, note: NO_INCOME_TAX },
  TN: { name: 'Tennessee', status: 'exempt', rate: 0, cap: 0, note: NO_INCOME_TAX },
  TX: { name: 'Texas', status: 'exempt', rate: 0, cap: 0, note: NO_INCOME_TAX },
  WA: { name: 'Washington', status: 'exempt', rate: 0, cap: 0, note: NO_INCOME_TAX },
  WY: { name: 'Wyoming', status: 'exempt', rate: 0, cap: 0, note: NO_INCOME_TAX },

  // ── Has income tax, exempts military retired pay in full ─────────────────
  AL: { name: 'Alabama', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  AZ: { name: 'Arizona', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  AR: { name: 'Arkansas', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  CT: { name: 'Connecticut', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  HI: { name: 'Hawaii', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  IL: { name: 'Illinois', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  IN: { name: 'Indiana', status: 'exempt', rate: 0, cap: 0, note: 'Fully exempt. Coverage extended to Space Force, USPHS and NOAA officers (2025).' },
  IA: { name: 'Iowa', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  KS: { name: 'Kansas', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  LA: { name: 'Louisiana', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  ME: { name: 'Maine', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  MA: { name: 'Massachusetts', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  MI: { name: 'Michigan', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  MN: { name: 'Minnesota', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  MS: { name: 'Mississippi', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  MO: { name: 'Missouri', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  NE: { name: 'Nebraska', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  NJ: { name: 'New Jersey', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  NY: { name: 'New York', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  NC: { name: 'North Carolina', status: 'exempt', rate: 0, cap: 0, note: 'Exempt for 20+ year retirees and medical retirees (Bailey settlement rules).' },
  ND: { name: 'North Dakota', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  OH: { name: 'Ohio', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  OK: { name: 'Oklahoma', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  PA: { name: 'Pennsylvania', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  RI: { name: 'Rhode Island', status: 'exempt', rate: 0, cap: 0, note: 'Military service pensions fully exempt.' },
  SC: { name: 'South Carolina', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  UT: { name: 'Utah', status: 'exempt', rate: 0, cap: 0, note: 'A non-refundable credit offsets Utah tax on military retired pay, so the effective tax is zero.' },
  WV: { name: 'West Virginia', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  WI: { name: 'Wisconsin', status: 'exempt', rate: 0, cap: 0, note: FULLY_EXEMPT },
  VT: {
    name: 'Vermont',
    status: 'exempt',
    rate: 0,
    cap: 0,
    conditional: true,
    note: 'Exempt when AGI is $125,000 or less (2025+). Phases out between $125,000 and $175,000; modelled here as exempt.',
  },

  // ── Partial exclusions ───────────────────────────────────────────────────
  CA: {
    name: 'California',
    status: 'partial',
    rate: 0.06,
    cap: 20000,
    conditional: true,
    note: 'Excludes up to $20,000 for tax years 2025–2029. Requires AGI under $125,000 (single) or $250,000 (joint). Scheduled to sunset after 2029.',
  },
  CO: {
    name: 'Colorado',
    status: 'partial',
    rate: 0.044,
    cap: 15000,
    conditional: true,
    note: 'Exclusion is age-tiered: $15,000 under 55, $20,000 at 55–64, $24,000 at 65+. Modelled at the under-55 amount, which fits most 20-year retirees.',
  },
  DE: {
    name: 'Delaware',
    status: 'partial',
    rate: 0.055,
    cap: 12500,
    note: 'Excludes up to $12,500 of pension income.',
  },
  GA: {
    name: 'Georgia',
    status: 'partial',
    rate: 0.0519,
    cap: 65000,
    note: 'Excludes up to $65,000 at any age beginning with the 2026 tax year (HB 266). Most retirees owe no Georgia tax on retired pay.',
  },
  KY: {
    name: 'Kentucky',
    status: 'partial',
    rate: 0.04,
    cap: 31110,
    note: 'Excludes up to $31,110. Service before 1998 may be fully exempt.',
  },
  MD: {
    name: 'Maryland',
    status: 'partial',
    rate: 0.0475,
    cap: 12500,
    conditional: true,
    note: 'Excludes $12,500 under age 55 and $20,000 at 55+. Modelled at the under-55 amount.',
  },
  MT: {
    name: 'Montana',
    status: 'partial',
    rate: 0.059,
    cap: 5500,
    conditional: true,
    note: 'Narrow relief: a 65+ subtraction, or a limited deduction for recent arrivals who work in Montana. Modelled conservatively.',
  },
  NM: {
    name: 'New Mexico',
    status: 'partial',
    rate: 0.049,
    cap: 30000,
    note: 'Excludes up to $30,000 of military retired pay.',
  },
  VA: {
    name: 'Virginia',
    status: 'partial',
    rate: 0.0575,
    cap: 40000,
    note: 'Excludes up to $40,000 for tax year 2025 and later. The age restriction has been removed.',
  },

  // ── Taxable, or exclusion unlikely to apply to a 20-year retiree ─────────
  ID: {
    name: 'Idaho',
    status: 'taxable',
    rate: 0.058,
    cap: 0,
    conditional: true,
    note: 'Exempt only if you are 62+ or disabled, and capped at the year\'s maximum Social Security benefit. Modelled as taxable since most 20-year retirees are under 62.',
  },
  OR: {
    name: 'Oregon',
    status: 'taxable',
    rate: 0.0875,
    cap: 0,
    conditional: true,
    note: 'Only service performed before October 1, 1991 is deductible. Modelled as taxable for modern retirees.',
  },
  DC: {
    name: 'District of Columbia',
    status: 'taxable',
    rate: 0.085,
    cap: 0,
    note: 'Military retired pay is fully taxable.',
  },
}

export interface StateGroup {
  label: string
  codes: string[]
}

/** Grouped for the dropdown, ordered best-to-worst for a retiree. */
export const STATE_GROUPS: StateGroup[] = [
  {
    label: 'No state income tax',
    codes: ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'],
  },
  {
    label: 'Military retired pay fully exempt',
    codes: [
      'AL', 'AZ', 'AR', 'CT', 'HI', 'IL', 'IN', 'IA', 'KS', 'LA', 'ME', 'MA',
      'MI', 'MN', 'MS', 'MO', 'NE', 'NJ', 'NY', 'NC', 'ND', 'OH', 'OK', 'PA',
      'RI', 'SC', 'UT', 'VT', 'WV', 'WI',
    ],
  },
  {
    label: 'Partial exclusion',
    codes: ['CA', 'CO', 'DE', 'GA', 'KY', 'MD', 'MT', 'NM', 'VA'],
  },
  {
    label: 'Fully taxable (or exclusion unlikely to apply)',
    codes: ['DC', 'ID', 'OR'],
  },
]

/**
 * Monthly state income tax on the TAXABLE portion of retired pay.
 * `annualTaxablePay` must already have any VA waiver removed — waived retired
 * pay is replaced by tax-free VA compensation and is not state-taxable.
 */
export function stateTaxMonthly(annualTaxablePay: number, stateCode: string): number {
  const info = STATE_TAX[stateCode]
  if (!info || info.status === 'exempt' || annualTaxablePay <= 0) return 0
  const taxable = Math.max(0, annualTaxablePay - info.cap)
  return (taxable * info.rate) / 12
}
