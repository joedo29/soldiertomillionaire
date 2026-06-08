import { defineField, defineType } from 'sanity'

export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Soldier Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name & Rank',
      type: 'string',
      description: 'e.g. SPC Kesuh',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'branch',
      title: 'Branch',
      type: 'string',
      description: 'e.g. US Army',
      initialValue: 'US Army',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'challenge',
      title: 'The Challenge (Before)',
      type: 'text',
      rows: 4,
      description: 'Answer to: "Before we talked, what were you struggling with financially?"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'breakthrough',
      title: 'The Breakthrough (Actions Taken)',
      type: 'text',
      rows: 5,
      description: 'Answer to: "What actions did you take after our conversation?"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'advice',
      title: 'Advice to Fellow Soldiers',
      type: 'text',
      rows: 5,
      description: 'Answer to: "What would you tell a fellow soldier on the fence about booking a session?"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date',
      type: 'datetime',
      description: 'When this testimonial was collected.',
      options: { dateFormat: 'YYYY-MM-DD', timeStep: 60 },
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number = shown first. Use 1, 2, 3… to control the order.',
      initialValue: 99,
    }),
  ],

  preview: {
    select: { title: 'name', subtitle: 'branch' },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ?? 'US Army' }
    },
  },
})
