import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await createAuthenticatedClient();
    
    if (authError || !user) {
      console.log('No session found in create-user API');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Try to create/update user record in our users table
    try {
      // Use upsert to create or update user record
      const userData = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email!,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email!)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('users')
        .upsert(userData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('Error upserting user record:', upsertError);
        
        // Handle specific error cases
        if (upsertError.code === 'PGRST106' || upsertError.message?.includes('relation "users" does not exist')) {
          console.warn('Users table does not exist - skipping user creation');
          return NextResponse.json({ 
            success: true, 
            message: 'User authenticated, table creation skipped' 
          });
        } else if (upsertError.message?.includes('406')) {
          console.warn('Users table access denied - skipping user creation');
          return NextResponse.json({ 
            success: true, 
            message: 'User authenticated, database access limited' 
          });
        }
        
        // Don't fail authentication if user creation fails
        return NextResponse.json({ 
          success: true, 
          message: 'User authenticated, database record creation failed',
          warning: upsertError.message 
        });
      }

      console.log('User record processed successfully:', user.email);

      return NextResponse.json({ 
        success: true, 
        message: 'User processed successfully' 
      });

    } catch (dbError: any) {
      console.error('Database error in create-user:', dbError);
      // Don't fail authentication if database operations fail
      return NextResponse.json({ 
        success: true, 
        message: 'User authenticated, database error occurred',
        warning: dbError.message 
      });
    }

  } catch (error: any) {
    console.error('Error in create-user API:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
} 