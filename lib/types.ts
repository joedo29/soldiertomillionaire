export interface Post {
  _id: string
  title: string
  slug: { current: string }
  publishedAt: string
  excerpt?: string
  mainImage?: { asset: { _ref: string }; alt?: string }
  tags?: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any[]
}
