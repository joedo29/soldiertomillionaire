import { defineField, defineType } from 'sanity'

export const netWorthType = defineType({
  name: 'netWorth',
  title: 'Net Worth',
  type: 'document',
  fields: [
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'date',
      description: 'Set this to today whenever you update any balance below.',
      options: { dateFormat: 'YYYY-MM-DD' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'assets',
      title: 'Assets',
      type: 'array',
      description: 'One entry per account. The total on the site is the sum of these — no separate total to keep in sync.',
      of: [
        {
          type: 'object',
          name: 'asset',
          fields: [
            defineField({ name: 'name', title: 'Account Name', type: 'string', description: 'e.g. "Roth IRA", "TSP", "House (paid off)"', validation: (r) => r.required() }),
            defineField({ name: 'institution', title: 'Institution', type: 'string', description: 'e.g. "Vanguard", "Fidelity", "Thrift Savings Plan"' }),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              options: {
                list: [
                  { title: 'Real Estate', value: 'real-estate' },
                  { title: 'Retirement', value: 'retirement' },
                  { title: 'Investment', value: 'investment' },
                  { title: 'Cash / HSA', value: 'cash' },
                  { title: "Kids / Trump Account", value: 'kids' },
                ],
              },
              validation: (r) => r.required(),
            }),
            defineField({ name: 'balance', title: 'Balance (USD)', type: 'number', validation: (r) => r.required().min(0) }),
            defineField({
              name: 'screenshot',
              title: 'Screenshot',
              type: 'image',
              description: 'Upload the account screenshot for proof. Shown in a lightbox when a visitor clicks the card.',
              options: { hotspot: true },
            }),
            defineField({ name: 'note', title: 'Note (optional)', type: 'string', description: 'Short context, e.g. "Paid off in 2yr 9mo"' }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'institution', media: 'screenshot' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { updated: 'lastUpdated' },
    prepare({ updated }) {
      return { title: 'Net Worth', subtitle: updated ? `Updated ${updated}` : 'Not set yet' }
    },
  },
})
