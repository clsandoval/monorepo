import { test as setup } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { TEST_USER } from './test-data';

export const STORAGE_STATE = path.join(__dirname, '../.auth/free-user.json');

/**
 * Authenticate as the free test user by calling Supabase Auth API directly
 * (bypasses UI login — ~10x faster than filling the login form).
 *
 * Saves storage state (localStorage with Supabase session) to .auth/free-user.json
 * so authenticated Playwright projects can reuse the session.
 */
setup('authenticate as free user', async ({ page }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_USER.email,
    password: TEST_USER.password,
  });

  if (error || !data.session) {
    throw new Error(
      `Auth setup: failed to sign in as ${TEST_USER.email}: ${error?.message}`
    );
  }

  const { access_token, refresh_token } = data.session;

  // Supabase client reads session from localStorage key: `sb-${projectRef}-auth-token`
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const storageKey = `sb-${projectRef}-auth-token`;
  const sessionPayload = JSON.stringify({
    access_token,
    refresh_token,
    expires_at: data.session.expires_at,
    token_type: 'bearer',
    user: data.session.user,
  });

  // Navigate to app, inject session into localStorage, then save storage state
  await page.goto('/');
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, value),
    { key: storageKey, value: sessionPayload }
  );

  await page.context().storageState({ path: STORAGE_STATE });
});
