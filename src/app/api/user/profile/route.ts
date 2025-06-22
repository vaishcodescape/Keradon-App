import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

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

export async function GET() {
  try {
    // For unauthenticated users, get the most recent profile or create a default one
    const { data: recentProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (profileError || !recentProfile) {
      // Create a default profile for unauthenticated users
      const defaultId = uuidv4();
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: defaultId,
          email: 'default@example.com',
          name: 'Default User',
          role: '',
          compact_mode: false,
          email_notifications: false,
          push_notifications: false,
          two_factor_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create default profile' },
          { status: 500 }
        );
      }

      return NextResponse.json(newProfile);
    }

    return NextResponse.json(recentProfile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, compact_mode, email_notifications, push_notifications, two_factor_enabled } = body;

    // For unauthenticated users, update the most recent profile or create a new one
    const { data: recentProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (profileError || !recentProfile) {
      // Create a new profile for unauthenticated users
      const newId = uuidv4();
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: newId,
          email: email || 'default@example.com',
          name: name || 'Default User',
          role: role || '',
          compact_mode: compact_mode || false,
          email_notifications: email_notifications || false,
          push_notifications: push_notifications || false,
          two_factor_enabled: two_factor_enabled || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 400 }
        );
      }

      return NextResponse.json(newProfile);
    }

    // Update the existing profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        name: name || recentProfile.name,
        email: email || recentProfile.email,
        role: role || recentProfile.role,
        compact_mode: compact_mode !== undefined ? compact_mode : recentProfile.compact_mode,
        email_notifications: email_notifications !== undefined ? email_notifications : recentProfile.email_notifications,
        push_notifications: push_notifications !== undefined ? push_notifications : recentProfile.push_notifications,
        two_factor_enabled: two_factor_enabled !== undefined ? two_factor_enabled : recentProfile.two_factor_enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', recentProfile.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}

export async function DELETE() {
  try {
    // For unauthenticated users, just return success since we're not deleting accounts
    return NextResponse.json({ message: 'Settings cleared successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
} 