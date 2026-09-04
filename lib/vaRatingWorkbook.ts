import {
  calculateCombinedRating,
  LOCATION_LABELS,
  type Condition,
} from './vaCombinedRating'
import {
  RATES,
  FLAT_RATES,
  RATE_YEAR,
  RATE_EFFECTIVE_DATE,
  vaCompensation,
  type FamilyStatus,
} from './vaDisabilityRates'

/**
 * Interactive .xlsx for the combined rating calculator.
 *
 * The arithmetic is genuinely formula-driven: change a rating and the whole
 * chain recalculates, including the ordering (via LARGE), the bilateral fold,
 * the 10% factor, the final conversion to a degree of 10, and the pay lookup.
 *
 * The ONE thing fixed at export time is bilateral GROUP MEMBERSHIP, since which
 * conditions pair depends on left/right locations and dynamic membership is not
 * expressible in plain formulas. That limitation is stated on the sheet.
 */

const GREEN = 'FF2D4A1E'
const GREEN_DARK = 'FF1A1F14'
const GOLD = 'FFC9A84C'
const CREAM = 'FFF9F5EE'
const INPUT_BG = 'FFFDF7E3'
const BORDER = 'FFDDD6C6'

const MONEY = '"$"#,##0.00'
const PCT0 = '0"%"'

export interface WorkbookInputs {
  conditions: Condition[]
  familyStatus: FamilyStatus
  additionalChildren: number
  dependentParents: number
}

const STATUS_KEYS: FamilyStatus[] = [
  'veteran_alone',
  'spouse_only',
  'spouse_one_child',
  'one_child_only',
]
const STATUS_LABELS: Record<FamilyStatus, string> = {
  veteran_alone: 'veteran_alone',
  spouse_only: 'spouse_only',
  spouse_one_child: 'spouse_one_child',
  one_child_only: 'one_child_only',
}

