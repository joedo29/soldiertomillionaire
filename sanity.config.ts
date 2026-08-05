import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Soldier to Millionaire',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sd61dwr0',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Net Worth')
              .child(S.document().schemaType('netWorth').documentId('netWorth')),
            S.divider(),
            ...S.documentTypeListItems().filter((item) => item.getId() !== 'netWorth'),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
})
