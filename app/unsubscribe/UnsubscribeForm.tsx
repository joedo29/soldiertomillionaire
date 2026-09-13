'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function UnsubscribeForm() {
  const params = useSearchParams()
  const e = params.get('e') ?? ''
  const t = params.get('t') ?? ''
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  if (!e || !t) {
    return (
      <div className="unsub-card">
        <h2>This link is incomplete</h2>
        <p>
          Use the unsubscribe link at the bottom of any email from me, or{' '}
          <Link href="/contact">send me a message</Link> and I will remove you by hand.
        </p>
      </div>
    )
  }

  async function unsubscribe() {
    setStatus('loading')
    setErrMsg('')
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ e, t }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setStatus('done')
    } catch (err: unknown) {
      setStatus('error')
      setErrMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (status === 'done') {
    return (
      <div className="unsub-card">
        <h2>You are unsubscribed</h2>
        <p>
          You will not get any more emails from the Soldier to Millionaire list. Changed your mind?
          Sign up again anytime on the <Link href="/">homepage</Link>.
        </p>
      </div>
    )
  }

  return (
    <div className="unsub-card">
      <h2>Leave the email list?</h2>
      <p>You will stop getting blog posts and updates. The guide you already downloaded is yours to keep.</p>
      <button
        type="button"
        className="btn btn-army btn-lg"
        onClick={unsubscribe}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Unsubscribing…' : 'Unsubscribe'}
      </button>
      {status === 'error' && <p className="unsub-error">{errMsg}</p>}
    </div>
  )
}
