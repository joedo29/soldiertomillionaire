import type { Metadata } from 'next'
import ContactForm from './ContactForm'
import { socials } from '@/lib/socials'

export const metadata: Metadata = {
  title: 'Contact — Soldier to Millionaire',
  description:
    'Get in touch with Joe Do — ask a question, share a blog post idea, or just say hello. A battle buddy who answers his own messages.',
  keywords: ['contact soldier to millionaire', 'military finance questions', 'ask Joe Do'],
}

export default function ContactPage() {
  return (
    <main>
      <div className="page-hero">
        <div className="section-tag gold">Get in Touch</div>
        <h1>Let&apos;s Talk.</h1>
        <p>Questions, blog ideas, or just want to say hello — I read every message myself.</p>
      </div>

      <section className="contact-section">
        <div className="container contact-grid">
          <ContactForm />

          <div className="contact-side">
            <div className="contact-side-card">
              <div className="section-tag gold">Stay Connected</div>
              <h2>Join 29+ Soldiers Building Wealth</h2>
              <p>
                Get the free 5-step plan and a new post in your inbox every time I publish —
                no spam, no pitch, unsubscribe anytime.
              </p>
              <a href="/resources#playbook" className="btn btn-gold btn-full">
                Get the Free Plan →
              </a>
            </div>

            <div className="contact-side-card">
              <div className="section-tag">Follow Along</div>
              <h2>Find Me on Social</h2>
              <p>Daily posts, behind-the-scenes, and the numbers as they happen.</p>
              <div className="contact-social-grid">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-btn"
                    aria-label={s.name}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d={s.icon} />
                    </svg>
                    <span>{s.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
