'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import InfoTip from '@/components/InfoTip'
import {
  calculatePromotionPoints,
  emptyInputs,
  type PromotionInputs,
} from '@/lib/promotionPoints'
import {
  AIRBORNE_ADVANTAGE,
  AWARDS,
  BADGE_GROUPS,
  CATEGORY_MAX,
  CERTIFICATION_MAX_COUNT,
  CORRESPONDENCE_MAX,
  CUTOFF_INDICATORS,
  DATA_VERIFIED,
  FITNESS_MAX,
  HRC_PROMOTIONS_URL,
  PME_HONORS,
  REG_EFFECTIVE,
  REG_PUBLISHED,
  REG_TITLE,
  REG_URL,
  RESIDENT_MAX,
  STANDALONE_BADGES,
  TOTAL_MAX,
  WEAPONS_MAX,
  WEAPON_SYSTEMS,
  type AirborneStatus,
  type PmeHonors,
  type Rank,
} from '@/lib/promotionPointsData'
import { trackLead } from '@/lib/analytics'

const STORAGE_KEY = 'soldier2millionaire:promotion-points'
const UNLOCK_KEY = 'soldier2millionaire:promotion-points-unlocked'

type TabId = 'training' | 'awards' | 'milEd' | 'civEd' | 'cutoff'

const TABS: { id: TabId; label: string; short: string }[] = [
  { id: 'training', label: 'Military training', short: 'Training' },
  { id: 'awards', label: 'Awards & badges', short: 'Awards' },
  { id: 'milEd', label: 'Military education', short: 'Mil Ed' },
  { id: 'civEd', label: 'Civilian education', short: 'Civ Ed' },
  { id: 'cutoff', label: 'Cutoff & review', short: 'Review' },
]

const TAB_CATEGORY: Record<string, TabId> = {
  militaryTraining: 'training',
  awards: 'awards',
  militaryEducation: 'milEd',
  civilianEducation: 'civEd',
}

const num = (v: string): number => {
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : 0
}

