'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/about',             label: 'About' },
  { href: '/strategy',          label: 'Start Here' },
  {
    href: '/resources',
    label: 'Resources',
    activePaths: ['/resources', '/blog', '/books', '/military-benefits', '/soldiers'],
  },
  { href: '/tracker',           label: 'Tracker' },
  { href: '/book',              label: 'Book a Session', cta: true },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const path = usePathname()

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [path])

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header className="nav">
        <Link href="/" className="nav-logo">
          Soldier<span>2</span>Millionaire
        </Link>

        {/* Desktop */}
        <nav className="nav-desktop">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link${l.cta ? ' nav-cta' : ''}${(l.activePaths ?? [l.href]).some(p => path === p || path.startsWith(`${p}/`)) ? ' active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="nav-drawer" role="navigation" aria-label="Mobile menu">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`drawer-link${l.cta ? ' cta' : ''}${(l.activePaths ?? [l.href]).some(p => path === p || path.startsWith(`${p}/`)) ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
