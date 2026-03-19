import { createRoute } from '@tanstack/react-router';
import { publicRootRoute } from '@/routes/__root';
import { BlogIndex } from '@/components/blog/BlogIndex';

export const blogIndexRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/blog',
  component: BlogIndex,
});
