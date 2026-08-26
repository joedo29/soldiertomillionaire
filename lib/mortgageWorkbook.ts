import type { MortgageInputs } from './mortgage'

/**
 * Builds a live .xlsx mirror of the online calculator. Every output is an Excel
 * formula rather than a baked value, so editing the input cells recalculates the
 * whole workbook — monthly outflow, payoff timeline, interest saved, the
 * 15-vs-30 snapshot, and the full amortization schedule.
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
const MAX_MONTHS = 360 // 30-year term is the longest option
const FIRST_ROW = 2
const LAST_ROW = FIRST_ROW + MAX_MONTHS - 1 // 361

// Calculator sheet cell map
const C = {
  homePrice: 'B5',
  downPayment: 'B6',
  rate: 'B7',
  term: 'B8',
  tax: 'B9',
  insurance: 'B10',
  extra: 'B11',
  loanAmount: 'B14',
  monthlyRate: 'B15',
  numPayments: 'B16',
  pi: 'B19',
}

const AM = {
  month: `Amortization!$A$${FIRST_ROW}:$A$${LAST_ROW}`,
  year: `Amortization!$B$${FIRST_ROW}:$B$${LAST_ROW}`,
  begin: `Amortization!$C$${FIRST_ROW}:$C$${LAST_ROW}`,
  interest: `Amortization!$E$${FIRST_ROW}:$E$${LAST_ROW}`,
  principal: `Amortization!$F$${FIRST_ROW}:$F$${LAST_ROW}`,
  ending: `Amortization!$G$${FIRST_ROW}:$G$${LAST_ROW}`,
}

const ref = (cell: string) => `Calculator!$${cell[0]}$${cell.slice(1)}`

/** P&I formula for an arbitrary payment count, with the zero-rate fallback. */
function piFormula(months: string): string {
  const r = ref(C.monthlyRate)
  const l = ref(C.loanAmount)
  return `IF(${r}=0,${l}/${months},${l}*${r}*(1+${r})^${months}/((1+${r})^${months}-1))`
}

