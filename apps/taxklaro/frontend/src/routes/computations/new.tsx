import { useState, useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { authenticatedRoute } from '../__root';
import { authGuard } from '../../lib/auth-guard';
import { CenteredColumn } from '../../components/layout/CenteredColumn';
import { Spinner } from '../../components/shared/Spinner';
import { useOrganization } from '../../hooks/useOrganization';
import { createComputation } from '../../lib/computations';
import { createDefaultTaxpayerInput } from '../../types/engine-input';

export const ComputationsNewRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/computations/new',
  beforeLoad: authGuard,
  component: ComputationsNewPage,
});

function ComputationsNewPage() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!orgId || creating) return;
    setCreating(true);

    const input = createDefaultTaxpayerInput();
    createComputation(orgId, null, 'Untitled Computation', input).then((record) => {
      if (record) {
        navigate({ to: '/computations/$compId', params: { compId: record.id }, replace: true });
      }
    });
  }, [orgId, navigate, creating]);

  return (
    <CenteredColumn wide>
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    </CenteredColumn>
  );
}
