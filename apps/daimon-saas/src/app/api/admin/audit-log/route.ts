import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const PAGE_SIZE = 100;

export async function GET(req: NextRequest) {
  // Admin auth check — return 404 to obscure admin panel existence
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.app_metadata?.is_admin !== true) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const { searchParams } = req.nextUrl;
  const action = searchParams.get('action');
  const tenantId = searchParams.get('tenant_id');
  const actorId = searchParams.get('actor_id');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const supabaseAdmin = createSupabaseAdminClient();

  // Build count query
  let countQuery = supabaseAdmin
    .from('admin_audit_log')
    .select('id', { count: 'exact', head: true });

  if (action) countQuery = countQuery.eq('action', action);
  if (tenantId) countQuery = countQuery.eq('tenant_id', tenantId);
  if (actorId) countQuery = countQuery.eq('admin_user_id', actorId);
  if (startDate) countQuery = countQuery.gte('created_at', startDate);
  if (endDate) {
    // Include full end date day by using < next day
    const endDatePlusOne = new Date(endDate);
    endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
    countQuery = countQuery.lt('created_at', endDatePlusOne.toISOString().split('T')[0]);
  }

  const { count, error: countError } = await countQuery;
  if (countError) {
    console.error('[admin/audit-log] Count error:', countError);
    return NextResponse.json({ error: 'Failed to query audit log.' }, { status: 500 });
  }

  // Build data query
  let dataQuery = supabaseAdmin
    .from('admin_audit_log')
    .select('id, admin_user_id, action, tenant_id, target_user_id, metadata, ip_address, user_agent, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (action) dataQuery = dataQuery.eq('action', action);
  if (tenantId) dataQuery = dataQuery.eq('tenant_id', tenantId);
  if (actorId) dataQuery = dataQuery.eq('admin_user_id', actorId);
  if (startDate) dataQuery = dataQuery.gte('created_at', startDate);
  if (endDate) {
    const endDatePlusOne = new Date(endDate);
    endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
    dataQuery = dataQuery.lt('created_at', endDatePlusOne.toISOString().split('T')[0]);
  }

  const { data: entries, error: dataError } = await dataQuery;
  if (dataError) {
    console.error('[admin/audit-log] Data error:', dataError);
    return NextResponse.json({ error: 'Failed to query audit log.' }, { status: 500 });
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return NextResponse.json({
    entries: entries ?? [],
    pagination: {
      page,
      page_size: PAGE_SIZE,
      total,
      total_pages: totalPages,
    },
  });
}
