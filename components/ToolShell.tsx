import type { ReactNode } from 'react'
import Link from 'next/link'

interface ToolShellProps {
  tag: string
  title: ReactNode
  intro: string
  children: ReactNode
}

export default function ToolShell({ tag, title, intro, children }: ToolShellProps) {
  return (
    <main>
      <div className="page-hero">
        <div className="section-tag gold">{tag}</div>
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>

      {children}

      <section className="tool-footer-nav">
        <div className="container-prose">
          <Link href="/tools">← All free tools</Link>
        </div>
      </section>
    </main>
  )
}
