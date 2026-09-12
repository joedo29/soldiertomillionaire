import {
  CAREER_SELL_LIMIT_DAYS,
  DAYS_PER_PAY_MONTH,
  FICA_PCT,
  LEAVE_ACCRUAL_DAYS_PER_MONTH,
} from './terminalLeaveData'

/**
 * Terminal leave vs. sell-back.
 *
 * THE MODEL, AND WHY MOST CALCULATORS GET IT WRONG
 *
 * Your separation date does not move. You are on active duty, drawing basic
 * pay, BAH, BAS and TRICARE right up to that date whether you spend the last
 * stretch on terminal leave or working and selling the balance. Military pay
 * for those days is a SHARED BASELINE — identical under both options — and it
 * must not appear in the delta. Calculators that credit base pay + BAH + BAS to
 * the terminal-leave side only will recommend terminal leave every time, by
 * construction.
 *
 * Both options are compared over the SAME block of "decision days" — the days
 * you would sell under the sell option:
 *   Sell them        -> lump sum of days x (monthly basic pay / 30), and you
 *                       work those days in uniform.
 *   Take them        -> no lump sum, but the days are free, so a civilian job
 *                       can pay you for them.
 *
 *   delta = net civilian earnings on those days - net lump sum
 *
 * No job lined up: civilian earnings are zero and selling wins. A job lined
 * up: terminal leave usually wins. The tool says whichever is true.
 *
 * USE-OR-LOSE
 * Leave that can neither be sold (career cap) nor taken before separation is
 * forfeited. If the member enters how many days of leave they can actually
 * fit in before separation, each option's forfeiture is computed, and civilian
 * earnings only count for leave days actually taken.
 */

export interface TerminalLeaveInputs {
  /** Monthly basic pay from the LES. Basic pay only. */
  monthlyBasePay: number
  /** Total leave days on the books at separation. */
  leaveBalanceDays: number
  /** Days you would sell under the sell option. Clamped to what is sellable. */
  daysToSell: number
  /** Days already sold earlier in the career, against the 60-day limit. */
  daysAlreadySold: number
  /**
   * Days of leave that can actually be taken before the separation date.
   * null means "enough time for all of it".
   */
  daysAvailableForLeave: number | null

  hasCivilianJob: boolean
  civilianAnnualSalary: number

  /** Compare after tax (both sides taxed) or gross (neither side taxed). */
  taxMode: 'net' | 'gross'
  /** Federal supplemental withholding applied to the lump sum. */
  federalWithholdingPct: number
  /** Effective federal rate assumed on civilian wages. */
  civilianTaxPct: number
  /** State income tax, applied to both sides. */
  stateTaxPct: number
  /** Whether FICA is taken from the lump sum — see the flag in the data module. */
  ficaOnLumpSum: boolean

  /** Shared-baseline context only. Never enters the delta. */
  monthlyBah: number
  monthlyBas: number
}

export interface Line {
  label: string
  amount: number
  note?: string
  /** Deductions are subtracted in the running total. */
  deduction?: boolean
}

export interface OptionResult {
  key: 'sell' | 'terminal'
  label: string
  lines: Line[]
  /** What this option adds beyond the shared baseline. Always equals the lines' sum. */
  net: number
  /** Leave days taken as terminal leave under this option. */
  leaveDaysTaken: number
  /** Leave days lost under this option (use-or-lose). */
  forfeitedDays: number
}

export interface TerminalLeaveResult {
  /** 60 minus days already sold, floored at zero. */
  careerDaysRemainingBefore: number
  /** Days that may legally be sold now: min(balance, career remaining). */
  sellableDays: number
  /** Decision days: daysToSell clamped to sellableDays. */
  decisionDays: number
  /** True when the request was cut down by the career limit. */
  cappedByCareerLimit: boolean
  /** True when the career limit is fully used after this sale. */
  careerLimitReached: boolean
  careerDaysRemainingAfter: number
  /** Leave days on the books that the career cap makes unsellable. */
  unsellableDays: number

  dailyBasePay: number

