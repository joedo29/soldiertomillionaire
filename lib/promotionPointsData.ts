/**
 * ============================================================================
 * ARMY SEMI-CENTRALIZED PROMOTION POINTS — DATA MODULE
 * ============================================================================
 * Every value below is transcribed from the regulation, not from memory or
 * from third-party calculator sites. Each block cites its paragraph or table.
 *
 * PRIMARY SOURCE
 *   AR 600-8-19, Enlisted Promotions and Demotions
 *   Published 6 March 2026 · Effective 6 April 2026
 *   (supersedes AR 600-8-19 dated 21 June 2024; rescinds AD 2024-12)
 *   https://armypubs.army.mil/epubs/DR_pubs/DR_a/ARN43646-AR_600-8-19-000-WEB-1.pdf
 *
 * SUPPORTING SOURCES
 *   MILPER Message 25-201 (22 May 2025) — Timeline for Semi-Centralized
 *     Promotion Cycle to Support the Army Fitness Test Implementation.
 *     AFT general standard used for promotion actions from 1 Oct 2025;
 *     AFT combat standard from 1 Jan 2026. Confirms 120 points remains the
 *     maximum authorized for the fitness category under a revised table.
 *   Army Directive 2025-06 (17 Apr 2025) — Army Fitness Test. Incorporated
 *     throughout the 6 Mar 2026 AR.
 *   HRC memo AHRC-PDV-PE (RN 600-8-19h) — monthly HQDA promotion point
 *     cutoff scores. Source of the cutoff indicator legend below.
 *
 * NOTE ON DA PAM 600-8-19: no such pamphlet is published. AR 600-8-19 is the
 * controlling publication for promotion point computation.
 *
 * HOW TO UPDATE: when a new AR edition or MILPER changes a value, edit it here
 * and move REG_* forward. Nothing else in the app hardcodes point values.
 * ============================================================================
 */

export const REG_TITLE = 'AR 600-8-19, Enlisted Promotions and Demotions'
export const REG_PUBLISHED = '6 March 2026'
export const REG_EFFECTIVE = '6 April 2026'
export const REG_URL =
  'https://armypubs.army.mil/epubs/DR_pubs/DR_a/ARN43646-AR_600-8-19-000-WEB-1.pdf'
export const DATA_VERIFIED = '2026-09-09'
export const HRC_PROMOTIONS_URL =
  'https://www.hrc.army.mil/content/Enlisted%20Promotions%20Homepage'

export type Rank = 'SGT' | 'SSG'

/** A scoring band. `max` is inclusive; `min` is inclusive. */
export interface Band {
  min: number
  max: number
  points: number
}

/** Look up a banded table. Above the top band scores the top value. */
export function lookupBand(bands: Band[], value: number): number {
  if (!Number.isFinite(value)) return 0
  const top = bands[0]
  if (value > top.max) return top.points
  for (const b of bands) {
    if (value >= b.min && value <= b.max) return b.points
  }
  return 0
}

// ── Category maximums ───────────────────────────────────────────────────────
// AR 600-8-19, paras 3-15, 3-16, 3-17, 3-18. Both ranks total 800.
export const CATEGORY_MAX = {
  SGT: { militaryTraining: 280, awards: 145, militaryEducation: 240, civilianEducation: 135 },
  SSG: { militaryTraining: 230, awards: 165, militaryEducation: 245, civilianEducation: 160 },
} as const

export const TOTAL_MAX = 800

/** para 3-15a — weapons sub-maximum inside the military training category. */
export const WEAPONS_MAX = { SGT: 160, SSG: 110 } as const
/** para 3-15c — fitness sub-maximum. Same for both ranks. */
export const FITNESS_MAX = 120
/** para 3-17b — resident military training sub-cap, inclusive of the category max. */
export const RESIDENT_MAX = { SGT: 110, SSG: 115 } as const
/** para 3-17c — computer-based / correspondence sub-cap, inclusive of the category max. */
export const CORRESPONDENCE_MAX = 90

// ── Weapons qualification ───────────────────────────────────────────────────
// Tables 3-2 (SGT) and 3-3 (SSG). Scorecard forms per para 3-15b.
export interface WeaponSystem {
  id: string
  label: string
  form: string
  /** Highest possible hits, used for the input's max attribute. */
  maxHits: number
}

