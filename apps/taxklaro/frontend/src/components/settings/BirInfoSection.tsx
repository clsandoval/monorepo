import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface BirInfoSectionProps {
  tin?: string | null;
  rdoCode?: string | null;
  onSave: (data: { tin: string; rdoCode: string }) => Promise<void>;
}

export function BirInfoSection({ tin, rdoCode, onSave }: BirInfoSectionProps) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await onSave({ tin: fd.get('tin') as string, rdoCode: fd.get('rdoCode') as string });
  }

  return (
    <div className="border-b border-border pb-8 mb-8">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-4">BIR Information</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="tin" className="text-gray-700">TIN</Label>
          <Input id="tin" name="tin" defaultValue={tin ?? ''} placeholder="000-000-000-000" maxLength={15} className="h-11" />
          <p className="text-xs text-muted-foreground">Format: 000-000-000-000 (12 digits with dashes)</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rdoCode" className="text-gray-700">RDO Code</Label>
          <Input id="rdoCode" name="rdoCode" defaultValue={rdoCode ?? ''} placeholder="e.g. 051" className="h-11" />
        </div>
        <Button type="submit" size="sm">
          <Save className="h-4 w-4 mr-2" />Save Changes
        </Button>
      </form>
    </div>
  );
}

export default BirInfoSection;
