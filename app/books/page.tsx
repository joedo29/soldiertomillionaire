import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Books That Shaped My Journey — Joe Do\'s Reading List',
  description:
    'The books that took Joe Do from broke and working 3 jobs to $750K net worth. Honest recommendations on money, investing, and mindset — with Amazon affiliate links.',
  keywords: ['best personal finance books', 'military finance reading list', 'The Intelligent Investor review', 'Atomic Habits investing', 'books for soldiers'],
}

const moneyBooks = [
  {
    title: 'The Intelligent Investor',
    author: 'Benjamin Graham',
    note: 'I read this at 30, sitting in my apartment after a three-job workday with $20 to my name. Graham\'s concept of the margin of safety didn\'t just teach me about stocks — it rewired how I think about every financial decision. This is the book that started everything.',
    image: '/books/the-intelligent-investor.jpg',
    link: 'https://amzn.to/4etxkLf',
  },
  {
    title: 'The Simple Path to Wealth',
    author: 'JL Collins',
    note: 'JL Collins writes the way I wish someone had talked to me at 22. The case for index funds is simple, clear, and backed by decades of data. Everything I do with my TSP and S&P 500 investments is confirmed on these pages.',
    image: '/books/the-simple-path-to-wealth.jpg',
    link: 'https://amzn.to/4eoqrL1',
  },
  {
    title: 'Naked Statistics',
    author: 'Charles Wheelan',
    note: 'Understanding how to read data changed how I evaluate investment returns and ignore financial noise. Wheelan makes probability genuinely fun — no math degree required. It\'s the reason I don\'t panic when the market drops.',
    image: '/books/Naked-Statistics.jpg',
    link: 'https://amzn.to/4ebScru',
  },
]

const mindsetBooks = [
  {
    title: 'The Lessons of History',
    author: 'Will Durant',
    note: 'If there is one book to read, it\'s this one. Will and Ariel Durant distill thousands of years of human civilization into 100 pages. I believe you cannot make good decisions without understanding history — read it in an afternoon, think about it for years.',
    image: '/books/The-Lessons-of-History.jpg',
    link: 'https://amzn.to/4vJo0tu',
  },
  {
    title: 'The Art of Power',
    author: 'Thich Nhat Hanh',
    note: 'Thich Nhat Hanh\'s definition of power has nothing to do with money or rank. Money, wealth, power, and fame alone will not bring you peace and happiness. I came back from this book with a clearer sense of why I\'m building wealth in the first place.',
    image: '/books/the-art-of-power.jpg',
    link: 'https://amzn.to/3SpG1P4',
  },
  {
    title: 'Man\'s Search for Meaning',
    author: 'Viktor Frankl',
    note: 'Viktor Frankl survived Nazi concentration camps and still found purpose. Every time I think my challenges are too hard, I come back to this book. If he could find meaning in that, a soldier can find a way through anything.',
    image: '/books/mans-search-for-meaning.jpg',
    link: 'https://amzn.to/4fLyQuq',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    note: 'My financial discipline didn\'t come from willpower — it came from systems. Clear\'s framework of tiny habits compounded over time is exactly how I saved 60% of my income and built $750K. This book explains my entire approach.',
    image: '/books/atomic-habits.jpg',
    link: 'https://amzn.to/3SalP3J',
  },
]

function BookCard({ title, author, note, image, link }: {
  title: string
  author: string
  note: string
  image: string
  link: string
}) {
  return (
    <div className="book-card">
      <div className="book-cover">
        <Image
          src={image}
          alt={`${title} book cover`}
          width={240}
          height={360}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className="book-body">
        <div className="book-title">{title}</div>
        <div className="book-author">{author}</div>
        <p className="book-note">{note}</p>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="book-btn"
        >
          View on Amazon →
        </a>
      </div>
    </div>
  )
}

export default function BooksPage() {
  return (
    <main>
      {/* ── Hero ── */}
      <div className="page-hero">
        <div className="section-tag gold">The Reading List</div>
        <h1>Books That<br />Shaped My Journey</h1>
        <p>From broke to $750K — these pages helped get me there.</p>
      </div>

      {/* ── Intro ── */}
      <section style={{ padding: '40px 20px 8px' }}>
        <div className="container-prose">
          <p className="books-intro">
            I didn&apos;t grow up reading. I grew up surviving. But at 30, broke and working three
            jobs, I picked up <em>The Intelligent Investor</em> — and it completely rewired my brain.
            Since then, books have been one of my most valuable tools. Every book on this list
            either changed how I think about money, or reminded me why I&apos;m building it in the
            first place. These aren&apos;t affiliate recommendations — they&apos;re the real ones.
          </p>
        </div>
      </section>

      {/* ── Money & Wealth ── */}
      <section className="books-section">
        <div className="container">
          <div className="section-tag">Money &amp; Wealth</div>
          <h2 className="section-title">Build the Foundation</h2>
          <div className="books-grid books-grid-3">
            {moneyBooks.map(b => <BookCard key={b.title} {...b} />)}
          </div>
        </div>
      </section>

      {/* ── Mindset & Life ── */}
      <section className="books-section" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div className="section-tag">Mindset &amp; Life</div>
          <h2 className="section-title">Build the Person</h2>
          <div className="books-grid books-grid-4">
            {mindsetBooks.map(b => <BookCard key={b.title} {...b} />)}
          </div>
        </div>
      </section>

      {/* ── Affiliate disclosure ── */}
      <p className="books-disclosure">
        As an Amazon Associate I earn from qualifying purchases. This costs you nothing extra.
      </p>

      {/* ── CTA ── */}
      <section className="booking-section">
        <div className="booking-icon">🗓️</div>
        <h2 className="booking-title">Want a Personalized Plan,<br />Not Just a Reading List?</h2>
        <p className="booking-sub">
          Books give you the knowledge. A session with me puts it into action.
          Book a free 30 minutes and we&apos;ll build your financial roadmap together.
        </p>
        <Link href="/book" className="btn btn-gold btn-full btn-lg">
          Book a Free Session
        </Link>
        <p className="booking-small">No cost. No pitch. Just a plan.</p>
      </section>
    </main>
  )
}
