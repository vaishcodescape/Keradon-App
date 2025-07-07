import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/lib/auth/firebase-server';
import { adminDb } from '@/lib/config/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await createAuthenticatedClient();
    
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Try to create/update user record in Firestore
    try {
      const userData = {
        email: user.email!,
        name: user.name || user.email!,
        avatar_url: user.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email!)}`,
        provider: user.firebase?.sign_in_provider || 'email',
        created_at: new Date(),
        updated_at: new Date(),
      };

      await adminDb.collection('users').doc(user.uid).set(userData, { merge: true });

      return NextResponse.json({ 
        success: true, 
        message: 'User processed successfully' 
      });

    } catch (dbError: any) {
      // Don't fail authentication if database operations fail
      return NextResponse.json({ 
        success: true, 
        message: 'User authenticated, database error occurred',
        warning: dbError.message 
      });
    }

  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 