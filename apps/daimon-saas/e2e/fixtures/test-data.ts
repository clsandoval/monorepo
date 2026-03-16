/**
 * Test data constants for production Supabase.
 * Uses the real admin user for all authenticated tests.
 */

export const TEST_USER = {
  email: 'cl@sandoval.dev',
  password: 'daimon-admin-2026!',
  name: 'CL',
  plan: 'free',
} as const;

export const TEST_USERS = {
  free: TEST_USER,
  starter: TEST_USER,
  pro: TEST_USER,
} as const;

export type TestUserKey = keyof typeof TEST_USERS;
