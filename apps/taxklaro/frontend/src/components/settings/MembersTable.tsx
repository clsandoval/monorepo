import { Button } from '@/components/ui/button';
import { UserMinus } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MembersTableProps {
  members: Member[];
  currentUserId?: string;
  onRemove?: (id: string) => Promise<void>;
}

export function MembersTable({ members, currentUserId, onRemove }: MembersTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl">
      <div className="min-w-[480px] bg-background rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-gray-50">
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-muted-foreground">Role</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{m.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                <td className="px-4 py-3 capitalize text-gray-700">{m.role}</td>
                <td className="px-4 py-3 text-right">
                  {m.id !== currentUserId && onRemove && (
                    <Button size="sm" variant="ghost" onClick={() => onRemove(m.id)} className="text-muted-foreground hover:text-foreground hover:bg-gray-100">
                      <UserMinus className="h-4 w-4 mr-1" />Remove
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

export default MembersTable;
