export interface Testimonial {
  _id: string
  name: string
  branch: string
  challenge: string
  breakthrough: string
  advice: string
  publishedAt?: string
  order?: number
}

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
