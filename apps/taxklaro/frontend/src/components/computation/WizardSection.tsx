import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'

interface WizardSectionProps {
  id: string
  title: string
  summary?: string
  completed: boolean
  children: React.ReactNode
}

export function WizardSection({ id, title, summary, completed, children }: WizardSectionProps) {
  return (
    <AccordionItem value={id} className="border-b border-zinc-800 last:border-b-0">
      <AccordionTrigger className="py-5 text-base font-medium hover:no-underline">
        <div className="flex flex-1 items-center justify-between gap-3 pr-2">
          <div className="flex items-center gap-3">
            <div
              className="h-2 w-2 rounded-full shrink-0 transition-colors duration-300"
              style={{ backgroundColor: completed ? '#FAFAFA' : 'rgba(255,255,255,0.2)' }}
            />
            <span>{title}</span>
          </div>
          {summary && (
            <span className="text-xs text-zinc-500 truncate max-w-[200px]">{summary}</span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-6">
        <div className="space-y-8 pt-2">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
