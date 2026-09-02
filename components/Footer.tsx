import Link from 'next/link'
import { socials } from '@/lib/socials'

const footerLinks = [
  { href: '/about',             label: 'About' },
  { href: '/net-worth',         label: 'Net Worth' },
  { href: '/strategy',          label: 'Start Here' },
  { href: '/resources',         label: 'Resources' },
  { href: '/tools',             label: 'Free Tools' },
  { href: '/military-wealth-path', label: 'Wealth Path' },
  { href: '/military-benefits', label: 'Benefits' },
  { href: '/blog',              label: 'Blog' },
  { href: '/soldiers',          label: 'Results' },
  { href: '/books',             label: 'Books' },
  { href: '/tracker',           label: 'Tracker' },
  { href: '/book',              label: 'Book' },
  { href: '/contact',           label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">Soldier<span>2</span>Millionaire</div>
      <div className="footer-tagline">Financial freedom for those who serve.</div>

      <nav className="footer-links">
        {footerLinks.map(l => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
      </nav>

      {/* Social */}
      <div className="footer-social">
        {socials.map(s => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-btn"
            aria-label={`Joe Do on ${s.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={s.icon} />
            </svg>
            {s.name}
          </a>
        ))}
      </div>

      <div className="footer-copy">
        © {new Date().getFullYear()} Soldier2Millionaire · soldiertomillionaire.com
      </div>
    </footer>
  )
}
