import { toolOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/toolOgCard'

// Twitter/X needs its own file: the root layout's openGraph.images is inherited
// as the twitter:image fallback and would otherwise win over the generated card.
export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Military Retirement Planner'

export default function Image() {
  return toolOgImage('/tools/military-retirement')
}
