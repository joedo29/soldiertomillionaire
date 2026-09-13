'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import InfoTip from '@/components/InfoTip'
import {
  calculateTerminalLeave,
  emptyTerminalLeaveInputs,
  type Line,
  type OptionResult,
  type TerminalLeaveInputs,
} from '@/lib/terminalLeave'
import {
  CAREER_SELL_LIMIT_DAYS,
  CONSIDERATIONS,
  DATA_VERIFIED,
  FICA_PCT,
  RULE_NOTES,
  SOURCES,
  SUPPLEMENTAL_WITHHOLDING_PCT,
} from '@/lib/terminalLeaveData'

const STORAGE_KEY = 'soldier2millionaire:terminal-leave'
const UNLOCK_KEY = 'soldier2millionaire:terminal-leave-unlocked'

const money = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)

const num = (v: string): number => {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

function OptionCard({ option, winner }: { option: OptionResult; winner: boolean }) {
  return (
    <div className={`tl-option${winner ? ' winner' : ''}`}>
      <div className="tl-option-head">
        <span className="tl-option-tag">{option.key === 'sell' ? 'Option A' : 'Option B'}</span>
        <h3>{option.label}</h3>
        {winner && <span className="tl-option-badge">Pays more</span>}
      </div>
      <div className="tl-lines">
        {option.lines.map((l: Line, i) => (
          <div className={`tl-line${l.deduction ? ' deduction' : ''}`} key={i}>
            <span className="tl-line-label">
              {l.label}
              {l.note && <em>{l.note}</em>}
            </span>
            <span className="tl-line-amount">
              {l.deduction ? '−' : ''}
              {money(l.amount)}
            </span>
          </div>
        ))}
      </div>
      <div className="tl-option-total">
        <span>Adds beyond your shared pay</span>
        <strong>{money(option.net)}</strong>
      </div>
      {option.forfeitedDays > 0 && (
        <p className="tl-forfeit">
          {option.forfeitedDays} day{option.forfeitedDays === 1 ? '' : 's'} of leave forfeited under
          this option.
        </p>
      )}
    </div>
  )
}

export default function Calculator() {
  const [inputs, setInputs] = useState<TerminalLeaveInputs>(() => ({
    ...emptyTerminalLeaveInputs(),
    monthlyBasePay: 4500,
  }))
  const [limitedWindow, setLimitedWindow] = useState(false)
  const [hydrated, setHydrated] = useState(false)

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
        if (p.inputs) setInputs({ ...emptyTerminalLeaveInputs(), ...p.inputs })
        if (typeof p.limitedWindow === 'boolean') setLimitedWindow(p.limitedWindow)
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
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ inputs, limitedWindow }))
    } catch {
      // Ignore write failures.
    }
  }, [inputs, limitedWindow, hydrated])

  const effectiveInputs = useMemo<TerminalLeaveInputs>(
    () => ({
      ...inputs,
      daysAvailableForLeave: limitedWindow ? inputs.daysAvailableForLeave ?? 0 : null,
    }),
    [inputs, limitedWindow],
  )
  const r = useMemo(() => calculateTerminalLeave(effectiveInputs), [effectiveInputs])

  function set<K extends keyof TerminalLeaveInputs>(key: K, value: TerminalLeaveInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
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
      window.setTimeout(() => window.print(), 250)
    } catch (err: unknown) {
      setEmailStatus('error')
      setEmailErr(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const absDelta = Math.abs(r.delta)
  const barMax = Math.max(r.sell.net, r.terminal.net, 1)
  const noDecision = r.decisionDays === 0

  let verdictTitle: string
  let verdictBody: string
  if (noDecision) {
    verdictTitle = 'There is nothing to sell'
    verdictBody =
      r.careerDaysRemainingBefore === 0
        ? `You have already used your ${CAREER_SELL_LIMIT_DAYS}-day career limit, so every day on the books has to be taken as terminal leave or it is lost.`
        : 'Enter a leave balance and the number of days you would sell to compare the two options.'
  } else if (r.winner === 'tie') {
    verdictTitle = 'Financially, it is a wash'
    verdictBody =
      'Both options add about the same amount. Decide on the non-financial factors below.'
  } else if (r.winner === 'sell') {
    verdictTitle = `Selling pays ${money(absDelta)} more`
    verdictBody = inputs.hasCivilianJob
      ? `Your civilian pay for those ${r.civilianDecisionDays} days, after tax, comes to less than the lump sum. Terminal leave would still give you the time — that may be worth the difference to you.`
      : 'Without a civilian job lined up, terminal leave adds time but no money. Selling converts those days to cash while you keep drawing the same military pay you would get either way.'
  } else {
    verdictTitle = `Terminal leave pays ${money(absDelta)} more`
    verdictBody = `Working your civilian job for those ${r.civilianDecisionDays} days while still drawing military pay nets more than the lump sum would — and you keep ${r.decisionDays} days of your career sell limit.`
  }

  return (
    <>
      <section className="tl-tool">
        <div className="container tl-grid">
          {/* ─────────── Inputs ─────────── */}
          <div className="tl-panel no-print">
            <div className="section-tag">Your Situation</div>
            <h2>Enter your numbers.</h2>

            <label className="tl-field">
              <span>
                Monthly basic pay (from your LES)
                <InfoTip
                  title="Why basic pay from your LES"
                  formula="Daily rate = monthly basic pay / 30"
                  source={SOURCES.fmr35.cite}
                  href={SOURCES.fmr35.url}
                >
                  Sold leave is &ldquo;valued using only basic pay&rdquo; — no BAH, BAS or
                  special pays. Your LES shows your exact basic pay for your grade and years of
                  service, which is more accurate than any pay-table lookup.
                </InfoTip>
              </span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={inputs.monthlyBasePay || ''}
                placeholder="e.g. 4500"
                onChange={(e) => set('monthlyBasePay', num(e.target.value))}
              />
              <small>
                Daily rate: {money(r.dailyBasePay)}. Sold leave is paid at the basic pay rate on
                your discharge date, so a promotion before then raises it.{' '}
                <Link href="/tools/army-promotion-points" className="tl-inline-link">
                  Estimate your promotion points
                </Link>
                .
              </small>
            </label>

            <div className="tl-field-row">
              <label className="tl-field">
                <span>Leave balance (days)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={inputs.leaveBalanceDays || ''}
                  onChange={(e) => set('leaveBalanceDays', num(e.target.value))}
                />
              </label>
              <label className="tl-field">
                <span>
                  Days already sold
                  <InfoTip
                    title="The 60-day career limit"
                    formula="Sellable now = 60 − days sold before (since 9 Feb 1976)"
                    source={SOURCES.usc37_501.cite + '(f)'}
                    href={SOURCES.usc37_501.url}
                  >
                    The limit covers your entire career, not each separation. Count every day you
                    sold at a previous reenlistment or separation. Your LES and your finance office
                    can confirm the number.
                  </InfoTip>
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={CAREER_SELL_LIMIT_DAYS}
                  value={inputs.daysAlreadySold || ''}
                  placeholder="0"
                  onChange={(e) => set('daysAlreadySold', num(e.target.value))}
                />
              </label>
            </div>

            <label className="tl-field">
              <span>
                Days you would sell: <strong>{r.decisionDays}</strong>
                {r.sellableDays > 0 && <em className="tl-muted"> of {r.sellableDays} sellable</em>}
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, r.sellableDays)}
                step={1}
                value={Math.min(inputs.daysToSell, r.sellableDays)}
                disabled={r.sellableDays === 0}
                onChange={(e) => set('daysToSell', num(e.target.value))}
              />
            </label>

            {(r.cappedByCareerLimit || r.careerLimitReached || r.unsellableDays > 0) && (
              <div className="tl-warning">
                <strong>
                  {r.careerDaysRemainingBefore === 0
                    ? 'You have used your 60-day career sell limit'
                    : r.careerLimitReached
                      ? 'This sale uses the rest of your 60-day career limit'
                      : 'The career limit caps what you can sell'}
                </strong>
                <p>
                  {r.unsellableDays > 0
                    ? `${r.unsellableDays} day${r.unsellableDays === 1 ? '' : 's'} of your balance cannot be sold. Take them as terminal leave or they are lost.`
                    : `After this sale you have ${r.careerDaysRemainingAfter} career days left to sell.`}
                </p>
              </div>
            )}

            <label className="tl-check">
              <input
                type="checkbox"
                checked={limitedWindow}
                onChange={(e) => setLimitedWindow(e.target.checked)}
              />
              <span>I can&apos;t take all of my leave before my separation date</span>
            </label>
            {limitedWindow && (
              <label className="tl-field">
                <span>
                  Days of leave you can actually take
                  <InfoTip
                    title="Use it or lose it"
                    formula="Forfeited = leave you neither sell nor take before separation"
                    source={SOURCES.fmr35.cite}
                    href={SOURCES.fmr35.url}
                  >
                    Mission requirements, clearing, or a late decision can shrink the window.
                    Leave that does not fit and cannot be sold is forfeited.
                  </InfoTip>
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={inputs.daysAvailableForLeave ?? ''}
                  onChange={(e) => set('daysAvailableForLeave', num(e.target.value))}
                />
              </label>
            )}

            <div className="tl-subhead">Civilian job</div>
            <label className="tl-check">
              <input
                type="checkbox"
                checked={inputs.hasCivilianJob}
                onChange={(e) => set('hasCivilianJob', e.target.checked)}
              />
              <span>I have a civilian job starting during my terminal leave</span>
            </label>
            {inputs.hasCivilianJob && (
              <label className="tl-field">
                <span>Civilian annual salary</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={inputs.civilianAnnualSalary || ''}
                  placeholder="e.g. 85000"
                  onChange={(e) => set('civilianAnnualSalary', num(e.target.value))}
                />
                <small>
                  Federal civilian jobs are expressly allowed (5 U.S.C. § 5534a). Private-sector work
                  needs approval — see the rules below.
                </small>
              </label>
            )}

            <div className="tl-subhead">Taxes</div>
            <div className="tl-segment" role="radiogroup" aria-label="Compare after tax or gross">
              {(['net', 'gross'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={inputs.taxMode === m}
                  className={inputs.taxMode === m ? 'active' : ''}
                  onClick={() => set('taxMode', m)}
                >
                  {m === 'net' ? 'After tax (both sides)' : 'Gross (neither side)'}
                </button>
              ))}
            </div>

            {inputs.taxMode === 'net' && (
              <>
                <div className="tl-field-row">
                  <label className="tl-field">
                    <span>
                      Lump-sum withholding %
                      <InfoTip
                        title="22% is the supplemental rate"
                        formula={`Federal supplemental wage withholding: ${SUPPLEMENTAL_WITHHOLDING_PCT}%`}
                        source={SOURCES.irs15.cite}
                        href={SOURCES.irs15.url}
                      >
                        The 25% you may see quoted is the pre-2018 rate. Withholding is not your tax
                        bill — see the note under the results.
                      </InfoTip>
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={60}
                      value={inputs.federalWithholdingPct}
                      onChange={(e) => set('federalWithholdingPct', num(e.target.value))}
                    />
                  </label>
                  <label className="tl-field">
                    <span>Civilian federal tax %</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={60}
                      value={inputs.civilianTaxPct}
                      disabled={!inputs.hasCivilianJob}
                      onChange={(e) => set('civilianTaxPct', num(e.target.value))}
                    />
                  </label>
                </div>
                <label className="tl-field">
                  <span>State income tax % (both sides)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={20}
                    value={inputs.stateTaxPct || ''}
                    placeholder="0"
                    onChange={(e) => set('stateTaxPct', num(e.target.value))}
                  />
                </label>
                <label className="tl-check">
                  <input
                    type="checkbox"
                    checked={inputs.ficaOnLumpSum}
                    onChange={(e) => set('ficaOnLumpSum', e.target.checked)}
                  />
                  <span>
                    Include FICA ({FICA_PCT}%) on the lump sum
                    <InfoTip
                      title="Not settled in the regulation"
                      formula="FMR Vol 7A Ch 45 lists basic pay as FICA-taxable, but never names the leave lump sum"
                      source={SOURCES.fmr45.cite}
                      href={SOURCES.fmr45.url}
                    >
                      Sold leave is valued on basic pay, and basic pay is subject to Social Security
                      and Medicare — which argues FICA applies. But Chapter 45 does not mention the
                      lump sum at all, and some sources say it is exempt. Leave this on for a
                      conservative estimate; your final LES will show what was actually withheld.
                      Civilian wages always carry FICA.
                    </InfoTip>
                  </span>
                </label>
              </>
            )}

            <div className="tl-subhead">Allowances (context only)</div>
            <div className="tl-field-row">
              <label className="tl-field">
                <span>Monthly BAH</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={inputs.monthlyBah || ''}
                  placeholder="0"
                  onChange={(e) => set('monthlyBah', num(e.target.value))}
                />
              </label>
              <label className="tl-field">
                <span>Monthly BAS</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={inputs.monthlyBas || ''}
                  placeholder="0"
                  onChange={(e) => set('monthlyBas', num(e.target.value))}
                />
              </label>
            </div>
            <small className="tl-hint">
              Shown so you can see the pay you keep either way. Changing these never changes the
              comparison.
            </small>
          </div>

          {/* ─────────── Results ─────────── */}
          <div className="tl-results no-print">
            <div className={`tl-verdict ${noDecision ? 'neutral' : r.winner}`}>
              <span className="tl-verdict-tag">The honest answer</span>
              <h2>{verdictTitle}</h2>
              <p>{verdictBody}</p>
            </div>

            <div className="tl-baseline">
              <div className="tl-baseline-head">
                <strong>Paid either way: {money(r.sharedBaseline.total)}</strong>
                <InfoTip
                  title="Why this is not part of the comparison"
                  formula="Separation date is the same under both options"
                  source={SOURCES.fmr35.cite}
                  href={SOURCES.fmr35.url}
                >
                  You stay on active duty until your separation date whether you are on terminal
                  leave or working and selling. Basic pay, BAH, BAS and TRICARE continue through
                  that date under both options, so they cancel out. Calculators that count this on
                  the terminal-leave side only will always tell you terminal leave wins.
                </InfoTip>
              </div>
              <p>
                For the {r.sharedBaseline.days} days in question: basic pay{' '}
                {money(r.sharedBaseline.basePay)} · BAH {money(r.sharedBaseline.bah)} · BAS{' '}
                {money(r.sharedBaseline.bas)}. Identical under both options — not counted below.
              </p>
            </div>

            <div className="tl-options">
              <OptionCard option={r.sell} winner={!noDecision && r.winner === 'sell'} />
              <OptionCard option={r.terminal} winner={!noDecision && r.winner === 'terminal'} />
            </div>

            <div className="tl-bars">
              <div className="tl-bars-head">
                <strong>What each option adds</strong>
                <span>{inputs.taxMode === 'net' ? 'after tax' : 'gross'}</span>
              </div>
              {[r.sell, r.terminal].map((o) => (
                <div className="tl-bar-row" key={o.key}>
                  <div className="tl-bar-label">
                    <span>{o.label}</span>
                    <span>{money(o.net)}</span>
                  </div>
                  <div className="tl-bar-track">
                    <div
                      className={`tl-bar-fill ${o.key}`}
                      style={{ width: `${(o.net / barMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {inputs.taxMode === 'net' && (
              <div className="tl-callout">
                <strong>Withholding is not your final tax bill</strong>
                <p>
                  The {inputs.federalWithholdingPct}% taken from a lump sum is a flat withholding
                  rate, not the tax you actually owe. When you file, the lump sum is taxed with the
                  rest of your income at your real rates, and anything over-withheld comes back as a
                  refund. Someone in the 12% bracket who has 22% withheld will usually get a large
                  chunk of it back — so do not reject selling just because the withholding line
                  looks painful.
                </p>
              </div>
            )}

            <div className="tl-accrual">
              <strong>Your leave keeps accruing on terminal leave</strong>
              <p>
                At 2.5 days a month, {r.terminal.leaveDaysTaken} days of terminal leave earns about{' '}
                {r.accruedDuringTerminal} more days, so it runs roughly {r.effectiveTerminalLength}{' '}
                calendar days. Use that when you set your leave start date. Leave accrues under both
                options, so it does not change which one pays more.
              </p>
            </div>

            <Link href="/tools/military-retirement" className="tool-crosslink">
              <span className="tool-crosslink-tag">Before you separate</span>
              <strong>Compare it with staying in</strong>
              <span className="tool-crosslink-body">
                The Military Retirement Planner shows your pension, TSP and VA pay at 20 years or
                more, and what you give up if you leave before you are vested. →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────── Non-financial factors ─────────── */}
      <section className="tl-section no-print">
        <div className="container">
          <div className="section-tag">Beyond the Money</div>
          <h2 className="tl-section-head">What the dollar figure leaves out</h2>
          <p className="tl-section-lede">
            The cash difference is often smaller than the value of the time. Neither column is the
            right answer by default.
          </p>
          <div className="tl-table-wrap">
            <table className="tl-table">
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Terminal leave</th>
                  <th>Selling the leave</th>
                </tr>
              </thead>
              <tbody>
                {CONSIDERATIONS.map((c) => (
                  <tr key={c.factor}>
                    <td>{c.factor}</td>
                    <td>{c.terminal}</td>
                    <td>{c.sell}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─────────── Rules ─────────── */}
      <section className="tl-section tl-section-alt no-print">
        <div className="container">
          <div className="section-tag">The Rules</div>
          <h2 className="tl-section-head">What the law and regulations actually say</h2>
          <div className="tl-rules">
            {RULE_NOTES.map((n) => (
              <div className="tl-rule" key={n.title}>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <div className="tl-rule-links">
                  <a href={SOURCES[n.source].url} target="_blank" rel="noopener noreferrer">
                    {SOURCES[n.source].cite} ↗
                  </a>
                  {n.related && <Link href={n.related.href}>{n.related.label} →</Link>}
                </div>
              </div>
            ))}
          </div>

          <div className="tl-print-cta">
            <h3>Take this to your finance office</h3>
            <p>
              A one-page summary of your numbers, both options, and the rules that apply — to check
              against your leave balance and final pay estimate.
            </p>
            {showEmail ? (
              <form className="tl-email-form" onSubmit={handleEmailSubmit} noValidate>
                <p className="tl-email-gate">Enter your email and the summary opens to print.</p>
                <div className="tl-email-row">
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
                    {emailStatus === 'loading' ? 'Sending…' : 'Open Summary'}
                  </button>
                </div>
                {emailStatus === 'error' && <p className="tl-error">{emailErr}</p>}
                <p className="tl-email-fine">
                  You&apos;ll also get the free 5-step plan. Unsubscribe anytime.
                </p>
              </form>
            ) : (
              <button
                type="button"
                className="btn btn-gold btn-lg"
                onClick={() => (unlocked ? window.print() : setShowEmail(true))}
              >
                Print my summary
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─────────── Printable summary ─────────── */}
      <div className="tl-print-sheet" aria-hidden="true">
        <h2>Terminal Leave vs. Sell-Back — Summary</h2>
        <p className="tl-print-sub">Planning estimate · {verdictTitle}</p>
        <table>
          <tbody>
            <tr><td>Monthly basic pay</td><td>{money(inputs.monthlyBasePay)}</td></tr>
            <tr><td>Daily rate (basic pay / 30)</td><td>{money(r.dailyBasePay)}</td></tr>
            <tr><td>Leave balance</td><td>{inputs.leaveBalanceDays} days</td></tr>
            <tr><td>Career days sold before / remaining after</td><td>{inputs.daysAlreadySold} / {r.careerDaysRemainingAfter}</td></tr>
            <tr><td>Days compared</td><td>{r.decisionDays}</td></tr>
            <tr><td>Paid either way (not compared)</td><td>{money(r.sharedBaseline.total)}</td></tr>
            {[r.sell, r.terminal].map((o) => (
              <Fragment key={o.key}>
                <tr className="tl-print-cat"><th colSpan={2}>{o.label}</th></tr>
                {o.lines.map((l, i) => (
                  <tr key={`${o.key}-${i}`}>
                    <td>{l.label}</td>
                    <td>{l.deduction ? '−' : ''}{money(l.amount)}</td>
                  </tr>
                ))}
                <tr><td><strong>Adds</strong></td><td><strong>{money(o.net)}</strong></td></tr>
              </Fragment>
            ))}
            <tr className="tl-print-cat"><th>Difference</th><th>{money(absDelta)} in favor of {r.winner === 'sell' ? 'selling' : r.winner === 'terminal' ? 'terminal leave' : 'neither'}</th></tr>
          </tbody>
        </table>
        <p className="tl-print-foot">
          Estimate only. Final leave settlement is computed by DFAS from your records. Withholding
          is reconciled when you file your tax return. soldiertomillionaire.com
        </p>
      </div>

      {/* ─────────── Disclaimer ─────────── */}
      <section className="tl-disclaimer-section no-print">
        <div className="container-prose">
          <div className="tl-disclaimer">
            <h3>This is a planning estimate</h3>
            <p>
              <strong>
                Your actual leave settlement is computed by DFAS from your records at separation.
              </strong>{' '}
              Your final LES and separation paperwork are authoritative — confirm your leave balance
              and prior days sold with your finance office before you decide.
            </p>
            <p>
              Tax figures are estimates using flat rates. Your real liability depends on your full
              year&apos;s income, filing status, and state of legal residence. Combat zone tax
              exclusion leave is not modeled. This is not tax, legal, or financial advice.
            </p>
            <p>
              Working a civilian job on terminal leave requires meeting the ethics and approval
              rules above. Talk to your ethics counselor before accepting an offer from a defense
              contractor.
            </p>
            <p className="tl-disclaimer-meta">
              Rules verified against primary sources on {DATA_VERIFIED}. I am an active-duty Soldier,
              not DFAS, a finance office, or a tax professional.
            </p>
          </div>
        </div>
      </section>

      <section className="booking-section no-print">
        <div className="booking-icon">🗓️</div>
        <h2 className="booking-title">Separating Soon?<br />Plan the Money Side.</h2>
        <p className="booking-sub">
          Leave is one decision of many — final pay, TSP, the gap before your first civilian check.
          Book a free 30-minute session and we&apos;ll map your transition budget.
        </p>
        <Link href="/book" className="btn btn-gold btn-full btn-lg">Book a Free Session</Link>
        <p className="booking-small">Bring your separation date and your LES.</p>
      </section>
    </>
  )
}
