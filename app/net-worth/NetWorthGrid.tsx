'use client'

import { useState } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity'
import type { NetWorthAsset } from '@/lib/types'

const categoryLabels: Record<NetWorthAsset['category'], string> = {
  'real-estate': 'Real Estate',
  retirement: 'Retirement',
  investment: 'Investment',
  cash: 'Cash / HSA',
  kids: 'Kids',
}

function currency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function NetWorthGrid({ assets }: { assets: NetWorthAsset[] }) {
  const [active, setActive] = useState<NetWorthAsset | null>(null)

  return (
    <>
      <div className="nw-grid">
        {assets.map((asset) => (
          <button
            key={asset.name}
            type="button"
            className="nw-card"
            onClick={() => asset.screenshot && setActive(asset)}
            style={{ cursor: asset.screenshot ? 'pointer' : 'default' }}
          >
            <span className="nw-card-tag">{categoryLabels[asset.category]}</span>
            <h3>{asset.name}</h3>
            {asset.institution && <p className="nw-card-institution">{asset.institution}</p>}
            <div className="nw-card-balance">{currency(asset.balance)}</div>
            {asset.note && <p className="nw-card-note">{asset.note}</p>}
            {asset.screenshot && <span className="nw-card-proof">View screenshot →</span>}
          </button>
        ))}
      </div>

      {active && (
        <div className="nw-lightbox" onClick={() => setActive(null)}>
          <div className="nw-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="nw-lightbox-close" onClick={() => setActive(null)} aria-label="Close">
              ✕
            </button>
            {active.screenshot && (
              <Image
                src={urlFor(active.screenshot).width(1000).url()}
                alt={active.screenshot.alt ?? `${active.name} screenshot`}
                width={1000}
                height={1400}
                style={{ width: '100%', height: 'auto', borderRadius: 10 }}
              />
            )}
            <p className="nw-lightbox-caption">{active.name} — {currency(active.balance)}</p>
          </div>
        </div>
      )}
    </>
  )
}