export const WEAPON_SYSTEMS: WeaponSystem[] = [
  { id: 'rifle', label: 'M16 / M4 / M249', form: 'DA 7801 / DA 7822', maxHits: 40 },
  { id: 'pistol', label: 'M9 / M17 / M18 — pistol', form: 'DA 7814', maxHits: 30 },
  { id: 'pistolValidation', label: 'M9 / M17 / M18 — validation', form: 'DA 7821', maxHits: 40 },
  { id: 'sniper', label: 'M107 / M110 / M2010 — sniper', form: 'DA 7811', maxHits: 200 },
  { id: 'lePistol', label: 'Law enforcement day pistol', form: 'DA 7820-1', maxHits: 50 },
]

const single = (pairs: [number, number][]): Band[] =>
  pairs.map(([hits, points]) => ({ min: hits, max: hits, points }))

/** Table 3-2 — weapons qualification for promotion to SGT. */
export const WEAPONS_SGT: Record<string, Band[]> = {
  rifle: single([
    [40, 160], [39, 153], [38, 145], [37, 138], [36, 130], [35, 123], [34, 115], [33, 108],
    [32, 100], [31, 93], [30, 85], [29, 78], [28, 70], [27, 63], [26, 55], [25, 48],
    [24, 40], [23, 33],
  ]),
  pistol: single([
    [30, 160], [29, 146], [28, 132], [27, 118], [26, 104], [25, 90], [24, 76], [23, 62],
    [22, 48], [21, 33],
  ]),
  pistolValidation: single([
    [40, 160], [39, 152], [38, 144], [37, 136], [36, 128], [35, 120], [34, 112], [33, 104],
    [32, 96], [31, 88], [30, 80], [29, 72], [28, 64], [27, 56], [26, 48], [25, 40], [24, 33],
  ]),
  sniper: [
    { min: 200, max: 200, points: 160 },
    { min: 198, max: 199, points: 153 },
    { min: 196, max: 197, points: 146 },
    { min: 193, max: 195, points: 139 },
    { min: 190, max: 192, points: 132 },
    { min: 187, max: 189, points: 125 },
    { min: 184, max: 186, points: 119 },
    { min: 181, max: 183, points: 112 },
    { min: 178, max: 180, points: 105 },
    { min: 175, max: 177, points: 98 },
    { min: 172, max: 174, points: 91 },
    { min: 169, max: 171, points: 85 },
    { min: 165, max: 168, points: 78 },
    { min: 161, max: 164, points: 71 },
    { min: 157, max: 160, points: 64 },
    { min: 153, max: 156, points: 57 },
    { min: 149, max: 152, points: 50 },
    { min: 145, max: 148, points: 44 },
    { min: 141, max: 144, points: 38 },
    { min: 139, max: 140, points: 33 },
  ],
  lePistol: single([
    [50, 160], [49, 152], [48, 144], [47, 135], [46, 127], [45, 119], [44, 110], [43, 102],
    [42, 94], [41, 85], [40, 77], [39, 69], [38, 60], [37, 52], [36, 43], [35, 33],
  ]),
}

