import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { current_password?: unknown; new_password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!body.current_password) {
    return NextResponse.json(
      { error: 'current_password is required.', field: 'current_password' },
      { status: 400 }
    );
  }
  if (!body.new_password) {
    return NextResponse.json(
      { error: 'new_password is required.', field: 'new_password' },
      { status: 400 }
    );
  }

  const current_password = String(body.current_password);
  const new_password = String(body.new_password);

  if (new_password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters.', field: 'new_password' },
      { status: 400 }
    );
  }

  // Verify current password with anon client
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { error: signInError } = await anonClient.auth.signInWithPassword({
    email: user.email!,
    password: current_password,
  });

  if (signInError) {
    if (signInError.message.toLowerCase().includes('invalid') || signInError.message.toLowerCase().includes('credentials')) {
      return NextResponse.json(
        { error: 'Current password is incorrect.', field: 'current_password' },
        { status: 401 }
      );
    }
    console.error('[settings/account/password] signIn error:', signInError);
    return NextResponse.json(
      { error: 'Failed to update password. Please try again.' },
      { status: 500 }
    );
  }

  // Update password with admin/service role
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
    password: new_password,
  });

  if (updateError) {
    console.error('[settings/account/password] Update error:', updateError);
    return NextResponse.json(
      { error: 'Failed to update password. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
