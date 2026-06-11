'use client'
import { useState } from 'react'

export default function EmailCapture() {
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')

    try {
      const res  = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setStatus('success')
    } catch (err: unknown) {
      setStatus('error')
      setErrMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  return (
    <section className="ec-section" aria-label="Get the free 5-step plan">
      <div className="ec-inner">

        {/* Left — PDF mockup */}
        <div className="ec-mockup" aria-hidden="true">
          <div className="ec-book">
            <div className="ec-book-spine" />
            <div className="ec-book-cover">
              <div className="ec-book-logo">SOLDIER<span>2</span>MILLIONAIRE</div>
              <div className="ec-book-tag">FREE GUIDE</div>
              <div className="ec-book-title">5-Step<br />Financial<br />Freedom<br />Plan</div>
              <div className="ec-book-sub">For Soldiers</div>
              <div className="ec-book-steps">
                {['Debt Free', 'Save 50%', 'Max Accounts', 'S&P 500', 'Own Home'].map((s, i) => (
                  <div key={s} className="ec-book-step">
                    <span className="ec-book-step-num">{i + 1}</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <div className="ec-book-author">Joe Do · US Army</div>
            </div>
          </div>
        </div>

        {/* Right — copy + form */}
        <div className="ec-content">
          <div className="section-tag gold">Free Guide</div>
          <h2 className="ec-headline">
            Get the Free<br />5-Step Financial<br />Freedom Plan
          </h2>
          <p className="ec-sub">
            The exact system I used to build $750K net worth on an Army salary.
            Printable PDF — no strings, no upsells.
          </p>

          <ul className="ec-bullets">
            <li>All 5 steps with action items</li>
            <li>Printable quick-action checklist</li>
            <li>TSP, Roth IRA &amp; VA loan breakdown</li>
          </ul>

          {status === 'success' ? (
            <div className="ec-success">
              <div className="ec-success-icon">✓</div>
              <div>
                <p className="ec-success-title">Check your inbox.</p>
                <p className="ec-success-sub">
                  The guide is on its way. While you wait —{' '}
                  <a href="/downloads/military-financial-freedom-playbook.pdf" target="_blank" rel="noopener noreferrer">
                    download it now ↗
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <form className="ec-form" onSubmit={handleSubmit} noValidate>
              <input
                className="ec-input"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
                aria-label="Email address"
              />
              <button
                className="ec-btn"
                type="submit"
                disabled={status === 'loading' || !email}
              >
                {status === 'loading' ? 'Sending…' : 'Get the Free Plan →'}
              </button>
              {status === 'error' && (
                <p className="ec-error">{errMsg}</p>
              )}
              <p className="ec-fine">No spam. No pitch. Unsubscribe anytime.</p>
            </form>
          )}
        </div>

      </div>
    </section>
  )
}