export async function buildMortgageWorkbook(inputs: MortgageInputs): Promise<Blob> {
  const ExcelJS = (await import('exceljs')).default

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Soldier to Millionaire'
  wb.created = new Date()
  wb.calcProperties.fullCalcOnLoad = true

  const calc = wb.addWorksheet('Calculator', {
    views: [{ showGridLines: false }],
    properties: { defaultColWidth: 18 },
  })
  const amort = wb.addWorksheet('Amortization', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })
  const yearly = wb.addWorksheet('Yearly Summary', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })

  // ── shared styling helpers ────────────────────────────────────────────────
  const thin = { style: 'thin' as const, color: { argb: BORDER } }

  function sectionHeader(sheet: typeof calc, row: number, text: string) {
    const c = sheet.getCell(`A${row}`)
    c.value = text
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' }, name: 'Calibri' }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
    c.alignment = { vertical: 'middle' }
    sheet.mergeCells(`A${row}:C${row}`)
    sheet.getRow(row).height = 20
  }

  function labelCell(row: number, text: string, bold = false) {
    const c = calc.getCell(`A${row}`)
    c.value = text
    c.font = { bold, size: 11, color: { argb: GREEN_DARK } }
    c.border = { bottom: thin }
  }

  function inputCell(cellRef: string, value: number, fmt: string) {
    const c = calc.getCell(cellRef)
    c.value = value
    c.numFmt = fmt
    c.font = { bold: true, size: 11, color: { argb: GREEN_DARK } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: INPUT_BG } }
    c.border = { top: thin, left: thin, bottom: thin, right: thin }
    c.alignment = { horizontal: 'right' }
    c.protection = { locked: false }
  }

  function formulaCell(
    cellRef: string,
    formula: string,
    fmt: string,
    opts: { bold?: boolean; color?: string } = {},
  ) {
    const c = calc.getCell(cellRef)
    c.value = { formula, date1904: false }
    c.numFmt = fmt
    c.font = {
      bold: opts.bold ?? false,
      size: 11,
      color: { argb: opts.color ?? GREEN_DARK },
    }
    c.border = { bottom: thin }
    c.alignment = { horizontal: 'right' }
  }

  // ── Calculator sheet ──────────────────────────────────────────────────────
  calc.getColumn('A').width = 32
  calc.getColumn('B').width = 20
  calc.getColumn('C').width = 20

  calc.mergeCells('A1:C1')
  const title = calc.getCell('A1')
  title.value = 'Mortgage Payoff Calculator'
  title.font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' }, name: 'Calibri' }
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
  title.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  calc.getRow(1).height = 34

  calc.mergeCells('A2:C2')
  const sub = calc.getCell('A2')
  sub.value = 'Edit the shaded cells. Every other number recalculates automatically.'
  sub.font = { italic: true, size: 10, color: { argb: GREEN_DARK } }
  sub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } }
  sub.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  calc.getRow(2).height = 20

  sectionHeader(calc, 4, 'YOUR INPUTS')
  const inputRows: [number, string, number, string][] = [
    [5, 'Home Price', inputs.homePrice, MONEY_0],
    [6, 'Down Payment', inputs.downPayment, MONEY_0],
    [7, 'Interest Rate (%)', inputs.annualRate, '0.00'],
    [8, 'Loan Term (years)', inputs.termYears, '0'],
    [9, 'Annual Property Tax', inputs.annualTax, MONEY_0],
    [10, 'Annual Home Insurance', inputs.annualInsurance, MONEY_0],
    [11, 'Extra Monthly Principal', inputs.extraPrincipal, MONEY_0],
  ]
  for (const [row, label, value, fmt] of inputRows) {
    labelCell(row, label)
    inputCell(`B${row}`, value, fmt)
  }
  calc.getCell('C11').value = '<-- the number that changes everything'
  calc.getCell('C11').font = { italic: true, size: 9, color: { argb: GOLD } }

  sectionHeader(calc, 13, 'LOAN BASICS')
  labelCell(14, 'Loan Amount')
  formulaCell(C.loanAmount, `${ref(C.homePrice)}-${ref(C.downPayment)}`, MONEY_0, { bold: true })
  labelCell(15, 'Monthly Interest Rate')
  formulaCell(C.monthlyRate, `${ref(C.rate)}/100/12`, '0.0000000')
  labelCell(16, 'Number of Payments')
  formulaCell(C.numPayments, `${ref(C.term)}*12`, '0')

  sectionHeader(calc, 18, 'MONTHLY OUTFLOW')
  labelCell(19, 'Principal & Interest')
  formulaCell(C.pi, piFormula(ref(C.numPayments)), MONEY)
  labelCell(20, 'Property Taxes')
  formulaCell('B20', `${ref(C.tax)}/12`, MONEY)
  labelCell(21, 'Home Insurance')
  formulaCell('B21', `${ref(C.insurance)}/12`, MONEY)
  labelCell(22, 'Extra Principal')
  formulaCell('B22', ref(C.extra), MONEY)
  labelCell(23, 'Total Monthly Outflow', true)
  formulaCell('B23', `SUM(${ref(C.pi)},${ref('B20')},${ref('B21')},${ref('B22')})`, MONEY, {
    bold: true,
    color: GREEN,
  })
  calc.getCell('B23').border = {
    top: { style: 'medium', color: { argb: GREEN } },
    bottom: { style: 'medium', color: { argb: GREEN } },
  }

  sectionHeader(calc, 25, 'PAYOFF RESULTS')
  labelCell(26, 'Actual Payoff Timeline (years)', true)
  formulaCell('B26', `ROUND(COUNTIF(${AM.begin},">0")/12,1)`, '0.0 "years"', {
    bold: true,
    color: GREEN,
  })
  labelCell(27, 'Total Interest Paid (Lifetime)', true)
  formulaCell('B27', `SUM(${AM.interest})`, MONEY, { bold: true, color: RED })
  labelCell(28, 'Interest If You Paid No Extra')
  formulaCell(
    'B28',
    `IF(${ref(C.monthlyRate)}=0,0,${ref(C.pi)}*${ref(C.numPayments)}-${ref(C.loanAmount)})`,
    MONEY,
  )
  labelCell(29, 'Total Interest Saved', true)
  formulaCell('B29', `MAX(0,${ref('B28')}-${ref('B27')})`, MONEY, { bold: true, color: GREEN })

  sectionHeader(calc, 31, '15-YEAR VS 30-YEAR SNAPSHOT')
  const snapHead = ['Term', 'Monthly P&I', 'Total Interest']
  snapHead.forEach((h, i) => {
    const c = calc.getCell(32, i + 1)
    c.value = h
    c.font = { bold: true, size: 10, color: { argb: GREEN } }
    c.border = { bottom: { style: 'medium', color: { argb: GOLD } } }
    c.alignment = { horizontal: i === 0 ? 'left' : 'right' }
  })
  calc.getCell('A33').value = '30-Year Base'
  calc.getCell('A34').value = '15-Year Base'
  calc.getCell('A35').value = 'Difference'
  ;['A33', 'A34', 'A35'].forEach((r) => {
    calc.getCell(r).font = { bold: r === 'A35', size: 11, color: { argb: GREEN_DARK } }
    calc.getCell(r).border = { bottom: thin }
  })
  formulaCell('B33', piFormula('360'), MONEY)
  formulaCell(
    'C33',
    `IF(${ref(C.monthlyRate)}=0,0,${ref('B33')}*360-${ref(C.loanAmount)})`,
    MONEY,
  )
  formulaCell('B34', piFormula('180'), MONEY)
  formulaCell(
    'C34',
    `IF(${ref(C.monthlyRate)}=0,0,${ref('B34')}*180-${ref(C.loanAmount)})`,
    MONEY,
  )
  formulaCell('B35', `${ref('B34')}-${ref('B33')}`, '"+"' + MONEY + '"/mo"', {
    bold: true,
    color: RED,
  })
  formulaCell('C35', `${ref('C33')}-${ref('C34')}`, MONEY + '" saved"', {
    bold: true,
    color: GREEN,
  })

  calc.mergeCells('A37:C37')
  const note = calc.getCell('A37')
  note.value =
    'Snapshot compares base loans only — it excludes extra principal, taxes, and insurance.'
  note.font = { italic: true, size: 9, color: { argb: 'FF6B7565' } }

  calc.mergeCells('A39:C39')
  const credit = calc.getCell('A39')
  credit.value = 'soldiertomillionaire.com — built by Joe Do, US Army'
  credit.font = { bold: true, size: 10, color: { argb: GREEN } }

  // ── Amortization sheet ────────────────────────────────────────────────────
  const amortCols = [
    'Month',
    'Year',
    'Beginning Balance',
    'Payment',
    'Interest',
    'Principal (incl. extra)',
    'Ending Balance',
  ]
  amortCols.forEach((h, i) => {
    const c = amort.getCell(1, i + 1)
    c.value = h
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    amort.getColumn(i + 1).width = i === 0 || i === 1 ? 9 : 20
  })
  amort.getRow(1).height = 30

  for (let row = FIRST_ROW; row <= LAST_ROW; row++) {
    const month = row - FIRST_ROW + 1
    const prevEnd = `G${row - 1}`
    const set = (col: string, formula: string, fmt: string) => {
      const c = amort.getCell(`${col}${row}`)
      c.value = { formula, date1904: false }
      c.numFmt = fmt
      c.font = { size: 10 }
      if (row % 2 === 0) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } }
      }
    }

    const a = amort.getCell(`A${row}`)
    a.value = month
    a.alignment = { horizontal: 'center' }
    a.font = { size: 10 }
    if (row % 2 === 0) {
      a.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } }
    }

    set('B', `IF(C${row}>0,ROUNDUP(A${row}/12,0),"")`, '0')
    amort.getCell(`B${row}`).alignment = { horizontal: 'center' }

    // Month 1 opens at the full loan amount; later months carry the prior balance
    // forward, and stop once the loan is cleared or the term runs out.
    if (month === 1) {
      set('C', ref(C.loanAmount), MONEY)
    } else {
      set('C', `IF(AND(A${row}<=${ref(C.numPayments)},${prevEnd}>0),${prevEnd},0)`, MONEY)
    }
    set('E', `IF(C${row}>0,C${row}*${ref(C.monthlyRate)},0)`, MONEY)
    set(
      'F',
      `IF(C${row}>0,MIN(C${row},${ref(C.pi)}-E${row}+${ref(C.extra)}),0)`,
      MONEY,
    )
    set('D', `IF(C${row}>0,E${row}+F${row},0)`, MONEY)
    // Mirrors the tool's sub-cent clamp so the schedule ends cleanly at zero.
    set('G', `IF(C${row}>0,IF(C${row}-F${row}<0.01,0,C${row}-F${row}),0)`, MONEY)
  }

  amort.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 7 } }

  // ── Yearly Summary sheet ──────────────────────────────────────────────────
  const yearCols = ['Year', 'Principal Paid', 'Interest Paid', 'Ending Balance']
  yearCols.forEach((h, i) => {
    const c = yearly.getCell(1, i + 1)
    c.value = h
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
    c.alignment = { horizontal: 'center', vertical: 'middle' }
    yearly.getColumn(i + 1).width = i === 0 ? 10 : 20
  })
  yearly.getRow(1).height = 24

  for (let y = 1; y <= 30; y++) {
    const row = y + 1
    const yc = yearly.getCell(`A${row}`)
    yc.value = y
    yc.alignment = { horizontal: 'center' }
    yc.font = { size: 10 }

    const put = (col: string, formula: string) => {
      const c = yearly.getCell(`${col}${row}`)
      c.value = { formula, date1904: false }
      c.numFmt = MONEY
      c.font = { size: 10 }
      if (row % 2 === 0) {
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } }
      }
    }
    if (row % 2 === 0) {
      yc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREAM } }
    }

    const principal = `SUMIF(${AM.year},A${row},${AM.principal})`
    put('B', `IF(${principal}=0,"",${principal})`)
    put('C', `IF(${principal}=0,"",SUMIF(${AM.year},A${row},${AM.interest}))`)
    put(
      'D',
      `IF(${principal}=0,"",IFERROR(INDEX(${AM.ending},MATCH(A${row}*12,${AM.month},0)),0))`,
    )
  }

  const buffer = await wb.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
