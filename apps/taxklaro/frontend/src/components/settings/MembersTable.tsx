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
      <div className="min-w-[480px] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/80">
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-zinc-500">Name</th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-zinc-500">Email</th>
              <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wide text-zinc-500">Role</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-50">{m.name}</td>
                <td className="px-4 py-3 text-zinc-400">{m.email}</td>
                <td className="px-4 py-3 capitalize text-zinc-300">{m.role}</td>
                <td className="px-4 py-3 text-right">
                  {m.id !== currentUserId && onRemove && (
                    <Button size="sm" variant="ghost" onClick={() => onRemove(m.id)} className="text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800">
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
