import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Invitation {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

interface PendingInvitationsTableProps {
  invitations: Invitation[];
  onRevoke?: (id: string) => Promise<void>;
}

export function PendingInvitationsTable({ invitations, onRevoke }: PendingInvitationsTableProps) {
  if (invitations.length === 0) {
    return <p className="text-sm text-zinc-500">No pending invitations.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl">
      <div className="min-w-[480px] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-zinc-500">Email</th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-zinc-500">Role</th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-zinc-500">Sent</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv) => (
              <tr key={inv.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-50">{inv.email}</td>
                <td className="px-4 py-3 capitalize text-zinc-300">{inv.role}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {new Date(inv.createdAt).toLocaleDateString('en-PH')}
                </td>
                <td className="px-4 py-3 text-right">
                  {onRevoke && (
                    <Button size="sm" variant="ghost" onClick={() => onRevoke(inv.id)} className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800">
                      <X className="h-4 w-4 mr-1" />Revoke
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PendingInvitationsTable;
