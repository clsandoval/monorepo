/**
 * Save-state indicator for the succession wizard.
 *
 * The copy and the variants are COPIED VERBATIM from the estate-tax wizard
 * (`frontend/src/components/tax/EstateTaxWizard.tsx:99-104`) rather than invented, so the two wizards
 * say the same thing to the same lawyer about the same kind of event.
 *
 * `idle` renders NOTHING — not an empty wrapper, not a spacer. This is not a style choice. The
 * succession wizard's five registered journey steps each screenshot a screen nobody has typed into,
 * where the status is always `idle`; a badge rendered there would change five approved reference
 * images, and approving a first reference is a human visual judgement no plan in this phase may make.
 *
 * A failed save is never rendered as success: the status originates in exactly one place —
 * `useAutoSave`'s `catch` branch — and this component is a total function of it with no
 * default-to-success branch.
 */
import type { AutoSaveStatus } from '@/types';
import { Badge } from '@/components/ui/badge';

export function SaveStatusBadge({ status }: { status: AutoSaveStatus }) {
  const config = {
    saving: { label: 'Saving...', variant: 'secondary' as const },
    saved: { label: 'Saved', variant: 'secondary' as const },
    error: { label: 'Save error', variant: 'destructive' as const },
    idle: null,
  }[status];

  if (!config) return null;

  return (
    <Badge data-testid="wizard-save-status" variant={config.variant}>
      {config.label}
    </Badge>
  );
}