export default function Calculator() {
  const [inputs, setInputs] = useState<PromotionInputs>(() => emptyInputs('SGT'))
  const [tab, setTab] = useState<TabId>('training')
  const [hydrated, setHydrated] = useState(false)
  const [cutoff, setCutoff] = useState('')
  const [mosLabel, setMosLabel] = useState('')

  const [unlocked, setUnlocked] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [emailErr, setEmailErr] = useState('')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const p = JSON.parse(saved)
        if (p.inputs) setInputs({ ...emptyInputs(p.inputs.rank ?? 'SGT'), ...p.inputs })
        if (typeof p.cutoff === 'string') setCutoff(p.cutoff)
        if (typeof p.mosLabel === 'string') setMosLabel(p.mosLabel)
      }
      setUnlocked(window.localStorage.getItem(UNLOCK_KEY) === '1')
    } catch {
      // Blocked storage must not break the calculator.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ inputs, cutoff, mosLabel }))
    } catch {
      // Ignore write failures.
    }
  }, [inputs, cutoff, mosLabel, hydrated])

  const result = useMemo(() => calculatePromotionPoints(inputs), [inputs])
  const caps = CATEGORY_MAX[inputs.rank]

  function set<K extends keyof PromotionInputs>(key: K, value: PromotionInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }
  function setAward(id: string, n: number) {
    setInputs((prev) => ({
      ...prev,
      awardCounts: { ...prev.awardCounts, [id]: Math.max(0, n) },
    }))
  }
  function setBadgeGroup(groupId: string, badgeId: string | null) {
    setInputs((prev) => ({
      ...prev,
      badgeGroupSelections: { ...prev.badgeGroupSelections, [groupId]: badgeId },
    }))
  }
  function toggleStandalone(id: string) {
    setInputs((prev) => ({
      ...prev,
      standaloneBadgeIds: prev.standaloneBadgeIds.includes(id)
        ? prev.standaloneBadgeIds.filter((b) => b !== id)
        : [...prev.standaloneBadgeIds, id],
    }))
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailStatus('loading')
    setEmailErr('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      trackLead('tool_army_promotion_points')
      try {
        window.localStorage.setItem(UNLOCK_KEY, '1')
      } catch {
        // Unlock is a convenience only.
      }
      setUnlocked(true)
      setShowEmail(false)
      setEmailStatus('idle')
      window.setTimeout(() => window.print(), 250)
    } catch (err: unknown) {
      setEmailStatus('error')
      setEmailErr(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const cutoffNum = /^\d+$/.test(cutoff.trim()) ? parseInt(cutoff.trim(), 10) : null
  const indicator = CUTOFF_INDICATORS.find(
    (i) => i.value.toLowerCase() === cutoff.trim().toLowerCase(),
  )
  const meetsCutoff = cutoffNum !== null && !indicator ? result.total >= cutoffNum : null
  const gap = cutoffNum !== null && !indicator ? cutoffNum - result.total : null

  const activeWeapon = WEAPON_SYSTEMS.find((w) => w.id === inputs.weaponSystem)

  return (
    <>
      <section className="pp-tool">
        <div className="container">
          {/* ── Rank selector ── */}
          <div className="pp-ranks no-print">
            {(['SGT', 'SSG'] as Rank[]).map((r) => (
              <button
                key={r}
                type="button"
                className={`pp-rank${inputs.rank === r ? ' active' : ''}`}
                onClick={() => set('rank', r)}
                aria-pressed={inputs.rank === r}
              >
                <strong>{r === 'SGT' ? 'To Sergeant' : 'To Staff Sergeant'}</strong>
                <span>{r === 'SGT' ? 'E-4 / CPL → E-5' : 'E-5 → E-6'}</span>
              </button>
            ))}
          </div>

          {/* ── Total ── */}
          <div className="pp-total-card">
            <div className="pp-total-main">
              <span className="pp-total-label">Estimated promotion points</span>
              <strong className="pp-total-value">{result.total}</strong>
              <span className="pp-total-max">
                of {TOTAL_MAX}
                {result.airbornePoints > 0 && ` + ${result.airbornePoints} airborne`}
              </span>
            </div>
            <div className="pp-total-bars">
              {result.categories.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className="pp-minibar no-print"
                  onClick={() => setTab(TAB_CATEGORY[c.key])}
                >
                  <span className="pp-minibar-head">
                    <span>{c.label}</span>
                    <span>
                      {c.points}
                      <em>/{c.max}</em>
                    </span>
                  </span>
                  <span className="pp-minibar-track">
                    <span
                      className={`pp-minibar-fill${c.points >= c.max ? ' maxed' : ''}`}
                      style={{ width: `${Math.min(100, (c.points / c.max) * 100)}%` }}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="pp-tabs no-print" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`pp-tab${tab === t.id ? ' active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <span className="pp-tab-long">{t.label}</span>
                <span className="pp-tab-short">{t.short}</span>
              </button>
            ))}
          </div>

          <div className="pp-panel no-print">
            {/* ─────────── Military training ─────────── */}
            {tab === 'training' && (
              <div className="pp-section">
                <h2>
                  Military training
                  <InfoTip
                    title="Military training category"
                    formula={`Weapons (max ${WEAPONS_MAX[inputs.rank]}) + AFT (max ${FITNESS_MAX}) = ${caps.militaryTraining}`}
                    source={`${REG_TITLE}, para 3-15`}
                    href={REG_URL}
                  >
                    Weapons qualification uses your most recent score with your primary weapon
                    from DTMS. Scores older than 24 months earn nothing. The fitness maximum is
                    120 points for both ranks.
                  </InfoTip>
                </h2>

                <div className="pp-field-row">
                  <label className="pp-field">
                    <span>Weapon system</span>
                    <select
                      value={inputs.weaponSystem}
                      disabled={inputs.is31D}
                      onChange={(e) => set('weaponSystem', e.target.value)}
                    >
                      {WEAPON_SYSTEMS.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.label} ({w.form})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="pp-field">
                    <span>
                      {inputs.is31D ? 'Hits (Practical Pistol Card)' : 'Hits on your scorecard'}
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={inputs.is31D ? 100 : activeWeapon?.maxHits}
                      value={inputs.weaponHits ?? ''}
                      placeholder={inputs.is31D ? 'of 100' : `of ${activeWeapon?.maxHits ?? ''}`}
                      onChange={(e) =>
                        set('weaponHits', e.target.value === '' ? null : num(e.target.value))
                      }
                    />
                  </label>
                </div>

                <label className="pp-check">
                  <input
                    type="checkbox"
                    checked={inputs.is31D}
                    onChange={(e) => set('is31D', e.target.checked)}
                  />
                  <span>
                    I hold MOS 31D (CID Special Agent)
                    <InfoTip
                      title="MOS 31D weapons scoring"
                      formula="SGT: 160 / 100 / 40 · SSG: 110 / 75 / 50 for Expert / Sharpshooter / Marksman"
                      source={`${REG_TITLE}, para 3-15a(8)`}
                      href={REG_URL}
                    >
                      31D Soldiers use an internal Practical Pistol Score Card instead of the
                      standard tables. Expert is 100–90 hits, Sharpshooter 89–80, Marksman 79–70.
                      This rule is new in the 6 March 2026 revision.
                    </InfoTip>
                  </span>
                </label>

                <div className="pp-divider" />

                <label className="pp-field">
                  <span>
                    Record AFT total score (0–500)
                    <InfoTip
                      title="Army Fitness Test points"
                      formula="Aggregate score converts to points on table 3-4. 500 = 120 points; below 300 = 0."
                      source={`${REG_TITLE}, table 3-4`}
                      href={REG_URL}
                    >
                      Enter the <strong>total score off your record AFT scorecard</strong> — that
                      is exactly what the promotion point worksheet uses, so it is always
                      accurate. This tool does not estimate individual events; a per-event
                      estimator would only approximate what your scorecard already tells you
                      exactly.
                    </InfoTip>
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={500}
                    placeholder="e.g. 462"
                    value={inputs.aftScore ?? ''}
                    onChange={(e) =>
                      set('aftScore', e.target.value === '' ? null : num(e.target.value))
                    }
                  />
                  <small>
                    Soldiers with permanent profiles receive 60 points for each waived event
                    (para 3-15c(1)) — enter the resulting total score.
                  </small>
                </label>
              </div>
            )}

            {/* ─────────── Awards ─────────── */}
            {tab === 'awards' && (
              <div className="pp-section">
                <h2>
                  Awards, decorations &amp; achievements
                  <InfoTip
                    title="Awards category"
                    formula={`Maximum ${caps.awards} for ${inputs.rank}`}
                    source={`${REG_TITLE}, para 3-16, tables 3-5 and 3-6`}
                    href={REG_URL}
                  >
                    Multiply each award&apos;s value by how many you hold. Awards from DoD, Joint,
                    or other U.S. uniformed services score the same as the equivalent Army award.
                  </InfoTip>
                </h2>

                <div className="pp-award-grid">
                  {AWARDS.map((a) => (
                    <label className="pp-award" key={a.id}>
                      <span className="pp-award-name">
                        {a.label}
                        <em>{a.points} pts{a.capPoints ? ` · max ${a.capPoints}` : ''}</em>
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={inputs.awardCounts[a.id] ?? 0}
                        onChange={(e) => setAward(a.id, num(e.target.value))}
                      />
                    </label>
                  ))}
                  <label className="pp-award">
                    <span className="pp-award-name">
                      Certificate of Achievement (DA 2442)
                      <em>5 pts · max 20</em>
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={inputs.certificatesOfAchievement}
                      onChange={(e) => set('certificatesOfAchievement', num(e.target.value))}
                    />
                  </label>
                </div>

                <div className="pp-divider" />
                <h3>
                  Badges
                  <InfoTip
                    title="Badges are not cumulative"
                    formula="Higher tier replaces lower — a Master Recruiter Badge is 20 points, not 35"
                    source={`${REG_TITLE}, para 3-16b, table 3-6`}
                    href={REG_URL}
                  >
                    Within a progressive family — Parachute, EOD, Recruiter, Diver, Aviation, Free
                    Fall, Special Operations Diver and Technician — only your highest badge counts.
                    Everything in the second list scores on its own.
                  </InfoTip>
                </h3>

                <div className="pp-field-grid">
                  {BADGE_GROUPS.map((g) => (
                    <label className="pp-field" key={g.id}>
                      <span>{g.label}</span>
                      <select
                        value={inputs.badgeGroupSelections[g.id] ?? ''}
                        onChange={(e) => setBadgeGroup(g.id, e.target.value || null)}
                      >
                        <option value="">None</option>
                        {g.options.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label} ({o.points})
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>

                <div className="pp-badge-list">
                  {STANDALONE_BADGES.map((b) => (
                    <label className="pp-badge" key={b.id}>
                      <input
                        type="checkbox"
                        checked={inputs.standaloneBadgeIds.includes(b.id)}
                        onChange={() => toggleStandalone(b.id)}
                      />
                      <span>
                        {b.label} <em>{b.points}</em>
                      </span>
                    </label>
                  ))}
                </div>

                <div className="pp-divider" />
                <label className="pp-field">
                  <span>
                    Airborne Advantage
                    <InfoTip
                      title="Airborne Advantage is added on top of the 800"
                      formula="20 points parachutist · 40 points jumpmaster (ASI 5W), in a paid parachute position"
                      source={`${REG_TITLE}, para 3-16d, table 3-7`}
                      href={REG_URL}
                    >
                      Airborne qualified Soldiers in an authorized airborne position (SQI P, S, U
                      or V in the duty MOS) receive these points{' '}
                      <strong>&ldquo;without regard to the maximum point rules&rdquo;</strong> —
                      so a total above 800 is legitimate. This table&apos;s criteria were updated
                      in the 6 March 2026 revision.
                    </InfoTip>
                  </span>
                  <select
                    value={inputs.airborne}
                    onChange={(e) => set('airborne', e.target.value as AirborneStatus)}
                  >
                    {AIRBORNE_ADVANTAGE.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}{a.points ? ` (+${a.points})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {/* ─────────── Military education ─────────── */}
            {tab === 'milEd' && (
              <div className="pp-section">
                <h2>
                  Military education
                  <InfoTip
                    title="Military education category"
                    formula={`Maximum ${caps.militaryEducation} for ${inputs.rank}. Resident sub-cap ${RESIDENT_MAX[inputs.rank]}; correspondence sub-cap ${CORRESPONDENCE_MAX}.`}
                    source={`${REG_TITLE}, para 3-17`}
                    href={REG_URL}
                  >
                    The resident and correspondence sub-caps are inclusive of the overall category
                    maximum, not on top of it.
                  </InfoTip>
                </h2>

                <label className="pp-check">
                  <input
                    type="checkbox"
                    checked={inputs.pmeGraduate}
                    onChange={(e) => set('pmeGraduate', e.target.checked)}
                  />
                  <span>
                    Graduated {inputs.rank === 'SGT' ? 'Basic Leaders Course' : 'Advanced Leaders Course'}{' '}
                    <em>+150</em>
                  </span>
                </label>

                <label className="pp-field">
                  <span>Academic honors</span>
                  <select
                    value={inputs.pmeHonors}
                    disabled={!inputs.pmeGraduate}
                    onChange={(e) => set('pmeHonors', e.target.value as PmeHonors)}
                  >
                    {PME_HONORS.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.label}{h.points ? ` (+${h.points})` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="pp-divider" />

                <div className="pp-field-row">
                  <label className="pp-field">
                    <span>
                      Resident training (weeks)
                      <InfoTip
                        title="Resident military training"
                        formula="4 points per week; a week is 40 training hours"
                        source={`${REG_TITLE}, para 3-17b`}
                        href={REG_URL}
                      >
                        ATRRS courses only. No points for PME beyond the graduate award, MOS
                        producing courses, badge producing courses, BCT, AIT, language training,
                        FEMA courses, or anything recorded only on a DA Form 87.
                      </InfoTip>
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={inputs.residentTrainingWeeks || ''}
                      onChange={(e) => set('residentTrainingWeeks', num(e.target.value))}
                    />
                  </label>
                  <label className="pp-field">
                    <span>
                      Correspondence hours
                      <InfoTip
                        title="Computer-based / correspondence training"
                        formula="1 point per 5 completed hours; whole courses only"
                        source={`${REG_TITLE}, para 3-17c`}
                        href={REG_URL}
                      >
                        Only fully completed courses count — no credit for sub-courses, and no
                        duplicate courses.
                      </InfoTip>
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={inputs.correspondenceHours || ''}
                      onChange={(e) => set('correspondenceHours', num(e.target.value))}
                    />
                  </label>
                </div>

                <label className="pp-check">
                  <input
                    type="checkbox"
                    checked={inputs.rangerSfSapper}
                    onChange={(e) => set('rangerSfSapper', e.target.checked)}
                  />
                  <span>
                    Completed Ranger, Special Forces, or Sapper qualification course <em>+40</em>
                  </span>
                </label>
              </div>
            )}

            {/* ─────────── Civilian education ─────────── */}
            {tab === 'civEd' && (
              <div className="pp-section">
                <h2>
                  Civilian education
                  <InfoTip
                    title="Civilian education category"
                    formula={`Maximum ${caps.civilianEducation} for ${inputs.rank}`}
                    source={`${REG_TITLE}, para 3-18`}
                    href={REG_URL}
                  >
                    Credits must come from an institution accredited by a body recognized by the
                    U.S. Department of Education. Continuing education units do not count.
                  </InfoTip>
                </h2>

                <div className="pp-field-row">
                  <label className="pp-field">
                    <span>Semester hours completed</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={inputs.semesterHours || ''}
                      onChange={(e) => set('semesterHours', num(e.target.value))}
                    />
                    <small>2 points each. Quarter/contact hours convert to semester hours.</small>
                  </label>
                  <label className="pp-field">
                    <span>
                      T2COM certifications
                      <InfoTip
                        title="Technical certifications"
                        formula="10 points each, maximum 5 certifications / 50 points"
                        source={`${REG_TITLE}, para 3-18e`}
                        href={REG_URL}
                      >
                        Must be on the T2COM-approved list. Recertifying the same credential does
                        not earn points again.
                      </InfoTip>
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={CERTIFICATION_MAX_COUNT}
                      value={inputs.certifications || ''}
                      onChange={(e) => set('certifications', num(e.target.value))}
                    />
                  </label>
                </div>

                <label className="pp-check">
                  <input
                    type="checkbox"
                    checked={inputs.degreeCompleted}
                    onChange={(e) => set('degreeCompleted', e.target.checked)}
                  />
                  <span>
                    Completed a degree while on active duty <em>+20</em>
                    <InfoTip
                      title="Degree completion"
                      formula="20 points"
                      source={`${REG_TITLE}, para 3-18c`}
                      href={REG_URL}
                    >
                      Competing for SSG, the degree must have been completed while in the rank of
                      SGT. Competing for SGT, it must have been awarded after enlistment and
                      before promotion to SGT.
                    </InfoTip>
                  </span>
                </label>

                <label className="pp-check">
                  <input
                    type="checkbox"
                    checked={inputs.dlpt}
                    onChange={(e) => set('dlpt', e.target.checked)}
                  />
                  <span>
                    DLPT 1/1 or higher, or OPI speaking 1 <em>+25</em>
                    <InfoTip
                      title="Defense Language Proficiency Test"
                      formula="25 points for a minimum 1/1 listening/reading, or 1 speaking on the OPI"
                      source={`${REG_TITLE}, para 3-18f`}
                      href={REG_URL}
                    >
                      Listening and reading must be taken within 30 days of each other. Points
                      stay valid while the proficiency is under one year old as of the compilation
                      month. This paragraph was modified in the 6 March 2026 revision.
                    </InfoTip>
                  </span>
                </label>
              </div>
            )}

            {/* ─────────── Cutoff & review ─────────── */}
            {tab === 'cutoff' && (
              <div className="pp-section">
                <h2>Compare against your MOS cutoff</h2>
                <p className="pp-lede">
                  HRC publishes new cutoff scores every month, by MOS and rank. This tool does not
                  ship cutoff numbers — any value baked into a calculator is stale within weeks.
                  Look yours up and enter it here.
                </p>

                <div className="pp-field-row">
                  <label className="pp-field">
                    <span>Your MOS (optional, for the printout)</span>
                    <input
                      type="text"
                      value={mosLabel}
                      placeholder="e.g. 11B"
                      onChange={(e) => setMosLabel(e.target.value.toUpperCase().slice(0, 8))}
                    />
                  </label>
                  <label className="pp-field">
                    <span>This month&apos;s cutoff for your MOS</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cutoff}
                      placeholder="e.g. 456"
                      onChange={(e) => setCutoff(e.target.value.trim().slice(0, 6))}
                    />
                  </label>
                </div>

                <p className="pp-lede">
                  <a href={HRC_PROMOTIONS_URL} target="_blank" rel="noopener noreferrer">
                    Find the current cutoff scores at HRC ↗
                  </a>{' '}
                  — published monthly in the HQDA promotion point cutoff score memorandum.
                </p>

                {indicator && (
                  <div className="pp-cutoff-result neutral">
                    <strong>Cutoff shown as {cutoff.trim().toUpperCase()}</strong>
                    <p>{indicator.meaning}</p>
                  </div>
                )}
                {meetsCutoff === true && (
                  <div className="pp-cutoff-result good">
                    <strong>At or above the cutoff</strong>
                    <p>
                      Your estimate of {result.total} meets a cutoff of {cutoffNum}. Eligibility
                      still depends on time in grade, time in service, PME and a clean record.
                    </p>
                  </div>
                )}
                {meetsCutoff === false && (
                  <div className="pp-cutoff-result warn">
                    <strong>{gap} points short</strong>
                    <p>
                      Your estimate of {result.total} is below a cutoff of {cutoffNum}. Cutoffs
                      move every month with Army requirements, so this is a snapshot, not a verdict.
                    </p>
                  </div>
                )}

                <div className="pp-indicators">
                  <h3>What the special cutoff values mean</h3>
                  <ul>
                    {CUTOFF_INDICATORS.map((i) => (
                      <li key={i.value}>
                        <strong>{i.value}</strong> — {i.meaning}
                      </li>
                    ))}
                  </ul>
                  <span className="pp-source-note">
                    Verbatim from the HQDA cutoff score memorandum (HRC, AHRC-PDV-PE).
                  </span>
                </div>

                <div className="pp-divider" />

                <h3>Printable S-1 review sheet</h3>
                <p className="pp-lede">
                  A one-page breakdown of every line item, for sitting down with your S-1 and
                  checking it against your worksheet in IPPS-A.
                </p>
                {showEmail ? (
                  <form className="pp-email-form" onSubmit={handleEmailSubmit} noValidate>
                    <p className="pp-email-gate">Enter your email and the print sheet opens.</p>
                    <div className="pp-email-row">
                      <input
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={emailStatus === 'loading'}
                        aria-label="Email address"
                      />
                      <button type="submit" disabled={emailStatus === 'loading' || !email}>
                        {emailStatus === 'loading' ? 'Sending…' : 'Open Print Sheet'}
                      </button>
                    </div>
                    {emailStatus === 'error' && <p className="pp-error">{emailErr}</p>}
                    <p className="pp-email-fine">
                      You&apos;ll also get the free 5-step plan. Unsubscribe anytime.
                    </p>
                  </form>
                ) : (
                  <button
                    type="button"
                    className="btn btn-gold btn-lg"
                    onClick={() => (unlocked ? window.print() : setShowEmail(true))}
                  >
                    Print my review sheet
                  </button>
                )}

                <Link href="/tools/military-retirement" className="tool-crosslink pp-crosslink">
                  <span className="tool-crosslink-tag">The long view</span>
                  <strong>What each promotion is worth at retirement</strong>
                  <span className="tool-crosslink-body">
                    Your pension is based on your highest 36 months of basic pay, so the rank you
                    reach now shows up in every retirement check. Try a different pay grade and
                    High-3 in the Military Retirement Planner to see the difference. →
                  </span>
                </Link>
                <p className="pp-lede pp-crosslink-more">
                  Getting out at the end of this enlistment instead?{' '}
                  <Link href="/tools/terminal-leave">
                    Compare terminal leave with selling your leave back
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>

          {/* ── Printable review sheet ── */}
          <div className="pp-print-sheet" aria-hidden="true">
            <div className="pp-print-head">
              <h2>Promotion Point Review Sheet</h2>
              <p>
                Promotion to <strong>{inputs.rank}</strong>
                {mosLabel && <> · MOS {mosLabel}</>} · estimate only
              </p>
            </div>
            <table className="pp-print-table">
              <tbody>
                {result.categories.map((c) => (
                  <Fragment key={c.key}>
                    <tr className="pp-print-cat">
                      <th colSpan={2}>{c.label}</th>
                      <th>
                        {c.points} / {c.max}
                      </th>
                    </tr>
                    {c.items
                      .filter((i) => i.points > 0)
                      .map((i, n) => (
                        <tr key={`${c.key}-${n}`}>
                          <td colSpan={2}>
                            {i.label}
                            {i.note ? ` (${i.note})` : ''}
                          </td>
                          <td>{i.points}</td>
                        </tr>
                      ))}
                    {c.capped && (
                      <tr>
                        <td colSpan={2}>
                          <em>Category capped — {c.raw} earned, {c.max} allowed</em>
                        </td>
                        <td>−{c.raw - c.max}</td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {result.airbornePoints > 0 && (
                  <tr className="pp-print-cat">
                    <th colSpan={2}>Airborne Advantage (outside the 800)</th>
                    <th>+{result.airbornePoints}</th>
                  </tr>
                )}
                <tr className="pp-print-total">
                  <th colSpan={2}>Estimated total</th>
                  <th>{result.total}</th>
                </tr>
                {cutoff && (
                  <tr>
                    <td colSpan={2}>Cutoff entered for {mosLabel || 'MOS'}</td>
                    <td>{cutoff}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <p className="pp-print-foot">
              Estimate produced from {REG_TITLE}, published {REG_PUBLISHED}, effective{' '}
              {REG_EFFECTIVE}. Not an official computation — your promotion point worksheet in
              IPPS-A is authoritative. soldiertomillionaire.com
            </p>
          </div>
        </div>
      </section>

      {/* ── Sticky mobile score bar ── */}
      <div className="pp-sticky no-print">
        <div className="pp-sticky-inner">
          <span>
            {inputs.rank} · {result.total} pts
          </span>
          <button type="button" onClick={() => setTab('cutoff')}>
            Review →
          </button>
        </div>
      </div>

      {/* ── Disclaimer ── */}
      <section className="pp-disclaimer-section no-print">
        <div className="container-prose">
          <div className="pp-disclaimer">
            <h3>This is a planning estimate, not your official score</h3>
            <p>
              <strong>
                Official promotion points are computed by IPPS-A from the data in your records,
                and your promotion point worksheet in IPPS-A is the authoritative number.
              </strong>{' '}
              If this tool and your PPW disagree, your PPW is right and something in this tool&apos;s
              inputs — or in your records — needs a second look. Take discrepancies to your S-1.
            </p>
            <p>
              Points only count once the supporting data is actually in the system of record.
              Weapons scores come from DTMS, courses from ATRRS, and everything has to be entered
              by the 26th of the board month to affect the following month&apos;s cutoff.
            </p>
            <p>
              This tool does not determine eligibility. Time in grade, time in service, PME
              completion, and your commander&apos;s recommendation all gate promotion separately
              from points.
            </p>

            <h4>Sources</h4>
            <p className="pp-sources">
              <a href={REG_URL} target="_blank" rel="noopener noreferrer">
                {REG_TITLE} — published {REG_PUBLISHED}, effective {REG_EFFECTIVE} ↗
              </a>
              <a href={HRC_PROMOTIONS_URL} target="_blank" rel="noopener noreferrer">
                HRC Enlisted Promotions — monthly cutoff scores ↗
              </a>
              <a href="https://www.army.mil/aft/" target="_blank" rel="noopener noreferrer">
                U.S. Army Fitness Test ↗
              </a>
            </p>
            <p className="pp-disclaimer-meta">
              Point values transcribed from the regulation and verified {DATA_VERIFIED}. I am an
              active-duty Soldier sharing a planning tool, not HRC, not your S-1, and not a
              promotions authority.
            </p>
          </div>
        </div>
      </section>

      <section className="booking-section no-print">
        <div className="booking-icon">🗓️</div>
        <h2 className="booking-title">Points Are Only<br />Half the Fight.</h2>
        <p className="booking-sub">
          Making sergeant changes your pay, your BAH, and what you can do with both. Book a free
          30-minute session and we&apos;ll plan the money side.
        </p>
        <Link href="/book" className="btn btn-gold btn-full btn-lg">Book a Free Session</Link>
        <p className="booking-small">Bring your current points and your timeline.</p>
      </section>
    </>
  )
}
