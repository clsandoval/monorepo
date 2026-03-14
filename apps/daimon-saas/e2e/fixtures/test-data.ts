/**
 * Test data constants derived from supabase/seed.sql.
 * All users share the password "Daimon123!".
 */

export const TEST_USER = {
  email: 'free@daimon.test',
  password: 'Daimon123!',
  tenantId: 'bbbbbbbb-0000-0000-0000-000000000001',
  name: 'Free Tester',
  plan: 'free',
} as const;

export const TEST_USERS = {
  free: {
    email: 'free@daimon.test',
    password: 'Daimon123!',
    tenantId: 'bbbbbbbb-0000-0000-0000-000000000001',
    name: 'Free Tester',
    plan: 'free',
  },
  starter: {
    email: 'starter@daimon.test',
    password: 'Daimon123!',
    tenantId: 'bbbbbbbb-0000-0000-0000-000000000002',
    name: 'Starter Tester',
    plan: 'starter',
  },
  pro: {
    email: 'pro@daimon.test',
    password: 'Daimon123!',
    tenantId: 'bbbbbbbb-0000-0000-0000-000000000003',
    name: 'Pro Tester',
    plan: 'pro',
  },
} as const;

export type TestUserKey = keyof typeof TEST_USERS;
