import { createRoute, redirect } from '@tanstack/react-router';
import { authenticatedRoute } from '../__root';
import { authGuard } from '../../lib/auth-guard';

export const ComputationsCompIdQuarterlyRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/computations/$compId/quarterly',
  beforeLoad: (ctx) => {
    authGuard(ctx);
    throw redirect({
      to: '/computations/$compId',
      params: { compId: ctx.params.compId },
    });
  },
  component: () => null,
});
