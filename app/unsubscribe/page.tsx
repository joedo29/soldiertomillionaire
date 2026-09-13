import type { Metadata } from 'next'
import { Suspense } from 'react'
import UnsubscribeForm from './UnsubscribeForm'

export const metadata: Metadata = {
  title: 'Unsubscribe',
  robots: { index: false, follow: false },
}

export default function UnsubscribePage() {
  return (
    <main>
      <div className="page-hero">
        <div className="section-tag gold">Email</div>
        <h1>Unsubscribe</h1>
        <p>Stop getting emails from Soldier to Millionaire.</p>
      </div>
      <section className="prose-section">
        <div className="container-prose">
          <Suspense fallback={null}>
            <UnsubscribeForm />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
