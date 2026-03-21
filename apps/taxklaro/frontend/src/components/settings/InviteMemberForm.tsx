import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';

interface InviteMemberFormProps {
  onInvite: (email: string, role: string) => Promise<void>;
}

export function InviteMemberForm({ onInvite }: InviteMemberFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    await onInvite(email.trim(), role);
    setEmail('');
    setIsSubmitting(false);
  }

  return (
    <div className="border-b border-border pb-8 mb-8">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-4">Invite Member</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="invite-email" className="text-gray-700">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-700">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-32 h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" size="sm" disabled={isSubmitting || !email.trim()}>
          <UserPlus className="h-4 w-4 mr-2" />Send Invitation
        </Button>
      </form>
    </div>
  );
}

export default InviteMemberForm;
