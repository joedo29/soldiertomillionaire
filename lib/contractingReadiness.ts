export interface Choice {
  value: string
  label: string
  points: number
}

export interface Question {
  id: string
  question: string
  help?: string
  choices: Choice[]
}

export interface Step {
  title: string
  body: string
  linkLabel?: string
  linkHref?: string
}

export const questions: Question[] = [
  {
    id: 'veteranStatus',
    question: 'What is your veteran status?',
    help: 'Service-disabled veterans qualify for additional set-aside programs.',
    choices: [
      { value: 'sdv', label: 'Service-disabled veteran with a VA rating', points: 15 },
      { value: 'veteran', label: 'Veteran, no service-connected disability rating', points: 12 },
      { value: 'spouse', label: 'Surviving spouse of a veteran', points: 10 },
      { value: 'none', label: 'Not a veteran', points: 0 },
    ],
  },
  {
    id: 'ownership',
    question: 'Do veterans own and control at least 51% of the business?',
    help: 'Both ownership and day-to-day control are required for VOSB/SDVOSB certification.',
    choices: [
      { value: 'yes', label: 'Yes — 51%+ ownership and daily control', points: 15 },
      { value: 'ownership-only', label: 'Own 51%+ but do not run daily operations', points: 5 },
      { value: 'under', label: 'Less than 51% veteran-owned', points: 0 },
      { value: 'unsure', label: 'Not sure', points: 3 },
    ],
  },
  {
    id: 'entity',
    question: 'Is your business a registered legal entity?',
    help: 'You need a formal entity and EIN before registering in SAM.gov.',
    choices: [
      { value: 'formed', label: 'Yes — LLC, corporation, or partnership with an EIN', points: 12 },
      { value: 'sole-prop', label: 'Sole proprietor with an EIN', points: 7 },
      { value: 'none', label: 'Not formally registered yet', points: 0 },
    ],
  },
  {
    id: 'sam',
    question: 'Are you registered in SAM.gov?',
    help: 'SAM.gov registration is mandatory and free. It issues your Unique Entity ID (UEI).',
    choices: [
      { value: 'active', label: 'Yes — active registration with a UEI', points: 20 },
      { value: 'in-progress', label: 'Started but not finished', points: 8 },
      { value: 'expired', label: 'Registered but expired', points: 6 },
      { value: 'no', label: 'Not registered', points: 0 },
    ],
  },
  {
    id: 'certification',
    question: 'Are you certified as a VOSB or SDVOSB through SBA VetCert?',
    help: 'Certification is required to compete for VOSB/SDVOSB set-aside and sole-source contracts.',
    choices: [
      { value: 'sdvosb', label: 'Yes — certified SDVOSB', points: 18 },
      { value: 'vosb', label: 'Yes — certified VOSB', points: 15 },
      { value: 'applied', label: 'Application submitted, awaiting decision', points: 8 },
      { value: 'no', label: 'Not certified', points: 0 },
    ],
  },
  {
    id: 'naics',
    question: 'Have you identified the NAICS codes for what you sell?',
    help: 'Agencies search and set aside contracts by NAICS code. You need the right ones on your SAM profile.',
    choices: [
      { value: 'yes', label: 'Yes — codes identified and on my SAM profile', points: 8 },
      { value: 'some', label: 'I have a rough idea', points: 4 },
      { value: 'no', label: 'No', points: 0 },
    ],
  },
  {
    id: 'pastPerformance',
    question: 'What past performance can you document?',
    help: 'Contracting officers weigh relevant, documented past performance heavily.',
    choices: [
      { value: 'federal', label: 'Prior federal contracts or subcontracts', points: 12 },
      { value: 'commercial', label: 'Commercial or state/local clients with references', points: 8 },
      { value: 'limited', label: 'Some work, but little documentation', points: 4 },
      { value: 'none', label: 'No past performance yet', points: 0 },
    ],
  },
  {
    id: 'capability',
    question: 'Do you have a capability statement?',
    help: 'A one-page capability statement is the standard door-opener with contracting officers.',
    choices: [
      { value: 'yes', label: 'Yes — current and tailored to federal buyers', points: 10 },
      { value: 'outdated', label: 'I have one but it is generic or outdated', points: 5 },
      { value: 'no', label: 'No', points: 0 },
    ],
  },
]

export const maxScore = questions.reduce(
  (sum, q) => sum + Math.max(...q.choices.map((c) => c.points)),
  0,
)

export type Answers = Record<string, string>

export interface ReadinessResult {
  score: number
  percent: number
  tier: string
  tierSummary: string
  steps: Step[]
}

function tierFor(percent: number): { tier: string; tierSummary: string } {
  if (percent >= 85) {
    return {
      tier: 'Contract Ready',
      tierSummary:
        'You have the foundation in place. Your focus now shifts from paperwork to pipeline — finding the right opportunities and building agency relationships.',
    }
  }
  if (percent >= 60) {
    return {
      tier: 'Nearly Ready',
      tierSummary:
        'The core is solid but a few gaps will block you from bidding competitively. Close the items below and you are in the game.',
    }
  }
  if (percent >= 35) {
    return {
      tier: 'Building Foundation',
      tierSummary:
        'You have made a start. The registrations and certifications below are the gate you must clear before federal buyers can find or award to you.',
    }
  }
  return {
    tier: 'Getting Started',
    tierSummary:
      'You are at the beginning, which is exactly where every contractor starts. Work the list in order — each step unlocks the next.',
  }
}

