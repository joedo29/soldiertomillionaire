import {
  AFT_BANDS,
  AIRBORNE_ADVANTAGE,
  AWARDS,
  BADGE_GROUPS,
  CATEGORY_MAX,
  CERTIFICATION_MAX_COUNT,
  CERTIFICATION_POINTS,
  COA_MAX,
  COA_POINTS,
  CORRESPONDENCE_HOURS_PER_POINT,
  CORRESPONDENCE_MAX,
  DEGREE_POINTS,
  DLPT_POINTS,
  FITNESS_MAX,
  PME_GRADUATE_POINTS,
  PME_HONORS,
  RANGER_SF_SAPPER_POINTS,
  RESIDENT_MAX,
  RESIDENT_POINTS_PER_WEEK,
  SEMESTER_HOUR_POINTS,
  STANDALONE_BADGES,
  TOTAL_MAX,
  WEAPONS_31D,
  WEAPONS_MAX,
  WEAPONS_SGT,
  WEAPONS_SSG,
  lookupBand,
  type AirborneStatus,
  type PmeHonors,
  type Rank,
} from './promotionPointsData'

/**
 * Promotion point engine for the semi-centralized system (SGT and SSG).
 *
 * Structure follows AR 600-8-19 (6 Mar 2026, effective 6 Apr 2026):
 *   - Four categories, each with its own maximum, summing to 800.
 *   - Two categories have internal sub-caps that are "inclusive of" the
 *     category maximum (resident training, correspondence).
 *   - Airborne Advantage is added on top, "without regard to the maximum
 *     point rules" (para 3-16d), so it can push a total above 800.
 *
 * This is a planning estimate. The authoritative computation is done by
 * IPPS-A from the Soldier's records.
 */

export interface PromotionInputs {
  rank: Rank

  // Military training
  weaponSystem: string
  weaponHits: number | null
  /** MOS 31D uses the Practical Pistol Score Card instead (para 3-15a(8)). */
  is31D: boolean
  /** Aggregate record AFT score, 0-500, straight off the scorecard. */
  aftScore: number | null

  // Awards, decorations, achievements
  awardCounts: Record<string, number>
  /** Selected badge id per progressive family, or null. */
  badgeGroupSelections: Record<string, string | null>
  standaloneBadgeIds: string[]
  certificatesOfAchievement: number
  airborne: AirborneStatus

  // Military education
  pmeGraduate: boolean
  pmeHonors: PmeHonors
  residentTrainingWeeks: number
  rangerSfSapper: boolean
  correspondenceHours: number

  // Civilian education
  semesterHours: number
  degreeCompleted: boolean
  certifications: number
  dlpt: boolean
}

export interface LineItem {
  label: string
  points: number
  note?: string
}

export interface CategoryResult {
  key: 'militaryTraining' | 'awards' | 'militaryEducation' | 'civilianEducation'
  label: string
  /** Points before the category cap is applied. */
  raw: number
  /** Points after the category cap. */
  points: number
  max: number
  capped: boolean
  items: LineItem[]
}

export interface PromotionResult {
  categories: CategoryResult[]
  /** Sum of capped categories, itself capped at 800. */
  baseTotal: number
  airbornePoints: number
  /** baseTotal + airborne. May exceed 800 by design. */
  total: number
  maxPossible: number
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const int = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0)

export function weaponPoints(inputs: PromotionInputs): number {
  const { rank, weaponHits, is31D, weaponSystem } = inputs
  if (weaponHits === null || !Number.isFinite(weaponHits)) return 0
  const bands = is31D
    ? WEAPONS_31D[rank]
    : (rank === 'SGT' ? WEAPONS_SGT : WEAPONS_SSG)[weaponSystem]
  if (!bands) return 0
  return Math.min(lookupBand(bands, weaponHits), WEAPONS_MAX[rank])
}

export function aftPoints(score: number | null): number {
  if (score === null || !Number.isFinite(score)) return 0
  return Math.min(lookupBand(AFT_BANDS, score), FITNESS_MAX)
}

export function awardsPoints(counts: Record<string, number>): LineItem[] {
  const items: LineItem[] = []
  for (const award of AWARDS) {
    const n = int(counts[award.id] ?? 0)
    if (n <= 0) continue
    let pts = n * award.points
    let note: string | undefined
    if (award.capPoints !== undefined && pts > award.capPoints) {
      pts = award.capPoints
      note = `capped at ${award.capPoints}`
    }
    items.push({ label: `${award.label} x${n}`, points: pts, note })
  }
  return items
}

export function badgePoints(inputs: PromotionInputs): LineItem[] {
  const items: LineItem[] = []

  // Progressive families: only the selected tier counts, never summed.
  for (const group of BADGE_GROUPS) {
    const selectedId = inputs.badgeGroupSelections[group.id]
    if (!selectedId) continue
    const badge = group.options.find((o) => o.id === selectedId)
    if (badge) items.push({ label: badge.label, points: badge.points })
  }

  for (const id of inputs.standaloneBadgeIds) {
    const badge = STANDALONE_BADGES.find((b) => b.id === id)
    if (badge) items.push({ label: badge.label, points: badge.points })
  }

  return items
}

export function airbornePoints(status: AirborneStatus): number {
  return AIRBORNE_ADVANTAGE.find((a) => a.id === status)?.points ?? 0
}

