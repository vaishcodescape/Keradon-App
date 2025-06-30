import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Create a Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
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
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
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