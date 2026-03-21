import { useState, useCallback } from 'react'
import { Accordion } from '@/components/ui/accordion'
import { WizardSection } from './WizardSection'
import { SectionProgressBar } from './SectionProgressBar'
import { ComputeButton } from './ComputeButton'
import { computeActiveSteps } from '@/lib/wizard-routing'
import type { WizardFormData, WizardStepId } from '@/types/wizard'

// Import all 17 step components directly
import { WS00ModeSelection } from '@/components/wizard/WS00ModeSelection'
import { WS01TaxpayerProfile } from '@/components/wizard/WS01TaxpayerProfile'
import { WS02BusinessType } from '@/components/wizard/WS02BusinessType'
import { WS03TaxYear } from '@/components/wizard/WS03TaxYear'
import { WS04GrossReceipts } from '@/components/wizard/WS04GrossReceipts'
import { WS05Compensation } from '@/components/wizard/WS05Compensation'
import { WS06ExpenseMethod } from '@/components/wizard/WS06ExpenseMethod'
import { WS07AItemizedExpenses } from '@/components/wizard/WS07AItemizedExpenses'
import { WS07BFinancialItems } from '@/components/wizard/WS07BFinancialItems'
import { WS07CDepreciation } from '@/components/wizard/WS07CDepreciation'
import { WS07DNolco } from '@/components/wizard/WS07DNolco'
import { WS08CwtForm2307 } from '@/components/wizard/WS08CwtForm2307'
import { WS09PriorQuarterly } from '@/components/wizard/WS09PriorQuarterly'
import { WS10Registration } from '@/components/wizard/WS10Registration'
import { WS11RegimeElection } from '@/components/wizard/WS11RegimeElection'
import { WS12FilingDetails } from '@/components/wizard/WS12FilingDetails'
import { WS13PriorYearCredits } from '@/components/wizard/WS13PriorYearCredits'

// Step component lookup
const STEP_COMPONENTS: Record<WizardStepId, React.ComponentType<{
  data: Partial<WizardFormData>
  onChange: (u: Partial<WizardFormData>) => void
  onNext?: () => void
  onBack?: () => void
}>> = {
  WS00: WS00ModeSelection,
  WS01: WS01TaxpayerProfile,
  WS02: WS02BusinessType,
  WS03: WS03TaxYear,
  WS04: WS04GrossReceipts,
  WS05: WS05Compensation,
  WS06: WS06ExpenseMethod,
  WS07A: WS07AItemizedExpenses,
  WS07B: WS07BFinancialItems,
  WS07C: WS07CDepreciation,
  WS07D: WS07DNolco,
  WS08: WS08CwtForm2307,
  WS09: WS09PriorQuarterly,
  WS10: WS10Registration,
  WS11: WS11RegimeElection,
  WS12: WS12FilingDetails,
  WS13: WS13PriorYearCredits,
  REVIEW: () => null, // Not used in accordion mode
}

// Section definitions
interface SectionDef {
  id: string
  name: string
  stepIds: WizardStepId[]
  getSummary: (data: Partial<WizardFormData>) => string
}

const SECTIONS: SectionDef[] = [
  {
    id: 'taxpayer-profile',
    name: 'Taxpayer Profile',
    stepIds: ['WS00', 'WS01', 'WS02'],
    getSummary: (d) =>
      [d.computationTitle, d.taxpayerType?.replace(/_/g, ' ')].filter(Boolean).join(' \u2014 '),
  },
  {
    id: 'period-income',
    name: 'Period & Income',
    stepIds: ['WS03', 'WS04', 'WS05'],
    getSummary: (d) => {
      const parts: string[] = []
      if (d.taxYear) parts.push(String(d.taxYear))
      if (d.filingPeriod) parts.push(d.filingPeriod)
      if (d.grossReceipts && d.grossReceipts !== '0.00') parts.push('\u20B1' + d.grossReceipts)
      return parts.join(' \u2014 ')
    },
  },
  {
    id: 'deductions-expenses',
    name: 'Deductions & Expenses',
    stepIds: ['WS06', 'WS07A', 'WS07B', 'WS07C', 'WS07D'],
    getSummary: (d) => {
      if (d.osdElected === true) return 'OSD'
      if (d.osdElected === false) return 'Itemized'
      return ''
    },
  },
  {
    id: 'tax-credits-payments',
    name: 'Tax Credits & Payments',
    stepIds: ['WS08', 'WS09', 'WS13'],
    getSummary: () => '',
  },
  {
    id: 'regime-filing',
    name: 'Regime & Filing',
    stepIds: ['WS10', 'WS11', 'WS12'],
    getSummary: (d) => {
      if (d.electedRegime === 'ELECT_EIGHT_PCT') return '8% Flat Rate'
      if (d.electedRegime === 'ELECT_OSD') return 'OSD'
      if (d.electedRegime === 'ELECT_ITEMIZED') return 'Itemized'
      return ''
    },
  },
]

interface AccordionWizardProps {
  data: Partial<WizardFormData>
  onChange: (updates: Partial<WizardFormData>) => void
  onCompute: () => void
  computing: boolean
}

export function AccordionWizard({ data, onChange, onCompute, computing }: AccordionWizardProps) {
  const [openSection, setOpenSection] = useState<string>(SECTIONS[0].id)
  const [visitedSections, setVisitedSections] = useState<Set<string>>(new Set([SECTIONS[0].id]))

  const activeSteps = computeActiveSteps(data)

  // Filter each section's steps to only include active ones
  const getActiveStepsForSection = useCallback(
    (section: SectionDef) => section.stepIds.filter((id) => activeSteps.includes(id)),
    [activeSteps],
  )

  // Track visited sections for completion heuristic
  const handleSectionChange = useCallback(
    (value: string) => {
      setOpenSection(value)
      if (value) {
        setVisitedSections((prev) => new Set([...prev, value]))
      }
    },
    [],
  )

  // A section is "completed" when it's been visited and the user has moved to another section
  const isSectionCompleted = useCallback(
    (sectionId: string) => {
      return visitedSections.has(sectionId) && openSection !== sectionId
    },
    [visitedSections, openSection],
  )

  const completedCount = SECTIONS.filter((s) => isSectionCompleted(s.id)).length

  // No-op handlers for step components that expect onNext/onBack
  const noop = useCallback(() => {}, [])

  return (
    <div>
      <SectionProgressBar total={SECTIONS.length} completed={completedCount} />

      <Accordion
        type="single"
        collapsible
        value={openSection}
        onValueChange={handleSectionChange}
      >
        {SECTIONS.map((section) => {
          const sectionSteps = getActiveStepsForSection(section)
          if (sectionSteps.length === 0) return null

          return (
            <WizardSection
              key={section.id}
              id={section.id}
              title={section.name}
              summary={section.getSummary(data)}
              completed={isSectionCompleted(section.id)}
            >
              {sectionSteps.map((stepId) => {
                const StepComponent = STEP_COMPONENTS[stepId]
                if (!StepComponent) return null
                return (
                  <StepComponent
                    key={stepId}
                    data={data}
                    onChange={onChange}
                    onNext={noop}
                    onBack={noop}
                  />
                )
              })}
            </WizardSection>
          )
        })}
      </Accordion>

      <ComputeButton disabled={false} loading={computing} onClick={onCompute} />
    </div>
  )
}
