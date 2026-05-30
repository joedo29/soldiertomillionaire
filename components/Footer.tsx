import Link from 'next/link'

const footerLinks = [
  { href: '/my-story',          label: 'My Story' },
  { href: '/strategy',          label: 'Strategy' },
  { href: '/military-benefits', label: 'Benefits' },
  { href: '/blog',              label: 'Blog' },
  { href: '/tracker',           label: 'Tracker' },
  { href: '/book',              label: 'Book' },
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
      <div className="footer-copy">
        © {new Date().getFullYear()} Soldier2Millionaire · soldiertomillionaire.com
      </div>
    </footer>
  )
}
