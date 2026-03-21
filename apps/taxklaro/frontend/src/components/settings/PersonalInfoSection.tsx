import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface PersonalInfoSectionProps {
  fullName: string;
  email: string;
  onSave: (data: { fullName: string }) => Promise<void>;
}

export function PersonalInfoSection({ fullName, email, onSave }: PersonalInfoSectionProps) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await onSave({ fullName: fd.get('fullName') as string });
  }

  return (
    <div className="border-b border-zinc-800 pb-8 mb-8">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-4">Personal Information</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-zinc-300">Full Name</Label>
          <Input id="fullName" name="fullName" defaultValue={fullName} className="h-11 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-600" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Email</Label>
          <Input value={email} disabled className="h-11 bg-zinc-900 border-zinc-800 text-zinc-400" />
        </div>
        <Button type="submit" size="sm">
          <Save className="h-4 w-4 mr-2" />Save Changes
        </Button>
      </form>
    </div>
  );
}

export default PersonalInfoSection;
