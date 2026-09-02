import type { RetirementInputs } from './militaryRetirement'
import { vaCompensation, RATES, FLAT_RATES, RATE_YEAR, RATE_EFFECTIVE_DATE } from './vaDisabilityRates'
import { STATE_TAX, LAST_VERIFIED as STATE_VERIFIED } from './stateMilitaryTax'

/**
 * Live .xlsx mirror of the Military Retirement Planner.
 *
 * Every output is an Excel formula, so editing an input cell recalculates the
 * whole model — including the 20-year cliff, the CRDP / VA-waiver branch, the
 * BRS match, and the adjustable withdrawal rate.
 *
 * Cell addresses are derived from the ROW map below rather than hand-typed.
 * The prototype this replaces had formulas reading years-of-service from the
 * pay-grade cell, which silently produced wrong numbers; building every
 * reference from one map makes that class of bug structurally impossible.
 */

const GREEN = 'FF2D4A1E'
const GREEN_DARK = 'FF1A1F14'
const GOLD = 'FFC9A84C'
const CREAM = 'FFF9F5EE'
const INPUT_BG = 'FFFDF7E3'
const BORDER = 'FFDDD6C6'
const RED = 'FFB4462F'

const MONEY = '"$"#,##0.00'
const MONEY_0 = '"$"#,##0'
const PCT = '0.00"%"'

/** Single source of truth for the Planner sheet layout. */
const ROW = {
  title: 1,
  subtitle: 2,
  inputsHeader: 4,
  payGrade: 5,
  yos: 6,
  high3: 7,
  tspContrib: 8,
  tspReturn: 9,
  withdrawal: 10,
  payGrowth: 11,
  vaRating: 12,
  vaMonthly: 13,
  state: 14,
  stateCap: 15,
  stateRate: 16,
  derivedHeader: 18,
  vested: 19,
  govPct: 20,
  brsTspPct: 21,
  legacyTspPct: 22,
  growthFactor: 23,
  crdp: 24,
  waiver: 25,
  compareHeader: 27,
  grossPension: 28,
  vaWaiver: 29,
  taxablePension: 30,
  tspBalance: 31,
  tspDraw: 32,
  vaPay: 33,
  stateTax: 34,
  net: 35,
  notesHeader: 37,
} as const

// Absolute references into the input block.
const IN = (row: number) => `$B$${row}`
const YOS = IN(ROW.yos)
const HIGH3 = IN(ROW.high3)
const CONTRIB = IN(ROW.tspContrib)
const RETURN_ = IN(ROW.tspReturn)
const WITHDRAW = IN(ROW.withdrawal)
const GROWTH = IN(ROW.payGrowth)
const RATING = IN(ROW.vaRating)
const VA_PAY = IN(ROW.vaMonthly)
const CAP = IN(ROW.stateCap)
const RATE = IN(ROW.stateRate)
const Q = IN(ROW.growthFactor)
const WAIVER_FLAG = IN(ROW.waiver)

