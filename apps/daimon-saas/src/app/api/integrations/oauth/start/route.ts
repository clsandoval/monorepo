import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

const VALID_SERVICES = ['github', 'google', 'linear'] as const;
type OAuthService = (typeof VALID_SERVICES)[number];

function buildAuthorizationUrl(service: OAuthService, state: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const redirectUri = `${appUrl}/api/integrations/oauth/callback`;

  switch (service) {
    case 'github': {
      const url = new URL('https://github.com/login/oauth/authorize');
      url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID!);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('scope', 'repo read:org gist');
      url.searchParams.set('state', state);
      url.searchParams.set('allow_signup', 'true');
      return url.toString();
    }
    case 'google': {
      const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', 'openid email profile https://www.googleapis.com/auth/analytics.readonly');
      url.searchParams.set('state', state);
      url.searchParams.set('access_type', 'offline');
      url.searchParams.set('prompt', 'consent');
      return url.toString();
    }
    case 'linear': {
      const url = new URL('https://linear.app/oauth/authorize');
      url.searchParams.set('client_id', process.env.LINEAR_CLIENT_ID!);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('scope', 'read write issues:create comments:create');
      url.searchParams.set('state', state);
      return url.toString();
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const service = searchParams.get('service');

  // 1. Validate service param first (400 JSON, not redirect)
  if (!service || !(VALID_SERVICES as readonly string[]).includes(service)) {
    return NextResponse.json(
      { error: "Invalid service. Must be 'github', 'google', or 'linear'." },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // 2. Authenticate
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.redirect(new URL('/login', appUrl));
  }

  // 3. Verify owner/admin role and get tenant_id
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])
    .single();

  if (!membership) {
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=forbidden', appUrl)
    );
  }

  const { tenant_id } = membership;

  // 4. Generate CSRF state
  const state = crypto.randomUUID();

  // 5. Build authorization URL
  const authUrl = buildAuthorizationUrl(service as OAuthService, state);

  // 6. Set HttpOnly cookies and redirect
  const response = NextResponse.redirect(authUrl);
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 600,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  };
  response.cookies.set('oauth_state', state, cookieOptions);
  response.cookies.set('oauth_service', service, cookieOptions);
  response.cookies.set('oauth_tenant_id', tenant_id, cookieOptions);

  return response;
}