export function calculatePromotionPoints(inputs: PromotionInputs): PromotionResult {
  const { rank } = inputs
  const max = CATEGORY_MAX[rank]

  // ── Military training (para 3-15) ─────────────────────────────────────────
  const weapons = weaponPoints(inputs)
  const aft = aftPoints(inputs.aftScore)
  const trainingItems: LineItem[] = [
    {
      label: inputs.is31D ? 'Weapons qualification (31D pistol card)' : 'Weapons qualification',
      points: weapons,
      note: `max ${WEAPONS_MAX[rank]}`,
    },
    { label: 'Army Fitness Test', points: aft, note: `max ${FITNESS_MAX}` },
  ]
  const trainingRaw = weapons + aft

  // ── Awards, decorations, achievements (para 3-16) ──────────────────────────
  const awardItems = awardsPoints(inputs.awardCounts)
  const badgeItems = badgePoints(inputs)
  const coaCount = int(inputs.certificatesOfAchievement)
  const coaPts = Math.min(coaCount * COA_POINTS, COA_MAX)
  const awardsItems: LineItem[] = [...awardItems, ...badgeItems]
  if (coaCount > 0) {
    awardsItems.push({
      label: `Certificate of Achievement x${coaCount}`,
      points: coaPts,
      note: coaCount * COA_POINTS > COA_MAX ? `capped at ${COA_MAX}` : undefined,
    })
  }
  const awardsRaw = awardsItems.reduce((s, i) => s + i.points, 0)

  // ── Military education (para 3-17) ─────────────────────────────────────────
  const pmeGrad = inputs.pmeGraduate ? PME_GRADUATE_POINTS : 0
  const honors = inputs.pmeGraduate
    ? (PME_HONORS.find((h) => h.id === inputs.pmeHonors)?.points ?? 0)
    : 0

  // Resident training and Ranger/SF/Sapper both sit under the resident sub-cap.
  const residentRaw =
    int(inputs.residentTrainingWeeks) * RESIDENT_POINTS_PER_WEEK +
    (inputs.rangerSfSapper ? RANGER_SF_SAPPER_POINTS : 0)
  const resident = Math.min(residentRaw, RESIDENT_MAX[rank])

  const correspondenceRaw = Math.floor(
    int(inputs.correspondenceHours) / CORRESPONDENCE_HOURS_PER_POINT,
  )
  const correspondence = Math.min(correspondenceRaw, CORRESPONDENCE_MAX)

  const milEdItems: LineItem[] = [
    {
      label: rank === 'SGT' ? 'Basic Leaders Course graduate' : 'Advanced Leaders Course graduate',
      points: pmeGrad,
    },
    { label: 'PME academic honors', points: honors },
    {
      label: 'Resident military training',
      points: resident,
      note:
        residentRaw > RESIDENT_MAX[rank]
          ? `capped at ${RESIDENT_MAX[rank]}`
          : `max ${RESIDENT_MAX[rank]}`,
    },
    {
      label: 'Correspondence / computer-based training',
      points: correspondence,
      note:
        correspondenceRaw > CORRESPONDENCE_MAX
          ? `capped at ${CORRESPONDENCE_MAX}`
          : `max ${CORRESPONDENCE_MAX}`,
    },
  ]
  const milEdRaw = pmeGrad + honors + resident + correspondence

  // ── Civilian education (para 3-18) ─────────────────────────────────────────
  const semesterPts = int(inputs.semesterHours) * SEMESTER_HOUR_POINTS
  const degreePts = inputs.degreeCompleted ? DEGREE_POINTS : 0
  const certCount = clamp(int(inputs.certifications), 0, CERTIFICATION_MAX_COUNT)
  const certPts = certCount * CERTIFICATION_POINTS
  const dlptPts = inputs.dlpt ? DLPT_POINTS : 0

  const civEdItems: LineItem[] = [
    { label: `Semester hours (${int(inputs.semesterHours)} x ${SEMESTER_HOUR_POINTS})`, points: semesterPts },
    { label: 'Degree completed on active duty', points: degreePts },
    {
      label: `Technical certifications x${certCount}`,
      points: certPts,
      note: `max ${CERTIFICATION_MAX_COUNT} certifications / ${CERTIFICATION_POINTS * CERTIFICATION_MAX_COUNT} points`,
    },
    { label: 'DLPT / Oral Proficiency Interview', points: dlptPts },
  ]
  const civEdRaw = semesterPts + degreePts + certPts + dlptPts

  const build = (
    key: CategoryResult['key'],
    label: string,
    raw: number,
    capValue: number,
    items: LineItem[],
  ): CategoryResult => ({
    key,
    label,
    raw,
    points: Math.min(raw, capValue),
    max: capValue,
    capped: raw > capValue,
    items,
  })

  const categories: CategoryResult[] = [
    build('militaryTraining', 'Military training', trainingRaw, max.militaryTraining, trainingItems),
    build('awards', 'Awards, decorations & achievements', awardsRaw, max.awards, awardsItems),
    build('militaryEducation', 'Military education', milEdRaw, max.militaryEducation, milEdItems),
    build('civilianEducation', 'Civilian education', civEdRaw, max.civilianEducation, civEdItems),
  ]

  const baseTotal = Math.min(
    categories.reduce((s, c) => s + c.points, 0),
    TOTAL_MAX,
  )
  const airborne = airbornePoints(inputs.airborne)

  return {
    categories,
    baseTotal,
    airbornePoints: airborne,
    total: baseTotal + airborne,
    maxPossible: TOTAL_MAX + 40,
  }
}

export function emptyInputs(rank: Rank = 'SGT'): PromotionInputs {
  return {
    rank,
    weaponSystem: 'rifle',
    weaponHits: null,
    is31D: false,
    aftScore: null,
    awardCounts: {},
    badgeGroupSelections: {},
    standaloneBadgeIds: [],
    certificatesOfAchievement: 0,
    airborne: 'none',
    pmeGraduate: false,
    pmeHonors: 'none',
    residentTrainingWeeks: 0,
    rangerSfSapper: false,
    correspondenceHours: 0,
    semesterHours: 0,
    degreeCompleted: false,
    certifications: 0,
    dlpt: false,
  }
}