export async function buildRetirementWorkbook(inputs: RetirementInputs): Promise<Blob> {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Soldier to Millionaire'
  wb.created = new Date()
  wb.calcProperties.fullCalcOnLoad = true

  const ws = wb.addWorksheet('Planner', { views: [{ showGridLines: false }] })
  const vaSheet = wb.addWorksheet('VA Rate Table', { views: [{ state: 'frozen', ySplit: 2 }] })
  const stSheet = wb.addWorksheet('State Tax Table', { views: [{ state: 'frozen', ySplit: 2 }] })

  const thin = { style: 'thin' as const, color: { argb: BORDER } }
  const state = STATE_TAX[inputs.stateCode]

  ws.getColumn('A').width = 36
  ws.getColumn('B').width = 20
  ws.getColumn('C').width = 20

  function banner(row: number, text: string, span = 'C') {
    ws.mergeCells(`A${row}:${span}${row}`)
    const c = ws.getCell(`A${row}`)
    c.value = text
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
    c.alignment = { vertical: 'middle', indent: 1 }
    ws.getRow(row).height = 20
  }

  function label(row: number, text: string, bold = false) {
    const c = ws.getCell(`A${row}`)
    c.value = text
    c.font = { bold, size: 11, color: { argb: GREEN_DARK } }
    c.border = { bottom: thin }
  }

  function input(row: number, value: string | number, fmt?: string) {
    const c = ws.getCell(`B${row}`)
    c.value = value
    if (fmt) c.numFmt = fmt
    c.font = { bold: true, size: 11, color: { argb: GREEN_DARK } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: INPUT_BG } }
    c.border = { top: thin, left: thin, bottom: thin, right: thin }
    c.alignment = { horizontal: 'right' }
  }

  function formula(
    cell: string,
    f: string,
    fmt?: string,
    opts: { bold?: boolean; color?: string } = {},
  ) {
    const c = ws.getCell(cell)
    c.value = { formula: f, date1904: false }
    if (fmt) c.numFmt = fmt
    c.font = { bold: opts.bold ?? false, size: 11, color: { argb: opts.color ?? GREEN_DARK } }
    c.border = { bottom: thin }
    c.alignment = { horizontal: 'right' }
  }

  // ── Title ────────────────────────────────────────────────────────────────
  ws.mergeCells(`A${ROW.title}:C${ROW.title}`)
  const title = ws.getCell(`A${ROW.title}`)
  title.value = 'Military Retirement Planner'
  title.font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' } }
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
  title.alignment = { vertical: 'middle', indent: 1 }
  ws.getRow(ROW.title).height = 34

  ws.mergeCells(`A${ROW.subtitle}:C${ROW.subtitle}`)
  const sub = ws.getCell(`A${ROW.subtitle}`)
  sub.value = `Edit the shaded cells — everything recalculates. VA rates: ${RATE_YEAR} (effective ${RATE_EFFECTIVE_DATE}).`
  sub.font = { italic: true, size: 10, color: { argb: GREEN_DARK } }
  sub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } }
  sub.alignment = { vertical: 'middle', indent: 1 }
  ws.getRow(ROW.subtitle).height = 20

  // ── Inputs ───────────────────────────────────────────────────────────────
  banner(ROW.inputsHeader, 'YOUR INPUTS')
  label(ROW.payGrade, 'Projected Pay Grade')
  input(ROW.payGrade, inputs.payGrade)
  label(ROW.yos, 'Years of Service')
  input(ROW.yos, inputs.yearsOfService, '0')
  label(ROW.high3, 'High-3 Avg Monthly Base Pay')
  input(ROW.high3, inputs.high3Monthly, MONEY_0)
  label(ROW.tspContrib, 'Personal TSP Contribution (%)')
  input(ROW.tspContrib, inputs.tspContributionPercent, '0.0')
  label(ROW.tspReturn, 'Annual TSP Return (%)')
  input(ROW.tspReturn, inputs.tspReturnPercent, '0.0')
  label(ROW.withdrawal, 'TSP Withdrawal Rate (%)')
  input(ROW.withdrawal, inputs.withdrawalRatePercent, '0.0')
  label(ROW.payGrowth, 'Annual Base Pay Growth (%)')
  input(ROW.payGrowth, inputs.payGrowthPercent, '0.0')
  ws.getCell(`C${ROW.payGrowth}`).value = '0 = flat High-3 across all years'
  ws.getCell(`C${ROW.payGrowth}`).font = { italic: true, size: 9, color: { argb: GOLD } }

  label(ROW.vaRating, 'VA Disability Rating (%)')
  input(ROW.vaRating, inputs.vaRating, '0')
  label(ROW.vaMonthly, 'VA Monthly Compensation')
  input(
    ROW.vaMonthly,
    vaCompensation(
      inputs.vaRating,
      inputs.vaFamilyStatus,
      inputs.vaAdditionalChildren,
      inputs.vaDependentParents,
    ),
    MONEY,
  )
  ws.getCell(`C${ROW.vaMonthly}`).value = 'From the VA Rate Table sheet'
  ws.getCell(`C${ROW.vaMonthly}`).font = { italic: true, size: 9, color: { argb: GOLD } }

  label(ROW.state, 'State of Legal Residence')
  input(ROW.state, `${inputs.stateCode} — ${state?.name ?? ''}`)
  label(ROW.stateCap, 'State Exclusion Cap ($/yr)')
  input(ROW.stateCap, state?.cap ?? 0, MONEY_0)
  label(ROW.stateRate, 'State Effective Tax Rate')
  input(ROW.stateRate, state?.rate ?? 0, '0.00%')

  // ── Derived ──────────────────────────────────────────────────────────────
  banner(ROW.derivedHeader, 'DERIVED VALUES')

  label(ROW.vested, 'Vested? (20+ years of service)')
  formula(`B${ROW.vested}`, `IF(${YOS}>=20,"YES","NO")`, undefined, { bold: true })

  label(ROW.govPct, 'BRS Government Contribution (%)')
  // 1% automatic + dollar-for-dollar on first 3% + 50 cents on next 2%, max 5%.
  formula(
    `B${ROW.govPct}`,
    `IF(${CONTRIB}<=3,1+${CONTRIB},1+3+MIN(${CONTRIB}-3,2)*0.5)`,
    '0.00',
  )

  label(ROW.brsTspPct, 'BRS Total TSP Contribution (%)')
  formula(`B${ROW.brsTspPct}`, `${CONTRIB}+B${ROW.govPct}`, '0.00')

  label(ROW.legacyTspPct, 'Legacy Total TSP Contribution (%)')
  formula(`B${ROW.legacyTspPct}`, `${CONTRIB}`, '0.00')
  ws.getCell(`C${ROW.legacyTspPct}`).value = 'Legacy gets no government match'
  ws.getCell(`C${ROW.legacyTspPct}`).font = { italic: true, size: 9, color: { argb: GOLD } }

  label(ROW.growthFactor, 'TSP Growth Factor  q = (1+r)/(1+g)')
  formula(`B${ROW.growthFactor}`, `(1+${RETURN_}/100)/(1+${GROWTH}/100)`, '0.000000')

  label(ROW.crdp, 'CRDP applies? (20+ YOS and 50%+)')
  formula(`B${ROW.crdp}`, `IF(AND(${YOS}>=20,${RATING}>=50),"YES","NO")`, undefined, { bold: true })

  label(ROW.waiver, 'VA waiver applies? (20+ YOS, 10-40%)')
  formula(
    `B${ROW.waiver}`,
    `IF(AND(${YOS}>=20,${RATING}>0,${RATING}<50),"YES","NO")`,
    undefined,
    { bold: true, color: RED },
  )

  // ── Comparison ───────────────────────────────────────────────────────────
  const head = ['BENEFIT COMPONENT', 'LEGACY HIGH-3', 'BRS']
  head.forEach((h, i) => {
    const c = ws.getCell(ROW.compareHeader, i + 1)
    c.value = h
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
    c.alignment = { horizontal: i === 0 ? 'left' : 'right', indent: i === 0 ? 1 : 0 }
  })
  ws.getRow(ROW.compareHeader).height = 20

  // Gross pension — the 20-year cliff lives here.
  label(ROW.grossPension, 'Gross Monthly Pension')
  formula(`B${ROW.grossPension}`, `IF(${YOS}>=20,${HIGH3}*${YOS}*0.025,0)`, MONEY)
  formula(`C${ROW.grossPension}`, `IF(${YOS}>=20,${HIGH3}*${YOS}*0.02,0)`, MONEY)

  // VA waiver — only below 50%, and never more than the pension itself.
  label(ROW.vaWaiver, 'Less: VA Waiver (offset)')
  formula(
    `B${ROW.vaWaiver}`,
    `IF(${WAIVER_FLAG}="YES",MIN(${VA_PAY},B${ROW.grossPension}),0)`,
    MONEY,
    { color: RED },
  )
  formula(
    `C${ROW.vaWaiver}`,
    `IF(${WAIVER_FLAG}="YES",MIN(${VA_PAY},C${ROW.grossPension}),0)`,
    MONEY,
    { color: RED },
  )

  label(ROW.taxablePension, 'Taxable Retired Pay')
  formula(`B${ROW.taxablePension}`, `B${ROW.grossPension}-B${ROW.vaWaiver}`, MONEY)
  formula(`C${ROW.taxablePension}`, `C${ROW.grossPension}-C${ROW.vaWaiver}`, MONEY)

  // TSP balance: sum of a growing contribution stream, closed form.
  // FV = annualPay x pct x  ( (q^N - 1)/(q - 1) ), q = (1+r)/(1+g); N when q = 1.
  const fv = (pctCell: string) =>
    `${HIGH3}*12*(${pctCell}/100)*IF(${Q}=1,${YOS},(${Q}^${YOS}-1)/(${Q}-1))`
  label(ROW.tspBalance, 'Projected TSP Balance')
  formula(`B${ROW.tspBalance}`, fv(`B${ROW.legacyTspPct}`), MONEY_0)
  formula(`C${ROW.tspBalance}`, fv(`B${ROW.brsTspPct}`), MONEY_0)

  label(ROW.tspDraw, 'TSP Monthly Draw')
  formula(`B${ROW.tspDraw}`, `B${ROW.tspBalance}*${WITHDRAW}/100/12`, MONEY)
  formula(`C${ROW.tspDraw}`, `C${ROW.tspBalance}*${WITHDRAW}/100/12`, MONEY)

  label(ROW.vaPay, 'VA Disability (tax-free)')
  formula(`B${ROW.vaPay}`, `${VA_PAY}`, MONEY, { color: GREEN })
  formula(`C${ROW.vaPay}`, `${VA_PAY}`, MONEY, { color: GREEN })

  // State tax applies only to retired pay still being received.
  const tax = (col: string) =>
    `-MAX(0,${col}${ROW.taxablePension}*12-${CAP})*${RATE}/12`
  label(ROW.stateTax, 'State Tax on Retired Pay')
  formula(`B${ROW.stateTax}`, tax('B'), MONEY, { color: RED })
  formula(`C${ROW.stateTax}`, tax('C'), MONEY, { color: RED })

  label(ROW.net, 'NET ESTIMATED MONTHLY INCOME', true)
  const net = (col: string) =>
    `${col}${ROW.taxablePension}+${col}${ROW.tspDraw}+${col}${ROW.vaPay}+${col}${ROW.stateTax}`
  formula(`B${ROW.net}`, net('B'), MONEY, { bold: true, color: GREEN })
  formula(`C${ROW.net}`, net('C'), MONEY, { bold: true, color: GREEN })
  ;['B', 'C'].forEach((col) => {
    ws.getCell(`${col}${ROW.net}`).border = {
      top: { style: 'medium', color: { argb: GREEN } },
      bottom: { style: 'medium', color: { argb: GREEN } },
    }
  })

  // ── Notes ────────────────────────────────────────────────────────────────
  banner(ROW.notesHeader, 'HOW THIS MODEL WORKS')
  const notes = [
    'Pension requires 20 years of service (10 U.S.C. 1409). Below 20 years both systems pay $0 pension; the TSP balance is still yours.',
    'Legacy multiplier is 2.5% per year; BRS is 2.0% per year, applied to High-3 average monthly base pay.',
    'BRS adds a 1% automatic government contribution plus matching on the first 5% you contribute (max 5% government).',
    'Legacy members may contribute to the TSP but receive no government contribution or match.',
    'CRDP (10 U.S.C. 1414): at a 50%+ rating a 20-year retiree receives retired pay AND VA compensation in full.',
    'VA waiver: at 10-40% retired pay is reduced dollar-for-dollar by VA compensation. Gross income is unchanged; the benefit is that the waived portion becomes tax-free.',
    'Under 20 years of service there is no retired pay to offset, so VA compensation is paid in full.',
    'VA compensation is exempt from state income tax in every state, so only retired pay is taxed here.',
    'The TSP projection applies your High-3 pay to every contribution year when growth is 0%, which overstates early-career contributions. Set a growth rate to model a rising career.',
    'State tax uses a single approximate effective rate, not real brackets. Partial-exclusion states may add age or income conditions.',
    'Excludes federal income tax, Survivor Benefit Plan premiums, CRSC, disability retirement, and Reserve/Guard point-based retirement.',
    `VA rates: ${RATE_YEAR}, effective ${RATE_EFFECTIVE_DATE}. State data verified ${STATE_VERIFIED}.`,
    'Educational estimate only. Verify against DFAS and VA before making decisions.',
  ]
  notes.forEach((n, i) => {
    const row = ROW.notesHeader + 1 + i
    ws.mergeCells(`A${row}:C${row}`)
    const c = ws.getCell(`A${row}`)
    c.value = `•  ${n}`
    c.font = { size: 9.5, color: { argb: GREEN_DARK } }
    c.alignment = { wrapText: true, vertical: 'top' }
    ws.getRow(row).height = 26
  })

  // ── VA reference sheet ───────────────────────────────────────────────────
  vaSheet.getCell('A1').value = `VA Disability Compensation — ${RATE_YEAR} rates, effective ${RATE_EFFECTIVE_DATE}`
  vaSheet.getCell('A1').font = { bold: true, size: 12, color: { argb: GREEN } }
  const vaHead = [
    'Rating',
    'Veteran alone',
    'With spouse',
    'Spouse + 1 child',
    '1 child only',
    'Each addl child',
    'Each parent',
  ]
  vaHead.forEach((h, i) => {
    const c = vaSheet.getCell(2, i + 1)
    c.value = h
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
    c.alignment = { horizontal: 'center', wrapText: true }
    vaSheet.getColumn(i + 1).width = i === 0 ? 10 : 17
  })
  let vr = 3
  for (const [rating, amount] of Object.entries(FLAT_RATES)) {
    vaSheet.getCell(vr, 1).value = `${rating}%`
    vaSheet.getCell(vr, 2).value = amount
    vaSheet.getCell(vr, 2).numFmt = MONEY
    vaSheet.getCell(vr, 3).value = 'flat rate — no dependent allowances below 30%'
    vaSheet.getCell(vr, 3).font = { italic: true, size: 9 }
    vr++
  }
  for (const [rating, row] of Object.entries(RATES)) {
    vaSheet.getCell(vr, 1).value = `${rating}%`
    const vals = [row.alone, row.spouse, row.spouseChild, row.childOnly, row.addlChild, row.parent]
    vals.forEach((v, i) => {
      const c = vaSheet.getCell(vr, i + 2)
      c.value = v
      c.numFmt = MONEY
    })
    if (vr % 2 === 0) {
      for (let i = 1; i <= 7; i++) {
        vaSheet.getCell(vr, i).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: CREAM },
        }
      }
    }
    vr++
  }

  // ── State reference sheet ────────────────────────────────────────────────
  stSheet.getCell('A1').value = `State tax treatment of military retired pay — verified ${STATE_VERIFIED}`
  stSheet.getCell('A1').font = { bold: true, size: 12, color: { argb: GREEN } }
  const stHead = ['Code', 'State', 'Status', 'Exclusion cap ($/yr)', 'Effective rate', 'Notes']
  stHead.forEach((h, i) => {
    const c = stSheet.getCell(2, i + 1)
    c.value = h
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
    stSheet.getColumn(i + 1).width = [8, 22, 12, 20, 14, 90][i]
  })
  let sr = 3
  for (const [code, info] of Object.entries(STATE_TAX).sort(([a], [b]) => a.localeCompare(b))) {
    stSheet.getCell(sr, 1).value = code
    stSheet.getCell(sr, 2).value = info.name
    stSheet.getCell(sr, 3).value = info.status
    stSheet.getCell(sr, 4).value = info.cap
    stSheet.getCell(sr, 4).numFmt = MONEY_0
    stSheet.getCell(sr, 5).value = info.rate
    stSheet.getCell(sr, 5).numFmt = '0.00%'
    stSheet.getCell(sr, 6).value = info.note ?? ''
    stSheet.getCell(sr, 6).font = { size: 9 }
    if (sr % 2 === 0) {
      for (let i = 1; i <= 6; i++) {
        stSheet.getCell(sr, i).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: CREAM },
        }
      }
    }
    sr++
  }

  const buffer = await wb.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
