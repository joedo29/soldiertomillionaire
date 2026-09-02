'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import InfoTip from './InfoTip'
import {
  PAY_GRADES,
  calculateRetirement,
  currency,
  currencyCents,
  validateRetirement,
  CRDP_MIN_RATING,
  VESTING_YEARS,
  type RetirementInputs,
  type RetirementSystem,
} from '@/lib/militaryRetirement'
import {
  RATING_OPTIONS,
  RATE_YEAR,
  RATE_EFFECTIVE_DATE,
  COLA_PERCENT,
  VA_RATES_SOURCE_URL,
  DEPENDENTS_MIN_RATING,
  ratingLabel,
  type FamilyStatus,
} from '@/lib/vaDisabilityRates'
import {
  STATE_TAX,
  STATE_GROUPS,
  LAST_VERIFIED as STATE_VERIFIED,
} from '@/lib/stateMilitaryTax'

const STORAGE_KEY = 'soldier2millionaire:military-retirement'
const UNLOCK_KEY = 'soldier2millionaire:retirement-xlsx-unlocked'

const DEFAULTS = {
  system: 'BRS' as RetirementSystem,
  payGrade: 'E-7',
  yearsOfService: '20',
  high3Monthly: '6000',
  tspContributionPercent: '5',
  tspReturnPercent: '7',
  withdrawalRatePercent: '4',
  payGrowthPercent: '0',
  vaRating: '50',
  vaFamilyStatus: 'veteran_alone' as FamilyStatus,
  vaAdditionalChildren: '0',
  vaDependentParents: '0',
  stateCode: 'TX',
}

type FormState = typeof DEFAULTS

const num = (v: string) => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

