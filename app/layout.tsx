import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Fintrack', template: '%s | Fintrack' },
  description: 'Personal finance tracker and blog.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Nav />
        {children}
        <footer>
          <div className="container">
            © {new Date().getFullYear()} Fintrack · Built with Next.js &amp; Sanity
          </div>
        </footer>
      </body>
    </html>
  )
}
