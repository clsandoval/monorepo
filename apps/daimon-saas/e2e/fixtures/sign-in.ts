import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local so NEXT_PUBLIC_SUPABASE_URL and ANON_KEY are available
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Sign in as a test user via Supabase Auth API and inject the session
 * into the page's cookies so Next.js SSR middleware picks it up.
 */
export async function signInAs(
  page: import('@playwright/test').Page,
  user: { email: string; password: string }
): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });

  if (error || !data.session) {
    throw new Error(
      `signInAs: failed to authenticate ${user.email}: ${error?.message}`
    );
  }

  const { access_token, refresh_token, expires_at } = data.session;

  const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
  const storageKey = `sb-${projectRef}-auth-token`;
  const sessionPayload = JSON.stringify({
    access_token,
    refresh_token,
    expires_at,
    token_type: 'bearer',
    user: data.session.user,
  });

  // @supabase/ssr v0.9+ stores session as "base64-{base64url(json)}" in cookies
  const BASE64_PREFIX = 'base64-';
  const MAX_CHUNK_SIZE = 3180;
  const encoded = BASE64_PREFIX + Buffer.from(sessionPayload, 'utf-8').toString('base64url');
  const urlEncoded = encodeURIComponent(encoded);

  const cookieChunks: Array<{ name: string; value: string }> = [];
  if (urlEncoded.length <= MAX_CHUNK_SIZE) {
    cookieChunks.push({ name: storageKey, value: encoded });
  } else {
    let remaining = urlEncoded;
    let idx = 0;
    while (remaining.length > 0) {
      let chunk = remaining.slice(0, MAX_CHUNK_SIZE);
      const lastPct = chunk.lastIndexOf('%');
      if (lastPct > MAX_CHUNK_SIZE - 3) chunk = chunk.slice(0, lastPct);
      cookieChunks.push({ name: `${storageKey}.${idx}`, value: decodeURIComponent(chunk) });
      remaining = remaining.slice(chunk.length);
      idx++;
    }
  }

  // Navigate to root first so we're on the correct origin
  await page.goto('/');

  // Set localStorage (for browser client)
  await page.evaluate(
    ({ key, value }: { key: string; value: string }) =>
      localStorage.setItem(key, value),
    { key: storageKey, value: sessionPayload }
  );

  // Set cookie(s) for SSR middleware
  await page.context().addCookies(
    cookieChunks.map((c) => ({
      name: c.name,
      value: c.value,
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax' as const,
      httpOnly: false,
      secure: false,
    }))
  );
}
