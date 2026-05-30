# Deploying Fintrack to Vercel + Sanity

Everything below is free on the default plans.

---

## 1 — Create a Sanity project (5 min)

1. Go to https://www.sanity.io and sign up (free).
2. Click **New project** → give it a name (e.g. "Fintrack Blog") → choose **Production** dataset.
3. Note your **Project ID** from the project settings page.

## 2 — Set env vars locally

```bash
cp .env.local.example .env.local
# Edit .env.local and paste your Project ID:
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
NEXT_PUBLIC_SANITY_DATASET=production
```

## 3 — Run locally

```bash
npm install
npm run dev          # Next.js app at http://localhost:3000
```

- **Home** → http://localhost:3000
- **Blog** → http://localhost:3000/blog
- **Finance Tracker** → http://localhost:3000/finance
- **Sanity Studio** → http://localhost:3000/studio  ← write posts here

## 4 — Allow localhost in Sanity CORS

In https://www.sanity.io/manage → your project → **API** → **CORS origins**,
add `http://localhost:3000` (with credentials).

## 5 — Push to GitHub

```bash
cd finance-blog
git init
git add .
git commit -m "Initial commit"
gh repo create fintrack --private --push --source=.
# or use github.com/new and follow the instructions
```

## 6 — Deploy to Vercel

1. Go to https://vercel.com → **Add New Project** → import your GitHub repo.
2. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` = your project ID
   - `NEXT_PUBLIC_SANITY_DATASET` = production
3. Click **Deploy**. Done — Vercel auto-deploys on every `git push`.

## 7 — Allow your Vercel URL in Sanity CORS

Back in Sanity → API → CORS origins, add your Vercel URL
(e.g. `https://fintrack.vercel.app`) with credentials, so the Studio works.

---

## Writing a blog post

Go to `https://your-site.vercel.app/studio` → click **Blog Post → Create** →
fill in title, body, publish date, tags → hit **Publish**.

The post appears on your live site within ~60 seconds (ISR revalidation).

---

## Cost

| Service | Plan | Cost |
|---|---|---|
| Vercel | Hobby | Free |
| Sanity | Developer | Free (500k API req/mo) |
| Total | | **$0/mo** |
