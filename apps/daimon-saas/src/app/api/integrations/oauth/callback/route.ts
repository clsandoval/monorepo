import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL!;

function redirectTo(path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, APP_URL()));
  // Clear OAuth cookies
  response.cookies.set('oauth_state', '', { maxAge: 0, path: '/' });
  response.cookies.set('oauth_service', '', { maxAge: 0, path: '/' });
  response.cookies.set('oauth_tenant_id', '', { maxAge: 0, path: '/' });
  return response;
}

interface TokenResult {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  id_token?: string;
}

interface UserIdentity {
  provider_user_id: string;
  display_name: string | null;
  email: string | null;
  extra?: Record<string, unknown>;
}

async function exchangeGitHub(code: string): Promise<TokenResult> {
  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${APP_URL()}/api/integrations/oauth/callback`,
    }),
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error('token_exchange_failed');
  }
  return {
    access_token: data.access_token,
    scope: data.scope,
  };
}

async function exchangeGoogle(code: string): Promise<TokenResult> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${APP_URL()}/api/integrations/oauth/callback`,
      grant_type: 'authorization_code',
    }).toString(),
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error('token_exchange_failed');
  }
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    scope: data.scope,
    id_token: data.id_token,
  };
}

async function exchangeLinear(code: string): Promise<TokenResult> {
  const res = await fetch('https://api.linear.app/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.LINEAR_CLIENT_ID!,
      client_secret: process.env.LINEAR_CLIENT_SECRET!,
      redirect_uri: `${APP_URL()}/api/integrations/oauth/callback`,
      grant_type: 'authorization_code',
    }).toString(),
  });
  const data = await res.json();
  if (!data.access_token) {
    throw new Error('token_exchange_failed');
  }
  return {
    access_token: data.access_token,
    scope: data.scope,
  };
}

async function fetchGitHubIdentity(accessToken: string): Promise<UserIdentity> {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Daimon-SaaS/1.0',
      },
    });
    if (!res.ok) return { provider_user_id: '', display_name: null, email: null };
    const u = await res.json();
    return {
      provider_user_id: String(u.id ?? ''),
      display_name: u.login ?? null,
      email: u.email ?? null,
      extra: {
        github_login: u.login ?? null,
        github_user_id: u.id ?? null,
        github_name: u.name ?? null,
        github_avatar_url: u.avatar_url ?? null,
        github_email: u.email ?? null,
      },
    };
  } catch {
    return { provider_user_id: '', display_name: null, email: null };
  }
}

function parseGoogleIdentity(idToken: string): UserIdentity {
  try {
    const payload = JSON.parse(
      Buffer.from(idToken.split('.')[1], 'base64url').toString('utf-8')
    );
    return {
      provider_user_id: payload.sub ?? '',
      display_name: payload.name ?? null,
      email: payload.email ?? null,
      extra: {
        google_user_id: payload.sub ?? null,
        google_email: payload.email ?? null,
        google_name: payload.name ?? null,
        google_picture: payload.picture ?? null,
      },
    };
  } catch {
    return { provider_user_id: '', display_name: null, email: null };
  }
}

