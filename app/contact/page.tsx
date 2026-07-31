import type { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact — Soldier to Millionaire',
  description:
    'Get in touch with Joe Do — ask a question, share a blog post idea, or just say hello. A battle buddy who answers his own messages.',
  keywords: ['contact soldier to millionaire', 'military finance questions', 'ask Joe Do'],
}

const socials = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/soldier2millionaire/',
    icon: 'M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.42.46.66.26 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.24.63.41 1.36.46 2.42.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.46 2.42a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.63.24-1.36.41-2.42.46-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.42-.46a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.24-.63-.41-1.36-.46-2.42C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.46-2.42.26-.66.6-1.22 1.15-1.77A4.9 4.9 0 0 1 5.44 2.54c.63-.24 1.36-.41 2.42-.46C8.94 2.01 9.28 2 12 2zm0 1.8c-2.67 0-2.99.01-4.04.06-.87.04-1.34.18-1.65.3-.42.16-.71.35-1.02.66-.31.31-.5.6-.66 1.02-.12.31-.26.78-.3 1.65C4.28 8.51 4.27 8.83 4.27 11.5v1c0 2.67.01 2.99.06 4.04.04.87.18 1.34.3 1.65.16.42.35.71.66 1.02.31.31.6.5 1.02.66.31.12.78.26 1.65.3 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c.87-.04 1.34-.18 1.65-.3.42-.16.71-.35 1.02-.66.31-.31.5-.6.66-1.02.12-.31.26-.78.3-1.65.05-1.05.06-1.37.06-4.04v-1c0-2.67-.01-2.99-.06-4.04-.04-.87-.18-1.34-.3-1.65a2.7 2.7 0 0 0-.66-1.02 2.7 2.7 0 0 0-1.02-.66c-.31-.12-.78-.26-1.65-.3C14.99 3.81 14.67 3.8 12 3.8zm0 3.3a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm5.1-2.3a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z',
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/share/1c4GE3rgaG/?mibextid=wwXIfr',
    icon: 'M13.5 21.5v-8.2h2.75l.41-3.2h-3.16V8.1c0-.93.26-1.56 1.59-1.56h1.7V3.7c-.3-.04-1.3-.13-2.47-.13-2.45 0-4.12 1.49-4.12 4.24v2.36H7.44v3.2h2.76v8.2h3.3z',
  },
  {
    name: 'X',
    href: 'https://x.com/soldier2m',
    icon: 'M18.24 3H21l-6.55 7.49L22 21h-6.15l-4.82-6.31L5.5 21H2.72l7.02-8.02L2 3h6.3l4.36 5.77L18.24 3zm-1.08 16.17h1.53L7.9 4.74H6.26l10.9 14.43z',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/joedo29/',
    icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  // YouTube omitted — no channel URL provided yet. Add it here once Joe shares the real link:
  // { name: 'YouTube', href: '<real URL>', icon: 'M23.5 6.2a3 3 0 0 0-2.11-2.13C19.51 3.5 12 3.5 12 3.5s-7.51 0-9.39.57A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.13c1.88.57 9.39.57 9.39.57s7.51 0 9.39-.57a3 3 0 0 0 2.11-2.13A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z' },
]

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