/** Table 3-3 — weapons qualification for promotion to SSG. */
export const WEAPONS_SSG: Record<string, Band[]> = {
  rifle: single([
    [40, 110], [39, 107], [38, 104], [37, 101], [36, 98], [35, 91], [34, 84], [33, 77],
    [32, 70], [31, 63], [30, 56], [29, 52], [28, 48], [27, 44], [26, 40], [25, 36],
    [24, 32], [23, 28],
  ]),
  pistol: single([
    [30, 110], [29, 101], [28, 92], [27, 83], [26, 74], [25, 65], [24, 56], [23, 47],
    [22, 38], [21, 28],
  ]),
  pistolValidation: single([
    [40, 110], [39, 104], [38, 99], [37, 93], [36, 88], [35, 82], [34, 77], [33, 71],
    [32, 65], [31, 60], [30, 55], [29, 50], [28, 46], [27, 41], [26, 37], [25, 32], [24, 28],
  ]),
  sniper: [
    { min: 200, max: 200, points: 110 },
    { min: 198, max: 199, points: 107 },
    { min: 196, max: 197, points: 102 },
    { min: 193, max: 195, points: 97 },
    { min: 190, max: 192, points: 92 },
    { min: 187, max: 189, points: 87 },
    { min: 184, max: 186, points: 82 },
    { min: 181, max: 183, points: 77 },
    { min: 178, max: 180, points: 72 },
    { min: 175, max: 177, points: 67 },
    { min: 172, max: 174, points: 62 },
    { min: 169, max: 171, points: 58 },
    { min: 165, max: 168, points: 54 },
    { min: 161, max: 164, points: 50 },
    { min: 157, max: 160, points: 46 },
    { min: 153, max: 156, points: 42 },
    { min: 149, max: 152, points: 38 },
    { min: 145, max: 148, points: 34 },
    { min: 141, max: 144, points: 30 },
    { min: 139, max: 140, points: 28 },
  ],
  lePistol: single([
    [50, 110], [49, 105], [48, 100], [47, 95], [46, 88], [45, 83], [44, 76], [43, 71],
    [42, 64], [41, 59], [40, 52], [39, 48], [38, 42], [37, 38], [36, 32], [35, 28],
  ]),
}

/**
 * para 3-15a(8) — MOS 31D (CID Special Agent) uses an internal Practical Pistol
 * Score Card. Expert 100-90 hits, Sharpshooter 89-80, Marksman 79-70.
 * New in the 6 March 2026 revision.
 */
export const WEAPONS_31D: Record<Rank, Band[]> = {
  SGT: [
    { min: 90, max: 100, points: 160 },
    { min: 80, max: 89, points: 100 },
    { min: 70, max: 79, points: 40 },
  ],
  SSG: [
    { min: 90, max: 100, points: 110 },
    { min: 80, max: 89, points: 75 },
    { min: 70, max: 79, points: 50 },
  ],
}

/**
 * Table 3-4 — Record Army Fitness Test, aggregate score to promotion points.
 * Identical for SGT and SSG. Maximum 120 points; below 300 scores nothing.
 *
 * This IS the revised table MILPER 25-201 announced for 1 Oct 2025. Some
 * third-party calculators publish a "+10 / +20 / +30" tier scheme for the AFT —
 * that structure does not appear in this regulation and is not used here.
 */
export const AFT_BANDS: Band[] = [
  { min: 500, max: 500, points: 120 },
  { min: 495, max: 499, points: 117 },
  { min: 490, max: 494, points: 114 },
  { min: 485, max: 489, points: 111 },
  { min: 480, max: 484, points: 108 },
  { min: 475, max: 479, points: 105 },
  { min: 470, max: 474, points: 102 },
  { min: 465, max: 469, points: 99 },
  { min: 460, max: 464, points: 96 },
  { min: 455, max: 459, points: 93 },
  { min: 450, max: 454, points: 90 },
  { min: 445, max: 449, points: 87 },
  { min: 440, max: 444, points: 84 },
  { min: 435, max: 439, points: 81 },
  { min: 430, max: 434, points: 78 },
  { min: 425, max: 429, points: 75 },
  { min: 420, max: 424, points: 72 },
  { min: 415, max: 419, points: 69 },
  { min: 410, max: 414, points: 66 },
  { min: 405, max: 409, points: 63 },
  { min: 400, max: 404, points: 60 },
  { min: 395, max: 399, points: 57 },
  { min: 390, max: 394, points: 54 },
  { min: 385, max: 389, points: 51 },
  { min: 380, max: 384, points: 48 },
  { min: 375, max: 379, points: 45 },
  { min: 370, max: 374, points: 42 },
  { min: 365, max: 369, points: 39 },
  { min: 360, max: 364, points: 36 },
  { min: 355, max: 359, points: 33 },
  { min: 350, max: 354, points: 30 },
  { min: 345, max: 349, points: 27 },
  { min: 340, max: 344, points: 24 },
  { min: 335, max: 339, points: 21 },
  { min: 330, max: 334, points: 18 },
  { min: 325, max: 329, points: 15 },
  { min: 320, max: 324, points: 12 },
  { min: 315, max: 319, points: 9 },
  { min: 310, max: 314, points: 6 },
  { min: 305, max: 309, points: 3 },
  { min: 300, max: 304, points: 1 },
]

