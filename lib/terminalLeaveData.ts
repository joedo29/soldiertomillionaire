/**
 * ============================================================================
 * TERMINAL LEAVE vs. SELL-BACK — RULES DATA MODULE
 * ============================================================================
 * Every rule and rate below was read out of a primary source, not from
 * memory or from other calculators. Citations sit beside each value.
 *
 * Last verified: 2026-09-12
 *
 * PRIMARY SOURCES
 *   DoD 7000.14-R (Financial Management Regulation) Volume 7A, Chapter 35,
 *     "Separation Payments", March 2024 — accrued leave pay, 60-day career
 *     limit, leave valued on basic pay only.
 *   DoD 7000.14-R Volume 7A, Chapter 45, "Federal Insurance Contributions Act
 *     (FICA)", March 2025 — what is subject to Social Security and Medicare.
 *   37 U.S.C. § 501, "Payments for unused accrued leave".
 *   10 U.S.C. § 701, leave accrual and accumulation.
 *   5 U.S.C. § 5534a, dual employment and pay during terminal leave.
 *   IRS Publication 15 (2026), supplemental wage withholding.
 *   DoD 5500.07-R, Joint Ethics Regulation, 15 May 2024.
 *
 * CORRECTIONS TO COMMONLY REPEATED CLAIMS
 *   - The 60-day career sell limit is 37 U.S.C. § 501(f), in Title 37
 *     (Pay and Allowances), NOT 10 U.S.C. § 501.
 *   - The supplemental withholding rate is 22%. The 25% figure still quoted
 *     around the internet is the pre-2018 (pre-TCJA) rate.
 *   - DoDI 1327.06 is an Instruction titled "Military Leave, Liberty, and
 *     Administrative Absence" — not a Directive, and not the authority for
 *     working a civilian job on terminal leave. That authority, for federal
 *     civilian positions, is 5 U.S.C. § 5534a.
 * ============================================================================
 */

export const DATA_VERIFIED = '2026-09-12'

export interface Citation {
  label: string
  cite: string
  url: string
}

export const SOURCES: Record<string, Citation> = {
  fmr35: {
    label: 'Accrued leave pay and the 60-day career limit',
    cite: 'DoD FMR Volume 7A, Chapter 35 (Separation Payments), March 2024',
    url: 'https://comptroller.defense.gov/Portals/45/documents/fmr/current/07a/07a_35.pdf',
  },
  fmr45: {
    label: 'What is subject to Social Security and Medicare',
    cite: 'DoD FMR Volume 7A, Chapter 45 (FICA), March 2025',
    url: 'https://comptroller.defense.gov/Portals/45/documents/fmr/current/07a/07a_45.pdf',
  },
  usc37_501: {
    label: 'Payments for unused accrued leave',
    cite: '37 U.S.C. § 501',
    url: 'https://www.law.cornell.edu/uscode/text/37/501',
  },
  usc10_701: {
    label: 'Leave accrual and accumulation',
    cite: '10 U.S.C. § 701',
    url: 'https://www.law.cornell.edu/uscode/text/10/701',
  },
  usc5_5534a: {
    label: 'Dual employment and pay during terminal leave',
    cite: '5 U.S.C. § 5534a',
    url: 'https://www.law.cornell.edu/uscode/text/5/5534a',
  },
  irs15: {
    label: 'Supplemental wage withholding rate',
    cite: 'IRS Publication 15 (2026)',
    url: 'https://www.irs.gov/publications/p15',
  },
  jer: {
    label: 'Outside employment approval and post-government restrictions',
    cite: 'DoD 5500.07-R, Joint Ethics Regulation, 15 May 2024',
    url: 'https://dodsoco.ogc.osd.mil/Portals/102/Documents/Issuances/JER%20and%20Directives/JER%20May%2015%202024.pdf',
  },
}

/**
 * 37 U.S.C. § 501(f): "The number of days upon which payment under subsection
 * (b) or (g) is based may not exceed sixty, less the number of days for which
 * payment has been previously made under such subsections after February 9,
 * 1976."
 *
 * Restated in DoD FMR Vol 7A, Ch 35, para 2.1.1.2.1: "Generally, a Service
 * member is entitled to receive payment for no more than 60 days of accrued
 * leave during a military career."
 */
export const CAREER_SELL_LIMIT_DAYS = 60

/**
 * 10 U.S.C. § 701(a): "A member of an armed force is entitled to leave at the
 * rate of 2½ calendar days for each month of active service."
 * Leave keeps accruing while on terminal leave, because the member is still on
 * active duty until the separation date.
 */
export const LEAVE_ACCRUAL_DAYS_PER_MONTH = 2.5

/**
 * DoD FMR Vol 7A, Ch 35, para 2.2.1.1: "Leave earned is valued using only
 * basic pay." 37 U.S.C. § 501(b)(1) computes the payment on "the basis of the
 * basic pay to which the member was entitled on the date of discharge."
 *
 * The 1/30 divisor is the standard military daily-rate convention used by
 * DFAS. NOTE: I did not find that divisor stated verbatim in Chapter 35 —
 * flagged rather than presented as a quotation.
 */
export const DAYS_PER_PAY_MONTH = 30

/**
 * IRS Publication 15 (2026): "The withholding rate on supplemental wages
 * remains 22% (37% if supplemental wages paid to an employee during the
 * calendar year exceed $1 million)."
 */