export default function Planner() {
  const [form, setForm] = useState<FormState>(DEFAULTS)
  const [hydrated, setHydrated] = useState(false)

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
      if (saved) setForm({ ...DEFAULTS, ...JSON.parse(saved) })
      setUnlocked(window.localStorage.getItem(UNLOCK_KEY) === '1')
    } catch {
      // Blocked storage must not break the planner.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch {
      // Ignore write failures.
    }
  }, [form, hydrated])

  const inputs: RetirementInputs = useMemo(
    () => ({
      payGrade: form.payGrade,
      yearsOfService: Math.round(num(form.yearsOfService)),
      high3Monthly: num(form.high3Monthly),
      tspContributionPercent: num(form.tspContributionPercent),
      tspReturnPercent: num(form.tspReturnPercent),
      withdrawalRatePercent: num(form.withdrawalRatePercent),
      payGrowthPercent: num(form.payGrowthPercent),
      vaRating: Math.round(num(form.vaRating)),
      vaFamilyStatus: form.vaFamilyStatus,
      vaAdditionalChildren: Math.round(num(form.vaAdditionalChildren)),
      vaDependentParents: Math.round(num(form.vaDependentParents)),
      stateCode: form.stateCode,
    }),
    [form],
  )

  const error = useMemo(() => validateRetirement(inputs), [inputs])
  const result = useMemo(() => (error ? null : calculateRetirement(inputs)), [inputs, error])

  const stateInfo = STATE_TAX[form.stateCode]
  const dependentsActive = inputs.vaRating >= DEPENDENTS_MIN_RATING
  const wr = form.withdrawalRatePercent

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function downloadWorkbook() {
    setBuilding(true)
    setBuildErr('')
    try {
      const { buildRetirementWorkbook } = await import('@/lib/militaryRetirementWorkbook')
      const blob = await buildRetirementWorkbook(inputs)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `military-retirement-${form.payGrade}-${form.stateCode}.xlsx`
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

  const brsPrimary = form.system === 'BRS'

  return (
    <>
      <section className="mr-tool">
        <div className="container mr-grid">
          {/* ─────────── Inputs ─────────── */}
          <div className="mr-panel">
            <div className="section-tag">Your Service</div>
            <h2>Run your numbers.</h2>

            <label className="mr-field">
              <span>Your Retirement System</span>
              <select
                value={form.system}
                onChange={(e) => set('system', e.target.value as RetirementSystem)}
              >
                <option value="BRS">Blended Retirement System (BRS)</option>
                <option value="Legacy">Legacy High-3</option>
              </select>
            </label>

            <label className="mr-field">
              <span>Pay Grade at Retirement</span>
              <select value={form.payGrade} onChange={(e) => set('payGrade', e.target.value)}>
                {Object.entries(PAY_GRADES).map(([group, grades]) => (
                  <optgroup key={group} label={group}>
                    {grades.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <label className="mr-field">
              <span>
                Years of Service: <strong>{inputs.yearsOfService}</strong>
              </span>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={form.yearsOfService}
                onChange={(e) => set('yearsOfService', e.target.value)}
              />
              <small>
                {inputs.yearsOfService >= VESTING_YEARS
                  ? 'Vested — eligible for a defined pension.'
                  : `Not vested. ${VESTING_YEARS - inputs.yearsOfService} more years needed for any pension.`}
              </small>
            </label>

            <label className="mr-field">
              <span>High-3 Average Monthly Base Pay ($)</span>
              <input
                type="number"
                inputMode="numeric"
                value={form.high3Monthly}
                onChange={(e) => set('high3Monthly', e.target.value)}
              />
              <small>Average of your highest 36 months of basic pay — not BAH or BAS.</small>
            </label>

            <div className="mr-subhead">TSP Projection</div>

            <label className="mr-field">
              <span>
                Personal TSP Contribution: <strong>{form.tspContributionPercent}%</strong>
              </span>
              <input
                type="range"
                min={0}
                max={90}
                step={1}
                value={form.tspContributionPercent}
                onChange={(e) => set('tspContributionPercent', e.target.value)}
              />
            </label>

            <div className="mr-field-row">
              <label className="mr-field">
                <span>Annual Return (%)</span>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={form.tspReturnPercent}
                  onChange={(e) => set('tspReturnPercent', e.target.value)}
                />
              </label>
              <label className="mr-field mr-field-highlight">
                <span>Withdrawal Rate (%)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  inputMode="decimal"
                  value={form.withdrawalRatePercent}
                  onChange={(e) => set('withdrawalRatePercent', e.target.value)}
                />
              </label>
            </div>

            <label className="mr-field">
              <span>
                Annual Base Pay Growth: <strong>{form.payGrowthPercent}%</strong>
              </span>
              <input
                type="range"
                min={0}
                max={6}
                step={0.5}
                value={form.payGrowthPercent}
                onChange={(e) => set('payGrowthPercent', e.target.value)}
              />
              <small>
                Leave at 0% for the simple model. Set ~3% to reflect a career where early
                pay was lower than your High-3.
              </small>
            </label>

            <div className="mr-subhead">
              VA Disability
              <span className="mr-rate-year">
                {RATE_YEAR} rates, effective {RATE_EFFECTIVE_DATE}
              </span>
            </div>

            <label className="mr-field">
              <span>Disability Rating</span>
              <select value={form.vaRating} onChange={(e) => set('vaRating', e.target.value)}>
                {RATING_OPTIONS.map((r) => (
                  <option key={r} value={r}>{ratingLabel(r)}</option>
                ))}
              </select>
            </label>

            <div className={dependentsActive ? '' : 'mr-disabled'}>
              <label className="mr-field">
                <span>Family Status</span>
                <select
                  value={form.vaFamilyStatus}
                  disabled={!dependentsActive}
                  onChange={(e) => set('vaFamilyStatus', e.target.value as FamilyStatus)}
                >
                  <option value="veteran_alone">Veteran alone</option>
                  <option value="spouse_only">With spouse</option>
                  <option value="spouse_one_child">With spouse and 1 child</option>
                  <option value="one_child_only">With 1 child only</option>
                </select>
              </label>

              <div className="mr-field-row">
                <label className="mr-field">
                  <span>Additional Children</span>
                  <select
                    value={form.vaAdditionalChildren}
                    disabled={!dependentsActive}
                    onChange={(e) => set('vaAdditionalChildren', e.target.value)}
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <label className="mr-field">
                  <span>Dependent Parents</span>
                  <select
                    value={form.vaDependentParents}
                    disabled={!dependentsActive}
                    onChange={(e) => set('vaDependentParents', e.target.value)}
                  >
                    {[0, 1, 2].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
              </div>
              {!dependentsActive && (
                <p className="mr-hint">
                  The VA pays dependent allowances only at {DEPENDENTS_MIN_RATING}% and above.
                  Ratings of 10% and 20% are a flat amount.
                </p>
              )}
            </div>

            <div className="mr-subhead">State of Legal Residence</div>
            <label className="mr-field">
              <span>State</span>
              <select value={form.stateCode} onChange={(e) => set('stateCode', e.target.value)}>
                {STATE_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.codes.map((code) => (
                      <option key={code} value={code}>
                        {STATE_TAX[code].name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            {stateInfo?.note && (
              <p className={`mr-state-note${stateInfo.conditional ? ' conditional' : ''}`}>
                {stateInfo.conditional && <strong>Check your eligibility. </strong>}
                {stateInfo.note}
              </p>
            )}

            {error && <p className="mr-error">{error.message}</p>}
          </div>

          {/* ─────────── Results ─────────── */}
          <div className="mr-results">
            {result ? (
              <>
                <div className="mr-summary-grid">
                  <div className={`mr-stat${brsPrimary ? '' : ' primary'}`}>
                    <span>Legacy High-3 — Net Monthly</span>
                    <strong>{currency(result.legacy.netMonthly)}</strong>
                  </div>
                  <div className={`mr-stat${brsPrimary ? ' primary' : ''}`}>
                    <span>BRS — Net Monthly</span>
                    <strong>{currency(result.brs.netMonthly)}</strong>
                  </div>
                </div>

                <div
                  className={`mr-vesting${result.isVested ? ' vested' : ' unvested'}`}
                >
                  <strong>
                    {result.isVested
                      ? `Vested at ${inputs.yearsOfService} years of service`
                      : `Not vested — ${inputs.yearsOfService} of ${VESTING_YEARS} years`}
                  </strong>
                  <p>
                    {result.isVested
                      ? 'You qualify for a defined-benefit pension for life, indexed for inflation.'
                      : 'Separating before 20 years pays $0 pension under both systems. Your TSP balance is still yours, and VA compensation is unaffected.'}
                  </p>
                </div>

                {/* CRDP / waiver explainer */}
                {result.isVested && inputs.vaRating > 0 && (
                  <div className={`mr-crdp${result.crdpApplies ? ' good' : ' warn'}`}>
                    <strong>
                      {result.crdpApplies
                        ? `CRDP applies — full concurrent receipt at ${inputs.vaRating}%`
                        : `VA waiver applies at ${inputs.vaRating}%`}
                    </strong>
                    <p>
                      {result.crdpApplies ? (
                        <>
                          At {CRDP_MIN_RATING}% or higher you receive your full retired pay
                          <em> and</em> full VA compensation. The VA portion is tax-free.
                        </>
                      ) : (
                        <>
                          Below {CRDP_MIN_RATING}%, retired pay is reduced dollar-for-dollar by
                          your VA compensation — {currencyCents(result.legacy.vaWaiver)} of Legacy
                          retired pay is waived. Your gross income does not go up; the benefit is
                          that the waived portion becomes tax-free.
                        </>
                      )}
                    </p>
                  </div>
                )}

                <div className="mr-table-wrap">
                  <table className="mr-table">
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Legacy High-3</th>
                        <th>BRS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          Pension Multiplier
                          <InfoTip
                            title="Pension multiplier and the 20-year cliff"
                            formula="Legacy: 2.5% x YOS  |  BRS: 2.0% x YOS  (20 YOS required)"
                            source="10 U.S.C. §§ 1409, 1401a"
                          >
                            Regular active-duty retirement requires 20 years of qualifying
                            service. Below that the pension is $0 under both systems — there is
                            no partial or prorated pension. BRS trades the lower 2.0% multiplier
                            for government TSP contributions you keep even if you separate early.
                          </InfoTip>
                        </td>
                        <td>{result.isVested ? '2.5% / year' : '—'}</td>
                        <td>{result.isVested ? '2.0% / year' : '—'}</td>
                      </tr>

                      <tr>
                        <td>
                          Gross Monthly Pension
                          <InfoTip
                            title="Gross monthly pension"
                            formula="IF(YOS >= 20, Multiplier x YOS x High-3, $0)"
                            source="DoD FMR Volume 7B"
                          >
                            Based on the average of your highest 36 consecutive months of basic
                            pay. This figure is before any VA waiver and before taxes.
                          </InfoTip>
                        </td>
                        <td>{currency(result.legacy.grossPension)}</td>
                        <td>{currency(result.brs.grossPension)}</td>
                      </tr>

                      {result.waiverApplies && (
                        <tr className="mr-row-negative">
                          <td>
                            Less: VA Waiver
                            <InfoTip
                              title="CRDP vs the VA waiver"
                              formula="Rating >= 50%: no offset  |  Rating 10-40%: retired pay reduced by VA pay"
                              source="10 U.S.C. § 1414"
                              href="https://www.dfas.mil/RetiredMilitary/disability/crdp/"
                            >
                              Concurrent Retirement and Disability Pay (CRDP) restores full
                              concurrent receipt for 20-year retirees rated {CRDP_MIN_RATING}% or
                              higher. Below {CRDP_MIN_RATING}%, the law requires you to waive
                              retired pay dollar-for-dollar to receive VA compensation. Your total
                              gross stays the same — what changes is that the waived portion is
                              tax-free. Veterans with combat-related conditions may instead
                              qualify for CRSC, which this tool does not model.
                            </InfoTip>
                          </td>
                          <td>−{currency(result.legacy.vaWaiver)}</td>
                          <td>−{currency(result.brs.vaWaiver)}</td>
                        </tr>
                      )}

                      {result.waiverApplies && (
                        <tr>
                          <td>Taxable Retired Pay</td>
                          <td>{currency(result.legacy.taxablePension)}</td>
                          <td>{currency(result.brs.taxablePension)}</td>
                        </tr>
                      )}

                      <tr>
                        <td>
                          Government TSP Contribution
                          <InfoTip
                            title="BRS government contributions"
                            formula="1% automatic + 100% of first 3% + 50% of next 2% = 5% max"
                            source="Federal Retirement Thrift Investment Board"
                          >
                            Under BRS the government adds 1% of basic pay automatically, then
                            matches your contributions: dollar-for-dollar on the first 3% and 50
                            cents on the next 2%. Contributing 5% captures the full 5% government
                            contribution. Legacy members may contribute to the TSP but receive no
                            government contribution or match at all.
                          </InfoTip>
                        </td>
                        <td>0% (no match)</td>
                        <td>{result.brs.govContributionPercent.toFixed(1)}%</td>
                      </tr>

                      <tr>
                        <td>
                          Projected TSP Balance
                          <InfoTip
                            title="TSP projection — simplified"
                            formula="Annual contribution x (1 + return)^years, summed"
                            source="Educational projection, not a TSP statement"
                          >
                            With pay growth at 0% this applies your High-3 pay to every
                            contribution year, which <strong>overstates early-career
                            contributions</strong> — a young service member contributed on much
                            lower pay. Setting a growth rate walks pay backwards from your High-3
                            so early years contribute less, which is closer to reality. It also
                            ignores TSP contribution limits, the Roth/traditional split, lump-sum
                            options, and sequence-of-returns risk. Your TSP is portable and vests
                            after 2 years of service regardless of the 20-year pension cliff.
                          </InfoTip>
                        </td>
                        <td>{currency(result.legacy.tspBalance)}</td>
                        <td>{currency(result.brs.tspBalance)}</td>
                      </tr>

                      <tr>
                        <td>
                          TSP Monthly Draw ({wr}%)
                          <InfoTip
                            title={`Monthly draw at ${wr}%`}
                            formula={`(Balance x ${wr}%) / 12`}
                            source="Withdrawal rate is your input, not a guarantee"
                          >
                            A withdrawal rate is a planning assumption about how much you can
                            take each year without exhausting the balance. 4% is a common
                            starting point from US historical data, but it is not a rule and not
                            a promise. Lower it for a longer retirement or a more conservative
                            plan.
                          </InfoTip>
                        </td>
                        <td>+{currency(result.legacy.tspMonthlyDraw)}</td>
                        <td>+{currency(result.brs.tspMonthlyDraw)}</td>
                      </tr>

                      <tr>
                        <td>
                          VA Disability (tax-free)
                          <InfoTip
                            title={`VA compensation — ${RATE_YEAR} rates`}
                            formula="Statutory rate by rating + dependent allowances"
                            source={`va.gov — effective ${RATE_EFFECTIVE_DATE} (${COLA_PERCENT}% COLA)`}
                            href={VA_RATES_SOURCE_URL}
                          >
                            VA compensation is exempt from federal and state income tax. Ratings
                            of 10% and 20% pay a flat amount; dependent allowances for a spouse,
                            children, or dependent parents begin at 30%. Paid regardless of years
                            served.
                          </InfoTip>
                        </td>
                        <td className="mr-positive">+{currency(result.vaMonthly)}</td>
                        <td className="mr-positive">+{currency(result.vaMonthly)}</td>
                      </tr>

                      <tr>
                        <td>
                          State Tax ({form.stateCode})
                          <InfoTip
                            title="State income tax on retired pay"
                            formula="MAX(0, taxable retired pay − exclusion) x effective rate"
                            source={`State data last verified ${STATE_VERIFIED}`}
                          >
                            Applied only to retired pay you actually receive — VA compensation is
                            exempt from state income tax everywhere, and any pay waived under the
                            VA offset is replaced by tax-free VA money. This uses a single
                            approximate effective rate rather than real brackets, so treat it as
                            a ballpark. Several partial-exclusion states also gate the break on
                            age or income.
                          </InfoTip>
                        </td>
                        <td className="mr-negative">
                          {result.legacy.stateTaxMonthly > 0
                            ? `−${currency(result.legacy.stateTaxMonthly)}`
                            : '$0'}
                        </td>
                        <td className="mr-negative">
                          {result.brs.stateTaxMonthly > 0
                            ? `−${currency(result.brs.stateTaxMonthly)}`
                            : '$0'}
                        </td>
                      </tr>

                      <tr className="mr-row-total">
                        <td>
                          Net Estimated Monthly
                          <InfoTip
                            title="Net monthly estimate"
                            formula="Taxable retired pay + TSP draw + VA compensation − state tax"
                            source="Excludes federal tax, SBP premiums, CRSC"
                          >
                            This is estimated monthly cash flow, not a paycheck. It leaves out
                            federal income tax, Survivor Benefit Plan premiums, TRICARE costs,
                            and any CRSC entitlement. It also assumes you start drawing the TSP
                            immediately, which most retirees do not do at 38.
                          </InfoTip>
                        </td>
                        <td>{currency(result.legacy.netMonthly)}</td>
                        <td>{currency(result.brs.netMonthly)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Composition bars */}
                <div className="mr-bars">
                  {(
                    [
                      ['Legacy High-3', result.legacy],
                      ['BRS', result.brs],
                    ] as const
                  ).map(([label, sys]) => {
                    const max = Math.max(result.legacy.netMonthly, result.brs.netMonthly, 1)
                    const pct = (v: number) => `${Math.max(0, (v / max) * 100)}%`
                    return (
                      <div className="mr-bar-group" key={label}>
                        <div className="mr-bar-label">
                          <span>{label}</span>
                          <span>{currency(sys.netMonthly)}</span>
                        </div>
                        <div className="mr-bar">
                          <div
                            className="mr-seg pension"
                            style={{ width: pct(sys.taxablePension - sys.stateTaxMonthly) }}
                            title="Retired pay after state tax"
                          />
                          <div
                            className="mr-seg tsp"
                            style={{ width: pct(sys.tspMonthlyDraw) }}
                            title="TSP draw"
                          />
                          <div
                            className="mr-seg va"
                            style={{ width: pct(sys.vaMonthly) }}
                            title="VA compensation"
                          />
                        </div>
                      </div>
                    )
                  })}
                  <div className="mr-legend">
                    <span><i className="pension" /> Retired pay (after tax)</span>
                    <span><i className="tsp" /> TSP draw ({wr}%)</span>
                    <span><i className="va" /> VA (tax-free)</span>
                  </div>
                </div>

                {/* Excel export */}
                <div className="mr-excel">
                  <h3>Take the whole model with you.</h3>
                  <p>
                    Download a live Excel workbook with your numbers filled in — every output is
                    a formula, including the 20-year cliff, the CRDP/waiver branch, the BRS
                    match, and your {wr}% withdrawal rate. Includes the full {RATE_YEAR} VA rate
                    table and the state tax table on their own sheets.
                  </p>

                  {showEmail ? (
                    <form className="mr-excel-form" onSubmit={handleEmailSubmit} noValidate>
                      <p className="mr-excel-gate">
                        Enter your email and the download starts right away.
                      </p>
                      <div className="mr-excel-row">
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
                      {emailStatus === 'error' && <p className="mr-error">{emailErr}</p>}
                      <p className="mr-excel-fine">
                        You&apos;ll also get the free 5-step plan. Unsubscribe anytime.
                      </p>
                    </form>
                  ) : (
                    <div>
                      <button
                        type="button"
                        className="btn btn-gold btn-lg"
                        disabled={building}
                        onClick={() => (unlocked ? void downloadWorkbook() : setShowEmail(true))}
                      >
                        {building ? 'Building your file…' : 'Download Interactive Excel'}
                      </button>
                      {buildErr && <p className="mr-error">{buildErr}</p>}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="mr-empty">
                <p>Fix the highlighted input to see your comparison.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mr-disclaimer-section">
        <div className="container-prose">
          <div className="mr-disclaimer">
            <h3>Read this before you decide anything</h3>
            <p>
              <strong>
                This is an educational estimate, not financial, tax, or legal advice.
              </strong>{' '}
              I am an active-duty soldier who built this to help people think clearly about the
              numbers — I am not a licensed financial advisor, a tax professional, or a
              representative of DoD, DFAS, or the VA.
            </p>
            <p>
              Real retired pay depends on your exact High-3, creditable service, retirement type
              (regular, Reserve/Guard point-based, TERA, disability), Survivor Benefit Plan
              elections, federal income tax, and any CRSC entitlement. None of that is modelled
              here. The state tax figures use a single approximate effective rate rather than
              real brackets.
            </p>
            <p>
              Verify your own numbers before making a decision:{' '}
              <a href="https://www.dfas.mil/RetiredMilitary/" target="_blank" rel="noopener noreferrer">
                DFAS Retired Military ↗
              </a>
              {' · '}
              <a href={VA_RATES_SOURCE_URL} target="_blank" rel="noopener noreferrer">
                VA compensation rates ↗
              </a>
              {' · '}
              <a href="https://www.dfas.mil/RetiredMilitary/disability/crdp/" target="_blank" rel="noopener noreferrer">
                DFAS CRDP ↗
              </a>
              {' · '}
              <a href="https://www.tsp.gov/" target="_blank" rel="noopener noreferrer">
                TSP.gov ↗
              </a>
            </p>
            <p className="mr-disclaimer-meta">
              VA rates: {RATE_YEAR}, effective {RATE_EFFECTIVE_DATE} ({COLA_PERCENT}% COLA).
              State tax data last verified {STATE_VERIFIED}.
            </p>
          </div>
        </div>
      </section>

      <section className="booking-section">
        <div className="booking-icon">🗓️</div>
        <h2 className="booking-title">Deciding Whether<br />To Stay for 20?</h2>
        <p className="booking-sub">
          The pension is only part of the math. Book a free 30-minute session and we&apos;ll walk
          through your actual numbers together.
        </p>
        <Link href="/book" className="btn btn-gold btn-full btn-lg">Book a Free Session</Link>
        <p className="booking-small">We start with your service record, not a template.</p>
      </section>
    </>
  )
}
