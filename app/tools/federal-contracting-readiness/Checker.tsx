'use client'

import { useState } from 'react'
import Link from 'next/link'
import { questions, evaluate, maxScore, type Answers } from '@/lib/contractingReadiness'

export default function Checker() {
  const [answers, setAnswers] = useState<Answers>({})
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const answeredCount = questions.filter((q) => answers[q.id]).length
  const allAnswered = answeredCount === questions.length
  const result = submitted ? evaluate(answers) : null

  function select(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function reset() {
    setAnswers({})
    setSubmitted(false)
    setStatus('idle')
    setEmail('')
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')
    try {
      const res = await fetch('/api/subscribe', {
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

  if (result) {
    return (
      <>
        <section className="fcr-result-section">
          <div className="container-prose">
            <div className="fcr-score-card">
              <div className="fcr-score-ring" style={{ ['--pct' as string]: `${result.percent}%` }}>
                <span className="fcr-score-num">{result.percent}</span>
                <span className="fcr-score-unit">/ 100</span>
              </div>
              <div className="fcr-score-copy">
                <div className="section-tag gold">Your Result</div>
                <h2>{result.tier}</h2>
                <p>{result.tierSummary}</p>
                <p className="fcr-score-raw">
                  Scored {result.score} of {maxScore} readiness points
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="fcr-steps-section">
          <div className="container-prose">
            <div className="section-tag">Your Action Plan</div>
            <h2 className="fcr-steps-head">Do these next, in order.</h2>

            <ol className="fcr-steps">
              {result.steps.map((step, i) => (
                <li key={step.title} className="fcr-step">
                  <span className="fcr-step-num">{String(i + 1).padStart(2, '0')}</span>
                  <div className="fcr-step-body">
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                    {step.linkHref && (
                      <a href={step.linkHref} target="_blank" rel="noopener noreferrer">
                        {step.linkLabel} ↗
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div className="fcr-email">
              {status === 'success' ? (
                <div className="fcr-email-success">
                  <span className="fcr-email-check">✓</span>
                  <div>
                    <p className="fcr-email-success-title">You&apos;re on the list.</p>
                    <p className="fcr-email-success-sub">
                      Print or bookmark this page so you keep your action plan handy.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h3>Want this plan in your inbox?</h3>
                  <p>
                    Drop your email and I&apos;ll send you resources for veteran entrepreneurs —
                    plus my free 5-step financial freedom plan.
                  </p>
                  <form className="fcr-email-form" onSubmit={handleEmail} noValidate>
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={status === 'loading'}
                      aria-label="Email address"
                    />
                    <button type="submit" disabled={status === 'loading' || !email}>
                      {status === 'loading' ? 'Sending…' : 'Send It →'}
                    </button>
                  </form>
                  {status === 'error' && <p className="fcr-email-error">{errMsg}</p>}
                  <p className="fcr-email-fine">No spam. Unsubscribe anytime.</p>
                </>
              )}
            </div>

            <p className="fcr-disclaimer">
              This tool is educational and is not legal, financial, or procurement advice. Eligibility
              determinations are made solely by the SBA and the contracting agency. Always confirm current
              requirements at SAM.gov and SBA VetCert.
            </p>

            <div className="fcr-result-actions">
              <button type="button" className="btn btn-outline-dark" onClick={reset}>
                Start Over
              </button>
              <Link href="/book" className="btn btn-army">Book a Free Session</Link>
            </div>
          </div>
        </section>
      </>
    )
  }

  return (
    <section className="fcr-quiz-section">
      <div className="container-prose">
        <div className="fcr-progress">
          <div className="fcr-progress-bar">
            <span style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
          </div>
          <span className="fcr-progress-text">
            {answeredCount} of {questions.length} answered
          </span>
        </div>

        {questions.map((q, i) => (
          <fieldset key={q.id} className="fcr-question">
            <legend>
              <span className="fcr-q-num">{String(i + 1).padStart(2, '0')}</span>
              {q.question}
            </legend>
            {q.help && <p className="fcr-q-help">{q.help}</p>}
            <div className="fcr-choices">
              {q.choices.map((c) => (
                <label
                  key={c.value}
                  className={`fcr-choice${answers[q.id] === c.value ? ' selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={c.value}
                    checked={answers[q.id] === c.value}
                    onChange={() => select(q.id, c.value)}
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="fcr-submit">
          <button
            type="button"
            className="btn btn-gold btn-lg btn-full"
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
          >
            {allAnswered ? 'Get My Readiness Score →' : `Answer all ${questions.length} questions`}
          </button>
          <p className="fcr-submit-note">
            Runs entirely in your browser. Nothing is saved or sent unless you ask for the email.
          </p>
        </div>
      </div>
    </section>
  )
}