export async function buildRatingWorkbook(input: WorkbookInputs): Promise<Blob> {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Soldier to Millionaire'
  wb.created = new Date()
  wb.calcProperties.fullCalcOnLoad = true

  const ws = wb.addWorksheet('Calculator', { views: [{ showGridLines: false }] })
  const rateSheet = wb.addWorksheet('VA Rate Table', { views: [{ state: 'frozen', ySplit: 2 }] })
  const notes = wb.addWorksheet('Notes & Sources')

  const thin = { style: 'thin' as const, color: { argb: BORDER } }
  const active = input.conditions.filter((c) => c.rating > 0)
  const result = calculateCombinedRating(active)
  const groupIds = new Set(result.bilateralGroup.map((c) => c.id))
  const nonBilateral = active.filter((c) => !(result.bilateralApplies && groupIds.has(c.id)))

  ws.getColumn('A').width = 34
  ws.getColumn('B').width = 14
  ws.getColumn('C').width = 20
  ws.getColumn('D').width = 16
  ws.getColumn('E').width = 16
  ws.getColumn('F').width = 14

  let r = 1
  const banner = (text: string, span = 'F') => {
    ws.mergeCells(`A${r}:${span}${r}`)
    const c = ws.getCell(`A${r}`)
    c.value = text
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
    c.alignment = { vertical: 'middle', indent: 1 }
    ws.getRow(r).height = 20
    r++
  }
  const note = (text: string, span = 'F', italic = true) => {
    ws.mergeCells(`A${r}:${span}${r}`)
    const c = ws.getCell(`A${r}`)
    c.value = text
    c.font = { italic, size: 9.5, color: { argb: GREEN_DARK } }
    c.alignment = { vertical: 'top', wrapText: true, indent: 1 }
    ws.getRow(r).height = 24
    r++
  }
  const inputCell = (addr: string, value: string | number, fmt?: string) => {
    const c = ws.getCell(addr)
    c.value = value
    if (fmt) c.numFmt = fmt
    c.font = { bold: true, size: 11, color: { argb: GREEN_DARK } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: INPUT_BG } }
    c.border = { top: thin, left: thin, bottom: thin, right: thin }
    c.alignment = { horizontal: 'center' }
  }
  const f = (addr: string, formula: string, fmt?: string, bold = false, color = GREEN_DARK) => {
    const c = ws.getCell(addr)
    c.value = { formula, date1904: false }
    if (fmt) c.numFmt = fmt
    c.font = { bold, size: 11, color: { argb: color } }
    c.border = { bottom: thin }
    c.alignment = { horizontal: 'center' }
  }

  // ── Title ────────────────────────────────────────────────────────────────
  ws.mergeCells(`A${r}:F${r}`)
  const title = ws.getCell(`A${r}`)
  title.value = 'VA Combined Disability Rating Calculator'
  title.font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' } }
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
  title.alignment = { vertical: 'middle', indent: 1 }
  ws.getRow(r).height = 34
  r++
  note(
    `38 CFR 4.25 and 4.26 - ${RATE_YEAR} rates effective ${RATE_EFFECTIVE_DATE}. Edit the shaded cells; every result recalculates. Educational estimate, not a VA decision.`,
  )
  r++

  // ── Dependents ───────────────────────────────────────────────────────────
  banner('DEPENDENT PROFILE')
  const statusRow = r
  ws.getCell(`A${r}`).value = 'Family status'
  ws.getCell(`A${r}`).font = { size: 11, color: { argb: GREEN_DARK } }
  inputCell(`B${r}`, STATUS_LABELS[input.familyStatus])
  ws.getCell(`C${r}`).value = 'veteran_alone / spouse_only / spouse_one_child / one_child_only'
  ws.getCell(`C${r}`).font = { italic: true, size: 9, color: { argb: GOLD } }
  ws.mergeCells(`C${r}:F${r}`)
  r++
  const childRow = r
  ws.getCell(`A${r}`).value = 'Additional children under 18'
  ws.getCell(`A${r}`).font = { size: 11, color: { argb: GREEN_DARK } }
  inputCell(`B${r}`, input.additionalChildren, '0')
  r++
  const parentRow = r
  ws.getCell(`A${r}`).value = 'Dependent parents'
  ws.getCell(`A${r}`).font = { size: 11, color: { argb: GREEN_DARK } }
  inputCell(`B${r}`, input.dependentParents, '0')
  r++
  r++

  // ── Conditions ───────────────────────────────────────────────────────────
  banner('SERVICE-CONNECTED CONDITIONS')
  const condHeaderRow = r
  ;['Condition', 'Rating %', 'Location', 'In bilateral group?', '', ''].forEach((h, i) => {
    const c = ws.getCell(r, i + 1)
    c.value = h
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
    c.alignment = { horizontal: i === 0 ? 'left' : 'center', indent: i === 0 ? 1 : 0 }
  })
  r++
  const condStart = r
  for (const cond of active) {
    ws.getCell(`A${r}`).value = cond.name || 'Condition'
    ws.getCell(`A${r}`).font = { size: 10.5 }
    inputCell(`B${r}`, cond.rating, PCT0)
    ws.getCell(`C${r}`).value = LOCATION_LABELS[cond.location]
    ws.getCell(`C${r}`).font = { size: 10 }
    ws.getCell(`C${r}`).alignment = { horizontal: 'center' }
    ws.getCell(`D${r}`).value =
      result.bilateralApplies && groupIds.has(cond.id) ? 'YES' : 'no'
    ws.getCell(`D${r}`).font = { size: 10 }
    ws.getCell(`D${r}`).alignment = { horizontal: 'center' }
    r++
  }
  const condEnd = r - 1
  r++

  // Map each condition to its rating cell so the helper blocks can reference it.
  const ratingCellFor = new Map<string, string>()
  active.forEach((cond, i) => ratingCellFor.set(cond.id, `B${condStart + i}`))

  // ── Bilateral block ──────────────────────────────────────────────────────
  let bilateralValueCell = ''
  if (result.bilateralApplies) {
    banner('BILATERAL GROUP - 38 CFR 4.26')
    note(
      'Paired conditions combine first, then 10% of that value is ADDED (not combined) and rounded to a whole number. The result is then treated as a single disability.',
    )
    ;['Order', 'Rating %', 'Prior combined', 'Combined value', '', ''].forEach((h, i) => {
      const c = ws.getCell(r, i + 1)
      c.value = h
      c.font = { bold: true, size: 10, color: { argb: GREEN } }
      c.border = { bottom: { style: 'medium', color: { argb: GOLD } } }
      c.alignment = { horizontal: i === 0 ? 'left' : 'center', indent: i === 0 ? 1 : 0 }
    })
    r++

    // Hidden helper column H holds the bilateral members' rating references.
    const biMembers = result.bilateralGroup
    const helperStart = r
    biMembers.forEach((cond, i) => {
      const h = ws.getCell(`H${helperStart + i}`)
      h.value = { formula: ratingCellFor.get(cond.id)!, date1904: false }
      h.numFmt = PCT0
    })
    const biRange = `$H$${helperStart}:$H$${helperStart + biMembers.length - 1}`

    let prevCell = ''
    biMembers.forEach((_, i) => {
      const row = r + i
      ws.getCell(`A${row}`).value = `Bilateral condition ${i + 1} (most severe first)`
      ws.getCell(`A${row}`).font = { size: 10.5 }
      // LARGE re-sorts automatically if the user edits a rating.
      f(`B${row}`, `LARGE(${biRange},${i + 1})`, PCT0)
      f(`C${row}`, i === 0 ? '0' : prevCell, PCT0)
      f(`D${row}`, `ROUND(C${row}+B${row}*(100-C${row})/100,0)`, PCT0, true)
      prevCell = `D${row}`
    })
    r += biMembers.length

    ws.getCell(`A${r}`).value = 'Add 10% bilateral factor, round to whole number'
    ws.getCell(`A${r}`).font = { bold: true, size: 10.5, color: { argb: GREEN } }
    f(`B${r}`, `${prevCell}*0.1`, '0.00', false, GOLD)
    f(`C${r}`, prevCell, PCT0)
    f(`D${r}`, `ROUND(${prevCell}*1.1,0)`, PCT0, true, GREEN)
    bilateralValueCell = `D${r}`
    r++
    r++
  }

  // ── Main combination ─────────────────────────────────────────────────────
  banner('COMBINATION IN ORDER OF SEVERITY - 38 CFR 4.25')
  note(
    'Each pairwise combination is read from the Combined Ratings Table, which contains whole numbers. The whole number carries into the next step. Conversion to the nearest degree of 10 happens only once, at the end.',
  )
  ;['Order', 'Rating %', 'Prior combined', 'Combined value', '', ''].forEach((h, i) => {
    const c = ws.getCell(r, i + 1)
    c.value = h
    c.font = { bold: true, size: 10, color: { argb: GREEN } }
    c.border = { bottom: { style: 'medium', color: { argb: GOLD } } }
    c.alignment = { horizontal: i === 0 ? 'left' : 'center', indent: i === 0 ? 1 : 0 }
  })
  r++

  // Helper column I: one entry per "unit" (non-bilateral conditions + the group).
  const unitHelperStart = r
  let hi = 0
  if (result.bilateralApplies) {
    const cell = ws.getCell(`I${unitHelperStart + hi}`)
    cell.value = { formula: bilateralValueCell, date1904: false }
    cell.numFmt = PCT0
    hi++
  }
  nonBilateral.forEach((cond) => {
    const cell = ws.getCell(`I${unitHelperStart + hi}`)
    cell.value = { formula: ratingCellFor.get(cond.id)!, date1904: false }
    cell.numFmt = PCT0
    hi++
  })
  const unitCount = hi
  const unitRange = `$I$${unitHelperStart}:$I$${unitHelperStart + unitCount - 1}`

  let prevMain = ''
  for (let i = 0; i < unitCount; i++) {
    const row = r + i
    ws.getCell(`A${row}`).value = `Disability ${i + 1} (most severe first)`
    ws.getCell(`A${row}`).font = { size: 10.5 }
    f(`B${row}`, `LARGE(${unitRange},${i + 1})`, PCT0)
    f(`C${row}`, i === 0 ? '0' : prevMain, PCT0)
    f(`D${row}`, `ROUND(C${row}+B${row}*(100-C${row})/100,0)`, PCT0, true)
    prevMain = `D${row}`
  }
  r += unitCount
  r++

  // ── Results ──────────────────────────────────────────────────────────────
  banner('RESULT')
  const combinedRow = r
  ws.getCell(`A${r}`).value = 'Combined value (before conversion)'
  ws.getCell(`A${r}`).font = { size: 11, color: { argb: GREEN_DARK } }
  f(`B${r}`, prevMain, PCT0, true)
  r++
  const officialRow = r
  ws.getCell(`A${r}`).value = 'Official VA rating (nearest 10, 5 rounds up)'
  ws.getCell(`A${r}`).font = { bold: true, size: 11, color: { argb: GREEN_DARK } }
  f(`B${r}`, `MIN(100,ROUND(B${combinedRow}/10,0)*10)`, PCT0, true, GREEN)
  r++
  const payRow = r
  ws.getCell(`A${r}`).value = `Estimated monthly compensation (${RATE_YEAR})`
  ws.getCell(`A${r}`).font = { bold: true, size: 11, color: { argb: GREEN_DARK } }
  // Column index: alone=2, spouse=3, spouse_child=4, child_only=5 on the rate sheet.
  const statusIdx = `MATCH($B$${statusRow},'VA Rate Table'!$B$2:$E$2,0)+1`
  const lookup = (colExpr: string) =>
    `VLOOKUP($B$${officialRow},'VA Rate Table'!$A$3:$G$13,${colExpr},FALSE)`
  f(
    `B${r}`,
    `IF($B$${officialRow}=0,0,${lookup(statusIdx)}+$B$${childRow}*${lookup('6')}+$B$${parentRow}*${lookup('7')})`,
    MONEY,
    true,
    GREEN,
  )
  ;[`B${combinedRow}`, `B${officialRow}`, `B${payRow}`].forEach((addr) => {
    ws.getCell(addr).border = {
      top: { style: 'thin', color: { argb: BORDER } },
      bottom: { style: 'medium', color: { argb: GREEN } },
    }
  })
  r += 2

  note(
    'LIMITATION: bilateral group membership is fixed as of export, because which conditions pair depends on left/right location. Editing a rating recalculates everything; changing a LOCATION means you should re-export from the website.',
    'F',
    false,
  )

  // Hide the helper columns.
  ws.getColumn('H').hidden = true
  ws.getColumn('I').hidden = true

  // ── Rate table sheet (drives the VLOOKUP) ────────────────────────────────
  rateSheet.getCell('A1').value = `VA disability compensation — ${RATE_YEAR} rates, effective ${RATE_EFFECTIVE_DATE}`
  rateSheet.getCell('A1').font = { bold: true, size: 12, color: { argb: GREEN } }
  const rateHead = [
    'Rating',
    'veteran_alone',
    'spouse_only',
    'spouse_one_child',
    'one_child_only',
    'addl_child',
    'parent',
  ]
  rateHead.forEach((h, i) => {
    const c = rateSheet.getCell(2, i + 1)
    c.value = h
    c.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREEN } }
    c.alignment = { horizontal: 'center', wrapText: true }
    rateSheet.getColumn(i + 1).width = i === 0 ? 10 : 17
  })
  // Row 3 = rating 0, then 10..100 — VLOOKUP range A3:G13.
  const ratings = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  ratings.forEach((rating, idx) => {
    const row = 3 + idx
    rateSheet.getCell(row, 1).value = rating
    let vals: number[]
    if (rating === 0) {
      vals = [0, 0, 0, 0, 0, 0]
    } else if (FLAT_RATES[rating] !== undefined) {
      const flat = FLAT_RATES[rating]
      vals = [flat, flat, flat, flat, 0, 0]
    } else {
      const row2 = RATES[rating]
      vals = [row2.alone, row2.spouse, row2.spouseChild, row2.childOnly, row2.addlChild, row2.parent]
    }
    vals.forEach((v, i) => {
      const c = rateSheet.getCell(row, i + 2)
      c.value = v
      c.numFmt = MONEY
    })
    if (row % 2 === 0) {
      for (let i = 1; i <= 7; i++) {
        rateSheet.getCell(row, i).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: CREAM },
        }
      }
    }
  })
  rateSheet.getCell('A15').value =
    'Ratings of 10% and 20% pay a flat amount — the VA pays dependent allowances only at 30% and above.'
  rateSheet.getCell('A15').font = { italic: true, size: 9.5, color: { argb: GREEN_DARK } }

  // ── Notes sheet ──────────────────────────────────────────────────────────
  notes.getColumn('A').width = 118
  notes.getCell('A1').value = 'What this workbook does and does not do'
  notes.getCell('A1').font = { bold: true, size: 14, color: { argb: GREEN } }
  const lines = [
    'THIS IS AN EDUCATIONAL ESTIMATE, NOT A VA DECISION.',
    'Individual condition percentages are assigned by VA raters under the Schedule for Rating Disabilities (38 CFR Part 4) after reviewing medical evidence. This workbook only combines percentages you supply.',
    '',
    'HOW THE MATH WORKS',
    'Per 38 CFR 4.25, disabilities are arranged most severe first and combined pairwise using the Combined Ratings Table. Each combination produces a WHOLE NUMBER, and that whole number is what combines with the next disability. Conversion to the nearest degree divisible by 10 happens only once, after every disability has been combined; values ending in 5 are adjusted upward.',
    'Per 38 CFR 4.26, disabilities of both arms, both legs, or paired skeletal muscles are combined first, then 10 percent of that value is ADDED (not combined) and the result is rounded to a whole number. That value is treated as a single disability for ordering and all further combinations.',
    '',
    'NOT COVERED BY THIS TOOL',
    'Special Monthly Compensation (SMC) — additional payments for things like loss of use of a limb or aid and attendance.',
    'Total Disability based on Individual Unemployability (TDIU) — pays at the 100% rate at a lower schedular rating when service-connected conditions prevent substantially gainful employment.',
    'Aid and Attendance, and housebound benefits.',
    'Children over 18 attending an approved school, and other dependent situations beyond the simple profile here.',
    'Conditions rated 0% — service connected but non-compensable.',
    'The 38 CFR 4.26 exception allowing bilateral disabilities to be combined separately when that is more favorable to the veteran.',
    '',
    'PYRAMIDING',
    'Under 38 CFR 4.14 the VA prohibits rating the same symptom under more than one diagnostic code. Do not enter overlapping conditions that describe the same underlying impairment — the result will be higher than the VA would assign.',
    '',
    'SOURCES',
    '38 CFR 4.25 — https://www.ecfr.gov/current/title-38/chapter-I/part-4/subpart-A/section-4.25',
    '38 CFR 4.26 — https://www.ecfr.gov/current/title-38/chapter-I/part-4/subpart-A/section-4.26',
    '38 CFR 4.14 — https://www.ecfr.gov/current/title-38/chapter-I/part-4/subpart-A/section-4.14',
    'VA compensation rates — https://www.va.gov/disability/compensation-rates/veteran-rates/',
    'File or check a claim — https://www.va.gov/disability/',
  ]
  lines.forEach((line, i) => {
    const cell = notes.getCell(`A${i + 3}`)
    cell.value = line
    const isHeading = line === line.toUpperCase() && line.length > 0 && line.length < 60
    cell.font = {
      bold: isHeading,
      size: isHeading ? 11 : 10,
      color: { argb: isHeading ? GREEN : GREEN_DARK },
    }
    cell.alignment = { wrapText: true, vertical: 'top' }
    if (!isHeading && line.length > 90) notes.getRow(i + 3).height = 40
  })

  const buffer = await wb.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

/** Convenience for verification: what the on-screen result should be. */
export function expectedFor(input: WorkbookInputs) {
  const active = input.conditions.filter((c) => c.rating > 0)
  const res = calculateCombinedRating(active)
  return {
    combinedValue: res.combinedValue,
    officialRating: res.officialRating,
    monthlyPay: vaCompensation(
      res.officialRating,
      input.familyStatus,
      input.additionalChildren,
      input.dependentParents,
    ),
    bilateralWithFactor: res.bilateralApplies ? res.bilateralWithFactor : null,
  }
}

export { STATUS_KEYS }
