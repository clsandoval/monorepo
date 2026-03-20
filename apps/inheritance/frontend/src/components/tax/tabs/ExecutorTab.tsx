/**
 * Tab 2 — Executor Details (§4.23)
 */

import type { ExecutorDetails } from '@/types/estate-tax';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ExecutorTabProps {
  data: ExecutorDetails;
  onChange: (data: ExecutorDetails) => void;
}

export function ExecutorTab({ data, onChange }: ExecutorTabProps) {
  const update = (partial: Partial<ExecutorDetails>) => {
    onChange({ ...data, ...partial });
  };

  return (
    <div data-testid="executor-tab" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1e3a5f]">Executor Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The executor or administrator filing the estate tax return.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contact Information</CardTitle>
          <CardDescription>Details of the estate administrator or executor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="executor-name">Executor Name</Label>
            <Input
              id="executor-name"
              data-testid="executor-name"
              value={data.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Full legal name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="executor-tin">TIN</Label>
            <Input
              id="executor-tin"
              data-testid="executor-tin"
              value={data.tin}
              onChange={(e) => update({ tin: e.target.value })}
              placeholder="000-000-000-000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="executor-contact">Contact Number</Label>
            <Input
              id="executor-contact"
              data-testid="executor-contact"
              value={data.contact}
              onChange={(e) => update({ contact: e.target.value })}
              placeholder="+63 900 000 0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="executor-email">Email</Label>
            <Input
              id="executor-email"
              data-testid="executor-email"
              type="email"
              value={data.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="executor@email.com"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
