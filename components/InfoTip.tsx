'use client'

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface InfoTipProps {
  title: string
  /** Short formula or rule shown in a monospace band. */
  formula?: string
  children: ReactNode
  /** Statute or agency the rule comes from. */
  source?: string
  href?: string
}

const GAP = 8

export default function InfoTip({ title, formula, children, source, href }: InfoTipProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const id = useId()

  /**
   * The popover is fixed-positioned rather than absolute. These tips live inside
   * a horizontally scrollable table, which is a clipping context — an absolutely
   * positioned popover gets cut off there and can also run off the viewport on
   * narrow screens. Fixed positioning plus clamping avoids both.
   */
  const place = useCallback(() => {
    const btn = btnRef.current
    const pop = popRef.current
    if (!btn || !pop) return

    const b = btn.getBoundingClientRect()
    const p = pop.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const vh = document.documentElement.clientHeight

    let left = b.left
    left = Math.min(left, vw - p.width - GAP)
    left = Math.max(GAP, left)

    // Flip above the button when there is not enough room below.
    let top = b.bottom + GAP
    if (top + p.height > vh - GAP && b.top - p.height - GAP > GAP) {
      top = b.top - p.height - GAP
    }

    setPos({ top, left })
  }, [])

  useLayoutEffect(() => {
    if (open) place()
  }, [open, place])

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node
      if (!btnRef.current?.contains(t) && !popRef.current?.contains(t)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', place)
    // Capture phase so scrolling inside the table also repositions the popover.
    window.addEventListener('scroll', place, true)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, place])

  return (
    <span className="tip-wrap">
      <button
        ref={btnRef}
        type="button"
        className={`tip-btn${open ? ' active' : ''}`}
        aria-expanded={open}
        aria-controls={id}
        aria-label={`How ${title} is calculated`}
        onClick={() => setOpen((o) => !o)}
      >
        i
      </button>
      {open && (
        <div
          ref={popRef}
          className="tip-pop"
          id={id}
          role="dialog"
          aria-label={title}
          style={{
            top: pos?.top ?? 0,
            left: pos?.left ?? 0,
            visibility: pos ? 'visible' : 'hidden',
          }}
        >
          <span className="tip-title">{title}</span>
          {formula && <span className="tip-formula">{formula}</span>}
          <span className="tip-body">{children}</span>
          {source &&
            (href ? (
              <a className="tip-source" href={href} target="_blank" rel="noopener noreferrer">
                {source} ↗
              </a>
            ) : (
              <span className="tip-source">{source}</span>
            ))}
        </div>
      )}
    </span>
  )
}
