import { toolOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/toolOgCard'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Military Retirement Planner'

export default function Image() {
  return toolOgImage('/tools/military-retirement')
}
