import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@/routes/__root';
import { BlogIndex } from '@/components/blog/BlogIndex';

export const blogIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/blog',
  component: BlogIndex,
});
