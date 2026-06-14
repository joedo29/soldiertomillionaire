import type { Metadata } from 'next'
import StrategyContent from './StrategyContent'

export const metadata: Metadata = {
  title: 'The Strategy — How I Built $750K on an Army Salary',
  description:
    'The exact five-step financial freedom strategy I used: become debt free, save aggressively, max tax-advantaged accounts, invest in S&P 500, and pay off your home fast.',
  keywords: ['military financial strategy', 'TSP investing strategy', 'S&P 500 index fund investing', 'Roth IRA military', 'how to invest in the army', 'military debt free', 'pay off mortgage early'],
}

export default function StrategyPage() {
  return <StrategyContent />
}
