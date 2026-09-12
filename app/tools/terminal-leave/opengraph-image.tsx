import { toolOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/toolOgCard'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'Terminal Leave vs. Sell-Back Calculator'

export default function Image() {
  return toolOgImage('/tools/terminal-leave')
}
