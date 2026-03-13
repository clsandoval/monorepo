import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { full_name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const full_name = typeof body.full_name === 'string' ? body.full_name : '';

  if (full_name.length > 100) {
    return NextResponse.json(
      { error: 'Display name must be 100 characters or less.', field: 'full_name' },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: { full_name },
  });

  if (updateError) {
    console.error('[settings/account/display-name] Update error:', updateError);
    return NextResponse.json(
      { error: 'Failed to update display name. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
