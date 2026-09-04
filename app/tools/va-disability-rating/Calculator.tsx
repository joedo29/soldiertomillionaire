'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import InfoTip from '@/components/InfoTip'
import {
  calculateCombinedRating,
  LOCATION_LABELS,
  RATING_CHOICES,
  type BodyLocation,
  type Condition,
} from '@/lib/vaCombinedRating'
import {
  vaCompensation,
  RATE_YEAR,
  RATE_EFFECTIVE_DATE,
  COLA_PERCENT,
  VA_RATES_SOURCE_URL,
  DEPENDENTS_MIN_RATING,
  type FamilyStatus,
} from '@/lib/vaDisabilityRates'

const STORAGE_KEY = 'soldier2millionaire:va-rating'
const UNLOCK_KEY = 'soldier2millionaire:va-rating-xlsx-unlocked'

const CFR_425 = 'https://www.ecfr.gov/current/title-38/chapter-I/part-4/subpart-A/section-4.25'
const CFR_426 = 'https://www.ecfr.gov/current/title-38/chapter-I/part-4/subpart-A/section-4.26'
const CFR_414 = 'https://www.ecfr.gov/current/title-38/chapter-I/part-4/subpart-A/section-4.14'

const LOCATION_ORDER: BodyLocation[] = [
  'other',
  'left_arm',
  'right_arm',
  'left_leg',
  'right_leg',
]

const DEFAULT_CONDITIONS: Condition[] = [
  { id: 'c1', name: 'PTSD', rating: 50, location: 'other' },
  { id: 'c2', name: 'Left knee strain', rating: 30, location: 'left_leg' },
  { id: 'c3', name: 'Right knee strain', rating: 20, location: 'right_leg' },
  { id: 'c4', name: 'Tinnitus', rating: 10, location: 'other' },
]

const money = (v: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v)

