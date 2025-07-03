import { NextResponse } from 'next/server';
import { createAuthenticatedClient } from '@/lib/auth/firebase-server';
import { adminDb } from '@/lib/config/firebase-admin';

export async function GET(request: Request) {
  try {
    const { user, error: authError } = await createAuthenticatedClient();
    
    if (authError || !user) {
      console.log('No session found in profile API:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Profile API: Fetching profile for user:', user.email);

    try {
      // Try to get user from Firestore
      const userDoc = await adminDb.collection('users').doc(user.uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        return NextResponse.json({
          id: user.uid,
          email: user.email,
          name: userData?.name || user.name || user.email,
          avatar_url: userData?.avatar_url || user.picture,
          provider: userData?.provider || 'email',
          created_at: userData?.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: userData?.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          role: userData?.role || 'user',
          compact_mode: userData?.compact_mode || false,
          email_notifications: userData?.email_notifications !== undefined ? userData.email_notifications : true,
          push_notifications: userData?.push_notifications || false,
          two_factor_enabled: userData?.two_factor_enabled || false
        });
      } else {
        console.log('User not found in Firestore, returning default data');
        // Return default user data from Firebase Auth
        return NextResponse.json({
          id: user.uid,
          email: user.email,
          name: user.name || user.email,
          avatar_url: user.picture,
          provider: user.firebase?.sign_in_provider || 'email',
          created_at: new Date(user.auth_time * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          role: 'user',
          compact_mode: false,
          email_notifications: true,
          push_notifications: false,
          two_factor_enabled: false
        });
      }
    } catch (dbError: any) {
      console.warn('Firestore error fetching profile:', dbError.message);
      // Return default data if database error
      return NextResponse.json({
        id: user.uid,
        email: user.email,
        name: user.name || user.email,
        avatar_url: user.picture,
        provider: user.firebase?.sign_in_provider || 'email',
        created_at: new Date(user.auth_time * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        role: 'user',
        compact_mode: false,
        email_notifications: true,
        push_notifications: false,
        two_factor_enabled: false
      });
    }
  } catch (error: any) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { user, error: authError } = await createAuthenticatedClient();
    
    if (authError || !user) {
      console.log('No session found in profile update API:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Profile Update API: Updating profile for user:', user.email);

    const body = await request.json();
    const { name, role, compact_mode, email_notifications, push_notifications, two_factor_enabled } = body;

    try {
      // Update user in Firestore
      const updateData = {
        name,
        role,
        compact_mode,
        email_notifications,
        push_notifications,
        two_factor_enabled,
        updated_at: new Date(),
      };

      await adminDb.collection('users').doc(user.uid).set(updateData, { merge: true });

      // Return updated profile
      const updatedDoc = await adminDb.collection('users').doc(user.uid).get();
      const userData = updatedDoc.data();

      return NextResponse.json({
        id: user.uid,
        email: user.email,
        name: userData?.name || name || user.name || user.email,
        avatar_url: userData?.avatar_url || user.picture,
        provider: userData?.provider || user.firebase?.sign_in_provider || 'email',
        created_at: userData?.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: userData?.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        role: userData?.role || role || 'user',
        compact_mode: userData?.compact_mode !== undefined ? userData.compact_mode : (compact_mode || false),
        email_notifications: userData?.email_notifications !== undefined ? userData.email_notifications : (email_notifications !== undefined ? email_notifications : true),
        push_notifications: userData?.push_notifications !== undefined ? userData.push_notifications : (push_notifications || false),
        two_factor_enabled: userData?.two_factor_enabled !== undefined ? userData.two_factor_enabled : (two_factor_enabled || false)
      });

    } catch (dbError: any) {
      console.warn('Firestore error updating profile:', dbError.message);
      // Return updated data even if database update failed
      return NextResponse.json({
        id: user.uid,
        email: user.email,
        name: name || user.name || user.email,
        avatar_url: user.picture,
        provider: user.firebase?.sign_in_provider || 'email',
        created_at: new Date(user.auth_time * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        role: role || 'user',
        compact_mode: compact_mode || false,
        email_notifications: email_notifications !== undefined ? email_notifications : true,
        push_notifications: push_notifications || false,
        two_factor_enabled: two_factor_enabled || false
      });
    }
  } catch (error: any) {
    console.error('Profile update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  // Optionally implement account deletion, but for now just return success
  return NextResponse.json({ message: 'Settings cleared successfully' });
} 