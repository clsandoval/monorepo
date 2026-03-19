import { createRouter } from '@tanstack/react-router';
import type { User } from '@supabase/supabase-js';
import { rootRoute, publicRootRoute } from './routes/__root';
import { indexRoute } from './routes/index';
import { authRoute } from './routes/auth';
import { authCallbackRoute } from './routes/auth/callback';
import { authResetRoute } from './routes/auth/reset';
import { authResetConfirmRoute } from './routes/auth/reset-confirm';
import { casesIndexRoute } from './routes/cases/index';
import { casesNewRoute } from './routes/cases/new';
import { caseIdRoute } from './routes/cases/$caseId';
import { caseTaxRoute } from './routes/cases/$caseId.tax';
import { clientsRoute } from './routes/clients/index';
import { newClientRoute } from './routes/clients/new';
import { clientDetailRoute } from './routes/clients/$clientId';
import { deadlinesRoute } from './routes/deadlines';
import { settingsRoute } from './routes/settings/index';
import { settingsTeamRoute } from './routes/settings/team';
import { shareTokenRoute } from './routes/share/$token';
import { onboardingRoute } from './routes/onboarding';
import { inviteTokenRoute } from './routes/invite/$token';
import { intestateSuccessionCalculatorRoute } from './routes/landing/intestate-succession-calculator';
import { legitimateShareCalculatorRoute } from './routes/landing/legitimate-share-calculator';
import { spouseAndChildrenInheritanceRoute } from './routes/landing/spouse-and-children-inheritance';
import { illegitimateChildInheritanceRoute } from './routes/landing/illegitimate-child-inheritance';
import { parentsInheritanceShareRoute } from './routes/landing/parents-inheritance-share';
import { noWillInheritanceRoute } from './routes/landing/no-will-inheritance-philippines';
import { blogIndexRoute } from './routes/blog/index';
import { blogIntestateVsTestateRoute } from './routes/blog/intestate-vs-testate';
import { blogHowToComputeLegitimeRoute } from './routes/blog/how-to-compute-legitime';
import { blogIllegitimateChildrenRightsRoute } from './routes/blog/illegitimate-children-rights';
import { blogNoWillRoute } from './routes/blog/no-will-philippines';
import { blogPreteritionRoute } from './routes/blog/preterition-explained';
import { blogParentsInheritanceRoute } from './routes/blog/parents-inheritance-share';

const routeTree = rootRoute.addChildren([
  publicRootRoute.addChildren([
    authRoute,
    authCallbackRoute,
    authResetRoute,
    authResetConfirmRoute,
    shareTokenRoute,
    onboardingRoute,
    inviteTokenRoute,
    intestateSuccessionCalculatorRoute,
    legitimateShareCalculatorRoute,
    spouseAndChildrenInheritanceRoute,
    illegitimateChildInheritanceRoute,
    parentsInheritanceShareRoute,
    noWillInheritanceRoute,
    blogIndexRoute,
    blogIntestateVsTestateRoute,
    blogHowToComputeLegitimeRoute,
    blogIllegitimateChildrenRightsRoute,
    blogNoWillRoute,
    blogPreteritionRoute,
    blogParentsInheritanceRoute,
  ]),
  indexRoute,
  casesIndexRoute,
  casesNewRoute,
  caseIdRoute,
  caseTaxRoute,
  clientsRoute,
  newClientRoute,
  clientDetailRoute,
  deadlinesRoute,
  settingsRoute,
  settingsTeamRoute,
]);

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined as { user: User | null } | undefined,
  },
});

// Type-safe route registration
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