export const SUPPLEMENTAL_WITHHOLDING_PCT = 22
export const SUPPLEMENTAL_WITHHOLDING_PCT_OVER_1M = 37

/** FICA component rates. Employee share. */
export const SOCIAL_SECURITY_PCT = 6.2
export const MEDICARE_PCT = 1.45
export const FICA_PCT = SOCIAL_SECURITY_PCT + MEDICARE_PCT // 7.65

/**
 * AMBIGUITY, FLAGGED RATHER THAN GUESSED.
 *
 * DoD FMR Vol 7A, Ch 45, para 2.2 lists the wages subject to FICA. The list
 * includes "Basic pay" (2.2.1) but does not name a lump-sum payment for unused
 * accrued leave anywhere in the chapter — the words "lump-sum" and "unused
 * accrued leave" do not appear in Chapter 45 at all.
 *
 * Two defensible readings:
 *   a) FICA applies. Chapter 35 says leave is "valued using only basic pay",
 *      and basic pay is FICA-taxable under Ch 45 para 2.2.1.
 *   b) FICA does not apply. The lump sum is not enumerated in Ch 45's list,
 *      and para 3.2 frames the wage base in terms of "active-duty basic pay
 *      plus inactive duty compensation".
 *
 * Several third-party calculators assert (b) confidently and cite Chapter 45
 * for it; the chapter does not actually say that. The tool exposes this as a
 * toggle, defaulting to (a), and says plainly that the LES is the only way to
 * know for certain.
 */
export const FICA_ON_LUMP_SUM_DEFAULT = true

/** Non-financial considerations. Deliberately even-handed, not steering. */
export interface Consideration {
  factor: string
  terminal: string
  sell: string
}

export const CONSIDERATIONS: Consideration[] = [
  {
    factor: 'Time',
    terminal:
      'Weeks of paid time to job hunt, house hunt, execute a move, handle medical appointments, and decompress before starting over.',
    sell: 'You work those days in uniform and get cash instead.',
  },
  {
    factor: 'Job search',
    terminal:
      'Interviews, relocation trips and start dates are far easier to schedule when you are not also reporting for duty.',
    sell: 'Job searching has to fit around a full duty day.',
  },
  {
    factor: 'Cash timing',
    terminal: 'No lump sum. Income arrives as normal pay and, if applicable, civilian pay.',
    sell: 'A single lump sum in final pay — useful for a move, a deposit, or a cash buffer.',
  },
  {
    factor: 'Career cap',
    terminal:
      'Taking leave does not consume any of your 60-day career sell limit, so it stays available for a future separation.',
    sell: 'Permanently consumes days from the 60-day career limit.',
  },
  {
    factor: 'Risk',
    terminal:
      'A civilian start date can slip. If the job falls through, you have spent the leave and have no lump sum.',
    sell: 'The cash is certain once final pay settles.',
  },
  {
    factor: 'Leave accrual',
    terminal:
      'Leave keeps accruing while you are on terminal leave, so a 60-day balance stretches to roughly 65 days — you can start leave a few days earlier.',
    sell: 'Leave also accrues while you work those days. Anything left at separation is settled in final pay if you have career days left, or lost if you do not.',
  },
]

/** Legal and policy notes shown in the UI, each tied to a verified citation. */
export interface RuleNote {
  title: string
  body: string
  source: keyof typeof SOURCES
}

export const RULE_NOTES: RuleNote[] = [
  {
    title: 'You may sell no more than 60 days in a career',
    body:
      'The limit is cumulative across your whole career, counting every prior sale since 9 February 1976 — not 60 days per separation. Days already sold at a reenlistment reduce what is left.',
    source: 'usc37_501',
  },
  {
    title: 'Sell-back is computed on basic pay only',
    body:
      'Leave is "valued using only basic pay". BAH, BAS, and special pays are not part of the lump sum. This is not a penalty for selling — you still receive your allowances normally through your separation date either way.',
    source: 'fmr35',
  },
  {
    title: 'A federal civilian job during terminal leave is expressly authorized',
    body:
      'A member on terminal leave pending honorable separation "may accept a civilian office or position in the Government of the United States ... and he is entitled to receive the pay of that office or position in addition to pay and allowances from the uniformed service for the unexpired portion of the terminal leave."',
    source: 'usc5_5534a',
  },
  {
    title: 'Private-sector work still needs approval, and ethics rules still apply',
    body:
      'You remain on active duty until your separation date. Outside employment generally requires approval through your chain of command, and conflict-of-interest and post-government employment restrictions apply — particularly if the employer is a defense contractor.',
    source: 'jer',
  },
  {
    title: 'Leave keeps accruing while you are on terminal leave',
    body:
      'You accrue 2.5 days per month of active service, and terminal leave is active service — roughly 5 extra days over a 60-day terminal leave. Plan your leave start date around it. It accrues under both options, so it changes how long terminal leave lasts rather than which option pays more.',
    source: 'usc10_701',
  },
  {
    title: 'Use it or lose it',
    body:
      'Leave you can neither sell (because of the career limit) nor take before your separation date is forfeited. If the career cap blocks a sale, the only way to get value from those days is to take them.',
    source: 'fmr35',
  },
]
