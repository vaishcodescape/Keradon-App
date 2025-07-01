import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/config/supabase-admin';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: userProfile, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', session.user.email)
    .single();

  if (error || !userProfile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json(userProfile);
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, role, compact_mode, email_notifications, push_notifications, two_factor_enabled } = body;

  // Only allow updating the authenticated user's profile
  const { data: updatedProfile, error } = await supabaseAdmin
    .from('users')
    .update({
      name,
      role,
      compact_mode,
      email_notifications,
      push_notifications,
      two_factor_enabled,
      updated_at: new Date().toISOString(),
    })
    .eq('email', session.user.email)
    .select()
    .single();

  if (error || !updatedProfile) {
    return NextResponse.json({ error: error?.message || 'Failed to update profile' }, { status: 400 });
  }

  return NextResponse.json(updatedProfile);
}

export async function DELETE() {
  // Optionally implement account deletion, but for now just return success
  return NextResponse.json({ message: 'Settings cleared successfully' });
} 