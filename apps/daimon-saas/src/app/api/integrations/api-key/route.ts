import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const TOGGL_KEY_REGEX = /^[a-z0-9]{32}$/;
const VALID_API_KEY_SERVICES = ['toggl'] as const;
type ApiKeyService = (typeof VALID_API_KEY_SERVICES)[number];

interface TogglUser {
  id: number;
  email: string;
  fullname: string;
  default_workspace_id: number;
}

interface TogglMeAll {
  id: number;
  email: string;
  fullname: string;
  default_workspace_id: number;
  workspaces?: Array<{
    id: number;
    name: string;
    organization_id?: number;
    role?: string;
  }>;
  organizations?: Array<{
    id: number;
    name: string;
  }>;
}

async function validateTogglKey(apiKey: string): Promise<
  | { valid: true; user: TogglUser }
  | { valid: false; error: string; status: number }
> {
  const credentials = Buffer.from(`${apiKey}:api_token`).toString('base64');
  let res: Response;
  try {
    res = await fetch('https://api.track.toggl.com/api/v9/me', {
      headers: { Authorization: `Basic ${credentials}` },
    });
  } catch {
    return {
      valid: false,
      error: 'Could not reach Toggl to verify the key. Please try again.',
      status: 422,
    };
  }

  if (res.status === 403 || res.status === 401) {
    return {
      valid: false,
      error: 'Toggl rejected this API key. Check it in your Toggl profile at https://track.toggl.com/profile.',
      status: 422,
    };
  }
  if (res.status === 429) {
    return {
      valid: false,
      error: 'Toggl rate limit exceeded. Please wait a moment and try again.',
      status: 422,
    };
  }
  if (!res.ok) {
    return {
      valid: false,
      error: 'Could not reach Toggl to verify the key. Please try again.',
      status: 422,
    };
  }

  const user: TogglUser = await res.json();
  return { valid: true, user };
}

async function fetchTogglWorkspaceMetadata(
  apiKey: string,
  togglUser: TogglUser
): Promise<{
  toggl_workspace_id: number | null;
  toggl_workspace_name: string | null;
  toggl_organization_id: number | null;
  toggl_organization_name: string | null;
  toggl_workspace_role: 'admin' | 'member' | null;
}> {
  const empty = {
    toggl_workspace_id: null,
    toggl_workspace_name: null,
    toggl_organization_id: null,
    toggl_organization_name: null,
    toggl_workspace_role: null as null,
  };

  try {
    const credentials = Buffer.from(`${apiKey}:api_token`).toString('base64');
    const res = await fetch('https://api.track.toggl.com/api/v9/me/all', {
      headers: { Authorization: `Basic ${credentials}` },
    });
    if (!res.ok) return empty;

    const data: TogglMeAll = await res.json();
    const workspaces = data.workspaces ?? [];
    const organizations = data.organizations ?? [];

    let ws = workspaces.find((w) => w.id === togglUser.default_workspace_id);
    if (!ws && workspaces.length > 0) ws = workspaces[0];
    if (!ws) return empty;

    const org = ws.organization_id
      ? organizations.find((o) => o.id === ws!.organization_id)
      : undefined;

    const role = ws.role === 'admin' || ws.role === 'member' ? ws.role : null;

    return {
      toggl_workspace_id: ws.id,
      toggl_workspace_name: ws.name ?? null,
      toggl_organization_id: ws.organization_id ?? null,
      toggl_organization_name: org?.name ?? null,
      toggl_workspace_role: role,
    };
  } catch {
    return empty;
  }
}

