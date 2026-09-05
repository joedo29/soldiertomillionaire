/**
 * Custom icon family for the /tools index.
 *
 * Drawn as one set, not six sourced icons: every icon shares a 24x24 viewBox,
 * 1.7 stroke width, round caps and joins, and the same level of detail.
 *
 * Colour comes entirely from existing tokens. The main strokes use
 * `currentColor` so they inherit from `.tool-card-icon`, and the single accent
 * element in each icon is stroked/filled via `.ti-accent`, which CSS points at
 * the brand gold. That means hover states (and any future dark mode) are
 * handled in one place rather than baked into the markup.
 *
 * To add an icon for a new tool: draw it to the same spec, add a key here, and
 * add that key to the tool's entry in lib/tools.ts.
 */

export type ToolIconName =
  | 'contracting'
  | 'combinedRating'
  | 'retirement'
  | 'mortgage'
  | 'wealthPath'
  | 'ledger'

const ICONS: Record<ToolIconName, React.ReactNode> = {
  // Clipboard of completed checks with a qualification star — readiness review.
  contracting: (
    <>
      <path d="M9 4.4H7A1.6 1.6 0 0 0 5.4 6v13.4A1.6 1.6 0 0 0 7 21h10a1.6 1.6 0 0 0 1.6-1.6V6A1.6 1.6 0 0 0 17 4.4h-2" />
      <path d="M9.6 2.9h4.8a.9.9 0 0 1 .9.9v1.5a.9.9 0 0 1-.9.9H9.6a.9.9 0 0 1-.9-.9V3.8a.9.9 0 0 1 .9-.9z" />
      <path d="m8.4 11.3 1.3 1.3 2.5-2.5" />
      <path d="m8.4 16.4 1.3 1.3 2.5-2.5" />
      <path className="ti-accent-solid" d="m16.1 12.6.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" />
    </>
  ),

  // Two overlapping evaluations with a percent sign in the shared area —
  // ratings combining rather than adding.
  combinedRating: (
    <>
      <circle cx="8.9" cy="11.9" r="5" />
      <circle cx="15.1" cy="11.9" r="5" />
      <path className="ti-accent" d="m14.1 8.2-4.2 7.4" />
    </>
  ),

  // Service years climbing to a milestone flag — the 20-year cliff.
  retirement: (
    <>
      <path d="M3.6 20.3h16.8" />
      <path d="m4.6 18.6 4.2-3.4 3.4 2.4 4.3-5" />
      <path d="M16.5 12.6V4.9" />
      <path className="ti-accent-solid" d="M16.7 5.3 21 7.1l-4.3 1.8z" />
    </>
  ),

  // A house with the balance curve falling away beneath the roof.
  mortgage: (
    <>
      <path d="M3.7 10.9 12 4.2l8.3 6.7" />
      <path d="M6 9.7v10.6h12V9.7" />
      <path className="ti-accent" d="M7.9 12.4c2.2 3.5 4.7 4.7 8.3 5" />
    </>
  ),

  // Milestones along a rising path, the last one the goal.
  // Dots sit on the curve at t = 0.35 and t = 0.68, and grow toward the goal.
  wealthPath: (
    <>
      <path d="M4 19Q13 18.5 18.8 5.8" />
      <circle className="ti-node" cx="9.9" cy="17.2" r="1.75" />
      <circle className="ti-node" cx="14.8" cy="12.7" r="1.9" />
      <circle className="ti-accent-solid" cx="18.8" cy="5.8" r="2.1" />
    </>
  ),

  // A ledger with the month-over-month line drawn inside it.
  ledger: (
    <>
      <path d="M4.6 3.9h14.8a1.5 1.5 0 0 1 1.5 1.5v13.2a1.5 1.5 0 0 1-1.5 1.5H4.6a1.5 1.5 0 0 1-1.5-1.5V5.4a1.5 1.5 0 0 1 1.5-1.5z" />
      <path d="M7.6 4.1v15.9" />
      <path className="ti-accent" d="m10.4 15.7 2.5-3 2.2 1.7 3-4.5" />
    </>
  ),
}

export default function ToolIcon({ name }: { name: ToolIconName }) {
  return (
    <svg
      className="tool-icon"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  )
}
