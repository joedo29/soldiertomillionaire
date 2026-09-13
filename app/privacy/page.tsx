import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What Soldier to Millionaire collects, why, who processes it, and how to get your data removed. Plain English, no legalese.',
  alternates: { canonical: 'https://soldiertomillionaire.com/privacy' },
}

const LAST_UPDATED = 'September 13, 2026'

export default function PrivacyPage() {
  return (
    <main>
      <div className="page-hero">
        <div className="section-tag gold">Privacy</div>
        <h1>Privacy Policy</h1>
        <p>What this site collects, why, and how to have it removed. Last updated {LAST_UPDATED}.</p>
      </div>

      <section className="prose-section">
        <div className="container-prose prose">
          <p>
            Soldier to Millionaire (soldiertomillionaire.com) is run by Joe Do. This page covers
            the website, its free tools, the email list, and the paid Military Wealth Path report.
            If something here is unclear, <Link href="/contact">send me a message</Link>.
          </p>

          <h2>The short version</h2>
          <ul>
            <li>I collect your email address only when you give it to me.</li>
            <li>
              The numbers you type into the calculators stay in your browser. They are not sent to
              this site&apos;s servers.
            </li>
            <li>I use Google Analytics and Vercel Analytics to see which pages people read.</li>
            <li>I do not sell your information or share your email with advertisers.</li>
            <li>You can unsubscribe or ask me to delete your information at any time.</li>
          </ul>

          <h2>Information you give me</h2>
          <h3>Email signups</h3>
          <p>
            When you sign up for the free 5-step plan, or enter your email to unlock a tool
            download or print sheet, your email address is added to my mailing list. I use it to
            send you the guide you asked for, new blog posts, and occasional updates about the site,
            its tools, and my coaching sessions.
          </p>

          <h3>Contact form</h3>
          <p>
            The contact form sends me your name, email address, the topic you pick, and your
            message. I use it to reply to you. Your email is added to the mailing list only if you
            tick the box to subscribe.
          </p>

          <h3>Booking a session</h3>
          <p>
            Coaching sessions are scheduled through Cal.com. The details you enter there are
            collected by Cal.com under{' '}
            <a href="https://cal.com/privacy" target="_blank" rel="noopener noreferrer">
              its privacy policy
            </a>{' '}
            and shared with me so I can hold the session.
          </p>

          <h3>Buying the Military Wealth Path report</h3>
          <p>
            Payment is handled on Square&apos;s checkout page. I never see or store your card
            number. Square&apos;s handling of your payment information is covered by{' '}
            <a href="https://squareup.com/us/en/legal/general/privacy" target="_blank" rel="noopener noreferrer">
              Square&apos;s privacy notice
            </a>
            .
          </p>

          <h2>What the tools do with your numbers</h2>
          <p>
            The calculators (retirement, VA rating, promotion points, terminal leave, mortgage,
            federal contracting, Military Wealth Path) run in your browser. Your pay, ratings,
            balances and answers are not sent to this site&apos;s servers. Several tools save your
            last inputs in your browser&apos;s local storage so they are still there when you come
            back. That data stays on your device, and clearing your browser&apos;s site data
            removes it.
          </p>
          <p>
            The Net Worth Tracker works the same way: everything you enter is stored in your own
            browser and nowhere else. If you clear your browser data or switch devices, it is gone,
            and I cannot recover it for you.
          </p>

          <h2>Analytics and cookies</h2>
          <p>
            <strong>Google Analytics.</strong> This site uses Google Analytics 4 to count visits,
            see which pages and tools get used, and see roughly where visitors come from (for
            example, a search engine or Instagram). Google Analytics sets cookies and receives
            information such as the pages you view, your browser and device type, and your
            approximate location derived from your IP address. When you sign up for the email list,
            I record that a signup happened and on which form. Your email address is never sent to
            Google Analytics. You can read{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
            >
              how Google uses information from sites that use its services
            </a>
            , and you can opt out of Google Analytics on every site with{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              Google&apos;s opt-out browser add-on
            </a>
            .
          </p>
          <p>
            <strong>Vercel Analytics.</strong> The site is hosted on Vercel, which also provides
            page-view counts. Like any web host, Vercel receives standard request information such
            as your IP address and browser type in order to deliver the page.
          </p>
          <p>
            <strong>Fonts.</strong> Page fonts load from Google Fonts, so your browser connects to
            Google&apos;s servers when a page loads.
          </p>
          <p>
            You can block or delete cookies in your browser settings. The site and its tools still
            work without them.
          </p>

          <h2>Affiliate and outside links</h2>
          <p>
            Some book links on this site are Amazon affiliate links. If you click one and buy
            something, I may earn a commission at no extra cost to you. Amazon may set its own
            cookies once you are on its site. Links to WhatsApp, Instagram, TikTok, YouTube,
            Facebook, X, LinkedIn and government websites take you to services with their own
            privacy policies, which apply once you leave this site.
          </p>

          <h2>Who processes your information</h2>
          <p>These companies handle data on my behalf to run the site:</p>
          <ul>
            <li><strong>Resend</strong> stores the mailing list and sends email.</li>
            <li><strong>Vercel</strong> hosts the website and provides page-view analytics.</li>
            <li><strong>Google</strong> provides Google Analytics and Google Fonts.</li>
            <li><strong>Cal.com</strong> schedules coaching sessions.</li>
            <li><strong>Square</strong> processes payments for the paid report.</li>
          </ul>
          <p>
            I do not sell or rent your personal information, and I do not share it with advertisers.
            I would disclose it only if required by law.
          </p>

          <h2>How long I keep it</h2>
          <p>
            Your email stays on the mailing list until you unsubscribe or ask me to remove it.
            Contact form messages stay in my inbox for as long as they are useful for replying to
            you. Google Analytics data is kept according to the retention setting on the account.
          </p>

          <h2>Your choices</h2>
          <ul>
            <li>
              <strong>Unsubscribe</strong> using the link at the bottom of any email from me, or ask me to take
              you off the list.
            </li>
            <li>
              <strong>Access, correct or delete</strong> the information I hold about you by{' '}
              <Link href="/contact">sending a request through the contact page</Link>. I will
              respond within 30 days.
            </li>
            <li>
              <strong>Opt out of analytics</strong> with Google&apos;s browser add-on or by blocking
              cookies.
            </li>
          </ul>

          <h2>Children</h2>
          <p>
            This site is written for adults. I do not knowingly collect information from anyone
            under 13. If you believe a child has signed up, contact me and I will delete it.
          </p>

          <h2>Security</h2>
          <p>
            The site is served over HTTPS, and the mailing list is stored with Resend rather than on
            the website itself. No method of sending or storing data online is completely secure, so
            I cannot guarantee absolute security.
          </p>

          <h2>Not an official military site</h2>
          <p>
            Soldier to Millionaire is a personal project. It is not affiliated with or endorsed by
            the U.S. Army, the Department of Defense, or the Department of Veterans Affairs.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If I change how the site handles your information, I will update this page and the
            date at the top.
          </p>
        </div>
      </section>
    </main>
  )
}