export function evaluate(answers: Answers): ReadinessResult {
  let score = 0
  for (const q of questions) {
    const choice = q.choices.find((c) => c.value === answers[q.id])
    if (choice) score += choice.points
  }

  const percent = Math.round((score / maxScore) * 100)
  const { tier, tierSummary } = tierFor(percent)
  const steps: Step[] = []

  const a = answers

  if (a.entity === 'none') {
    steps.push({
      title: 'Form a legal business entity and get an EIN',
      body: 'Register your LLC or corporation with your state, then apply for a free EIN from the IRS. You cannot register in SAM.gov without one.',
      linkLabel: 'Apply for an EIN (IRS)',
      linkHref: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online',
    })
  }

  if (a.sam === 'no' || a.sam === 'in-progress') {
    steps.push({
      title: 'Complete your SAM.gov registration',
      body: 'This is mandatory to receive any federal contract, and it is free — never pay a third party for it. Registration issues your Unique Entity ID (UEI) and CAGE code. Budget a few weeks for validation.',
      linkLabel: 'Register at SAM.gov',
      linkHref: 'https://sam.gov/',
    })
  } else if (a.sam === 'expired') {
    steps.push({
      title: 'Renew your SAM.gov registration',
      body: 'SAM registrations must be renewed annually. An expired registration makes you ineligible for award and removes you from agency searches.',
      linkLabel: 'Renew at SAM.gov',
      linkHref: 'https://sam.gov/',
    })
  }

  if (a.naics === 'no' || a.naics === 'some') {
    steps.push({
      title: 'Pin down your NAICS codes',
      body: 'Agencies set aside and search for contracts by NAICS code. Identify every code that matches what you sell and make sure all of them are listed on your SAM.gov profile.',
      linkLabel: 'Look up NAICS codes',
      linkHref: 'https://www.census.gov/naics/',
    })
  }

  const ownershipOk = a.ownership === 'yes'
  const veteranOk = a.veteranStatus === 'sdv' || a.veteranStatus === 'veteran' || a.veteranStatus === 'spouse'

  if (a.certification === 'no' && veteranOk && ownershipOk) {
    steps.push({
      title:
        a.veteranStatus === 'sdv'
          ? 'Apply for SDVOSB certification through SBA VetCert'
          : 'Apply for VOSB certification through SBA VetCert',
      body: 'Since 2023 the SBA — not the VA — certifies veteran-owned firms. Certification is what makes you eligible for veteran set-aside and sole-source awards, including the government-wide 3% SDVOSB spending goal.',
      linkLabel: 'Apply at SBA VetCert',
      linkHref: 'https://veterans.certify.sba.gov/',
    })
  } else if (a.certification === 'applied') {
    steps.push({
      title: 'Keep your VetCert application moving',
      body: 'Respond quickly to any SBA request for documents — incomplete responses are the most common cause of delay. Meanwhile, you can still bid on full and open solicitations.',
      linkLabel: 'Check your VetCert status',
      linkHref: 'https://veterans.certify.sba.gov/',
    })
  }

  if (a.ownership === 'ownership-only' || a.ownership === 'unsure') {
    steps.push({
      title: 'Confirm your ownership and control structure',
      body: 'VOSB/SDVOSB certification requires that qualifying veterans both own at least 51% and control daily operations and long-term decisions. Review your operating agreement before applying — this is the most common reason applications are denied.',
      linkLabel: 'Review the eligibility rules',
      linkHref: 'https://www.sba.gov/federal-contracting/contracting-assistance-programs/veteran-contracting-assistance-programs',
    })
  }

  if (a.capability === 'no' || a.capability === 'outdated') {
    steps.push({
      title: 'Build a one-page capability statement',
      body: 'Include your core competencies, differentiators, past performance, UEI and CAGE codes, NAICS codes, and contact info. This is the document you send every contracting officer and prime you approach.',
      linkLabel: 'Get free help from an APEX Accelerator',
      linkHref: 'https://www.apexaccelerators.us/',
    })
  }

  if (a.pastPerformance === 'none' || a.pastPerformance === 'limited') {
    steps.push({
      title: 'Build past performance through subcontracting',
      body: 'Most firms win their first federal work as a subcontractor to a prime. Find primes with subcontracting plans in your NAICS codes and pitch them — then document every engagement for future proposals.',
      linkLabel: 'Search the SBA subcontracting network',
      linkHref: 'https://web.sba.gov/pro-net/search/dsp_dsbs.cfm',
    })
  }

  if (percent >= 60) {
    steps.push({
      title: 'Work your opportunity pipeline daily',
      body: 'Set saved searches on SAM.gov for your NAICS codes, review agency forecasts, and contact the small business specialist at agencies that buy what you sell. Relationships are built before the solicitation drops.',
      linkLabel: 'Search contract opportunities',
      linkHref: 'https://sam.gov/content/opportunities',
    })
  }

  steps.push({
    title: 'Get free one-on-one counseling',
    body: 'APEX Accelerators and SBA Veterans Business Outreach Centers provide free, government-funded help with registration, certification, and proposals. There is no reason to pay a consultant for this.',
    linkLabel: 'Find your local VBOC',
    linkHref: 'https://www.sba.gov/local-assistance/resource-partners/veterans-business-outreach-center-vboc-program',
  })

  return { score, percent, tier, tierSummary, steps }
}
