import type { Metadata } from 'next'
import Link from 'next/link'
import { tools } from '@/lib/tools'
import ToolIcon from '@/components/ToolIcons'

export const metadata: Metadata = {
  title: 'Free Tools for Veterans & Military Entrepreneurs — Soldier to Millionaire',
  description:
    'Free, no-signup tools for veterans and service members — federal contracting readiness, wealth projection, and net worth tracking. Built by an active-duty soldier.',
  keywords: [
    'free tools for veterans',
    'veteran business tools',
    'veteran owned small business resources',
    'federal contracting tools',
    'military financial tools',
  ],
  alternates: { canonical: 'https://soldiertomillionaire.com/tools' },
}

export default function ToolsPage() {
  return (
    <main>
      <div className="page-hero">
        <div className="section-tag gold">Free Tools</div>
        <h1>Tools That Do<br />the Work.</h1>
        <p>
          Free, no signup required, nothing to install. Built for veterans and service members
          who want a straight answer instead of a sales call.
        </p>
      </div>

      <section className="tools-section">
        <div className="container">
          <div className="tools-grid">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="tool-card">
                <span className="tool-card-icon">
                  <ToolIcon name={tool.icon} />
                </span>
                <span className="tool-card-tag">{tool.audience}</span>
                <h2>{tool.title}</h2>
                <p>{tool.tagline}</p>
                <span className="tool-card-action">{tool.action} →</span>
              </Link>
            ))}
          </div>

          <p className="tools-note">
            More tools are on the way. Have one you wish existed?{' '}
            <Link href="/contact">Tell me what to build</Link>.
          </p>
        </div>
      </section>
    </main>
  )
}
