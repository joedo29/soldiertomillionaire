import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = imageUrlBuilder(client)
export const urlFor = (source: SanityImageSource) => builder.image(source)

// GROQ queries
export const allPostsQuery = `
  *[_type == "post"] | order(publishedAt desc) {
    _id, title, slug, publishedAt, excerpt, mainImage, tags
  }
`

export const postBySlugQuery = `
  *[_type == "post" && slug.current == $slug][0] {
    _id, title, slug, publishedAt, excerpt, mainImage, tags, body
  }
`

export const recentPostsQuery = `
  *[_type == "post"] | order(publishedAt desc) [0...3] {
    _id, title, slug, publishedAt, excerpt, mainImage, tags
  }
`

export const allTestimonialsQuery = `
  *[_type == "testimonial"] | order(order asc, publishedAt desc) {
    _id, name, branch, challenge, breakthrough, advice, publishedAt, order
  }
`
