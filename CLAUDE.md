# soldiertomillionaire.com

Next.js 15 App Router + Sanity CMS. Personal finance blog and brand site for Joe Do
(legal name Phuong Do), US Army, writing about building wealth on a military salary.

## Writing blog posts and site copy

**Read [docs/blog-writing-standards.md](docs/blog-writing-standards.md) before drafting
or editing any blog post or marketing copy.** It is an AI-slop rubric with four failure
categories, concrete rewrites, and a pre-publish checklist.

The three rules that catch the most problems:

1. **No negative parallelism.** "Not just X — it's Y," "not only X but also Y," and
   "no X, no Y, just Z" are the top AI tells. State the thing directly.
2. **No unsupported claims.** Every assertion about money, time, or results carries a
   real number or a named source. Vague success language is worse here than elsewhere
   because the site's whole credibility rests on published real numbers.
3. **No manufactured rhythm.** Semicolon chains, stacked colons, and decorative em
   dashes that create cadence rather than clarify meaning.

Keep accurate domain terms (TSP, BRS, SDVOSB, SCRA, BAH, Roth IRA) — define them on
first use, don't water them down.

## Conventions

- Voice: direct, personal, specific. Joe writes in first person about his own numbers.
- Net worth figures across the site come from the `/net-worth` page total. Update every
  instance when that number changes.
- `git add` specific files, never `-A`. Push to `origin main` after every commit.
