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
    <div className="border-b border-border pb-8 mb-8">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-4">Personal Information</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
          <Input id="fullName" name="fullName" defaultValue={fullName} className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-gray-700">Email</Label>
          <Input value={email} disabled className="h-11" />
        </div>
        <Button type="submit" size="sm">
          <Save className="h-4 w-4 mr-2" />Save Changes
        </Button>
      </form>
    </div>
  );
}

export default PersonalInfoSection;
