import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Save } from 'lucide-react';

interface FirmBrandingSectionProps {
  firmName: string;
  logoUrl?: string | null;
  onSave: (data: { firmName: string }) => Promise<void>;
  onUploadLogo: (file: File) => Promise<void>;
}

export function FirmBrandingSection({ firmName, logoUrl, onSave, onUploadLogo }: FirmBrandingSectionProps) {
  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await onUploadLogo(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await onSave({ firmName: fd.get('firmName') as string });
  }

  return (
    <div className="border-b border-zinc-800 pb-8 mb-8">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-4">Firm Branding</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="firmName" className="text-zinc-300">Firm Name</Label>
          <Input id="firmName" name="firmName" defaultValue={firmName} className="h-11 bg-zinc-900 border-zinc-800 text-zinc-50 placeholder:text-zinc-600" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-zinc-300">Logo</Label>
          <label className="cursor-pointer block">
            <div className="border-2 border-dashed border-zinc-800 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-zinc-600 hover:bg-zinc-800/30 transition-colors">
              {logoUrl ? (
                <img src={logoUrl} alt="Firm logo" className="h-16 object-contain" />
              ) : (
                <Upload className="h-8 w-8 text-zinc-500" />
              )}
              <span className="text-sm text-zinc-500">{logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </label>
        </div>
        <Button type="submit" size="sm">
          <Save className="h-4 w-4 mr-2" />Save Changes
        </Button>
      </form>
    </div>
  );
}

export default FirmBrandingSection;
