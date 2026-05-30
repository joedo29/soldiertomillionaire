// The tracker is the standalone finance app served from /public/finance-app/
// This page redirects there via the Next.js rewrite in next.config.ts
// This file exists only so /tracker appears in the sitemap and nav

import { redirect } from 'next/navigation'

export default function TrackerPage() {
  redirect('/finance-app/index.html')
}
