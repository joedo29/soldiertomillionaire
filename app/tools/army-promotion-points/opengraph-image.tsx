import { toolOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/toolOgCard'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Army Promotion Point Calculator'

export default function Image() {
  return toolOgImage('/tools/army-promotion-points')
}
