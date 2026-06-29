import type { Metadata } from 'next'
import MilitaryWealthPath from './product'

export const metadata: Metadata = {
  title: 'Military Wealth Path — See Your $100K, $500K and $1M Timeline',
  description:
    'A simple wealth projection tool for soldiers. See when you could reach $100K, $500K and $1M, then get a personalized plan to move faster.',
  keywords: [
    'military wealth calculator',
    'TSP calculator for soldiers',
    'military millionaire calculator',
    'soldier financial freedom plan',
    'Roth IRA calculator military',
  ],
}

export default function MilitaryWealthPathPage() {
  return <MilitaryWealthPath />
}