  /** Pay for the decision days. Received under both options. */
  sharedBaseline: {
    days: number
    basePay: number
    bah: number
    bas: number
    total: number
  }

  sell: OptionResult
  terminal: OptionResult

  /** terminal.net - sell.net. Positive favours terminal leave. */
  delta: number
  winner: 'sell' | 'terminal' | 'tie'
  /** Civilian days that differ between the two options. */
  civilianDecisionDays: number

  /**
   * 10 U.S.C. 701(a) accrual while on terminal leave. Leave accrues under both
   * options, since both are active service — so this changes how long terminal
   * leave lasts, not the dollar comparison.
   */
  accruedDuringTerminal: number
  /** Calendar length of terminal leave once accrual on the leave itself is counted. */
  effectiveTerminalLength: number
}

const round2 = (n: number) => Math.round(n * 100) / 100
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const safe = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0)
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`

export function dailyBasePay(monthlyBasePay: number): number {
  return safe(monthlyBasePay) / DAYS_PER_PAY_MONTH
}

interface TaxPieces {
  gross: number
  fed: number
  fica: number
  state: number
  net: number
}

function taxed(gross: number, fedPct: number, ficaPct: number, statePct: number): TaxPieces {
  const fed = round2(gross * (fedPct / 100))
  const fica = round2(gross * (ficaPct / 100))
  const state = round2(gross * (statePct / 100))
  return { gross, fed, fica, state, net: round2(gross - fed - fica - state) }
}

function deductionLines(t: TaxPieces, fedLabel: string, fedNote: string | undefined): Line[] {
  const out: Line[] = []
  if (t.fed > 0) out.push({ label: fedLabel, amount: t.fed, deduction: true, note: fedNote })
  if (t.fica > 0)
    out.push({
      label: `FICA (${FICA_PCT}%)`,
      amount: t.fica,
      deduction: true,
      note: 'Social Security + Medicare',
    })
  if (t.state > 0) out.push({ label: 'State tax', amount: t.state, deduction: true })
  return out
}

export function calculateTerminalLeave(inputs: TerminalLeaveInputs): TerminalLeaveResult {
  const balance = Math.floor(safe(inputs.leaveBalanceDays))
  const alreadySold = clamp(Math.floor(safe(inputs.daysAlreadySold)), 0, CAREER_SELL_LIMIT_DAYS)

  // ── Career cap: 37 U.S.C. 501(f).
  const careerRemainingBefore = CAREER_SELL_LIMIT_DAYS - alreadySold
  const sellableDays = Math.min(balance, careerRemainingBefore)
  const requested = clamp(Math.floor(safe(inputs.daysToSell)), 0, balance)
  const decisionDays = Math.min(requested, sellableDays)
  const cappedByCareerLimit = requested > sellableDays
  const careerRemainingAfter = careerRemainingBefore - decisionDays
  const unsellableDays = balance - sellableDays

  const daily = dailyBasePay(inputs.monthlyBasePay)

  // ── Use-or-lose.
  const available =
    inputs.daysAvailableForLeave === null ? Infinity : Math.floor(safe(inputs.daysAvailableForLeave))
  // Sell option: sell the decision days, take the remainder as leave.
  const sellLeaveWanted = balance - decisionDays
  const sellLeaveTaken = Math.min(sellLeaveWanted, available)
  const sellForfeited = sellLeaveWanted - sellLeaveTaken
  // Terminal option: take the whole balance as leave.
  const termLeaveTaken = Math.min(balance, available)
  const termForfeited = balance - termLeaveTaken
  // The only civilian days that differ between the options.
  const civilianDecisionDays = termLeaveTaken - sellLeaveTaken

  // ── Shared baseline for the decision days.
  const baselineBase = round2(daily * decisionDays)
  const baselineBah = round2((safe(inputs.monthlyBah) / DAYS_PER_PAY_MONTH) * decisionDays)
  const baselineBas = round2((safe(inputs.monthlyBas) / DAYS_PER_PAY_MONTH) * decisionDays)

  const net = inputs.taxMode === 'net'
  const statePct = net ? safe(inputs.stateTaxPct) : 0

  // ── Sell option: lump sum on basic pay only.
  const fedPct = net ? safe(inputs.federalWithholdingPct) : 0
  const lump = taxed(
    round2(daily * decisionDays),
    fedPct,
    net && inputs.ficaOnLumpSum ? FICA_PCT : 0,
    statePct,
  )
  const sellLines: Line[] = [
    {
      label: `Lump sum — ${plural(decisionDays, 'day')} x $${daily.toFixed(2)}/day`,
      amount: lump.gross,
      note: 'basic pay only',
    },
    ...deductionLines(lump, `Federal withholding (${fedPct}%)`, 'withholding, not final tax'),
  ]

  // ── Terminal option: civilian earnings on the extra leave days.
  //    Salaried pay accrues on calendar days, so annual / 365 x days.
  const civPct = net ? safe(inputs.civilianTaxPct) : 0
  const civ = taxed(
    inputs.hasCivilianJob
      ? round2((safe(inputs.civilianAnnualSalary) / 365) * civilianDecisionDays)
      : 0,
    civPct,
    net ? FICA_PCT : 0, // civilian W-2 wages are unambiguously FICA-taxable
    statePct,
  )
  const terminalLines: Line[] = inputs.hasCivilianJob
    ? [
        {
          label: `Civilian pay — ${plural(civilianDecisionDays, 'day')} on leave`,
          amount: civ.gross,
          note: 'salary over calendar days',
        },
        ...deductionLines(civ, `Federal tax (${civPct}%)`, undefined),
      ]
    : [
        {
          label: 'No civilian job lined up',
          amount: 0,
          note: 'terminal leave buys time, not money',
        },
      ]

  const delta = round2(civ.net - lump.net)

  // ── Accrual during terminal leave: 10 U.S.C. 701(a).
  const rate = LEAVE_ACCRUAL_DAYS_PER_MONTH / DAYS_PER_PAY_MONTH
  const accruedDuringTerminal = Math.round(termLeaveTaken * rate * 10) / 10
  // Accrual on the accrual converges: L / (1 - rate).
  const effectiveTerminalLength = Math.round((termLeaveTaken / (1 - rate)) * 10) / 10

  return {
    careerDaysRemainingBefore: careerRemainingBefore,
    sellableDays,
    decisionDays,
    cappedByCareerLimit,
    careerLimitReached: careerRemainingAfter === 0,
    careerDaysRemainingAfter: careerRemainingAfter,
    unsellableDays,
    dailyBasePay: round2(daily),
    sharedBaseline: {
      days: decisionDays,
      basePay: baselineBase,
      bah: baselineBah,
      bas: baselineBas,
      total: round2(baselineBase + baselineBah + baselineBas),
    },
    sell: {
      key: 'sell',
      label: 'Sell the leave',
      lines: sellLines,
      net: lump.net,
      leaveDaysTaken: sellLeaveTaken,
      forfeitedDays: sellForfeited,
    },
    terminal: {
      key: 'terminal',
      label: 'Take terminal leave',
      lines: terminalLines,
      net: civ.net,
      leaveDaysTaken: termLeaveTaken,
      forfeitedDays: termForfeited,
    },
    delta,
    winner: Math.abs(delta) < 0.005 ? 'tie' : delta > 0 ? 'terminal' : 'sell',
    civilianDecisionDays,
    accruedDuringTerminal,
    effectiveTerminalLength,
  }
}

export function emptyTerminalLeaveInputs(): TerminalLeaveInputs {
  return {
    monthlyBasePay: 0,
    leaveBalanceDays: 60,
    daysToSell: 60,
    daysAlreadySold: 0,
    daysAvailableForLeave: null,
    hasCivilianJob: false,
    civilianAnnualSalary: 0,
    taxMode: 'net',
    federalWithholdingPct: 22,
    civilianTaxPct: 22,
    stateTaxPct: 0,
    ficaOnLumpSum: true,
    monthlyBah: 0,
    monthlyBas: 0,
  }
}
