import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  // 1. Authenticate
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Verify owner/admin role and get tenant_id
  const { data: membership } = await supabase
    .from('tenant_members')
    .select('tenant_id, role')
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden: owner or admin role required.' }, { status: 403 });
  }
  const { tenant_id } = membership;

  const supabaseAdmin = createSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminAny = supabaseAdmin as any;

  // 3. Look up the key by id AND tenant_id (must belong to caller's tenant)
  const { data: apiKey } = await supabaseAdmin
    .from('tenant_api_keys')
    .select('id, vault_secret_id')
    .eq('id', id)
    .eq('tenant_id', tenant_id)
    .single();

  if (!apiKey) {
    return NextResponse.json({ error: 'API key not found.' }, { status: 404 });
  }

  // 4. Permanently delete vault secret (destroys encrypted key material)
  const { error: vaultError } = await adminAny
    .schema('vault')
    .rpc('delete_secret', { secret_id: apiKey.vault_secret_id });

  if (vaultError) {
    console.error('[api-keys/delete] Vault delete_secret error:', vaultError);
    return NextResponse.json({ error: 'Failed to revoke API key from vault.' }, { status: 500 });
  }

  // 5. Delete the database row
  const { error: deleteError } = await supabaseAdmin
    .from('tenant_api_keys')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('[api-keys/delete] Delete row error:', deleteError);
    return NextResponse.json({ error: 'Failed to delete API key record.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
