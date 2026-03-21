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
      <div className="min-w-[480px] bg-background rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50">
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-muted-foreground">Sent</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv) => (
              <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{inv.email}</td>
                <td className="px-4 py-3 capitalize text-gray-700">{inv.role}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(inv.createdAt).toLocaleDateString('en-PH')}
                </td>
                <td className="px-4 py-3 text-right">
                  {onRevoke && (
                    <Button size="sm" variant="ghost" onClick={() => onRevoke(inv.id)} className="text-muted-foreground hover:text-foreground hover:bg-gray-100">
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
