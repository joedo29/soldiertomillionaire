'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const path = usePathname()

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          Fintrack
        </Link>
        <nav className="nav-links">
          <Link href="/blog" className={path.startsWith('/blog') ? 'active' : ''}>
            Blog
          </Link>
          <Link href="/finance" className="nav-cta">
            Finance Tracker →
          </Link>
        </nav>
      </div>
    </header>
  )
}
