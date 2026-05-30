import { defineField, defineType } from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    // ── 1. First thing you write ──────────────────────────
    defineField({
      name: 'title',
      title: 'Post Title',
      type: 'string',
      description: 'Keep it clear and compelling. This shows up in Google search results.',
      validation: (r) => r.required(),
    }),

    // ── 2. Short summary ──────────────────────────────────
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: '2–3 sentences. Shown on the blog index card and in Google. Write it like a hook.',
    }),

    // ── 3. The post itself ────────────────────────────────
    defineField({
      name: 'body',
      title: 'Post Body',
      type: 'array',
      description: 'Write your post here. Use the toolbar to add headings, bold text, links, and images.',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Image caption / alt text',
              description: 'Describe the image. Used for accessibility and SEO.',
            }),
          ],
        },
      ],
    }),

    // ── 4. Categorise ─────────────────────────────────────
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Add 2–4 tags. e.g. Investing, TSP, Military Benefits, Personal Story',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),

    // ── 5. Cover image ────────────────────────────────────
    defineField({
      name: 'mainImage',
      title: 'Cover Image',
      type: 'image',
      description: 'Upload a cover photo. Shown at the top of the post and as the social share preview.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          description: 'Describe the image for screen readers and SEO.',
        }),
      ],
    }),

    // ── 6. Publish date ───────────────────────────────────
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      description: 'Set to today\'s date when you\'re ready to publish.',
      options: { dateFormat: 'YYYY-MM-DD', timeStep: 60 },
    }),

    // ── 7. URL slug (auto-generated) ──────────────────────
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      description: 'Click "Generate" to auto-fill from the title. Only change if needed.',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
  ],

  preview: {
    select: { title: 'title', subtitle: 'publishedAt', media: 'mainImage' },
    prepare({ title, subtitle, media }) {
      const date = subtitle
        ? new Date(subtitle).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'No date set'
      return { title, subtitle: date, media }
    },
  },
})