async function fetchLinearIdentity(accessToken: string): Promise<UserIdentity> {
  try {
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        Authorization: accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ viewer { id name email displayName avatarUrl } teams { nodes { id name key } } }' }),
    });
    if (!res.ok) return { provider_user_id: '', display_name: null, email: null };
    const { data } = await res.json();
    const viewer = data?.viewer ?? {};
    const teams: Array<{ id: string; name: string; key: string }> = data?.teams?.nodes ?? [];
    return {
      provider_user_id: viewer.id ?? '',
      display_name: viewer.displayName ?? viewer.name ?? null,
      email: viewer.email ?? null,
      extra: {
        linear_user_id: viewer.id ?? null,
        linear_name: viewer.name ?? null,
        linear_email: viewer.email ?? null,
        linear_display_name: viewer.displayName ?? null,
        linear_avatar_url: viewer.avatarUrl ?? null,
        linear_team_id: teams.length === 1 ? teams[0].id : null,
        linear_team_name: teams.length === 1 ? teams[0].name : null,
        linear_teams_available: teams.length > 1 ? teams : undefined,
        _teams_count: teams.length,
      },
    };
  } catch {
    return { provider_user_id: '', display_name: null, email: null };
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stateParam = searchParams.get('state');
  const codeParam = searchParams.get('code');
  const errorParam = searchParams.get('error');

  // 1. Read cookies
  const cookieState = req.cookies.get('oauth_state')?.value;
  const cookieService = req.cookies.get('oauth_service')?.value;
  const cookieTenantId = req.cookies.get('oauth_tenant_id')?.value;

  if (!cookieState || !cookieService || !cookieTenantId) {
    return redirectTo('/dashboard/integrations?error=session_expired');
  }

  // 2. Verify state (CSRF)
  if (stateParam !== cookieState) {
    return redirectTo('/dashboard/integrations?error=security_error');
  }

  const service = cookieService;
  const tenantId = cookieTenantId;

  // 3. Cookies are cleared in redirectTo() helper — already cleared on all return paths below

  // 4. Check provider error param
  if (errorParam) {
    if (errorParam === 'access_denied') {
      return redirectTo(`/dashboard/integrations?error=access_denied&service=${service}`);
    }
    return redirectTo(`/dashboard/integrations?error=provider_error&service=${service}`);
  }

  if (!codeParam) {
    return redirectTo(`/dashboard/integrations?error=provider_error&service=${service}`);
  }

  // 5. Exchange code for tokens
  let tokens: TokenResult;
  try {
    if (service === 'github') {
      tokens = await exchangeGitHub(codeParam);
    } else if (service === 'google') {
      tokens = await exchangeGoogle(codeParam);
    } else if (service === 'linear') {
      tokens = await exchangeLinear(codeParam);
    } else {
      return redirectTo('/dashboard/integrations?error=provider_error');
    }
  } catch {
    return redirectTo(`/dashboard/integrations?error=token_exchange_failed&service=${service}`);
  }

  // 6. Fetch user identity
  let identity: UserIdentity;
  if (service === 'github') {
    identity = await fetchGitHubIdentity(tokens.access_token);
  } else if (service === 'google' && tokens.id_token) {
    identity = parseGoogleIdentity(tokens.id_token);
  } else if (service === 'linear') {
    identity = await fetchLinearIdentity(tokens.access_token);
  } else {
    identity = { provider_user_id: '', display_name: null, email: null };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = supabaseAdmin as any;

  try {
    // 7. Check for existing connection to handle vault secret cleanup
    const { data: existing } = await supabaseAdmin
      .from('tenant_service_connections')
      .select('vault_secret_id, refresh_vault_secret_id')
      .eq('tenant_id', tenantId)
      .eq('service', service)
      .maybeSingle();

    // 8. Store access token in Vault (create or update)
    let vaultSecretId: string;
    const accessVaultLabel = `oauth_${service}_${tenantId}`;
    if (existing?.vault_secret_id) {
      // Update existing vault secret
      await adminAny.schema('vault').rpc('update_secret', {
        id: existing.vault_secret_id,
        secret: tokens.access_token,
        name: accessVaultLabel,
      });
      vaultSecretId = existing.vault_secret_id;
    } else {
      const { data: newId, error: vaultErr } = await adminAny.schema('vault').rpc('create_secret', {
        secret: tokens.access_token,
        name: accessVaultLabel,
        description: `OAuth access token for tenant ${tenantId} service ${service}`,
      });
      if (vaultErr || !newId) {
        throw new Error('vault_create_failed');
      }
      vaultSecretId = newId as string;
    }

    // 9. For Google: store refresh token separately
    let refreshVaultSecretId: string | null = null;
    if (service === 'google' && tokens.refresh_token) {
      const refreshLabel = `oauth_google_refresh_${tenantId}`;
      if (existing?.refresh_vault_secret_id) {
        await adminAny.schema('vault').rpc('update_secret', {
          id: existing.refresh_vault_secret_id,
          secret: tokens.refresh_token,
          name: refreshLabel,
        });
        refreshVaultSecretId = existing.refresh_vault_secret_id;
      } else {
        const { data: newRefreshId, error: refreshErr } = await adminAny.schema('vault').rpc('create_secret', {
          secret: tokens.refresh_token,
          name: refreshLabel,
          description: `OAuth refresh token for tenant ${tenantId} service google`,
        });
        if (refreshErr || !newRefreshId) {
          throw new Error('vault_create_failed');
        }
        refreshVaultSecretId = newRefreshId as string;
      }
    }

    // 10. Compute scopes array
    let scopesArray: string[] = [];
    if (tokens.scope) {
      // GitHub uses comma-separated, others use space-separated
      if (service === 'github') {
        scopesArray = tokens.scope.split(',').map((s) => s.trim()).filter(Boolean);
      } else {
        scopesArray = tokens.scope.split(' ').filter(Boolean);
      }
    }

    // 11. Compute token_expires_at (Google only)
    let tokenExpiresAt: string | null = null;
    if (service === 'google' && tokens.expires_in) {
      tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    }

    // 12. Build metadata
    const metadata: Record<string, unknown> = {
      display_name: identity.display_name,
      email: identity.email,
      provider_user_id: identity.provider_user_id,
      ...(identity.extra ?? {}),
    };

    // 13. Upsert tenant_service_connections
    const { error: upsertError } = await supabaseAdmin
      .from('tenant_service_connections')
      .upsert(
        {
          tenant_id: tenantId,
          service,
          auth_type: 'oauth',
          vault_secret_id: vaultSecretId,
          refresh_vault_secret_id: refreshVaultSecretId,
          token_expires_at: tokenExpiresAt,
          scopes: scopesArray,
          status: 'connected',
          metadata,
          error_message: null,
          connected_at: new Date().toISOString(),
        },
        { onConflict: 'tenant_id,service' }
      );

    if (upsertError) {
      throw new Error('upsert_failed');
    }

    return redirectTo(`/dashboard/integrations?connected=${service}`);
  } catch {
    return redirectTo(`/dashboard/integrations?error=connection_failed&service=${service}`);
  }
}
