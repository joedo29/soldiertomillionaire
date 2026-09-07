import { toolOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/toolOgCard'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'VA Combined Rating Calculator'

export default function Image() {
  return toolOgImage('/tools/va-disability-rating')
}
