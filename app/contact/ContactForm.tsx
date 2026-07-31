'use client'
import { useState } from 'react'

const topics = [
  { value: 'general', label: 'General Question' },
  { value: 'coaching', label: 'Interested in a Coaching Session' },
  { value: 'blog', label: 'Blog Post Idea' },
  { value: 'press', label: 'Press / Partnership' },
]

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState('general')
  const [message, setMessage] = useState('')
  const [subscribe, setSubscribe] = useState(true)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message, subscribe }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setStatus('success')
    } catch (err: unknown) {
      setStatus('error')
      setErrMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (status === 'success') {
    return (
      <div className="contact-form-card">
        <div className="contact-success">
          <div className="contact-success-icon">✓</div>
          <div>
            <p className="contact-success-title">Message sent.</p>
            <p className="contact-success-sub">
              Thanks, {name.split(' ')[0] || 'soldier'} — I read every message myself and
              I&apos;ll get back to you as soon as I can.
              {subscribe && ' Check your inbox for the free plan.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form className="contact-form-card" onSubmit={handleSubmit} noValidate>
      <div className="section-tag">Send a Message</div>
      <h2>What&apos;s On Your Mind?</h2>
      <p className="contact-form-sub">
        Ask about your TSP, your BAH, a blog topic you want covered, or just say hello.
      </p>

      <label className="contact-field">
        <span>Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          disabled={status === 'loading'}
        />
      </label>

      <label className="contact-field">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={status === 'loading'}
        />
      </label>

      <label className="contact-field">
        <span>What can I help with?</span>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} disabled={status === 'loading'}>
          {topics.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      <label className="contact-field">
        <span>Message</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me what's going on..."
          rows={5}
          required
          disabled={status === 'loading'}
        />
      </label>

      <label className="contact-checkbox">
        <input
          type="checkbox"
          checked={subscribe}
          onChange={(e) => setSubscribe(e.target.checked)}
          disabled={status === 'loading'}
        />
        <span>Add me to the email list for the free plan and new posts</span>
      </label>

      <button className="btn btn-gold btn-full btn-lg" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Send Message →'}
      </button>

      {status === 'error' && <p className="contact-error">{errMsg}</p>}
      <p className="contact-fine">I respond personally — usually within a day or two.</p>
    </form>
  )
}