// ── Awards and decorations (Table 3-5) ──────────────────────────────────────
export interface AwardDef {
  id: string
  label: string
  points: number
  /** Maximum total points from this award, where the reg sets one. */
  capPoints?: number
  note?: string
}

export const AWARDS: AwardDef[] = [
  { id: 'soldiersMedal', label: "Soldier's Medal or higher", points: 35 },
  { id: 'bsmV', label: 'Bronze Star Medal with "V" device', points: 35 },
  { id: 'bsm', label: 'Bronze Star Medal', points: 30 },
  { id: 'purpleHeart', label: 'Purple Heart', points: 30 },
  { id: 'dmsm', label: 'Defense Meritorious Service Medal', points: 25 },
  { id: 'msm', label: 'Meritorious Service Medal', points: 25 },
  { id: 'amV', label: 'Air Medal with "V" device', points: 25 },
  { id: 'arcomV', label: 'Army Commendation Medal with "V" device', points: 25 },
  { id: 'am', label: 'Air Medal', points: 20 },
  { id: 'jscm', label: 'Joint Service Commendation Medal', points: 20 },
  { id: 'arcom', label: 'Army Commendation Medal', points: 20 },
  { id: 'jsam', label: 'Joint Service Achievement Medal', points: 10 },
  { id: 'aam', label: 'Army Achievement Medal', points: 10 },
  { id: 'gcm', label: 'Good Conduct Medal', points: 10 },
  { id: 'arcam', label: 'Army Reserve Components Achievement Medal', points: 10 },
  { id: 'afrm', label: 'Armed Forces Reserve Medal (with or without "M" device)', points: 10 },
  { id: 'movsm', label: 'Military Outstanding Volunteer Service Medal', points: 10 },
  {
    id: 'recruitingRibbon',
    label: 'Army Recruiting Ribbon',
    points: 10,
    capPoints: 40,
    note: 'Table 3-5 note 1: up to 40 points for four awards.',
  },
]

/** para 3-16c — DA Form 2442, 5 points each, maximum 20 points. */
export const COA_POINTS = 5
export const COA_MAX = 20

// ── Badges (Table 3-6) ──────────────────────────────────────────────────────
/**
 * para 3-16b: "Award of a higher-level badge increases a promotion score only
 * by the difference established between the badges ... they are not cumulative."
 * The regulation names these progressive families explicitly: Parachute,
 * Explosive Ordnance Disposal, Recruiter, Diver, Aviation, Free Fall
 * Parachutist, Special Operations Diver, and Technician.
 */
export interface BadgeDef {
  id: string
  label: string
  points: number
}

export interface BadgeGroup {
  id: string
  label: string
  /** Highest tier first. */
  options: BadgeDef[]
}