export async function POST(req: NextRequest) {
  // 1. Authenticate
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse body
  let body: { service?: unknown; api_key?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // 3. Validate service
  if (!body.service) {
    return NextResponse.json({ error: 'service is required.' }, { status: 400 });
  }
  const serviceStr = String(body.service);
  if (!(VALID_API_KEY_SERVICES as readonly string[]).includes(serviceStr)) {
    return NextResponse.json(
      {
        error: `Unknown service '${serviceStr}'. Supported API key services: ${VALID_API_KEY_SERVICES.join(', ')}.`,
      },
      { status: 400 }
    );
  }
  const service = serviceStr as ApiKeyService;

  // 4. Validate api_key presence
  if (!body.api_key) {
    return NextResponse.json({ error: 'api_key is required.', field: 'api_key' }, { status: 400 });
  }
  const apiKey = String(body.api_key);

  // 5. Verify role is owner/admin and get tenant_id
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Insufficient permissions.' }, { status: 403 });
  }
  const { tenant_id } = membership;

  // 6. Service-specific format validation
  if (service === 'toggl') {
    if (!TOGGL_KEY_REGEX.test(apiKey)) {
      return NextResponse.json(
        {
          error:
            'Invalid Toggl API key format. Must be a 32-character lowercase alphanumeric string.',
          field: 'api_key',
        },
        { status: 400 }
      );
    }
  }

  // 7. Live validate key against service
  const supabaseAdmin = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = supabaseAdmin as any;

  let togglUser: TogglUser | null = null;
  if (service === 'toggl') {
    const result = await validateTogglKey(apiKey);
    if (!result.valid) {
      return NextResponse.json({ error: result.error, field: 'api_key' }, { status: result.status });
    }
    togglUser = result.user;
  }

  try {
    // 8. Fetch workspace metadata (best effort)
    let workspaceMeta = {
      toggl_workspace_id: null as number | null,
      toggl_workspace_name: null as string | null,
      toggl_organization_id: null as number | null,
      toggl_organization_name: null as string | null,
      toggl_workspace_role: null as 'admin' | 'member' | null,
    };
    if (service === 'toggl' && togglUser) {
      workspaceMeta = await fetchTogglWorkspaceMetadata(apiKey, togglUser);
    }

    // 9. Check for existing connection to handle vault update
    const { data: existing } = await supabaseAdmin
      .from('tenant_service_connections')
      .select('vault_secret_id')
      .eq('tenant_id', tenant_id)
      .eq('service', service)
      .maybeSingle();

    // 10. Store key in Vault (create or update)
    let vaultSecretId: string;
    const vaultLabel = `api_key_${service}_${tenant_id}`;

    if (existing?.vault_secret_id) {
      await adminAny.schema('vault').rpc('update_secret', {
        id: existing.vault_secret_id,
        secret: apiKey,
        name: vaultLabel,
      });
      vaultSecretId = existing.vault_secret_id as string;
    } else {
      const { data: newId, error: vaultErr } = await adminAny.schema('vault').rpc('create_secret', {
        secret: apiKey,
        name: vaultLabel,
        description: `API key for tenant ${tenant_id} service ${service}`,
      });
      if (vaultErr || !newId) {
        throw new Error('vault_create_failed');
      }
      vaultSecretId = newId as string;
    }

    // 11. Build metadata
    let metadata: Record<string, unknown> = {};
    if (service === 'toggl' && togglUser) {
      metadata = {
        toggl_user_id: togglUser.id,
        toggl_email: togglUser.email,
        toggl_full_name: togglUser.fullname,
        toggl_workspace_id: workspaceMeta.toggl_workspace_id,
        toggl_workspace_name: workspaceMeta.toggl_workspace_name,
        toggl_organization_id: workspaceMeta.toggl_organization_id,
        toggl_organization_name: workspaceMeta.toggl_organization_name,
        toggl_workspace_role: workspaceMeta.toggl_workspace_role,
      };
    }

    // 12. Upsert tenant_service_connections
    const { error: upsertError } = await supabaseAdmin
      .from('tenant_service_connections')
      .upsert(
        {
          tenant_id,
          service,
          auth_type: 'api_key',
          vault_secret_id: vaultSecretId,
          refresh_vault_secret_id: null,
          token_expires_at: null,
          scopes: [],
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

    return NextResponse.json({ success: true, service, status: 'connected' });
  } catch {
    return NextResponse.json({ error: 'Failed to save integration. Please try again.' }, { status: 500 });
  }
}
