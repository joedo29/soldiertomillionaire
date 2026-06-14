import Link from 'next/link'

const footerLinks = [
  { href: '/about',             label: 'About' },
  { href: '/strategy',          label: 'Strategy' },
  { href: '/military-benefits', label: 'Benefits' },
  { href: '/blog',              label: 'Blog' },
  { href: '/soldiers',          label: 'Soldiers' },
  { href: '/books',             label: 'Books' },
  { href: '/tracker',           label: 'Tracker' },
  { href: '/book',              label: 'Book' },
]

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

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
        <a
          href="https://www.linkedin.com/in/joedo29/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-btn"
          aria-label="Joe Do on LinkedIn"
        >
          <LinkedInIcon />
          LinkedIn
        </a>
      </div>

      <div className="footer-copy">
        © {new Date().getFullYear()} Soldier2Millionaire · soldiertomillionaire.com
      </div>
    </footer>
  )
}