export const BADGE_GROUPS: BadgeGroup[] = [
  {
    id: 'parachute',
    label: 'Parachute',
    options: [
      { id: 'parachuteMaster', label: 'Master Parachute Badge', points: 20 },
      { id: 'parachuteSenior', label: 'Senior Parachute Badge', points: 15 },
      { id: 'parachuteCombatSenior', label: 'Parachute Combat Badge w/ bronze star (Senior)', points: 15 },
      { id: 'parachuteBasic', label: 'Parachute Badge', points: 10 },
      { id: 'parachuteCombatBasic', label: 'Parachute Combat Badge w/ bronze star (Basic)', points: 10 },
      { id: 'parachuteRigger', label: 'Parachute Rigger Badge', points: 10 },
    ],
  },
  {
    id: 'eod',
    label: 'Explosive Ordnance Disposal',
    options: [
      { id: 'eodMaster', label: 'Master EOD Badge', points: 20 },
      { id: 'eodSenior', label: 'Senior EOD Badge', points: 15 },
      { id: 'eodBasic', label: 'Basic EOD Badge', points: 10 },
    ],
  },
  {
    id: 'recruiter',
    label: 'Recruiter',
    options: [
      { id: 'recruiterMaster', label: 'Master Recruiter Badge', points: 20 },
      { id: 'recruiterGold', label: 'Gold Recruiter Badge', points: 20 },
      { id: 'recruiterBasic', label: 'Basic U.S. Army Recruiter Badge', points: 15 },
    ],
  },
  {
    id: 'diver',
    label: 'Diver',
    options: [
      { id: 'diverFirst', label: 'Divers Badge (First Class)', points: 20 },
      { id: 'diverSalvage', label: 'Divers Badge (Salvage)', points: 15 },
      { id: 'diverSecond', label: 'Divers Badge (Second Class)', points: 10 },
      { id: 'diverScuba', label: 'Divers Badge (Scuba)', points: 10 },
    ],
  },
  {
    id: 'aviation',
    label: 'Aviation',
    options: [
      { id: 'aviationMaster', label: 'Aviation Badge (Master)', points: 20 },
      { id: 'aviationSenior', label: 'Aviation Badge (Senior)', points: 15 },
      { id: 'aviationBasic', label: 'Aviation Badge (Basic)', points: 10 },
    ],
  },
  {
    id: 'freeFall',
    label: 'Military Free Fall Parachutist',
    options: [
      { id: 'freeFallMaster', label: 'Military Free Fall Parachutist Badge (Master)', points: 15 },
      { id: 'freeFallBasic', label: 'Military Free Fall Parachutist Badge (Basic)', points: 10 },
    ],
  },
  {
    id: 'sfDiver',
    label: 'Special Operations Diver',
    options: [
      { id: 'sfDiverSupervisor', label: 'Special Operations Diver Badge (Supervisor)', points: 15 },
      { id: 'sfDiverBasic', label: 'Special Operations Diver Badge (Basic)', points: 10 },
    ],
  },
  {
    id: 'technician',
    label: 'Technician',
    options: [
      { id: 'technicianMaster', label: 'Technician Badge (Master)', points: 20 },
      { id: 'technicianSenior', label: 'Technician Badge (Senior)', points: 15 },
      { id: 'technicianBasic', label: 'Technician Badge (Basic)', points: 10 },
    ],
  },
]

/**
 * Badges the regulation does not place in a progressive family. Each is scored
 * independently.
 *
 * AMBIGUITY FLAGGED: the Army Instructor badges (Basic 15 / Senior 15 /
 * Master 20) and the Space badges (Space 10 / Senior Space 15) are tiered in
 * name but are NOT among the eight families para 3-16b lists as non-cumulative.
 * They are listed individually here, which follows the text literally. A rater
 * may treat them as progressive. Verify against your PPW.
 */
export const STANDALONE_BADGES: BadgeDef[] = [
  { id: 'eib', label: 'Expert Infantryman Badge', points: 60 },
  { id: 'efmb', label: 'Expert Field Medical Badge', points: 60 },
  { id: 'esb', label: 'Expert Soldier Badge', points: 60 },
  { id: 'cib', label: 'Combat Infantryman Badge', points: 30 },
  { id: 'cmb', label: 'Combat Medical Badge', points: 30 },
  { id: 'cab', label: 'Combat Action Badge', points: 30 },
  { id: 'masterGunner', label: 'Master Gunner Badge', points: 20 },
  { id: 'instructorMaster', label: 'Master Army Instructor Badge', points: 20 },
  { id: 'instructorSenior', label: 'Senior Army Instructor Badge', points: 15 },
  { id: 'instructorBasic', label: 'Basic Army Instructor Badge', points: 15 },
  { id: 'presidentialService', label: 'Presidential Service Badge', points: 15 },
  { id: 'vicePresidentService', label: 'Vice President Service Badge', points: 15 },
  { id: 'drillSergeant', label: 'Drill Sergeant Badge', points: 15 },
  { id: 'spaceSenior', label: 'Senior Space Badge', points: 15 },
  { id: 'space', label: 'Space Badge', points: 10 },
  { id: 'pathfinder', label: 'Pathfinder Badge', points: 10 },
  { id: 'airAssault', label: 'Air Assault Badge', points: 10 },
  { id: 'secDefService', label: 'Secretary of Defense Service Badge', points: 10 },
  { id: 'jcsIdentification', label: 'Joint Chiefs of Staff Identification Badge', points: 10 },
  { id: 'armyStaffIdentification', label: 'Army Staff Identification Badge', points: 10 },
  { id: 'tombGuard', label: 'Tomb Guard Identification Badge', points: 10 },
  { id: 'militaryHorseman', label: 'Military Horseman Identification Badge', points: 10 },
  { id: 'driverMechanic', label: 'Driver and Mechanic Badge', points: 10 },
  { id: 'mariner', label: 'Mariner Badge', points: 10 },
  { id: 'mountaineering', label: 'Mountaineering Badge', points: 10 },
]