export default function Calculator() {
  const [conditions, setConditions] = useState<Condition[]>(DEFAULT_CONDITIONS)
  const [familyStatus, setFamilyStatus] = useState<FamilyStatus>('veteran_alone')
  const [additionalChildren, setAdditionalChildren] = useState(0)
  const [dependentParents, setDependentParents] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [nextId, setNextId] = useState(5)

  const [unlocked, setUnlocked] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [emailErr, setEmailErr] = useState('')
  const [building, setBuilding] = useState(false)
  const [buildErr, setBuildErr] = useState('')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const p = JSON.parse(saved)
        if (Array.isArray(p.conditions)) setConditions(p.conditions)
        if (p.familyStatus) setFamilyStatus(p.familyStatus)
        if (typeof p.additionalChildren === 'number') setAdditionalChildren(p.additionalChildren)
        if (typeof p.dependentParents === 'number') setDependentParents(p.dependentParents)
        if (typeof p.nextId === 'number') setNextId(p.nextId)
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
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ conditions, familyStatus, additionalChildren, dependentParents, nextId }),
      )
    } catch {
      // Ignore write failures.
    }
  }, [conditions, familyStatus, additionalChildren, dependentParents, nextId, hydrated])

  const result = useMemo(() => calculateCombinedRating(conditions), [conditions])
  const dependentsActive = result.officialRating >= DEPENDENTS_MIN_RATING
  const monthlyPay = useMemo(
    () =>
      vaCompensation(
        result.officialRating,
        familyStatus,
        dependentsActive ? additionalChildren : 0,
        dependentsActive ? dependentParents : 0,
      ),
    [result.officialRating, familyStatus, additionalChildren, dependentParents, dependentsActive],
  )

  function update(id: string, patch: Partial<Condition>) {
    setConditions((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }
  function addCondition() {
    setConditions((prev) => [
      ...prev,
      { id: `c${nextId}`, name: '', rating: 10, location: 'other' },
    ])
    setNextId((n) => n + 1)
  }
  function removeCondition(id: string) {
    setConditions((prev) => prev.filter((c) => c.id !== id))
  }

  async function downloadWorkbook() {
    setBuilding(true)
    setBuildErr('')
    try {
      const { buildRatingWorkbook } = await import('@/lib/vaRatingWorkbook')
      const blob = await buildRatingWorkbook({
        conditions,
        familyStatus,
        additionalChildren: dependentsActive ? additionalChildren : 0,
        dependentParents: dependentsActive ? dependentParents : 0,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `va-combined-rating-${result.officialRating}percent.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch {
      setBuildErr('Could not build the file. Please try again.')
    } finally {
      setBuilding(false)
    }
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
      try {
        window.localStorage.setItem(UNLOCK_KEY, '1')
      } catch {
        // Unlock is a convenience only.
      }
      setUnlocked(true)
      setShowEmail(false)
      setEmailStatus('idle')
      void downloadWorkbook()
    } catch (err: unknown) {
      setEmailStatus('error')
      setEmailErr(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const activeCount = conditions.filter((c) => c.rating > 0).length

  return (
    <>
      <section className="vr-tool">
        <div className="container vr-grid">
          {/* ── Inputs ── */}
          <div className="vr-panel">
            <div className="section-tag">Your Conditions</div>
            <h2>Add each rated condition.</h2>
            <p className="vr-panel-intro">
              Enter the percentage the VA assigned to each service-connected condition, and
              tag the body location so the bilateral factor can be applied correctly.
            </p>

            <div className="vr-conditions">
              {conditions.length === 0 && (
                <p className="vr-empty-list">
                  No conditions yet. Add one to start.
                </p>
              )}
              {conditions.map((cond, i) => {
                const inGroup =
                  result.bilateralApplies && result.bilateralGroup.some((g) => g.id === cond.id)
                return (
                  <div key={cond.id} className={`vr-cond${inGroup ? ' paired' : ''}`}>
                    <div className="vr-cond-row">
                      <input
                        type="text"
                        className="vr-cond-name"
                        placeholder={`Condition ${i + 1}`}
                        value={cond.name}
                        onChange={(e) => update(cond.id, { name: e.target.value })}
                        aria-label={`Condition ${i + 1} name`}
                      />
                      <button
                        type="button"
                        className="vr-remove"
                        onClick={() => removeCondition(cond.id)}
                        aria-label={`Remove ${cond.name || `condition ${i + 1}`}`}
                      >
                        ×
                      </button>
                    </div>
                    <div className="vr-cond-row">
                      <label className="vr-mini">
                        <span>Rating</span>
                        <select
                          value={cond.rating}
                          onChange={(e) => update(cond.id, { rating: Number(e.target.value) })}
                        >
                          {RATING_CHOICES.map((r) => (
                            <option key={r} value={r}>{r}%</option>
                          ))}
                        </select>
                      </label>
                      <label className="vr-mini vr-mini-wide">
                        <span>Body location</span>
                        <select
                          value={cond.location}
                          onChange={(e) =>
                            update(cond.id, { location: e.target.value as BodyLocation })
                          }
                        >
                          {LOCATION_ORDER.map((loc) => (
                            <option key={loc} value={loc}>{LOCATION_LABELS[loc]}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {inGroup && <span className="vr-paired-flag">Bilateral pair</span>}
                  </div>
                )
              })}
            </div>

            <div className="vr-actions">
              <button type="button" className="btn btn-army" onClick={addCondition}>
                + Add condition
              </button>
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => setConditions([])}
              >
                Clear all
              </button>
            </div>

            <div className="vr-subhead">
              Dependents
              <span className="vr-rate-year">
                {RATE_YEAR} rates, effective {RATE_EFFECTIVE_DATE}
              </span>
            </div>

            <div className={dependentsActive ? '' : 'vr-disabled'}>
              <label className="vr-field">
                <span>Family status</span>
                <select
                  value={familyStatus}
                  disabled={!dependentsActive}
                  onChange={(e) => setFamilyStatus(e.target.value as FamilyStatus)}
                >
                  <option value="veteran_alone">Veteran alone</option>
                  <option value="spouse_only">With spouse</option>
                  <option value="spouse_one_child">With spouse and 1 child</option>
                  <option value="one_child_only">With 1 child only</option>
                </select>
              </label>
              <div className="vr-field-row">
                <label className="vr-field">
                  <span>Additional children</span>
                  <select
                    value={additionalChildren}
                    disabled={!dependentsActive}
                    onChange={(e) => setAdditionalChildren(Number(e.target.value))}
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label className="vr-field">
                  <span>Dependent parents</span>
                  <select
                    value={dependentParents}
                    disabled={!dependentsActive}
                    onChange={(e) => setDependentParents(Number(e.target.value))}
                  >
                    {[0, 1, 2].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
              </div>
              {!dependentsActive && (
                <p className="vr-hint">
                  The VA pays dependent allowances only at {DEPENDENTS_MIN_RATING}% and above.
                  At 10% and 20% the rate is flat.
                </p>
              )}
            </div>
          </div>

          {/* ── Results ── */}
          <div className="vr-results">
            <div className="vr-stats">
              <div className="vr-stat">
                <span>
                  Combined value
                  <InfoTip
                    title="Combined value before conversion"
                    formula="Each pair read from the Combined Ratings Table — a whole number"
                    source="38 CFR § 4.25"
                    href={CFR_425}
                  >
                    This is the running total after every disability has been combined, but
                    <strong> before</strong> converting to a degree divisible by 10. The VA carries
                    a whole number at every step — not a decimal.
                  </InfoTip>
                </span>
                <strong>{result.combinedValue}</strong>
              </div>
              <div className="vr-stat primary">
                <span>
                  Official VA rating
                  <InfoTip
                    title="Conversion to the nearest degree of 10"
                    formula="Done once, at the very end. Values ending in 5 adjust upward."
                    source="38 CFR § 4.25(a)"
                    href={CFR_425}
                  >
                    A combined value of 74 becomes 70%. A combined value of 75 becomes 80%. The
                    conversion happens only once per rating decision, after all disabilities have
                    been combined.
                  </InfoTip>
                </span>
                <strong>{result.officialRating}%</strong>
              </div>
              <div className="vr-stat gold">
                <span>Monthly pay ({RATE_YEAR})</span>
                <strong>{money(monthlyPay)}</strong>
              </div>
            </div>

            {result.bilateralApplies && (
              <div className="vr-callout good">
                <strong>Bilateral factor applied (§ 4.26)</strong>
                <p>
                  {result.bilateralGroup.length} conditions affecting{' '}
                  {result.pairedSets.map((s) => (s === 'arms' ? 'both arms' : 'both legs')).join(' and ')}{' '}
                  combined to <strong>{result.bilateralCombined}</strong>, then 10% of that (
                  {result.bilateralFactorAmount.toFixed(1)}) was added and rounded to{' '}
                  <strong>{result.bilateralWithFactor}</strong>. That value is treated as a single
                  disability for ordering and all further combinations.
                </p>
              </div>
            )}

            {result.methodsDisagree && (
              <div className="vr-callout warn">
                <strong>This is a case where the shortcut method gets it wrong</strong>
                <p>
                  Calculators that combine ratings as decimals and round only at the end would
                  give you <strong>{result.decimalOnlyRating}%</strong> here (
                  {result.decimalOnlyValue.toFixed(2)} rounded). The Combined Ratings Table method
                  the VA actually uses reaches <strong>{result.officialRating}%</strong>. The
                  difference comes from rounding to a whole number at every step, as § 4.25
                  requires.
                </p>
              </div>
            )}

            <div className="vr-breakdown">
              <div className="vr-breakdown-head">
                <h3>Step by step, the way the VA does it</h3>
                <InfoTip
                  title="Reading this table"
                  formula="combined = prior + rating x (100 − prior) / 100, then rounded to a whole number"
                  source="38 CFR § 4.25"
                  href={CFR_425}
                >
                  Each disability is applied against the efficiency you have left. The
                  &ldquo;exact&rdquo; column is the raw arithmetic; the &ldquo;table value&rdquo;
                  column is the whole number the Combined Ratings Table actually contains, and it
                  is that whole number which carries into the next row.
                </InfoTip>
              </div>

              {activeCount === 0 ? (
                <p className="vr-empty-list">Add a condition with a rating above 0% to see the math.</p>
              ) : (
                <div className="vr-table-wrap">
                  <table className="vr-table">
                    <thead>
                      <tr>
                        <th>Step</th>
                        <th>Rating</th>
                        <th>Efficiency left</th>
                        <th>Exact</th>
                        <th>Table value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.steps.map((s, i) => (
                        <tr
                          key={i}
                          className={
                            s.kind === 'bilateral'
                              ? 'vr-row-bi'
                              : s.kind === 'bilateral-factor'
                                ? 'vr-row-factor'
                                : ''
                          }
                        >
                          <td>{s.label}</td>
                          <td>{s.rating === null ? `+${s.loss.toFixed(1)}` : `${s.rating}%`}</td>
                          <td>{s.kind === 'bilateral-factor' ? '—' : `${s.remainingEfficiency}%`}</td>
                          <td>{s.exactValue.toFixed(2)}</td>
                          <td className="vr-table-value">{s.combined}</td>
                        </tr>
                      ))}
                      <tr className="vr-row-final">
                        <td>Convert to nearest degree of 10 (5 rounds up)</td>
                        <td>—</td>
                        <td>—</td>
                        <td>{result.combinedValue}</td>
                        <td className="vr-table-value">{result.officialRating}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Excel */}
            <div className="vr-excel">
              <h3>Take the math with you.</h3>
              <p>
                Download a live Excel workbook: change any rating and the ordering, the bilateral
                factor, the combination chain, the final rating and the pay lookup all
                recalculate. Includes the full {RATE_YEAR} rate table and a notes sheet.
              </p>
              {showEmail ? (
                <form className="vr-excel-form" onSubmit={handleEmailSubmit} noValidate>
                  <p className="vr-excel-gate">Enter your email and the download starts right away.</p>
                  <div className="vr-excel-row">
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
                      {emailStatus === 'loading' ? 'Sending…' : 'Get the Workbook'}
                    </button>
                  </div>
                  {emailStatus === 'error' && <p className="vr-error">{emailErr}</p>}
                  <p className="vr-excel-fine">
                    You&apos;ll also get the free 5-step plan. Unsubscribe anytime.
                  </p>
                </form>
              ) : (
                <div>
                  <button
                    type="button"
                    className="btn btn-gold btn-lg"
                    disabled={building || activeCount === 0}
                    onClick={() => (unlocked ? void downloadWorkbook() : setShowEmail(true))}
                  >
                    {building ? 'Building your file…' : 'Download Interactive Excel'}
                  </button>
                  {buildErr && <p className="vr-error">{buildErr}</p>}
                </div>
              )}
            </div>

            {/* Cross-link */}
            <Link href="/tools/military-retirement" className="vr-crosslink">
              <span className="vr-crosslink-tag">Next step</span>
              <strong>See what this rating means for your retirement income</strong>
              <span className="vr-crosslink-body">
                The Military Retirement Planner uses your rating to model CRDP, the VA waiver, and
                your combined retirement cash flow. →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Scope + disclaimers */}
      <section className="vr-disclaimer-section">
        <div className="container-prose">
          <div className="vr-disclaimer">
            <h3>What this tool is, and what it is not</h3>
            <p>
              <strong>This is an educational estimate, not a VA decision.</strong> The individual
              percentage for each condition is assigned by a VA rater under the{' '}
              <a href="https://www.ecfr.gov/current/title-38/chapter-I/part-4" target="_blank" rel="noopener noreferrer">
                Schedule for Rating Disabilities ↗
              </a>{' '}
              after reviewing your medical evidence. This tool only combines percentages you
              already have.
            </p>

            <h4>Not covered here</h4>
            <ul className="vr-scope-list">
              <li>
                <strong>Special Monthly Compensation (SMC)</strong> — extra payments for things
                like loss of use of a limb or aid and attendance.{' '}
                <a href="https://www.va.gov/disability/compensation-rates/special-monthly-compensation-rates/" target="_blank" rel="noopener noreferrer">
                  SMC rates ↗
                </a>
              </li>
              <li>
                <strong>TDIU</strong> — Individual Unemployability pays at the 100% rate at a lower
                schedular rating when service-connected conditions prevent substantially gainful
                employment.{' '}
                <a href="https://www.va.gov/disability/eligibility/special-claims/unemployability/" target="_blank" rel="noopener noreferrer">
                  TDIU ↗
                </a>
              </li>
              <li>
                <strong>Aid and Attendance and housebound benefits</strong>, and{' '}
                <strong>children over 18 in an approved school program</strong>.
              </li>
              <li>
                <strong>Conditions rated 0%</strong> — service connected but non-compensable. They
                do not raise your combined rating.
              </li>
              <li>
                The § 4.26 exception allowing bilateral disabilities to be combined separately when
                that is more favorable to the veteran — a rater judgment this tool does not make.
              </li>
            </ul>

            <h4>Do not enter overlapping conditions</h4>
            <p>
              The VA prohibits <strong>pyramiding</strong> — rating the same symptom under more
              than one diagnostic code (
              <a href={CFR_414} target="_blank" rel="noopener noreferrer">38 CFR § 4.14 ↗</a>). If
              you enter two conditions that describe the same underlying impairment, this tool will
              return a higher number than the VA would assign.
            </p>

            <h4>Sources</h4>
            <p className="vr-sources">
              <a href={CFR_425} target="_blank" rel="noopener noreferrer">38 CFR § 4.25 — Combined ratings table ↗</a>
              <a href={CFR_426} target="_blank" rel="noopener noreferrer">38 CFR § 4.26 — Bilateral factor ↗</a>
              <a href={VA_RATES_SOURCE_URL} target="_blank" rel="noopener noreferrer">VA compensation rates ↗</a>
              <a href="https://www.va.gov/disability/" target="_blank" rel="noopener noreferrer">File or check a VA claim ↗</a>
            </p>
            <p className="vr-disclaimer-meta">
              Rate table: {RATE_YEAR}, effective {RATE_EFFECTIVE_DATE} ({COLA_PERCENT}% COLA),
              transcribed from va.gov. I am an active-duty soldier, not an accredited VA claims
              agent or attorney. For help with a claim, contact an accredited representative or a
              Veterans Service Organization.
            </p>
          </div>
        </div>
      </section>

      <section className="booking-section">
        <div className="booking-icon">🗓️</div>
        <h2 className="booking-title">Rating Changed?<br />Let&apos;s Talk Money.</h2>
        <p className="booking-sub">
          A rating change moves your whole financial picture. Book a free 30-minute session and
          we&apos;ll work through what it means for your budget and your plan.
        </p>
        <Link href="/book" className="btn btn-gold btn-full btn-lg">Book a Free Session</Link>
        <p className="booking-small">Bring your rating decision letter if you have it.</p>
      </section>
    </>
  )
}
