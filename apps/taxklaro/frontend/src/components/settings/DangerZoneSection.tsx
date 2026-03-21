// DangerZoneSection: Shown only when userRole === 'admin' (spec §14.4).
import { Button } from '@/components/ui/button';

interface DangerZoneSectionProps {
  orgName: string;
  onDeleteOrg: () => Promise<void>;
}

export function DangerZoneSection({ orgName, onDeleteOrg }: DangerZoneSectionProps) {
  return (
    <div className="border border-red-900/50 bg-red-950/20 rounded-xl p-6 space-y-3">
      <p className="text-[11px] uppercase tracking-wide text-red-500/70 mb-4">Danger Zone</p>
      <p className="text-sm text-zinc-400">
        Delete the organization <strong className="text-zinc-200">{orgName}</strong>. This action is irreversible.
      </p>
      <Button variant="destructive" size="sm" onClick={onDeleteOrg}>
        Delete Organization
      </Button>
    </div>
  );
}

export default DangerZoneSection;