// ── Airborne Advantage (Table 3-7) ──────────────────────────────────────────
/**
 * para 3-16d: airborne qualified Soldiers assigned to an authorized airborne
 * position (SQI P, S, U, or V in the duty MOS) receive these points "WITHOUT
 * REGARD TO THE MAXIMUM POINT RULES" — i.e. on top of the 800.
 *
 * The 6 March 2026 revision updated this table's criteria.
 */
export const AIRBORNE_ADVANTAGE = [
  { id: 'none', label: 'Not in an airborne position', points: 0 },
  {
    id: 'parachutist',
    label: 'Parachutist in a paid parachute TOE/TDA or code-86 position',
    points: 20,
  },
  {
    id: 'jumpmaster',
    label: 'Jumpmaster (ASI 5W) in a paid parachute TOE/TDA position',
    points: 40,
  },
] as const

export type AirborneStatus = (typeof AIRBORNE_ADVANTAGE)[number]['id']

// ── Military education (para 3-17) ──────────────────────────────────────────
/** para 3-17a — BLC for SGT, ALC for SSG. */
export const PME_GRADUATE_POINTS = 150
export const PME_HONORS = [
  { id: 'none', label: 'No academic honors', points: 0 },
  { id: 'commandants', label: "Commandant's List", points: 20 },
  {
    id: 'distinguished',
    label: 'Distinguished Honor Graduate / Distinguished Leadership Graduate',
    points: 40,
  },
] as const

export type PmeHonors = (typeof PME_HONORS)[number]['id']

/** para 3-17b(1) — 4 points per week of resident training (a week = 40 hours). */
export const RESIDENT_POINTS_PER_WEEK = 4
/** para 3-17b(3) — Ranger, Special Forces, and Sapper qualification courses. */
export const RANGER_SF_SAPPER_POINTS = 40
/** para 3-17c(1) — 1 point per 5 hours of completed correspondence training. */
export const CORRESPONDENCE_HOURS_PER_POINT = 5

// ── Civilian education (para 3-18) ──────────────────────────────────────────
/** para 3-18a — 2 promotion points per semester hour completed. */
export const SEMESTER_HOUR_POINTS = 2
/** para 3-18c — 20 points for completing a degree while on active duty. */
export const DEGREE_POINTS = 20
/** para 3-18e — 10 points per T2COM-approved certification, max 5 / 50 points. */
export const CERTIFICATION_POINTS = 10
export const CERTIFICATION_MAX_COUNT = 5
export const CERTIFICATION_MAX_POINTS = 50
/** para 3-18f — 25 points for a 1/1 DLPT (listening/reading) or 1 speaking OPI. */
export const DLPT_POINTS = 25

// ── HQDA cutoff score indicators ────────────────────────────────────────────
/**
 * Verbatim from the HQDA promotion point cutoff score memorandum
 * (HRC, AHRC-PDV-PE, RN 600-8-19h):
 *   "Note 1: COS of 24 signifies not enough eligible soldiers."
 *   "Note 2: COS of 798 signifies no promotions needed."
 * N/A appears where an MOS has no cutoff published for that rank.
 *
 * This tool ships NO hardcoded cutoff values. HRC publishes new scores every
 * month and any baked-in number would be wrong within weeks.
 */
export const CUTOFF_INDICATORS = [
  { value: '24', meaning: 'Not enough eligible Soldiers — everyone eligible is promoted.' },
  { value: '798', meaning: 'No promotions needed in that MOS this month.' },
  { value: 'N/A', meaning: 'No cutoff published for that MOS at that rank.' },
]
