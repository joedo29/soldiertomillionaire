'use client'

import { useMemo, useState } from 'react'
import PostCard from '@/components/PostCard'
import type { Post } from '@/lib/types'

const VISIBLE_TAGS = 8

export default function BlogExplorer({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showAllTags, setShowAllTags] = useState(false)

  const allTags = useMemo(() => {
    const counts = new Map<string, number>()
    posts.forEach(post => {
      post.tags?.forEach(tag => counts.set(tag, (counts.get(tag) ?? 0) + 1))
    })
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [posts])

  const tags = useMemo(() => {
    if (showAllTags) return allTags
    const top = allTags.slice(0, VISIBLE_TAGS)
    // keep the active tag visible even if it ranks below the cutoff
    if (activeTag && !top.some(([tag]) => tag === activeTag)) {
      const held = allTags.find(([tag]) => tag === activeTag)
      if (held) top.push(held)
    }
    return top
  }, [allTags, showAllTags, activeTag])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter(post => {
      if (activeTag && !post.tags?.includes(activeTag)) return false
      if (!q) return true
      const haystack = [post.title, post.excerpt ?? '', ...(post.tags ?? [])].join(' ').toLowerCase()
      return q.split(/\s+/).every(word => haystack.includes(word))
    })
  }, [posts, query, activeTag])

  return (
    <>
      <div className="blog-controls">
        <div className="blog-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
          <input
            type="search"
            placeholder="Search posts — TSP, BAH, index funds..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search blog posts"
          />
          {query && (
            <button type="button" className="blog-search-clear" onClick={() => setQuery('')} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        <div className="blog-tagbar" role="group" aria-label="Filter by topic">
          <button
            type="button"
            className={`blog-tagpill${activeTag === null ? ' active' : ''}`}
            onClick={() => setActiveTag(null)}
          >
            All <span>{posts.length}</span>
          </button>
          {tags.map(([tag, count]) => (
            <button
              key={tag}
              type="button"
              className={`blog-tagpill${activeTag === tag ? ' active' : ''}`}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
            >
              {tag} <span>{count}</span>
            </button>
          ))}
          {allTags.length > VISIBLE_TAGS && (
            <button
              type="button"
              className="blog-tagpill blog-tagpill-more"
              onClick={() => setShowAllTags(v => !v)}
            >
              {showAllTags ? 'Show fewer' : `+${allTags.length - tags.length} more`}
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🔍</div>
          <p>
            Nothing matches{query ? ` “${query}”` : ''}{activeTag ? ` in ${activeTag}` : ''}.
            Try a different search or clear the filters.
          </p>
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={() => { setQuery(''); setActiveTag(null) }}
          >
            Show All Posts
          </button>
        </div>
      ) : (
        <>
          {(query || activeTag) && (
            <p className="blog-result-count">
              {filtered.length} {filtered.length === 1 ? 'post' : 'posts'} found
            </p>
          )}
          <div className="posts-grid">
            {filtered.map(post => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
