import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const VALID_SERVICES = ['github', 'google', 'linear', 'toggl'] as const;
type IntegrationService = (typeof VALID_SERVICES)[number];

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  // 1. Authenticate
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate service param
  const { service: serviceParam } = await params;
  if (!(VALID_SERVICES as readonly string[]).includes(serviceParam)) {
    return NextResponse.json({ error: 'Unknown service.' }, { status: 404 });
  }
  const service = serviceParam as IntegrationService;

  // 3. Verify role is owner/admin and get tenant_id
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

  const supabaseAdmin = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = supabaseAdmin as any;

  try {
    // 4. Look up existing connection
    const { data: connection } = await supabaseAdmin
      .from('tenant_service_connections')
      .select('id, vault_secret_id, refresh_vault_secret_id')
      .eq('tenant_id', tenant_id)
      .eq('service', service)
      .maybeSingle();

    if (!connection) {
      return NextResponse.json(
        { error: `No connection found for service ${service}.` },
        { status: 404 }
      );
    }

    // 5. Delete Vault secrets
    if (connection.vault_secret_id) {
      await adminAny.schema('vault').rpc('delete_secret', { id: connection.vault_secret_id });
    }
    // For Google: also delete refresh token secret
    if (service === 'google' && connection.refresh_vault_secret_id) {
      await adminAny.schema('vault').rpc('delete_secret', { id: connection.refresh_vault_secret_id });
    }

    // 6. Delete the connection row
    const { error: deleteError } = await supabaseAdmin
      .from('tenant_service_connections')
      .delete()
      .eq('id', connection.id);

    if (deleteError) {
      throw new Error('delete_failed');
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to disconnect service. Please try again.' },
      { status: 500 }
    );
  }
}
