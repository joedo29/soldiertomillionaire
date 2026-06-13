'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  from: number
  to: number
  prefix?: string
  suffix?: string
  duration?: number
}

export default function CountUp({
  from,
  to,
  prefix = '',
  suffix = '',
  duration = 1800,
}: CountUpProps) {
  const [value, setValue] = useState(from)
  const ref = useRef<HTMLSpanElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || animated.current) return
        animated.current = true
        observer.disconnect()

        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
          setValue(Math.round(from + (to - from) * eased))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [from, to, duration])

  return (
    <span ref={ref}>
      {prefix}{value}{suffix}
    </span>
  )
}
