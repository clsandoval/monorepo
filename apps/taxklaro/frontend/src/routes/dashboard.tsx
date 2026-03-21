import { createRoute, redirect } from '@tanstack/react-router';
import { authenticatedRoute } from './__root';

export const DashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  beforeLoad: () => {
    throw redirect({ to: '/computations' });
  },
});
