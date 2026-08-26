'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  TERM_OPTIONS,
  calculate,
  currency,
  validate,
  type MortgageInputs,
} from '@/lib/mortgage'

// Recharts measures its container on mount, so keep it out of the server render.
const PayoffChart = dynamic(() => import('./PayoffChart'), {
  ssr: false,
  loading: () => <div className="mp-chart mp-chart-loading">Loading chart…</div>,
})

const STORAGE_KEY = 'soldier2millionaire:mortgage-payoff'
const UNLOCK_KEY = 'soldier2millionaire:mortgage-xlsx-unlocked'

const DEFAULTS = {
  homePrice: '400000',
  downPayment: '80000',
  annualRate: '6.5',
  termYears: '30',
  annualTax: '4800',
  annualInsurance: '1200',
  extraPrincipal: '0',
}

type FormState = typeof DEFAULTS

function toNumber(value: string): number {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

export default function Calculator() {
  const [form, setForm] = useState<FormState>(DEFAULTS)
  const [hydrated, setHydrated] = useState(false)

  // Excel download state
  const [unlocked, setUnlocked] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [emailErr, setEmailErr] = useState('')
  const [building, setBuilding] = useState(false)
  const [buildErr, setBuildErr] = useState('')

  // Restore prior inputs, matching the MVP's localStorage behavior.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) setForm({ ...DEFAULTS, ...JSON.parse(saved) })
      setUnlocked(window.localStorage.getItem(UNLOCK_KEY) === '1')
    } catch {
      // A blocked localStorage should not stop the calculator working.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch {
      // Ignore write failures (private mode, storage full).
    }
  }, [form, hydrated])

  const inputs: MortgageInputs = useMemo(
    () => ({
      homePrice: toNumber(form.homePrice),
      downPayment: toNumber(form.downPayment),
      annualRate: toNumber(form.annualRate),
      termYears: toNumber(form.termYears) || 30,
      annualTax: toNumber(form.annualTax),
      annualInsurance: toNumber(form.annualInsurance),
      extraPrincipal: toNumber(form.extraPrincipal),
    }),
    [form],
  )

  const error = useMemo(() => validate(inputs), [inputs])
  const result = useMemo(() => (error ? null : calculate(inputs)), [inputs, error])

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function downloadWorkbook() {
    setBuilding(true)
    setBuildErr('')
    try {
      const { buildMortgageWorkbook } = await import('@/lib/mortgageWorkbook')
      const blob = await buildMortgageWorkbook(inputs)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mortgage-payoff-calculator.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      // Give the browser a beat to start the download before revoking.
      window.setTimeout(() => URL.revokeObjectURL(url), 2000)
    } catch {
      setBuildErr('Could not build the file. Please try again.')
    } finally {
      setBuilding(false)
    }
  }

  function handleDownloadClick() {
    if (unlocked) {
      void downloadWorkbook()
    } else {
      setShowEmail(true)
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
        // Unlock is a convenience; downloading still proceeds.
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

  return (
    <>
      <section className="mp-tool">
        <div className="container mp-grid">
          {/* ── Inputs ── */}
          <div className="mp-panel">
            <div className="section-tag">Your Numbers</div>
            <h2>Run the loan.</h2>

            <label className="mp-field">
              <span>Home Price ($)</span>
              <input
                type="number"
                inputMode="numeric"
                value={form.homePrice}
                onChange={(e) => set('homePrice', e.target.value)}
              />
            </label>

            <label className="mp-field">
              <span>Down Payment ($)</span>
              <input
                type="number"
                inputMode="numeric"
                value={form.downPayment}
                onChange={(e) => set('downPayment', e.target.value)}
              />
            </label>

            <label className="mp-field">
              <span>Interest Rate (%)</span>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={form.annualRate}
                onChange={(e) => set('annualRate', e.target.value)}
              />
            </label>

            <label className="mp-field">
              <span>Loan Term</span>
              <select
                value={form.termYears}
                onChange={(e) => set('termYears', e.target.value)}
              >
                {TERM_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}-Year Fixed
                  </option>
                ))}
              </select>
            </label>

            <label className="mp-field">
              <span>Annual Property Tax ($)</span>
              <input
                type="number"
                inputMode="numeric"
                value={form.annualTax}
                onChange={(e) => set('annualTax', e.target.value)}
              />
            </label>

            <label className="mp-field">
              <span>Annual Home Insurance ($)</span>
              <input
                type="number"
                inputMode="numeric"
                value={form.annualInsurance}
                onChange={(e) => set('annualInsurance', e.target.value)}
              />
            </label>

            <label className="mp-field mp-field-highlight">
              <span>Extra Monthly Principal ($)</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="e.g. 200"
                value={form.extraPrincipal}
                onChange={(e) => set('extraPrincipal', e.target.value)}
              />
              <small>This is the number that changes everything.</small>
            </label>

            {error && <p className="mp-error">{error.message}</p>}

            <p className="mp-note">
              Everything runs in your browser and saves to this device only. Educational,
              not financial advice.
            </p>
          </div>

          {/* ── Results ── */}
          <div className="mp-results">
            {result ? (
              <>
                <div className="mp-summary">
                  <div className="mp-summary-label">Total Monthly Outflow</div>
                  <div className="mp-summary-amount">
                    {currency(result.totalMonthlyOutflow)}
                  </div>

                  <table className="mp-breakdown">
                    <tbody>
                      <tr>
                        <td>Principal &amp; Interest</td>
                        <td>{currency(result.monthlyPI)}</td>
                      </tr>
                      <tr>
                        <td>Property Taxes</td>
                        <td>{currency(result.monthlyTax)}</td>
                      </tr>
                      <tr>
                        <td>Home Insurance</td>
                        <td>{currency(result.monthlyInsurance)}</td>
                      </tr>
                      <tr>
                        <td>Extra Principal</td>
                        <td>{currency(result.extraPrincipal)}</td>
                      </tr>
                      <tr className="mp-row-divider">
                        <td>Actual Payoff Timeline</td>
                        <td>{result.payoffYears} Years</td>
                      </tr>
                      <tr>
                        <td>Total Interest Paid (Lifetime)</td>
                        <td className="mp-negative">
                          {currency(result.totalInterestPaid)}
                        </td>
                      </tr>
                      <tr className="mp-row-saved">
                        <td>Total Interest Saved</td>
                        <td className="mp-positive">{currency(result.interestSaved)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mp-snapshot">
                  <div className="mp-snapshot-label">15-Year vs 30-Year Snapshot</div>
                  <table className="mp-breakdown mp-snapshot-table">
                    <thead>
                      <tr>
                        <th>Term</th>
                        <th>Monthly P&amp;I</th>
                        <th>Total Interest</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>30-Year Base</td>
                        <td>{currency(result.comparison30.monthlyPI)}</td>
                        <td>{currency(result.comparison30.totalInterest)}</td>
                      </tr>
                      <tr>
                        <td>15-Year Base</td>
                        <td>{currency(result.comparison15.monthlyPI)}</td>
                        <td>{currency(result.comparison15.totalInterest)}</td>
                      </tr>
                      <tr className="mp-row-divider">
                        <td>Difference</td>
                        <td className="mp-negative">
                          +{currency(result.diffMonthlyPI)}/mo
                        </td>
                        <td className="mp-positive">
                          {currency(result.diffTotalInterest)} saved
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="mp-snapshot-note">
                    Compares base loans only — excludes extra principal, taxes, and insurance.
                  </p>
                </div>
              </>
            ) : (
              <div className="mp-empty">
                <p>Fix the highlighted input to see your results.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {result && (
        <section className="mp-viz">
          <div className="container">
            <div className="section-tag">Projection</div>
            <h2 className="mp-viz-head">Balance vs interest, year by year.</h2>
            <PayoffChart data={result.chartPoints} />

            <div className="mp-table-wrap">
              <table className="mp-amort">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearRows.map((row) => (
                    <tr key={row.year}>
                      <td>{row.year}</td>
                      <td>{currency(row.principal)}</td>
                      <td>{currency(row.interest)}</td>
                      <td>{currency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Excel download ── */}
            <div className="mp-excel">
              <div className="mp-excel-copy">
                <h3>Take it with you.</h3>
                <p>
                  Download a real Excel workbook with your numbers already filled in —
                  live formulas throughout, so you can change the rate, the term, or the
                  extra payment and watch everything recalculate. Includes the full
                  amortization schedule and the 15-vs-30 comparison.
                </p>
              </div>

              {showEmail ? (
                <form className="mp-excel-form" onSubmit={handleEmailSubmit} noValidate>
                  <p className="mp-excel-gate">
                    Enter your email and the download starts right away.
                  </p>
                  <div className="mp-excel-row">
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
                  {emailStatus === 'error' && <p className="mp-error">{emailErr}</p>}
                  <p className="mp-excel-fine">
                    You&apos;ll also get the free 5-step plan. No spam, unsubscribe anytime.
                  </p>
                </form>
              ) : (
                <div className="mp-excel-action">
                  <button
                    type="button"
                    className="btn btn-gold btn-lg"
                    onClick={handleDownloadClick}
                    disabled={building}
                  >
                    {building ? 'Building your file…' : 'Download Interactive Excel'}
                  </button>
                  {buildErr && <p className="mp-error">{buildErr}</p>}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="booking-section">
        <div className="booking-icon">🗓️</div>
        <h2 className="booking-title">Should You Pay It Off<br />Or Invest Instead?</h2>
        <p className="booking-sub">
          I paid my house off in 2 years and 9 months, and it is not the right call for
          everyone. Book a free 30-minute session and we&apos;ll work through your numbers.
        </p>
        <Link href="/book" className="btn btn-gold btn-full btn-lg">Book a Free Session</Link>
        <p className="booking-small">We start with the loan you actually have.</p>
      </section>
    </>
  )
}
